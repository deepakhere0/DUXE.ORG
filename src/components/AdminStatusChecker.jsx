import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const AdminStatusChecker = () => {
  const { user, userRole, isAdmin } = useAuth();

  // Debug info
  console.log('AdminStatusChecker Debug:', {
    userRole,
    isAdmin,
    userRoleType: typeof userRole,
    userData: user?.userData,
  });

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 m-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <p className="font-medium text-yellow-800">Not Logged In</p>
            <p className="text-sm text-yellow-700">Please log in to check admin status</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isAdmin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 m-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isAdmin ? (
            <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-3" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
          )}
          <div>
            <p className={`font-medium ${isAdmin ? 'text-green-800' : 'text-blue-800'}`}>
              {isAdmin ? '✅ Admin Access Confirmed' : '❌ No Admin Access'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Email: {user.email} | Role:{' '}
              <span className="font-semibold">{userRole || 'user'}</span> | Type: {typeof userRole}{' '}
              | isAdmin: {String(isAdmin)}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to="/upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
              Upload Notes
            </Link>
            <Link
              to="/admin/review"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
              Review Panel
            </Link>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-2">📝 How to get admin access:</p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Go to Firebase Console → Firestore Database</li>
            <li>
              Find your user document in the 'users' collection (search by your email: {user.email})
            </li>
            <li>Edit the document and change the 'role' field from "user" to "admin"</li>
            <li>Save changes and refresh this page</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default AdminStatusChecker;
