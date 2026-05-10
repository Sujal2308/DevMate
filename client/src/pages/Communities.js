import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../config/axios";

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching communities, token:", token ? "present" : "missing");
      const res = await axios.get("/api/communities", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Communities response:", res.data);
      setCommunities(res.data);
    } catch (err) {
      console.error("Communities fetch error:", err);
      setFetchError(err.response?.data?.message || err.message || "Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (community) => {
    setJoiningId(community._id);
    try {
      const token = localStorage.getItem("token");
      const action = community.isMember ? "leave" : "join";
      await axios.post(`/api/communities/${action}/${community._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === community._id
            ? {
                ...c,
                isMember: !c.isMember,
                memberCount: c.isMember ? c.memberCount - 1 : c.memberCount + 1,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const joined = filtered.filter((c) => c.isMember);
  const discover = filtered.filter((c) => !c.isMember);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pb-20">
      {/* Header */}
      <div className="mb-8 border-b border-x-border/20 pb-6 pt-4 px-3 sm:px-0">
        <div className="flex items-center mb-2">
          <h1
            className="text-4xl md:text-5xl font-black text-x-white tracking-tighter"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Communities
          </h1>
        </div>
        <p className="text-x-gray text-base opacity-70">
          Join developer communities and share knowledge with your tribe.
        </p>
      </div>

      {/* API Error */}
      {fetchError && (
        <div className="px-3 sm:px-0 mb-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchCommunities}
              className="text-xs font-bold text-red-400 hover:text-red-300 shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-3 sm:px-0 mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full bg-white text-black pl-11 pr-5 py-3 rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-x-blue/30 transition-all placeholder-black/40 shadow-xl"
          />
        </div>
      </div>

      {/* Joined Communities */}
      {joined.length > 0 && (
        <section className="mb-8 px-3 sm:px-0">
          <h2 className="text-xs font-black uppercase tracking-widest text-x-gray mb-3">
            Joined · {joined.length}
          </h2>
          <div className="space-y-2">
            {joined.map((c) => (
              <CommunityCard
                key={c._id}
                community={c}
                onJoinLeave={handleJoinLeave}
                loading={joiningId === c._id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Discover Communities */}
      {discover.length > 0 && (
        <section className="px-3 sm:px-0">
          <h2 className="text-xs font-black uppercase tracking-widest text-x-gray mb-3">
            Discover · {discover.length}
          </h2>
          <div className="space-y-2">
            {discover.map((c) => (
              <CommunityCard
                key={c._id}
                community={c}
                onJoinLeave={handleJoinLeave}
                loading={joiningId === c._id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty States */}
      {!fetchError && filtered.length === 0 && communities.length > 0 && (
        <div className="text-center py-16 text-x-gray px-3">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold text-white">No communities found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {!fetchError && communities.length === 0 && !loading && (
        <div className="text-center py-16 text-x-gray px-3">
          <div className="text-4xl mb-3">🏘️</div>
          <p className="font-bold text-white">No communities yet</p>
          <p className="text-sm mt-1">Communities will appear here once created</p>
          <button onClick={fetchCommunities} className="mt-4 text-sm font-bold text-x-blue hover:underline">
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

const CommunityCard = ({ community, onJoinLeave, loading }) => {
  return (
    <div className="flex items-center gap-4 p-3 px-5 bg-transparent border border-white/10 rounded-full hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200 group">
      {/* Icon */}
      <Link to={`/community/${community.slug}`} className="shrink-0">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden ${!community.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
          style={community.icon?.startsWith("/") ? {} : { background: `${community.color}20`, border: `1px solid ${community.color}30` }}
        >
          {community.icon?.startsWith("/") ? (
            <img src={community.icon} alt="" className="w-full h-full object-contain p-2" />
          ) : (
            community.icon
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/community/${community.slug}`}>
          <h3 className="font-black text-white text-sm sm:text-lg leading-tight group-hover:text-x-blue transition-colors truncate">
            {community.name}
          </h3>
        </Link>
        <p className="text-x-gray text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-1">{community.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-x-gray">
            <span className="font-bold text-white">{community.memberCount}</span> members
          </span>
          {community.postCount > 0 && (
            <span className="text-xs text-x-gray">
              <span className="font-bold text-white">{community.postCount}</span> posts
            </span>
          )}
        </div>
      </div>

      {/* Join / Leave */}
      <button
        onClick={() => onJoinLeave(community)}
        disabled={loading}
        className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          community.isMember
            ? "bg-white/10 text-x-gray hover:text-red-400 hover:bg-white/20"
            : "bg-white text-black shadow-lg hover:scale-110 active:scale-95"
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : community.isMember ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Communities;
