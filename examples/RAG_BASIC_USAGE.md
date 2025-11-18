# RAG System - Basic Usage Guide

## Overview

The RAG (Retrieval-Augmented Generation) system allows you to:
1. **Ingest documents** into the knowledge base
2. **Query documents** using semantic search
3. **Get AI responses** augmented with retrieved context

## Quick Start

### 1. Start the Server

```bash
# Start Docker services (PostgreSQL + Neo4j)
npm run docker:up

# Start the API server
npm start
```

### 2. Basic Usage Pattern

```javascript
import { APIClient } from '../src/utils/APIClient.js';

const client = new APIClient('http://localhost:3000/api');

// Step 1: Create a chat session
const chat = await client.createChat('user', 'user123');
const chatId = chat.chat.chat_id;

// Step 2: Ingest a document
await client.ingestDocument(
  'Your document content here...',
  {
    title: 'Document Title',
    source: 'example',
    category: 'education',
  }
);

// Step 3: Query with RAG
const result = await client.query(
  chatId,
  'Your question here',
  null,
  {
    model: 'gemini-pro',
    useRAG: true,  // Enable RAG
  }
);

console.log('Response:', result.response);
console.log('Sources:', result.sources);
```

## Complete Example

### Ingesting Documents

```javascript
// Single document
const doc = await client.ingestDocument(
  `Machine Learning Basics

Machine learning is a subset of AI that enables systems to learn 
from data without explicit programming...`,
  {
    title: 'Machine Learning Basics',
    source: 'educational',
    category: 'ai',
  }
);

// Multiple documents
const documents = [
  { content: 'Document 1...', metadata: { title: 'Doc 1' } },
  { content: 'Document 2...', metadata: { title: 'Doc 2' } },
];

for (const doc of documents) {
  await client.ingestDocument(doc.content, doc.metadata);
}
```

### Querying with RAG

```javascript
// Basic RAG query
const result = await client.query(
  chatId,
  'What is machine learning?',
  null,
  {
    model: 'gemini-pro',
    useRAG: true,
  }
);

// Response includes:
// - result.response: AI-generated answer
// - result.sources: Array of retrieved documents
// - result.ragMetadata: Additional RAG metadata
```

### Query Options

```javascript
// RAG with specific model
await client.query(chatId, 'Your question', null, {
  model: 'gemini-1.5-pro',
  useRAG: true,
});

// RAG with hybrid search (vector + graph)
await client.query(chatId, 'Your question', null, {
  model: 'gemini-pro',
  useRAG: true,
  useGraph: true,  // Also search knowledge graph
});

// Query without RAG (for comparison)
await client.query(chatId, 'Your question', null, {
  model: 'gemini-pro',
  useRAG: false,  // No document retrieval
});
```

## How RAG Works

1. **Document Ingestion**:
   - Documents are split into chunks
   - Each chunk is converted to embeddings (vector representations)
   - Embeddings are stored in PostgreSQL with pgvector
   - Metadata is stored for retrieval

2. **Query Processing**:
   - User query is converted to an embedding
   - Semantic search finds similar document chunks
   - Retrieved chunks are used as context
   - LLM generates response using context + query

3. **Response**:
   - AI-generated answer based on retrieved context
   - Source documents with similarity scores
   - Metadata about retrieval process

## API Endpoints

### Ingest Document
```http
POST /api/ingest
Content-Type: application/json

{
  "content": "Document text...",
  "metadata": {
    "title": "Document Title",
    "source": "example",
    "category": "education"
  }
}
```

### Query with RAG
```http
POST /api/query
Content-Type: application/json

{
  "chatId": "chat-uuid",
  "prompt": "Your question",
  "options": {
    "model": "gemini-pro",
    "useRAG": true
  }
}
```

## Response Format

```json
{
  "success": true,
  "response": "AI-generated answer based on retrieved documents...",
  "sources": [
    {
      "doc_id": "doc-uuid",
      "title": "Document Title",
      "content": "Relevant chunk...",
      "similarity": 0.85
    }
  ],
  "ragMetadata": {
    "retrievalMethod": "vector",
    "documentsRetrieved": 5
  }
}
```

## Best Practices

1. **Document Quality**: 
   - Use clear, well-structured documents
   - Include relevant metadata (title, category, source)

2. **Query Formulation**:
   - Ask specific questions
   - Use natural language
   - Reference topics from ingested documents

3. **Chunking**:
   - Documents are automatically chunked
   - Larger documents = more chunks = better coverage

4. **Metadata**:
   - Add descriptive metadata for better organization
   - Use categories to group related documents

## Troubleshooting

### No documents found
- Make sure documents were ingested successfully
- Check that embeddings were generated
- Verify query is related to ingested content

### Poor results
- Try rephrasing the query
- Ingest more relevant documents
- Check document quality and relevance

### Server errors
- Verify server is running: `curl http://localhost:3000/api/health`
- Check database connections
- Verify API keys are set

## Example: Complete Workflow

```javascript
import { APIClient } from '../src/utils/APIClient.js';

async function ragWorkflow() {
  const client = new APIClient();
  
  // 1. Create chat
  const { chat } = await client.createChat('user', 'demo-user');
  
  // 2. Ingest documents
  await client.ingestDocument(
    'AI is transforming technology...',
    { title: 'AI Overview', category: 'technology' }
  );
  
  // 3. Query with RAG
  const result = await client.query(
    chat.chat_id,
    'How is AI transforming technology?',
    null,
    { model: 'gemini-pro', useRAG: true }
  );
  
  // 4. Display results
  console.log('Answer:', result.response);
  console.log('Sources:', result.sources.length);
  
  return result;
}

ragWorkflow();
```

## Next Steps

- Run `node examples/rag-usage-example.js` for a complete demonstration
- Check `examples/basic-usage.js` for more examples
- See `README.md` for full API documentation

