import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    pendingReviews: 0,
    approvedNotes: 0,
    rejectedNotes: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Fetch total notes
        const notesQuery = query(collection(db, 'notes'));
        const notesSnapshot = await getDocs(notesQuery);
        const totalNotes = notesSnapshot.size;

        // Fetch pending reviews
        const pendingQuery = query(
          collection(db, 'notes'),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingReviews = pendingSnapshot.size;

        // Fetch approved notes
        const approvedQuery = query(
          collection(db, 'notes'),
          where('status', '==', 'approved')
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        const approvedNotes = approvedSnapshot.size;

        // Fetch rejected notes
        const rejectedQuery = query(
          collection(db, 'notes'),
          where('status', '==', 'rejected')
        );
        const rejectedSnapshot = await getDocs(rejectedQuery);
        const rejectedNotes = rejectedSnapshot.size;

        // Fetch recent activity (last 10 notes)
        const recentQuery = query(
          collection(db, 'notes'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentActivity = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalUsers,
          totalNotes,
          pendingReviews,
          approvedNotes,
          rejectedNotes,
          recentActivity
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Real-time updates for pending reviews
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'notes'), where('status', '==', 'pending')),
      (snapshot) => {
        setStats(prev => ({
          ...prev,
          pendingReviews: snapshot.size
        }));
      },
      (error) => {
        console.error('Error listening to pending reviews:', error);
      }
    );

    return unsubscribe;
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change, link }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {link && (
        <Link 
          to={link}
          className="mt-4 text-sm text-accent-600 hover:text-accent-700 font-medium inline-flex items-center"
        >
          View Details →
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your DUXE platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {currentUser?.displayName}
              </span>
              <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                <span className="text-sm font-medium text-accent-600">
                  {currentUser?.displayName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UsersIcon}
            color="text-blue-600"
            change={12}
            link="/admin/users"
          />
          <StatCard
            title="Total Notes"
            value={stats.totalNotes}
            icon={DocumentTextIcon}
            color="text-green-600"
            change={8}
            link="/admin/notes"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={ClockIcon}
            color="text-yellow-600"
            link="/admin/review-queue"
          />
          <StatCard
            title="Monthly Growth"
            value="23%"
            icon={ChartBarIcon}
            color="text-purple-600"
            change={5}
            link="/admin/analytics"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/review-queue"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Review Queue</p>
                    <p className="text-sm text-gray-600">{stats.pendingReviews} items pending</p>
                  </div>
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <UsersIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-600">View and edit user accounts</p>
                  </div>
                </Link>

                <Link
                  to="/admin/analytics"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-600">Platform insights and metrics</p>
                  </div>
                </Link>

                <Link
                  to="/admin/settings"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <CogIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Settings</p>
                    <p className="text-sm text-gray-600">Platform configuration</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <span className="font-medium text-gray-900">{stats.approvedNotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="font-medium text-gray-900">{stats.pendingReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Rejected</span>
                  </div>
                  <span className="font-medium text-gray-900">{stats.rejectedNotes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link 
                  to="/admin/activity"
                  className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'approved' ? 'bg-green-100' :
                      activity.status === 'pending' ? 'bg-yellow-100' :
                      activity.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <DocumentTextIcon className={`h-4 w-4 ${
                        activity.status === 'approved' ? 'text-green-600' :
                        activity.status === 'pending' ? 'text-yellow-600' :
                        activity.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {activity.authorName} • {activity.universityId}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {activity.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
