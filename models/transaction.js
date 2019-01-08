module.exports = (sequelize, DataTypes) => {
  const Op = sequelize.Op;
  const Transaction = sequelize.define(
    "Transaction",
    {
      description: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      date: DataTypes.DATE,
      category_id: DataTypes.INTEGER,
      subcategory_id: DataTypes.INTEGER,
      payee: DataTypes.STRING,
      user_id: DataTypes.INTEGER
    },
    {}
  );

  /**
   * Get specific month of year spending
   * Default to current month and year
   * userId: integer - foreign key of transactions to get
   * options: Object
   *    startDate - starting date of transactions
   *    endDate - end date of transactions
   *    excludeCategoryIds - categories to ignore
   */
  Transaction.getMonth = function(userId, options) {
    return Transaction.findAll({
      where: {
        user_id: userId,
        category_id: {
          [Op.not]: options.excludeCategoryIds
        },
        date: {
          $gte: options.startDate,
          $lt: options.endDate
        }
      },
      order: [["date", "ASC"]]
    });
  };

  Transaction.associate = ({ User, Category }) => {
    Transaction.belongsTo(User, {
      foreignKey: "user_id"
    });
    Transaction.belongsTo(Category, {
      foreignKey: "category_id"
    });
    Transaction.belongsTo(Category, {
      foreignKey: "subcategory_id"
    });
  };

  return Transaction;
};
