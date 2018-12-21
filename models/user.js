"use strict";

const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const { TE, to } = require("../services/utility");
const jwt = require("jsonwebtoken");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

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

  User.beforeSave(async (user, options) => {
    let err;
    if (user.changed("password")) {
      let salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);
      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) TE(err.message, true);

      user.password = hash;
    }
  });

  User.prototype.comparePassword = async function(pw) {
    let err, pass;
    if (!this.password) TE("password not set");
    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  User.prototype.getJWT = function() {
    let expiration_time = parseInt(config.jwt_expiration);
    return (
      "Bearer " +
      jwt.sign({ user_id: this.id }, config.jwt_encryption, {
        expiresIn: expiration_time
      })
    );
  };

  User.prototype.toWeb = function(pw) {
    let json = this.toJSON();
    return json;
  };

  User.associate = ({ Transaction }) => {
    User.hasMany(Transaction, {
      foreignKey: "user_id"
    });
  };

  return User;
};
