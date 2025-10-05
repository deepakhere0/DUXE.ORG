import{G as m}from"./index-XIUMmCsl.js";import"./heavy-deps-DJUkGw30.js";import"./react-vendor-CC_ZIGTP.js";import"./firebase-vendor-CeOKNg0J.js";let u=null,s=null,d=!1;const h=o=>{if(d)return!0;try{return o&&!o.startsWith("your_")?(d=!0,u=new m(o),s=u.getGenerativeModel({model:"gemini-pro"}),console.log("🤖 Gemini AI initialized successfully (geminiService)"),!0):(console.warn("⚠️ Invalid Gemini API key (geminiService)"),!1)}catch(n){return console.error("❌ Gemini AI initialization failed (geminiService):",n),!1}};d||h("AIzaSyAgrAxI8lSgnGyVnwkPD1iRNQuNaRtyklY");const p=o=>{try{const n=o.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(n)}catch{const e=o.match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(e)try{return JSON.parse(e[0])}catch(a){return console.error("Failed to parse JSON:",a),null}return null}},x={async summarize(o,n={}){if(!s)throw new Error("Gemini AI not initialized. Please add your API key.");try{const e=`You are an expert educational content summarizer. Analyze the following study material and provide a comprehensive summary in JSON format.

Text to summarize:
"""${o}"""

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
- Return ONLY valid JSON, no additional text`,r=(await s.generateContent(e)).response.text(),t=p(r);if(!t)throw new Error("Failed to parse AI response");return t}catch(e){throw console.error("Summarization error:",e),new Error(`Failed to generate summary: ${e.message}`)}},async generateMCQ(o,n=20){if(!s)throw new Error("Gemini AI not initialized. Please add your API key.");try{const e=`You are an expert educational assessment creator. Generate ${n} high-quality multiple-choice questions based on the following study material.

Study Material:
"""${o}"""

Generate exactly ${n} MCQs in this JSON format:
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
- Create ${n} diverse questions covering different aspects of the material
- Each question should test understanding, not just memorization
- Make distractors (wrong answers) plausible but clearly incorrect
- Provide comprehensive explanations for learning
- Vary difficulty levels (mix of easy, medium, and hard)
- Ensure questions are educational and appropriate
- Return ONLY valid JSON array, no additional text`,r=(await s.generateContent(e)).response.text(),t=p(r);if(!Array.isArray(t))throw new Error("Failed to parse MCQs from AI response");return t.slice(0,n).map((l,i)=>({...l,id:i+1}))}catch(e){throw console.error("MCQ generation error:",e),new Error(`Failed to generate MCQs: ${e.message}`)}},async generateQuestions(o,n={}){if(!s)throw new Error("Gemini AI not initialized. Please add your API key.");try{const e=`You are an expert educational content creator. Generate a comprehensive set of study questions based on the following material.

Study Material:
"""${o}"""

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
- Return ONLY valid JSON, no additional text`,r=(await s.generateContent(e)).response.text(),t=p(r);if(!t)throw new Error("Failed to parse questions from AI response");return t}catch(e){throw console.error("Question generation error:",e),new Error(`Failed to generate questions: ${e.message}`)}},async generateConceptMap(o,n={}){if(!s)throw new Error("Gemini AI not initialized. Please add your API key.");try{const e=`You are an expert at creating educational concept maps. Analyze the following text and create a structured concept map showing the relationships between key concepts.

Text to analyze:
"""${o}"""

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
- Return ONLY valid JSON, no additional text`,r=(await s.generateContent(e)).response.text(),t=p(r);if(!t||!t.nodes||!t.edges)throw new Error("Failed to parse concept map from AI response");return t.nodes=this.layoutNodes(t.nodes),t}catch(e){throw console.error("Concept map generation error:",e),new Error(`Failed to generate concept map: ${e.message}`)}},layoutNodes(o){const n=o.filter(i=>i.type==="main"),e=o.filter(i=>i.type==="subtopic"),a=o.filter(i=>i.type==="detail");let r=0;const t=300,l=150;return n.forEach((i,c)=>{i.position={x:c*t*2,y:r}}),r+=l,e.forEach((i,c)=>{i.position={x:c*t,y:r}}),r+=l,a.forEach((i,c)=>{i.position={x:c%4*t,y:r+Math.floor(c/4)*l}}),[...n,...e,...a]},isConfigured(){return!!s},getModelInfo(){return{configured:!!s,model:s?"gemini-pro":"Not configured",provider:"Google Gemini API"}}};export{x as GeminiService,x as default,h as initializeGemini};
