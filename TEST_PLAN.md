# PDF Preview Fix - Test Plan

## Overview
This document outlines comprehensive testing strategies for the PDF preview URL resolution fixes.

---

## Unit Tests

### storageHelpers.test.js ✅
**Location:** `src/services/__tests__/storageHelpers.test.js`

**What to test:**

1. **getDownloadUrlFromPath()**
   - ✅ Valid HTTPS URLs are returned as-is (with encoding)
   - ✅ gs:// URLs are converted to download URLs via getDownloadURL()
   - ✅ Storage paths (/notes/file.pdf) are converted to download URLs
   - ✅ Empty/null/undefined inputs throw appropriate errors
   - ✅ Invalid URL formats throw appropriate errors
   - ✅ Firebase storage errors are caught and re-thrown with context

2. **resolveAndFetchUrl()**
   - ✅ URL resolution without blob creation
   - ✅ Blob URL creation when asBlob=true
   - ✅ Retry logic on network failures
   - ✅ Error handling after max retries

3. **validateFileUrl()**
   - ✅ Valid URLs return {valid: true}
   - ✅ Invalid URLs return {valid: false, error: string}

**Run tests:**
```bash
npm run test src/services/__tests__/storageHelpers.test.js
```

---

## Integration Tests

### NotePreviewModal Integration Tests
**Location:** `src/components/notes/__tests__/NotePreviewModal.test.jsx` (create this)

**What to test:**

1. **URL Resolution on Modal Open**
   ```jsx
   it('should resolve gs:// URL to HTTPS before rendering', async () => {
     const mockNote = {
       id: '123',
       title: 'Test Note',
       fileUrl: 'gs://bucket/notes/test.pdf',
       fileType: 'application/pdf'
     };

     render(<NotePreviewModal isOpen={true} note={mockNote} onClose={vi.fn()} />);

     // Wait for URL resolution
     await waitFor(() => {
       expect(getDownloadUrlFromPath).toHaveBeenCalledWith('gs://bucket/notes/test.pdf');
     });

     // Check that iframe uses resolved URL
     const iframe = screen.getByTitle(/PDF Preview/i);
     expect(iframe.src).toContain('https://firebasestorage.googleapis.com');
   });
   ```

2. **Error Handling for Invalid URLs**
   ```jsx
   it('should show error message for invalid URL', async () => {
     const mockNote = {
       fileUrl: 'invalid-url-format',
       title: 'Test'
     };

     render(<NotePreviewModal isOpen={true} note={mockNote} onClose={vi.fn()} />);

     await waitFor(() => {
       expect(screen.getByText(/Failed to load file/i)).toBeInTheDocument();
     });
   });
   ```

3. **Placeholder URL Detection**
   ```jsx
   it('should detect and warn about placeholder URLs', async () => {
     const mockNote = {
       fileUrl: 'https://example.com/fake.pdf',
       title: 'Test'
     };

     render(<NotePreviewModal isOpen={true} note={mockNote} onClose={vi.fn()} />);

     await waitFor(() => {
       expect(screen.getByText(/placeholder URL/i)).toBeInTheDocument();
     });
   });
   ```

**Setup:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Run tests:**
```bash
npm run test src/components/notes/__tests__/NotePreviewModal.test.jsx
```

---

## Manual Testing Checklist

### Test Data Setup
Create test notes in Firestore with different URL formats:

1. **Valid HTTPS URL** (should work immediately)
   ```json
   {
     "title": "Test Note 1",
     "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/notes%2Ftest.pdf?alt=media&token=...",
     "fileType": "application/pdf"
   }
   ```

2. **gs:// URL** (should be converted)
   ```json
   {
     "title": "Test Note 2",
     "fileUrl": "gs://your-bucket/notes/test.pdf",
     "fileType": "application/pdf"
   }
   ```

3. **Storage Path** (should be converted)
   ```json
   {
     "title": "Test Note 3",
     "fileUrl": "/notes/test.pdf",
     "fileType": "application/pdf"
   }
   ```

4. **Placeholder URL** (should show error)
   ```json
   {
     "title": "Test Note 4",
     "fileUrl": "https://example.com/placeholder.pdf",
     "fileType": "application/pdf"
   }
   ```

5. **Missing URL** (should show error)
   ```json
   {
     "title": "Test Note 5",
     "fileUrl": null,
     "fileType": "application/pdf"
   }
   ```

---

### Preview Flow Testing

**Test Scenario 1: NotePreviewModal (from Notes List)**

1. Navigate to `/notes` page
2. Click "Preview" button on a note card
3. ✅ Modal should open without "Invalid PDF URL" error
4. ✅ PDF should load and display correctly
5. ✅ Console should show:
   ```
   📝 Preview Modal Opening
   🔄 Resolving file URL...
   ✅ Resolved URL: https://...
   ✅ Valid HTTPS URL: firebasestorage.googleapis.com
   ```

