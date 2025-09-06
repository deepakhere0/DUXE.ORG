import React from 'react';

const About = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-gray-600 mb-6">
          StudyHub is a premium learning platform that helps students study smarter with high-quality notes,
          AI-powered tools, and curated resources. Our mission is to make world-class study materials accessible to
          everyone and help students achieve better outcomes.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-2">Our Vision</h2>
              <p className="text-gray-600">Empower learners globally with the tools and resources to excel in their studies.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Curated university notes and materials</li>
                <li>AI-powered study assistants and generators</li>
                <li>Video lectures and internship discovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

