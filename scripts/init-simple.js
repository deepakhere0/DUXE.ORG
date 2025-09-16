// Simplified Firestore Database Initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env.local');
config({ path: envPath });

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

console.log('🚀 Starting Firestore Database Initialization...');
console.log('Project ID:', firebaseConfig.projectId);

async function createUniversity() {
  const data = {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    location: "Cambridge, MA",
    country: "USA"
  };
  
  await setDoc(doc(db, "universities", "mit"), data);
  console.log('✅ Created universities/mit');
}

async function createSampleNote() {
  const data = {
    title: "Introduction to Algorithms - Sample",
    courseCode: "6.006",
    universityId: "mit",
    departmentId: "mit-cs",
    subject: "Computer Science",
    semester: "Fall 2024",
    pages: 25,
    authorName: "Test Author",
    fileUrl: "https://example.com/sample.pdf",
    status: "approved",
    ratingAvg: 4.8,
    downloads: 100,
    createdAt: serverTimestamp(),
    createdBy: "user1"
  };
  
  const docRef = await addDoc(collection(db, "notes"), data);
  console.log('✅ Created notes/' + docRef.id);
}

async function createSampleUser() {
  const data = {
    uid: "test-user-1",
    displayName: "Test User",
    email: "test@duxe.com",
    role: "student",
    skills: ["JavaScript", "React"],
    bookmarks: [],
    university: "mit",
    department: "mit-cs",
    year: "Junior"
  };
  
  await setDoc(doc(db, "users", "test-user-1"), data);
  console.log('✅ Created users/test-user-1');
}

try {
  await createUniversity();
  await createSampleNote();
  await createSampleUser();
  
  console.log('🎉 Database initialization completed successfully!');
  console.log('🔗 Check Firebase Console: https://console.firebase.google.com/project/duxe-5c071/firestore');
} catch (error) {
  console.error('❌ Error:', error);
}
