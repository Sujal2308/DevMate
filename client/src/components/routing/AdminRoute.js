import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  }

  // Check if authenticated AND user has admin role
  return isAuthenticated && user && user.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;
