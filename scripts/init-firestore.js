// Firestore Database Initialization Script
// This script initializes all collections with sample data for DUXE Student Platform

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  enableNetwork 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB13RVT0Fvxmp4g1Vp2BM8PQtTO1bsprMs",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "duxe-5c071.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "duxe-5c071",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "duxe-5c071.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976144847500",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:976144847500:web:08de97c6f42024650161a9",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RPKC7R4W2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function to create document with ID
async function createDoc(collectionName, docId, data) {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    console.log(`✅ Created ${collectionName}/${docId}`);
  } catch (error) {
    console.error(`❌ Error creating ${collectionName}/${docId}:`, error);
  }
}

// Utility function to add document without specifying ID
async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log(`✅ Created ${collectionName}/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Error adding to ${collectionName}:`, error);
    return null;
  }
}

// Initialize Universities Collection
async function initUniversities() {
  console.log('\n🏫 Initializing Universities Collection...');
  
  const universities = [
    {
      id: "mit",
      name: "Massachusetts Institute of Technology",
      shortName: "MIT",
      location: "Cambridge, MA",
      country: "USA",
      established: 1861,
      website: "https://web.mit.edu",
      type: "Private",
      ranking: 1
    },
    {
      id: "stanford",
      name: "Stanford University", 
      shortName: "Stanford",
      location: "Stanford, CA",
      country: "USA",
      established: 1885,
      website: "https://stanford.edu",
      type: "Private",
      ranking: 2
    },
    {
      id: "harvard",
      name: "Harvard University",
      shortName: "Harvard",
      location: "Cambridge, MA", 
      country: "USA",
      established: 1636,
      website: "https://harvard.edu",
      type: "Private",
      ranking: 3
    },
    {
      id: "berkeley",
      name: "University of California, Berkeley",
      shortName: "UC Berkeley",
      location: "Berkeley, CA",
      country: "USA", 
      established: 1868,
      website: "https://berkeley.edu",
      type: "Public",
      ranking: 4
    },
    {
      id: "oxford",
      name: "University of Oxford",
      shortName: "Oxford",
      location: "Oxford",
      country: "UK",
      established: 1096,
      website: "https://ox.ac.uk",
      type: "Public",
      ranking: 5
    }
  ];

  for (const uni of universities) {
    await createDoc("universities", uni.id, uni);
  }
}

// Initialize Departments Collection
async function initDepartments() {
  console.log('\n🏛️ Initializing Departments Collection...');
  
  const departments = [
    // MIT Departments
    { id: "mit-cs", name: "Computer Science", uniId: "mit", code: "6", description: "Computer Science and Engineering" },
    { id: "mit-ee", name: "Electrical Engineering", uniId: "mit", code: "6", description: "Electrical Engineering and Computer Science" },
    { id: "mit-me", name: "Mechanical Engineering", uniId: "mit", code: "2", description: "Mechanical Engineering" },
    { id: "mit-math", name: "Mathematics", uniId: "mit", code: "18", description: "Mathematics Department" },
    
    // Stanford Departments
    { id: "stanford-cs", name: "Computer Science", uniId: "stanford", code: "CS", description: "Computer Science Department" },
    { id: "stanford-ee", name: "Electrical Engineering", uniId: "stanford", code: "EE", description: "Electrical Engineering" },
    { id: "stanford-ms", name: "Management Science", uniId: "stanford", code: "MS&E", description: "Management Science & Engineering" },
    
    // Harvard Departments
    { id: "harvard-cs", name: "Computer Science", uniId: "harvard", code: "CS", description: "Computer Science" },
    { id: "harvard-applied-math", name: "Applied Mathematics", uniId: "harvard", code: "AM", description: "Applied Mathematics" },
    { id: "harvard-physics", name: "Physics", uniId: "harvard", code: "PHYS", description: "Physics Department" },
    
    // UC Berkeley Departments
    { id: "berkeley-eecs", name: "EECS", uniId: "berkeley", code: "EECS", description: "Electrical Engineering & Computer Sciences" },
    { id: "berkeley-me", name: "Mechanical Engineering", uniId: "berkeley", code: "ME", description: "Mechanical Engineering" },
    { id: "berkeley-math", name: "Mathematics", uniId: "berkeley", code: "MATH", description: "Mathematics" },
    
    // Oxford Departments
    { id: "oxford-cs", name: "Computer Science", uniId: "oxford", code: "CS", description: "Department of Computer Science" },
    { id: "oxford-eng", name: "Engineering Science", uniId: "oxford", code: "ENG", description: "Department of Engineering Science" },
    { id: "oxford-math", name: "Mathematical Institute", uniId: "oxford", code: "MATH", description: "Mathematical Institute" }
  ];

  for (const dept of departments) {
    await createDoc("departments", dept.id, dept);
  }
}

