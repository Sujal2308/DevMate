import React from 'react';
import { Link } from 'react-router-dom';

const UpdateProfilePrompt = ({ user, onDismiss }) => {
  return (
  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/30 p-4 sm:p-6 mb-8 relative mx-2 sm:mx-0 font-poppins">
      {/* Dismiss button - optional, in case user wants to hide it manually */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors z-10"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2 pr-8 sm:pr-0">
            <span>🎉</span>
            <span className="text-sm sm:text-base">Welcome to DevMate!</span>
          </h3>
          
          <p className="text-gray-300 mb-4 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
            Complete your profile to connect with other developers and showcase your skills.
          </p>

          {/* Profile completion progress bar */}
          {(() => {
        // 4 fields: Display Name (25%), Bio (25%), Skills (25%), GitHub (25%) = 100%
        let completed = 1; // Display name is always completed after registration
        if (user.bio && user.bio.trim()) completed++;
        if (user.skills && user.skills.length > 0) completed++;
        if (user.githubLink && user.githubLink.trim()) completed++;
        const percent = completed * 25; // Each field is worth 25%
            return (
              <div className="mb-4 px-2 sm:px-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">Profile Completion</span>
                  <span className="text-xs sm:text-sm text-gray-400 font-semibold">{percent}%</span>
                </div>
                <div className="w-full h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })()}

          <div className="flex flex-col gap-2 px-2 sm:px-0">
            <Link
              to="/edit-profile"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-700 text-white px-6 py-2.5 sm:py-2 rounded-full font-medium transition-all duration-200 text-sm sm:text-base shadow-lg"
              style={{ boxShadow: '0 4px 16px 0 rgba(34,197,94,0.18)' }}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Profile
            </Link>
            
            <button
              onClick={onDismiss}
              className="inline-flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2.5 sm:py-2 rounded-full font-medium transition-colors text-sm sm:text-base border-none"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePrompt;
