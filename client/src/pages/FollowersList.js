import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";

const FollowersList = () => {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <ShimmerEffect type="profile" />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="w-full min-h-[60vh] py-10 px-2 sm:px-4 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-extrabold text-x-white tracking-tight bg-gradient-to-r from-x-blue via-purple-400 to-x-green bg-clip-text text-transparent animate-color-cycle font-mono">
            Followers
          </h2>
          {/* Logo after Followers text */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#6366F1"
              strokeWidth="2.2"
              fill="#18181b"
            />
            <path
              d="M8 12l2 2 4-4"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <Link
          to={`/profile/${username}`}
          className="text-x-blue hover:underline text-base font-medium"
        >
          Back to Profile
        </Link>
      </div>
      {followers.length === 0 ? (
        <div className="text-x-gray text-lg text-center py-16 bg-x-dark/40 rounded-2xl shadow-inner">
          No followers yet.
          <br />
          <span className="text-x-blue text-base mt-2 block">
            When someone follows you, they will appear here. Start connecting
            with others to grow your network!
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {followers.map((follower) => (
              <div
                key={follower._id}
                className="bg-gradient-to-br from-x-dark/80 to-x-dark/40 border border-x-border/30 rounded-2xl p-4 flex items-center gap-5 shadow-lg hover:scale-[1.02] hover:shadow-xl transition-transform w-full relative"
              >
                <Link
                  to={`/profile/${follower.username}`}
                  className="flex-shrink-0"
                >
                  <div className="bg-gradient-to-r from-x-blue to-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
                    {follower.displayName?.charAt(0).toUpperCase() ||
                      follower.username.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0 flex flex-col items-start gap-0">
                  <Link
                    to={`/profile/${follower.username}`}
                    className="text-xl font-semibold text-x-white hover:text-x-blue truncate block font-mono"
                  >
                    {follower.displayName || follower.username}
                  </Link>
                  <div className="text-x-gray text-sm truncate font-mono mt-1">
                    @{follower.username}
                  </div>
                </div>
                {/* Aeroplane logo on all devices, right side of card, clickable to messages page */}
                <Link
                  to={`/messages/${follower.username}`}
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center group"
                  title={`Message ${follower.displayName || follower.username}`}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:scale-110"
                  >
                    <path d="M10.5 21L21 3 3 10.5l7.5 3.5L14 20z" />
                  </svg>
                </Link>
              </div>
            ))}
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
