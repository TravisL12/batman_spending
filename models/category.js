"use strict";
const moment = require("moment");

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
    const startMonth = month || new Date().getMonth() + 1;
    const startYear = year || new Date().getFullYear();

    const startDate = moment(`${startYear} ${startMonth}`, "YYYY MM");
    const endDate = moment(startDate).add(1, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return Category.findAll({
      include: [
        {
          model: sequelize.models.Transaction,
          as: "Transactions",
          where: {
            user_id: userId,
            category_id: {
              [Op.not]: [254] // "Outgoing Transfers"
            },
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
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
