const express = require("express");
const router = express.Router();
const Community = require("../models/Community");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// GET /api/communities — list all communities with member counts
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().sort({ name: 1 }).lean();
    // attach isMember if user is logged in
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userId = null;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {}
    }
    const result = communities.map((c) => ({
      ...c,
      memberCount: c.members.length,
      isMember: userId ? c.members.some((m) => m.toString() === userId.toString()) : false,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/communities/:slug — get community details + posts
router.get("/:slug", async (req, res) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug }).lean();
    if (!community) return res.status(404).json({ message: "Community not found" });

    const posts = await Post.find({ community: community._id })
      .populate("author", "username displayName avatar bio")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userId = null;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {}
    }

    res.json({
      ...community,
      memberCount: community.members.length,
      isMember: userId ? community.members.some((m) => m.toString() === userId.toString()) : false,
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/communities/join/:id
router.post("/join/:id", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const already = community.members.some((m) => m.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: "Already a member" });

    community.members.push(req.user._id);
    await community.save();

    res.json({ message: "Joined successfully", memberCount: community.members.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/communities/leave/:id
router.post("/leave/:id", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    community.members = community.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await community.save();

    res.json({ message: "Left community", memberCount: community.members.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
