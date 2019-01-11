const { Transaction: TransactionModel } = require("../models");
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

    const options = !month ? dateRange(year, 12, 12) : dateRange(year, month);
    options.excludeCategoryIds = [254]; // Outgoing transfers

    const [errTransactions, transactionData] = await to(
      TransactionModel.getDates(user.id, options)
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    // Filter by year
    const transactions = _.groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });

    // Filter by month
    _.forEach(transactions, (tYear, year) => {
      transactions[year] = _.groupBy(transactions[year], trans => {
        return new Date(trans.date).getMonth() + 1;
      });

      // Filter by day (date)
      _.forEach(transactions[year], (tMonth, month) => {
        transactions[year][month] = _.groupBy(
          transactions[year][month],
          trans => {
            return new Date(trans.date).getDate();
          }
        );
      });
    });

    return ReS(res, { transactions }, 200);
  },

  // not used but could be setup for pagination view to edit stuff
  async list(req, res) {
    const { year } = req.query;
    const queryParams = { user_id: req.user.id };

    if (year) {
      const { startDate, endDate } = dateRange(year, 12, 12);
      queryParams.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const [error, transactions] = await to(
      TransactionModel.findAll({
        where: queryParams,
        limit: 100,
        order: [["date", "DESC"]]
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
