<!-- 5d2c4229-b37a-4c91-904e-d3521a5ff3c1 9362b855-e037-4da7-9768-0b33e9a64acf -->
# AI Knowledge Base System with MCP Server

## Architecture Overview

Create a Node.js service in `knowledgeBase/` that serves as a backend for v1/v2 extensions, featuring:

- Multi-agent system for complex task execution
- Neo4j knowledge graph + PostgreSQL vector store
- Model Context Protocol (MCP) server
- Multi-provider model support (Gemini, OpenAI, Anthropic, etc.)
- File system access and RAG capabilities

## Core Components

### 1. Project Structure Setup

Create the following structure in `knowledgeBase/`:

```
knowledgeBase/
├── src/
│   ├── agents/          # LangChain agent definitions
│   ├── models/          # Model provider configurations
│   ├── tools/           # Custom tools for agents
│   ├── services/        # Core services
│   ├── mcp/             # MCP server implementation
│   ├── storage/         # Database integrations
│   └── utils/           # Utilities
├── config/              # Configuration files
├── server.js            # Main server entry
├── mcp-server.js        # MCP server entry
├── package.json         # Dependencies
└── README.md            # Documentation
```

### 2. Dependencies & Configuration

**New dependencies needed:**

- `@modelcontextprotocol/sdk` - MCP server/client
- `pg` + `pgvector` - PostgreSQL with vector support
- `@langchain/anthropic` - Claude support
- `@langchain/textsplitters` - Document chunking
- `faiss-node` - Optional local vector search
- `express` - HTTP server (for backend API)
- `dotenv` - Environment configuration

**Config files:**

- `config/models.config.js` - Model provider settings
- `config/database.config.js` - Neo4j & PostgreSQL connections
- `.env.example` - Environment template

### 3. Multi-Model Provider System

**File:** `src/models/ModelFactory.js`

Create a factory pattern that supports:

- Google Gemini (`@langchain/google-genai`)
- OpenAI (`@langchain/openai`)
- Anthropic Claude (`@langchain/anthropic`)
- Dynamic model selection based on task/config

Key methods:

- `getModel(provider, options)` - Returns configured LLM
- `listAvailableModels()` - Lists all configured providers
- `validateApiKeys()` - Checks API key availability

### 4. Database Integration

**Neo4j Service** (`src/storage/Neo4jService.js`):

- Graph operations for entity relationships
- Cypher query execution
- Knowledge graph construction/retrieval

**PostgreSQL Service** (`src/storage/PostgresService.js`):

- **Vector embeddings** storage using pgvector for RAG
- **Structured data tables**:
  - `user_profiles`: username, email, address, phone, preferences, etc.
  - `chats`: chat_id, chat_type (admin/user), created_at, metadata
  - `chat_messages`: message history per chat
  - `documents`: Document metadata storage
- RAG query support
- User profile CRUD operations
- Chat session management

**Unified Storage Service** (`src/storage/StorageService.js`):

- Orchestrates Neo4j and PostgreSQL
- Hybrid search (vector + graph)
- Data synchronization logic
- User profile retrieval for context

### 5. Permission & Chat Management System

**Permission System** (`src/services/PermissionService.js`):

- Define chat types: `admin` and `user`
- **Admin chats**: Full CRUD access (read/write/modify/delete)
  - Modify knowledge graph
  - Edit/delete files
  - Update user profiles
  - Manage all chats
- **User chats**: Read-only access
  - Query knowledge graph
  - Read files
  - Search documents
  - View user profile (own)

**Chat Service** (`src/services/ChatService.js`):

- Create/manage chat sessions
- Store chat history with context
- Load chat history for context window
- Chat metadata management
- Permission enforcement per chat

**User Profile Service** (`src/services/UserProfileService.js`):

- CRUD operations for user profiles
- Store: username, email, address, phone, preferences, custom fields
- Auto-inject profile data into agent context when relevant
- Profile retrieval for personalization

### 6. Multi-Agent System

**Agent Definitions** (`src/agents/`):

1. **Router Agent** (`RouterAgent.js`):

   - Analyzes user prompts
   - Determines which agents/tools to use
   - Routes to appropriate sub-agents
   - Checks chat permissions before routing
   - Loads chat history for context

2. **Data Processing Agent** (`DataProcessingAgent.js`):

   - Handles programmatic data processing
   - Decides if data needs model processing
   - File system operations (permission-aware)

3. **Knowledge Graph Agent** (`KnowledgeGraphAgent.js`):

   - Builds/queries Neo4j knowledge graph
   - Entity extraction and relationship mapping
   - Enforces read-only for user chats

4. **RAG Agent** (`RAGAgent.js`):

   - Document ingestion and chunking
   - Vector search in PostgreSQL
   - Context retrieval for queries
   - Retrieves user profile for context

**Agent Orchestrator** (`src/agents/AgentOrchestrator.js`):

- Coordinates multi-agent workflows
- Manages agent state and context
- Handles agent communication
- Injects chat history and user profile into context
- Enforces permission boundaries

### 6. Custom Tools

