const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Community = require("../models/Community");

// @route   GET api/search
// @desc    Multi-search for users, posts, and communities
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ users: [], posts: [], communities: [] });
    }

    const searchRegex = new RegExp(q, "i");

    // Search Users
    const usersPromise = User.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex },
        { skills: { $in: [searchRegex] } }
      ]
    })
      .select("username displayName bio avatar skills")
      .limit(10);

    // Search Posts
    const postsPromise = Post.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
      .populate("author", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    // Search Communities
    const communitiesPromise = Community.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    })
      .select("name slug description icon color members postCount")
      .limit(10);

    const [users, posts, communities] = await Promise.all([
      usersPromise,
      postsPromise,
      communitiesPromise
    ]);

    res.json({ users, posts, communities });
  } catch (error) {
    console.error("Multi-search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

