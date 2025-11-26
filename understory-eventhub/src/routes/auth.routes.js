const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /auth/register
router.post("/register", authController.register);

// POST /auth/login
router.post("/login", authController.login);

// LOGOUT – tillad både POST og GET
router.post("/logout", authController.logout);
router.get("/logout", authController.logout);


module.exports = router;
