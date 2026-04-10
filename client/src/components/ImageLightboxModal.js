import React from "react";

const ImageLightboxModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 bg-x-dark/50 hover:bg-x-dark rounded-full flex items-center justify-center text-white transition-colors"
        onClick={onClose}
        aria-label="Close fullscreen view"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div 
        className="relative max-w-full max-h-full p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent bubbling to backdrop
      >
        <img 
          src={imageUrl} 
          alt="Fullscreen Attachment" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ImageLightboxModal;
