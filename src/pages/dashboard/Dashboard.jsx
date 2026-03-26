import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminStatusChecker from '../../components/AdminStatusChecker';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BeakerIcon,
  BriefcaseIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Dashboard Page Component
 * Main dashboard for authenticated users
 */
const Dashboard = () => {
  const { user } = useAuth();

  // Quick action cards
  const quickActions = [
    {
      name: 'Browse Notes',
      description: 'Access study materials',
      href: '/notes',
      icon: BookOpenIcon,
      color: 'bg-navy-500',
    },
    {
      name: 'AI Tools',
      description: 'Study with AI assistance',
      href: '/tools',
      icon: BeakerIcon,
      color: 'bg-accent-500',
    },
    {
      name: 'Internships',
      description: 'Find opportunities',
      href: '/internships',
      icon: BriefcaseIcon,
      color: 'bg-green-500',
    },
  ];

  // Recent activity (mock data for now)
  const recentActivity = [
    { action: 'Downloaded', item: 'Advanced Calculus Notes', time: '2 hours ago' },
    { action: 'Generated', item: 'MCQ Quiz from Physics Notes', time: '5 hours ago' },
    { action: 'Bookmarked', item: 'Data Structures Study Guide', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Admin Status Checker */}
        <AdminStatusChecker />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-700 mb-2">
            Welcome back, {user?.userData?.displayName || user?.email?.split('@')[0] || 'Student'}!
            👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your learning journey today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-navy-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-navy-500" />
              </div>
              <span className="text-sm text-gray-500">This Week</span>
            </div>
            <h3 className="text-2xl font-bold text-navy-700">12</h3>
            <p className="text-sm text-gray-600">Notes Downloaded</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-100 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-accent-500" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-navy-700">8</h3>
            <p className="text-sm text-gray-600">AI Sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-sm text-gray-500">Progress</span>
            </div>
            <h3 className="text-2xl font-bold text-navy-700">85%</h3>
            <p className="text-sm text-gray-600">Learning Goals</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <h3 className="text-2xl font-bold text-navy-700">2.5h</h3>
            <p className="text-sm text-gray-600">Study Time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-bold text-navy-700 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className="group flex items-center p-4 border-2 border-gray-200 rounded-xl
                      hover:border-navy-500 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-navy-700 group-hover:text-navy-500">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-card p-6 mt-6">
              <h2 className="text-xl font-bold text-navy-700 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-navy-700">
                        <span className="font-semibold">{activity.action}</span> {activity.item}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl shadow-card p-6 text-white">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="h-10 w-10 text-navy-500" />
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {user?.userData?.displayName || user?.email?.split('@')[0] || 'Student'}
                </h3>
                <p className="text-navy-200 text-sm">{user?.email}</p>
                <div className="mt-4 px-4 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {user?.userData?.role || 'Student'}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-navy-200 text-sm">Member since</span>
                  <span className="font-semibold text-sm">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-200 text-sm">Bookmarks</span>
                  <span className="font-semibold text-sm">
                    {user?.userData?.bookmarks?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-200 text-sm">Skills</span>
                  <span className="font-semibold text-sm">
                    {user?.userData?.skills?.length || 0}
                  </span>
                </div>
              </div>

              <Link
                to="/profile"
                className="block w-full py-2 px-4 bg-white text-navy-500 text-center
                  rounded-lg font-medium hover:bg-navy-50 transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-card p-6 mt-6">
              <h3 className="text-lg font-bold text-navy-700 mb-4">Upcoming</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-accent-50 rounded-lg">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-navy-700">Midterm Exams</p>
                    <p className="text-xs text-gray-600">In 5 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-navy-700">Project Deadline</p>
                    <p className="text-xs text-gray-600">In 2 weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
