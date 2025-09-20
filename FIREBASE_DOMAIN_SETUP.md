# Firebase Domain Configuration for duxe.org

## Issue
Your app is running on `https://duxe.org` but Firebase authentication is not configured for this domain, causing COOP and popup errors.

## Solution Steps

### 1. Add Authorized Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/duxe-5c071/authentication/settings)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain**
4. Add: `duxe.org`
5. Click **Done**

### 2. Update Firebase Auth Settings

1. In Firebase Console, go to **Authentication** → **Settings** → **General**
2. Scroll down to **Authorized domains** section
3. Ensure both domains are listed:
   - `localhost` (for development)
   - `duxe.org` (for production)

### 3. Check OAuth Redirect URLs

If using Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project: `duxe-5c071`
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://duxe.org/__/auth/handler`
   - `https://duxe-5c071.firebaseapp.com/__/auth/handler`

### 4. Update CORS Headers (if needed)

Your Firebase Functions might need CORS configuration for the new domain.

## Test After Configuration

1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache
3. Try authentication again on https://duxe.org

## Alternative: Local Testing

To test locally without domain issues:
```bash
# Run on localhost instead of duxe.org
npm run dev
# Then access: http://localhost:5000
```