// Initialize Notes Collection
async function initNotes() {
  console.log('\n📚 Initializing Notes Collection...');
  
  const notes = [
    {
      title: "Introduction to Algorithms - Sorting",
      courseCode: "6.006",
      universityId: "mit",
      departmentId: "mit-cs", 
      subject: "Computer Science",
      semester: "Fall 2024",
      pages: 25,
      authorName: "Prof. Erik Demaine",
      fileUrl: "https://example.com/notes/algorithms-sorting.pdf",
      status: "approved",
      ratingAvg: 4.8,
      downloads: 1250,
      createdAt: serverTimestamp(),
      createdBy: "user1",
      tags: ["algorithms", "sorting", "computer science"],
      description: "Comprehensive notes on sorting algorithms including quicksort, mergesort, and heapsort."
    },
    {
      title: "Linear Algebra Fundamentals",
      courseCode: "18.06",
      universityId: "mit",
      departmentId: "mit-math",
      subject: "Mathematics", 
      semester: "Spring 2024",
      pages: 45,
      authorName: "Prof. Gilbert Strang",
      fileUrl: "https://example.com/notes/linear-algebra.pdf",
      status: "approved",
      ratingAvg: 4.9,
      downloads: 2100,
      createdAt: serverTimestamp(),
      createdBy: "user2",
      tags: ["linear algebra", "mathematics", "vectors", "matrices"],
      description: "Complete linear algebra notes covering vector spaces, eigenvalues, and transformations."
    },
    {
      title: "Machine Learning Basics",
      courseCode: "CS229",
      universityId: "stanford", 
      departmentId: "stanford-cs",
      subject: "Computer Science",
      semester: "Fall 2024",
      pages: 60,
      authorName: "Prof. Andrew Ng",
      fileUrl: "https://example.com/notes/ml-basics.pdf",
      status: "pending",
      ratingAvg: 0,
      downloads: 0,
      createdAt: serverTimestamp(),
      createdBy: "user3",
      tags: ["machine learning", "AI", "neural networks"],
      description: "Introduction to machine learning concepts, supervised and unsupervised learning."
    },
    {
      title: "Thermodynamics Laws",
      courseCode: "2.005",
      universityId: "mit",
      departmentId: "mit-me",
      subject: "Mechanical Engineering",
      semester: "Fall 2024", 
      pages: 30,
      authorName: "Prof. John Brisson",
      fileUrl: "https://example.com/notes/thermodynamics.pdf",
      status: "approved",
      ratingAvg: 4.3,
      downloads: 850,
      createdAt: serverTimestamp(),
      createdBy: "user4",
      tags: ["thermodynamics", "engineering", "physics"],
      description: "Detailed explanation of the four laws of thermodynamics with examples."
    },
    {
      title: "Database Systems Design",
      courseCode: "CS186",
      universityId: "berkeley",
      departmentId: "berkeley-eecs",
      subject: "Computer Science",
      semester: "Spring 2024",
      pages: 40,
      authorName: "Prof. Joe Hellerstein", 
      fileUrl: "https://example.com/notes/database-systems.pdf",
      status: "rejected",
      ratingAvg: 0,
      downloads: 0,
      createdAt: serverTimestamp(),
      createdBy: "user5",
      tags: ["database", "SQL", "systems"],
      description: "Database design principles, normalization, and query optimization."
    }
  ];

  for (const note of notes) {
    await addDocument("notes", note);
  }
}

