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
import { razorpayConfig, loadRazorpayScript } from '../config/razorpayConfig';

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
   * Create Razorpay order
   * This creates an order on Razorpay's side before payment
   * In production, this should be done on your backend server for security
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} - Razorpay order details
   */
  async createRazorpayOrder(orderData) {
    const { amount, currency, noteId, userId, noteName } = orderData;

    // For production: This should be an API call to your backend
    // Your backend should create the order using Razorpay API with key_secret
    // Example backend endpoint: POST /api/payments/create-order
    
    // For now, we'll create a local order ID (in production, this comes from Razorpay)
    // IMPORTANT: In production, you MUST create orders from your backend
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency: currency || 'INR',
      noteId,
      userId,
      noteName
    };
  }

  /**
   * Initialize Razorpay payment
   * Opens Razorpay checkout modal for payment
   * @param {Object} paymentData - Payment information
   * @param {Function} onSuccess - Success callback
   * @param {Function} onFailure - Failure callback
   * @returns {Promise<void>}
   */
  async initializeRazorpayPayment(paymentData, onSuccess, onFailure) {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create order
      const order = await this.createRazorpayOrder(paymentData);

      // Razorpay checkout options
      const options = {
        key: razorpayConfig.keyId, // Your Razorpay Key ID
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: razorpayConfig.companyName,
        description: `Purchase: ${paymentData.noteName}`,
        order_id: order.id, // Order ID from backend
        image: razorpayConfig.companyLogo,
        
        // Payment handler - called on successful payment
        handler: async (response) => {
          try {
            // Razorpay response contains:
            // - razorpay_payment_id: Payment ID
            // - razorpay_order_id: Order ID
            // - razorpay_signature: Signature for verification
            
            // IMPORTANT: In production, verify the signature on your backend
            // to ensure payment authenticity before granting access
            
            console.log('Payment successful:', response);
            
            // Create payment record in Firestore
            const paymentRecord = await this.createPaymentRecord({
              userId: paymentData.userId,
              noteId: paymentData.noteId,
              amount: paymentData.amount,
              currency: paymentData.currency,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              status: 'completed',
              paymentMethod: 'razorpay'
            });
            
            // Call success callback
            if (onSuccess) {
              onSuccess({
                success: true,
                payment: paymentRecord,
                razorpayResponse: response
              });
            }
          } catch (error) {
            console.error('Error processing payment success:', error);
            if (onFailure) {
              onFailure(error);
            }
          }
        },
        
        // Prefill customer details
        prefill: {
          name: paymentData.userName || '',
          email: paymentData.userEmail || '',
          contact: paymentData.userPhone || ''
        },
        
        // Payment methods to show
        method: {
          card: razorpayConfig.paymentMethods.card,
          netbanking: razorpayConfig.paymentMethods.netbanking,
          wallet: razorpayConfig.paymentMethods.wallet,
          upi: razorpayConfig.paymentMethods.upi,
        },
        
        // Theme
        theme: razorpayConfig.theme,
        
        // Modal configuration
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            if (onFailure) {
              onFailure(new Error('Payment cancelled by user'));
            }
          }
        },
        
        // Notes (metadata)
        notes: {
          noteId: paymentData.noteId,
          userId: paymentData.userId,
          noteName: paymentData.noteName
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      // Handle payment failure
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        if (onFailure) {
          onFailure(new Error(response.error.description || 'Payment failed'));
        }
      });
      
    } catch (error) {
      console.error('Error initializing Razorpay payment:', error);
      if (onFailure) {
        onFailure(error);
      }
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
        orderId,
        signature,
        status = 'completed',
        paymentMethod = 'razorpay'
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
        orderId: orderId || null,
        signature: signature || null,
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
   * Process complete payment flow using Razorpay
   * This method returns a Promise that resolves when payment UI is initiated
   * Actual success/failure is handled via callbacks
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Payment initialization result
   */
  async processPayment(data) {
    try {
      const { userId, noteId, amount, currency, noteName, userName, userEmail, userPhone } = data;

      // Check if already paid
      const alreadyPaid = await this.hasUserPaid(userId, noteId);
      if (alreadyPaid) {
        throw new Error('You have already purchased this note');
      }

      // Return a Promise that wraps the Razorpay payment flow
      return new Promise((resolve, reject) => {
        this.initializeRazorpayPayment(
          {
            userId,
            noteId,
            amount,
            currency: currency || 'INR',
            noteName,
            userName,
            userEmail,
            userPhone
          },
          // Success callback
          (result) => {
            resolve(result);
          },
          // Failure callback
          (error) => {
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment details by transaction ID
   * @param {string} transactionId - Razorpay payment ID
   * @returns {Promise<Object|null>} - Payment record or null
   */
  async getPaymentByTransactionId(transactionId) {
    try {
      const paymentQuery = query(
        collection(db, this.paymentsCollection),
        where('transactionId', '==', transactionId)
      );

      const snapshot = await getDocs(paymentQuery);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
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
