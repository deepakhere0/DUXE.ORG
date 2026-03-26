# How to Fix "Note Not Found" Preview Error

## Problem
When clicking "Preview" on notes, you see an error like:
- "note not found, switching to alternate preview mode"
- "This note uses a placeholder URL"
- Preview modal shows error message

## Root Cause
Your existing notes in Firebase have **fake/placeholder PDF URLs** (like `https://example.com/sample-file-1.pdf`). These URLs don't point to real PDF files, causing the preview to fail.

## Solution: Fix Existing Notes

### Option 1: Automatic Fix (Recommended) ⚡

Run the automated fix script to update all notes with fake URLs:

```bash
# Make sure you have your Firebase credentials set up
node scripts/fix-note-urls.js
```

This script will:
- Find all notes with fake/placeholder URLs
- Replace them with real, working PDF URLs
- Keep your other note data intact
- Show a summary of what was fixed

### Option 2: Manual Fix via Firebase Console 🔧

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Navigate to the `notes` collection
5. For each note with a fake URL:
   - Click on the note document
   - Find the `fileUrl` field
   - Replace with a real PDF URL like:
     - `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf`
     - `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
   - Add a `fileType` field with value: `application/pdf`
   - Click **Update**

### Option 3: Delete and Recreate 🔄

If you want to start fresh:

```bash
# Step 1: Delete old notes from Firebase Console manually

# Step 2: Create new sample notes with real URLs
node scripts/create-sample-notes.js
```

## Verify the Fix

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser

3. **Navigate to the Notes section**

4. **Click "Preview"** on any note

5. **Expected Result:** PDF should load successfully in the preview modal or page

## Understanding the Error Messages

### Modal Preview (Popup)
- **"This note uses a placeholder URL"** → Note has fake URL like example.com
- **"Invalid PDF URL"** → URL format is incorrect
- **"This note does not have a file attached"** → Note has no fileUrl field

### Full Page Preview (/preview/:id)
- **"Note not found (ID: xxx)"** → Note doesn't exist in database
- **"PDF file not available"** → Note exists but has no fileUrl
- **"Invalid PDF URL"** → URL format is invalid
- **"Switching to alternate preview mode"** → PDF.js failed, trying iframe

## For Development

When testing, you can use these public PDF URLs:
```javascript
// Mozilla PDF.js sample
'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

// W3C test PDF
'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
```

## For Production

In production, your notes should have URLs from Firebase Storage:
```javascript
'https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/notes%2Ffile.pdf?alt=media&token=...'
```

Make sure:
1. Files are uploaded to Firebase Storage
2. Storage security rules allow public read access for note files
3. The `fileUrl` field is set correctly during upload

## Troubleshooting

### Script won't run
```bash
# Make sure you have .env.local with Firebase credentials
# Copy from .env.example if needed
cp .env.example .env.local
# Then edit .env.local with your Firebase config

# Install dependencies
npm install

# Try running the script again
node scripts/fix-note-urls.js
```

### Still seeing errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error messages
4. Check what URL is being attempted
5. Verify the URL loads in a new browser tab

### Need to check database
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open the `notes` collection
4. Check the `fileUrl` field values
5. They should start with `https://` and not contain `example.com`

## Contact
If you're still experiencing issues after following these steps, please provide:
- Browser console error messages
- Screenshot of the error
- A sample `fileUrl` from one of your notes in Firestore
