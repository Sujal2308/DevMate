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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const [formData, setFormData] = useState({
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
  const [showCancel, setShowCancel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [selectedFlair, setSelectedFlair] = useState(null);
  const [showFlairGrid, setShowFlairGrid] = useState(false);

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
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }
      if (error) setError("");
      setMedia(file);
      if (file.type.startsWith("image/")) {
        setMediaPreview(URL.createObjectURL(file));
      } else if (file.type === "application/pdf") {
        setMediaPreview("PDF_DOCUMENT");
      }
      setShowCancel(true);
    }
  };

  // Strip HTML tags to check if editor is truly empty
  const getPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainText = getPlainText(formData.content);
    if (!plainText.trim()) {
      setError("Post content is required");
      return;
    }
    if (selectedCommunity && !selectedFlair) {
      setError("Please select a flair for your community post");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
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

      // Navigate back to community page if came from one
      if (location.state?.communitySlug) {
        navigate(`/community/${location.state.communitySlug}`);
      } else {
        navigate("/feed");
      }
    } catch (error) {
      console.error(error);
      const apiError = error.response?.data;
      if (apiError?.errors?.length > 0) {
        setError(apiError.errors[0].msg);
      } else {
        setError(apiError?.message || "Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pt-0 pb-8 px-0 sm:px-4 min-h-screen bg-black">
      {/* Single Column Layout */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 lg:p-8 bg-transparent border border-x-border/50 mx-0 rounded-none relative"
        >
          {/* Integrated Header */}
          <div className="mb-8 border-b border-x-border/20 pb-6">
            <div className="flex items-center gap-4 mb-2">
              <h1
                className="text-4xl md:text-5xl font-black text-x-white tracking-tighter"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Create Post
              </h1>
              <img
                src="/icons/compose.png"
                alt="Compose"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                width="48"
                height="48"
                fetchpriority="high"
              />
            </div>
            <p className="text-x-gray text-base opacity-70">
              Share your code and ideas with the community.
            </p>

            {/* Community Rules Toggle (Integrated into Header) */}
            <div className="mt-4 px-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-x-gray">
                <span>Post must follow</span>
                <button
                  type="button"
                  onClick={() => setShowRules(!showRules)}
                  className="text-x-blue hover:underline decoration-2 underline-offset-4 flex items-center gap-1 transition-all"
                >
                  community guidelines
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${showRules ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {showRules && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 border border-white rounded-none bg-white shadow-2xl">
                      <div className="space-y-4">
                        {(() => {
                          const c = selectedCommunity
                            ? communities.find(
                                (c) => c._id === selectedCommunity,
                              )
                            : null;
                          const rules =
                            c?.rules && c.rules.length > 0
                              ? c.rules
                              : [
                                  {
                                    title: "Stay Professional",
                                    description:
                                      "Keep discussions constructive and code-focused.",
                                  },
                                  {
                                    title: "No Spam",
                                    description:
                                      "Strictly no low-effort promotions or redundant links.",
                                  },
                                  {
                                    title: "No Explicit Content",
                                    description:
                                      "NSFW or explicit material is strictly prohibited.",
                                  },
                                  {
                                    title: "Stay Relevant",
                                    description:
                                      "Content must be related to development or the community.",
                                  },
                                  {
                                    title: "Privacy First",
                                    description:
                                      "Never share sensitive data or private credentials.",
                                  },
                                ];
                          return rules.map((rule, idx) => (
                            <div key={idx} className="flex gap-4 group">
                              <span className="text-lg font-black text-x-blue shrink-0 min-w-[24px]">
                                {idx + 1}.
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-black text-black leading-tight">
                                  {rule.title}
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                  {rule.description}
                                </p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      {/* Acknowledge Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setShowRules(false)}
                          className="w-full py-2 bg-black text-white rounded-none font-black text-xs uppercase tracking-widest hover:bg-x-blue transition-all duration-300"
                        >
                          I Understand
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Community Selector (Moved above editor) */}
          <div className="mb-6 relative">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsCommunityModalOpen(true)}
                disabled={communities.length === 0}
                className={`flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all shadow-xl group ${communities.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2">
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
                          <span className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
                            {c.icon?.startsWith("/") ? (
                              <img
                                src={c.icon}
                                alt=""
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-sm">{c.icon}</span>
                            )}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-widest text-white">
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
                  className="w-4 h-4 text-x-gray group-hover:text-white transition-colors"
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
              }}
            />
          </div>

          {/* Flair Selection Toggle */}
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-widest text-x-gray">
                Post Category <span className="text-red-500 ml-1">*</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!selectedCommunity) {
                    setError("Please select a community first to see available flairs");
                    return;
                  }
                  setShowFlairGrid(!showFlairGrid);
                }}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-xl ${
                  showFlairGrid || selectedFlair
                    ? ""
                    : "bg-white text-black hover:bg-white/90"
                }`}
                style={
                  showFlairGrid || selectedFlair
                    ? {
                        backgroundColor: selectedFlair
                          ? selectedFlair.color
                          : "var(--x-blue)",
                        color: "#000",
                      }
                    : {}
                }
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${showFlairGrid ? "rotate-45" : ""}`}
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
                {selectedFlair ? selectedFlair.name : "Add a Flair"}
              </button>
            </div>

            {selectedCommunity && !selectedFlair && !showFlairGrid && (
              <div className="text-[10px] text-x-gray italic px-1 mb-3">
                Click "Add a Flair" to categorize your post
              </div>
            )}

            {selectedCommunity && showFlairGrid && (
              <div className="flex flex-wrap gap-2 p-5 bg-white border border-white/20 rounded-2xl shadow-2xl">
                {(() => {
                  const comm = communities.find(
                    (c) => c._id.toString() === selectedCommunity.toString(),
                  );
                  if (!comm || !comm.flairs || comm.flairs.length === 0) {
                    return (
                      <span className="text-black/40 text-xs italic">
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
                        className={`px-5 py-2.5 rounded-full text-[11px] font-black tracking-wider transition-all duration-300 border shadow-sm ${
                          isSelected ? "scale-105" : "hover:scale-105"
                        }`}
                        style={{
                          background: f.color,
                          borderColor: isSelected ? "#000" : "transparent",
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
            )}
          </div>

          {/* {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm mb-6 mt-4 mx-1">
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
                <span className="text-sm font-bold">{error}</span>
              </div>
            </div>
          )} */}

          <div className="mb-6">
            <TiptapEditor
              value={formData.content}
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                const div = document.createElement("div");
                div.innerHTML = html;
                const text = div.textContent || "";
                setShowCancel(text.trim().length > 0 || !!media);
                if (error) setError("");
              }}
              onFocus={() => {}}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-row gap-3 mb-6">
            {/* Add Media Section */}
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-x-dark/50 transition-all group h-full">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleMediaChange}
                  className="hidden"
                />
                <img
                  src="/icons/image-gallery.png"
                  alt="Upload Media"
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                  width="40"
                  height="40"
                />
                <span
                  className="text-sm font-bold tracking-tight text-center"
                  style={{
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Media
                </span>
              </label>
            </div>

            {/* Add Code Section */}
            <div className="flex-1">
              <div
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
                className="flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-x-dark/50 transition-all group h-full"
              >
                <img
                  src="/icons/code.png"
                  alt="Add Code"
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                  width="40"
                  height="40"
                />
                <span
                  className="text-sm font-bold tracking-tight text-center"
                  style={{
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {formData.codeSnippet ? "Code" : "Code"}
                </span>
              </div>
            </div>

            {/* Add Repo Section */}
            <div className="flex-1">
              <div
                onClick={() => {
                  setShowRepoInput(!showRepoInput);
                  if (showPollInput) setShowPollInput(false);
                }}
                className={`flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-x-dark/50 transition-all group h-full`}
              >
                <img
                  src="/icons/folder.png"
                  alt="Add Repo"
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                  width="40"
                  height="40"
                />
                <span
                  className="text-sm font-bold tracking-tight text-center"
                  style={{
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {formData.repoUrl ? "Repo Added" : "Repo"}
                </span>
              </div>
            </div>

            {/* Add Poll Section */}
            <div className="flex-1">
              <div
                onClick={() => {
                  setShowPollInput(!showPollInput);
                  if (showRepoInput) setShowRepoInput(false);
                }}
                className={`flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-x-dark/50 transition-all group h-full`}
              >
                <img
                  src="/icons/poll.png"
                  alt="Add Poll"
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                  width="40"
                  height="40"
                />
                <span
                  className="text-sm font-bold tracking-tight text-center"
                  style={{
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {formData.pollQuestion ? "Poll Added" : "Poll"}
                </span>
              </div>
            </div>
          </div>

          {/* Repo Input Field */}
          {showRepoInput && (
            <div className="mb-6 space-y-1.5">
              <div className="border-none rounded-none bg-[#000000]">
                <input
                  type="text"
                  name="repoTitle"
                  placeholder="Repository Title (e.g., My Portfolio Website)"
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-4 py-3 text-sm font-mono focus:outline-none transition-all"
                  value={formData.repoTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="relative border-none rounded-none bg-[#000000]">
                <input
                  type="url"
                  name="repoUrl"
                  placeholder="GitHub Repository URL"
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-4 py-3 pr-12 text-sm font-mono focus:outline-none transition-all"
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
            <div className="mb-6 space-y-4">
              <div className="border-none rounded-full bg-[#000000] overflow-hidden">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-8 py-4 text-base font-bold focus:outline-none transition-all"
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
                    className="relative border-none rounded-full bg-[#0a0a0a]/50 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-8 py-3.5 pr-14 text-sm font-medium focus:outline-none transition-all"
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
                    className="text-[11px] font-black uppercase tracking-widest text-x-blue hover:text-white transition-colors pl-8"
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
                className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transform transition-transform group-hover/preview:scale-110"
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

          <div className="flex flex-row justify-end items-center space-x-3 sm:space-x-4">
            {showCancel && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isMobile) {
                      setShowConfirm(true);
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setFormData({
                        content: "",
                        codeSnippet: "",
                        repoUrl: "",
                        repoTitle: "",
                      });
                      setMedia(null);
                      setMediaPreview(null);
                      setShowRepoInput(false);
                      setShowCancel(false);
                    }
                  }}
                  className="text-red-600 font-bold pl-4 sm:pl-8 pr-1 sm:pr-2 h-[38px] rounded-full transition-all duration-200 bg-transparent border-none hover:text-red-700 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 hover:text-red-700 transition-colors mr-1 sm:mr-4 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  onClick={() => {
                    if (isMobile) {
                      setShowConfirm(true);
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setFormData({
                        content: "",
                        codeSnippet: "",
                        repoUrl: "",
                        repoTitle: "",
                      });
                      setMedia(null);
                      setMediaPreview(null);
                      setShowRepoInput(false);
                      setShowCancel(false);
                    }
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !(() => {
                  const d = document.createElement("div");
                  d.innerHTML = formData.content;
                  return (d.textContent || "").trim();
                })()
              }
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200 min-h-[40px] sm:min-h-[44px] h-[40px] sm:h-[44px]`}
              style={{ height: isMobile ? "40px" : "44px" }}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold leading-none text-sm sm:text-base">
                      Publish
                    </span>
                    <img
                      src="/icons/arrow-up.png"
                      alt="Publish"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain -translate-y-[1px]"
                      width="20"
                      height="20"
                    />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Premium Confirmation Modal - Positioned above the button row */}
          {showConfirm && isMobile && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-28 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-x-dark border border-white/10 rounded-[2rem] p-6 shadow-2xl max-w-xs w-full text-center space-y-6 relative overflow-hidden animate-slide-up">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-50"></div>

                <div className="space-y-2">
                  <h3
                    className="text-xl font-black text-x-white tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Discard draft?
                  </h3>
                  <p className="text-x-gray text-xs leading-relaxed opacity-80 font-medium">
                    This will permanently delete your progress.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    className="w-full py-3 bg-red-600/90 hover:bg-red-600 text-white text-sm font-black rounded-xl transition-all duration-200 active:scale-95"
                    onClick={() => {
                      setFormData({
                        content: "",
                        codeSnippet: "",
                        repoUrl: "",
                        repoTitle: "",
                      });
                      setMedia(null);
                      setMediaPreview(null);
                      setShowRepoInput(false);
                      setShowCancel(false);
                      setShowConfirm(false);
                    }}
                  >
                    Discard All
                  </button>
                  <button
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-x-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 border border-white/10"
                    onClick={() => setShowConfirm(false)}
                  >
                    Keep Editing
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Enhanced Preview Section with Clear Visual Distinction */}
        <div className="space-y-6">
          {((formData.content &&
            (() => {
              const d = document.createElement("div");
              d.innerHTML = formData.content;
              return (d.textContent || "").trim();
            })()) ||
            mediaPreview) && (
            <div>
              <h3 className="text-lg font-semibold text-x-white mb-4 flex items-center">
                Live Preview
              </h3>
              <div className="card p-6 bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/30">
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
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-sm text-x-gray">now</p>
                      {selectedCommunity &&
                        (() => {
                          const comm = communities.find(
                            (c) =>
                              c._id.toString() === selectedCommunity.toString(),
                          );
                          return comm ? (
                            <>
                              <span className="text-x-gray/40 text-[10px] font-black">
                                •
                              </span>
                              <div className="flex items-center gap-2">
                                {selectedFlair && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-black"
                                    style={{
                                      backgroundColor: selectedFlair.color,
                                      border: "none",
                                    }}
                                  >
                                    {selectedFlair.name}
                                  </span>
                                )}
                                <span
                                  className="inline-flex items-center gap-1.5 text-[10px] font-black"
                                  style={{ color: comm.color || "#1d9bf0" }}
                                >
                                  <span className="w-4 h-4 flex items-center justify-center overflow-hidden shrink-0">
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
                            </>
                          ) : null;
                        })()}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
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
                    <div className="inline-flex items-center space-x-1.5 text-x-white group px-1">
                      <svg
                        className="w-4 h-4 text-x-white"
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
                    <div className="w-full mt-4 p-5 bg-black border-2 border-dashed border-white/10 rounded-none space-y-4">
                      <h4 className="text-sm font-black text-x-white tracking-tight leading-snug">
                        {formData.pollQuestion}
                      </h4>
                      <div className="space-y-2">
                        {formData.pollOptions
                          .filter((opt) => opt.trim())
                          .map((opt, idx) => (
                            <div key={idx} className="group relative">
                              <div className="w-full h-10 bg-white/5 border border-white/5 rounded-full flex items-center px-4 transition-all">
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

                <div className="flex items-center space-x-6 py-4 mt-6 border-t border-x-border/50">
                  <div className="flex items-center space-x-2 text-sm text-x-gray hover:text-red-400 transition-colors cursor-pointer">
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-x-white font-medium">0</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-x-gray hover:text-x-blue transition-colors cursor-pointer">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-x-white font-medium">0</span>
                  </div>
                  <div className="text-sm text-x-gray hover:text-x-blue transition-colors cursor-pointer">
                    View Details
                  </div>
                </div>
              </div>
            </div>
          )}

          {!(
            (() => {
              const d = document.createElement("div");
              d.innerHTML = formData.content;
              return (d.textContent || "").trim();
            })() ||
            mediaPreview ||
            formData.repoUrl
          ) && (
            <div className="card p-8 bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20 text-center">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img
                  src="/icons/share.png"
                  alt="Share"
                  className="w-16 h-16 object-contain"
                  width="64"
                  height="64"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg font-semibold text-x-white mb-2">
                Start Writing
              </h3>
              <p className="text-x-gray">
                Your post preview will appear here as you type. Share your
                thoughts with the community!
              </p>
            </div>
          )}
        </div>
      </div>

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
