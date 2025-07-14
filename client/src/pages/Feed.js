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
  const [minLoading, setMinLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const loaderRef = useRef(null);
  const minLoadingTimer = useRef(null);
  const { hasUnread } = useNotification();

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      
      // Increase timeout for initial load to handle Render cold starts
      const timeoutDuration = pageNum === 1 ? 15000 : 8000; // 15s for first load, 8s for pagination
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Posts fetch timeout')), timeoutDuration)
      );
      
      const postsPromise = axios.get(`/api/posts?page=${pageNum}&limit=10`);
      
      const response = await Promise.race([postsPromise, timeoutPromise]);

      if (pageNum === 1) {
        setPosts(response.data.posts);
        setError(""); // Clear error on successful fetch
        // Release minimum loading immediately on success
        setMinLoading(false);
      } else {
        setPosts((prev) => [...prev, ...response.data.posts]);
        setError(""); // Clear error on successful fetch
      }

      setHasMore(
        response.data.pagination.current < response.data.pagination.pages
      );
      setPage(pageNum);
    } catch (error) {
      if (error.message === 'Posts fetch timeout') {
        const funMessages = [
          "🌙 Our servers are taking a quick power nap! They'll be back in a jiffy.",
          "🚀 Houston, we have a... tiny delay! Mission control is on it.",
          "☕ The server is brewing some fresh content for you. Worth the wait!",
          "🎭 Our hamsters running the servers took a coffee break. They're back now!",
          "🌟 Good things come to those who wait... including awesome posts!",
          "🎪 The digital circus is setting up backstage. The show will begin shortly!",
          "🎵 The server is composing a symphony of posts just for you.",
          "🧙‍♂️ Our wizard is casting a spell to summon your feed... almost done!"
        ];
        const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
        setError(randomMessage + (retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ''));
      } else {
        setError("Oops! Something went wrong while fetching posts. Let's try again! 🔄");
      }
      console.error("Fetch posts error:", error);
      // Release minimum loading on error too
      setMinLoading(false);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Initial fetch effect
  useEffect(() => {
    fetchPosts();
    // Reduce minimum loading time to 2 seconds for better UX
    minLoadingTimer.current = setTimeout(() => {
      setMinLoading(false);
    }, 2000);
    return () => {
      if (minLoadingTimer.current) {
        clearTimeout(minLoadingTimer.current);
      }
    };
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

  // Retry mechanism for failed loads
  const retryFetch = useCallback(() => {
    setError("");
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setMinLoading(true);
    fetchPosts(1);
  }, [fetchPosts]);

  if ((loading || error) && posts.length === 0 && minLoading) {
    // Show shimmer for first 2s if loading or error and no posts
    return <ShimmerEffect type="feed" />;
  }

  // After 2s, if error and no posts, show error/info
  if (error && posts.length === 0 && !minLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 lg:py-8 px-3 sm:px-4 lg:px-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-800 px-4 py-6 rounded-xl mb-4 sm:mb-6 text-sm sm:text-base flex flex-col items-center gap-4 animate-fade-in mt-8 max-w-xl mx-auto text-center">
          <div className="text-4xl animate-bounce">
            {error.includes('🌙') ? '🌙' : 
             error.includes('🚀') ? '🚀' : 
             error.includes('☕') ? '☕' : 
             error.includes('🎭') ? '🎭' : 
             error.includes('🌟') ? '🌟' : 
             error.includes('🎪') ? '🎪' : 
             error.includes('🎵') ? '🎵' : 
             error.includes('🧙‍♂️') ? '🧙‍♂️' : '🔄'}
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hold On, Magic is Happening! ✨
            </h3>
            <p className="mb-4 leading-relaxed text-lg font-medium">
              {error}
            </p>
            <div className="text-sm text-blue-600 mb-4 bg-blue-100 rounded-lg p-3">
              💡 <strong>Pro Tip:</strong> Good things come to those who wait! Our servers are just making sure everything is perfect for you.
            </div>
            <button
              onClick={retryFetch}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Let's Try Again! {retryCount > 0 && `(Round ${retryCount + 1})`}
            </button>
          </div>
        </div>
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
