// File parsing utilities for extracting text from various file formats

// Dynamic imports to avoid module resolution issues
let pdfjsLib = null;
let mammoth = null;

// Initialize PDF.js dynamically
async function initPdfJs() {
  if (!pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
      throw new Error('PDF processing is not available. Please try a different file format.');
    }
  }
  return pdfjsLib;
}

// Initialize Mammoth dynamically
async function initMammoth() {
  if (!mammoth) {
    try {
      mammoth = await import('mammoth');
      mammoth = mammoth.default || mammoth;
    } catch (error) {
      console.error('Failed to load Mammoth:', error);
      throw new Error('DOCX processing is not available. Please try a different file format.');
    }
  }
  return mammoth;
}

/**
 * Parse PDF file and extract text content
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export async function parsePDF(file) {
  try {
    const pdfLib = await initPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error("Failed to parse PDF file. Please ensure it's a valid PDF document.");
  }
}

/**
 * Parse DOCX file and extract text content
 * @param {File} file - DOCX file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseDOCX(file) {
  try {
    const mammothLib = await initMammoth();
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothLib.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error("Failed to parse DOCX file. Please ensure it's a valid Word document.");
  }
}

/**
 * Parse TXT file and extract text content
 * @param {File} file - TXT file to parse
 * @returns {Promise<string>} - Text content
 */
export async function parseTXT(file) {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to read text file.');
  }
}

/**
 * Parse file based on its type
 * @param {File} file - File to parse
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // Check by file extension first, then by MIME type
  if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
    return await parsePDF(file);
  } else if (
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc') ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    return await parseDOCX(file);
  } else if (
    fileName.endsWith('.txt') ||
    fileType === 'text/plain' ||
    fileType.startsWith('text/')
  ) {
    return await parseTXT(file);
  } else {
    throw new Error(`Unsupported file type. Please upload PDF, DOCX, or TXT files.`);
  }
}

/**
 * Validate file before parsing
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['pdf', 'docx', 'doc', 'txt'],
  } = options;

  const result = {
    valid: true,
    error: null,
  };

  // Check file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedTypes.some((type) => fileName.endsWith(`.${type}`));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return result;
}

/**
 * Extract metadata from file
 * @param {File} file - File to analyze
 * @returns {Object} - File metadata
 */
export function getFileMetadata(file) {
  if (!file) return null;

  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

  return {
    name: fileName,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type || 'unknown',
    extension: fileExtension,
    lastModified: new Date(file.lastModified),
    isSupported: ['pdf', 'docx', 'doc', 'txt'].includes(fileExtension),
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 5000) {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
}

export default {
  parseFile,
  parsePDF,
  parseDOCX,
  parseTXT,
  validateFile,
  getFileMetadata,
  truncateText,
};