// Initialize Internships Collection
async function initInternships() {
  console.log('\n💼 Initializing Internships Collection...');
  
  const internships = [
    {
      company: "Google",
      role: "Software Engineer Intern",
      location: "Mountain View, CA",
      type: "Summer",
      duration: "12 weeks",
      stipend: 8000,
      currency: "USD",
      skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning"],
      requirements: ["Computer Science student", "Strong programming skills", "GPA 3.5+"],
      applyUrl: "https://careers.google.com/jobs/results/123456789",
      description: "Work on cutting-edge projects in search, ads, or cloud computing.",
      postedAt: serverTimestamp(),
      deadline: new Date("2024-12-01"),
      remote: false,
      level: "Undergraduate"
    },
    {
      company: "Microsoft",
      role: "Data Science Intern",
      location: "Seattle, WA", 
      type: "Summer",
      duration: "12 weeks",
      stipend: 7500,
      currency: "USD",
      skills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Azure"],
      requirements: ["Statistics or CS background", "Experience with data analysis", "Strong analytical skills"],
      applyUrl: "https://careers.microsoft.com/students/us/en/job/123456",
      description: "Analyze large datasets to drive business insights and product decisions.",
      postedAt: serverTimestamp(),
      deadline: new Date("2024-11-15"),
      remote: true,
      level: "Graduate"
    },
    {
      company: "Tesla", 
      role: "Mechanical Engineering Intern",
      location: "Fremont, CA",
      type: "Summer",
      duration: "10 weeks", 
      stipend: 6500,
      currency: "USD",
      skills: ["CAD", "SolidWorks", "Manufacturing", "Mechanical Design", "Python"],
      requirements: ["Mechanical Engineering student", "CAD experience", "Interest in automotive"],
      applyUrl: "https://tesla.com/careers/search/job/123456",
      description: "Design and optimize manufacturing processes for electric vehicles.",
      postedAt: serverTimestamp(),
      deadline: new Date("2024-10-30"),
      remote: false,
      level: "Undergraduate"
    },
    {
      company: "Meta",
      role: "Frontend Developer Intern",
      location: "Menlo Park, CA",
      type: "Summer",
      duration: "12 weeks",
      stipend: 8500,
      currency: "USD", 
      skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML", "GraphQL"],
      requirements: ["Web development experience", "React knowledge", "Portfolio of projects"],
      applyUrl: "https://metacareers.com/jobs/123456789",
      description: "Build user interfaces for billions of users across Facebook, Instagram, and WhatsApp.",
      postedAt: serverTimestamp(),
      deadline: new Date("2024-11-30"),
      remote: true,
      level: "Undergraduate"
    },
    {
      company: "OpenAI",
      role: "AI Research Intern",
      location: "San Francisco, CA",
      type: "Summer",
      duration: "16 weeks",
      stipend: 9000,
      currency: "USD",
      skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP"],
      requirements: ["PhD or Masters in AI/ML", "Research experience", "Published papers preferred"],
      applyUrl: "https://openai.com/careers/research-intern",
      description: "Conduct cutting-edge research in artificial intelligence and large language models.",
      postedAt: serverTimestamp(),
      deadline: new Date("2024-12-15"),
      remote: false,
      level: "Graduate"
    }
  ];

  for (const internship of internships) {
    await addDocument("internships", internship);
  }
}

