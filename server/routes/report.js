const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email");

const Report = require("../models/Report");
const auth = require("../middleware/auth");

// POST /api/report-bug
router.post("/report-bug", async (req, res) => {
  const { bug } = req.body;
  if (!bug || typeof bug !== "string" || bug.length < 5) {
    return res
      .status(400)
      .json({ message: "Please provide a valid bug description." });
  }
  try {
    await sendEmail({
      to: "sujalbhugul08@gmail.com",
      subject: "New Bug Report from DevMate",
      text: bug,
      html: `<pre style='font-family:monospace;font-size:1rem;color:#333;'>${bug}</pre>`,
    });
    res.json({ message: "Bug report sent successfully." });
  } catch (err) {
    console.error("Bug report email error:", err);
    res.status(500).json({ message: "Failed to send bug report." });
  }
});

// POST /api/report
// @desc    Report a post or user
// @access  Private
router.post("/report", auth, async (req, res) => {
  const { targetId, targetType, reason } = req.body;

  if (!targetId || !targetType || !reason) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const targetModel = targetType === "post" ? "Post" : "User";
    
    const newReport = new Report({
      reporter: req.user.id,
      targetId,
      targetType,
      targetModel,
      reason
    });

    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully. Our team will review it." });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Server error submitting report." });
  }
});

module.exports = router;
