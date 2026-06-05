import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchType, setSearchType] = useState("all"); // "all", "people", "posts"
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); // New search loading state
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(queryParam);

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
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
    setDebouncedSearchTerm(q);
  }, [searchParams]);

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

  const fetchSearchResults = useCallback(async () => {
    try {
      if (!searchLoading) {
        setLoading(true);
      }
      
      const q = debouncedSearchTerm.trim();
      if (!q) {
        setUsers([]);
        setPosts([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/search?q=${encodeURIComponent(q)}`);
      setUsers(response.data.users || []);
      setPosts(response.data.posts || []);
    } catch (error) {
      setError("Failed to fetch search results");
      console.error("Fetch search error:", error);
    } finally {
      if (!searchLoading) {
        setLoading(false);
      }
    }
  }, [debouncedSearchTerm, searchLoading]);

  // Fetch results when search parameters change
  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

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
      className={`w-full max-w-2xl mx-auto px-0 py-0 pb-6 lg:pb-8 explore-root-container bg-gradient-to-br from-x-dark/10 to-x-dark/5`}
      style={{
        minHeight: isMobile ? "100vh" : "auto",
        height: "auto",
        isolation: "isolate",
        contain: isMobile ? "strict" : "none",
        willChange: isMobile ? "transform" : "auto",
      }}
    >


      {/* Header Section */}
      <div className="px-2 sm:px-3 lg:px-6 pt-6 mb-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Your search space
        </h1>
      </div>

      {/* Search and Filter Controls - Fixed position on mobile when keyboard active */}
      <div
        ref={searchContainerRef}
        className={`search-control-panel p-2 sm:p-3 lg:p-6 mb-1 sm:mb-2 lg:mb-4 mt-2 overflow-x-hidden max-w-full`}
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
              <div
                className={
                  !isMobile
                    ? "flex flex-col gap-2 items-start w-full"
                    : "relative"
                }
              >
                {/* Animated Glowing Search Bar */}
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
                    placeholder="Search anything..."
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-6 mt-6 border-b border-white/10 w-full">
                  {[
                    { id: "all", label: "All" },
                    { id: "people", label: "People" },
                    { id: "posts", label: "Posts" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchType(tab.id)}
                      className={`pb-3 px-1 text-xs font-black tracking-widest transition-all duration-200 border-b-2 -mb-[2px] ${
                        searchType === tab.id
                          ? "border-x-blue text-white"
                          : "border-transparent text-x-gray hover:text-white"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {tab.label.toUpperCase()}
                    </button>
                  ))}
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
          className={`results-container p-2 sm:p-3 lg:p-6 ${
            isMobile ? "fixed-height-mobile" : ""
          }`}
          style={{
            height: isMobile ? "calc(100vh - 180px)" : "auto", // increased height for more space
            paddingBottom: isMobile ? "0.75rem" : undefined, 
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
          ) : (users.length === 0 && posts.length === 0) || !shouldShowResults ? (
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
                {debouncedSearchTerm && users.length === 0 && posts.length === 0
                  ? "No results found"
                  : "Explore DevMate"}
              </h3>
              <p className="text-x-gray text-sm sm:text-base max-w-md mx-auto px-4">
                {users.length === 0 && posts.length === 0 && debouncedSearchTerm
                  ? "Try adjusting your search criteria or explore other keywords."
                  : "Search for developers, skills, or interesting posts to discover the community!"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-x-gray text-xs sm:text-sm font-bold tracking-tight text-right">
                  <span className="text-x-white">
                    {users.length + posts.length}
                  </span>{" "}
                  results found
                </p>
              </div>

              {/* Users Section */}
              {users.length > 0 && (searchType === "all" || searchType === "people") && (
                <div className="mb-10">
                  <div className="space-y-2 lg:space-y-4">
                {users.map((user) => {
                  return (
                    <div
                      key={user._id}
                      className="w-full card transition-all duration-200 bg-transparent border-b border-white/10 pb-4"
                    >
                      <div className="w-full">
                        {/* Mobile Layout - Avatar and View Profile Button Horizontal */}
                        <div className="flex items-center justify-between sm:hidden">
                          <div className="flex items-center gap-3">
                            <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg overflow-hidden relative flex-shrink-0">
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
                              className="p-2 transition-all duration-200 bg-black text-white hover:bg-white hover:text-black rounded-full border border-white shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                              title="View Profile"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>

                        {/* Desktop Layout - Side by Side with Action Buttons */}
                        <div className="hidden sm:flex items-center justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="flex-shrink-0">
                              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden relative">
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
                              <p className="text-base text-x-gray">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Link
                              to={`/profile/${user.username}`}
                              className="text-base px-6 py-3 transition-all duration-200 whitespace-nowrap bg-black border border-white text-white rounded-full hover:bg-white hover:text-black font-bold shadow-lg"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {posts.length > 0 && (searchType === "all" || searchType === "posts") && (
                <div className="mb-10">
                  <div className="space-y-3 sm:space-y-4">
                    {posts.map((post) => (
                      <Link
                        key={post._id}
                        to={`/post/${post._id}`}
                        className="block bg-transparent hover:bg-white/5 border-b border-white/10 py-4 px-0 transition-all group relative"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                              {post.author?.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-x-dark flex items-center justify-center font-bold text-white uppercase text-xs">
                                  {post.author?.username?.charAt(0) || "P"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-bold text-white text-base sm:text-lg group-hover:text-x-blue transition-colors truncate">
                                  {post.title}
                                </h4>
                                
                                {/* View Arrow - Aligned with Title */}
                                <div className="flex-shrink-0 transform group-hover:translate-x-1 transition-transform duration-200">
                                  <svg className="w-5 h-5 text-x-gray group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-x-gray font-medium">@{post.author?.username}</span>
                                <span className="text-[10px] text-white/20">•</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-tighter">
                                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="text-sm text-x-gray mt-3 line-clamp-2 pl-14 opacity-80 group-hover:opacity-100 transition-opacity"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
