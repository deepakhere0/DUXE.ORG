// Enhanced AI service powered by Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import Toast from '../components/common/Toast';

// Initialize Gemini AI
let genAI = null;
let model = null;
let initialized = false;

// Initialize Gemini with API key
export const initializeGemini = (apiKey) => {
  if (initialized) return true; // Prevent multiple initializations
  
  try {
    if (apiKey && !apiKey.startsWith('your_')) {
      initialized = true;
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('🤖 Gemini AI initialized successfully (geminiService)');
      return true;
    } else {
      console.warn('⚠️ Invalid Gemini API key (geminiService)');
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini AI initialization failed (geminiService):', error);
    return false;
  }
};

// Auto-initialize from environment variable
if (import.meta.env.VITE_GEMINI_API_KEY && !initialized) {
  initializeGemini(import.meta.env.VITE_GEMINI_API_KEY);
}

// Helper function to parse JSON from AI response
const parseJsonFromResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
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
};

export const GeminiService = {
  // 1. AI Summarizer - Generate concise bullet points from study materials
  async summarize(text, options = {}) {
    if (!model) {
      throw new Error('Gemini AI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert educational content summarizer. Analyze the following study material and provide a comprehensive summary in JSON format.

Text to summarize:
"""${text}"""

Provide the summary in this exact JSON format:
{
  "title": "A descriptive title for the content",
  "bullets": [
    "First key point with important details",
    "Second key point with important details",
    "Third key point with important details",
    "Fourth key point with important details",
    "Fifth key point with important details"
  ],
  "tldr": "A one-sentence summary capturing the essence of the content",
  "keyTerms": ["term1", "term2", "term3", "term4", "term5"],
  "mainConcepts": ["concept1", "concept2", "concept3"],
  "studyTips": ["tip1", "tip2", "tip3"]
}

Make sure to:
- Extract 5-7 comprehensive bullet points
- Identify key terms and concepts
- Provide actionable study tips
- Keep the summary educational and student-focused
- Return ONLY valid JSON, no additional text`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const summary = parseJsonFromResponse(response);

      if (!summary) {
        throw new Error('Failed to parse AI response');
      }

      return summary;
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  },

  // 2. MCQ Generator - Generate multiple-choice questions with answers
  async generateMCQ(text, count = 20) {
    if (!model) {
      throw new Error('Gemini AI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert educational assessment creator. Generate ${count} high-quality multiple-choice questions based on the following study material.

Study Material:
"""${text}"""

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
- Create ${count} diverse questions covering different aspects of the material
- Each question should test understanding, not just memorization
- Make distractors (wrong answers) plausible but clearly incorrect
- Provide comprehensive explanations for learning
- Vary difficulty levels (mix of easy, medium, and hard)
- Ensure questions are educational and appropriate
- Return ONLY valid JSON array, no additional text`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const mcqs = parseJsonFromResponse(response);

      if (!Array.isArray(mcqs)) {
        throw new Error('Failed to parse MCQs from AI response');
      }

      // Ensure we have the correct number of questions
      return mcqs.slice(0, count).map((mcq, index) => ({
        ...mcq,
        id: index + 1
      }));
    } catch (error) {
      console.error('MCQ generation error:', error);
      throw new Error(`Failed to generate MCQs: ${error.message}`);
    }
  },

  // 3. Question Maker - Create comprehensive study questions
  async generateQuestions(text, options = {}) {
    if (!model) {
      throw new Error('Gemini AI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert educational content creator. Generate a comprehensive set of study questions based on the following material.

Study Material:
"""${text}"""

Generate study questions in this JSON format:
{
  "shortAnswer": [
    {
      "question": "Question requiring a brief answer",
      "suggestedAnswer": "Expected answer",
      "points": "Key points to cover"
    }
  ],
  "longAnswer": [
    {
      "question": "Question requiring detailed explanation",
      "guidelines": "What a good answer should include",
      "keyPoints": ["point1", "point2", "point3"]
    }
  ],
  "critical": [
    {
      "question": "Analytical or critical thinking question",
      "approach": "How to approach this question",
      "considerations": ["consideration1", "consideration2"]
    }
  ],
  "practical": [
    {
      "question": "Application-based question",
      "scenario": "Real-world context",
      "expectedOutcome": "What to demonstrate"
    }
  ],
  "discussion": [
    {
      "topic": "Discussion topic",
      "prompts": ["prompt1", "prompt2"],
      "perspectives": ["perspective1", "perspective2"]
    }
  ]
}

Requirements:
- Generate at least 5 questions in each category
- Questions should progressively test different cognitive levels
- Include questions that test understanding, application, analysis, and evaluation
- Make questions thought-provoking and educational
- Return ONLY valid JSON, no additional text`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const questions = parseJsonFromResponse(response);

      if (!questions) {
        throw new Error('Failed to parse questions from AI response');
      }

      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  },

  // 4. AI Concept Mapping - Generate interactive concept maps
  async generateConceptMap(text, options = {}) {
    if (!model) {
      throw new Error('Gemini AI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert at creating educational concept maps. Analyze the following text and create a structured concept map showing the relationships between key concepts.

Text to analyze:
"""${text}"""

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
      "position": {"x": 0, "y": 0}
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "label": "relationship type",
      "type": "relates|causes|contains|supports|contrasts"
    }
  ],
  "clusters": [
    {
      "id": "cluster1",
      "label": "Group name",
      "nodes": ["node1", "node2"],
      "color": "#color_code"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "concept": "Starting concept",
      "nodeId": "node1",
      "reason": "Why start here"
    }
  ]
}

Requirements:
- Identify 10-20 key concepts from the text
- Create meaningful relationships between concepts
- Organize concepts hierarchically (main → subtopic → detail)
- Suggest a learning path through the concepts
- Group related concepts into clusters
- Position nodes to minimize edge crossings
- Return ONLY valid JSON, no additional text`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const conceptMap = parseJsonFromResponse(response);

      if (!conceptMap || !conceptMap.nodes || !conceptMap.edges) {
        throw new Error('Failed to parse concept map from AI response');
      }

      // Process positions to ensure good layout
      conceptMap.nodes = this.layoutNodes(conceptMap.nodes);

      return conceptMap;
    } catch (error) {
      console.error('Concept map generation error:', error);
      throw new Error(`Failed to generate concept map: ${error.message}`);
    }
  },

  // Helper function to layout nodes in a hierarchical structure
  layoutNodes(nodes) {
    const mainNodes = nodes.filter(n => n.type === 'main');
    const subNodes = nodes.filter(n => n.type === 'subtopic');
    const detailNodes = nodes.filter(n => n.type === 'detail');

    let yOffset = 0;
    const xSpacing = 300;
    const ySpacing = 150;

    // Position main nodes
    mainNodes.forEach((node, index) => {
      node.position = {
        x: index * xSpacing * 2,
        y: yOffset
      };
    });

    yOffset += ySpacing;

    // Position subtopic nodes
    subNodes.forEach((node, index) => {
      node.position = {
        x: index * xSpacing,
        y: yOffset
      };
    });

    yOffset += ySpacing;

    // Position detail nodes
    detailNodes.forEach((node, index) => {
      node.position = {
        x: (index % 4) * xSpacing,
        y: yOffset + Math.floor(index / 4) * ySpacing
      };
    });

    return [...mainNodes, ...subNodes, ...detailNodes];
  },

  // Check if Gemini is configured
  isConfigured() {
    return !!model;
  },

  // Get model information
  getModelInfo() {
    return {
      configured: !!model,
      model: model ? 'gemini-pro' : 'Not configured',
      provider: 'Google Gemini API'
    };
  }
};

export default GeminiService;
