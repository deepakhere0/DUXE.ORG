import React, { useState } from 'react';
import { 
  SparklesIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import ToolCard from '../components/common/ToolCard';
import { AIService } from '../services/aiService';

const Tools = () => {
  const [activeTab, setActiveTab] = useState('summarize');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Study Tools</h1>
          <p className="text-lg text-gray-600">Transform your study materials with AI</p>
        </div>

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ToolCard
            title="Smart Summarization"
            icon={ListBulletIcon}
            description="Get concise summaries of complex topics"
            onClick={() => setActiveTab('summarize')}
            ctaLabel={activeTab === 'summarize' ? 'Selected' : 'Use tool'}
          />
          <ToolCard
            title="MCQ Generator"
            icon={QuestionMarkCircleIcon}
            description="Create practice questions instantly"
            onClick={() => setActiveTab('mcq')}
            ctaLabel={activeTab === 'mcq' ? 'Selected' : 'Use tool'}
          />
          <ToolCard
            title="Flashcards"
            icon={Square3Stack3DIcon}
            description="Build flashcards for better retention"
            onClick={() => setActiveTab('flashcards')}
            ctaLabel={activeTab === 'flashcards' ? 'Selected' : 'Use tool'}
          />
        </div>

        {/* Tool Interface */}
        <div className="card">
          <div className="card-body">
            <div className="mb-6">
              <label className="label">Input your text or upload a file</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input h-48 w-full"
                placeholder="Paste your study material here..."
              />
              <div className="mt-4 flex gap-4">
                <button className="btn btn-secondary btn-md">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload File
                </button>
                <button
                  onClick={handleProcess}
                  disabled={!inputText || processing}
                  className="btn btn-primary btn-md"
                >
                  {processing ? 'Processing...' : `Generate ${activeTab === 'summarize' ? 'Summary' : activeTab === 'mcq' ? 'MCQs' : 'Flashcards'}`}
                </button>
              </div>
            </div>

            {result && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Result:</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <pre className="whitespace-pre-wrap">{result}</pre>
                </div>
                <div className="mt-4 flex gap-4">
                  <button className="btn btn-secondary btn-sm">Copy</button>
                  <button className="btn btn-secondary btn-sm">Download</button>
                  <button className="btn btn-secondary btn-sm">Save to Library</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
