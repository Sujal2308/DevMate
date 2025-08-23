const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "User with this email already exists"
              : "Username already taken",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generate JWT token
      const payload = {
        userId: user._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const payload = {
        userId: user._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      bio: req.user.bio,
      skills: req.user.skills,
      githubLink: req.user.githubLink,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user with that email." });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();
    // Send email
    const resetUrl = `${
      process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000"
    }/reset-password?token=${token}`;

    // Create beautiful HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your DevMate Password</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; }
            .logo { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
            .tagline { color: #e0e7ff; font-size: 16px; margin: 8px 0 0 0; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
            .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .reset-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
            .reset-button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
            .button-container { text-align: center; margin: 30px 0; }
            .security-info { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px; }
            .security-title { color: #92400e; font-weight: 600; margin-bottom: 8px; }
            .security-text { color: #78350f; font-size: 14px; line-height: 1.5; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 14px; line-height: 1.5; }
            .social-links { margin: 20px 0; }
            .social-link { color: #3b82f6; text-decoration: none; margin: 0 10px; }
            .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
            @media (max-width: 600px) {
                .content { padding: 30px 20px; }
                .greeting { font-size: 22px; }
                .reset-button { padding: 14px 28px; font-size: 16px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1 class="logo">DevMate</h1>
                <p class="tagline">Developer Community Platform</p>
            </div>

            <!-- Content -->
            <div class="content">
                <h2 class="greeting">Password Reset Request</h2>
                
                <p class="message">
                    Hi there! 👋<br><br>
                    We received a request to reset your DevMate account password. If you made this request, click the button below to create a new password.
                </p>

                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button" style="color: #ffffff; text-decoration: none;">
                        🔐 Reset My Password
                    </a>
                </div>

                <p class="message">
                    This reset link will expire in <strong>1 hour</strong> for your security.
                </p>

                <div class="security-info">
                    <div class="security-title">🛡️ Security Notice</div>
                    <div class="security-text">
                        If you didn't request this password reset, you can safely ignore this email. Your password will not be changed without clicking the reset button above.
                    </div>
                </div>

                <div class="divider"></div>
                
                <p class="message" style="font-size: 14px; color: #6b7280;">
                    <strong>Having trouble with the button?</strong><br>
                    Copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                    <strong>DevMate</strong> - Where Developers Connect & Grow<br>
                    Building the future of developer collaboration
                </p>
                
                <div class="social-links">
                    <a href="https://devmate.dev" class="social-link">🌐 Visit DevMate</a>
                    <a href="https://devmate.dev/explore" class="social-link">🔍 Explore</a>
                    <a href="https://devmate.dev/features" class="social-link">⭐ Features</a>
                </div>
                
                <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                    © 2025 DevMate. All rights reserved.<br>
                    This email was sent to you because you have a DevMate account.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const plainTextMessage = `
DevMate - Password Reset Request

Hi there!

We received a request to reset your DevMate account password.

Reset your password by clicking this link:
${resetUrl}

This reset link will expire in 1 hour for your security.

If you didn't request this password reset, you can safely ignore this email.

Having trouble? Copy and paste this link into your browser:
${resetUrl}

Best regards,
The DevMate Team

---
DevMate - Where Developers Connect & Grow
Visit us at: https://devmate.dev
    `.trim();

    await sendEmail({
      to: user.email,
      subject: "🔐 Reset Your DevMate Password",
      text: plainTextMessage,
      html: htmlTemplate,
    });
    res.json({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: "Password has been reset." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Keep-alive ping endpoint to prevent cold starts
router.get("/ping", auth, (req, res) => {
  res.status(200).json({
    message: "Server is alive",
    timestamp: new Date().toISOString(),
    user: req.user?.username || "anonymous",
  });
});

module.exports = router;
