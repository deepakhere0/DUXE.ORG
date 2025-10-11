// Enhanced AI service powered by OpenAI GPT-4o mini
import OpenAI from 'openai';
import Toast from '../components/common/Toast';

// Initialize OpenAI client
let openai = null;
let initialized = false;

// Initialize OpenAI with API key
export const initializeOpenAI = (apiKey) => {
  if (initialized) return true; // Prevent multiple initializations
  
  try {
    if (apiKey && !apiKey.startsWith('your_')) {
      initialized = true;
      openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      console.log('🤖 OpenAI initialized successfully (openaiService)');
      return true;
    } else {
      console.warn('⚠️ Invalid OpenAI API key (openaiService)');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI initialization failed (openaiService):', error);
    return false;
  }
};

// Auto-initialize from environment variable with error handling
try {
  if (import.meta.env.VITE_OPENAI_API_KEY && !initialized) {
    initializeOpenAI(import.meta.env.VITE_OPENAI_API_KEY);
  }
} catch (error) {
  console.warn('⚠️ OpenAI auto-initialization failed, will initialize on demand');
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

// Helper function to make OpenAI API calls
const makeOpenAICall = async (prompt, maxTokens = 2000) => {
  if (!openai) {
    throw new Error('OpenAI not initialized. Please add your API key.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI assistant. Always respond with valid JSON when requested and provide accurate, educational content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.8
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
};

export const OpenAIService = {
  // Check if OpenAI is configured
  isConfigured() {
    return initialized && openai !== null;
  },

  // 1. AI Summarizer - Generate concise bullet points from study materials
  async summarize(text, options = {}) {
    if (!openai) {
      throw new Error('OpenAI not initialized. Please add your API key.');
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

      const response = await makeOpenAICall(prompt, 2000);
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
    if (!openai) {
      throw new Error('OpenAI not initialized. Please add your API key.');
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

      const response = await makeOpenAICall(prompt, 3000);
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
    if (!openai) {
      throw new Error('OpenAI not initialized. Please add your API key.');
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
  "application": [
    {
      "question": "Practical application question",
      "scenario": "Real-world scenario",
      "expectedSolution": "Expected approach to solution"
    }
  ]
}

Requirements:
- Create 3-5 questions for each category
- Questions should progress from basic recall to higher-order thinking
- Include practical applications where relevant
- Provide guidance for answering each question
- Focus on understanding rather than memorization
- Return ONLY valid JSON, no additional text`;

      const response = await makeOpenAICall(prompt, 2500);
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

  // 4. Flashcard Creator - Generate study flashcards
  async generateFlashcards(text, count = 15) {
    if (!openai) {
      throw new Error('OpenAI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert educational content creator. Generate ${count} high-quality flashcards based on the following study material.

Study Material:
"""${text}"""

Generate exactly ${count} flashcards in this JSON format:
[
  {
    "id": 1,
    "question": "Clear, concise question or prompt",
    "answer": "Comprehensive but concise answer",
    "category": "Subject category or topic",
    "difficulty": "easy|medium|hard",
    "hints": ["hint1", "hint2"],
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Requirements:
- Create ${count} diverse flashcards covering key concepts
- Questions should be clear and specific
- Answers should be comprehensive but concise
- Include helpful hints for difficult concepts
- Add relevant tags for organization
- Mix difficulty levels appropriately
- Focus on key terms, definitions, and important concepts
- Return ONLY valid JSON array, no additional text`;

      const response = await makeOpenAICall(prompt, 2500);
      const flashcards = parseJsonFromResponse(response);

      if (!Array.isArray(flashcards)) {
        throw new Error('Failed to parse flashcards from AI response');
      }

      return flashcards.slice(0, count).map((card, index) => ({
        ...card,
        id: index + 1
      }));
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
  },

  // 5. Content Analysis - Analyze and categorize educational content
  async analyzeContent(text) {
    if (!openai) {
      throw new Error('OpenAI not initialized. Please add your API key.');
    }

    try {
      const prompt = `You are an expert educational content analyzer. Analyze the following study material and provide detailed insights.

Study Material:
"""${text}"""

Provide analysis in this JSON format:
{
  "subjectArea": "Primary subject area",
  "topics": ["topic1", "topic2", "topic3"],
  "complexity": "beginner|intermediate|advanced",
  "readingLevel": "Grade level estimate",
  "keySkills": ["skill1", "skill2", "skill3"],
  "prerequisites": ["prerequisite1", "prerequisite2"],
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "timeToRead": "Estimated reading time in minutes",
  "contentType": "lecture notes|textbook|research paper|tutorial|other",
  "recommendedActivities": ["activity1", "activity2", "activity3"]
}

Requirements:
- Provide accurate subject classification
- Estimate appropriate complexity and reading level
- Identify key skills and prerequisites
- Suggest relevant learning activities
- Be precise and educational in analysis
- Return ONLY valid JSON, no additional text`;

      const response = await makeOpenAICall(prompt, 1500);
      const analysis = parseJsonFromResponse(response);

      if (!analysis) {
        throw new Error('Failed to parse content analysis from AI response');
      }

      return analysis;
    } catch (error) {
      console.error('Content analysis error:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }
};

// Export the service as default for backward compatibility
export default OpenAIService;