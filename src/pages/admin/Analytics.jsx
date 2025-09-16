import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  EyeIcon,
  CloudArrowDownIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalDownloads: 0,
    totalAIUsage: 0,
    recentUsers: 0,
    recentNotes: 0,
    popularNotes: [],
    userGrowth: [],
    activityData: [],
    universityStats: [],
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isAdmin) return;

      try {
        // Calculate date ranges
        const now = new Date();
        const ranges = {
          '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        };
        const startDate = ranges[dateRange];

        // Fetch total users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Fetch recent users (within date range)
        const recentUsersQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', Timestamp.fromDate(startDate))
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsers = recentUsersSnapshot.size;

        // Fetch total notes
        const notesQuery = query(collection(db, 'notes'));
        const notesSnapshot = await getDocs(notesQuery);
        const totalNotes = notesSnapshot.size;

        // Fetch recent notes
        const recentNotesQuery = query(
          collection(db, 'notes'),
          where('createdAt', '>=', Timestamp.fromDate(startDate))
        );
        const recentNotesSnapshot = await getDocs(recentNotesQuery);
        const recentNotes = recentNotesSnapshot.size;

        // Fetch popular notes (by downloads)
        const popularNotesQuery = query(
          collection(db, 'notes'),
          where('status', '==', 'approved'),
          orderBy('downloads', 'desc'),
          limit(10)
        );
        const popularNotesSnapshot = await getDocs(popularNotesQuery);
        const popularNotes = popularNotesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch analytics data if exists
        let totalDownloads = 0;
        let totalAIUsage = 0;
        
        try {
          const analyticsQuery = query(collection(db, 'analytics'));
          const analyticsSnapshot = await getDocs(analyticsQuery);
          
          analyticsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.type === 'download') {
              totalDownloads++;
            } else if (data.type === 'ai_tool_usage') {
              totalAIUsage++;
            }
          });
        } catch (error) {
          console.log('Analytics collection might not exist yet');
        }

        // Calculate university stats
        const universityMap = new Map();
        usersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const university = data.university || 'Unknown';
          universityMap.set(university, (universityMap.get(university) || 0) + 1);
        });
        
        const universityStats = Array.from(universityMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Calculate department stats
        const departmentMap = new Map();
        usersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const department = data.department || 'Unknown';
          departmentMap.set(department, (departmentMap.get(department) || 0) + 1);
        });
        
        const departmentStats = Array.from(departmentMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Generate mock user growth data for the chart
        const userGrowth = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          // This would be actual data from your analytics collection
          userGrowth.push({
            date: date.toLocaleDateString(),
            users: Math.floor(Math.random() * 50) + 10, // Mock data
            notes: Math.floor(Math.random() * 20) + 5   // Mock data
          });
        }

        setStats({
          totalUsers,
          totalNotes,
          totalDownloads,
          totalAIUsage,
          recentUsers,
          recentNotes,
          popularNotes,
          userGrowth,
          universityStats,
          departmentStats
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAdmin, dateRange]);

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(change)}% vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="text-blue-600"
          change={12}
          subtitle={`${stats.recentUsers} new in ${dateRange}`}
        />
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          icon={DocumentTextIcon}
          color="text-green-600"
          change={8}
          subtitle={`${stats.recentNotes} new in ${dateRange}`}
        />
        <StatCard
          title="Total Downloads"
          value={stats.totalDownloads}
          icon={CloudArrowDownIcon}
          color="text-purple-600"
          change={15}
        />
        <StatCard
          title="AI Tool Usage"
          value={stats.totalAIUsage}
          icon={SparklesIcon}
          color="text-orange-600"
          change={25}
        />
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats.userGrowth.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full space-y-1">
                <div 
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${(data.users / 60) * 100}%`, minHeight: '4px' }}
                  title={`${data.users} users`}
                />
                <div 
                  className="bg-green-500 rounded-t"
                  style={{ height: `${(data.notes / 25) * 100}%`, minHeight: '4px' }}
                  title={`${data.notes} notes`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">{data.date}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2" />
            <span className="text-sm text-gray-600">Notes</span>
          </div>
        </div>
      </div>

      {/* Popular Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Notes</h3>
        <div className="space-y-3">
          {stats.popularNotes.slice(0, 5).map((note, index) => (
            <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{note.title}</p>
                  <p className="text-sm text-gray-600">{note.courseCode} • {note.universityId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{note.downloads || 0} downloads</p>
                <p className="text-sm text-gray-600">Rating: {note.ratingAvg || 0}/5</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UniversityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by University</h3>
        <div className="space-y-3">
          {stats.universityStats.map((uni, index) => (
            <div key={uni.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900">{uni.name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(uni.count / stats.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {uni.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Department</h3>
        <div className="space-y-3">
          {stats.departmentStats.map((dept, index) => (
            <div key={dept.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-green-600">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900">{dept.name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(dept.count / stats.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {dept.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Platform insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('universities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'universities'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Universities & Departments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'universities' && <UniversityTab />}
      </div>
    </div>
  );
};

export default Analytics;
