import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import { GeminiService } from '../../services/geminiService';
import FileUpload from './FileUpload';
import Toast from '../common/Toast';

const QuestionMaker = () => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('shortAnswer');

  const handleTextExtracted = (text) => {
    setInputText(text);
    setError(null);
  };

  const handleGenerateQuestions = async () => {
    if (!inputText.trim()) {
      Toast.error('Please provide text to generate questions');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await GeminiService.generateQuestions(inputText);
      setQuestions(result);
      Toast.success('Study questions generated successfully!');
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuestions = () => {
    if (!questions) return;

    const questionsText = `
# Study Questions

## Short Answer Questions
${questions.shortAnswer?.map((q, i) => `
${i + 1}. ${q.question}
   Answer: ${q.suggestedAnswer}
   Key Points: ${q.points}
`).join('\n') || 'No questions available'}

## Long Answer Questions
${questions.longAnswer?.map((q, i) => `
${i + 1}. ${q.question}
   Guidelines: ${q.guidelines}
   Key Points: ${q.keyPoints?.join(', ')}
`).join('\n') || 'No questions available'}

## Critical Thinking Questions
${questions.critical?.map((q, i) => `
${i + 1}. ${q.question}
   Approach: ${q.approach}
   Considerations: ${q.considerations?.join(', ')}
`).join('\n') || 'No questions available'}

## Practical Application Questions
${questions.practical?.map((q, i) => `
${i + 1}. ${q.question}
   Scenario: ${q.scenario}
   Expected Outcome: ${q.expectedOutcome}
`).join('\n') || 'No questions available'}

## Discussion Topics
${questions.discussion?.map((q, i) => `
${i + 1}. ${q.topic}
   Prompts: ${q.prompts?.join('; ')}
   Perspectives: ${q.perspectives?.join(', ')}
`).join('\n') || 'No topics available'}
    `.trim();

    navigator.clipboard.writeText(questionsText);
    Toast.success('Questions copied to clipboard!');
  };

  const downloadQuestions = () => {
    if (!questions) return;

    const questionsMarkdown = `
# Study Questions

## Short Answer Questions
${questions.shortAnswer?.map((q, i) => `
### Question ${i + 1}
**${q.question}**

**Suggested Answer:** ${q.suggestedAnswer}

**Key Points:** ${q.points}
`).join('\n---\n') || 'No questions available'}

## Long Answer Questions
${questions.longAnswer?.map((q, i) => `
### Question ${i + 1}
**${q.question}**

**Guidelines:** ${q.guidelines}

**Key Points to Cover:**
${q.keyPoints?.map(p => `- ${p}`).join('\n') || 'N/A'}
`).join('\n---\n') || 'No questions available'}

## Critical Thinking Questions
${questions.critical?.map((q, i) => `
### Question ${i + 1}
**${q.question}**

**Approach:** ${q.approach}

**Considerations:**
${q.considerations?.map(c => `- ${c}`).join('\n') || 'N/A'}
`).join('\n---\n') || 'No questions available'}

## Practical Application Questions
${questions.practical?.map((q, i) => `
### Question ${i + 1}
**${q.question}**

**Scenario:** ${q.scenario}

**Expected Outcome:** ${q.expectedOutcome}
`).join('\n---\n') || 'No questions available'}

## Discussion Topics
${questions.discussion?.map((q, i) => `
### Topic ${i + 1}
**${q.topic}**

**Discussion Prompts:**
${q.prompts?.map(p => `- ${p}`).join('\n') || 'N/A'}

**Perspectives to Consider:**
${q.perspectives?.map(p => `- ${p}`).join('\n') || 'N/A'}
`).join('\n---\n') || 'No topics available'}

---
Generated with DUXE Question Maker
    `.trim();

    const blob = new Blob([questionsMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-questions.md';
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Questions downloaded!');
  };

  const categoryConfig = {
    shortAnswer: {
      title: 'Short Answer',
      icon: PencilSquareIcon,
      color: 'blue',
      description: 'Quick response questions'
    },
    longAnswer: {
      title: 'Long Answer',
      icon: DocumentTextIcon,
      color: 'green',
      description: 'Detailed explanations'
    },
    critical: {
      title: 'Critical Thinking',
      icon: LightBulbIcon,
      color: 'yellow',
      description: 'Analytical questions'
    },
    practical: {
      title: 'Practical Application',
      icon: BeakerIcon,
      color: 'purple',
      description: 'Real-world scenarios'
    },
    discussion: {
      title: 'Discussion Topics',
      icon: ChatBubbleLeftRightIcon,
      color: 'pink',
      description: 'Group discussions'
    }
  };

  const getQuestionCount = (category) => {
    if (!questions) return 0;
    return questions[category]?.length || 0;
  };

  return (
    <div className="question-maker">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-white">Question Maker</h2>
            <p className="text-gray-400">Generate comprehensive study questions from your notes</p>
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
          Or paste your study material:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-48 bg-slate-900/50 border border-accent-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          placeholder="Paste your chapter notes or study material to generate questions..."
        />
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateQuestions}
          disabled={!inputText.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="spinner mr-2"></div>
              Generating Questions...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Generate Study Questions
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

      {/* Question Categories */}
      {questions && (
        <>
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(categoryConfig).map((category) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              const isActive = activeCategory === category;
              const count = getQuestionCount(category);

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    p-4 rounded-xl border transition-all duration-300
                    ${isActive 
                      ? 'bg-accent-500/20 border-accent-500' 
                      : 'bg-slate-800/50 border-gray-600 hover:border-accent-500/50'
                    }
                  `}
                >
                  <Icon className={`h-6 w-6 mb-2 mx-auto ${isActive ? 'text-accent-500' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {config.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {count} questions
                  </p>
                </button>
              );
            })}
          </div>

          {/* Questions Display */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                {React.createElement(categoryConfig[activeCategory].icon, {
                  className: "h-6 w-6 text-accent-500 mr-2"
                })}
                {categoryConfig[activeCategory].title}
              </h3>
              <p className="text-gray-400">
                {categoryConfig[activeCategory].description}
              </p>
            </div>

            <div className="space-y-6">
              {activeCategory === 'shortAnswer' && questions.shortAnswer?.map((q, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-accent-500/20">
                  <h4 className="text-white font-semibold mb-2">
                    <span className="text-accent-500 mr-2">Q{index + 1}.</span>
                    {q.question}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Suggested Answer:</span> {q.suggestedAnswer}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Key Points:</span> {q.points}
                    </p>
                  </div>
                </div>
              ))}

              {activeCategory === 'longAnswer' && questions.longAnswer?.map((q, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-accent-500/20">
                  <h4 className="text-white font-semibold mb-2">
                    <span className="text-accent-500 mr-2">Q{index + 1}.</span>
                    {q.question}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Guidelines:</span> {q.guidelines}
                    </p>
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Key Points to Cover:</span>
                      <ul className="mt-1 ml-4 list-disc">
                        {q.keyPoints?.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {activeCategory === 'critical' && questions.critical?.map((q, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-accent-500/20">
                  <h4 className="text-white font-semibold mb-2">
                    <span className="text-accent-500 mr-2">Q{index + 1}.</span>
                    {q.question}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Approach:</span> {q.approach}
                    </p>
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Considerations:</span>
                      <ul className="mt-1 ml-4 list-disc">
                        {q.considerations?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {activeCategory === 'practical' && questions.practical?.map((q, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-accent-500/20">
                  <h4 className="text-white font-semibold mb-2">
                    <span className="text-accent-500 mr-2">Q{index + 1}.</span>
                    {q.question}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Scenario:</span> {q.scenario}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Expected Outcome:</span> {q.expectedOutcome}
                    </p>
                  </div>
                </div>
              ))}

              {activeCategory === 'discussion' && questions.discussion?.map((q, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-accent-500/20">
                  <h4 className="text-white font-semibold mb-2">
                    <span className="text-accent-500 mr-2">Topic {index + 1}:</span>
                    {q.topic}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Discussion Prompts:</span>
                      <ul className="mt-1 ml-4 list-disc">
                        {q.prompts?.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Perspectives:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {q.perspectives?.map((p, i) => (
                          <span key={i} className="bg-accent-500/20 text-accent-400 px-2 py-1 rounded text-xs">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-accent-500/20">
              <button
                onClick={copyQuestions}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                Copy All
              </button>
              <button
                onClick={downloadQuestions}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download
              </button>
            </div>
          </div>
        </>
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

export default QuestionMaker;
