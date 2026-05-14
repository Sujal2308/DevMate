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
      const res = await axios.get("/api/communities", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-20">
      {/* Header */}
      <div className="mb-10 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1
              className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Communities
            </h1>
            <p className="text-x-gray text-sm font-medium opacity-60">
              Discover your tribe and share your journey.
            </p>
          </div>
          
          {/* Search */}
          <div className="w-full md:w-64 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30"
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
              placeholder="Search..."
              className="w-full bg-white/5 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-x-blue/30 transition-all border border-white/10"
            />
          </div>
        </div>
      </div>

      {/* API Error */}
      {fetchError && (
        <div className="mb-8">
          <div className="bg-red-500/10 border-2 border-red-500/20 rounded-xl px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{fetchError}</span>
            </div>
            <button
              onClick={fetchCommunities}
              className="px-3 py-1.5 bg-red-500/20 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Joined Communities */}
      {joined.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-x-gray">
              Joined Communities
            </h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-x-gray">
              Discover New Tribes
            </h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-bold text-white">No matches found</p>
          <p className="text-x-gray text-xs mt-2">Try searching for something else</p>
        </div>
      )}

      {!fetchError && communities.length === 0 && !loading && (
        <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
          <div className="text-4xl mb-4">🏘️</div>
          <p className="text-lg font-bold text-white">The neighborhood is quiet</p>
          <p className="text-x-gray text-xs mt-2">Check back later for new communities</p>
          <button 
            onClick={fetchCommunities} 
            className="mt-6 px-6 py-2.5 bg-x-blue text-white rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

const CommunityCard = ({ community, onJoinLeave, loading }) => {
  return (
    <div className="bg-[#1a1a1a] border-2 border-[#333333] rounded-lg p-4 hover:border-x-blue transition-all duration-300 flex flex-col">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <Link to={`/community/${community.slug}`} className="shrink-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl overflow-hidden bg-black border border-white/10"
              style={!community.icon?.startsWith("/") ? { background: `${community.color}10` } : {}}
            >
              {community.icon?.startsWith("/") ? (
                <img src={community.icon} alt="" className="w-full h-full object-contain p-1.5" />
              ) : (
                community.icon
              )}
            </div>
          </Link>

          {/* Name and Member info */}
          <div className="flex flex-col min-w-0 gap-0.5">
            <Link to={`/community/${community.slug}`}>
              <h3 className="font-black text-white text-sm tracking-tight truncate leading-tight">
                {community.name}
              </h3>
            </Link>
            <p className="text-[9px] font-bold text-x-gray uppercase tracking-widest opacity-50">
              {community.memberCount.toLocaleString()} members
            </p>
          </div>
        </div>

        {/* Action Button - Icon Only */}
        <button
          onClick={() => onJoinLeave(community)}
          disabled={loading}
          className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-all border-2 ${
            community.isMember
              ? "bg-white/5 border-white/20 text-x-gray hover:text-red-400 hover:border-red-500/50"
              : "bg-white border-white text-black hover:bg-x-blue hover:border-x-blue hover:text-white shadow-lg"
          }`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : community.isMember ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {/* Description below everything else */}
      <p className="text-white text-[13px] leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
        {community.description}
      </p>
    </div>
  );
};

export default Communities;
