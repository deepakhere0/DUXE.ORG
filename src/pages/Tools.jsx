import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  PlayIcon,
  CheckIcon,
  ShareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ToolCard from '../components/common/ToolCard';
import { AIService } from '../services/aiService';

const Tools = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('summarize');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Animation effect for the promotional section
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProcess = async () => {
    if (!currentUser) {
      alert('Please log in to use AI tools');
      return;
    }
    
    setProcessing(true);
    try {
      if (activeTab === 'summarize') {
        await AIService.summarize({ inputText, createdBy: 'local' });
        setResult('Summary requested. Check AI Jobs for output.');
      } else if (activeTab === 'mcq') {
        await AIService.generateMCQ({ inputText, count: 10, createdBy: 'local' });
        setResult('MCQ generation requested.');
      } else {
        await AIService.flashcards({ inputText, count: 20, createdBy: 'local' });
        setResult('Flashcards generation requested.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const aiTools = [
    {
      id: 'summarizer',
      title: 'AI Summarizer',
      description: 'Transform lengthy documents into concise, digestible summaries',
      icon: ListBulletIcon,
      demo: 'Converts 10-page research paper → 5 bullet points',
      features: ['Instant processing', 'Key points extraction', 'Multiple formats']
    },
    {
      id: 'mcq',
      title: 'MCQ Generator',
      description: 'Create practice questions with multiple-choice answers automatically',
      icon: QuestionMarkCircleIcon,
      demo: 'Study material → 20 MCQs with correct answers',
      features: ['Auto-generation', 'Difficulty levels', 'Answer explanations']
    },
    {
      id: 'questions',
      title: 'Question Maker',
      description: 'Generate smart study questions from your notes',
      icon: DocumentTextIcon,
      demo: 'Chapter content → Comprehensive question bank',
      features: ['Smart analysis', 'Question variety', 'Study guides']
    },
    {
      id: 'mapping',
      title: 'AI Mapping',
      description: 'Visualize concepts with intelligent mind maps',
      icon: Square3Stack3DIcon,
      demo: 'Topic input → Interactive concept map',
      features: ['Visual learning', 'Connection mapping', 'Export options']
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
                  onClick={() => setActiveTab(tool.id)}
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Try {tool.title}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tool Interface */}
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-3xl border border-accent-500/30 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Try Our AI Tools</h3>
                <p className="text-gray-300 text-lg">
                  {currentUser ? 'Start transforming your study materials now' : 'Log in to access full functionality'}
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3 text-lg">Input your study material</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-48 bg-slate-900/50 border border-accent-500/30 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300"
                    placeholder="Paste your notes, documents, or study material here to see AI in action..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-4 px-6 rounded-xl border border-accent-500/20 hover:border-accent-500/40 transition-all duration-300 flex items-center justify-center">
                    <CloudArrowUpIcon className="h-6 w-6 mr-2" />
                    Upload Document
                  </button>
                  <button
                    onClick={handleProcess}
                    disabled={!inputText || processing}
                    className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>Generate AI Content</>
                    )}
                  </button>
                </div>
                
                {!currentUser && (
                  <div className="bg-navy-900/50 border border-accent-500/20 rounded-2xl p-6 text-center">
                    <p className="text-gray-300 mb-4">Ready to unlock the full potential of AI learning?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a href="/signup" className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Start for Free
                      </a>
                      <a href="/login" className="bg-transparent border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg">
                        Log In
                      </a>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="border-t border-accent-500/20 pt-8">
                    <h3 className="text-2xl font-bold text-white mb-4">AI Generated Result:</h3>
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-accent-500/20">
                      <pre className="whitespace-pre-wrap text-gray-300 text-lg">{result}</pre>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button className="bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300">
                        Copy Result
                      </button>
                      <button className="bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300">
                        Download PDF
                      </button>
                      <button className="bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300">
                        Save to Library
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
