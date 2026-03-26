import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Create Auth Context
const AuthContext = createContext({});

/**
 * Hook to use auth context
 * @returns {Object} Auth context value with user, login, signup, logout functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Manages authentication state and provides auth functions to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} displayName - User's display name (optional)
   * @returns {Promise<Object>} User credential object
   */
  const signup = async (email, password, displayName = '') => {
    try {
      setError(null);

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookmarks: [],
        skills: [],
      });

      console.log('✅ User signed up successfully:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ Signup error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Log in existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User credential object
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User logged in successfully:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Log out current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Get user data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object>} User data object
   */
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      return null;
    }
  };

  // Ensure auth persistence across reloads
  useEffect(() => {
    (async () => {
      try {
        if (auth) {
          await setPersistence(auth, browserLocalPersistence);
        }
      } catch (e) {
        console.warn('Auth persistence setup failed:', e?.message);
      }
    })();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('⚠️ Firebase Auth is not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = await getUserData(firebaseUser.uid);
        setUser({
          ...firebaseUser,
          userData: userData,
        });
        // Set user role from userData (handle string properly)
        const role = userData?.role ? String(userData.role).trim().toLowerCase() : 'user';
        setUserRole(role);
        console.log('🔐 Auth state: User logged in', firebaseUser.email, 'Role:', role);
      } else {
        // User is signed out
        setUser(null);
        setUserRole(null);
        console.log('🔓 Auth state: User logged out');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Social login helper - creates Firestore user doc on first login
   */
  const handlePostSocialLogin = async (firebaseUser) => {
    try {
      const existing = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!existing.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookmarks: [],
          skills: [],
        });
      }
    } catch (e) {
      console.error('Post social login setup failed:', e);
    }
  };

  /**
   * Login with Google using popup
   */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostSocialLogin(result.user);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Login with Apple using OAuth provider (apple.com)
   */
  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    // Request email and name scopes
    provider.addScope('email');
    provider.addScope('name');
    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostSocialLogin(result.user);
      return result;
    } catch (error) {
      console.error('Apple login error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    userRole,
    isAdmin: userRole && String(userRole).trim().toLowerCase() === 'admin',
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithApple,
    getUserData,
  };

  // Show loading state or render children
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
