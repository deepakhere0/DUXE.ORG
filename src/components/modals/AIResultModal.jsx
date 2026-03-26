import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const AIResultModal = ({
  isOpen,
  onClose,
  title,
  type, // 'summary' | 'mcq' | 'flashcard'
  data,
  isLoading,
  error,
  onRetry,
  onSave,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    let textToCopy = '';

    if (type === 'summary' && data) {
      textToCopy = `${data.tldr || ''}\n\nKey Points:\n${(data.keyPoints || []).join('\n')}\n\nMain Terms:\n${(data.mainTerms || []).join(', ')}`;
    } else if (type === 'mcq' && data) {
      textToCopy = data
        .map(
          (q, i) =>
            `Q${i + 1}: ${q.question}\n${q.choices.map((c, j) => `  ${String.fromCharCode(65 + j)}. ${c}`).join('\n')}\nAnswer: ${q.correctAnswer}\nExplanation: ${q.explanation || 'N/A'}`
        )
        .join('\n\n');
    } else if (type === 'flashcard' && data) {
      textToCopy = data
        .map((card, i) => `Card ${i + 1}:\nFront: ${card.front}\nBack: ${card.back}`)
        .join('\n\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    let content = '';
    let filename = '';

    if (type === 'summary') {
      content = `${data.tldr || ''}\n\nKey Points:\n${(data.keyPoints || []).join('\n')}\n\nMain Terms:\n${(data.mainTerms || []).join(', ')}`;
      filename = 'summary.txt';
    } else if (type === 'mcq') {
      content = JSON.stringify(data, null, 2);
      filename = 'mcqs.json';
    } else if (type === 'flashcard') {
      // Export as CSV for Anki import
      content =
        'Front,Back\n' +
        data
          .map((card) => `"${card.front.replace(/"/g, '""')}","${card.back.replace(/"/g, '""')}"`)
          .join('\n');
      filename = 'flashcards.csv';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 text-accent-600 animate-spin mb-4" />
                <p className="text-gray-600">Generating {type}...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 mb-3">{error}</p>
                {onRetry && (
                  <button onClick={onRetry} className="btn btn-secondary btn-sm">
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Retry
                  </button>
                )}
              </div>
            )}

            {!isLoading && !error && data && (
              <>
                {type === 'summary' && (
                  <div className="space-y-4">
                    <div className="bg-accent-50 rounded-xl p-4">
                      <h4 className="font-semibold text-accent-900 mb-2">TL;DR</h4>
                      <p className="text-gray-700">{data.tldr || 'No summary available'}</p>
                    </div>

                    {data.keyPoints && data.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                        <ul className="space-y-2">
                          {data.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-accent-600 mr-2">•</span>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.mainTerms && data.mainTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Main Terms</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.mainTerms.map((term, i) => (
                            <span key={i} className="chip chip-secondary">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {type === 'mcq' && Array.isArray(data) && (
                  <div className="space-y-6">
                    {data.map((question, i) => (
                      <div key={i} className="border rounded-xl p-4">
                        <div className="flex items-start mb-3">
                          <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-lg text-sm font-medium mr-3">
                            Q{i + 1}
                          </span>
                          <p className="font-medium text-gray-900 flex-1">{question.question}</p>
                        </div>

                        <div className="space-y-2 ml-8 mb-3">
                          {question.choices.map((choice, j) => (
                            <div
                              key={j}
                              className={`p-2 rounded-lg ${
                                choice === question.correctAnswer
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + j)}.
                              </span>
                              {choice}
                              {choice === question.correctAnswer && (
                                <CheckIcon className="w-4 h-4 text-green-600 inline ml-2" />
                              )}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="ml-8 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <span className="font-medium">Explanation:</span>{' '}
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {type === 'flashcard' && Array.isArray(data) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((card, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Card {i + 1}</span>
                          <span className="text-xs text-accent-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to flip
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-accent-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-accent-900">Front:</p>
                            <p className="text-gray-700">{card.front}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-600">Back:</p>
                            <p className="text-gray-700">{card.back}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!isLoading && !error && data && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
                <button onClick={handleExport} className="btn btn-secondary btn-sm">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>

              <div className="flex gap-2">
                {onSave && (
                  <button onClick={onSave} className="btn btn-primary btn-sm">
                    Save to Library
                  </button>
                )}
                <button onClick={onClose} className="btn btn-ghost btn-sm">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResultModal;
