import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  // You'll need to add your Firebase config here
  // Copy from src/services/firebase.js
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeUserAdmin(email) {
  try {
    console.log(`Making ${email} an admin...`);
    
    // You'll need to get the user's UID first
    // This is a simplified example - in production, you'd query by email
    const userEmail = email.toLowerCase();
    
    console.log(`
    ⚠️  Manual Step Required:
    
    1. Go to Firebase Console: https://console.firebase.google.com
    2. Select your project
    3. Go to Firestore Database
    4. Find the 'users' collection
    5. Look for the user with email: ${userEmail}
    6. Click on their document
    7. Edit the 'role' field and change it to: admin
    8. Save the changes
    
    After making this change:
    - Log out and log back in on your website
    - You should see "Upload" and "Review" links in the navbar
    - You'll see an "Admin" badge next to your name
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js admin@duxe.com');
} else {
  makeUserAdmin(email);
}