const express = require('express');
const router = express.Router();
const aiService = require('../services/openaiService');

// Middleware to check if API key is configured
const checkApiKey = (req, res, next) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return res.status(500).json({
      error: 'OpenAI API key not configured',
      message: 'Please configure the OpenAI API key in the backend .env file'
    });
  }
  next();
};

// Apply API key check to all routes
router.use(checkApiKey);

// POST /api/ai/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { inputText } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    const summary = await aiService.summarize(inputText);
    res.json({ success: true, output: summary });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

// POST /api/ai/generate-mcq
router.post('/generate-mcq', async (req, res) => {
  try {
    const { inputText, count = 10 } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    const questions = await aiService.generateMCQ(inputText, count);
    res.json({ success: true, output: questions });
  } catch (error) {
    console.error('MCQ generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate MCQ',
      message: error.message 
    });
  }
});

// POST /api/ai/generate-flashcards
router.post('/generate-flashcards', async (req, res) => {
  try {
    const { inputText, count = 20 } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    const flashcards = await aiService.generateFlashcards(inputText, count);
    res.json({ success: true, output: flashcards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate flashcards',
      message: error.message 
    });
  }
});

// POST /api/ai/generate-concept-map
router.post('/generate-concept-map', async (req, res) => {
  try {
    const { inputText } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    const conceptMap = await aiService.generateConceptMap(inputText);
    res.json({ success: true, output: conceptMap });
  } catch (error) {
    console.error('Concept map generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate concept map',
      message: error.message 
    });
  }
});

// POST /api/ai/generate-questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { inputText } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    const questions = await aiService.generateQuestions(inputText);
    res.json({ success: true, output: questions });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error.message 
    });
  }
});

// POST /api/ai/match-internships
router.post('/match-internships', async (req, res) => {
  try {
    const { userSkills, internships } = req.body;
    
    if (!userSkills || !internships) {
      return res.status(400).json({ error: 'User skills and internships are required' });
    }
    
    const matches = await aiService.matchInternships(userSkills, internships);
    res.json({ success: true, output: matches });
  } catch (error) {
    console.error('Internship matching error:', error);
    res.status(500).json({ 
      error: 'Failed to match internships',
      message: error.message 
    });
  }
});

// GET /api/ai/status
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    configured: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
    model: 'gpt-4o-mini',
    endpoints: [
      '/api/ai/summarize',
      '/api/ai/generate-mcq',
      '/api/ai/generate-flashcards',
      '/api/ai/generate-concept-map',
      '/api/ai/generate-questions',
      '/api/ai/match-internships'
    ]
  });
});

module.exports = router;