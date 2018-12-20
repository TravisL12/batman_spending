const { Category, Transaction } = require("../models");

const CategoryController = {
  list(req, res) {
    return Category.findAll()
      .then(categories => {
        res.status(200).send(categories);
      })
      .catch(error => {
        res.status(400).send(error);
      });
  }
};

module.exports = CategoryController;
