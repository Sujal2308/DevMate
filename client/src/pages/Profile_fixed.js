import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ShimmerEffect from "../components/ShimmerEffect";
import PostCard from "../components/PostCard";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
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
    setProfileData((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post._id !== deletedPostId),
    }));
  };

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

  const totalLikes = posts.reduce(
    (total, post) => total + post.likes.length,
    0
  );
  const totalComments = posts.reduce(
    (total, post) => total + post.comments.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto py-4 lg:py-8 px-3 lg:px-6">
      {/* Hero Profile Section */}
      <div className="relative mb-8">
        {/* Cover Background */}
        <div className="h-48 lg:h-64 bg-gradient-to-r from-x-blue via-purple-600 to-x-green rounded-t-3xl relative overflow-hidden">
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
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-gradient-to-br from-x-dark/90 to-x-dark/60 backdrop-blur-sm border border-x-border/50 rounded-b-3xl -mt-1 pt-8 pb-6 px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between">
            <div className="flex flex-col lg:flex-row items-start lg:items-end mb-6 lg:mb-0">
              {/* Avatar */}
              <div className="relative -mt-16 lg:-mt-20 mb-4 lg:mb-0 lg:mr-6">
                <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-24 h-24 lg:w-32 lg:h-32 rounded-3xl flex items-center justify-center text-3xl lg:text-4xl font-bold border-4 border-x-dark shadow-2xl">
                  {profileUser.displayName?.charAt(0).toUpperCase() ||
                    profileUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-x-green w-6 h-6 lg:w-8 lg:h-8 rounded-full border-4 border-x-dark flex items-center justify-center">
                  <svg
                    className="w-3 h-3 lg:w-4 lg:h-4 text-white"
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

              {/* Name and Info */}
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-x-white mb-2">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                  <p className="text-lg lg:text-xl text-x-gray mb-1 sm:mb-0">
                    @{profileUser.username}
                  </p>
                  <div className="flex items-center text-sm text-x-gray">
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
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex space-x-4 lg:space-x-6">
              <div className="bg-x-dark/40 border border-x-border/30 rounded-2xl px-4 py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-x-white">
                  {posts.length}
                </div>
                <div className="text-xs lg:text-sm text-x-gray">Posts</div>
              </div>
              <div className="bg-x-dark/40 border border-x-border/30 rounded-2xl px-4 py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-red-400">
                  {totalLikes}
                </div>
                <div className="text-xs lg:text-sm text-x-gray">Likes</div>
              </div>
              <div className="bg-x-dark/40 border border-x-border/30 rounded-2xl px-4 py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-x-blue">
                  {totalComments}
                </div>
                <div className="text-xs lg:text-sm text-x-gray">Comments</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <div className="mt-6 bg-x-dark/20 border border-x-border/20 rounded-2xl p-4">
              <div className="flex items-center mb-2">
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
              <p className="text-x-white leading-relaxed">{profileUser.bio}</p>
            </div>
          )}

          {/* Skills and Links */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            {profileUser.skills && profileUser.skills.length > 0 && (
              <div className="bg-x-dark/20 border border-x-border/20 rounded-2xl p-4">
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
                <div className="flex flex-wrap gap-2">
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

            {/* GitHub Link */}
            {profileUser.githubLink && (
              <div className="bg-x-dark/20 border border-x-border/20 rounded-2xl p-4">
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
      </div>

      {/* Content Tabs */}
      <div className="mb-8">
        <div className="border-b border-x-border/30">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "posts"
                  ? "border-x-blue text-x-blue"
                  : "border-transparent text-x-gray hover:text-x-white hover:border-x-border"
              }`}
            >
              <div className="flex items-center">
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
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                  />
                </svg>
                Posts ({posts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "activity"
                  ? "border-x-blue text-x-blue"
                  : "border-transparent text-x-gray hover:text-x-white hover:border-x-border"
              }`}
            >
              <div className="flex items-center">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Activity
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === "posts" && (
        <div>
          {posts.length === 0 ? (
            <div className="card p-12 text-center bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20">
              <div className="bg-x-blue/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-x-blue"
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
              </div>
              <h3 className="text-2xl font-bold text-x-white mb-3">
                No Posts Yet
              </h3>
              <p className="text-x-gray mb-6 max-w-md mx-auto">
                {isOwnProfile
                  ? "You haven't created any posts yet. Share your first post with the DevMate community!"
                  : `${
                      profileUser.displayName || profileUser.username
                    } hasn't posted anything yet.`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/create-post"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="card p-8 bg-gradient-to-br from-x-dark/40 to-x-dark/20 backdrop-blur-sm border border-x-border/20 text-center">
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
    </div>
  );
};

export default Profile;
