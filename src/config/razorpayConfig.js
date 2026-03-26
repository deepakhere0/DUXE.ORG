/**
 * Razorpay Configuration
 * Manages Razorpay API keys and settings for payment processing
 * Uses environment variables for secure key management
 */

// Get environment mode
const isDevelopment = import.meta.env.MODE === 'development';

// Razorpay configuration object
export const razorpayConfig = {
  // Key ID (public key - safe to expose in frontend)
  keyId: isDevelopment
    ? import.meta.env.VITE_RAZORPAY_TEST_KEY_ID
    : import.meta.env.VITE_RAZORPAY_LIVE_KEY_ID,

  // Currency (INR for India)
  currency: 'INR',

  // Company/Platform details
  companyName: 'DUXE',
  companyLogo: import.meta.env.VITE_COMPANY_LOGO_URL || '',

  // Theme colors for Razorpay checkout
  theme: {
    color: '#1e3a8a', // navy-600 from your Tailwind config
  },

  // Payment methods to enable
  paymentMethods: {
    card: true,
    netbanking: true,
    wallet: true,
    upi: true,
  },

  // Mode flag
  isDevelopment,
};

/**
 * Validate Razorpay configuration
 * @returns {boolean} - True if config is valid
 */
export const validateRazorpayConfig = () => {
  if (!razorpayConfig.keyId) {
    console.error('Razorpay Key ID is missing. Please add it to your .env file.');
    return false;
  }
  return true;
};

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>} - True if script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export default razorpayConfig;
