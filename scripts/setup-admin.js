// Quick Admin Setup Script for DUXE Platform
// This script creates or updates a user to have admin privileges

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function setupAdmin() {
  try {
    console.log('🔧 DUXE Admin Setup Utility');
    console.log('================================\n');
    
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const displayName = await question('Enter display name (optional, press Enter to skip): ');
    
    console.log('\n🔐 Processing...');
    
    let user;
    
    // Try to sign in first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('✅ User exists, updating to admin...');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        console.log('📝 Creating new admin user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log('✅ User created successfully');
      } else {
        throw error;
      }
    }
    
    // Create/Update user document in Firestore with admin role
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || email.split('@')[0],
      role: 'admin', // Set admin role
      emailVerified: user.emailVerified,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: userDoc.exists() ? userDoc.data().bookmarks || [] : [],
      skills: userDoc.exists() ? userDoc.data().skills || [] : []
    };
    
    await setDoc(userDocRef, userData, { merge: true });
    
    console.log('\n🎉 Success! Admin user setup completed');
    console.log('=====================================');
    console.log(`Email: ${email}`);
    console.log(`Display Name: ${userData.displayName}`);
    console.log(`Role: admin`);
    console.log(`User ID: ${user.uid}`);
    console.log('\n✅ You can now login and upload notes as an admin!');
    
    // Sign out
    await auth.signOut();
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    
    if (error.code === 'auth/weak-password') {
      console.log('💡 Password should be at least 6 characters');
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('💡 Email is already in use');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Invalid email format');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Wrong password for existing user');
    }
  } finally {
    rl.close();
    process.exit();
  }
}

// Run the setup
setupAdmin();