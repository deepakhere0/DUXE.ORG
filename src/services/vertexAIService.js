/**
 * Firebase Vertex AI (Gemini) Service
 *
 * This service provides integration with Google's Gemini AI models through Firebase Vertex AI.
 * Benefits over direct OpenAI integration:
 * - Native Firebase integration
 * - Lower costs (Gemini Flash has generous free tier)
 * - Multimodal capabilities (text, images, PDFs)
 * - Better security (no external API keys needed)
 * - Automatic scaling and rate limiting
 */

import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { app } from './firebase';
import { AIJobs } from './firestoreData';
import Toast from '../components/common/Toast';

// Initialize Vertex AI
let vertexAI = null;
let geminiModel = null;
let isInitialized = false;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Cache configuration
const CACHE_TTL = 3600000; // 1 hour in milliseconds
const responseCache = new Map();

/**
 * Initialize Vertex AI service
 */
function initializeVertexAI() {
  if (isInitialized) return true;

  try {
    if (!app) {
      console.warn('⚠️ Firebase app not initialized. Vertex AI unavailable.');
      return false;
    }

    vertexAI = getVertexAI(app);

    // Initialize Gemini 1.5 Flash model (fast, cost-effective)
    geminiModel = getGenerativeModel(vertexAI, {
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3000,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });

    isInitialized = true;
    console.log('✅ Firebase Vertex AI (Gemini) initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Vertex AI:', error);
    isInitialized = false;
    return false;
  }
}

/**
 * Sleep helper for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, context = 'API call') {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
          RETRY_CONFIG.maxDelay
        );

        console.warn(`⚠️ ${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}). Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Generate cache key for requests
 */
function getCacheKey(type, inputText, options = {}) {
  const text = inputText.substring(0, 500); // Use first 500 chars for key
  return `${type}_${JSON.stringify({ text, ...options })}`;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey) {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Returning cached response');
    return cached.data;
  }
  return null;
}

/**
 * Cache response
 */
function setCachedResponse(cacheKey, data) {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  // Clean up old cache entries (keep cache size reasonable)
  if (responseCache.size > 100) {
    const entries = Array.from(responseCache.entries());
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = sorted.slice(0, 20); // Remove oldest 20
    toDelete.forEach(([key]) => responseCache.delete(key));
  }
}

/**
 * Parse JSON from AI response
 */
function parseJsonFromResponse(text) {
  try {
    // Remove markdown code blocks
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error('Failed to parse JSON:', e2);
        return null;
      }
    }
    return null;
  }
}

/**
 * Make Gemini API call with retry logic
 */
async function makeGeminiCall(prompt, options = {}) {
  if (!initializeVertexAI()) {
    throw new Error('Vertex AI not initialized');
  }

  return await withRetry(async () => {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }, 'Gemini API call');
}

