import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FirebaseDebug = () => {
  const debugInfo = {
    currentDomain: window.location.origin,
    firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    environment: import.meta.env.MODE,
    userAgent: navigator.userAgent,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">Firebase Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Current Domain:</strong> {debugInfo.currentDomain}</div>
        <div><strong>Firebase Auth Domain:</strong> {debugInfo.firebaseAuthDomain}</div>
        <div><strong>Firebase Project ID:</strong> {debugInfo.firebaseProjectId}</div>
        <div><strong>Environment:</strong> {debugInfo.environment}</div>
        <div><strong>Is Mobile:</strong> {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(debugInfo.userAgent) ? 'Yes' : 'No'}</div>
      </div>
      <button 
        onClick={() => console.log('Firebase Debug:', debugInfo)}
        className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
};

export default FirebaseDebug;