/**
 * Backfill Script: Add price field to all notes that are missing it
 *
 * This script adds the following fields to notes documents:
 * - price: 0 (default)
 * - purchaseCount: 0
 * - totalRevenue: 0
 *
 * Usage:
 * 1. Update firebaseConfig below with your project credentials
 * 2. Run: node scripts/backfillPrices.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// ⚠️ REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
// Get these values from: src/services/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Main backfill function
 */
async function backfillPrices() {
  try {
    console.log('🔍 Starting backfill process...\n');
    console.log('📦 Fetching all notes from Firestore...');

    // Get all notes
    const notesRef = collection(db, 'notes');
    const snapshot = await getDocs(notesRef);

    console.log(`✅ Found ${snapshot.size} notes total\n`);

    let updatedCount = 0;
    let alreadyHavePrice = 0;
    let errorCount = 0;

    // Process each note
    for (const noteDoc of snapshot.docs) {
      const data = noteDoc.data();
      const noteId = noteDoc.id;

      try {
        // Check if price field exists and is valid
        if (data.price === undefined || data.price === null) {
          console.log(`⚙️  Updating note: ${noteId}`);
          console.log(`   Title: "${data.title || 'Untitled'}"`);

          // Update the note with default price fields
          await updateDoc(doc(db, 'notes', noteId), {
            price: 0,
            purchaseCount: data.purchaseCount !== undefined ? data.purchaseCount : 0,
            totalRevenue: data.totalRevenue !== undefined ? data.totalRevenue : 0,
            updatedAt: new Date().toISOString()
          });

          console.log(`   ✓ Set price: 0, purchaseCount: 0, totalRevenue: 0\n`);
          updatedCount++;
        } else {
          console.log(`✓ Note ${noteId} already has price: ${data.price}`);
          alreadyHavePrice++;
        }
      } catch (error) {
        console.error(`❌ Error updating note ${noteId}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully updated: ${updatedCount} notes`);
    console.log(`✓  Already had price:   ${alreadyHavePrice} notes`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered:  ${errorCount} notes`);
    }
    console.log(`📝 Total processed:     ${snapshot.size} notes`);
    console.log('='.repeat(50) + '\n');

    if (updatedCount > 0) {
      console.log('🎉 Backfill completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Go to Admin Review Panel: http://localhost:5173/admin/review');
      console.log('2. Refresh the page (F5)');
      console.log('3. You should see "FREE" badges on all notes');
      console.log('4. Click "Edit Price" to set actual prices\n');
    } else {
      console.log('ℹ️  No notes needed updating. All notes already have price field.\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during backfill:');
    console.error(error);
    console.error('\n💡 Common issues:');
    console.error('1. Firebase config is incorrect (check apiKey, projectId, etc.)');
    console.error('2. Network connection issues');
    console.error('3. Firestore rules denying access');
    process.exit(1);
  }

  process.exit(0);
}

// Run the backfill
console.log('\n' + '='.repeat(50));
console.log('🚀 FIRESTORE PRICE BACKFILL SCRIPT');
console.log('='.repeat(50) + '\n');

backfillPrices();
