import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  connectAuthEmulator
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Enhanced error handling
  const handleAuthError = (error, operation) => {
    console.error(`${operation} error:`, error);
    setAuthError({ code: error.code, message: error.message, operation });
    
    let userMessage = `Failed to ${operation.toLowerCase()}`;
    
    switch (error.code) {
      // Firebase Auth Errors
      case 'auth/network-request-failed':
        userMessage = 'Network error. Please check your internet connection and try again.';
        break;
      case 'auth/too-many-requests':
        userMessage = 'Too many failed attempts. Please wait a moment before trying again.';
        break;
      case 'auth/user-disabled':
        userMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/operation-not-allowed':
        userMessage = 'This sign-in method is not enabled. Please contact support.';
        break;
      
      // Signup specific errors
      case 'auth/email-already-in-use':
        userMessage = 'An account with this email already exists. Try logging in instead.';
        break;
      case 'auth/invalid-email':
        userMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        userMessage = 'Password should be at least 6 characters long.';
        break;
        
      // Google Auth specific errors
      case 'auth/popup-closed-by-user':
        userMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        userMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
        break;
      case 'auth/cancelled-popup-request':
        userMessage = 'Another sign-in popup is already open. Please complete or close it first.';
        break;
      case 'auth/unauthorized-domain':
        userMessage = 'This domain is not authorized for authentication. Please contact support.';
        break;
        
      // Firestore specific errors
      case 'firestore/permission-denied':
        userMessage = 'Permission denied. Please try logging in again.';
        break;
      case 'firestore/unavailable':
        userMessage = 'Database temporarily unavailable. Please try again in a moment.';
        break;
        
      default:
        // Check if it's a Firebase error with custom message
        if (error.message && error.message.includes('Firebase:')) {
          userMessage = error.message.replace('Firebase: Error ', '').replace(/\([^)]*\)/g, '').trim();
        } else if (error.message) {
          userMessage = error.message;
        }
    }
    
    toast.error(userMessage);
    return userMessage;
  };

  // Enhanced Firebase configuration check
  const checkFirebaseConfig = () => {
    if (!isFirebaseConfigured) {
      const message = 'Firebase is not properly configured. Please check your environment variables.';
      toast.error(message);
      setAuthError({ code: 'config-error', message, operation: 'configuration' });
      return false;
    }
    
    if (!auth || !db) {
      const message = 'Firebase services are not initialized. Please refresh the page.';
      toast.error(message);
      setAuthError({ code: 'init-error', message, operation: 'initialization' });
      return false;
    }
    
    return true;
  };

  // Create user profile with retry logic
  const createUserProfile = async (user, additionalData = {}, retries = 3) => {
    if (!user || !db) return null;

    const userRef = doc(db, 'users', user.uid);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          const { displayName, email, photoURL } = user;
          
          console.log(`💾 Creating user profile (attempt ${attempt})...`);
          
          await setDoc(userRef, {
            displayName,
            email,
            photoURL,
            role: 'student',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            emailVerified: user.emailVerified,
            bookmarks: [],
            uploadedNotes: [],
            ...additionalData
          });
          
          console.log('✅ User profile created successfully');
          return userRef;
        }
        
        // User already exists, just return the reference
        return userRef;
        
      } catch (error) {
        console.warn(`❌ Attempt ${attempt} to create user profile failed:`, error);
        
        if (attempt === retries) {
          handleAuthError(error, 'create user profile');
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return null;
  };

  // Enhanced fetch user profile
  const fetchUserProfile = async (userId) => {
    if (!userId || !db) return null;
    
    try {
      console.log('📊 Fetching user profile...');
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
        setIsTeacher(profile.role === 'teacher');
        console.log('✅ User profile loaded');
        return profile;
      } else {
        console.warn('⚠️ User profile not found, creating one...');
        // If profile doesn't exist, create it
        if (currentUser) {
          await createUserProfile(currentUser);
          return await fetchUserProfile(userId); // Recursive call
        }
      }
    } catch (error) {
      handleAuthError(error, 'fetch user profile');
    }
    return null;
  };

  // Enhanced signup function
  const signup = async (email, password, displayName) => {
    console.log('🚀 Starting signup process...');
    
    if (!checkFirebaseConfig()) {
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      console.log('📝 Creating user with email and password...');
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ User created:', user.email);

      // Update display name
      if (displayName) {
        console.log('👤 Updating display name...');
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      console.log('💾 Creating user profile...');
      await createUserProfile(user, { 
        displayName,
        signupMethod: 'email',
        signupTimestamp: new Date().toISOString()
      });

      // Send email verification
      console.log('📧 Sending verification email...');
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent');
      } catch (verificationError) {
        console.warn('⚠️ Failed to send verification email:', verificationError);
        // Don't fail the entire signup for this
      }

      console.log('🎉 Signup completed successfully');
      toast.success('Account created successfully! Please check your email for verification.');
      
      return { success: true, user };
      
    } catch (error) {
      const errorMessage = handleAuthError(error, 'signup');
      return { success: false, error: errorMessage };
    }
  };

  // Enhanced login function  
  const login = async (email, password) => {
    console.log('🚀 Starting login process...');
    
    if (!checkFirebaseConfig()) {
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      console.log('🔐 Signing in with email and password...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login successful:', user.email);

      if (!user.emailVerified) {
        console.warn('⚠️ Email not verified');
        toast.warning('Please verify your email to access all features. Check your inbox!');
      }

      await fetchUserProfile(user.uid);
      toast.success(`Welcome back${user.displayName ? `, ${user.displayName}` : ''}!`);
      
      return { success: true, user };
      
    } catch (error) {
      const errorMessage = handleAuthError(error, 'login');
      return { success: false, error: errorMessage };
    }
  };

  // Enhanced Google Sign In with fallback to redirect
  const signInWithGoogle = async (useRedirect = false) => {
    console.log('🚀 Starting Google authentication...');
    
    if (!checkFirebaseConfig()) {
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let result;
      
      if (useRedirect || isMobileDevice()) {
        console.log('📱 Using redirect flow...');
        await signInWithRedirect(auth, provider);
        // Result will be handled by handleRedirectResult
        return { success: true, redirect: true };
      } else {
        console.log('📱 Opening Google authentication popup...');
        
        // Check if popup will be blocked
        const testPopup = window.open('', 'test', 'width=1,height=1');
        if (!testPopup || testPopup.closed) {
          console.warn('🚫 Popup blocker detected, switching to redirect flow');
          testPopup?.close();
          return await signInWithGoogle(true); // Retry with redirect
        }
        testPopup.close();
        
        // Add timeout handling
        const authPromise = signInWithPopup(auth, provider);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 45000)
        );

        result = await Promise.race([authPromise, timeoutPromise]);
      }

      if (result && result.user) {
        const user = result.user;
        console.log('✅ Google authentication successful:', user.email);

        // Create or update user profile
        await createUserProfile(user, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          signupMethod: 'google',
          lastLoginAt: new Date().toISOString()
        });

        await fetchUserProfile(user.uid);
        
        toast.success(`Welcome to DUXE${user.displayName ? `, ${user.displayName}` : ''}!`);
        return { success: true, user };
      }

    } catch (error) {
      console.error('❌ Google authentication error:', error);
      
      // Handle specific popup errors by falling back to redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log('🔄 Popup failed, trying redirect flow...');
        return await signInWithGoogle(true);
      }
      
      const errorMessage = handleAuthError(error, 'Google sign in');
      return { success: false, error: errorMessage };
    }
  };

  // Handle redirect result (call this on app initialization)
  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        console.log('✅ Redirect authentication successful:', result.user.email);
        
        await createUserProfile(result.user, {
          provider: 'google',
          signupMethod: 'google',
          lastLoginAt: new Date().toISOString()
        });
        
        await fetchUserProfile(result.user.uid);
        toast.success(`Welcome to DUXE, ${result.user.displayName || result.user.email}!`);
        
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      handleAuthError(error, 'handle redirect result');
    }
    return null;
  };

  // Utility function to detect mobile devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Enhanced logout
  const logout = async () => {
    if (!checkFirebaseConfig()) {
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsTeacher(false);
      setAuthError(null);
      
      toast.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'sign out');
      return { success: false, error: errorMessage };
    }
  };

  // Enhanced password reset
  const resetPassword = async (email) => {
    if (!checkFirebaseConfig()) {
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error, 'reset password');
      return { success: false, error: errorMessage };
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.email || 'No user');
      
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsTeacher(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle redirect result on app load
  useEffect(() => {
    if (auth) {
      handleRedirectResult();
    }
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    isTeacher,
    loading,
    authError,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    fetchUserProfile,
    createUserProfile,
    checkFirebaseConfig,
    handleRedirectResult
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
