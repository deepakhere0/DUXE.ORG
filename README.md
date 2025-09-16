# DUXE — Student Platform

DUXE is a premium student learning platform built with React, Vite, Tailwind CSS, React Router, React Query, and Firebase. It provides curated university notes, AI-powered study tools (powered by Google Gemini API), video lectures, internships, and role-based moderation workflows.

## 🚀 New Updates
- **Firestore Integration**: All pages now fetch real data from Firestore
- **AI-Powered Features**: Google Gemini integration for summaries, MCQs, and flashcards
- **Admin Moderation**: Complete review queue with approve/reject functionality
- **Smart Internship Matching**: AI-enhanced skill-based matching
- **Result Export**: Export AI-generated content as JSON, CSV, or text files

## Tech stack
- React 18 + Vite 6
- Tailwind CSS 3
- React Router v6
- @tanstack/react-query v5
- Firebase (Auth, Firestore, Storage, Functions, Analytics)
- Google Gemini API (gemini-1.5-flash model for AI features)

## Features

### Core Features
- **Notes Management**: Upload, browse, and download study materials with Firestore backend
- **AI Study Tools**: Generate summaries, MCQs, and flashcards using Google Gemini
- **Internship Matching**: AI-powered skill matching for relevant opportunities
- **Admin Moderation**: Review queue for approving/rejecting content
- **Real-time Data**: Live updates from Firestore with caching via React Query

### UI Components
- **Layout**: Navbar with DUXE badge, Footer with newsletter
- **Common Components**: 
  - FilterBar (dynamic filtering with Firestore)
  - NoteCard (connected to real data)
  - AIResultModal (display & export AI results)
  - MediaViewer (PDF/Image preview)
  - Toast notifications
  
### Pages (All Firestore-Connected)
- **Public**: Home, Notes (paginated), Note Detail (AI actions), Tools, Internships (AI matching), Videos
- **Auth**: Login, Signup, Forgot Password
- **User**: Dashboard, Profile, Upload
- **Admin**: Review Queue (approve/reject pending notes)
- **Info**: About, Contact, How It Works, Pricing, FAQ, Blog, Privacy, Terms
### Services
- **Firebase**: Authentication & database configuration
- **Firestore Data**: CRUD operations for all collections
- **AI Service**: Google Gemini integration with:
  - Smart summarization with key points extraction
  - MCQ generation with explanations
  - Flashcard creation for study
  - Intelligent internship matching
- **Analytics**: Track downloads and tool usage
- Auth, roles, and protected routes via `src/contexts/AuthContext.jsx` and `ProtectedRoute`

## Data model (Firestore collections)
- users: { uid, displayName, email, role, skills[], bookmarks[] }
- universities: { id, name, shortName }
- departments: { id, name, uniId }
- notes: {
  id, title, courseCode, universityId, departmentId, subject, semester,
  pages, authorName, fileUrl, status: "pending|approved|rejected",
  ratingAvg, downloads, createdAt, createdBy
}
- aiJobs: { id, type: "summary|mcq|flashcard", noteId|inputText, status, output, createdBy, createdAt }
- internships: { id, company, role, location, stipend, skills[], applyUrl, postedAt }
- videos: { id, title, source, url, skillTags[], length, level }
- analytics: lightweight counters per note/tool

## AI Features (Google Gemini Powered)

### Implementation
- **Model**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **Features**:
  - **Smart Summarization**: Extracts key points, TL;DR, and main terms
  - **MCQ Generation**: Creates 5-20 questions with choices and explanations
  - **Flashcard Creation**: Generates Q/A pairs for effective studying
  - **Internship Matching**: AI-scored relevance with match reasons
- **User Experience**:
  - Beautiful modal displays for results
  - Export options (JSON, CSV, TXT)
  - Copy to clipboard functionality
  - Graceful fallbacks when API unavailable

## Getting started

Prerequisites
- Node.js ≥ 18
- npm ≥ 9

Install
```bash path=null start=null
npm install
```

Environment
1) Copy the example file and fill in your Firebase web app config values.
```bash path=null start=null
cp .env.example .env.local
```
2) Set Vite environment variables in `.env.local`:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID (optional)
- VITE_GEMINI_API_KEY (for AI features - get from Google AI Studio)

