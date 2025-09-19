# ✅ Google Sign-In Setup Checklist

## 🎯 Your Current Status
- ✅ Firebase project exists: `duxe-5c071`
- ✅ Environment variables configured
- ✅ React app code ready
- ✅ Test component created

## 📋 Step-by-Step Checklist

### **Step 1: Firebase Console - Enable Google Auth**
1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: `duxe-5c071`

2. **Enable Google Authentication**
   - Click "Authentication" in left sidebar
   - Go to "Sign-in method" tab
   - Find "Google" provider
   - Click on "Google"
   - Toggle "Enable" to ON
   - Enter your email as "Project support email"
   - Click "Save"
   
   **Status**: ☐ Done

### **Step 2: Google Cloud Console - OAuth Setup**
1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Select project: `duxe-5c071`

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill required fields:
     - App name: `DUXE Student Platform`
     - User support email: Your email
     - Developer contact email: Your email
   - Add authorized domains: `localhost`
   - Click "Save and Continue"
   
   **Status**: ☐ Done

3. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: `DUXE Web Client`
   
   **Add Authorized JavaScript origins**:
   ```
   http://localhost:5000
   http://localhost:3000
   http://localhost:5173
   ```
   
   **Add Authorized redirect URIs**:
   ```
   http://localhost:5000/__/auth/handler
   http://localhost:3000/__/auth/handler
   http://localhost:5173/__/auth/handler
   ```
   
   - Click "Create"
   - Copy the Client ID (you won't need to paste it anywhere, Firebase handles this)
   
   **Status**: ☐ Done

### **Step 3: Test the Setup**
1. **Start your development server**
   ```powershell
   # Kill any existing processes
   taskkill /f /im node.exe
   taskkill /f /im npm.exe
   
   # Start fresh
   npm run dev
   ```
   
   **Status**: ☐ Done

2. **Test with the test component**
   - Open: http://localhost:5000/test-google-signin
   - Click "Sign in with Google"
   - Should open Google popup
   - Complete authentication
   - Should show your profile info
   
   **Status**: ☐ Done

3. **Test with actual signup page**
   - Open: http://localhost:5000/signup
   - Click "Continue with Google"
   - Should work the same way
   
   **Status**: ☐ Done

### **Step 4: Verify Everything Works**
1. **Check Firebase Console**
   - Go to Authentication → Users
   - Should see your user account listed
   
   **Status**: ☐ Done

2. **Check Browser Console**
   - Should see debug logs starting with 🔍
   - No error messages
   
   **Status**: ☐ Done

## 🚨 Common Issues & Solutions

### Issue: "This app isn't verified"
**Solution**: Click "Advanced" → "Go to DUXE Student Platform (unsafe)"

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: 
1. Check that redirect URIs in Google Cloud Console exactly match
2. Make sure you're using the correct port (5000, not 5173)

### Issue: "Access blocked"
**Solution**: 
1. In Google Cloud Console → OAuth consent screen
2. Add your email to "Test users"

### Issue: Firebase not configured
**Solution**: 
1. Restart development server: `npm run dev`
2. Check browser console for Firebase initialization logs

## 🎯 Quick Commands

### Check if server is running:
```powershell
netstat -ano | findstr :5000
```

### Check environment variables:
```powershell
Get-Content .env.local
```

### Start fresh:
```powershell
taskkill /f /im node.exe
npm run dev
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Google popup opens without errors
- ✅ User can complete authentication
- ✅ Test page shows user profile
- ✅ User appears in Firebase Authentication → Users
- ✅ No console errors

## 📞 Next Steps

1. **Follow the checklist above step by step**
2. **Let me know which step you're stuck on**
3. **Share any error messages you see**

**Current Priority**: Complete Step 1 and Step 2 in Firebase/Google Cloud Console first!