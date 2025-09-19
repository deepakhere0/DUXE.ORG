import React from 'react';
import GoogleSignInTest from '../components/debug/GoogleSignInTest';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const GoogleSignInDebug = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Sign-In Debug Page</h1>
          <p className="text-gray-600">
            Use this page to diagnose and fix Google Sign-In issues.
          </p>
          
          <div className="mt-4 flex gap-4">
            <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Home
            </Link>
            {currentUser && (
              <button 
                onClick={logout}
                className="text-red-600 hover:text-red-800 underline"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {currentUser ? (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold text-green-800">✅ Already Signed In</h2>
            <p className="text-green-700 mt-1">
              User: {currentUser.displayName || currentUser.email}
            </p>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold text-blue-800">ℹ️ Not Signed In</h2>
            <p className="text-blue-700 mt-1">
              Use the diagnostic tool below to test Google Sign-In.
            </p>
          </div>
        )}

        <GoogleSignInTest />
      </div>
    </div>
  );
};

export default GoogleSignInDebug;