require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const create = require("../models/user.model.js");

const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, geolocation } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object with hashed password instead of raw password
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      geolocation,
    });

    const savedUser = await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, user: savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = registerUser;
