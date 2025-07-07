import React from "react";
import NotificationPage from "./NotificationPage";
import ProtectedRoute from "../components/ProtectedRoute";

const Notifications = () => (
  <ProtectedRoute>
    <NotificationPage />
  </ProtectedRoute>
);

export default Notifications;
