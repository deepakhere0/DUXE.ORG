import React, { useState, useEffect } from 'react';
import {
  CurrencyRupeeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';

/**
 * Revenue Dashboard Component
 * Displays payment statistics and revenue metrics for admin
 */
const RevenueDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
  });
  const [noteRevenues, setNoteRevenues] = useState([]);

  // Load revenue data
  const loadRevenueData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch total revenue statistics
      const stats = await paymentService.getTotalRevenue();
      setTotalStats(stats);

      // Note: In a real implementation, you would fetch a list of all note IDs
      // and then get revenue for each. For this demo, we'll just show the stats.
      // You can extend this by fetching top earning notes from Firestore

      if (isRefresh) {
        toast.success('Revenue data refreshed');
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
          <p className="text-gray-600 mt-1">Track earnings from paid notes</p>
        </div>
        <button
          onClick={() => loadRevenueData(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BanknotesIcon className="h-8 w-8" />
            </div>
            <ArrowTrendingUpIcon className="h-6 w-6 opacity-70" />
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalStats.totalRevenue)}</p>
          <p className="text-sm opacity-80 mt-2">All-time earnings</p>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <DocumentTextIcon className="h-6 w-6 opacity-70" />
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Total Transactions</h3>
          <p className="text-3xl font-bold">{totalStats.totalTransactions}</p>
          <p className="text-sm opacity-80 mt-2">Completed purchases</p>
        </div>

        {/* Average Transaction Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <CurrencyRupeeIcon className="h-8 w-8" />
            </div>
            <ChartBarIcon className="h-6 w-6 opacity-70" />
          </div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Average Transaction</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalStats.averageTransaction)}</p>
          <p className="text-sm opacity-80 mt-2">Per purchase</p>
        </div>
      </div>

      {/* Revenue Insights */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-navy-600" />
          <span>Revenue Insights</span>
        </h3>

        {totalStats.totalRevenue > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-lg font-semibold text-gray-900">Active</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Earning
                </span>
              </div>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Payment Analytics</h4>
                  <p className="text-sm text-blue-700">
                    {totalStats.totalTransactions > 0
                      ? `You've successfully processed ${totalStats.totalTransactions} payment${totalStats.totalTransactions > 1 ? 's' : ''} with an average value of ${formatCurrency(totalStats.averageTransaction)}.`
                      : 'No transactions yet. Start by setting prices on your notes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BanknotesIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Revenue Yet</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Start earning by setting prices on your notes. Students will be able to purchase them
              and you'll see revenue here.
            </p>
          </div>
        )}
      </div>

      {/* Note-wise Revenue (Placeholder for future enhancement) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-navy-600" />
          <span>Top Earning Notes</span>
        </h3>

        <div className="text-center py-8 text-gray-500">
          <p>Feature coming soon: View revenue breakdown by individual notes</p>
          <p className="text-sm mt-2">
            You'll be able to see which notes generate the most revenue
          </p>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <CurrencyRupeeIcon className="h-5 w-5 text-navy-600" />
          <span>Payment Information</span>
        </h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Mock Payment System</h4>
              <p className="text-sm text-yellow-700">
                Currently using a mock payment system for development. Replace with real payment
                gateway (Stripe, Razorpay, PayPal) in production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
