const express = require("express");
const router = express.Router();
const userController = require("../controllers").user;
const transactionController = require("../controllers").transaction;

router.get("/user", userController.list);
router.get("/user/:id", userController.getById);
router.post("/user", userController.add);
router.put("/user/:id", userController.update);
router.delete("/user/:id", userController.delete);

router.get("/transaction", transactionController.list);
router.get("/transaction/:id", transactionController.getById);

module.exports = router;
