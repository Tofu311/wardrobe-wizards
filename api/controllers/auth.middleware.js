const { verify } = require("crypto");
const jwt = require("jsonwebtoken");
const User = require('../models/user.model'); // Ensure correct path to your user model
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

const authenticateLogin = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username });
        if (!user || !(await user.matchPassword(password))) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during login' });
    }
};

module.exports = { verifyToken, authenticateLogin };