export const VertexAIService = {
  /**
   * Check if Vertex AI is available
   */
  isAvailable() {
    return initializeVertexAI();
  },

  /**
   * Summarize text using Gemini
   */
  async summarize({ noteId, inputText, createdBy }) {
    const cacheKey = getCacheKey('summary', inputText);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      Toast.success('🎯 AI summary retrieved from cache!');
      return { output: cached, fromCache: true };
    }

    const jobId = await AIJobs.create({
      type: 'summary',
      noteId,
      inputText: inputText?.substring(0, 1000),
      status: 'processing',
      createdBy,
      provider: 'vertex-ai'
    });

    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const prompt = `You are an expert educational content summarizer. Analyze the following study material and provide a comprehensive summary.

Study Material:
"""${inputText}"""

Provide a detailed summary in this exact JSON format:
{
  "title": "Descriptive title for the content",
  "bullets": [
    "First key point with important details",
    "Second key point with important details",
    "Third key point with important details",
    "Fourth key point with important details",
    "Fifth key point with important details"
  ],
  "tldr": "Concise one-sentence summary capturing the essence",
  "keyTerms": ["term1", "term2", "term3", "term4", "term5"],
  "mainConcepts": ["concept1", "concept2", "concept3"],
  "studyTips": ["tip1", "tip2", "tip3"]
}

Requirements:
- Extract 5-7 comprehensive bullet points
- Identify key terms and main concepts
- Provide actionable study tips
- Keep content educational and student-focused
- Return ONLY valid JSON, no additional text`;

      const text = await makeGeminiCall(prompt);
      const output = parseJsonFromResponse(text);

      if (!output) {
        throw new Error('Failed to parse AI response');
      }

      await AIJobs.update(jobId, { status: 'completed', output });
      setCachedResponse(cacheKey, output);
      Toast.success('🎯 AI summary generated successfully!');
      return { jobId, output, fromCache: false };

    } catch (error) {
      console.error('Summarization error:', error);
      const fallbackOutput = {
        title: "Error - Summary Unavailable",
        bullets: ['AI service encountered an error', 'Please try again later', 'Check your internet connection'],
        tldr: 'Summary generation failed due to technical issues',
        keyTerms: ['Error', 'Retry', 'Technical'],
        mainConcepts: ['Error Handling'],
        studyTips: ['Try again later', 'Check connection']
      };
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ Summary generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  /**
   * Generate MCQ questions using Gemini
   */
  async generateMCQ({ inputText, count = 10, createdBy }) {
    const cacheKey = getCacheKey('mcq', inputText, { count });
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      Toast.success(`🧠 ${count} MCQs retrieved from cache!`);
      return { output: cached, fromCache: true };
    }

    const jobId = await AIJobs.create({
      type: 'mcq',
      inputText: inputText?.substring(0, 1500),
      status: 'processing',
      createdBy,
      provider: 'vertex-ai'
    });

    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const prompt = `You are an expert educational assessment creator. Generate ${count} high-quality multiple-choice questions based on the following study material.

Study Material:
"""${inputText}"""

Generate exactly ${count} MCQs in this JSON format:
[
  {
    "id": 1,
    "question": "Clear and specific question text?",
    "choices": [
      "Option A - complete answer",
      "Option B - complete answer",
      "Option C - complete answer",
      "Option D - complete answer"
    ],
    "correctIndex": 0,
    "explanation": "Detailed explanation of why this answer is correct and why others are incorrect",
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic this question tests"
  }
]

Requirements:
- Generate exactly ${count} questions
- Each question must have exactly 4 choices
- Include a mix of difficulty levels
- Provide detailed explanations
- Return ONLY valid JSON array`;

      const text = await makeGeminiCall(prompt);
      const output = parseJsonFromResponse(text);

      if (!output || !Array.isArray(output)) {
        throw new Error('Failed to parse MCQ response');
      }

      await AIJobs.update(jobId, { status: 'completed', output });
      setCachedResponse(cacheKey, output);
      Toast.success(`🧠 ${count} MCQs generated successfully!`);
      return { jobId, output, fromCache: false };

    } catch (error) {
      console.error('MCQ generation error:', error);
      const fallbackOutput = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        question: `Error: Question ${i + 1} could not be generated`,
        choices: ['Service Error', 'Please Try Again', 'Check Connection', 'Contact Support'],
        correctIndex: 1,
        explanation: 'MCQ generation failed due to technical issues. Please try again.',
        difficulty: 'medium',
        topic: 'Error'
      }));
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ MCQ generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  /**
   * Generate flashcards using Gemini
   */
  async flashcards({ inputText, count = 20, createdBy }) {
    const cacheKey = getCacheKey('flashcards', inputText, { count });
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      Toast.success(`🎯 ${count} flashcards retrieved from cache!`);
      return { output: cached, fromCache: true };
    }

    const jobId = await AIJobs.create({
      type: 'flashcard',
      inputText: inputText?.substring(0, 1500),
      status: 'processing',
      createdBy,
      provider: 'vertex-ai'
    });

    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const prompt = `You are an expert educational content creator specializing in flashcard creation. Generate ${count} high-quality flashcards based on the following study material.

Study Material:
"""${inputText}"""

Generate exactly ${count} flashcards in this JSON format:
{
  "flashcards": [
    {
      "id": 1,
      "front": "Clear question or concept to study",
      "back": "Complete and accurate answer or explanation",
      "category": "Topic or category name",
      "difficulty": "easy|medium|hard",
      "hint": "Optional hint to help recall the answer",
      "tags": ["tag1", "tag2"]
    }
  ],
  "studyGuide": {
    "overview": "Brief overview of the flashcard set",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "studyOrder": "Recommended order for studying these cards",
    "estimatedTime": "Estimated study time in minutes"
  }
}

Requirements:
- Generate exactly ${count} flashcards
- Cover all important concepts from the material
- Use clear and concise language
- Include a mix of difficulty levels
- Provide helpful hints where appropriate
- Return ONLY valid JSON`;

      const text = await makeGeminiCall(prompt);
      const output = parseJsonFromResponse(text);

      if (!output || !output.flashcards) {
        throw new Error('Failed to parse flashcards response');
      }

      await AIJobs.update(jobId, { status: 'completed', output });
      setCachedResponse(cacheKey, output);
      Toast.success(`🎯 ${count} flashcards created successfully!`);
      return { jobId, output, fromCache: false };

    } catch (error) {
      console.error('Flashcard generation error:', error);
      const fallbackOutput = {
        flashcards: Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          front: `Error: Card ${i + 1}`,
          back: 'Flashcard generation failed. Please try again later.',
          category: 'Error',
          difficulty: 'medium',
          hint: 'Check your connection',
          tags: ['error']
        })),
        studyGuide: {
          overview: 'Error in flashcard generation',
          keyTopics: ['Retry'],
          studyOrder: 'Sequential',
          estimatedTime: '5'
        }
      };
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ Flashcard generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  /**
   * Generate concept map using Gemini
   */
  async generateConceptMap({ inputText, createdBy }) {
    const cacheKey = getCacheKey('concept-map', inputText);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      Toast.success('🗺️ Concept map retrieved from cache!');
      return { output: cached, fromCache: true };
    }

    const jobId = await AIJobs.create({
      type: 'concept-map',
      inputText: inputText?.substring(0, 2000),
      status: 'processing',
      createdBy,
      provider: 'vertex-ai'
    });

    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const prompt = `You are an expert in educational concept mapping and knowledge organization. Create a comprehensive concept map from the following material.

Text to analyze:
"""${inputText}"""

Generate a concept map in this JSON format:
{
  "title": "Main topic or theme",
  "nodes": [
    {
      "id": "node1",
      "label": "Concept name",
      "type": "main|subtopic|detail",
      "description": "Brief description of the concept",
      "importance": "high|medium|low",
      "position": {"x": 0, "y": 0},
      "color": "#hex_color"
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "label": "relationship description",
      "type": "relates|causes|contains|supports|contrasts|leads-to"
    }
  ],
  "clusters": [
    {
      "id": "cluster1",
      "label": "Group name",
      "nodes": ["node1", "node2"],
      "color": "#hex_color"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "concept": "Starting concept",
      "nodeId": "node1",
      "reason": "Why start here",
      "estimatedTime": "5-10 minutes"
    }
  ],
  "summary": "Brief overview of the concept map",
  "studyTips": ["tip1", "tip2", "tip3"]
}

Requirements:
- Identify 10-20 key concepts from the text
- Create meaningful relationships between concepts
- Organize hierarchically (main → subtopic → detail)
- Suggest a logical learning path
- Group related concepts into clusters
- Use appropriate colors for visual appeal
- Include study tips for effective learning
- Return ONLY valid JSON, no additional text`;

      const text = await makeGeminiCall(prompt);
      const output = parseJsonFromResponse(text);

      if (!output || !output.nodes || !output.edges) {
        throw new Error('Failed to parse concept map response');
      }

      await AIJobs.update(jobId, { status: 'completed', output });
      setCachedResponse(cacheKey, output);
      Toast.success('🗺️ Concept map generated successfully!');
      return { jobId, output, fromCache: false };

    } catch (error) {
      console.error('Concept map generation error:', error);
      const fallbackOutput = {
        title: "Error - Concept Map Unavailable",
        nodes: [
          { id: 'error1', label: 'Service Error', type: 'main', description: 'AI service encountered an error', importance: 'high', position: { x: 0, y: 0 }, color: '#ef4444' },
          { id: 'error2', label: 'Try Again', type: 'detail', description: 'Please try again later', importance: 'medium', position: { x: 200, y: 100 }, color: '#f59e0b' }
        ],
        edges: [
          { id: 'edge1', source: 'error1', target: 'error2', label: 'suggests', type: 'leads-to' }
        ],
        clusters: [],
        learningPath: [
          { step: 1, concept: 'Service Error', nodeId: 'error1', reason: 'Technical issue occurred', estimatedTime: '1 minute' }
        ],
        summary: 'Concept map generation failed due to technical issues.',
        studyTips: ['Check your internet connection', 'Try again in a few moments', 'Contact support if issue persists']
      };
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ Concept map generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  /**
   * Generate study questions using Gemini
   */
  async generateQuestions({ inputText, createdBy }) {
    const cacheKey = getCacheKey('questions', inputText);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      Toast.success('❓ Study questions retrieved from cache!');
      return { output: cached, fromCache: true };
    }

    const jobId = await AIJobs.create({
      type: 'questions',
      inputText: inputText?.substring(0, 2000),
      status: 'processing',
      createdBy,
      provider: 'vertex-ai'
    });

    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const prompt = `You are an expert educational content creator. Generate a comprehensive set of study questions based on the following material.

Study Material:
"""${inputText}"""

Generate study questions in this JSON format:
{
  "shortAnswer": [
    {
      "question": "Concise question requiring brief answer",
      "suggestedAnswer": "Expected answer",
      "points": "Key points to cover",
      "difficulty": "easy|medium|hard"
    }
  ],
  "longAnswer": [
    {
      "question": "Question requiring detailed explanation",
      "guidelines": "What a good answer should include",
      "keyPoints": ["point1", "point2", "point3"],
      "difficulty": "easy|medium|hard"
    }
  ],
  "critical": [
    {
      "question": "Analytical or critical thinking question",
      "approach": "How to approach this question",
      "considerations": ["consideration1", "consideration2"],
      "difficulty": "easy|medium|hard"
    }
  ],
  "practical": [
    {
      "question": "Application-based question",
      "scenario": "Real-world context",
      "expectedOutcome": "What to demonstrate",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Requirements:
- Generate at least 5 questions in each category
- Questions should test different cognitive levels
- Include questions for understanding, application, analysis, evaluation
- Make questions thought-provoking and educational
- Vary difficulty levels appropriately
- Return ONLY valid JSON, no additional text`;

      const text = await makeGeminiCall(prompt);
      const output = parseJsonFromResponse(text);

      if (!output) {
        throw new Error('Failed to parse questions response');
      }

      await AIJobs.update(jobId, { status: 'completed', output });
      setCachedResponse(cacheKey, output);
      Toast.success('❓ Study questions generated successfully!');
      return { jobId, output, fromCache: false };

    } catch (error) {
      console.error('Question generation error:', error);
      const fallbackOutput = {
        shortAnswer: [{ question: 'Error generating questions', suggestedAnswer: 'Please try again', points: 'Technical issue', difficulty: 'easy' }],
        longAnswer: [{ question: 'Service unavailable', guidelines: 'Check connection and retry', keyPoints: ['Error'], difficulty: 'easy' }],
        critical: [{ question: 'Why did this fail?', approach: 'Analyze technical issues', considerations: ['Connection', 'Service'], difficulty: 'medium' }],
        practical: [{ question: 'What should you do?', scenario: 'Service error', expectedOutcome: 'Successful retry', difficulty: 'easy' }]
      };
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ Question generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  /**
   * Get service information
   */
  getModelInfo() {
    return {
      configured: isInitialized,
      model: 'Gemini 1.5 Flash',
      provider: 'Firebase Vertex AI',
      features: [
        'Summarization',
        'MCQ Generation',
        'Flashcards',
        'Concept Maps',
        'Study Questions',
        'Multimodal Support (Text, Images, PDFs)',
        'Automatic Caching',
        'Retry Logic',
        'Error Recovery'
      ],
      caching: {
        enabled: true,
        ttl: CACHE_TTL,
        size: responseCache.size
      }
    };
  },

  /**
   * Clear response cache
   */
  clearCache() {
    responseCache.clear();
    console.log('🗑️ Response cache cleared');
  },

  /**
   * Reinitialize service
   */
  async reinitialize() {
    isInitialized = false;
    vertexAI = null;
    geminiModel = null;
    return initializeVertexAI();
  }
};

export default VertexAIService;
