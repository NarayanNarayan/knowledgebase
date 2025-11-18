/**
 * Hybrid Search Tests
 * Can be run independently: node tests/test-hybrid-search.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testHybridSearch(chatId) {
  logSection('13. Hybrid Search Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping hybrid search tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  // Query with hybrid search (RAG + Graph)
  try {
    const result = await client.query(
      chatId,
      'Find information about neural networks and related concepts',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: true,
        useGraph: true,
      }
    );
    logTest('Hybrid Search (RAG + Graph)', 'pass', 
      `Sources: ${result.sources?.length || 0}, Agents: ${result.agentsUsed?.join(', ') || 'N/A'}`);
  } catch (error) {
    logTest('Hybrid Search (RAG + Graph)', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-hybrid-search.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          HYBRID SEARCH TESTS                                         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testHybridSearch(chatId);
  printTestSummary(startTime);
}

