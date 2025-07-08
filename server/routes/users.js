const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const emitNotification = require("../utils/notify");

const router = express.Router();

// Get user by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username displayName")
      .populate("following", "username displayName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .populate("author", "username displayName")
      .populate("comments.user", "username displayName")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        skills: user.skills,
        githubLink: user.githubLink,
        createdAt: user.createdAt,
        followers: user.followers.map((u) => ({
          id: u._id,
          username: u.username,
          displayName: u.displayName,
        })),
        following: user.following.map((u) => ({
          id: u._id,
          username: u.username,
          displayName: u.displayName,
        })),
      },
      posts,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put(
  "/:id",
  auth,
  [
    body("displayName")
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage("Display name must be between 1 and 50 characters"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio must be less than 500 characters"),
    body("skills").optional().isArray().withMessage("Skills must be an array"),
    body("githubLink")
      .optional()
      .isURL()
      .withMessage("GitHub link must be a valid URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is updating their own profile
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { displayName, bio, skills, githubLink } = req.body;

      const updateData = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (skills !== undefined) updateData.skills = skills;
      if (githubLink !== undefined) updateData.githubLink = githubLink;

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        skills: user.skills,
        githubLink: user.githubLink,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Change user password
router.put(
  "/:id/password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
      await user.save();
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all users (for explore page)
router.get("/", async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    const users = await User.find(query)
      .select("username displayName bio skills githubLink createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Follow a user
router.put("/:username/follow", auth, async (req, res) => {
  try {
    const userToFollow = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow)
      return res.status(404).json({ message: "User not found" });
    if (userToFollow._id.equals(currentUser._id))
      return res.status(400).json({ message: "Cannot follow yourself" });
    if (userToFollow.followers.includes(currentUser._id))
      return res.status(400).json({ message: "Already following" });
    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);
    await userToFollow.save();
    await currentUser.save();
    // Create notification for follow (if not self)
    const notification = await Notification.create({
      user: userToFollow._id,
      type: "follow",
      fromUser: currentUser._id,
    });
    emitNotification(req.app, notification);
    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unfollow a user
router.put("/:username/unfollow", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findOne({
      username: req.params.username,
    });
    const currentUser = await User.findById(req.user.id);
    if (!userToUnfollow)
      return res.status(404).json({ message: "User not found" });
    if (userToUnfollow._id.equals(currentUser._id))
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => !id.equals(currentUser._id)
    );
    currentUser.following = currentUser.following.filter(
      (id) => !id.equals(userToUnfollow._id)
    );
    await userToUnfollow.save();
    await currentUser.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user account and their posts
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only allow user to delete their own account
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    // Delete all posts by this user
    await Post.deleteMany({ author: req.params.id });
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
