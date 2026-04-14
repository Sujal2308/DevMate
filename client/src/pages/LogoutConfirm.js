import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LogoutConfirm = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Aesthetic delay to show "Logging out" message
    setTimeout(() => {
      logout();
      // Redirect with a flag to show success message on login page
      navigate("/login?logout=success");
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100] animate-fade-in">
      <div className="bg-[#000000] rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.15)] border border-white/10 px-8 py-10 w-full max-w-sm mx-auto flex flex-col items-center transition-all duration-500 scale-100">
        {!isLoggingOut ? (
          <>
            <div className="flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <img
                src="/icons/logout.png"
                alt="Logout"
                className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-center text-white">
              Log out?
            </h2>
            
            <p className="text-gray-400 text-base mb-8 text-center leading-relaxed">
              Are you sure you want to log out of your DevMate account?
            </p>
            
            <div className="w-full space-y-3">
              <button
                className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all duration-200 active:scale-95 shadow-lg"
                onClick={handleLogout}
              >
                Log Out
              </button>
              <button
                className="w-full py-4 rounded-2xl bg-transparent border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-200"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">Logging out...</h2>
            <p className="text-gray-400 text-sm">Hope to see you back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutConfirm;
