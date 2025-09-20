import { 
  getDataConnect, 
  connectDataConnectEmulator,
  executeQuery,
  executeMutation
} from 'firebase/data-connect';
import app, { isFirebaseConfigured } from './firebase';

// Data Connect configuration
const DATA_CONNECT_CONFIG = {
  serviceId: import.meta.env.VITE_FIREBASE_DATACONNECT_SERVICE_ID || 'student-platform',
  location: import.meta.env.VITE_FIREBASE_DATACONNECT_LOCATION || 'us-central1',
};

// Initialize Data Connect instance
let dataConnect = null;

if (isFirebaseConfigured && app) {
  try {
    dataConnect = getDataConnect(app, DATA_CONNECT_CONFIG);
    
    // Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
      const emulatorHost = import.meta.env.VITE_DATACONNECT_EMULATOR_HOST || 'localhost';
      const emulatorPort = parseInt(import.meta.env.VITE_DATACONNECT_EMULATOR_PORT || '9399');
      connectDataConnectEmulator(dataConnect, emulatorHost, emulatorPort);
      console.log(`🤖 DataConnect connected to emulator at ${emulatorHost}:${emulatorPort}`);
    }
    
    console.log('🤖 DataConnect initialized successfully');
  } catch (error) {
    console.error('🤖 DataConnect initialization failed:', error);
    // Set dataConnect to null to prevent errors in queries
    dataConnect = null;
  }
} else {
  console.warn('🤖 DataConnect - Firebase not configured. Please set up Firebase configuration.');
}

// Query executor with error handling
export const query = async (queryString, variables = {}) => {
  if (!dataConnect) {
    throw new Error('Data Connect is not initialized');
  }
  
  try {
    const result = await executeQuery(dataConnect, {
      query: queryString,
      variables
    });
    return result.data;
  } catch (error) {
    console.error('[DataConnect] Query error:', error);
    throw error;
  }
};

// Mutation executor with error handling
export const mutate = async (mutationString, variables = {}) => {
  if (!dataConnect) {
    throw new Error('Data Connect is not initialized');
  }
  
  try {
    const result = await executeMutation(dataConnect, {
      mutation: mutationString,
      variables
    });
    return result.data;
  } catch (error) {
    console.error('[DataConnect] Mutation error:', error);
    throw error;
  }
};

