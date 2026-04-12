import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import PdfCarousel from "../components/PdfCarousel";
import "../styles/animated-gradient.css";

const CreatePost = () => {
  const { user } = useAuth();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const [formData, setFormData] = useState({
    content: "",
    codeSnippet: "",
    repoUrl: "",
    repoTitle: "",
  });
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRepoInput, setShowRepoInput] = useState(false);

  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError("");
    
    if (name === "content") {
      if (value.trim().length > 0) {
        setShowCancel(true);
      } else if (!media) {
        setShowCancel(false);
      }
    }
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


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError("Post content is required");
      return;
    }

    try {
      setLoading(true);
      
      const payload = new FormData();
      payload.append("content", formData.content.trim());
      if (formData.codeSnippet.trim()) {
        payload.append("codeSnippet", formData.codeSnippet.trim());
      }
      if (media) {
        payload.append("media", media);
      }
      if (formData.repoUrl.trim()) {
        payload.append("repoUrl", formData.repoUrl.trim());
        payload.append("repoTitle", formData.repoTitle.trim());
      }

      await axios.post("/api/posts", payload);

      navigate("/feed");
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
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-6 pb-20 lg:pb-8 bg-gradient-to-br from-x-dark/10 to-x-dark/5">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 lg:mb-8 ml-4 sm:ml-6">
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3"
          style={{
            fontFamily:
              '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Courier New", monospace',
          }}
        >
          <span className="text-x-white font-bold">
            Create
          </span>
          <img
            src="/icons/compose.png"
            alt="Compose"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
        </h1>
        <p className="text-x-gray text-sm sm:text-base">
          Share your code and ideas with the community.
        </p>
      </div>

      {/* Single Column Layout */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="card p-3 sm:p-4 lg:p-8 bg-gradient-to-br from-x-dark/80 to-x-dark/40 backdrop-blur-sm border border-x-border/50 mx-0 sm:mx-1 lg:mx-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm mb-6">
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
                {error}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-bold mb-3"
            >
              <span 
                className="text-xl tracking-tight" 
                style={{ 
                  color: "#A855F7",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700 
                }}
              >
                What's on your mind? *
              </span>
            </label>
            <textarea
              id="content"
              name="content"
              rows="8"
              required
              className="w-full p-6 bg-[#000000] border border-x-border text-x-white placeholder-x-gray rounded-xl resize-none focus:ring-2 focus:ring-x-blue focus:border-x-blue transition-colors text-lg leading-relaxed font-mono placeholder:font-mono"
              placeholder={
                "• Share your thoughts, ideas, experiences, or questions with the DevMate community...\n• Pro tip: You can add code snippets below to enhance your post!"
              }
              value={formData.content}
              onChange={handleChange}
              maxLength="2000"
            />
          </div>

          <div className="flex flex-row gap-3 mb-6">
            {/* Add Media Section */}
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-x-border/50 rounded-2xl cursor-pointer hover:bg-x-dark/50 hover:border-x-blue/50 transition-all group h-full">
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
                />
                <span 
                  className="text-sm font-bold tracking-tight text-center" 
                  style={{ 
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif"
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
                    setFormData({ ...formData, codeSnippet: "// Write your code here..." });
                    setSelectedLanguage("other");
                  } else {
                    setFormData({ ...formData, codeSnippet: "" });
                    setSelectedLanguage("");
                  }
                }}
                className="flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed border-x-border/50 rounded-2xl cursor-pointer hover:bg-x-dark/50 hover:border-x-blue/50 transition-all group h-full"
              >
                <img 
                  src="/icons/code.png" 
                  alt="Add Code" 
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                />
                <span 
                  className="text-sm font-bold tracking-tight text-center" 
                  style={{ 
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif"
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
                }}
                className={`flex flex-col items-center justify-center p-4 bg-[#000000] border-2 border-dashed ${showRepoInput ? 'border-x-blue/50' : 'border-x-border/50'} rounded-2xl cursor-pointer hover:bg-x-dark/50 hover:border-x-blue/50 transition-all group h-full`}
              >
                <img 
                  src="/icons/folder.png" 
                  alt="Add Repo" 
                  className="w-10 h-10 mb-2 transition-transform group-hover:scale-110"
                />
                <span 
                  className="text-sm font-bold tracking-tight text-center" 
                  style={{ 
                    color: "#A855F7",
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  {formData.repoUrl ? "Repo Added" : "Repo"}
                </span>
              </div>
            </div>
          </div>

          {/* Repo Input Field */}
          {showRepoInput && (
            <div className="mb-6 animate-fade-in space-y-1.5">
              <div className="border border-x-border/50 rounded-none bg-[#000000]">
                <input
                  type="text"
                  name="repoTitle"
                  placeholder="Repository Title (e.g., My Portfolio Website)"
                  className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-x-blue transition-all"
                  value={formData.repoTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="relative border border-x-border/50 rounded-none bg-[#000000]">
                  <input
                    type="url"
                    name="repoUrl"
                    placeholder="GitHub Repository URL"
                    className="w-full bg-transparent border-none text-x-white placeholder-x-gray px-4 py-3 pr-12 text-sm font-mono focus:ring-1 focus:ring-x-blue transition-all"
                    value={formData.repoUrl}
                    onChange={handleChange}
                  />
                  {formData.repoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, repoUrl: "" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-x-gray hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
                    <p className="text-xs text-x-gray">{(media.size / 1024 / 1024).toFixed(2)} MB - PDF Document</p>
                  </div>
                </div>
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-w-full h-auto max-h-64 rounded-xl border border-x-border shadow-2xl" />
              )}
              <button
                type="button"
                onClick={() => { setMedia(null); setMediaPreview(null); }}
                className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transform transition-transform group-hover/preview:scale-110"
              >
                ✕
              </button>
            </div>
          )}

          {(selectedLanguage || formData.codeSnippet) && (
            <div className="bg-x-black/80 border border-x-border/50 rounded-xl overflow-hidden mb-8">
                <div className="flex items-center justify-between bg-x-dark/60 px-4 py-2 border-b border-x-border/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Paste Icon */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            setFormData({ ...formData, codeSnippet: text });
                          }
                        } catch (err) {
                          console.error("Failed to read clipboard:", err);
                        }
                      }}
                      className="text-x-gray hover:text-x-blue transition-colors p-1"
                      title="Paste from clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>

                    {/* Cross Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, codeSnippet: "" });
                        setSelectedLanguage("");
                      }}
                      className="text-x-gray hover:text-red-500 transition-colors p-1"
                      title="Clear code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <textarea
                  id="codeSnippet"
                  name="codeSnippet"
                  rows="12"
                  className="w-full p-4 bg-transparent border-none text-x-white placeholder-x-gray resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
                  placeholder={
                    selectedLanguage
                      ? `// ${
                          selectedLanguage.charAt(0).toUpperCase() +
                          selectedLanguage.slice(1)
                        } template loaded! Edit as needed or write your own code...`
                      : `// Select a language from the dropdown above to get templates
// Or write your custom code here...

console.log("Welcome to DevMate!");`
                  }
                  value={formData.codeSnippet}
                  onChange={handleChange}
                  maxLength="5000"
                />
              </div>
            )}



          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 items-center">
            {showCancel && (
              <button
                type="button"
                onClick={() => {
                  if (isMobile) {
                    setShowConfirm(true);
                    setTimeout(() => {
                      const confirmBox =
                        document.getElementById("cancel-confirm-box");
                      if (confirmBox) {
                        confirmBox.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }, 100);
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setFormData({ content: "", codeSnippet: "", repoUrl: "", repoTitle: "" });
                    setMedia(null);
                    setMediaPreview(null);
                    setShowRepoInput(false);
                    setShowCancel(false);
                  }
                }}
                className="text-red-600 font-bold px-8 h-[38px] rounded-full transition-all duration-200 bg-transparent border-none hover:text-red-700"
              >
                Cancel
              </button>
            )}

            {/* Confirmation message between Cancel and Publish */}
            {showConfirm && isMobile && (
              <div
                id="cancel-confirm-box"
                className="mx-4 flex flex-col items-center"
              >
                <div className="bg-x-dark rounded-xl p-4 shadow-xl text-center mb-2">
                  <div className="mb-2 text-base text-x-white font-normal">
                    Are you sure you want to cancel your post?
                  </div>
                  <div className="mb-4 text-sm text-x-gray">
                    Your changes will be lost if you leave this page.
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full flex items-center justify-center transition-all duration-200"
                      onClick={() => {
                        setFormData({ content: "", codeSnippet: "" });
                        setMedia(null);
                        setMediaPreview(null);
                        setShowCancel(false);
                        setShowConfirm(false);
                      }}
                    >
                      Discard All
                    </button>
                    <button
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center transition-all duration-200"
                      onClick={() => setShowConfirm(false)}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200 min-h-[44px] h-[44px] ${
                isMobile ? "w-full" : ""
              }`}
              style={{ height: "44px" }}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold leading-none">Publish</span>
                    <img 
                      src="/icons/arrow-up.png" 
                      alt="Publish" 
                      className="w-5 h-5 object-contain -translate-y-[2px]"
                    />
                  </>
                )}
              </div>
            </button>
          </div>
        </form>

        {/* Enhanced Preview Section with Clear Visual Distinction */}
        <div className="space-y-6">
          {(formData.content || mediaPreview) && (
            <div>
              <h3 className="text-lg font-semibold text-x-white mb-4 flex items-center">
                Live Preview
              </h3>
              <div className="card p-6 bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/30">
                <div className="flex items-center mb-6">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    {(user?.displayName || "Y").charAt(0).toUpperCase()
                  }
                  </div>
                  <div>
                    <p className="font-semibold text-x-white">
                      {user?.displayName || "Your Name"}
                    </p>
                    <p className="text-sm text-x-gray">now</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Text Content Section with Clear Visual Identity */}
                  {formData.content && (
                    <div className="bg-x-dark/20 border border-x-border/30 rounded-xl p-5">
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-4 h-4 text-x-blue mr-2"
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
                          Post Text
                        </span>
                      </div>
                      <p className="text-x-white text-base leading-relaxed whitespace-pre-wrap">
                        {formData.content}
                      </p>
                    </div>
                  )}

                  {/* Media Preview Section */}
                  {mediaPreview && (
                    <div className="w-full mt-4">
                      {mediaPreview === "PDF_DOCUMENT" ? (
                        <PdfCarousel file={media} />
                      ) : (
                        <div className="bg-x-dark/20 border border-x-border/30 rounded-xl overflow-hidden">
                          <img src={mediaPreview} alt="Post Attachment Preview" className="w-full h-auto object-contain max-h-[500px]" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Repository Preview Section */}
                  {formData.repoUrl && (
                    <div className="mt-4 animate-fade-in group">
                      <div className="bg-[#0d0d17] border border-x-border/30 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-[#161b22] p-2 rounded-lg border border-x-border/10">
                              <svg className="w-5 h-5 text-x-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-x-white font-bold text-sm truncate">
                                {formData.repoTitle || formData.repoUrl.split('/').slice(-2).join('/') || "New Repository"}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-x-blue"></div>
                             <span className="text-[10px] text-x-gray font-bold uppercase tracking-widest opacity-60">Selected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Code Section with Distinct Styling */}
                  {formData.codeSnippet && (
                    <div className="code-snippet">
                      <div className="flex items-center justify-between bg-x-dark/60 px-4 py-3 border-b border-x-border/30">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                          </div>
                          <span className="text-xs text-x-gray font-mono">
                            💻{" "}
                            {selectedLanguage
                              ? `${
                                  selectedLanguage.charAt(0).toUpperCase() +
                                  selectedLanguage.slice(1)
                                } Code`
                              : "Code Snippet"}
                          </span>
                        </div>
                        <span className="text-xs text-x-blue font-mono uppercase tracking-wide">
                          Code Preview
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-x-white">
                          {formData.codeSnippet}
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

          {!(formData.content || mediaPreview || formData.repoUrl) && (
            <div className="card p-8 bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20 text-center">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/icons/share.png" 
                  alt="Share" 
                  className="w-16 h-16 object-contain"
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
