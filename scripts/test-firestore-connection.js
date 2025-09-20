import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
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

console.log('🔥 Testing Firestore connection...');
console.log(`📡 Project ID: ${firebaseConfig.projectId}`);

async function testFirestoreConnection() {
  try {
    console.log('\n1️⃣ Testing basic connection...');
    
    // Try to create a simple test document
    const testDocRef = doc(db, 'test', 'connection-test');
    await setDoc(testDocRef, {
      message: 'Firestore connection successful!',
      timestamp: new Date().toISOString(),
      test: true
    });
    
    console.log('✅ Successfully wrote test document');
    
    // Try to read the document back
    const docSnap = await getDoc(testDocRef);
    
    if (docSnap.exists()) {
      console.log('✅ Successfully read test document:', docSnap.data());
    } else {
      console.log('❌ Test document not found');
      return false;
    }
    
    console.log('\n2️⃣ Testing collection operations...');
    
    // Try to add a document to a collection
    const testCollectionRef = collection(db, 'test-collection');
    const docRef = await addDoc(testCollectionRef, {
      testData: 'This is a test collection document',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Successfully created document in collection:', docRef.id);
    
    console.log('\n🎉 Firestore connection test PASSED!');
    console.log('\n✨ Your Firestore database is ready for use!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Sign in to your app at http://localhost:5000');
    console.log('   2. Visit http://localhost:5000/debug to get your UID');
    console.log('   3. Update AdminRoute.jsx with your UID');
    console.log('   4. Run the population scripts');
    console.log('   5. Test the admin dashboard at /admin');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Firestore connection test FAILED:');
    console.error('Error:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔒 Permission Error Solutions:');
      console.log('   1. Make sure Firestore is created in Firebase Console');
      console.log('   2. Check that Firestore rules allow writes');
      console.log('   3. Visit: https://console.firebase.google.com/project/duxe-5c071/firestore');
    }
    
    if (error.code === 'not-found') {
      console.log('\n🚨 Database Not Found Solutions:');
      console.log('   1. Go to Firebase Console: https://console.firebase.google.com/project/duxe-5c071');
      console.log('   2. Click "Firestore Database" in sidebar');
      console.log('   3. Click "Create database"');
      console.log('   4. Select "Start in test mode"');
      console.log('   5. Choose us-central1 region');
    }
    
    return false;
  }
}

// Run the test
testFirestoreConnection()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });