const { User, Category, Transaction } = require("../models");
const authService = require("../services/auth");
const { to, ReE, ReS } = require("../services/utility");

module.exports = {
  async profile(req, res) {
    const { user } = req;
    const [err1, recent] = await to(Transaction.getPrevious(user.id));
    const [err2, month] = await to(Transaction.getMonth(user.id));
    const [err3, categories] = await to(Category.getMonth(user.id));

    // const [err, [recent, month, categories]] = await to(
    //   Promise.all([recentTransactions, monthTransactions, categoryData])
    // );

    const err = err1 || err2 || err3;

    return err
      ? ReE(res, err, 422)
      : ReS(
          res,
          { user: user.public(), transactions: { recent, month }, categories },
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
