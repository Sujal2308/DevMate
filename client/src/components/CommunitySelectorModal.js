import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CommunitySelectorModal = ({ isOpen, onClose, communities, onSelect, selectedCommunityId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("joined"); // "joined" or "discover"
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setActiveTab("joined");
      setShowMobileSearch(false);
    }
  }, [isOpen]);

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "joined") {
      return matchesSearch && c.isMember;
    } else {
      return matchesSearch && !c.isMember;
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex justify-center overflow-y-auto cursor-pointer"
          onClick={onClose}
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .scroll-fade {
              mask-image: linear-gradient(to right, black 92%, transparent 100%);
              -webkit-mask-image: linear-gradient(to right, black 92%, transparent 100%);
            }
          `}</style>
          <div 
            className="w-full max-w-2xl flex flex-col min-h-full cursor-default pt-4 sm:pt-8 px-4 sm:px-8 sm:border-x sm:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* DESKTOP SEARCH AND TOGGLE ROW */}
            <div className="hidden sm:flex sm:items-center gap-4 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3 text-white placeholder-x-gray focus:outline-none focus:border-x-blue/50 transition-all text-base font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-x-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Tabs Toggle - Pill Shaped */}
              <div className="flex bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("joined")}
                  className={`px-5 py-3 text-xs font-black rounded-full relative transition-all bg-transparent border-none cursor-pointer z-10 ${
                    activeTab === "joined" ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Joined
                  {activeTab === "joined" && (
                    <motion.div
                      layoutId="activeTabPillDesktop"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{ backgroundColor: "tomato" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("discover")}
                  className={`px-5 py-3 text-xs font-black rounded-full relative transition-all bg-transparent border-none cursor-pointer z-10 ${
                    activeTab === "discover" ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Discover
                  {activeTab === "discover" && (
                    <motion.div
                      layoutId="activeTabPillDesktop"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{ backgroundColor: "tomato" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE SEARCH AND TOGGLE ROW */}
            <div className="flex sm:hidden flex-col gap-3 mb-6">
              <div className="flex items-center justify-between w-full">
                {/* Left: Pill Toggle */}
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("joined")}
                    className={`px-6 py-2.5 text-xs font-black rounded-full relative transition-all bg-transparent border-none cursor-pointer z-10 ${
                      activeTab === "joined" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Joined
                    {activeTab === "joined" && (
                      <motion.div
                        layoutId="activeTabPillMobile"
                        className="absolute inset-0 rounded-full -z-10"
                        style={{ backgroundColor: "tomato" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("discover")}
                    className={`px-6 py-2.5 text-xs font-black rounded-full relative transition-all bg-transparent border-none cursor-pointer z-10 ${
                      activeTab === "discover" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Discover
                    {activeTab === "discover" && (
                      <motion.div
                        layoutId="activeTabPillMobile"
                        className="absolute inset-0 rounded-full -z-10"
                        style={{ backgroundColor: "tomato" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                </div>

                {/* Right Area: Search + Cancel */}
                <div className="flex items-center gap-3">
                  {/* Search Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (showMobileSearch) {
                        setSearchTerm("");
                      }
                      setShowMobileSearch(!showMobileSearch);
                    }}
                    className={`bg-transparent border-none transition-all cursor-pointer flex items-center justify-center p-2 rounded-full ${
                      showMobileSearch ? "text-x-blue" : "text-white/60 hover:text-white"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {/* Close/Cross Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-transparent border-none text-white/60 hover:text-white cursor-pointer p-2 rounded-full flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Floating Mobile Search Header Overlay */}
              <AnimatePresence>
                {showMobileSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-[10010] px-6 py-4 bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center gap-3 sm:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setShowMobileSearch(false);
                      }}
                      className="p-2 bg-transparent border-none text-white hover:bg-white/10 rounded-full transition-all shrink-0 cursor-pointer flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search communities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-2.5 text-white placeholder-x-gray focus:outline-none focus:border-x-blue/50 transition-all text-base font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      />
                      <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-x-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Communities List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 pb-24 scrollbar-hide">
              {/* Render Filtered Communities */}
              {filteredCommunities.map((c, index) => (
                <React.Fragment key={c._id}>
                  {index > 0 && <div className="border-b border-white/10 w-full" />}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onSelect(c._id);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelect(c._id);
                        onClose();
                      }
                    }}
                    className="w-full flex flex-col items-stretch p-0 bg-transparent border-2 border-transparent rounded-xl cursor-pointer text-left transition-all duration-200 group relative pr-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3 mb-1 w-full">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden ${!c.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
                        style={c.icon?.startsWith("/") ? {} : { background: `${c.color}20`, border: `1px solid ${c.color}30` }}
                      >
                        {c.icon?.startsWith("/") ? (
                          <img src={c.icon} alt="" className="w-full h-full object-contain p-1.5" />
                        ) : (
                          c.icon
                        )}
                      </div>
                      <h3 className={`font-black text-lg sm:text-xl leading-none transition-colors truncate ${selectedCommunityId === c._id ? "text-x-blue" : "text-white"}`}>
                        {c.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-[60px] mb-2">
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-x-gray bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                        <span className="font-bold text-white/85 mr-1">{c.memberCount}</span> followers
                      </span>
                      {c.isMember && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-x-blue/80 bg-x-blue/10 border border-x-blue/20 px-2.5 py-0.5 rounded-full">
                          Joined
                        </span>
                      )}
                    </div>

                    <p className="text-x-gray text-xs sm:text-sm leading-normal line-clamp-2 sm:line-clamp-1 opacity-70 mb-2 pl-[60px]">
                      {c.description}
                    </p>

                    {c.flairs && c.flairs.length > 0 && (
                      <div 
                        className="flex items-center gap-2 overflow-x-auto py-1.5 ml-[60px] mt-2 no-scrollbar scroll-fade"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.flairs.map((f, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(c._id, f);
                              onClose();
                            }}
                            className="shrink-0 px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all duration-200 border border-transparent hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                            style={{ background: f.color, color: "#fff" }}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </React.Fragment>
              ))}

              {/* Empty State */}
              {filteredCommunities.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-x-gray font-bold">
                    No communities found in {activeTab === "joined" ? "Joined" : "Discover"} matching your search.
                  </p>
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
