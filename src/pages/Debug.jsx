import React from 'react';
import AuthDebugger from '../components/debug/AuthDebugger';
import UIDFinder from '../components/debug/UIDFinder';
import CorsTest from '../components/debug/CorsTest';

const Debug = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <UIDFinder />
          <CorsTest />
          <AuthDebugger />
        </div>
      </div>
    </div>
  );
};

export default Debug;
