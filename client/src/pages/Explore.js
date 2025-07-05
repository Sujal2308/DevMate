import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import LoadingSpinner from "../components/LoadingSpinner";

// Window dimensions singleton to avoid repeated calculations
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Throttled resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // Use the custom hook for dimensions
  const { width: windowWidth } = useWindowDimensions();

  // Memoize isMobile to avoid unnecessary re-renders
  const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);

  // Fixed layout references
  const searchContainerRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const rootContainerRef = useRef(null);
  const initialRenderComplete = useRef(false);
  const searchInputRef = useRef(null);

  // Track keyboard state
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Search state tracking
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Function to determine if we should show results - memoized
  const shouldShowResults = useMemo(() => {
    // Only show results if search/filter is active (for both mobile and desktop)
    return debouncedSearchTerm.trim() !== "" || selectedSkill !== "";
  }, [debouncedSearchTerm, selectedSkill]);

  // Use Layout Effect to ensure DOM measurements are accurate
  useLayoutEffect(() => {
    if (
      isMobile &&
      rootContainerRef.current &&
      !initialRenderComplete.current
    ) {
      // Set the initial container height only once
      const contentHeight =
        windowWidth < 768 ? window.innerHeight - 150 : "auto";
      rootContainerRef.current.style.height = `${contentHeight}px`;
      rootContainerRef.current.style.overflow = "hidden";
      initialRenderComplete.current = true;
    }
  }, [isMobile, windowWidth]);

  // Set up keyboard detection with browser compatibility
  useEffect(() => {
    // Check if visualViewport API is available (modern browsers)
    if (typeof window.visualViewport !== "undefined") {
      const visualViewport = window.visualViewport;

      const handleResize = () => {
        // The keyboard is likely open if the visual viewport height is significantly less than window inner height
        const keyboardHeight = window.innerHeight - visualViewport.height;
        const isKeyboard = keyboardHeight > 150; // Threshold to detect keyboard

        if (isKeyboard !== isKeyboardOpen) {
          setIsKeyboardOpen(isKeyboard);

          // Prevent any animations or transitions during keyboard open/close
          document.documentElement.style.setProperty(
            "--transition-speed",
            isKeyboard ? "0s" : "0.3s"
          );

          // Apply a fixed position to the search container when keyboard is open
          if (searchContainerRef.current) {
            searchContainerRef.current.style.position = isKeyboard
              ? "fixed"
              : "";
            searchContainerRef.current.style.top = isKeyboard ? "0" : "";
            searchContainerRef.current.style.left = isKeyboard ? "0" : "";
            searchContainerRef.current.style.right = isKeyboard ? "0" : "";
            searchContainerRef.current.style.zIndex = isKeyboard ? "1000" : "";
          }
        }
      };

      visualViewport.addEventListener("resize", handleResize);
      return () => visualViewport.removeEventListener("resize", handleResize);
    } else {
      // Fallback for older browsers - use focus/blur events
      const handleFocusInput = () => {
        if (isMobile) {
          setIsKeyboardOpen(true);
          document.documentElement.style.setProperty(
            "--transition-speed",
            "0s"
          );

          // Fixed position for search controls
          if (searchContainerRef.current) {
            searchContainerRef.current.style.position = "fixed";
            searchContainerRef.current.style.top = "0";
            searchContainerRef.current.style.left = "0";
            searchContainerRef.current.style.right = "0";
            searchContainerRef.current.style.zIndex = "1000";
          }
        }
      };

      const handleBlurInput = () => {
        if (isMobile) {
          setTimeout(() => {
            setIsKeyboardOpen(false);
            document.documentElement.style.setProperty(
              "--transition-speed",
              "0.3s"
            );

            if (searchContainerRef.current) {
              searchContainerRef.current.style.position = "";
              searchContainerRef.current.style.zIndex = "";
            }
          }, 100);
        }
      };

      // Add event listeners to search and skill input fields directly
      const searchInput = document.getElementById("search");
      const skillInput = document.getElementById("skill");

      if (searchInput) {
        searchInput.addEventListener("focus", handleFocusInput);
        searchInput.addEventListener("blur", handleBlurInput);
      }

      if (skillInput) {
        skillInput.addEventListener("focus", handleFocusInput);
        skillInput.addEventListener("blur", handleBlurInput);
      }

      return () => {
        if (searchInput) {
          searchInput.removeEventListener("focus", handleFocusInput);
          searchInput.removeEventListener("blur", handleBlurInput);
        }

        if (skillInput) {
          skillInput.removeEventListener("focus", handleFocusInput);
          skillInput.removeEventListener("blur", handleBlurInput);
        }
      };
    }
  }, [isKeyboardOpen, isMobile]);

  // Function to execute search on mobile and dismiss keyboard
  const executeSearch = () => {
    // Blur input to dismiss keyboard
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    // Keep search active to show results
    setIsSearchActive(true);
    setIsKeyboardOpen(false);

    // Force immediate search
    setDebouncedSearchTerm(searchTerm);
  };

  // Input focus handling with improved mobile experience
  const handleSearchFocus = () => {
    if (isMobile) {
      setIsSearchActive(true);

      // Prevent any scroll or bounce
      document.body.classList.add("keyboard-open");

      // Force immediate layout calculation with GPU acceleration
      if (rootContainerRef.current) {
        rootContainerRef.current.style.transform = "translateZ(0)";
        rootContainerRef.current.style.contain = "strict";
        rootContainerRef.current.style.willChange = "transform";
      }
    }
  };

  const handleSearchBlur = () => {
    if (isMobile) {
      // Don't immediately remove active state if there's text
      if (!searchTerm) {
        setIsSearchActive(false);
      }

      document.body.classList.remove("keyboard-open");

      // Reset styles
      if (rootContainerRef.current) {
        rootContainerRef.current.style.willChange = "auto";
      }

      // Only auto-focus for selected skill, not for search text
      // This prevents keyboard from reappearing when user wants to see results
      if (selectedSkill && !searchTerm) {
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  // Advanced debounce with cancellation and buffering
  const searchChangeRef = useRef(null);

  useEffect(() => {
    let debounceTimeout = null;

    if (searchTerm !== debouncedSearchTerm) {
      // Cancel any pending updates
      clearTimeout(debounceTimeout);

      // Set a longer debounce for input to minimize flickering
      debounceTimeout = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 500); // Increased debounce time for smoother experience
    }

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Fetch users when search parameters change
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm, selectedSkill]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (selectedSkill) params.append("skill", selectedSkill);

      const response = await axios.get(`/api/users?${params.toString()}`);
      setUsers(response.data);
    } catch (error) {
      setError("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique skills from users for filter dropdown
  const allSkills = [...new Set(users.flatMap((user) => user.skills))].sort();

  // Optimized search handler with RAF for performance
  const handleSearchChange = (e) => {
    // Update search term directly to avoid double rendering
    setSearchTerm(e.target.value);

    // Ensure mobile view stays stable
    if (isMobile && rootContainerRef.current) {
      rootContainerRef.current.style.height =
        rootContainerRef.current.offsetHeight + "px";
    }
  };

  const handleSkillChange = (e) => {
    // Apply the same stability technique for skill changes
    if (isMobile && rootContainerRef.current) {
      rootContainerRef.current.style.height =
        rootContainerRef.current.offsetHeight + "px";
    }

    setSelectedSkill(e.target.value);
  };

  const clearFilters = () => {
    // First, prevent any content jumping
    if (isMobile) {
      // Temporarily disable transitions during state changes
      document.documentElement.style.setProperty("--transition-speed", "0s");

      // Lock the container height to prevent jumps
      if (rootContainerRef.current) {
        rootContainerRef.current.style.height = `${rootContainerRef.current.offsetHeight}px`;
      }

      // Use requestAnimationFrame to batch multiple state updates
      requestAnimationFrame(() => {
        setSearchTerm("");
        setSelectedSkill("");
        setIsSearchActive(false);

        // After a short delay, restore transitions
        setTimeout(() => {
          document.documentElement.style.setProperty(
            "--transition-speed",
            "0.3s"
          );
        }, 100);
      });
    } else {
      // Desktop behavior remains simple
      setSearchTerm("");
      setSelectedSkill("");
    }
  };

  return (
    <div
      ref={rootContainerRef}
      className={`w-full max-w-7xl mx-auto py-1 sm:py-2 lg:py-6 px-2 sm:px-3 lg:px-6 pb-16 lg:pb-8 explore-root-container ${
        isMobile ? "fixed-mobile-layout" : ""
      } ${isKeyboardOpen ? "keyboard-active" : ""} ${
        isSearchActive ? "search-active" : ""
      }`}
      style={{
        height: isMobile ? "100vh" : "auto",
        isolation: "isolate",
        contain: isMobile ? "strict" : "none",
        willChange: isMobile ? "transform" : "auto",
      }}
    >
      {/* Hero Section - Reduced when keyboard active */}
      <div
        className={`hero-container ${
          isKeyboardOpen
            ? "h-0 opacity-0 overflow-hidden"
            : "mb-2 sm:mb-3 lg:mb-6"
        }`}
        style={{
          transition:
            "height var(--transition-speed), opacity var(--transition-speed)",
        }}
      >
        <h1 className="mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-x-blue via-purple-500 to-x-green bg-[length:200%_auto] bg-clip-text text-transparent md:animate-color-cycle mb-1 lg:mb-2 explore-mobile-heading">
          <span className="inline sm:hidden">
            Discover Devs{" "}
            <span
              style={{
                background: "none",
                WebkitBackgroundClip: "initial",
                color: "initial",
              }}
            >
              🚀
            </span>
          </span>
          <span className="hidden sm:inline">Explore Developers</span>
        </h1>
        <p className="text-x-gray text-xs sm:text-sm lg:text-base max-w-2xl">
          Discover and connect with talented developers in the DevMate
          community. Find your next collaborator, mentor, or coding buddy.
        </p>
      </div>

      {/* Search and Filter Controls - Fixed position on mobile when keyboard active */}
      <div
        ref={searchContainerRef}
        className={`card search-control-panel p-2 sm:p-3 lg:p-6 mb-1 sm:mb-2 lg:mb-4 bg-gradient-to-r from-x-dark/50 to-x-dark/30 md:backdrop-blur-sm backdrop-blur-none border border-x-border/50 mt-4-mobile`}
        style={{
          zIndex: isKeyboardOpen ? 50 : "auto",
          position: isKeyboardOpen ? "sticky" : "relative",
          top: isKeyboardOpen ? 0 : "auto",
          transition: "none",
        }}
      >
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            <div className="w-full">
              <label
                htmlFor="search"
                className={`block text-sm font-medium text-x-white mb-2 sm:mb-3 ${
                  isKeyboardOpen ? "sr-only" : ""
                }`}
              >
                🔍 Search by name or username
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  id="search"
                  className="w-full bg-x-black/60 border border-x-border text-x-white placeholder-x-gray rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-x-blue focus:border-x-blue transform-gpu"
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isMobile && searchTerm) {
                      e.preventDefault();
                      executeSearch();
                    }
                  }}
                  style={{
                    WebkitAppearance: "none",
                    transform: "translateZ(0)",
                  }}
                />
                <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                  {searchTerm ? (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }}
                      className="mr-1 p-1 text-x-gray hover:text-x-white focus:outline-none search-clear-button"
                      aria-label="Clear search"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: "translateZ(0)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ) : (
                    <svg
                      className="w-5 h-5 text-x-gray flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ transform: "translateZ(0)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}

                  {/* Mobile search button that dismisses keyboard and shows results */}
                  {isMobile && searchTerm && (
                    <button
                      onClick={executeSearch}
                      className="ml-2 bg-x-blue text-white rounded-lg px-3 py-1 text-xs font-medium search-execute-button"
                      aria-label="Search"
                      type="button"
                    >
                      Search
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hide skill filter on mobile, show on desktop */}
            <div className="hidden md:block relative">
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div>
                  <label
                    htmlFor="skill"
                    className={`block text-sm font-medium text-x-white mb-3 ${
                      isKeyboardOpen ? "sr-only" : ""
                    }`}
                  >
                    🏷️ Filter by skill
                  </label>
                  <select
                    id="skill"
                    className="bg-x-black/60 border border-x-border text-x-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-x-blue focus:border-x-blue normal-dropdown"
                    value={selectedSkill}
                    onChange={handleSkillChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    style={{ minWidth: "180px" }}
                  >
                    <option value="">All skills</option>
                    {allSkills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop Clear Filters button positioned to the right of dropdown */}
                <div
                  style={{
                    marginLeft: "16px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {(searchTerm || selectedSkill) && (
                    <button
                      onClick={clearFilters}
                      className="btn-outline px-6 py-3 whitespace-nowrap"
                    >
                      ✨ Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Clear Search button (centered) */}
          <div className="flex md:hidden justify-center h-10">
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="btn-outline px-6 py-2 whitespace-nowrap"
              >
                ✨ Clear Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results - Fixed dimensions on mobile */}
      <div className={isMobile ? "overflow-x-hidden-mobile" : ""}>
        <div
          ref={resultsContainerRef}
          className={`results-container ${
            isMobile ? "fixed-height-mobile" : ""
          }`}
          style={{
            height: isMobile ? "calc(100vh - 180px)" : "auto", // increased height for more space
            paddingBottom: isMobile ? "2.5rem" : undefined, // extra bottom padding on mobile
            overflow: isMobile ? "auto" : "visible",
            contain: isMobile ? "content" : "none",
            transform: "translateZ(0)", // Force GPU acceleration
            perspective: "1000px", // Create new stacking context
            willChange: "transform", // Hint to browser for optimization
          }}
        >
          {loading ? (
            <ShimmerEffect type="explore" />
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          ) : users.length === 0 || !shouldShowResults ? (
            <div className="text-center py-3 min-h-[120px] flex flex-col items-center justify-center">
              <div className="bg-x-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-x-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-x-white mb-1">
                {(debouncedSearchTerm || selectedSkill) && users.length === 0
                  ? "No developers found"
                  : "Search for developers"}
              </h3>
              <p className="text-x-gray text-xs sm:text-sm max-w-md mx-auto">
                {users.length === 0 && (debouncedSearchTerm || selectedSkill)
                  ? "Try adjusting your search criteria or clear the filters."
                  : users.length === 0
                  ? "No developers have joined yet. Be the first to connect!"
                  : "Enter a search term or select a skill to find developers."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-2 min-h-[100px]">
                <div className="flex items-center justify-between">
                  <p className="text-x-gray text-xs sm:text-sm">
                    <span className="text-x-white font-semibold">
                      {users.length}
                    </span>{" "}
                    developer{users.length !== 1 ? "s" : ""} found
                    {debouncedSearchTerm && (
                      <span className="text-x-blue">
                        {" "}
                        matching "{debouncedSearchTerm}"
                      </span>
                    )}
                    {selectedSkill && (
                      <span className="text-x-green">
                        {" "}
                        with skill "{selectedSkill}"
                      </span>
                    )}
                  </p>
                  <div className="hidden md:block text-xs text-x-gray">
                    💡 Click on profiles to connect
                  </div>
                </div>
              </div>

              <div className="space-y-2 lg:space-y-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="w-full card p-2 sm:p-3 lg:p-6 md:hover:shadow-xl md:hover:shadow-x-blue/20 md:hover:border-x-blue/30 md:transition-all md:duration-300 group bg-gradient-to-br from-x-dark/80 to-x-dark/40 md:backdrop-blur-sm backdrop-blur-none border border-x-border/30"
                  >
                    <div className="w-full">
                      {/* Mobile Layout - Avatar and View Profile Button Horizontal */}
                      <div className="flex items-center justify-between sm:hidden mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg md:group-hover:shadow-x-blue/30 md:transition-all md:duration-300">
                            {user.displayName?.charAt(0).toUpperCase() ||
                              user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-x-white text-base md:group-hover:text-x-blue md:transition-colors md:duration-200 mb-1">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-xs text-x-gray">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.githubLink && (
                            <a
                              href={user.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-x-gray md:hover:text-x-white md:transition-colors md:duration-200 p-2 rounded-lg md:hover:bg-x-dark/60"
                              title="GitHub Profile"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </a>
                          )}
                          <Link
                            to={`/profile/${user.username}`}
                            className="btn-primary text-xs px-3 py-2 md:hover:scale-105 transform md:transition-all md:duration-200 whitespace-nowrap"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Layout - Side by Side with Action Buttons */}
                      <div className="hidden sm:flex items-start justify-between gap-6 mb-4">
                        <div className="flex items-start gap-6 flex-1">
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg md:group-hover:shadow-x-blue/30 md:transition-all md:duration-300">
                              {user.displayName?.charAt(0).toUpperCase() ||
                                user.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-x-white text-xl md:group-hover:text-x-blue md:transition-colors md:duration-200 mb-1">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-base text-x-gray mb-3">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {user.githubLink && (
                            <a
                              href={user.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-x-gray md:hover:text-x-white md:transition-colors md:duration-200 md:hover:scale-110 transform p-2 rounded-lg md:hover:bg-x-dark/60"
                              title="GitHub Profile"
                            >
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </a>
                          )}
                          <Link
                            to={`/profile/${user.username}`}
                            className="btn-primary text-base px-6 py-3 md:hover:scale-105 transform md:transition-all md:duration-200 whitespace-nowrap"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      {/* Bio - Full Width */}
                      {user.bio && (
                        <div className="w-full mb-4">
                          <p className="text-x-gray text-sm lg:text-base leading-relaxed text-left line-clamp-3">
                            "{user.bio}"
                          </p>
                        </div>
                      )}

                      {/* Skills and Meta Info - Full Width */}
                      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-x-border/30">
                        {/* Skills */}
                        {user.skills && user.skills.length > 0 && (
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 justify-start">
                              {user.skills.slice(0, 8).map((skill, index) => (
                                <span
                                  key={index}
                                  className="bg-x-blue/20 text-x-blue border border-x-blue/30 px-3 py-1 rounded-full text-sm font-medium md:hover:bg-x-blue/30 md:transition-colors md:duration-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 8 && (
                                <span className="text-sm text-x-gray px-3 py-1 bg-x-dark/60 rounded-full border border-x-border">
                                  +{user.skills.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Join Date */}
                        <div className="flex items-center justify-start text-sm text-x-gray flex-shrink-0">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Joined{" "}
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
