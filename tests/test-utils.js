/**
 * Shared test utilities for all test files
 */

// Test statistics - shared across all test files
export const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

/**
 * Log a test result
 */
export function logTest(name, status, details = '') {
  testStats.total++;
  if (status === 'pass') {
    testStats.passed++;
    console.log(`  ✅ ${name}${details ? ` - ${details}` : ''}`);
  } else {
    testStats.failed++;
    testStats.errors.push({ name, error: details });
    console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
  }
}

/**
 * Log a test section header
 */
export function logSection(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

/**
 * Sleep utility for async operations
 */
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Print test summary
 */
export function printTestSummary(startTime) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                          TEST SUMMARY                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${testStats.total}`);
  console.log(`✅ Passed: ${testStats.passed}`);
  console.log(`❌ Failed: ${testStats.failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📊 Success Rate: ${((testStats.passed / testStats.total) * 100).toFixed(1)}%`);

  if (testStats.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testStats.errors.forEach(({ name, error }) => {
      console.log(`   • ${name}: ${error.substring(0, 100)}`);
    });
  }

  console.log('\n');
  if (testStats.failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${testStats.failed} test(s) failed. Review errors above.`);
  }
  console.log('');
}

/**
 * Reset test statistics (useful when running individual tests)
 */
export function resetTestStats() {
  testStats.total = 0;
  testStats.passed = 0;
  testStats.failed = 0;
  testStats.errors = [];
}

