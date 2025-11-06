import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { showToast } from '../common/Toast';
import { testPDFUrl, suggestFix } from '../../utils/pdfDiagnostics';
import { getDownloadUrlFromPath } from '../../services/storageHelpers'; // Import URL resolver helper
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker with local fallback
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const NotePreviewModal = ({ isOpen, onClose, note }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [resolvedFileUrl, setResolvedFileUrl] = useState(null); // Store resolved HTTPS URL

  useEffect(() => {
    if (isOpen && note?.fileUrl) {
      console.group('📝 Preview Modal Opening');
      console.log('Note:', note);
      console.log('File URL (original):', note.fileUrl);
      console.log('File Type:', note.fileType);

      // Lock body scroll when modal opens
      document.body.style.overflow = 'hidden';

      setError(null);
      setPageNumber(1);
      setScale(1.0);
      setRenderReady(false);
      setResolvedFileUrl(null);

      // Resolve file URL to downloadable HTTPS format (handles gs://, storage paths, etc.)
      const resolveUrl = async () => {
        try {
          console.log('🔄 Resolving file URL...');
          const downloadUrl = await getDownloadUrlFromPath(note.fileUrl);
          console.log('✅ Resolved URL:', downloadUrl);

          // Validate resolved URL
          const urlObj = new URL(downloadUrl);
          console.log('✅ Valid HTTPS URL:', urlObj.hostname);

          // Check for fake/placeholder URLs
          if (urlObj.hostname.includes('example.com') || urlObj.hostname.includes('placeholder')) {
            console.error('❌ Fake/placeholder URL detected!');
            setError('This note uses a placeholder URL. Please contact the administrator to fix this note.');
            setRenderReady(false);
            console.groupEnd();
            return;
          }

          // Store resolved URL
          setResolvedFileUrl(downloadUrl);

          // Detect file type and determine best preview method
          const url = downloadUrl.toLowerCase();
          let detectedType;
          let shouldUseFallback = false;

          if (url.includes('.pdf') || note.fileType === 'application/pdf') {
            detectedType = 'pdf';
            setFileType('pdf');
            setLoading(true);

            // Use iframe directly for Firebase Storage URLs (CORS issues with PDF.js)
            if (url.includes('firebasestorage.googleapis.com') || url.includes('firebase')) {
              console.log('🔥 Firebase Storage detected - using iframe directly');
              shouldUseFallback = true;
            }
          } else if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || note.fileType?.startsWith('image/')) {
            detectedType = 'image';
            setFileType('image');
            setLoading(true);
          } else {
            detectedType = 'pdf (default)';
            setFileType('pdf');
            setLoading(true);
            shouldUseFallback = true; // Default to iframe for unknown types
          }

          setUseFallback(shouldUseFallback);

          console.log('📄 Detected file type:', detectedType);
          console.log('🔧 Use fallback iframe:', shouldUseFallback);
          console.log('⏱️ Render ready immediately');
          console.groupEnd();

          // Set render ready immediately for faster preview
          setRenderReady(true);
        } catch (urlError) {
          console.error('❌ URL resolution failed:', urlError);
          console.error('Original URL:', note.fileUrl);
          console.error('Error details:', {
            message: urlError.message,
            stack: urlError.stack
          });

          // Provide detailed error message with troubleshooting info
          const errorMsg = `Failed to load file: ${urlError.message}. Original URL: ${note.fileUrl}`;
          setError(errorMsg);
          setRenderReady(false);
          console.groupEnd();
          return;
        }
      };

      // Execute URL resolution
      resolveUrl();
    } else if (isOpen && !note?.fileUrl) {
      console.error('❌ Note opened without fileUrl:', note);
      setError('This note does not have a file attached.');
      setRenderReady(false);
      document.body.style.overflow = 'hidden';
    } else {
      setRenderReady(false);
      // Unlock body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, note]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (fileType === 'pdf' && pageNumber > 1) {
            setPageNumber(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (fileType === 'pdf' && pageNumber < numPages) {
            setPageNumber(prev => prev + 1);
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, pageNumber, numPages, fileType]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Use resolved URL for download (ensures valid HTTPS URL)
      const downloadUrl = resolvedFileUrl || note.fileUrl;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = note.fileName || note.title || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Download started', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('✅ PDF loaded successfully!', { numPages });
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = async (error) => {
    console.error('❌ PDF Load Error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    console.error('PDF URL:', note?.fileUrl);
    
    // Run diagnostics (use resolved URL if available)
    const urlToTest = resolvedFileUrl || note?.fileUrl;
    if (urlToTest) {
      const diagnostics = await testPDFUrl(urlToTest);
      const suggestion = suggestFix(diagnostics);
      console.log('💡 Suggestion:', suggestion);
    }
    
    // Try fallback iframe method for CORS issues
    console.log('🔄 Attempting fallback iframe preview...');
    setUseFallback(true);
    setLoading(true); // Set loading for iframe
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!isOpen || !note) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center"
        style={{ isolation: 'isolate' }}
        onClick={onClose}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-7xl md:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-navy-600 to-navy-500 text-white border-b border-navy-400">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{note.title}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-200">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Subject:</span> {note.subject || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Author:</span> {note.authorName || 'Anonymous'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Uploaded:</span> {formatDate(note.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {fileType === 'pdf' && !useFallback && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-navy-400/30 rounded-lg transition-colors"
                    title="Zoom Out (-)"
                  >
                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-navy-400/30 rounded-lg transition-colors"
                    title="Zoom In (+)"
                  >
                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-navy-400/30 rounded-lg transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-navy-400/30 rounded-lg transition-colors"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Close (ESC)"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ minHeight: '500px', height: 'calc(100vh - 160px)' }}>
            {!renderReady ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-navy-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Preparing preview...</p>
                </div>
              </div>
            ) : null}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                  <div className="text-red-500 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700"
                  >
                    Download Instead
                  </button>
                </div>
              </div>
            )}

            {renderReady && !error ? (
              <div className="flex items-center justify-center w-full h-full">
                {console.log('📺 Rendering content...', { fileType, useFallback, resolvedUrl: resolvedFileUrl })}
                {fileType === 'pdf' && !useFallback ? (
                  <div className="bg-white shadow-lg w-full h-full flex items-center justify-center">
                    <Document
                      file={{
                        url: resolvedFileUrl || note.fileUrl, // Use resolved URL for PDF.js
                        httpHeaders: {
                          'Accept': 'application/pdf',
                        },
                        withCredentials: false,
                      }}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin h-8 w-8 border-4 border-navy-600 border-r-transparent rounded-full"></div>
                          <p className="ml-3 text-gray-600">Loading PDF...</p>
                        </div>
                      }
                      options={{
                        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                        standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                        disableAutoFetch: false,
                        disableStream: false,
                        isEvalSupported: false,
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin h-6 w-6 border-2 border-navy-600 border-r-transparent rounded-full"></div>
                          </div>
                        }
                      />
                    </Document>
                  </div>
                ) : fileType === 'pdf' && useFallback ? (
                  <div className="relative w-full h-full bg-white">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center">
                          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-navy-600 border-r-transparent"></div>
                          <p className="mt-4 text-gray-600">Loading PDF preview...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={`${resolvedFileUrl || note.fileUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} {/* Use resolved URL for iframe */}
                      className="w-full h-full border-0 min-h-[500px]"
                      title={note.title || 'PDF Preview'}
                      style={{ display: loading ? 'none' : 'block' }}
                      onLoad={() => {
                        console.log('✅ Iframe loaded successfully');
                        setTimeout(() => setLoading(false), 500);
                      }}
                      allow="fullscreen"
                    />
                  </div>
                ) : (
                  <div className="max-w-full max-h-full flex items-center justify-center relative">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin h-8 w-8 border-4 border-navy-600 border-r-transparent rounded-full"></div>
                      </div>
                    )}
                    <img
                      src={resolvedFileUrl || note.fileUrl} {/* Use resolved URL for image */}
                      alt={note.title}
                      className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                      style={{ transform: `scale(${scale})` }}
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setError('Failed to load image');
                        setLoading(false);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bottom Pagination (PDF only - react-pdf mode) */}
          {fileType === 'pdf' && !useFallback && numPages && !error && (
            <div className="flex items-center justify-center gap-4 px-6 py-3 bg-white border-t border-gray-200">
              <button
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page (←)"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Page {pageNumber} of {numPages}
              </span>

              <button
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disabled={pageNumber >= numPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page (→)"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render modal at document root using Portal
  return createPortal(modalContent, document.body);
};

export default NotePreviewModal;
