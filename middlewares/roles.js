const authMiddleware = (req, res, next) => {
  // ... existing auth ...
  // next();
};

const adminMiddleware = (req, res, next) => {
    // For this simple implementation, let's assume 'admin' userId is admin
    // In a real system, we would check user.role
    if (req.user && (req.user.role === 'admin' || req.user.userId === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admin access required" });
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware
};
