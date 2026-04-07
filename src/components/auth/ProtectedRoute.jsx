import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Shows a spinner while auth state is loading, then either renders children
 * or redirects to /login if the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Auth state not yet resolved — don't redirect yet
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
