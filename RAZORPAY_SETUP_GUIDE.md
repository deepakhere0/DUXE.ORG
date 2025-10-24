# Razorpay Payment Integration - Setup Guide

## Overview
This guide explains how to set up and use the Razorpay payment integration for the DUXE platform's paid notes system.

## Features Implemented
- ✅ Real Razorpay payment gateway integration
- ✅ Support for multiple payment methods (UPI, Cards, Net Banking, Wallets)
- ✅ Secure payment processing with Firestore record keeping
- ✅ Payment verification and note access control
- ✅ Admin dashboard for revenue analytics
- ✅ Per-note revenue tracking
- ✅ Student purchaser lists

---

## Prerequisites

### 1. Razorpay Account
1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Complete email verification
3. For production, complete KYC verification

### 2. Firebase Project
- Ensure Firestore is enabled
- Authentication should be set up

---

## Installation & Setup

### Step 1: Environment Configuration

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Get your Razorpay API keys:
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
   - Copy **Key ID** (starts with `rzp_test_` for test mode)
   - Add to `.env.local`:

```env
# For Development/Testing
VITE_RAZORPAY_TEST_KEY_ID=rzp_test_xxxxxxxxxxxxx

# For Production (after KYC)
VITE_RAZORPAY_LIVE_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

**Important Notes:**
- ⚠️ **NEVER commit `.env.local` to version control**
- ⚠️ **Key Secret should NEVER be exposed in frontend code**
- Only the Key ID is used in the frontend
- Key Secret should only be used in backend/server-side code

### Step 2: Install Dependencies

Dependencies are already installed, but if needed:
```bash
npm install razorpay
```

### Step 3: Firestore Security Rules

Firestore rules are already configured in `firestore.rules`. Deploy them:
```bash
firebase deploy --only firestore:rules
```

Key rules implemented:
- Users can only read their own payment records
- Admins can read all payments
- Payment records require userId, noteId, amount, and status
- Only completed payments grant note access

---

## How It Works

### Payment Flow

1. **User clicks "Purchase" on a paid note**
   - `NoteCard.jsx` opens the payment modal

2. **Payment Modal opens**
   - `PaymentModal.jsx` displays note details and price
   - Shows accepted payment methods (UPI, Cards, etc.)

3. **User clicks "Pay" button**
   - `paymentService.processPayment()` is called
   - Razorpay SDK script is loaded dynamically
   - Order is created (in production, this should be done on backend)

4. **Razorpay Checkout Modal opens**
   - User selects payment method
   - Completes payment (UPI/Card/NetBanking/Wallet)

5. **On Payment Success**
   - Razorpay returns payment details (payment_id, order_id, signature)
   - Payment record is created in Firestore `payments` collection
   - Note revenue stats are updated
   - User gains access to the note

6. **User can now access the note**
   - Download button becomes active
   - Preview becomes available
   - Payment status badge shows "Paid"

---

## Code Architecture

### Files Modified/Created

#### 1. `src/config/razorpayConfig.js`
- Razorpay configuration management
- Environment-based key selection
- Script loading utility

#### 2. `src/services/paymentService.js`
- **Updated** to use Razorpay instead of mock payments
- Key methods:
  - `processPayment()` - Initiates Razorpay checkout
  - `initializeRazorpayPayment()` - Opens Razorpay modal
  - `createPaymentRecord()` - Stores payment in Firestore
  - `hasUserPaid()` - Checks if user has paid for a note

#### 3. `src/components/notes/PaymentModal.jsx`
- **Updated** to remove mock card form
- Shows payment methods info
- Integrated with real Razorpay
- Handles success/failure states

#### 4. `src/components/notes/NoteCard.jsx`
- Already had payment integration
- Shows "Paid" badge for purchased notes
- Controls access to preview/download

#### 5. `src/components/admin/PaymentAnalytics.jsx`
- **New** admin dashboard component
- Shows total revenue and transaction stats
- Per-note revenue breakdown
- List of purchasers per note
- Recent payments table

---

## Testing

### Test Mode (Development)

1. Use test API keys in `.env.local`
2. Run the development server:
```bash
npm run dev
```

3. Test payment with Razorpay test cards:
   - **Test Card:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **UPI ID:** success@razorpay (for success)

4. Test scenarios:
   - ✅ Successful payment
   - ❌ Failed payment: Use `fail@razorpay` UPI ID
   - ⏸️ Cancelled payment: Close modal

### Production Testing

1. Complete KYC on Razorpay dashboard
2. Generate live API keys
3. Add to production environment variables
4. Deploy to production
5. Test with small real transactions

---

## Admin Dashboard Usage

### Accessing Payment Analytics

1. Log in as admin user
2. Navigate to Admin Dashboard
3. View the Payment Analytics section

### Features Available

**Overview Cards:**
- Total Revenue (₹)
- Total Transactions
- Average Transaction Value

**Revenue by Note:**
- List of all notes with revenue
- Purchase count per note
- Average price per note
- Click on any note to view purchasers

**Purchasers List:**
- Student name and email
- Amount paid
- Payment date
- Transaction ID

**Recent Payments:**
- Last 10 payments across all notes
- Payment status
- Transaction details

---

## Security Best Practices

### ✅ Implemented
1. **Frontend Security:**
   - Only Key ID is exposed (safe)
   - No Key Secret in frontend code
   - Environment variables for keys

2. **Firestore Security:**
   - Rules restrict payment record access
   - Only paid users can access paid notes
   - Admins can view all records

3. **Payment Verification:**
   - Payment records stored with transaction ID
   - Status tracked (completed/pending/failed)

### ⚠️ Recommended (For Production)

1. **Backend Payment Verification:**
   ```javascript
   // Create orders on backend
   POST /api/payments/create-order
   
   // Verify payment signature on backend
   POST /api/payments/verify
   ```

2. **Webhook Setup:**
   - Set up Razorpay webhooks
   - Verify payment status on backend
   - Update Firestore from backend

3. **Order Creation:**
   - Currently done in frontend (demo purposes)
   - Should be done on backend in production
   - Prevents amount manipulation

---

## Production Deployment Checklist

- [ ] Complete Razorpay KYC verification
- [ ] Generate live API keys
- [ ] Add live keys to production environment
- [ ] Set up backend for order creation (recommended)
- [ ] Set up payment verification webhook
- [ ] Test with small real transactions
- [ ] Monitor payment logs in Razorpay dashboard
- [ ] Set up error alerting
- [ ] Enable email notifications for successful payments
- [ ] Review and update refund policy

---

## Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay Key ID is set in `.env.local`
- Check browser console for errors
- Ensure internet connection is active

### Script Loading Failure
- Check browser console
- Verify Razorpay CDN is accessible
- Try clearing browser cache

### Payment Success But No Access
- Check Firestore console for payment record
- Verify payment status is "completed"
- Check browser console for errors
- Refresh the page

### Admin Dashboard Not Showing Data
- Ensure logged in as admin user
- Check Firestore rules allow admin access
- Verify payments collection has data

---

## API Reference

### Payment Service Methods

```javascript
// Check if user has paid for a note
await paymentService.hasUserPaid(userId, noteId);

