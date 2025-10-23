# 🔍 Preview Diagnostic Guide

## Issue: Preview shows blank content (only navigation visible)

### ✅ Diagnostics Checklist

When you click Preview and see only the navigation bar:

#### 1. **Check Browser Console** (F12 → Console tab)

Look for these log groups:
```
📝 Preview Modal Opening
  - Note: {...}
  - File URL: https://...
  - File Type: application/pdf
  - 📄 Detected file type: pdf
  - ⏱️ Render will be ready in 100ms
  - ✅ Render ready!
```

**If you DON'T see these logs:**
- Modal isn't opening properly
- Check: `isOpen` prop is true
- Check: `note` object is passed correctly

#### 2. **Check Rendering Conditions**

Look for:
```
📺 Rendering content... { fileType: 'pdf', useFallback: true/false, noteUrl: '...' }
```

**If missing:**
- `renderReady` might be false
- `error` might be set
- Check previous error messages

#### 3. **PDF Loading (react-pdf method)**

If using react-pdf, look for:
```
✅ PDF loaded successfully! { numPages: X }
```

**If you see errors:**
```
❌ PDF Load Error: ...
🔄 Attempting fallback iframe preview...
```
→ System will automatically switch to iframe fallback

#### 4. **Iframe Fallback (Firebase Storage direct)**

Look for:
```
✅ Iframe loaded successfully
```

**If you see:**
```
❌ Iframe load error: ...
```
→ File URL may be invalid or CORS blocked

#### 5. **Network Tab** (F12 → Network)

Filter for the PDF file:
- Status should be **200 OK**
- Type should be **application/pdf**
- Size should show actual file size

**Common issues:**
- **404** - File doesn't exist at that URL
- **403** - Firebase Storage rules blocking access
- **CORS error** - Browser blocked cross-origin request

---

## 🛠️ Common Fixes

### Issue: `renderReady` stays false
**Symptoms:** Loading spinner forever  
**Fix:** Check if `setTimeout` is completing
```javascript
// Already implemented in code:
setTimeout(() => {
  console.log('✅ Render ready!');
  setRenderReady(true);
}, 100);
```

### Issue: Modal has no height
**Symptoms:** Modal visible but compressed/tiny  
**Fix:** Already implemented:
```javascript
<div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ minHeight: '400px' }}>
```

### Issue: Iframe blocked by sandbox
**Symptoms:** Console error about sandbox restrictions  
**Fix:** Already configured:
```javascript
sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
```

### Issue: Z-index too low
**Symptoms:** Home page visible behind modal  
**Fix:** Already set to maximum:
```javascript
className="fixed inset-0 z-[9999] flex items-center justify-center"
```

### Issue: Body scrolling interferes
**Symptoms:** Can scroll background while modal open  
**Fix:** Already locked:
```javascript
document.body.style.overflow = 'hidden'; // on open
document.body.style.overflow = 'unset';  // on close
```

---

## 🔧 Manual Testing Steps

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Click Preview on any note**
4. **Watch for log groups in this order:**
   ```
   📝 Preview Modal Opening
   ✅ Render ready!
   📺 Rendering content...
   🔄 Attempting fallback... (if react-pdf fails)
   ✅ Iframe loaded successfully
   ```

5. **Go to Network tab**
6. **Check for PDF request:**
   - Should see request to Firebase Storage URL
   - Status: 200 OK
   - Type: application/pdf

7. **Go to Elements tab**
8. **Inspect modal structure:**
   ```html
   <div class="fixed inset-0 z-[9999]...">  <!-- Should be visible -->
     <div class="absolute inset-0 bg-black/80..."></div>  <!-- Backdrop -->
     <div class="relative w-full h-full...">  <!-- Modal content -->
       <div class="flex-1 overflow-auto..." style="min-height: 400px;">
         <iframe src="..."></iframe>  <!-- Should have valid src -->
       </div>
     </div>
   </div>
   ```

---

## 📊 Expected Console Output (Success)

```
📝 Preview Modal Opening
  Note: {id: "abc123", title: "lab file", fileUrl: "https://...", ...}
  File URL: https://firebasestorage.googleapis.com/v0/b/.../lab-file.pdf
  File Type: application/pdf
  📄 Detected file type: pdf
  ⏱️ Render will be ready in 100ms

✅ Render ready!

📺 Rendering content... {fileType: "pdf", useFallback: false, noteUrl: "https://..."}

❌ PDF Load Error: {message: "...", ...}  ← react-pdf failed (expected)
  Error details: {...}
  PDF URL: https://...
🔍 PDF Diagnostics
  Testing URL: https://...
  ✅ Response status: 200
  ✅ Content-Type: application/pdf
  ✅ File size: 1234567
  ✅ CORS enabled: true
  💡 Suggestion: URL appears valid. If preview still fails, try iframe fallback.

🔄 Attempting fallback iframe preview...

✅ Iframe loaded successfully
```

---

## 🚨 If Preview Still Doesn't Work

After checking all diagnostics, if preview is still blank:

1. **Copy the File URL from console**
2. **Open it directly in new tab**
3. **If it downloads → Firebase Storage issue**
4. **If it opens → Modal rendering issue**

### Firebase Storage Issue
```bash
# Check CORS configuration
gsutil cors get gs://your-bucket-name.appspot.com

# If needed, apply CORS
gsutil cors set cors.json/cors.json gs://your-bucket-name.appspot.com
```

### Modal Rendering Issue
Check that:
- Modal container has proper height
- Content area is not `display: none`
- No CSS is hiding the iframe
- React state is updating correctly

---

## 📞 Still Need Help?

**Provide these details:**
1. Complete console output
2. Network tab screenshot showing PDF request
3. Elements tab screenshot of modal structure
4. File URL (can be partial: `...firebasestorage.../notes/...pdf`)
5. Browser and version

**Current implementation has:**
- ✅ Automatic fallback (react-pdf → iframe)
- ✅ Comprehensive logging
- ✅ CORS diagnostics
- ✅ Error handling
- ✅ Loading states
- ✅ Z-index fixes
- ✅ Body scroll lock
- ✅ Height constraints
