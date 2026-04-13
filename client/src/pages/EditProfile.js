import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    githubLink: user?.githubLink || "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [originalBio, setOriginalBio] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [originalSkills, setOriginalSkills] = useState([]);
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [originalGithub, setOriginalGithub] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const fileInputRef = React.useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills,
        avatar: avatarPreview,
      };
      if (formData.githubLink.trim()) {
        payload.githubLink = formData.githubLink.trim();
      }
      const response = await axios.put(`/api/users/${user.id}`, payload);

      updateUser(response.data);
      setSuccess("Profile updated successfully!");

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate(`/profile/${user.username}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-8 lg:px-10 pb-24 sm:pb-8 border-l border-r border-x-border/50 bg-gradient-to-br from-x-dark/10 to-x-dark/5">
      {/* Header Section */}
      <div className="mb-12 text-left">
        <h1 
          className="text-4xl md:text-6xl font-black text-x-white tracking-tighter mb-4" 
          style={{ 
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          Edit Profile
        </h1>
        <p className="text-x-gray text-lg max-w-md">
          Customize your profile to showcase your developer journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Alert Messages */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          </div>
        )}

          {/* Profile Photo Section */}
          <div className="flex flex-col items-start mb-12 animate-fade-in">
            <div 
              className="relative group/avatar cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-gradient-to-br from-x-blue to-purple-500 text-white w-20 h-20 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold border-4 border-x-dark shadow-2xl overflow-hidden relative transition-transform duration-300 group-hover/avatar:scale-105 active:scale-95">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {user?.displayName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Bottom Edit Badge */}
              <div className="absolute -bottom-1 -right-1 bg-x-blue p-2 rounded-full border-4 border-x-dark shadow-lg transition-transform group-hover/avatar:scale-110">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarPreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            
            <p className="text-[10px] text-x-blue mt-4 font-mono uppercase tracking-[0.2em] opacity-60">
              // Profile Identity
            </p>
          </div>

        <div className="space-y-8">
          {/* Display Name */}
          <div className="bg-transparent border-none p-0 mb-8 group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-x-blue mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <label className="text-sm font-semibold text-x-blue uppercase tracking-widest">
                Display Name
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                id="displayName"
                name="displayName"
                className={`w-full py-2 pr-24 transition-all duration-300 outline-none rounded-lg ${
                  isEditingDisplayName 
                    ? "bg-white text-black border-2 border-dotted border-x-blue px-3" 
                    : "bg-transparent border-none text-xl font-bold text-x-white cursor-default select-none pointer-events-none"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                placeholder="Your display name"
                value={formData.displayName}
                onChange={handleChange}
                maxLength="50"
                readOnly={!isEditingDisplayName}
              />
              <div className="absolute right-0 flex items-center space-x-1">
                {!isEditingDisplayName ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalDisplayName(formData.displayName);
                      setIsEditingDisplayName(true);
                    }}
                    className="p-2 text-x-gray/40 hover:text-x-blue hover:bg-x-blue/10 rounded-lg transition-all"
                    title="Edit Name"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex bg-x-dark/80 backdrop-blur-md rounded-lg border border-x-border/30 shadow-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, displayName: originalDisplayName });
                        setIsEditingDisplayName(false);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-x-border/30 mx-1 self-center"></div>
                    <button
                      type="button"
                      onClick={() => setIsEditingDisplayName(false)}
                      className="p-1.5 text-x-green hover:bg-x-green/10 rounded-md transition-all"
                      title="Confirm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bio */}
          <div className="bg-transparent border-none p-0 mb-8 group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-purple-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <label className="text-sm font-semibold text-purple-400 uppercase tracking-widest">Bio</label>
            </div>
            <div className="relative">
              <textarea
                id="bio"
                name="bio"
                rows="6"
                className={`w-full py-3 pr-4 transition-all duration-300 outline-none resize-none rounded-lg ${
                  isEditingBio 
                    ? "bg-white text-black border-2 border-dotted border-x-blue px-3 pb-12" 
                    : "bg-transparent border-none text-base leading-relaxed text-x-white cursor-default select-none pointer-events-none"
                }`}
                placeholder="Tell us about your developer journey..."
                value={formData.bio}
                onChange={handleChange}
                maxLength="500"
                readOnly={!isEditingBio}
              />
              <div className="absolute bottom-2 right-2 flex items-center">
                {!isEditingBio ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalBio(formData.bio);
                      setIsEditingBio(true);
                    }}
                    className="p-2 text-x-gray/40 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all"
                    title="Edit Bio"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, bio: originalBio });
                        setIsEditingBio(false);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="p-1.5 text-x-green hover:bg-x-green/10 rounded-md transition-all"
                      title="Confirm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-2 animate-fade-in">
              <span className="text-xs text-x-gray/50 font-mono">
                {formData.bio.length}/500
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-transparent border-none p-0 mb-12 group/field">
            <div className="flex items-center mb-4 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-x-green mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <label className="text-sm font-semibold text-x-green uppercase tracking-widest">
                Skills
              </label>
            </div>

            <div className={`relative transition-all duration-300 rounded-xl ${isEditingSkills ? "bg-white p-4 border-2 border-dotted border-x-blue" : ""}`}>
              {/* Add new skill - Only visible when editing */}
              {isEditingSkills ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, skills: [...originalSkills] });
                      setIsEditingSkills(false);
                    }}
                    className="absolute -top-3 -right-3 bg-x-white p-1.5 rounded-full border-2 border-dotted border-x-blue text-red-500 hover:text-red-600 transition-all shadow-lg shadow-black/20 group/close"
                    title="Close and Discard"
                  >
                    <svg className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 mb-6 w-full animate-fade-in">
                    <div className="flex-1 flex items-center bg-x-black/5 border border-x-border/30 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-x-blue transition-all">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="w-full p-3 bg-transparent text-black placeholder-gray-400 border-none outline-none rounded-full text-sm font-medium"
                        placeholder="Add a skill (e.g., React, Node)"
                        maxLength="30"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddSkill(e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-6 py-2 bg-[tomato] hover:bg-[#ff4500] disabled:opacity-50 text-white font-bold transition-all rounded-full m-1 shadow-lg shadow-tomato/20"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Skills list */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center transition-all ${
                        isEditingSkills 
                          ? "bg-x-blue text-white shadow-md scale-105" 
                          : "bg-x-blue/10 border border-x-blue/20 text-x-blue hover:bg-x-blue/20"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {skill}
                      {isEditingSkills && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-white/70 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-x-gray/50 italic animate-pulse">No skills added yet...</p>
                )}
              </div>

              {/* Action Icons - Only show toggle icon when not editing */}
              {!isEditingSkills && (
                <div className="absolute bottom-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalSkills([...formData.skills]);
                      setIsEditingSkills(true);
                    }}
                    className="p-2 text-x-gray/40 hover:text-x-green hover:bg-x-green/10 rounded-lg transition-all"
                    title="Add/Edit Skills"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {isEditingSkills && (
              <p className="text-xs text-x-gray/50 mt-4 font-mono">
                // Showcase your technical expertise
              </p>
            )}
          </div>

          {/* GitHub Link */}
          <div className="bg-transparent border-none p-0 mb- group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-purple-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              <label className="text-sm font-semibold text-purple-400 uppercase tracking-widest">
                GitHub Profile
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="url"
                id="githubLink"
                name="githubLink"
                className={`w-full py-2 pr-24 transition-all duration-300 outline-none rounded-lg ${
                  isEditingGithub 
                    ? "bg-white text-black border-2 border-dotted border-x-blue px-3" 
                    : "bg-transparent border-none text-base text-x-white opacity-80 cursor-default select-none pointer-events-none"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                placeholder="https://github.com/yourusername"
                value={formData.githubLink}
                onChange={handleChange}
                readOnly={!isEditingGithub}
              />
              <div className="absolute right-0 flex items-center">
                {!isEditingGithub ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalGithub(formData.githubLink);
                      setIsEditingGithub(true);
                    }}
                    className="p-2 text-x-gray/40 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all"
                    title="Edit Link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex bg-x-dark/80 backdrop-blur-md rounded-lg border border-x-border/30 shadow-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, githubLink: originalGithub });
                        setIsEditingGithub(false);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-x-border/30 mx-1 self-center"></div>
                    <button
                      type="button"
                      onClick={() => setIsEditingGithub(false)}
                      className="p-1.5 text-x-green hover:bg-x-green/10 rounded-md transition-all"
                      title="Confirm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-x-gray/50 mt-2 font-mono">
              // Showcase your projects and contributions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user.username}`)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center min-h-[44px]"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 mr-2 flex items-center justify-center">
                  <LoadingSpinner size="small" className="!py-0 !min-h-0" />
                </span>
                Saving Changes...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
