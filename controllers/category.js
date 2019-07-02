const { Category, Transaction } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");
const { times, reduce } = require("lodash");
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
    const options = {};
    const numMonths = 12;

    const [err, monthData] = await to(
      Promise.all(
        times(numMonths, async () => {
          const year = date.year();
          const month = date.month();
          Object.assign(options, dateRange(year, month + 1));

          date.subtract(1, "M"); // moment dates are mutable
          const [err, categoryData] = await to(
            Category.getDates(req.user.id, options)
          );
          if (err) return ReE(res, err, 422);

          const data = categoryData.reduce((result, cat) => {
            result[cat.id] = cat;
            return result;
          }, {});

          return { month, year, categoryData: data };
        })
      )
    );

    // Concatenate all categories from response into one object
    // { 1: 'Taxes', 3: 'Food', 11: 'Gas' ... }
    const idGroup = monthData.reduce((group, data) => {
      Object.assign(group, data.categoryData);
      return group;
    }, {});

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
      Category.findAll({ where: { user_id: req.user.id } })
    );

    if (error) return ReE(res, error);

    return ReS(res, { categories }, 200);
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
