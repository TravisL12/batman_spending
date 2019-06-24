"use strict";
const { Op } = require("sequelize");
const _ = require("lodash");

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()")
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()")
      }
    },
    { timestamps: true },
    {
      hooks: {
        validationFailed: (instance, options, error) => {
          console.warn(error);
        }
      }
    }
  );

  /**
   * Get specific month of year spending
   * Default to current month and year
   */
  Category.getDates = function(userId, options) {
    const transQueryParams = {
      user_id: userId,
      category_id: {
        [Op.not]: options.excludeCategoryIds || []
      },
      date: {
        $gte: options.startDate,
        $lt: options.endDate
      }
    };

    return Category.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("transactions.id")),
            "transactionCount"
          ],
          [
            sequelize.fn("SUM", sequelize.col("transactions.amount")),
            "transactionSum"
          ]
        ]
      },
      where: {
        user_id: userId
      },
      include: [
        {
          model: sequelize.models.Transaction,
          as: "Transactions",
          where: transQueryParams
        }
      ],
      group: ["Category.id", "Transactions.id"],
      order: [["name", "ASC"]]
    });
  };

  /**
   * Groups categories and groups them in year-month-category_id
   * {
   *    2018: { // year
   *        2: { // month (Feb)
   *             35: { // category_id
   *                 ...category attributes
   *                }
   *           }
   *         }
   * }
   */
  Category.groupMonth = function(transactionMonthData, allCategories) {
    // Group all transactions into specific year-month by category_id
    return transactionMonthData.reduce((result, t) => {
      if (result[t.category_id]) {
        result[t.category_id].sum += t.amount;
      } else {
        result[t.category_id] = {
          ...allCategories[t.category_id].get({ plain: true }),
          sum: t.amount
        };
      }

      return result;
    }, {});
  };

  Category.countSumJoinSubcategories = function(userId, options = {}) {
    const transactionQueryParams = {
      user_id: userId,
      category_id: { [Op.not]: options.excludeCategoryIds },
      date: { $gte: options.startDate, $lt: options.endDate }
    };

    return Category.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("transactions.id")),
            "transactionCount"
          ],
          [
            sequelize.fn("SUM", sequelize.col("transactions.amount")),
            "transactionSum"
          ]
        ]
      },
      where: {
        user_id: userId,
        id: { [Op.not]: options.excludeCategoryIds }
      },
      include: [
        {
          model: Category,
          as: "Subcategory",
          where: {
            user_id: userId
          }
        },
        {
          model: sequelize.models.Transaction,
          as: "Transactions",
          attributes: [],
          where: transactionQueryParams
        }
      ],
      group: ["Category.id", "Subcategory.id"]
    });
  };

  Category.associate = ({ User, Transaction }) => {
    Category.belongsTo(User, {
      foreignKey: "user_id"
    });
    Category.hasMany(Transaction, {
      foreignKey: "category_id",
      as: "Transactions"
    });
    Category.hasMany(Transaction, {
      foreignKey: "subcategory_id",
      as: "Subtransactions"
    });
    Category.belongsTo(Category, {
      foreignKey: "parent_category_id",
      as: "Category"
    });
    Category.hasMany(Category, {
      foreignKey: "parent_category_id",
      as: "Subcategory"
    });
  };
  return Category;
};
