#!/usr/bin/env node

/**
 * Firestore Database Initialization Runner
 * This script runs the Firestore initialization with proper environment setup
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local in the project root
const envPath = resolve(__dirname, '..', '.env.local');
config({ path: envPath });

console.log('🔧 Environment Setup:');
console.log(`Loading environment from: ${envPath}`);
console.log(`Project ID: ${process.env.VITE_FIREBASE_PROJECT_ID}`);

// Import and run the initialization
import('./init-firestore.js')
  .then(() => {
    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  });
