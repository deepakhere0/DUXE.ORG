import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
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

// Real working PDF URLs
const workingPDFs = [
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
];

async function fixNoteURLs() {
  console.log('🔍 Searching for notes with fake/invalid URLs...\n');

  try {
    // Get all notes
    const notesRef = collection(db, 'notes');
    const snapshot = await getDocs(notesRef);

    if (snapshot.empty) {
      console.log('❌ No notes found in database.');
      console.log('\n💡 You may need to create sample notes first:');
      console.log('   Run: node scripts/create-sample-notes.js');
      return;
    }

    console.log(`📊 Found ${snapshot.size} notes in database\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    const notesToFix = [];

    // Check each note for fake URLs
    snapshot.forEach((docSnap) => {
      const noteData = docSnap.data();
      const fileUrl = noteData.fileUrl || '';

      // Check if URL is fake/invalid
      const isFakeUrl = fileUrl.includes('example.com') ||
                       fileUrl.includes('placeholder') ||
                       !fileUrl.startsWith('http');

      if (isFakeUrl || !fileUrl) {
        notesToFix.push({
          id: docSnap.id,
          title: noteData.title,
          currentUrl: fileUrl || 'NO URL',
        });
      } else {
        skippedCount++;
        console.log(`✅ ${noteData.title}: Already has valid URL`);
      }
    });

    if (notesToFix.length === 0) {
      console.log('\n🎉 All notes already have valid URLs!');
      return;
    }

    console.log(`\n🔧 Found ${notesToFix.length} notes that need fixing:\n`);

    // Fix each note
    for (let i = 0; i < notesToFix.length; i++) {
      const note = notesToFix[i];
      const newUrl = workingPDFs[i % workingPDFs.length]; // Alternate between PDFs

      console.log(`📝 Fixing: ${note.title}`);
      console.log(`   Old URL: ${note.currentUrl}`);
      console.log(`   New URL: ${newUrl}`);

      try {
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, {
          fileUrl: newUrl,
          fileType: 'application/pdf',
          updatedAt: new Date().toISOString()
        });

        fixedCount++;
        console.log(`   ✅ Updated successfully!\n`);
      } catch (error) {
        console.error(`   ❌ Failed to update: ${error.message}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total notes: ${snapshot.size}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already valid: ${skippedCount}`);
    console.log(`   Failed: ${notesToFix.length - fixedCount}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✨ Notes have been updated with working PDF URLs!');
      console.log('🎯 Try clicking "Preview" on any note now.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\n💡 Make sure you have:');
    console.error('   1. Created .env.local with your Firebase credentials');
    console.error('   2. Installed dependencies: npm install');
    console.error('   3. Have internet connection to access Firebase');
  }
}

// Run the script
console.log('🚀 Starting URL Fix Script...\n');
fixNoteURLs()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
