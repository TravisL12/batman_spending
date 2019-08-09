const { Category, Transaction } = require("../models");
const moment = require("moment");
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
    const numMonths = req.query.monthsBack || 12;

    const afterDate = moment().subtract(numMonths, "M");
    const options = { afterDate, beforeDate: moment() };

    const [err, categoryData] = await to(
      Category.getDates(req.user.id, options)
    );

    const categories = categoryData.reduce((result, category) => {
      result[category.id] = {
        id: category.id,
        name: category.name,
        transactionTotals: Transaction.sumByYearMonth(category.Transactions)
      };

      return result;
    }, {});

    return ReS(res, { categories }, 200);
  },

  async list(req, res) {
    const [error, categories] = await to(
      Category.findAll({
        where: { user_id: req.user.id, parent_category_id: null },
        include: [
          {
            model: Category,
            as: "Subcategory"
          }
        ]
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
