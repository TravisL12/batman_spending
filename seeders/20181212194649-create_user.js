"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .bulkInsert(
        "Users",
        [
          {
            name: "Travis",
            email: "travis2@travis.com",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        {}
      )
      .then(userId => {
        return queryInterface.bulkInsert(
          "Transactions",
          [
            {
              description: "More things I got",
              amount: "3989",
              date: new Date(),
              category_id: 3,
              subcategory_id: 5,
              payee: "Vons",
              user_id: userId,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          {}
        );
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
