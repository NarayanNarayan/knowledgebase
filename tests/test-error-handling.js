/**
 * Error Handling Tests
 * Can be run independently: node tests/test-error-handling.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testErrorHandling() {
  logSection('12. Error Handling Tests');

  // Query with invalid chat ID
  try {
    await client.query('invalid-chat-id-12345', 'Test', null, {});
    logTest('Invalid Chat ID', 'fail', 'Should return error');
  } catch (error) {
    logTest('Invalid Chat ID', 'pass', 'Correctly handles invalid chat');
  }

  // Query without prompt
  try {
    await client.query('some-chat-id', '', null, {});
    logTest('Empty Prompt', 'fail', 'Should reject empty prompt');
  } catch (error) {
    logTest('Empty Prompt', 'pass', 'Correctly rejects empty prompt');
  }

  // Get non-existent chat
  try {
    await client.fetch('/chat/non-existent-chat-id');
    logTest('Get Non-existent Chat', 'fail', 'Should return 404');
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('404')) {
      logTest('Get Non-existent Chat', 'pass', 'Correctly returns 404');
    } else {
      logTest('Get Non-existent Chat', 'fail', error.message);
    }
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-error-handling.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          ERROR HANDLING TESTS                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  await testErrorHandling();
  printTestSummary(startTime);
}

