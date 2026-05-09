import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ProjectsList = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    repoLink: "",
    liveLink: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isOwnProfile = user && user.username === username;

  useEffect(() => {
    fetchProfileAndProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfileAndProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${username}`);
      setProfileUser(response.data.user);
      setProjects(response.data.user.projects || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/users/${user.id}/projects`, newProject);
      setProjects(response.data.projects);
      setNewProject({ name: "", description: "", repoLink: "", liveLink: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Add project error:", err);
      setError(err.response?.data?.message || "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;

    try {
      const response = await axios.delete(`/api/users/${user.id}/projects/${projectId}`);
      setProjects(response.data.projects);
    } catch (err) {
      console.error("Delete project error:", err);
      setError("Failed to delete project");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-2xl mx-auto pt-0 pb-8 px-0 sm:px-4">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-x-dark/95 to-x-dark/70 backdrop-blur-sm border border-x-border/50 pt-8 pb-6 px-4 md:px-6 relative rounded-xl mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl md:text-5xl font-black text-x-white tracking-tighter" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Projects
            </h1>
            <p className="text-x-gray mt-1 font-space uppercase tracking-widest text-xs opacity-60">
              {isOwnProfile ? "Manage your work" : `Viewing ${profileUser?.displayName || username}'s projects`}
            </p>
          </div>
          <Link 
            to={`/profile/${username}`}
            className="p-2 border border-white/20 hover:border-white/60 transition-colors group"
          >
            <svg className="w-5 h-5 text-white/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>

        {isOwnProfile && !showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-x-blue/50 hover:bg-x-blue/5 transition-all group flex flex-row items-center justify-center gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-x-blue/20 transition-colors">
              <svg className="w-5 h-5 text-white/40 group-hover:text-x-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white/40 group-hover:text-x-blue uppercase tracking-[0.2em] font-space">Add New Project</span>
          </button>
        )}

        {showAddForm && (
          <form onSubmit={handleAddProject} className="space-y-4 animate-fade-in border-t border-white/10 pt-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project Name *"
                required
                className="w-full bg-white border border-x-border p-3 text-black focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
              <textarea
                placeholder="Brief Description"
                className="w-full bg-white border border-x-border p-3 text-black focus:border-x-blue outline-none font-space h-24 transition-colors placeholder:text-gray-400"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="Repo Link (GitHub/GitLab)"
                  className="w-full bg-white border border-x-border p-3 text-black focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400"
                  value={newProject.repoLink}
                  onChange={(e) => setNewProject({...newProject, repoLink: e.target.value})}
                />
                <input
                  type="url"
                  placeholder="Live Demo Link"
                  className="w-full bg-white border border-x-border p-3 text-black focus:border-x-blue outline-none font-space transition-colors placeholder:text-gray-400"
                  value={newProject.liveLink}
                  onChange={(e) => setNewProject({...newProject, liveLink: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-x-blue text-white py-3 font-bold uppercase tracking-widest text-sm hover:bg-x-blue/80 transition-colors disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Confirm Project"}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-6 border border-white/20 text-white/60 hover:text-white hover:border-white/60 transition-colors uppercase tracking-widest text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-space">
          {error}
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div 
              key={project._id || index} 
              className="bg-black border border-white/20 p-5 sm:p-6 hover:border-white/60 transition-all group relative"
            >
              {isOwnProfile && (
                <button 
                  onClick={() => handleDeleteProject(project._id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-white font-space tracking-tight group-hover:text-x-blue transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-x-gray font-space leading-relaxed">
                    {project.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 mt-2">
                  {project.repoLink && (
                    <a 
                      href={project.repoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-x-blue uppercase tracking-widest hover:underline"
                    >
                      <img src="/icons/folder.png" className="w-4 h-4 object-contain brightness-200" alt="Repo" />
                      Repository
                    </a>
                  )}
                  {project.liveLink && (
                    <a 
                      href={project.liveLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <img 
              src="/Hand coding-pana.svg" 
              alt="No projects yet" 
              className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8 opacity-80"
            />
            <h2 className="text-2xl font-bold text-white font-space mb-2">No Projects Found</h2>
            <p className="text-x-gray font-space max-w-sm mb-8">
              {isOwnProfile 
                ? "You haven't added any projects yet. Showcase your work to the community!" 
                : "This user hasn't showcased any projects yet."}
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-x-blue text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-x-blue/80 transition-all hover:scale-105"
              >
                Add Your First Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
