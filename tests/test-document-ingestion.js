/**
 * Document Ingestion Tests
 * Can be run independently: node tests/test-document-ingestion.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, sleep, resetTestStats, printTestSummary } from './test-utils.js';
import { testDocuments } from './test-data.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testDocumentIngestion() {
  logSection('4. Document Ingestion Tests');

  const ingestedDocs = [];

  // Ingest single document
  try {
    const doc1 = await client.ingestDocument(
      testDocuments[0].content,
      testDocuments[0].metadata
    );
    if (doc1.doc_id) {
      ingestedDocs.push(doc1.doc_id);
      logTest('Ingest Single Document', 'pass', `Doc ID: ${doc1.doc_id}`);
    } else {
      logTest('Ingest Single Document', 'fail', 'No doc_id returned');
    }
  } catch (error) {
    logTest('Ingest Single Document', 'fail', error.message);
  }

  // Ingest multiple documents
  try {
    const promises = testDocuments.slice(1).map(doc =>
      client.ingestDocument(doc.content, doc.metadata)
    );
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.doc_id).length;
    results.forEach(r => {
      if (r.doc_id) ingestedDocs.push(r.doc_id);
    });
    logTest('Ingest Multiple Documents', 'pass', `${successCount}/${testDocuments.length - 1} ingested`);
  } catch (error) {
    logTest('Ingest Multiple Documents', 'fail', error.message);
  }

  // Wait for embeddings
  console.log('\n  ⏳ Waiting for embeddings to be processed...');
  await sleep(5000);

  // Test ingestion without content
  try {
    await client.ingestDocument('', { title: 'Empty' });
    logTest('Ingest Empty Document', 'fail', 'Should reject empty content');
  } catch (error) {
    logTest('Ingest Empty Document', 'pass', 'Correctly rejects empty content');
  }

  return ingestedDocs;
}

// Run independently if called directly
if (process.argv[1]?.includes('test-document-ingestion.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          DOCUMENT INGESTION TESTS                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  const result = await testDocumentIngestion();
  console.log('\n  📋 Test Results:');
  console.log(`     Documents ingested: ${result.length}`);
  printTestSummary(startTime);
}

