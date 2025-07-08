const express = require("express");
const { body, validationResult } = require("express-validator");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const emitNotification = require("../utils/notify");

const router = express.Router();

// Create a new post
router.post(
  "/",
  auth,
  [
    body("content")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Content must be between 1 and 2000 characters"),
    body("codeSnippet")
      .optional()
      .isLength({ max: 5000 })
      .withMessage("Code snippet must be less than 5000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, codeSnippet } = req.body;

      const post = new Post({
        author: req.user._id,
        content,
        codeSnippet: codeSnippet || "",
      });

      await post.save();

      // Populate author info
      await post.populate("author", "username displayName");

      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all posts (feed)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "username displayName")
      .populate("comments.user", "username displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username displayName")
      .populate("comments.user", "username displayName");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Like/Unlike a post
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );
    let liked = false;
    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push({ user: req.user._id });
      liked = true;
    }
    await post.save();
    // Populate author info
    await post.populate("author", "username displayName");
    await post.populate("comments.user", "username displayName");
    // Create notification if liked and not self
    if (liked && post.author._id.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        user: post.author._id,
        type: "like",
        fromUser: req.user._id,
        post: post._id,
      });
      emitNotification(req.app, notification);
    }
    res.json(post);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to a post
router.post(
  "/:id/comment",
  auth,
  [
    body("text")
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be between 1 and 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { text } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const newComment = {
        user: req.user._id,
        text,
      };
      post.comments.push(newComment);
      await post.save();
      // Populate author info
      await post.populate("author", "username displayName");
      await post.populate("comments.user", "username displayName");
      // Create notification if not self
      if (post.author._id.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
          user: post.author._id,
          type: "comment",
          fromUser: req.user._id,
          post: post._id,
        });
        emitNotification(req.app, notification);
      }
      res.json(post);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Edit a comment from a post
router.put("/:postId/comment/:commentId", auth, async (req, res) => {
  console.log("✏️ Edit comment route hit:", req.params);
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (text.length > 500) {
      return res
        .status(400)
        .json({ message: "Comment text must be less than 500 characters" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("❌ Post not found:", req.params.postId);
      return res
        .status(404)
        .json({ message: `Post not found for id ${req.params.postId}` });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      console.log("❌ Comment not found:", req.params.commentId);
      return res
        .status(404)
        .json({
          message: `Comment not found for id ${req.params.commentId} in post ${req.params.postId}`,
        });
    }

    // Only comment author can edit
    if (comment.user.toString() !== req.user._id.toString()) {
      console.log("❌ Not authorized to edit comment");
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
    }

    // Update comment text
    comment.text = text.trim();
    comment.updatedAt = new Date();

    await post.save();
    await post.populate("comments.user", "username displayName");
    await post.populate("author", "username displayName");
    console.log("✅ Comment edited successfully");
    res.json(post);
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a comment from a post (soft delete)
router.delete("/:postId/comment/:commentId", auth, async (req, res) => {
  console.log("🗑️ Delete comment route hit:", req.params);
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("❌ Post not found:", req.params.postId);
      return res
        .status(404)
        .json({ message: `Post not found for id ${req.params.postId}` });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      console.log("❌ Comment not found:", req.params.commentId);
      return res
        .status(404)
        .json({
          message: `Comment not found for id ${req.params.commentId} in post ${req.params.postId}`,
        });
    }
    // Only comment author or post author can delete
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      console.log("❌ Not authorized to delete comment");
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }
    // Soft delete: set deleted flag
    comment.deleted = true;
    await post.save();
    await post.populate("comments.user", "username displayName");
    await post.populate("author", "username displayName");
    console.log("✅ Comment deleted successfully");
    res.json(post);
  } catch (error) {
    console.error("Soft delete comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a post (only by author)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
