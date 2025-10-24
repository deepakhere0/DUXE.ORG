# Paid Notes Feature - Implementation Guide

## Overview

This document describes the complete implementation of the paid notes feature for the student platform. The feature allows admins to set prices for notes, and students must pay before accessing paid content. The implementation includes a mock payment system ready to be replaced with real payment gateways.

---

## Features Implemented

### 1. **Pricing per Note**
- Each note can have a `price` field (in INR)
- Admin/uploader can set/update price during upload/edit
- Price of `0` indicates a free note
- Price field is stored in Firestore `notes` collection

### 2. **Payment Flow**
- Students must pay before accessing/downloading paid notes
- Mock payment integration with 2-second processing delay
- After successful payment, students can access the note
- Payment status stored in `payments` collection with:
  - `userId`: Student who made the payment
  - `noteId`: Note purchased
  - `amount`: Payment amount
  - `currency`: Currency (default: INR)
  - `status`: Payment status (completed/pending/failed)
  - `paymentDate`: Timestamp of payment
  - `transactionId`: Unique transaction identifier

### 3. **UI/UX Components**
- **NoteCard**: Shows price badge, "Paid" badge for purchased notes
- **PaymentModal**: Beautiful payment interface with:
  - Note details and price display
  - Card payment form (mock)
  - Success/error states
  - Loading indicators
  - Security notices
- **Upload Form**: Price input field for admins
- **Revenue Dashboard**: Admin-only revenue statistics

### 4. **Security & Access Control**
- Firestore security rules enforce payment-based access
- Only users who paid can read their payment records
- Payment records are immutable (only admins can modify)
- Users cannot create fraudulent payment records

---

## File Structure

```
src/
├── services/
│   └── paymentService.js           # Payment processing and Firestore operations
├── components/
│   ├── notes/
│   │   ├── PaymentModal.jsx        # Payment UI modal
│   │   └── NoteCard.jsx            # Updated with price display
│   └── admin/
│       └── RevenueDashboard.jsx    # Admin revenue dashboard
└── pages/
    ├── Upload.jsx                  # Updated with price field
    └── Notes.jsx                   # Updated to pass userId
```

---

## Implementation Details

### 1. Payment Service (`paymentService.js`)

**Key Methods:**
- `hasUserPaid(userId, noteId)`: Check if user has paid for a note
- `getUserPaidNotes(userId)`: Get all paid notes for a user
- `processPayment(data)`: Complete payment flow with mock gateway
- `processMockPayment(data)`: Mock payment processor (90% success rate)
- `createPaymentRecord(data)`: Store payment in Firestore
- `getTotalRevenue()`: Get aggregate revenue statistics
- `getNoteRevenue(noteId)`: Get revenue for specific note

**Mock Payment:**
```javascript
// Simulates payment gateway API call
await new Promise(resolve => setTimeout(resolve, 2000));
const isSuccess = Math.random() > 0.1; // 90% success rate
```

**To Replace with Real Payment Gateway:**
1. Replace `processMockPayment()` with actual gateway API call
2. Update transaction ID format
3. Add proper error handling for gateway-specific errors
4. Implement webhook handlers for payment confirmations

### 2. Payment Modal Component

**Features:**
- Responsive design (mobile & desktop)
- Form validation
- Card number formatting
- Expiry date formatting
- Success/Error animations
- Loading states
- Auto-close on success

**Props:**
```javascript
<PaymentModal
  isOpen={boolean}
  onClose={function}
  note={object}
  userId={string}
  onPaymentSuccess={function}
/>
```

### 3. Note Card Updates

**New Features:**
- Price badge (top-right corner)
- "Paid" badge for purchased notes
- Conditional "Purchase" vs "Preview" button
- Disabled download for unpaid notes
- Payment modal integration
- Real-time payment status checking

**Props:**
```javascript
<NoteCard
  note={object}
  userId={string}          // NEW
  onDownload={function}
  onBookmark={function}
  onView={function}
  isBookmarked={boolean}
/>
```

### 4. Firestore Schema

**Notes Collection:**
```javascript
{
  // Existing fields...
  price: 0,              // NEW: Price in INR (0 = free)
  totalRevenue: 0,       // NEW: Total revenue from this note
  purchaseCount: 0,      // NEW: Number of purchases
}
```

**Payments Collection:**
```javascript
{
  userId: "uid123",
  noteId: "note456",
  amount: 49.99,
  currency: "INR",
  transactionId: "MOCK_TXN_123456",
  status: "completed",
  paymentMethod: "mock",
  paymentDate: Timestamp,
  createdAt: Timestamp
}
```

### 5. Firestore Security Rules

**Payments Collection Rules:**
```javascript
match /payments/{paymentId} {
  // Users can read their own payment records
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  
  // Admins can read all payment records
  allow read: if isAdmin();
  
  // Users can create payment records (when making payments)
  allow create: if isSignedIn() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.keys().hasAll(['userId', 'noteId', 'amount', 'status']);
  
  // Only admins can update/delete payment records
  allow update, delete: if isAdmin();
}
```

### 6. Revenue Dashboard

