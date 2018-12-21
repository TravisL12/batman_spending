const { ExtractJwt, Strategy } = require("passport-jwt");
const { User } = require("../models");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const { to } = require("../services/utility");

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.jwt_encryption;

  passport.use(
    new Strategy(opts, async function(jwt_payload, done) {
      let err, user;
      [err, user] = await to(User.findByPk(jwt_payload.user_id));

      if (err) return done(err, false);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  );
};
