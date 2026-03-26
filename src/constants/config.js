export const APP_CONFIG = {
  APP_NAME: 'DUXE',
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  DEFAULT_NOTE_PRICE: 0,
  MAX_FILE_SIZE_MB: 25,
  NOTES_PER_PAGE: 12,
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
};

export const RAZORPAY_CONFIG = {
  KEY_ID: import.meta.env.VITE_RAZORPAY_LIVE_KEY_ID || import.meta.env.VITE_RAZORPAY_TEST_KEY_ID,
  COMPANY_NAME: 'DUXE',
  LOGO_URL: import.meta.env.VITE_COMPANY_LOGO_URL,
  CURRENCY: 'INR',
};
