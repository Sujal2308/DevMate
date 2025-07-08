import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios
      .get("/api/notifications")
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => {
        setNotifications([]);
        setLoading(false);
      });
  }, [user]);

  // Real-time notifications
  useEffect(() => {
    if (!user) return;
    socket.io.opts.query = { userId: user.id };
    socket.connect();
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await axios.put("/api/notifications/mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Delete all
  const deleteAll = useCallback(async () => {
    await axios.delete("/api/notifications/all");
    setNotifications([]);
  }, []);

  // Recompute hasUnread whenever notifications change
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        loading,
        hasUnread,
        markAllAsRead,
        deleteAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
