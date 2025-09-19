import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const GoogleSignInTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { googleSignIn } = useAuth();

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Starting test...\n');

    // Log current environment
    const envInfo = {
      'Current Origin': window.location.origin,
      'Firebase Auth Domain': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      'Firebase Project ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
      'Environment Mode': import.meta.env.MODE,
      'User Agent': navigator.userAgent.substring(0, 100) + '...'
    };

    let result = 'Environment Info:\n';
    Object.entries(envInfo).forEach(([key, value]) => {
      result += `${key}: ${value}\n`;
    });
    result += '\n';

    setTestResult(result);

    try {
      result += 'Attempting Google Sign-In...\n';
      setTestResult(result);

      const authResult = await googleSignIn();
      
      if (authResult.success) {
        result += '✅ SUCCESS: Google Sign-In completed!\n';
        result += `User: ${authResult.user?.displayName || authResult.user?.email}\n`;
      } else {
        result += `❌ FAILED: ${authResult.error}\n`;
      }
    } catch (error) {
      result += `❌ ERROR: ${error.message}\n`;
      result += `Code: ${error.code || 'Unknown'}\n`;
    }

    setTestResult(result);
    setIsLoading(false);
  };

  const checkDomainConfig = () => {
    const currentOrigin = window.location.origin;
    const requiredDomains = [
      'http://localhost:5000',
      'http://localhost:3000', 
      'https://duxe.org',
      'https://duxe.netlify.app'
    ];

    let result = 'Domain Configuration Check:\n\n';
    result += `Current Origin: ${currentOrigin}\n\n`;
    result += 'Required OAuth Origins:\n';
    
    requiredDomains.forEach(domain => {
      const isMatch = domain === currentOrigin;
      result += `${isMatch ? '✅' : '❌'} ${domain}\n`;
    });

    result += '\nRequired Redirect URIs:\n';
    requiredDomains.forEach(domain => {
      const redirectUri = `${domain}/__/auth/handler`;
      result += `• ${redirectUri}\n`;
    });

    setTestResult(result);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl">
      <h3 className="text-xl font-bold mb-4">Google Sign-In Diagnostic Tool</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={checkDomainConfig}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Domain Config
          </button>
          
          <button 
            onClick={runTest}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Google Sign-In'}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded border">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Quick Fix Instructions:</h4>
          <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
            <li>Edit your OAuth 2.0 Client ID</li>
            <li>Add <code className="bg-yellow-100 px-1 rounded">http://localhost:5000</code> to Authorized JavaScript origins</li>
            <li>Add <code className="bg-yellow-100 px-1 rounded">http://localhost:5000/__/auth/handler</code> to Authorized redirect URIs</li>
            <li>Wait 5 minutes for changes to propagate</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInTest;