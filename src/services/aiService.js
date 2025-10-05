// Enhanced AI service powered by Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIJobs } from './firestoreData';
import Toast from '../components/common/Toast';

// Initialize Gemini AI with enhanced error handling
let genAI = null;
let model = null;
let aiInitialized = false;

// Check if already initialized from geminiService
try {
  // Try to import the model from geminiService
  import('./geminiService').then(geminiService => {
    if (geminiService.default.isConfigured()) {
      console.log('🤖 Using existing Gemini AI instance from geminiService');
      aiInitialized = true;
    } else {
      initializeGemini();
    }
  }).catch(() => {
    // If import fails, initialize our own
    initializeGemini();
  });
} catch (error) {
  // Fallback initialization
  initializeGemini();
}

// Initialize Gemini AI
function initializeGemini() {
  if (aiInitialized) return true; // Prevent multiple initializations

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && !apiKey.startsWith('your_')) {
      aiInitialized = true;
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });
      console.log('🤖 Gemini AI initialized successfully (aiService)');
      return true;
    } else {
      console.log('🚫 No valid Gemini API key found (aiService)');
      return false;
    }
  } catch (error) {
    console.error('⚠️ Gemini AI initialization failed (aiService):', error.message);
    Toast.error('AI service initialization failed');
    return false;
  }
}

const parseJsonFromResponse = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
};

