import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import PostCard from "../components/PostCard";
import FakeFeedLoader from "../components/FakeFeedLoader";
import { useNotification } from "../contexts/NotificationContext";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [minLoading, setMinLoading] = useState(true); // New: for 10s shimmer
  const loaderRef = useRef(null);
  const minLoadingTimer = useRef(null);
  const { hasUnread } = useNotification();

  useEffect(() => {
    fetchPosts();
    // Always show shimmer for at least 10s
    minLoadingTimer.current = setTimeout(() => {
      setMinLoading(false);
    }, 10000);
    return () => clearTimeout(minLoadingTimer.current);
  }, []);

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

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, showEndMessage, loadMore]);

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

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);

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
      setError("Failed to fetch posts");
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

  const handlePostUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(posts.filter((post) => post._id !== deletedPostId));
  };

  if ((loading || error) && posts.length === 0 && minLoading) {
    // Always show shimmer for first 10s if loading or error and no posts
    return <ShimmerEffect type="feed" />;
  }

  // After 10s, if error and no posts, show error/info
  if (error && posts.length === 0 && !minLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-base flex items-center gap-3 animate-fade-in mt-8 max-w-xl mx-auto">
        <svg
          className="w-6 h-6 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <span className="flex-1">
          Wait, your feed is getting ready... If this takes too long,{" "}
          <button
            onClick={() => {
              setMinLoading(true);
              setTimeout(() => setMinLoading(false), 10000);
              fetchPosts(1);
            }}
            className="text-x-blue underline font-semibold hover:text-x-green transition-colors"
          >
            Retry
          </button>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-4 pb-20 lg:pb-8 x-main${
        loading && posts.length === 0 ? " loading" : ""
      }`}
    >
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 lg:mb-8 gap-2 sm:gap-4 px-3 sm:px-0">
        <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-x-blue via-purple-500 to-x-green bg-[length:200%_auto] bg-clip-text text-transparent animate-color-cycle hover:animate-gradient-x hover:scale-110 transform transition-all duration-500 cursor-default drop-shadow-lg flex items-center">
          <span>Feed</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/create-post"
            className="hidden sm:inline font-bold text-base sm:text-lg px-5 py-2 rounded-full transition-all duration-300 shadow-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-[#222] focus:outline-none hover:scale-105 no-underline"
          >
            Create 🖋️
          </Link>
          {/* Mobile notification bell icon */}
          <Link
            to="/notifications"
            className="inline sm:hidden p-2 transition-all duration-200 relative"
            aria-label="Notifications"
            style={{
              color: hasUnread ? "#ef4444" : "#1d9bf0",
              fontSize: 28,
              filter: hasUnread ? "drop-shadow(0 0 8px #ef4444)" : "none",
              transition: "color 0.2s, filter 0.2s",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="28"
              height="28"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke={hasUnread ? "#ef4444" : "#1d9bf0"}
                strokeWidth={2}
              />
            </svg>
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
            />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Be the first to share something with the community!
          </p>
          <Link
            to="/create-post"
            className="btn-primary text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {posts.map((post, index) => (
            <div
              key={post._id}
              className="transition-all duration-300 ease-in-out"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            </div>
          ))}

          <div ref={loaderRef} className="text-center py-8 sm:py-12">
            {hasMore && loading && <FakeFeedLoader />}

            {!hasMore && !showEndMessage && (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce absolute top-0 left-0 animation-delay-0"></div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce absolute top-0 right-0 animation-delay-150"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce absolute bottom-0 left-0 animation-delay-300"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce absolute bottom-0 right-0 animation-delay-450"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Checking for more posts...
                </p>
              </div>
            )}

            {!hasMore && showEndMessage && (
              <div className="text-center animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  🎉 You've reached the end!
                </h3>
                <p className="text-sm text-gray-500">
                  No more posts to show. Come back later for fresh content!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
