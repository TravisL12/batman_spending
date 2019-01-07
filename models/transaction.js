"use strict";
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      description: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      date: DataTypes.DATE,
      category_id: DataTypes.INTEGER,
      subcategory_id: DataTypes.INTEGER,
      payee: DataTypes.STRING,
      user_id: DataTypes.INTEGER
    },
    {}
  );

  /**
   * Get most recent transactions
   * Default 50
   * Order by desc date (new first)
   */
  Transaction.getPrevious = function(userId, num = 50) {
    return Transaction.findAll({
      where: {
        user_id: userId
      },
      limit: num,
      order: [["date", "DESC"]]
    });
  };

  /**
   * Get specific month of year spending
   * Default to current month and year
   */
  Transaction.getMonth = function(userId, months = 1) {
    const startMonth = new Date().getMonth() + 1;
    const startYear = new Date().getFullYear();

    const endDate = moment(`${startYear} ${startMonth}`, "YYYY MM").add(1, "M");
    const startDate = moment(endDate).subtract(months, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return Transaction.findAll({
      where: {
        user_id: userId,
        date: {
          $gte: startDate,
          $lt: endDate
        }
      },
      order: [["date", "ASC"]]
    });
  };

  Transaction.associate = ({ User, Category }) => {
    Transaction.belongsTo(User, { foreignKey: "user_id" });
    Transaction.belongsTo(Category, { foreignKey: "category_id" });
    Transaction.belongsTo(Category, { foreignKey: "subcategory_id" });
  };

  return Transaction;
};
