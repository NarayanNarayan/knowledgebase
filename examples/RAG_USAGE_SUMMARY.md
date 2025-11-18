# RAG System - Basic Usage Summary

## What is RAG?

**RAG (Retrieval-Augmented Generation)** combines:
- **Retrieval**: Semantic search to find relevant documents
- **Augmentation**: Using retrieved documents as context
- **Generation**: AI generates answers based on context + query

## Basic Workflow

### 1. Setup

```javascript
import { APIClient } from '../src/utils/APIClient.js';

const client = new APIClient('http://localhost:3000/api');
```

### 2. Create User Profile & Chat

```javascript
// Create user profile (required before creating chat)
await client.updateUserProfile('user123', {
  username: 'John Doe',
  email: 'john@example.com',
});

// Create chat session
const { chat } = await client.createChat('user', 'user123');
const chatId = chat.chat_id;
```

### 3. Ingest Documents

```javascript
// Ingest a single document
const result = await client.ingestDocument(
  `Your document content here. This will be split into chunks,
   converted to embeddings, and stored in the vector database.`,
  {
    title: 'Document Title',
    source: 'example',
    category: 'education',
  }
);

// Ingest multiple documents
const documents = [
  {
    content: 'First document content...',
    metadata: { title: 'Doc 1', category: 'tech' }
  },
  {
    content: 'Second document content...',
    metadata: { title: 'Doc 2', category: 'science' }
  },
];

for (const doc of documents) {
  await client.ingestDocument(doc.content, doc.metadata);
}
```

### 4. Query with RAG

```javascript
// Basic RAG query
const result = await client.query(
  chatId,
  'What is machine learning?',
  null,  // No data to process
  {
    model: 'gemini-pro',
    useRAG: true,  // Enable RAG
  }
);

// Access results
console.log('Answer:', result.response);
console.log('Sources:', result.sources);
console.log('Agents used:', result.agentsUsed);
```

## Complete Example

```javascript
import { APIClient } from '../src/utils/APIClient.js';

async function ragExample() {
  const client = new APIClient();

  // 1. Setup
  await client.updateUserProfile('demo', { username: 'Demo' });
  const { chat } = await client.createChat('user', 'demo');
  
  // 2. Ingest document
  await client.ingestDocument(
    `Machine Learning is a subset of AI that enables systems 
     to learn from data without explicit programming.`,
    { title: 'ML Basics', source: 'demo' }
  );
  
  // Wait for embeddings (optional, but recommended)
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Query with RAG
  const result = await client.query(
    chat.chat_id,
    'What is machine learning?',
    null,
    { model: 'gemini-pro', useRAG: true }
  );
  
  console.log('Answer:', result.response);
  console.log('Sources:', result.sources?.length || 0);
  
  return result;
}

ragExample();
```

## Response Structure

```javascript
{
  success: true,
  response: "AI-generated answer based on retrieved documents...",
  sources: [
    {
      doc_id: "uuid",
      title: "Document Title",
      content: "Relevant chunk...",
      similarity: 0.85
    }
  ],
  agentsUsed: ["RAG_AGENT"],
  ragMetadata: {
    retrievalMethod: "vector",
    documentsRetrieved: 5
  }
}
```

## Query Options

| Option | Description | Default |
|--------|-------------|---------|
| `useRAG` | Enable RAG retrieval | `false` |
| `model` | AI model to use | `gemini-pro` |
| `useGraph` | Also search knowledge graph | `false` |
| `useHybrid` | Use hybrid search (vector + graph) | `true` (if useRAG) |

## API Endpoints

### Ingest Document
```http
POST /api/ingest
{
  "content": "Document text...",
  "metadata": {
    "title": "Title",
    "source": "source",
    "category": "category"
  }
}
```

### Query with RAG
```http
POST /api/query
{
  "chatId": "chat-uuid",
  "prompt": "Your question",
  "options": {
    "model": "gemini-pro",
    "useRAG": true
  }
}
```

## How It Works

1. **Document Ingestion**:
   ```
   Document → Split into chunks → Generate embeddings → Store in PostgreSQL
   ```

2. **Query Processing**:
   ```
   Query → Generate embedding → Vector search → Retrieve top chunks → Build context
   ```

3. **Response Generation**:
   ```
   Context + Query → LLM → Answer + Sources
   ```

## Best Practices

1. **Document Quality**:
   - Use clear, well-structured text
   - Add descriptive metadata
   - Group related documents with categories

2. **Query Formulation**:
   - Ask specific questions
   - Reference topics from your documents
   - Use natural language

3. **Chunking**:
   - Documents are auto-chunked
   - Larger documents = more chunks = better coverage
   - Optimal chunk size: 200-500 tokens

4. **Metadata**:
   - Always include `title` and `source`
   - Use `category` for organization
   - Add custom fields as needed

## Troubleshooting

### No documents found
- Verify documents were ingested: Check server logs
- Wait a few seconds after ingestion for embeddings
- Ensure query relates to ingested content

### Poor results
- Ingest more relevant documents
- Try rephrasing the query
- Check document quality and relevance

### Server not responding
```bash
# Check server status
curl http://localhost:3000/api/health

# Verify databases
docker-compose ps
```

## Running Examples

```bash
# Run basic usage example
node examples/basic-usage.js

# Run RAG-specific example
node examples/rag-usage-example.js

# Run simple demo
node examples/simple-rag-demo.js
```

## Key Files

- `src/agents/RAGAgent.js` - RAG agent implementation
- `src/services/IngestionService.js` - Document ingestion
- `src/storage/PostgresService.js` - Vector storage
- `src/utils/APIClient.js` - API client for examples

## Next Steps

1. Run `node examples/basic-usage.js` for full examples
2. Check `README.md` for complete API documentation
3. See `RAG_BASIC_USAGE.md` for detailed guide