export const AIService = {
  async summarize({ noteId, inputText, createdBy }) {
    const jobId = await AIJobs.create({ type: 'summary', noteId, inputText: inputText?.substring(0, 1000), status: 'processing', createdBy });
    
    try {
      let output;
      if (model && inputText) {
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

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        output = parseJsonFromResponse(text);
        
        // Fallback if parsing fails
        if (!output) {
          output = {
            title: "AI-Generated Summary",
            bullets: ['Content analysis completed', 'Key information extracted', 'Summary generated successfully'],
            tldr: 'AI-powered summary of the educational content',
            keyTerms: ['Study', 'Learning', 'Education'],
            mainConcepts: ['Key Concepts', 'Main Ideas'],
            studyTips: ['Review regularly', 'Take notes', 'Practice active recall']
          };
        }
      } else {
        throw new Error('Gemini AI not configured. Please check your API key.');
      }
      
      await AIJobs.update(jobId, { status: 'completed', output });
      Toast.success('🎯 AI summary generated successfully!');
      return { jobId, output };
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

  async generateMCQ({ inputText, count = 10, createdBy }) {
    const jobId = await AIJobs.create({ type: 'mcq', inputText: inputText?.substring(0, 1500), status: 'processing', createdBy });
    
    try {
      let output;
      if (model && inputText) {
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
    "topic": "Specific topic this question tests",
    "bloomsLevel": "remember|understand|apply|analyze|evaluate|create"
  }
]

Requirements:
- Create ${count} diverse questions covering different aspects
- Test understanding, not just memorization
- Make wrong answers plausible but clearly incorrect
- Provide comprehensive explanations for learning
- Vary difficulty levels (mix of easy, medium, hard)
- Include Bloom's taxonomy level for each question
- Return ONLY valid JSON array, no additional text`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        output = parseJsonFromResponse(text);
        
        // Validate and fix output format
        if (!Array.isArray(output)) {
          throw new Error('Failed to parse MCQs from AI response');
        }
        
        // Ensure we have the correct number and format
        output = output.slice(0, count).map((mcq, index) => ({
          id: index + 1,
          question: mcq.question || `Question ${index + 1}`,
          choices: Array.isArray(mcq.choices) && mcq.choices.length >= 4 
            ? mcq.choices.slice(0, 4)
            : [`Option A`, `Option B`, `Option C`, `Option D`],
          correctIndex: typeof mcq.correctIndex === 'number' && mcq.correctIndex >= 0 && mcq.correctIndex < 4
            ? mcq.correctIndex 
            : 0,
          explanation: mcq.explanation || 'Explanation not provided',
          difficulty: mcq.difficulty || 'medium',
          topic: mcq.topic || 'General',
          bloomsLevel: mcq.bloomsLevel || 'understand'
        }));
        
        // Fill remaining questions if needed
        while (output.length < count) {
          const index = output.length;
          output.push({
            id: index + 1,
            question: `Generated Question ${index + 1}`,
            choices: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'AI-generated question',
            difficulty: 'medium',
            topic: 'General',
            bloomsLevel: 'understand'
          });
        }
        
      } else {
        throw new Error('Gemini AI not configured. Please check your API key.');
      }
      
      await AIJobs.update(jobId, { status: 'completed', output });
      Toast.success(`🧠 ${count} MCQs generated successfully!`);
      return { jobId, output };
    } catch (error) {
      console.error('MCQ generation error:', error);
      const fallbackOutput = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        question: `Error: Question ${i + 1} could not be generated`,
        choices: ['Service Error', 'Please Try Again', 'Check Connection', 'Contact Support'],
        correctIndex: 1,
        explanation: 'MCQ generation failed due to technical issues. Please try again.',
        difficulty: 'medium',
        topic: 'Error',
        bloomsLevel: 'understand'
      }));
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ MCQ generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  async flashcards({ inputText, count = 20, createdBy }) {
    const jobId = await AIJobs.create({ type: 'flashcard', inputText: inputText?.substring(0, 1500), status: 'processing', createdBy });
    
    try {
      let output;
      if (model && inputText) {
        const prompt = `You are an expert at creating effective educational flashcards. Create ${count} high-quality flashcards from the following study material.

Study Material:
"""${inputText}"""

Generate exactly ${count} flashcards in this JSON format:
[
  {
    "id": 1,
    "front": "Question, term, or concept",
    "back": "Detailed answer, definition, or explanation",
    "category": "Topic category",
    "difficulty": "easy|medium|hard",
    "type": "definition|concept|fact|process|example",
    "hint": "Optional hint to help remember",
    "tags": ["tag1", "tag2"]
  }
]

Requirements:
- Create ${count} diverse flashcards covering key concepts
- Include definitions, facts, processes, and examples
- Make front sides concise and back sides comprehensive
- Add helpful hints for difficult concepts
- Categorize by topic and difficulty
- Include relevant tags for organization
- Ensure educational value and accuracy
- Return ONLY valid JSON array, no additional text`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        output = parseJsonFromResponse(text);
        
        // Validate and fix output format
        if (!Array.isArray(output)) {
          throw new Error('Failed to parse flashcards from AI response');
        }
        
        // Ensure correct format and count
        output = output.slice(0, count).map((card, index) => ({
          id: index + 1,
          front: card.front || `Term ${index + 1}`,
          back: card.back || `Definition ${index + 1}`,
          category: card.category || 'General',
          difficulty: card.difficulty || 'medium',
          type: card.type || 'definition',
          hint: card.hint || '',
          tags: Array.isArray(card.tags) ? card.tags : ['study']
        }));
        
        // Fill remaining cards if needed
        while (output.length < count) {
          const index = output.length;
          output.push({
            id: index + 1,
            front: `Concept ${index + 1}`,
            back: `Generated explanation ${index + 1}`,
            category: 'General',
            difficulty: 'medium',
            type: 'concept',
            hint: '',
            tags: ['generated']
          });
        }
        
      } else {
        throw new Error('Gemini AI not configured. Please check your API key.');
      }
      
      await AIJobs.update(jobId, { status: 'completed', output });
      Toast.success(`🎯 ${count} flashcards created successfully!`);
      return { jobId, output };
    } catch (error) {
      console.error('Flashcard generation error:', error);
      const fallbackOutput = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        front: `Error: Card ${i + 1}`,
        back: 'Flashcard generation failed. Please try again later.',
        category: 'Error',
        difficulty: 'medium',
        type: 'error',
        hint: 'Check your connection',
        tags: ['error']
      }));
      await AIJobs.update(jobId, { status: 'error', error: error.message, output: fallbackOutput });
      Toast.error('❌ Flashcard generation failed: ' + error.message);
      return { jobId, output: fallbackOutput };
    }
  },

  // Concept Map Generation - Create visual learning maps
  async generateConceptMap({ inputText, createdBy }) {
    const jobId = await AIJobs.create({ type: 'concept-map', inputText: inputText?.substring(0, 2000), status: 'processing', createdBy });
    
    try {
      let output;
      if (model && inputText) {
        const prompt = `You are an expert at creating educational concept maps. Analyze the following text and create a structured concept map showing relationships between key concepts.

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        output = parseJsonFromResponse(text);
        
        // Validate and enhance output
        if (!output || !output.nodes || !output.edges) {
          throw new Error('Failed to parse concept map from AI response');
        }
        
        // Ensure proper structure and layout
        output = this.enhanceConceptMap(output);
        
      } else {
        throw new Error('Gemini AI not configured. Please check your API key.');
      }
      
      await AIJobs.update(jobId, { status: 'completed', output });
      Toast.success('🗺️ Concept map generated successfully!');
      return { jobId, output };
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

  // Enhanced internship matching with Gemini insights
  async matchInternships({ userSkills = [], internships = [] }) {
    try {
      if (model && userSkills.length > 0 && internships.length > 0) {
        const prompt = `Given user skills: ${userSkills.join(', ')}

Score these internships (0-100) in JSON format:
${internships.map((i, idx) => 
  `${idx}. ${i.role} at ${i.company} - Skills: ${(i.skills || []).join(', ')}`
).join('\n')}

Return JSON: [{"index": 0, "score": 85, "reason": "why"}]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const matches = parseJsonFromResponse(text);
        
        if (Array.isArray(matches)) {
          return internships.map((internship, idx) => {
            const match = matches.find(m => m.index === idx) || {};
            return {
              ...internship,
              matchScore: match.score || 0,
              matchReason: match.reason || 'Based on skills',
              aiEnhanced: true
            };
          }).sort((a, b) => b.matchScore - a.matchScore);
        }
      }
      
      // Fallback to simple matching
      const set = new Set(userSkills.map(s => s.toLowerCase()));
      return internships.map(i => ({
        ...i,
        matchScore: (i.skills || []).reduce((acc, s) => 
          acc + (set.has(String(s).toLowerCase()) ? 20 : 0), 0
        ),
        aiEnhanced: false
      })).sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Matching error:', error);
      const set = new Set(userSkills.map(s => s.toLowerCase()));
      return internships.map(i => ({
        ...i,
        matchScore: (i.skills || []).reduce((acc, s) => 
          acc + (set.has(String(s).toLowerCase()) ? 20 : 0), 0
        ),
        aiEnhanced: false
      })).sort((a, b) => b.matchScore - a.matchScore);
    }
  },

  // Helper function to enhance concept map structure
  enhanceConceptMap(conceptMap) {
    // Ensure all nodes have required fields
    conceptMap.nodes = conceptMap.nodes.map((node, index) => ({
      id: node.id || `node_${index}`,
      label: node.label || `Concept ${index + 1}`,
      type: node.type || 'detail',
      description: node.description || '',
      importance: node.importance || 'medium',
      position: node.position || this.calculateNodePosition(index, conceptMap.nodes.length),
      color: node.color || this.getColorByType(node.type || 'detail')
    }));

    // Ensure all edges have required fields
    conceptMap.edges = (conceptMap.edges || []).map((edge, index) => ({
      id: edge.id || `edge_${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || 'relates to',
      type: edge.type || 'relates'
    }));

    // Add default values for optional fields
    conceptMap.clusters = conceptMap.clusters || [];
    conceptMap.learningPath = conceptMap.learningPath || [];
    conceptMap.summary = conceptMap.summary || 'Generated concept map';
    conceptMap.studyTips = conceptMap.studyTips || ['Study systematically', 'Focus on connections', 'Review regularly'];

    return conceptMap;
  },

  // Calculate position for concept map nodes
  calculateNodePosition(index, totalNodes) {
    const cols = Math.ceil(Math.sqrt(totalNodes));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * 250 + Math.random() * 50,
      y: row * 150 + Math.random() * 30
    };
  },

  // Get color based on node type
  getColorByType(type) {
    const colors = {
      main: '#12356E',     // Navy blue for main concepts
      subtopic: '#FF9900', // Orange for subtopics
      detail: '#6B7280',   // Gray for details
      error: '#EF4444'     // Red for errors
    };
    return colors[type] || colors.detail;
  },

  // Question generation for comprehensive study
  async generateQuestions({ inputText, createdBy, questionTypes = ['short', 'long', 'critical'] }) {
    const jobId = await AIJobs.create({ type: 'questions', inputText: inputText?.substring(0, 2000), status: 'processing', createdBy });
    
    try {
      let output;
      if (model && inputText) {
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

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        output = parseJsonFromResponse(text);
        
        if (!output) {
          throw new Error('Failed to parse questions from AI response');
        }
        
        // Ensure structure
        output = {
          shortAnswer: output.shortAnswer || [],
          longAnswer: output.longAnswer || [],
          critical: output.critical || [],
          practical: output.practical || []
        };
        
      } else {
        throw new Error('Gemini AI not configured. Please check your API key.');
      }
      
      await AIJobs.update(jobId, { status: 'completed', output });
      Toast.success('❓ Study questions generated successfully!');
      return { jobId, output };
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

  // Check if AI service is properly configured
  isConfigured() {
    return !!model;
  },

  // Get model information and status
  getModelInfo() {
    return { 
      configured: !!model, 
      model: model ? 'gemini-1.5-flash' : 'Not configured',
      provider: 'Google Gemini API',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Missing',
      features: ['Summarization', 'MCQ Generation', 'Flashcards', 'Concept Maps', 'Questions', 'Internship Matching']
    };
  },

  // Reinitialize AI service if needed
  async reinitialize() {
    return initializeGemini();
  },

  // Configure AI service with runtime API key
  async configureWithApiKey(apiKey) {
    if (!apiKey || apiKey.length < 30 || !apiKey.startsWith('AIza')) {
      throw new Error('Invalid API key format. Please check your Gemini API key.');
    }

    try {
      // Initialize with the provided API key
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });
      
      // Test the connection with a simple request
      const testResult = await model.generateContent('Test connection: Say "Hello"');
      const testResponse = testResult.response.text();
      
      if (testResponse) {
        aiInitialized = true;
        console.log('🤖 Gemini AI configured successfully with runtime API key');
        return { success: true, message: 'AI service configured successfully!' };
      } else {
        throw new Error('Failed to get response from AI service');
      }
    } catch (error) {
      console.error('⚠️ AI service configuration failed:', error.message);
      // Reset to null on failure
      genAI = null;
      model = null;
      aiInitialized = false;
      
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('API key does not have permission. Please check your Google Cloud settings.');
      } else {
        throw new Error(`Configuration failed: ${error.message}`);
      }
    }
  }
};

