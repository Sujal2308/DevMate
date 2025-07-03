import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LogoutConfirm = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-x-dark to-red-900 px-2 sm:px-0">
      <div className="bg-x-dark/90 border border-red-700 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="320" cy="40" r="80" fill="#ef4444" fillOpacity="0.18" />
            <circle cx="80" cy="160" r="80" fill="#991b1b" fillOpacity="0.12" />
            <circle
              cx="200"
              cy="100"
              r="120"
              fill="#dc2626"
              fillOpacity="0.08"
            />
          </svg>
        </div>
        <svg
          className="w-16 h-16 mb-6 text-red-600 animate-pulse drop-shadow-lg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
          <rect
            x="3"
            y="5"
            width="8"
            height="14"
            rx="2"
            fill="none"
            stroke="currentColor"
          />
        </svg>
        <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-2 text-center drop-shadow-lg">
          Are you sure you want to logout?
        </h1>
        <p className="text-x-gray text-center mb-8 max-w-xs">
          You will need to log in again to access your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-x-dark border border-x-gray-700 text-x-white font-semibold py-2 px-6 rounded-lg transition hover:bg-x-gray/30 hover:border-x-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
