// "use strict";
// const fs = require("fs");
// const parse = require("csv-parse");
// const { Category } = require("../models");

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
// fs.createReadStream("./data.csv")
//   .pipe(parse({ columns: true }))
//   .on("data", function(csvrow) {
//     transactions.push(csvrow);
//   });

// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     const transactionsWithUser = transactions.map(async data => {
//       const [category, isCreated] = await Category.findOrCreate({
//         where: {
//           name: data.category
//         }
//       });
//       const [subcategory, isSubCreated] = await Category.findOrCreate({
//         where: {
//           name: data.subcategory
//         },
//         defaults: {
//           parent_category_id: category.id
//         }
//       });
//       return createTransaction(data, 1, category.id, subcategory.id);
//     });

//     const results = Promise.all(transactionsWithUser);

//     return queryInterface.bulkInsert("Transactions", results, {
//       ignoreDuplicates: true,
//       raw: true
//     });
//   },

//   down: (queryInterface, Sequelize) => {
//     /*
//       Add reverting commands here.
//       Return a promise to correctly handle asynchronicity.

//       Example:
//       return queryInterface.bulkDelete('People', null, {});
//     */
//   }
// };
