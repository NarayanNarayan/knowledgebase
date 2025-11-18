import { APIClient } from '../src/utils/APIClient.js';

/**
 * Simple RAG Demo - Shows basic RAG usage
 */
async function simpleRAGDemo() {
  const client = new APIClient('http://localhost:3000/api');

  try {
    console.log('🔍 Simple RAG Demo\n');

    // 1. Create user and chat
    console.log('1. Setting up...');
    await client.updateUserProfile('demo', { username: 'Demo User' });
    const { chat } = await client.createChat('user', 'demo');
    console.log('   ✅ Chat ready:', chat.chat_id);

    // 2. Ingest a document
    console.log('\n2. Ingesting document...');
    const doc = await client.ingestDocument(
      `Python Programming Basics

Python is a high-level programming language known for its simplicity and readability.
It supports multiple programming paradigms including procedural, object-oriented, and functional programming.

Key features:
- Simple syntax that's easy to learn
- Extensive standard library
- Large ecosystem of third-party packages
- Great for data science, web development, and automation

Python uses indentation to define code blocks, making it very readable.`,
      { title: 'Python Basics', source: 'demo' }
    );
    console.log('   ✅ Document ingested:', doc.doc_id);

    // Wait for embeddings
    await new Promise(r => setTimeout(r, 2000));

    // 3. Query with RAG
    console.log('\n3. Querying with RAG...');
    console.log('   Question: "What is Python?"');
    const result = await client.query(
      chat.chat_id,
      'What is Python?',
      null,
      { model: 'gemini-pro', useRAG: true }
    );

    console.log('\n   📤 Answer:');
    console.log('   ' + result.response.split('\n').join('\n   '));
    console.log('\n   📎 Sources:', result.sources?.length || 0, 'document(s) found');

    // 4. Compare with non-RAG
    console.log('\n4. Querying WITHOUT RAG (for comparison)...');
    const noRAG = await client.query(
      chat.chat_id,
      'What is Python?',
      null,
      { model: 'gemini-pro', useRAG: false }
    );
    console.log('   📤 Answer (no knowledge base):');
    console.log('   ' + noRAG.response.substring(0, 150) + '...');

    console.log('\n✅ Demo complete!');
    console.log('\n💡 Notice how RAG uses your ingested documents to provide context-aware answers!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   💡 Start server: npm start');
    }
  }
}

simpleRAGDemo();

