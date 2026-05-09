import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";

const CommunityPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [allCommunities, setAllCommunities] = useState([]);
  const [joiningId, setJoiningId] = useState(null);
  const [selectedFlairFilter, setSelectedFlairFilter] = useState(null);

  useEffect(() => {
    fetchCommunity();
    fetchAllCommunities();
    // eslint-disable-next-line
  }, [slug]);

  const fetchCommunity = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/communities/${slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCommunity(res.data);
      setPosts(res.data.posts || []);
    } catch (err) {
      if (err.response?.status === 404) setError("Community not found");
      else setError("Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCommunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/communities", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAllCommunities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinLeave = async () => {
    if (!user) return navigate("/login");
    setJoining(true);
    try {
      const token = localStorage.getItem("token");
      const action = community.isMember ? "leave" : "join";
      await axios.post(`/api/communities/${action}/${community._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommunity((prev) => ({
        ...prev,
        isMember: !prev.isMember,
        memberCount: prev.isMember ? prev.memberCount - 1 : prev.memberCount + 1,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleOtherJoinLeave = async (c) => {
    if (!user) return navigate("/login");
    setJoiningId(c._id);
    try {
      const token = localStorage.getItem("token");
      const action = c.isMember ? "leave" : "join";
      await axios.post(`/api/communities/${action}/${c._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCommunities((prev) =>
        prev.map((item) =>
          item._id === c._id
            ? { ...item, isMember: !item.isMember, memberCount: item.isMember ? item.memberCount - 1 : item.memberCount + 1 }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const otherCommunities = allCommunities.filter((c) => c.slug !== slug);

  const filteredPosts = selectedFlairFilter 
    ? posts.filter(p => p.flair?.name === selectedFlairFilter)
    : posts;

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/5 rounded-xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-black text-white mb-2">{error}</h2>
        <Link to="/communities" className="text-x-blue text-sm font-bold hover:underline">
          ← Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen">
      <style>{`
        body { overflow-x: hidden !important; width: 100vw !important; position: relative !important; }
        .x-main, .x-main-mobile { overflow-x: hidden !important; max-width: 100vw !important; }
      `}</style>
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pb-20">
      {/* Community Header */}
      <div
        className="mb-6 border-b border-x-border/20 pb-6 pt-4 sm:px-0"
        style={{ borderTop: `3px solid ${community.color}` }}
      >
        <div className="flex items-start justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden ${!community.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
              style={community.icon?.startsWith("/") ? {} : {
                background: `${community.color}20`,
                border: `1px solid ${community.color}40`,
              }}
            >
              {community.icon?.startsWith("/") ? (
                <img src={community.icon} alt="" className="w-full h-full object-contain p-2" />
              ) : (
                community.icon
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="text-xl md:text-3xl font-black text-white tracking-tighter leading-tight break-words"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {community.name}
              </h1>
              <div className="hidden sm:flex items-center gap-4 mt-2">
                <span className="text-base text-white/50 font-medium">
                  <span className="font-black text-white">{community.memberCount}</span> members
                </span>
                <span className="text-white/20">•</span>
                <span className="text-base text-white/50 font-medium">
                  <span className="font-black text-white">{posts.length}</span> posts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mt-1">
            {user && (
              <Link
                to="/create-post"
                state={{ communityId: community._id, communityName: community.name, communitySlug: community.slug }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                title="Create Post"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            )}
            <button
              onClick={handleJoinLeave}
              disabled={joining}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                community.isMember
                  ? "bg-white/10 text-x-gray hover:text-red-400 hover:bg-white/20"
                  : "bg-white text-black shadow-lg hover:scale-110 active:scale-95"
              }`}
            >
              {joining ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : community.isMember ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Stat Bar */}
        <div className="flex sm:hidden items-center border border-white/10 rounded-full overflow-hidden mt-6 mb-4 bg-white/[0.03] px-2 w-full min-w-0">
          <div className="flex-1 py-3 px-4 text-center">
            <p className="text-lg font-black text-white leading-none">{community.memberCount}</p>
            <p className="text-[10px] font-bold text-x-gray uppercase tracking-widest mt-1">Members</p>
          </div>
          <div className="w-[1px] h-8 bg-x-border/30"></div>
          <div className="flex-1 py-3 px-4 text-center">
            <p className="text-lg font-black text-white leading-none">{posts.length}</p>
            <p className="text-[10px] font-bold text-x-gray uppercase tracking-widest mt-1">Posts</p>
          </div>
        </div>

        <p className="text-white/80 text-lg md:text-xl font-bold mt-6 leading-relaxed max-w-3xl break-words">
          {community.description}
        </p>

        {/* Flair Filter Bar */}
        {community?.flairs?.length > 0 && (
          <div className="w-full overflow-hidden mt-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              <button
                onClick={() => setSelectedFlairFilter(null)}
                className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 border whitespace-nowrap ${
                  !selectedFlairFilter 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-x-gray border-white/10 hover:border-white/30"
                }`}
              >
                All Posts
              </button>
              {community.flairs.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFlairFilter(f.name === selectedFlairFilter ? null : f.name)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 border whitespace-nowrap`}
                  style={{
                    backgroundColor: selectedFlairFilter === f.name ? f.color : 'transparent',
                    color: selectedFlairFilter === f.name ? '#000' : f.color,
                    borderColor: selectedFlairFilter === f.name ? f.color : `${f.color}40`
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center pt-0 pb-20 text-x-gray px-3">
          <img 
            src="/no-post.svg" 
            alt="No posts" 
            className="w-full max-w-[280px] sm:max-w-[400px] h-auto mx-auto mb-6 opacity-95 animate-in fade-in zoom-in duration-1000" 
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <p className="font-black text-white text-lg sm:text-xl tracking-tight whitespace-nowrap">No posts yet</p>
            {user && (
              <Link
                to="/create-post"
                state={{ communityId: community._id, communityName: community.name, communitySlug: community.slug }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white border border-white/20 rounded-full text-sm font-black hover:bg-white hover:text-black transition-all duration-300 shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                Create First Post
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-x-border/20">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={(updated) =>
                setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
              }
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
          {filteredPosts.length === 0 && selectedFlairFilter && (
            <div className="text-center py-20">
              <p className="text-x-gray font-bold">No posts found with this flair.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Explore Other Communities ─────────────────── */}
      {otherCommunities.length > 0 && (
        <div className="mt-10 px-3 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-x-gray">
              Explore Communities
            </h2>
            <Link
              to="/communities"
              className="text-xs font-bold text-x-blue hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {otherCommunities.map((c) => (
              <div
                key={c._id}
                className="flex items-center gap-3 p-2 px-4 bg-transparent border border-white/10 rounded-full hover:bg-white/[0.04] transition-all duration-200 group"
              >
                {/* Icon */}
                <Link to={`/community/${c.slug}`} className="shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden ${!c.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
                    style={c.icon?.startsWith("/") ? {} : {
                      background: `${c.color}20`,
                      border: `1px solid ${c.color}30`,
                    }}
                  >
                    {c.icon?.startsWith("/") ? (
                      <img src={c.icon} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                      c.icon
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/community/${c.slug}`}>
                    <p className="text-sm font-black text-white truncate group-hover:text-x-blue transition-colors">
                      {c.name}
                    </p>
                  </Link>
                  <p className="text-xs text-x-gray">
                    <span className="font-bold text-white/70">{c.memberCount}</span> members
                  </p>
                </div>

                {/* Join/Leave */}
                <button
                  onClick={() => handleOtherJoinLeave(c)}
                  disabled={joiningId === c._id}
                  className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                    c.isMember
                      ? "bg-white/5 text-x-gray border border-white/10"
                      : "bg-white text-black border-none shadow-lg"
                  }`}
                >
                  {joiningId === c._id ? (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : c.isMember ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CommunityPage;
