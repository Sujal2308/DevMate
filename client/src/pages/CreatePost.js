import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import CommunitySelectorModal from "../components/CommunitySelectorModal";
import { useAuth } from "../contexts/AuthContext";
import PdfCarousel from "../components/PdfCarousel";
import TiptapEditor from "../components/TiptapEditor";
import "../styles/animated-gradient.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";

const CreatePost = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    codeSnippet: "",
    repoUrl: "",
    repoTitle: "",
    pollQuestion: "",
    pollOptions: ["", ""],
  });
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [selectedFlair, setSelectedFlair] = useState(null);
  const [showFlairGrid, setShowFlairGrid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedRuleIdx, setExpandedRuleIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 640 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Load communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/communities", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCommunities(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCommunities();
  }, []);

  // Pre-select community if navigated from CommunityPage
  useEffect(() => {
    if (location.state?.communityId) {
      setSelectedCommunity(location.state.communityId);
    }
  }, [location.state]);

  React.useEffect(() => {
    if (formData.codeSnippet) {
      Prism.highlightAll();
    }
  }, [formData.codeSnippet, selectedLanguage]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [showPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (error) setError("");
      setMedia(file);
      if (file.type.startsWith("image/")) {
        setMediaPreview(URL.createObjectURL(file));
      } else if (file.type === "application/pdf") {
        setMediaPreview("PDF_DOCUMENT");
      }
    }
  };

  // Strip HTML tags to check if editor is truly empty
  const getPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShowPublishModal(true);
  };

  const handleClosePublishModal = () => {
    if (loading || publishSuccess) return;
    setShowPublishModal(false);
  };

  const handleConfirmPublish = async () => {
    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("content", formData.content);
      if (formData.codeSnippet.trim()) {
        payload.append("codeSnippet", formData.codeSnippet.trim());
        payload.append("codeLanguage", selectedLanguage || "javascript");
      }
      if (media) {
        payload.append("media", media);
      }
      if (formData.repoUrl.trim()) {
        payload.append("repoUrl", formData.repoUrl.trim());
        payload.append("repoTitle", formData.repoTitle.trim());
      }
      if (selectedCommunity) {
        payload.append("community", selectedCommunity);
      }
      if (formData.pollQuestion.trim()) {
        payload.append("pollQuestion", formData.pollQuestion.trim());
        payload.append(
          "pollOptions",
          JSON.stringify(formData.pollOptions.filter((opt) => opt.trim())),
        );
      }
      if (selectedFlair) {
        payload.append("flair", JSON.stringify(selectedFlair));
      }

      await axios.post("/api/posts", payload);

      setPublishSuccess(true);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublishSuccess(false);
        // Navigate back to community page if came from one
        if (location.state?.communitySlug) {
          navigate(`/community/${location.state.communitySlug}`);
        } else {
          navigate("/feed");
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to publish post. Please try again.");
      setShowPublishModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (showPreview) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-0 pb-8 px-0 sm:px-4 min-h-screen bg-black">
        <div className="p-3 sm:p-4 lg:p-4 bg-transparent mx-0 rounded-none relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 mt-4">
             <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 rounded-full text-xs font-bold text-white transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Back to Editor</span>
            </button>
            
            <h2 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-widest text-neutral-400 font-space">
              Post Preview
            </h2>

             <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !getPlainText(formData.content).trim()}
              className="bg-transparent text-white sm:bg-white sm:text-black hover:bg-white/10 sm:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200 flex items-center justify-center w-10 h-10 sm:border-2 sm:border-neutral-700 sm:rounded-full sm:w-auto sm:h-10 sm:px-5 gap-1.5"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" compact={true} />
                  <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider text-black">
                    Publishing...
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider text-black">
                    Publish
                  </span>
                  <svg
                    className="w-6 h-6 sm:w-3.5 sm:h-3.5 rotate-45 transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Preview Card */}
          <div className="p-4 bg-x-dark border border-x-border/20 rounded-xl sm:card sm:p-6 sm:bg-gradient-to-br sm:from-x-dark/60 sm:to-x-dark/30 sm:backdrop-blur-sm sm:border sm:border-x-border/30 sm:rounded-2xl sm:shadow-2xl">
            <div className="flex items-center mb-6">
              <div
                className={`bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-lg overflow-hidden relative`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user?.displayName || "Y").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-x-white">
                  {user?.displayName || "Your Name"}
                </p>
              </div>
            </div>

            {/* Community Badge & Flair (Below Header, Above Title) */}
            {selectedCommunity &&
              (() => {
                const comm = communities.find(
                  (c) => c._id.toString() === selectedCommunity.toString(),
                );
                return comm ? (
                  <div className="flex items-center gap-2 mb-3 px-1 select-none">
                    {selectedFlair && (
                      <span
                        className="inline-flex items-center py-0.5 rounded-full text-[10px] font-black tracking-wider text-black"
                        style={{
                          backgroundColor: selectedFlair.color,
                          border: "none",
                          paddingLeft: "6px",
                          paddingRight: "6px",
                        }}
                      >
                        {selectedFlair.name}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-black transition-all duration-200"
                      style={{ color: comm.color || "#1d9bf0" }}
                    >
                      <span className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
                        {comm.icon?.startsWith("/") ? (
                          <img
                            src={comm.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          comm.icon
                        )}
                      </span>
                      <span>{comm.name}</span>
                    </span>
                  </div>
                ) : null;
              })()}

            <div className="space-y-6">
              {/* Title Preview */}
              {formData.title && (
                <div className="px-1">
                  <h2
                    className="text-xl sm:text-2xl font-black text-x-white leading-tight tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {formData.title}
                  </h2>
                </div>
              )}

              {/* Text Content Section - Minimalist */}
              {formData.content && (
                <div className="bg-transparent border-none p-0">
                  <div
                    className="rich-content text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              )}

              {/* Repository Link Preview */}
              {formData.repoUrl && (
                <div className="mb-2 px-1">
                  <a
                    href={formData.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-x-white hover:text-x-blue transition-all group py-1 px-1 whitespace-nowrap"
                  >
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <span className="text-xs font-black truncate">
                      {formData.repoTitle ||
                        formData.repoUrl.split("/").slice(-2).join("/") ||
                        "New Repository"}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-red-500 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3.5}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}

              {/* Media Preview Section */}
              {mediaPreview && (
                <div className="w-full mt-4">
                  {mediaPreview === "PDF_DOCUMENT" ? (
                    <PdfCarousel file={media} />
                  ) : (
                    <div className="bg-x-dark/20 border border-x-border/30 rounded-xl overflow-hidden">
                      <img
                        src={mediaPreview}
                        alt="Post Attachment Preview"
                        className="w-full h-auto object-contain max-h-[500px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Poll Preview Section */}
              {formData.pollQuestion && (
                <div className="w-full mt-4 p-5 bg-[#1d9bf0]/10 backdrop-blur-sm border-2 border-white rounded-xl space-y-4">
                  <h4 className="text-sm font-black text-x-white tracking-tight leading-snug">
                    {formData.pollQuestion}
                  </h4>
                  <div className="space-y-2">
                    {formData.pollOptions
                      .filter((opt) => opt.trim())
                      .map((opt, idx) => (
                        <div key={idx} className="group relative">
                          <div className="w-full h-10 bg-white/10 border border-white/10 rounded-full flex items-center px-4 transition-all">
                            <span className="text-xs font-bold text-x-gray group-hover:text-x-white transition-colors">
                              {opt}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-x-gray/50">
                      Interactive Poll Preview
                    </p>
                  </div>
                </div>
              )}

              {/* Code Section with Distinct Styling */}
              {formData.codeSnippet && (
                <div className="code-snippet">
                  <div className="flex items-center justify-between bg-x-blue px-4 py-3 border-b border-white/20">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                      </div>
                      <span className="text-xs text-white font-mono">
                        💻{" "}
                        {selectedLanguage
                          ? `${
                              selectedLanguage.charAt(0).toUpperCase() +
                              selectedLanguage.slice(1)
                            } Code`
                          : "Code Snippet"}
                      </span>
                    </div>
                    <span className="text-xs text-white font-mono uppercase tracking-wide opacity-90">
                      Code Preview
                    </span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre
                      className={`whitespace-pre-wrap font-mono text-sm leading-relaxed language-${selectedLanguage || "javascript"}`}
                    >
                      <code
                        className={`language-${selectedLanguage || "javascript"}`}
                      >
                        {formData.codeSnippet}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center py-2 sm:py-3 px-2 sm:px-4 border-t border-x-border mt-6">
              {/* Like, Share, Save wrapped in pill-shaped border */}
              <div className="flex items-center space-x-4 sm:space-x-6 bg-x-dark border border-x-border rounded-full px-3 sm:px-4 py-2 ml-[-12px] sm:ml-[-20px]">
                <button
                  type="button"
                  className="flex items-center space-x-1 sm:space-x-2 text-sm text-x-white hover:text-red-500 transition-colors"
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-x-white font-medium">0</span>
                </button>

                <button
                  type="button"
                  className="flex items-center space-x-1 sm:space-x-2 text-sm text-x-white hover:text-purple-500 transition-colors"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="flex items-center space-x-1 sm:space-x-2 text-sm text-x-white hover:text-x-green transition-colors"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Right side actions - Discussion link */}
              <div className="ml-auto mr-[-8px] sm:mr-[-16px]">
                <div className="flex items-center space-x-2 text-sm text-x-gray hover:text-purple-500 transition-colors bg-x-dark border border-x-border rounded-full px-3 sm:px-4 py-2 cursor-pointer">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="7" r="4" />
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 1a8 8 0 0 1 0 12" />
                  </svg>
                  <span className="text-x-white font-medium">
                    0<span className="hidden sm:inline"> Discussion</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-0 pb-8 px-0 sm:px-4 min-h-screen bg-black">
      {/* Single Column Layout */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 lg:p-4 bg-transparent mx-0 rounded-none relative"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm mb-6 mt-4 mx-1 animate-fade-in">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-bold tracking-tight">
                  {error}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-row items-center gap-3 mb-6 mt-4 w-full flex-nowrap overflow-visible">
            {/* Cross/Cancel Button to go back */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  const plainText = getPlainText(formData.content).trim();
                  const hasDraftContent =
                    formData.title.trim() ||
                    plainText ||
                    formData.codeSnippet.trim() ||
                    media;
                  if (hasDraftContent) {
                    setShowConfirm(true);
                  } else {
                    if (location.state?.communitySlug) {
                      navigate(`/community/${location.state.communitySlug}`);
                    } else {
                      navigate("/feed");
                    }
                  }
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-all text-white border-none shrink-0"
                title="Go Back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {showConfirm && (
                  <>
                    {/* Backdrop for blur and closing */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowConfirm(false)}
                      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                    />

                    {/* Floating Dropdown Modal below the button */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-3 z-50 w-72 p-5 bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-neutral-900 tracking-tight font-space">
                              Discard Draft?
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium leading-tight">
                              This will clear all content.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setFormData({
                                title: "",
                                content: "",
                                codeSnippet: "",
                                repoUrl: "",
                                repoTitle: "",
                                pollQuestion: "",
                                pollOptions: ["", ""],
                              });
                              setMedia(null);
                              setMediaPreview(null);
                              setShowRepoInput(false);
                              setShowPollInput(false);
                              setShowConfirm(false);
                              setSelectedFlair(null);
                            }}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md shadow-red-600/10"
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 border border-neutral-200"
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Community Selector */}
            <div className="relative min-w-0 shrink">
              <div className="flex items-center min-w-0">
                <button
                  type="button"
                  onClick={() => setIsCommunityModalOpen(true)}
                  disabled={communities.length === 0}
                  className={`flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-5 h-10 bg-white/5 border-2 border-neutral-700 rounded-full hover:bg-white/10 hover:border-white/20 transition-all shadow-md group min-w-0 max-w-full ${communities.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
                    {communities.length === 0 ? (
                      <span className="text-[11px] font-black uppercase tracking-widest text-x-gray animate-pulse">
                        Loading...
                      </span>
                    ) : selectedCommunity ? (
                      (() => {
                        const c = communities.find(
                          (c) => c._id === selectedCommunity,
                        );
                        return c ? (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center overflow-hidden shrink-0">
                              {c.icon?.startsWith("/") ? (
                                <img
                                  src={c.icon}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs">{c.icon}</span>
                              )}
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-none inline-block align-middle">
                              {c.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] font-black uppercase tracking-widest text-x-gray">
                            Select Community
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-[11px] font-black uppercase tracking-widest text-x-gray group-hover:text-white transition-colors">
                        Select Community
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-x-gray group-hover:text-white transition-colors shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M7 9l5-5 5 5M7 15l5 5 5-5"
                    />
                  </svg>
                </button>
              </div>
              <CommunitySelectorModal
                isOpen={isCommunityModalOpen}
                onClose={() => setIsCommunityModalOpen(false)}
                communities={communities}
                selectedCommunityId={selectedCommunity}
                onSelect={(id) => {
                  setSelectedCommunity(id);
                  setSelectedFlair(null);
                  setError("");
                }}
              />
            </div>

            {/* Publish Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                !getPlainText(formData.content).trim()
              }
              className="ml-auto bg-transparent text-white sm:bg-white sm:text-black hover:bg-white/10 sm:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200 shrink-0 flex items-center justify-center w-10 h-10 sm:border-2 sm:border-neutral-700 sm:rounded-full sm:w-auto sm:h-10 sm:px-5 sm:gap-1.5"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" compact={true} />
                  <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider text-black">
                    Publishing...
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider text-black">
                    Publish
                  </span>
                  <svg
                    className="w-6 h-6 sm:w-3.5 sm:h-3.5 rotate-45 transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {selectedCommunity && (
            <div className="w-full text-white/80 text-xs font-semibold mb-3 mt-1 px-1 flex flex-wrap items-center gap-1 select-none relative z-[45]">
              <svg
                className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Review & follow the </span>
              <button
                type="button"
                onClick={() => setShowRules(!showRules)}
                className="text-x-blue hover:underline cursor-pointer bg-transparent border-none p-0 text-xs font-semibold inline-block align-baseline transition-all active:scale-95"
              >
                rules
              </button>
              <span> of community</span>

              <AnimatePresence>
                {showRules && (
                  <>
                    {/* Backdrop overlay */}
                    <div
                      className="fixed inset-0 z-[80] sm:z-40 bg-black/40 sm:bg-black/10 backdrop-blur-sm sm:backdrop-blur-[1px]"
                      onClick={() => setShowRules(false)}
                    />
                    {/* Responsive Modal: Bottom sheet on mobile, Dropdown on desktop */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="fixed sm:absolute top-0 sm:top-full bottom-0 sm:bottom-auto left-0 sm:mt-2 z-[90] sm:z-50 w-full sm:w-full pt-12 pb-5 px-5 sm:p-5 bg-white border-t sm:border border-neutral-200 rounded-t-none sm:rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[450px]"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3 shrink-0">
                        <div>
                          <h4 className="text-sm font-space font-black text-neutral-900 tracking-wider">
                            {(() => {
                              const comm = communities.find(
                                (c) => c._id === selectedCommunity,
                              );
                              return comm
                                ? `${comm.name} Rules`
                                : "Platform Rules";
                            })()}
                          </h4>
                          <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mt-0.5">
                            Follow these guidelines to post
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRules(false)}
                          className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all text-xl bg-transparent border-none outline-none cursor-pointer active:scale-90"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Rules List (Scrollable) */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide py-1">
                        {(() => {
                          const comm = communities.find(
                            (c) => c._id === selectedCommunity,
                          );
                          const rulesToRender =
                            comm?.rules && comm.rules.length > 0
                              ? comm.rules
                              : [
                                  {
                                    title: "Respectful Communication",
                                    description:
                                      "Treat others with the same respect you would want. No personal attacks, harassment, or flame wars.",
                                  },
                                  {
                                    title: "Relevant Discussion",
                                    description:
                                      "Keep your posts focused on developer-related topics, technology, or programming.",
                                  },
                                  {
                                    title: "No Spam / Self-Promotion",
                                    description:
                                      "Avoid posting repetitive links, unsolicited marketing, or commercial spam.",
                                  },
                                  {
                                    title: "Clean & Professional Language",
                                    description:
                                      "Avoid excessive profanity, hate speech, and maintain a high standard of professional developer environment.",
                                  },
                                ];

                          return rulesToRender.map((rule, idx) => (
                            <div
                              key={idx}
                              onClick={isDesktop ? undefined : () => setExpandedRuleIdx(expandedRuleIdx === idx ? null : idx)}
                              className={`flex flex-col bg-[#ff6347] rounded-[1.75rem] sm:rounded-xl py-3 px-5 select-none shadow-sm border-none mb-3 ${isDesktop ? "cursor-default" : "cursor-pointer active:scale-[0.99]"}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#ff6347] text-xs font-black shrink-0 shadow-sm">
                                    {idx + 1}
                                  </div>
                                  <h5 className="text-sm font-black text-white leading-tight">
                                    {rule.title}
                                  </h5>
                                </div>
                                {!isDesktop && (
                                  <span className="text-white font-bold text-base shrink-0 mr-1">
                                    {expandedRuleIdx === idx ? "−" : "+"}
                                  </span>
                                )}
                              </div>
                              {isDesktop ? (
                                <div className="mt-2">
                                  <p className="text-xs text-white/90 leading-relaxed font-medium pl-9">
                                    {rule.description || rule.desc}
                                  </p>
                                </div>
                              ) : (
                                <AnimatePresence initial={false}>
                                  {expandedRuleIdx === idx && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                      animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <p className="text-xs text-white/90 leading-relaxed font-medium pl-9">
                                        {rule.description || rule.desc}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mb-4 relative group/title">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full bg-transparent border-b-2 border-white py-4 pr-12 text-2xl font-bold text-white placeholder-white/20 focus:border-x-blue outline-none transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              maxLength={200}
            />
            {formData.title && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, title: "" }));
                  if (error) setError("");
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95"
                title="Clear Title"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Flair Selection Toggle (Below Title) */}
          {selectedCommunity && (
            <div className="flex flex-wrap items-center gap-3 mb-6 mt-2">
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedCommunity) {
                      setError("Select community first");
                      return;
                    }
                    setShowFlairGrid(!showFlairGrid);
                  }}
                  className={`flex items-center justify-between gap-2.5 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                    selectedFlair
                      ? "px-5 border-2 border-transparent shadow-md"
                      : "px-1 bg-transparent text-x-gray group hover:text-white"
                  }`}
                  style={
                    selectedFlair
                      ? {
                          backgroundColor: selectedFlair.color,
                          color: "#000",
                        }
                      : {}
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${showFlairGrid ? "rotate-45" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {selectedFlair ? selectedFlair.name : "Category"}
                  </span>
                  {!selectedFlair && <span className="text-red-500">*</span>}
                </button>

                {selectedCommunity && showFlairGrid && (
                  <>
                    {/* Backdrop with blur and click-to-close */}
                    <div
                      className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
                      onClick={() => setShowFlairGrid(false)}
                    />
                    {/* Dropdown Modal with white background */}
                    <div className="absolute top-full left-0 w-full mt-2 z-50 flex flex-wrap gap-2 p-4 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl shadow-2xl">
                      {(() => {
                        const comm = communities.find(
                          (c) =>
                            c._id.toString() === selectedCommunity.toString(),
                        );
                        if (!comm || !comm.flairs || comm.flairs.length === 0) {
                          return (
                            <span className="text-neutral-500 text-xs italic">
                              No flairs available
                            </span>
                          );
                        }
                        return comm.flairs.map((f, idx) => {
                          const isSelected = selectedFlair?.name === f.name;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedFlair(f);
                                setShowFlairGrid(false);
                              }}
                              className={`px-4 py-2 rounded-full text-[11px] font-black tracking-wider transition-all duration-300 border shadow-sm ${
                                isSelected ? "scale-105" : "hover:scale-105"
                              }`}
                              style={{
                                background: f.color,
                                borderColor: isSelected
                                  ? "#000"
                                  : "transparent",
                                color: "#000",
                                borderWidth: isSelected ? "2px" : "1px",
                              }}
                            >
                              {f.name}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col">
            <TiptapEditor
              value={formData.content}
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                if (error) setError("");
              }}
              onFocus={() => {}}
              maxLength={2000}
            />

            <div className="hidden sm:flex items-center gap-3 mt-4 pt-4 pb-2 border-t border-neutral-800 w-full sticky bottom-0 bg-black/95 backdrop-blur-md z-[60]">
              {/* Group wrapper for the 4 action buttons */}
              <div className="flex items-center gap-2 py-1">
                {/* Add Media Section */}
                <label
                  className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 select-none active:scale-95 ${
                    media
                      ? "text-x-blue bg-x-blue/10 hover:bg-x-blue/20"
                      : "text-white hover:bg-white/5"
                  }`}
                  title="Add Media"
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </label>

                {/* Add Code Section */}
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.codeSnippet) {
                      setFormData({
                        ...formData,
                        codeSnippet: "// Start coding...",
                      });
                      setSelectedLanguage("javascript");
                    } else {
                      setFormData({ ...formData, codeSnippet: "" });
                      setSelectedLanguage("");
                    }
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                    formData.codeSnippet
                      ? "text-x-blue bg-x-blue/10 hover:bg-x-blue/20"
                      : "text-white hover:bg-white/5"
                  }`}
                  title="Add Code"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </button>

                {/* Add Repo Section */}
                <button
                  type="button"
                  onClick={() => {
                    if (showRepoInput) {
                      setShowRepoInput(false);
                      setFormData((prev) => ({
                        ...prev,
                        repoUrl: "",
                        repoTitle: "",
                      }));
                    } else {
                      setShowRepoInput(true);
                      if (showPollInput) {
                        setShowPollInput(false);
                        setFormData((prev) => ({
                          ...prev,
                          pollQuestion: "",
                          pollOptions: ["", ""],
                        }));
                      }
                    }
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                    showRepoInput
                      ? "text-x-blue bg-x-blue/10 hover:bg-x-blue/20"
                      : "text-white hover:bg-white/5"
                  }`}
                  title="Add Repository"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                {/* Add Poll Section */}
                <button
                  type="button"
                  onClick={() => {
                    if (showPollInput) {
                      setShowPollInput(false);
                      setFormData((prev) => ({
                        ...prev,
                        pollQuestion: "",
                        pollOptions: ["", ""],
                      }));
                    } else {
                      setShowPollInput(true);
                      if (showRepoInput) {
                        setShowRepoInput(false);
                        setFormData((prev) => ({
                          ...prev,
                          repoUrl: "",
                          repoTitle: "",
                        }));
                      }
                    }
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                    showPollInput
                      ? "text-x-blue bg-x-blue/10 hover:bg-x-blue/20"
                      : "text-white hover:bg-white/5"
                  }`}
                  title="Add Poll"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </button>
              </div>

              {/* See Preview Button */}
               <button
                 type="button"
                 onClick={() => setShowPreview(true)}
                 disabled={!formData.title.trim() && !getPlainText(formData.content).trim()}
                 className="ml-auto flex items-center justify-center sm:gap-1.5 w-9 h-9 sm:w-auto sm:px-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700 hover:border-neutral-600 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 font-space uppercase tracking-wider"
               >
                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                   <circle cx="12" cy="12" r="3" />
                 </svg>
                 <span className="hidden sm:inline">See Preview</span>
               </button>
            </div>
          </div>

          {/* Repo Input Field */}
          {showRepoInput && (
            <div className="mb-6 space-y-4 p-5 bg-[#d97706]/10 backdrop-blur-sm border-2 border-white rounded-2xl relative group/repo">
              <div className="border-b border-white/40 bg-transparent transition-all mb-4">
                <input
                  type="text"
                  name="repoTitle"
                  placeholder="Repository Title (e.g., My Portfolio Website)"
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-2 py-3 text-lg font-black focus:outline-none focus:ring-0 transition-none"
                  value={formData.repoTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="relative border-b border-white/40 bg-transparent transition-all">
                <input
                  type="url"
                  name="repoUrl"
                  placeholder="GitHub Repository URL"
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-2 py-3 pr-12 text-base font-mono focus:outline-none focus:ring-0 transition-none"
                  value={formData.repoUrl}
                  onChange={handleChange}
                />
                {formData.repoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, repoUrl: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-x-gray hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Poll Input Field */}
          {showPollInput && (
            <div className="mb-6 space-y-4 p-5 bg-[#1d9bf0]/10 backdrop-blur-sm border-2 border-white rounded-2xl relative group/poll">
              <div className="border-b-2 border-white bg-transparent mb-6">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-2 py-4 text-xl font-black focus:outline-none focus:ring-0 transition-none"
                  value={formData.pollQuestion}
                  onChange={(e) =>
                    setFormData({ ...formData, pollQuestion: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2.5">
                {formData.pollOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="relative border-b border-white/30 bg-transparent group/opt"
                  >
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-2 py-3 pr-14 text-sm font-bold focus:outline-none focus:ring-0 transition-none"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.pollOptions];
                        newOpts[idx] = e.target.value;
                        setFormData({ ...formData, pollOptions: newOpts });
                      }}
                    />
                    {formData.pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = formData.pollOptions.filter(
                            (_, i) => i !== idx,
                          );
                          setFormData({ ...formData, pollOptions: newOpts });
                        }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-x-gray hover:text-red-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {formData.pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pollOptions: [...formData.pollOptions, ""],
                      })
                    }
                    className="text-[11px] font-black uppercase tracking-widest text-x-blue hover:text-white transition-colors mt-2 block w-fit"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Previews and Editors - Below the triggers */}
          {mediaPreview && (
            <div className="mb-6 relative inline-block group/preview">
              {mediaPreview === "PDF_DOCUMENT" ? (
                <div className="p-4 bg-x-dark/50 border border-x-border rounded-xl flex items-center space-x-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="font-semibold text-x-white">{media.name}</p>
                    <p className="text-xs text-x-gray">
                      {(media.size / 1024 / 1024).toFixed(2)} MB - PDF Document
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-xl border border-x-border shadow-2xl"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setMedia(null);
                  setMediaPreview(null);
                }}
                className="absolute -top-3 -right-3 bg-white hover:bg-gray-200 text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transform transition-transform group-hover/preview:scale-110 border border-black/10"
              >
                ✕
              </button>
            </div>
          )}

          {(selectedLanguage || formData.codeSnippet) && (
            <div className="bg-[#1e1e1e] border border-x-border/50 rounded-xl overflow-hidden mb-8">
              <div className="flex items-center justify-between bg-x-dark/60 px-4 py-2 border-b border-x-border/30">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      if (
                        newLang === "python" &&
                        formData.codeSnippet === "// Start coding..."
                      ) {
                        setFormData({
                          ...formData,
                          codeSnippet: "print('Hello World')",
                        });
                      }
                    }}
                    className="bg-[#16181c] text-x-white text-sm border border-x-border rounded px-2 py-1 focus:outline-none focus:border-x-blue font-mono"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.codeSnippet);
                    }}
                    className="text-x-gray hover:text-x-blue transition-colors p-1"
                    title="Copy code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, codeSnippet: "" });
                      setSelectedLanguage("");
                    }}
                    className="text-x-gray hover:text-red-500 transition-colors p-1"
                    title="Clear code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#1e1e1e] min-h-[150px] max-h-[400px] overflow-y-auto overflow-x-hidden font-mono text-sm leading-relaxed border-t border-x-border/30">
                <Editor
                  value={formData.codeSnippet}
                  onValueChange={(code) =>
                    setFormData({ ...formData, codeSnippet: code || "" })
                  }
                  highlight={(code) => {
                    const lang = selectedLanguage || "javascript";
                    const grammar =
                      Prism.languages[lang] || Prism.languages.javascript;
                    return Prism.highlight(code, grammar, lang);
                  }}
                  padding={0}
                  style={{
                    fontFamily:
                      '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace',
                    fontSize: 14,
                    backgroundColor: "transparent",
                    color: "#e5e7eb",
                    outline: "none",
                    minHeight: "150px",
                  }}
                  textareaClassName="focus:outline-none border-none ring-0 focus:ring-0"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Publish Confirmation Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/35 backdrop-blur-[3px]"
              onClick={handleClosePublishModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#080808] border-2 border-white w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(29,155,240,0.1)] overflow-hidden"
            >
              {/* Glow effect at top - using blue glow for publish */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1d9bf0] to-transparent opacity-50" />

              <div className="p-6">
                {publishSuccess ? (
                  <div className="py-12 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-space">
                      Published Successfully
                    </h3>
                    <p className="text-x-gray text-sm font-medium">
                      Your post is now live and visible to the community!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 animate-fade-in">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#1d9bf0]/10 rounded-lg border border-[#1d9bf0]/20">
                          <svg className="w-5 h-5 text-[#1d9bf0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white font-space">
                          Publish Post
                        </h2>
                      </div>
                      <button 
                        onClick={handleClosePublishModal} 
                        disabled={loading}
                        className="text-x-gray hover:text-white transition-colors disabled:opacity-30"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4 mb-6 animate-fade-in">
                      <p className="text-x-white/80 text-sm font-medium leading-relaxed">
                        Are you sure you want to publish this post? It will be immediately visible to the selected community and on the feed.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={handleClosePublishModal}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-transparent border border-white/10 text-x-gray hover:text-white hover:border-white/20 transition-all font-bold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPublish}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-[#1d9bf0] text-black hover:bg-[#1a8cd8] transition-all font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1d9bf0]/20 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="small" compact={true} />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <span>Confirm</span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button (FAB) */}
      <AnimatePresence>
        {!(isMobileMenuOpen || showRules || isCommunityModalOpen || showPublishModal || showConfirm) && (
          <motion.button
            key="mobile-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="sm:hidden fixed bottom-6 left-6 z-[70] flex items-center justify-center w-14 h-14 bg-x-blue text-white rounded-full shadow-[0_4px_14px_0_rgba(29,155,240,0.39)] hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Tools Bottom Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="sm:hidden fixed bottom-0 left-0 w-full bg-[#111111] border-t border-neutral-800 rounded-t-3xl z-[90] p-6 shadow-2xl flex flex-col gap-4"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
            >
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-2" />
              
              <h3 className="text-white font-bold text-lg font-space mb-2">Add to post</h3>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                {/* Media Button */}
                <label className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${media ? "bg-x-blue/20 text-x-blue" : "bg-neutral-800 text-white group-active:scale-95 group-hover:bg-neutral-700"}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => { handleMediaChange(e); setIsMobileMenuOpen(false); }} className="hidden" />
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400">Media</span>
                </label>

                {/* Code Button */}
                <button type="button" onClick={() => {
                  if (!formData.codeSnippet) { setFormData({...formData, codeSnippet: "// Start coding..."}); setSelectedLanguage("javascript"); }
                  else { setFormData({...formData, codeSnippet: ""}); setSelectedLanguage(""); }
                  setIsMobileMenuOpen(false);
                }} className="flex flex-col items-center gap-2 group">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${formData.codeSnippet ? "bg-x-blue/20 text-x-blue" : "bg-neutral-800 text-white group-active:scale-95 group-hover:bg-neutral-700"}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400">Code</span>
                </button>

                {/* Repo Button */}
                <button type="button" onClick={() => {
                  if (showRepoInput) { setShowRepoInput(false); setFormData(prev => ({...prev, repoUrl: "", repoTitle: ""})); }
                  else { setShowRepoInput(true); if (showPollInput) { setShowPollInput(false); setFormData(prev => ({...prev, pollQuestion: "", pollOptions: ["", ""]})); } }
                  setIsMobileMenuOpen(false);
                }} className="flex flex-col items-center gap-2 group">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${showRepoInput ? "bg-x-blue/20 text-x-blue" : "bg-neutral-800 text-white group-active:scale-95 group-hover:bg-neutral-700"}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400">Repo</span>
                </button>

                {/* Poll Button */}
                <button type="button" onClick={() => {
                  if (showPollInput) { setShowPollInput(false); setFormData(prev => ({...prev, pollQuestion: "", pollOptions: ["", ""]})); }
                  else { setShowPollInput(true); if (showRepoInput) { setShowRepoInput(false); setFormData(prev => ({...prev, repoUrl: "", repoTitle: ""})); } }
                  setIsMobileMenuOpen(false);
                }} className="flex flex-col items-center gap-2 group">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${showPollInput ? "bg-x-blue/20 text-x-blue" : "bg-neutral-800 text-white group-active:scale-95 group-hover:bg-neutral-700"}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400">Poll</span>
                </button>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => { setShowPreview(true); setIsMobileMenuOpen(false); }}
                disabled={!formData.title.trim() && !getPlainText(formData.content).trim()}
                className="flex items-center justify-center gap-2 w-full h-12 bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all active:scale-95 font-space tracking-wide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                See Preview
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add keyframes for border gradient animation */}
      <style>
        {`
        @keyframes border-gradient {
          0% { border-image-source: linear-gradient(90deg, #1d9bf0, #a259f7, #00ba7c, #1d9bf0); }
          100% { border-image-source: linear-gradient(270deg, #1d9bf0, #a259f7, #00ba7c, #1d9bf0); }
        }`}
      </style>
    </div>
  );
};

export default CreatePost;
