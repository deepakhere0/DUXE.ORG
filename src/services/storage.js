import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Validate file
export const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size: 50MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PDF, Word, Images');
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  return true;
};

// Upload file
export const uploadFile = async (file, options = {}) => {
  const { path = 'notes', userId = 'anonymous', onProgress } = options;

  console.log('🚀 Starting upload...', { file: file.name, size: file.size, userId });

  // Validate
  validateFile(file);

  // Generate filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${userId}_${timestamp}_${randomStr}_${safeName}`;
  const storagePath = `${path}/${fileName}`;

  console.log('📁 Upload path:', storagePath);

  // Create reference
  const storageRef = ref(storage, storagePath);

  // Create upload task
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log('📊 Progress:', progress + '%');
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('❌ Upload error:', error);
        reject(error);
      },
      async () => {
        console.log('✅ Upload complete!');
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('🔗 Download URL:', downloadURL);
          resolve({
            downloadURL,
            fileName,
            fullPath: storagePath,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
};

// Delete file
export const deleteFile = async (filePath) => {
  if (!filePath) {
    throw new Error('File path is required');
  }

  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('🗑️ File deleted:', filePath);
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.warn('File not found, may have been already deleted');
      return;
    }
    throw new Error('Failed to delete file');
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get allowed file types
export const getAllowedFileTypes = () => {
  return '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp';
};