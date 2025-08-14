import React from "react";

const MinimalMessageModal = ({ visible, onLoadPosts }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center">
        <h2 className="text-lg font-semibold mb-2 text-x-blue">Load Posts?</h2>
        <p className="text-gray-700 mb-4 text-sm">Welcome! Would you like to load the latest posts?</p>
        <button
          className="bg-x-blue text-white px-6 py-2 rounded-full font-medium shadow hover:bg-blue-700 transition"
          onClick={onLoadPosts}
        >
          Load Posts
        </button>
      </div>
    </div>
  );
};

export default MinimalMessageModal;
