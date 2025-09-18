import React from 'react';

const Help = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-gray-600 mb-4">Find answers to common questions or reach out to our support team.</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Account: starting for free, logging in, resetting passwords</li>
          <li>Using AI tools and working with notes</li>
          <li>Uploading and managing your materials</li>
        </ul>
      </div>
    </div>
  );
};

export default Help;

