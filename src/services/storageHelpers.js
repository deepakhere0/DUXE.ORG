/**
 * Storage URL resolution helpers
 * Converts various Firebase Storage URL formats to downloadable HTTPS URLs
 */
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Resolves a Firebase Storage path or URL to a downloadable HTTPS URL
 * Handles multiple input formats:
 * - HTTPS URLs: returns as-is (with encodeURI for safety)
 * - gs://bucket/path: extracts path and calls getDownloadURL
 * - /notes/file.pdf or notes/file.pdf: treats as storage path
 * - null/undefined: throws error
 *
 * @param {string} pathOrUrl - Storage path or URL to resolve
 * @returns {Promise<string>} - HTTPS download URL
 * @throws {Error} - If path is invalid or download URL cannot be obtained
 */
export async function getDownloadUrlFromPath(pathOrUrl) {
  // Validate input
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    throw new Error('Invalid file path: path is empty or not a string');
  }

  const trimmedPath = pathOrUrl.trim();

  // If already an HTTPS URL, return it (with proper encoding)
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    try {
      // Validate URL format
      new URL(trimmedPath);
      return encodeURI(trimmedPath);
    } catch (e) {
      throw new Error(`Invalid HTTPS URL format: ${trimmedPath}`);
    }
  }

  // Handle gs://bucket/path format
  const gsMatch = trimmedPath.match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (gsMatch) {
    const fullPath = gsMatch[2]; // Extract path after bucket name
    console.log('🔄 Converting gs:// URL to download URL:', fullPath);
    try {
      const fileRef = storageRef(storage, fullPath);
      const downloadURL = await getDownloadURL(fileRef);
      console.log('✅ Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Failed to get download URL for gs:// path:', error);
      throw new Error(`Failed to resolve gs:// URL: ${error.message}`);
    }
  }

  // Handle plain storage paths like "/notes/abc.pdf" or "notes/abc.pdf"
  console.log('🔄 Converting storage path to download URL:', trimmedPath);
  try {
    const cleanPath = trimmedPath.replace(/^\/+/, ''); // Remove leading slashes
    const fileRef = storageRef(storage, cleanPath);
    const downloadURL = await getDownloadURL(fileRef);
    console.log('✅ Download URL obtained:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Failed to get download URL for storage path:', error);
    throw new Error(`Failed to resolve storage path: ${error.message}`);
  }
}

/**
 * Resolves a file URL and optionally fetches it as a blob for secure embedding
 * Useful for PDF viewers that require blob URLs
 *
 * @param {string} pathOrUrl - Storage path or URL to resolve
 * @param {Object} options - Options
 * @param {boolean} options.asBlob - If true, fetches and returns blob URL
 * @param {number} options.retries - Number of retry attempts (default: 1)
 * @returns {Promise<{url: string, blobUrl?: string, originalPath: string}>}
 */
export async function resolveAndFetchUrl(pathOrUrl, options = {}) {
  const { asBlob = false, retries = 1 } = options;
  const originalPath = pathOrUrl;

  // Step 1: Resolve to download URL
  let downloadURL;
  try {
    downloadURL = await getDownloadUrlFromPath(pathOrUrl);
  } catch (error) {
    console.error('❌ Failed to resolve URL:', error);
    throw new Error(`URL resolution failed: ${error.message}`);
  }

  // Step 2: If blob is requested, fetch and create blob URL
  if (asBlob) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Fetching as blob (attempt ${attempt + 1}/${retries + 1})...`);
        const response = await fetch(downloadURL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        console.log('✅ Blob URL created successfully');
        return {
          url: downloadURL,
          blobUrl,
          originalPath
        };
      } catch (error) {
        lastError = error;
        console.error(`❌ Fetch attempt ${attempt + 1} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to fetch blob after ${retries + 1} attempts: ${lastError.message}`);
  }

  // Return just the download URL if blob not requested
  return {
    url: downloadURL,
    originalPath
  };
}

/**
 * Validates if a URL is properly formatted and accessible
 * @param {string} url - URL to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateFileUrl(url) {
  try {
    // Check if URL exists
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is empty or invalid' };
    }

    // Try to resolve it
    await getDownloadUrlFromPath(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Cleans up blob URLs to prevent memory leaks
 * Call this when component unmounts or blob URL is no longer needed
 * @param {string} blobUrl - Blob URL to revoke
 */
export function revokeBlobUrl(blobUrl) {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
    console.log('🗑️ Blob URL revoked');
  }
}
