// Create Admin User Script using Firebase Emulator
// This script creates or updates a user to have admin role using local Firebase emulator

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');
config({ path: envPath });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator (if USE_EMULATOR is true)
if (process.env.VITE_USE_EMULATOR === 'true' || process.argv.includes('--emulator')) {
  console.log('🧪 Connecting to Firestore emulator...');
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('ℹ️  Already connected to emulator or emulator not running');
  }
}

async function createAdminUser() {
  console.log('🔧 Admin User Setup Script (Emulator Version)');
  console.log('Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
  
  const useEmulator = process.env.VITE_USE_EMULATOR === 'true' || process.argv.includes('--emulator');
  if (useEmulator) {
    console.log('🧪 Using Firebase Emulator (no security rules enforced)');
  } else {
    console.log('🌐 Using Production Firestore (security rules enforced)');
    console.log('⚠️  Note: This may fail due to security rules. Use --emulator flag for local testing.');
  }
  
  // You can modify these values or pass them as command line arguments
  // Filter out the --emulator flag from arguments
  const args = process.argv.filter(arg => arg !== '--emulator');
  const adminEmail = args[2] || 'admin@duxe.com';
  const adminName = args[3] || 'DUXE Administrator';
  const adminId = args[4] || 'admin-user-1';
  
  console.log(`\n📧 Creating admin user: ${adminEmail}`);
  console.log(`👤 Display name: ${adminName}`);
  console.log(`🆔 User ID: ${adminId}`);
  
  try {
    // Check if user already exists
    const userRef = doc(db, 'users', adminId);
    const userDoc = await getDoc(userRef);
    
    const adminData = {
      uid: adminId,
      displayName: adminName,
      email: adminEmail,
      role: 'admin',
      skills: ['Platform Management', 'Content Moderation', 'Analytics'],
      bookmarks: [],
      university: 'DUXE Platform',
      department: 'Administration',
      year: 'Staff',
      bio: 'Platform administrator with full access to admin panel.',
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      profilePicture: null
    };
    
    console.log('\n🔄 Writing admin user data to Firestore...');
    await setDoc(userRef, adminData, { merge: true });
    
    if (userDoc.exists()) {
      console.log('✅ Admin user updated successfully!');
      console.log('   The user role has been changed to admin.');
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('   A new admin user document has been created.');
    }
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log('   Password: [You need to create this in Firebase Auth]');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Create Firebase Auth account:');
    console.log(`   - Go to: https://console.firebase.google.com/project/${process.env.VITE_FIREBASE_PROJECT_ID}/authentication`);
    console.log('   - Click "Add user"');
    console.log(`   - Email: ${adminEmail}`);
    console.log('   - Password: Create a secure password');
    console.log(`   - User UID: ${adminId}`);
    console.log('');
    console.log('2. Test admin access:');
    console.log('   - Sign in with the admin account');
    console.log('   - Look for "Admin Panel" in the user menu');
    console.log('   - Navigate to /admin/dashboard');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // Provide helpful troubleshooting
    console.log('\n🔍 Troubleshooting:');
    if (error.code === 'permission-denied') {
      console.log('This error is caused by Firestore security rules.');
      console.log('Solutions:');
      console.log('1. Use Firebase emulator (recommended for testing):');
      console.log('   npm run create-admin -- --emulator');
      console.log('   (Make sure to start emulator first: firebase emulators:start)');
      console.log('');
      console.log('2. Or temporarily modify firestore.rules to allow admin creation');
    } else if (error.code === 'unavailable') {
      console.log('Connection issue. Make sure you have internet access.');
      console.log('If using emulator, make sure it is running:');
      console.log('   firebase emulators:start');
    }
    
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🛡️  Admin User Creation Script (CLI Version)

Usage:
  node scripts/create-admin-cli.js [email] [name] [userId]

Examples:
  node scripts/create-admin-cli.js
  node scripts/create-admin-cli.js admin@myschool.edu "School Admin"
  node scripts/create-admin-cli.js admin@duxe.com "DUXE Admin" admin-123

Default values:
  Email: admin@duxe.com
  Name: DUXE Administrator  
  User ID: admin-user-1
`);
  process.exit(0);
}

createAdminUser();