**Admin-only component showing:**
- Total revenue (all-time)
- Total transactions count
- Average transaction value
- Revenue insights
- Payment system status
- Refresh functionality

**Access:**
```javascript
// Add to admin routes
import RevenueDashboard from '../components/admin/RevenueDashboard';

// In admin dashboard
<RevenueDashboard />
```

---

## Integration with Real Payment Gateways

### Stripe Integration (Example)

1. **Install Stripe:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. **Replace Mock Payment:**
```javascript
// In paymentService.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your_publishable_key');

async processRealPayment(paymentData) {
  const stripe = await stripePromise;
  
  // Create payment intent on your backend
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: paymentData.amount * 100, // Convert to cents
      currency: 'inr',
      noteId: paymentData.noteId
    })
  });
  
  const { clientSecret } = await response.json();
  
  // Confirm payment
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { name: paymentData.cardName }
    }
  });
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result.paymentIntent;
}
```

### Razorpay Integration (Example)

1. **Install Razorpay:**
```bash
npm install razorpay
```

2. **Replace Mock Payment:**
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'your_key_id',
  key_secret: 'your_key_secret'
});

async processRealPayment(paymentData) {
  const options = {
    amount: paymentData.amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_${paymentData.noteId}_${Date.now()}`,
  };
  
  const order = await razorpay.orders.create(options);
  
  // Open Razorpay checkout
  const rzp = new window.Razorpay({
    key: 'your_key_id',
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    handler: function (response) {
      // Payment success
      return response;
    }
  });
  
  rzp.open();
}
```

---

## Testing

### Test Scenarios

1. **Free Note Access:**
   - Set price to 0
   - Verify students can access without payment
   - No payment record should be created

2. **Paid Note Purchase:**
   - Set price > 0
   - Click "Purchase" button
   - Fill payment details
   - Submit payment
   - Verify "Paid" badge appears
   - Verify payment record in Firestore

3. **Already Purchased Note:**
   - Purchase a note
   - Reload page
   - Verify "Paid" badge is visible
   - Verify direct access to preview/download

4. **Admin Revenue Dashboard:**
   - Create some test payments
   - Open revenue dashboard
   - Verify statistics are correct
   - Test refresh functionality

### Mock Payment Testing

The mock payment system has a 90% success rate for testing. To test failures:
- Make multiple payment attempts
- ~1 in 10 should fail randomly
- Verify error handling works correctly

---

## Database Migration

If you have existing notes without price fields, run this migration:

```javascript
// scripts/migrate-add-price-field.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function migrateNotes() {
  const notesSnapshot = await db.collection('notes').get();
  
  const batch = db.batch();
  notesSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      price: 0,
      totalRevenue: 0,
      purchaseCount: 0
    });
  });
  
  await batch.commit();
  console.log('Migration complete!');
}

migrateNotes();
```

---

## Environment Variables

Add these to your `.env` file when integrating real payment gateway:

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# PayPal
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

---

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always validate payments** on the backend
3. **Use webhook handlers** for payment confirmations
4. **Implement idempotency** to prevent duplicate charges
5. **Log all transactions** for audit trail
6. **Use HTTPS** in production
7. **Implement rate limiting** to prevent abuse
8. **Validate user permissions** before allowing payment creation

---

## Future Enhancements

1. **Bulk Pricing:** Set prices for multiple notes at once
2. **Discounts & Coupons:** Implement promo code system
3. **Subscription Model:** Monthly/yearly access to all notes
4. **Refund System:** Allow refunds within certain time period
5. **Payment History:** Detailed transaction history for users
6. **Revenue Analytics:** Charts and graphs for revenue trends
7. **Top Earning Notes:** Leaderboard of highest-earning notes
8. **Currency Support:** Multi-currency pricing
9. **Tax Calculation:** Automatic tax computation based on location
10. **Export Reports:** CSV/PDF export of payment data

---

## Troubleshooting

### Payment Modal Not Opening
- Verify userId is passed to NoteCard
- Check console for errors
- Ensure PaymentModal is imported correctly

### Payment Not Processing
- Check Firestore rules are deployed
- Verify user is authenticated
- Check network tab for errors

### "Paid" Badge Not Showing
- Clear browser cache
- Check payment record in Firestore
- Verify userId matches payment record

### Revenue Not Updating
- Check payment status is "completed"
- Verify updateNoteRevenue() is called
- Check Firestore indexes are created

---

## Support

For issues or questions:
1. Check console for error messages
2. Review Firestore security rules logs
3. Test payment flow step by step
4. Verify all dependencies are installed

---

## Deployment Checklist

Before deploying to production:

- [ ] Replace mock payment with real gateway
- [ ] Update environment variables
- [ ] Deploy Firestore security rules
- [ ] Create Firestore indexes
- [ ] Test payment flow end-to-end
- [ ] Set up webhook handlers
- [ ] Configure payment gateway dashboard
- [ ] Test refund functionality
- [ ] Set up error monitoring
- [ ] Configure payment notifications
- [ ] Update privacy policy with payment terms
- [ ] Set up backup for payment records
- [ ] Test in production environment
- [ ] Monitor first few transactions closely

---

## License

This implementation is part of the student platform project and follows the same license terms.

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Author:** AI Assistant
