import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ShimmerEffect from "../components/ShimmerEffect";
import LoadingSpinner from "../components/LoadingSpinner";
import PostCard from "../components/PostCard";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(2);
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${username}`);
        setProfileData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handlePostUpdate = (updatedPost) => {
    setProfileData((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      ),
    }));
  };

  const handlePostDelete = (deletedPostId) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      const updatedPosts = prev.posts.filter(
        (post) => post._id !== deletedPostId
      );
      // recalculate totalPages and currentPage if needed
      const newTotalPages = Math.ceil(updatedPosts.length / postsPerPage);
      let newCurrentPage = currentPage;
      if (newCurrentPage > newTotalPages && newTotalPages > 0) {
        newCurrentPage = newTotalPages;
      }
      // If no posts left, go to first page
      if (updatedPosts.length === 0) newCurrentPage = 1;
      setCurrentPage(newCurrentPage);
      return {
        ...prev,
        posts: updatedPosts,
      };
    });
  };

  // Follow/Unfollow logic for profile page
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (profileData && user) {
      setIsFollowing(profileData.user.followers?.some((f) => f.id === user.id));
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
      if (isFollowing) {
        await axios.put(`/api/users/${profileData.user.username}/unfollow`);
      } else {
        await axios.put(`/api/users/${profileData.user.username}/follow`);
      }
      // Fetch updated profile data
      const updatedProfile = await axios.get(
        `/api/users/${profileData.user.username}`
      );
      setProfileData(updatedProfile.data);
      // setIsFollowing will be updated by useEffect
    } catch (err) {
      // Optionally show error
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

  if (loading) {
    return <ShimmerEffect type="profile" />;
  }

  if (error || !profileData) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
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
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalLikes = posts.reduce(
    (total, post) => total + post.likes.length,
    0
  );
  const totalComments = posts.reduce(
    (total, post) => total + post.comments.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hero Profile Section */}
      <div className="relative mb-8">
        {/* Cover */}
        <div className="h-40 md:h-64 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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

        {/* Profile Info Card - Sleek & Minimal */}
        <div className="bg-x-dark/80 border border-x-border/20 shadow-lg -mt-8 pt-6 pb-6 px-4 md:px-8 rounded-2xl">
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="bg-x-dark/60 text-white w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold border-2 border-x-border/30 shadow-md">
                {profileUser.displayName?.charAt(0).toUpperCase() ||
                  profileUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-x-green w-7 h-7 rounded-full border-2 border-x-dark flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {/* Name, Username, Date, Follow */}
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-semibold text-x-white truncate mb-1 md:mb-0">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <div className="flex items-center gap-3 text-x-gray text-base font-mono">
                  <span>@{profileUser.username}</span>
                  {isOwnProfile && (
                    <span className="hidden md:inline-flex items-center text-xs text-x-gray/80 font-normal ml-2">
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
                      {new Date(profileUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      )}
                    </span>
                  )}
                </div>
              </div>
              {/* Follow button or Edit button */}
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-5 py-2 rounded-full font-medium text-base transition-all duration-200 border border-x-border/30 focus:outline-none focus:ring-2 focus:ring-x-blue focus:ring-offset-2 shadow-sm ${
                      isFollowing
                        ? "bg-x-dark/30 text-x-gray hover:bg-x-dark/50"
                        : "bg-x-blue text-white hover:bg-x-green"
                    } ${
                      followLoading ? "opacity-60 cursor-not-allowed" : ""
                    } ${followAnim ? "animate-follow-pop" : ""}`}
                    style={{ minWidth: 90 }}
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
                {isOwnProfile && (
                  <Link
                    to="/edit-profile"
                    className="px-5 py-2 rounded-full font-medium text-base border border-x-border/30 text-x-white bg-x-dark/40 hover:bg-x-dark/60 transition-all duration-200 shadow-sm flex items-center gap-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Link>
                )}
              </div>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-x-white mb-1 font-mono">
              {profileUser.followers?.length || 0}
            </div>
            <div className="text-x-gray text-sm font-mono">Followers</div>
          </div>
          <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-x-white mb-1 font-mono">
              {profileUser.following?.length || 0}
            </div>
            <div className="text-x-gray text-sm font-mono">Following</div>
          </div>
          <div className="bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/30 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-x-white mb-1 font-mono">
              {posts.length}
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
        <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 rounded-2xl p-6 mb-24 md:mb-8">
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
            <div className="grid grid-cols-1 gap-6">
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
                  No posts yet!
                </p>
                <p className="text-x-gray text-sm max-w-md mx-auto">
                  This user hasn't shared any posts yet. Check back later or
                  follow them to see their updates.
                </p>
              </div>
            </div>
          )}

          {/* Pagination - Mobile */}
          {totalPages > 1 && (
            <div className="mt-6 block md:hidden">
              <span className="text-x-gray text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full bg-x-dark/40 text-x-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
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
                      d="M15 18l-6-6 6-6"
                    />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full bg-x-blue text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  Next
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
                      d="M9 6l6 6-6 6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Pagination - Desktop */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full bg-x-dark/40 text-x-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
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
                    d="M15 18l-6-6 6-6"
                  />
                </svg>
                Previous
              </button>
              <div className="text-x-gray text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full bg-x-blue text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                Next
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
                    d="M9 6l6 6-6 6"
                  />
                </svg>
              </button>
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
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
              <div>
                <span className="font-semibold text-x-gray">Description:</span>
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
                {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
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
    </div>
  );
};

export default Profile;
