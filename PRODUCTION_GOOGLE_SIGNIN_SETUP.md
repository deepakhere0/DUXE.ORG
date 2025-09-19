# 🌐 Google Sign-In Setup for Production: duxe.org

## 🎉 Congratulations on Your Deployment!

Your DUXE platform is live at **https://duxe.org** - now let's get Google Sign-In working in production.

---

## 🚀 Production Setup Steps

### **Step 1: Update Google Cloud Console for Production**

#### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `duxe-5c071`
3. Go to **"APIs & Services"** → **"Credentials"**

#### 1.2 Update OAuth 2.0 Client ID
1. Find your existing OAuth 2.0 Client ID (created earlier)
2. Click on it to edit
3. **Add these Authorized JavaScript origins**:
   ```
   https://duxe.org
   https://www.duxe.org
   http://localhost:5000 (keep for local development)
   http://localhost:3000 (keep for local development)
   ```

4. **Add these Authorized redirect URIs**:
   ```
   https://duxe.org/__/auth/handler
   https://www.duxe.org/__/auth/handler
   https://duxe.org/__/auth/iframe
   https://www.duxe.org/__/auth/iframe
   http://localhost:5000/__/auth/handler (keep for local development)
   http://localhost:3000/__/auth/handler (keep for local development)
   ```

5. Click **"Save"**

#### 1.3 Update OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Update **Authorized domains**:
   ```
   duxe.org
   localhost (keep for development)
   ```
3. Update **Application Homepage**: `https://duxe.org`
4. Update **Privacy Policy URL**: `https://duxe.org/privacy`
5. Update **Terms of Service URL**: `https://duxe.org/terms`
6. Click **"Save and Continue"**

---

### **Step 2: Update Firebase Hosting Configuration**

#### 2.1 Firebase Console - Hosting
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `duxe-5c071`
3. Go to **"Hosting"**
4. Click on your deployed site
5. Click **"Add custom domain"**
6. Add: `duxe.org`
7. Follow the domain verification process

#### 2.2 Firebase Console - Authentication
1. Go to **"Authentication"** → **"Settings"**
2. Scroll to **"Authorized domains"**
3. Add: `duxe.org`
4. Click **"Add domain"**

---

### **Step 3: Production Environment Variables**

Since you're deployed, make sure your production environment has these variables:

```bash
# Production Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyB13RVT0Fvxmp4g1Vp2BM8PQtTO1bsprMs
VITE_FIREBASE_AUTH_DOMAIN=duxe-5c071.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duxe-5c071
VITE_FIREBASE_STORAGE_BUCKET=duxe-5c071.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=976144847500
VITE_FIREBASE_APP_ID=1:976144847500:web:08de97c6f42024650161a9
VITE_FIREBASE_MEASUREMENT_ID=G-RPKC7R4W2L
VITE_GEMINI_API_KEY=AIzaSyAgrAxI8lSgnGyVnwkPD1iRNQuNaRtyklY
```

---

### **Step 4: Test Production Google Sign-In**

#### 4.1 Test on Production Site
1. Go to: **https://duxe.org/signup**
2. Click **"Continue with Google"**
3. Should open Google authentication popup
4. Complete sign-in process
5. Should redirect to dashboard

#### 4.2 Test Different Pages
- **Signup**: https://duxe.org/signup
- **Login**: https://duxe.org/login
- **Test Page**: https://duxe.org/test-google-signin (if available in production)

---

### **Step 5: SSL Certificate & Security**

#### 5.1 Verify HTTPS
- Ensure **https://duxe.org** loads with valid SSL certificate
- Mixed content warnings can break authentication

#### 5.2 Security Headers
Make sure your hosting provider supports:
- HTTPS enforced
- Security headers configured
- CORS properly set up

---

## 🔧 Platform-Specific Instructions

### **If deployed on Netlify:**
1. Add environment variables in **Site Settings** → **Environment Variables**
2. Make sure redirects are configured for SPA routing

### **If deployed on Vercel:**
1. Add environment variables in **Project Settings** → **Environment Variables**
2. Ensure build command includes all env vars

### **If deployed on Firebase Hosting:**
1. Environment variables should be built into the app during build
2. Make sure `firebase deploy` includes the latest build

---

## 🚨 Common Production Issues & Solutions

### Issue: "This app isn't verified" in production
**Solution**: 
1. In Google Cloud Console → OAuth consent screen
2. Change from "Testing" to "In production"
3. OR add users to test users list

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: 
1. Check exact URLs in Google Cloud Console
2. Make sure **https://** is used (not http://)
3. Include both `duxe.org` and `www.duxe.org`

### Issue: "Cross-origin request blocked"
**Solution**:
1. Add `duxe.org` to Firebase authorized domains
2. Check CORS settings on your hosting provider

### Issue: Environment variables not working
**Solution**:
1. Rebuild and redeploy after adding environment variables
2. Check that variables are properly prefixed with `VITE_`

---

## 🎯 Production Testing Checklist

### **Test These URLs:**
- ✅ https://duxe.org/signup (Google Sign-In button)
- ✅ https://duxe.org/login (Google Sign-In button)
- ✅ https://duxe.org/tools (AI features after sign-in)
- ✅ User profile creation in Firebase
- ✅ Redirect to dashboard after sign-in

### **Check Firebase Console:**
- ✅ Authentication → Users (should show production sign-ins)
- ✅ Firestore → users collection (user profiles created)
- ✅ Hosting → Domain status (should show connected)

### **Browser Dev Tools:**
- ✅ Console: No authentication errors
- ✅ Network: Successful API calls to Firebase
- ✅ Application: Firebase SDK loaded correctly

---

## 📞 Quick Support Commands

### **Test production URLs:**
```powershell
# Test if site is accessible
Invoke-WebRequest -Uri "https://duxe.org" -Method Head
```

### **Check DNS:**
```powershell
nslookup duxe.org
```

### **Local development still works:**
```powershell
npm run dev
# Test: http://localhost:5000/signup
```

---

## 🎉 Production Success Indicators

You'll know everything is working when:
- ✅ **https://duxe.org** loads without SSL errors
- ✅ Google Sign-In popup opens on production site
- ✅ Users can complete authentication flow
- ✅ Users are redirected to dashboard after sign-in
- ✅ User profiles appear in Firebase Console
- ✅ No console errors in browser dev tools

---

## 🚀 Next Actions for You:

1. **Update Google Cloud Console** (Step 1 above)
2. **Add duxe.org to Firebase authorized domains** (Step 2 above)
3. **Test on https://duxe.org/signup**
4. **Let me know if you encounter any issues!**

Your production deployment is ready - just need to configure the OAuth settings for your domain! 🌟