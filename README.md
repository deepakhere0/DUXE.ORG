# StudyHub — Student Platform

A premium student learning platform built with React, Vite, Tailwind CSS, React Router, React Query, and Firebase. It provides curated university notes, AI-powered study tools, video lectures, internships, and role-based moderation workflows.

## Tech stack
- React 18 + Vite 6
- Tailwind CSS 3
- React Router v6
- @tanstack/react-query v5
- Firebase (Auth, Firestore, Storage, Functions, Analytics)

## Features
- Reusable UI Components
  - Navbar (with DUXE badge)
  - Footer (About, Quick Links, Services, Support, Newsletter)
  - FilterBar (search + dropdowns; emits filter state)
  - NoteCard (meta props + preview/download/bookmark callbacks)
  - ToolCard (title, icon, description, CTA)
  - MediaViewer (PDF/Image modal)
  - Badge, Chip, Rating, Progress, Toast wrapper
- Pages
  - Home, Notes, Note Detail, Tools, Internships, Videos
  - Auth: Login, Signup, Forgot Password
  - Dashboard, Profile, Upload, NotFound
  - Info: About, Contact, How It Works, Pricing, FAQ, Blog, Privacy, Terms, Cookies, Help, Guidelines, Report, Feedback
  - Admin (scaffold): Review Queue
- Services
  - Firebase bootstrap: `src/services/firebase.js`
  - Firestore data model helpers: `src/services/firestoreData.js`
  - AI service stubs (summary, MCQ, flashcards, internship matching): `src/services/aiService.js`
  - Lightweight analytics: `src/services/analytics.js`
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

## AI features (service flow)
- Summarizer: input (noteId or text) → serverless function (placeholder) → store aiJobs.output (bullets, TL;DR, key terms) → display + save
- MCQ Generator: input text → generate 5–20 MCQs with choices, correct answer, explanation → allow export
- Flashcards: extract Q/A or term/definition pairs → allow export CSV/Anki
- Internship Matching: compare users.skills[] with internships.skills[] → score & sort

Current implementation ships with stubs in `aiService.js` that simulate job creation and completion. Swap these with your preferred AI endpoint later (Cloud Functions or any server).

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

## Workflows (high level)
- Upload & Moderation: Student uploads with metadata → status=pending → Admin review queue → approve to appear on portal
- Preview/Summary/MCQ: Open Note → Preview modal → AI Summary/MCQ buttons create jobs → show output (stubbed for now)
- Bookmarks & Library: Toggle bookmark on notes/internships/videos → visible in Dashboard (to wire to Firestore)
- Internship Match: User selects skills → list sorts by match score (AIService.matchInternships)

## Roadmap
- Replace AI stubs with real endpoints (Functions or your API) and stream outputs.
- Wire Notes/Internships/Videos to Firestore (replace mock data in pages).
- Implement admin Review Queue route with real Firestore queries.
- Add E2E/tests and CI, code-splitting to reduce bundle size.

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