// Process payment (opens Razorpay)
await paymentService.processPayment({
  userId: 'user123',
  noteId: 'note456',
  amount: 99,
  currency: 'INR',
  noteName: 'Physics Notes',
  userName: 'John Doe',
  userEmail: 'john@example.com'
});

// Get user's payment history
await paymentService.getUserPaymentHistory(userId);

// Get total revenue (admin only)
await paymentService.getTotalRevenue();

// Get revenue for specific note (admin only)
await paymentService.getNoteRevenue(noteId);
```

---

## Support & Resources

- **Razorpay Documentation:** https://razorpay.com/docs/
- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Razorpay Support:** https://razorpay.com/support/

---

## License & Compliance

- Ensure compliance with local payment regulations
- Display proper terms and conditions
- Implement refund policy
- Secure user payment data
- Follow PCI DSS guidelines

---

## Changelog

### v1.0.0 (Current)
- ✅ Razorpay integration complete
- ✅ Multiple payment methods support
- ✅ Admin analytics dashboard
- ✅ Firestore security rules
- ✅ Payment verification
- ✅ Note access control

### Future Enhancements
- [ ] Backend order creation API
- [ ] Webhook integration
- [ ] Payment analytics charts
- [ ] Export payment reports
- [ ] Automated invoicing
- [ ] Refund management UI

---

**Last Updated:** 2025-10-24
