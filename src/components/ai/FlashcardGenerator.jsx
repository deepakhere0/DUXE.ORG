import React, { useState } from 'react';
import { 
  RectangleStackIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { AIService } from '../../services/aiService';
import FileUpload from './FileUpload';
import Toast from '../common/Toast';


const FlashcardGenerator = () => {
  // For now, we'll use anonymous user until auth is implemented
  const user = null;
  
  const [inputText, setInputText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [cardCount, setCardCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Study mode states
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyResults, setStudyResults] = useState({ known: 0, learning: 0 });
  const [cardStatuses, setCardStatuses] = useState({});

  const handleTextExtracted = (text) => {
    setInputText(text);
    setError(null);
  };

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) {
      Toast.error('Please provide text to generate flashcards');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setFlashcards([]);
    setStudyMode(false);
    setCardStatuses({});
    
    try {
      const result = await AIService.flashcards({
        inputText,
        count: cardCount,
        createdBy: user?.uid || 'anonymous'
      });
      setFlashcards(result.output);
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const startStudyMode = () => {
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyResults({ known: 0, learning: 0 });
    setCardStatuses({});
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      Toast.success('Study session complete!');
      setStudyMode(false);
    }
  };

  const markCard = (status) => {
    const cardId = flashcards[currentCardIndex].id;
    setCardStatuses({ ...cardStatuses, [cardId]: status });
    setStudyResults(prev => ({
      ...prev,
      [status]: prev[status] + 1
    }));
    nextCard();
  };

  const copyFlashcards = () => {
    const flashcardText = flashcards.map((card, i) => `
Card ${i + 1}
Front: ${card.front}
Back: ${card.back}
Category: ${card.category}
Difficulty: ${card.difficulty}
Type: ${card.type}
${card.hint ? `Hint: ${card.hint}` : ''}
Tags: ${card.tags.join(', ')}
`).join('\n---\n');

    navigator.clipboard.writeText(flashcardText);
    Toast.success('Flashcards copied to clipboard!');
  };

  const downloadFlashcards = () => {
    const flashcardMarkdown = `# Flashcard Set

${flashcards.map((card, i) => `
## Card ${i + 1}

**Front:** ${card.front}

**Back:** ${card.back}

**Category:** ${card.category}  
**Difficulty:** ${card.difficulty}  
**Type:** ${card.type}  
${card.hint ? `**Hint:** ${card.hint}` : ''}

**Tags:** ${card.tags.join(', ')}
`).join('\n---\n')}

---
Generated with DUXE Flashcard Generator
`;

    const blob = new Blob([flashcardMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.md';
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Flashcards downloaded!');
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      definition: 'text-blue-400 bg-blue-500/20',
      concept: 'text-purple-400 bg-purple-500/20',
      fact: 'text-green-400 bg-green-500/20',
      process: 'text-orange-400 bg-orange-500/20',
      example: 'text-pink-400 bg-pink-500/20'
    };
    return colors[type] || 'text-gray-400 bg-gray-500/20';
  };

  if (studyMode && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

    return (
      <div className="flashcard-study-mode">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <RectangleStackIcon className="h-8 w-8 text-accent-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-white">Study Mode</h2>
                <p className="text-gray-400">Card {currentCardIndex + 1} of {flashcards.length}</p>
              </div>
            </div>
            <button
              onClick={() => setStudyMode(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              Exit Study
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Study Stats */}
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">Known: {studyResults.known}</span>
            <span className="text-yellow-400">Learning: {studyResults.learning}</span>
            <span className="text-gray-400">Remaining: {flashcards.length - currentCardIndex - 1}</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div 
            className="relative w-96 h-64 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flashcard-front bg-gradient-to-br from-slate-800 to-slate-700 border border-accent-500/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <p className="text-white text-lg font-medium mb-4">{currentCard.front}</p>
                {currentCard.hint && !isFlipped && (
                  <p className="text-accent-400 text-sm">💡 {currentCard.hint}</p>
                )}
                <p className="text-gray-500 text-sm mt-4">Click to reveal answer</p>
              </div>
              
              {/* Back */}
              <div className="flashcard-back bg-gradient-to-br from-accent-600 to-accent-700 border border-accent-400 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                <p className="text-white text-lg font-medium mb-4">{currentCard.back}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentCard.difficulty)}`}>
                    {currentCard.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getTypeColor(currentCard.type)}`}>
                    {currentCard.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isFlipped && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => markCard('learning')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Still Learning
            </button>
            <button
              onClick={() => markCard('known')}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              I Know This
            </button>
          </div>
        )}

        <style jsx>{`
          .flashcard {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          
          .flashcard.flipped {
            transform: rotateY(180deg);
          }
          
          .flashcard-front,
          .flashcard-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
          }
          
          .flashcard-back {
            transform: rotateY(180deg);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flashcard-generator">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <RectangleStackIcon className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-white">Flashcard Generator</h2>
            <p className="text-gray-400">Create interactive study cards with AI assistance</p>
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
          placeholder="Paste your study material to generate flashcards..."
        />
      </div>

      {/* Card Count Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-white font-medium">Number of flashcards:</label>
        <select
          value={cardCount}
          onChange={(e) => setCardCount(Number(e.target.value))}
          className="bg-slate-900/50 border border-accent-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-500"
        >
          <option value={10}>10 Cards</option>
          <option value={15}>15 Cards</option>
          <option value={20}>20 Cards</option>
          <option value={25}>25 Cards</option>
          <option value={30}>30 Cards</option>
          <option value={40}>40 Cards</option>
          <option value={50}>50 Cards</option>
        </select>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerateFlashcards}
          disabled={!inputText.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="spinner mr-2"></div>
              Generating Flashcards...
            </>
          ) : (
            <>
              <RectangleStackIcon className="h-5 w-5 mr-2" />
              Generate {cardCount} Flashcards
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

      {/* Flashcards Display */}
      {flashcards.length > 0 && (
        <div className="space-y-6">
          {/* Study Mode Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={startStudyMode}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start Study Session
            </button>
          </div>

          {/* Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card) => (
              <div 
                key={card.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-accent-500/30 p-6"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-accent-500 font-bold text-sm">#{card.id}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(card.type)}`}>
                      {card.type}
                    </span>
                  </div>
                </div>

                {/* Front */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Front:</h4>
                  <p className="text-gray-300 text-sm">{card.front}</p>
                </div>

                {/* Back */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Back:</h4>
                  <p className="text-gray-300 text-sm">{card.back}</p>
                </div>

                {/* Hint */}
                {card.hint && (
                  <div className="mb-4">
                    <h4 className="text-accent-500 font-semibold mb-2">Hint:</h4>
                    <p className="text-accent-400 text-sm">💡 {card.hint}</p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-slate-700/50 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Category */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-500 text-xs">Category: {card.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={copyFlashcards}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Copy All
            </button>
            <button
              onClick={downloadFlashcards}
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

export default FlashcardGenerator;
