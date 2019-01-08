const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const { to, ReE, ReS } = require("../services/response");
const Op = sequelize.Op;

const CategoryController = {
  /**
   * Get specific month of year spending
   * Default to current month and year
   */
  getMonth(userId, month, year) {
    const startMonth = month || new Date().getMonth() + 1;
    const startYear = year || new Date().getFullYear();

    const startDate = moment(`${startYear} ${startMonth}`, "YYYY MM");
    const endDate = moment(startDate).add(1, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return Category.findAll({
      include: [
        {
          model: Transaction,
          as: "Transactions",
          where: {
            user_id: userId,
            category_id: {
              [Op.not]: [254] // "Outgoing Transfers"
            },
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        }
      ],
      group: ["Category.id", "Transactions.id"],
      order: [["name", "ASC"]]
    });
  },

  list(req, res) {
    const { user } = req;

    return Category.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("transactions.id")),
            "transactionCount"
          ]
        ]
      },
      include: [
        {
          model: Category,
          as: "Subcategory"
        },
        {
          model: Transaction,
          attributes: [],
          where: {
            user_id: user.id
          }
        }
      ],
      group: ["Category.id", "Subcategory.id"]
    })
      .then(categories => {
        const filteredCats = categories.filter(({ dataValues: category }) => {
          return category.transactionCount > 0;
        });

        return ReS(res, { categories: filteredCats }, 200);
      })
      .catch(error => {
        console.log(error);
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
        {
          model: Category,
          as: "Subcategory"
        }
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
