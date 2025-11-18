import { APIClient } from '../src/utils/APIClient.js';

/**
 * Simple test to verify API is working
 */
async function testAPI() {
  const client = new APIClient('http://localhost:3000/api');

  try {
    console.log('Testing Knowledge Base API...\n');

    // 1. Health check
    console.log('1. Health check...');
    const health = await client.healthCheck();
    console.log('   ✅', health);

    // 2. Check models
    console.log('\n2. Checking available models...');
    const models = await client.listModels();
    console.log('   Models:', models.models?.length || 0);
    console.log('   API Keys:', JSON.stringify(models.apiKeys, null, 2));

    // 3. Create user and chat
    console.log('\n3. Creating user and chat...');
    await client.updateUserProfile('test-user', { username: 'Test User' });
    const { chat } = await client.createChat('user', 'test-user');
    console.log('   ✅ Chat ID:', chat.chat_id);

    // 4. Simple query without RAG
    console.log('\n4. Testing simple query (no RAG)...');
    try {
      const result = await client.query(
        chat.chat_id,
        'Say hello',
        null,
        {
          model: 'gemini-pro',
          useRAG: false,
        }
      );
      console.log('   Response type:', typeof result.response);
      console.log('   Response:', result.response ? result.response.substring(0, 100) : 'UNDEFINED');
      console.log('   Full result keys:', Object.keys(result));
    } catch (error) {
      console.log('   ❌ Error:', error.message);
      console.log('   Stack:', error.stack);
    }

    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testAPI();

