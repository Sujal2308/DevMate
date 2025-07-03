import React from "react";

const LoadingSpinner = ({ size = "large", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div
      className={`flex justify-center items-center py-16 lg:py-24 min-h-[400px] ${className}`}
    >
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-x-blue rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
