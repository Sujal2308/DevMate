import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-x-black via-x-dark to-x-black/95 backdrop-blur-xl border-b border-x-border/50 sticky top-0 z-50 shadow-lg shadow-x-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Keep Same */}
          <Link
            to={user ? "/feed" : "/"}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center group-hover:bg-x-blue-hover transition-colors">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-2xl font-bold text-x-white group-hover:text-x-blue transition-colors">
              DevMate
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {user ? (
              // Logged in navigation - Enhanced
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    to="/feed"
                    className="relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group"
                  >
                    <span>Home</span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-x-blue group-hover:w-full transition-all duration-200"></div>
                  </Link>
                  <Link
                    to="/explore"
                    className="relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group"
                  >
                    <span>Explore</span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-x-blue group-hover:w-full transition-all duration-200"></div>
                  </Link>
                  <Link
                    to="/create-post"
                    className="relative text-x-white hover:text-x-blue transition-all duration-200 font-medium group"
                  >
                    <span>Create</span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-x-blue group-hover:w-full transition-all duration-200"></div>
                  </Link>
                </div>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link to={`/profile/${user.username}`} className="group">
                    <div className="w-9 h-9 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user.displayName?.[0] || user.username?.[0]}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-x-gray hover:text-x-white hover:bg-x-dark rounded-lg transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center space-x-3">
                  <Link to={`/profile/${user.username}`} className="group">
                    <div className="w-8 h-8 bg-gradient-to-r from-x-blue to-x-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <span className="text-white font-bold text-xs">
                        {user.displayName?.[0] || user.username?.[0]}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    className="text-x-white hover:text-x-blue p-2 rounded-lg hover:bg-x-dark transition-all"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isMobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              // Public navigation - Enhanced
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <a
                    href="#features"
                    className="text-x-gray hover:text-x-white transition-colors font-medium"
                  >
                    Features
                  </a>
                  <a
                    href="#community"
                    className="text-x-gray hover:text-x-white transition-colors font-medium"
                  >
                    Community
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-x-white hover:text-x-blue transition-all duration-200 font-medium hover:bg-x-dark rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-x-blue to-x-blue-hover text-white font-medium px-5 py-2.5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-x-blue/25"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Mobile Menu Button for Public */}
                <div className="md:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="text-x-white hover:text-x-blue p-2 rounded-lg hover:bg-x-dark transition-all"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isMobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-x-dark/95 backdrop-blur-xl border-b border-x-border/50 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {user ? (
              // Mobile menu for logged in users
              <>
                {/* Main Navigation */}
                <div className="space-y-1 mb-4">
                  <Link
                    to="/feed"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                  >
                    <span className="text-xl">🏠</span>
                    <span className="font-medium">Home</span>
                  </Link>
                  <Link
                    to="/explore"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                  >
                    <span className="text-xl">🔍</span>
                    <span className="font-medium">Explore</span>
                  </Link>
                  <Link
                    to="/create-post"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                  >
                    <span className="text-xl">✏️</span>
                    <span className="font-medium">Create Post</span>
                  </Link>
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                  >
                    <span className="text-xl">👤</span>
                    <span className="font-medium">Profile</span>
                  </Link>
                </div>

                {/* Trending Section */}
                <div className="border-t border-x-border/30 pt-4 mb-4">
                  <h3 className="text-sm font-semibold text-x-gray mb-3 px-3">What's happening</h3>
                  <div className="space-y-2">
                    {[
                      { tag: "JavaScript", posts: 1234 },
                      { tag: "React", posts: 987 },
                      { tag: "Node.js", posts: 654 },
                    ].map((trend, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-x-darker rounded-lg transition-colors cursor-pointer"
                      >
                        <p className="text-xs text-x-gray">Trending in Programming</p>
                        <p className="font-medium text-x-white text-sm">#{trend.tag}</p>
                        <p className="text-xs text-x-gray">{trend.posts.toLocaleString()} posts</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Actions */}
                <div className="border-t border-x-border/30 pt-4">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              // Mobile menu for public users
              <>
                >
                  <span className="text-xl">🔍</span>
                  <span className="font-medium">Explore</span>
                </Link>
                <Link
                  to="/create-post"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                >
                  <span className="text-xl">✏️</span>
                  <span className="font-medium">Create Post</span>
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Profile</span>
                </Link>
                <div className="border-t border-x-border/30 pt-3">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors w-full text-left"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              // Mobile menu for public users
              <>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors font-medium"
                >
                  Features
                </a>
                <a
                  href="#community"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 text-x-white hover:bg-x-darker rounded-lg transition-colors font-medium"
                >
                  Community
                </a>
                <div className="border-t border-x-border/30 pt-3 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full p-3 text-center text-x-white hover:bg-x-darker rounded-lg transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full p-3 text-center bg-x-blue hover:bg-x-blue-hover text-white rounded-lg transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
