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
              <form onSubmit={handleReply} className="pl-7 mt-3 w-full animate-fade-in">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="border-b border-white/20 focus-within:border-purple-500 transition-colors flex items-center gap-2 pb-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to @${comment.user?.username || "user"}...`}
                    className="flex-1 bg-transparent border-none px-0 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none min-h-[38px] max-h-[120px]"
                    rows={1}
                    maxLength={500}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply(e);
                      }
                    }}
                  />
                  
                  <div className="flex items-center gap-2 self-end pb-1.5">
                    {replyText.length > 0 && (
                      <span className="text-[10px] text-white/20 self-center mr-1">
                        {replyText.length}/500
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white/40 hover:text-purple-400 transition-colors p-1"
                      title="Upload Image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      type="submit"
                      disabled={(!replyText.trim() && !selectedImage) || submitting}
                      className="text-white hover:text-white/80 disabled:text-white/20 transition-all p-1 disabled:opacity-30"
                      title="Post Reply"
                    >
                      {submitting ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowReply(false); setReplyText(""); removeMedia(); }}
                      className="text-[11px] font-bold text-white/40 hover:text-white transition-colors self-center px-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Media Preview */}
                {imagePreview && (
                  <div className="mt-2 px-1">
                    <div className="relative inline-block group">
                      <img 
                        src={imagePreview} 
                        alt="preview" 
                        className="max-h-20 rounded border border-white/10" 
                      />
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg z-10 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
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
  const [sortBy] = useState("newest");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef(null);

  const [showRules, setShowRules] = useState(false);
  const [showFullPostContent, setShowFullPostContent] = useState(false);

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
    <div 
      className="w-full max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4 pb-20 lg:pb-8"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Discussion Lobby Label */}
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          Discussion Lobby
        </span>
      </div>

      {/* Post summary card */}
      <div className="border-2 border-white rounded-xl p-4 sm:p-5 mb-6 bg-white/[0.02]">
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
        {(() => {
          const hasAttachments = !!(post.codeSnippet || post.mediaUrl || post.repoUrl);
          const canExpand = postPreview.length > 200 || hasAttachments;

          return !showFullPostContent ? (
            <>
              <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">
                {postPreview.length > 200 ? postPreview.slice(0, 200) + "..." : postPreview}
              </p>
              {canExpand && (
                <button
                  onClick={() => setShowFullPostContent(true)}
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-x-blue hover:text-blue-400 transition-colors focus:outline-none"
                >
                  <span className="text-lg font-black leading-none">+</span> View Full Post
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Rich HTML Content */}
              <div
                className="rich-content text-sm text-white/80 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Code Snippet Attachment */}
              {post.codeSnippet && (
                <div className="bg-black border border-white/5 rounded-lg p-3 overflow-x-auto font-mono text-xs text-white/80 max-w-full">
                  <pre><code>{post.codeSnippet}</code></pre>
                </div>
              )}

              {/* GitHub Repo link */}
              {post.repoUrl && (
                <div className="mt-2">
                  <a 
                    href={post.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold"
                  >
                    <span>GitHub Repository →</span>
                  </a>
                </div>
              )}

              {/* Media Attachment */}
              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-white/5 max-h-[360px] bg-black/20 flex items-center justify-center">
                  <img src={post.mediaUrl} alt="post attachment" className="max-w-full max-h-[360px] object-contain" />
                </div>
              )}

              <button
                onClick={() => setShowFullPostContent(false)}
                className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-x-blue hover:text-blue-400 transition-colors focus:outline-none"
              >
                <span className="text-lg font-black leading-none">−</span> Show Less
              </button>
            </div>
          );
        })()}
      </div>

      {/* Discussion Rules Dropdown */}
      <div className={`mb-8 overflow-hidden rounded-[24px] border transition-all duration-500 ease-in-out ${showRules ? 'bg-red-600 border-red-500 shadow-2xl' : 'bg-white/[0.01] border-white/5'}`}>
        <button
          onClick={() => setShowRules(!showRules)}
          className={`w-full flex items-center justify-between px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${showRules ? 'text-white hover:bg-red-700' : 'text-white/40 hover:bg-white/[0.02]'}`}
        >
          <div className="flex items-center gap-2">
            <svg className={`w-3.5 h-3.5 transition-colors duration-500 ${showRules ? 'text-white' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Discussion Rules & Guidelines
          </div>
          <svg 
            className={`w-3.5 h-3.5 transition-all duration-500 text-white ${showRules ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className={`grid transition-all duration-500 ease-in-out ${showRules ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-5">
              <div className="space-y-4 pt-2 border-t border-red-500">
                {[
                  { title: "Respectful Communication", desc: "Treat others with the same respect you'd want. No personal attacks or harassment." },
                  { title: "Relevant Discussion", desc: "Keep comments focused on the post content or related technical topics." },
                  { title: "No Spam/Self-Promotion", desc: "Avoid posting links to your own products or repetitive promotional content." },
                  { title: "Clean Language", desc: "Avoid excessive profanity and maintain a professional developer environment." }
                ].map((rule, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-[13px] sm:text-base font-bold text-white leading-tight">
                      {rule.title}
                    </h4>
                    <p className="text-[11px] sm:text-[13px] text-black leading-relaxed font-medium">
                      {rule.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Discussion
          <span className="ml-2 text-base font-normal text-white/30">
            ({comments.length})
          </span>
        </h2>
      </div>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <div className="border-b border-white/20 focus-within:border-purple-500 transition-colors flex items-center gap-2 pb-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 bg-transparent border-none px-0 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none min-h-[38px] max-h-[120px]"
                rows={1}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
              />
              
              <div className="flex items-center gap-2 self-end pb-1.5">
                {newComment.length > 0 && (
                  <span className="text-[10px] text-white/20 self-center mr-1">
                    {newComment.length}/500
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white/40 hover:text-purple-400 transition-colors p-1"
                  title="Upload Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  type="submit"
                  disabled={(!newComment.trim() && !selectedImage) || submitting}
                  className="text-white hover:text-white/80 disabled:text-white/20 transition-all p-1 disabled:opacity-30"
                  title="Post Comment"
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Media Preview */}
            {imagePreview && (
              <div className="mt-3 px-1 animate-fade-in">
                <div className="relative inline-block group">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="max-h-32 rounded border border-white/10" 
                  />
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg z-10 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Divider */}
      <div className="border-t border-white/5 mb-4" />

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="py-8 text-center max-w-sm mx-auto">
          {/* Icon Container */}
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <img src="/icons/qa.png" alt="No comments yet" className="w-10 h-10 object-contain" />
          </div>
          
          <h3 className="text-sm font-bold text-white mb-1 tracking-wide">
            No comments yet
          </h3>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium max-w-[260px] mx-auto">
            Be the first to share your thoughts and start the conversation below!
          </p>
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
