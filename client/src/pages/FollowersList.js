import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import { useAuth } from "../contexts/AuthContext";

const FollowersList = () => {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser, updateUser } = useAuth();
  const [followLoadings, setFollowLoadings] = useState({});

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/users/${username}/followers`);
        setFollowers(res.data.followers || []);
      } catch (err) {
        setError("Failed to fetch followers");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
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

  if (loading) return <ShimmerEffect type="followers" />;
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
          Followers
        </h2>
      </div>
      {followers.length === 0 ? (
        <div className="text-x-gray text-lg text-center py-16">
          No followers yet.
          <br />
          <span className="text-x-blue text-base mt-2 block font-mono">
            When someone follows you, they will appear here. Start connecting
            with others to grow your network!
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {followers.map((follower) => {
              const followerId = follower._id || follower.id;
              return (
                <div
                  key={followerId}
                  className="flex items-center justify-between py-3 border-b border-x-border/10 last:border-b-0 w-full min-h-[56px] gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      to={`/profile/${follower.username}`}
                      className="flex-shrink-0"
                    >
                      <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden relative border border-x-border/30">
                        {follower.avatar ? (
                          <img
                            src={follower.avatar}
                            alt={follower.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          follower.displayName?.charAt(0).toUpperCase() ||
                          follower.username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="min-w-0 flex flex-col items-start gap-0">
                      <Link
                        to={`/profile/${follower.username}`}
                        className="text-base font-semibold text-x-white hover:text-x-blue truncate block font-mono"
                      >
                        {follower.displayName || follower.username}
                      </Link>
                      <div className="text-x-gray text-xs truncate font-mono mt-0.5">
                        @{follower.username}
                      </div>
                    </div>
                  </div>
                  {currentUser && currentUser.username !== follower.username && (
                    <button
                      onClick={() => handleFollowToggle(follower)}
                      disabled={followLoadings[followerId]}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs md:text-sm transition-all duration-200 focus:outline-none w-28 text-center flex items-center justify-center ${
                        currentUser.following?.includes(followerId)
                          ? "bg-white/10 text-x-gray hover:bg-white/20 border border-x-border/40"
                          : "bg-x-blue text-white hover:bg-x-blue/80"
                      } ${
                        followLoadings[followerId]
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {followLoadings[followerId] ? (
                        <span className="animate-pulse">...</span>
                      ) : currentUser.following?.includes(followerId) ? (
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
            That's everyone for now! 🎉
            <br />
            <span className="text-x-gray text-base">
              Keep engaging to grow your followers list.
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default FollowersList;
