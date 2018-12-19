const { Category, Transaction } = require("../models");
const fs = require("fs");
const parse = require("csv-parse");
const transform = require("stream-transform");

const TransactionController = {
  list(req, res) {
    const user = req.user.dataValues;

    return Transaction.findAll({
      where: {
        user_id: user.id
      },
      limit: 100,
      order: [["date", "DESC"]]
    })
      .then(transactions => {
        res.status(200).send(transactions);
      })
      .catch(error => {
        res.status(400).send(error);
      });
  },

  async import(req, res) {
    const user = req.user.dataValues;
    const transformer = transform(function(row, next) {
      TransactionController.create(row, user)
        .then(() => {
          next();
        })
        .catch(err => {
          console.log(err);
          next();
        });
    }).on("finish", () => {
      fs.unlinkSync(req.file.path);
      res.status(200).send(`Import Complete!`);
    });

    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true }))
      .pipe(transformer);
  },

  async create(data, user) {
    const description = data.description.replace(/\s+/g, " "); // Trim extra spaces
    const amount = data.amount * 100;
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
    const user = req.user.dataValues;
    TransactionController.create(req.body, user)
      .then(transaction => res.status(201).send(transaction))
      .catch(error => res.status(400).send(error));
  },

  getById(req, res) {
    const user = req.user.dataValues;

    return Transaction.find({
      where: {
        id: req.params.id,
        user_id: user.id
      }
    })
      .then(transaction => {
        if (!transaction) {
          return res.status(404).send({
            message: "Transaction Not Found"
          });
        }
        return res.status(200).send(transaction);
      })
      .catch(error => res.status(400).send(error));
  }
};

module.exports = TransactionController;
