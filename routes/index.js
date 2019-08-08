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
router.post("/login", userController.login);
router.post("/user/create", userController.create);
router.put(
  "/user/update",
  passport.authenticate("jwt", { session: false }),
  userController.update
);
router.get(
  "/user/profile",
  passport.authenticate("jwt", { session: false }),
  userController.profile
);

// TRANSACTIONS
router.get(
  "/transactions/yearly/:year",
  passport.authenticate("jwt", { session: false }),
  transactionController.range
);
router.get(
  "/transactions/list/:page?",
  passport.authenticate("jwt", { session: false }),
  transactionController.list
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
router.post(
  "/categories/update/:id?",
  passport.authenticate("jwt", { session: false }),
  transactionController.update
);

// CATEGORIES
router.get(
  "/categories",
  passport.authenticate("jwt", { session: false }),
  categoryController.list
);
router.get(
  "/categories/compare",
  passport.authenticate("jwt", { session: false }),
  categoryController.range
);
router.get(
  "/categories/:id",
  passport.authenticate("jwt", { session: false }),
  categoryController.getById
);

module.exports = router;
