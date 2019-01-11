const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const _ = require("lodash");
const { dateRange } = require("../services/utility");
const { to, ReE, ReS } = require("../services/response");

const CategoryController = {
  // Get category spending of past months
  /**
   * range - retrieve range of categories separated by month
   * return {
   *    category_ids: idGroup,
   *    categories: monthData.reverse()
   * }
   */
  async range(req, res) {
    const date = moment(new Date());
    const options = { excludeCategoryIds: [254] }; // Outgoing transfers
    const numMonths = 5;

    const [err, monthData] = await to(
      Promise.all(
        _.times(numMonths, async i => {
          const year = date.year();
          const month = date.month();
          Object.assign(options, dateRange(year, month + 1));

          date.subtract(1, "M"); // moment dates are mutable
          const [err, categoryData] = await to(
            Category.getDates(req.user.id, options)
          );
          if (err) return ReE(res, err, 422);
          return { month, year, categoryData };
        })
      )
    );

    // Concatenate all categories from response into one object
    // { 1: 'Taxes', 3: 'Food', 11: 'Gas' ... }
    const keys = _.keyBy(_.concat(..._.map(monthData, "categoryData")), "id");
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
      {
        category_ids: idGroup,
        categories: monthData.reverse()
      },
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
