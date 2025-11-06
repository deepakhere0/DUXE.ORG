/**
 * PDF Preview Diagnostics Utility
 * Tests if a PDF URL is accessible and identifies issues
 */

/**
 * Validates if a PDF URL is valid and not a placeholder
 * @param {string} url - The URL to validate
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validatePDFUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  // Check if URL is properly formatted
  try {
    const urlObj = new URL(url);

    // Check for fake/placeholder URLs
    if (urlObj.hostname.includes('example.com') || urlObj.hostname.includes('placeholder')) {
      return {
        isValid: false,
        error: 'Placeholder URLs are not allowed. Please provide a real PDF file URL.'
      };
    }

    // Ensure it's HTTP(S)
    if (!urlObj.protocol.startsWith('http')) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }

    return { isValid: true, error: null };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format. Please provide a valid URL.'
    };
  }
};

/**
 * Checks if a URL points to a fake/placeholder domain
 * @param {string} url - The URL to check
 * @returns {boolean} - True if URL is fake/placeholder
 */
export const isFakeUrl = (url) => {
  if (!url) return true;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('example.com') ||
           urlObj.hostname.includes('placeholder') ||
           !url.startsWith('http');
  } catch {
    return true; // Invalid URLs are considered fake
  }
};

export const testPDFUrl = async (url) => {
  console.group('🔍 PDF Diagnostics');
  console.log('Testing URL:', url);
  
  const results = {
    url,
    accessible: false,
    corsEnabled: false,
    contentType: null,
    fileSize: null,
    error: null,
  };

  try {
    // Test 1: Basic fetch
    console.log('Test 1: Basic fetch...');
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
    });
    
    results.accessible = response.ok;
    results.contentType = response.headers.get('Content-Type');
    results.fileSize = response.headers.get('Content-Length');
    results.corsEnabled = response.headers.get('Access-Control-Allow-Origin') !== null;
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Content-Type:', results.contentType);
    console.log('✅ File size:', results.fileSize);
    console.log('✅ CORS enabled:', results.corsEnabled);
    
    // Test 2: Try to fetch a small portion
    console.log('Test 2: Attempting partial content fetch...');
    const partialResponse = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Range': 'bytes=0-1024',
      },
    });
    
    if (partialResponse.ok) {
      console.log('✅ Partial content fetch successful');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    results.error = error.message;
    
    // Analyze error type
    if (error.message.includes('CORS')) {
      console.error('💡 Issue: CORS policy blocking access');
      console.error('💡 Solution: Check Firebase Storage CORS configuration');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('💡 Issue: Network error or invalid URL');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.error('💡 Issue: Authorization required');
      console.error('💡 Solution: Check Firebase Storage security rules');
    }
  }
  
  console.groupEnd();
  return results;
};

export const suggestFix = (diagnostics) => {
  if (!diagnostics.accessible) {
    return 'URL is not accessible. Check if the file exists and storage rules allow reading.';
  }
  
  if (!diagnostics.corsEnabled) {
    return 'CORS is not enabled. Run: gsutil cors set cors.json gs://your-bucket-name.appspot.com';
  }
  
  if (diagnostics.contentType && !diagnostics.contentType.includes('pdf')) {
    return `File is not a PDF (Content-Type: ${diagnostics.contentType})`;
  }
  
  return 'URL appears valid. If preview still fails, try iframe fallback.';
};
