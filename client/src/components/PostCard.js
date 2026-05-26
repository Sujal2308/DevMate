import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ShareModal from "./ShareModal";
import ReportModal from "./ReportModal";
import PdfCarousel from "./PdfCarousel";
import ImageLightboxModal from "./ImageLightboxModal";
import SaveToCollectionModal from "./SaveToCollectionModal";
import "../index.css"; // Import the CSS file for animations

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";

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
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);



const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false); // For like button animation
  const [copied, setCopied] = useState(false); // Copy feedback state
  const [showFullCode, setShowFullCode] = useState(false); // For code expansion
  const [showShareModal, setShowShareModal] = useState(false); // For share modal
  const [isSaved, setIsSaved] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const postMenuRef = React.useRef();
  const [showFullContent, setShowFullContent] = useState(false);

  // Extract plain text length from HTML to decide if truncation is needed
  const getPlainTextLength = (html) => {
    if (!html) return 0;
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim().length;
  };
  const CONTENT_THRESHOLD = 300; // chars before "see more" kicks in
  const isLongPost = getPlainTextLength(post.content) > CONTENT_THRESHOLD;

  React.useEffect(() => {
    if (user && user.following && post?.author?._id) {
      setIsFollowing(
        user.following.includes(post.author._id) ||
        user.following.some((id) => id === post.author._id || id.toString() === post.author._id.toString())
      );
    }
  }, [user, post?.author?._id]);

  React.useEffect(() => {
    if (!postMenuOpen) return;
    const handler = (e) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target)) {
        setPostMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [postMenuOpen]);

  React.useEffect(() => {
    if (showFullCode) {
      Prism.highlightAll();
    }
  }, [showFullCode, post.codeSnippet]);

  const handleFollowToggle = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.put(`/api/users/${post.author.username}/unfollow`);
        setIsFollowing(false);
      } else {
        await axios.put(`/api/users/${post.author.username}/follow`);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      // Check if saved in main array
      const isInSavedPosts = user.savedPosts?.includes(post?._id);
      
      // Check if saved in any custom collection
      const isInCollections = user.savedCollections?.some(c => 
        c.posts?.some(id => id === post?._id || (id._id && id._id === post?._id))
      );
      
      const newSavedStatus = isInSavedPosts || isInCollections;
      
      // Trigger animation if status changed from false to true
      if (newSavedStatus && !isSaved) {
        setSaveAnimating(true);
        setTimeout(() => setSaveAnimating(false), 600);
      }
      
      setIsSaved(newSavedStatus);
    }
  }, [user, post?._id, isSaved]);

  // Safety check for post data (after ALL hooks)
  if (!post || !post.author) {
    return (
      <div className="card p-4 text-center text-x-gray">Loading post...</div>
    );
  }

  const isLiked = post.likes?.some((like) => like.user === user?.id);
  const isAuthor = post.author?._id === user?.id;

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!user) return;
    setShowSaveModal(true);
  };

  const handleSaveToggle = (savedStatus) => {
    setIsSaved(savedStatus);
  };

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





  return (
    <div className="card w-full max-w-full p-3 sm:p-4 lg:p-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className={`${getUserColor(
              post.author?._id,
              post.author?.username
            )} text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 shadow-lg overflow-hidden relative`}
          >
            {post.author?.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.displayName} 
                className="w-full h-full object-cover" 
                width="40"
                height="40"
                loading="lazy"
              />
            ) : (
              <span className="text-sm sm:text-base font-semibold">
                {post.author?.displayName?.charAt(0)?.toUpperCase() ||
                  post.author?.username?.charAt(0)?.toUpperCase() ||
                  "?"}
              </span>
            )}
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
        {/* Follow and Menu Button for Other Users - Top Right */}
        {!isAuthor && (
          <div className="flex items-center space-x-2 ml-2 relative" ref={postMenuRef}>
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium tracking-tight rounded-full transition-all duration-300 ${
                isFollowing 
                  ? "text-x-gray hover:text-red-500" 
                  : "text-x-blue hover:text-white"
              }`}
            >
              {followLoading ? (
                "..."
              ) : isFollowing ? (
                "Following"
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
                  </svg>
                  Follow
                </>
              )}
            </button>

            <button
              onClick={() => setPostMenuOpen(!postMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-800 focus:outline-none transition-all group text-white"
            >
              <ThreeDotsIcon />
            </button>

            {postMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-x-dark border border-x-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <Link
                  to={`/profile/${post.author.username}`}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    setPostMenuOpen(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-500 flex items-center transition-colors border-t border-x-border/50"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Community Badge */}
      {post.community && (
        <div className="flex items-center gap-2 mb-3 px-1">
          {post.flair && (
            <span 
              className="inline-flex items-center py-0.5 rounded-full text-[10px] font-black tracking-wider text-black"
              style={{ 
                backgroundColor: post.flair.color,
                border: 'none',
                paddingLeft: '6px',
                paddingRight: '6px'
              }}
            >
              {post.flair.name}
            </span>
          )}
          <Link
            to={`/community/${post.community.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-black transition-all duration-200 hover:opacity-80"
            style={{ color: post.community.color || "#1d9bf0" }}
          >
            <span className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
              {post.community.icon?.startsWith("/") ? (
                <img src={post.community.icon} alt="" className="w-full h-full object-contain" />
              ) : (
                post.community.icon
              )}
            </span>
            <span>{post.community.name}</span>
          </Link>
        </div>
      )}

      {/* Post Title */}
      {post.title && (
        <div className="px-1 pb-3 mb-5 border-b-2 border-white">
          <h2 
            className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {post.title}
          </h2>
        </div>
      )}

      {/* Post Content */}
      <div className="mb-4 space-y-4">
        {/* Text Content - Minimalist (no border/bg/padding) */}
        <div className="bg-transparent border-none p-0">
          <div
            className="relative"
            style={{
              maxHeight: isLongPost && !showFullContent ? "120px" : "none",
              overflow: isLongPost && !showFullContent ? "hidden" : "visible",
              transition: "max-height 0.3s ease",
            }}
          >
            <div
              className="rich-content text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {/* Fade-out gradient when collapsed */}
            {isLongPost && !showFullContent && (
              <div
                className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 100%)",
                }}
              />
            )}
          </div>

          {/* See more / See less toggle */}
          {isLongPost && (
            <button
              type="button"
              onClick={() => setShowFullContent((prev) => !prev)}
              className="mt-2 text-sm font-semibold text-x-blue hover:text-blue-400 transition-colors focus:outline-none"
            >
              {showFullContent ? "see less" : "...see more"}
            </button>
          )}
        </div>
        
        {post.repoUrl && (
          <div className="mb-2 px-1">
            <a 
              href={post.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-x-white hover:text-x-blue transition-all group py-1 px-1 whitespace-nowrap"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span className="text-xs font-black truncate">
                {post.repoTitle || post.repoUrl.split('/').slice(-2).join('/')}
              </span>
              <svg className="w-3.5 h-3.5 text-red-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Media Section */}
        {post.mediaUrl && (
          <div className="media-section w-full mt-2 mb-4">
            {post.mediaType === "pdf" ? (
              <PdfCarousel url={post.mediaUrl} />
            ) : (
              <div 
                className="bg-x-dark/20 border border-x-border/30 rounded-xl overflow-hidden cursor-pointer group relative"
                onClick={() => setLightboxOpen(true)}
              >
                <img 
                  src={post.mediaUrl} 
                  alt="Post Attachment" 
                  className="w-full h-auto object-contain max-h-[500px] transition-opacity group-hover:opacity-80" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors pointer-events-none">
                  <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && post.mediaType === "image" && (
          <ImageLightboxModal 
            imageUrl={post.mediaUrl} 
            onClose={() => setLightboxOpen(false)} 
          />
        )}

        {/* Poll Section */}
        {post.pollQuestion && (
          <div className="w-full mt-4 mb-2 p-5 bg-white/5 border-2 border-white/20 rounded-xl space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm sm:text-base font-black text-x-white tracking-tight leading-snug">
                {post.pollQuestion}
              </h4>
              <span className="shrink-0 bg-x-blue/10 text-x-blue text-[10px] font-black px-2 py-1 rounded-full border border-x-blue/20 uppercase tracking-widest">
                Poll
              </span>
            </div>
            
            <div className="space-y-3">
              {post.pollOptions?.map((option, idx) => {
                const totalVotes = post.pollOptions.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0);
                const voteCount = option.votes?.length || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const hasVoted = option.votes?.some(v => v === user?.id || (v._id && v._id === user?.id) || (v.user && v.user === user?.id));
                const userVotedInPoll = post.pollOptions.some(opt => opt.votes?.some(v => v === user?.id || (v._id && v._id === user?.id) || (v.user && v.user === user?.id)));

                return (
                  <button
                    key={idx}
                    disabled={userVotedInPoll || !user}
                    onClick={async () => {
                      try {
                        const res = await axios.put(`/api/posts/${post._id}/poll/${idx}/vote`);
                        onUpdate(res.data);
                      } catch (err) {
                        console.error("Poll vote error:", err);
                      }
                    }}
                    className="w-full group relative overflow-hidden disabled:cursor-default"
                  >
                    <div className={`w-full h-11 border rounded-full flex items-center px-5 relative z-10 overflow-hidden transition-all active:scale-[0.98] ${
                      hasVoted 
                        ? 'bg-white border-white text-black' 
                        : 'bg-black border-white/10 hover:bg-white/5 text-x-white'
                    }`}>
                      {/* Progress Bar Background */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${
                          hasVoted ? 'bg-black/10' : 'bg-white/10'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      
                      {/* Option Content */}
                      <div className="flex items-center justify-between w-full relative z-20">
                        <span className={`text-xs sm:text-sm font-bold truncate pr-4 ${hasVoted ? 'text-black' : 'text-x-white'}`}>
                          {option.text}
                          {hasVoted && (
                            <span className="ml-2 inline-flex items-center">
                              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-black font-mono tabular-nums ${hasVoted ? 'text-black' : 'text-white'}`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-x-gray/60">
                {post.pollOptions?.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0)} Total Votes
              </p>
              {post.pollOptions?.some(opt => opt.votes?.some(v => v === user?.id || (v._id && v._id === user?.id) || (v.user && v.user === user?.id))) && (
                <p className="text-[10px] font-black uppercase tracking-widest text-x-blue">
                  ✓ Voted
                </p>
              )}
            </div>
          </div>
        )}



        {post.codeSnippet && (
          <div className="code-snippet w-full max-w-full relative bg-black border border-x-border/40 rounded-none overflow-hidden transition-all duration-300 min-w-0">
            {/* Toggle Header */}
            <button
              onClick={() => setShowFullCode(!showFullCode)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-all group ${
                showFullCode ? "bg-x-blue border-b border-white/20" : "bg-[#080808] hover:bg-[#121212]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className={`flex items-center space-x-2 transition-colors ${showFullCode ? 'text-white' : 'text-x-gray group-hover:text-x-white'}`}>
                  <span className="text-sm font-mono opacity-80 decoration-x-blue underline-offset-4 decoration-2">
                    {showFullCode ? "Hide Code Snippet" : "View Code Snippet"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showFullCode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator && navigator.clipboard) {
                        navigator.clipboard.writeText(post.codeSnippet);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }
                    }}
                    className={`p-1.5 rounded-none transition-all cursor-pointer flex items-center justify-center min-w-[40px] ${showFullCode ? 'hover:bg-white/20 text-white' : 'hover:bg-x-blue/20 text-x-gray hover:text-x-blue'}`}
                    title="Copy code"
                  >
                    {copied ? (
                      <span className="text-[10px] font-bold text-x-blue uppercase animate-fade-in">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="p-1.5 transition-all">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showFullCode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M18 12H6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 6v12m6-6H6" />
                    )}
                  </svg>
                </div>
              </div>
            </button>

            {showFullCode && (
              <div className="animate-fade-in border-t border-x-border/30 w-full max-w-full overflow-hidden min-w-0">
                <div className="p-4 overflow-x-auto bg-[#0d0d17]/50 w-full max-w-full min-w-0">
                  <pre className={`text-sm sm:text-base font-mono text-x-white leading-relaxed language-${post.codeLanguage || 'javascript'}`}>
                    <code className={`language-${post.codeLanguage || 'javascript'}`}>
                      {post.codeSnippet}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posted Date at the end */}
      <div className="flex justify-end px-4 mb-2">
           <p className="text-[10px] sm:text-xs text-x-gray/60 font-medium tracking-wide">
             posted on : {(() => {
               const d = new Date(post.createdAt);
               return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
             })()}
           </p>
      </div>

      {/* Post Actions */}
      {/* Post Actions */}
      <div className="flex items-center py-2 sm:py-3 px-2 sm:px-4 border-t border-x-border">
        {/* Like, Share, Save wrapped in pill-shaped border */}
        <div className="flex items-center space-x-4 sm:space-x-6 border border-x-border rounded-full px-3 sm:px-4 py-2 ml-[-12px] sm:ml-[-20px]">
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
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-1 sm:space-x-2 text-sm text-x-gray hover:text-purple-500 transition-colors"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          <button
            onClick={handleSaveClick}
            className={`flex items-center space-x-1 sm:space-x-2 text-sm ${
              isSaved ? "text-x-green" : "text-x-gray hover:text-x-green"
            } transition-colors relative`}
            style={{ outline: "none" }}
          >
            <span className="relative flex items-center justify-center">
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                  saveAnimating ? "scale-125 animate-like-pop" : ""
                }`}
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saveAnimating && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="block w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-400/30 animate-like-burst"></span>
                </span>
              )}
            </span>
          </button>
        </div>
        {/* Right side actions - Discussion link */}
        <div className="ml-auto mr-[-8px] sm:mr-[-16px]">
          <Link
            to={`/post/${post._id}/discussion`}
            className="flex items-center space-x-2 text-sm text-x-gray hover:text-purple-500 transition-colors border border-x-border rounded-full px-3 sm:px-4 py-2"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 2z"
              />
            </svg>
            <span className="text-x-white font-medium">
              {`${post.comments.filter((c) => !c.deleted).length} Discussion`}
            </span>
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post._id}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post._id}
      />
      <SaveToCollectionModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        post={post}
        isSaved={isSaved}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
};

export default React.memo(PostCard);

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
