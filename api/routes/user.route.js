const express = require("express");
const router = express.Router();

const { registerUser, login } = require("../controllers/user.controller.js");
const { verifyToken } = require("../controllers/auth.middleware.js");

// Register new user
router.post("/register", registerUser);

// User login
router.post("/login", login);

// Get user profile
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!`, user: req.user });
});

module.exports = router;
