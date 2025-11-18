import { APIClient } from '../src/utils/APIClient.js';

/**
 * Working RAG Demo - Shows RAG system in action
 */
async function workingRAGDemo() {
  const client = new APIClient('http://localhost:3000/api');

  try {
    console.log('🔍 RAG System Demo\n');
    console.log('='.repeat(60));

    // 1. Setup
    console.log('\n📝 Step 1: Setting up user and chat...');
    await client.updateUserProfile('demo-user', {
      username: 'Demo User',
      email: 'demo@example.com',
    });
    const { chat } = await client.createChat('user', 'demo-user');
    const chatId = chat.chat_id;
    console.log('   ✅ User profile created');
    console.log('   ✅ Chat created:', chatId);

    // 2. Ingest document
    console.log('\n📚 Step 2: Ingesting document into knowledge base...');
    const docResult = await client.ingestDocument(
      `JavaScript Programming Language

JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.

Key Features:
- Dynamic typing and weak typing
- Prototype-based object orientation
- First-class functions
- Event-driven programming
- Asynchronous programming with Promises and async/await

JavaScript is used for:
- Front-end web development (React, Vue, Angular)
- Back-end development (Node.js)
- Mobile app development (React Native)
- Desktop applications (Electron)

The language has evolved significantly with ES6+ features including:
- Arrow functions
- Template literals
- Destructuring
- Classes and modules
- Async/await syntax`,
      {
        title: 'JavaScript Guide',
        source: 'programming-tutorial',
        category: 'programming',
      }
    );
    console.log('   ✅ Document ingested');
    console.log('   📄 Document ID:', docResult.doc_id || 'N/A');

    // Wait for embeddings to be processed
    console.log('\n⏳ Waiting for embeddings to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Query with RAG
    console.log('\n🔍 Step 3: Querying with RAG...');
    console.log('   Question: "What is JavaScript and what are its key features?"');
    
    const ragResult = await client.query(
      chatId,
      'What is JavaScript and what are its key features?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );

    console.log('\n   📤 Answer (with RAG - uses knowledge base):');
    if (ragResult.response) {
      const lines = ragResult.response.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          console.log('   ' + line);
        }
      });
    } else {
      console.log('   Response:', JSON.stringify(ragResult, null, 2));
    }

    console.log('\n   📎 Sources found:', ragResult.sources?.length || 0);
    if (ragResult.sources && ragResult.sources.length > 0) {
      ragResult.sources.forEach((source, idx) => {
        console.log(`   ${idx + 1}. ${source.title || source.doc_id || 'Document'}`);
        if (source.similarity) {
          console.log(`      Similarity: ${(source.similarity * 100).toFixed(1)}%`);
        }
      });
    }

    // 4. Query without RAG for comparison
    console.log('\n🔍 Step 4: Querying WITHOUT RAG (for comparison)...');
    console.log('   Question: "What is JavaScript?"');
    
    const noRAGResult = await client.query(
      chatId,
      'What is JavaScript?',
      null,
      {
        model: 'gemini-pro',
        useRAG: false,
      }
    );

    console.log('\n   📤 Answer (without RAG - general knowledge only):');
    if (noRAGResult.response) {
      const preview = noRAGResult.response.substring(0, 200);
      console.log('   ' + preview + (noRAGResult.response.length > 200 ? '...' : ''));
    } else {
      console.log('   Response:', JSON.stringify(noRAGResult, null, 2));
    }

    // 5. Show metadata
    console.log('\n📊 Step 5: Response Metadata');
    console.log('   Agents used:', ragResult.agentsUsed?.join(', ') || 'N/A');
    if (ragResult.ragMetadata) {
      console.log('   Retrieval method:', ragResult.ragMetadata.retrievalMethod || 'N/A');
      console.log('   Documents retrieved:', ragResult.ragMetadata.documentsRetrieved || 'N/A');
    }

    // 6. Another RAG query
    console.log('\n🔍 Step 6: Another RAG Query');
    console.log('   Question: "What are the uses of JavaScript?"');
    
    const query2 = await client.query(
      chatId,
      'What are the uses of JavaScript?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );

    console.log('\n   📤 Answer:');
    if (query2.response) {
      const lines = query2.response.split('\n').slice(0, 5);
      lines.forEach(line => {
        if (line.trim()) {
          console.log('   ' + line);
        }
      });
      if (query2.response.split('\n').length > 5) {
        console.log('   ...');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ RAG Demo Complete!');
    console.log('\n💡 Key Takeaways:');
    console.log('   • RAG retrieves relevant documents from your knowledge base');
    console.log('   • AI responses are augmented with retrieved context');
    console.log('   • Sources are provided for transparency');
    console.log('   • RAG provides more accurate, context-aware answers');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.error('\n💡 Make sure the server is running:');
      console.error('   1. Start Docker: npm run docker:up');
      console.error('   2. Start server: npm start');
    }
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      console.error('\n💡 Make sure GOOGLE_API_KEY is set:');
      console.error('   Windows: $env:GOOGLE_API_KEY="your_key"');
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Run the demo
workingRAGDemo();

