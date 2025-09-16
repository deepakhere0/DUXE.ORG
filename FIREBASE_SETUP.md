# 🔥 Firebase Services Setup Guide

This guide will help you set up all the required Firebase services for your DUXE Student Platform.

## 🚀 Quick Start

Your Firebase project is already created: **duxe-5c071**

### ✅ Already Configured:
- ✅ Firebase project created
- ✅ Web app configured 
- ✅ API keys obtained
- ✅ Environment variables set

### 🔧 Still Need to Setup:

## 1. 📊 Enable Cloud Firestore

**CRITICAL**: You must enable the Firestore API first!

### Option A: Direct Link (Recommended)
Click this link and enable the API:
👉 **https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=duxe-5c071**

### Option B: Through Firebase Console
1. Go to https://console.firebase.google.com/project/duxe-5c071/firestore
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select location: **us-central1** (or closest to you)
5. Click **"Create"**

---

## 2. 🔐 Enable Authentication

1. Go to https://console.firebase.google.com/project/duxe-5c071/authentication
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. Click **"Save"**

### 📧 Authorized Domains (for deployment)
In the Authentication settings, add your deployment domain:
- `localhost` (already added)
- Your production domain (e.g., `yourapp.vercel.app`)

---

## 3. 📁 Enable Cloud Storage

1. Go to https://console.firebase.google.com/project/duxe-5c071/storage
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select same location as Firestore
5. Click **"Create"**

---

## 4. ⚙️ Optional: Cloud Functions

For server-side AI processing (advanced):
1. Go to https://console.firebase.google.com/project/duxe-5c071/functions
2. Click **"Get started"**
3. Follow the setup instructions

---

## 📋 Verification Checklist

After completing the setup, verify each service:

### Firestore Database
- [ ] API enabled ✓
- [ ] Database created ✓
- [ ] Test mode enabled ✓
- [ ] Location selected ✓

### Authentication
- [ ] Service enabled ✓
- [ ] Email/Password provider enabled ✓
- [ ] Authorized domains configured ✓

### Cloud Storage
- [ ] Service enabled ✓
- [ ] Bucket created ✓
- [ ] Test mode enabled ✓

---

## 🧪 Test the Setup

Once you've enabled all services, run the database initialization:

```bash
# Test connection
node scripts/test-firebase.js

# Initialize database with sample data
npm run db:init

# Or use the detailed script
node scripts/init-firestore.js
```

## 🚨 Troubleshooting

### "PERMISSION_DENIED" Error
- **Cause**: Firestore API not enabled
- **Solution**: Enable the API using the link above
- **Wait time**: 2-5 minutes after enabling

### "Database not found" Error  
- **Cause**: Firestore database not created
- **Solution**: Create database through Firebase Console
- **Mode**: Start in test mode initially

### "Invalid API key" Error
- **Cause**: Wrong API key or project ID
- **Solution**: Double-check your `.env.local` file

---

## 🔒 Security (Next Steps)

After testing, secure your Firebase:

### Firestore Rules
Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### Storage Rules
Configure storage permissions for file uploads.

### Authentication Rules
Set up user roles and permissions.

---

## 🔗 Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/duxe-5c071
- **Firestore Console**: https://console.firebase.google.com/project/duxe-5c071/firestore
- **Authentication**: https://console.firebase.google.com/project/duxe-5c071/authentication  
- **Storage**: https://console.firebase.google.com/project/duxe-5c071/storage
- **Enable Firestore API**: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=duxe-5c071

---

## ✅ Ready for Production

Once all services are set up and tested:
1. ✅ Database populated with sample data
2. ✅ Authentication working
3. ✅ Security rules deployed
4. ✅ Application tested locally
5. ✅ Ready for deployment!

---

**Need Help?** 
- Check the Firebase Console for detailed error messages
- Review the Firebase documentation: https://firebase.google.com/docs
- Ensure all APIs are enabled and billing is set up if required
