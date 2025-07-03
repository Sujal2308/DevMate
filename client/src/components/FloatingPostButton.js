import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const FloatingPostButton = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Only show on specific pages when user is logged in
  const showOnPages = ["/feed", "/explore", "/profile", "/post"];
  const shouldShow =
    user &&
    showOnPages.some(
      (page) => location.pathname.startsWith(page) || location.pathname === "/"
    );

  // Handle scroll to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // Show button after scrolling 150px down
      setIsVisible(scrollTop > 150);
    };

    // Throttle scroll events for better performance
    let timeoutId;
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Don't show on create-post page itself
  if (!shouldShow || location.pathname === "/create-post") {
    return null;
  }

  return (
    <div
      className={`lg:hidden fixed bottom-20 right-4 z-50 transition-all duration-500 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-16 opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <Link
        to="/create-post"
        className="w-14 h-14 floating-post-btn rounded-full flex items-center justify-center transition-all duration-300 group shadow-lg"
        title="Create Post"
      >
        <span
          className="text-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
          role="img"
          aria-label="pencil"
        >
          ✏️
        </span>
      </Link>
    </div>
  );
};

export default FloatingPostButton;
