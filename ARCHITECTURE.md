# Architecture Documentation

## System Overview

The AI Knowledge Base is a multi-agent system that provides intelligent query processing, document retrieval, and knowledge graph operations with support for multiple AI model providers.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ v1 Python│  │ v2 Chrome│  │   MCP    │  │  Direct API │ │
│  │  Backend │  │ Extension│  │  Client  │  │    Calls    │ │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬──────┘ │
└────────┼─────────────┼─────────────┼──────────────┼─────────┘
         │             │             │              │
         ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Express)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  /query  │  │ /ingest  │  │ /profile │  │   /chat    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
└───────┼─────────────┼──────────────┼──────────────┼─────────┘
        │             │              │              │
        ▼             ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Agent    │  │ Ingestion │  │  User    │  │   Chat   │ │
│  │  Service   │  │  Service  │  │ Profile  │  │ Service  │ │
│  └─────┬──────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘ │
└────────┼────────────────┼─────────────┼─────────────┼────────┘
         │                │             │             │
         ▼                ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Orchestrator                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Router  │  │   RAG    │  │   Graph  │  │    Data     │ │
│  │  Agent   │  │  Agent   │  │  Agent   │  │ Processing  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└───────┼─────────────┼──────────────┼───────────────┼─────────┘
        │             │              │               │
        ▼             ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tools Layer                             │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ FileSystem │  │  Graph   │  │  Vector  │  │   Data    │ │
│  │    Tool    │  │   Query  │  │  Search  │  │ Transform │ │
│  └─────┬──────┘  └─────┬────┘  └─────┬────┘  └─────┬─────┘ │
└────────┼───────────────┼──────────────┼─────────────┼────────┘
         │               │              │             │
         ▼               ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  ┌────────────────────┐           ┌────────────────────────┐│
│  │    PostgreSQL      │           │        Neo4j           ││
│  │  ┌──────────────┐  │           │  ┌──────────────────┐ ││
│  │  │ User Profiles│  │           │  │  Knowledge Graph │ ││
│  │  │ Chat History │  │           │  │    Entities &    │ ││
│  │  │  Documents   │  │           │  │  Relationships   │ ││
│  │  │  Embeddings  │  │           │  │                  │ ││
│  │  │  (pgvector)  │  │           │  │                  │ ││
│  │  └──────────────┘  │           │  └──────────────────┘ ││
│  └────────────────────┘           └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Providers                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Google  │  │  OpenAI  │  │ Anthropic│                  │
│  │  Gemini  │  │   GPT    │  │  Claude  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Agent System

#### Router Agent
- **Purpose**: Analyzes user requests and routes to appropriate agents
- **Input**: User prompt, data, context
- **Output**: Routing decision (which agents to use)
- **Logic**: 
  - Analyzes prompt for keywords and intent
  - Determines if RAG, Graph, Data Processing, or Direct Response is needed
  - Considers chat type and permissions

#### RAG Agent
- **Purpose**: Advanced document retrieval and question answering with hybrid and iterative capabilities
- **Tools Used**: VectorSearchTool, Hybrid Search (vector + graph)
- **Retrieval Modes**:
  - **Hybrid Search** (default: enabled): Combines vector similarity search with knowledge graph traversal
    - Performs vector search on embeddings
    - Enriches results with related entities from Neo4j graph
    - Configurable graph traversal depth
  - **Vector-Only**: Traditional vector similarity search (when hybrid disabled)
  
- **Single-Pass RAG** (default):
  1. Generate embedding for query
  2. Perform hybrid/vector search
  3. Retrieve top-k similar documents (with graph context if hybrid)
  4. Build context from results
  5. Generate answer using LLM

- **Iterative/Dynamic RAG** (optional):
  1. Generate embedding for initial query
  2. Perform retrieval (hybrid or vector)
  3. Evaluate retrieval quality and confidence
  4. If confidence below threshold or refinement needed:
     - Refine query based on missing information
     - Perform additional retrieval passes
     - Accumulate unique results
     - Re-evaluate until confidence met or max iterations reached
  5. Generate comprehensive answer from all accumulated context
  
- **Configuration Options**:
  - `useHybrid`: Enable hybrid search (vector + graph) - default: true
  - `useIterative`: Enable iterative refinement - default: false
  - `maxIterations`: Maximum retrieval passes (iterative mode) - default: 3
  - `confidenceThreshold`: Minimum confidence to stop iterating - default: 0.8
  - `graphDepth`: Graph traversal depth for hybrid search - default: 1
  - `ragLimit`: Number of documents to retrieve - default: 5
  - `ragThreshold`: Similarity threshold - default: 0.7

#### Knowledge Graph Agent
- **Purpose**: Entity and relationship operations
- **Tools Used**: GraphQueryTool
- **Operations**:
  - Search entities
  - Get entity relationships
  - Create entities (admin only)
  - Create relationships (admin only)
  - Execute Cypher queries
- **Integration with RAG**: The RAG Agent's hybrid search mode automatically enriches vector search results with related entities from the knowledge graph, providing richer context for question answering

