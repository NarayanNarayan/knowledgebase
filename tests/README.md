# Test Suite Documentation

This directory contains a modular test suite for the AI Knowledge Base system. Tests are organized into individual files that can be run independently or as part of the comprehensive test suite.

## Structure

### Shared Files
- **`test-utils.js`** - Shared utilities (logging, statistics, helpers)
- **`test-data.js`** - Shared test data (users, documents)

### Individual Test Files
Each test file can be run independently:

1. **`test-system-health.js`** - System health and configuration tests
2. **`test-user-profiles.js`** - User profile management tests
3. **`test-chat-management.js`** - Chat creation and management tests
4. **`test-document-ingestion.js`** - Document ingestion tests
5. **`test-rag-queries.js`** - RAG query tests (requires chat ID)
6. **`test-knowledge-graph.js`** - Knowledge graph tests (requires admin chat ID)
7. **`test-data-processing.js`** - Data processing tests (requires chat ID)
8. **`test-direct-queries.js`** - Direct query tests (no chat context)
9. **`test-chat-history.js`** - Chat history retrieval tests (requires chat ID)
10. **`test-permission-system.js`** - Permission system tests (requires chat IDs)
11. **`test-multi-model-support.js`** - Multi-model support tests (requires chat ID)
12. **`test-error-handling.js`** - Error handling tests
13. **`test-hybrid-search.js`** - Hybrid search tests (requires chat ID)
14. **`test-user-profile-injection.js`** - User profile injection tests (requires chat ID)
15. **`test-edge-cases.js`** - Edge cases and stress tests

### Comprehensive Test
- **`comprehensive-test.js`** - Orchestrates all individual tests in sequence

## Usage

### Run All Tests (Comprehensive Suite)

```bash
node tests/comprehensive-test.js
```

### Run Individual Tests

```bash
# System health tests
node tests/test-system-health.js

# User profile tests
node tests/test-user-profiles.js

# Chat management tests
node tests/test-chat-management.js

# Document ingestion tests
node tests/test-document-ingestion.js

# RAG query tests (requires chat ID)
CHAT_ID=your-chat-id node tests/test-rag-queries.js

# Knowledge graph tests (requires admin chat ID)
ADMIN_CHAT_ID=your-admin-chat-id node tests/test-knowledge-graph.js

# Error handling tests (no dependencies)
node tests/test-error-handling.js
```

### Environment Variables

Some tests require environment variables:

- **`API_BASE_URL`** - API base URL (default: `http://localhost:3000/api`)
- **`CHAT_ID`** - Chat ID for tests that require a chat context
- **`ADMIN_CHAT_ID`** - Admin chat ID for admin-specific tests
- **`USER_CHAT_ID`** - User chat ID for user-specific tests

### Example: Running Tests with Environment Variables

```bash
# Windows PowerShell
$env:CHAT_ID="your-chat-id"; node tests/test-rag-queries.js

# Linux/Mac
CHAT_ID=your-chat-id node tests/test-rag-queries.js
```

## Test Dependencies

Some tests depend on others being run first:

1. **Chat-dependent tests** require `test-chat-management.js` to be run first to create chat sessions
2. **RAG tests** benefit from `test-document-ingestion.js` being run first to have documents available
3. **Profile-dependent tests** benefit from `test-user-profiles.js` being run first

The comprehensive test suite handles these dependencies automatically by running tests in the correct order.

## Test Output

Each test file provides:
- Section headers for organization
- Pass/fail indicators (✅/❌)
- Test details and error messages
- Summary statistics (total, passed, failed, duration, success rate)

## Adding New Tests

To add a new test file:

1. Create a new file following the naming pattern `test-*.js`
2. Import shared utilities from `test-utils.js`
3. Import shared data from `test-data.js` if needed
4. Export your test function
5. Add direct execution support (see existing files for pattern)
6. Import and call your test in `comprehensive-test.js`

Example structure:

```javascript
import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testMyFeature() {
  logSection('My Feature Tests');
  
  try {
    // Your test code
    logTest('Test Name', 'pass', 'Details');
  } catch (error) {
    logTest('Test Name', 'fail', error.message);
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-my-feature.js')) {
  const startTime = Date.now();
  resetTestStats();
  await testMyFeature();
  printTestSummary(startTime);
}
```

## Notes

- All tests use the shared `testStats` object for statistics
- Tests can be run in any order when run individually
- The comprehensive test resets statistics before running
- Individual tests maintain their own statistics when run independently

