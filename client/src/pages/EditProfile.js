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
    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-8 lg:px-12 xl:px-24 pb-24 sm:pb-6 border-l border-r border-x-border/50 bg-gradient-to-br from-x-dark/10 to-x-dark/5">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="bg-x-navy h-32 relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500 shadow-[0_0_16px_4px_rgba(168,85,247,0.5)]">
              <svg
                className="w-8 h-8 text-x-blue mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h1 className="text-2xl lg:text-3xl font-bold text-x-gray-300 font-mono">
                Edit Profile
              </h1>
            </div>
          </div>
        </div>
        <p className="text-x-gray text-lg max-w-md mx-auto">
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

        <div className="space-y-8">
          {/* Display Name */}
          <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-x-blue mr-3"
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
              <label className="text-lg font-semibold text-x-white">
                Display Name
              </label>
            </div>
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="w-full p-4 bg-x-black/50 border border-x-border/30 text-x-white placeholder-x-gray rounded-xl focus:ring-2 focus:ring-x-blue focus:border-x-blue transition-all duration-200"
              placeholder="Your display name"
              value={formData.displayName}
              onChange={handleChange}
              maxLength="50"
            />
            <p className="text-xs text-x-gray/70 mt-2">
              How your name appears to other developers
            </p>
          </div>

          {/* Bio */}
          <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-purple-400 mr-3"
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
              <label className="text-lg font-semibold text-x-white">Bio</label>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              className="w-full p-4 bg-x-black/50 border border-x-border/30 text-x-white placeholder-x-gray rounded-xl resize-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              placeholder="Tell us about yourself, your interests, and what you're working on..."
              value={formData.bio}
              onChange={handleChange}
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-x-gray/70">
                Share your developer story
              </p>
              <span className="text-xs text-x-gray/70">
                {formData.bio.length}/500
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-x-green mr-3"
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
              <label className="text-lg font-semibold text-x-white">
                Skills
              </label>
            </div>

            {/* Add new skill */}
            <div className="flex items-center gap-2 mb-4 w-full">
              <div className="flex-1 flex items-center bg-x-black/50 border border-x-border/30 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full p-3 bg-transparent text-x-white placeholder-x-gray border-none outline-none rounded-full"
                  placeholder="Add a skill (e.g., JavaScript, React)"
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
                  className="h-full px-6 py-0 bg-x-green hover:bg-x-green/80 disabled:bg-x-green/30 text-white font-medium transition-all duration-200 disabled:cursor-not-allowed rounded-full ml-2"
                  style={{ minHeight: "48px" }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Skills list */}
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-x-blue/20 to-purple-500/20 border border-x-blue/30 text-x-blue px-3 py-2 rounded-full text-sm font-medium flex items-center backdrop-blur-sm hover:from-x-blue/30 hover:to-purple-500/30 transition-all duration-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-x-dark/20 border border-x-border/20 rounded-xl p-4 text-center mb-4">
                <svg
                  className="w-8 h-8 text-x-gray/50 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-sm text-x-gray italic">
                  No skills added yet
                </p>
              </div>
            )}
            <p className="text-xs text-x-gray/70">
              Showcase your technical expertise
            </p>
          </div>

          {/* GitHub Link */}
          <div className="bg-gradient-to-br from-x-dark/60 to-x-dark/30 backdrop-blur-sm border border-x-border/50 p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-purple-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              <label className="text-lg font-semibold text-x-white">
                GitHub Profile
              </label>
            </div>
            <input
              type="url"
              id="githubLink"
              name="githubLink"
              className="w-full p-4 bg-x-black/50 border border-x-border/30 text-x-white placeholder-x-gray rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              placeholder="https://github.com/yourusername"
              value={formData.githubLink}
              onChange={handleChange}
            />
            <p className="text-xs text-x-gray/70 mt-2">
              Showcase your projects and contributions
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
