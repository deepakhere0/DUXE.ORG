import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration
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
const db = getFirestore(app);

async function checkNotes() {
  console.log('🔍 Checking notes in database...\n');
  console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
  console.log('');

  try {
    const notesRef = collection(db, 'notes');
    const snapshot = await getDocs(notesRef);

    if (snapshot.empty) {
      console.log('❌ No notes found in database!');
      console.log('\n💡 Next steps:');
      console.log('   1. Make sure you have notes in Firestore');
      console.log('   2. Or create sample notes: node scripts/create-sample-notes.js');
      return;
    }

    console.log(`📊 Found ${snapshot.size} notes in database\n`);
    console.log('='.repeat(80));

    let validCount = 0;
    let invalidCount = 0;
    let missingCount = 0;

    snapshot.forEach((doc) => {
      const noteData = doc.data();
      const fileUrl = noteData.fileUrl || '';

      console.log(`\n📝 Note: ${noteData.title || 'Untitled'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${noteData.status || 'N/A'}`);
      console.log(`   File URL: ${fileUrl || '❌ MISSING'}`);
      console.log(`   File Type: ${noteData.fileType || 'N/A'}`);

      if (!fileUrl) {
        console.log(`   ⚠️  NO URL - This note has no file attached`);
        missingCount++;
      } else if (fileUrl.includes('example.com') || fileUrl.includes('placeholder') || !fileUrl.startsWith('http')) {
        console.log(`   ❌ INVALID - This is a fake/placeholder URL`);
        invalidCount++;
      } else {
        console.log(`   ✅ VALID - URL looks good`);
        validCount++;
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 Summary:');
    console.log(`   Total notes: ${snapshot.size}`);
    console.log(`   ✅ Valid URLs: ${validCount}`);
    console.log(`   ❌ Invalid URLs: ${invalidCount}`);
    console.log(`   ⚠️  Missing URLs: ${missingCount}`);
    console.log('='.repeat(80));

    if (invalidCount > 0 || missingCount > 0) {
      console.log('\n🔧 Action needed:');
      console.log('   Run: node scripts/fix-note-urls.js');
      console.log('   This will fix all invalid URLs automatically.');
    } else {
      console.log('\n✅ All notes have valid URLs!');
    }

  } catch (error) {
    console.error('\n❌ Error accessing database:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env.local file has correct Firebase credentials');
    console.error('   2. Make sure you have internet connection');
    console.error('   3. Verify your Firebase project exists');
    console.error('   4. Check Firestore is enabled in Firebase Console');
  }
}

// Run the check
console.log('🚀 Starting Database Check...\n');
checkNotes()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
