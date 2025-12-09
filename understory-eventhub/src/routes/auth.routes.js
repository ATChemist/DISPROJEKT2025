const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../validation.middleware");

// POST /auth/register
router.post("/register", validateRegister, authController.register);

// POST /auth/login
router.post("/login", validateLogin, authController.login);

// LOGOUT – tillad både POST og GET
router.post("/logout", authController.logout);
router.get("/logout", authController.logout);


module.exports = router;
