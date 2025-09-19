import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  PlayIcon,
  CheckIcon,
  ShareIcon,
  StarIcon,
  KeyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ToolCard from '../components/common/ToolCard';
import { AIService } from '../services/aiService';
import AISummarizer from '../components/ai/AISummarizer';
import MCQGenerator from '../components/ai/MCQGenerator';
import QuestionMaker from '../components/ai/QuestionMaker';
import ConceptMap from '../components/ai/ConceptMap';
import FlashcardGenerator from '../components/ai/FlashcardGenerator';
import Toast from '../components/common/Toast';

const Tools = () => {
  const { currentUser } = useAuth();
  const [activeTool, setActiveTool] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);

  // Check if AI is configured on mount
  useEffect(() => {
    const configured = AIService.isConfigured();
    setIsGeminiConfigured(configured);
  }, []);

  // Animation effect for the promotional section
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApiKeySave = async () => {
    if (apiKey.trim()) {
      // For now, just close modal - API key is already set in environment
      setShowApiKeyModal(false);
      const success = await AIService.reinitialize();
      if (success) {
        setIsGeminiConfigured(true);
        Toast.success('Gemini AI configured successfully!');
      } else {
        Toast.error('AI service initialization failed. Please check your configuration.');
      }
    }
  };

  const handleToolClick = (toolId) => {
    if (!currentUser) {
      Toast.error('Please log in to use AI tools');
      return;
    }
    
    if (!isGeminiConfigured) {
      setShowApiKeyModal(true);
      return;
    }
    
    setActiveTool(toolId);
  };

  const aiTools = [
    {
      id: 'summarizer',
      title: 'AI Summarizer',
      description: 'Transform lengthy documents into concise, digestible summaries',
      icon: ListBulletIcon,
      demo: 'Converts 10-page research paper → 5 bullet points',
      features: ['PDF/DOCX/TXT support', 'Key points extraction', 'Study tips included'],
      component: AISummarizer
    },
    {
      id: 'mcq',
      title: 'MCQ Generator',
      description: 'Create practice questions with multiple-choice answers automatically',
      icon: QuestionMarkCircleIcon,
      demo: 'Study material → 20 MCQs with correct answers',
      features: ['Auto-generation', 'Interactive quiz mode', 'Answer explanations'],
      component: MCQGenerator
    },
    {
      id: 'questions',
      title: 'Question Maker',
      description: 'Generate comprehensive study questions from your notes',
      icon: DocumentTextIcon,
      demo: 'Chapter content → Comprehensive question bank',
      features: ['5 question types', 'Learning objectives', 'Discussion topics'],
      component: QuestionMaker
    },
    {
      id: 'flashcards',
      title: 'Flashcard Generator',
      description: 'Create interactive study cards with AI assistance',
      icon: RectangleStackIcon,
      demo: 'Study material → Interactive flashcard set',
      features: ['Smart card generation', 'Study mode', 'Progress tracking'],
      component: FlashcardGenerator
    },
    {
      id: 'mapping',
      title: 'AI Mapping',
      description: 'Visualize concepts with intelligent mind maps',
      icon: Square3Stack3DIcon,
      demo: 'Topic input → Interactive concept map',
      features: ['Visual learning', 'Interactive nodes', 'Export to image'],
      component: ConceptMap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full filter blur-3xl animate-bounce opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy-500/20 rounded-full filter blur-3xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section with Promotional Video Concept */}
        <div className="container-custom py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="h-10 w-10 text-accent-500 mr-3 animate-pulse" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-accent-500 to-white bg-clip-text text-transparent animate-fade-in">
                DUXE AI Tools
              </h1>
            </div>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12 animate-slide-up">
              Smarter Learning with AI-Powered Study Tools
            </p>
            
            {/* Video Preview Section */}
            <div className="relative max-w-4xl mx-auto mb-16">
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-3xl border border-accent-500/30 p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden border border-accent-500/20">
                  {/* Animated Preview Content */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent animate-pulse"></div>
                  
                  {/* Video Storyboard Animation */}
                  <div className="relative z-10 text-center">
                    {animationStep === 0 && (
                      <div className="animate-fade-in">
                        <DocumentTextIcon className="h-16 w-16 text-accent-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-white text-xl">Document Analysis</p>
                        <p className="text-gray-400">AI processes your study material...</p>
                      </div>
                    )}
                    {animationStep === 1 && (
                      <div className="animate-fade-in">
                        <ListBulletIcon className="h-16 w-16 text-accent-500 mx-auto mb-4 animate-bounce" />
                        <p className="text-white text-xl">Smart Summarization</p>
                        <p className="text-gray-400">Key points extracted instantly...</p>
                      </div>
                    )}
                    {animationStep === 2 && (
                      <div className="animate-fade-in">
                        <QuestionMarkCircleIcon className="h-16 w-16 text-accent-500 mx-auto mb-4 animate-spin" />
                        <p className="text-white text-xl">MCQ Generation</p>
                        <p className="text-gray-400">Practice questions created automatically...</p>
                      </div>
                    )}
                    {animationStep === 3 && (
                      <div className="animate-fade-in">
                        <Square3Stack3DIcon className="h-16 w-16 text-accent-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-white text-xl">Concept Mapping</p>
                        <p className="text-gray-400">Visual learning connections formed...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Play Button Overlay */}
                  <button 
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-all duration-300 group"
                  >
                    <div className="bg-accent-500 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <PlayIcon className="h-12 w-12 text-white ml-1" />
                    </div>
                  </button>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-gray-300 mb-4">See DUXE AI Tools in Action</p>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center text-accent-500">
                      <StarIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">20-30 seconds</span>
                    </div>
                    <div className="flex items-center text-accent-500">
                      <ShareIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">Full HD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tools Showcase Grid */}
        <div className="container-custom py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Our AI-Powered Tools</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of learning with our intelligent study assistants
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {aiTools.map((tool, index) => (
              <div 
                key={tool.id} 
                className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-3xl border border-accent-500/20 p-8 hover:border-accent-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-4 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tool.title}</h3>
                    <p className="text-accent-500 font-medium">{tool.demo}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-lg mb-6">{tool.description}</p>
                
                <div className="space-y-3 mb-8">
                  {tool.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-gray-300">
                      <CheckIcon className="h-5 w-5 text-accent-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleToolClick(tool.id)}
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Try {tool.title}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tool Interface */}
        {activeTool && (
          <div className="container-custom py-20">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-3xl border border-accent-500/30 p-8 shadow-2xl relative">
                {/* Close Button */}
                <button
                  onClick={() => setActiveTool(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                {/* Render the selected tool component */}
                {aiTools.map(tool => {
                  if (tool.id === activeTool) {
                    const ToolComponent = tool.component;
                    return <ToolComponent key={tool.id} />;
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action when no tool is selected */}
        {!activeTool && (
          <div className="container-custom py-20">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-3xl border border-accent-500/30 p-8 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Learning?</h3>
                  <p className="text-gray-300 text-lg mb-8">
                    {currentUser ? 
                      'Select any AI tool above to start processing your study materials' : 
                      'Log in to access the full power of AI-assisted learning'
                    }
                  </p>
                  
                  {!currentUser ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a href="/signup" className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Start for Free
                      </a>
                      <a href="/login" className="bg-transparent border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg">
                        Log In
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {aiTools.map(tool => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id)}
                            className="bg-slate-700/50 hover:bg-slate-600/50 border border-accent-500/20 hover:border-accent-500 rounded-xl p-4 transition-all duration-300"
                          >
                            <Icon className="h-8 w-8 text-accent-500 mx-auto mb-2" />
                            <p className="text-white text-sm font-medium">{tool.title}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* API Key Configuration */}
                  {currentUser && !isGeminiConfigured && (
                    <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-400 mb-3">
                        <KeyIcon className="inline h-5 w-5 mr-2" />
                        Gemini AI is not configured. Add your API key to enable AI features.
                      </p>
                      <button
                        onClick={() => setShowApiKeyModal(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-6 rounded-lg transition-all duration-300"
                      >
                        Configure API Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-accent-500/30 p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Configure Gemini API Key</h3>
              <p className="text-gray-400 mb-4">
                Enter your Google Gemini API key to enable AI features. 
                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">
                  Get your API key here
                </a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full bg-slate-900/50 border border-accent-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-accent-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleApiKeySave}
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Save Key
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
