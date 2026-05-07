import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SettingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState({
    followers: true,
    comments: true,
    messages: true,
  });
  const [isPrivate, setIsPrivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const deleteDialogRef = useRef(null);

  useEffect(() => {
    if (showDelete && deleteDialogRef.current) {
      setTimeout(() => {
        deleteDialogRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    }
  }, [showDelete]);

  // Fetch current privacy status on mount
  useEffect(() => {
    if (user?.id) {
      axios
        .get(`/api/users/${user.username}`)
        .then((res) => {
          setIsPrivate(res.data.user.isPrivate || false);
        })
        .catch(() => setIsPrivate(false));
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleNotificationsChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  // Update privacy on toggle
  const handlePrivacyToggle = async () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    setPrivacyError("");
    const userId = user._id || user.id; // prefer _id if present
    console.log("Privacy PUT id:", userId, user);
    try {
      await axios.put(`/api/users/${userId}/privacy`, { isPrivate: newValue });
    } catch (err) {
      setIsPrivate(!newValue); // revert on error
      setPrivacyError(
        err.response?.data?.message ||
          (err.response?.data?.errors?.[0]?.msg
            ? `Validation: ${err.response.data.errors[0].msg}`
            : "Failed to update privacy. Check your connection and try again."),
      );
      console.error("Privacy toggle error:", err.response || err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await axios.delete(`/api/users/${user.id}`);
      logout();
      navigate("/");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPassError("All fields are required.");
      return;
    }
    if (passwords.new.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError("New passwords do not match.");
      return;
    }
    setPassLoading(true);
    try {
      const res = await axios.put(`/api/users/${user.id}/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm,
      });
      setPassSuccess(res.data.message || "Password updated successfully.");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      setPassError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to update password.",
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-8 lg:px-10 pb-24 sm:pb-8 border-l border-r border-x-border/50 bg-gradient-to-br from-x-dark/10 to-x-dark/5">
      <div className="mb-12 text-left">
        <h1
          className="text-4xl md:text-6xl font-black text-x-white tracking-tighter mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Settings
        </h1>
        <p className="text-x-gray text-lg max-w-md font-space">
          Manage your account preferences, security, and notifications
        </p>
      </div>

      <div className="space-y-12">
        {/* Change Password */}
        <div className="bg-transparent border-none p-0 group/field">
          <div className="flex items-center mb-6">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <label className="text-sm font-black text-x-blue uppercase tracking-widest">
              Change Password
            </label>
          </div>
          {passError && (
            <div className="mb-2 text-red-400 text-sm">{passError}</div>
          )}
          {passSuccess && (
            <div className="mb-2 text-green-400 text-sm">{passSuccess}</div>
          )}
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="current"
                className="text-xs text-gray-300 font-medium"
              >
                Current Password
              </label>
              <input
                type="password"
                name="current"
                id="current"
                placeholder="Enter current password"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded-none bg-white border border-x-border text-black focus:ring-2 focus:ring-x-blue focus:border-x-blue transition placeholder:text-gray-400 placeholder:font-mono font-space"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="new"
                className="text-xs text-gray-300 font-medium"
              >
                New Password
              </label>
              <input
                type="password"
                name="new"
                id="new"
                placeholder="Enter new password"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded-none bg-white border border-x-border text-black focus:ring-2 focus:ring-x-blue focus:border-x-blue transition placeholder:text-gray-400 placeholder:font-mono font-space"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirm"
                className="text-xs text-gray-300 font-medium"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm"
                  id="confirm"
                  placeholder="Re-enter new password"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full p-3 rounded-none bg-white border border-x-border text-black focus:ring-2 focus:ring-x-blue focus:border-x-blue transition placeholder:text-gray-400 placeholder:font-mono font-space pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-500 hover:text-x-blue hover:bg-gray-100/50 transition-all focus:outline-none"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.084 14.158a3 3 0 0 1-4.242-4.242"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2 2 20 20"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-none bg-x-blue text-white font-bold shadow-lg hover:bg-x-blue/90 transition-all disabled:opacity-60 font-space uppercase tracking-widest"
              disabled={passLoading}
            >
              {passLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Email Notifications */}
        <div className="bg-transparent border-none p-0 group/field">
          <div className="flex items-center mb-6">
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
                d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm-8 0v4a4 4 0 008 0v-4"
              />
            </svg>
            <label className="text-sm font-black text-x-blue uppercase tracking-widest">
              Notifications
            </label>
            {/* Dynamic notifications indicator */}
            <span
              className="ml-3 px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 animate-fade-in"
              style={{
                background:
                  notifications.followers &&
                  notifications.comments &&
                  notifications.messages
                    ? "rgba(16,185,129,0.8)"
                    : "rgba(251,191,36,0.8)",
                color:
                  notifications.followers &&
                  notifications.comments &&
                  notifications.messages
                    ? "#d1fae5"
                    : "#fffbe6",
              }}
            >
              {notifications.followers &&
              notifications.comments &&
              notifications.messages ? (
                <>
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  All notifications ON
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                  {Object.entries(notifications).filter(([k, v]) => !v).length}{" "}
                  off
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-mono mb-6 border-l-2 border-emerald-500 pl-4 w-full">
            Select the interactions you want to be notified about. Active alerts
            are highlighted in green.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "followers", label: "Followers" },
              { id: "comments", label: "Comments" },
              { id: "messages", label: "Messages" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  handleNotificationsChange({
                    target: { name: item.id, checked: !notifications[item.id] },
                  })
                }
                className={`flex items-center justify-center py-3 px-1 border border-x-blue transition-all duration-200 rounded-none font-space uppercase tracking-widest text-[10px] sm:text-xs font-bold ${
                  notifications[item.id]
                    ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-transparent text-gray-500 hover:border-white/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account Privacy */}
        <div className="bg-transparent border-none p-0 group/field">
          <div className="flex items-center mb-6">
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
                d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.663-5.33-4-8-4z"
              />
            </svg>
            <label className="text-sm font-black text-x-blue uppercase tracking-widest">
              Account Privacy
            </label>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-mono mb-6 border-l-2 border-purple-500 pl-4 w-full">
            Control who can view your profile and interactions. Turning on
            private mode restricts your content to approved followers only.
          </p>
          <div className="flex items-center justify-between py-4 border-b border-x-border/30">
            <span className="text-base sm:text-lg font-bold font-space text-white uppercase tracking-wider">
              Visibility
            </span>
            <div className="flex items-center gap-4">
              <span
                className={`text-base sm:text-lg font-bold font-mono ${
                  !isPrivate ? "text-blue-600" : "text-gray-400"
                }`}
              >
                Public
              </span>
              <button
                onClick={handlePrivacyToggle}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  isPrivate ? "bg-purple-600" : "bg-gray-400"
                }`}
                aria-label="Toggle account privacy"
              >
                <span
                  className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    isPrivate ? "translate-x-6" : ""
                  }`}
                />
              </button>
              <span
                className={`text-base sm:text-lg font-bold font-mono ${
                  isPrivate ? "text-purple-600" : "text-gray-400"
                }`}
              >
                Private
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-white font-semibold font-mono opacity-80">
            {privacyError && (
              <div className="mb-2 text-red-600 text-sm">{privacyError}</div>
            )}
            {isPrivate
              ? "Only you and approved followers can see your profile and posts."
              : "Anyone can view your profile and posts."}
          </div>
        </div>

        <div className="mt-12 group/field">
          <button
            onClick={() => setShowDelete(true)}
            className="w-full py-4 flex items-center justify-center gap-3 rounded-none bg-red-600/10 text-red-600 border border-red-600/50 hover:bg-red-600 hover:text-white font-bold transition-all duration-300 font-space uppercase tracking-[0.2em] text-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Account
          </button>
          {showDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => !deleteLoading && setShowDelete(false)}
              />
              
              {/* Modal Content */}
              <div 
                ref={deleteDialogRef}
                className="relative w-full max-w-md bg-white border-2 border-red-600 p-8 rounded-none shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in fade-in zoom-in duration-300"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-red-100 flex items-center justify-center rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black font-space text-black uppercase tracking-tighter mb-2">
                    Critical Action
                  </h2>
                  <p className="text-sm text-gray-600 font-mono">
                    This will permanently remove your developer profile, posts, and data. This action is irreversible.
                  </p>
                </div>

                {deleteError && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
                    ERROR: {deleteError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="w-full py-4 bg-red-600 text-white font-black font-space uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {deleteLoading ? "PERFORMING WIPE..." : "CONFIRM ACCOUNT WIPE"}
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    disabled={deleteLoading}
                    className="w-full py-4 bg-transparent text-gray-500 font-bold font-space uppercase tracking-widest hover:text-black transition-all"
                  >
                    ABORT MISSION
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
