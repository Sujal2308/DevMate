import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import PostCard from "../components/PostCard";
import FakeFeedLoader from "../components/FakeFeedLoader";
import MinimalMessageModal from "../components/MinimalMessageModal";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const loaderRef = useRef(null);
  const { hasUnread } = useNotification();
  const { user } = useAuth();
  const location = useLocation();

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

  // Check if user should see modal on each login session
  useEffect(() => {
    if (user) {
      const hasSeenFeedModalThisSession =
        sessionStorage.getItem("hasSeenFeedModal");
      if (!hasSeenFeedModalThisSession) {
        setShowModal(true);
      } else {
        // Auto-fetch posts if user has seen modal in this session
        fetchPosts();
      }
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

  const handleModalReload = () => {
    sessionStorage.setItem("hasSeenFeedModal", "true");
    setShowModal(false);
    fetchPosts();
  };

  const handleModalClose = () => {
    sessionStorage.setItem("hasSeenFeedModal", "true");
    setShowModal(false);
    setLoading(false);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="relative">
        <ShimmerEffect type="feed" />
        <MinimalMessageModal
          isOpen={showModal}
          onClose={handleModalClose}
          onReload={handleModalReload}
        />
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
        <MinimalMessageModal
          isOpen={showModal}
          onClose={handleModalClose}
          onReload={handleModalReload}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8 x-main border-l border-r border-x-border/50 bg-gradient-to-br from-x-dark/10 to-x-dark/5${
        loading && posts.length === 0 ? " loading" : ""
      }`}
    >
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 lg:mb-8 gap-2 sm:gap-4">
        {/* Mobile Branded Header */}
        <h1 
          className="flex sm:hidden items-center gap-2 ml-3"
          style={{ fontFamily: "'Lobster', sans-serif" }}
        >
          <img 
            src="/icons/puzzle.png" 
            alt="DevMate" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-2xl text-x-white">
            DevMate
          </span>
        </h1>

        {/* Desktop Title */}
        <h1 className="hidden sm:block text-xl sm:text-2xl lg:text-3xl font-bold text-x-white ml-4 lg:ml-6">
          Feed
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile news icon */}
          <Link
            to="/news"
            className={`inline sm:hidden p-2 transition-all duration-200 ${
              location.pathname === "/news" ? "text-x-blue" : "text-white"
            }`}
            aria-label="News"
          >
            <svg
              className="w-6 h-6"
              fill={location.pathname === "/news" ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </Link>
          {/* Mobile notification bell icon */}
          <Link
            to="/notifications"
            className={`inline sm:hidden p-2 mr-3 transition-all duration-200 relative ${
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
          <Link
            to="/create-post"
            className="hidden sm:flex font-medium text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-2 rounded-full transition-all duration-300 bg-blue-900 text-white focus:outline-none hover:bg-blue-800 no-underline items-center gap-2"
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
            Create
          </Link>
        </div>
      </div>

      {posts.length === 0 && !loading ? (
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
            className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-blue-800 transition-colors text-sm sm:text-base font-medium no-underline"
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

      <MinimalMessageModal
        isOpen={showModal}
        onClose={handleModalClose}
        onReload={handleModalReload}
      />
    </div>
  );
};

export default Feed;
