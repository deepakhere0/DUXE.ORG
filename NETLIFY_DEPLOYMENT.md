# DUXE Platform - Netlify Deployment Guide

## Overview
This guide explains how to deploy the DUXE platform to Netlify, including handling the secrets scanning requirements.

## Quick Deployment Steps

### 1. Repository Setup
- Ensure your code is pushed to GitHub/GitLab/Bitbucket
- The `netlify.toml` file is already configured in the repository

### 2. Netlify Site Creation
1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your repository
4. Use these build settings:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 3. Environment Variables Setup
In Netlify Dashboard → Site Settings → Environment Variables, add:

**Required Firebase Variables (Safe for Client-Side):**
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Optional Firebase Data Connect:**
```
VITE_FIREBASE_DATACONNECT_SERVICE_ID=student-platform
VITE_FIREBASE_DATACONNECT_LOCATION=us-central1
```

**Development Mode:**
```
VITE_USE_EMULATOR=false
```

**⚠️ DO NOT ADD VITE_GEMINI_API_KEY in Production**
The Gemini API key is completely excluded from production builds via Vite configuration. AI features automatically show demo content in production.

### 4. Deploy
Click "Deploy site" - the build should now succeed!

## Secrets Scanning Configuration

The deployment uses two approaches to handle Netlify's secrets scanning:

1. **Vite Build Configuration**: The `vite.config.js` excludes sensitive variables from production builds
2. **Netlify Settings**: `SECRETS_SCAN_ENABLED=false` in `netlify.toml` disables scanning entirely

This ensures that only Firebase config variables (which are meant to be public) are included in the final build.

## Security Notes

### ✅ Safe to Expose (Client-Side)
- Firebase configuration values
- Firebase project IDs and domain names
- Public API endpoints
- Feature flags

### 🚫 Keep Secret (Server-Side Only)
- API keys with billing/rate limits (like Gemini API)
- Database passwords
- Private keys or certificates
- OAuth client secrets

## AI Features in Production

AI features are currently disabled in production for security reasons:
- The Gemini API key should not be exposed in client-side code
- Consider implementing a backend API for AI features
- Users will see demo content instead of real AI-generated content

## Troubleshooting

### Build Fails with "Secrets scanning found secrets"
1. Check that `netlify.toml` is in your repository root
2. Verify the `SECRETS_SCAN_OMIT_KEYS` includes your Firebase variables
3. Remove any actual API keys from documentation files

### Environment Variables Not Working
1. Double-check variable names in Netlify dashboard
2. Ensure they start with `VITE_` prefix
3. Redeploy after adding variables

### Firebase Connection Issues
1. Verify all Firebase config variables are set correctly
2. Check Firebase project settings match your environment variables
3. Ensure Firebase hosting/authentication is properly configured

## Custom Domain (Optional)

After successful deployment:
1. Go to Domain settings in Netlify
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## Monitoring

Monitor your deployment:
- **Build logs**: Check for any warnings or errors
- **Function logs**: Monitor for any runtime issues
- **Analytics**: Track site performance and usage

## Performance Optimization

The build includes several optimizations:
- Code splitting for better loading
- Asset compression
- CDN distribution via Netlify
- Security headers configured

---

**Need Help?**
- Check Netlify documentation
- Review build logs for specific errors
- Ensure all environment variables are correctly configured
