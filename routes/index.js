const express = require("express");
const router = express.Router();
const {
  userController,
  transactionController,
  categoryController
} = require("../controllers");
const multer = require("multer");
const passport = require("passport");
const upload = multer({ dest: "tmp/csv/" });
require("./../middleware/passport")(passport);

// USER
router.post("/users/login", userController.login);
router.post("/user/create", userController.create);
router.get(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  userController.getById
);
router.put(
  "/user/update",
  passport.authenticate("jwt", { session: false }),
  userController.update
);

// TRANSACTIONS
router.get(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  transactionController.list
);
router.get(
  "/transactions/:id",
  passport.authenticate("jwt", { session: false }),
  transactionController.getById
);
router.post(
  "/transactions",
  passport.authenticate("jwt", { session: false }),
  transactionController.add
);
router.post(
  "/transactions/import",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  transactionController.import
);

// CATEGORIES
router.get(
  "/categories",
  passport.authenticate("jwt", { session: false }),
  categoryController.list
);
router.get(
  "/categories/:id",
  passport.authenticate("jwt", { session: false }),
  categoryController.getById
);

module.exports = router;
