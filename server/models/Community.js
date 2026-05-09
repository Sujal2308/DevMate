const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "💻",
    },
    color: {
      type: String,
      default: "#1d9bf0",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    postCount: {
      type: Number,
      default: 0,
    },
    rules: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    flairs: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Community", communitySchema);
