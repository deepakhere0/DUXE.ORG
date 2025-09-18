# Netlify Environment Variables Checklist

## Required Variables to Add in Netlify Dashboard

Go to: **Site Settings → Environment Variables**

Add these variables with your actual Firebase values:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATACONNECT_SERVICE_ID=student-platform
VITE_FIREBASE_DATACONNECT_LOCATION=us-central1
VITE_USE_EMULATOR=false
```

## How to Find Your Firebase Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app
6. Copy the config values

## Test After Adding Variables

1. Save environment variables in Netlify
2. Go to **Deploys** tab
3. Click **"Trigger deploy"** → **"Deploy site"**  
4. Wait for build to complete
5. Test the site URL again
