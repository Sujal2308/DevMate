import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Consistent user color generator
const getUserColor = (userId, username) => {
  const colors = [
    "bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500",
    "bg-red-500","bg-yellow-500","bg-teal-500","bg-orange-500","bg-cyan-500",
  ];
  const id = userId || username || "default";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Single comment thread item
const CommentThread = ({ comment, postId, onUpdate, depth = 0 }) => {
  const { user, token } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef(null);

  if (comment.deleted) return null;

  const isAuthor = comment.user?._id === user?.id;
  const maxDepth = 4;
  const indent = Math.min(depth, maxDepth);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !selectedImage) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", `@${comment.user?.username || "user"} ${replyText.trim()}`);
      formData.append("parentCommentId", comment._id); // Pass parent ID
      if (selectedImage) {
        formData.append("media", selectedImage);
        formData.append("mediaType", "image");
      }

      const res = await axios.post(
        `/api/posts/${postId}/comment`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      onUpdate(res.data);
      setReplyText("");
      removeMedia();
      setShowReply(false);
    } catch (err) {
      console.error("Reply error:", err);
      alert(err.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/posts/${postId}/comment/${comment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate(res.data);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const renderCommentText = (text) => {
    if (!text) return null;
    const mentionMatch = text.match(/^(@[a-zA-Z0-9_]+)/);
    if (mentionMatch) {
      const mention = mentionMatch[1];
      const rest = text.slice(mention.length);
      return (
        <>
          <span className="text-[#ff6347] font-bold">{mention}</span>
          {rest}
        </>
      );
    }
    return text;
  };

  return (
    <div
      className="relative"
      style={{ marginLeft: indent > 0 ? `${indent * 20}px` : 0 }}
    >
      {/* Thread connector line */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0 border-l-2 border-white/10 hover:border-purple-500/50 transition-colors"
          style={{ left: "-12px" }}
        />
      )}

      <div className="group py-4 border-b border-white/10 transition-colors">
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-1.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/30 hover:text-white/60 transition-colors text-xs"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <Link to={`/profile/${comment.user?.username || "#"}`}>
            <div
              className={`${getUserColor(comment.user?._id, comment.user?.username)} w-5 h-5 rounded-full flex items-center justify-center overflow-hidden`}
            >
              {comment.user?.avatar ? (
                <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] font-bold text-white">
                  {comment.user?.displayName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </Link>
          <Link
            to={`/profile/${comment.user?.username || "#"}`}
            className="text-xs font-bold text-white hover:text-purple-400 transition-colors"
          >
            {comment.user?.displayName || comment.user?.username || "Unknown"}
          </Link>
          <span className="text-[10px] text-white/30">•</span>
          <span className="text-[10px] text-white/30">{formatTimeAgo(comment.createdAt)}</span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <span className="text-[10px] text-white/20 italic">(edited)</span>
          )}
        </div>

        {/* Comment body */}
        {!collapsed && (
          <>
            <div className="pl-7 mb-1.5">
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                {renderCommentText(comment.text)}
              </p>
              {comment.mediaUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/5 max-w-[240px] sm:max-w-[300px]">
                  <img
                    src={comment.mediaUrl}
                    alt="comment media"
                    className="w-full max-h-[180px] object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => window.open(comment.mediaUrl, "_blank")}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pl-7 flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-[11px] font-bold text-white/30 hover:text-purple-400 transition-colors uppercase tracking-wider"
                >
                  Reply
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="text-[11px] font-bold text-white/30 hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReply && (
              <form onSubmit={handleReply} className="pl-7 mt-3">
                {/* Media Preview inside the box */}
                {imagePreview && (
                  <div className="mb-3 px-3">
                    <div className="relative inline-block group">
                      <img 
                        src={imagePreview} 
                        alt="preview" 
                        className="max-h-24 rounded border border-white/10" 
                      />
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition-colors relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user?.username || "user"}...`}
                    className="w-full bg-transparent border-none px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none min-h-[60px]"
                    rows={2}
                    maxLength={500}
                  />
                  
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white/30 hover:text-purple-400 transition-colors"
                        title="Upload Image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <span className="text-[10px] text-white/20">{replyText.length}/500</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowReply(false); setReplyText(""); removeMedia(); }}
                        className="px-3 py-1 text-[11px] font-bold text-white/40 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={(!replyText.trim() && !selectedImage) || submitting}
                        className="px-4 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-colors disabled:opacity-30"
                      >
                        {submitting ? "..." : "Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            {/* Recursive replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-0">
                {comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(reply => (
                  <CommentThread
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    onUpdate={onUpdate}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DiscussionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`/api/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load discussion");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handlePostUpdate = (updatedPost) => setPost(updatedPost);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedImage) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", newComment.trim());
      if (selectedImage) {
        formData.append("media", selectedImage);
        formData.append("mediaType", "image");
      }

      const res = await axios.post(
        `/api/posts/${id}/comment`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      setPost(res.data);
      setNewComment("");
      removeMedia();
    } catch (err) {
      console.error("Comment error:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const getSortedComments = () => {
    if (!post?.comments) return [];
    
    // Filter active comments
    const active = post.comments.filter((c) => !c.deleted);
    
    // Build a map of comments
    const commentMap = {};
    active.forEach(c => {
      commentMap[c._id] = { ...c, replies: [] };
    });

    const rootComments = [];
    active.forEach(c => {
      const commentWithReplies = commentMap[c._id];
      if (c.parentCommentId && commentMap[c.parentCommentId]) {
        commentMap[c.parentCommentId].replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort top-level comments
    if (sortBy === "oldest") {
      return rootComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Strip HTML for preview
  const getPlainText = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-48" />
          <div className="h-20 bg-white/5 rounded" />
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-white/50 mb-4">{error || "Discussion not found"}</p>
        <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-purple-300 font-bold text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const comments = getSortedComments();
  const postPreview = getPlainText(post.content);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4 pb-20 lg:pb-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Post summary card */}
      <div className="border-2 border-dashed border-white/20 rounded-xl p-4 sm:p-5 mb-6 bg-white/[0.02]">
        <div className="flex items-center gap-2.5 mb-3">
          <Link to={`/profile/${post.author?.username || "#"}`}>
            <div
              className={`${getUserColor(post.author?._id, post.author?.username)} w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-lg`}
            >
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">
                  {post.author?.displayName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </Link>
          <div>
            <Link
              to={`/profile/${post.author?.username || "#"}`}
              className="text-sm font-bold text-white hover:text-purple-400 transition-colors"
            >
              {post.author?.displayName || post.author?.username || "Unknown"}
            </Link>
            <p className="text-[10px] text-white/30">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">
          {postPreview.length > 200 ? postPreview.slice(0, 200) + "..." : postPreview}
        </p>
        <Link
          to={`/post/${post._id}`}
          className="inline-block mt-3 text-[11px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider transition-colors"
        >
          View Full Post →
        </Link>
      </div>

      {/* Discussion header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xl sm:text-2xl font-black text-white tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Discussion
          <span className="ml-2 text-base font-normal text-white/30">
            ({comments.length})
          </span>
        </h2>
        {/* Sort toggle */}
        <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              sortBy === "newest" ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setSortBy("oldest")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              sortBy === "oldest" ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            Old
          </button>
        </div>
      </div>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="w-full">
            <div className="bg-white/5 border border-white/10 focus-within:border-purple-500/50 transition-colors relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-transparent border-none px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none"
                  rows={3}
                  maxLength={500}
                />

                {/* Media Preview inside the box */}
                {imagePreview && (
                  <div className="px-4 pb-3">
                    <div className="relative inline-block group">
                      <img 
                        src={imagePreview} 
                        alt="preview" 
                        className="max-h-32 rounded border border-white/10" 
                      />
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white/30 hover:text-purple-400 transition-colors"
                      title="Upload Image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <span className="text-[10px] text-white/20">{newComment.length}/500</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={(!newComment.trim() && !selectedImage) || submitting}
                    className="px-6 py-1.5 text-[11px] font-black bg-purple-600 hover:bg-purple-500 text-white rounded-full uppercase tracking-wider transition-all disabled:opacity-30 shadow-lg"
                  >
                    {submitting ? "Posting..." : "Comment"}
                  </button>
                </div>
            </div>
          </div>
        </form>
      )}

      {/* Divider */}
      <div className="border-t border-white/5 mb-4" />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-white/30 font-medium">No discussion yet</p>
          <p className="text-xs text-white/20 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              postId={post._id}
              onUpdate={handlePostUpdate}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;
