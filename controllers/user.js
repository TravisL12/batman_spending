const models = require("../models");
const User = models.User;
const Transaction = models.Transaction;

module.exports = {
  list(req, res) {
    return User.findAll({
      include: [
        {
          model: Transaction,
          as: "transactions"
        }
      ],
      order: [
        ["createdAt", "DESC"],
        [{ model: Transaction, as: "transactions" }, "createdAt", "DESC"]
      ]
    })
      .then(users => res.status(200).send(users))
      .catch(error => {
        res.status(400).send(error);
      });
  },

  getById(req, res) {
    return User.findById(req.params.id, {
      include: [
        {
          model: Transaction,
          as: "transactions"
        }
      ]
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: "User Not Found"
          });
        }
        return res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error));
  },

  add(req, res) {
    return User.create({
      email: req.body.email
    })
      .then(user => res.status(201).send(user))
      .catch(error => res.status(400).send(error));
  },

  update(req, res) {
    return User.findById(req.params.id, {
      include: [
        {
          model: Transaction,
          as: "transactions"
        }
      ]
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: "User Not Found"
          });
        }
        return user
          .update({
            email: req.body.email || user.email
          })
          .then(() => res.status(200).send(user))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

  delete(req, res) {
    return User.findById(req.params.id)
      .then(user => {
        if (!user) {
          return res.status(400).send({
            message: "User Not Found"
          });
        }
        return user
          .destroy()
          .then(() => res.status(204).send())
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }
};
