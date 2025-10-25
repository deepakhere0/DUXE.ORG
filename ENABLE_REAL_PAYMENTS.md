# 🚀 Enable Real Razorpay Payments - Complete Guide

## Overview
This guide will help you replace the mock payment system with **real Razorpay payments** that transfer actual money to your bank account.

---

## 📋 Prerequisites
- ✅ Backend code updated (completed)
- ✅ Payment routes created (completed)
- ✅ Frontend integration ready (completed)
- ⚠️ Need Razorpay account and API keys
- ⚠️ Need to add bank account for settlements

---

## 🔧 Step-by-Step Setup

### Step 1: Create Razorpay Account

1. **Sign up at Razorpay**
   - Go to: https://razorpay.com
   - Click "Sign Up" or "Get Started"
   - Choose account type: **Individual** (for personal bank account)
   - Enter your email and phone number
   - Complete registration

2. **Verify your email and phone**
   - Check your email for verification link
   - Enter OTP sent to your phone

---

### Step 2: Get API Keys (Test Mode)

1. **Login to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com

2. **Generate Test Keys** (for development/testing)
   - Navigate to: **Settings** > **API Keys**
   - Click **"Generate Test Key"**
   - You'll get two keys:
     - `Key ID` (starts with `rzp_test_`)
     - `Key Secret` (keep this secret!)

3. **Copy these keys** - you'll need them in the next step

---

### Step 3: Configure Environment Variables

#### Backend Configuration (.env file)

1. **Create backend/.env file**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Add Razorpay credentials to backend/.env**
   ```env
   # Backend Environment Variables
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Razorpay (Backend - with Key Secret)
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   
   # OpenAI (if using AI features)
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx
   ```

#### Frontend Configuration (.env.local file)

1. **Create/Update .env.local file** (in project root)
   ```bash
   # From project root
   copy .env.local.example .env.local
   ```

2. **Add Razorpay Key ID to .env.local**
   ```env
   # Frontend Environment Variables
   
   # Firebase Config (your existing config)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   # ... other Firebase config
   
   # Razorpay (Frontend - Key ID only)
   VITE_RAZORPAY_TEST_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
   
   # Backend API URL
   VITE_API_BASE_URL=http://localhost:5000/api
   
   # Company Logo (optional)
   VITE_COMPANY_LOGO_URL=https://yourdomain.com/logo.png
   ```

**⚠️ SECURITY IMPORTANT:**
- Frontend (.env.local): Only add `Key ID` (public key)
- Backend (.env): Add both `Key ID` and `Key Secret`
- NEVER add `Key Secret` to frontend!

---

### Step 4: Install Razorpay Package

1. **Install razorpay package in backend**
   ```bash
   cd backend
   npm install razorpay
   ```

2. **Verify installation**
   ```bash
   npm list razorpay
   ```

---

### Step 5: Start Your Servers

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # or
   node server.js
   ```
   
   You should see:
   ```
   🚀 Backend server running on http://localhost:5000
   💳 Razorpay Integration: Configured ✅
   ```

2. **Start Frontend** (in new terminal)
   ```bash
   # From project root
   npm run dev
   ```

---

### Step 6: Test with Test Payment

1. **Go to your platform** (http://localhost:5173)

2. **Navigate to a paid note** and click "Buy"

3. **Razorpay checkout will open** (real Razorpay modal, not mock)

4. **Use Razorpay test cards:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits (e.g., `123`)
   - Expiry: Any future date (e.g., `12/25`)
   - Name: Any name

5. **Complete payment** - this will work but won't charge real money (test mode)

---

### Step 7: Add Your Bank Account (for Real Money)

**⚠️ Required to receive real payments**

1. **Go to Razorpay Dashboard**
   - Navigate to: **Settings** > **Bank Accounts**

2. **Click "Add Bank Account"**

3. **Enter your individual bank account details:**
   - Account Holder Name (your name)
   - Account Number
   - IFSC Code
   - Account Type (Savings/Current)
   - Bank Name (auto-filled from IFSC)

4. **Verify your bank account:**
   - Razorpay will send ₹1 to your account
   - Note the reference number/UTR
   - Enter it in dashboard to verify
   - Verification takes 1-2 business days

---

### Step 8: Complete KYC (for Live Mode)

**Required to activate live payments and receive money**

1. **Go to Dashboard** > **Settings** > **Business Settings**

2. **Upload Documents:**
   - **PAN Card** (mandatory)
   - **Address Proof** (Aadhaar/Passport/Driving License)
   - **Business Proof** (optional for individuals)
   - **Photo** (selfie)

3. **Submit for verification**
   - Approval takes 24-48 hours
   - Razorpay team will review
   - You'll receive email notification

---

### Step 9: Enable Live Mode (Production)

**⚠️ Only after KYC approval**

1. **Generate Live Keys**
   - Go to: **Settings** > **API Keys**
   - Click **"Generate Live Key"**
   - Copy `Key ID` (starts with `rzp_live_`)
   - Copy `Key Secret` (secret!)

2. **Update Environment Variables for Production**

   Backend (.env):
   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
   ```

   Frontend (.env.local or production env):
   ```env
   VITE_RAZORPAY_LIVE_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

3. **Deploy to production**
   - Deploy backend with live keys
   - Deploy frontend with live Key ID
   - Test with small real payment first!

---

### Step 10: Configure Webhooks (Optional but Recommended)

**Webhooks notify your backend when payments happen**

1. **Go to Dashboard** > **Settings** > **Webhooks**

2. **Click "Add New Webhook"**

3. **Configure webhook:**
   - URL: `https://your-backend-domain.com/api/payments/webhook`
   - Active Events:
     - ✅ `payment.captured` (payment successful)
     - ✅ `payment.failed` (payment failed)
     - ✅ `payment.authorized` (optional)

