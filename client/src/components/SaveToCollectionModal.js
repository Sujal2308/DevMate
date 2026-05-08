import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const SaveToCollectionModal = ({ isOpen, onClose, post, isSaved, onSaveToggle }) => {
  const { user, updateUser } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

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

      // Update local collections state if we were toggling a specific collection
      if (collectionId) {
        setCollections(response.data.savedCollections);
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    } finally {
      setSavingId(null);
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
      <div className="relative bg-[#080808] w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-wide">Save to Collection</h2>
          <button
            onClick={onClose}
            className="p-1 text-x-gray hover:text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Collections List */}
        <div className="p-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 border-2 border-x-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Default "All Posts" option */}
              <button
                onClick={() => handleToggleSave(null)}
                disabled={savingId === "all"}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-x-dark flex items-center justify-center rounded-lg border border-white/10">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-x-blue transition-colors">All Posts</span>
                </div>
                {isSaved && (
                  <svg className="w-5 h-5 text-x-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Custom Collections */}
              {collections.map(collection => {
                const isPostInCollection = collection.posts.some(id => 
                  id === post._id || (id._id && id._id === post._id)
                );
                
                return (
                  <button
                    key={collection._id}
                    onClick={() => handleToggleSave(collection._id)}
                    disabled={savingId === collection._id}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-x-dark flex items-center justify-center rounded-lg border border-white/10">
                        <svg className="w-5 h-5 text-x-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2.28a2 2 0 01.948.236l.576.288M14 20h4a2 2 0 002-2V8a2 2 0 00-2-2h-5L14 20z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-x-blue transition-colors">{collection.name}</span>
                    </div>
                    {isPostInCollection && (
                      <svg className="w-5 h-5 text-x-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default SaveToCollectionModal;