// Pre-defined queries
export const queries = {
  // Notes queries
  getApprovedNotes: (filters = {}) => {
    const queryString = `
      query GetApprovedNotes($universityId: ID, $departmentId: ID, $semester: String, $limit: Int, $offset: Int, $sortBy: String) {
        notes(
          where: {
            status: { eq: APPROVED }
            universityId: { eq: $universityId }
            departmentId: { eq: $departmentId }
            semester: { eq: $semester }
          }
          orderBy: [{ field: $sortBy, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          id
          title
          description
          fileURL
          thumbnailURL
          fileType
          fileSize
          subject
          courseCode
          semester
          downloads
          views
          ratingAvg
          ratingCount
          createdAt
          tags
          university {
            id
            name
          }
          department {
            id
            name
          }
          uploader {
            id
            displayName
            photoURL
          }
        }
      }
    `;
    
    return query(queryString, {
      universityId: filters.universityId || null,
      departmentId: filters.departmentId || null,
      semester: filters.semester || null,
      limit: filters.limit || 12,
      offset: filters.offset || 0,
      sortBy: filters.sortBy || 'downloads'
    });
  },

  getNoteById: (id) => {
    const queryString = `
      query GetNoteById($id: ID!) {
        note(id: $id) {
          id
          title
          description
          fileURL
          thumbnailURL
          fileType
          fileSize
          universityId
          departmentId
          subject
          courseCode
          semester
          academicYear
          uploadedBy
          status
          downloads
          views
          ratingAvg
          ratingCount
          createdAt
          updatedAt
          tags
          university {
            name
            code
          }
          department {
            name
            code
          }
          uploader {
            displayName
            photoURL
          }
          ratings(limit: 10, orderBy: [{ field: "createdAt", direction: DESC }]) {
            id
            rating
            comment
            helpful
            createdAt
            user {
              displayName
              photoURL
            }
          }
        }
      }
    `;
    
    return query(queryString, { id });
  },

  getUserNotes: (userId, status = null) => {
    const queryString = `
      query GetUserNotes($userId: ID!, $status: NoteStatus) {
        notes(
          where: {
            uploadedBy: { eq: $userId }
            status: { eq: $status }
          }
          orderBy: [{ field: "createdAt", direction: DESC }]
        ) {
          id
          title
          status
          downloads
          views
          ratingAvg
          createdAt
          university {
            name
          }
          department {
            name
          }
        }
      }
    `;
    
    return query(queryString, { userId, status });
  },

  searchNotes: (searchText, limit = 20) => {
    const queryString = `
      query SearchNotes($searchText: String!, $limit: Int) {
        notes(
          where: {
            status: { eq: APPROVED }
            _or: [
              { title: { contains: $searchText } }
              { description: { contains: $searchText } }
              { subject: { contains: $searchText } }
              { courseCode: { contains: $searchText } }
            ]
          }
          limit: $limit
          orderBy: [{ field: "downloads", direction: DESC }]
        ) {
          id
          title
          description
          subject
          courseCode
          semester
          downloads
          ratingAvg
          university {
            name
          }
          department {
            name
          }
        }
      }
    `;
    
    return query(queryString, { searchText, limit });
  },

  // University queries
  getUniversities: () => {
    const queryString = `
      query GetUniversities {
        universities(orderBy: [{ field: "name", direction: ASC }]) {
          id
          name
          code
          location
          logoURL
        }
      }
    `;
    
    return query(queryString);
  },

  getDepartments: (universityId = null) => {
    const queryString = universityId ? `
      query GetDepartmentsByUniversity($universityId: ID!) {
        departments(
          where: { universityId: { eq: $universityId } }
          orderBy: [{ field: "name", direction: ASC }]
        ) {
          id
          name
          code
          description
        }
      }
    ` : `
      query GetAllDepartments {
        departments(orderBy: [{ field: "name", direction: ASC }]) {
          id
          name
          code
          universityId
          description
        }
      }
    `;
    
    return query(queryString, universityId ? { universityId } : {});
  },

  // Internship queries
  getInternships: (filters = {}) => {
    const queryString = `
      query GetInternships($status: InternshipStatus, $limit: Int, $offset: Int) {
        internships(
          where: {
            status: { eq: $status }
          }
          orderBy: [{ field: "postedAt", direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          id
          company
          role
          description
          stipend
          location
          locationType
          duration
          startDate
          applicationDeadline
          skills
          eligibility
          applyURL
          applicationCount
          postedAt
        }
      }
    `;
    
    return query(queryString, {
      status: filters.status || 'ACTIVE',
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
  },

  // Video queries
  getVideos: (filters = {}) => {
    const queryString = `
      query GetVideos($subject: String, $difficulty: Difficulty, $limit: Int, $offset: Int) {
        videos(
          where: {
            subject: { eq: $subject }
            difficulty: { eq: $difficulty }
          }
          orderBy: [{ field: "createdAt", direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          id
          title
          description
          videoURL
          thumbnailURL
          duration
          subject
          topic
          difficulty
          views
          likes
          createdAt
          tags
        }
      }
    `;
    
    return query(queryString, {
      subject: filters.subject || null,
      difficulty: filters.difficulty || null,
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });
  },

  // User queries
  getUserProfile: (userId) => {
    const queryString = `
      query GetUserProfile($userId: ID!) {
        user(id: $userId) {
          id
          email
          displayName
          photoURL
          role
          emailVerified
          bookmarks
          uploadedNotes
          createdAt
          updatedAt
        }
      }
    `;
    
    return query(queryString, { userId });
  },

  // AI Job queries
  getUserAIJobs: (userId, status = null) => {
    const queryString = `
      query GetUserAIJobs($userId: ID!, $status: AIJobStatus) {
        aiJobs(
          where: {
            createdBy: { eq: $userId }
            status: { eq: $status }
          }
          orderBy: [{ field: "createdAt", direction: DESC }]
          limit: 20
        ) {
          id
          type
          status
          inputText
          outputText
          outputData
          error
          createdAt
          completedAt
        }
      }
    `;
    
    return query(queryString, { userId, status });
  }
};

// Pre-defined mutations
export const mutations = {
  // Note mutations
  createNote: (noteData) => {
    const mutationString = `
      mutation CreateNote(
        $title: String!
        $description: String
        $fileURL: String!
        $thumbnailURL: String
        $fileType: FileType!
        $fileSize: Int!
        $universityId: ID!
        $departmentId: ID!
        $subject: String!
        $courseCode: String
        $semester: String
        $academicYear: String
        $tags: [String!]
        $uploadedBy: ID!
      ) {
        createNote(
          data: {
            title: $title
            description: $description
            fileURL: $fileURL
            thumbnailURL: $thumbnailURL
            fileType: $fileType
            fileSize: $fileSize
            universityId: $universityId
            departmentId: $departmentId
            subject: $subject
            courseCode: $courseCode
            semester: $semester
            academicYear: $academicYear
            uploadedBy: $uploadedBy
            tags: $tags
          }
        ) {
          id
          title
          status
          createdAt
        }
      }
    `;
    
    return mutate(mutationString, noteData);
  },

  updateNoteStatus: (noteId, status, moderationNotes = null) => {
    const mutationString = `
      mutation UpdateNoteStatus($noteId: ID!, $status: NoteStatus!, $moderationNotes: String, $moderatedBy: ID!) {
        updateNote(
          id: $noteId
          data: {
            status: $status
            moderatedBy: $moderatedBy
            moderationNotes: $moderationNotes
          }
        ) {
          id
          status
          moderatedBy
        }
      }
    `;
    
    return mutate(mutationString, { noteId, status, moderationNotes });
  },

  incrementDownloads: (noteId) => {
    const mutationString = `
      mutation IncrementDownloads($noteId: ID!) {
        updateNote(
          id: $noteId
          data: {
            downloads: { increment: 1 }
          }
        ) {
          id
          downloads
        }
      }
    `;
    
    return mutate(mutationString, { noteId });
  },

  incrementViews: (noteId) => {
    const mutationString = `
      mutation IncrementViews($noteId: ID!) {
        updateNote(
          id: $noteId
          data: {
            views: { increment: 1 }
          }
        ) {
          id
          views
        }
      }
    `;
    
    return mutate(mutationString, { noteId });
  },

  // Rating mutations
  addRating: (noteId, rating, comment = null, userId) => {
    const mutationString = `
      mutation AddRating($noteId: ID!, $userId: ID!, $rating: Int!, $comment: String) {
        createRating(
          data: {
            noteId: $noteId
            userId: $userId
            rating: $rating
            comment: $comment
          }
        ) {
          id
          rating
          comment
          createdAt
        }
      }
    `;
    
    return mutate(mutationString, { noteId, userId, rating, comment });
  },

  // User mutations
  createUser: (userData) => {
    const mutationString = `
      mutation CreateUser(
        $id: ID!
        $email: String!
        $displayName: String!
        $photoURL: String
        $role: UserRole
      ) {
        createUser(
          data: {
            id: $id
            email: $email
            displayName: $displayName
            photoURL: $photoURL
            role: $role
          }
        ) {
          id
          email
          displayName
          role
        }
      }
    `;
    
    return mutate(mutationString, userData);
  },

  updateUser: (userId, updates) => {
    const mutationString = `
      mutation UpdateUser($userId: ID!, $updates: UserUpdateInput!) {
        updateUser(
          id: $userId
          data: $updates
        ) {
          id
          displayName
          photoURL
          updatedAt
        }
      }
    `;
    
    return mutate(mutationString, { userId, updates });
  },

  // AI Job mutations
  createAIJob: (jobData) => {
    const mutationString = `
      mutation CreateAIJob(
        $type: AIJobType!
        $inputText: String
        $inputFileURL: String
        $createdBy: ID!
        $parameters: String
      ) {
        createAIJob(
          data: {
            type: $type
            inputText: $inputText
            inputFileURL: $inputFileURL
            createdBy: $createdBy
            parameters: $parameters
          }
        ) {
          id
          type
          status
          createdAt
        }
      }
    `;
    
    return mutate(mutationString, jobData);
  },

  updateAIJobStatus: (jobId, status, outputData = null, error = null) => {
    const mutationString = `
      mutation UpdateAIJobStatus($jobId: ID!, $status: AIJobStatus!, $outputData: String, $error: String) {
        updateAIJob(
          id: $jobId
          data: {
            status: $status
            outputData: $outputData
            error: $error
            completedAt: ${status === 'COMPLETED' || status === 'FAILED' ? 'now()' : 'null'}
          }
        ) {
          id
          status
          completedAt
        }
      }
    `;
    
    return mutate(mutationString, { jobId, status, outputData, error });
  },

  // Bookmark mutations
  addBookmark: (userId, resourceId, resourceType) => {
    const mutationString = `
      mutation AddBookmark($userId: ID!, $noteId: ID, $videoId: ID, $internshipId: ID) {
        createBookmark(
          data: {
            userId: $userId
            noteId: $noteId
            videoId: $videoId
            internshipId: $internshipId
          }
        ) {
          id
          userId
          createdAt
        }
      }
    `;
    
    const variables = { userId };
    if (resourceType === 'note') variables.noteId = resourceId;
    if (resourceType === 'video') variables.videoId = resourceId;
    if (resourceType === 'internship') variables.internshipId = resourceId;
    
    return mutate(mutationString, variables);
  },

  removeBookmark: (bookmarkId) => {
    const mutationString = `
      mutation RemoveBookmark($bookmarkId: ID!) {
        deleteBookmark(id: $bookmarkId) {
          id
        }
      }
    `;
    
    return mutate(mutationString, { bookmarkId });
  }
};

// Export the Data Connect instance for direct use if needed
export { dataConnect };

// Export configuration status
export const isDataConnectConfigured = dataConnect !== null;

export default {
  query,
  mutate,
  queries,
  mutations,
  isConfigured: isDataConnectConfigured
};
