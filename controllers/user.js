const { User, Transaction } = require("../models");
const categoryController = require("./category");
const authService = require("../services/auth");
const moment = require("moment");
const { to, ReE, ReS } = require("../services/utility");

module.exports = {
  async profile(req, res) {
    const { user } = req;
    const recentTransactions = Transaction.getPrevious(user.id);
    const monthTransactions = Transaction.getMonth(user.id);

    const [errTransactions, [recent, month]] = await to(
      Promise.all([recentTransactions, monthTransactions])
    );
    if (errTransactions) return ReE(res, errTransactions, 422);

    // Get category spending of past 3 (numMonths) months
    const numMonths = 3;
    const categoryFetch = [];
    const categoryData = [];
    for (let i = 0; i < numMonths; i++) {
      const date = moment(new Date()).subtract(i, "M");
      categoryData.push({ month: date.month(), year: date.year() });
      categoryFetch.push(
        categoryController.getMonth(user.id, date.month(), date.year())
      );
    }

    const [errCategories, categoriesResponse] = await to(
      Promise.all(categoryFetch)
    );
    if (errCategories) return ReE(res, errCategories, 422);

    const categories = categoryData.map((data, idx) => {
      data.categories = categoriesResponse[idx];
      return data;
    });

    return ReS(
      res,
      {
        user: user.public(),
        transactions: { recent, month },
        categories
      },
      200
    );
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