**Test Scenario 2: Dedicated Preview Page (/preview/:id)**

1. Navigate to Notes list
2. Click a note card (opens `/preview/:id`)
3. ✅ PDF preview page should load
4. ✅ PDF should render in iframe or PDF.js viewer
5. ✅ No "Invalid PDF URL" errors

**Test Scenario 3: NoteDetail Page**

1. Navigate to `/notes/:id` (note detail page)
2. Click "Preview" tab
3. ✅ Inline PDF preview should load
4. ✅ Download button should use resolved URL

**Test Scenario 4: Upload Preview**

1. Navigate to `/upload`
2. Select a PDF file
3. Fill in form fields
4. Click "Preview" button
5. ✅ Preview modal should open with blob URL
6. ✅ PDF should display correctly

---

### Error Handling Testing

**Test 1: Invalid URL Format**
- Manually set `fileUrl` to invalid format in Firestore
- Expected: Error message with details, not generic "Invalid PDF URL"
- Console should show full error trace

**Test 2: Non-existent File (404)**
- Set valid storage path but delete file from Storage
- Expected: Error message about file not found
- Suggestion to re-upload

**Test 3: Network Failure**
- Use browser DevTools to throttle/block network
- Expected: Retry attempt + fallback to iframe
- Clear error message to user

**Test 4: CORS Issues**
- Should auto-detect Firebase Storage URLs
- Should fall back to iframe preview
- Console should show: "🔥 Firebase Storage detected - using iframe directly"

---

## Regression Testing

### Before/After Comparison

**Before Fix:**
- ❌ "Invalid PDF URL. The file link is not properly formatted."
- ❌ Preview fails for gs:// URLs
- ❌ Preview fails for storage paths

**After Fix:**
- ✅ gs:// URLs automatically converted
- ✅ Storage paths automatically converted
- ✅ Clear error messages with troubleshooting info
- ✅ Console logs show resolution process
- ✅ Fallback mechanisms work

---

## Performance Testing

1. **Large File Handling**
   - Test with PDF > 10MB
   - Should show loading indicator
   - Should not block UI thread

2. **URL Resolution Speed**
   - Measure time from modal open to PDF display
   - Should complete in < 2 seconds on good connection

3. **Memory Leaks**
   - Open/close preview 20 times
   - Check browser memory doesn't grow unbounded
   - Blob URLs should be revoked on close

---

## End-to-End Test Script

**Using Playwright/Cypress:**

```javascript
describe('PDF Preview E2E', () => {
  it('should preview note with gs:// URL', () => {
    cy.visit('/notes');
    cy.contains('Test Note').click();
    cy.get('[data-testid="preview-button"]').click();

    // Modal opens
    cy.get('[data-testid="preview-modal"]').should('be.visible');

    // No error message
    cy.contains('Invalid PDF URL').should('not.exist');

    // PDF loads (check iframe src or Document component)
    cy.get('iframe[title*="PDF"]')
      .should('have.attr', 'src')
      .and('include', 'firebasestorage.googleapis.com');
  });
});
```

---

## Database Cleanup Script

**Run before testing:**
```bash
node scripts/scan-invalid-urls.js
```

**Expected Output:**
```
🔍 Scanning notes collection for invalid URLs...

📊 SCAN SUMMARY
Total notes scanned: 25

✅ Valid HTTPS URLs: 20
❌ Missing URLs: 2
⚠️  Placeholder URLs: 1
🔧 gs:// URLs (need conversion): 2
📁 Storage paths (need conversion): 0

💡 RECOMMENDATIONS
...
```

---

## Acceptance Criteria

All tests must pass before marking issue as resolved:

- [ ] Unit tests: 100% pass rate
- [ ] Integration tests: All scenarios pass
- [ ] Manual preview from Notes list works
- [ ] Manual preview from /preview/:id works
- [ ] Upload preview works
- [ ] Error messages are clear and actionable
- [ ] Console logs help with debugging
- [ ] No "Invalid PDF URL" errors for valid storage URLs
- [ ] scan-invalid-urls.js script runs successfully
- [ ] Performance is acceptable (< 2s load time)
- [ ] No memory leaks
- [ ] Works in Chrome, Firefox, Safari

---

## Test Coverage Goals

- Unit test coverage: > 90%
- Integration test coverage: > 80%
- E2E test coverage: Critical paths (preview from list, detail, upload)

---

## Test Execution Order

1. ✅ Run `scan-invalid-urls.js` to identify problematic entries
2. ✅ Run unit tests (`npm test storageHelpers.test.js`)
3. ✅ Run integration tests
4. ✅ Manual testing (all scenarios)
5. ✅ E2E tests
6. ✅ Performance tests
7. ✅ Regression tests

---

## Notes

- Use browser DevTools Console to monitor URL resolution logs
- Check Network tab for failed requests
- Firestore indexes may affect query performance
- Test with both development and production Firebase configs
