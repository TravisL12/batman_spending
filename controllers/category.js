const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const _ = require("lodash");
const { to, ReE, ReS } = require("../services/response");

const CategoryController = {
  async compare(req, res) {
    // Get category spending of past months
    const numMonths = 5;
    const monthData = [];
    for (let i = 0; i < numMonths; i++) {
      const date = moment(new Date()).subtract(i, "M");
      const [err, categories] = await to(
        Category.getMonth(req.user.id, date.month(), date.year())
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
    const idGroup = _.reduce(
      keys,
      (group, { name }, id) => {
        group[id] = name;
        return group;
      },
      {}
    );

    return ReS(
      res,
      { categories: { idGroup, monthData: monthData.reverse() } },
      200
    );
  },

  async list(req, res) {
    const [error, categories] = await to(
      Category.findAll({
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
              user_id: req.user.id
            }
          }
        ],
        group: ["Category.id", "Subcategory.id"]
      })
    );

    if (error) return ReE(res, error);

    const filteredCats = categories.filter(({ dataValues: category }) => {
      return category.transactionCount > 0;
    });

    return ReS(res, { categories: filteredCats }, 200);
  },

  async getById(req, res) {
    const [error, categories] = await to(
      Category.findByPk(req.params.id, {
        include: [
          {
            model: Transaction,
            where: {
              user_id: req.user.id
            }
          },
          {
            model: Category,
            as: "Subcategory"
          }
        ]
      })
    );

    return error ? ReE(res, error) : ReS(res, { categories }, 200);
  }
};

module.exports = CategoryController;
