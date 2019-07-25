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
    const numMonths = 12;
    const afterDate = moment().subtract(numMonths, "M");
    const options = { afterDate, beforeDate: moment() };

    const [err, categoryData] = await to(
      Category.getDates(req.user.id, options)
    );

    const monthData = categoryData.reduce((result, category) => {
      result.push({
        id: category.id,
        transactions: Transaction.groupByYearMonth(category.Transactions)
      });
      return result;
    }, []);

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
      Category.findAll({
        where: { user_id: req.user.id, parent_category_id: null }
      })
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
