const { Category, Transaction } = require("../models");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");
const _ = require("lodash");
const { dateRange } = require("../services/utility");
const moment = require("moment");
const { to, ReE, ReS } = require("../services/response");

const TransactionController = {
  async monthSpending(req, res) {
    const { user } = req;
    const { year, month } = req.params;

    const options = dateRange(year, month);
    options.excludeCategoryIds = [254]; // Outgoing transfers

    const [errTransactions, transactionData] = await to(
      Transaction.getMonth(user.id, options)
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    // Filter by year
    const transactions = _.groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });

    _.forEach(transactions, (tYear, year) => {
      // Filter by month
      transactions[year] = _.groupBy(transactions[year], trans => {
        return new Date(trans.date).getMonth() + 1;
      });

      _.forEach(transactions[year], (tMonth, month) => {
        // Filter by day (date)
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

  list(req, res) {
    const { user } = req;
    const { year } = req.query;

    const queryParams = {
      user_id: user.id
    };

    if (year) {
      queryParams.date = {
        $gte: moment(+year, "YYYY").toDate(),
        $lt: moment(+year + 1, "YYYY").toDate()
      };
    }

    return Transaction.findAll({
      where: queryParams,
      limit: 100,
      order: [["date", "DESC"]]
    })
      .then(transactions => {
        return ReS(res, { transactions }, 200);
      })
      .catch(error => {
        return ReE(res, error);
      });
  },

  async import(req, res) {
    const { user } = req;
    const transformer = transform(function(row, next) {
      TransactionController.create(row, user)
        .then(() => {
          next();
        })
        .catch(() => {
          console.log("error");
          next();
        });
    }).on("finish", () => {
      const message = "Import Complete!";
      console.log(message);
      fs.unlinkSync(req.file.path);
      return ReS(res, { message }, 200);
    });

    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true }))
      .pipe(transformer);
  },

  async create(data, user) {
    let category = data["Master Category"] || data["category"];
    let subcategory = data["Subcategory"] || data["subcategory"];
    let date = data["Date"] || data["date"];
    let payee = data["Payee"] || data["payee"];
    let description = data["Description"] || data["description"];
    let amount = data["Amount"] || data["amount"];

    description = description.replace(/\s+/g, " "); // Trim extra spaces
    amount = +amount.replace(/[$,]/g, "") * 100; // remove $ or ',' separators
    category = !category ? "None" : category;
    subcategory = !subcategory ? "None" : subcategory;

    // Parse out date values from description
    // these dates are more accurate of the actual transaction date
    const re = new RegExp(/((^\d{1,2}|\s\d{1,2})\/\d{2}\s)/);
    const newDate = description.match(re);

    if (newDate) {
      const year = new Date(date).getFullYear(); // used to get the year
      date = [newDate[0].trim(), year].join("/");
    }

    const createdAt = new Date();
    const updatedAt = new Date();

    const [categoryObj, isCreated] = await Category.findOrCreate({
      where: {
        name: category,
        user_id: user.id
      },
      defaults: {
        user_id: user.id
      }
    });

    const [subcategoryObj, isSubCreated] = await Category.findOrCreate({
      where: {
        name: subcategory,
        user_id: user.id
      },
      defaults: {
        parent_category_id: categoryObj.id,
        user_id: user.id
      }
    });

    return Transaction.create({
      description,
      payee,
      amount,
      date: new Date(date),
      user_id: user.id,
      category_id: categoryObj.id,
      subcategory_id: subcategoryObj.id,
      createdAt,
      updatedAt
    });
  },

  add(req, res) {
    const { user } = req;
    TransactionController.create(req.body, user)
      .then(transaction => {
        return ReS(res, { transaction }, 201);
      })
      .catch(error => {
        return ReE(res, error);
      });
  },

  getById(req, res) {
    const { user } = req;

    return Transaction.find({
      where: {
        id: req.params.id,
        user_id: user.id
      }
    })
      .then(transaction => {
        if (!transaction) {
          return ReE(res, { message: "Transaction Not Found" }, 404);
        }
        return ReS(res, { transaction }, 201);
      })
      .catch(error => {
        return ReE(res, error);
      });
  }
};

module.exports = TransactionController;
