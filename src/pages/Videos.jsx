import React, { useState } from 'react';
import { PlayIcon, BookmarkIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Videos = () => {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const videos = [
    {
      id: 1,
      title: 'Introduction to Machine Learning',
      source: 'YouTube',
      duration: '45 min',
      skill: 'Machine Learning',
      level: 'Beginner',
      thumbnail: 'https://via.placeholder.com/400x225',
      views: '125K',
    },
    {
      id: 2,
      title: 'Advanced Data Structures',
      source: 'Coursera',
      duration: '1h 20min',
      skill: 'Programming',
      level: 'Advanced',
      thumbnail: 'https://via.placeholder.com/400x225',
      views: '89K',
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      source: 'Udemy',
      duration: '2h 15min',
      skill: 'Web Development',
      level: 'Intermediate',
      thumbnail: 'https://via.placeholder.com/400x225',
      views: '203K',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Video Lectures</h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input"
            >
              <option value="">All Skills</option>
              <option value="Programming">Programming</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Web Development">Web Development</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <input type="text" placeholder="Search videos..." className="input" />
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card hover:shadow-card-hover transition-shadow">
              <div className="relative aspect-video bg-gray-200 rounded-t-2xl overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayIcon className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {video.duration}
                  </span>
                  <span>{video.views} views</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="chip chip-primary text-xs">{video.skill}</span>
                  <span className="chip chip-secondary text-xs">{video.level}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1">Watch</button>
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

export default Videos;
