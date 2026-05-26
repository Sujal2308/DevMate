import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const SaveToCollectionModal = ({ isOpen, onClose, post, isSaved, onSaveToggle }) => {
  const { user, updateUser } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users/saved/posts");
      setCollections(response.data.collections || []);
    } catch (err) {
      console.error("Fetch collections error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen, fetchCollections]);



  const handleToggleSave = async (collectionId = null) => {
    setSavingId(collectionId === null ? "all" : collectionId);
    try {
      const payload = collectionId ? { collectionId } : {};
      const response = await axios.put(`/api/users/save/${post._id}`, payload);
      
      // Update the global user state to keep everything in sync
      if (user) {
        updateUser({
          ...user,
          savedPosts: response.data.savedPosts,
          savedCollections: response.data.savedCollections
        });
      }

      // Check if post is saved in All Posts
      const isSavedInAll = response.data.savedPosts.includes(post._id);
      
      // Check if post is saved in any custom collection
      const isSavedInAnyCollection = response.data.savedCollections.some(c => 
        c.posts.some(id => id === post._id || (id._id && id._id === post._id))
      );

      // Notify parent that post is "saved" if it's in All Posts OR any custom collection
      onSaveToggle(isSavedInAll || isSavedInAnyCollection);

      // Update local collections state
      setCollections(response.data.savedCollections);
    } catch (err) {
      console.error("Toggle save error:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateCollection = async (e) => {
    if (e) e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const response = await axios.post("/api/users/collections", { 
        name: newCollectionName.trim() 
      });
      
      const updatedCollections = response.data.collections;
      setCollections(updatedCollections);
      
      // Update user context
      if (user) {
        updateUser({
          ...user,
          savedCollections: updatedCollections
        });
      }

      // Automatically save to the new collection
      const newColl = updatedCollections.find(c => c.name.toLowerCase() === newCollectionName.trim().toLowerCase());
      if (newColl) {
        handleToggleSave(newColl._id);
      }

      setNewCollectionName("");
      setShowCreateInput(false);
    } catch (err) {
      console.error("Create collection error:", err);
      setError(err.response?.data?.message || "Failed to create collection");
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
      <div 
        className="relative bg-[#080808] w-full max-w-sm rounded-2xl shadow-2xl border-2 border-white flex flex-col overflow-hidden animate-fade-in"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-wide">Save to Collection</h2>
          <div className="flex items-center gap-2">
            {!showCreateInput && (
              <button
                onClick={() => setShowCreateInput(true)}
                className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                title="New Collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collections List */}
        <div className="p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-2 border-x-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Default "All Posts" option */}
              {(() => {
                const isInGlobalSaved = user?.savedPosts?.some(id => 
                  id === post._id || (id._id && id._id === post._id) || (id.toString() === post._id.toString())
                );
                
                return (
                  <button
                    onClick={() => handleToggleSave(null)}
                    disabled={savingId === "all"}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${isInGlobalSaved ? 'bg-x-blue/10 border-x-blue/30' : 'bg-white/5 border-white/5'} transition-all group-hover:scale-105`}>
                        <svg className={`w-5 h-5 ${isInGlobalSaved ? 'text-x-blue' : 'text-x-gray'}`} fill={isInGlobalSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-x-blue transition-colors">All Posts</p>
                        <p className="text-[10px] text-x-gray font-medium">Global bookmarks</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                      isInGlobalSaved 
                        ? 'bg-x-blue border-x-blue shadow-[0_0_10px_rgba(29,155,240,0.3)]' 
                        : 'bg-transparent border-white/20'
                    }`}>
                      {isInGlobalSaved && (
                        <svg className="w-3 h-3 text-white animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })()}

              {/* Custom Collections */}
              {collections.map(collection => {
                const isPostInCollection = collection.posts.some(id => 
                  id === post._id || (id._id && id._id === post._id) || (id.toString() === post._id.toString())
                );
                
                return (
                  <button
                    key={collection._id}
                    onClick={() => handleToggleSave(collection._id)}
                    disabled={savingId === collection._id}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${isPostInCollection ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'} transition-all group-hover:scale-105`}>
                        <svg className={`w-5 h-5 ${isPostInCollection ? 'text-emerald-400' : 'text-x-gray'}`} fill={isPostInCollection ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-x-blue transition-colors">{collection.name}</p>
                        <p className="text-[10px] text-x-gray font-medium">{collection.posts.length} posts</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                      isPostInCollection 
                        ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                        : 'bg-transparent border-white/20'
                    }`}>
                      {isPostInCollection && (
                        <svg className="w-3 h-3 text-white animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Empty State / Prompt */}
              {collections.length === 0 && !loading && (
                <div className="text-center py-4 px-2">
                  <p className="text-xs text-x-gray">No collections yet. Create one below!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showCreateInput && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <form onSubmit={handleCreateCollection} className="space-y-3 animate-fade-in">
              {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Collection name..."
                  className="flex-1 bg-x-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-x-blue outline-none transition-all"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  disabled={creating}
                />
                <button
                  type="submit"
                  disabled={creating || !newCollectionName.trim()}
                  className="bg-x-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {creating ? "..." : "ADD"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewCollectionName("");
                    setError("");
                  }}
                  className="px-2 text-x-gray hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}


      </div>
    </div>
  );
};

export default SaveToCollectionModal;
