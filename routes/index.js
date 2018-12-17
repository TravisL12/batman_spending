const express = require("express");
const router = express.Router();
const { user, transaction } = require("../controllers");
const passport = require("passport");
require("./../middleware/passport")(passport);

router.post("/user/create", user.create);
router.put(
  "/user/update",
  passport.authenticate("jwt", { session: false }),
  user.update
);

router.post("/users/login", user.login);

router.get(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  transaction.list
);
router.get(
  "/transactions/:id",
  passport.authenticate("jwt", { session: false }),
  transaction.getById
);
router.post(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  transaction.create
);

module.exports = router;
