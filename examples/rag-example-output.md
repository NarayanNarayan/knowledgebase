# RAG System - Example Output

## Expected Response Format

When you run a RAG query, you should receive a response like this:

```json
{
  "success": true,
  "response": "AI-generated answer based on retrieved documents...",
  "sources": [
    {
      "doc_id": "document-uuid",
      "title": "Document Title",
      "content": "Relevant document chunk...",
      "similarity": 0.85
    }
  ],
  "agentsUsed": ["RAG_AGENT"],
  "toolsUsed": [],
  "ragMetadata": {
    "retrievalMethod": "vector",
    "documentsRetrieved": 5
  }
}
```

## Complete Working Example

```javascript
import { APIClient } from '../src/utils/APIClient.js';

async function ragExample() {
  const client = new APIClient('http://localhost:3000/api');

  // 1. Setup
  await client.updateUserProfile('user123', {
    username: 'John Doe',
    email: 'john@example.com',
  });
  
  const { chat } = await client.createChat('user', 'user123');
  const chatId = chat.chat_id;

  // 2. Ingest document
  await client.ingestDocument(
    `Machine Learning Basics

Machine learning is a subset of AI that enables systems to learn 
from data without explicit programming.`,
    {
      title: 'ML Basics',
      source: 'tutorial',
      category: 'education',
    }
  );

  // Wait for embeddings
  await new Promise(r => setTimeout(r, 2000));

  // 3. Query with RAG
  const result = await client.query(
    chatId,
    'What is machine learning?',
    null,
    {
      model: 'gemini-pro',
      useRAG: true,
    }
  );

  // 4. Display results
  console.log('Answer:', result.response);
  console.log('Sources:', result.sources);
  console.log('Agents:', result.agentsUsed);
}

ragExample();
```

## Expected Console Output

```
🔍 RAG System Demo
============================================================

📝 Step 1: Setting up user and chat...
   ✅ User profile created
   ✅ Chat created: abc123-def456-...

📚 Step 2: Ingesting document into knowledge base...
   ✅ Document ingested
   📄 Document ID: doc-xyz-789

⏳ Waiting for embeddings to be processed...

🔍 Step 3: Querying with RAG...
   Question: "What is machine learning?"

   📤 Answer (with RAG - uses knowledge base):
   Machine learning is a subset of artificial intelligence that enables 
   systems to learn and improve from experience without being explicitly 
   programmed. Based on the documents in the knowledge base, machine 
   learning focuses on developing computer programs that can access data 
   and use it to learn for themselves.

   📎 Sources found: 1
   1. ML Basics
      Similarity: 87.5%

🔍 Step 4: Querying WITHOUT RAG (for comparison)...
   Question: "What is machine learning?"

   📤 Answer (without RAG - general knowledge only):
   Machine learning is a method of data analysis that automates analytical 
   model building. It is a branch of artificial intelligence based on the 
   idea that systems can learn from data, identify patterns and make decisions...

📊 Step 5: Response Metadata
   Agents used: RAG_AGENT
   Retrieval method: vector
   Documents retrieved: 1

============================================================
✅ RAG Demo Complete!
```

## Key Differences: RAG vs Non-RAG

### With RAG (`useRAG: true`)
- ✅ Uses your ingested documents as context
- ✅ Provides source citations
- ✅ More accurate for domain-specific questions
- ✅ Can answer questions about your specific content

### Without RAG (`useRAG: false`)
- ❌ Uses only general knowledge
- ❌ No source citations
- ❌ May not know about your specific documents
- ✅ Faster response (no retrieval step)

## Troubleshooting

If you see errors:

1. **"Cannot read properties of undefined"**
   - Check server logs for detailed error
   - Verify GOOGLE_API_KEY is set
   - Ensure databases are running

2. **"No documents found"**
   - Wait a few seconds after ingestion
   - Verify document was ingested successfully
   - Check that query relates to ingested content

3. **"Chat not found"**
   - Create chat session first
   - Use correct chatId from createChat response

## API Usage

### Using curl

```bash
# Ingest document
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your document content...",
    "metadata": {"title": "Doc Title"}
  }'

# Query with RAG
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "your-chat-id",
    "prompt": "Your question",
    "options": {
      "model": "gemini-pro",
      "useRAG": true
    }
  }'
```

### Using JavaScript/Node.js

```javascript
const client = new APIClient('http://localhost:3000/api');

// Ingest
await client.ingestDocument(content, metadata);

// Query
const result = await client.query(chatId, prompt, null, {
  model: 'gemini-pro',
  useRAG: true,
});
```

## Next Steps

1. Run the examples:
   ```bash
   node examples/working-rag-demo.js
   node examples/basic-usage.js
   ```

2. Check documentation:
   - `README.md` - Full API documentation
   - `RAG_BASIC_USAGE.md` - Detailed RAG guide
   - `RAG_USAGE_SUMMARY.md` - Quick reference

