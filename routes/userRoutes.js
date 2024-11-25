const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.singup);

router.post("/login", authController.login);

router.get("/verify-token", authController.verifyAuth);

module.exports = router;
