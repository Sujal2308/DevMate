import React, { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import ShimmerEffect from "./ShimmerEffect";

const SavedPostsList = ({ onBack }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/users/saved/posts");
      setSavedPosts(response.data.posts || []);
    } catch (err) {
      console.error("Fetch saved posts error:", err);
      setError("Failed to load saved posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setSavedPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setSavedPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 rounded-2xl px-2 py-2 sm:px-4 sm:py-4 md:p-6 mb-24 md:mb-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-x-border/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-x-gray hover:text-white rounded-full transition-colors flex items-center justify-center bg-x-dark/40 border border-x-border"
            title="Go back"
          >
            <svg className="w-5 h-5 text-x-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="bg-x-blue/10 p-2 rounded-lg">
            <svg className="w-6 h-6 text-x-blue" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-x-white">Your Saved Posts</h2>
        </div>
      </div>

      {/* Body container */}
      <div className="w-full">
        {loading ? (
          <ShimmerEffect type="feed" />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchSavedPosts}
              className="px-4 py-2 bg-x-dark/60 hover:bg-x-dark border border-x-border text-x-white rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-8">
              <svg className="w-16 h-16 text-x-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-semibold text-x-white mb-2">No Saved Posts yet!</h3>
              <p className="text-x-gray text-sm max-w-sm mx-auto">
                You haven't bookmarked any posts yet. When you see a post you want to save for later, click the bookmark icon!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsList;
