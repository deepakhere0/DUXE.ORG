// Create Admin User Script
// This script creates or updates a user to have admin role

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');
config({ path: envPath });

// Initialize Firebase Admin SDK
const app = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

async function createAdminUser() {
  console.log('🔧 Admin User Setup Script');
  console.log('Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
  
  // You can modify these values or pass them as command line arguments
  const adminEmail = process.argv[2] || 'admin@duxe.com';
  const adminName = process.argv[3] || 'DUXE Administrator';
  const adminId = process.argv[4] || 'admin-user-1';
  
  console.log(`\n📧 Creating admin user: ${adminEmail}`);
  console.log(`👤 Display name: ${adminName}`);
  console.log(`🆔 User ID: ${adminId}`);
  
  try {
    // Check if user already exists
    const userRef = db.collection('users').doc(adminId);
    const userDoc = await userRef.get();
    
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
      createdAt: userDoc.exists ? userDoc.data().createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastActive: Timestamp.now(),
      profilePicture: null
    };
    
    await userRef.set(adminData, { merge: true });
    
    if (userDoc.exists) {
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
    console.log(`   - Go to: https://console.firebase.google.com/project/duxe-5c071/authentication`);
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
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🛡️  Admin User Creation Script

Usage:
  node scripts/create-admin.js [email] [name] [userId]

Examples:
  node scripts/create-admin.js
  node scripts/create-admin.js admin@myschool.edu "School Admin"
  node scripts/create-admin.js admin@duxe.com "DUXE Admin" admin-123

Default values:
  Email: admin@duxe.com
  Name: DUXE Administrator  
  User ID: admin-user-1
`);
  process.exit(0);
}

createAdminUser();
