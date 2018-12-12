const Transaction = require("../models").Transaction;

module.exports = {
  list(req, res) {
    return Transaction.findAll()
      .then(users => res.status(200).send(users))
      .catch(error => {
        res.status(400).send(error);
      });
  },

  getById(req, res) {
    return Transaction.findById(req.params.id)
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
