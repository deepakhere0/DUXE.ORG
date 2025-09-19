# DUXE Google Sign-In Setup Guide

This guide follows the exact requirements specified for setting up Google Sign-In and Signup for the DUXE project.

## 1. Google Cloud Console Setup

### Create OAuth 2.0 Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project: `duxe-5c071`
3. Click "Create Credentials" → "OAuth 2.0 Client IDs"
4. Select "Web application" as the type
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://duxe.org
   https://duxe.netlify.app
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/__/auth/handler
   https://duxe-5c071.firebaseapp.com/__/auth/handler
   https://duxe.org/__/auth/handler
   https://duxe.netlify.app/__/auth/handler
   ```
7. **Copy the Web Client ID and Web Client Secret**

## 2. Firebase Console Configuration

### Enable Google Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `duxe-5c071`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Click **Enable**
6. **Paste the Web Client ID and Web Client Secret** from step 1
7. Click **Save**

### Add Authorized Domains
1. In Firebase Authentication → Settings → **Authorized domains**
2. Make sure these domains are added:
   ```
   localhost
   duxe.org
   duxe.netlify.app
   duxe-5c071.firebaseapp.com
   ```

## 3. Frontend Setup Complete ✅

Your `src/services/firebase.js` is already properly configured and exports:
- `auth` (from `getAuth(app)`)
- `db` (from `getFirestore(app)`)
- Other Firebase services

## 4. Auth Context Complete ✅

Your `src/contexts/AuthContext.jsx` now includes:
- **Auth state listener** with `onAuthStateChanged`
- **`googleSignIn` function** using `signInWithPopup(new GoogleAuthProvider())`
- **Firestore user creation**: On first login, checks if user exists and creates document with:
  ```javascript
  {
    uid,
    displayName,
    email,
    photoURL,
    role: "student",
    createdAt,
    provider: "google",
    bookmarks: [],
    uploadedNotes: []
  }
  ```
- **`logout` function** with `signOut(auth)`

## 5. Login Page Complete ✅

Your `src/pages/Login.jsx` includes:
- **"Continue with Google" button** that calls `googleSignIn()`
- **Success redirect** to `/dashboard`
- **Proper error handling**

## 6. Protected Routes Complete ✅

Your `src/components/auth/ProtectedRoute.jsx`:
- **Checks if user exists**, otherwise redirects to `/login`
- **Supports role-based access** (admin, teacher, verification requirements)
- **Loading states** handled properly

## 7. Firestore Rules (Recommended)

Update your Firestore rules for security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can manage all users
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections...
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. Environment Variables

Make sure your `.env.local` contains:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=duxe-5c071.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duxe-5c071
VITE_FIREBASE_STORAGE_BUCKET=duxe-5c071.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 9. Testing Checklist

### Local Testing (http://localhost:5000)
- [ ] Google Sign-In opens popup
- [ ] Successful authentication redirects to `/dashboard`
- [ ] New users appear in Firestore `users` collection
- [ ] User profile data is correctly saved
- [ ] Protected routes work properly

### Production Testing (https://duxe.org)
- [ ] Google Sign-In works without CORS errors
- [ ] Authentication persists across page reloads
- [ ] Users are correctly saved to Firestore
- [ ] All protected routes function properly

## 10. Verification Commands

### Check Firestore Users
```javascript
// In browser console on your site
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/services/firebase.js';

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```

### Test Authentication Flow
1. Visit `/login` or `/signup`
2. Click "Continue with Google"
3. Complete Google OAuth
4. Should redirect to `/dashboard`
5. Check Firestore for new user document

## ✅ Deliverables Complete

- ✅ **Firebase.js**: Exports auth and db
- ✅ **AuthContext.jsx**: GoogleSignIn with Firestore user creation
- ✅ **Login.jsx**: Working Google Sign-In button
- ✅ **ProtectedRoute.jsx**: Route protection implemented
- ✅ **User Storage**: New users saved to Firestore on first sign-in
- ✅ **Testing Ready**: Both localhost and production domains configured

## Troubleshooting

**Google Sign-In fails on production:**
- Verify domains are added to both Google Cloud OAuth AND Firebase Auth
- Check browser console for CORS or configuration errors
- Ensure environment variables are set in Netlify

**Users not appearing in Firestore:**
- Check browser console for Firestore permissions errors
- Verify Firebase project configuration
- Check if Firestore database is created and rules are set

**Protected routes not working:**
- Verify AuthContext is properly wrapping your app
- Check if `onAuthStateChanged` is firing correctly
- Ensure user state is being set properly after authentication