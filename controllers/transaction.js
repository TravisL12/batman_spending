const {
  Transaction: TransactionModel,
  Category: CategoryModel
} = require("../models");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");
const { sortBy, sumBy } = require("lodash");
const { dateRange } = require("../services/utility");
const { to, ReE, ReS } = require("../services/response");
const { Op } = require("sequelize");

const TransactionController = {
  async range(req, res) {
    const { user } = req;
    const { year, month, monthsBack } = req.params;

    const numMonths = monthsBack || 12;
    const options = !month
      ? dateRange(year, 12, numMonths)
      : dateRange(year, month);
    options.excludeCategoryIds = []; // Outgoing transfers

    // Get Transaction data
    const [errTransactions, transactionData] = await to(
      TransactionModel.getDates(user.id, options)
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    const { transactions, categories } = TransactionModel.groupByYearMonthDay(
      transactionData
    );

    return ReS(res, { transactions, categories }, 200);
  },

  async list(req, res) {
    let limit = 500;
    const search = req.query.keywordSearches;
    const { beforeDate, afterDate } = req.query;

    const page = req.params.page || 0;
    const query = { user_id: req.user.id };
    const parameters = {
      order: [["date", "DESC"]],
      offset: page * limit,
      include: [
        {
          model: CategoryModel,
          attributes: ["id", "name"],
          as: "Category",
          where: {
            user_id: req.user.id
          }
        },
        {
          model: CategoryModel,
          attributes: ["id", "name"],
          as: "Subcategory",
          where: {
            user_id: req.user.id
          }
        }
      ]
    };

    const dateQuery = {};
    if (beforeDate) {
      dateQuery[Op.lte] = beforeDate;
    }
    if (afterDate) {
      dateQuery[Op.gte] = afterDate;
    }

    if (beforeDate || afterDate) {
      limit = 1000;
      query.date = dateQuery;
    }

    if (!search) {
      const [error, transactions] = await to(
        TransactionModel.findAll({
          ...parameters,
          limit,
          where: query
        })
      );

      return error ? ReE(res, error) : ReS(res, { transactions }, 200);
    }

    limit = 1000;
    let groupedTransactions = [];
    const mapSearch = Array.isArray(search) ? search : [search];

    const [error, searchTransactions] = await to(
      Promise.all(
        mapSearch.map(async searchTerm => {
          query[Op.or] = [
            {
              description: {
                [Op.like]: `%${searchTerm}%`
              }
            },
            {
              payee: {
                [Op.like]: `%${searchTerm}%`
              }
            }
          ];

          const [err, newTransactions] = await to(
            TransactionModel.findAll({
              ...parameters,
              where: query,
              offset: page * limit,
              limit
            })
          );
          groupedTransactions = groupedTransactions.concat(newTransactions);
          return newTransactions;
        })
      )
    );

    const transactions = sortBy(groupedTransactions, "date").reverse();
    const searchResults = mapSearch.map((search, idx) => {
      const trans = searchTransactions[idx];

      return {
        name: search,
        grouped: TransactionModel.groupByYearMonth(trans),
        count: trans.length,
        sum: sumBy(trans, "amount")
      };
    });

    return error
      ? ReE(res, error)
      : ReS(res, { transactions, searchResults }, 200);
  },

  import(req, res) {
    const { user } = req;
    const transformer = transform(function(row, next) {
      TransactionModel.createNew(row, user)
        .then(() => {
          next();
        })
        .catch(err => {
          console.log(err.sqlMessage, "error");
          next();
        });
    }).on("finish", () => {
      fs.unlinkSync(req.file.path);
      return ReS(res, { message: "Import Complete!" }, 200);
    });

    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true }))
      .pipe(transformer);
  },

  async add(req, res) {
    const { user } = req;
    const [error, transaction] = await to(
      TransactionModel.createNew(req.body, user)
    );

    return error ? ReE(res, error) : ReS(res, { transaction }, 201);
  }
};

module.exports = TransactionController;
