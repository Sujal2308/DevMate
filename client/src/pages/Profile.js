import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/PostCard";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8); // Increased from 2 to 8 for better mobile scrolling
  const [copied, setCopied] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { username } = useParams();
  const { user } = useAuth();

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch profile data with followers data to properly detect follow state
        const response = await axios.get(
          `/api/users/${username}?limit=8&includeFollowersData=true`
        );
        setProfileData(response.data);

        // Update pagination state from response
        if (response.data.pagination) {
          setHasMorePosts(response.data.pagination.hasMore);
          setCurrentPage(response.data.pagination.current);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handlePostDelete = (deletedPostId) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      const updatedPosts = prev.posts.filter(
        (post) => post._id !== deletedPostId
      );

      // Update pagination info when a post is deleted
      const newTotalPosts = prev.pagination
        ? prev.pagination.total - 1
        : updatedPosts.length;
      const newTotalPages = Math.ceil(newTotalPosts / postsPerPage);

      return {
        ...prev,
        posts: updatedPosts,
        pagination: {
          ...prev.pagination,
          total: newTotalPosts,
          pages: newTotalPages,
          hasMore: currentPage < newTotalPages,
        },
      };
    });

    // Update hasMorePosts state
    setHasMorePosts((prev) => {
      const newTotal = profileData?.pagination?.total
        ? profileData.pagination.total - 1
        : profileData?.posts?.length - 1 || 0;
      const newTotalPages = Math.ceil(newTotal / postsPerPage);
      return currentPage < newTotalPages;
    });
  };

  // Follow/Unfollow logic for profile page
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (profileData && user) {
      // Check if following using either the full followers array or just the counts
      if (
        profileData.user.followers &&
        Array.isArray(profileData.user.followers)
      ) {
        const currentUserId = user.id || user._id;
        const isCurrentlyFollowing = profileData.user.followers.some((f) => {
          // Handle different follower object formats
          const followerId = f.id || f._id || f;
          return (
            followerId === currentUserId ||
            followerId === user.id ||
            followerId === user._id ||
            followerId.toString() === currentUserId?.toString() ||
            followerId.toString() === user.id?.toString() ||
            followerId.toString() === user._id?.toString()
          );
        });
        console.log("[FOLLOW DETECTION] Current user:", {
          id: user.id,
          _id: user._id,
        });
        console.log(
          "[FOLLOW DETECTION] Followers:",
          profileData.user.followers
        );
        console.log("[FOLLOW DETECTION] Is following:", isCurrentlyFollowing);
        setIsFollowing(isCurrentlyFollowing);
      } else {
        console.log(
          "[FOLLOW DETECTION] No followers array found, setting to false"
        );
        setIsFollowing(false);
      }
    }
  }, [profileData, user]);

  // Animation state for follow button
  const [followAnim, setFollowAnim] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) return;
    setFollowAnim(true);
    setTimeout(() => setFollowAnim(false), 350);
    setFollowLoading(true);
    try {
      let response;
      if (isFollowing) {
        response = await axios.put(
          `/api/users/${profileData.user.username}/unfollow`
        );
      } else {
        response = await axios.put(
          `/api/users/${profileData.user.username}/follow`
        );
      }

      // Update profile data with the returned user data
      if (response.data.user) {
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            ...response.data.user,
          },
        }));

        // Update isFollowing state immediately based on the updated followers
        const updatedFollowers = response.data.user.followers || [];
        const nowFollowing = updatedFollowers.some(
          (f) =>
            f.id === user.id ||
            f._id === user.id ||
            f === user.id ||
            f._id === user._id ||
            f.id === user._id ||
            f === user._id
        );
        setIsFollowing(nowFollowing);
        console.log("[FOLLOW] Updated isFollowing to:", nowFollowing);
        console.log("[FOLLOW] Updated followers:", updatedFollowers);
      } else {
        // Fallback: fetch latest profile data if backend doesn't return user data
        const updatedProfile = await axios.get(
          `/api/users/${profileData.user.username}?includeFollowersData=true&includeFollowingData=true`
        );
        setProfileData(updatedProfile.data);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const [bioExpanded, setBioExpanded] = useState(false);
  const bioRef = useRef(null);
  const [showViewMore, setShowViewMore] = useState(false);

  useEffect(() => {
    if (profileData && profileData.user && bioRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(bioRef.current).lineHeight
      );
      const maxHeight = lineHeight * 3;
      if (bioRef.current.scrollHeight > maxHeight) {
        setShowViewMore(true);
      } else {
        setShowViewMore(false);
      }
    }
  }, [profileData]);

  // Function to load more posts
  const loadMorePosts = async () => {
    if (loadingMorePosts || !hasMorePosts) return;

    try {
      setLoadingMorePosts(true);
      const nextPage = currentPage + 1;
      const response = await axios.get(
        `/api/users/${username}/posts?page=${nextPage}&limit=${postsPerPage}`
      );

      if (response.data.posts.length > 0) {
        setProfileData((prev) => ({
          ...prev,
          posts: [...prev.posts, ...response.data.posts],
        }));
        setCurrentPage(nextPage);
        setHasMorePosts(response.data.pagination.hasMore);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMorePosts(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Quick loading skeleton for better perceived performance */}
        <div className="relative mb-8">
          {/* Cover skeleton */}
          <div className="h-40 md:h-64 bg-gradient-to-r from-gray-600 to-gray-500 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Profile info skeleton */}
          <div className="bg-gradient-to-br from-x-dark/90 to-x-dark/60 backdrop-blur-sm border border-x-border/50 -mt-1 pt-2 md:pt-8 pb-6 px-4 md:px-8">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-row items-start text-left">
                {/* Avatar skeleton */}
                <div className="relative -mt-2 md:-mt-12 mb-0 mr-6 z-20">
                  <div className="bg-gray-600 animate-pulse w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-x-dark shadow-2xl"></div>
                </div>
                {/* Name skeleton */}
                <div className="text-left flex flex-col justify-start">
                  <div className="h-6 md:h-8 bg-gray-600 animate-pulse rounded mb-2 w-48"></div>
                  <div className="h-4 md:h-5 bg-gray-600 animate-pulse rounded mb-2 w-32"></div>
                </div>
              </div>
            </div>

            {/* Bio skeleton */}
            <div className="mt-6">
              <div className="h-4 bg-gray-600 animate-pulse rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-600 animate-pulse rounded mb-2 w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Metrics skeleton */}
        <div className="bg-gradient-to-br from-x-dark/70 to-x-dark/40 backdrop-blur-sm border border-x-border/40 p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center"
              >
                <div className="h-8 bg-gray-600 animate-pulse rounded mb-2 w-12 mx-auto"></div>
                <div className="h-4 bg-gray-600 animate-pulse rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-x-gray text-sm">Loading profile...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="card p-12 text-center bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/30">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-x-white mb-3">
            User Not Found
          </h3>
          <p className="text-x-gray mb-6 max-w-md mx-auto">
            {error ||
              "The user you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/explore"
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Explore Developers
          </Link>
        </div>
      </div>
    );
  }

  const { user: profileUser, posts } = profileData;

  // Pagination calculations
  const totalPosts = profileData?.pagination?.total || posts.length;
  const currentPosts = posts; // No slicing needed since we're using server-side pagination

  const totalLikes = posts.reduce(
    (total, post) => total + post.likes.length,
    0
  );

  // Determine privacy: show only card if private and not owner/follower
  const isPrivate = profileUser.isPrivate;
  const isFollower =
    user && profileUser.followers?.some((f) => f.id === user.id);
  const showFullProfile = !isPrivate || isOwnProfile || isFollower;

  return (
    <div
      className="max-w-2xl mx-auto py-8 px-4 bg-gradient-to-br from-x-dark/10 to-x-dark/5"
      style={{
        willChange: "scroll-position",
        transform: "translateZ(0)",
      }}
    >
      {/* Hero Profile Section */}
      <div className="relative mb-8">
        {/* Cover */}
        <div className="h-40 md:h-64 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {/* Username at bottom right on mobile only */}
          <div className="absolute bottom-2 right-2 sm:hidden flex items-center text-xs text-x-white font-mono">
            <span>@{profileUser.username}</span>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(profileUser.username);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                } catch (err) {
                  console.error("Failed to copy username:", err);
                }
              }}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
              title="Copy username"
            >
              {copied ? (
                <svg
                  className="w-3 h-3 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17l4 4L23 11"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="absolute top-4 right-4">
            {isOwnProfile && (
              <Link
                to="/edit-profile"
                className="bg-x-white/10 backdrop-blur-sm hover:bg-x-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
          {/* Date of Joining on Mobile and on Desktop for other users */}
          {(!isOwnProfile && (
            <div className="hidden md:flex absolute top-4 right-8 text-xs text-x-white px-4 py-2 rounded-xl font-medium transition-all duration-200 items-center bg-x-dark/60 shadow-lg z-10">
              <svg
                className="w-4 h-4 mr-1"
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
              {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </div>
          )) ||
            null}
        </div>

        {/* Profile Info Card */}
        <div className="bg-gradient-to-br from-x-dark/90 to-x-dark/60 backdrop-blur-sm border border-x-border/50 -mt-1 pt-2 md:pt-8 pb-6 px-4 md:px-8">
          <div
            className={`flex flex-row ${
              isOwnProfile ? "items-end" : "items-start"
            } justify-between`}
          >
            <div className="flex flex-row items-start text-left">
              {/* Avatar */}
              <div
                className={`relative ${
                  isOwnProfile ? "mt-1 md:-mt-10" : "-mt-2 md:-mt-12" // move avatar higher for other users on mobile
                } mb-0 mr-6 z-20`}
              >
                <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-4xl font-bold border-4 border-x-dark shadow-2xl">
                  <div className="bg-black text-white w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-4xl font-bold border-4 border-x-dark shadow-2xl">
                    {profileUser.displayName?.charAt(0).toUpperCase() ||
                      profileUser.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              {/* Name and Info */}
              <div
                className={`text-left flex flex-col justify-start ${
                  isOwnProfile ? "mt-6 md:mt-0" : "mt-0 md:-mt-6"
                }`}
              >
                <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-x-white mb-2">
                  <span className="bg-gradient-to-r from-[#C0C0C0] via-[#E0E0E0] to-[#A9A9A9] bg-clip-text text-transparent">
                    {profileUser.displayName || profileUser.username}
                  </span>
                </h1>
                <div className="flex flex-row space-x-4 mb-2 items-center">
                  {/* On mobile, show follow button at left, completely hide username */}
                  {!isOwnProfile && user && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-full font-semibold text-base transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-x-blue focus:ring-offset-2 w-auto ${
                        isFollowing
                          ? "bg-x-dark/40 text-x-gray border border-x-border/40 hover:bg-x-dark/60"
                          : "bg-x-blue text-white hover:bg-x-green"
                      } ${
                        followLoading ? "opacity-60 cursor-not-allowed" : ""
                      } ${
                        followAnim ? "animate-follow-pop" : ""
                      } block sm:hidden`}
                      style={{ minWidth: 80, maxWidth: 160 }}
                    >
                      {followLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                  {/* Username only visible on desktop (sm and above) */}
                  <p className="hidden sm:flex text-base sm:text-xl text-x-gray mb-0 items-center font-mono">
                    @{profileUser.username}
                    {isOwnProfile && (
                      <span className="profile-joined-date profile-joined-date-inline-desktop ml-3 flex items-center text-sm text-x-gray font-normal align-middle">
                        <svg
                          className="w-4 h-4 mr-1 align-middle"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ display: "inline", verticalAlign: "middle" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Joined{" "}
                        {new Date(profileUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                      </span>
                    )}
                  </p>
                  {/* Follow button inline with username for other users */}
                  {!isOwnProfile && user && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`ml-2 px-4 py-2 rounded-full font-semibold text-base transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-x-blue focus:ring-offset-2 w-auto ${
                        isFollowing
                          ? "bg-x-dark/40 text-x-gray border border-x-border/40 hover:bg-x-dark/60"
                          : "bg-x-blue text-white hover:bg-x-green"
                      } ${
                        followLoading ? "opacity-60 cursor-not-allowed" : ""
                      } ${
                        followAnim ? "animate-follow-pop" : ""
                      } hidden sm:inline-flex`}
                      style={{ minWidth: 80, maxWidth: 160 }}
                    >
                      {followLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                </div>
                {/* Follow button - stacked for own profile */}
                {/* Date of joining for other users removed - only at cover image now */}
              </div>
            </div>
          </div>

          {/* Bio - with ABOUT header */}
          <div className="mt-6 block">
            <div className="flex items-center mb-3">
              <svg
                className="w-4 h-4 text-x-blue mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-semibold text-x-blue uppercase tracking-wide">
                About
              </span>
            </div>
            {profileUser.bio && (
              <div className="relative">
                <p
                  ref={bioRef}
                  className={`text-x-white leading-relaxed transition-all duration-200 ${
                    bioExpanded
                      ? ""
                      : "line-clamp-3 max-h-[4.5em] overflow-hidden"
                  } md:line-clamp-none md:max-h-none`}
                  style={{ WebkitLineClamp: bioExpanded ? "unset" : 3 }}
                >
                  {profileUser.bio}
                </p>
                {showViewMore && (
                  <button
                    className="mt-2 text-x-blue underline text-sm block md:hidden"
                    onClick={() => setBioExpanded((v) => !v)}
                  >
                    {bioExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Skills and GitHub Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="skills-section">
              <div className="flex items-center mb-3">
                <svg
                  className="w-4 h-4 text-x-green mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="text-sm font-semibold text-x-green uppercase tracking-wide">
                  Skills
                </span>
              </div>
              {profileUser.skills && profileUser.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileUser.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-x-blue/20 to-purple-500/20 border border-x-blue/30 text-x-blue px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {profileUser.skills.length > 5 && (
                    <span className="text-x-gray text-xs font-medium px-2 py-1">
                      +{profileUser.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* GitHub Link */}
            {profileUser.githubLink && (
              <div className="github-section">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-4 h-4 text-purple-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                    GitHub
                  </span>
                </div>
                <a
                  href={profileUser.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-x-white hover:text-x-blue transition-colors group"
                >
                  <span className="group-hover:underline">
                    View GitHub Profile
                  </span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14l-4-4-6 6"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Only show rest if not private, or if owner/follower */}
      {showFullProfile ? (
        <>
          {/* Profile Metrics Card */}
          <div className="bg-gradient-to-br from-x-dark/70 to-x-dark/40 backdrop-blur-sm border border-x-border/40 p-4 mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x font-mono">
              <svg
                className="w-6 h-6 text-x-blue"
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
              Profile Metrics
            </h3>
            <div className="mb-3 text-x-gray text-xs md:text-sm font-mono text-center md:text-left">
              Tip: Click on{" "}
              <span className="text-x-blue font-semibold">Followers</span> or{" "}
              <span className="text-x-blue font-semibold">Following</span> to
              view the full list.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
                <Link
                  to={`/profile/${profileUser.username}/followers`}
                  className="block cursor-pointer"
                >
                  <div className="text-3xl font-bold text-x-white mb-1 font-mono">
                    {profileUser.followersCount ??
                      (profileUser.followers?.length || 0)}
                  </div>
                  <div className="text-x-gray text-sm font-mono">Followers</div>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
                <Link
                  to={`/profile/${profileUser.username}/following`}
                  className="block cursor-pointer"
                >
                  <div className="text-3xl font-bold text-x-white mb-1 font-mono">
                    {profileUser.followingCount ??
                      (profileUser.following?.length || 0)}
                  </div>
                  <div className="text-x-gray text-sm font-mono">Following</div>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-x-white mb-1 font-mono">
                  {totalPosts}
                </div>
                <div className="text-x-gray text-sm font-mono">Posts</div>
              </div>
              <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-x-white mb-1 font-mono">
                  {totalLikes}
                </div>
                <div className="text-x-gray text-sm font-mono">Likes</div>
              </div>
            </div>
          </div>

          {/* Tabs: Posts, Activity, About */}
          <div className="mb-8">
            <div className="border-b border-x-border/30">
              <nav className="flex justify-start space-x-8">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "posts"
                      ? "border-x-blue text-x-blue"
                      : "border-transparent text-x-gray hover:text-x-white hover:border-x-border"
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "activity"
                      ? "border-x-blue text-x-blue"
                      : "border-transparent text-x-gray hover:text-x-white hover:border-x-border"
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "about"
                      ? "border-x-blue text-x-blue"
                      : "border-transparent text-x-gray hover:text-x-white hover:border-x-border"
                  }`}
                >
                  About
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "posts" && (
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 rounded-2xl px-2 py-2 sm:px-4 sm:py-4 md:p-6 mb-24 md:mb-8">
              <div className="flex items-center justify-start mb-6">
                <svg
                  className="w-5 h-5 text-x-green mr-3"
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
                <h2 className="text-2xl font-bold text-x-white">Posts</h2>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-x-blue"></div>
                  <span className="ml-3 text-x-gray">Loading posts...</span>
                </div>
              )}

              {/* Posts grid */}
              {!loading && posts.length > 0 && (
                <div
                  className="grid grid-cols-1 gap-6"
                  style={{
                    willChange: "scroll-position",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {currentPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && posts.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-8">
                    <svg
                      className="w-16 h-16 text-x-gray mx-auto mb-4"
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
                    <p className="text-x-white text-lg font-semibold mb-2">
                      {isOwnProfile
                        ? "You haven't posted yet!"
                        : "No posts yet!"}
                    </p>
                    <p className="text-x-gray text-sm max-w-md mx-auto mb-4">
                      {isOwnProfile
                        ? "Start sharing your thoughts and projects with the community."
                        : "This user hasn't shared any posts yet. Check back later or follow them to see their updates."}
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/create-post"
                        className="btn-primary px-6 py-3 text-base font-semibold"
                      >
                        Create your first post
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Load More Button or Pagination */}
              {hasMorePosts && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMorePosts}
                    className="px-6 py-3 bg-x-blue text-white rounded-full font-semibold text-sm transition-all duration-200 hover:bg-x-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
                  >
                    {loadingMorePosts ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Posts
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
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Show end message when no more posts */}
              {!hasMorePosts && posts.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-x-gray text-sm">
                    🎉 You've seen all posts from {profileUser.username}!
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "activity" && (
            <div className="card p-8 bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20 text-center mb-8">
              <div className="bg-x-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M13 7h8m0 0v8m0-8L10 14l-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-x-white mb-2">
                Activity Timeline
              </h3>
              <p className="text-x-gray">
                Activity tracking coming soon! This will show recent likes,
                comments, and interactions.
              </p>
            </div>
          )}
          {activeTab === "about" && profileUser && (
            <div className="card p-8 bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/20 mb-8">
              <h3 className="text-xl font-bold text-x-white mb-4 text-left">
                About
              </h3>
              <div className="text-left space-y-4">
                {profileUser.bio && (
                  <div
                    className={`text-left flex flex-col justify-start ${
                      isOwnProfile ? "mt-2 md:mt-0" : "mt-2 md:mt-0"
                    }`}
                  >
                    <p className="text-x-white mt-1">{profileUser.bio}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-x-gray">
                    Date of Joining:
                  </span>
                  <span className="text-x-white ml-2">
                    <svg
                      className="w-4 h-4 inline-block mr-1 align-middle"
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
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </span>
                </div>
                {profileUser.skills && profileUser.skills.length > 0 && (
                  <div>
                    <span className="font-semibold text-x-gray">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileUser.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-x-blue/20 to-purple-500/20 border border-x-blue/30 text-x-blue px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profileUser.githubLink && (
                  <div>
                    <span className="font-semibold text-x-gray">GitHub:</span>
                    <a
                      href={profileUser.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-x-blue underline ml-2 hover:text-x-green"
                    >
                      {profileUser.githubLink}
                    </a>
                  </div>
                )}
                {/* Add more fields as needed */}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-x-dark/70 to-x-dark/40 backdrop-blur-sm border border-x-border/40 p-8 mt-8 text-center rounded-2xl">
          <svg
            className="w-12 h-12 text-x-gray mx-auto mb-4"
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
          <h3 className="text-xl font-bold text-x-white mb-2">
            This profile is private
          </h3>
          <p className="text-x-gray text-sm max-w-md mx-auto">
            Follow this user to see their posts and metrics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
// No unused variables found in Profile.js main logic
