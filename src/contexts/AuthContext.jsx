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
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

  // Create user profile in Firestore with retry logic
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
        
        return userRef;
        
      } catch (error) {
        console.warn(`❌ Attempt ${attempt} to create user profile failed:`, error);
        
        if (attempt === retries) {
          console.error('Error creating user profile:', error);
          toast.error('Failed to create user profile. Please try again.');
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return null;
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
        setIsTeacher(profile.role === 'teacher');
        return profile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile');
    }
    return null;
  };

  // Enhanced sign up function
  const signup = async (email, password, displayName) => {
    console.log('🚀 Starting signup process...');
    
    if (!auth || !db) {
      const msg = 'Authentication is not configured. Please check your Firebase settings.';
      console.error(msg);
      toast.error(msg);
      return { success: false, error: 'Firebase not configured' };
    }
    
    try {
      console.log('📝 Creating user with email and password...');
      
      // Create the user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('✅ User created:', user.email);

      // Update display name
      if (displayName) {
        console.log('👤 Updating display name...');
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore with retries
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
        // Don't fail the entire signup if email fails
      }

      console.log('🎉 Signup completed successfully');
      toast.success('Account created successfully! Please check your email for verification.');
      
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
          break;
        default:
          if (error.message && error.message.includes('Firebase:')) {
            errorMessage = error.message.replace('Firebase: Error ', '').replace(/\([^)]*\)/g, '').trim();
          } else {
            errorMessage = error.message || errorMessage;
          }
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign in function
  const login = async (email, password) => {
    if (!auth) {
      toast.error('Authentication is not configured. Please set Firebase env variables.');
      return { success: false, error: 'Firebase not configured' };
    }
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      if (!user.emailVerified) {
        toast.warning('Please verify your email to access all features');
      }
      
      await fetchUserProfile(user.uid);
      toast.success('Welcome back!');
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Sign In function with enhanced error handling
  const signInWithGoogle = async () => {
    if (!auth) {
      console.error('Firebase auth not initialized');
      toast.error('Authentication is not configured. Please set Firebase env variables.');
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      console.log('🚀 Starting Google authentication...');
      
      const provider = new GoogleAuthProvider();
      
      // Enhanced provider configuration
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account' // Forces account selection for better UX
      });

      // Check if we should use redirect flow (mobile or popup blocked)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('📱 Mobile device detected, using redirect flow...');
        await signInWithRedirect(auth, provider);
        // Result will be handled in handleRedirectResult
        return { success: true, redirect: true };
      }
      
      // Test for popup blocker
      console.log('🧪 Testing popup support...');
      const testPopup = window.open('', 'test', 'width=1,height=1');
      if (!testPopup || testPopup.closed) {
        console.warn('🚫 Popup blocker detected, using redirect flow');
        testPopup?.close();
        await signInWithRedirect(auth, provider);
        return { success: true, redirect: true };
      }
      testPopup.close();

      console.log('📱 Opening Google authentication popup...');
      
      // Add timeout handling to prevent infinite hangs
      const authPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 45000) // 45 seconds
      );

      const result = await Promise.race([authPromise, timeoutPromise]);
      const user = result.user;

      console.log('✅ Google authentication successful:', user.email);

      // Create or update user profile in Firestore
      console.log('💾 Creating/updating user profile...');
      await createUserProfile(user, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google',
        lastLoginAt: new Date().toISOString()
      });

      await fetchUserProfile(user.uid);
      
      console.log('🎉 Authentication flow completed successfully');
      toast.success(`Welcome to DUXE, ${user.displayName || user.email}!`);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Google sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to sign in with Google';
      let shouldRetry = false;

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          console.warn('🚫 User closed authentication popup, trying redirect...');
          // Automatically try redirect flow
          try {
            await signInWithRedirect(auth, provider);
            return { success: true, redirect: true };
          } catch (redirectError) {
            errorMessage = 'Authentication was cancelled. Please try again.';
            shouldRetry = true;
          }
          break;
          
        case 'auth/popup-blocked':
          console.warn('🚫 Browser blocked authentication popup, trying redirect...');
          // Automatically try redirect flow
          try {
            await signInWithRedirect(auth, provider);
            return { success: true, redirect: true };
          } catch (redirectError) {
            errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
            shouldRetry = true;
          }
          break;
          
        case 'auth/network-request-failed':
          errorMessage = 'Network error occurred. Please check your internet connection and try again.';
          shouldRetry = true;
          console.warn('🌐 Network connectivity issue');
          break;
          
        case 'auth/timeout':
        case 'Authentication timeout':
          errorMessage = 'Authentication timed out. Please try again.';
          shouldRetry = true;
          console.warn('⏱️ Authentication timeout');
          break;
          
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email address using a different sign-in method.';
          console.warn('👤 Account exists with different credential');
          break;
          
        case 'auth/cancelled-popup-request':
          errorMessage = 'Authentication was cancelled due to another request.';
          shouldRetry = true;
          console.warn('🔄 Popup request cancelled');
          break;
          
        default:
          errorMessage = error.message || 'An unexpected error occurred during authentication.';
          console.error('🐛 Unexpected error:', error);
      }

      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        code: error.code,
        shouldRetry
      };
    }
  };

  // Sign out function
  const logout = async () => {
    if (!auth) {
      toast.error('Authentication is not configured.');
      return { success: false, error: 'Firebase not configured' };
    }
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsTeacher(false);
      toast.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    if (!auth) {
      toast.error('Authentication is not configured.');
      return { success: false, error: 'Firebase not configured' };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle redirect result from Google Sign In
  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        console.log('✅ Redirect authentication successful:', result.user.email);
        
        await createUserProfile(result.user, {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          provider: 'google',
          signupMethod: 'google',
          lastLoginAt: new Date().toISOString()
        });
        
        await fetchUserProfile(result.user.uid);
        toast.success(`Welcome to DUXE, ${result.user.displayName || result.user.email}!`);
        
        return { success: true, user: result.user };
      }
    } catch (error) {
      // Only log errors, don't show toast as this runs on every page load
      if (error.code !== 'auth/no-auth-event') {
        console.error('❌ Redirect result error:', error);
      }
    }
    return null;
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local state
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Check for redirect result on component mount
  useEffect(() => {
    if (auth) {
      handleRedirectResult();
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      // If Firebase isn't configured, skip auth listener
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    isTeacher,
    isStudent: userProfile?.role === 'student',
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
