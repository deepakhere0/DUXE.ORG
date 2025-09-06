import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { displayName, email, photoURL } = user;
      
      try {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          role: 'student', // Default role
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          bookmarks: [],
          uploadedNotes: [],
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
        toast.error('Failed to create user profile');
      }
    }
    
    return userRef;
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

  // Sign up function
  const signup = async (email, password, displayName) => {
    if (!auth) {
      toast.error('Authentication is not configured. Please set Firebase env variables.');
      return { success: false, error: 'Firebase not configured' };
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(user, { displayName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      toast.success('Account created! Please verify your email.');
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
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
