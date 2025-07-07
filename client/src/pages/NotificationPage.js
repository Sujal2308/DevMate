import React from "react";

const notifications = [
  {
    id: 1,
    type: "follow",
    user: "Alice",
    message: "followed you.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "comment",
    user: "Bob",
    message: "commented: 'Great work!'",
    time: "10m ago",
    unread: true,
  },
  {
    id: 3,
    type: "mention",
    user: "Charlie",
    message: "mentioned you in a post.",
    time: "1h ago",
    unread: false,
  },
];

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
    case "mention":
      return (
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636A9 9 0 115.636 18.364 9 9 0 0118.364 5.636z"
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

const NotificationPage = () => {
  return (
    <div className="w-full px-2 sm:px-4 py-8 pb-32 sm:pb-12">
      <div className="flex items-center mb-6">
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
        <button className="ml-auto text-xs text-blue-400 hover:underline font-mono">
          Mark all as read
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center text-gray-400 font-mono mt-12">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start bg-gray-900/70 rounded-lg p-4 border border-gray-700 shadow transition hover:bg-gray-800 ${
                n.unread ? "ring-2 ring-blue-500/30" : ""
              } w-full min-w-0`}
              style={{
                minHeight: "88px",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <div className="mr-3 mt-1">{iconForType(n.type)}</div>
              <div className="flex-1">
                <span className="font-mono text-white">{n.user}</span>
                <span className="font-mono text-gray-300"> {n.message}</span>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {n.time}
                </div>
              </div>
              {n.unread && (
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
