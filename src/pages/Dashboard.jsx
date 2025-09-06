import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookmarkIcon,
  DocumentTextIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { userProfile, isAdmin, isTeacher, isStudent } = useAuth();

  // Student Dashboard
  if (isStudent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <BookmarkIcon className="h-8 w-8 text-accent-500 mb-2" />
                <p className="text-2xl font-bold">24</p>
                <p className="text-gray-600">Bookmarked Notes</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-gray-600">Uploaded Notes</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <SparklesIcon className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">156</p>
                <p className="text-gray-600">AI Tools Used</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <ChartBarIcon className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">89%</p>
                <p className="text-gray-600">Study Progress</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Downloaded "Data Structures Notes"</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Generated MCQs for Algorithms</span>
                    <span className="text-xs text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Bookmarked "Calculus Solutions"</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">My Uploads</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Linear Algebra Notes</p>
                      <p className="text-sm text-gray-500">Status: Approved</p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Physics Lab Manual</p>
                      <p className="text-sm text-gray-500">Status: Under Review</p>
                    </div>
                    <ClockIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
                <Link to="/upload" className="btn btn-primary btn-sm w-full mt-4">
                  Upload New Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">42</p>
                <p className="text-gray-600">Total Uploads</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <UserGroupIcon className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">1,250</p>
                <p className="text-gray-600">Students Reached</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <ChartBarIcon className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Content Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Structures Complete Guide</p>
                    <p className="text-sm text-gray-500">325 downloads • 4.9 rating</p>
                  </div>
                  <span className="text-green-600 font-medium">+15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Algorithm Analysis Notes</p>
                    <p className="text-sm text-gray-500">280 downloads • 4.7 rating</p>
                  </div>
                  <span className="text-green-600 font-medium">+8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">5,234</p>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <DocumentTextIcon className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">1,892</p>
                <p className="text-gray-600">Total Notes</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <ClockIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">24</p>
                <p className="text-gray-600">Pending Reviews</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <ChartBarIcon className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">98%</p>
                <p className="text-gray-600">Approval Rate</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Organic Chemistry Notes</p>
                      <p className="text-sm text-gray-500">Uploaded by John Doe</p>
                    </div>
                    <button className="btn btn-primary btn-sm">Review</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Statistics Formulas</p>
                      <p className="text-sm text-gray-500">Uploaded by Jane Smith</p>
                    </div>
                    <button className="btn btn-primary btn-sm">Review</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4">Platform Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Active Users</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads Today</span>
                    <span className="font-medium">456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Tools Usage</span>
                    <span className="font-medium">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Signups</span>
                    <span className="font-medium">67</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </div>
  );
};

export default Dashboard;
