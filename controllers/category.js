const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");

const CategoryController = {
  list(req, res) {
    const { user } = req;

    return Category.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("transactions.category_id")),
            "transactions"
          ]
        ]
      },
      include: [
        {
          model: Transaction,
          attributes: [],
          where: {
            user_id: user.id
          }
        }
      ],
      group: ["Category.id"]
    })
      .then(categories => {
        res.status(200).send(categories);
      })
      .catch(error => {
        res.status(400).send(error);
      });
  },

  getById(req, res) {
    const { user } = req;

    return Category.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          where: {
            user_id: user.id
          }
        },
        { model: Category }
      ]
    })
      .then(categories => {
        res.status(200).send(categories);
      })
      .catch(error => {
        res.status(400).send(error);
      });
  }
};

module.exports = CategoryController;
