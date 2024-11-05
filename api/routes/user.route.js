const express = require("express");
const router = express.Router();

const registerUser = require("../controllers/user.controller.js");
const verifyToken = require("../controllers/auth.middleware.js");

router.post("/", async (req, res) => {  await registerUser(req, res)});

router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!`, user: req.user });
});

module.exports = router;
