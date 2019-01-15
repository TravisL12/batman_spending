const {
  Transaction: TransactionModel,
  Category: CategoryModel
} = require("../models");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");
const _ = require("lodash");
const { dateRange } = require("../services/utility");
const { to, ReE, ReS } = require("../services/response");

const TransactionController = {
  async range(req, res) {
    const { user } = req;
    const { year, month } = req.params;

    const numMonths = 12;
    const options = !month
      ? dateRange(year, 12, numMonths)
      : dateRange(year, month);
    options.excludeCategoryIds = [2]; // Outgoing transfers

    // Get Transaction data
    const [errTransactions, transactionData] = await to(
      TransactionModel.getDates(user.id, options)
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    const allCategories = _.keyBy(
      _.uniqBy(_.map(transactionData, "Category"), "id"),
      "id"
    );

    // Filter Transaction data by year
    const transactions = _.groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });

    const categories = {};

    // Filter Transaction data by month
    _.forEach(transactions, (tYear, year) => {
      transactions[year] = _.groupBy(transactions[year], trans => {
        return new Date(trans.date).getMonth() + 1;
      });

      categories[year] = {}; // initialize category year

      // Filter Transaction data by day (date)
      _.forEach(transactions[year], (tMonth, month) => {
        // Group all transactions into specific year-month by category_id
        categories[year][month] = tMonth.reduce((result, t) => {
          if (result[t.category_id]) {
            result[t.category_id].sum += t.amount;
          } else {
            result[t.category_id] = {
              ...allCategories[t.category_id].toJSON(),
              sum: t.amount
            };
          }

          return result;
        }, {});

        transactions[year][month] = _.groupBy(
          transactions[year][month],
          trans => {
            return new Date(trans.date).getDate();
          }
        );
      });
    });

    return ReS(res, { transactions, categories }, 200);
  },

  // not used but could be setup for pagination view to edit stuff
  async list(req, res) {
    const limit = 500;
    const page = req.params.page || 0;

    const [error, transactions] = await to(
      TransactionModel.findAll({
        where: { user_id: req.user.id },
        limit,
        offset: page * limit,
        order: [["date", "DESC"]],
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
      })
    );

    return error ? ReE(res, error) : ReS(res, { transactions }, 200);
  },

  import(req, res) {
    const { user } = req;
    const transformer = transform(function(row, next) {
      TransactionModel.createNew(row, user)
        .then(() => {
          next();
        })
        .catch(() => {
          console.log("error");
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
  },

  async getById(req, res) {
    const { user } = req;

    const [error, transaction] = await to(
      TransactionModel.find({
        where: {
          id: req.params.id,
          user_id: user.id
        }
      })
    );

    return error ? ReE(res, error) : ReS(res, { transaction }, 201);
  }
};

module.exports = TransactionController;
