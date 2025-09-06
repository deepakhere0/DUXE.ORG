import React, { useState } from 'react';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, BookmarkIcon } from '@heroicons/react/24/outline';

const Internships = () => {
  const [userSkills, setUserSkills] = useState(['React', 'JavaScript', 'Node.js']);

  const internships = [
    {
      id: 1,
      company: 'Tech Corp',
      role: 'Frontend Developer Intern',
      stipend: '$1500/month',
      location: 'Remote',
      duration: '3 months',
      requiredSkills: ['React', 'JavaScript', 'CSS'],
      matchPercentage: 95
    },
    {
      id: 2,
      company: 'Data Systems Inc',
      role: 'Data Science Intern',
      stipend: '$2000/month',
      location: 'New York',
      duration: '6 months',
      requiredSkills: ['Python', 'Machine Learning', 'SQL'],
      matchPercentage: 60
    },
    {
      id: 3,
      company: 'Web Solutions',
      role: 'Full Stack Developer Intern',
      stipend: '$1800/month',
      location: 'San Francisco',
      duration: '4 months',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      matchPercentage: 85
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Internship Opportunities</h1>

        {/* Skills Input */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Your Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {userSkills.map((skill, index) => (
              <span key={index} className="chip chip-primary">
                {skill}
              </span>
            ))}
            <button className="chip bg-gray-100 text-gray-600">+ Add Skill</button>
          </div>
        </div>

        {/* Internship Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship.id} className="card hover:shadow-card-hover transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{internship.role}</h3>
                    <p className="text-gray-600">{internship.company}</p>
                  </div>
                  <span className={`chip text-xs ${
                    internship.matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                    internship.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {internship.matchPercentage}% Match
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    {internship.stipend}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {internship.location}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {internship.duration}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.requiredSkills.map((skill, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1">Apply Now</button>
                  <button className="btn btn-secondary btn-sm">
                    <BookmarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Internships;
