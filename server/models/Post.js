const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
      default: "Untitled Post",
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    codeSnippet: {
      type: String,
      default: "",
    },
    codeLanguage: {
      type: String,
      default: "javascript",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "pdf", ""],
      default: "",
    },
    repoUrl: {
      type: String,
      default: "",
    },
    repoTitle: {
      type: String,
      default: "",
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    pollQuestion: {
      type: String,
      default: "",
    },
    pollOptions: [
      {
        text: String,
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          }
        ]
      }
    ],
    flair: {
      name: { type: String },
      color: { type: String },
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        mediaUrl: {
          type: String,
          default: "",
        },
        mediaType: {
          type: String,
          enum: ["image", "gif", ""],
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        deleted: {
          type: Boolean,
          default: false,
        },
        parentCommentId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
