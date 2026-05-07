const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    displayName: {
      type: String,
      default: function () {
        return this.username;
      },
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    githubLink: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    nationality: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    notificationPreferences: {
      newFollower: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },
    blockedUntil: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        repoLink: { type: String, default: "" },
        liveLink: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
