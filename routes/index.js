const express = require("express");
const router = express.Router();
const { user, transaction, category } = require("../controllers");
const multer = require("multer");
const passport = require("passport");
const upload = multer({ dest: "tmp/csv/" });
require("./../middleware/passport")(passport);

router.post("/users/login", user.login);

// USER
router.post("/user/create", user.create);
router.put(
  "/user/update",
  passport.authenticate("jwt", { session: false }),
  user.update
);

// TRANSACTIONS
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
  transaction.add
);
router.post(
  "/transactions/import",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  transaction.import
);

// CATEGORIES
router.get(
  "/categories",
  passport.authenticate("jwt", { session: false }),
  category.list
);

module.exports = router;
