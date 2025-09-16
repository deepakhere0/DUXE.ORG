import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    },
    {
      name: 'Review Queue',
      href: '/admin/review-queue',
      icon: ClockIcon,
      current: location.pathname === '/admin/review-queue'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UsersIcon,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'File Management',
      href: '/admin/files',
      icon: FolderIcon,
      current: location.pathname === '/admin/files'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: location.pathname === '/admin/analytics'
    }
  ];

  return (
    <div className="flex flex-col w-64 bg-white shadow-sm border-r border-gray-200">
      {/* Admin Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3">
            <ShieldCheckIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">DUXE Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-accent-50 text-accent-700 border-accent-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${
                  item.current
                    ? 'text-accent-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Back to Site */}
      <div className="border-t border-gray-200 p-4">
        <Link
          to="/dashboard"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-3"
        >
          <ArrowLeftIcon className="mr-3 h-5 w-5 text-gray-400" />
          Back to Site
        </Link>
        
        <div className="flex items-center px-3 py-2">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-accent-600">
                {currentUser?.displayName?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {currentUser?.displayName || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
