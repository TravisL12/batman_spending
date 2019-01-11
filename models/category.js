"use strict";
const { dateRange } = require("../services/utility");

module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Op;
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
  Category.getMonth = function(userId, month, year) {
    const { startDate, endDate } = dateRange(year, month);
    const queryParams = {
      user_id: userId,
      category_id: {
        [Op.not]: [254] // "Outgoing Transfers"
      },
      date: {
        $gte: startDate,
        $lt: endDate
      }
    };

    return Category.findAll({
      include: [
        {
          model: sequelize.models.Transaction,
          as: "Transactions",
          where: queryParams
        }
      ],
      group: ["Category.id", "Transactions.id"],
      order: [["name", "ASC"]]
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
