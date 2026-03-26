/**
 * CLI Script to Scan Firestore Notes Collection for Invalid URLs
 *
 * This script scans all notes in Firestore and identifies entries where:
 * - fileUrl is missing or empty
 * - fileUrl is not a valid HTTPS URL
 * - fileUrl is a gs:// URL (needs conversion)
 * - fileUrl is a storage path instead of download URL
 * - fileUrl is a placeholder/example URL
 *
 * Usage:
 *   node scripts/scan-invalid-urls.js
 *   node scripts/scan-invalid-urls.js --fix   # Attempt to fix invalid URLs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Categorize URL type
 */
function categorizeUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim() === '') {
    return 'MISSING';
  }

  const url = fileUrl.trim();

  // Check for placeholder URLs
  if (url.includes('example.com') || url.includes('placeholder') || url.includes('fake')) {
    return 'PLACEHOLDER';
  }

  // Check if it's an HTTPS URL
  if (url.startsWith('https://') || url.startsWith('http://')) {
    try {
      new URL(url);
      return 'VALID_HTTPS';
    } catch (e) {
      return 'MALFORMED_HTTPS';
    }
  }

  // Check for gs:// URLs
  if (url.startsWith('gs://')) {
    return 'GS_URL';
  }

  // Check if it looks like a storage path
  if (url.startsWith('/') || url.includes('notes/') || url.match(/\.(pdf|jpg|png|doc)$/i)) {
    return 'STORAGE_PATH';
  }

  return 'UNKNOWN';
}

/**
 * Scan notes collection
 */
async function scanNotes() {
  console.log('🔍 Scanning notes collection for invalid URLs...\n');

  const notesRef = collection(db, 'notes');
  const snapshot = await getDocs(notesRef);

  const results = {
    MISSING: [],
    PLACEHOLDER: [],
    VALID_HTTPS: [],
    MALFORMED_HTTPS: [],
    GS_URL: [],
    STORAGE_PATH: [],
    UNKNOWN: []
  };

  let total = 0;

  snapshot.forEach((doc) => {
    total++;
    const data = doc.data();
    const category = categorizeUrl(data.fileUrl);

    results[category].push({
      id: doc.id,
      title: data.title || 'Untitled',
      fileUrl: data.fileUrl || 'N/A',
      status: data.status || 'unknown',
      createdAt: data.createdAt?.toDate?.() || 'unknown'
    });
  });

  // Print summary
  console.log('═'.repeat(80));
  console.log('📊 SCAN SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Total notes scanned: ${total}\n`);

  console.log('✅ Valid HTTPS URLs:', results.VALID_HTTPS.length);
  console.log('❌ Missing URLs:', results.MISSING.length);
  console.log('⚠️  Placeholder URLs:', results.PLACEHOLDER.length);
  console.log('🔧 gs:// URLs (need conversion):', results.GS_URL.length);
  console.log('📁 Storage paths (need conversion):', results.STORAGE_PATH.length);
  console.log('🔴 Malformed HTTPS URLs:', results.MALFORMED_HTTPS.length);
  console.log('❓ Unknown format:', results.UNKNOWN.length);
  console.log();

  // Print details for problematic URLs
  const problematic = [
    'MISSING',
    'PLACEHOLDER',
    'GS_URL',
    'STORAGE_PATH',
    'MALFORMED_HTTPS',
    'UNKNOWN'
  ];

  let issueCount = 0;
  problematic.forEach(category => {
    issueCount += results[category].length;
  });

  if (issueCount > 0) {
    console.log('═'.repeat(80));
    console.log('🔍 PROBLEMATIC ENTRIES (Details)');
    console.log('═'.repeat(80));

    problematic.forEach(category => {
      if (results[category].length > 0) {
        console.log(`\n${getCategoryEmoji(category)} ${category} (${results[category].length} entries):`);
        console.log('─'.repeat(80));

        results[category].forEach((note, index) => {
          console.log(`  ${index + 1}. ID: ${note.id}`);
          console.log(`     Title: ${note.title}`);
          console.log(`     Status: ${note.status}`);
          console.log(`     Current URL: ${note.fileUrl}`);
          console.log(`     Created: ${note.createdAt}`);
          console.log();
        });
      }
    });
  } else {
    console.log('🎉 All URLs are valid! No issues found.\n');
  }

  // Print recommendations
  if (issueCount > 0) {
    console.log('═'.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('═'.repeat(80));

    if (results.MISSING.length > 0) {
      console.log(`\n❌ Missing URLs (${results.MISSING.length}):`);
      console.log('   - These notes have no fileUrl set.');
      console.log('   - Action: Delete these notes or re-upload files.');
    }

    if (results.PLACEHOLDER.length > 0) {
      console.log(`\n⚠️  Placeholder URLs (${results.PLACEHOLDER.length}):`);
      console.log('   - These notes have fake/placeholder URLs (example.com, etc.)');
      console.log('   - Action: Delete these notes or replace with valid URLs.');
    }

    if (results.GS_URL.length > 0) {
      console.log(`\n🔧 gs:// URLs (${results.GS_URL.length}):`);
      console.log('   - These are Firebase Storage gs:// URLs.');
      console.log('   - Action: Run with --fix flag to convert to HTTPS URLs.');
      console.log('   - Or use the getDownloadUrlFromPath() helper in code.');
    }

    if (results.STORAGE_PATH.length > 0) {
      console.log(`\n📁 Storage Paths (${results.STORAGE_PATH.length}):`);
      console.log('   - These are storage paths, not download URLs.');
      console.log('   - Action: Run with --fix flag to convert to HTTPS URLs.');
    }

    if (results.MALFORMED_HTTPS.length > 0) {
      console.log(`\n🔴 Malformed HTTPS URLs (${results.MALFORMED_HTTPS.length}):`);
      console.log('   - These URLs start with http(s) but are not valid.');
      console.log('   - Action: Manually review and fix.');
    }

    console.log();
  }

  return results;
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category) {
  const map = {
    MISSING: '❌',
    PLACEHOLDER: '⚠️ ',
    VALID_HTTPS: '✅',
    MALFORMED_HTTPS: '🔴',
    GS_URL: '🔧',
    STORAGE_PATH: '📁',
    UNKNOWN: '❓'
  };
  return map[category] || '❓';
}

/**
 * Main execution
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');

    if (shouldFix) {
      console.log('⚠️  --fix flag is not yet implemented.');
      console.log('⚠️  To fix URLs, use the getDownloadUrlFromPath() helper in your code.');
      console.log('⚠️  Or manually update Firestore entries based on the scan results.\n');
    }

    await scanNotes();

    console.log('✅ Scan complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error scanning notes:', error);
    process.exit(1);
  }
}

main();
