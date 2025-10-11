import{O as p}from"./index-DsgEEJTK.js";import"./heavy-deps-DJUkGw30.js";import"./react-vendor-CC_ZIGTP.js";import"./firebase-vendor-EtqN6QA-.js";let a=null,c=!1;const u=r=>{if(c)return!0;try{return r&&!r.startsWith("your_")?(c=!0,a=new p({apiKey:r,dangerouslyAllowBrowser:!0}),console.log("🤖 OpenAI initialized successfully (openaiService)"),!0):(console.warn("⚠️ Invalid OpenAI API key (openaiService)"),!1)}catch(t){return console.error("❌ OpenAI initialization failed (openaiService):",t),!1}};try{c||u("your_openai_api_key_here")}catch{console.warn("⚠️ OpenAI auto-initialization failed, will initialize on demand")}const o=r=>{try{const t=r.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(t)}catch{const e=r.match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(e)try{return JSON.parse(e[0])}catch(i){return console.error("Failed to parse JSON:",i),null}return null}},s=async(r,t=2e3)=>{var e,i;if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{return((i=(e=(await a.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:"You are an expert educational AI assistant. Always respond with valid JSON when requested and provide accurate, educational content."},{role:"user",content:r}],max_tokens:t,temperature:.7,top_p:.8})).choices[0])==null?void 0:e.message)==null?void 0:i.content)||""}catch(n){throw console.error("OpenAI API call failed:",n),n}},w={isConfigured(){return c&&a!==null},async summarize(r,t={}){if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{const e=`You are an expert educational content summarizer. Analyze the following study material and provide a comprehensive summary in JSON format.

Text to summarize:
"""${r}"""

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
- Return ONLY valid JSON, no additional text`,i=await s(e,2e3),n=o(i);if(!n)throw new Error("Failed to parse AI response");return n}catch(e){throw console.error("Summarization error:",e),new Error(`Failed to generate summary: ${e.message}`)}},async generateMCQ(r,t=20){if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{const e=`You are an expert educational assessment creator. Generate ${t} high-quality multiple-choice questions based on the following study material.

Study Material:
"""${r}"""

Generate exactly ${t} MCQs in this JSON format:
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
- Create ${t} diverse questions covering different aspects of the material
- Each question should test understanding, not just memorization
- Make distractors (wrong answers) plausible but clearly incorrect
- Provide comprehensive explanations for learning
- Vary difficulty levels (mix of easy, medium, and hard)
- Ensure questions are educational and appropriate
- Return ONLY valid JSON array, no additional text`,i=await s(e,3e3),n=o(i);if(!Array.isArray(n))throw new Error("Failed to parse MCQs from AI response");return n.slice(0,t).map((l,d)=>({...l,id:d+1}))}catch(e){throw console.error("MCQ generation error:",e),new Error(`Failed to generate MCQs: ${e.message}`)}},async generateQuestions(r,t={}){if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{const e=`You are an expert educational content creator. Generate a comprehensive set of study questions based on the following material.

Study Material:
"""${r}"""

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
- Return ONLY valid JSON, no additional text`,i=await s(e,2500),n=o(i);if(!n)throw new Error("Failed to parse questions from AI response");return n}catch(e){throw console.error("Question generation error:",e),new Error(`Failed to generate questions: ${e.message}`)}},async generateFlashcards(r,t=15){if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{const e=`You are an expert educational content creator. Generate ${t} high-quality flashcards based on the following study material.

Study Material:
"""${r}"""

Generate exactly ${t} flashcards in this JSON format:
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
- Create ${t} diverse flashcards covering key concepts
- Questions should be clear and specific
- Answers should be comprehensive but concise
- Include helpful hints for difficult concepts
- Add relevant tags for organization
- Mix difficulty levels appropriately
- Focus on key terms, definitions, and important concepts
- Return ONLY valid JSON array, no additional text`,i=await s(e,2500),n=o(i);if(!Array.isArray(n))throw new Error("Failed to parse flashcards from AI response");return n.slice(0,t).map((l,d)=>({...l,id:d+1}))}catch(e){throw console.error("Flashcard generation error:",e),new Error(`Failed to generate flashcards: ${e.message}`)}},async analyzeContent(r){if(!a)throw new Error("OpenAI not initialized. Please add your API key.");try{const t=`You are an expert educational content analyzer. Analyze the following study material and provide detailed insights.

Study Material:
"""${r}"""

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
- Return ONLY valid JSON, no additional text`,e=await s(t,1500),i=o(e);if(!i)throw new Error("Failed to parse content analysis from AI response");return i}catch(t){throw console.error("Content analysis error:",t),new Error(`Failed to analyze content: ${t.message}`)}}};export{w as OpenAIService,w as default,u as initializeOpenAI};
