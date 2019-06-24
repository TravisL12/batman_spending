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
const { Op } = require("sequelize");

const TransactionController = {
  async range(req, res) {
    const { user } = req;
    const { year, month, monthsBack } = req.params;

    const numMonths = monthsBack || 12;
    const options = !month
      ? dateRange(year, 12, numMonths)
      : dateRange(year, month);
    options.excludeCategoryIds = [2]; // Outgoing transfers

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
    const limit = 500;
    const page = req.params.page || 0;

    const query = { user_id: req.user.id };
    const { search } = req.query;

    const mapSearch = Array.isArray(search)
      ? search.map(s => `%${s}%`)
      : [`%${search}%`];

    if (search) {
      query[Op.or] = mapSearch.reduce((result, search) => {
        result.push({
          description: {
            [Op.like]: search
          }
        });
        result.push({
          payee: {
            [Op.like]: search
          }
        });

        return result;
      }, []);
    }

    const [error, transactions] = await to(
      TransactionModel.findAll({
        where: query,
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

    const payees = TransactionModel.groupSumPayees(transactions);
    const groupByDate = TransactionModel.groupByYearMonth(transactions);

    return error
      ? ReE(res, error)
      : ReS(res, { transactions, payees, groupByDate }, 200);
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
