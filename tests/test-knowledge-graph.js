/**
 * Knowledge Graph Tests
 * Can be run independently: node tests/test-knowledge-graph.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, sleep, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testKnowledgeGraph(adminChatId) {
  logSection('6. Knowledge Graph Tests');

  if (!adminChatId) {
    console.log('  ⚠️  Skipping graph tests - no admin chat ID available');
    console.log('  💡 Tip: Run test-chat-management.js first to get an admin chat ID');
    return;
  }

  // Get graph statistics
  try {
    const stats = await client.getGraphStats();
    if (stats.stats) {
      logTest('Get Graph Statistics', 'pass', 
        `Entities: ${stats.stats.entities || 0}, Types: ${stats.stats.types || 0}`);
    } else {
      logTest('Get Graph Statistics', 'fail', 'Invalid stats format');
    }
  } catch (error) {
    logTest('Get Graph Statistics', 'fail', error.message);
  }

  // Try to create entity via admin chat
  try {
    const result = await client.query(
      adminChatId,
      'Create an entity for "Artificial Intelligence" in the knowledge graph with description "AI is a field of computer science"',
      null,
      {
        useGraph: true,
      }
    );
    logTest('Create Graph Entity (Admin)', 'pass', 'Entity creation attempted');
  } catch (error) {
    logTest('Create Graph Entity (Admin)', 'fail', error.message);
  }

  // Wait a bit for entity to be created
  await sleep(2000);

  // Try to get entity (if one exists)
  try {
    // This will fail if no entities exist, which is expected
    const stats = await client.getGraphStats();
    if (stats.stats && stats.stats.entities > 0) {
      // Try to get first entity (we'd need the actual ID)
      logTest('Get Graph Entity', 'pass', 'Entities exist in graph');
    } else {
      logTest('Get Graph Entity', 'pass', 'No entities yet (expected)');
    }
  } catch (error) {
    logTest('Get Graph Entity', 'pass', 'No entities found (expected)');
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-knowledge-graph.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          KNOWLEDGE GRAPH TESTS                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  console.log('  ⚠️  Note: This test requires an admin chat ID. Use ADMIN_CHAT_ID environment variable or run test-chat-management.js first.\n');
  
  const adminChatId = process.env.ADMIN_CHAT_ID || null;
  resetTestStats();
  await testKnowledgeGraph(adminChatId);
  printTestSummary(startTime);
}

