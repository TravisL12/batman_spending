"use strict";
const authService = require("../services/auth");

module.exports = {
  up: (queryInterface, Sequelize) => {
    authService.createUser({
      name: "Travis",
      email: `travis@travis.com`,
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return authService.createUser({
      name: "Connor",
      email: `connor@travis.com`,
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
