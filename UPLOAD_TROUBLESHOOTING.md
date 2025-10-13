# Upload Issues - Troubleshooting Guide

## ✅ Fixed Issues

The upload functionality has been completely rewritten with improved:
- Progress tracking and real-time feedback
- Better error handling with specific error messages
- Resume-able uploads for reliability
- Admin permission validation
- Debug information panel

## 🔧 How to Test the Fix

### Step 1: Deploy Updated Rules
```bash
# Deploy the updated Firebase Storage rules
firebase deploy --only storage

# Deploy Firestore rules (if needed)
firebase deploy --only firestore:rules
```

### Step 2: Verify Admin User Setup
```bash
# Run the admin verification script
npm run check-admin
```

### Step 3: Test Upload
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to: http://localhost:5173
3. Login as admin
4. Go to Upload page: http://localhost:5173/upload
5. Try uploading a file (PDF or image under 50MB)

## 🐛 Common Issues & Solutions

### Issue 1: "Permission denied" error
**Cause**: User not properly configured as admin
**Solution**: 
1. Run `npm run check-admin` script
2. Ensure user role is set to 'admin' in Firestore
3. Redeploy Storage rules if needed

### Issue 2: "Firebase Storage service is not available"
**Cause**: Firebase not properly configured
**Solution**:
1. Check `.env.local` file has all required variables
2. Verify Firebase project settings
3. Restart development server

### Issue 3: Upload times out/gets stuck
**Cause**: Large file or network issues
**Solution**:
1. Try smaller file (under 10MB for testing)
2. Check internet connection
3. Look at debug panel for specific errors

### Issue 4: "Storage rules don't allow this operation"
**Cause**: Firebase Storage rules are too restrictive
**Solution**:
1. Deploy updated storage rules: `firebase deploy --only storage`
2. Ensure user is authenticated before uploading

## 📋 Upload Process Improvements

### New Features Added:
1. **Real-time Progress Bar**: Shows upload percentage
2. **Step-by-step Status**: Displays current operation
3. **Debug Information Panel**: Shows technical details
4. **Better Error Messages**: Specific error explanations
5. **Resume-able Uploads**: More reliable for large files
6. **Permission Validation**: Checks admin status in database

### Debug Information:
The upload now shows debug information including:
- Firebase configuration status
- Admin permission validation
- File upload progress
- Firestore document creation
- Error details with recovery tips

## 🚀 Testing Checklist

- [ ] Admin user exists in Firestore with role='admin'
- [ ] Firebase Storage rules deployed
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Admin logged in successfully
- [ ] Upload page accessible
- [ ] File selection works
- [ ] Progress bar displays during upload
- [ ] Debug information shows in panel
- [ ] Success message appears after upload
- [ ] Note appears in notes list

## 📞 Still Having Issues?

If uploads are still failing:

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Look for failed network requests
3. **Check Firebase Console**: Look for security rule violations
4. **Check Debug Panel**: Look for specific error messages
5. **Try Different File**: Test with small PDF (under 5MB)

## 🛠️ Advanced Debugging

### Enable Detailed Logging:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed log messages during upload
4. Check Network tab for failed requests

### Check Firebase Security Rules:
1. Go to Firebase Console → Storage → Rules
2. Ensure rules allow authenticated uploads
3. Check Firestore rules for user permissions

### Verify File Type:
- Supported: PDF, JPG, PNG, JPEG
- Max size: 50MB
- File name should not have special characters

## 📈 Performance Tips

1. **Optimal File Sizes**:
   - PDFs: 5-20MB
   - Images: 1-5MB

2. **Network Requirements**:
   - Stable internet connection
   - Upload speed > 1 Mbps recommended

3. **Browser Compatibility**:
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Full support