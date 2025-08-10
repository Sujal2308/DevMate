import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";

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
  const [searchLoading, setSearchLoading] = useState(false); // New search loading state
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
      // Remove fixed height and overflow logic for natural scroll
      rootContainerRef.current.style.height = "";
      rootContainerRef.current.style.overflow = "";
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

    // Keep search results visible
    setIsKeyboardOpen(false);

    // Force immediate search
    setDebouncedSearchTerm(searchTerm);
  };

  // Input focus handling with improved mobile experience
  const handleSearchFocus = () => {
    if (isMobile) {
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

  useEffect(() => {
    let debounceTimeout = null;

    // Cancel any pending updates
    clearTimeout(debounceTimeout);

    // If there's a search term, show search loading immediately
    if (searchTerm.trim() !== "") {
      setSearchLoading(true);
    }

    // Set a longer debounce for input to minimize flickering
    debounceTimeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Keep search loading for a minimum of 1 second for better UX
      setTimeout(() => {
        setSearchLoading(false);
      }, 1000);
    }, 500); // Increased debounce time for smoother experience

    return () => {
      clearTimeout(debounceTimeout);
      // Clear search loading if component unmounts or searchTerm changes
      if (searchTerm.trim() === "") {
        setSearchLoading(false);
      }
    };
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      // Only set main loading if this is not a search operation
      if (!searchLoading) {
        setLoading(true);
      }
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (selectedSkill) params.append("skill", selectedSkill);

      const response = await axios.get(`/api/users?${params.toString()}`);
      setUsers(response.data);
    } catch (error) {
      setError("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      if (!searchLoading) {
        setLoading(false);
      }
    }
  }, [debouncedSearchTerm, selectedSkill, searchLoading]);

  // Fetch users when search parameters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

    // Show search loading when skill filter changes
    setSearchLoading(true);
    setSelectedSkill(e.target.value);

    // Keep search loading for a minimum of 1 second
    setTimeout(() => {
      setSearchLoading(false);
    }, 1000);
  };

  const clearFilters = () => {
    // Show search loading when clearing filters
    setSearchLoading(true);

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

    // Keep search loading for a minimum of 1 second
    setTimeout(() => {
      setSearchLoading(false);
    }, 1000);
  };

  return (
    <div
      ref={rootContainerRef}
      className={`w-full max-w-2xl mx-auto py-1 sm:py-2 lg:py-6 px-2 sm:px-3 lg:px-6 pb-16 lg:pb-8 explore-root-container bg-gradient-to-br from-x-dark/10 to-x-dark/5`}
      style={{
        minHeight: isMobile ? "100vh" : "auto",
        height: "auto",
        isolation: "isolate",
        contain: isMobile ? "strict" : "none",
        willChange: isMobile ? "transform" : "auto",
      }}
    >
      {/* Hero Section - Reduced when keyboard active */}
      {!isMobile && (
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
          <h1
            className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-x-white mb-1 lg:mb-2 explore-mobile-heading flex items-center gap-3"
            style={{
              fontFamily:
                '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Courier New", monospace',
            }}
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-x-blue"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
            <span className="inline sm:hidden">discover</span>
            <span className="hidden sm:inline bg-gradient-to-r from-[#C0C0C0] via-[#E0E0E0] to-[#A9A9A9] bg-clip-text text-transparent">
              explore
            </span>
          </h1>
          <p className="text-x-gray text-xs sm:text-sm lg:text-base max-w-2xl">
            Discover and connect with talented developers in the DevMate
            community. Find your next collaborator, mentor, or coding buddy.
          </p>
        </div>
      )}

      {/* Search and Filter Controls - Fixed position on mobile when keyboard active */}
      <div
        ref={searchContainerRef}
        className={`card search-control-panel p-2 sm:p-3 lg:p-6 mb-1 sm:mb-2 lg:mb-4 bg-gradient-to-r from-x-dark/50 to-x-dark/30 md:backdrop-blur-sm backdrop-blur-none border border-x-border/50 mt-4-mobile overflow-x-hidden max-w-full`}
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
              {!isMobile && (
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-x-white mb-2 sm:mb-3"
                >
                  🔍 Search by name or username
                </label>
              )}
              <div
                className={
                  !isMobile
                    ? "flex flex-col gap-2 items-start w-full"
                    : "relative"
                }
              >
                {/* Large Search Bar Row */}
                <div className="relative w-full flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    id="search"
                    className="w-full bg-x-black/60 border border-x-border text-x-white placeholder-x-gray rounded-xl px-6 py-4 pr-16 text-lg font-mono transform-gpu animated-gradient-border focus:pr-16 focus:outline-none focus:ring-0 focus:border-x-border autofill:!bg-x-black/60"
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
                    autoComplete="on"
                  />
                  {/* Clear (cross) icon inside search bar */}
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-x-gray hover:text-x-blue focus:outline-none text-2xl px-2"
                      tabIndex={0}
                      aria-label="Clear search"
                      style={{ zIndex: 2 }}
                    >
                      ×
                    </button>
                  )}
                  {/* Small search button */}
                  <button
                    type="button"
                    onClick={executeSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-x-blue hover:bg-x-green text-white rounded-full p-2 shadow-md focus:outline-none transition-colors"
                    style={{
                      width: "2.2rem",
                      height: "2.2rem",
                      minWidth: "2.2rem",
                      zIndex: 1,
                    }}
                    aria-label="Search"
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 20L16.65 16.65"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {/* Skill dropdown row (moved below search bar) */}
                {!isMobile && allSkills.length > 0 && (
                  <div className="mt-2 w-full flex items-center">
                    <select
                      id="skill"
                      value={selectedSkill}
                      onChange={handleSkillChange}
                      className="skill-dropdown bg-x-dark border border-x-border text-x-white focus:outline-none focus:border-x-blue transition-colors min-w-[120px] shadow-md px-3 py-2 h-10"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%23e7e9ea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.1em",
                        appearance: "none",
                        borderRadius: 0,
                      }}
                    >
                      <option value="">All Skills</option>
                      {allSkills.map((skill) => (
                        <option
                          key={skill}
                          value={skill}
                          className="dropdown-option"
                        >
                          {skill}
                        </option>
                      ))}
                    </select>
                    {/* Clear filter button for desktop only */}
                    {(searchTerm || selectedSkill) && (
                      <button
                        onClick={clearFilters}
                        className="ml-4 px-2 py-2 bg-transparent border-none text-x-blue hover:text-x-green transition-colors text-base font-mono font-semibold shadow-none focus:outline-none focus:underline flex items-center gap-1"
                        style={{
                          boxShadow: "none",
                          background: "none",
                          border: "none",
                        }}
                      >
                        <span>Clear</span>
                        <span role="img" aria-label="sparkles">
                          ✨
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Mobile-only tip below the search bar */}
        {isMobile && (
          <div
            className="mt-2 text-xs text-x-gray rounded-lg px-3 py-2 flex items-center gap-2 animate-fade-in"
            style={{ background: "none", border: "none" }}
          >
            <span role="img" aria-label="tip">
              💡
            </span>
            <span>
              Tip: Use the search bar to find developers by name or username.
              Tap a profile to connect!
            </span>
          </div>
        )}
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
          {loading || searchLoading ? (
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
            <div
              className={`text-center py-3 min-h-[120px] flex flex-col items-center justify-center${
                isMobile ? " mt-8 mobile-center-section" : ""
              }`}
            >
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
                    className="w-full card p-2 sm:p-3 lg:p-6 hover:border-x-border/50 transition-colors duration-200 bg-gradient-to-br from-x-dark/80 to-x-dark/40 md:backdrop-blur-sm backdrop-blur-none border border-x-border/30"
                  >
                    <div className="w-full">
                      {/* Mobile Layout - Avatar and View Profile Button Horizontal */}
                      <div className="flex items-center justify-between sm:hidden mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                            {user.displayName?.charAt(0).toUpperCase() ||
                              user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-x-white text-base mb-1">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-xs text-x-gray">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/profile/${user.username}`}
                            className="text-xs px-3 py-2 transition-colors duration-200 whitespace-nowrap bg-[#ff6347] text-white rounded-full hover:bg-[#e5533c]"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Layout - Side by Side with Action Buttons */}
                      <div className="hidden sm:flex items-start justify-between gap-6 mb-4">
                        <div className="flex items-start gap-6 flex-1">
                          <div className="flex-shrink-0">
                            <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                              {user.displayName?.charAt(0).toUpperCase() ||
                                user.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-x-white text-xl mb-1">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-base text-x-gray mb-3">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Link
                            to={`/profile/${user.username}`}
                            className="text-base px-6 py-3 transition-colors duration-200 whitespace-nowrap bg-[#ff6347] text-white rounded-full hover:bg-[#e5533c]"
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
                                  className="bg-x-blue/20 text-x-blue border border-x-blue/30 px-3 py-1 rounded-full text-sm font-medium hover:bg-x-blue/30 transition-colors duration-200"
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
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #181c24 inset !important;
            box-shadow: 0 0 0 1000px #181c24 inset !important;
            -webkit-text-fill-color: #fff !important;
            caret-color: #fff !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>
    </div>
  );
};

export default Explore;
