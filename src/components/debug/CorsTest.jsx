import React, { useState } from 'react';

const CorsTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testCorsEndpoints = async () => {
    setLoading(true);
    const results = {};

    // Test different origins and endpoints
    const tests = [
      {
        name: 'Local Vite Dev Server',
        url: 'http://localhost:5000',
        description: 'Testing local development server CORS'
      },
      {
        name: 'Firebase Hosting',
        url: 'https://duxe-5c071.web.app',
        description: 'Testing Firebase Hosting CORS'
      },
      {
        name: 'Firebase Functions API',
        url: 'https://us-central1-duxe-5c071.cloudfunctions.net/api',
        description: 'Testing Firebase Functions CORS'
      }
    ];

    for (const test of tests) {
      try {
        // Test with a simple fetch request
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Header': 'cors-test'
          }
        });

        results[test.name] = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          corsHeaders: {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
          },
          description: test.description
        };
      } catch (error) {
        results[test.name] = {
          success: false,
          error: error.message,
          description: test.description
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const testPreflight = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://us-central1-duxe-5c071.cloudfunctions.net/api', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      setTestResults(prev => ({
        ...prev,
        'Preflight Test': {
          success: response.ok,
          status: response.status,
          corsHeaders: {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
          },
          description: 'Testing CORS preflight request'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        'Preflight Test': {
          success: false,
          error: error.message,
          description: 'Testing CORS preflight request'
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🌐 CORS Configuration Test</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Test cross-origin requests to verify CORS is properly configured for all origins.
        </p>
        <div className="flex gap-4">
          <button
            onClick={testCorsEndpoints}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Testing...' : '🧪 Test CORS Endpoints'}
          </button>
          <button
            onClick={testPreflight}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Testing...' : '✈️ Test Preflight'}
          </button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className={`p-4 rounded-lg border-2 ${
              result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{testName}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? '✅ PASS' : '❌ FAIL'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{result.description}</p>
              
              {result.status && (
                <p className="text-sm">
                  <strong>Status:</strong> {result.status} {result.statusText}
                </p>
              )}
              
              {result.error && (
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              
              {result.corsHeaders && (
                <div className="mt-2">
                  <strong className="text-sm">CORS Headers:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
{JSON.stringify(result.corsHeaders, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Current CORS Configuration:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ <strong>Origins:</strong> All origins allowed (*)</li>
          <li>✅ <strong>Methods:</strong> GET, POST, PUT, DELETE, OPTIONS, PATCH</li>
          <li>✅ <strong>Headers:</strong> Origin, Content-Type, Authorization, X-Requested-With, etc.</li>
          <li>✅ <strong>Credentials:</strong> Enabled</li>
          <li>✅ <strong>Max Age:</strong> 86400 seconds (24 hours)</li>
          <li>✅ <strong>Dynamic Origin:</strong> Accepts any requesting origin</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">🎯 CORS is configured for:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Firebase Hosting:</strong> Dynamic headers in firebase.json</li>
          <li>• <strong>Firebase Functions:</strong> CORS middleware with origin: true</li>
          <li>• <strong>Vite Dev Server:</strong> CORS enabled for all origins</li>
          <li>• <strong>Production & Development:</strong> All environments covered</li>
        </ul>
      </div>
    </div>
  );
};

export default CorsTest;