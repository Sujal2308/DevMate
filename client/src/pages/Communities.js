import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../config/axios";

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [activeTab] = useState("joined");

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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
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
      <div className="mb-12 pt-8">
        <div className="mb-10">
          <h1
            className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Communities
          </h1>
          <p className="text-x-gray text-base md:text-xl font-medium opacity-60 max-w-2xl leading-relaxed">
            Discover your tribe, join active discussions, and build meaningful connections within our specialized developer communities.
          </p>
        </div>
        
        {/* Search - Positioned below the main text */}
        <div className="w-full relative max-w-xl">
          <svg
            className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
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
            placeholder="Explore communities..."
            className="w-full bg-transparent text-white pl-14 pr-6 py-4 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-white/10 transition-all border-2 border-white shadow-2xl placeholder:text-white/40"
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-8 mt-10 border-b border-white/5 pb-2">
          <div
            className="pb-3 px-2 text-sm font-black transition-all relative text-[#FF6347]"
          >
            Joined
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF6347] rounded-full"></div>
          </div>
          <Link
            to="/explore-communities"
            className="pb-3 px-2 text-sm font-black transition-all relative text-white opacity-60 hover:opacity-100 hover:text-purple-500"
          >
            Explore
          </Link>
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

      {/* Joined Communities View */}
      {activeTab === "joined" && (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {joined.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 mt-6">
              {joined.map((c) => (
                <CommunityCard
                  key={c._id}
                  community={c}
                  onJoinLeave={handleJoinLeave}
                  loading={joiningId === c._id}
                />
              ))}
              
              {/* End of list message */}
              <div className="text-center py-8 mt-4 border-t border-white/5 animate-fade-in">
                <p className="text-[10px] font-black text-x-gray uppercase tracking-[0.25em] opacity-60">
                  🚀 You've reached the end of your communities
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-white/10 mt-6">
              <div className="text-4xl mb-4">🏠</div>
              <p className="text-lg font-bold text-white">No joined communities yet</p>
              <p className="text-x-gray text-xs mt-2">Switch to Explore to find your tribe</p>
              <Link 
                to="/explore-communities" 
                className="mt-6 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform inline-block"
              >
                Go Explore
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Empty States */}
      {!fetchError && filtered.length === 0 && communities.length > 0 && (
        <div className="text-center py-16 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <img src="/Feeling sorry-cuate.svg" alt="No results" className="w-80 h-80 mb-6 opacity-100" />
          <h3 className="text-3xl font-black text-white tracking-tighter">No tribes found</h3>
          <p className="text-x-gray text-base mt-2 opacity-60 font-medium max-w-sm">We couldn't find any communities matching your search criteria.</p>
          <button 
            onClick={() => setSearch("")}
            className="mt-10 px-12 py-4 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-x-blue hover:text-white transition-all active:scale-95 shadow-2xl"
          >
            Clear Exploration
          </button>
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
    <div className="flex flex-col p-6 bg-[#16181C] md:bg-[#0a192f]/40 rounded-2xl border border-white/5 mb-4 hover:border-white/20 transition-all duration-300 shadow-xl">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <Link to={`/community/${community.slug}`} className="shrink-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl overflow-hidden"
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
            <p className="text-[9px] font-medium text-white uppercase tracking-widest opacity-40">
              {community.memberCount.toLocaleString()} members
            </p>
          </div>
        </div>

        {/* Action Button - Icon Only */}
        {/* Action Button - Pill Text */}
        <button
          onClick={() => onJoinLeave(community)}
          disabled={loading}
          className={`px-6 py-2 shrink-0 flex items-center justify-center rounded-full transition-all font-black text-[11px] uppercase tracking-widest ${
            community.isMember
              ? "bg-white/5 border border-white/20 text-x-gray hover:text-red-400 hover:border-red-500/50"
              : "bg-x-blue text-white shadow-lg shadow-x-blue/20 hover:scale-105 active:scale-95"
          }`}
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : community.isMember ? (
            "Joined"
          ) : (
            "Join"
          )}
        </button>
      </div>

      {/* Description below everything else */}
      <p className="text-white/90 text-base md:text-lg leading-relaxed line-clamp-3 transition-opacity">
        {community.description}
      </p>
    </div>
  );
};

export default Communities;
