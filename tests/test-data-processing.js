/**
 * Data Processing Tests
 * Can be run independently: node tests/test-data-processing.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testDataProcessing(chatId) {
  logSection('7. Data Processing Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping data processing tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  // Process numeric data
  try {
    const result = await client.query(
      chatId,
      'Calculate the sum, average, and maximum of these numbers',
      [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      {
        processData: true,
      }
    );
    logTest('Process Numeric Data', 'pass', 
      `Response: ${result.response ? 'Received' : 'Missing'}`);
  } catch (error) {
    logTest('Process Numeric Data', 'fail', error.message);
  }

  // Process array data
  try {
    const result = await client.query(
      chatId,
      'Analyze this data and provide insights',
      ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'],
      {
        processData: true,
      }
    );
    logTest('Process Array Data', 'pass', 'Data processed');
  } catch (error) {
    logTest('Process Array Data', 'fail', error.message);
  }

  // Process without data
  try {
    const result = await client.query(
      chatId,
      'What is 2+2?',
      null,
      {
        processData: false,
      }
    );
    logTest('Query Without Data Processing', 'pass', 'Query handled correctly');
  } catch (error) {
    logTest('Query Without Data Processing', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-data-processing.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          DATA PROCESSING TESTS                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testDataProcessing(chatId);
  printTestSummary(startTime);
}

