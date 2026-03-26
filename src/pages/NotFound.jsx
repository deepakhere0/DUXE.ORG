import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-accent-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-accent-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-accent-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary btn-lg inline-flex items-center justify-center">
            <HomeIcon className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary btn-lg inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/notes" className="text-accent-600 hover:text-accent-700 font-medium">
              Browse Notes
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/tools" className="text-accent-600 hover:text-accent-700 font-medium">
              AI Tools
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/videos" className="text-accent-600 hover:text-accent-700 font-medium">
              Video Lectures
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/internships" className="text-accent-600 hover:text-accent-700 font-medium">
              Internships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
