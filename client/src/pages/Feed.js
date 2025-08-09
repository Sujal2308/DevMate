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
  const loaderRef = useRef(null);
  const { hasUnread } = useNotification();

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);

        // Increase timeout for initial load to handle Render cold starts
        const timeoutDuration = pageNum === 1 ? 15000 : 8000; // 15s for first load, 8s for pagination

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
    },
    []
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Initial fetch effect
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  if ((loading || error) && posts.length === 0) {
    // Always show shimmer for loading or error and no posts
    return <ShimmerEffect type="feed" />;
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8 x-main${
        loading && posts.length === 0 ? " loading" : ""
      }`}
    >
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 lg:mb-8 gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#C0C0C0] via-[#E0E0E0] to-[#A9A9A9] bg-clip-text text-transparent ml-5 sm:ml-4 lg:ml-6 flex items-center">
          <span>Feed</span>
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile notification bell icon - now at extreme left */}
          <Link
            to="/notifications"
            className="inline sm:hidden p-2 ml-3 mr-3 transition-all duration-200 relative"
            aria-label="Notifications"
            style={{
              color: hasUnread ? "#ef4444" : "#1d9bf0",
              fontSize: 24,
              filter: hasUnread ? "drop-shadow(0 0 8px #ef4444)" : "none",
              transition: "color 0.2s, filter 0.2s",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="24"
              height="24"
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

          {!hasMore && !showEndMessage && posts.length > 0 && (
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
    </div>
  );
};

export default Feed;
