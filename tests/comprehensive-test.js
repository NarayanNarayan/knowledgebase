/**
 * Comprehensive Test Suite for AI Knowledge Base
 * 
 * Orchestrates all individual test modules:
 * - System health and configuration
 * - User profile management
 * - Chat management (admin/user)
 * - Document ingestion
 * - RAG queries (with/without RAG, hybrid search)
 * - Knowledge graph operations
 * - Data processing
 * - Multi-model support
 * - Permission system
 * - Error handling
 * - Edge cases
 * 
 * Can be run: node tests/comprehensive-test.js
 */

import { resetTestStats, printTestSummary } from './test-utils.js';

// Import all test modules
import { testSystemHealth } from './test-system-health.js';
import { testUserProfiles } from './test-user-profiles.js';
import { testChatManagement } from './test-chat-management.js';
import { testDocumentIngestion } from './test-document-ingestion.js';
import { testRAGQueries } from './test-rag-queries.js';
import { testKnowledgeGraph } from './test-knowledge-graph.js';
import { testDataProcessing } from './test-data-processing.js';
import { testDirectQueries } from './test-direct-queries.js';
import { testChatHistory } from './test-chat-history.js';
import { testPermissionSystem } from './test-permission-system.js';
import { testMultiModelSupport } from './test-multi-model-support.js';
import { testErrorHandling } from './test-error-handling.js';
import { testHybridSearch } from './test-hybrid-search.js';
import { testUserProfileInjection } from './test-user-profile-injection.js';
import { testEdgeCases } from './test-edge-cases.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Main test runner
async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          COMPREHENSIVE AI KNOWLEDGE BASE TEST SUITE                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);

  const startTime = Date.now();
  resetTestStats();

  try {
    // Run all test suites in order
    await testSystemHealth();
    
    await testUserProfiles();
    
    const { adminChatId, userChatId } = await testChatManagement();
    
    const ingestedDocs = await testDocumentIngestion();
    
    if (userChatId) {
      await testRAGQueries(userChatId);
      await testDataProcessing(userChatId);
      await testChatHistory(userChatId);
      await testMultiModelSupport(userChatId);
      await testHybridSearch(userChatId);
      await testUserProfileInjection(userChatId);
    }
    
    await testKnowledgeGraph(adminChatId);
    await testPermissionSystem(adminChatId, userChatId);
    await testDirectQueries();
    await testErrorHandling();
    await testEdgeCases();

    // Print summary
    printTestSummary(startTime);

  } catch (error) {
    console.error('\n❌ Test suite crashed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();
