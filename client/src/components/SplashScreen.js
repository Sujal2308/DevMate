import React from "react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-x-black transition-opacity duration-700 animate-fade-in-out">
      <span className="mb-2 text-base sm:text-lg text-x-gray font-medium tracking-wide animate-slide-in opacity-80 select-none">
        welcome to
      </span>
      <div className="flex items-center space-x-2 select-none">
        <span
          className="text-6xl sm:text-7xl font-extrabold text-x-blue animate-bounce-in"
          style={{ letterSpacing: "-0.05em" }}
        >
          D
        </span>
        <span
          className="text-5xl sm:text-6xl font-extrabold text-white animate-slide-in"
          style={{ letterSpacing: "-0.05em" }}
        >
          evMate
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
