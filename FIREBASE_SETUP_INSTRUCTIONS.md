# 🔥 Firebase Setup Instructions for Admin Dashboard

## Current Issue: Firestore Billing Required

Your Firebase project `duxe-5c071` needs billing enabled to use Firestore. Here's how to fix this:

## Step 1: Enable Billing on Firebase Project

1. **Visit Firebase Console**: https://console.firebase.google.com/project/duxe-5c071
2. **Go to Project Settings** (gear icon) → **Usage and Billing**
3. **Click "Modify Plan"** → **Select "Blaze Plan" (Pay as you go)**
4. **Add a payment method** (credit/debit card)
5. **Confirm the upgrade**

> **Note**: Firebase has generous free tiers. You likely won't be charged for development usage.

## Step 2: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. **Select "Start in test mode"** for now
4. **Choose your preferred region** (us-central1 is recommended)
5. **Click "Done"**

## Step 3: Deploy Security Rules

Once Firestore is created, run:
```bash
firebase deploy --only firestore:rules
```

## Step 4: Run Population Scripts

After Firestore is set up, run these commands:
```bash
node scripts/populate-universities.js
node scripts/populate-departments.js
node scripts/create-sample-notes.js
```

## Alternative: Manual Data Entry

If you can't enable billing right now, you can manually add test data through Firebase Console:

### 1. Create Universities Collection
Go to Firestore → Create collection "universities" → Add these documents:

**Document ID**: `iit-bombay`
```json
{
  "name": "Indian Institute of Technology Bombay",
  "shortName": "IIT Bombay", 
  "type": "IIT",
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Document ID**: `bits-pilani`
```json
{
  "name": "Birla Institute of Technology and Science Pilani",
  "shortName": "BITS Pilani",
  "type": "Private", 
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Create Departments Collection
Create collection "departments" → Add these documents:

**Document ID**: `dept-cse-iit-bombay`
```json
{
  "name": "Computer Science and Engineering",
  "shortName": "CSE",
  "code": "CSE",
  "uniId": "iit-bombay",
  "uniName": "IIT Bombay",
  "category": "engineering",
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. Create Sample Pending Notes
Create collection "notes" → Add these documents:

**Document ID**: `sample-note-1`
```json
{
  "title": "Data Structures and Algorithms",
  "courseCode": "CSE201", 
  "universityId": "iit-bombay",
  "departmentId": "dept-cse-iit-bombay",
  "semester": 3,
  "authorName": "Test Student",
  "createdBy": "test_student_uid",
  "status": "pending",
  "fileUrl": "https://example.com/sample.pdf",
  "description": "Complete notes on DSA",
  "downloads": 0,
  "ratingAvg": 0,
  "ratingCount": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Step 5: Update Admin UID

Don't forget to update your admin UID in:
`src/components/auth/AdminRoute.jsx` line 6:

```javascript
const ADMIN_UID = 'YOUR_ACTUAL_FIREBASE_AUTH_UID_HERE';
```

## Step 6: Test Admin Dashboard

1. **Start your dev server**: `npm run dev`
2. **Login with your admin account** 
3. **Visit**: http://localhost:5000/admin
4. **Verify** you can see pending notes and perform actions

## Firebase Free Tier Limits

Don't worry about costs - Firebase has generous free limits:
- **Reads**: 50,000/day
- **Writes**: 20,000/day  
- **Deletes**: 20,000/day
- **Storage**: 1 GB

Perfect for development and testing!

## Need Help?

If you need assistance with:
1. **Enabling billing** - Follow Firebase console prompts
2. **Creating Firestore** - Use Firebase console wizard
3. **Manual data entry** - Use the JSON examples above
4. **Testing admin features** - Sample data will show pending notes

The admin dashboard is ready to go once you have Firestore data! 🚀