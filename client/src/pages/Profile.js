import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/PostCard";
import UpdateProfilePrompt from "../components/UpdateProfilePrompt";
import SavedPostsList from "../components/SavedPostsList";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8); // Increased from 2 to 8 for better mobile scrolling
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [viewingSavedPosts, setViewingSavedPosts] = useState(false);
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const menuRef = useRef(null);

  // Handle clicking outside of menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Check if we should show the update profile prompt
  useEffect(() => {
    if (profileData && isOwnProfile && profileData.user) {
      const profileUser = profileData.user;
      // Show prompt if user hasn't completed their profile
      // (profileCompleted is false or doesn't exist) and they haven't manually dismissed it
      const shouldShow = !profileUser.profileCompleted && 
                        localStorage.getItem(`hideUpdatePrompt_${user.id}`) !== 'true';
      setShowUpdatePrompt(shouldShow);
    }
  }, [profileData, isOwnProfile, user]);

  const handleDismissPrompt = () => {
    setShowUpdatePrompt(false);
    // Save to localStorage so it doesn't show again until they update their profile
    localStorage.setItem(`hideUpdatePrompt_${user.id}`, 'true');
  };

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

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim() || skillSubmitting) return;
    
    try {
      setSkillSubmitting(true);
      const updatedSkills = [...(profileData.user.skills || []), newSkill.trim()];
      const response = await axios.put(`/api/users/${user.id || user._id}`, {
        skills: updatedSkills
      });
      setProfileData({
        ...profileData,
        user: { ...profileData.user, skills: response.data.skills }
      });
      setNewSkill("");
    } catch (err) {
      console.error("Add skill error:", err);
    } finally {
      setSkillSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const updatedSkills = profileData.user.skills.filter(s => s !== skillToRemove);
      const response = await axios.put(`/api/users/${user.id || user._id}`, {
        skills: updatedSkills
      });
      setProfileData({
        ...profileData,
        user: { ...profileData.user, skills: response.data.skills }
      });
    } catch (err) {
      console.error("Remove skill error:", err);
    }
  };

  const handleAddSocial = async (e) => {
    e.preventDefault();
    if (!newSocial.platform.trim() || !newSocial.url.trim() || socialSubmitting) return;

    try {
      setSocialSubmitting(true);
      const updatedSocials = [...(profileData.user.socialLinks || []), newSocial];
      const response = await axios.put(`/api/users/${user.id || user._id}`, {
        socialLinks: updatedSocials
      });
      setProfileData({
        ...profileData,
        user: { ...profileData.user, socialLinks: response.data.socialLinks }
      });
      setNewSocial({ platform: "", url: "" });
    } catch (err) {
      console.error("Add social error:", err);
    } finally {
      setSocialSubmitting(false);
    }
  };

  const handleRemoveSocial = async (socialToRemove) => {
    try {
      const updatedSocials = profileData.user.socialLinks.filter(s => s._id !== socialToRemove._id && s.url !== socialToRemove.url);
      const response = await axios.put(`/api/users/${user.id || user._id}`, {
        socialLinks: updatedSocials
      });
      setProfileData({
        ...profileData,
        user: { ...profileData.user, socialLinks: response.data.socialLinks }
      });
    } catch (err) {
      console.error("Remove social error:", err);
    }
  };

  // Follow/Unfollow logic for profile page
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showSkills, setShowSkills] = useState(false); // Controls the skills section visibility
  const [newSkill, setNewSkill] = useState("");
  const [skillSubmitting, setSkillSubmitting] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" });
  const [socialSubmitting, setSocialSubmitting] = useState(false);

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

  const bioRef = useRef(null);

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
  const currentPosts = posts; // No slicing needed since we're using server-side pagination


  // Determine privacy: show only card if private and not owner/follower
  const isPrivate = profileUser.isPrivate;
  const isFollower =
    user && profileUser.followers?.some((f) => f.id === user.id);
  const showFullProfile = !isPrivate || isOwnProfile || isFollower;

  return (
    <>
    <div
      className="max-w-2xl mx-auto pt-0 pb-8 px-0 sm:px-4"
      style={{
        willChange: "scroll-position",
        transform: "translateZ(0)",
      }}
    >
        {/* Profile Info Card */}
        <div className="bg-gradient-to-br from-x-dark/95 to-x-dark/70 backdrop-blur-sm border border-x-border/50 pt-8 pb-6 px-4 md:px-8 relative rounded-none mb-8">
          {isOwnProfile && (
            <div className="mb-6">
              <h1 
                className="text-4xl md:text-5xl font-black text-x-white tracking-tighter" 
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                My Profile
              </h1>
            </div>
          )}
          
          {/* Top Right Actions */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-50">

            {/* Menu */}
            {isOwnProfile && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 transition-all duration-300 group active:scale-95 flex flex-col items-end justify-center gap-1.5 h-10 w-10 hover:bg-white/5 rounded-full"
                  aria-label="Profile Menu"
                >
                  <span className={`block h-0.5 bg-white transition-all duration-300 rounded-full ${menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
                  <span className={`block h-0.5 bg-white transition-all duration-300 rounded-full ${menuOpen ? 'w-6 opacity-0' : 'w-4'}`}></span>
                  <span className={`block h-0.5 bg-white transition-all duration-300 rounded-full ${menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-x-dark/95 backdrop-blur-xl border border-x-border/50 rounded-2xl shadow-3xl z-[100] py-2 animate-fade-in origin-top-right overflow-hidden shadow-black/50">
                    <Link to="/edit-profile" className="flex items-center px-4 py-3 text-sm text-x-white hover:bg-white/5 transition-colors font-space gap-3" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4 text-x-blue group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="truncate">Edit Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 text-sm text-x-white hover:bg-white/5 transition-colors group" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4 text-x-blue group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-space">Settings</span>
                    </Link>
                    <div className="h-[1px] bg-x-border/30 my-1 mx-2"></div>
                    <button onClick={() => { setMenuOpen(false); navigate("/logout-confirm"); }} className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-center text-red-400 hover:bg-red-400/5 transition-colors group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-space">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`flex flex-row items-center justify-between`}
          >
            <div className={`flex flex-row items-center text-left mt-2`}>
              {/* Avatar */}
              <div className="-ml-2 md:-ml-4 mb-0 mr-6 z-20 flex flex-col items-center gap-3">
                <div 
                  onClick={() => profileUser.avatar && setShowAvatarPreview(true)}
                  className={`bg-black text-white w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-x-border/20 shadow-2xl overflow-hidden relative ${profileUser.avatar ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300' : ''}`}
                >
                  {profileUser.avatar ? (
                    <img 
                      src={profileUser.avatar} 
                      alt={profileUser.displayName} 
                      className="w-full h-full object-cover" 
                      width="112"
                      height="112"
                      fetchpriority="high"
                    />
                  ) : (
                    <div className="bg-black text-white w-full h-full flex items-center justify-center font-space">
                      {profileUser.displayName?.charAt(0).toUpperCase() || profileUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Follow button - positioned under avatar */}
                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-xs md:text-sm transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-x-blue focus:ring-offset-2 w-full max-w-[120px] ${
                      isFollowing
                        ? "bg-x-dark/40 text-x-gray border border-x-border/40 hover:bg-x-dark/60"
                        : "bg-x-blue text-white hover:bg-x-green"
                    } ${
                      followLoading ? "opacity-60 cursor-not-allowed" : ""
                    } ${
                      followAnim ? "animate-follow-pop" : ""
                    }`}
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
              {/* Name and Info */}
              <div className="text-left flex flex-col justify-start">
                <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-x-white mb-1 font-space">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <p className="text-sm sm:text-lg text-x-gray mb-2 font-mono opacity-80">
                  @{profileUser.username}
                </p>
                <div className="flex flex-row space-x-4 mb-2 items-center">
                  {/* Additional actions can go here */}
                </div>
                {/* Follow button - stacked for own profile */}
                {/* Date of joining for other users removed - only at cover image now */}
              </div>
            </div>
          </div>

          {/* Bio section */}
          <div className="mt-6 block">
            {profileUser.bio && (
              <div className="relative">
                <p
                  ref={bioRef}
                  className="text-x-white leading-relaxed"
                >
                  {profileUser.bio}
                </p>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-8 flex items-center justify-between border border-white/20 py-4 px-2 sm:px-6 rounded-full bg-black shadow-2xl shadow-black/50">
            <div className="flex-1 text-center group cursor-default">
              <div className="text-2xl sm:text-4xl font-black text-red-500 font-space leading-none py-1">
                {profileData.pagination?.total || 0}
              </div>
              <div className="text-[9px] sm:text-[10px] text-x-gray uppercase tracking-[0.2em] font-space font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                Posts
              </div>
            </div>
            
            <Link 
              to={`/profile/${profileUser.username}/followers`}
              className="flex-1 text-center group transition-transform active:scale-95 border-l border-r border-white/10"
            >
              <div className="text-2xl sm:text-4xl font-black text-green-500 font-space leading-none py-1 transition-colors">
                {profileUser.followersCount ?? (profileUser.followers?.length || 0)}
              </div>
              <div className="text-[9px] sm:text-[10px] text-x-gray uppercase tracking-[0.2em] font-space font-bold mt-1 opacity-70 group-hover:opacity-100 transition-all">
                Followers
              </div>
            </Link>
            
            <Link 
              to={`/profile/${profileUser.username}/following`}
              className="flex-1 text-center group transition-transform active:scale-95"
            >
              <div className="text-2xl sm:text-4xl font-black text-blue-500 font-space leading-none py-1 transition-colors">
                {profileUser.followingCount ?? (profileUser.following?.length || 0)}
              </div>
              <div className="text-[9px] sm:text-[10px] text-x-gray uppercase tracking-[0.2em] font-space font-bold mt-1 opacity-70 group-hover:opacity-100 transition-all">
                Following
              </div>
            </Link>
          </div>
        </div>

      {/* Only show rest if not private, or if owner/follower */}
      {showFullProfile ? (
        <>
          {/* Minimalist Info Boxes Bar */}
          <div className="flex flex-row items-center justify-between gap-4 mb-8 w-full">
            {/* Skills Box */}
            <button 
              onClick={() => {
                setShowSkills(!showSkills);
                if (!showSkills) setShowSocials(false);
              }}
              className={`flex-1 ${showSkills ? 'bg-x-blue border-solid border-x-blue shadow-[0_0_20px_rgba(29,155,240,0.4)]' : 'bg-black border-dashed border-white/20'} border rounded-none p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:bg-x-blue hover:border-solid hover:border-x-blue group`}
            >
              <img 
                src="/icons/skills.png" 
                alt="Skills" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110" 
                width="48"
                height="48"
                loading="lazy"
              />
              <span className={`text-[10px] sm:text-xs font-bold ${showSkills ? 'text-white' : 'text-x-white'} group-hover:text-white font-space uppercase tracking-[max(0.2em,2px)] opacity-70 group-hover:opacity-100`}>Skills</span>
            </button>

            {/* Projects Box */}
            <Link 
              to={`/profile/${profileUser.username}/projects`}
              className="flex-1 bg-black border border-dashed border-white/20 rounded-none p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:bg-x-blue hover:border-solid hover:border-x-blue group"
            >
              <img 
                src="/icons/projects.png" 
                alt="Projects" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110" 
                width="48"
                height="48"
                loading="lazy"
              />
              <span className="text-[10px] sm:text-xs font-bold text-x-white group-hover:text-white font-space uppercase tracking-[max(0.2em,2px)] opacity-70 group-hover:opacity-100">Projects</span>
            </Link>

            {/* Socials Box */}
            <button 
              onClick={() => {
                setShowSocials(!showSocials);
                if (!showSocials) setShowSkills(false);
              }}
              className={`flex-1 ${showSocials ? 'bg-x-blue border-solid border-x-blue shadow-[0_0_20px_rgba(29,155,240,0.4)]' : 'bg-black border-dashed border-white/20'} border rounded-none p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:bg-x-blue hover:border-solid hover:border-x-blue group`}
            >
              <img 
                src="/icons/links.png" 
                alt="Socials" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110" 
                width="48"
                height="48"
                loading="lazy"
              />
              <span className={`text-[10px] sm:text-xs font-bold ${showSocials ? 'text-white' : 'text-x-white'} group-hover:text-white font-space uppercase tracking-[max(0.2em,2px)] opacity-70 group-hover:opacity-100`}>Socials</span>
            </button>
          </div>

          {/* Expanded Skills Section */}
          {showSkills && (
            <div className="mb-8 px-4 py-6 md:p-6 bg-black border border-dashed border-x-border/50 animate-fade-in w-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-space tracking-widest text-x-white">Technical Skills</h3>
                <button onClick={() => setShowSkills(false)} className="text-red-500 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {profileUser.skills && profileUser.skills.length > 0 ? (
                  profileUser.skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="group relative flex items-center bg-black border border-x-green/30 px-4 py-1.5 rounded-full text-sm font-space font-bold text-x-green transition-all hover:border-x-green/60 hover:shadow-[0_0_10px_rgba(56,189,248,0.1)] shadow-lg"
                  >
                    {skill}
                    {isOwnProfile && (
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="absolute -top-1.5 -right-1.5 bg-black border border-white/20 text-white hover:text-red-500 rounded-full p-0.5 transition-all shadow-lg active:scale-90"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-x-gray font-space italic opacity-60">No skills added yet...</p>
              )}
            </div>

            {isOwnProfile && (
              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter new skill..."
                  className="flex-1 bg-white border border-x-border p-2 text-black text-sm focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400 w-full"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={skillSubmitting}
                  className="bg-x-blue text-white px-6 py-2 sm:py-1 font-space font-bold tracking-widest text-[11px] uppercase hover:bg-x-blue/80 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  ADD SKILL
                </button>
              </form>
            )}
            </div>
          )}

          {/* Expanded Socials Section */}
          {showSocials && (
            <div className="mb-8 px-4 py-6 md:p-6 bg-black border border-dashed border-x-border/50 animate-fade-in w-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-space tracking-wide text-x-white">Social Connections</h3>
                <button onClick={() => setShowSocials(false)} className="text-red-500 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {profileUser.socialLinks && profileUser.socialLinks.length > 0 ? (
                  profileUser.socialLinks.map((social, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-center border border-white/20 px-5 py-2 rounded-full transition-all hover:border-[#e2442b]/60"
                    >
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-2"
                      >
                        <span className="font-space font-bold text-sm text-x-white">
                          {social.platform}
                        </span>
                        <svg className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: '#e2442b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {isOwnProfile && (
                        <button 
                          onClick={() => handleRemoveSocial(social)} 
                          className="absolute -top-1.5 -right-1.5 bg-black border border-white/20 text-white hover:text-red-500 rounded-full p-0.5 transition-all shadow-lg active:scale-90"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center border border-dashed border-white/10">
                    <p className="text-x-gray font-space italic opacity-60 text-sm tracking-widest uppercase">Connectivity Offline...</p>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <form onSubmit={handleAddSocial} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-x-gray uppercase tracking-widest mb-2 font-space">Platform</label>
                      <input
                        type="text"
                        placeholder="e.g. GitHub, Portfolio"
                        className="w-full bg-white border border-x-border p-3 text-black text-sm focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400"
                        value={newSocial.platform}
                        onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-x-gray uppercase tracking-widest mb-2 font-space">Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        className="w-full bg-white border border-x-border p-3 text-black text-sm focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400"
                        value={newSocial.url}
                        onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={socialSubmitting}
                    className="w-full bg-x-blue text-white py-4 sm:py-3 font-space font-bold tracking-widest text-xs uppercase hover:bg-x-blue/80 transition-all disabled:opacity-50"
                  >
                    Establish Connection
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Update Profile Prompt - Show for new users who haven't completed their profile */}
          {showUpdatePrompt && (
            <UpdateProfilePrompt 
              user={profileUser} 
              onDismiss={handleDismissPrompt}
            />
          )}

          <div className="mb-8">
            <div className="border-b border-x-border/30 px-4 sm:px-0">
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
            <div className="w-full max-w-2xl mx-auto px-0 py-2 sm:py-4 mb-24 md:mb-8">
              <div className="flex items-center justify-start mb-8 border-b border-x-border/30 pb-4 px-4 sm:px-0">
                <h3 
                  className="text-3xl md:text-4xl font-black text-x-white tracking-tighter"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Post Archive
                </h3>
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
                <div className="mt-6 flex items-center justify-center">
                  <div className="flex-1 border-t border-dotted border-x-gray mx-2" />
                  <span className="text-x-gray text-sm px-3 whitespace-nowrap">
                    end of post
                  </span>
                  <div className="flex-1 border-t border-dotted border-x-gray mx-2" />
                </div>
              )}
            </div>
          )}
          {activeTab === "activity" && (
            viewingSavedPosts ? (
              <SavedPostsList onBack={() => setViewingSavedPosts(false)} />
             ) : (
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
              {isOwnProfile && (
                <div className="mt-8 pt-6 border-t border-x-border/20">
                  <h4 className="text-lg font-bold text-x-white mb-4">Your Private Bookmarks</h4>
                  <button
                    onClick={() => setViewingSavedPosts(true)}
                    className="inline-flex items-center px-6 py-3 bg-x-blue text-white rounded-full font-semibold transition-colors hover:bg-x-green"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    View Saved Posts
                  </button>
                </div>
              )}
            </div>
            )
          )}
          {activeTab === "about" && (
            <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/30 p-8 animate-fade-in mb-8">
              <div className="flex items-center justify-start mb-8 border-b border-x-border/30 pb-4">
                <h3 
                  className="text-3xl md:text-4xl font-black text-x-white tracking-tighter"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  About Person
                </h3>
              </div>
              
              <div className="space-y-6 font-space">
                <div>
                  <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Full Name</h4>
                  <p className="text-x-white text-lg">{profileUser.displayName || profileUser.username}</p>
                </div>

                <div>
                  <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Biography</h4>
                  <p className="text-x-white leading-relaxed">{profileUser.bio || "No biography provided."}</p>
                </div>

                <div>
                  <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Email Identity</h4>
                  <p className="text-x-white text-lg">{profileUser.email || (isOwnProfile ? user.email : "Email not public")}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Gender</h4>
                    <p className="text-x-white text-lg">{profileUser.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Date of Birth</h4>
                    <p className="text-x-white text-lg">
                      {profileUser.dob ? new Date(profileUser.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-x-blue font-bold uppercase tracking-widest text-xs mb-2">Nationality</h4>
                    <p className="text-x-white text-lg">{profileUser.nationality || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-x-dark/70 to-x-dark/40 backdrop-blur-sm border border-x-border/40 p-8 mt-8 text-center rounded-none">
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

      {/* Avatar Preview Modal - Moved outside to escape transform context */}
      {showAvatarPreview && profileUser.avatar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in"
            onClick={() => setShowAvatarPreview(false)}
          />
          
          {/* Close Button */}
          <button 
            onClick={() => setShowAvatarPreview(false)}
            className="absolute top-6 right-6 z-[1010] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="relative z-[1010] max-w-full max-h-full animate-in zoom-in fade-in duration-300 flex flex-col items-center">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.displayName} 
              className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-6 text-center">
              <h3 className="text-white font-space font-bold text-xl tracking-tight">
                {profileUser.displayName || profileUser.username}
              </h3>
              <p className="text-x-gray text-sm font-mono opacity-60">
                @{profileUser.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
// No unused variables found in Profile.js main logic
