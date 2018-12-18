const express = require("express");
const router = express.Router();
const { user, transaction } = require("../controllers");
const multer = require("multer");
const passport = require("passport");
const upload = multer({ dest: "tmp/csv/" });
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
  transaction.add
);
router.post(
  "/transactions/import",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  transaction.import
);

module.exports = router;
