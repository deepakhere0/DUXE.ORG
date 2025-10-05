# 🔧 Firebase Authorized Domains Setup Guide

## 🎯 **Problem Solved**
This guide permanently fixes the "Domain not authorized" error by adding all your development domains to Firebase Authentication.

## 📋 **Domains to Add to Firebase Console**

### **Required Domains for Your Network:**
```
✅ localhost:5173
✅ 127.0.0.1:5173
✅ 192.168.190.1:5173
✅ 192.168.146.1:5173
✅ 192.168.1.14:5173
```

## 🚀 **Step-by-Step Instructions**

### **Method 1: Firebase Console (Recommended)**

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Click on project: **`duxe-5c071`**

3. **Navigate to Authentication Settings**
   - Click **"Authentication"** in left sidebar
   - Click **"Settings"** tab
   - Scroll down to **"Authorized domains"** section

4. **Add Each Domain**
   - Click **"Add domain"** button
   - Add each domain (one at a time):
     ```
     localhost:5173
     127.0.0.1:5173
     192.168.190.1:5173
     192.168.146.1:5173
     192.168.1.14:5173
     ```
   - Click **"Add"** for each domain

5. **Save Changes**
   - Firebase automatically saves changes
   - Wait for confirmation messages

### **Method 2: Firebase Hosting (Alternative)**

If you're using Firebase Hosting, domains are automatically authorized. Add these to your `firebase.json`:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## ✅ **Verification Steps**

After adding domains:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test all network URLs:**
   - http://localhost:5173/
   - http://192.168.190.1:5173/
   - http://192.168.146.1:5173/
   - http://192.168.1.14:5173/

3. **Test Authentication:**
   - Try Google Sign-In on each URL
   - Try email/password login
   - Verify no "Domain not authorized" errors

## 🔧 **Future Network Changes**

If your IP addresses change:

1. **Run the configuration helper:**
   ```bash
   node configure-firebase-domains.cjs
   ```

2. **Add new domains to Firebase Console**

3. **Update this documentation**

## 🛡️ **Security Notes**

- Only add domains you trust
- Remove unused domains periodically
- Production domains should use HTTPS
- Local development can use HTTP

## 📝 **Troubleshooting**

### **Still getting "Domain not authorized"?**
1. Check if domain was added correctly in Firebase Console
2. Clear browser cache and cookies
3. Wait 5-10 minutes for propagation
4. Verify exact domain format (with/without port)

### **Can't access Firebase Console?**
1. Ensure you're logged in with the correct Google account
2. Verify you have owner/editor permissions for `duxe-5c071`
3. Try incognito/private browsing mode

## 🎯 **Expected Results**

After completing this setup:
- ✅ All network IPs work for authentication
- ✅ Team members can access via network URLs
- ✅ Google Sign-In works on all domains
- ✅ No more "Domain not authorized" errors
- ✅ Seamless development experience across devices

---

**Generated on:** $(Get-Date)  
**Project:** DUXE Student Platform  
**Firebase Project:** duxe-5c071