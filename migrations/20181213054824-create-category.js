"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    const CategoryTable = queryInterface.createTable("categories", {
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

    queryInterface.addConstraint("categories", ["name", "user_id"], {
      type: "unique",
      name: "unique_category_name_user"
    });

    return CategoryTable;
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("categories");
  }
};
