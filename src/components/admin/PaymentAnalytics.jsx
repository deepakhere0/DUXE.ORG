import React, { useState, useEffect } from 'react';
import {
  CurrencyRupeeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '../../services/paymentService';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * PaymentAnalytics Component
 * Admin dashboard component to view payment analytics and revenue
 * Shows total revenue, per-note revenue, and purchaser lists
 */
const PaymentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState(null);
  const [notePayments, setNotePayments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notePurchasers, setNotePurchasers] = useState([]);

  /**
   * Fetch all payment analytics data
   */
  useEffect(() => {
    fetchAnalytics();
  }, []);

  /**
   * Fetch total revenue and analytics
   */
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get total revenue stats
      const totalRevenue = await paymentService.getTotalRevenue();
      setTotalStats(totalRevenue);

      // Get all payments grouped by note
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('status', '==', 'completed'),
        orderBy('paymentDate', 'desc')
      );

      const snapshot = await getDocs(paymentsQuery);
      const payments = [];
      const noteRevenueMap = new Map();

      snapshot.forEach((doc) => {
        const payment = { id: doc.id, ...doc.data() };
        payments.push(payment);

        // Aggregate by note
        if (!noteRevenueMap.has(payment.noteId)) {
          noteRevenueMap.set(payment.noteId, {
            noteId: payment.noteId,
            totalRevenue: 0,
            purchaseCount: 0,
            payments: []
          });
        }

        const noteStats = noteRevenueMap.get(payment.noteId);
        noteStats.totalRevenue += payment.amount || 0;
        noteStats.purchaseCount += 1;
        noteStats.payments.push(payment);
      });

      // Convert map to array and fetch note details
      const notePaymentsList = await Promise.all(
        Array.from(noteRevenueMap.values()).map(async (noteStats) => {
          // Fetch note details
          const noteQuery = query(
            collection(db, 'notes'),
            where('__name__', '==', noteStats.noteId),
            limit(1)
          );
          const noteSnapshot = await getDocs(noteQuery);
          
          let noteDetails = { title: 'Unknown Note', courseCode: '' };
          if (!noteSnapshot.empty) {
            noteDetails = noteSnapshot.docs[0].data();
          }

          return {
            ...noteStats,
            noteTitle: noteDetails.title,
            courseCo: noteDetails.courseCode
          };
        })
      );

      // Sort by revenue
      notePaymentsList.sort((a, b) => b.totalRevenue - a.totalRevenue);
      setNotePayments(notePaymentsList);

      // Get recent payments (last 10)
      setRecentPayments(payments.slice(0, 10));

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load purchasers for a specific note
   */
  const loadNotePurchasers = async (noteId) => {
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('noteId', '==', noteId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(paymentsQuery);
      const purchasers = [];

      // Fetch user details for each payment
      for (const doc of snapshot.docs) {
        const payment = { id: doc.id, ...doc.data() };
        
        // Fetch user details
        const userQuery = query(
          collection(db, 'users'),
          where('__name__', '==', payment.userId),
          limit(1)
        );
        const userSnapshot = await getDocs(userQuery);
        
        let userDetails = { displayName: 'Unknown User', email: '' };
        if (!userSnapshot.empty) {
          userDetails = userSnapshot.docs[0].data();
        }

        purchasers.push({
          ...payment,
          userName: userDetails.displayName || userDetails.email,
          userEmail: userDetails.email
        });
      }

      setNotePurchasers(purchasers);
    } catch (error) {
      console.error('Error loading purchasers:', error);
    }
  };

  /**
   * Handle note selection to view purchasers
   */
  const handleNoteSelect = (noteStats) => {
    setSelectedNote(noteStats);
    loadNotePurchasers(noteStats.noteId);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment Analytics</h2>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CurrencyRupeeIcon className="h-10 w-10 opacity-80" />
            <ArrowTrendingUpIcon className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold">
            ₹{totalStats?.totalRevenue?.toLocaleString('en-IN') || 0}
          </h3>
        </div>

        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircleIcon className="h-10 w-10 opacity-80" />
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Transactions</p>
          <h3 className="text-3xl font-bold">
            {totalStats?.totalTransactions || 0}
          </h3>
        </div>

        {/* Average Transaction */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <UserGroupIcon className="h-10 w-10 opacity-80" />
            <CalendarIcon className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Average Transaction</p>
          <h3 className="text-3xl font-bold">
            ₹{totalStats?.averageTransaction?.toFixed(0) || 0}
          </h3>
        </div>
      </div>

      {/* Revenue by Note */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Revenue by Note</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click on a note to view purchasers
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notePayments.map((noteStats) => (
                <tr
                  key={noteStats.noteId}
                  onClick={() => handleNoteSelect(noteStats)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {noteStats.noteTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {noteStats.courseCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {noteStats.purchaseCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{noteStats.totalRevenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ₹{(noteStats.totalRevenue / noteStats.purchaseCount).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchasers Modal/Section */}
      {selectedNote && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-navy-600 to-navy-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedNote.noteTitle}</h3>
                <p className="text-sm opacity-90 mt-1">
                  {selectedNote.purchaseCount} purchases • ₹{selectedNote.totalRevenue.toLocaleString('en-IN')} revenue
                </p>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notePurchasers.map((purchaser) => (
                  <tr key={purchaser.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchaser.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {purchaser.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{purchaser.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(purchaser.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {purchaser.transactionId?.substring(0, 20)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {payment.noteId?.substring(0, 10)}...
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {payment.transactionId?.substring(0, 20)}...
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalytics;
