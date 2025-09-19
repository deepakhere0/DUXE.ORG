# 🔥 Complete Google Sign-In Setup Guide for Firebase

## 📋 Prerequisites
- Google account
- Firebase project (existing: `duxe-5c071`)
- Your React app running locally

---

## 🚀 Step-by-Step Setup Process

### **Step 1: Firebase Console Setup**

#### 1.1 Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your existing project: **`duxe-5c071`**

#### 1.2 Enable Google Authentication
1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"** (if first time) or go to **"Sign-in method"** tab
3. Find **"Google"** in the providers list
4. Click **"Google"** to configure it
5. Toggle **"Enable"** to ON
6. Set **Project support email** (your email address)
7. Click **"Save"**

---

### **Step 2: Google Cloud Console Setup**

#### 2.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the same Google account
3. Select your project: **`duxe-5c071`**

#### 2.2 Enable Google+ API (if needed)
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

#### 2.3 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in required fields:
   - **App name**: `DUXE Student Platform`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add **Authorized domains**:
   - `localhost` (for development)
   - Your production domain (if any)
5. Click **"Save and Continue"**

#### 2.4 Add Scopes (Optional)
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
3. Click **"Update"** → **"Save and Continue"**

#### 2.5 Add Test Users (Development)
1. Click **"Add Users"**
2. Add your email address
3. Click **"Save and Continue"**

---

### **Step 3: OAuth Credentials Setup**

#### 3.1 Create OAuth 2.0 Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Name it: `DUXE Web Client`

#### 3.2 Configure Authorized Origins
Add these **Authorized JavaScript origins**:
```
http://localhost:3000
http://localhost:5000
http://localhost:5173
https://your-domain.com (if you have one)
```

#### 3.3 Configure Authorized Redirect URIs
Add these **Authorized redirect URIs**:
```
http://localhost:3000/__/auth/handler
http://localhost:5000/__/auth/handler
http://localhost:5173/__/auth/handler
https://your-domain.com/__/auth/handler
```

#### 3.4 Save and Get Credentials
1. Click **"Create"**
2. **COPY** the **Client ID** - you'll need this
3. Click **"OK"**

---

### **Step 4: Update Firebase Configuration**

#### 4.1 Get Web App Config
1. Go back to **Firebase Console**
2. Click **"Project Settings"** (gear icon)
3. Scroll to **"Your apps"** section
4. Click on your web app or create one if none exists
5. Copy the **Firebase config object**

#### 4.2 Update .env.local File
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=duxe-5c071.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duxe-5c071
VITE_FIREBASE_STORAGE_BUCKET=duxe-5c071.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini API Configuration
VITE_GEMINI_API_KEY=AIzaSyAgrAxI8lSgnGyVnwkPD1iRNQuNaRtyklY
```

---

### **Step 5: Verify Firebase Rules**

#### 5.1 Check Firestore Rules
1. Go to **"Firestore Database"** → **"Rules"**
2. Make sure you have proper rules for user authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read for approved content
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 5.2 Publish Rules
1. Click **"Publish"** to save the rules

---

### **Step 6: Test the Setup**

#### 6.1 Start Your Development Server
```bash
npm run dev
```

#### 6.2 Test Google Sign-In
1. Open browser and go to: `http://localhost:5000/signup`
2. Click **"Continue with Google"** button
3. Should open Google authentication popup
4. Complete the sign-in process
5. Should redirect to dashboard

---

### **Step 7: Troubleshooting Common Issues**

#### Issue 1: "This app isn't verified"
- **Solution**: Click **"Advanced"** → **"Go to DUXE Student Platform (unsafe)"**
- **For production**: Submit app for verification in Google Cloud Console

#### Issue 2: "Error 400: redirect_uri_mismatch"
- **Solution**: Double-check redirect URIs in Google Cloud Console
- **Make sure**: URLs match exactly (including port numbers)

#### Issue 3: "Access blocked"
- **Solution**: Add your email to test users in OAuth consent screen

#### Issue 4: Firebase not configured
- **Solution**: Check all environment variables are set correctly
- **Restart**: Development server after changing .env.local

---

### **Step 8: Environment Variables Checklist**

Make sure your `.env.local` contains all these variables:

```bash
✅ VITE_FIREBASE_API_KEY=
✅ VITE_FIREBASE_AUTH_DOMAIN=
✅ VITE_FIREBASE_PROJECT_ID=
✅ VITE_FIREBASE_STORAGE_BUCKET=
✅ VITE_FIREBASE_MESSAGING_SENDER_ID=
✅ VITE_FIREBASE_APP_ID=
✅ VITE_FIREBASE_MEASUREMENT_ID=
✅ VITE_GEMINI_API_KEY=
```

---

## 🎯 Quick Setup Commands

### Start Fresh Setup:
```bash
# 1. Kill any running processes
taskkill /f /im node.exe
taskkill /f /im npm.exe

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 🔍 Debug Commands

### Check Firebase Configuration:
```bash
# Check environment variables
node -e "console.log(process.env)" | findstr VITE_FIREBASE

# Test Firebase connection
npm run dev
# Then check browser console for Firebase initialization logs
```

---

## 📞 Support

### If You Need Help:
1. **Firebase Console**: Check Authentication → Users (should show signed-in users)
2. **Browser Console**: Look for error messages
3. **Network Tab**: Check for failed API requests
4. **Firebase Debug**: Enable debug mode in browser console

---

## 🎉 Success Indicators

### You'll know it's working when:
- ✅ Google popup opens without errors
- ✅ User can complete authentication
- ✅ Redirects to dashboard after sign-in
- ✅ User appears in Firebase Authentication → Users
- ✅ User profile created in Firestore
- ✅ No console errors

---

**Next Step**: Follow this guide step-by-step and let me know at which step you encounter any issues!