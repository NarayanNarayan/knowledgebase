# AI Knowledge Base System

A comprehensive AI helper and knowledge base system built with LangChain.js, featuring multi-model support, Neo4j graph database, PostgreSQL with pgvector for RAG, and Model Context Protocol (MCP) server.

## Features

- 🤖 **Multi-Agent System**: Router, RAG, Knowledge Graph, and Data Processing agents
- 🧠 **Multi-Model Support**: Google Gemini, OpenAI, Anthropic Claude
- 📊 **Hybrid Storage**: Neo4j knowledge graph + PostgreSQL vector store
- 🔒 **Permission System**: Admin and user chat types with different access levels
- 💬 **Multi-Chat Support**: Separate chat sessions with persistent history
- 👤 **User Profiles**: Store and utilize user information (name, email, address, etc.)
- 🔌 **MCP Server**: Expose tools to Claude Desktop and other MCP clients
- 📁 **File System Access**: Read/write files with permission controls
- 🔍 **Advanced Search**: Semantic similarity + graph context

## Architecture

### Core Components

1. **Storage Layer**
   - PostgreSQL: User profiles, chat history, documents, vector embeddings
   - Neo4j: Knowledge graph with entities and relationships

2. **Agent System**
   - Router Agent: Analyzes requests and routes to appropriate agents
   - RAG Agent: Document retrieval and question answering
   - Knowledge Graph Agent: Graph operations and entity relationships
   - Data Processing Agent: Programmatic and LLM-based data processing

3. **Services**
   - AgentService: Manages agent execution
   - ChatService: Chat session management
   - UserProfileService: User profile CRUD
   - PermissionService: Access control
   - EmbeddingService: Vector embeddings
   - IngestionService: Document processing and storage

4. **Tools**
   - FileSystemTool: File operations
   - GraphQueryTool: Neo4j queries
   - VectorSearchTool: RAG operations
   - DataTransformTool: Data processing

5. **Servers**
   - Express API: HTTP REST endpoints
   - MCP Server: Model Context Protocol for tool exposure

## Installation

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for database services) OR
- PostgreSQL 14+ with pgvector extension and Neo4j 5+ (for manual setup)

### Setup

#### Option 1: Using Docker (Recommended)

1. Clone and install dependencies:
```bash
cd knowledgeBase
npm install
```

2. Start database services with Docker:
```bash
# Using npm script (recommended)
npm run docker:up

# Or using docker-compose directly
docker-compose up -d
```

This will start:
- PostgreSQL with pgvector extension on port 5432
- Neo4j on ports 7474 (HTTP) and 7687 (Bolt)

3. Configure environment variables:
```bash
# Create .env file
cat > .env << 'EOF'
# Model API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Databases (Docker Compose defaults)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

POSTGRES_URI=postgresql://user:password@localhost:5432/knowledgebase

# Server
PORT=3000
MCP_PORT=3001
NODE_ENV=development

# Default Settings
DEFAULT_MODEL=gemini-pro
DEFAULT_EMBEDDING_MODEL=text-embedding-004
EOF
```

Edit `.env` and add your API keys.

4. Verify services are running:
```bash
# Using npm script
npm run docker:ps

# Or using docker-compose directly
docker-compose ps
```

For detailed Docker setup instructions, see [DOCKER_SETUP.md](./DOCKER_SETUP.md).

**Useful Docker commands:**
- `npm run docker:up` - Start services
- `npm run docker:down` - Stop services
- `npm run docker:logs` - View logs
- `npm run docker:ps` - Check status
- `npm run docker:restart` - Restart services

#### Option 2: Manual Setup

1. Clone and install dependencies:
```bash
cd knowledgeBase
npm install
```

2. Set up PostgreSQL with pgvector:
```sql
CREATE DATABASE knowledgebase;
\c knowledgebase
CREATE EXTENSION vector;
```

3. Set up Neo4j:
- Install Neo4j Desktop or use Neo4j AuraDB
- Create a new database
- Note the connection URI, username, and password

4. Configure environment variables:
```bash
# Create .env file
cat > .env << 'EOF'
# Model API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Databases
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

POSTGRES_URI=postgresql://user:password@localhost:5432/knowledgebase

# Server
PORT=3000
MCP_PORT=3001
NODE_ENV=development

# Default Settings
DEFAULT_MODEL=gemini-pro
DEFAULT_EMBEDDING_MODEL=text-embedding-004
EOF
```

Edit `.env` and add your API keys and database credentials.

## Usage

### Start the API Server

```bash
npm start
# or for development
npm run dev
```

The server will be available at `http://localhost:3000/api`

### Start the MCP Server

```bash
npm run mcp:start
# or for development
npm run mcp:dev
```

### Start the Frontend

First, install frontend dependencies (if not already done):

```bash
npm run frontend:install
```

Then start the frontend development server:

```bash
npm run frontend:dev
```

The frontend will be available at `http://localhost:5173`

Other frontend commands:
- `npm run frontend:build` - Build the frontend for production
- `npm run frontend:preview` - Preview the production build

### API Examples

#### 1. Create a Chat Session

```javascript
// Create admin chat (full access)
POST /api/chat/create
{
  "chatType": "admin",
  "userId": "user123",
  "metadata": {
    "description": "Admin session"
  }
}

// Create user chat (read-only)
POST /api/chat/create
{
  "chatType": "user",
  "userId": "user123"
}
```

#### 2. Create/Update User Profile

```javascript
POST /api/profile
{
  "userId": "user123",
  "username": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "customFields": {
    "department": "Engineering"
  }
}
```

