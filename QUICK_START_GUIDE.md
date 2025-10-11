# 🚀 Quick Start Guide - Secure Backend Integration

## ⚡ Get Started in 3 Steps

### **Step 1: Configure OpenAI API Key**

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Open `backend/.env` file in a text editor

3. Replace the placeholder with your actual OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   > 📝 **Where to get an API key?**  
   > Visit https://platform.openai.com/api-keys to create one

---

### **Step 2: Start the Backend Server**

From the `backend` directory:

```powershell
# Install dependencies (first time only)
npm install

# Start the backend server
npm start
```

You should see:
```
🚀 Backend server running on http://localhost:5000
🔒 CORS enabled for: http://localhost:5173
🤖 OpenAI API Key: Configured ✅
```

**Keep this terminal window open!** The backend must be running for AI features to work.

---

### **Step 3: Start the Frontend**

Open a **new terminal window** and navigate to the project root:

```powershell
cd C:\Users\Administrator\Desktop\student-platform

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The application will open at: **http://localhost:5173**

---

## ✅ Verify Everything is Working

### **1. Check Backend Status**

Open a browser and visit:
```
http://localhost:5000/api/ai/status
```

You should see:
```json
{
  "status": "OK",
  "configured": true,
  "model": "gpt-4o-mini",
  "endpoints": [...]
}
```

### **2. Test the Frontend**

1. Open the application at http://localhost:5173
2. Navigate to **Tools** page
3. Open browser DevTools (F12) → Console tab
4. Look for: `🤖 Backend AI service status: {...}`
5. Try using any AI tool (Summarizer, MCQ Generator, etc.)

### **3. Security Check**

With DevTools open:
1. Go to **Network** tab
2. Use any AI tool
3. Verify:
   - ✅ Requests go to `localhost:5000/api/ai/*`
   - ✅ NO requests to `api.openai.com` directly
   - ✅ No API keys visible in the requests

---

## 🐛 Troubleshooting

### **Backend Won't Start**

**Error**: `OPENAI_API_KEY not configured`
- **Solution**: Make sure you added your API key to `backend/.env`

**Error**: `Port 5000 already in use`
- **Solution**: Change port in `backend/.env` to another number (e.g., 5001)
- Also update `VITE_API_URL` in frontend `.env.local` if needed

**Error**: `Cannot find module 'express'`
- **Solution**: Run `npm install` in the backend directory

### **Frontend Can't Connect to Backend**

**Error in console**: `Failed to connect to backend`
- **Solution**: Make sure backend server is running on port 5000
- Check that nothing else is using port 5000

**AI features not working**:
- **Solution**: 
  1. Check backend console for errors
  2. Verify API key is valid
  3. Check you have API credits remaining

### **CORS Errors**

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Solution**: Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL

---

## 📋 Development Workflow

### **Starting Work**
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd ..
npm run dev
```

### **Stopping Servers**
- Press `Ctrl+C` in each terminal window

### **Making Changes**
- **Frontend changes**: Auto-reload with Vite hot module replacement
- **Backend changes**: Restart backend server (Ctrl+C, then `npm start` again)

---

## 🔐 Security Reminders

### **✅ DO:**
- Keep `backend/.env` file private
- Use different API keys for development and production
- Monitor your OpenAI API usage at https://platform.openai.com/usage
- Add rate limiting before deploying to production

### **❌ DON'T:**
- Never commit `.env` files to Git
- Never share your API key publicly
- Never push API keys to GitHub/GitLab
- Never use the same key across multiple projects

---

## 📦 Production Deployment

### **Backend Deployment** (Choose one)

#### **Option 1: Railway**
```powershell
# Install Railway CLI
npm install -g railway

# Login and deploy
railway login
cd backend
railway up
```

#### **Option 2: Render**
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your repository
5. Add environment variables in Render dashboard

#### **Option 3: Heroku**
```powershell
# Install Heroku CLI and login
heroku login

# Create app and deploy
cd backend
heroku create your-app-name
git push heroku main
heroku config:set OPENAI_API_KEY=your-key-here
```

### **Frontend Deployment**

Update `.env.local` or `.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

Then deploy to Netlify, Vercel, or Firebase:
```powershell
# Build for production
npm run build

# Deploy (example: Firebase)
firebase deploy --only hosting
```

---

## 📊 Monitoring

### **Check Backend Logs**
The backend console shows all incoming requests:
```
POST /api/ai/summarize 200 1234ms
POST /api/ai/generate-mcq 200 2345ms
```

### **Monitor API Usage**
Visit OpenAI dashboard:
- Usage: https://platform.openai.com/usage
- Costs: Track spending and set limits
- Logs: View API requests and errors

---

## 🎯 Testing the Integration

### **Test Backend API Directly**

Using PowerShell:
```powershell
# Test status endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/ai/status" -Method GET

# Test summarize endpoint
$body = @{
    inputText = "Artificial intelligence is transforming education through personalized learning and automated grading."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/summarize" -Method POST -Body $body -ContentType "application/json"
```

Or using `curl` (if installed):
```bash
curl http://localhost:5000/api/ai/status

curl -X POST http://localhost:5000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"inputText": "Your test content here"}'
```

---

## 📁 Project Structure

```
student-platform/
├── backend/                 # ← Backend API Server
│   ├── .env                # ← API KEY HERE (don't commit!)
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   ├── services/
│   │   └── openaiService.js
│   └── routes/
│       └── aiRoutes.js
├── src/                     # Frontend React app
│   ├── services/
│   │   └── aiService.js    # ← Updated to use backend
│   └── ...
├── .env.local              # Frontend environment (optional)
└── package.json            # Frontend dependencies
```

---

## 🆘 Need Help?

### **Check These First:**
1. ✅ Backend is running on port 5000
2. ✅ OpenAI API key is in `backend/.env`
3. ✅ Frontend is running on port 5173
4. ✅ No CORS errors in browser console
5. ✅ Backend console shows no errors

### **Common Issues:**

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add key to `backend/.env` |
| "Backend not responding" | Start backend server |
| "CORS error" | Check FRONTEND_URL in backend/.env |
| "Port already in use" | Change port or kill process |
| "API quota exceeded" | Check OpenAI usage limits |
| "Build fails" | Run `npm install` in both directories |

---

## 🎉 Success Checklist

- [ ] Backend `.env` configured with OpenAI API key
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend successfully
- [ ] Browser console shows: "Backend AI service status: OK"
- [ ] AI tools generate content successfully
- [ ] No API keys visible in browser DevTools
- [ ] No direct calls to OpenAI API from frontend
- [ ] All 5 AI tools working (Summarizer, MCQ, Flashcards, Concept Map, Questions)

**If all items are checked ✅ — You're all set! Enjoy your secure AI-powered platform!** 🚀

---

**Last Updated**: 2025-10-11  
**Security Status**: 🔒 SECURE  
**Ready for**: Development & Production
