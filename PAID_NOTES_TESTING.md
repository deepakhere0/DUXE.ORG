# Paid Notes Feature - Testing Guide

## Overview
This guide explains how to test the paid notes feature end-to-end to ensure everything is working correctly.

## Features Implemented

### 1. **Price Display in UI**
- ✅ NoteCard shows price badge (₹X or "Paid" badge)
- ✅ Price visible in Notes listing page
- ✅ Price field in Upload form
- ✅ Price display in Admin Review dashboard
- ✅ Revenue statistics in Admin Dashboard

### 2. **Payment Flow**
- ✅ Payment modal opens for paid notes
- ✅ Mock payment processing (2-second delay, 90% success rate)
- ✅ Payment records created in Firestore `payments` collection
- ✅ Note revenue tracking (totalRevenue, purchaseCount)
- ✅ Immediate UI updates after successful payment

### 3. **Access Control**
- ✅ Free notes: accessible to everyone
- ✅ Paid notes: require payment before download/preview
- ✅ "Purchase ₹X" button for unpaid notes
- ✅ "Preview" and "Download" buttons for paid notes
- ✅ Payment verification via paymentService
- ✅ Firestore security rules enforce payment requirement

### 4. **Admin Features**
- ✅ Price editing modal for admins
- ✅ Revenue statistics dashboard
- ✅ Sales count per note
- ✅ Total revenue tracking
- ✅ Average transaction value

## Testing Steps

### Test 1: Upload a Paid Note

1. **Login as Admin**
2. Navigate to `/upload`
3. Upload a test PDF file
4. Fill in note details:
   - Title: "Test Paid Note"
   - Course Code: "CS101"
   - Subject: "Computer Science"
   - Semester: 1
   - **Price: 50** (or any amount > 0)
5. Submit for review
6. **Expected Result**: Note created with price field set

### Test 2: Approve Note (Admin)

1. Navigate to `/admin/review`
2. Find the pending note
3. Verify price is displayed: "Price: ₹50"
4. Click "Approve" button
5. **Expected Result**: Note becomes available in notes listing

### Test 3: View Note as Regular User

1. **Logout and login as a regular user** (or use incognito)
2. Navigate to `/notes`
3. Find the paid note
4. **Expected Results**:
   - Orange price badge shows "₹50" in top-right corner
   - "Purchase ₹50" button visible
   - Download button is disabled (gray)
   - Preview button shows "Purchase" action

### Test 4: Purchase Note

1. Click "Purchase ₹50" button on the note card
2. **Expected Result**: Payment modal opens
3. Verify modal displays:
   - Note title and details
   - Price: ₹50
   - Payment form fields (card number, name, expiry, CVV)
4. Fill in mock payment details:
   - Card: 1234 5678 9012 3456
   - Name: Test User
   - Expiry: 12/25
   - CVV: 123
5. Click "Pay ₹50" button
6. **Expected Results**:
   - "Processing..." state for 2 seconds
   - Success message appears
   - Modal closes automatically
   - Badge changes from "₹50" to "Paid" (green)
   - "Download" button becomes enabled
   - "Preview" button now shows full preview

### Test 5: Access Note After Payment

1. After successful payment, click "Preview" button
2. **Expected Result**: Note opens in full-screen preview
3. Click "Download" button
4. **Expected Result**: PDF downloads successfully

### Test 6: Verify Payment Record

**As Admin:**
1. Open browser console
2. Check Firestore database
3. Navigate to `payments` collection
4. **Expected**: Find payment record with:
   - userId: (your user ID)
   - noteId: (note ID)
   - amount: 50
   - status: "completed"
   - transactionId: MOCK_TXN_...
   - paymentDate: timestamp

### Test 7: Verify Revenue Updates

**As Admin:**
1. Navigate to `/admin/dashboard`
2. **Expected Results**:
   - "Total Revenue" card shows ₹50
   - "Transactions" card shows 1
   - Revenue Overview card displays:
     - Total Earned: ₹50
     - Total Sales: 1
     - Avg Transaction: ₹50

### Test 8: Edit Note Price

**As Admin:**
1. Navigate to `/admin/review`
2. Find the paid note
3. Click "Price" button (orange)
4. **Expected**: Price edit modal opens
5. Change price to 75
6. Click "Update Price"
7. **Expected Results**:
   - Success toast appears
   - Note price updates to ₹75
   - Previous sales are not affected
   - Warning shows if note has existing purchases

