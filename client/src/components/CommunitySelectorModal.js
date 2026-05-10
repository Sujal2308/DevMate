import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CommunitySelectorModal = ({ isOpen, onClose, communities, onSelect, selectedCommunityId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl p-6 sm:p-10 flex justify-center overflow-y-auto"
        >
          <div className="w-full max-w-2xl flex flex-col min-h-full">
            {/* Top Row - Title and Close */}
            <div className="flex items-center gap-2 mb-6 px-1">
              <button
                onClick={onClose}
                className="p-2 bg-transparent border-none hover:bg-white/10 rounded-full transition-all shrink-0"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-lg font-black text-white/40 uppercase tracking-[0.2em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Post to
              </span>
            </div>

            {/* Search Bar Row - Now Full Width */}
            <div className="mb-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white placeholder-x-gray focus:outline-none focus:border-x-blue/50 transition-all text-lg font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  autoFocus
                />
                <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-x-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Communities List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {/* General Post Option */}
              <button
                onClick={() => {
                  onSelect("");
                  onClose();
                }}
                className={`w-full flex items-center gap-4 p-3 px-5 border transition-all duration-200 group rounded-full ${
                  !selectedCommunityId 
                    ? "bg-x-blue/10 border-x-blue shadow-lg shadow-x-blue/5" 
                    : "bg-transparent border-white/10 hover:bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-black/20 rounded-full">🌐</span>
                <div className="flex flex-col items-start">
                  <span className={`font-black tracking-tight ${!selectedCommunityId ? "text-white" : "text-white/90"}`}>
                    No community
                  </span>
                  <span className="text-xs font-bold text-white/50">Post to your general profile</span>
                </div>
              </button>

              {filteredCommunities.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    onSelect(c._id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 p-3 px-5 border transition-all duration-200 group rounded-full ${
                    selectedCommunityId === c._id 
                      ? "bg-x-blue/10 border-x-blue shadow-lg shadow-x-blue/5" 
                      : "bg-transparent border-white/10 hover:bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden ${!c.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
                    style={c.icon?.startsWith("/") ? {} : { background: `${c.color}20`, border: `1px solid ${c.color}30` }}
                  >
                    {c.icon?.startsWith("/") ? (
                      <img src={c.icon} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                      c.icon
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className={`font-black text-sm leading-tight transition-colors truncate ${selectedCommunityId === c._id ? "text-x-blue" : "text-white"}`}>
                      {c.name}
                    </h3>
                    <p className="text-x-gray text-[11px] mt-0.5 line-clamp-1 opacity-70">{c.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-x-gray">
                        <span className="font-bold text-white/80">{c.memberCount}</span> members
                      </span>
                      {c.isMember && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-x-blue/80 bg-x-blue/10 px-2 py-0.5 rounded-full">
                          Joined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCommunityId === c._id && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-x-blue flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}

              {filteredCommunities.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-x-gray font-bold">No communities found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunitySelectorModal;
