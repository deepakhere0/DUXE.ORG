// Admin User Verification Script
// This script checks if the current admin user is properly configured in Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

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

console.log('🔧 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function checkAdminUser() {
  try {
    console.log('🔐 Enter your admin credentials:');
    
    // For demo purposes, we'll use environment variables
    // In a real scenario, you'd prompt for credentials
    const email = 'admin@duxe.com'; // Change this to your admin email
    const password = 'admin123'; // Change this to your admin password
    
    console.log(`📧 Attempting to sign in with email: ${email}`);
    
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User signed in successfully');
    console.log(`👤 User ID: ${user.uid}`);
    console.log(`📧 Email: ${user.email}`);
    
    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('⚠️ User document not found in Firestore. Creating admin document...');
      
      // Create admin user document
      const adminData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookmarks: [],
        skills: []
      };
      
      await setDoc(userDocRef, adminData);
      console.log('✅ Admin user document created successfully!');
      
    } else {
      const userData = userDoc.data();
      console.log('📄 User document found:');
      console.log(`  Role: ${userData.role}`);
      console.log(`  Display Name: ${userData.displayName}`);
      console.log(`  Created: ${userData.createdAt}`);
      
      if (userData.role !== 'admin') {
        console.log('⚠️ User role is not "admin". Updating role...');
        await setDoc(userDocRef, { ...userData, role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
        console.log('✅ User role updated to admin!');
      } else {
        console.log('✅ User is properly configured as admin!');
      }
    }
    
    console.log('\n🎉 Admin verification completed successfully!');
    console.log('📝 You can now upload notes through the web interface.');
    
    // Sign out
    await auth.signOut();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during admin verification:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 User not found. Please create an admin account first.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Invalid password. Please check your credentials.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Invalid email format. Please check the email address.');
    }
    
    process.exit(1);
  }
}

// Run the check
checkAdminUser();