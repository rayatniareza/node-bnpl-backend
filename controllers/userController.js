const User = require('../models/userModel');

const createProfile = async (req, res) => {
  const { nationalId, birthDate } = req.body;
  const userId = req.user.userId;

  if (!nationalId || !birthDate) {
    return res.status(400).json({ message: "nationalId and birthDate are required" });
  }

  // Basic validation: nationalId should be 10 digits
  if (!/^\d{10}$/.test(nationalId)) {
    return res.status(400).json({ message: "Invalid nationalId format" });
  }

  // Basic validation: birthDate should be a valid date
  if (isNaN(Date.parse(birthDate))) {
    return res.status(400).json({ message: "Invalid birthDate format" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = await User.update(userId, {
    nationalId,
    birthDate: new Date(birthDate),
    kycStatus: "Pending",
    kycLevel: 0
  });

  if (!updatedUser) {
    return res.status(500).json({ message: "User profile creation failed" });
  }

  console.log(`[LOG] Profile created for user ${userId}. nationalId: ${nationalId}`);

  res.status(200).json({
    userId: updatedUser.userId,
    kycStatus: updatedUser.kycStatus,
    kycLevel: updatedUser.kycLevel
  });
};

const getCurrentUserStatus = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const kycStatus = user.kycStatus || 'Pending';
  const kycLevel = user.kycLevel !== undefined ? user.kycLevel : 0;

  // Eligibility: Verified AND level >= 1
  const isEligibleForCredit = (kycStatus === 'Verified' && kycLevel >= 1);

  res.status(200).json({
    userId: user.userId,
    mobile: user.mobile,
    kycStatus,
    kycLevel,
    isEligibleForCredit
  });
};

module.exports = {
  createProfile,
  getCurrentUserStatus
};
