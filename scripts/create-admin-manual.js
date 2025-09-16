// Manual Admin User Setup Guide
// This script provides instructions for manually creating an admin user

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');
config({ path: envPath });

function showAdminSetupGuide() {
  const adminEmail = process.argv[2] || 'admin@duxe.com';
  const adminName = process.argv[3] || 'DUXE Administrator';
  const adminId = process.argv[4] || 'admin-user-1';
  
  console.log('🛡️  DUXE Platform Admin User Setup Guide');
  console.log('==========================================\n');
  
  console.log(`📧 Admin Email: ${adminEmail}`);
  console.log(`👤 Display Name: ${adminName}`);
  console.log(`🆔 User ID: ${adminId}\n`);
  
  console.log('🔧 STEP 1: Create Firebase Auth User');
  console.log('=====================================');
  console.log(`1. Go to: https://console.firebase.google.com/project/${process.env.VITE_FIREBASE_PROJECT_ID}/authentication/users`);
  console.log('2. Click "Add user"');
  console.log(`3. Enter email: ${adminEmail}`);
  console.log('4. Enter a secure password');
  console.log('5. Click "Add user"');
  console.log('6. IMPORTANT: Copy the User UID from the created user\n');
  
  console.log('🗄️  STEP 2: Create Firestore Document');
  console.log('======================================');
  console.log(`1. Go to: https://console.firebase.google.com/project/${process.env.VITE_FIREBASE_PROJECT_ID}/firestore/data`);
  console.log('2. Click "Start collection"');
  console.log('3. Collection ID: users');
  console.log('4. Document ID: Use the User UID from Step 1 (or manually set it to "admin-user-1")');
  console.log('5. Add the following fields:\n');
  
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    profilePicture: null
  };
  
  console.log('   Field Name     | Type   | Value');
  console.log('   --------------|--------|-----------------------------');
  console.log(`   uid            | string | ${adminData.uid}`);
  console.log(`   displayName    | string | ${adminData.displayName}`);
  console.log(`   email          | string | ${adminData.email}`);
  console.log(`   role           | string | ${adminData.role}`);
  console.log(`   university     | string | ${adminData.university}`);
  console.log(`   department     | string | ${adminData.department}`);
  console.log(`   year           | string | ${adminData.year}`);
  console.log(`   bio            | string | ${adminData.bio}`);
  console.log(`   skills         | array  | ${JSON.stringify(adminData.skills)}`);
  console.log(`   bookmarks      | array  | [] (empty array)`);
  console.log(`   createdAt      | string | ${adminData.createdAt}`);
  console.log(`   updatedAt      | string | ${adminData.updatedAt}`);
  console.log(`   lastActive     | string | ${adminData.lastActive}`);
  console.log(`   profilePicture | string | null`);
  console.log('');
  
  console.log('🧪 ALTERNATIVE: Use Firebase Emulator (Recommended for Testing)');
  console.log('================================================================');
  console.log('1. Start the Firebase emulator:');
  console.log('   firebase emulators:start --only firestore,auth');
  console.log('2. In another terminal, run:');
  console.log('   npm run create-admin:emulator');
  console.log('3. Access the Emulator UI: http://localhost:4000');
  console.log('');
  
  console.log('✅ STEP 3: Test Admin Access');
  console.log('============================');
  console.log('1. Sign in to your app with the admin credentials');
  console.log('2. Check if you can see the "Admin Panel" in the user menu');
  console.log('3. Try accessing /admin/dashboard');
  console.log('4. Verify admin permissions are working\n');
  
  console.log('🔒 Security Note');
  console.log('================');
  console.log('The current Firestore security rules require authentication to create user documents.');
  console.log('This is why the automated script fails. The manual approach above bypasses this');
  console.log('by creating the user document directly in the Firebase console.\n');
  
  console.log('📋 JSON Data (Copy-paste for Firestore)');
  console.log('=======================================');
  console.log(JSON.stringify(adminData, null, 2));
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🛡️  Manual Admin User Setup Guide

Usage:
  node scripts/create-admin-manual.js [email] [name] [userId]

Examples:
  node scripts/create-admin-manual.js
  node scripts/create-admin-manual.js admin@myschool.edu "School Admin"
  node scripts/create-admin-manual.js admin@duxe.com "DUXE Admin" admin-123

Default values:
  Email: admin@duxe.com
  Name: DUXE Administrator  
  User ID: admin-user-1
`);
  process.exit(0);
}

showAdminSetupGuide();
