// Trigger Nodemon Restart
const express = require("express");
const { body, validationResult } = require("express-validator");
const Post = require("../models/Post");
const Community = require("../models/Community");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const emitNotification = require("../utils/notify");
const { sendEmail } = require("../utils/email");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// Create a new post
router.post(
  "/",
  auth,
  upload.single("media"),
  [
    body("content")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Content must be between 1 and 2000 characters"),
    body("codeSnippet")
      .optional()
      .isLength({ max: 5000 })
      .withMessage("Code snippet must be less than 5000 characters"),
    body("repoUrl")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Repository URL is too long"),
    body("repoTitle")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Repository title must be less than 100 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        content, 
        codeSnippet, 
        codeLanguage, 
        repoUrl, 
        repoTitle, 
        community,
        pollQuestion,
        pollOptions,
        flair 
      } = req.body;
      
      let mediaUrl = "";
      let mediaType = "";
      
      if (req.file) {
        mediaUrl = req.file.path;
        mediaType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
      }

      // Validate community and flair if provided
      let communityId = null;
      let selectedFlair = null;

      if (community) {
        const comm = await Community.findById(community);
        if (!comm) return res.status(400).json({ message: "Invalid community" });
        communityId = comm._id;

        // Flair is required if community is selected
        if (flair) {
          const parsedFlair = typeof flair === 'string' ? JSON.parse(flair) : flair;
          const foundFlair = comm.flairs.find(f => f.name === (parsedFlair.name || parsedFlair));
          if (!foundFlair) return res.status(400).json({ message: "Invalid flair for this community" });
          selectedFlair = { name: foundFlair.name, color: foundFlair.color };
        } else {
          return res.status(400).json({ message: "Flair is required for community posts" });
        }
      }

      const post = new Post({
        author: req.user._id,
        content,
        codeSnippet: codeSnippet || "",
        codeLanguage: codeLanguage || "javascript",
        mediaUrl,
        mediaType,
        repoUrl: repoUrl || "",
        repoTitle: repoTitle || "",
        community: communityId,
        flair: selectedFlair,
        pollQuestion: pollQuestion || "",
        pollOptions: pollOptions 
          ? (typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions)
              .filter(opt => opt.trim())
              .map(opt => ({ text: opt, votes: [] })) 
          : [],
      });

      await post.save();

      // Increment community postCount
      if (communityId) {
        await Community.findByIdAndUpdate(communityId, { $inc: { postCount: 1 } });
      }

      // Populate author info
      await post.populate("author", "username displayName avatar");
      await post.populate("community", "name slug icon color");

      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all posts (feed)
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // If viewing posts for a specific user, check privacy
    if (req.query.userId) {
      const user = await require("../models/User").findById(req.query.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let isOwner = req.user && req.user._id.toString() === user._id.toString();
      let isFollower = user.followers.some(
        (f) => f.toString() === req.user._id.toString()
      );
      if (user.isPrivate && !isOwner && !isFollower) {
        return res
          .status(403)
          .json({ message: "This user's posts are private." });
      }
      // Only fetch posts for this user
      const posts = await Post.find({ author: user._id })
        .populate("author", "username displayName avatar")
        .populate("comments.user", "username displayName avatar")
        .populate("community", "name slug icon color")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Post.countDocuments({ author: user._id });
      return res.json({
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      });
    }

    // Default: fetch all public posts
    const posts = await Post.find()
      .populate("author", "username displayName avatar")
      .populate("comments.user", "username displayName avatar")
      .populate("community", "name slug icon color")
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
      .populate("author", "username displayName avatar")
      .populate("comments.user", "username displayName avatar");

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
    await post.populate("author", "username displayName avatar");
    await post.populate("community", "name slug icon color");
    await post.populate("comments.user", "username displayName avatar");
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
      const post = await Post.findById(req.params.id).populate("author");
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
      await post.populate(
        "author",
        "username displayName email notificationPreferences avatar"
      );
      await post.populate("community", "name slug icon color");
      await post.populate("comments.user", "username displayName avatar");
      // Create notification if not self
      if (post.author._id.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
          user: post.author._id,
          type: "comment",
          fromUser: req.user._id,
          post: post._id,
        });
        emitNotification(req.app, notification);
        // Send email if enabled
        if (
          post.author.notificationPreferences?.newComment &&
          post.author.email
        ) {
          try {
            await sendEmail({
              to: post.author.email,
              subject: `New comment on your post!`,
              text: `${
                req.user.displayName || req.user.username
              } commented on your post on DevMate!`,
              html: `<p><b>${
                req.user.displayName || req.user.username
              }</b> commented on your post on DevMate!</p>`,
            });
          } catch (e) {
            console.error("Email send error (new comment):", e);
          }
        }
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
      return res.status(404).json({
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
    await post.populate("comments.user", "username displayName avatar");
    await post.populate("author", "username displayName avatar");
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
      return res.status(404).json({
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
    await post.populate("comments.user", "username displayName avatar");
    await post.populate("author", "username displayName avatar");
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

    if (post.community) {
      await Community.findByIdAndUpdate(post.community, { $inc: { postCount: -1 } });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Vote in a poll
router.put("/:id/poll/:optionIndex/vote", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.pollQuestion) return res.status(400).json({ message: "Post is not a poll" });

    const optionIndex = parseInt(req.params.optionIndex);
    if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Check if user has already voted in any option
    const userAlreadyVoted = post.pollOptions.some(option => 
      option.votes.some(v => v.toString() === req.user._id.toString())
    );

    if (userAlreadyVoted) {
      return res.status(400).json({ message: "User has already voted in this poll" });
    }

    // Add vote
    post.pollOptions[optionIndex].votes.push(req.user._id);
    await post.save();

    await post.populate("author", "username displayName avatar");
    await post.populate("community", "name slug icon color");
    await post.populate("comments.user", "username displayName avatar");
    res.json(post);
  } catch (error) {
    console.error("Poll vote error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
