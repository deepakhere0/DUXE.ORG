/**
 * PDF Preview Diagnostics Utility
 * Tests if a PDF URL is accessible and identifies issues
 */

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
        Range: 'bytes=0-1024',
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
