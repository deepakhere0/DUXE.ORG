# Google OAuth Domain Configuration Fix

## Issue
Google Sign-In works locally but fails on production, redirecting to `duxe-5c071.firebaseapp.com`

## Root Cause
Your production domain (Netlify) is not authorized in:
1. Firebase Authentication authorized domains
2. Google Cloud OAuth 2.0 configuration

## Solution Steps

### Step 1: Identify Your Production Domain
Your production site is likely hosted at one of:
- `https://duxe-org.netlify.app`
- `https://duxe.netlify.app`
- `https://your-custom-name.netlify.app`

### Step 2: Configure Firebase Authentication

1. **Go to**: https://console.firebase.google.com/
2. **Select project**: `duxe-5c071`
3. **Navigate to**: Authentication → Settings → Authorized domains
4. **Click "Add domain"**
5. **Add your Netlify domain** (without https://, just the domain part):
   ```
   your-site-name.netlify.app
   ```

### Step 3: Configure Google Cloud OAuth

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select project**: `duxe-5c071`  
3. **Find your OAuth 2.0 Client IDs** (Web application)
4. **Click the edit button (pencil icon)**
5. **Add to "Authorized JavaScript origins"**:
   ```
   https://your-site-name.netlify.app
   ```
6. **Add to "Authorized redirect URIs"**:
   ```
   https://your-site-name.netlify.app/__/auth/handler
   ```

### Step 4: Wait and Test
- **Wait 5-10 minutes** for changes to propagate
- **Clear browser cache** or use incognito mode
- **Test Google Sign-In** on your production site

## How to Find Your Exact Domain

### Method 1: Check Netlify Dashboard
1. Go to https://netlify.com (log in)
2. Find your deployed site
3. Copy the domain shown

### Method 2: From Error Message
1. Try Google Sign-In on production
2. The error will show the exact domain that needs authorization
3. Use that domain in the steps above

## Expected Behavior After Fix

**Before Fix:**
```
Click Google Sign-In → Redirects to duxe-5c071.firebaseapp.com → Error
```

**After Fix:**
```
Click Google Sign-In → Google OAuth popup/redirect → Success → Dashboard
```

## Common Domains to Try

If unsure, add all these to be safe:
```
your-actual-domain.netlify.app
duxe-org.netlify.app  
duxe.netlify.app
duxeorg.netlify.app
```

## Verification

After configuration:
1. Visit your production site from any device
2. Click "Sign in with Google"  
3. Should work without redirecting to Firebase domain

## Troubleshooting

**Still redirecting to Firebase domain?**
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Use incognito/private browsing mode
- Wait longer (up to 1 hour for full propagation)

**OAuth error "redirect_uri_mismatch"?**
- Double-check the redirect URI format
- Ensure it includes `/__/auth/handler`
- Case sensitivity matters