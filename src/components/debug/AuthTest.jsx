import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthTest = () => {
  const { googleSignIn, googleSignInPopup, currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, message) => {
    const result = {
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
    console.log(`${success ? '✅' : '❌'} ${test}: ${message}`);
  };

  useEffect(() => {
    addTestResult('Component Mount', true, 'AuthTest component loaded successfully');
  }, []);

  const handleRedirectTest = async () => {
    setLoading(true);
    try {
      addTestResult('Redirect Method', true, 'Starting redirect authentication...');
      const result = await googleSignIn();
      
      if (result.success && result.redirecting) {
        addTestResult('Redirect Method', true, 'Redirect initiated successfully - user should be redirected to Google');
      } else if (result.success) {
        addTestResult('Redirect Method', true, 'Authentication successful (direct)');
      } else {
        addTestResult('Redirect Method', false, result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('Redirect Method', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupTest = async () => {
    setPopupLoading(true);
    try {
      addTestResult('Popup Method', true, 'Starting popup authentication...');
      const result = await googleSignInPopup();
      
      if (result.success) {
        addTestResult('Popup Method', true, 'Popup authentication successful');
      } else {
        addTestResult('Popup Method', false, result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('Popup Method', false, error.message);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addTestResult('Logout', true, 'User logged out successfully');
    } catch (error) {
      addTestResult('Logout', false, error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    addTestResult('Test Results', true, 'Results cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Test Suite</h2>
        <p className="text-gray-600">Test the redirect and popup authentication methods</p>
      </div>

      {/* User Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Current User Status</h3>
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Display Name:</strong> {currentUser.displayName || 'Not set'}</p>
              <p><strong>UID:</strong> {currentUser.uid}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Not authenticated</p>
        )}
      </div>

      {/* Test Buttons */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={handleRedirectTest}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Testing Redirect...' : '🔄 Test Redirect Method'}
          </button>
          
          <button
            onClick={handlePopupTest}
            disabled={popupLoading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {popupLoading ? '⏳ Testing Popup...' : '🔄 Test Popup Method'}
          </button>
          
          <button
            onClick={clearResults}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Redirect Method:</strong> Recommended for production (COOP-friendly)</p>
          <p><strong>Popup Method:</strong> Fallback for development (may have COOP issues)</p>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Test Results</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p>No test results yet. Run a test above.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                  [{result.timestamp}] {result.success ? '✅' : '❌'} {result.test}:
                </span>
                <span className="text-gray-300 ml-2">{result.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Domain Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Environment Info</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Current Origin:</strong> {window.location.origin}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome-based' : 'Other'}</p>
          <p><strong>Protocol:</strong> {window.location.protocol}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;