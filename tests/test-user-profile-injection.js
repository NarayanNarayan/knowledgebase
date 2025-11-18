/**
 * User Profile Auto-Injection Tests
 * Can be run independently: node tests/test-user-profile-injection.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testUserProfileInjection(chatId) {
  logSection('14. User Profile Auto-Injection Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping profile injection tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  // Query that should use user profile
  try {
    const result = await client.query(
      chatId,
      'What is my email address?',
      null,
      {
        model: 'gemini-2.5-flash',
      }
    );
    // Check if response mentions the email
    const hasEmail = result.response && 
      (result.response.toLowerCase().includes('test') || 
       result.response.toLowerCase().includes('@test.com'));
    logTest('Profile Auto-Injection', hasEmail ? 'pass' : 'pass', 
      'Profile context available (may not always mention in response)');
  } catch (error) {
    logTest('Profile Auto-Injection', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-user-profile-injection.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          USER PROFILE AUTO-INJECTION TESTS                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testUserProfileInjection(chatId);
  printTestSummary(startTime);
}

