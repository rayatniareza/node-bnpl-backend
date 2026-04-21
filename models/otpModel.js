// In-memory OTP storage
const otps = new Map();

const saveOtp = (mobile, otp, expiresInSeconds) => {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  otps.set(mobile, { otp, expiresAt });
};

const getOtp = (mobile) => {
  const data = otps.get(mobile);
  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    otps.delete(mobile);
    return null;
  }

  return data.otp;
};

const deleteOtp = (mobile) => {
  otps.delete(mobile);
};

module.exports = {
  saveOtp,
  getOtp,
  deleteOtp
};
