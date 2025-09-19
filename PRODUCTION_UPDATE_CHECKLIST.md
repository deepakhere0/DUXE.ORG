# 🚀 Production Update for duxe.org - Quick Checklist

## ✅ Current Status
- ✅ **Site Live**: https://duxe.org (Status: 200 OK)
- ✅ **Firebase Project**: duxe-5c071
- ✅ **Environment Variables**: Configured locally
- ✅ **Local Development**: Working on port 5000

---

## 🎯 URGENT: Update These Settings Now

### **1. Google Cloud Console - Add Production Domain**
**URL**: https://console.cloud.google.com/apis/credentials?project=duxe-5c071

1. **Find your OAuth 2.0 Client ID**
2. **Click to edit**
3. **Add to Authorized JavaScript origins**:
   ```
   https://duxe.org
   https://www.duxe.org
   ```

4. **Add to Authorized redirect URIs**:
   ```
   https://duxe.org/__/auth/handler
   https://www.duxe.org/__/auth/handler
   ```

5. **Click "Save"**

### **2. Firebase Console - Add Authorized Domain**
**URL**: https://console.firebase.google.com/project/duxe-5c071/authentication/settings

1. **Go to Authentication → Settings**
2. **Scroll to "Authorized domains"**
3. **Click "Add domain"**
4. **Enter**: `duxe.org`
5. **Click "Add"**

---

## 🧪 Test Production Google Sign-In

### **Test URLs**:
- **Signup**: https://duxe.org/signup
- **Login**: https://duxe.org/login
- **AI Tools**: https://duxe.org/tools

### **Expected Flow**:
1. Visit https://duxe.org/signup
2. Click "Continue with Google"
3. Google popup opens
4. Complete authentication
5. Redirects to dashboard
6. User appears in Firebase Console

---

## 🔧 Deployment Platform Check

### **Which platform did you use?**

#### **If Netlify**:
- Add environment variables in Site Settings
- Ensure build includes all VITE_ variables

#### **If Vercel**:
- Add environment variables in Project Settings  
- Redeploy after adding env vars

#### **If Firebase Hosting**:
- Environment variables should be built into app
- Run `firebase deploy` with latest build

#### **If Other Platform**:
- Make sure VITE_ environment variables are available during build
- HTTPS must be enforced
- SPA routing configured

---

## 🚨 Common Issues & Quick Fixes

### **Issue**: "redirect_uri_mismatch"
**Fix**: Make sure you added exact URLs to Google Cloud Console:
- `https://duxe.org/__/auth/handler`
- `https://www.duxe.org/__/auth/handler`

### **Issue**: "This app isn't verified"
**Fix**: Click "Advanced" → "Go to DUXE Student Platform (unsafe)"

### **Issue**: Environment variables not working
**Fix**: 
1. Check they're available in production build
2. Rebuild and redeploy after adding env vars

---

## 📱 Quick Test Commands

### **Check if site responds**:
```powershell
Invoke-WebRequest -Uri "https://duxe.org" -Method Head
```

### **Check specific pages**:
```powershell
Invoke-WebRequest -Uri "https://duxe.org/signup" -Method Head
Invoke-WebRequest -Uri "https://duxe.org/login" -Method Head
```

### **Local development still works**:
```powershell
npm run dev
# Then test: http://localhost:5000/signup
```

---

## 📞 Next Steps

1. **Complete Google Cloud Console setup** (Step 1 above)
2. **Complete Firebase Console setup** (Step 2 above)  
3. **Test Google Sign-In on https://duxe.org/signup**
4. **Report back any errors you encounter**

---

## 🎉 Success Indicators

### **You'll know it's working when**:
- ✅ No "redirect_uri_mismatch" errors
- ✅ Google popup opens on production site
- ✅ Users can sign in successfully
- ✅ Users appear in Firebase Authentication console
- ✅ No browser console errors

---

**Priority**: Complete Google Cloud Console and Firebase Console updates first - these are the most critical for production Google Sign-In!