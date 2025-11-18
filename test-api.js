import { APIClient } from './src/utils/APIClient.js';

/**
 * Test script for Knowledge Base API
 */
async function testAPI() {
  const client = new APIClient('http://localhost:3000/api');

  console.log('🧪 Testing Knowledge Base API\n');
  console.log('='.repeat(60));

  try {
    // 1. Health check
    console.log('\n1. Health Check...');
    const health = await client.healthCheck();
    console.log('   ✅', JSON.stringify(health, null, 2));

    // 2. List models
    console.log('\n2. Available Models...');
    const models = await client.listModels();
    console.log('   Models:', models.models?.length || 0);
    console.log('   API Keys:', JSON.stringify(models.apiKeys, null, 2));

    // 3. Create user profile
    console.log('\n3. Creating User Profile...');
    const profile = await client.updateUserProfile('test-user', {
      username: 'Test User',
      email: 'test@example.com',
    });
    console.log('   ✅ Profile created:', profile.profile.user_id);

    // 4. Create chat
    console.log('\n4. Creating Chat Session...');
    const chat = await client.createChat('user', 'test-user', {
      description: 'Test session',
    });
    console.log('   ✅ Chat created:', chat.chat.chat_id);
    const chatId = chat.chat.chat_id;

    // 5. Simple query (no RAG)
    console.log('\n5. Testing Simple Query...');
    const query1 = await client.query(
      chatId,
      'Say hello in one sentence',
      null,
      {
        model: 'gemini-pro',
        useRAG: false,
      }
    );
    console.log('   ✅ Query successful');
    console.log('   Response:', query1.response?.substring(0, 100) || 'No response');
    console.log('   Agents used:', query1.agentsUsed?.join(', ') || 'N/A');

    // 6. Ingest document
    console.log('\n6. Ingesting Document...');
    const doc = await client.ingestDocument(
      'This is a test document about artificial intelligence and machine learning.',
      {
        title: 'Test Document',
        source: 'test',
        category: 'testing',
      }
    );
    console.log('   ✅ Document ingested:', doc.doc_id || 'N/A');

    // Wait for embeddings
    console.log('\n   ⏳ Waiting for embeddings...');
    await new Promise(r => setTimeout(r, 3000));

    // 7. Query with RAG
    console.log('\n7. Testing RAG Query...');
    const ragQuery = await client.query(
      chatId,
      'What is artificial intelligence?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );
    console.log('   ✅ RAG query successful');
    console.log('   Response:', ragQuery.response?.substring(0, 150) || 'No response');
    console.log('   Sources found:', ragQuery.sources?.length || 0);

    // 8. Get chat history
    console.log('\n8. Getting Chat History...');
    const history = await client.getChatHistory(chatId, 5);
    console.log('   ✅ History retrieved:', history.history?.length || 0, 'messages');

    // 9. Graph stats
    console.log('\n9. Getting Graph Statistics...');
    const stats = await client.getGraphStats();
    console.log('   ✅ Graph stats:', JSON.stringify(stats.stats, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Health check: ✅');
    console.log('   - Models: ✅');
    console.log('   - User profile: ✅');
    console.log('   - Chat creation: ✅');
    console.log('   - Simple query: ✅');
    console.log('   - Document ingestion: ✅');
    console.log('   - RAG query: ✅');
    console.log('   - Chat history: ✅');
    console.log('   - Graph stats: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testAPI();

