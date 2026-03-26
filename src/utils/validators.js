import { APP_CONFIG } from '../constants/config';

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
};

export const validatePrice = (price) => {
  const num = Number(price);
  if (isNaN(num) || num < 0) return 'Price must be a positive number';
  if (num > 10000) return 'Price cannot exceed ₹10,000';
  return null;
};

export const validateFileUpload = (file) => {
  if (!file) return 'Please select a file';
  const maxBytes = APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) return `File must be smaller than ${APP_CONFIG.MAX_FILE_SIZE_MB}MB`;
  if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
  return null;
};

export const validateNoteTitle = (title) => {
  if (!title || title.trim().length === 0) return 'Title is required';
  if (title.trim().length < 3) return 'Title must be at least 3 characters';
  if (title.trim().length > 200) return 'Title cannot exceed 200 characters';
  return null;
};
