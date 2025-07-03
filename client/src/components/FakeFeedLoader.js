import React from "react";

const FakeFeedLoader = () => (
  <div className="flex flex-col items-center justify-center py-8 animate-fade-in-out">
    <div className="mb-3">
      <svg
        className="animate-spin h-8 w-8 text-x-blue"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
    </div>
    <div className="text-x-gray text-base font-medium">
      Loading more posts...
    </div>
  </div>
);

export default FakeFeedLoader;
