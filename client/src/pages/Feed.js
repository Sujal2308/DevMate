import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import PostCard from "../components/PostCard";
import FakeFeedLoader from "../components/FakeFeedLoader";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import SearchComponent from "../components/ui/animated-glowing-search-bar";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchPosts, setSearchPosts] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchCommunities, setSearchCommunities] = useState([]);
  const [searchTab, setSearchTab] = useState("posts"); // "posts", "people", "communities"
  const [searchLoading, setSearchLoading] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const [joiningCommunityId, setJoiningCommunityId] = useState(null);

  const handleJoinLeaveCommunity = async (community) => {
    setJoiningCommunityId(community._id);
    try {
      const token = localStorage.getItem("token");
      const currentUserId = user?._id || user?.id;
      const isMember = community.members?.includes(currentUserId);
      const action = isMember ? "leave" : "join";
      
      await axios.post(`/api/communities/${action}/${community._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchCommunities((prev) =>
        prev.map((c) => {
          if (c._id === community._id) {
            const updatedMembers = isMember
              ? c.members.filter((id) => id !== currentUserId)
              : [...(c.members || []), currentUserId];
            return {
              ...c,
              members: updatedMembers,
              memberCount: isMember ? (c.memberCount || 1) - 1 : (c.memberCount || 0) + 1,
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Failed to join/leave community from search", err);
    } finally {
      setJoiningCommunityId(null);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDebouncedSearchTerm("");
      setSearchPosts([]);
      setSearchUsers([]);
      setSearchCommunities([]);
      setSearchTab("posts");
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(debouncedSearchTerm.trim())}`);
        setSearchPosts(res.data.posts || []);
        setSearchUsers(res.data.users || []);
        setSearchCommunities(res.data.communities || []);
      } catch (err) {
        console.error("Search error on feed", err);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedSearchTerm]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const loaderRef = useRef(null);
  const { hasUnread } = useNotification();
  const { user } = useAuth();
  const location = useLocation();

  // Mobile menu states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [isCommunitiesDropdownOpen, setIsCommunitiesDropdownOpen] = useState(false);

  // Fetch communities for dropdown
  useEffect(() => {
    if (isMobileMenuOpen && communities.length === 0) {
      const fetchCommunities = async () => {
        try {
          const res = await axios.get("/api/communities");
          setCommunities(res.data.filter(c => c.isMember));
        } catch (err) {
          console.error("Failed to fetch communities for menu", err);
        }
      };
      fetchCommunities();
    }
  }, [isMobileMenuOpen, communities.length]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);

      // Increase timeout for initial load to handle Azure cold starts
      const timeoutDuration = pageNum === 1 ? 30000 : 8000; // 30s for first load, 8s for pagination

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Posts fetch timeout")),
          timeoutDuration
        )
      );

      const postsPromise = axios.get(`/api/posts?page=${pageNum}&limit=10`);

      const response = await Promise.race([postsPromise, timeoutPromise]);

      if (pageNum === 1) {
        setPosts(response.data.posts);
        setError(""); // Clear error on successful fetch
      } else {
        setPosts((prev) => [...prev, ...response.data.posts]);
        setError(""); // Clear error on successful fetch
      }

      setHasMore(
        response.data.pagination.current < response.data.pagination.pages
      );
      setPage(pageNum);
    } catch (error) {
      setError("Unable to load posts. Please try again.");
      console.error("Fetch posts error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Auto-fetch posts on load
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // Intersection observer effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
        if (entry.isIntersecting && !hasMore && !showEndMessage) {
          setTimeout(() => {
            setShowEndMessage(true);
          }, 2000);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, loading, showEndMessage, loadMore]);

  // Body class effect
  useEffect(() => {
    if (loading && posts.length === 0) {
      document.body.classList.add("body--loading-feed");
    } else {
      document.body.classList.remove("body--loading-feed");
    }
    return () => {
      document.body.classList.remove("body--loading-feed");
    };
  }, [loading, posts.length]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(posts.filter((post) => post._id !== deletedPostId));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="relative">
        <ShimmerEffect type="feed" />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="relative">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-x-white mb-2">Oops! Something went wrong</h3>
          <p className="text-x-gray mb-6 max-w-md">{error}</p>
          <button 
            onClick={() => fetchPosts(1)}
            className="bg-x-blue text-white px-6 py-2 rounded-full hover:bg-x-blue/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8 x-main border-l border-r border-x-border/50 bg-gradient-to-br from-x-dark/10 to-x-dark/5${
        loading && posts.length === 0 ? " loading" : ""
      }`}
    >
      {/* Spacer to prevent content from going behind fixed header */}
      <div className="h-16 sm:h-20 w-full shrink-0" />

      <div 
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[50] flex flex-row justify-between items-center gap-2 sm:gap-4 transition-all duration-300 px-0 sm:px-6 lg:px-8 ${
          isScrolled 
            ? "bg-black/95 backdrop-blur-md pt-2 pb-2 sm:py-3 border-b border-white/10 shadow-lg shadow-black/25" 
            : "bg-black/95 border-b border-white/10 pt-2 pb-2 shadow-lg shadow-black/25 sm:bg-transparent sm:py-4 sm:border-b-transparent sm:shadow-none"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        {/* Mobile Branded Header */}
        <h1 
          className="flex sm:hidden items-center relative h-8 ml-3"
        >
          {/* Unscrolled State: DevMate Brand Logo + Text */}
          <div 
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              isScrolled 
                ? "opacity-0 scale-90 pointer-events-none translate-y-[-4px]" 
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <img 
              src="/icons/puzzle.png" 
              alt="DevMate" 
              className="w-8 h-8 object-contain"
              width="32"
              height="32"
              fetchpriority="high"
            />
            <span className="text-2xl font-normal text-x-white lobster-regular">
              DevMate
            </span>
          </div>

          {/* Scrolled State: Feed Text */}
          <span 
            className={`absolute left-0 text-xl font-black text-white tracking-tight uppercase tracking-[0.15em] transition-all duration-300 ease-in-out ${
              isScrolled 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-90 pointer-events-none translate-y-[4px]"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Feed
          </span>
        </h1>

        {/* Desktop Header Content Container (hidden on mobile) */}
        <div className="hidden sm:flex flex-row items-center w-full">
          
          {/* Feed Title (Left side on Scroll) */}
          <div className={`transition-all duration-300 overflow-hidden ${
            isScrolled ? "w-auto opacity-100" : "w-0 opacity-0 pointer-events-none"
          }`}>
            <h1 
              className="text-xl font-black text-white tracking-tight ml-4 lg:ml-6 uppercase tracking-[0.15em] select-none cursor-pointer hover:text-x-blue transition-colors" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Feed
            </h1>
          </div>

          {/* Single Search Component wrapper */}
          <div className={`transition-all duration-300 ease-in-out ${
            isScrolled 
              ? "max-w-[280px] ml-auto mr-3 sm:mr-4 flex-1" 
              : "max-w-[320px] ml-3 flex-1"
          }`}>
            <SearchComponent
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
              clearSearch={() => setSearchTerm("")}
              placeholder="Search anything..."
            />
          </div>

          {/* Action Items */}
          <div className={`flex items-center gap-2 sm:gap-3 ${!isScrolled ? "ml-auto" : "ml-0"}`}>
            {/* Desktop Notification Icon - Hidden on Scroll */}
            {!isScrolled && (
              <Link
                to="/notifications"
                className={`flex p-2 transition-all duration-200 relative items-center justify-center ${
                  location.pathname === "/notifications" ? "text-x-blue" : (hasUnread ? "text-x-red" : "text-x-white")
                } hover:bg-x-blue/10 rounded-full`}
                title="Notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={location.pathname === "/notifications" ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="w-6 h-6"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-x-dark"></span>
                )}
              </Link>
            )}

            {/* Desktop Create Button - Collapsed to Icon on Scroll */}
            <Link
              to="/create-post"
              className={`flex items-center justify-center transition-all duration-300 bg-black border border-white/20 text-white focus:outline-none hover:bg-white hover:text-black no-underline shadow-xl ${
                isScrolled 
                  ? "w-9 h-9 rounded-full" 
                  : "font-black uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-full gap-2"
              }`}
              title="Create Post"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {!isScrolled && "Create"}
            </Link>
          </div>

        </div>

        {/* Mobile-only notifications and menu buttons */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile notification bell icon */}
          <Link
            to="/notifications"
            className={`inline p-2 mr-3 transition-all duration-200 relative ${
              location.pathname === "/notifications" ? "text-x-blue" : (hasUnread ? "text-x-red" : "text-white")
            }`}
            aria-label="Notifications"
            style={{
              fontSize: 24,
              filter: (hasUnread && location.pathname !== "/notifications") ? "drop-shadow(0 0 8px #F91880)" : "none",
              transition: "color 0.2s, filter 0.2s",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={location.pathname === "/notifications" ? "currentColor" : "#ffffff"}
              width="24"
              height="24"
            >
              <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex p-2 mr-3 text-white transition-all duration-200"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {searchTerm.trim() !== "" ? (
        <div 
          className="fixed top-[64px] sm:top-[80px] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[45] bg-[#000000] border-l border-r border-x-border/50 overflow-y-auto h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24"
          style={{ boxSizing: "border-box" }}
        >
          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-white/10 w-full px-4 sm:px-6">
            {[
              { id: "posts", label: "Posts" },
              { id: "people", label: "People" },
              { id: "communities", label: "Communities" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchTab(tab.id)}
                className={`pb-3 px-1 text-xs font-black tracking-widest transition-all duration-200 border-b-2 -mb-[2px] ${
                  searchTab === tab.id
                    ? "border-x-blue text-white"
                    : "border-transparent text-x-gray hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {searchLoading ? (
            <div className="relative">
              <ShimmerEffect type="feed" />
            </div>
          ) : (
            <>
              {searchTab === "posts" && (
                searchPosts.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {searchPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onUpdate={(updatedPost) => {
                          setSearchPosts(searchPosts.map(p => p._id === updatedPost._id ? updatedPost : p));
                        }}
                        onDelete={(deletedPostId) => {
                          setSearchPosts(searchPosts.filter(p => p._id !== deletedPostId));
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <h3 className="text-lg text-gray-500 mb-2 font-bold text-x-white">No posts found</h3>
                    <p className="text-sm text-x-gray">
                      We couldn't find any posts matching "{searchTerm}"
                    </p>
                  </div>
                )
              )}

              {searchTab === "people" && (
                searchUsers.length > 0 ? (
                  <div className="space-y-4 px-3 sm:px-5">
                    {searchUsers.map((u) => (
                      <div
                        key={u._id}
                        className="flex flex-col p-6 bg-[#16181C] md:bg-[#0a192f]/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 shadow-xl animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Link to={`/profile/${u.username}`} className="shrink-0">
                              <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg overflow-hidden relative border border-white/10">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  (u.displayName || u.username).charAt(0).toUpperCase()
                                )}
                              </div>
                            </Link>
                            <div className="flex flex-col min-w-0 gap-0.5">
                              <Link to={`/profile/${u.username}`}>
                                <h3 className="font-black text-white text-sm tracking-tight truncate leading-tight hover:text-x-blue transition-colors">
                                  {u.displayName || u.username}
                                </h3>
                              </Link>
                              <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest leading-none">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/profile/${u.username}`}
                            className="px-6 py-2 shrink-0 flex items-center justify-center rounded-full transition-all font-black text-[11px] uppercase tracking-widest bg-white text-black hover:bg-neutral-200 font-bold"
                          >
                            View
                          </Link>
                        </div>
                        {u.bio && (
                          <p className="text-white/90 text-sm leading-relaxed line-clamp-3 transition-opacity mb-3">
                            {u.bio}
                          </p>
                        )}
                        {u.skills && u.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {u.skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 rounded text-x-gray/90"
                              >
                                {skill}
                              </span>
                            ))}
                            {u.skills.length > 5 && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 rounded text-x-gray/50">
                                +{u.skills.length - 5} MORE
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <h3 className="text-lg text-gray-500 mb-2 font-bold text-x-white">No people found</h3>
                    <p className="text-sm text-x-gray">
                      We couldn't find any developers matching "{searchTerm}"
                    </p>
                  </div>
                )
              )}

              {searchTab === "communities" && (
                searchCommunities.length > 0 ? (
                  <div className="space-y-4 px-3 sm:px-5">
                    {searchCommunities.map((c) => {
                      const isMember = c.members?.includes(user?._id || user?.id);
                      return (
                        <div
                          key={c._id}
                          className="flex flex-col p-6 bg-[#16181C] md:bg-[#0a192f]/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 shadow-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Link to={`/community/${c.slug}`} className="shrink-0">
                                <div
                                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl overflow-hidden"
                                  style={!c.icon?.startsWith("/") ? { background: `${c.color || "#1d9bf0"}10` } : {}}
                                >
                                  {c.icon?.startsWith("/") ? (
                                    <img src={c.icon} alt="" className="w-full h-full object-contain p-1.5" />
                                  ) : (
                                    c.icon || c.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                              </Link>
                              <div className="flex flex-col min-w-0 gap-0.5">
                                <Link to={`/community/${c.slug}`}>
                                  <h3 className="font-black text-white text-sm tracking-tight truncate leading-tight hover:text-x-blue transition-colors">
                                    {c.name}
                                  </h3>
                                </Link>
                                <p className="text-[9px] font-medium text-white uppercase tracking-widest opacity-40">
                                  {(c.members?.length || 0).toLocaleString()} members
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleJoinLeaveCommunity(c)}
                              disabled={joiningCommunityId === c._id}
                              className={`px-6 py-2 shrink-0 flex items-center justify-center rounded-full transition-all font-black text-[11px] uppercase tracking-widest ${
                                isMember
                                  ? "bg-white/5 border border-white/20 text-x-gray hover:text-red-400 hover:border-red-500/50"
                                  : "bg-x-blue text-white shadow-lg shadow-x-blue/20 hover:scale-105 active:scale-95"
                              }`}
                            >
                              {joiningCommunityId === c._id ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isMember ? (
                                "Joined"
                              ) : (
                                "Join"
                              )}
                            </button>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed line-clamp-3 transition-opacity">
                            {c.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <h3 className="text-lg text-gray-500 mb-2 font-bold text-x-white">No communities found</h3>
                    <p className="text-sm text-x-gray">
                      We couldn't find any communities matching "{searchTerm}"
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      ) : posts.length === 0 && !loading ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m-7-6v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3">
            No posts yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            Be the first to share something with the community!
          </p>
          <Link
            to="/create-post"
            className="inline-flex items-center gap-2 bg-black border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all text-sm sm:text-base font-black uppercase tracking-widest no-underline shadow-xl"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDelete}
            />
          ))}

          {loading && posts.length > 0 && (
            <div className="py-4 sm:py-6">
              <FakeFeedLoader />
            </div>
          )}

          <div ref={loaderRef} className="h-4"></div>

          {!loading && !hasMore && !showEndMessage && posts.length > 0 && (
            <div className="py-4 sm:py-6">
              <FakeFeedLoader />
            </div>
          )}

          {showEndMessage && !hasMore && posts.length > 0 && (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-500 text-sm sm:text-base">
                🎉 You've reached the end! Great job exploring.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Menu Drawer */}
          <div className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <div className="flex items-center ml-2">
                <img 
                  src="/icons/puzzle.png" 
                  alt="DevMate" 
                  className="w-8 h-8 object-contain"
                  width="32"
                  height="32"
                />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full bg-white/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
              <Link
                to="/communities"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Discover Communities
              </Link>
              
              <Link
                to="/news"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Read News
              </Link>

              <Link
                to={`/profile/${user?.username}#posts`}
                state={{ scrollToPosts: true }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Posts
              </Link>

              <Link
                to="/create-post"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Post
              </Link>

              {/* Dropdown for Your Communities */}
              <div className="flex flex-col mt-2">
                <button
                  onClick={() => setIsCommunitiesDropdownOpen(!isCommunitiesDropdownOpen)}
                  className="flex items-center justify-between px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium w-full"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Your Communities
                  </div>
                  <svg 
                    className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isCommunitiesDropdownOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isCommunitiesDropdownOpen && (
                  <div className="mt-2 ml-0 pl-0 flex flex-col gap-2">
                    {communities.length > 0 ? (
                      communities.map(c => (
                        <Link
                          key={c._id}
                          to={`/community/${c.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 px-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <div 
                            className={`w-7 h-7 rounded flex items-center justify-center text-xs shrink-0 overflow-hidden ${c.icon?.startsWith("/") ? "bg-transparent border-none" : ""}`}
                            style={c.icon?.startsWith("/") ? {} : {
                              background: c.color ? `${c.color}20` : "rgba(255,255,255,0.05)",
                              border: c.color ? `1px solid ${c.color}30` : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {c.icon?.startsWith("/") ? (
                              <img src={c.icon} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="font-bold text-[10px]" style={{ color: c.color || "#ffffff" }}>
                                {c.icon || c.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="truncate">{c.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500 italic">No communities joined yet.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

             {/* Footer Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/logout-confirm");
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-full transition-colors font-bold shadow-lg shadow-red-900/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Feed;
