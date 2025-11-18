import { APIClient } from '../src/utils/APIClient.js';

/**
 * RAG (Retrieval-Augmented Generation) System Usage Example
 * 
 * This demonstrates how to use the RAG system to:
 * 1. Ingest documents into the knowledge base
 * 2. Query documents using semantic search
 * 3. Get AI responses augmented with retrieved context
 * 
 * Prerequisites:
 * - Server running: npm start
 * - Docker services running: npm run docker:up
 * - GOOGLE_API_KEY set (for embeddings and LLM)
 */

async function demonstrateRAG() {
  const client = new APIClient('http://localhost:3000/api');

  try {
    console.log('🔍 RAG System Usage Example\n');
    console.log('='.repeat(60));

    // Step 1: Create user profile and chat session
    console.log('\n📝 Step 1: Creating user profile and chat session...');
    await client.updateUserProfile('rag-demo-user', {
      username: 'RAG Demo User',
      email: 'rag-demo@example.com',
    });
    console.log('✅ User profile created');
    
    const chat = await client.createChat('user', 'rag-demo-user', {
      description: 'RAG demonstration session',
    });
    const chatId = chat.chat.chat_id;
    console.log('✅ Chat created:', chatId);

    // Step 2: Ingest multiple documents
    console.log('\n📚 Step 2: Ingesting documents into knowledge base...');
    
    const documents = [
      {
        content: `Artificial Intelligence Fundamentals

Artificial Intelligence (AI) is the simulation of human intelligence in machines. 
AI systems are designed to think and learn like humans. The goal of AI is to create 
systems that can perform tasks that typically require human intelligence.

Key areas of AI include:
- Machine Learning: Systems that learn from data
- Natural Language Processing: Understanding and generating human language
- Computer Vision: Interpreting visual information
- Robotics: Creating intelligent machines that can interact with the physical world

AI applications are everywhere: virtual assistants, recommendation systems, 
autonomous vehicles, and medical diagnosis systems.`,
        metadata: {
          title: 'AI Fundamentals',
          source: 'educational',
          category: 'artificial-intelligence',
          topic: 'basics',
        },
      },
      {
        content: `Machine Learning Explained

Machine Learning is a subset of AI that enables computers to learn and make 
decisions from data without being explicitly programmed. Instead of following 
pre-programmed instructions, ML algorithms build mathematical models based on 
training data.

Types of Machine Learning:
1. Supervised Learning: Learning from labeled examples (e.g., spam detection)
2. Unsupervised Learning: Finding patterns in unlabeled data (e.g., clustering)
3. Reinforcement Learning: Learning through trial and error (e.g., game playing)

Popular algorithms include neural networks, decision trees, support vector machines, 
and k-means clustering. ML powers recommendation engines, fraud detection, 
image recognition, and predictive analytics.`,
        metadata: {
          title: 'Machine Learning Guide',
          source: 'educational',
          category: 'machine-learning',
          topic: 'algorithms',
        },
      },
      {
        content: `Deep Learning and Neural Networks

Deep Learning uses artificial neural networks with multiple layers to learn 
complex patterns in data. These networks are inspired by the human brain's 
neural structure.

Key concepts:
- Neural Networks: Interconnected nodes (neurons) that process information
- Deep Neural Networks: Networks with many hidden layers
- Training: Process of adjusting weights to minimize error
- Backpropagation: Algorithm for training neural networks

Applications include:
- Image and speech recognition
- Natural language processing and translation
- Autonomous driving
- Medical image analysis
- Generative AI (creating new content)

Deep learning has revolutionized fields like computer vision and NLP, enabling 
breakthroughs in accuracy and capability.`,
        metadata: {
          title: 'Deep Learning Overview',
          source: 'educational',
          category: 'deep-learning',
          topic: 'neural-networks',
        },
      },
      {
        content: `Natural Language Processing (NLP)

NLP is a branch of AI that helps computers understand, interpret, and generate 
human language. It combines computational linguistics with machine learning 
and deep learning.

Core tasks:
- Text classification and sentiment analysis
- Named entity recognition
- Machine translation
- Question answering
- Text summarization
- Chatbots and conversational AI

Modern NLP uses transformer models like BERT, GPT, and T5. These models can 
understand context, generate human-like text, and perform complex language tasks.

NLP applications include virtual assistants, language translation services, 
content moderation, and automated customer support.`,
        metadata: {
          title: 'NLP Guide',
          source: 'educational',
          category: 'nlp',
          topic: 'language-processing',
        },
      },
    ];

    console.log(`Ingesting ${documents.length} documents...`);
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const result = await client.ingestDocument(doc.content, doc.metadata);
      console.log(`  ✅ Document ${i + 1}: ${doc.metadata.title} (ID: ${result.doc_id})`);
    }

    // Wait a moment for embeddings to be processed
    console.log('\n⏳ Waiting for embeddings to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Basic RAG Query
    console.log('\n🔍 Step 3: Basic RAG Query');
    console.log('Query: "What is machine learning?"');
    const basicRAG = await client.query(
      chatId,
      'What is machine learning?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );
    console.log('\n📤 Response:');
    console.log(basicRAG.response);
    console.log('\n📎 Sources found:', basicRAG.sources?.length || 0);
    if (basicRAG.sources && basicRAG.sources.length > 0) {
      basicRAG.sources.forEach((source, idx) => {
        console.log(`  ${idx + 1}. ${source.title || source.doc_id} (similarity: ${source.similarity?.toFixed(3) || 'N/A'})`);
      });
    }

    // Step 4: RAG with specific topic
    console.log('\n🔍 Step 4: RAG Query - Specific Topic');
    console.log('Query: "Explain neural networks"');
    const neuralNetQuery = await client.query(
      chatId,
      'Explain neural networks and how they work',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );
    console.log('\n📤 Response:');
    console.log(neuralNetQuery.response);
    console.log('\n📎 Sources:', neuralNetQuery.sources?.length || 0);

    // Step 5: RAG with comparison query
    console.log('\n🔍 Step 5: RAG Query - Comparison');
    console.log('Query: "What is the difference between AI and machine learning?"');
    const comparisonQuery = await client.query(
      chatId,
      'What is the difference between AI and machine learning?',
      null,
      {
        model: 'gemini-pro',
        useRAG: true,
      }
    );
    console.log('\n📤 Response:');
    console.log(comparisonQuery.response);
    console.log('\n📎 Sources:', comparisonQuery.sources?.length || 0);

    // Step 6: Query without RAG (for comparison)
    console.log('\n🔍 Step 6: Query WITHOUT RAG (for comparison)');
    console.log('Query: "What is machine learning?"');
    const noRAG = await client.query(
      chatId,
      'What is machine learning?',
      null,
      {
        model: 'gemini-pro',
        useRAG: false,
      }
    );
    console.log('\n📤 Response (no knowledge base context):');
    console.log(noRAG.response.substring(0, 200) + '...');
    console.log('\n💡 Notice: This response doesn\'t use the ingested documents');

    // Step 7: Show chat history
    console.log('\n📜 Step 7: Chat History');
    const history = await client.getChatHistory(chatId, 10);
    console.log(`Total messages: ${history.history.length}`);
    history.history.forEach((msg, idx) => {
      const preview = msg.content.substring(0, 80);
      console.log(`  ${idx + 1}. [${msg.role}] ${preview}${msg.content.length > 80 ? '...' : ''}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ RAG System Demonstration Complete!');
    console.log('\n💡 Key Takeaways:');
    console.log('  - Documents are ingested and converted to embeddings');
    console.log('  - Queries use semantic search to find relevant documents');
    console.log('  - AI responses are augmented with retrieved context');
    console.log('  - Sources are provided for transparency');
    console.log('  - RAG provides more accurate, context-aware responses');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the server is running: npm start');
    }
    if (error.message.includes('API key')) {
      console.error('\n💡 Make sure GOOGLE_API_KEY is set in environment variables');
    }
    console.error('Stack:', error.stack);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRAG();
}

export default demonstrateRAG;

