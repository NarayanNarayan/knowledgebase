/**
 * Permission System Tests
 * Can be run independently: node tests/test-permission-system.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testPermissionSystem(adminChatId, userChatId) {
  logSection('10. Permission System Tests');

  // Test admin chat permissions (should have full access)
  if (adminChatId) {
    try {
      const result = await client.query(
        adminChatId,
        'This is a test query for admin chat',
        null,
        {
          model: 'gemini-2.5-flash',
        }
      );
      logTest('Admin Chat Query', 'pass', 'Admin chat works');
    } catch (error) {
      logTest('Admin Chat Query', 'fail', error.message);
    }
  } else {
    console.log('  ⚠️  Skipping admin chat test - no admin chat ID available');
  }

  // Test user chat permissions (read-only)
  if (userChatId) {
    try {
      const result = await client.query(
        userChatId,
        'This is a test query for user chat',
        null,
        {
          model: 'gemini-2.5-flash',
        }
      );
      logTest('User Chat Query', 'pass', 'User chat works');
    } catch (error) {
      logTest('User Chat Query', 'fail', error.message);
    }
  } else {
    console.log('  ⚠️  Skipping user chat test - no user chat ID available');
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-permission-system.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          PERMISSION SYSTEM TESTS                                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires chat IDs. Use ADMIN_CHAT_ID and USER_CHAT_ID environment variables or run test-chat-management.js first.\n');
  
  const adminChatId = process.env.ADMIN_CHAT_ID || null;
  const userChatId = process.env.USER_CHAT_ID || null;
  resetTestStats();
  await testPermissionSystem(adminChatId, userChatId);
  printTestSummary(startTime);
}

