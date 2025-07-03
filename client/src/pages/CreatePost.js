import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const CreatePost = () => {
  const [formData, setFormData] = useState({
    content: "",
    codeSnippet: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const navigate = useNavigate();

  // Language templates
  const languageTemplates = {
    javascript: `// JavaScript Example
function greetUser(name) {
  return \`Hello, \${name}! Welcome to DevMate.\`;
}

console.log(greetUser('Developer'));`,

    python: `# Python Example
def greet_user(name):
    return f"Hello, {name}! Welcome to DevMate."

print(greet_user('Developer'))`,

    java: `// Java Example
public class Greeting {
    public static String greetUser(String name) {
        return "Hello, " + name + "! Welcome to DevMate.";
    }
    
    public static void main(String[] args) {
        System.out.println(greetUser("Developer"));
    }
}`,

    cpp: `// C++ Example
#include <iostream>
#include <string>

std::string greetUser(const std::string& name) {
    return "Hello, " + name + "! Welcome to DevMate.";
}

int main() {
    std::cout << greetUser("Developer") << std::endl;
    return 0;
}`,

    react: `// React Component Example
import React from 'react';

const Greeting = ({ name }) => {
  return (
    <div className="greeting">
      <h1>Hello, {name}! Welcome to DevMate.</h1>
    </div>
  );
};

export default Greeting;`,

    html: `<!-- HTML Example -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevMate</title>
</head>
<body>
    <h1>Hello, Developer! Welcome to DevMate.</h1>
</body>
</html>`,

    css: `/* CSS Example */
.greeting {
  background: linear-gradient(45deg, #1d9bf0, #00ba7c);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  font-family: 'Arial', sans-serif;
}

.greeting h1 {
  margin: 0;
  font-size: 2rem;
}`,

    sql: `-- SQL Example
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) 
VALUES ('Developer', 'dev@devmate.com');

SELECT * FROM users WHERE name = 'Developer';`,

    json: `{
  "user": {
    "name": "Developer",
    "platform": "DevMate",
    "skills": ["JavaScript", "React", "Node.js"],
    "isActive": true,
    "joinedDate": "2024-01-01"
  },
  "message": "Hello, Developer! Welcome to DevMate."
}`,
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    if (language && languageTemplates[language]) {
      setFormData({
        ...formData,
        codeSnippet: languageTemplates[language],
      });
    } else if (language === "") {
      // If user selects "Choose Language", clear the code snippet
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
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-6 pb-20 lg:pb-8">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-x-blue via-purple-500 to-x-green bg-[length:200%_auto] bg-clip-text text-transparent animate-color-cycle mb-2 lg:mb-3">
          Create a Post
        </h1>
        <p className="text-x-gray text-sm sm:text-base lg:text-base">
          Share your thoughts, ideas, or code with the DevMate community.
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
              className="block text-sm font-medium text-x-white mb-3"
            >
              💭 What's on your mind? *
            </label>
            <textarea
              id="content"
              name="content"
              rows="8"
              required
              className="w-full p-6 bg-x-black/60 border border-x-border text-x-white placeholder-x-gray rounded-xl resize-none focus:ring-2 focus:ring-x-blue focus:border-x-blue transition-colors text-lg leading-relaxed"
              placeholder="Share your thoughts, ideas, experiences, or questions with the DevMate community...

💡 Pro tip: You can add code snippets below to enhance your post!"
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
              {/* Move select and button to one line */}
              <div className="flex flex-row items-center gap-2 w-full">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageSelect(e.target.value)}
                  className="language-dropdown appearance-none bg-gradient-to-r from-x-dark to-x-darker border border-x-border/50 text-x-white font-mono text-xs px-4 py-2 pr-8 rounded-xl hover:from-x-darker hover:to-x-black transition-all duration-200 focus:ring-2 focus:ring-x-blue focus:border-x-blue cursor-pointer shadow-lg hover:shadow-x-blue/20 backdrop-blur-sm"
                >
                  <option value="" className="bg-x-dark text-x-white font-mono">
                    🔤 Choose Language
                  </option>
                  <option
                    value="javascript"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    🟨 JavaScript
                  </option>
                  <option
                    value="python"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    🐍 Python
                  </option>
                  <option
                    value="java"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    ☕ Java
                  </option>
                  <option
                    value="cpp"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    ⚡ C++
                  </option>
                  <option
                    value="react"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    ⚛️ React
                  </option>
                  <option
                    value="html"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    🌐 HTML
                  </option>
                  <option
                    value="css"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    🎨 CSS
                  </option>
                  <option
                    value="sql"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    🗄️ SQL
                  </option>
                  <option
                    value="json"
                    className="bg-x-dark text-x-white font-mono"
                  >
                    📋 JSON
                  </option>
                </select>
                <button
                  type="button"
                  className="ml-2 flex items-center font-bold text-base bg-x-dark hover:bg-x-blue text-x-white px-4 py-2 rounded-xl transition-all duration-200 shadow"
                >
                  <span className="mr-2">💻</span>add{" "}
                  <span className="ml-1">&lt;/&gt;</span>
                </button>
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

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="btn-outline px-8 py-3 hover:scale-105 transform transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 transform transition-all duration-200"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Publishing...
                </>
              ) : (
                <>🚀 Publish Post</>
              )}
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
                  <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mr-4">
                    Y
                  </div>
                  <div>
                    <p className="font-semibold text-x-white">Your Name</p>
                    <p className="text-sm text-x-gray">@yourusername • now</p>
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
                        <pre className="whitespace-pre-wrap">
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
    </div>
  );
};

export default CreatePost;
