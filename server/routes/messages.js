const express = require("express");
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");
const { notifyNewMessage } = require("../utils/email");

const router = express.Router();

// Send a new message
router.post("/", auth, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Recipient and text are required" });
    }
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
    });
    // Send email notification if enabled
    await notifyNewMessage({
      recipientUser,
      senderUser: req.user,
      messageText: text.trim(),
    });
    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get messages between current user and another user
router.get("/:otherUserId", auth, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
