import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const Navbar = () => {
  const { user } = useAuth();
  const { hasUnread } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Function to handle navigation click
  const handleNavClick = (path, e) => {
    e.preventDefault();
    // First navigate to the path
    navigate(path);
    // Then immediately scroll to top with instant behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    function handleScroll() {
      setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-x-black via-x-dark to-x-black/95 backdrop-blur-xl border-b border-x-border/50 z-[60] shadow-lg shadow-x-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={user ? "/feed" : "/"}
            onClick={(e) => handleNavClick(user ? "/feed" : "/", e)}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center group-hover:bg-x-blue-hover transition-colors">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-2xl font-bold text-x-white transition-colors">
              DevMate
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {user ? (
              // Logged in navigation
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    to="/feed"
                    className={`relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group ${
                      location.pathname === "/feed" || location.pathname === "/"
                        ? "text-x-blue"
                        : ""
                    }`}
                    onClick={(e) => handleNavClick("/feed", e)}
                  >
                    <span>Home</span>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-x-blue transition-all duration-200 ${
                        location.pathname === "/feed" ||
                        location.pathname === "/"
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></div>
                  </Link>
                  <Link
                    to="/explore"
                    className={`relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group ${
                      location.pathname === "/explore" ? "text-x-blue" : ""
                    }`}
                    onClick={(e) => handleNavClick("/explore", e)}
                  >
                    <span>Explore</span>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-x-blue transition-all duration-200 ${
                        location.pathname === "/explore"
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></div>
                  </Link>
                  <Link
                    to="/notifications"
                    className={`relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group ${
                      location.pathname === "/notifications"
                        ? "text-x-blue"
                        : ""
                    }`}
                    onClick={(e) => handleNavClick("/notifications", e)}
                  >
                    <span>Notifications</span>
                    {/* Red glowing dot for unread notifications */}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-3 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse border-2 border-x-black"></span>
                    )}
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-x-blue transition-all duration-200 ${
                        location.pathname === "/notifications"
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></div>
                  </Link>
                  <Link
                    to="/news"
                    className={`relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group ${
                      location.pathname === "/news" ? "text-x-blue" : ""
                    }`}
                    onClick={(e) => handleNavClick("/news", e)}
                  >
                    <span>News</span>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-x-blue transition-all duration-200 ${
                        location.pathname === "/news"
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></div>
                  </Link>
                </div>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link to={`/profile/${user.username}`} className="group">
                    <div className="w-9 h-9 bg-[#003366] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user.displayName?.[0] || user.username?.[0]}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => navigate("/logout-confirm")}
                    className="px-4 py-2 text-x-gray hover:text-x-white hover:bg-x-dark rounded-lg transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Menu Button - Simplified */}
                <div className="md:hidden flex items-center space-x-3 relative">
                  <button
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="focus:outline-none"
                    aria-label="Open user menu"
                  >
                    {mobileMenuOpen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-x-gray bg-x-dark rounded-full p-1 border border-x-border/40 shadow-lg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <div className="w-8 h-8 bg-[#003366] rounded-full flex items-center justify-center transition-transform shadow-lg">
                        <span className="text-white font-bold text-xs">
                          {user.displayName?.[0] || user.username?.[0]}
                        </span>
                      </div>
                    )}
                  </button>
                  {mobileMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-12 z-50 w-44 bg-x-dark border border-x-border/40 rounded-xl shadow-xl py-2 flex flex-col animate-fade-in"
                    >
                      <Link
                        to={`/profile/${user.username}`}
                        className={`px-4 py-3 hover:bg-x-darker rounded-t-xl transition-colors text-left ${
                          location.pathname === `/profile/${user.username}`
                            ? "text-x-blue border-l-2 border-x-blue"
                            : "text-x-white"
                        }`}
                        onClick={(e) =>
                          handleNavClick(`/profile/${user.username}`, e)
                        }
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/settings"
                        className={`px-4 py-3 hover:bg-x-darker transition-colors text-left ${
                          location.pathname === "/settings"
                            ? "text-x-blue border-l-2 border-x-blue"
                            : "text-x-white"
                        }`}
                        onClick={(e) => handleNavClick("/settings", e)}
                      >
                        Settings
                      </Link>
                      <Link
                        to="/news"
                        className={`px-4 py-3 hover:bg-x-darker transition-colors text-left flex items-center justify-between ${
                          location.pathname === "/news"
                            ? "text-x-blue border-l-2 border-x-blue"
                            : "text-x-white"
                        }`}
                        onClick={(e) => handleNavClick("/news", e)}
                      >
                        <span>News</span>
                        <span className="bg-x-blue text-white text-xs px-2 py-1 rounded-full font-semibold">
                          NEW
                        </span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/logout-confirm");
                          setMobileMenuOpen(false);
                          window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: "instant",
                          });
                        }}
                        className="px-4 py-3 text-red-400 hover:bg-red-900/40 rounded-b-xl transition-colors text-left text-base font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Public navigation
              <>
                {/* Desktop only: show links and buttons for public users */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/features"
                    className="text-x-gray hover:text-x-white transition-colors font-medium mr-4"
                  >
                    <span className="relative z-10">
                      <span className="rainbow-text">Features</span>
                    </span>
                  </Link>
                  <Link
                    to="/support"
                    className="text-x-gray hover:text-x-white transition-colors font-medium"
                  >
                    Support
                  </Link>
                  {/* Sign In button first */}
                  <Link
                    to="/login"
                    onClick={(e) => handleNavClick("/login", e)}
                    className="md:border-0 border-2 border-x-blue text-x-blue hover:text-x-blue font-bold px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 min-w-[80px] backdrop-blur relative group"
                  >
                    <span className="relative z-10">Sign In</span>
                    <span className="absolute left-3 right-3 bottom-1 h-0.5 bg-x-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full z-0"></span>
                  </Link>
                  {/* Get Started button after Sign In */}
                  <Link
                    to="/register"
                    onClick={(e) => handleNavClick("/register", e)}
                    className="bg-gradient-to-r from-x-blue to-x-blue-hover text-white font-bold px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl min-w-[120px]"
                  >
                    Register{" "}
                    <span role="img" aria-label="pray">
                      🙏🏻
                    </span>
                  </Link>
                </div>
                {/* Mobile only: emoji converter animation */}
                <div className="flex md:hidden items-center ml-2">
                  <EmojiConverter />
                </div>
                {/* Desktop: buttons/animation removed, mobile: emoji animation shown */}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// EmojiConverter component for emoji animation
function EmojiConverter() {
  const emojis = ["😀", "🚀", "🔥", "💡", "🎉", "🤖", "🦄", "🌟", "💻", "📱"];
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % emojis.length);
    }, 900);
    return () => clearInterval(interval);
  }, [emojis.length]);
  return (
    <span
      className="text-3xl transition-all duration-500 ease-in-out select-none"
      style={{ display: "inline-block", transform: "scale(1.2)" }}
      aria-label="Animated Emoji"
    >
      {emojis[index]}
    </span>
  );
}

export default Navbar;

// Add this style to the file (or to your global CSS):
// .rainbow-text {
//   background: linear-gradient(90deg, #ff6ec4, #7873f5, #42e695, #ff6ec4);
//   background-size: 200% 200%;
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   animation: rainbow-move 2s linear infinite;
// }
// @keyframes rainbow-move {
//   0% { background-position: 0% 50%; }
//   100% { background-position: 100% 50%; }
// }
