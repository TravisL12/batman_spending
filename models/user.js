"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: { msg: "Email invalid." } }
      },
      password: DataTypes.STRING
    },
    {}
  );
  User.associate = function(models) {
    User.hasMany(models.Transaction, {
      foreignKey: "user_id",
      as: "transactions"
    });
  };
  return User;
};
