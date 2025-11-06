/**
 * Unit Tests for storageHelpers.js
 *
 * Test the URL resolution helpers that convert various Firebase Storage
 * URL formats to downloadable HTTPS URLs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDownloadURL } from 'firebase/storage';
import {
  getDownloadUrlFromPath,
  resolveAndFetchUrl,
  validateFileUrl
} from '../storageHelpers';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn((storage, path) => ({ path })),
  getDownloadURL: vi.fn()
}));

vi.mock('../firebase', () => ({
  storage: {}
}));

describe('storageHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDownloadUrlFromPath', () => {
    it('should return HTTPS URLs as-is with encoding', async () => {
      const httpsUrl = 'https://firebasestorage.googleapis.com/test.pdf';
      const result = await getDownloadUrlFromPath(httpsUrl);
      expect(result).toBe(encodeURI(httpsUrl));
    });

    it('should handle HTTP URLs', async () => {
      const httpUrl = 'http://example.com/test.pdf';
      const result = await getDownloadUrlFromPath(httpUrl);
      expect(result).toBe(encodeURI(httpUrl));
    });

    it('should convert gs:// URLs to download URLs', async () => {
      const gsUrl = 'gs://my-bucket/notes/test.pdf';
      const mockDownloadUrl = 'https://firebasestorage.googleapis.com/download/test.pdf';

      getDownloadURL.mockResolvedValueOnce(mockDownloadUrl);

      const result = await getDownloadUrlFromPath(gsUrl);

      expect(getDownloadURL).toHaveBeenCalled();
      expect(result).toBe(mockDownloadUrl);
    });

    it('should convert storage paths to download URLs', async () => {
      const storagePath = '/notes/test.pdf';
      const mockDownloadUrl = 'https://firebasestorage.googleapis.com/download/test.pdf';

      getDownloadURL.mockResolvedValueOnce(mockDownloadUrl);

      const result = await getDownloadUrlFromPath(storagePath);

      expect(getDownloadURL).toHaveBeenCalled();
      expect(result).toBe(mockDownloadUrl);
    });

    it('should handle storage paths without leading slash', async () => {
      const storagePath = 'notes/test.pdf';
      const mockDownloadUrl = 'https://firebasestorage.googleapis.com/download/test.pdf';

      getDownloadURL.mockResolvedValueOnce(mockDownloadUrl);

      const result = await getDownloadUrlFromPath(storagePath);

      expect(getDownloadURL).toHaveBeenCalled();
      expect(result).toBe(mockDownloadUrl);
    });

    it('should throw error for empty path', async () => {
      await expect(getDownloadUrlFromPath('')).rejects.toThrow('Invalid file path');
      await expect(getDownloadUrlFromPath(null)).rejects.toThrow('Invalid file path');
      await expect(getDownloadUrlFromPath(undefined)).rejects.toThrow('Invalid file path');
    });

    it('should throw error for invalid HTTPS URL format', async () => {
      const invalidUrl = 'https://not a valid url';
      await expect(getDownloadUrlFromPath(invalidUrl)).rejects.toThrow('Invalid HTTPS URL format');
    });

    it('should throw error when getDownloadURL fails', async () => {
      const gsUrl = 'gs://my-bucket/notes/nonexistent.pdf';
      const error = new Error('Object not found');

      getDownloadURL.mockRejectedValueOnce(error);

      await expect(getDownloadUrlFromPath(gsUrl)).rejects.toThrow('Failed to resolve gs:// URL');
    });
  });

  describe('validateFileUrl', () => {
    it('should validate valid HTTPS URL', async () => {
      const validUrl = 'https://firebasestorage.googleapis.com/test.pdf';
      const result = await validateFileUrl(validUrl);
      expect(result.valid).toBe(true);
    });

    it('should invalidate empty URL', async () => {
      const result = await validateFileUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is empty or invalid');
    });

    it('should invalidate null URL', async () => {
      const result = await validateFileUrl(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is empty or invalid');
    });
  });

  describe('resolveAndFetchUrl', () => {
    it('should resolve URL without fetching blob by default', async () => {
      const url = 'https://firebasestorage.googleapis.com/test.pdf';
      const result = await resolveAndFetchUrl(url);

      expect(result).toEqual({
        url: encodeURI(url),
        originalPath: url
      });
    });

    it('should fetch and create blob URL when asBlob is true', async () => {
      const url = 'https://firebasestorage.googleapis.com/test.pdf';
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      });

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

      const result = await resolveAndFetchUrl(url, { asBlob: true });

      expect(result.url).toBe(encodeURI(url));
      expect(result.blobUrl).toBe('blob:test-url');
      expect(result.originalPath).toBe(url);
    });

    it('should retry on fetch failure', async () => {
      const url = 'https://firebasestorage.googleapis.com/test.pdf';

      // Mock fetch to fail twice, then succeed
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob(['test']))
        });

      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

      const result = await resolveAndFetchUrl(url, { asBlob: true, retries: 1 });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result.blobUrl).toBe('blob:test-url');
    });

    it('should throw error after max retries', async () => {
      const url = 'https://firebasestorage.googleapis.com/test.pdf';

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        resolveAndFetchUrl(url, { asBlob: true, retries: 1 })
      ).rejects.toThrow('Failed to fetch blob after 2 attempts');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
