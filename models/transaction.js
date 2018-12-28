"use strict";
const { User } = require("./index");

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

  Transaction.getLast = function(num, userId) {
    return Transaction.findAll({
      where: {
        user_id: userId
      },
      limit: num,
      order: [["date", "DESC"]]
    });
  };

  Transaction.associate = ({ User, Category }) => {
    Transaction.belongsTo(User, { foreignKey: "user_id" });
    Transaction.belongsTo(Category, { foreignKey: "category_id" });
    Transaction.belongsTo(Category, { foreignKey: "subcategory_id" });
  };

  return Transaction;
};