### Test 9: Free Note Access

1. Upload a note with price = 0
2. Approve it
3. View as regular user
4. **Expected Results**:
   - No price badge displayed
   - "Preview" button works immediately
   - "Download" button works immediately
   - No payment modal appears

### Test 10: Payment Persistence

1. After purchasing a note, logout
2. Login again with the same account
3. Navigate to the note
4. **Expected Results**:
   - Badge still shows "Paid" (green)
   - Can access preview immediately
   - Can download immediately
   - No payment prompt

## Edge Cases to Test

### Edge Case 1: Payment Failure
- Fill payment form and submit
- If payment fails (10% chance in mock), error message should appear
- Click "Try Again" to retry
- Payment record should NOT be created for failed attempts

### Edge Case 2: Concurrent Payments
- Open two browser tabs
- Purchase same note in both tabs
- **Expected**: Second attempt should show "already purchased" error

### Edge Case 3: Owner Access
- Upload a paid note
- As the uploader, you should see the note immediately
- No payment should be required for your own notes

### Edge Case 4: Admin Access
- Admins can access all notes (free or paid)
- No payment required for admins

## Firestore Security Rules Verification

### Test Security Rule 1: Paid Note Access
```
1. Regular user without payment
2. Try to directly access note URL in storage
3. Expected: Should be blocked by security rules
```

### Test Security Rule 2: Payment Record Access
```
1. User A purchases a note
2. User B tries to read User A's payment record
3. Expected: Access denied (users can only see their own payments)
```

### Test Security Rule 3: Admin Access
```
1. Admin logs in
2. Can view all payment records
3. Can view revenue statistics
4. Expected: Full access granted
```

## Common Issues and Solutions

### Issue 1: Price Not Showing
**Solution**: Ensure note document in Firestore has `price` field

### Issue 2: Payment Modal Not Opening
**Solution**: 
- Check that `userId` is being passed to NoteCard
- Verify PaymentModal import is correct
- Check browser console for errors

### Issue 3: UI Not Updating After Payment
**Solution**:
- Check that `onPaymentSuccess` callback is called
- Verify state updates in NoteCard component
- Refresh the page to confirm payment was recorded

### Issue 4: "Already Purchased" Error When Not Purchased
**Solution**:
- Check Firestore `payments` collection
- Verify query in `hasUserPaid` function
- May need to clear test payment records

## Database Structure

### Notes Collection
```javascript
{
  id: "note123",
  title: "Test Note",
  price: 50,
  totalRevenue: 150,  // Sum of all payments
  purchaseCount: 3,   // Number of purchases
  // ... other fields
}
```

### Payments Collection
```javascript
{
  id: "payment456",
  userId: "user789",
  noteId: "note123",
  amount: 50,
  currency: "INR",
  status: "completed",
  transactionId: "MOCK_TXN_...",
  paymentDate: Timestamp,
  paymentMethod: "mock"
}
```

## Mock Payment Details

For testing, the mock payment system:
- Accepts any card number (formatted as XXXX XXXX XXXX XXXX)
- 90% success rate
- 2-second processing delay
- Creates transaction ID: `MOCK_TXN_{timestamp}_{random}`

## Production Considerations

Before going to production:

1. **Replace Mock Payment System**
   - Integrate real payment gateway (Razorpay, Stripe, PayPal)
   - Update `paymentService.js` `processMockPayment` function
   - Add webhook handlers for payment confirmations

2. **Update Security Rules**
   - Add more granular access controls
   - Implement payment expiration if needed
   - Add refund handling

3. **Add Email Notifications**
   - Send receipt after successful payment
   - Notify on failed payments
   - Send to admin on each sale

4. **Analytics Integration**
   - Track conversion rates
   - Monitor payment success/failure rates
   - Add revenue reporting

5. **Legal Compliance**
   - Add terms of service for paid content
   - Implement refund policy
   - Add tax handling if required

## Support

If issues persist:
1. Check browser console for errors
2. Review Firestore security rules
3. Verify all services are initialized correctly
4. Check that Firebase config is complete in `.env.local`

## Summary

✅ **All Paid Notes Features Implemented:**
- Price display throughout UI
- Payment modal with mock processing
- Payment records in Firestore
- Revenue tracking and analytics
- Admin price editing
- Access control via security rules
- Immediate UI updates after payment
- Persistent payment status

The paid notes system is fully functional and ready for testing!
