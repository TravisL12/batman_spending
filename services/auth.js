const { User } = require("../models");
const validator = require("validator");
const { to, TE } = require("../services/utility");
const jwt = require("jsonwebtoken");

const getUniqueKeyFromBody = function(body) {
  // this is so they can send in options unique_key, or email and it will work
  let unique_key = body.unique_key;
  if (typeof unique_key === "undefined") {
    if (typeof body.email != "undefined") {
      unique_key = body.email;
    } else {
      unique_key = null;
    }
  }

  return unique_key;
};

const createUser = async userInfo => {
  let unique_key, auth_info, err;

  auth_info = {};
  auth_info.status = "create";

  unique_key = getUniqueKeyFromBody(userInfo);

  if (!unique_key) TE("An email was not entered.");

  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";
    userInfo.email = unique_key;

    [err, user] = await to(User.create(userInfo));
    if (err) TE("user already exists with that email");

    return user;
  } else {
    TE("A valid email was not entered.");
  }
};

const authUser = async function(userInfo) {
  //returns token
  let unique_key;
  let auth_info = {};
  auth_info.status = "login";
  unique_key = getUniqueKeyFromBody(userInfo);

  if (!unique_key) TE("Please enter an email to login");

  if (!userInfo.password) TE("Please enter a password to login");

  let user;
  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";
    [err, user] = await to(User.findOne({ where: { email: unique_key } }));
    if (err) TE(err.message);
  } else {
    TE("A valid email was not entered");
  }

  if (!user) TE("Not registered");
  [err, user] = await to(user.comparePassword(userInfo.password));

  if (err) TE(err.message);

  return user;
};

module.exports = {
  getUniqueKeyFromBody,
  createUser,
  authUser
};
