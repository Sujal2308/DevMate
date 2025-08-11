const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email");

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

module.exports = router;
