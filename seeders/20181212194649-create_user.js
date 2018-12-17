"use strict";
const fs = require("fs");
const parse = require("csv-parse");
const models = require("../models");
const authService = require("../services/auth");

// function createTransaction(data, userId, categoryId, subcategoryId) {
//   const { description, amount, date, payee } = data;

//   return {
//     description,
//     payee,
//     amount: amount * 100,
//     date: new Date(date),
//     user_id: userId,
//     category_id: categoryId,
//     subcategory_id: subcategoryId,
//     createdAt: new Date(),
//     updatedAt: new Date()
//   };
// }

// const transactions = [];
// fs.createReadStream("seeders/data.csv")
//   .pipe(parse({ columns: true }))
//   .on("data", function(csvrow) {
//     transactions.push(csvrow);
//   });

module.exports = {
  up: (queryInterface, Sequelize) => {
    return authService.createUser({
      name: "Travis",
      email: `travis@travis.com`,
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // .then(async userId => {
    //   const transactionsWithUser = transactions.map(async data => {
    //     const [category, isCreated] = await models.Category.findOrCreate({
    //       where: {
    //         name: data.category
    //       }
    //     });

    //     const [
    //       subcategory,
    //       isSubCreated
    //     ] = await models.Category.findOrCreate({
    //       where: {
    //         name: data.subcategory
    //       },
    //       defaults: {
    //         parent_category_id: category.id
    //       }
    //     });
    //     return createTransaction(data, userId, category.id, subcategory.id);
    //   });

    //   const results = await Promise.all(transactionsWithUser);

    //   return queryInterface.bulkInsert("Transactions", results, {
    //     ignoreDuplicates: true,
    //     raw: true
    //   });
    // });
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
