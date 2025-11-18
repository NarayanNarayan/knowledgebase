/**
 * Chat Management Tests
 * Can be run independently: node tests/test-chat-management.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';
import { testUsers } from './test-data.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testChatManagement() {
  logSection('3. Chat Management Tests');

  let adminChatId, userChatId;

  // Create admin chat
  try {
    const adminChat = await client.createChat('admin', testUsers.admin.userId, {
      description: 'Admin test chat',
      test: true,
    });
    adminChatId = adminChat.chat?.chat_id;
    logTest('Create Admin Chat', 'pass', `Chat ID: ${adminChatId}`);
  } catch (error) {
    logTest('Create Admin Chat', 'fail', error.message);
  }

  // Create user chat
  try {
    const userChat = await client.createChat('user', testUsers.user.userId, {
      description: 'User test chat',
      test: true,
    });
    userChatId = userChat.chat?.chat_id;
    logTest('Create User Chat', 'pass', `Chat ID: ${userChatId}`);
  } catch (error) {
    logTest('Create User Chat', 'fail', error.message);
  }

  // Get chat details
  if (adminChatId) {
    try {
      const chat = await client.fetch(`/chat/${adminChatId}`);
      if (chat.chat && chat.chat.chat_type === 'admin') {
        logTest('Get Chat Details', 'pass', `Type: ${chat.chat.chat_type}`);
      } else {
        logTest('Get Chat Details', 'fail', 'Chat data mismatch');
      }
    } catch (error) {
      logTest('Get Chat Details', 'fail', error.message);
    }
  }

  // Test invalid chat type
  try {
    await client.createChat('invalid-type', testUsers.admin.userId);
    logTest('Create Invalid Chat Type', 'fail', 'Should reject invalid type');
  } catch (error) {
    logTest('Create Invalid Chat Type', 'pass', 'Correctly rejects invalid type');
  }

  return { adminChatId, userChatId };
}

// Run independently if called directly
if (process.argv[1]?.includes('test-chat-management.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          CHAT MANAGEMENT TESTS                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  const result = await testChatManagement();
  console.log('\n  📋 Test Results:');
  console.log(`     Admin Chat ID: ${result.adminChatId || 'N/A'}`);
  console.log(`     User Chat ID: ${result.userChatId || 'N/A'}`);
  printTestSummary(startTime);
}

