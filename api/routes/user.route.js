const express = require("express");
const router = express.Router();

const registerUser = require("../controllers/user.controller.js");

router.post("/", registerUser);

module.exports = router;
