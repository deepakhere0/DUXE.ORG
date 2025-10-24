import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Payment Service
 * Handles all payment-related operations for paid notes
 * Includes mock payment integration ready to be replaced with real gateway
 */
export class PaymentService {
  constructor() {
    this.paymentsCollection = 'payments';
    this.notesCollection = 'notes';
  }

  /**
   * Check if user has already paid for a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} - True if paid, false otherwise
   */
  async hasUserPaid(userId, noteId) {
    try {
      if (!userId || !noteId) return false;

      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('userId', '==', userId),
        where('noteId', '==', noteId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(paymentQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Get all paid notes for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of noteIds user has paid for
   */
  async getUserPaidNotes(userId) {
    try {
      if (!userId) return [];

      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(paymentQuery);
      const paidNotes = [];
      
      snapshot.forEach((doc) => {
        paidNotes.push(doc.data().noteId);
      });

      return paidNotes;
    } catch (error) {
      console.error('Error fetching paid notes:', error);
      return [];
    }
  }

  /**
   * Mock payment processing
   * In production, replace with actual payment gateway (Stripe, PayPal, Razorpay, etc.)
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} - Payment result
   */
  async processMockPayment(paymentData) {
    const { amount, currency, noteId, userId, noteName } = paymentData;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment success (90% success rate for testing)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        timestamp: new Date().toISOString(),
        message: 'Payment successful'
      };
    } else {
      throw new Error('Payment failed. Please try again.');
    }
  }

  /**
   * Create a payment record in Firestore
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Created payment record
   */
  async createPaymentRecord(paymentData) {
    try {
      const {
        userId,
        noteId,
        amount,
        currency = 'INR',
        transactionId,
        status = 'completed',
        paymentMethod = 'mock'
      } = paymentData;

      // Validate required fields
      if (!userId || !noteId || !amount) {
        throw new Error('Missing required payment data');
      }

      // Create payment document
      const paymentRef = doc(collection(db, this.paymentsCollection));
      const paymentRecord = {
        userId,
        noteId,
        amount: parseFloat(amount),
        currency,
        transactionId,
        status,
        paymentMethod,
        paymentDate: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await setDoc(paymentRef, paymentRecord);

      // Update note revenue (optional - for admin analytics)
      await this.updateNoteRevenue(noteId, amount);

      return {
        id: paymentRef.id,
        ...paymentRecord,
        paymentDate: new Date(),
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw new Error('Failed to create payment record');
    }
  }

  /**
   * Update note revenue statistics
   * @param {string} noteId - Note ID
   * @param {number} amount - Payment amount
   */
  async updateNoteRevenue(noteId, amount) {
    try {
      const noteRef = doc(db, this.notesCollection, noteId);
      await updateDoc(noteRef, {
        totalRevenue: increment(parseFloat(amount)),
        purchaseCount: increment(1)
      });
    } catch (error) {
      console.error('Error updating note revenue:', error);
      // Don't throw - this is supplementary data
    }
  }

  /**
   * Process complete payment flow
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Payment result
   */
  async processPayment(data) {
    try {
      const { userId, noteId, amount, currency, noteName } = data;

      // Check if already paid
      const alreadyPaid = await this.hasUserPaid(userId, noteId);
      if (alreadyPaid) {
        throw new Error('You have already purchased this note');
      }

      // Process mock payment
      const paymentResult = await this.processMockPayment({
        amount,
        currency,
        noteId,
        userId,
        noteName
      });

      // Create payment record
      const paymentRecord = await this.createPaymentRecord({
        userId,
        noteId,
        amount,
        currency,
        transactionId: paymentResult.transactionId,
        status: 'completed',
        paymentMethod: 'mock'
      });

      return {
        success: true,
        payment: paymentRecord,
        transaction: paymentResult
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of payment records
   */
  async getUserPaymentHistory(userId) {
    try {
      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(paymentQuery);
      const payments = [];

      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return payments;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Get revenue statistics for a specific note (admin only)
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} - Revenue statistics
   */
  async getNoteRevenue(noteId) {
    try {
      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('noteId', '==', noteId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(paymentQuery);
      let totalRevenue = 0;
      let purchaseCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        purchaseCount++;
      });

      return {
        totalRevenue,
        purchaseCount,
        noteId
      };
    } catch (error) {
      console.error('Error fetching note revenue:', error);
      return { totalRevenue: 0, purchaseCount: 0, noteId };
    }
  }

  /**
   * Get total revenue for all notes (admin only)
   * @returns {Promise<Object>} - Total revenue statistics
   */
  async getTotalRevenue() {
    try {
      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(paymentQuery);
      let totalRevenue = 0;
      let totalTransactions = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        totalTransactions++;
      });

      return {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      };
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      return { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 };
    }
  }
}

// Create singleton instance
export const paymentService = new PaymentService();
