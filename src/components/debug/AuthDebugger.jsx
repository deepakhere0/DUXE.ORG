import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebugger = () => {
  const { signInWithGoogle } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Run browser compatibility checks
    const checkBrowserSupport = () => {
      const info = {
        userAgent: navigator.userAgent,
        popupSupported: !!window.open,
        cookiesEnabled: navigator.cookieEnabled,
        secureContext: window.isSecureContext,
        onLine: navigator.onLine,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
      };
      setDebugInfo(info);
      console.log('🌐 Browser compatibility check:', info);
    };

    checkBrowserSupport();
  }, []);

  const testPopupBlocker = () => {
    console.log('🧪 Testing popup blocker...');
    const testPopup = window.open('about:blank', 'test', 'width=1,height=1');
    
    if (!testPopup || testPopup.closed) {
      console.warn('🚫 Popup blocker detected');
      setTestResults(prev => [...prev, { 
        test: 'Popup Blocker', 
        result: 'BLOCKED', 
        message: 'Please disable popup blocker for this site' 
      }]);
      return false;
    }
    
    testPopup.close();
    console.log('✅ Popup blocker check passed');
    setTestResults(prev => [...prev, { 
      test: 'Popup Blocker', 
      result: 'PASSED', 
      message: 'Popups are allowed' 
    }]);
    return true;
  };

  const testGoogleAuth = async () => {
    console.log('🧪 Testing Google authentication...');
    setTestResults(prev => [...prev, { 
      test: 'Google Auth', 
      result: 'TESTING', 
      message: 'Attempting Google authentication...' 
    }]);

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        setTestResults(prev => prev.map(test => 
          test.test === 'Google Auth' 
            ? { ...test, result: 'SUCCESS', message: 'Authentication successful!' }
            : test
        ));
      } else {
        setTestResults(prev => prev.map(test => 
          test.test === 'Google Auth' 
            ? { ...test, result: 'FAILED', message: `Error: ${result.error}` }
            : test
        ));
      }
    } catch (error) {
      console.error('Authentication test failed:', error);
      setTestResults(prev => prev.map(test => 
        test.test === 'Google Auth' 
          ? { ...test, result: 'ERROR', message: `Exception: ${error.message}` }
          : test
      ));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const detectPotentialIssues = () => {
    const warnings = [];
    
    if (!debugInfo.secureContext) {
      warnings.push('🔒 Not running on HTTPS - may cause auth issues');
    }
    
    if (!debugInfo.cookiesEnabled) {
      warnings.push('🍪 Cookies are disabled - required for authentication');
    }
    
    if (!debugInfo.onLine) {
      warnings.push('🌐 No internet connection detected');
    }
    
    if (navigator.doNotTrack === '1') {
      warnings.push('🕵️ Do Not Track is enabled - may interfere with auth');
    }

    return warnings;
  };

  const warnings = detectPotentialIssues();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Google Auth Debugger</h2>
      
      {/* Browser Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Browser Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Popup Support:</strong> 
              <span className={debugInfo.popupSupported ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.popupSupported ? ' ✅ Supported' : ' ❌ Not supported'}
              </span>
            </div>
            <div>
              <strong>Cookies:</strong> 
              <span className={debugInfo.cookiesEnabled ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.cookiesEnabled ? ' ✅ Enabled' : ' ❌ Disabled'}
              </span>
            </div>
            <div>
              <strong>Secure Context:</strong> 
              <span className={debugInfo.secureContext ? 'text-green-600' : 'text-yellow-600'}>
                {debugInfo.secureContext ? ' ✅ HTTPS' : ' ⚠️ HTTP'}
              </span>
            </div>
            <div>
              <strong>Online:</strong> 
              <span className={debugInfo.onLine ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.onLine ? ' ✅ Connected' : ' ❌ Offline'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <strong>User Agent:</strong> {debugInfo.userAgent}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-700 mb-3">⚠️ Potential Issues</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            {warnings.map((warning, index) => (
              <div key={index} className="text-yellow-800 text-sm mb-1">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🧪 Run Tests</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testPopupBlocker}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Popup Blocker
          </button>
          <button
            onClick={testGoogleAuth}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Google Auth
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.result === 'SUCCESS' || result.result === 'PASSED'
                    ? 'bg-green-50 border-green-400'
                    : result.result === 'FAILED' || result.result === 'ERROR' || result.result === 'BLOCKED'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.test}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.result === 'SUCCESS' || result.result === 'PASSED'
                        ? 'bg-green-100 text-green-800'
                        : result.result === 'FAILED' || result.result === 'ERROR' || result.result === 'BLOCKED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {result.result}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Debugging Instructions</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li><strong>1.</strong> Check the Browser Information section for compatibility issues</li>
          <li><strong>2.</strong> Run the Popup Blocker test to ensure popups are allowed</li>
          <li><strong>3.</strong> Run the Google Auth test to see detailed error information</li>
          <li><strong>4.</strong> Check the browser console (F12) for detailed logs</li>
          <li><strong>5.</strong> If issues persist, try testing in incognito mode</li>
          <li><strong>6.</strong> Disable browser extensions and test again</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebugger;
