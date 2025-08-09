import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../index.css"; // Import the CSS file for animations

// Function to generate consistent colors for users
const getUserColor = (userId, username) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-lime-500",
  ];

  // Use userId or username to generate consistent color
  const identifier = userId || username || "default";
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Three dots icon component
const ThreeDotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const CommentItem = ({ comment, postId, onUpdate, formatDate }) => {
  const { user, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuRef = React.useRef();

  const isCommentAuthor = comment.user?._id === user?.id;

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleEdit = () => {
    setEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.trim() === comment.text) {
      setEditing(false);
      setEditText(comment.text);
      return;
    }

    setSaving(true);
    const editUrl = `/api/posts/${postId}/comment/${comment._id}`;
    console.log("✏️ Attempting to edit comment at URL:", editUrl);
    try {
      const response = await axios.put(
        editUrl,
        { text: editText.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Edit response:", response.data);
      onUpdate(response.data);
      setEditing(false);
    } catch (error) {
      console.error("❌ Edit comment error:", error);
      console.error("Response data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Failed to edit comment";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditText(comment.text);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMenuOpen(false);
    const deleteUrl = `/api/posts/${postId}/comment/${comment._id}`;
    console.log("🗑️ Attempting to delete comment at URL:", deleteUrl);
    try {
      const response = await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Delete response:", response.data);
      onUpdate(response.data);
    } catch (error) {
      console.error("❌ Delete comment error:", error);
      console.error("Response data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Failed to delete comment";
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Don't render deleted comments or comments without proper user data
  if (comment.deleted || !comment.user || !comment.user._id) {
    return null;
  }

  return (
    <div className="flex space-x-3 items-start relative">
      <div
        className={`${getUserColor(
          comment.user?._id,
          comment.user?.username
        )} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg`}
      >
        {comment.user?.displayName?.charAt(0)?.toUpperCase() ||
          comment.user?.username?.charAt(0)?.toUpperCase() ||
          "?"}
      </div>

      <div className="flex-1">
        <div className="bg-x-dark/40 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <Link
              to={`/profile/${comment.user?.username || "#"}`}
              className="font-medium text-sm text-x-white hover:text-x-blue"
            >
              {comment.user?.displayName ||
                comment.user?.username ||
                "Unknown User"}
            </Link>

            {/* Three dots menu for comment author */}
            {isCommentAuthor && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 hover:bg-x-dark/60 rounded-full transition-colors"
                  disabled={deleting}
                >
                  <ThreeDotsIcon />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-x-dark border border-x-border rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-x-white hover:bg-x-dark/40 font-mono text-sm"
                      disabled={editing}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-x-dark/40 font-mono text-sm"
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 bg-x-black/50 border border-x-border text-x-white placeholder-x-gray rounded-lg resize-none focus:ring-2 focus:ring-x-blue focus:border-x-blue text-sm"
                rows="2"
                maxLength="500"
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-x-gray">
                  {editText.length}/500
                </span>
                <div className="space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-xs bg-x-dark/60 hover:bg-x-dark/80 border border-x-border text-x-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editText.trim() || saving}
                    className="px-3 py-1 text-xs bg-x-blue hover:bg-x-blue-hover text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-x-gray mt-1 font-poppins">{comment.text}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-x-gray/70">
            {formatDate(comment.createdAt)}
          </p>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <p className="text-xs text-x-gray/50">• edited</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false); // For like button animation
  const [copied, setCopied] = useState(false); // Copy feedback state

  React.useEffect(() => {
    if (user && post?.author?.followers) {
      // Check if user is following this author
    }
  }, [post?.author?.followers, user]);

  // Safety check for post data (after ALL hooks)
  if (!post || !post.author) {
    return (
      <div className="card p-4 text-center text-x-gray">Loading post...</div>
    );
  }

  const isLiked = post.likes?.some((like) => like.user === user?.id);
  const isAuthor = post.author?._id === user?.id;

  const handleLike = async () => {
    setLikeAnimating(true);
    try {
      const response = await axios.put(`/api/posts/${post._id}/like`);
      onUpdate(response.data);
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setTimeout(() => setLikeAnimating(false), 600); // animation duration
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`/api/posts/${post._id}/comment`, {
        text: newComment.trim(),
      });
      onUpdate(response.data);
      setNewComment("");
      setShowCommentForm(false);
      // Keep comments visible and reset visible count to show the new comment
      setShowComments(true);
      setVisibleCommentsCount(3);
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await axios.delete(`/api/posts/${post._id}`);
      onDelete(post._id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setVisibleCommentsCount(3); // Reset to show first 3 when opening
    }
  };

  const handleViewMoreComments = () => {
    setVisibleCommentsCount((prev) => prev + 3);
  };

  const getVisibleComments = () => {
    if (!showComments) return [];
    const nonDeletedComments = post.comments.filter((c) => !c.deleted);
    return nonDeletedComments.slice(0, visibleCommentsCount);
  };

  const hasMoreComments = () => {
    const nonDeletedComments = post.comments.filter((c) => !c.deleted);
    return nonDeletedComments.length > visibleCommentsCount;
  };

  return (
    <div className="card p-3 sm:p-4 lg:p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className={`${getUserColor(
              post.author?._id,
              post.author?.username
            )} text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 shadow-lg`}
          >
            <span className="text-sm sm:text-base font-semibold">
              {post.author?.displayName?.charAt(0)?.toUpperCase() ||
                post.author?.username?.charAt(0)?.toUpperCase() ||
                "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${post.author?.username || "#"}`}
              className="font-semibold text-x-white hover:text-x-blue transition-colors text-sm sm:text-base block truncate"
            >
              {post.author?.displayName ||
                post.author?.username ||
                "Unknown User"}
            </Link>
            <p className="text-xs sm:text-sm text-x-gray truncate mt-1">
              posted on : {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {/* Delete Icon Button for Post Author - Top Right */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteModal(true)}
              title="Delete Post"
              className="ml-2 flex items-center justify-center p-2 rounded-full hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all group"
              aria-label="Delete Post"
              disabled={isDeleting}
            >
              {/* Classic Dustbin Icon */}
              <svg
                className="w-5 h-5 text-white group-hover:text-red-500 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 6h18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 6V4.5A2.5 2.5 0 0 1 10.5 2h3A2.5 2.5 0 0 1 16 4.5V6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <rect
                  x="5"
                  y="6"
                  width="14"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <path
                  d="M10 11v5M14 11v5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* Inline Delete Confirmation Popover with Backdrop Blur */}
            {showDeleteModal && (
              <>
                {/* Blurred overlay */}
                <div
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all"
                  onClick={() => setShowDeleteModal(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-64 bg-gradient-to-br from-x-dark to-x-darker border border-red-500/30 rounded-2xl shadow-2xl p-4 animate-fade-in">
                  <h3 className="text-base font-bold text-x-white mb-1 flex items-center">
                    <svg
                      className="w-5 h-5 text-red-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Delete Post
                  </h3>
                  <p className="text-x-white mb-2 text-sm">
                    Are you sure you want to delete this post?
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-3 py-2 bg-x-dark/60 hover:bg-x-dark/80 border border-x-border text-x-white rounded-xl transition-all duration-200 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-red-500/25"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* View Button for Other Users - Top Right */}
        {!isAuthor && (
          <Link
            to={`/profile/${post.author.username}`}
            className="ml-2 flex items-center justify-center p-2 rounded-full hover:bg-x-blue/10 focus:outline-none focus:ring-2 focus:ring-x-blue transition-all group"
            title="View Profile"
            aria-label="View Profile"
            style={{ color: "#1d9bf0" }}
          >
            <svg
              className="w-5 h-5 text-x-blue group-hover:text-x-green transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4 space-y-4">
        {/* Text Content with Visual Identity */}
        <div className="bg-x-dark/15 border border-x-border/20 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg
              className="w-3.5 h-3.5 text-x-blue mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xs font-semibold text-x-blue uppercase tracking-wide">
              Post
            </span>
          </div>
          <p className="text-x-white text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Code Section with Enhanced Visual Identity */}
        {post.codeSnippet && (
          <div className="code-snippet relative bg-x-dark/80 border border-x-border/40 rounded-lg overflow-hidden">
            {/* Language label */}
            {post.codeLanguage && (
              <div className="absolute top-2 right-2 sm:right-4 bg-x-dark/80 text-x-blue text-xs font-semibold px-2 py-0.5 rounded shadow-sm z-10 select-none border border-x-blue/30">
                {post.codeLanguage}
              </div>
            )}
            <div className="flex items-center justify-between bg-x-dark/60 px-3 sm:px-4 py-2 border-b border-x-border/30">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/60"></div>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/60"></div>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/60"></div>
                </div>
                <span className="text-xs text-x-gray font-mono">💻</span>
              </div>
              {/* Copy Button */}
              <button
                onClick={(e) => {
                  if (navigator && navigator.clipboard) {
                    navigator.clipboard.writeText(post.codeSnippet);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }
                  // Remove focus ring after click
                  e.currentTarget.blur();
                }}
                title="Copy code"
                className="copy-btn p-1 rounded hover:bg-x-blue/20 focus:outline-none focus:ring-2 focus:ring-x-blue transition-all group flex items-center"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-x-gray group-hover:text-x-blue transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                  <rect
                    x="3"
                    y="3"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                </svg>
                {/* Copied message */}
                {copied && (
                  <span className="ml-2 text-xs text-x-blue font-semibold animate-fade-in-out select-none">
                    Copied!
                  </span>
                )}
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <pre className="whitespace-pre-wrap text-sm sm:text-base font-mono text-x-white overflow-x-auto leading-relaxed">
                {post.codeSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-start space-x-4 sm:space-x-6 py-2 sm:py-3 px-2 sm:px-4 border-t border-x-border">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 sm:space-x-2 text-sm ${
            isLiked ? "text-red-500" : "text-x-gray hover:text-red-500"
          } transition-colors relative`}
          style={{ outline: "none" }}
        >
          <span className="relative flex items-center justify-center">
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                likeAnimating ? "scale-125 animate-like-pop" : ""
              }`}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likeAnimating && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="block w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-400/30 animate-like-burst"></span>
              </span>
            )}
          </span>
          <span className="text-x-white font-medium">{post.likes.length}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center space-x-1 sm:space-x-2 text-sm text-x-gray hover:text-x-blue transition-colors"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-x-white font-medium hidden sm:inline">
            {showComments
              ? "Hide Comments"
              : `${post.comments.filter((c) => !c.deleted).length} Comments`}
          </span>
          <span className="text-x-white font-medium sm:hidden">
            {post.comments.filter((c) => !c.deleted).length}
          </span>
        </button>

        <Link
          to={`/post/${post._id}`}
          className="text-sm text-x-gray hover:text-x-blue transition-colors"
        >
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">Details</span>
        </Link>
      </div>

      {/* Comments Section */}
      {showComments && post.comments.filter((c) => !c.deleted).length > 0 && (
        <div className="mt-4 pt-4 border-t border-x-border">
          <div className="space-y-3">
            {getVisibleComments()
              .filter((c) => !c.deleted)
              .map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onUpdate={onUpdate}
                  formatDate={formatDate}
                />
              ))}
          </div>

          {/* View More Comments Button */}
          {hasMoreComments() && (
            <button
              onClick={handleViewMoreComments}
              className="mt-3 text-sm text-x-blue hover:text-x-blue-hover font-medium transition-colors"
            >
              View{" "}
              {Math.min(
                3,
                post.comments.filter((c) => !c.deleted).length -
                  visibleCommentsCount
              )}{" "}
              more comments
            </button>
          )}

          {/* Add Comment Button */}
          <div className="mt-3 pt-3 border-t border-x-border/30">
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="text-sm text-x-blue hover:text-x-blue-hover font-medium transition-colors"
            >
              {showCommentForm ? "Cancel" : "Add a comment"}
            </button>
          </div>
        </div>
      )}

      {/* Show "No comments yet" message when comments are visible but empty */}
      {showComments && post.comments.filter((c) => !c.deleted).length === 0 && (
        <div className="mt-4 pt-4 border-t border-x-border text-center">
          <p className="text-sm text-x-gray">
            No comments yet. Be the first to comment!
          </p>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="mt-2 text-sm text-x-blue hover:text-x-blue-hover font-medium transition-colors"
          >
            {showCommentForm ? "Cancel" : "Add a comment"}
          </button>
        </div>
      )}

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mt-4 pt-4 border-t border-x-border">
          <form onSubmit={handleComment} className="flex space-x-3 w-full">
            <div
              className={`${getUserColor(
                user?.id,
                user?.username
              )} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-lg`}
            >
              {user?.displayName?.charAt(0).toUpperCase() ||
                user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 bg-x-black/50 border border-x-border text-x-white placeholder-x-gray rounded-lg resize-none focus:ring-2 focus:ring-x-blue focus:border-x-blue min-w-0"
                rows="2"
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-x-gray">
                  {newComment.length}/500
                </span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || loading}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {loading ? "Posting..." : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;

/* Add to your index.css:
.animate-like-pop {
  animation: like-pop 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
@keyframes like-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
.animate-like-burst {
  animation: like-burst 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
@keyframes like-burst {
  0% { opacity: 0.7; transform: scale(0.5); }
  60% { opacity: 0.3; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.8); }
}
.animate-follow-pop {
  animation: follow-pop 0.35s ease-out;
}
@keyframes follow-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
*/
