/**
 * Edge Cases & Stress Tests
 * Can be run independently: node tests/test-edge-cases.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testEdgeCases() {
  logSection('15. Edge Cases & Stress Tests');

  // Very long prompt
  try {
    const longPrompt = 'What is AI? '.repeat(100);
    const result = await client.queryDirect(longPrompt, null, {
      model: 'gemini-2.5-flash',
    });
    logTest('Very Long Prompt', 'pass', 'Handled long prompt');
  } catch (error) {
    logTest('Very Long Prompt', 'fail', error.message);
  }

  // Special characters in prompt
  try {
    const result = await client.queryDirect(
      'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      null,
      {
        model: 'gemini-2.5-flash',
      }
    );
    logTest('Special Characters', 'pass', 'Handled special chars');
  } catch (error) {
    logTest('Special Characters', 'fail', error.message);
  }

  // Multiple rapid queries
  try {
    const promises = Array(5).fill(null).map(() =>
      client.queryDirect('Say "test"', null, { model: 'gemini-2.5-flash' })
    );
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.response).length;
    logTest('Rapid Queries', 'pass', `${successCount}/5 succeeded`);
  } catch (error) {
    logTest('Rapid Queries', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-edge-cases.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          EDGE CASES & STRESS TESTS                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  await testEdgeCases();
  printTestSummary(startTime);
}