#### Data Processing Agent
- **Purpose**: Programmatic and LLM-based data processing
- **Tools Used**: DataTransformTool, FileSystemTool
- **Modes**:
  - **Programmatic**: JSON parsing, filtering, aggregation
  - **Model**: LLM-based analysis
  - **Both**: Programmatic preprocessing + LLM analysis

### 2. Storage Architecture

#### PostgreSQL Schema

```sql
-- User Profiles
user_profiles (
  id SERIAL,
  user_id VARCHAR(255) UNIQUE,
  username, email, phone, address,
  preferences JSONB,
  custom_fields JSONB,
  created_at, updated_at
)

-- Chats
chats (
  id SERIAL,
  chat_id VARCHAR(255) UNIQUE,
  chat_type VARCHAR(20) CHECK (admin/user),
  user_id VARCHAR(255) FK,
  metadata JSONB,
  created_at, updated_at
)

-- Chat Messages
chat_messages (
  id SERIAL,
  message_id VARCHAR(255) UNIQUE,
  chat_id VARCHAR(255) FK,
  role VARCHAR(20) CHECK (user/assistant/system),
  content TEXT,
  metadata JSONB,
  created_at
)

-- Documents
documents (
  id SERIAL,
  doc_id VARCHAR(255) UNIQUE,
  title, content, source,
  metadata JSONB,
  created_at, updated_at
)

-- Embeddings (with pgvector)
embeddings (
  id SERIAL,
  doc_id VARCHAR(255) FK,
  chunk_index INTEGER,
  content TEXT,
  embedding vector(768),
  metadata JSONB,
  created_at
)
```

#### Neo4j Graph Model

```cypher
// Entity nodes
(:Entity {
  id: string,
  type: string,
  name: string,
  description: string,
  ...properties
})

// Document nodes
(:Document {
  id: string,
  title: string,
  source: string
})

// User nodes
(:User {
  id: string,
  username: string
})

// Relationships
(:Entity)-[:RELATED_TO]->(:Entity)
(:Document)-[:MENTIONS]->(:Entity)
(:User)-[:OWNS]->(:Document)
```

### 3. Permission System

```javascript
permissions = {
  admin: {
    canRead: true,
    canWrite: true,
    canModify: true,
    canDelete: true,
    resources: ['graph', 'files', 'profiles', 'chats', 'documents']
  },
  user: {
    canRead: true,
    canWrite: false,
    canModify: false,
    canDelete: false,
    resources: ['graph', 'files', 'documents'] // read-only
  }
}
```

**Permission Flow**:
1. Request includes chatId
2. ChatService retrieves chat type (admin/user)
3. PermissionService validates operation
4. Tools/Agents enforce permissions
5. Unauthorized operations throw error

### 4. Chat History Integration

**Storage**:
- Each message stored in `chat_messages` table
- Includes role, content, metadata (agents used, tools used)
- Indexed by chat_id for fast retrieval

**Context Injection**:
1. AgentOrchestrator retrieves recent messages (default: 10)
2. Formats as LangChain messages array
3. Prepends to current prompt
4. LLM receives full conversation context

### 5. User Profile Integration

**Auto-Injection**:
- Profile loaded when chat has userId
- Formatted as system message prefix
- Includes: username, email, phone, address, preferences
- Available to all agents for personalization

**Format**:
```
=== User Profile ===
User: John Doe
Email: john@example.com
Phone: +1234567890
Address: 123 Main St
Preferences: {"theme":"dark"}
==================

[Conversation history...]

User: [Current query]
```

### 6. Model Factory

**Provider Support**:
- Google Gemini (gemini-pro, gemini-1.5-pro, gemini-1.5-flash)
- OpenAI (gpt-4, gpt-4-turbo, gpt-3.5-turbo)
- Anthropic (claude-3-opus, claude-3-sonnet, claude-3-5-sonnet, claude-3-haiku)

**Model Selection**:
```javascript
// By identifier
const model = modelFactory.getModel('gemini-pro');

// With options
const model = modelFactory.getModel('gpt-4', {
  temperature: 0.9,
  maxTokens: 2000
});

// Auto-detection
const provider = modelFactory.detectProvider('claude-3-opus'); // 'anthropic'
```

### 7. Ingestion Pipeline

```
Document Input
    │
    ▼
Text Splitting (RecursiveCharacterTextSplitter)
    │
    ▼
Embedding Generation (Batch)
    │
    ▼
Store in PostgreSQL
    │
    ▼
Entity Extraction
    │
    ▼
Store in Neo4j
    │
    ▼
Link Document to Entities
```

### 8. Query Processing Flow

#### Standard RAG Flow (Single-Pass)
```
User Query
    │
    ▼
Router Agent (Analyze intent)
    │
    ├─> RAG Agent (if document search needed)
    │       │
    │       ├─> Generate embedding
    │       ├─> Hybrid Search (Vector + Graph) [default]
    │       │   ├─> Vector search in PostgreSQL
    │       │   └─> Enrich with Neo4j graph entities
    │       │
    │       OR Vector-Only Search (if hybrid disabled)
    │       │
    │       ├─> Build context (with graph relations if hybrid)
    │       └─> Generate answer with LLM
    │
    ├─> Graph Agent (if entity/relationship query)
    │       │
    │       ├─> Parse query
    │       ├─> Execute Cypher
    │       └─> Return graph data
    │
    └─> Data Agent (if data processing needed)
            │
            ├─> Determine mode (programmatic/model/both)
            ├─> Process data
            └─> Return results
    │
    ▼
Synthesize Results (if multiple agents)
    │
    ▼
Add to Chat History
    │
    ▼
Return to User
```

