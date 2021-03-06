const { User, Transaction } = require("../models");
const authService = require("../services/auth");
const { to, ReE, ReS } = require("../services/response");
const _ = require("lodash");

module.exports = {
  async profile(req, res) {
    const { user } = req;

    const yearResponse = await Transaction.listYears(user.id);
    const years = _.map(yearResponse, ({ dataValues: { year: year } }) => {
      return year;
    }).sort();
    ReS(res, { user, years }, 200);
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
