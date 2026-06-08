import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import { useAuth } from "../contexts/AuthContext";

const FollowingList = () => {
  const { username } = useParams();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser, updateUser } = useAuth();
  const [followLoadings, setFollowLoadings] = useState({});

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        // Always fetch with both followers and following data included
        const res = await axios.get(
          `/api/users/${username}?includeFollowersData=true&includeFollowingData=true`
        );
        setFollowing(res.data.user.following || []);
      } catch (err) {
        setError("Failed to fetch following");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [username]);

  const handleFollowToggle = async (targetUser) => {
    if (!currentUser) return;
    const targetId = targetUser._id || targetUser.id;
    const isCurrentlyFollowing = currentUser.following?.includes(targetId);

    setFollowLoadings((prev) => ({ ...prev, [targetId]: true }));

    try {
      if (isCurrentlyFollowing) {
        await axios.put(`/api/users/${targetUser.username}/unfollow`);
        const updatedFollowing = currentUser.following.filter(
          (id) => id !== targetId
        );
        updateUser({ ...currentUser, following: updatedFollowing });
      } else {
        await axios.put(`/api/users/${targetUser.username}/follow`);
        const updatedFollowing = [...(currentUser.following || []), targetId];
        updateUser({ ...currentUser, following: updatedFollowing });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoadings((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  if (loading) return <ShimmerEffect type="following" />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[60vh] py-10 px-2 sm:px-4 lg:px-8">
      <div className="flex items-center gap-4 mb-8 border-b border-x-border/10 pb-4">
        <Link
          to={`/profile/${username}`}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
          title="Back to Profile"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-x-white"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        <h2
          className="text-2xl sm:text-3xl font-black text-x-white tracking-tighter"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Following
        </h2>
      </div>
      {following.length === 0 ? (
        <div className="text-x-gray text-lg text-center py-16">
          Not following anyone yet.
          <br />
          <span className="text-x-blue text-base mt-2 block font-mono">
            Start following developers to see them here and grow your network!
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {following.map((user) => {
              const userId = user._id || user.id;
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between py-3 border-b border-x-border/10 last:border-b-0 w-full min-h-[56px] gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex-shrink-0"
                    >
                      <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden relative border border-x-border/30">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.displayName?.charAt(0).toUpperCase() ||
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="min-w-0 flex flex-col items-start gap-0">
                      <Link
                        to={`/profile/${user.username}`}
                        className="text-base font-semibold text-x-white hover:text-x-blue truncate block font-mono"
                      >
                        {user.displayName || user.username}
                      </Link>
                      <div className="text-x-gray text-xs truncate font-mono mt-0.5">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  {currentUser && currentUser.username !== user.username && (
                    <button
                      onClick={() => handleFollowToggle(user)}
                      disabled={followLoadings[userId]}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs md:text-sm transition-all duration-200 focus:outline-none w-28 text-center flex items-center justify-center ${
                        currentUser.following?.includes(userId)
                          ? "bg-white/10 text-x-gray hover:bg-white/20 border border-x-border/40"
                          : "bg-x-blue text-white hover:bg-x-blue/80"
                      } ${
                        followLoadings[userId]
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {followLoadings[userId] ? (
                        <span className="animate-pulse">...</span>
                      ) : currentUser.following?.includes(userId) ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center text-x-green text-lg font-mono">
            That's everyone you're following!
          </div>
        </>
      )}
    </div>
  );
};

export default FollowingList;
