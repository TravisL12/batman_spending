module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transactionTable = await queryInterface.createTable("transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      category_id: {
        type: Sequelize.INTEGER
      },
      subcategory_id: {
        type: Sequelize.INTEGER
      },
      payee: {
        type: Sequelize.STRING
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

    await queryInterface.addConstraint(
      "transactions",
      ["description", "date", "amount", "user_id"],
      {
        type: "unique",
        name: "unique_description_amount_date_user"
      }
    );

    return transactionTable;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("transactions");
  }
};
