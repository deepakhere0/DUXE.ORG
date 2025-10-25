/**
 * Script to add price to an existing note for testing
 * Run with: node scripts/addPriceToNote.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, limit, getDocs, doc, updateDoc } from 'firebase/firestore';

// Import your Firebase config
// You'll need to replace this with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can find it in src/services/firebase.js
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addPriceToFirstNote() {
  try {
    console.log('🔍 Finding first approved note...');

    // Get first approved note
    const notesQuery = query(
      collection(db, 'notes'),
      limit(1)
    );

    const snapshot = await getDocs(notesQuery);

    if (snapshot.empty) {
      console.log('❌ No notes found in database');
      return;
    }

    const noteDoc = snapshot.docs[0];
    const noteData = noteDoc.data();

    console.log(`✅ Found note: "${noteData.title}"`);
    console.log(`📝 ID: ${noteDoc.id}`);

    // Add price
    const price = 50; // ₹50

    console.log(`\n💰 Setting price to ₹${price}...`);

    await updateDoc(doc(db, 'notes', noteDoc.id), {
      price: price,
      purchaseCount: 0,
      totalRevenue: 0,
      updatedAt: new Date().toISOString()
    });

    console.log(`\n✅ SUCCESS! Price updated to ₹${price}`);
    console.log('\n📋 Next steps:');
    console.log('1. Go to Admin Review page');
    console.log('2. You should see an orange "₹50" badge on the note');
    console.log('3. Click "Edit Price" button to change it');
    console.log('4. Click "View Purchasers" after someone buys it');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addPriceToFirstNote();
