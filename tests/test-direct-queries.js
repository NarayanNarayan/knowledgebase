/**
 * Direct Query Tests (No Chat Context)
 * Can be run independently: node tests/test-direct-queries.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testDirectQueries() {
  logSection('8. Direct Query Tests (No Chat Context)');

  // Direct query without chat
  try {
    const result = await client.queryDirect(
      'What is artificial intelligence? Explain in one sentence.',
      null,
      {
        model: 'gemini-2.5-flash',
      }
    );
    if (result.response) {
      logTest('Direct Query', 'pass', `Response: ${result.response.substring(0, 50)}...`);
    } else {
      logTest('Direct Query', 'fail', 'No response');
    }
  } catch (error) {
    logTest('Direct Query', 'fail', error.message);
  }

  // Direct query with RAG
  try {
    const result = await client.queryDirect(
      'What is machine learning?',
      null,
      {
        model: 'gemini-2.5-flash',
        useRAG: true,
      }
    );
    logTest('Direct Query With RAG', 'pass', 
      `Sources: ${result.sources?.length || 0}`);
  } catch (error) {
    logTest('Direct Query With RAG', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-direct-queries.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          DIRECT QUERY TESTS (NO CHAT CONTEXT)                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  await testDirectQueries();
  printTestSummary(startTime);
}

