import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
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

// Top 50 Indian universities data
const universities = [
  // IITs
  { id: 'iit-bombay', name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', type: 'IIT' },
  { id: 'iit-delhi', name: 'Indian Institute of Technology Delhi', shortName: 'IIT Delhi', type: 'IIT' },
  { id: 'iit-kanpur', name: 'Indian Institute of Technology Kanpur', shortName: 'IIT Kanpur', type: 'IIT' },
  { id: 'iit-kharagpur', name: 'Indian Institute of Technology Kharagpur', shortName: 'IIT Kharagpur', type: 'IIT' },
  { id: 'iit-madras', name: 'Indian Institute of Technology Madras', shortName: 'IIT Madras', type: 'IIT' },
  { id: 'iit-roorkee', name: 'Indian Institute of Technology Roorkee', shortName: 'IIT Roorkee', type: 'IIT' },
  { id: 'iit-guwahati', name: 'Indian Institute of Technology Guwahati', shortName: 'IIT Guwahati', type: 'IIT' },
  { id: 'iit-hyderabad', name: 'Indian Institute of Technology Hyderabad', shortName: 'IIT Hyderabad', type: 'IIT' },
  { id: 'iit-indore', name: 'Indian Institute of Technology Indore', shortName: 'IIT Indore', type: 'IIT' },
  { id: 'iit-bhubaneswar', name: 'Indian Institute of Technology Bhubaneswar', shortName: 'IIT Bhubaneswar', type: 'IIT' },

  // NITs
  { id: 'nit-trichy', name: 'National Institute of Technology Tiruchirappalli', shortName: 'NIT Trichy', type: 'NIT' },
  { id: 'nit-surathkal', name: 'National Institute of Technology Karnataka', shortName: 'NIT Surathkal', type: 'NIT' },
  { id: 'nit-warangal', name: 'National Institute of Technology Warangal', shortName: 'NIT Warangal', type: 'NIT' },
  { id: 'nit-rourkela', name: 'National Institute of Technology Rourkela', shortName: 'NIT Rourkela', type: 'NIT' },
  { id: 'nit-kurukshetra', name: 'National Institute of Technology Kurukshetra', shortName: 'NIT Kurukshetra', type: 'NIT' },
  { id: 'nit-calicut', name: 'National Institute of Technology Calicut', shortName: 'NIT Calicut', type: 'NIT' },
  { id: 'nit-durgapur', name: 'National Institute of Technology Durgapur', shortName: 'NIT Durgapur', type: 'NIT' },
  { id: 'nit-jaipur', name: 'Malaviya National Institute of Technology Jaipur', shortName: 'NIT Jaipur', type: 'NIT' },

  // IIITs
  { id: 'iiit-hyderabad', name: 'International Institute of Information Technology Hyderabad', shortName: 'IIIT Hyderabad', type: 'IIIT' },
  { id: 'iiit-bangalore', name: 'International Institute of Information Technology Bangalore', shortName: 'IIIT Bangalore', type: 'IIIT' },
  { id: 'iiit-delhi', name: 'Indraprastha Institute of Information Technology Delhi', shortName: 'IIIT Delhi', type: 'IIIT' },
  { id: 'iiit-allahabad', name: 'Indian Institute of Information Technology Allahabad', shortName: 'IIIT Allahabad', type: 'IIIT' },

  // Private Universities
  { id: 'bits-pilani', name: 'Birla Institute of Technology and Science Pilani', shortName: 'BITS Pilani', type: 'Private' },
  { id: 'bits-goa', name: 'Birla Institute of Technology and Science Goa', shortName: 'BITS Goa', type: 'Private' },
  { id: 'bits-hyderabad', name: 'Birla Institute of Technology and Science Hyderabad', shortName: 'BITS Hyderabad', type: 'Private' },
  { id: 'vit-vellore', name: 'Vellore Institute of Technology', shortName: 'VIT Vellore', type: 'Private' },
  { id: 'vit-chennai', name: 'VIT University Chennai', shortName: 'VIT Chennai', type: 'Private' },
  { id: 'srm-chennai', name: 'SRM Institute of Science and Technology', shortName: 'SRM Chennai', type: 'Private' },
  { id: 'manipal', name: 'Manipal Institute of Technology', shortName: 'Manipal', type: 'Private' },
  { id: 'amity-noida', name: 'Amity University Noida', shortName: 'Amity Noida', type: 'Private' },
  { id: 'lpu', name: 'Lovely Professional University', shortName: 'LPU', type: 'Private' },
  { id: 'christ-bangalore', name: 'Christ University Bangalore', shortName: 'Christ Bangalore', type: 'Private' },
  { id: 'jiit-noida', name: 'Jaypee Institute of Information Technology', shortName: 'JIIT Noida', type: 'Private' },
  { id: 'thapar', name: 'Thapar Institute of Engineering and Technology', shortName: 'Thapar University', type: 'Private' },

  // State Universities
  { id: 'anna-university', name: 'Anna University', shortName: 'Anna University', type: 'State' },
  { id: 'jadavpur', name: 'Jadavpur University', shortName: 'Jadavpur University', type: 'State' },
  { id: 'du', name: 'University of Delhi', shortName: 'Delhi University', type: 'Central' },
  { id: 'bhu', name: 'Banaras Hindu University', shortName: 'BHU', type: 'Central' },
  { id: 'jnu', name: 'Jawaharlal Nehru University', shortName: 'JNU', type: 'Central' },
  { id: 'jamia', name: 'Jamia Millia Islamia', shortName: 'Jamia', type: 'Central' },
  { id: 'amu', name: 'Aligarh Muslim University', shortName: 'AMU', type: 'Central' },
  { id: 'pondicherry', name: 'Pondicherry University', shortName: 'Pondicherry University', type: 'Central' },
  { id: 'hyderabad-central', name: 'University of Hyderabad', shortName: 'HCU', type: 'Central' },
  { id: 'iit-ism', name: 'Indian Institute of Technology (ISM) Dhanbad', shortName: 'IIT ISM', type: 'IIT' },
  { id: 'iit-mandi', name: 'Indian Institute of Technology Mandi', shortName: 'IIT Mandi', type: 'IIT' },
  { id: 'iit-gandhinagar', name: 'Indian Institute of Technology Gandhinagar', shortName: 'IIT Gandhinagar', type: 'IIT' },
  { id: 'iit-jodhpur', name: 'Indian Institute of Technology Jodhpur', shortName: 'IIT Jodhpur', type: 'IIT' },
  { id: 'iit-patna', name: 'Indian Institute of Technology Patna', shortName: 'IIT Patna', type: 'IIT' },
  { id: 'iit-ropar', name: 'Indian Institute of Technology Ropar', shortName: 'IIT Ropar', type: 'IIT' },
  { id: 'iit-bhilai', name: 'Indian Institute of Technology Bhilai', shortName: 'IIT Bhilai', type: 'IIT' },
  { id: 'dtu', name: 'Delhi Technological University', shortName: 'DTU', type: 'State' },
  { id: 'nsut', name: 'Netaji Subhas University of Technology', shortName: 'NSUT', type: 'State' },
  { id: 'pec-chandigarh', name: 'Punjab Engineering College', shortName: 'PEC Chandigarh', type: 'State' }
];

async function populateUniversities() {
  console.log('🏫 Starting universities population...');
  
  try {
    const batch = writeBatch(db);
    
    universities.forEach((university) => {
      const docRef = doc(db, 'universities', university.id);
      batch.set(docRef, {
        ...university,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      });
    });
    
    await batch.commit();
    console.log(`✅ Successfully populated ${universities.length} universities!`);
    
    // Log summary
    const summary = universities.reduce((acc, uni) => {
      acc[uni.type] = (acc[uni.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} universities`);
    });
    
  } catch (error) {
    console.error('❌ Error populating universities:', error);
  }
}

// Run the population script
populateUniversities()
  .then(() => {
    console.log('🎉 Universities population completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to populate universities:', error);
    process.exit(1);
  });