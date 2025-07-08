import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../socket";
import { useAuth } from "../contexts/AuthContext";

const iconForType = (type) => {
  switch (type) {
    case "follow":
      return (
        <svg
          className="w-5 h-5 text-green-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 9a3 3 0 11-6 0 3 3 0 016 0zM6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2"
          />
        </svg>
      );
    case "comment":
      return (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      );
    case "like":
      return (
        <svg
          className="w-5 h-5 text-pink-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const TrashIcon = (props) => (
  <svg
    {...props}
    className={
      "w-5 h-5 text-red-400 hover:text-red-600 transition " +
      (props.className || "")
    }
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
    />
  </svg>
);

const DotsVerticalIcon = (props) => (
  <svg
    {...props}
    className={"w-6 h-6 text-gray-400 " + (props.className || "")}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef();
  const { user } = useAuth();

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Real-time notifications
  useEffect(() => {
    if (!user) return;
    socket.io.opts.query = { userId: user.id };
    socket.connect();
    socket.on("notification", (notification) => {
      console.log("Received real-time notification:", notification);
      setNotifications((prev) => {
        // If notification already exists, update it; else, add it
        const exists = prev.find((n) => n._id === notification._id);
        if (exists) {
          return prev.map((n) =>
            n._id === notification._id ? { ...n, ...notification } : n
          );
        } else {
          return [notification, ...prev];
        }
      });
    });
    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, [user]);

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await axios.delete("/api/notifications/all");
      setNotifications([]);
      setShowConfirm(false);
    } catch (err) {
      // Optionally show error
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/mark-all-read");
      // Immediately update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Refetch to ensure sync with backend
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
      console.log("Notifications after mark all as read:", res.data);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 py-8 pb-32 sm:pb-12">
      <div className="flex items-center mb-6 relative">
        <svg
          className="w-7 h-7 text-blue-400 mr-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <h1 className="text-2xl font-mono font-bold text-white">
          Notifications
        </h1>
        {/* Desktop: Mark all as read + delete icon */}
        <button className="ml-auto text-xs text-blue-400 hover:underline font-mono hidden sm:inline" onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>
        <button
          className="hidden sm:inline ml-6 p-1 rounded-full border-2 border-red-400 hover:border-red-600 hover:bg-gray-800 focus:outline-none transition"
          title="Delete all notifications"
          onClick={() => setShowConfirm(true)}
        >
          <TrashIcon />
        </button>
        {/* Mobile: 3-dots menu */}
        <div className="sm:hidden ml-auto relative">
          <button
            className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Open menu"
          >
            <DotsVerticalIcon />
          </button>
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20"
            >
              <button
                className="w-full text-left px-4 py-3 text-blue-400 hover:bg-gray-800 font-mono text-sm"
                onClick={() => {
                  setShowMenu(false);
                  handleMarkAllAsRead();
                }}
              >
                Mark all as read
              </button>
              <button
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 font-mono text-sm border-t border-gray-800"
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirm(true);
                }}
              >
                Delete all
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-center mb-4">
              <TrashIcon className="w-6 h-6 mr-2 text-red-500" />
              <span className="text-lg font-bold text-white font-mono">
                Delete All Notifications?
              </span>
            </div>
            <div className="text-gray-300 mb-6 font-mono">
              This action{" "}
              <span className="text-red-400 font-bold">cannot be undone</span>.
              <br />
              Are you sure you want to permanently delete <b>all</b> your
              notifications?
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 font-mono"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-mono font-bold shadow"
                onClick={handleDeleteAll}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-400 font-mono mt-12">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center text-gray-400 font-mono text-lg">
            No notifications yet.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start bg-gray-900/70 rounded-lg p-4 border border-gray-700 shadow transition hover:bg-gray-800 ${
                !n.read ? "ring-2 ring-blue-500/30" : ""
              } w-full min-w-0`}
              style={{ width: "100%", maxWidth: "100%" }}
            >
              <div className="mr-3 mt-1">{iconForType(n.type)}</div>
              <div className="flex-1">
                <span className="font-mono text-white">
                  {n.fromUser?.displayName || n.fromUser?.username || "Someone"}
                </span>
                <span className="font-mono text-gray-300">
                  {n.type === "like"
                    ? " liked your post."
                    : n.type === "comment"
                    ? " commented on your post."
                    : n.type === "follow"
                    ? " followed you."
                    : " sent a notification."}
                </span>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <span className="w-2 h-2 bg-blue-400 rounded-full ml-3 mt-2" />
              )}
            </div>
          ))}
          {notifications.length > 0 && (
            <div className="flex justify-center mt-10">
              <div className="text-blue-400 font-mono text-sm opacity-80 px-4 py-2 rounded-lg bg-gray-900/60 border border-blue-900/30 shadow">
                — End of notifications —
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
