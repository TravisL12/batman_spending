const express = require("express");
const router = express.Router();
const userController = require("../controllers").user;
const transactionController = require("../controllers").transaction;
const passport = require("passport");
require("./../middleware/passport")(passport);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  userController.list
);
router.get(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  userController.getById
);
router.post(
  "/user",
  passport.authenticate("jwt", { session: false }),
  userController.add
);
router.put(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  userController.update
);
router.delete(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  userController.delete
);
router.post("/users/login", userController.login);

router.get(
  "/transaction",
  passport.authenticate("jwt", { session: false }),
  transactionController.list
);
router.get(
  "/transaction/:id",
  passport.authenticate("jwt", { session: false }),
  transactionController.getById
);
router.post(
  "/transaction",
  passport.authenticate("jwt", { session: false }),
  transactionController.add
);

module.exports = router;
