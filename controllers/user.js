const { User, Transaction } = require("../models");
const categoryController = require("./category");
const authService = require("../services/auth");
const _ = require("lodash");
const moment = require("moment");
const { to, ReE, ReS } = require("../services/utility");

module.exports = {
  async profile(req, res) {
    const { user } = req;
    const yearsBack = 10;
    const [errTransactions, transactionData] = await to(
      Transaction.getMonth(user.id, yearsBack * 12)
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    // Filter by year
    let transactions = _.groupBy(transactionData, trans => {
      return new Date(trans.date).getFullYear();
    });

    _.forEach(transactions, (t, year) => {
      // Filter by month
      transactions[year] = _.groupBy(transactions[year], trans => {
        return new Date(trans.date).getMonth();
      });

      _.forEach(transactions[year], (t2, data) => {
        // Filter by day (date)
        transactions[year][data] = _.groupBy(
          transactions[year][data],
          trans => {
            return new Date(trans.date).getDate();
          }
        );
      });
    });

    return ReS(res, { user: user.public(), transactions }, 200);
  },

  async create(req, res) {
    const [err, user] = await to(authService.createUser(req.body));

    return err
      ? ReE(res, err, 422)
      : ReS(
          res,
          {
            message: "Successfully created new user.",
            user: user.toWeb(),
            token: user.getJWT()
          },
          201
        );
  },

  update(req, res) {
    return User.findByPk(req.params.id, {
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
    return User.findByPk(req.params.id)
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
  },

  async login(req, res) {
    let err, user;
    [err, user] = await to(authService.authUser(req.body));
    if (err) return ReE(res, err, 422);

    return ReS(res, { token: user.getJWT(), user: user.toWeb() });
  }
};