4. **Copy Webhook Secret**
   - Add to backend `.env`:
     ```env
     RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
     ```

5. **Restart backend server**

---

## 💰 How Money Flows

### Test Mode (Development)
- ✅ Full Razorpay checkout UI
- ✅ Test cards work
- ❌ No real money charged
- ❌ No bank settlements

### Live Mode (Production)
1. User clicks "Buy" on your platform
2. Frontend calls: `POST /api/payments/create-order`
3. Backend creates Razorpay order
4. Razorpay checkout opens
5. User enters card/UPI/netbanking details
6. **Real payment processed**
7. **Money deducted from user's account**
8. **Money credited to your Razorpay balance**
9. **Razorpay transfers to your bank account** (T+2 days)

---

## 💳 Settlement Details

### Settlement Schedule
- **Default:** T+2 days (2 working days after payment)
- **Example:** Payment on Monday → Settlement on Wednesday
- **Weekends excluded** from calculation

### Settlement Charges
- **Transaction Fee:** 2% + GST
- **Example:** ₹100 payment = ₹98 to your account (₹2 fee)
- No setup fees, no annual fees
- Only pay on successful transactions

### Track Settlements
- Go to: **Dashboard** > **Settlements**
- View pending/completed settlements
- Download settlement reports

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] `Key Secret` is ONLY in backend .env
- [ ] Frontend only has `Key ID` (public key)
- [ ] `.env` files are in `.gitignore`
- [ ] Backend has payment signature verification
- [ ] Webhooks configured for payment notifications
- [ ] SSL/HTTPS enabled on production
- [ ] KYC completed and approved
- [ ] Bank account verified
- [ ] Test payments working in test mode
- [ ] Small real payment tested in live mode

---

## 🧪 Testing Checklist

### Test Mode
- [ ] Razorpay modal opens (not mock payment)
- [ ] Test card payment works
- [ ] Payment recorded in Firebase
- [ ] User gets access to note
- [ ] Payment visible in Razorpay dashboard

### Live Mode (after KYC)
- [ ] Make small real payment (₹1-10)
- [ ] Money deducted from user account
- [ ] Payment visible in Razorpay dashboard
- [ ] User gets access immediately
- [ ] Settlement scheduled (check dashboard)
- [ ] Money received in bank after T+2 days

---

## 🆘 Troubleshooting

### Issue: "Razorpay not configured" message
**Solution:** 
- Check `.env.local` has `VITE_RAZORPAY_TEST_KEY_ID`
- Restart frontend dev server after adding env vars

### Issue: "Failed to create order"
**Solution:**
- Check backend is running
- Check `VITE_API_BASE_URL` is correct
- Check backend has Razorpay keys in `.env`
- Check `razorpay` npm package is installed

### Issue: "Invalid key_id"
**Solution:**
- Verify Key ID is correct (starts with `rzp_test_` or `rzp_live_`)
- No extra spaces in .env file
- Key ID matches in frontend and backend

### Issue: Payment modal doesn't open
**Solution:**
- Check browser console for errors
- Check Razorpay script loads: https://checkout.razorpay.com/v1/checkout.js
- Check for popup blockers

### Issue: Settlement not received
**Solution:**
- Check if T+2 working days passed
- Verify bank account is verified in dashboard
- Check settlements section in Razorpay dashboard
- Contact Razorpay support if delayed

---

## 📞 Support

### Razorpay Support
- **Email:** support@razorpay.com
- **Phone:** +91-80-4681-9100
- **Dashboard:** Help button (bottom right)
- **Docs:** https://razorpay.com/docs

### Your Platform Support
- Check console logs (browser & backend)
- Check `.env` configuration
- Verify all steps completed above

---

## ✅ Quick Start Commands

```bash
# Install backend dependencies
cd backend
npm install razorpay

# Create backend .env file
copy .env.example .env
# Then add your Razorpay keys to .env

# Start backend
npm start

# In new terminal - start frontend
cd ..
npm run dev

# Visit: http://localhost:5173
# Test payment with test card: 4111 1111 1111 1111
```

---

## 🎯 Next Steps

1. ✅ **Complete Steps 1-6** to enable test payments
2. ⏳ **Complete Steps 7-8** to enable real payments (KYC + bank account)
3. 🚀 **Complete Step 9** to deploy to production with live keys
4. 🔔 **Complete Step 10** for webhooks (optional but recommended)

---

## 💡 Important Notes

- **Test mode is FREE** - use it for development
- **Live mode requires KYC** - start KYC process early
- **Bank verification takes 1-2 days** - don't wait until last minute
- **Settlements are T+2** - plan your cash flow accordingly
- **Razorpay handles everything** - you just integrate the API

---

**Your platform is now ready for real payments! 🎉**

Once you complete these steps, users can make real payments and money will flow to your bank account automatically.
