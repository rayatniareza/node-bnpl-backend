const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (req, res) => {
  const { userId, mobile } = req.body;

  if (!userId || !mobile) {
    return res.status(400).json({ message: "userId and mobile are required" });
  }

  const existingUser = User.findById(userId) || User.findByMobile(mobile);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // As per requirement, we need to return a hashedPassword in the output.
  // Since no password is provided in input, I'll use a default one for hashing.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('defaultPassword123', salt);

  const newUser = User.create({
    userId,
    mobile,
    password: hashedPassword
  });

  res.status(201).json({
    message: "User created successfully",
    newUser
  });
};

const login = async (req, res) => {
  const { mobile, code } = req.body;

  if (!mobile || !code) {
    return res.status(400).json({ message: "mobile and code are required" });
  }

  // Hardcoded OTP validation as per requirement logic
  if (code !== '123456') {
    return res.status(401).json({ message: "Invalid OTP or mobile" });
  }

  const user = User.findByMobile(mobile);
  if (!user) {
    return res.status(401).json({ message: "Invalid OTP or mobile" });
  }

  const token = jwt.sign(
    { userId: user.userId, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ accessToken: token });
};

const getMe = (req, res) => {
  res.json({
    userId: req.user.userId,
    mobile: req.user.mobile,
    isAuthenticated: true
  });
};

module.exports = {
  register,
  login,
  getMe
};
