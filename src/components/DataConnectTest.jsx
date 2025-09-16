import React, { useState } from 'react';
import { useNotes, useUniversities, useDepartments } from '../hooks/useDataConnect';
import dataConnect from '../services/dataConnect';

const DataConnectTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTestin, setIsTestin] = useState(false);
  
  // Test hooks
  const { data: notes, isLoading: notesLoading, error: notesError } = useNotes({ limit: 5 });
  const { data: universities, isLoading: unisLoading, error: unisError } = useUniversities();
  const { data: departments, isLoading: deptsLoading, error: deptsError } = useDepartments();
  
  // Manual connection test
  const testConnection = async () => {
    setIsTestin(true);
    setTestResult(null);
    
    try {
      // Test if Data Connect is configured
      if (!dataConnect.isConfigured) {
        throw new Error('Data Connect is not configured. Please check your Firebase settings.');
      }
      
      // Try a simple query
      const testQuery = `
        query TestConnection {
          __typename
        }
      `;
      
      const result = await dataConnect.query(testQuery);
      
      setTestResult({
        success: true,
        message: 'Data Connect is connected successfully!',
        data: result
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        error: error.message
      });
    } finally {
      setIsTestin(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Firebase Data Connect Connection Test</h2>
      
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${dataConnect.isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{dataConnect.isConfigured ? 'Data Connect Configured' : 'Data Connect Not Configured'}</span>
        </div>
        
        <button
          onClick={testConnection}
          disabled={isTestin}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTestin ? 'Testing...' : 'Test Connection'}
        </button>
        
        {testResult && (
          <div className={`mt-4 p-3 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.message}
            </p>
            {testResult.error && (
              <p className="text-sm text-red-600 mt-1">{testResult.error}</p>
            )}
            {testResult.data && (
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      
      {/* Universities Test */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Universities Query Test</h3>
        {unisLoading && <p>Loading universities...</p>}
        {unisError && (
          <p className="text-red-600">Error: {unisError.message}</p>
        )}
        {universities && (
          <div>
            <p className="text-green-600 mb-2">✓ Successfully fetched {universities.length} universities</p>
            <div className="max-h-40 overflow-auto">
              <pre className="text-xs">{JSON.stringify(universities.slice(0, 3), null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Departments Test */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Departments Query Test</h3>
        {deptsLoading && <p>Loading departments...</p>}
        {deptsError && (
          <p className="text-red-600">Error: {deptsError.message}</p>
        )}
        {departments && (
          <div>
            <p className="text-green-600 mb-2">✓ Successfully fetched {departments.length} departments</p>
            <div className="max-h-40 overflow-auto">
              <pre className="text-xs">{JSON.stringify(departments.slice(0, 3), null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Notes Test */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-2">Notes Query Test</h3>
        {notesLoading && <p>Loading notes...</p>}
        {notesError && (
          <p className="text-red-600">Error: {notesError.message}</p>
        )}
        {notes && (
          <div>
            <p className="text-green-600 mb-2">✓ Successfully fetched {notes.length} notes</p>
            <div className="max-h-40 overflow-auto">
              <pre className="text-xs">{JSON.stringify(notes.slice(0, 2), null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Make sure you have created a <code>.env.local</code> file with your Firebase configuration</li>
          <li>Run <code>firebase login</code> to authenticate with Firebase</li>
          <li>Run <code>firebase init dataconnect</code> to initialize Data Connect</li>
          <li>Deploy the schema: <code>firebase deploy --only dataconnect</code></li>
          <li>Restart the development server after updating environment variables</li>
        </ol>
      </div>
    </div>
  );
};

export default DataConnectTest;
