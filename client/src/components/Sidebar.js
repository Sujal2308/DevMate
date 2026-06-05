import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Dock from "./ui/Dock";

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAdminModal, setShowAdminModal] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminError, setAdminError] = React.useState("");

  const handleAdminLogin = () => {
    if (adminPassword === "sujal2308") {
      setShowAdminModal(false);
      setAdminPassword("");
      setAdminError("");
      navigate("/admin");
    } else {
      setAdminError("Invalid override key");
    }
  };

  let dockItems = [
    {
      href: "/feed",
      label: "Home",
      active: location.pathname === "/feed" || location.pathname === "/",
      icon: (
        <svg className="w-6 h-6 text-x-gray hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/create-post",
      label: "Post",
      active: location.pathname === "/create-post",
      icon: (
        <svg className="w-6 h-6 text-x-gray hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: `/profile/${user?.username}`,
      label: "Profile",
      active: location.pathname === `/profile/${user?.username}`,
      icon: (
        <svg className="w-6 h-6 text-x-gray hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: "/communities",
      label: "Communities",
      active: location.pathname === "/communities" || location.pathname.startsWith("/community/"),
      icon: (
        <svg className="w-6 h-6 text-x-gray hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: "/news",
      label: "News",
      active: location.pathname === "/news",
      icon: (
        <svg className="w-6 h-6 text-x-gray hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ];



  return (
    <>
      <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl py-2 px-1">
        <Dock 
          items={dockItems}
          panelWidth={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>

      <div className="hidden lg:flex flex-col fixed left-4 bottom-8 z-50 space-y-3">
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-full bg-x-blue text-white hover:bg-x-blue-hover transition-all duration-300 shadow-xl shadow-x-blue/20 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-bold uppercase tracking-widest text-[10px]">Admin</span>
          </button>
        )}
        <button
          onClick={() => navigate("/logout-confirm")}
          className="flex items-center space-x-3 px-4 py-3 rounded-full bg-black/90 backdrop-blur-md text-x-gray hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 shadow-2xl group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Admin Verification Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/20 p-8 rounded-lg shadow-2xl max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-widest italic">Admin Protocol</h3>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest">Enter security override key</p>
            {adminError && <p className="text-red-500 text-xs mb-4 uppercase tracking-widest font-bold">{adminError}</p>}
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-white/20 text-white px-4 py-3 mb-6 focus:border-blue-600 outline-none transition-colors text-center tracking-[0.5em]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdminLogin();
              }}
              autoFocus
            />
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowAdminModal(false); setAdminError(""); setAdminPassword(""); }}
                className="flex-1 py-3 border border-white/10 text-slate-400 hover:text-white hover:border-white transition-all text-xs font-black uppercase tracking-widest"
              >
                Abort
              </button>
              <button 
                onClick={handleAdminLogin}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg text-xs font-black uppercase tracking-widest"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
