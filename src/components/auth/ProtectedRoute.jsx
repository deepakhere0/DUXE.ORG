import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Redirects to login page if user is not authenticated
 * @param {React.ReactNode} children - Child components to render if authenticated
 * @returns {React.ReactNode} Children or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;
