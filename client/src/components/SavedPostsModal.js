import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import ShimmerEffect from "./ShimmerEffect";

const SavedPostsModal = ({ isOpen, onClose }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSavedPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/users/saved/posts");
      setSavedPosts(response.data.posts || []);
      setCollections(response.data.collections || []);
    } catch (err) {
      console.error("Fetch saved posts error:", err);
      setError("Failed to load saved posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSavedPosts();
    }
  }, [isOpen, fetchSavedPosts]);

  const handlePostUpdate = (updatedPost) => {
    setSavedPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setSavedPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim() || creating) return;
    
    setCreating(true);
    try {
      const response = await axios.post("/api/users/collections", { name: newCollectionName.trim() });
      setCollections(response.data.collections);
      setNewCollectionName("");
      setIsCreatingCollection(false);
    } catch (err) {
      console.error("Create collection error:", err);
      alert(err.response?.data?.message || "Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-x-dark to-x-darker w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-x-border/50 flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-x-border/30">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-x-white">Saved Posts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-x-gray hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Collections Tabs */}
        {!loading && !error && (
          <div className="flex overflow-x-auto p-4 border-b border-x-border/30 gap-2 custom-scrollbar no-scrollbar shrink-0">
            <button
              onClick={() => setActiveCollection("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCollection === "all"
                  ? "bg-x-blue text-white shadow-lg"
                  : "bg-x-dark/60 text-x-gray hover:text-white hover:bg-x-dark border border-x-border"
              }`}
            >
              All Posts
            </button>
            {collections.map(c => (
              <button
                key={c._id}
                onClick={() => setActiveCollection(c._id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCollection === c._id
                    ? "bg-x-blue text-white shadow-lg"
                    : "bg-x-dark/60 text-x-gray hover:text-white hover:bg-x-dark border border-x-border"
                }`}
              >
                {c.name}
              </button>
            ))}

            {isCreatingCollection ? (
              <form onSubmit={handleCreateCollection} className="flex items-center gap-2 min-w-fit pr-2 animate-fade-in">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name..."
                  className="bg-black/50 border border-x-border px-3 py-2 text-xs rounded-full focus:outline-none focus:border-x-blue text-white w-32 md:w-40"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    disabled={!newCollectionName.trim() || creating}
                    className="p-2 bg-x-blue text-white rounded-full disabled:opacity-50 hover:bg-x-blue/80 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCollection(false);
                      setNewCollectionName("");
                    }}
                    className="p-2 bg-white/10 text-x-gray hover:text-white rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingCollection(true)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all bg-x-dark/40 text-x-blue border border-x-blue/30 hover:border-x-blue/60 hover:bg-x-blue/10 flex items-center gap-1 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Collection
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
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
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-x-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-semibold text-x-white mb-2">No Saved Posts</h3>
              <p className="text-x-gray text-sm max-w-sm mx-auto">
                You haven't bookmarked any posts yet. When you see a post you want to save for later, click the bookmark icon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const postsToShow = activeCollection === "all" 
                  ? savedPosts 
                  : collections.find(c => c._id === activeCollection)?.posts || [];
                
                if (postsToShow.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-x-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-x-white mb-2">No Posts in Collection</h3>
                      <p className="text-x-gray text-sm max-w-sm mx-auto">
                        This collection doesn't have any saved posts yet.
                      </p>
                    </div>
                  );
                }
                
                return postsToShow.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={handlePostUpdate}
                    onDelete={handlePostDelete}
                  />
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPostsModal;
