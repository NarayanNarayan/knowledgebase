import { APIClient } from '../src/utils/APIClient.js';

/**
 * Basic usage examples for the AI Knowledge Base
 * 
 * Prerequisites:
 * 1. Start Docker services: npm run docker:up (or docker-compose up -d)
 * 2. Start the API server: npm start
 * 3. Ensure your .env file has API keys configured
 * 
 * Docker services required:
 * - PostgreSQL with pgvector (port 5432)
 * - Neo4j (ports 7474, 7687)
 */

async function main() {
  const client = new APIClient('http://localhost:3000/api');

  try {
    // 1. Check health
    console.log('1. Checking server health...');
    const health = await client.healthCheck();
    console.log('Health:', health);

    // 2. List available models
    console.log('\n2. Listing available models...');
    const models = await client.listModels();
    console.log('Models:', JSON.stringify(models, null, 2));

    // 3. Create user profile
    console.log('\n3. Creating user profile...');
    const profile = await client.updateUserProfile('user123', {
      username: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      address: '123 Main Street, Springfield',
      preferences: {
        theme: 'dark',
        language: 'en',
      },
      customFields: {
        department: 'Engineering',
        role: 'Developer',
      },
    });
    console.log('Profile created:', profile);

    // 4. Create admin chat
    console.log('\n4. Creating admin chat...');
    const adminChat = await client.createChat('admin', 'user123', {
      description: 'Admin session for testing',
    });
    console.log('Admin chat created:', adminChat);

    // 5. Create user chat
    console.log('\n5. Creating user chat...');
    const userChat = await client.createChat('user', 'user123', {
      description: 'Regular user session',
    });
    console.log('User chat created:', userChat);

    // 6. Ingest a document
    console.log('\n6. Ingesting document...');
    const doc = await client.ingestDocument(
      `Machine Learning Basics
      
      Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves.
      
      Key concepts include:
      - Supervised Learning: Learning from labeled data
      - Unsupervised Learning: Finding patterns in unlabeled data
      - Reinforcement Learning: Learning through trial and error
      
      Popular algorithms include linear regression, decision trees, neural networks, and support vector machines.`,
      {
        title: 'Machine Learning Basics',
        source: 'example',
        category: 'education',
      }
    );
    console.log('Document ingested:', doc);

    // 7. Query with RAG (user chat - read only)
    console.log('\n7. Querying with RAG...');
    const ragResult = await client.query(
      userChat.chat.chat_id,
      'What is machine learning?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );
    console.log('RAG Response:', ragResult.response);
    console.log('Sources:', ragResult.sources);

    // 8. Query with user profile context
    console.log('\n8. Querying with user profile...');
    const profileResult = await client.query(
      userChat.chat.chat_id,
      'What is my email address?',
      null,
      {
        model: 'gemini-pro',
      }
    );
    console.log('Profile Response:', profileResult.response);

    // 9. Process data programmatically
    console.log('\n9. Processing data...');
    const dataResult = await client.query(
      userChat.chat.chat_id,
      'Calculate the sum of these numbers',
      [10, 20, 30, 40, 50],
      {
        processData: true,
      }
    );
    console.log('Data Processing Response:', dataResult.response);

    // 10. Get chat history
    console.log('\n10. Getting chat history...');
    const history = await client.getChatHistory(userChat.chat.chat_id, 10);
    console.log('Chat history:', JSON.stringify(history, null, 2));

    // 11. Admin operation - would work with admin chat
    console.log('\n11. Admin operation (creating graph entity)...');
    try {
      const adminResult = await client.query(
        adminChat.chat.chat_id,
        'Create an entity for "Machine Learning" in the knowledge graph',
        null,
        {
          useGraph: true,
        }
      );
      console.log('Admin Response:', adminResult.response);
    } catch (error) {
      console.log('Admin operation (expected to work with admin chat):', error.message);
    }

    // 12. Graph statistics
    console.log('\n12. Getting graph statistics...');
    const stats = await client.getGraphStats();
    console.log('Graph stats:', stats);

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;

