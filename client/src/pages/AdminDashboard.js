import React, { useState, useEffect, useMemo } from "react";
import axios from "../config/axios";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import BlockUserModal from "../components/BlockUserModal";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, pendingReports: 0 });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPost, setViewingPost] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);
  const { token } = useAuth();

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [statsRes, usersRes, reportsRes] = await Promise.all([
          axios.get("/api/admin/stats", config),
          axios.get("/api/admin/users", config),
          axios.get("/api/admin/reports", config).catch(() => ({ data: [] }))
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, config);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) { alert("Error updating role"); }
  };

  const handleBlockUserSubmit = async (reason, days) => {
    if (!userToBlock) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`/api/admin/users/${userToBlock._id}/block`, { reason, days }, config);
      setUsers(users.map(u => u._id === userToBlock._id ? { ...u, isBlocked: res.data.isBlocked, blockReason: res.data.blockReason, blockedUntil: res.data.blockedUntil } : u));
      setUserToBlock(null);
      alert(res.data.message);
    } catch (err) { alert("Error blocking user"); }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`/api/admin/users/${userId}/block`, {}, config);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: res.data.isBlocked, blockReason: "", blockedUntil: null } : u));
      alert(res.data.message);
    } catch (err) { alert("Error unblocking user"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Delete user and all their content permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/users/${userId}`, config);
      setUsers(users.filter(u => u._id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      alert("User deleted successfully.");
    } catch (err) { alert("Error deleting user"); }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const status = action === "dismiss" ? "dismissed" : "resolved";
      await axios.put(`/api/admin/reports/${reportId}`, { status, adminNotes: `Action: ${action}` }, config);
      setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
    } catch (err) { alert("Error processing report"); }
  };

  const handleDeletePost = async (postId, reportId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/posts/${postId}`, config);
      if (reportId) {
        setReports(reports.map(r => r.targetId?._id === postId ? { ...r, status: "resolved" } : r));
      }
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
      if (viewingPost && viewingPost._id === postId) setViewingPost(null);
      alert("Post deleted successfully.");
    } catch (err) { alert("Error deleting post"); }
  };

  const getGroupedReports = useMemo(() => {
    const grouped = {};
    reports.forEach(report => {
      const targetId = report.targetId?._id;
      if (!targetId) return;
      if (!grouped[targetId]) {
        grouped[targetId] = { ...report, reporters: [report.reporter?.username], reportCount: 1, reportIds: [report._id] };
      } else {
        grouped[targetId].reportCount += 1;
        if (report.reporter?.username && !grouped[targetId].reporters.includes(report.reporter.username)) {
           grouped[targetId].reporters.push(report.reporter.username);
        }
        grouped[targetId].reportIds.push(report._id);
        if (report.status === 'pending') grouped[targetId].status = 'pending';
      }
    });
    return Object.values(grouped).sort((a, b) => b.reportCount - a.reportCount);
  }, [reports]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const paginate = (data) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const activityData = [40, 25, 60, 45, 80, 55, 90, 75, 100];
  const reportChartData = useMemo(() => {
    const pending = getGroupedReports.filter(r => r.status === 'pending').length;
    const resolved = getGroupedReports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length;
    const total = pending + resolved || 1;
    return { pending: (pending / total) * 100, resolved: (resolved / total) * 100, totalCount: pending + resolved };
  }, [getGroupedReports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="animate-fade-in space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-blue-600"></div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">System Diagnostics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0c0c0c] p-8 border border-white/5 relative overflow-hidden group">
                <h3 className="text-[10px] font-black text-slate-600 mb-2 tracking-[0.4em] uppercase">Total Users</h3>
                <p className="text-5xl font-black text-white tracking-tighter">{stats.totalUsers}</p>
                <div className="mt-4 h-1 bg-slate-900 overflow-hidden"><div className="h-full bg-blue-600 w-[70%]" /></div>
              </div>
              <div className="bg-[#0c0c0c] p-8 border border-white/5 relative overflow-hidden group">
                <h3 className="text-[10px] font-black text-slate-600 mb-2 tracking-[0.4em] uppercase">Total Posts</h3>
                <p className="text-5xl font-black text-white tracking-tighter">{stats.totalPosts}</p>
                <div className="mt-4 h-1 bg-slate-900 overflow-hidden"><div className="h-full bg-emerald-600 w-[45%]" /></div>
              </div>
              <div className="bg-[#0c0c0c] p-8 border border-white/5 relative overflow-hidden group">
                <h3 className="text-[10px] font-black text-slate-600 mb-2 tracking-[0.4em] uppercase">Security Alerts</h3>
                <p className={`text-5xl font-black tracking-tighter ${reportChartData.totalCount > 0 ? 'text-red-600' : 'text-blue-500'}`}>
                  {reportChartData.totalCount > 10 ? 'HIGH' : reportChartData.totalCount > 0 ? 'MED' : 'CLR'}
                </p>
                <div className="mt-4 h-1 bg-slate-900 overflow-hidden"><div className={`h-full ${reportChartData.totalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'} w-full`} /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#080808] border border-white/5 p-10 h-[400px]">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Activity Monitor</h4>
                <div className="h-[250px] relative">
                   <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <path d={`M 0,100 ${activityData.map((d, i) => `L ${(i / (activityData.length - 1)) * 100},${100 - d}`).join(' ')} L 100,100 Z`} fill="url(#gradient-blue)" opacity="0.1" />
                     <path d={`M 0,${100 - activityData[0]} ${activityData.map((d, i) => `L ${(i / (activityData.length - 1)) * 100},${100 - d}`).join(' ')}`} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" className="animate-draw" />
                     <defs><linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
                   </svg>
                </div>
              </div>
              <div className="bg-[#080808] border border-white/5 p-10 h-[400px] flex flex-col items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-10">Resolution Metrics</h4>
                <div className="relative">
                   <svg className="w-48 h-48 -rotate-90" viewBox="0 0 36 36">
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#111" strokeWidth="4" />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#dc2626" strokeWidth="4" strokeDasharray={`${reportChartData.pending} 100`} />
                     <circle cx="18" cy="18" r="16" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray={`${reportChartData.resolved} 100`} strokeDashoffset={`-${reportChartData.pending}`} />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white italic">{reportChartData.totalCount}</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase">Reports</span>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-[#080808] border border-white/5 p-10">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Internal System Logs</h4>
               <div className="bg-black/80 border border-white/5 p-6 h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2">
                  <p className="text-emerald-500/70">[ {new Date().toLocaleTimeString()} ] : SECURITY_PROTOCOL_INITIALIZED ... OK</p>
                  <p className="text-slate-600">[ {new Date().toLocaleTimeString()} ] : FETCHING_DATA_NODES ( {stats.totalUsers} INSTANCES )</p>
                  <p className="text-emerald-500">[ {new Date().toLocaleTimeString()} ] : STATUS : ALL_SYSTEMS_OPERATIONAL</p>
               </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="animate-fade-in space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-blue-600"></div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">User Management</h2>
                </div>
                <div className="relative w-full md:w-96">
                  <input 
                    type="text" 
                    placeholder="Filter System Identities..."
                    value={userSearchTerm}
                    onChange={(e) => {setUserSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-6 py-4 text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-800"
                  />
                </div>
             </div>

             <div className="bg-[#080808] border border-white/5 overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#111] text-slate-600 uppercase text-[10px] font-black tracking-[0.2em]">
                        <tr>
                          <th className="px-8 py-6">User Details</th>
                          <th className="px-8 py-6">Email Address</th>
                          <th className="px-8 py-6">Role</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {paginate(filteredUsers).map((user) => (
                          <tr key={user._id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  {user.avatar ? (
                                    <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black">{user.username.charAt(0).toUpperCase()}</div>
                                  )}
                                  <div>
                                    <p className="font-black text-white text-base tracking-tight uppercase italic">{user.username}</p>
                                    {user.isBlocked && (
                                       <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-0.5">Blocked Until: {user.blockedUntil ? new Date(user.blockedUntil).toLocaleDateString() : 'Permanent'}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 font-bold text-slate-500 italic">{user.email}</td>
                              <td className="px-8 py-6">
                                <span className={`inline-block px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest text-center ${user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-[#222] text-slate-500'}`}>
                                    {user.role}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <button onClick={() => handleRoleChange(user._id, user.role)} className="px-4 py-2 bg-[#1a1a1a] hover:bg-blue-600 text-white text-[9px] font-black uppercase transition-all border border-white/5">Make Admin</button>
                                  <button onClick={() => user.isBlocked ? handleUnblockUser(user._id) : setUserToBlock(user)} className={`px-4 py-2 text-[9px] font-black uppercase border ${user.isBlocked ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600 hover:text-white' : 'bg-orange-600/10 text-orange-500 border-orange-500/20 hover:bg-orange-600 hover:text-white'}`}>{user.isBlocked ? 'Unblock' : 'Block'}</button>
                                  <button onClick={() => handleDeleteUser(user._id)} className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-black uppercase border border-red-500/20">Delete</button>
                                </div>
                              </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#0a0a0a] border-t border-white/10 px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-white">{filteredUsers.length}</span> identities
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-white/20 disabled:opacity-20 transition-all group"><svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-white/20 disabled:opacity-20 transition-all group"><svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
                    <div className="flex items-center gap-1 mx-2">
                       {Array.from({ length: Math.min(5, totalUserPages) }, (_, i) => {
                          let pageNum;
                          if (totalUserPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalUserPages - 2) pageNum = totalUserPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
                          return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 text-[10px] font-black transition-all border ${currentPage === pageNum ? 'bg-white text-black border-white' : 'bg-transparent text-slate-600 border-white/5 hover:border-white/20'}`}>{pageNum}</button>);
                       })}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalUserPages, p + 1))} disabled={currentPage === totalUserPages} className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-white/20 disabled:opacity-20 transition-all group"><svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
                    <button onClick={() => setCurrentPage(totalUserPages)} disabled={currentPage === totalUserPages} className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-white/20 disabled:opacity-20 transition-all group"><svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                  </div>
                </div>
             </div>
          </div>
        );
      case "content":
        return (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-10 bg-red-600"></div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">Report Registry</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {getGroupedReports.length > 0 ? (
                getGroupedReports.map((report) => (
                  <div key={report._id} className="bg-[#0c0c0c] border border-white/[0.03] p-8 flex flex-col lg:flex-row justify-between gap-8 relative group hover:border-white/10 transition-all">
                    {report.status === 'pending' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="bg-red-600 text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase italic">Flags: {report.reportCount}</div>
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${report.status === 'pending' ? 'bg-slate-900 text-red-500 border-red-500/20' : 'bg-white/5 text-slate-700 border-white/5'}`}>{report.status}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic leading-tight">{report.reason}</h3>
                      {report.targetId ? (
                        <div className="space-y-4">
                           <p className="text-slate-500 font-bold text-sm italic line-clamp-2 bg-black/40 p-5 border border-white/5">"{report.targetId.content}"</p>
                           <button onClick={() => setViewingPost(report.targetId)} className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-400 underline tracking-[0.3em] transition-all">View Full Post Context</button>
                        </div>
                      ) : (
                        <p className="text-slate-800 font-black uppercase text-xs italic">[ Entry Purged ]</p>
                      )}
                    </div>
                    <div className="flex flex-row lg:flex-col gap-3 justify-center min-w-[180px]">
                      {report.status === 'pending' && (
                        <>
                          <button onClick={() => handleDeletePost(report.targetId?._id, report._id)} className="flex-1 lg:flex-none px-6 py-4 bg-red-600 text-white font-black uppercase text-[9px] hover:bg-red-700 transition-all shadow-xl italic tracking-widest">Purge Content</button>
                          <button onClick={() => report.reportIds.forEach(id => handleResolveReport(id, "dismiss"))} className="flex-1 lg:flex-none px-6 py-4 border border-white/10 text-slate-600 font-black uppercase text-[9px] hover:bg-white hover:text-black hover:border-white transition-all italic tracking-widest">Dismiss</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center border border-white/5 border-dashed">
                   <p className="text-slate-800 font-black text-2xl uppercase tracking-[0.5em] italic opacity-20">Clean Registry</p>
                </div>
              )}
            </div>

            {/* Inspection Modal */}
            {viewingPost && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-20 bg-black/98 backdrop-blur-sm">
                <div className="bg-[#050505] border border-white/20 w-full max-w-4xl h-full max-h-[85vh] flex flex-col shadow-2xl">
                   <div className="p-10 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-white">Security Inspection</h3>
                      <button onClick={() => setViewingPost(null)} className="text-slate-600 hover:text-white text-4xl transition-transform leading-none hover:rotate-90">×</button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-12 lg:p-16 custom-scrollbar">
                      <div className="mb-10">
                        <span className="text-[9px] font-black uppercase text-slate-700 tracking-[0.5em] block mb-3">Origin Node</span>
                        <p className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">@{viewingPost.author?.username || 'GHOST'}</p>
                      </div>
                      <div className="mb-10">
                        <span className="text-[9px] font-black uppercase text-slate-700 tracking-[0.5em] block mb-4 italic">Payload Fragment</span>
                        <div className="bg-black/50 border border-white/[0.03] p-10 text-xl font-bold text-slate-400 leading-relaxed italic">"{viewingPost.content}"</div>
                      </div>
                   </div>
                   <div className="p-8 border-t border-white/10 bg-[#0a0a0a] flex justify-end gap-6">
                      <button onClick={() => setViewingPost(null)} className="px-8 py-4 font-black text-slate-600 uppercase text-[10px] hover:text-white transition-colors tracking-widest italic">Abort</button>
                      <button onClick={() => {handleDeletePost(viewingPost._id); setViewingPost(null);}} className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] hover:bg-red-700 shadow-2xl transition-all tracking-widest italic">Purge Record</button>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="animate-fade-in py-32 text-center border border-white/5 border-dashed flex flex-col items-center gap-6">
             <div className="w-16 h-16 border-2 border-slate-900 rounded-full animate-spin border-t-blue-600" />
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-[0.5em] italic">System Core Standby</h2>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: "overview", label: "DIAGNOSTICS", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "users", label: "IDENTITY MGT", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "content", label: "REPORT REGISTRY", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" },
    { id: "settings", label: "SYSTEM CORE", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }
  ];

  return (
    <div className="flex min-h-screen bg-black font-sans text-slate-300">
      <div className="w-64 bg-[#080808] border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-10 border-b border-white/5">
          <h1 className="text-3xl font-black text-white tracking-tighter italic leading-none" style={{ fontFamily: "'Bungee', cursive" }}>DM</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-blue-600 animate-pulse"></div>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest leading-none">Security Override</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentPage(1); }} className={`w-full flex items-center space-x-4 px-6 py-4 transition-all rounded-sm group ${activeTab === item.id ? "bg-white text-black font-black italic shadow-lg shadow-white/5" : "text-slate-700 hover:text-white hover:bg-white/5"}`}>
              <svg className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={item.icon} /></svg>
              <span className="uppercase tracking-[0.2em] text-[10px] font-black">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <Link to="/feed" className="flex items-center space-x-4 px-6 py-4 w-full text-slate-800 hover:text-white transition-all font-black group italic">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="uppercase tracking-widest text-[10px] font-black">Exit Terminal</span>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
        <header className="lg:hidden flex justify-between items-center p-8 bg-[#080808] border-b border-white/5">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">DEVMATE</h1>
          <Link to="/feed" className="text-slate-600 hover:text-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></Link>
        </header>
        <main className="flex-1 overflow-y-auto p-12 lg:p-24 custom-scrollbar">{renderContent()}</main>
      </div>
      <BlockUserModal isOpen={!!userToBlock} onClose={() => setUserToBlock(null)} onConfirm={handleBlockUserSubmit} username={userToBlock?.username} />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        .animate-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 2s ease-out forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
