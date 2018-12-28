const { Category, Transaction } = require("../models");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");
const moment = require("moment");
const { to, ReE, ReS } = require("../services/utility");

const TransactionController = {
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
        return ReS(
          res,
          {
            transactions
          },
          200
        );
      })
      .catch(error => {
        return ReE(res, error);
      });
  },

  async import(req, res) {
    const { user } = req;
    const transformer = transform(function(row, next) {
      TransactionController.create(row, user)
        .then(next)
        .catch(err => {
          console.log(err);
          next();
        });
    }).on("finish", () => {
      fs.unlinkSync(req.file.path);
      return ReS(
        res,
        {
          message: "Import Complete!"
        },
        200
      );
    });

    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true }))
      .pipe(transformer);
  },

  async create(data, user) {
    const description = data.description.replace(/\s+/g, " "); // Trim extra spaces
    const amount = +data.amount.replace(/[$,]/g, "") * 100;
    const category = !data.category ? "None" : data.category;
    const subcategory = !data.subcategory ? "None" : data.subcategory;
    const { payee, date } = data;

    const createdAt = new Date();
    const updatedAt = new Date();

    const [categoryObj, isCreated] = await Category.findOrCreate({
      where: {
        name: category
      }
    });

    const [subcategoryObj, isSubCreated] = await Category.findOrCreate({
      where: {
        name: subcategory
      },
      defaults: {
        parent_category_id: categoryObj.id
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
