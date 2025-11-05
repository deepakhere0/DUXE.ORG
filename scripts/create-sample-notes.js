import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

// Sample pending notes data with real working PDF URLs
const sampleNotes = [
  {
    title: 'Data Structures and Algorithms - Complete Notes',
    courseCode: 'CSE201',
    universityId: 'iit-bombay',
    departmentId: 'dept-cse-iit-bombay',
    semester: 3,
    authorName: 'Rahul Sharma',
    createdBy: 'sample_student_uid_1',
    status: 'pending',
    // Using Mozilla's PDF.js sample PDF (publicly accessible)
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    fileType: 'application/pdf',
    description: 'Comprehensive notes covering arrays, linked lists, trees, and sorting algorithms',
    pages: 45,
    fileSize: 2048576, // 2MB
    downloads: 0,
    ratingAvg: 0,
    ratingCount: 0
  },
  {
    title: 'Database Management Systems - SQL and NoSQL',
    courseCode: 'CSE301',
    universityId: 'iit-delhi',
    departmentId: 'dept-cse-iit-delhi',
    semester: 5,
    authorName: 'Priya Singh',
    createdBy: 'sample_student_uid_2',
    status: 'pending',
    // Using a public PDF from the web
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'application/pdf',
    description: 'Complete guide to database design, normalization, and query optimization',
    pages: 78,
    fileSize: 3145728, // 3MB
    downloads: 0,
    ratingAvg: 0,
    ratingCount: 0
  },
  {
    title: 'Machine Learning Fundamentals',
    courseCode: 'CSE401',
    universityId: 'bits-pilani',
    departmentId: 'dept-cse-bits-pilani',
    semester: 7,
    authorName: 'Arjun Patel',
    createdBy: 'sample_student_uid_3',
    status: 'pending',
    // Using PDF.js sample
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    fileType: 'application/pdf',
    description: 'Introduction to ML algorithms, supervised and unsupervised learning',
    pages: 92,
    fileSize: 4194304, // 4MB
    downloads: 0,
    ratingAvg: 0,
    ratingCount: 0
  },
  {
    title: 'Operating Systems Concepts',
    courseCode: 'CSE202',
    universityId: 'nit-trichy',
    departmentId: 'dept-cse-nit-trichy',
    semester: 4,
    authorName: 'Sneha Gupta',
    createdBy: 'sample_student_uid_4',
    status: 'pending',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'application/pdf',
    description: 'Process management, memory management, and file systems',
    pages: 67,
    fileSize: 2621440, // 2.5MB
    downloads: 0,
    ratingAvg: 0,
    ratingCount: 0
  },
  {
    title: 'Computer Networks and Security',
    courseCode: 'CSE302',
    universityId: 'vit-vellore',
    departmentId: 'dept-cse-vit-vellore',
    semester: 6,
    authorName: 'Vikram Kumar',
    createdBy: 'sample_student_uid_5',
    status: 'pending',
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    fileType: 'application/pdf',
    description: 'Network protocols, OSI model, and cybersecurity fundamentals',
    pages: 55,
    fileSize: 2883584, // 2.75MB
    downloads: 0,
    ratingAvg: 0,
    ratingCount: 0
  }
];

async function createSampleNotes() {
  console.log('📝 Creating sample pending notes for admin dashboard testing...');
  
  try {
    for (const [index, noteData] of sampleNotes.entries()) {
      const noteId = `sample_note_${index + 1}`;
      const noteRef = doc(db, 'notes', noteId);
      
      await setDoc(noteRef, {
        ...noteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Created note: ${noteData.title}`);
    }
    
    console.log(`\n🎉 Successfully created ${sampleNotes.length} sample notes!`);
    console.log('\n📊 Summary:');
    console.log(`   Total Notes: ${sampleNotes.length}`);
    console.log(`   Status: All set to "pending"`);
    console.log(`   Universities: ${new Set(sampleNotes.map(n => n.universityId)).size} different universities`);
    console.log(`   Departments: ${new Set(sampleNotes.map(n => n.departmentId)).size} different departments`);
    console.log('\n🚀 You can now test the admin dashboard at /admin');
    console.log('📝 Remember to update the ADMIN_UID in AdminRoute.jsx with your Firebase Auth UID');
    
  } catch (error) {
    console.error('❌ Error creating sample notes:', error);
  }
}

// Run the script
createSampleNotes()
  .then(() => {
    console.log('\n✨ Sample notes creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create sample notes:', error);
    process.exit(1);
  });