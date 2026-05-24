import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    gender: user?.gender || "Male",
    nationality: user?.nationality || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [originalBio, setOriginalBio] = useState("");
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [originalDob, setOriginalDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const fileInputRef = React.useRef(null);


  const navigate = useNavigate();

  // Sync state with user data when it becomes available
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        gender: user.gender || "Male",
        nationality: user.nationality || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        avatar: avatarPreview,
        dob: formData.dob,
        gender: formData.gender,
        nationality: formData.nationality.trim(),
      };
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
              <div className="bg-gradient-to-br from-x-blue to-purple-500 text-white w-24 h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold border-4 border-x-dark shadow-2xl overflow-hidden relative transition-transform duration-300 group-hover/avatar:scale-105 active:scale-95">
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, displayName: originalDisplayName });
                        setIsEditingDisplayName(false);
                      }}
                      className="p-1.5 text-red-500 hover:scale-110 transition-transform"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDisplayName(false)}
                      className="p-1.5 text-x-green hover:scale-110 transition-transform"
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

 
          {/* Date of Birth */}
          <div className="bg-transparent border-none p-0 mb-12 group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-x-blue mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label className="text-sm font-semibold text-x-blue uppercase tracking-widest">
                Date of Birth
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="date"
                id="dob"
                name="dob"
                className={`w-full py-2 pr-24 transition-all duration-300 outline-none rounded-lg ${
                  isEditingDob 
                    ? "bg-white text-black border-2 border-dotted border-x-blue px-3" 
                    : "bg-transparent border-none text-base text-x-white opacity-80 cursor-default select-none pointer-events-none"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                value={formData.dob}
                onChange={handleChange}
                readOnly={!isEditingDob}
              />
              <div className="absolute right-0 flex items-center">
                {!isEditingDob ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalDob(formData.dob);
                      setIsEditingDob(true);
                    }}
                    className="p-2 text-x-gray/40 hover:text-x-blue hover:bg-x-blue/10 rounded-lg transition-all"
                    title="Edit Date"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, dob: originalDob });
                        setIsEditingDob(false);
                      }}
                      className="p-1.5 text-red-500 hover:scale-110 transition-transform"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDob(false)}
                      className="p-1.5 text-x-green hover:scale-110 transition-transform"
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

          {/* Gender */}
          <div className="bg-transparent border-none p-0 mb-12 group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-x-blue mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <label className="text-sm font-semibold text-x-blue uppercase tracking-widest">
                Gender
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="flex items-center space-x-12 py-3 w-full">
                {/* Male Radio */}
                <label className="flex items-center cursor-pointer group/male">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    formData.gender === "Male" 
                      ? "border-x-blue bg-x-blue/20" 
                      : "border-x-white/20 group-hover/male:border-x-white/40"
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      formData.gender === "Male" 
                        ? "bg-x-blue scale-100 opacity-100 shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
                        : "bg-transparent scale-0 opacity-0"
                    }`}></div>
                  </div>
                  <span className={`font-space font-bold text-lg transition-colors ${
                    formData.gender === "Male" ? "text-x-blue" : "text-x-white/40 group-hover/male:text-x-white/60"
                  }`}>Male</span>
                </label>
                
                {/* Female Radio */}
                <label className="flex items-center cursor-pointer group/female">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    formData.gender === "Female" 
                      ? "border-[#FF00FF] bg-[#FF00FF]/20" 
                      : "border-x-white/20 group-hover/female:border-x-white/40"
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      formData.gender === "Female" 
                        ? "bg-[#FF00FF] scale-100 opacity-100 shadow-[0_0_10px_rgba(255,0,255,0.5)]" 
                        : "bg-transparent scale-0 opacity-0"
                    }`}></div>
                  </div>
                  <span className={`font-space font-bold text-lg transition-colors ${
                    formData.gender === "Female" ? "text-[#FF00FF]" : "text-x-white/40 group-hover/female:text-x-white/60"
                  }`}>Female</span>
                </label>
              </div>
            </div>
          </div>

          {/* Nationality */}
          <div className="bg-transparent border-none p-0 mb-12 group/field">
            <div className="flex items-center mb-2 opacity-60 group-hover/field:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-emerald-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <label className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
                Nationality
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                id="nationality"
                name="nationality"
                className="w-full py-2 bg-transparent border-b-2 border-white/10 text-lg font-bold text-x-white focus:border-x-blue outline-none transition-all placeholder:text-gray-600"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                placeholder="Enter your nationality"
                value={formData.nationality}
                onChange={handleChange}
                maxLength="50"
              />
            </div>
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
