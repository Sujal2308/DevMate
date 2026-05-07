const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const Report = require("../models/Report");

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get("/stats", [auth, isAdmin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    
    res.json({ totalUsers, totalPosts, pendingReports });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
router.get("/reports", [auth, isAdmin], async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username avatar email")
      .populate("targetId")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Admin reports error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/admin/reports/:id
// @desc    Update report status
// @access  Private/Admin
router.put("/reports/:id", [auth, isAdmin], async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/admin/posts
// @desc    Get all posts
// @access  Private/Admin
router.get("/posts", [auth, isAdmin], async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Admin posts error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Moderator delete a post
// @access  Private/Admin
router.delete("/posts/:id", [auth, isAdmin], async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    // Auto-resolve reports for this post
    await Report.updateMany({ targetId: req.params.id }, { status: "resolved", adminNotes: "Post deleted by admin." });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get("/users", [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role
// @access  Private/Admin
router.put("/users/:id/role", [auth, isAdmin], async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent removing your own admin rights by mistake
    if (user._id.toString() === req.user.id && role !== "admin") {
       return res.status(400).json({ message: "Cannot remove your own admin rights" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    console.error("Admin user role update error:", err.message);
    if (err.kind === "ObjectId") {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block or unblock a user
// @access  Private/Admin
router.put("/users/:id/block", [auth, isAdmin], async (req, res) => {
  try {
    const { reason, days } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot block your own account" });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    
    if (user.isBlocked) {
      user.blockReason = reason || "Violation of community guidelines";
      if (days && days > 0) {
        const untilDate = new Date();
        untilDate.setDate(untilDate.getDate() + parseInt(days));
        user.blockedUntil = untilDate;
      } else {
        user.blockedUntil = null; // Permanent
      }
    } else {
      user.blockReason = "";
      user.blockedUntil = null;
    }

    await user.save();

    res.json({ 
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, 
      isBlocked: user.isBlocked,
      blockedUntil: user.blockedUntil,
      blockReason: user.blockReason
    });
  } catch (err) {
    console.error("Admin user block error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete("/users/:id", [auth, isAdmin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
           return res.status(400).json({ message: "Cannot delete your own account from admin dashboard" });
        }

        await User.findByIdAndDelete(req.params.id);
        // Optionally delete user's posts
        await Post.deleteMany({ author: req.params.id });

        res.json({ message: "User removed completely" });
    } catch (err) {
        console.error("Admin user delete error:", err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).send("Server Error");
    }
});

module.exports = router;