#### 3. Query with Chat Context

```javascript
POST /api/query
{
  "chatId": "chat-uuid",
  "prompt": "What are the latest updates?",
  "options": {
    "model": "gemini-pro",
    "useRAG": true,
    "useGraph": true
  }
}
```

#### 4. Process Data Programmatically

```javascript
POST /api/query
{
  "chatId": "chat-uuid",
  "prompt": "Calculate the average of these numbers",
  "data": [10, 20, 30, 40, 50],
  "options": {
    "processData": true
  }
}
```

#### 5. Ingest Documents

```javascript
POST /api/ingest
{
  "content": "Your document content here...",
  "metadata": {
    "title": "Important Document",
    "source": "https://example.com/doc",
    "author": "John Doe"
  }
}
```

#### 6. Get Chat History

```javascript
GET /api/chat/{chatId}/history?limit=20&offset=0
```

### Using the API Client

```javascript
import { APIClient } from './src/utils/APIClient.js';

const client = new APIClient('http://localhost:3000/api');

// Create chat
const { chat } = await client.createChat('admin', 'user123');

// Query with chat context
const result = await client.query(
  chat.chat_id,
  'Find documents about machine learning',
  null,
  { useRAG: true }
);

console.log(result.response);

// Update user profile
await client.updateUserProfile('user123', {
  username: 'Jane Doe',
  email: 'jane@example.com'
});
```

## Permission System

### Admin Chats
- **Full CRUD access** to all resources
- Can modify knowledge graph
- Can edit/delete files
- Can update user profiles
- Can manage all chats

### User Chats
- **Read-only access** to resources
- Can query knowledge graph (no modifications)
- Can read files (no write/delete)
- Can search documents
- Can view own user profile

## Chat History

All messages are automatically stored with:
- Message content
- Role (user/assistant/system)
- Timestamp
- Metadata (agents used, tools used)

Chat history is automatically injected into agent context for continuity.

## User Profile Auto-Injection

User profiles are automatically loaded and injected into the agent context when:
- A chat is associated with a userId
- The profile contains relevant information
- The query might benefit from personalization

The system formats profile data as:
```
=== User Profile ===
User: John Doe
Email: john@example.com
Phone: +1234567890
Address: 123 Main St
Preferences: {"theme":"dark"}
==================
```

## MCP Server

The MCP server exposes tools for use with Claude Desktop and other MCP clients.

### Available Tools

1. **semantic_search**: Search knowledge base using semantic similarity
2. **graph_search**: Search entities in knowledge graph
3. **get_entity**: Get entity details with relationships
4. **ingest_document**: Add documents to knowledge base (admin only)
5. **query_with_model**: Query using specific AI model

### Available Resources

1. **knowledge://graph/stats**: Knowledge graph statistics
2. **knowledge://models/available**: List of available AI models

### Configure in Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": ["/path/to/knowledgeBase/mcp-server.js"]
    }
  }
}
```

## Integration with v1/v2

### From Python (v1)

```python
import requests

# Query the knowledge base
response = requests.post('http://localhost:3000/api/query', json={
    'chatId': 'your-chat-id',
    'prompt': 'Your question here',
    'options': {
        'model': 'gemini-pro',
        'useRAG': True
    }
})

result = response.json()
print(result['response'])
```

### From JavaScript (v2)

```javascript
import { APIClient } from '../knowledgeBase/src/utils/APIClient.js';

const client = new APIClient();

// Use in extension
const result = await client.queryDirect(
  'What is the user\'s email?',
  null,
  { chatType: 'user' }
);
```

## API Endpoints

### Chat Management
- `POST /api/chat/create` - Create chat session
- `GET /api/chat/:chatId` - Get chat details
- `GET /api/chat/:chatId/history` - Get chat history

### Queries
- `POST /api/query` - Query with chat context
- `POST /api/query/direct` - Direct query without chat

### Documents
- `POST /api/ingest` - Ingest document

### Knowledge Graph
- `GET /api/knowledge/:id` - Get entity with relationships
- `GET /api/stats/graph` - Graph statistics

### User Profiles
- `POST /api/profile` - Create/update profile
- `GET /api/profile/:userId` - Get profile

### System
- `GET /api/health` - Health check
- `GET /api/models` - List available models

## Development

### Project Structure

```
knowledgeBase/
├── src/
│   ├── agents/           # Agent implementations
│   ├── models/           # Model factory
│   ├── tools/            # LangChain tools
│   ├── services/         # Business logic
│   ├── storage/          # Database services
│   ├── mcp/              # MCP server
│   └── utils/            # Utilities
├── config/               # Configuration
├── server.js             # API server
├── mcp-server.js         # MCP server
└── package.json
```

### Adding New Agents

1. Create agent in `src/agents/YourAgent.js`
2. Add to `AgentOrchestrator.js`
3. Update router logic to include new agent

### Adding New Tools

1. Create tool in `src/tools/YourTool.js`
2. Implement using `DynamicStructuredTool` with Zod schema
3. Add permission checks
4. Register in appropriate agent

## Troubleshooting

### Database Connection Issues

```bash
# PostgreSQL
psql -U postgres
\l  # List databases
\c knowledgebase  # Connect
\dx  # List extensions (should show vector)

# Neo4j
# Check connection in Neo4j Browser: http://localhost:7474
```

### API Key Issues

```bash
# Verify API keys are set
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_API_KEY ? 'Set' : 'Not set')"
```

### Permission Errors

- Admin chats: Use for write operations
- User chats: Limited to read operations
- Check chat type in responses

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