// Initialize Videos Collection  
async function initVideos() {
  console.log('\n🎥 Initializing Videos Collection...');
  
  const videos = [
    {
      title: "Introduction to Machine Learning",
      source: "YouTube",
      url: "https://youtube.com/watch?v=example1",
      thumbnail: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
      skillTags: ["Machine Learning", "Python", "Data Science"],
      length: 3600, // seconds
      level: "Beginner",
      instructor: "Andrew Ng",
      description: "A comprehensive introduction to machine learning concepts and applications.",
      views: 125000,
      rating: 4.8,
      createdAt: serverTimestamp(),
      category: "Computer Science"
    },
    {
      title: "Advanced React Patterns",
      source: "YouTube", 
      url: "https://youtube.com/watch?v=example2",
      thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
      skillTags: ["React", "JavaScript", "Frontend"],
      length: 2400,
      level: "Advanced",
      instructor: "Kent C. Dodds",
      description: "Learn advanced React patterns including render props, higher-order components, and hooks.",
      views: 85000,
      rating: 4.9,
      createdAt: serverTimestamp(),
      category: "Web Development"
    },
    {
      title: "Linear Algebra for Engineers",
      source: "YouTube",
      url: "https://youtube.com/watch?v=example3", 
      thumbnail: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
      skillTags: ["Mathematics", "Linear Algebra", "Engineering"],
      length: 5400,
      level: "Intermediate",
      instructor: "Gilbert Strang",
      description: "MIT's famous linear algebra course tailored for engineering applications.",
      views: 200000,
      rating: 4.9,
      createdAt: serverTimestamp(),
      category: "Mathematics"
    },
    {
      title: "Database Design Fundamentals",
      source: "Vimeo",
      url: "https://vimeo.com/example4",
      thumbnail: "https://example.com/thumbnails/db-design.jpg",
      skillTags: ["Database", "SQL", "System Design"],
      length: 4200,
      level: "Intermediate", 
      instructor: "Prof. Jennifer Widom",
      description: "Learn the principles of database design, normalization, and query optimization.",
      views: 65000,
      rating: 4.6,
      createdAt: serverTimestamp(),
      category: "Computer Science"
    },
    {
      title: "Thermodynamics Made Simple",
      source: "YouTube",
      url: "https://youtube.com/watch?v=example5",
      thumbnail: "https://img.youtube.com/vi/example5/maxresdefault.jpg", 
      skillTags: ["Physics", "Thermodynamics", "Engineering"],
      length: 2700,
      level: "Beginner",
      instructor: "Khan Academy",
      description: "Understanding the basic principles of thermodynamics with real-world examples.",
      views: 150000,
      rating: 4.7,
      createdAt: serverTimestamp(),
      category: "Physics"
    }
  ];

  for (const video of videos) {
    await addDocument("videos", video);
  }
}

// Initialize Users Collection (Sample users with different roles)
async function initUsers() {
  console.log('\n👥 Initializing Users Collection...');
  
  const users = [
    {
      uid: "admin-user-1",
      displayName: "DUXE Administrator",
      email: "admin@duxe.com",
      role: "admin",
      skills: ["Management", "Education", "Platform Administration"],
      bookmarks: [],
      university: "mit",
      department: "mit-cs",
      year: "Staff",
      bio: "Platform administrator managing content and user experience.",
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      profilePicture: "https://example.com/avatars/admin.jpg"
    },
    {
      uid: "user1",
      displayName: "Alice Chen",
      email: "alice.chen@student.mit.edu", 
      role: "student",
      skills: ["JavaScript", "React", "Python", "Machine Learning"],
      bookmarks: [],
      university: "mit",
      department: "mit-cs",
      year: "Junior",
      bio: "Computer Science student passionate about AI and web development.",
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      profilePicture: "https://example.com/avatars/alice.jpg"
    },
    {
      uid: "user2", 
      displayName: "Bob Johnson",
      email: "bob.johnson@stanford.edu",
      role: "student",
      skills: ["Mathematics", "Statistics", "R", "Python", "Data Analysis"],
      bookmarks: [],
      university: "stanford",
      department: "stanford-cs", 
      year: "Senior",
      bio: "Mathematics major with focus on statistical analysis and data science.",
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      profilePicture: "https://example.com/avatars/bob.jpg"
    },
    {
      uid: "user3",
      displayName: "Carol Williams",
      email: "carol.w@berkeley.edu",
      role: "student", 
      skills: ["Machine Learning", "Deep Learning", "PyTorch", "Computer Vision"],
      bookmarks: [],
      university: "berkeley",
      department: "berkeley-eecs",
      year: "Graduate", 
      bio: "PhD student researching computer vision and deep learning applications.",
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      profilePicture: "https://example.com/avatars/carol.jpg"
    },
    {
      uid: "user4",
      displayName: "David Rodriguez",
      email: "david.r@mit.edu",
      role: "student",
      skills: ["Mechanical Engineering", "CAD", "Manufacturing", "Python"],
      bookmarks: [],
      university: "mit", 
      department: "mit-me",
      year: "Sophomore",
      bio: "Mechanical Engineering student interested in sustainable manufacturing.",
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      profilePicture: "https://example.com/avatars/david.jpg"
    }
  ];

  for (const user of users) {
    await createDoc("users", user.uid, user);
  }
}

