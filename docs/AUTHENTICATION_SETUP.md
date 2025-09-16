# 🔐 Complete Authentication Setup Guide for DUXE

This guide will walk you through setting up Email/Password and Google authentication for your DUXE platform.

## 📋 Prerequisites
- Firebase project created
- Firebase web app configured
- Access to Firebase Console

## 🚀 Part 1: Firebase Console Setup

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your DUXE project
3. Navigate to **Authentication** from the left sidebar
4. Click the **Sign-in method** tab
5. Find **Email/Password** in the providers list
6. Click on it and toggle **Enable** to ON
7. Optionally enable **Email link (passwordless sign-in)**
8. Click **Save**

### Step 2: Enable Google Authentication

1. Still in the **Sign-in method** tab
2. Find **Google** in the providers list
3. Click on it and toggle **Enable** to ON
4. Configure:
   - **Project public-facing name**: `DUXE`
   - **Project support email**: `your-email@example.com`
5. Click **Save**
6. Copy the **Web client ID** (you might need it later)

### Step 3: Configure Authorized Domains

1. Go to **Authentication** → **Settings** tab
2. Under **Authorized domains**, make sure you have:
   ```
   localhost
   127.0.0.1
   your-production-domain.com (when you deploy)
   ```
3. Click **Add domain** to add any custom domains

## 🔧 Part 2: Google Cloud Console Setup (for Google Auth)

### Step 1: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project from the dropdown
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (unless you need internal)
5. Fill in the required fields:
   - **App name**: `DUXE`
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Application home page**: `https://your-domain.com`
   - **Application privacy policy**: `https://your-domain.com/privacy`
   - **Application terms of service**: `https://your-domain.com/terms`
   - **Authorized domains**: Add your domain
   - **Developer contact information**: Your email
6. Click **Save and Continue**

### Step 2: Configure Scopes (Optional)
- For basic authentication, the default scopes are sufficient
- Click **Save and Continue**

### Step 3: Add Test Users (if in testing mode)
- Add email addresses of test users
- Click **Save and Continue**

## 💻 Part 3: Update Your React Application

### Step 1: Verify Firebase Configuration

Make sure your `.env` or `.env.local` file has all required Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
VITE_GEMINI_API_KEY=your-gemini-key (for AI features)
```

### Step 2: Verify AuthContext Implementation

Your `src/contexts/AuthContext.jsx` should have these methods:

```javascript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

// Email/Password Sign Up
const signup = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    // Create user document in Firestore
    await createUserDocument(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email/Password Sign In
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In
const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    // Create/update user document in Firestore
    await createUserDocument(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper to create user document in Firestore
const createUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'student', // default role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};
```

### Step 3: Test Authentication Flow

1. **Test Email/Password Sign Up:**
   - Go to `/signup`
   - Enter a test email and password
   - Verify account is created in Firebase Console

2. **Test Email/Password Login:**
   - Go to `/login`
   - Enter credentials
   - Verify successful login

3. **Test Google Sign In:**
   - Click "Sign in with Google" button
   - Complete Google OAuth flow
   - Verify account is created/logged in

## 🛡️ Part 4: Security Rules

Update your Firestore rules (`firestore.rules`) to handle user authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Other rules...
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## 🐛 Troubleshooting

### Common Issues and Solutions

1. **"auth/popup-blocked" error:**
   - Ensure popups are allowed in browser
   - Call `loginWithGoogle()` directly from a user action (button click)

2. **"auth/unauthorized-domain" error:**
   - Add your domain to Firebase Console → Authentication → Settings → Authorized domains

3. **"auth/invalid-email" error:**
   - Validate email format before calling Firebase methods

4. **"auth/weak-password" error:**
   - Enforce minimum 6 characters for passwords

5. **Google Sign-In not working:**
   - Check OAuth consent screen is configured
   - Verify Google provider is enabled in Firebase Console
   - Check browser console for specific errors

## ✅ Verification Checklist

- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Google authentication enabled in Firebase Console
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Authorized domains added in Firebase Console
- [ ] Environment variables set correctly
- [ ] AuthContext methods implemented
- [ ] Login page has Google Sign-In button
- [ ] Signup page has Google Sign-In option
- [ ] User documents created in Firestore on signup
- [ ] Security rules deployed

## 📱 Testing on Different Environments

### Local Development
```bash
npm run dev
# Test at http://localhost:3000
```

### Production
1. Deploy your app
2. Add production domain to Firebase authorized domains
3. Update OAuth consent screen with production URLs
4. Test authentication flow

## 🔒 Best Practices

1. **Email Verification:**
   ```javascript
   import { sendEmailVerification } from 'firebase/auth';
   
   // After signup
   await sendEmailVerification(user);
   ```

2. **Password Reset:**
   ```javascript
   import { sendPasswordResetEmail } from 'firebase/auth';
   
   await sendPasswordResetEmail(auth, email);
   ```

3. **Session Management:**
   - Firebase handles session persistence automatically
   - Use `onAuthStateChanged` to track auth state

4. **Role-Based Access:**
   - Store user roles in Firestore
   - Check roles in security rules
   - Implement role checks in your app

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/start)
- [Google Sign-In Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🤝 Support

If you encounter any issues:
1. Check browser console for errors
2. Review Firebase Console logs
3. Verify all configuration steps
4. Check network tab for failed requests

---

**Last Updated:** December 2024
**Platform:** DUXE Student Learning Platform
