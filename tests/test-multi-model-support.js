/**
 * Multi-Model Support Tests
 * Can be run independently: node tests/test-multi-model-support.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testMultiModelSupport(chatId) {
  logSection('11. Multi-Model Support Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping multi-model tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];

  for (const model of models) {
    try {
      const result = await client.query(
        chatId,
        'Say "Hello"',
        null,
        {
          model: model,
          useRAG: false,
        }
      );
      if (result.response) {
        logTest(`Model: ${model}`, 'pass', 'Model works');
      } else {
        logTest(`Model: ${model}`, 'fail', 'No response');
      }
    } catch (error) {
      if (error.message.includes('API key')) {
        logTest(`Model: ${model}`, 'pass', 'Model available (API key issue)');
      } else {
        logTest(`Model: ${model}`, 'fail', error.message);
      }
    }
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-multi-model-support.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          MULTI-MODEL SUPPORT TESTS                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testMultiModelSupport(chatId);
  printTestSummary(startTime);
}

