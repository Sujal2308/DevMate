import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CommunitySelectorModal = ({ isOpen, onClose, communities, onSelect, selectedCommunityId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

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
                />
                <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-x-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Communities List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-24 scrollbar-hide">
              {/* General Post Option */}
              <button
                onClick={() => {
                  onSelect("");
                  onClose();
                }}
                className="w-full flex flex-col items-stretch py-4 bg-transparent border-b border-white/[0.08] p-0 cursor-pointer text-left hover:opacity-85 transition-all duration-200 group relative pr-12"
              >
                {/* Row 1: Logo and Heading (perfectly centered vertically) */}
                <div className="flex items-center gap-2 mb-1.5 w-full">
                  <span className="text-lg w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg shrink-0 text-white">🌐</span>
                  <h3 className={`font-black text-lg sm:text-xl leading-none transition-colors truncate ${!selectedCommunityId ? "text-x-blue" : "text-white group-hover:text-x-blue"}`}>
                    No community
                  </h3>
                </div>

                {/* Row 2: Description (aligned below Heading) */}
                <p className="text-x-gray text-xs sm:text-sm leading-normal line-clamp-1 opacity-70 mt-1 mb-1 pl-10">
                  Post to your general profile
                </p>

                {/* Row 3: Followers/Meta (aligned below Heading) */}
                <div className="flex flex-wrap items-center gap-2 mt-1 pl-10">
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-x-gray bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                    Global feed
                  </span>
                </div>

                {/* Selection Checkmark */}
                {!selectedCommunityId && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0 w-8 h-8 rounded-full bg-x-blue flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {filteredCommunities.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    onSelect(c._id);
                    onClose();
                  }}
                  className="w-full flex flex-col items-stretch py-4 bg-transparent border-b border-white/[0.08] p-0 cursor-pointer text-left hover:opacity-85 transition-all duration-200 group relative pr-12"
                >
                  {/* Row 1: Logo and Heading (perfectly centered vertically) */}
                  <div className="flex items-center gap-2 mb-1.5 w-full">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden ${!c.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
                      style={c.icon?.startsWith("/") ? {} : { background: `${c.color}20`, border: `1px solid ${c.color}30` }}
                    >
                      {c.icon?.startsWith("/") ? (
                        <img src={c.icon} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        c.icon
                      )}
                    </div>
                    <h3 className={`font-black text-lg sm:text-xl leading-none transition-colors truncate ${selectedCommunityId === c._id ? "text-x-blue" : "text-white group-hover:text-x-blue"}`}>
                      {c.name}
                    </h3>
                  </div>

                  {/* Row 2: Description (aligned below Heading) */}
                  <p className="text-x-gray text-xs sm:text-sm leading-normal line-clamp-1 opacity-70 mb-1 pl-10">
                    {c.description}
                  </p>

                  {/* Row 3: Followers/Meta (aligned below Heading) */}
                  <div className="flex flex-wrap items-center gap-2 mt-1 pl-10">
                    <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-x-gray bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                      <span className="font-bold text-white/85 mr-1">{c.memberCount}</span> followers
                    </span>
                    {c.isMember && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-x-blue/80 bg-x-blue/10 border border-x-blue/20 px-2.5 py-0.5 rounded-full">
                        Joined
                      </span>
                    )}
                  </div>

                  {/* Selection Checkmark */}
                  {selectedCommunityId === c._id && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0 w-8 h-8 rounded-full bg-x-blue flex items-center justify-center shadow-lg">
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