// Initialize AI Jobs Collection (Structure for AI-generated content)
async function initAIJobs() {
  console.log('\n🤖 Initializing AI Jobs Collection...');
  
  const aiJobs = [
    {
      type: "summary",
      noteId: "sample-note-1", 
      inputText: "Sample text for summarization...",
      status: "completed",
      output: {
        summary: "This is a sample AI-generated summary of the content.",
        keyPoints: [
          "Key point 1: Main concept explained",
          "Key point 2: Important methodology",
          "Key point 3: Practical applications"
        ],
        tldr: "Brief overview of the main concepts and their applications."
      },
      createdBy: "user1",
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
      processingTime: 2500 // milliseconds
    },
    {
      type: "mcq",
      noteId: "sample-note-2",
      inputText: "Sample content for MCQ generation...",
      status: "completed", 
      output: {
        questions: [
          {
            question: "What is the main principle discussed?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct: 1,
            explanation: "Option B is correct because..."
          },
          {
            question: "Which method is most effective?",
            options: ["Method 1", "Method 2", "Method 3", "Method 4"],
            correct: 2,
            explanation: "Method 3 is most effective due to..."
          }
        ],
        totalQuestions: 2
      },
      createdBy: "user2", 
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
      processingTime: 3200
    },
    {
      type: "flashcard",
      noteId: "sample-note-3",
      inputText: "Sample content for flashcard creation...",
      status: "pending",
      output: null,
      createdBy: "user3",
      createdAt: serverTimestamp(),
      completedAt: null,
      processingTime: null
    }
  ];

  for (const job of aiJobs) {
    await addDocument("aiJobs", job);
  }
}

// Initialize Analytics Collection
async function initAnalytics() {
  console.log('\n📊 Initializing Analytics Collection...');
  
  const analytics = [
    {
      type: "download", 
      resourceId: "note-1",
      resourceType: "note",
      userId: "user1",
      timestamp: serverTimestamp(),
      metadata: {
        noteTitle: "Introduction to Algorithms - Sorting",
        university: "mit",
        department: "mit-cs"
      }
    },
    {
      type: "ai_tool_usage",
      resourceId: "ai-job-1", 
      resourceType: "summary",
      userId: "user1",
      timestamp: serverTimestamp(),
      metadata: {
        toolType: "summary",
        processingTime: 2500,
        success: true
      }
    },
    {
      type: "video_view",
      resourceId: "video-1",
      resourceType: "video", 
      userId: "user2",
      timestamp: serverTimestamp(),
      metadata: {
        videoTitle: "Introduction to Machine Learning",
        watchDuration: 1800,
        completed: false
      }
    },
    {
      type: "search",
      resourceId: null,
      resourceType: "search",
      userId: "user3", 
      timestamp: serverTimestamp(),
      metadata: {
        query: "machine learning algorithms",
        resultsCount: 15,
        clickedResults: 3
      }
    }
  ];

  for (const analytic of analytics) {
    await addDocument("analytics", analytic);
  }
}

// Main initialization function
async function initializeFirestore() {
  console.log('🚀 Starting Firestore Database Initialization...');
  console.log('Project ID:', firebaseConfig.projectId);
  
  try {
    // Enable network connection
    await enableNetwork(db);
    console.log('✅ Connected to Firestore');

    // Initialize all collections
    await initUniversities();
    await initDepartments();
    await initNotes();
    await initInternships(); 
    await initVideos();
    await initUsers();
    await initAIJobs();
    await initAnalytics();

    console.log('\n🎉 Firestore initialization completed successfully!');
    console.log('\n📋 Collections created:');
    console.log('  ✅ universities (5 documents)');
    console.log('  ✅ departments (16 documents)');
    console.log('  ✅ notes (5 documents)');
    console.log('  ✅ internships (5 documents)');
    console.log('  ✅ videos (5 documents)');
    console.log('  ✅ users (5 documents)');
    console.log('  ✅ aiJobs (3 documents)');
    console.log('  ✅ analytics (4 documents)');
    
    console.log('\n🔗 Next steps:');
    console.log('  1. Check Firestore Console: https://console.firebase.google.com/project/duxe-5c071/firestore');
    console.log('  2. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('  3. Test your application with the sample data');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

// Run the initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeFirestore();
}

export { initializeFirestore };
