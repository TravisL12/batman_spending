"use strict";
const authService = require("../services/auth");
const { transaction } = require("../controllers");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return authService.createUser({
      name: "Travis",
      email: `travis@travis.com`,
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    //   .then(async ({ dataValues }) => {
    //     const stream = fs.createReadStream("seeders/data.csv");
    //     const parser = parse({ columns: true });
    //     const transformer = transform(function(row, next) {
    //       transaction
    //         .create(row, dataValues)
    //         .then(() => {
    //           next();
    //         })
    //         .catch(err => {
    //           console.log(err);
    //         });
    //     });

    //     await stream.pipe(parser).pipe(transformer);
    //     return;
    //   });
  },

  down: (queryInterface, Sequelize) => {}
};
