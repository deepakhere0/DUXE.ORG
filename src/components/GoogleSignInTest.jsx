import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';

const GoogleSignInTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Testing Google Sign-In...');
      console.log('Firebase Auth:', !!auth);
      
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🚀 Opening Google popup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Sign-in successful:', result.user.email);
      setUser(result.user);
      
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      console.log('👋 Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '400px', 
      margin: '50px auto',
      border: '2px solid #ccc',
      borderRadius: '10px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔥 Google Sign-In Test</h2>
      
      {!user ? (
        <div>
          <p>Test your Google Sign-In setup</p>
          <button 
            onClick={signInWithGoogle}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : '🔑 Sign in with Google'}
          </button>
          
          {error && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#ffebee', 
              color: '#c62828',
              borderRadius: '5px'
            }}>
              ❌ Error: {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>✅ Welcome!</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.displayName}</p>
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
          )}
          <br /><br />
          <button 
            onClick={signOut}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            👋 Sign Out
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Check browser console for debug information
      </div>
    </div>
  );
};

export default GoogleSignInTest;