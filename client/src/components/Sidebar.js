import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const devQuotes = [
  "Code. Debug. Repeat.",
  "Eat, Sleep, Code, Repeat.",
  "Hello World!",
  "Keep calm and code on.",
  "<div>Life = Coding;</div>",
  "while(alive) { code(); }",
  "// TODO: Change the world",
  "404: Motivation Not Found",
  "Commit. Push. Coffee.",
  "Bugs are just features in disguise.",
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const navItems = [
    { path: "/feed", icon: "🏠", label: "Home" },
    { path: "/explore", icon: "🔍", label: "Explore" },
    { path: "/create-post", icon: "✏️", label: "Post" },
    { path: `/profile/${user?.username}`, icon: "👤", label: "Profile" },
    { path: "/messages", icon: "💬", label: "Messages" }, // Added messages button
    { path: "/settings", icon: "⚙️", label: "Settings" }, // Added settings icon
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % devQuotes.length);
    }, 7000); // Slower: 7 seconds per quote
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="x-sidebar flex flex-col h-full">
      {/* Logo - Only visible on larger screens */}
      <div className="mb-8 hidden lg:block text-center select-none">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">⚡</span>
          <span
            className="text-sm text-x-gray italic animate-dev-quote-fade"
            id="dev-quote"
          >
            {devQuotes[quoteIdx]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 p-3 rounded-full hover:bg-x-darker transition-colors text-x-white ${
                isActive ? "bg-x-darker" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xl font-medium hidden lg:inline-flex items-center gap-2">
                {item.label}
                {isActive && (
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full shadow-lg animate-pulse ml-2"></span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info - Only visible on larger screens */}
      <div className="mt-auto pt-8 hidden lg:block">
        <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-x-darker transition-colors">
          <div className="w-10 h-10 bg-x-blue rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.displayName?.[0] || user?.username?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-x-white">
              {user?.displayName || user?.username}
            </p>
            <p className="text-x-gray text-sm">@{user?.username}</p>
          </div>
          <button
            onClick={() => navigate("/logout-confirm")}
            className="text-x-gray hover:text-x-white transition-colors"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              width="22"
              height="22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline align-middle"
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
          </button>
        </div>
      </div>

      {/* Flexible spacer to extend border to container bottom */}
      <div className="flex-1"></div>
    </div>
  );
};

export default Sidebar;
