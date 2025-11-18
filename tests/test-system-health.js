/**
 * System Health & Configuration Tests
 * Can be run independently: node tests/test-system-health.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testSystemHealth() {
  logSection('1. System Health & Configuration Tests');

  try {
    // Health check
    const health = await client.healthCheck();
    logTest('Health Check', 'pass', `Status: ${health.status}`);
  } catch (error) {
    logTest('Health Check', 'fail', error.message);
  }

  try {
    // List models
    const models = await client.listModels();
    logTest('List Models', 'pass', `${models.models?.length || 0} models available`);
    
    // Check API keys
    if (models.apiKeys) {
      const hasKeys = Object.values(models.apiKeys).some(v => v === true);
      logTest('API Keys Validation', hasKeys ? 'pass' : 'fail', 
        hasKeys ? 'At least one API key configured' : 'No API keys configured');
    }
  } catch (error) {
    logTest('List Models', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-system-health.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          SYSTEM HEALTH & CONFIGURATION TESTS                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  await testSystemHealth();
  printTestSummary(startTime);
}

