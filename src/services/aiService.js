// Enhanced AI service - Secure backend API integration
import { AIJobs } from './firestoreData';
import Toast from '../components/common/Toast';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let aiInitialized = false;

// Check backend API status on initialization
async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/status`);
    const data = await response.json();
    aiInitialized = data.configured;
    console.log('🤖 Backend AI service status:', data);
    return data.configured;
  } catch (error) {
    console.error('⚠️ Failed to connect to backend:', error.message);
    aiInitialized = false;
    return false;
  }
}

// Initialize by checking backend status
checkBackendStatus();

// Helper function to make backend API calls
const makeBackendCall = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Backend API call failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Backend API call to ${endpoint} failed:`, error);
    throw error;
  }
};

export const AIService = {
  async summarize({ noteId, inputText, createdBy }) {
    const jobId = await AIJobs.create({ type: 'summary', noteId, inputText: inputText?.substring(0, 1000), status: 'processing', createdBy });
    
    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const response = await makeBackendCall('summarize', { inputText });
      const output = response.output;
      
      if (!output) {
        throw new Error('Failed to generate summary');
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
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const response = await makeBackendCall('generate-mcq', { inputText, count });
      const output = response.output;
      
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
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const response = await makeBackendCall('generate-flashcards', { inputText, count });
      const output = response.output;
      
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
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const response = await makeBackendCall('generate-concept-map', { inputText });
      let output = response.output;
      
      if (!output || !output.nodes || !output.edges) {
        throw new Error('Failed to generate concept map');
      }
      
      // Ensure proper structure and layout
      output = this.enhanceConceptMap(output);
      
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

  // Enhanced internship matching with AI insights
  async matchInternships({ userSkills = [], internships = [] }) {
    try {
      if (userSkills.length > 0 && internships.length > 0) {
        const response = await makeBackendCall('match-internships', { userSkills, internships });
        return response.output;
      }
      
      // Fallback to simple matching if no skills or internships
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
      // Fallback to simple matching on error
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
      if (!inputText) {
        throw new Error('Input text is required');
      }

      const response = await makeBackendCall('generate-questions', { inputText });
      const output = response.output;
      
      if (!output) {
        throw new Error('Failed to generate questions');
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
  async isConfigured() {
    return await checkBackendStatus();
  },

  // Get model information and status
  async getModelInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/status`);
      const data = await response.json();
      return { 
        configured: data.configured, 
        model: data.model || 'Not configured',
        provider: 'OpenAI API (Backend)',
        backend: API_BASE_URL,
        features: ['Summarization', 'MCQ Generation', 'Flashcards', 'Concept Maps', 'Questions', 'Internship Matching']
      };
    } catch (error) {
      return {
        configured: false,
        model: 'Not configured',
        provider: 'OpenAI API (Backend)',
        backend: API_BASE_URL,
        error: error.message,
        features: []
      };
    }
  },

  // Reinitialize AI service if needed
  async reinitialize() {
    return await checkBackendStatus();
  }
};

