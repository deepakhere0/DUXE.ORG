import React, { useState } from 'react';
import { 
  ListBulletIcon, 
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { AIService } from '../../services/aiService';
import FileUpload from './FileUpload';
import Toast from '../common/Toast';

const AISummarizer = () => {
  // For now, we'll use anonymous user until auth is implemented
  const user = null;
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleTextExtracted = (text) => {
    setInputText(text);
    setError(null);
  };

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) {
      Toast.error('Please provide text to summarize');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await AIService.summarize({
        inputText,
        createdBy: user?.uid || 'anonymous'
      });
      setSummary(result.output);
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = () => {
    if (summary) {
      const summaryText = `
${summary.title}

Summary:
${summary.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

TL;DR: ${summary.tldr}

Key Terms: ${summary.keyTerms.join(', ')}

Main Concepts: ${summary.mainConcepts.join(', ')}

Study Tips:
${summary.studyTips.map((t, i) => `- ${t}`).join('\n')}
      `.trim();
      
      navigator.clipboard.writeText(summaryText);
      Toast.success('Summary copied to clipboard!');
    }
  };

  const downloadSummary = () => {
    if (summary) {
      const summaryText = `
# ${summary.title}

## Summary Points
${summary.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

## TL;DR
${summary.tldr}

## Key Terms
${summary.keyTerms.join(', ')}

## Main Concepts
${summary.mainConcepts.join(', ')}

## Study Tips
${summary.studyTips.map((t, i) => `- ${t}`).join('\n')}

---
Generated with DUXE AI Summarizer
      `.trim();
      
      const blob = new Blob([summaryText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-summary.md';
      a.click();
      URL.revokeObjectURL(url);
      Toast.success('Summary downloaded!');
    }
  };

  return (
    <div className="ai-summarizer">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <ListBulletIcon className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-white">AI Summarizer</h2>
            <p className="text-gray-400">Transform lengthy documents into concise bullet points</p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <FileUpload 
          onTextExtracted={handleTextExtracted}
          className="mb-6"
        />
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-3">
          Or paste your text directly:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-48 bg-slate-900/50 border border-accent-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          placeholder="Paste your study material, notes, or any text you want to summarize..."
        />
        <p className="text-sm text-gray-500 mt-2">
          {inputText.length} characters • {inputText.split(' ').filter(w => w).length} words
        </p>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateSummary}
          disabled={!inputText.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="spinner mr-2"></div>
              Generating Summary...
            </>
          ) : (
            <>
              <ListBulletIcon className="h-5 w-5 mr-2" />
              Generate AI Summary
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Results */}
      {summary && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{summary.title}</h3>
            <p className="text-accent-500 font-medium">{summary.tldr}</p>
          </div>

          {/* Key Points */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <ListBulletIcon className="h-5 w-5 mr-2 text-accent-500" />
              Key Points
            </h4>
            <ul className="space-y-3">
              {summary.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent-500 font-bold mr-3 mt-1">{index + 1}.</span>
                  <span className="text-gray-300">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Terms */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Key Terms</h4>
            <div className="flex flex-wrap gap-2">
              {summary.keyTerms.map((term, index) => (
                <span 
                  key={index}
                  className="bg-accent-500/20 text-accent-400 px-3 py-1 rounded-lg text-sm"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Main Concepts */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Main Concepts</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {summary.mainConcepts.map((concept, index) => (
                <div 
                  key={index}
                  className="bg-slate-900/50 border border-accent-500/20 rounded-lg p-3"
                >
                  <p className="text-white font-medium">{concept}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Study Tips */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Study Tips</h4>
            <ul className="space-y-2">
              {summary.studyTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-accent-500/20">
            <button
              onClick={copySummary}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Copy
            </button>
            <button
              onClick={downloadSummary}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download
            </button>
            <button
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share
            </button>
            <button
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <BookmarkIcon className="h-5 w-5 mr-2" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #10b981;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AISummarizer;
