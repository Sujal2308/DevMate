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
import SearchComponent from "../components/ui/animated-glowing-search-bar";

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
    // Only show results if search is active (for both mobile and desktop)
    return debouncedSearchTerm.trim() !== "";
  }, [debouncedSearchTerm]);

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
      const skillInput = null; // Removed skill dropdown

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

      // No auto-focus logic needed for skills anymore
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
  }, [debouncedSearchTerm, searchLoading]);

  // Fetch users when search parameters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Skills filter logic removed

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

  // handleSkillChange removed


  return (
    <div
      ref={rootContainerRef}
      className={`w-full max-w-2xl mx-auto py-1 sm:py-2 lg:py-6 px-2 sm:px-3 lg:px-6 pb-6 lg:pb-8 explore-root-container bg-gradient-to-br from-x-dark/10 to-x-dark/5`}
      style={{
        minHeight: isMobile ? "100vh" : "auto",
        height: "auto",
        isolation: "isolate",
        contain: isMobile ? "strict" : "none",
        willChange: isMobile ? "transform" : "auto",
      }}
    >

      {/* Search and Filter Controls - Fixed position on mobile when keyboard active */}
      <div
        ref={searchContainerRef}
        className={`search-control-panel p-2 sm:p-3 lg:p-6 mb-1 sm:mb-2 lg:mb-4 mt-4-mobile overflow-x-hidden max-w-full`}
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
                className="block text-sm font-bold text-x-white mb-2 sm:mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Search by name or username
              </label>
              <div
                className={
                  !isMobile
                    ? "flex flex-col gap-2 items-start w-full"
                    : "relative"
                }
              >
                {/* Large Search Bar Row */}
                <div className="w-full">
                  <SearchComponent
                    ref={searchInputRef}
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
                    clearSearch={() => setSearchTerm("")}
                    placeholder="Search developers..."
                  />
                </div>
              </div>
            </div>
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
            paddingBottom: isMobile ? "0.75rem" : undefined, 
            paddingLeft: isMobile ? "0.5rem" : undefined,
            paddingRight: isMobile ? "0.5rem" : undefined,
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
              className={`text-center py-6 sm:py-10 flex flex-col items-center justify-center${
                isMobile ? " mt-4 mobile-center-section" : ""
              }`}
            >
              <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/Team work-pana.svg"
                  alt="Search for developers"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                  width="256"
                  height="256"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-x-white mb-3">
                {debouncedSearchTerm && users.length === 0
                  ? "No developers found"
                  : "Find Your Perfect Team"}
              </h3>
              <p className="text-x-gray text-sm sm:text-base max-w-md mx-auto px-4">
                {users.length === 0 && debouncedSearchTerm
                  ? "Try adjusting your search criteria or explore other keywords."
                  : "Search for developers by name or username to start collaborating on your next big project!"}
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
                  </p>
                  <div className="hidden md:block text-xs text-x-gray">
                    💡 Click on profiles to connect
                  </div>
                </div>
              </div>

              <div className="space-y-2 lg:space-y-4">
                {users.map((user) => {
                  return (
                    <div
                      key={user._id}
                      className={`w-full card p-2 sm:p-3 lg:p-6 hover:border-x-border/50 transition-colors duration-200 bg-gradient-to-br from-x-dark/80 to-x-dark/40 md:backdrop-blur-sm backdrop-blur-none border border-x-border/30 ${
                        isMobile ? "rounded-full overflow-hidden px-5 py-3" : "rounded-xl"
                      }`}
                    >
                      <div className="w-full">
                        {/* Mobile Layout - Avatar and View Profile Button Horizontal */}
                        <div className="flex items-center justify-between sm:hidden mb-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg border-2 border-[#a259f7] overflow-hidden relative flex-shrink-0">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.displayName} 
                                  className="w-full h-full object-cover" 
                                  width="48"
                                  height="48"
                                  loading="lazy"
                                />
                              ) : (
                                user.displayName?.charAt(0).toUpperCase() ||
                                user.username.charAt(0).toUpperCase()
                              )}
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
                              className="text-xs px-4 py-2 transition-all duration-200 whitespace-nowrap bg-x-blue text-white hover:bg-x-blue-hover rounded-full border border-white/10 shadow-lg font-bold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>

                        {/* Expanded details for mobile only */}


                        {/* Desktop Layout - Side by Side with Action Buttons */}
                        <div className="hidden sm:flex items-start justify-between gap-6 mb-4">
                          <div className="flex items-start gap-6 flex-1">
                            <div className="flex-shrink-0">
                              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg border-2 border-[#a259f7] overflow-hidden relative">
                                {user.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.displayName} 
                                    className="w-full h-full object-cover" 
                                    width="64"
                                    height="64"
                                    loading="lazy"
                                  />
                                ) : (
                                  user.displayName?.charAt(0).toUpperCase() ||
                                  user.username.charAt(0).toUpperCase()
                                )}
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
                              className="text-base px-6 py-3 transition-all duration-200 whitespace-nowrap bg-x-blue text-white rounded-full hover:bg-x-blue-hover font-bold shadow-lg shadow-x-blue/20"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>

                        {/* Bio - Full Width (desktop only) */}
                        {!isMobile && user.bio && (
                          <div className="w-full mb-4">
                            <p className="text-x-gray text-sm lg:text-base leading-relaxed text-left line-clamp-3">
                              "{user.bio}"
                            </p>
                          </div>
                        )}

                        {/* Skills and Meta Info - Full Width (desktop only) */}
                        {!isMobile && (
                          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-x-border/30">
                            {/* Skills */}
                            {user.skills && user.skills.length > 0 && (
                              <div className="flex-1">
                                <div className="flex flex-wrap gap-2 justify-start">
                                  {user.skills
                                    .slice(0, 8)
                                    .map((skill, index) => (
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
                                { year: "numeric", month: "short" }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
