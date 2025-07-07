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
  const deleteDialogRef = useRef(null);

  useEffect(() => {
    if (showDelete && deleteDialogRef.current) {
      if (window.innerWidth <= 640) {
        setTimeout(() => {
          deleteDialogRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 50);
      }
    }
  }, [showDelete]);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleNotificationsChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handlePrivacyToggle = () => setIsPrivate((v) => !v);

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
          "Failed to delete account. Please try again."
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
          "Failed to update password."
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 pb-32 sm:pb-12">
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg font-mono">
          Settings
        </h2>
        <p className="mt-2 text-sm text-blue-300 font-mono text-center max-w-md">
          Tip: Keep your account secure and notifications relevant. You can
          always update your preferences here for a better experience!
        </p>
      </div>

      {/* Change Password */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl">
        <div className="flex items-center mb-4">
          <svg
            className="w-5 h-5 text-blue-400 mr-2"
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
          <h3 className="font-semibold text-lg">Change Password</h3>
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
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:font-mono"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new" className="text-xs text-gray-300 font-medium">
              New Password
            </label>
            <input
              type="password"
              name="new"
              id="new"
              placeholder="Enter new password"
              value={passwords.new}
              onChange={handlePasswordChange}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:font-mono"
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
            <input
              type="password"
              name="confirm"
              id="confirm"
              placeholder="Re-enter new password"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:font-mono"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-60 font-mono"
            disabled={passLoading}
          >
            {passLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Email Notifications */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-gray-700">
        <div className="flex items-center mb-4">
          <svg
            className="w-5 h-5 text-blue-400 mr-2"
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
          <h3 className="font-semibold text-lg">Email Notifications</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium text-white font-mono">
                New Followers
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Get notified when someone follows you
              </span>
            </div>
            <input
              type="checkbox"
              name="followers"
              checked={notifications.followers}
              onChange={handleNotificationsChange}
              className="accent-blue-600 w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium text-white font-mono">Comments</span>
              <span className="text-xs text-gray-400 font-mono">
                Get notified about new comments on your posts
              </span>
            </div>
            <input
              type="checkbox"
              name="comments"
              checked={notifications.comments}
              onChange={handleNotificationsChange}
              className="accent-blue-600 w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium text-white font-mono">Messages</span>
              <span className="text-xs text-gray-400 font-mono">
                Get notified when you receive a new message
              </span>
            </div>
            <input
              type="checkbox"
              name="messages"
              checked={notifications.messages}
              onChange={handleNotificationsChange}
              className="accent-blue-600 w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* Account Privacy */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-gray-700">
        <div className="flex items-center mb-4">
          <svg
            className="w-5 h-5 text-purple-400 mr-2"
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
          <h3 className="font-semibold text-lg">Account Privacy</h3>
        </div>
        <div className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium text-white font-mono">
              Profile Visibility
            </span>
            <span className="text-xs text-gray-400 hidden md:inline font-mono">
              Choose who can see your profile and posts
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium font-mono ${
                !isPrivate ? "text-blue-400" : "text-gray-400"
              }`}
            >
              Public
            </span>
            <button
              onClick={handlePrivacyToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                isPrivate ? "bg-purple-600" : "bg-gray-700"
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
              className={`text-sm font-medium font-mono ${
                isPrivate ? "text-purple-400" : "text-gray-400"
              }`}
            >
              Private
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 font-mono">
          {isPrivate
            ? "Only you and approved followers can see your profile and posts."
            : "Anyone can view your profile and posts."}
        </div>
      </div>

      {/* Delete Account */}
      <div className="p-6 bg-white/5 rounded-xl border border-gray-700 text-center">
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold shadow-lg hover:from-red-700 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 font-mono"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Delete Account
        </button>
        {showDelete && (
          <div
            ref={deleteDialogRef}
            className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4"
          >
            <p className="mb-4 text-red-400">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            {deleteError && (
              <div className="mb-2 text-red-400 text-sm">{deleteError}</div>
            )}
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-4 py-2 rounded mr-2 disabled:opacity-60"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="bg-gray-700 text-white px-4 py-2 rounded"
              disabled={deleteLoading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingPage;
