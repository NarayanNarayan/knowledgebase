# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with pgvector
- Neo4j 5+
- At least one AI API key (Google/OpenAI/Anthropic)

## Installation

```bash
# 1. Install dependencies
cd knowledgeBase
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Initialize PostgreSQL
psql -U postgres -d knowledgebase -f database-setup.sql
```

## Configuration

Edit `.env`:

```env
# Required: Add at least one
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
POSTGRES_URI=postgresql://postgres:postgres@localhost:5432/knowledgebase

# Server
PORT=3000
```

## Start Servers

```bash
# API Server
npm start

# MCP Server (separate terminal)
npm run mcp:start
```

## First Request

```bash
# Health check
curl http://localhost:3000/api/health

# Create user profile
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "username": "John Doe",
    "email": "john@example.com"
  }'

# Create chat
curl -X POST http://localhost:3000/api/chat/create \
  -H "Content-Type: application/json" \
  -d '{
    "chatType": "user",
    "userId": "user123"
  }'

# Query (use chatId from previous response)
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "prompt": "Hello, what can you help me with?",
    "options": {
      "model": "gemini-pro"
    }
  }'
```

## JavaScript Example

```javascript
import { APIClient } from './src/utils/APIClient.js';

const client = new APIClient();

// 1. Create profile
await client.updateUserProfile('user123', {
  username: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});

// 2. Create chat
const { chat } = await client.createChat('admin', 'user123');

// 3. Ingest document
await client.ingestDocument(
  'Your document content here...',
  { title: 'My Document', source: 'manual' }
);

// 4. Query with RAG
const result = await client.query(
  chat.chat_id,
  'What documents do I have?',
  null,
  { useRAG: true }
);

console.log(result.response);
```

## Python Example

```python
import requests

# Create profile
requests.post('http://localhost:3000/api/profile', json={
    'userId': 'user123',
    'username': 'John Doe',
    'email': 'john@example.com'
})

# Create chat
chat = requests.post('http://localhost:3000/api/chat/create', json={
    'chatType': 'user',
    'userId': 'user123'
}).json()

# Query
result = requests.post('http://localhost:3000/api/query', json={
    'chatId': chat['chat']['chat_id'],
    'prompt': 'Hello!',
    'options': {'model': 'gemini-pro'}
}).json()

print(result['response'])
```

## MCP Setup (Claude Desktop)

1. Edit Claude config:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add:
```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": ["/absolute/path/to/knowledgeBase/mcp-server.js"],
      "env": {
        "GOOGLE_API_KEY": "your_key",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "password",
        "POSTGRES_URI": "postgresql://postgres:postgres@localhost:5432/knowledgebase"
      }
    }
  }
}
```

3. Restart Claude Desktop

## Key Concepts

### Chat Types
- **admin**: Full access (read/write/modify/delete)
- **user**: Read-only access

### User Profiles
- Stored permanently in PostgreSQL
- Auto-injected into chat context
- Fields: username, email, phone, address, preferences, custom fields

### Chat History
- All messages stored
- Automatically loaded for context
- Includes metadata (agents used, tools used)

### Multi-Model Support
- Google Gemini: `gemini-pro`, `gemini-1.5-pro`, `gemini-1.5-flash`
- OpenAI: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`
- Anthropic: `claude-3-opus`, `claude-3-sonnet`, `claude-3-5-sonnet`, `claude-3-haiku`

## Common Tasks

### Store User Info
```javascript
await client.updateUserProfile('user123', {
  username: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1-555-0123',
  address: '123 Main St',
  preferences: { theme: 'dark', language: 'en' },
  customFields: { department: 'Engineering' }
});
```

### Create Admin Chat (Full Access)
```javascript
const { chat } = await client.createChat('admin', 'user123');
// Can modify graph, files, profiles
```

### Create User Chat (Read-Only)
```javascript
const { chat } = await client.createChat('user', 'user123');
// Can only read data
```

### Ingest Document
```javascript
await client.ingestDocument(
  'Document content...',
  {
    title: 'My Document',
    source: 'https://example.com',
    category: 'research'
  }
);
```

### Query with RAG
```javascript
const result = await client.query(
  chatId,
  'What is machine learning?',
  null,
  { useRAG: true, model: 'gemini-pro' }
);
```

### Process Data
```javascript
const result = await client.query(
  chatId,
  'Calculate the average',
  [10, 20, 30, 40, 50],
  { processData: true }
);
```

### Graph Query
```javascript
const result = await client.query(
  chatId,
  'Find entities related to AI',
  null,
  { useGraph: true }
);
```

## Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/models` | List models |
| POST | `/api/chat/create` | Create chat |
| GET | `/api/chat/:id` | Get chat |
| GET | `/api/chat/:id/history` | Chat history |
| POST | `/api/query` | Query (with chat) |
| POST | `/api/query/direct` | Query (no chat) |
| POST | `/api/ingest` | Ingest document |
| POST | `/api/profile` | Upsert profile |
| GET | `/api/profile/:userId` | Get profile |
| GET | `/api/knowledge/:id` | Get entity |
| GET | `/api/stats/graph` | Graph stats |

## Troubleshooting

### Server won't start
```bash
# Check ports
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows

# Check databases
psql -U postgres -d knowledgebase -c "SELECT 1"
curl http://localhost:7474  # Neo4j browser
```

### No models available
```bash
# Verify API key
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_API_KEY)"

# Check /api/models endpoint
curl http://localhost:3000/api/models
```

### Permission denied
- Use admin chat for write operations
- Use user chat for read operations
- Check chat type in error message

### Database errors
```bash
# PostgreSQL
psql -U postgres -d knowledgebase -f database-setup.sql

# Neo4j
# Visit http://localhost:7474 and verify connection
```

## Next Steps

1. ✅ Run `node examples/basic-usage.js` for full example
2. ✅ Read [README.md](README.md) for detailed documentation
3. ✅ Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. ✅ See [INSTALL.md](INSTALL.md) for detailed setup
5. ✅ Review integration examples for v1/v2

## Support

- Check logs in terminal
- Verify database connections
- Confirm API keys are valid
- Review error messages

---

**You're ready to go! 🚀**

Start with: `npm start` → `node examples/basic-usage.js`

