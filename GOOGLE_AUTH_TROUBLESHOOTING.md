# Google Authentication Troubleshooting Guide

## Overview
This guide helps resolve Google Sign-In issues, particularly the `auth/popup-closed-by-user` error and domain-related authentication problems.

## Quick Fix Checklist

### 1. ✅ Firebase Console Configuration
**CRITICAL:** Verify these settings in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`duxe-5c071`)
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Ensure these domains are listed in **Authorized domains**:
   - `duxe.org`
   - `www.duxe.org`
   - `duxe-5c071.firebaseapp.com`
   - `localhost` (for local development)

**Screenshots needed:** Document the current authorized domains list.

### 2. 🌐 Domain Configuration
- **Production Domain:** `https://duxe.org`
- **Firebase Hosting Domain:** `https://duxe-5c071.firebaseapp.com`
- **Auth Domain:** Should be `duxe-5c071.firebaseapp.com`

### 3. 🔧 Environment Variables
Check your `.env.local` file contains:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=duxe-5c071.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duxe-5c071
VITE_FIREBASE_STORAGE_BUCKET=duxe-5c071.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Error Analysis

### `auth/popup-closed-by-user`
**Cause:** This error occurs when:
- User manually closes the Google auth popup
- Cross-Origin Opener Policy (COOP) prevents popup communication
- Domain mismatch between your site and Firebase configuration

**Solution Applied:**
1. ✅ Smart authentication flow that detects production vs development
2. ✅ Automatic fallback from popup to redirect method
3. ✅ Enhanced error handling and user feedback

### `auth/unauthorized-domain`
**Cause:** Domain not listed in Firebase Console authorized domains

**Solution:**
1. Add `duxe.org` to authorized domains in Firebase Console
2. Ensure HTTPS is properly configured
3. Verify DNS settings point to Firebase Hosting

## Implementation Details

### Smart Authentication Flow
The updated system now includes:

```javascript
// Automatically chooses best method based on environment
const smartGoogleSignIn = async () => {
  const isProduction = window.location.origin.includes('duxe.org');
  
  if (isProduction) {
    // Use redirect method for production (COOP-safe)
    return await googleSignIn();
  } else {
    // Try popup first for local development
    const popupResult = await googleSignInPopup();
    if (!popupResult.success && popupResult.shouldFallbackToRedirect) {
      return await googleSignIn(); // Fallback to redirect
    }
    return popupResult;
  }
};
```

### Enhanced Error Handling
- 🔍 Detailed error logging with context
- 🎯 Specific error messages for different failure modes
- 🔄 Automatic fallback mechanisms
- 📱 User-friendly notifications

## Testing Steps

### 1. Local Development Test
```bash
npm run dev
# Navigate to http://localhost:5173/login
# Try Google Sign-In - should use popup method first
```

### 2. Production Test
```bash
npm run build
npm run preview
# Or deploy to staging environment
# Should automatically use redirect method
```

### 3. Live Production Test
- Visit `https://duxe.org/login`
- Click Google Sign-In button
- Should redirect to Google OAuth page
- Should redirect back to your site after authentication

## Debugging Tools

### Browser Developer Tools
1. **Console Tab:** Check for authentication errors
2. **Network Tab:** Monitor Firebase API calls
3. **Application Tab:** Inspect localStorage/sessionStorage for auth tokens

### Firebase Console Debugging
1. **Authentication > Users:** Verify successful sign-ins appear here
2. **Analytics:** Monitor authentication events
3. **Functions Log:** Check for any server-side errors

## Common Solutions

### Issue: Popup immediately closes
**Solution:** Domain not authorized in Firebase Console

### Issue: "This site can't be reached" after redirect
**Solution:** Verify domain DNS settings and Firebase Hosting setup

### Issue: Authentication works locally but fails in production
**Solution:** Check authorized domains include production domain

## Advanced Configuration

### Firebase Hosting Headers
Updated `firebase.json` with optimized headers:
```json
{
  "key": "Cross-Origin-Opener-Policy",
  "value": "same-origin-allow-popups"
},
{
  "key": "Cross-Origin-Embedder-Policy", 
  "value": "credentialless"
},
{
  "key": "Permissions-Policy",
  "value": "identity-credentials-get=*, publickey-credentials-get=*"
}
```

### Content Security Policy
Enhanced CSP for Google authentication:
```
frame-src 'self' https://accounts.google.com https://*.googleapis.com;
connect-src 'self' https://*.googleapis.com;
```

## Manual Verification Steps

1. **Firebase Console Check:**
   - [ ] Project ID matches: `duxe-5c071`
   - [ ] Google provider is enabled
   - [ ] `duxe.org` is in authorized domains
   - [ ] Web client configuration is correct

2. **DNS Check:**
   ```bash
   nslookup duxe.org
   # Should point to Firebase Hosting IP
   ```

3. **SSL Certificate:**
   - [ ] HTTPS is working on `duxe.org`
   - [ ] No certificate warnings
   - [ ] Secure connection established

## Contact Support

If issues persist after following this guide:
1. Document the exact error messages
2. Include browser console screenshots
3. Note the specific steps that reproduce the issue
4. Check Firebase Console for any service outages

## Recent Changes Applied

✅ **Smart authentication flow** - Automatically selects best method
✅ **Enhanced error handling** - Better user feedback and fallbacks  
✅ **Improved COOP compatibility** - Updated hosting headers
✅ **Development vs Production detection** - Different flows for different environments
✅ **Comprehensive logging** - Detailed debugging information

The system now handles the `auth/popup-closed-by-user` error gracefully and provides multiple authentication methods for maximum compatibility.