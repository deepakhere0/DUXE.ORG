import React from 'react';

const HowItWorks = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h1>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>Browse curated notes or upload your own study materials.</li>
          <li>Use AI-powered tools to summarize, generate MCQs, and create flashcards.</li>
          <li>Watch video lectures and track your progress.</li>
          <li>Discover internships and opportunities relevant to your field.</li>
        </ol>
      </div>
    </div>
  );
};

export default HowItWorks;
