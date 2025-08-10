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

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-x-dark rounded-2xl shadow-xl border border-red-500/30 px-6 py-8 w-full max-w-xs mx-auto flex flex-col items-center">
        <svg
          className="w-8 h-8"
          style={{ color: "#ff0000" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <h2
          className="text-lg font-bold mb-2 text-center"
          style={{ color: "#ff0000" }}
        >
          Logout from DevMate?
        </h2>
        <p className="text-x-gray text-sm mb-6 text-center">
          You will need to log in again to access your account.
        </p>
        <div className="w-full flex flex-col gap-3">
          <button
            className="w-full py-2 rounded-full bg-x-dark border border-x-border text-x-white font-bold"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="w-full py-2 rounded-full font-bold shadow text-white"
            style={{ backgroundColor: "#ff0000" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
