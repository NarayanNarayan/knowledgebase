# Quick RAG Example

## Basic Usage

```javascript
import { APIClient } from '../src/utils/APIClient.js';

const client = new APIClient('http://localhost:3000/api');

// 1. Setup
await client.updateUserProfile('user123', { username: 'User' });
const { chat } = await client.createChat('user', 'user123');

// 2. Ingest document
await client.ingestDocument(
  'Your document content here...',
  { title: 'Document Title', source: 'example' }
);

// 3. Query with RAG
const result = await client.query(
  chat.chat_id,
  'Your question here',
  null,
  { model: 'gemini-pro', useRAG: true }
);

// 4. Display results
console.log('Answer:', result.response);
console.log('Sources:', result.sources);
```

## Run Examples

```bash
# Working RAG demo
node examples/working-rag-demo.js

# Basic usage (includes RAG)
node examples/basic-usage.js

# Simple demo
node examples/simple-rag-demo.js
```

## Expected Response

```json
{
  "success": true,
  "response": "AI answer based on your documents...",
  "sources": [
    {
      "doc_id": "uuid",
      "title": "Document Title",
      "similarity": 0.85
    }
  ],
  "agentsUsed": ["RAG_AGENT"]
}
```

## Documentation

- `RAG_BASIC_USAGE.md` - Detailed guide
- `RAG_USAGE_SUMMARY.md` - Quick reference
- `rag-example-output.md` - Expected output examples

