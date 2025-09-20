import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UIDFinder = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">🔍 Find Your Admin UID</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">
            <strong>Please sign in first</strong> to see your Firebase Auth UID.
          </p>
        </div>
        <p className="text-gray-600">
          Once you sign in, this component will display your UID which you can use to configure admin access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔍 Your Firebase Auth UID</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Current User Information:</h3>
        <div className="space-y-2">
          <p><strong>Email:</strong> <code className="bg-green-100 px-2 py-1 rounded">{currentUser.email}</code></p>
          <p><strong>Display Name:</strong> <code className="bg-green-100 px-2 py-1 rounded">{currentUser.displayName || 'Not set'}</code></p>
          <p><strong>UID:</strong> <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-sm">{currentUser.uid}</code></p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Copy the UID above</li>
          <li>Open <code>src/components/auth/AdminRoute.jsx</code></li>
          <li>Replace <code>your_admin_uid_here</code> with your actual UID</li>
          <li>Save the file</li>
          <li>Visit <a href="/admin" className="text-blue-600 underline">/admin</a> to test access</li>
        </ol>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🔧 Code to Update:</h3>
        <p className="text-sm text-gray-600 mb-2">In <code>src/components/auth/AdminRoute.jsx</code> line 6:</p>
        <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Replace this line:
const ADMIN_UID = 'your_admin_uid_here';

// With this:
const ADMIN_UID = '${currentUser.uid}';`}
        </pre>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigator.clipboard.writeText(currentUser.uid)}
          className="btn btn-primary"
        >
          📋 Copy UID to Clipboard
        </button>
      </div>
    </div>
  );
};

export default UIDFinder;