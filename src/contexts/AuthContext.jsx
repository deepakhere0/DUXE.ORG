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

  // Google Sign In function following the requirements
  const googleSignIn = async () => {
    if (!auth || !db) {
      console.error('❌ Firebase not initialized');
      toast.error('Authentication service is not available.');
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      console.log('🚀 Starting Google Sign-In...');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('✅ Google authentication successful:', user.email);

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        // Create new user document on first login
        console.log('💾 Creating new user profile in Firestore...');
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'student',
          createdAt: serverTimestamp(),
          provider: 'google',
          bookmarks: [],
          uploadedNotes: []
        };
        
        await setDoc(userRef, userData);
        console.log('✅ New user profile created');
      } else {
        console.log('👤 Existing user profile found');
      }
      
      // Fetch user profile to update local state
      await fetchUserProfile(user.uid);
      
      toast.success(`Welcome to DUXE, ${user.displayName || user.email}!`);
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account with this email already exists using a different sign-in method.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred during sign-in.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
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

  // Redirect result is now handled by AuthRedirectHandler component

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
    googleSignIn,
    signInWithGoogle: googleSignIn, // Alias for backward compatibility
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
