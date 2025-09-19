# Gemini AI Integration Setup Guide

## Overview
Your React-based education platform now features fully integrated Google Gemini AI with four powerful tools:
- **AI Summarizer** - Transform lengthy documents into concise bullet points
- **MCQ Generator** - Generate multiple-choice questions with answers and explanations  
- **Question Maker** - Create comprehensive study questions from notes
- **AI Mapping** - Build interactive concept maps showing topic connections

## 🚀 Quick Setup

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Platform
There are two ways to add your API key:

#### Option A: Environment Variable (Development)
Create a `.env.local` file in the project root:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

#### Option B: In-App Configuration
1. Log into the platform
2. Navigate to the Tools page
3. Click "Configure API Key" when prompted
4. Enter your Gemini API key
5. Click "Save Key"

## 📚 Using the AI Tools

### AI Summarizer
1. Navigate to Tools → AI Summarizer
2. Upload a file (PDF, DOCX, or TXT) or paste text directly
3. Click "Generate AI Summary"
4. Get:
   - Concise bullet points
   - Key terms and concepts
   - Study tips
   - TL;DR summary

### MCQ Generator
1. Navigate to Tools → MCQ Generator
2. Upload study material or paste text
3. Select number of questions (5-30)
4. Click "Generate MCQs"
5. Features:
   - Interactive quiz mode
   - Answer explanations
   - Difficulty levels
   - Score tracking
   - Export to PDF/Markdown

### Question Maker
1. Navigate to Tools → Question Maker
2. Upload notes or paste content
3. Click "Generate Study Questions"
4. Get 5 categories:
   - Short answer questions
   - Long answer questions
   - Critical thinking questions
   - Practical application questions
   - Discussion topics

### AI Concept Mapping
1. Navigate to Tools → AI Mapping
2. Upload content or paste text
3. Click "Generate Concept Map"
4. Features:
   - Interactive visualization
   - Drag and zoom controls
   - Node details on click
   - Export to image
   - Learning path suggestions

## 📁 Supported File Formats
- **PDF** (.pdf) - Research papers, textbooks, lecture notes
- **Word Documents** (.docx, .doc) - Essays, assignments
- **Text Files** (.txt) - Plain text notes
- **Raw Text** - Direct paste from any source

## 🔒 Security Notes

### API Key Storage
- Keys are stored in browser localStorage (encrypted recommended for production)
- Never commit API keys to version control
- Use environment variables for development
- Implement backend proxy for production

### Production Deployment
For production, implement a backend service to:
1. Store API keys securely
2. Proxy requests to Gemini API
3. Add rate limiting
4. Monitor usage

## 🎯 Features Implemented

### File Upload System
- Drag-and-drop support
- File validation (type & size)
- Real-time text extraction
- Progress indicators
- Error handling

### AI Processing
- Real-time generation
- JSON response parsing
- Error recovery
- Loading states
- Result caching (optional)

### User Interface
- Responsive design
- Dark theme optimized
- Smooth animations
- Toast notifications
- Modal dialogs

### Export Options
- Copy to clipboard
- Download as Markdown
- Export as PDF (planned)
- Save to library (planned)
- Share results (planned)

## 🛠 Technical Stack
- **Frontend**: React 18 + Vite
- **AI Service**: Google Gemini 1.5 Flash
- **File Parsing**: 
  - PDF.js for PDF files
  - Mammoth for Word documents
  - Native FileReader for text
- **Visualization**: React Flow for concept maps
- **Styling**: Tailwind CSS
- **Icons**: Heroicons

## 📊 API Usage Guidelines

### Rate Limits
- Gemini Free Tier: 60 requests per minute
- Consider implementing request queuing
- Cache responses when possible

### Best Practices
1. Truncate very long texts (>10,000 words)
2. Batch similar requests
3. Implement retry logic
4. Show clear error messages
5. Provide fallback options

## 🐛 Troubleshooting

### Common Issues

**"Gemini AI not initialized"**
- Check API key is correctly set
- Verify key has proper permissions
- Ensure no typos or extra spaces

**"Failed to parse file"**
- Verify file format is supported
- Check file isn't corrupted
- Ensure file size < 10MB

**"Failed to generate [feature]"**
- Check internet connection
- Verify API quota isn't exceeded
- Try with shorter text input

### Debug Mode
Open browser console and look for:
- `🤖 Gemini AI initialized successfully` - API configured
- `❌ Gemini AI initialization failed` - Check API key
- Network errors - Check connection/CORS

## 📈 Future Enhancements
- [ ] Backend API proxy service
- [ ] User usage tracking
- [ ] Result history/saving
- [ ] Collaborative features
- [ ] Mobile app version
- [ ] Offline mode with caching
- [ ] Custom AI model fine-tuning
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Integration with LMS platforms

## 📝 Example Usage

### Sample Text for Testing
```
Photosynthesis is the process by which plants convert light energy into chemical energy. 
During this process, plants absorb carbon dioxide from the air and water from the soil. 
Using chlorophyll in their leaves, they capture sunlight and convert these raw materials 
into glucose and oxygen. The glucose serves as food for the plant, while oxygen is 
released as a byproduct into the atmosphere.
```

This sample will generate:
- Summary with 5 key points
- 10+ MCQ questions
- Study questions across categories
- Visual concept map with ~10 nodes

## 🤝 Support
For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify API key and quotas
4. Contact support with error details

## 📄 License
This integration uses the Google Gemini API under Google's terms of service.
Ensure compliance with API usage policies and data privacy regulations.
