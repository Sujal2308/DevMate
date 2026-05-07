const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    // req.user should already be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(500).json({ message: "Server error checking admin status" });
  }
};

module.exports = isAdmin;
