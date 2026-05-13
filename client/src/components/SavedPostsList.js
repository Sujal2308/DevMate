import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import ShimmerEffect from "./ShimmerEffect";

const SavedPostsList = ({ onBack }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [view, setView] = useState("posts"); // "posts" or "manage"

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
    fetchSavedPosts();
  }, [fetchSavedPosts]);

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

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    if (!editName.trim() || updating) return;

    setUpdating(true);
    try {
      const response = await axios.put(`/api/users/collections/${editingId}`, { name: editName.trim() });
      setCollections(response.data.collections);
      setEditingId(null);
      setEditName("");
    } catch (err) {
      console.error("Update collection error:", err);
      alert(err.response?.data?.message || "Failed to update collection");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection? The saved posts won't be deleted, just removed from this collection.")) return;

    try {
      const response = await axios.delete(`/api/users/collections/${collectionId}`);
      setCollections(response.data.collections);
      if (activeCollection === collectionId) {
        setActiveCollection("all");
      }
    } catch (err) {
      console.error("Delete collection error:", err);
      alert(err.response?.data?.message || "Failed to delete collection");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 py-2 sm:py-4 mb-24 md:mb-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-x-border/30">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-x-white">
            <span className="hidden sm:inline">Your </span>Saved Posts
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {view === "posts" && (
            <button 
              onClick={() => setView("manage")}
              className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-0"
              title="Manage Collections"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {view === "posts" && !isCreatingCollection && (
            <button 
              onClick={() => setIsCreatingCollection(true)}
              className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all group shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-0"
              title="Create New Collection"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {view === "manage" ? (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button 
              onClick={() => setView("posts")}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-x-gray hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white tracking-tight">Manage Your Collections</h3>
          </div>

          <div className="space-y-4">
            {collections.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <p className="text-x-gray">You haven't created any custom collections yet.</p>
              </div>
            ) : (
              collections.map(c => (
                <div key={c._id} className="bg-white/5 border-2 border-dashed border-white p-4 rounded-2xl flex items-center justify-between group transition-all">
                  {editingId === c._id ? (
                    <form onSubmit={handleUpdateCollection} className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-transparent border-b border-white/30 px-2 py-1.5 text-sm focus:outline-none text-white focus:border-x-blue transition-all"
                        autoFocus
                      />
                      <button type="submit" disabled={updating} className="p-2 bg-x-blue text-white rounded-xl shadow-[0_0_10px_rgba(29,155,240,0.3)]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-white/10 text-x-gray rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(c._id);
                            setEditName(c.name);
                          }}
                          className="p-2 text-x-gray hover:text-white hover:bg-white/10 rounded-xl transition-all focus:outline-none focus:ring-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteCollection(c._id)}
                          className="p-2 text-x-gray hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all focus:outline-none focus:ring-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {isCreatingCollection && (
            <div className="mb-8 animate-fade-in">
              <form onSubmit={handleCreateCollection} className="flex items-center gap-3 p-1.5 pl-6 bg-white/5 border-2 border-dashed border-white rounded-full transition-all group/form shadow-[0_0_25px_rgba(255,255,255,0.05)] focus-within:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Name your new collection..."
                  className="flex-1 bg-transparent border-none py-2 text-sm text-white placeholder-white/30 focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-1 pr-1">
                  <button
                    type="submit"
                    disabled={!newCollectionName.trim() || creating}
                    className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCollection(false);
                      setNewCollectionName("");
                    }}
                    className="w-10 h-10 flex items-center justify-center text-x-gray hover:text-white transition-all"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Collections Tabs */}
          {!loading && !error && (
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setActiveCollection("all")}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCollection === "all"
                    ? "bg-x-blue text-white shadow-[0_0_15px_rgba(29,155,240,0.3)]"
                    : "bg-white/5 text-x-gray hover:text-white"
                }`}
              >
                All Bookmarks
              </button>
              {collections.map(c => (
                <div key={c._id} className="relative group flex-shrink-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => setActiveCollection(c._id)}
                      className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeCollection === c._id
                          ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                          : "bg-white/5 text-x-gray hover:text-white"
                      }`}
                    >
                      {c.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                <div className="p-8">
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
                        <h3 className="text-lg font-semibold text-x-white mb-2">Empty Collection</h3>
                        <p className="text-x-gray text-sm max-w-sm mx-auto">
                          You haven't added any posts to this collection yet.
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
        </>
      )}
    </div>
  );
};

export default SavedPostsList;
