import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
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

// Department templates for different types of universities
const departmentTemplates = {
  engineering: [
    { name: 'Computer Science and Engineering', shortName: 'CSE', code: 'CSE' },
    { name: 'Electronics and Communication Engineering', shortName: 'ECE', code: 'ECE' },
    { name: 'Electrical and Electronics Engineering', shortName: 'EEE', code: 'EEE' },
    { name: 'Mechanical Engineering', shortName: 'ME', code: 'ME' },
    { name: 'Civil Engineering', shortName: 'CE', code: 'CE' },
    { name: 'Chemical Engineering', shortName: 'ChE', code: 'CHE' },
    { name: 'Aerospace Engineering', shortName: 'AE', code: 'AE' },
    { name: 'Biotechnology', shortName: 'BT', code: 'BT' },
    { name: 'Information Technology', shortName: 'IT', code: 'IT' },
    { name: 'Electronics and Instrumentation', shortName: 'EI', code: 'EI' },
    { name: 'Production and Industrial Engineering', shortName: 'PIE', code: 'PIE' },
    { name: 'Materials Science and Engineering', shortName: 'MSE', code: 'MSE' },
    { name: 'Environmental Engineering', shortName: 'EnvE', code: 'ENVE' },
    { name: 'Petroleum Engineering', shortName: 'PE', code: 'PE' },
    { name: 'Mining Engineering', shortName: 'MinE', code: 'MINE' },
    { name: 'Ocean Engineering', shortName: 'OE', code: 'OE' },
    { name: 'Textile Engineering', shortName: 'TE', code: 'TE' },
    { name: 'Metallurgical Engineering', shortName: 'MetE', code: 'METE' }
  ],
  
  sciences: [
    { name: 'Physics', shortName: 'Physics', code: 'PHY' },
    { name: 'Chemistry', shortName: 'Chemistry', code: 'CHEM' },
    { name: 'Mathematics', shortName: 'Mathematics', code: 'MATH' },
    { name: 'Biology', shortName: 'Biology', code: 'BIO' },
    { name: 'Statistics', shortName: 'Statistics', code: 'STAT' },
    { name: 'Environmental Science', shortName: 'Env Sci', code: 'ENVS' },
    { name: 'Geology', shortName: 'Geology', code: 'GEO' }
  ],
  
  management: [
    { name: 'Master of Business Administration', shortName: 'MBA', code: 'MBA' },
    { name: 'Master of Computer Applications', shortName: 'MCA', code: 'MCA' },
    { name: 'Bachelor of Business Administration', shortName: 'BBA', code: 'BBA' },
    { name: 'Bachelor of Computer Applications', shortName: 'BCA', code: 'BCA' },
    { name: 'Commerce', shortName: 'Commerce', code: 'COM' },
    { name: 'Economics', shortName: 'Economics', code: 'ECO' },
    { name: 'Finance and Accounting', shortName: 'Finance', code: 'FIN' }
  ],
  
  arts: [
    { name: 'English Literature', shortName: 'English', code: 'ENG' },
    { name: 'Hindi Literature', shortName: 'Hindi', code: 'HIN' },
    { name: 'History', shortName: 'History', code: 'HIST' },
    { name: 'Political Science', shortName: 'Pol Sci', code: 'POLS' },
    { name: 'Sociology', shortName: 'Sociology', code: 'SOC' },
    { name: 'Psychology', shortName: 'Psychology', code: 'PSY' },
    { name: 'Philosophy', shortName: 'Philosophy', code: 'PHIL' },
    { name: 'Journalism and Mass Communication', shortName: 'JMC', code: 'JMC' }
  ],
  
  medical: [
    { name: 'Medicine', shortName: 'MBBS', code: 'MBBS' },
    { name: 'Dental Surgery', shortName: 'BDS', code: 'BDS' },
    { name: 'Pharmacy', shortName: 'B.Pharm', code: 'PHARM' },
    { name: 'Nursing', shortName: 'Nursing', code: 'NURS' },
    { name: 'Physiotherapy', shortName: 'Physio', code: 'PHYSIO' },
    { name: 'Veterinary Science', shortName: 'B.V.Sc', code: 'VET' }
  ],
  
  law: [
    { name: 'Bachelor of Laws', shortName: 'LLB', code: 'LLB' },
    { name: 'Master of Laws', shortName: 'LLM', code: 'LLM' },
    { name: 'Bachelor of Arts + Bachelor of Laws', shortName: 'BA LLB', code: 'BALLB' },
    { name: 'Bachelor of Business Administration + Bachelor of Laws', shortName: 'BBA LLB', code: 'BBALLB' }
  ]
};

// University type mapping - determines which departments each university gets
const universityDepartmentMapping = {
  'IIT': ['engineering', 'sciences', 'management'],
  'NIT': ['engineering', 'sciences', 'management'],
  'IIIT': ['engineering', 'sciences', 'management'],
  'Private': ['engineering', 'sciences', 'management', 'arts', 'law'],
  'Central': ['engineering', 'sciences', 'management', 'arts', 'law', 'medical'],
  'State': ['engineering', 'sciences', 'management', 'arts', 'law', 'medical']
};

async function getUniversities() {
  console.log('🏫 Fetching universities...');
  const universitiesSnapshot = await getDocs(collection(db, 'universities'));
  const universities = [];
  
  universitiesSnapshot.forEach((doc) => {
    universities.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`✅ Found ${universities.length} universities`);
  return universities;
}

async function populateDepartments() {
  console.log('🏢 Starting departments population...');
  
  try {
    const universities = await getUniversities();
    let departmentCount = 0;
    
    // Process universities in batches to avoid Firestore limits
    const batchSize = 10;
    for (let i = 0; i < universities.length; i += batchSize) {
      const batch = writeBatch(db);
      const universitiesBatch = universities.slice(i, i + batchSize);
      
      for (const university of universitiesBatch) {
        const departmentCategories = universityDepartmentMapping[university.type] || ['engineering', 'sciences'];
        
        departmentCategories.forEach(category => {
          const departments = departmentTemplates[category] || [];
          
          departments.forEach((dept, index) => {
            const departmentId = `${university.id}-${dept.code.toLowerCase()}`;
            const docRef = doc(db, 'departments', departmentId);
            
            batch.set(docRef, {
              id: departmentId,
              name: dept.name,
              shortName: dept.shortName,
              code: dept.code,
              uniId: university.id,
              uniName: university.shortName,
              category: category,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            departmentCount++;
          });
        });
      }
      
      await batch.commit();
      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(universities.length / batchSize)}`);
    }
    
    console.log(`🎉 Successfully populated ${departmentCount} departments across ${universities.length} universities!`);
    
    // Log summary by category
    const summary = {};
    Object.entries(departmentTemplates).forEach(([category, depts]) => {
      const relevantUniversities = universities.filter(uni => 
        universityDepartmentMapping[uni.type]?.includes(category)
      ).length;
      summary[category] = depts.length * relevantUniversities;
    });
    
    console.log('📊 Department Summary:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} departments`);
    });
    
  } catch (error) {
    console.error('❌ Error populating departments:', error);
  }
}

// Run the population script
populateDepartments()
  .then(() => {
    console.log('🎉 Departments population completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to populate departments:', error);
    process.exit(1);
  });