**File:** `src/tools/` directory

Create LangChain tools for:

- `FileSystemTool.js` - Read/write/search files
- `GraphQueryTool.js` - Neo4j operations
- `VectorSearchTool.js` - PostgreSQL vector queries
- `DataTransformTool.js` - Data processing utilities
- `WebSearchTool.js` - Optional web search integration

Each tool follows LangChain's `DynamicStructuredTool` pattern with Zod schemas.

### 7. MCP Server Implementation

**File:** `src/mcp/MCPServer.js`

Implements MCP protocol to:

- **Expose Tools**: Provide tools to MCP clients (Claude Desktop, etc.)
  - File operations
  - Knowledge graph queries
  - RAG search
  - Data processing functions

- **Model Routing**: Handle model selection and orchestration
  - Route requests to appropriate provider
  - Load balancing between models
  - Fallback logic

**MCP Resources** (`src/mcp/resources/`):

- Define available tools/resources
- Schema definitions for MCP clients
- Tool execution handlers

**File:** `mcp-server.js` (entry point)

- Initialize MCP server
- Register tools and resources
- Handle stdio/HTTP transport

### 8. Main Service API

**File:** `server.js`

Express server with endpoints:

- `POST /api/query` - Main entry point for prompts + data
- `POST /api/ingest` - Add documents to knowledge base
- `GET /api/knowledge/:id` - Retrieve knowledge graph nodes
- `POST /api/process` - Programmatic data processing
- `GET /api/models` - List available models
- `GET /api/health` - Health check

Request format:

```json
{
  "prompt": "user query",
  "data": {},
  "options": {
    "model": "gemini-pro",
    "useGraph": true,
    "useRAG": true,
    "processData": true
  }
}
```

### 9. Core Services

**AgentService** (`src/services/AgentService.js`):

- Initialize and manage agents
- Execute agent workflows
- Handle multi-agent coordination

**EmbeddingService** (`src/services/EmbeddingService.js`):

- Generate embeddings for documents
- Support multiple embedding models
- Batch processing

**IngestionService** (`src/services/IngestionService.js`):

- Document loading and chunking
- Metadata extraction
- Store in PostgreSQL + Neo4j

### 10. Integration with v1/v2

**API Client** (`src/utils/APIClient.js`):

- Expose client library for v1/v2
- HTTP client wrapper
- WebSocket support for streaming

**Integration points:**

- v1 Python backend can call Node.js API
- v2 extension can use as alternative to RAG server
- Shared knowledge base across systems

## Implementation Steps

1. Initialize project structure and dependencies
2. Set up database schemas (placeholder for user-defined schemas)
3. Implement ModelFactory for multi-provider support
4. Build storage services (Neo4j + PostgreSQL)
5. Create custom tools for agents
6. Implement individual agents (Router, RAG, Graph, DataProcessing)
7. Build AgentOrchestrator for multi-agent coordination
8. Implement MCP server with tool exposure and model routing
9. Create Express API server with main endpoints
10. Add file system access capabilities
11. Write integration utilities for v1/v2
12. Create configuration files and documentation
13. Add example usage and test scripts

## Key Features

- **Flexible Model Support**: Switch between Gemini, OpenAI, Claude, etc.
- **Hybrid Storage**: Graph relationships (Neo4j) + Vector search (PostgreSQL)
- **Intelligent Routing**: Router agent decides processing strategy
- **MCP Integration**: Expose tools to Claude Desktop and other MCP clients
- **Programmatic Data Processing**: Handle data with/without model inference
- **File System Access**: Read/write local files securely
- **Multi-Agent Coordination**: Complex task decomposition and execution
- **Backend for Extensions**: v1/v2 can leverage this knowledge base

## Configuration Files

**`.env.example`:**

```
# Model API Keys
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Databases
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

POSTGRES_URI=postgresql://user:pass@localhost:5432/knowledgebase

# Server
PORT=3000
MCP_PORT=3001
```

**`package.json`** updates:

- Add new dependencies
- Add scripts: `start`, `dev`, `mcp:start`
- Set up nodemon for development

## Next Steps After Implementation

1. Define database schemas for Neo4j and PostgreSQL
2. Configure model preferences and API keys
3. Test multi-agent workflows
4. Integrate with v1/v2 systems
5. Set up MCP client (e.g., Claude Desktop) connection

### To-dos

- [ ] Initialize project structure, package.json, and install dependencies
- [ ] Implement ModelFactory for multi-provider support (Gemini, OpenAI, Anthropic, etc.)
- [ ] Create Neo4j and PostgreSQL service classes with placeholder schemas
- [ ] Build LangChain tools for file system, graph queries, vector search, data processing
- [ ] Implement Router, RAG, KnowledgeGraph, and DataProcessing agents
- [ ] Create AgentOrchestrator for multi-agent coordination and workflow management
- [ ] Implement MCP server with tool exposure and model routing capabilities
- [ ] Build Express API server with main endpoints for query, ingest, process
- [ ] Implement core services (Agent, Embedding, Ingestion)
- [ ] Create configuration files (.env.example, config files) and documentation