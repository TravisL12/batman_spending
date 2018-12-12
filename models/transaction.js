"use strict";
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
  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User);
  };
  return Transaction;
};