#### Iterative/Dynamic RAG Flow (when enabled)
```
User Query
    │
    ▼
Router Agent (Analyze intent)
    │
    └─> RAG Agent (Iterative Mode)
            │
            ├─> [Iteration 1]
            │   ├─> Generate embedding
            │   ├─> Hybrid/Vector search
            │   ├─> Evaluate retrieval quality
            │   └─> Check confidence threshold
            │
            ├─> [Iteration 2-N] (if needed)
            │   ├─> Refine query based on missing info
            │   ├─> Generate new embedding
            │   ├─> Search again (avoid duplicates)
            │   ├─> Accumulate unique results
            │   ├─> Re-evaluate quality
            │   └─> Continue until confidence met or max iterations
            │
            └─> Generate comprehensive answer from all accumulated context
    │
    ▼
Return Results with metadata (iterations, total docs retrieved)
```

### 9. MCP Server Architecture

**Protocol**: Model Context Protocol (stdio/HTTP)

**Exposed Tools**:
1. semantic_search - RAG queries
2. graph_search - Entity search
3. get_entity - Entity details
4. ingest_document - Add documents
5. query_with_model - Model routing

**Resources**:
1. knowledge://graph/stats - Graph statistics
2. knowledge://models/available - Available models

**Integration**:
- Claude Desktop reads config
- Spawns MCP server process
- Communicates via stdio
- Tools available in Claude UI

### 10. API Design

**RESTful Endpoints**:
- POST /api/chat/create - Create session
- POST /api/query - Main query endpoint
- POST /api/ingest - Document ingestion
- GET /api/chat/:id/history - Get history
- POST /api/profile - Update profile
- GET /api/knowledge/:id - Get entity

**Request Format**:
```json
{
  "chatId": "uuid",
  "prompt": "user question",
  "data": {...},
  "options": {
    "model": "gemini-pro",
    "useRAG": true,
    "useGraph": true,
    "processData": true,
    "useHybrid": true,
    "useIterative": false,
    "maxIterations": 3,
    "confidenceThreshold": 0.8,
    "graphDepth": 1,
    "ragLimit": 5,
    "ragThreshold": 0.7
  }
}
```

**RAG Configuration Options**:
- `useHybrid` (boolean, default: true): Enable hybrid search combining vector similarity with graph traversal
- `useIterative` (boolean, default: false): Enable iterative/dynamic RAG with query refinement
- `maxIterations` (number, default: 3): Maximum retrieval passes for iterative mode
- `confidenceThreshold` (number, default: 0.8): Minimum confidence (0-1) to stop iterating
- `graphDepth` (number, default: 1): Depth of graph traversal for entity relationships
- `ragLimit` (number, default: 5): Number of documents to retrieve per pass
- `ragThreshold` (number, default: 0.7): Similarity threshold (0-1) for vector search

**Response Format**:
```json
{
  "success": true,
  "response": "answer",
  "agentsUsed": ["RAG_AGENT", "GRAPH_AGENT"],
  "toolsUsed": [...],
  "sources": [
    {
      "docId": "doc-123",
      "title": "Document Title",
      "source": "file.pdf",
      "similarity": 0.85,
      "relatedEntities": "Entity1, Entity2"
    }
  ],
  "routing": {...},
  "ragMetadata": {
    "retrievalMethod": "hybrid" | "iterative-hybrid" | "vector" | "iterative-vector",
    "iterations": 2,
    "totalResultsRetrieved": 8
  }
}
```

**RAG Metadata** (when RAG Agent is used):
- `retrievalMethod`: Type of retrieval used (hybrid, iterative-hybrid, vector, iterative-vector)
- `iterations`: Number of iterations performed (only in iterative mode)
- `totalResultsRetrieved`: Total number of unique documents retrieved (only in iterative mode)

## Scalability Considerations

1. **Database**: Connection pooling (pg, neo4j-driver)
2. **Caching**: Can add Redis for session/profile caching
3. **Async**: All I/O operations are async
4. **Streaming**: WebSocket support for streaming responses
5. **Load Balancing**: Stateless design allows horizontal scaling

## Security

1. **API Keys**: Stored in environment, never exposed
2. **Permissions**: Enforced at service layer
3. **Input Validation**: Zod schemas for tool inputs
4. **SQL Injection**: Parameterized queries
5. **Cypher Injection**: Parameterized Neo4j queries

## Future Enhancements

1. WebSocket support for streaming
2. Redis caching layer
3. Batch query processing
4. Advanced entity extraction (NER models)
5. Multi-user collaboration
6. Plugin system for custom agents
7. Metrics and monitoring
8. Rate limiting
9. Authentication/Authorization
10. Vector index optimization

