/**
 * Payment Service
 * Handles payment processing for paid notes
 * Currently uses mock payment - can be replaced with Stripe/Razorpay/PayPal
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

class PaymentService {
  /**
   * Check if user has already paid for a note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} - True if user has paid
   */
  async hasUserPaid(userId, noteId) {
    try {
      if (!userId || !noteId) return false;

      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        where('noteId', '==', noteId),
        where('status', '==', 'success')
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Process mock payment
   * In production, replace this with real payment gateway integration
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} - Payment result
   */
  async processMockPayment(paymentData) {
    const { userId, noteId, amount, userEmail, userName } = paymentData;

    return new Promise((resolve) => {
      // Simulate payment processing delay
      setTimeout(async () => {
        try {
          // Mock payment success (90% success rate for demo)
          const isSuccess = Math.random() > 0.1;

          if (!isSuccess) {
            resolve({
              success: false,
              error: 'Payment failed. Please try again.'
            });
            return;
          }

          // Create payment record in Firestore
          const paymentRecord = {
            userId,
            noteId,
            amount,
            userEmail: userEmail || '',
            userName: userName || '',
            status: 'success',
            paymentDate: serverTimestamp(),
            transactionId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentMethod: 'mock_payment',
            createdAt: serverTimestamp()
          };

          const paymentsRef = collection(db, 'payments');
          const docRef = await addDoc(paymentsRef, paymentRecord);

          // Update note's revenue and purchase count
          const noteRef = doc(db, 'notes', noteId);
          await updateDoc(noteRef, {
            purchaseCount: increment(1),
            totalRevenue: increment(amount),
            lastPurchaseDate: serverTimestamp()
          });

          resolve({
            success: true,
            paymentId: docRef.id,
            transactionId: paymentRecord.transactionId
          });
        } catch (error) {
          console.error('Error processing payment:', error);
          resolve({
            success: false,
            error: 'Failed to process payment. Please try again.'
          });
        }
      }, 2000); // 2 second delay to simulate payment processing
    });
  }

  /**
   * Get all payments for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of payment records
   */
  async getUserPayments(userId) {
    try {
      if (!userId) return [];

      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        where('status', '==', 'success')
      );

      const snapshot = await getDocs(q);
      const payments = [];
      
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return payments;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  /**
   * Get all payments for a note (for admin/analytics)
   * @param {string} noteId - Note ID
   * @returns {Promise<Array>} - Array of payment records
   */
  async getNotePayments(noteId) {
    try {
      if (!noteId) return [];

      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('noteId', '==', noteId),
        where('status', '==', 'success')
      );

      const snapshot = await getDocs(q);
      const payments = [];
      
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return payments;
    } catch (error) {
      console.error('Error fetching note payments:', error);
      return [];
    }
  }

  /**
   * Get total revenue across all notes
   * @returns {Promise<Object>} - Revenue statistics
   */
  async getTotalRevenue() {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('status', '==', 'success')
      );

      const snapshot = await getDocs(q);
      
      let totalRevenue = 0;
      let totalTransactions = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        totalTransactions += 1;
      });

      return {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      };
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
