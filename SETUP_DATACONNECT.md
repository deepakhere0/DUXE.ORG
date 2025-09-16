# Firebase Data Connect Setup Guide

## Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created in the Firebase Console
- Firebase configuration values

## Step 1: Create Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase configuration values in `.env.local`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Data Connect Configuration
VITE_FIREBASE_DATACONNECT_SERVICE_ID=student-platform
VITE_FIREBASE_DATACONNECT_LOCATION=us-central1

# Optional: For local development
VITE_USE_EMULATOR=false
```

## Step 2: Firebase Authentication

1. Login to Firebase:
```bash
firebase login
```

2. Select your Firebase project:
```bash
firebase use your-project-id
```

## Step 3: Initialize Firebase Data Connect

1. Initialize Data Connect in your project:
```bash
firebase init dataconnect
```

2. Select the following options:
   - Choose existing project or create new
   - Use `us-central1` as the location
   - Use the default service name `student-platform`

## Step 4: Deploy the Schema

1. Deploy the Data Connect schema:
```bash
firebase deploy --only dataconnect:schema
```

2. Deploy the connectors:
```bash
firebase deploy --only dataconnect:connectors
```

3. Or deploy everything at once:
```bash
firebase deploy --only dataconnect
```

## Step 5: Deploy Firestore Rules and Indexes

1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Step 6: Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

## Step 7: Enable Required APIs

In the Google Cloud Console for your project, enable:
1. Firebase Data Connect API
2. Cloud SQL Admin API
3. Cloud Resource Manager API

## Step 8: Test the Connection

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the test page:
```
http://localhost:5173/test-dataconnect
```

3. Click "Test Connection" to verify Data Connect is working

## Using Firebase Emulators (Optional)

For local development without using production resources:

1. Start the emulators:
```bash
firebase emulators:start
```

2. Update `.env.local`:
```env
VITE_USE_EMULATOR=true
VITE_DATACONNECT_EMULATOR_HOST=localhost
VITE_DATACONNECT_EMULATOR_PORT=9399
```

3. Access the Emulator UI at `http://localhost:4000`

## Troubleshooting

### Connection Issues
- Ensure all environment variables are set correctly
- Check that Firebase APIs are enabled in Google Cloud Console
- Verify Firebase CLI is logged in to the correct account
- Make sure the Data Connect schema is deployed

### Query Errors
- Check the browser console for detailed error messages
- Verify the schema matches the queries in `src/services/dataConnect.js`
- Ensure authentication is working if queries require auth

### Development Tips
- Use the test page at `/test-dataconnect` to verify connections
- Check browser DevTools Network tab for GraphQL requests
- Use Firebase Emulator UI to inspect data during development
- Keep the schema file synchronized with your queries

## Migration from Firestore

If you have existing data in Firestore:

1. Export your Firestore data:
```bash
gcloud firestore export gs://your-bucket/firestore-export
```

2. Transform the data to match the Data Connect schema
3. Use the Data Connect Admin SDK to import the transformed data
4. Update your application code to use Data Connect queries instead of Firestore

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

3. Set up monitoring in Firebase Console for:
   - Data Connect query performance
   - Error rates
   - Usage metrics

## Support Resources

- [Firebase Data Connect Documentation](https://firebase.google.com/docs/data-connect)
- [GraphQL Documentation](https://graphql.org/learn/)
- Project Schema: `dataconnect-schema.gql`
- Query Examples: `dataconnect/notes.gql`
