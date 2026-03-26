import React from 'react';

const Guidelines = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Share only original or permitted content.</li>
          <li>Be respectful and constructive in interactions.</li>
          <li>No harassment, plagiarism, or spam.</li>
        </ul>
      </div>
    </div>
  );
};

export default Guidelines;
