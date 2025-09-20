import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required env vars
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = requiredKeys.filter(
  (k) => !import.meta.env[k] || 
         String(import.meta.env[k]).startsWith('your_') ||
         String(import.meta.env[k]).trim() === ''
);

export const isFirebaseConfigured = missing.length === 0;

let app = null;
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
  } else {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Firebase] Missing or placeholder env vars. Create .env.local using .env.example and restart the dev server. Missing:',
        missing
      );
    }
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('[Firebase] Initialization failed:', e);
}

// Initialize Firebase services only if app is initialized
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const functions = app ? getFunctions(app) : null;
export const analytics = app && typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