Run dev server
```bash path=null start=null
npm run dev
```
Vite is configured to open on http://localhost:3000.

Build & preview
```bash path=null start=null
npm run build
npm run preview
```

Lint
```bash path=null start=null
npm run lint
```

## Firebase setup (high level)
- Create a Firebase project and a Web App; copy config to `.env.local` as above.
- Enable Authentication (Email/Password to match current UI).
- Create Firestore database and Storage bucket.
- Optionally set up Cloud Functions for real AI endpoints later (to replace `aiService.js` stubs).

Security & roles (high level)
- Only admin can approve/reject notes.
- Users can read approved notes.
- Users can edit/delete their own uploads.
- AI jobs read/write by owner only.
- Add file size/type checks, profanity/PII scan (optional), rate limit AI jobs per user.

Sample rules (outline only; adapt before deploy)
```text path=null start=null
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isAdmin() { return isSignedIn() && request.auth.token.role == 'admin'; }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow write: if isOwner(uid) || isAdmin();
    }

    match /notes/{id} {
      allow read: if resource.data.status == 'approved' || isAdmin() || isOwner(resource.data.createdBy);
      allow create: if isSignedIn();
      allow update, delete: if isAdmin() || isOwner(resource.data.createdBy);
    }

    match /aiJobs/{id} {
      allow read, write: if isOwner(resource.data.createdBy) || isAdmin();
    }

    // Add similar rules for internships, videos, analytics as needed
  }
}
```

## Project structure (selected)
```text path=null start=null
src/
  components/
    auth/ProtectedRoute.jsx
    layout/{Navbar,Footer,Layout}.jsx
    common/{Badge,Chip,Rating,Progress,Toast.js,FilterBar,NoteCard,ToolCard,MediaViewer}.jsx
  contexts/AuthContext.jsx
  pages/
    Home.jsx, Notes.jsx, NoteDetail.jsx, Tools.jsx, Internships.jsx, Videos.jsx
    Login.jsx, Signup.jsx, ForgotPassword.jsx
    Dashboard.jsx, Profile.jsx, Upload.jsx, NotFound.jsx
    About.jsx, Contact.jsx, HowItWorks.jsx, Pricing.jsx, FAQ.jsx, Blog.jsx
    Privacy.jsx, Terms.jsx, Cookies.jsx, Help.jsx, Guidelines.jsx, Report.jsx, Feedback.jsx
    admin/ReviewQueue.jsx (scaffold)
  services/
    firebase.js, firestoreData.js, aiService.js, analytics.js
  index.css, main.jsx, App.jsx
```

## Key Workflows

### Content Moderation Flow
1. User uploads note → Status: `pending`
2. Admin reviews in Review Queue
3. Admin approves → Status: `approved` → Visible to all
4. Admin rejects → Status: `rejected` → Only visible to owner

### AI Study Tools Flow
1. User opens note detail page
2. Clicks AI action (Summary/MCQ/Flashcards)
3. Gemini processes content
4. Results display in modal
5. User can export or save results

### Internship Matching Flow
1. User adds their skills
2. System fetches internships from Firestore
3. AI scores each internship based on skill match
4. Results sorted by relevance with match reasons

## Security

### Firestore Rules
Proper security rules are configured in `firestore.rules`:
- **Notes**: Only approved notes are public, pending/rejected restricted
- **Admin**: Only admins can approve/reject content
- **AI Jobs**: Users can only access their own AI generations
- **Analytics**: Public read, authenticated write

### Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Recent Improvements
- ✅ Full Firestore integration for all data
- ✅ Google Gemini AI integration 
- ✅ Admin moderation workflow
- ✅ AI result modals with export
- ✅ Pagination and real-time updates
- ✅ Secure Firestore rules

## Roadmap
- [ ] Add user notifications for approval/rejection
- [ ] Implement rating and comments system
- [ ] Add file upload to Firebase Storage
- [ ] Create dashboard analytics charts
- [ ] Add E2E tests with Cypress
- [ ] Implement code splitting for performance

## Scripts
- dev: start Vite dev server
- build: production build
- preview: preview production build
- lint: run eslint

## Troubleshooting
- If you see "Firebase not configured" toasts, ensure `.env.local` is filled and restart the dev server.
- Large bundle warning during build is non-blocking; consider code-splitting for production.

## License
MIT (or your preferred license)

