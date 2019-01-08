const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const _ = require("lodash");
const { to, ReE, ReS } = require("../services/response");
const Op = sequelize.Op;

const CategoryController = {
  async compare(req, res) {
    const { user } = req;

    // Get category spending of past months
    const numMonths = 3;
    const monthData = [];
    for (let i = 0; i < numMonths; i++) {
      const date = moment(new Date()).subtract(i, "M");
      const [err, categories] = await to(
        CategoryController.getMonth(user.id, date.month(), date.year())
      );
      if (err) return ReE(res, err, 422);

      monthData.push({
        month: date.month(),
        year: date.year(),
        categories
      });
    }

    // Concatenate all categories from response into one object
    // { 1: 'Taxes', 3: 'Food', 11: 'Gas' ... }
    const keys = _.keyBy(_.concat(..._.map(monthData, "categories")), "id");
    const group = (group, { name }, id) => {
      group[id] = name;
      return group;
    };
    const idGroup = _.reduce(keys, group, {});

    return ReS(
      res,
      { categories: { idGroup, monthData: monthData.reverse() } },
      200
    );
  },

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
