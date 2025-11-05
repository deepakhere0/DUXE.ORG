# 🚨 QUICK FIX: "Invalid PDF URL" Error

## The Problem
You're seeing "invalid pdf url" or "note not found" errors when clicking Preview.

## The Solution (One Command!)

```bash
node scripts/master-fix.js
```

That's it! This one script will:
- ✅ Check your database
- ✅ Fix all invalid URLs
- ✅ Create sample notes if needed
- ✅ Show you exactly what was fixed

## What It Does

The script replaces fake/placeholder URLs like:
- `https://example.com/file.pdf` ❌
- `https://placeholder.com/test.pdf` ❌
- Missing URLs ❌

With real, working PDFs:
- `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf` ✅
- `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf` ✅

## After Running the Fix

1. **Refresh your browser**
2. **Go to Notes section**
3. **Click "Preview"** on any note
4. **It should work!** 🎉

## If You Still Have Issues

### Check What's in Your Database
```bash
node scripts/check-notes.js
```

This shows you all notes and their URLs.

### Fix Only (No Sample Creation)
```bash
node scripts/fix-note-urls.js
```

This only fixes existing notes without creating new ones.

### Manual Check
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open Firestore Database
3. Look at the `notes` collection
4. Check if `fileUrl` fields look valid

## Error Messages Explained

| Error | Cause | Fix |
|-------|-------|-----|
| "invalid pdf url" | Note has fake URL | Run master-fix.js |
| "note not found" | Note doesn't exist | Check note ID |
| "PDF file not available" | No fileUrl field | Run master-fix.js |
| "Switching to alternate mode" | CORS issue | Usually recovers automatically |

## For Future Uploads

When uploading new notes:
1. Always upload to Firebase Storage
2. Get the download URL
3. Use that URL in the note's `fileUrl` field
4. Never use fake/test URLs in production

## Need More Help?

If the fix doesn't work:
1. **Check console** (F12 in browser) for detailed errors
2. **Run check script**: `node scripts/check-notes.js`
3. **Verify .env.local** has correct Firebase credentials
4. **Check internet connection**

## Technical Details

The fix script (`scripts/master-fix.js`) does:
1. Connects to your Firestore database
2. Scans all notes in the `notes` collection
3. Identifies notes with invalid URLs:
   - Contains "example.com"
   - Contains "placeholder"
   - Doesn't start with "http"
   - Is empty/missing
4. Updates them with working public PDF URLs
5. Shows detailed progress and summary

Safe to run multiple times - it only fixes what needs fixing!
