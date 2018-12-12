const express = require("express");
const router = express.Router();
const userController = require("../controllers").user;

router.get("/user", userController.list);
router.get("/user/:id", userController.getById);
router.post("/user", userController.add);
router.put("/user/:id", userController.update);
router.delete("/user/:id", userController.delete);

module.exports = router;
