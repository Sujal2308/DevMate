const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const emitNotification = require("../utils/notify");
const { sendEmail } = require("../utils/email");
const { cloudinary } = require("../config/cloudinary");

const router = express.Router();
// Get all saved posts and collections
router.get("/saved/posts", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: [
        { path: "author", select: "username displayName avatar" },
        { path: "comments.user", select: "username displayName avatar" }
      ]
    }).populate({
      path: "savedCollections.posts",
      populate: [
        { path: "author", select: "username displayName avatar" },
        { path: "comments.user", select: "username displayName avatar" }
      ]
    });
    // Reverse to show newest saves first
    const posts = user.savedPosts ? user.savedPosts.reverse() : [];
    res.json({ 
      posts,
      collections: user.savedCollections || []
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new collection
router.post("/collections", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Collection name is required" });

    const user = await User.findById(req.user._id);
    if (!user.savedCollections) user.savedCollections = [];
    
    // Check if collection with same name exists
    const exists = user.savedCollections.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return res.status(400).json({ message: "Collection already exists" });

    user.savedCollections.push({ name, posts: [] });
    await user.save();

    res.status(201).json({ collections: user.savedCollections });
  } catch (error) {
    console.error("Create collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update collection name
router.put("/collections/:collectionId", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Collection name is required" });

    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    collection.name = name;
    await user.save();

    res.json({ collections: user.savedCollections });
  } catch (error) {
    console.error("Update collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete collection
router.delete("/collections/:collectionId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    user.savedCollections.pull(req.params.collectionId);
    await user.save();

    res.json({ collections: user.savedCollections });
  } catch (error) {
    console.error("Delete collection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save or unsave a post (supports specific collection)
router.put("/save/:postId", auth, async (req, res) => {
  try {
    const { collectionId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(req.user._id);
    let isSaved = false;

    if (collectionId) {
      // Save/unsave to specific collection
      const collection = user.savedCollections.id(collectionId);
      if (!collection) return res.status(404).json({ message: "Collection not found" });

      const postIndex = collection.posts.findIndex(id => id.toString() === req.params.postId);
      if (postIndex > -1) {
        collection.posts.splice(postIndex, 1);
        isSaved = false;
      } else {
        collection.posts.push(req.params.postId);
        isSaved = true;
      }
    } else {
      // Default: save/unsave to all posts
      isSaved = user.savedPosts && user.savedPosts.includes(req.params.postId);
      if (isSaved) {
        user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
      } else {
        if (!user.savedPosts) user.savedPosts = [];
        user.savedPosts.push(req.params.postId);
      }
    }

    await user.save();
    
    res.json({ 
      message: isSaved ? "Post saved" : "Post unsaved", 
      savedPosts: user.savedPosts,
      savedCollections: user.savedCollections
    });
  } catch (error) {
    console.error("Save post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by username
router.get("/:username", async (req, res) => {
  try {
    // Try to authenticate if token is present
    let reqUser = null;
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const User = require("../models/User");
        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        reqUser = await User.findById(decoded.userId).select("-password");
      } catch (err) {
        // Ignore token errors for public profiles
      }
    }

    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username displayName avatar")
      .populate("following", "username displayName avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine if requester is owner or follower
    let isOwner = false;
    let isFollower = false;
    if (reqUser) {
      isOwner = reqUser._id.toString() === user._id.toString();
      isFollower = user.followers.some(
        (f) => f._id.toString() === reqUser._id.toString()
      );
    }

    // If profile is private and requester is not owner or follower, restrict info
    if (user.isPrivate && !isOwner && !isFollower) {
      return res.json({
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          skills: user.skills,
          githubLink: user.githubLink,
          createdAt: user.createdAt,
          avatar: user.avatar,
          isPrivate: user.isPrivate,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          projectsCount: user.projects?.length || 0,
          socialLinks: user.socialLinks || [],
        },
        posts: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0,
          hasMore: false,
        },
        metricsHidden: true,
      });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2; // Start with just 2 posts for faster loading
    const skip = (page - 1) * limit;

    // Get user's posts with pagination
    const posts = await Post.find({ author: user._id })
      .populate("author", "username displayName avatar")
      .populate("comments.user", "username displayName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total posts count for pagination
    const totalPosts = await Post.countDocuments({ author: user._id });

    // Limit followers/following data for faster loading - just return counts
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        skills: user.skills,
        githubLink: user.githubLink,
        createdAt: user.createdAt,
        avatar: user.avatar,
        isPrivate: user.isPrivate,
        followersCount,
        followingCount,
        dob: user.dob,
        gender: user.gender,
        nationality: user.nationality,
        projects: user.projects || [],
        socialLinks: user.socialLinks || [],
        // Only include actual followers/following data if requested
        ...(req.query.includeFollowersData === "true" && {
          followers: user.followers.map((u) => ({
            id: u._id,
            _id: u._id,
            username: u.username,
            displayName: u.displayName,
            avatar: u.avatar,
          })),
        }),
        ...(req.query.includeFollowingData === "true" && {
          following: user.following.map((u) => ({
            id: u._id,
            _id: u._id,
            username: u.username,
            displayName: u.displayName,
            avatar: u.avatar,
          })),
        }),
      },
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(totalPosts / limit),
        total: totalPosts,
        hasMore: page < Math.ceil(totalPosts / limit),
      },
      metricsHidden: false,
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
      .optional({ checkFalsy: true })
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

      const { displayName, bio, skills, githubLink, avatar, dob, gender, nationality, socialLinks } = req.body;

      const updateData = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (skills !== undefined) updateData.skills = skills;
      if (dob !== undefined) updateData.dob = dob;
      if (gender !== undefined) updateData.gender = gender;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
      if (githubLink !== undefined) {
        // Handle empty GitHub link - set to empty string if cleared
        updateData.githubLink = githubLink || "";
      }
      if (avatar !== undefined) {
        // If avatar is a new base64 image string, upload to Cloudinary
        if (avatar && avatar.startsWith("data:image")) {
          try {
            const uploadResponse = await cloudinary.uploader.upload(avatar, {
              folder: "devmate/avatars",
              transformation: [{ width: 500, height: 500, crop: "fill" }],
            });
            updateData.avatar = uploadResponse.secure_url;
          } catch (uploadError) {
            console.error("Cloudinary avatar upload error:", uploadError);
            // Fallback: don't update avatar or use base64 if upload fails
            // For now, only update if upload successful to keep DB clean
          }
        } else {
          updateData.avatar = avatar;
        }
      }

      // Mark profile as completed when any field is updated
      updateData.profileCompleted = true;

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
        dob: user.dob,
        gender: user.gender,
        nationality: user.nationality,
        githubLink: user.githubLink,
        avatar: user.avatar,
        projects: user.projects || [],
        socialLinks: user.socialLinks || [],
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
      .select("username displayName bio skills githubLink createdAt avatar")
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
    console.log(
      "[FOLLOW API] userToFollow:",
      userToFollow && userToFollow._id.toString(),
      userToFollow && userToFollow.username
    );
    console.log(
      "[FOLLOW API] currentUser:",
      currentUser && currentUser._id.toString(),
      currentUser && currentUser.username
    );
    console.log(
      "[FOLLOW API] userToFollow.followers:",
      userToFollow && userToFollow.followers.map((f) => f.toString())
    );
    console.log(
      "[FOLLOW API] currentUser.following:",
      currentUser && currentUser.following.map((f) => f.toString())
    );
    if (!userToFollow)
      return res.status(404).json({ message: "User not found" });
    if (userToFollow._id.equals(currentUser._id))
      return res.status(400).json({ message: "Cannot follow yourself" });
    if (userToFollow.followers.includes(currentUser._id)) {
      console.log("[FOLLOW API] Already following");
      return res.status(400).json({ message: "Already following" });
    }
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

    // Send email if enabled
    if (
      userToFollow.notificationPreferences?.newFollower &&
      userToFollow.email
    ) {
      try {
        await sendEmail({
          to: userToFollow.email,
          subject: `You have a new follower on DevMate!`,
          text: `${
            currentUser.displayName || currentUser.username
          } is now following you on DevMate!`,
          html: `<p><b>${
            currentUser.displayName || currentUser.username
          }</b> is now following you on DevMate!</p>`,
        });
      } catch (e) {
        console.error("Email send error (new follower):", e);
      }
    }

    // Return updated user data with followers populated
    const updatedUser = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username displayName avatar")
      .populate("following", "username displayName avatar");

    res.json({
      message: "Followed successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        followersCount: updatedUser.followers.length,
        followingCount: updatedUser.following.length,
        followers: updatedUser.followers.map((u) => ({
          id: u._id,
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
        })),
        following: updatedUser.following.map((u) => ({
          id: u._id,
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
        })),
      },
    });
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

    // Return updated user data with followers populated
    const updatedUser = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username displayName avatar")
      .populate("following", "username displayName avatar");

    res.json({
      message: "Unfollowed successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        followersCount: updatedUser.followers.length,
        followingCount: updatedUser.following.length,
        followers: updatedUser.followers.map((u) => ({
          id: u._id,
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
        })),
        following: updatedUser.following.map((u) => ({
          id: u._id,
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
        })),
      },
    });
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

// Get all followers for a user
router.get("/:username/followers", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("followers")
      .populate("followers", "username displayName avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      followers: user.followers.map((u) => ({
        _id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
      })),
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update notification preferences
router.put(
  "/:id/notifications",
  auth,
  [
    body("notificationPreferences")
      .isObject()
      .withMessage("notificationPreferences must be an object"),
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
      const { notificationPreferences } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { notificationPreferences },
        { new: true }
      ).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ notificationPreferences: user.notificationPreferences });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update profile privacy (public/private)
router.put(
  "/:id/privacy",
  auth,
  [body("isPrivate").isBoolean().withMessage("isPrivate must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { isPrivate } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isPrivate },
        { new: true }
      ).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ isPrivate: user.isPrivate });
    } catch (error) {
      console.error("Update privacy error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user's posts with pagination (for infinite scroll)
router.get("/:username/posts", async (req, res) => {
  try {
    // Try to authenticate if token is present
    let reqUser = null;
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const User = require("../models/User");
        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        reqUser = await User.findById(decoded.userId).select("-password");
      } catch (err) {
        // Ignore token errors for public profiles
      }
    }

    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine if requester is owner or follower
    let isOwner = false;
    let isFollower = false;
    if (reqUser) {
      isOwner = reqUser._id.toString() === user._id.toString();
      isFollower = user.followers.some(
        (f) => f._id.toString() === reqUser._id.toString()
      );
    }

    // If profile is private and requester is not owner or follower, restrict access
    if (user.isPrivate && !isOwner && !isFollower) {
      return res
        .status(403)
        .json({ message: "This user's posts are private." });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get user's posts with pagination
    const posts = await Post.find({ author: user._id })
      .populate("author", "username displayName avatar")
      .populate("comments.user", "username displayName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total posts count for pagination
    const totalPosts = await Post.countDocuments({ author: user._id });

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(totalPosts / limit),
        total: totalPosts,
        hasMore: page < Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's followers or following list
router.get("/:username/:type(followers|following)", async (req, res) => {
  try {
    const { username, type } = req.params;

    const user = await User.findOne({ username })
      .populate(type, "username displayName avatar")
      .select(`${type} isPrivate`);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For now, return all followers/following
    // In the future, this could also be paginated if lists get very large
    res.json({
      [type]: user[type].map((u) => ({
        id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
      })),
      total: user[type].length,
    });
  } catch (error) {
    console.error(`Get user ${req.params.type} error:`, error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new project to user profile
router.post(
  "/:id/projects",
  auth,
  [
    body("name").notEmpty().withMessage("Project name is required"),
    body("description").optional().isString(),
    body("repoLink").optional({ checkFalsy: true }).isURL().withMessage("Invalid repo URL"),
    body("liveLink").optional({ checkFalsy: true }).isURL().withMessage("Invalid live URL"),
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
      if (!user) return res.status(404).json({ message: "User not found" });

      const { name, description, repoLink, liveLink } = req.body;
      const newProject = { name, description, repoLink, liveLink };

      if (!user.projects) user.projects = [];
      user.projects.push(newProject);
      await user.save();

      res.status(201).json({ message: "Project added", projects: user.projects });
    } catch (error) {
      console.error("Add project error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a project from user profile
router.delete("/:id/projects/:projectId", auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.projects = user.projects.filter(
      (p) => p._id.toString() !== req.params.projectId
    );
    await user.save();

    res.json({ message: "Project deleted", projects: user.projects });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
