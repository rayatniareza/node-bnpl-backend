const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');

// Simple mobile validation: 11 digits starting with 09
const validateMobile = (mobile) => {
  return /^09\d{9}$/.test(mobile);
};

const requestOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !validateMobile(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number format" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresIn = 120; // 2 minutes

  console.log(`[LOG] OTP for ${mobile}: ${otp}`); // Log OTP for testing/auditing
  Otp.saveOtp(mobile, otp, expiresIn);

  res.json({ expiresIn });
};

const verifyOtp = async (req, res) => {
  try {
    const { mobile, code } = req.body;

    if (!mobile || !code) {
      return res.status(400).json({ message: "Mobile and code are required" });
    }

    const storedOtp = Otp.getOtp(mobile);

    if (!storedOtp || storedOtp !== code) {
      console.log(`[LOG] Verification failed for ${mobile}`);
      return res.status(401).json({ message: "Invalid OTP or mobile" });
    }

    // OTP verified, remove it
    Otp.deleteOtp(mobile);

    let user = User.findByMobile(mobile);
    let isNewUser = false;

    if (!user) {
      // If user doesn't exist, we create one but mark as new user for profile creation
      user = User.create({ mobile });
      isNewUser = true;
    } else if (!user.nationalId) {
      // If user exists but hasn't completed profile creation
      isNewUser = true;
    }

    const token = jwt.sign(
      { userId: user.userId, mobile: user.mobile },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1h' }
    );

    console.log(`[LOG] User ${mobile} verified successfully. isNewUser: ${isNewUser}`);

    res.json({
      accessToken: token,
      isNewUser
    });
  } catch (error) {
    console.error(`[ERROR] verifyOtp: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

const register = async (req, res) => {
  const { userId, mobile } = req.body;

  if (!userId || !mobile) {
    return res.status(400).json({ message: "userId and mobile are required" });
  }

  const existingUser = User.findById(userId) || User.findByMobile(mobile);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('defaultPassword123', salt);

  const newUser = User.create({
    userId,
    mobile,
    password: hashedPassword
  });

  console.log(`[LOG] Traditional registration for user ${userId}`);

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

  // Maintaining hardcoded '123456' for legacy/dev compatibility as per initial prompt
  if (code !== '123456') {
    return res.status(401).json({ message: "Invalid OTP or mobile" });
  }

  const user = User.findByMobile(mobile);
  if (!user) {
    return res.status(401).json({ message: "Invalid OTP or mobile" });
  }

  const token = jwt.sign(
    { userId: user.userId, mobile: user.mobile },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '1h' }
  );

  console.log(`[LOG] Traditional login for user ${mobile}`);

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
  requestOtp,
  verifyOtp,
  register,
  login,
  getMe
};
