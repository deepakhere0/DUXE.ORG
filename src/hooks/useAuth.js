import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));

          if (userDoc.exists()) {
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              ...userDoc.data(),
            });
          } else {
            // User exists in auth but not in Firestore, create basic user object
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: 'user', // default role
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            role: 'user',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  return { user, loading };
};
