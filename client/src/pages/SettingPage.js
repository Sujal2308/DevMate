import React from "react";

const SettingPage = () => {
  return (
    <div className="w-full max-w-2xl mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-gradient-to-br from-x-dark via-x-darker to-x-black rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center justify-center border border-x-border/40 relative overflow-hidden w-full">
        <div className="absolute inset-0 opacity-30 pointer-events-none select-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="320" cy="40" r="80" fill="#2563eb" fillOpacity="0.15" />
            <circle cx="80" cy="160" r="80" fill="#9333ea" fillOpacity="0.12" />
            <circle
              cx="200"
              cy="100"
              r="120"
              fill="#22d3ee"
              fillOpacity="0.08"
            />
          </svg>
        </div>
        <svg
          className="w-20 h-20 mb-6 animate-pulse text-x-blue drop-shadow-lg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-x-white mb-2 text-center drop-shadow-lg">
          Settings Features Coming Soon!
        </h1>
        <p className="text-x-gray text-lg text-center max-w-md">
          We are working hard to bring you awesome settings and customization
          options. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default SettingPage;
