# Firebase Data Connect Schema Documentation

## Overview
This document describes the Firebase Data Connect schema implementation for the Student Platform application. The schema provides a robust, type-safe GraphQL API for managing all application data including users, notes, videos, internships, and AI tools.

## Schema Structure

### Core Entities

#### 1. **User**
- Manages user accounts and profiles
- Roles: STUDENT, TEACHER, ADMIN
- Tracks email verification, bookmarks, and uploaded notes
- Relationships with notes, ratings, AI jobs

#### 2. **Note**
- Study materials uploaded by users
- Contains academic metadata (university, department, semester, subject)
- Moderation workflow (PENDING → APPROVED/REJECTED)
- Tracking for downloads, views, and ratings
- File support: PDF, Images, Documents, Presentations

#### 3. **University & Department**
- Hierarchical organization structure
- Universities contain multiple departments
- Used for categorizing notes and filtering

#### 4. **Rating**
- User ratings for notes (1-5 stars)
- Comments and helpfulness voting
- Unique constraint prevents duplicate ratings

#### 5. **Video**
- Educational video content
- Academic categorization (subject, topic, difficulty)
- View and like tracking

#### 6. **Internship**
- Job/internship opportunities
- Skills matching capabilities
- Location types: REMOTE, ONSITE, HYBRID
- Application tracking

#### 7. **AIJob**
- Tracks AI tool usage (summarization, MCQ generation, flashcards)
- Asynchronous job processing
- Status tracking: PENDING → PROCESSING → COMPLETED/FAILED

### Supporting Entities

- **Bookmark**: User bookmarks for notes, videos, internships
- **Report**: Content moderation and reporting system
- **Feedback**: User feedback and bug reports
- **Analytics**: Platform usage tracking
- **SearchIndex**: Full-text search optimization

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase Data Connect
```bash
firebase init dataconnect
```

### 3. Deploy the Schema
```bash
firebase deploy --only dataconnect
```

### 4. Configure Environment Variables
Add to your `.env.local`:
```env
VITE_FIREBASE_DATACONNECT_ENDPOINT=https://dataconnect.googleapis.com
VITE_FIREBASE_DATACONNECT_SERVICE_ID=student-platform
```

## Usage Examples

### JavaScript/React Integration

```javascript
import { getDataConnect, connectFirestoreEmulator } from 'firebase/data-connect';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Data Connect
const dataConnect = getDataConnect(app, {
  serviceId: 'student-platform',
  location: 'us-central1'
});

// Example: Fetch approved notes
async function fetchNotes(filters) {
  const query = `
    query GetApprovedNotes($universityId: ID, $departmentId: ID, $semester: String) {
      notes(
        where: {
          status: { eq: APPROVED }
          universityId: { eq: $universityId }
          departmentId: { eq: $departmentId }
          semester: { eq: $semester }
        }
        orderBy: [{ field: "downloads", direction: DESC }]
        limit: 12
      ) {
        id
        title
        description
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
  
  const variables = {
    universityId: filters.universityId,
    departmentId: filters.departmentId,
    semester: filters.semester
  };
  
  const result = await dataConnect.query(query, variables);
  return result.data.notes;
}

// Example: Create a new note
async function uploadNote(noteData) {
  const mutation = `
    mutation CreateNote($title: String!, $fileURL: String!, ...) {
      createNote(data: {
        title: $title
        fileURL: $fileURL
        ...
      }) {
        id
        title
        status
      }
    }
  `;
  
  const result = await dataConnect.mutate(mutation, noteData);
  return result.data.createNote;
}
```

## Security Rules

The schema includes comprehensive security rules:

1. **Users**
   - Can read their own profile
   - Can update their own profile
   - Admins can manage all users

2. **Notes**
   - Public read for approved notes
   - Creators can view their own pending notes
   - Only verified users can upload
   - Admins can moderate

3. **Ratings**
   - Public read access
   - Users can only create/edit their own ratings

4. **Internships**
   - Public read access
   - Teachers and admins can create/edit

## Performance Optimizations

### Indexes
The schema includes optimized indexes for common queries:
- Notes by status and creation date
- Notes by university, department, and semester
- User's uploaded notes
- Active internships by posting date
- AI jobs by user and status

### Caching Strategy
Recommended caching times:
- Universities/Departments: 30 minutes
- Approved Notes: 2 minutes
- User Profiles: 5 minutes
- Internships: 5 minutes

## Migration from Firestore

To migrate existing Firestore data to Data Connect:

1. Export existing Firestore data
2. Transform data to match new schema
3. Use Data Connect bulk import API
4. Update application code to use Data Connect queries

## Best Practices

1. **Use Fragments** for reusable query parts
2. **Implement Pagination** for large datasets
3. **Cache Static Data** (universities, departments)
4. **Use Transactions** for rating updates
5. **Implement Optimistic UI** for better UX

## Monitoring

Track these metrics:
- Query performance (p50, p95, p99)
- Mutation success rates
- Cache hit rates
- Error rates by operation

## Support

For issues or questions:
1. Check Firebase Data Connect documentation
2. Review the schema file: `dataconnect-schema.gql`
3. Check connector implementations in `dataconnect/` directory
