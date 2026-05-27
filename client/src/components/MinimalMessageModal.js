import React from "react";

const MinimalMessageModal = ({ isOpen, onReload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[320px]">
      <div className="bg-x-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden relative">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white mb-0.5">
              Welcome to Feed
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              See what's happening in your network
            </p>
          </div>

          <button
            type="button"
            className="w-full sm:w-auto bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 whitespace-nowrap"
            onClick={onReload}
          >
            Load Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalMessageModal;
