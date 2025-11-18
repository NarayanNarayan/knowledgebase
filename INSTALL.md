# Installation Guide

This guide will help you set up the AI Knowledge Base system from scratch.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14`

3. **Neo4j** (v5 or higher)
   - Option 1: Neo4j Desktop - https://neo4j.com/download/
   - Option 2: Neo4j AuraDB (cloud) - https://neo4j.com/cloud/aura/
   - Option 3: Docker: `docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5`

### API Keys

Get API keys from:
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI** (optional): https://platform.openai.com/api-keys
- **Anthropic** (optional): https://console.anthropic.com/

## Step-by-Step Installation

### 1. Install Dependencies

```bash
cd knowledgeBase
npm install
```

### 2. Set Up PostgreSQL

#### Option A: Using psql command line

```bash
# Create database
psql -U postgres -c "CREATE DATABASE knowledgebase;"

# Run setup script
psql -U postgres -d knowledgebase -f database-setup.sql
```

#### Option B: Manual setup

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE knowledgebase;

-- Connect to the database
\c knowledgebase

-- Enable pgvector
CREATE EXTENSION vector;

-- Run the rest of database-setup.sql
\i database-setup.sql
```

#### Option C: Using Docker

```bash
# Start PostgreSQL with pgvector
docker run -d \
  --name kb-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=knowledgebase \
  -p 5432:5432 \
  ankane/pgvector

# Wait a few seconds, then run setup
docker exec -i kb-postgres psql -U postgres -d knowledgebase < database-setup.sql
```

### 3. Set Up Neo4j

#### Option A: Neo4j Desktop

1. Download and install Neo4j Desktop
2. Create a new project
3. Add a local DBMS
4. Set password
5. Start the DBMS
6. Note the bolt URI (usually `bolt://localhost:7687`)

#### Option B: Neo4j Docker

```bash
docker run -d \
  --name kb-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:5
```

Visit http://localhost:7474 to verify it's running.

#### Option C: Neo4j AuraDB (Cloud)

1. Go to https://neo4j.com/cloud/aura/
2. Create a free instance
3. Download credentials
4. Note the connection URI

### 4. Configure Environment

Create `.env` file:

```bash
# Option 1: Use setup script (Linux/Mac)
chmod +x setup-env.sh
./setup-env.sh

# Option 2: Copy manually
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Required: At least one model provider
GOOGLE_API_KEY=your_google_api_key_here

# Optional model providers
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Database connections
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

POSTGRES_URI=postgresql://postgres:postgres@localhost:5432/knowledgebase

# Server ports
PORT=3000
MCP_PORT=3001
```

### 5. Verify Installation

```bash
# Start the server
npm start
```

You should see:
```
Initializing services...
PostgreSQL initialized successfully
Neo4j initialized successfully
Storage services initialized
Agent Orchestrator initialized

🚀 AI Knowledge Base Server running on port 3000
📍 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/api/health
📚 Models: http://localhost:3000/api/models
```

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# List models
curl http://localhost:3000/api/models
```

Expected response:
```json
{
  "models": [...],
  "apiKeys": {
    "google": true,
    "openai": false,
    "anthropic": false,
    "hasAnyKey": true
  }
}
```

### 7. Run Example

```bash
node examples/basic-usage.js
```

This will:
- Create a user profile
- Create chat sessions
- Ingest a document
- Query with RAG
- Process data
- Show chat history

## MCP Server Setup

### For Claude Desktop

1. Find your Claude Desktop config:
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the MCP server:

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": [
        "/absolute/path/to/knowledgeBase/mcp-server.js"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_key",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "your_password",
        "POSTGRES_URI": "postgresql://postgres:postgres@localhost:5432/knowledgebase"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. You should see the knowledge base tools available

### Test MCP Server

```bash
npm run mcp:start
```

The server will communicate via stdio.

## Troubleshooting

### PostgreSQL Issues

**Error: role does not exist**
```bash
# Create user
psql -U postgres -c "CREATE USER your_user WITH PASSWORD 'your_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE knowledgebase TO your_user;"
```

**Error: extension "vector" does not exist**
```bash
# Install pgvector
# Mac (Homebrew)
brew install pgvector

# Ubuntu/Debian
sudo apt install postgresql-14-pgvector

# Or use Docker with ankane/pgvector image
```

**Connection refused**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Neo4j Issues

**Connection timeout**
- Check Neo4j is running: http://localhost:7474
- Verify bolt port (7687) is open
- Check credentials match .env

**Authentication failed**
- Reset password in Neo4j Desktop/Browser
- Update .env file

### API Key Issues

**Model not available**
- Check API key is set in .env
- Verify key is valid
- Check `http://localhost:3000/api/models` shows key as available

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001

# Or kill existing process
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Development Mode

```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Run in dev mode (auto-restart on changes)
npm run dev

# Run MCP server in dev mode
npm run mcp:dev
```

## Docker Compose (Optional)

Create `docker-compose.yml` for all services:

```yaml
version: '3.8'

services:
  postgres:
    image: ankane/pgvector
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: knowledgebase
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: neo4j/password
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data

volumes:
  postgres_data:
  neo4j_data:
```

Start services:
```bash
docker-compose up -d
```

## Next Steps

1. Review the [README.md](README.md) for API usage
2. Check [examples/basic-usage.js](examples/basic-usage.js) for code examples
3. Explore the API endpoints
4. Set up MCP integration with Claude Desktop
5. Integrate with v1/v2 browser extensions

## Support

For issues:
1. Check logs in the terminal
2. Verify database connections
3. Confirm API keys are valid
4. Review this troubleshooting section

