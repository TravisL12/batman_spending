"use strict";
const Transaction = require("./transaction");
const moment = require("moment");

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
  Category.getMonth = function(userId, month, year) {
    const startMonth = month || new Date().getMonth() + 1;
    const startYear = year || new Date().getFullYear();

    const startDate = moment(`${startYear} ${startMonth}`, "YYYY MM");
    const endDate = moment(startDate).add(1, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return Category.findAll({
      include: [
        {
          model: Transaction,
          where: {
            user_id: userId,
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        }
      ],
      group: ["Category.id"]
    });
  };

  Category.associate = ({ Transaction }) => {
    Category.hasMany(Transaction, {
      foreignKey: "category_id",
      as: "Transactions"
    });
    Category.hasMany(Transaction, {
      foreignKey: "subcategory_id",
      as: "Subtransactions"
    });
    Category.belongsTo(Category, {
      foreignKey: "parent_category_id"
    });
    Category.hasMany(Category, {
      foreignKey: "parent_category_id",
      as: "Subcategory"
    });
  };
  return Category;
};
