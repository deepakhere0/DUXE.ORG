import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { AIService } from '../../services/aiService';
import FileUpload from './FileUpload';
import Toast from '../common/Toast';


const MCQGenerator = () => {
  
  const [inputText, setInputText] = useState('');
  const [mcqs, setMcqs] = useState([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(null);

  const handleTextExtracted = (text) => {
    setInputText(text);
    setError(null);
  };

  const handleGenerateMCQs = async () => {
    if (!inputText.trim()) {
      Toast.error('Please provide text to generate MCQs');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setMcqs([]);
    setSelectedAnswers({});
    setShowAnswers(false);
    setScore(null);
    
    try {
      const result = await AIService.generateMCQ({
        inputText,
        count: questionCount,
        createdBy: user?.uid || 'anonymous'
      });
      setMcqs(result.output);
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId, choiceIndex) => {
    if (!showAnswers) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: choiceIndex
      });
    }
  };

  const handleSubmit = () => {
    setShowAnswers(true);
    const correct = mcqs.filter(q => selectedAnswers[q.id] === q.correctIndex).length;
    setScore({
      correct,
      total: mcqs.length,
      percentage: Math.round((correct / mcqs.length) * 100)
    });
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setScore(null);
  };

  const copyMCQs = () => {
    const mcqText = mcqs.map((q, i) => `
Question ${i + 1}: ${q.question}
A) ${q.choices[0]}
B) ${q.choices[1]}
C) ${q.choices[2]}
D) ${q.choices[3]}
Answer: ${['A', 'B', 'C', 'D'][q.correctIndex]}
Explanation: ${q.explanation}
Difficulty: ${q.difficulty}
Topic: ${q.topic}
`).join('\n---\n');

    navigator.clipboard.writeText(mcqText);
    Toast.success('MCQs copied to clipboard!');
  };

  const downloadMCQs = () => {
    const mcqText = `# Multiple Choice Questions

${mcqs.map((q, i) => `
## Question ${i + 1}
**${q.question}**

- A) ${q.choices[0]}
- B) ${q.choices[1]}
- C) ${q.choices[2]}
- D) ${q.choices[3]}

**Answer:** ${['A', 'B', 'C', 'D'][q.correctIndex]}

**Explanation:** ${q.explanation}

**Difficulty:** ${q.difficulty}  
**Topic:** ${q.topic}
`).join('\n---\n')}

---
Generated with DUXE MCQ Generator
`;

    const blob = new Blob([mcqText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcq-questions.md';
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('MCQs downloaded!');
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="mcq-generator">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <QuestionMarkCircleIcon className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-white">MCQ Generator</h2>
            <p className="text-gray-400">Create practice questions with multiple-choice answers</p>
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
          placeholder="Paste your study material to generate MCQs..."
        />
      </div>

      {/* Question Count Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-white font-medium">Number of questions:</label>
        <select
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="bg-slate-900/50 border border-accent-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-500"
        >
          <option value={5}>5 Questions</option>
          <option value={10}>10 Questions</option>
          <option value={15}>15 Questions</option>
          <option value={20}>20 Questions</option>
          <option value={25}>25 Questions</option>
          <option value={30}>30 Questions</option>
        </select>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateMCQs}
          disabled={!inputText.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="spinner mr-2"></div>
              Generating MCQs...
            </>
          ) : (
            <>
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              Generate {questionCount} MCQs
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

      {/* Score Display */}
      {score && (
        <div className="mb-8 bg-gradient-to-r from-accent-500/20 to-accent-600/20 border border-accent-500 rounded-2xl p-6">
          <div className="text-center">
            <AcademicCapIcon className="h-12 w-12 text-accent-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Results</h3>
            <div className="text-3xl font-bold text-accent-500 mb-2">
              {score.percentage}%
            </div>
            <p className="text-gray-300">
              You got {score.correct} out of {score.total} questions correct
            </p>
            <button
              onClick={resetQuiz}
              className="mt-4 bg-accent-500 hover:bg-accent-600 text-white py-2 px-6 rounded-lg transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* MCQ Questions */}
      {mcqs.length > 0 && (
        <div className="space-y-6">
          {mcqs.map((mcq, index) => (
            <div 
              key={mcq.id}
              className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-6"
            >
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-white flex-1">
                    <span className="text-accent-500 mr-2">Q{index + 1}.</span>
                    {mcq.question}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(mcq.difficulty)}`}>
                      {mcq.difficulty}
                    </span>
                  </div>
                </div>
                {mcq.topic && (
                  <p className="text-sm text-gray-400">Topic: {mcq.topic}</p>
                )}
              </div>

              {/* Answer Choices */}
              <div className="space-y-2 mb-4">
                {mcq.choices.map((choice, choiceIndex) => {
                  const isSelected = selectedAnswers[mcq.id] === choiceIndex;
                  const isCorrect = choiceIndex === mcq.correctIndex;
                  const showResult = showAnswers;

                  return (
                    <button
                      key={choiceIndex}
                      onClick={() => handleAnswerSelect(mcq.id, choiceIndex)}
                      disabled={showAnswers}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-all duration-300
                        ${showResult && isCorrect ? 'bg-green-500/20 border-green-500' : ''}
                        ${showResult && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500' : ''}
                        ${!showResult && isSelected ? 'bg-accent-500/20 border-accent-500' : ''}
                        ${!showResult && !isSelected ? 'bg-slate-900/50 border-gray-600 hover:border-accent-500/50' : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 font-medium text-gray-400">
                          {['A', 'B', 'C', 'D'][choiceIndex]})
                        </span>
                        <span className="text-white flex-1">{choice}</span>
                        {showResult && isCorrect && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (shown after answer) */}
              {showAnswers && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-accent-500/20">
                  <p className="text-sm font-semibold text-accent-500 mb-2">Explanation:</p>
                  <p className="text-gray-300">{mcq.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            {!showAnswers && (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== mcqs.length}
                className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
              >
                Submit Answers ({Object.keys(selectedAnswers).length}/{mcqs.length})
              </button>
            )}
            {showAnswers && (
              <button
                onClick={resetQuiz}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
              >
                Try Again
              </button>
            )}
            <button
              onClick={copyMCQs}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Copy All
            </button>
            <button
              onClick={downloadMCQs}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download
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

export default MCQGenerator;
