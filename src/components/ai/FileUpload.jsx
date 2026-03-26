import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { validateFile, getFileMetadata, parseFile } from '../../utils/fileParser';
import Toast from '../ui/Toast';

const FileUpload = ({ 
  onFileProcessed, 
  onTextExtracted,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['pdf', 'docx', 'doc', 'txt'],
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (selectedFile) => {
    setError(null);
    
    // Validate file
    const validation = validateFile(selectedFile, { maxSize, allowedTypes: acceptedTypes });
    if (!validation.valid) {
      setError(validation.error);
      Toast.error(validation.error);
      return;
    }

    // Get file metadata
    const metadata = getFileMetadata(selectedFile);
    setFile(selectedFile);
    setFileMetadata(metadata);

    // Process file
    setIsProcessing(true);
    try {
      const text = await parseFile(selectedFile);
      setExtractedText(text);
      
      // Call callbacks
      if (onTextExtracted) {
        onTextExtracted(text);
      }
      if (onFileProcessed) {
        onFileProcessed({
          file: selectedFile,
          text,
          metadata
        });
      }
      
      Toast.success(`File "${metadata.name}" processed successfully`);
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [maxSize, acceptedTypes, onFileProcessed, onTextExtracted]);

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setFile(null);
    setFileMetadata(null);
    setExtractedText('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onTextExtracted) {
      onTextExtracted('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.map(type => `.${type}`).join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      {!file && (
        <div
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${isDragging 
              ? 'border-accent-500 bg-accent-500/10' 
              : 'border-gray-600 hover:border-accent-500/50 bg-slate-800/50'
            }
            ${error ? 'border-red-500' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudArrowUpIcon className="h-12 w-12 text-accent-500 mx-auto mb-4" />
          
          <h3 className="text-xl font-semibold text-white mb-2">
            Upload Study Material
          </h3>
          
          <p className="text-gray-400 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          
          <button
            onClick={triggerFileInput}
            className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
          >
            Choose File
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: {acceptedTypes.map(t => t.toUpperCase()).join(', ')}
            <br />
            Maximum file size: {maxSize / (1024 * 1024)}MB
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm flex items-center justify-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* File Preview */}
      {file && fileMetadata && (
        <div className="bg-slate-800/50 border border-accent-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-10 w-10 text-accent-500 mr-3" />
              <div>
                <h4 className="text-white font-semibold">{fileMetadata.name}</h4>
                <p className="text-gray-400 text-sm">
                  {fileMetadata.sizeFormatted} • {fileMetadata.extension.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <div className="spinner mr-3"></div>
              <span className="text-gray-300">Processing file...</span>
            </div>
          )}

          {/* Success Status */}
          {!isProcessing && extractedText && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                File processed successfully! {extractedText.split(' ').length} words extracted.
              </p>
            </div>
          )}

          {/* Text Preview */}
          {extractedText && (
            <div className="mt-4">
              <h5 className="text-white font-medium mb-2">Extracted Text Preview:</h5>
              <div className="bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && '...'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={clearFile}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              Clear
            </button>
            <button
              onClick={triggerFileInput}
              className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              Upload Different File
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

export default FileUpload;
