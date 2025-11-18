/**
 * Chat History Tests
 * Can be run independently: node tests/test-chat-history.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testChatHistory(chatId) {
  logSection('9. Chat History Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping chat history tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  // Get full history
  try {
    const history = await client.getChatHistory(chatId, 50);
    if (history.history && Array.isArray(history.history)) {
      logTest('Get Chat History', 'pass', `${history.history.length} messages`);
    } else {
      logTest('Get Chat History', 'fail', 'Invalid history format');
    }
  } catch (error) {
    logTest('Get Chat History', 'fail', error.message);
  }

  // Get limited history
  try {
    const history = await client.getChatHistory(chatId, 5);
    if (history.history && history.history.length <= 5) {
      logTest('Get Limited History', 'pass', `${history.history.length} messages (limit: 5)`);
    } else {
      logTest('Get Limited History', 'fail', 'Limit not respected');
    }
  } catch (error) {
    logTest('Get Limited History', 'fail', error.message);
  }

  // Get history with offset
  try {
    const history = await client.getChatHistory(chatId, 10, 5);
    logTest('Get History With Offset', 'pass', `${history.history?.length || 0} messages`);
  } catch (error) {
    logTest('Get History With Offset', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-chat-history.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          CHAT HISTORY TESTS                                         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testChatHistory(chatId);
  printTestSummary(startTime);
}

