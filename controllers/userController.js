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

  const user = User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = User.update(userId, {
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

module.exports = {
  createProfile
};
