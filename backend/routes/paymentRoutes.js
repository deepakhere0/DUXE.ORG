/**
 * Payment Routes - Backend API for Razorpay Integration
 * Handles secure payment operations including order creation and verification
 * 
 * SECURITY: Key Secret is kept server-side only
 */

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
// Note: You need to install razorpay package: npm install razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for payment
 * This must be done server-side to keep Key Secret secure
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, noteId, userId, noteName } = req.body;

    // Validate required fields
    if (!amount || !noteId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, noteId, userId'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Create Razorpay order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: currency || 'INR',
      receipt: `receipt_${noteId}_${Date.now()}`,
      notes: {
        noteId,
        userId,
        noteName: noteName || '',
      },
    };

    // Create order using Razorpay API
    const order = await razorpay.orders.create(options);

    // Return order details to frontend
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order',
      message: error.message
    });
  }
});

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature
 * CRITICAL: This prevents fraudulent payment confirmations
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required verification fields'
      });
    }

    // Create signature verification string
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    // Generate expected signature using your Key Secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // Signature is valid - payment is authentic
      // Here you can update your database, grant access, etc.
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        verified: true
      });
    } else {
      // Signature mismatch - potential fraud attempt
      res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        verified: false
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      message: error.message
    });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook endpoint for payment notifications
 * Configure this URL in your Razorpay Dashboard
 */
router.post('/webhook', async (req, res) => {
  try {
    // Get webhook signature from headers
    const webhookSignature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Process webhook event
    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    switch (event) {
      case 'payment.captured':
        // Payment successful - grant access to user
        console.log('Payment captured:', payload);
        // Update your database here
        break;

      case 'payment.failed':
        // Payment failed - notify user
        console.log('Payment failed:', payload);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Fetch order details from Razorpay
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await razorpay.orders.fetch(orderId);
    
    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

/**
 * GET /api/payments/payment/:paymentId
 * Fetch payment details from Razorpay
 */
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      message: error.message
    });
  }
});

module.exports = router;
