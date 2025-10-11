const OpenAI = require('openai');

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to parse JSON from response
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

// Generic function to make OpenAI API calls
const makeOpenAICall = async (prompt, maxTokens = 2000) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured in backend');
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

// Service methods for different AI operations
const aiService = {
  // Summarize text
  async summarize(inputText) {
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

    const text = await makeOpenAICall(prompt, 2000);
    const output = parseJsonFromResponse(text);
    
    if (!output) {
      return {
        title: "AI-Generated Summary",
        bullets: ['Content analysis completed', 'Key information extracted', 'Summary generated successfully'],
        tldr: 'AI-powered summary of the educational content',
        keyTerms: ['Study', 'Learning', 'Education'],
        mainConcepts: ['Key Concepts', 'Main Ideas'],
        studyTips: ['Review regularly', 'Take notes', 'Practice active recall']
      };
    }
    
    return output;
  },

  // Generate MCQ questions
  async generateMCQ(inputText, count = 10) {
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

    const text = await makeOpenAICall(prompt, 3000);
    const output = parseJsonFromResponse(text);
    
    if (!output || !Array.isArray(output)) {
      return [{
        id: 1,
        question: "Error generating questions. Please try again.",
        choices: ["Retry", "Check input", "Contact support", "Try later"],
        correctIndex: 0,
        explanation: "There was an error generating questions.",
        difficulty: "easy",
        topic: "Error"
      }];
    }
    
    return output;
  },

  // Generate flashcards
  async generateFlashcards(inputText, count = 20) {
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

    const text = await makeOpenAICall(prompt, 3000);
    const output = parseJsonFromResponse(text);
    
    if (!output || !output.flashcards) {
      return {
        flashcards: [{
          id: 1,
          front: "Error generating flashcards",
          back: "Please try again",
          category: "Error",
          difficulty: "easy",
          hint: "Check your input",
          tags: ["error"]
        }],
        studyGuide: {
          overview: "Error in flashcard generation",
          keyTopics: ["Retry"],
          studyOrder: "Sequential",
          estimatedTime: "5"
        }
      };
    }
    
    return output;
  },

  // Generate concept map
  async generateConceptMap(inputText) {
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

    const text = await makeOpenAICall(prompt, 2000);
    const output = parseJsonFromResponse(text);
    
    if (!output || !output.nodes || !output.edges) {
      throw new Error('Failed to parse concept map from AI response');
    }
    
    return output;
  },

  // Generate study questions
  async generateQuestions(inputText) {
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

    const text = await makeOpenAICall(prompt, 2000);
    const output = parseJsonFromResponse(text);
    
    if (!output) {
      throw new Error('Failed to parse questions from AI response');
    }
    
    return output;
  },

  // Match internships
  async matchInternships(userSkills, internships) {
    if (!userSkills?.length || !internships?.length) {
      return internships || [];
    }

    const prompt = `Given user skills: ${userSkills.join(', ')}

Score these internships (0-100) in JSON format:
${internships.map((i, idx) => 
  `${idx}. ${i.role} at ${i.company} - Skills: ${(i.skills || []).join(', ')}`
).join('\n')}

Return JSON: [{"index": 0, "score": 85, "reason": "why"}]`;

    try {
      const text = await makeOpenAICall(prompt, 1000);
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
    } catch (error) {
      console.error('Matching error:', error);
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
  }
};

module.exports = aiService;