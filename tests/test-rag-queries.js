/**
 * RAG Query Tests
 * Can be run independently: node tests/test-rag-queries.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testRAGQueries(chatId) {
  logSection('5. RAG Query Tests');

  if (!chatId) {
    console.log('  ⚠️  Skipping RAG tests - no chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get a chat ID');
    return;
  }

  // Simple query without RAG
  try {
    const result = await client.query(
      chatId,
      'What is artificial intelligence?',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: false,
      }
    );
    if (result.response && typeof result.response === 'string') {
      logTest('Query Without RAG', 'pass', `Response length: ${result.response.length}`);
    } else {
      logTest('Query Without RAG', 'fail', 'Invalid response format');
    }
  } catch (error) {
    logTest('Query Without RAG', 'fail', error.message);
  }

  // Query with RAG
  try {
    const result = await client.query(
      chatId,
      'What is machine learning?',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: true,
      }
    );
    if (result.response && typeof result.response === 'string') {
      const hasSources = result.sources && Array.isArray(result.sources);
      logTest('Query With RAG', 'pass', 
        `Response: ${result.response.length} chars, Sources: ${hasSources ? result.sources.length : 0}`);
    } else {
      logTest('Query With RAG', 'fail', 'Invalid response format');
    }
  } catch (error) {
    logTest('Query With RAG', 'fail', error.message);
  }

  // Query with specific topic
  try {
    const result = await client.query(
      chatId,
      'Explain neural networks and how they work',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: true,
      }
    );
    logTest('RAG Query - Specific Topic', 'pass', 
      `Sources found: ${result.sources?.length || 0}`);
  } catch (error) {
    logTest('RAG Query - Specific Topic', 'fail', error.message);
  }

  // Comparison query
  try {
    const result = await client.query(
      chatId,
      'What is the difference between AI and machine learning?',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: true,
      }
    );
    logTest('RAG Query - Comparison', 'pass', 
      `Response received: ${result.response ? 'Yes' : 'No'}`);
  } catch (error) {
    logTest('RAG Query - Comparison', 'fail', error.message);
  }

  // Query with different model
  try {
    const result = await client.query(
      chatId,
      'Say hello',
      null,
      {
        model: 'gemini-2.5-pro',
        useRAG: false,
      }
    );
    logTest('Query With Different Model', 'pass', 'Model switched successfully');
  } catch (error) {
    logTest('Query With Different Model', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-rag-queries.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          RAG QUERY TESTS                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires a chat ID. Use CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const chatId = process.env.CHAT_ID || null;
  resetTestStats();
  await testRAGQueries(chatId);
  printTestSummary(startTime);
}

