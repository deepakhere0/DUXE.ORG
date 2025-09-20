#!/usr/bin/env node

// Script to check if environment variables are properly loaded
console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_GEMINI_API_KEY'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.startsWith('your_')) {
    console.log(`❌ ${varName}: NOT SET or placeholder`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  }
});

console.log(`\n🔥 Firebase Project ID: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
console.log(`🤖 Gemini API configured: ${process.env.VITE_GEMINI_API_KEY ? 'YES' : 'NO'}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

if (allGood) {
  console.log('\n🎉 All environment variables are properly configured!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some environment variables need attention.');
  process.exit(1);
}