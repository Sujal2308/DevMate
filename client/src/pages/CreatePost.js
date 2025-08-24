import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

const CreatePost = () => {
  const { user } = useAuth();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const [formData, setFormData] = useState({
    content: "",
    codeSnippet: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const languageOptions = [
    { value: "javascript", label: "🟨 JavaScript", color: "#f7df1e" },
    { value: "python", label: "🐍 Python", color: "#4B8BBE" },
    { value: "java", label: "☕ Java", color: "#b07219" },
    { value: "cpp", label: "⚡ C++", color: "#00599C" },
    { value: "react", label: "⚛️ React", color: "#61dafb" },
    { value: "html", label: "🌐 HTML", color: "#e34c26" },
    { value: "css", label: "🎨 CSS", color: "#563d7c" },
    { value: "sql", label: "🗄️ SQL", color: "#336791" },
    { value: "json", label: "📋 JSON", color: "#f4a460" },
    { value: "other", label: "Other", color: "#C0C0C0" }, // Final option
  ];

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (error) setError("");
    if (e.target.name === "content") {
      if (value.trim().length > 0) {
        setShowCancel(true);
      } else {
        setShowCancel(false);
      }
    }
  };

  const handleLanguageSelect = (option) => {
    const language = option ? option.value : "";
    setSelectedLanguage(language);

    // Add language comment when a language is selected
    if (language) {
      const languageComments = {
        javascript: "// JavaScript",
        python: "# Python",
        java: "// Java",
        cpp: "// C++",
        react: "// React",
        html: "<!-- HTML -->",
        css: "/* CSS */",
        sql: "-- SQL",
        json: "// JSON",
        other: "// mention your language",
      };

      const comment = languageComments[language] || `// ${language}`;
      setFormData({
        ...formData,
        codeSnippet: comment,
      });
    } else {
      // Clear code snippet if no language selected
      setFormData({
        ...formData,
        codeSnippet: "",
      });
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
      await axios.post("/api/posts", {
        content: formData.content.trim(),
        codeSnippet: formData.codeSnippet.trim(),
      });

      navigate("/feed");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create post");
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
          <span className="bg-gradient-to-r from-[#C0C0C0] via-[#E0E0E0] to-[#A9A9A9] bg-clip-text text-transparent">
            Create
          </span>
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-x-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
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
              className="block text-sm font-bold text-x-white mb-3"
            >
              What's on your mind? *
            </label>
            <textarea
              id="content"
              name="content"
              rows="8"
              required
              className="w-full p-6 bg-x-black/60 border border-x-border text-x-white placeholder-x-gray rounded-xl resize-none focus:ring-2 focus:ring-x-blue focus:border-x-blue transition-colors text-lg leading-relaxed font-mono placeholder:font-mono"
              placeholder={
                "• Share your thoughts, ideas, experiences, or questions with the DevMate community...\n• Pro tip: You can add code snippets below to enhance your post!"
              }
              value={formData.content}
              onChange={handleChange}
              maxLength="2000"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-x-gray font-mono">
                📝 {formData.content.length}/2000 characters
              </span>
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    formData.content.length > 1800
                      ? "bg-red-500"
                      : formData.content.length > 1600
                      ? "bg-yellow-500"
                      : "bg-x-blue"
                  }`}
                ></div>
                <span className="text-xs text-x-gray font-mono">
                  {formData.content.length > 1800
                    ? "Almost full"
                    : formData.content.length > 1600
                    ? "Getting long"
                    : "Good"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8 border-t border-x-border/30 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              {/* Custom react-select dropdown */}
              <div className="flex flex-row items-center gap-2 w-full">
                <Select
                  className="w-full text-xs font-mono"
                  classNamePrefix="react-select"
                  options={languageOptions}
                  value={languageOptions.find(
                    (opt) => opt.value === selectedLanguage
                  )}
                  onChange={handleLanguageSelect}
                  isClearable
                  isSearchable={false}
                  placeholder="✨ Choose Language"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      background:
                        "linear-gradient(90deg, #181c24 60%, #23272f 100%)",
                      borderImage:
                        "linear-gradient(90deg, #1d9bf0, #a259f7, #00ba7c, #1d9bf0) 1",
                      borderImageSlice: 1,
                      borderWidth: "2px 2px 3px 2px", // Thicker bottom border
                      borderStyle: "solid",
                      borderColor: "transparent",
                      borderBottomColor: "#1d9bf0", // Fallback for bottom border
                      boxShadow: "none",
                      outline: "none",
                      borderRadius: 12,
                      minHeight: 38,
                      height: 38, // Prevent expansion
                      maxHeight: 38, // Prevent expansion
                      paddingTop: 0,
                      paddingBottom: 0,
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      color: "#fff",
                      zIndex: 100,
                      animation: "border-gradient 3s linear infinite",
                      transition: "border-image 0.5s",
                    }),
                    menu: (base) => ({
                      ...base,
                      background: "#23272f",
                      color: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                      fontSize: 13,
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isSelected
                        ? "#1d9bf0"
                        : state.isFocused
                        ? "#23272f"
                        : "transparent",
                      color: state.isSelected ? "#fff" : "#fff",
                      fontWeight: state.isSelected ? 700 : 500,
                      fontFamily: "monospace",
                      cursor: "pointer",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#fff",
                      fontFamily: "monospace",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#888",
                      fontFamily: "monospace",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 12,
                    colors: {
                      ...theme.colors,
                      primary: "#1d9bf0",
                      primary25: "#23272f",
                      neutral0: "#23272f",
                      neutral80: "#fff",
                    },
                  })}
                />
              </div>
            </div>

            {(selectedLanguage || formData.codeSnippet) && (
              <div className="bg-x-black/80 border border-x-border/50 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-x-dark/60 px-4 py-2 border-b border-x-border/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                    </div>
                    <span className="text-xs text-x-gray font-mono">
                      {selectedLanguage
                        ? `💾 ${
                            selectedLanguage.charAt(0).toUpperCase() +
                            selectedLanguage.slice(1)
                          } Code`
                        : "💾 Code Snippet"}
                    </span>
                  </div>
                  <span className="text-xs text-x-gray font-mono">
                    📊 {formData.codeSnippet.length}/5000
                  </span>
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

            {formData.codeSnippet && (
              <div className="mt-3 text-xs text-x-blue font-mono">
                💡 Tip:{" "}
                {selectedLanguage
                  ? `${
                      selectedLanguage.charAt(0).toUpperCase() +
                      selectedLanguage.slice(1)
                    } template loaded! You can edit it or choose a different language.`
                  : "Choose a language from the dropdown to get syntax templates, or add context to help others understand your code better."}
              </div>
            )}
          </div>

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
                    setFormData({ content: "", codeSnippet: "" });
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
              className={`bg-black hover:bg-gray-900 text-white font-bold px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200 min-h-[44px] h-[44px] ${
                isMobile ? "w-full" : ""
              }`}
              style={{ lineHeight: "1.5", height: "44px" }}
            >
              <span className="flex items-center justify-center w-full h-full">
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Publishing...</span>
                  </>
                ) : (
                  <>
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span className="ml-2">Publish</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Enhanced Preview Section with Clear Visual Distinction */}
        <div className="space-y-6">
          {formData.content && (
            <div>
              <h3 className="text-lg font-semibold text-x-white mb-4 flex items-center">
                👀 Live Preview
              </h3>
              <div className="card p-6 bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/30">
                <div className="flex items-center mb-6">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    {(user?.displayName || "Y").charAt(0).toUpperCase()}
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

          {!formData.content && (
            <div className="card p-8 bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20 text-center">
              <div className="bg-x-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-x-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
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
