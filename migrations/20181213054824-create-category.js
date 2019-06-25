"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const CategoryTable = await queryInterface.createTable("categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      parent_category_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint("categories", ["name", "user_id"], {
      type: "unique",
      name: "unique_category_name_user"
    });

    return CategoryTable;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("categories");
  }
};
