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
  const [selectedFlairFilter, setSelectedFlairFilter] = useState(null);
  const [showRules, setShowRules] = useState(false);

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


  const otherCommunities = allCommunities.filter((c) => c.slug !== slug);

  const filteredPosts = selectedFlairFilter 
    ? posts.filter(p => p.flair?.name === selectedFlairFilter)
    : posts;

  const rulesToDisplay = community?.rules && community.rules.length > 0
    ? community.rules.map(r => ({ title: r.title, desc: r.description }))
    : [
        { title: "Respectful Communication", desc: "Treat others with the same respect you'd want. No personal attacks or harassment." },
        { title: "Relevant Content", desc: "Keep posts and discussions focused on the community's theme or related technical topics." },
        { title: "No Spam/Self-Promotion", desc: "Avoid posting links to your own products or repetitive promotional content." },
        { title: "Clean Language", desc: "Avoid excessive profanity and maintain a professional developer environment." }
      ];

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
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pb-20 border-l border-r border-x-border/50">
      {/* Community Header */}
      <div
        className="mb-6 border-b border-x-border/20 pb-6 pt-4 sm:px-0"
        style={{ borderTop: `3px solid ${community.color}` }}
      >
        <div className="flex items-center justify-between gap-4 w-full min-w-0">
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

          <div className="flex items-center gap-2 shrink-0">
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

        {/* Community Rules Dropdown */}
        <div className={`mt-6 mb-2 overflow-hidden border border-white/5 transition-all duration-500 ease-in-out ${showRules ? 'bg-white rounded-xl shadow-2xl' : 'bg-white/[0.01] rounded-lg'}`}>
          <button
            onClick={() => setShowRules(!showRules)}
            className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${showRules ? 'text-gray-500 hover:bg-gray-50' : 'text-white/40 hover:bg-white/[0.02]'}`}
          >
            <div className="flex items-center gap-2">
              <svg className={`w-3.5 h-3.5 transition-colors duration-500 ${showRules ? 'text-amber-600' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Community Rules & Guidelines
            </div>
            <svg 
              className={`w-3.5 h-3.5 transition-all duration-500 ${showRules ? 'rotate-180 text-gray-400' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`grid transition-all duration-500 ease-in-out ${showRules ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="px-4 pb-5">
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  {rulesToDisplay.map((rule, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-[13px] sm:text-base font-bold text-gray-900 leading-tight">
                        {rule.title}
                      </h4>
                      <p className="text-[11px] sm:text-[13px] text-gray-600 leading-relaxed font-medium">
                        {rule.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
          {/* Responsive Grid View (visible on all screens) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {otherCommunities.map((c) => (
              <Link
                key={c._id}
                to={`/community/${c.slug}`}
                className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 min-w-0"
              >
                {/* Logo */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden ${!c.icon?.startsWith("/") ? "" : "bg-transparent border-none"}`}
                  style={c.icon?.startsWith("/") ? {} : {
                    background: `${c.color}20`,
                    border: `1px solid ${c.color}30`,
                  }}
                >
                  {c.icon?.startsWith("/") ? (
                    <img src={c.icon} alt="" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    c.icon
                  )}
                </div>

                {/* Name */}
                <span className="text-[10px] sm:text-xs font-black text-white mt-2 truncate w-full leading-tight">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CommunityPage;
