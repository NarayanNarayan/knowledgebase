# Examples

This directory contains example code demonstrating how to use the AI Knowledge Base system.

## Prerequisites

Before running any examples, ensure you have:

1. **Docker services running:**
   ```bash
   npm run docker:up
   # or
   docker-compose up -d
   ```

2. **API server running:**
   ```bash
   npm start
   ```

3. **Environment variables configured:**
   - Create a `.env` file in the project root
   - Add your API keys (Google, OpenAI, Anthropic)
   - Database credentials are set automatically with Docker defaults

## Example Files

### basic-usage.js

Comprehensive JavaScript example showing all major features:

- Health checks and model listing
- User profile management
- Chat session creation (admin and user)
- Document ingestion
- RAG queries
- User profile context queries
- Data processing
- Knowledge graph operations
- Chat history retrieval

**Run it:**
```bash
node examples/basic-usage.js
```

### v1-integration.py

Python integration example for v1 backend:

- Python client implementation
- Health checks
- User profile management
- Chat creation
- Document ingestion
- RAG queries
- Data processing
- Chat history

**Run it:**
```bash
python examples/v1-integration.py
```

**Requirements:**
```bash
pip install requests
```

### v2-integration.js

Chrome Extension integration example:

- Extension-specific client wrapper
- Webpage summary storage
- Similar page finding
- Form analysis with profile context
- Question answering
- Conversation history

**Usage:**
Import and use in your Chrome extension:
```javascript
import { WebAIKnowledgeBase } from './examples/v2-integration.js';
```

### mcp-config.json

MCP (Model Context Protocol) server configuration for Claude Desktop:

- Configuration template
- Environment variables
- Docker default credentials

**Setup:**
1. Copy this file to your Claude Desktop config directory
2. Update the absolute path to `mcp-server.js`
3. Add your API keys
4. Restart Claude Desktop

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### docker-setup-example.sh / docker-setup-example.ps1

Interactive setup scripts demonstrating Docker workflow:

- Docker service startup
- Health checks
- Connection verification
- Service status display

**Run it (Linux/macOS):**
```bash
chmod +x examples/docker-setup-example.sh
./examples/docker-setup-example.sh
```

**Run it (Windows PowerShell):**
```powershell
.\examples\docker-setup-example.ps1
```

## Quick Start Workflow

1. **Start Docker services:**
   ```bash
   npm run docker:up
   ```

2. **Verify services are running:**
   ```bash
   npm run docker:ps
   ```

3. **Check service health:**
   - PostgreSQL: `docker exec -it knowledgebase-postgres psql -U user -d knowledgebase`
   - Neo4j Browser: http://localhost:7474

4. **Configure environment:**
   - Create `.env` file with API keys
   - Use Docker default credentials:
     - PostgreSQL: `postgresql://user:password@localhost:5432/knowledgebase`
     - Neo4j: `bolt://localhost:7687` (user: `neo4j`, password: `password`)

5. **Start API server:**
   ```bash
   npm start
   ```

6. **Run examples:**
   ```bash
   # JavaScript example
   node examples/basic-usage.js
   
   # Python example
   python examples/v1-integration.py
   ```

## Docker Commands Reference

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Check status
npm run docker:ps

# Restart services
npm run docker:restart

# Stop and remove all data (⚠️ destructive)
docker-compose down -v
```

## Troubleshooting

### Services not starting

```bash
# Check Docker is running
docker info

# View service logs
npm run docker:logs

# Check port conflicts
netstat -an | grep -E '5432|7474|7687'
```

### Connection errors

1. Verify services are running: `npm run docker:ps`
2. Check service health: `docker-compose ps`
3. View logs: `npm run docker:logs postgres` or `npm run docker:logs neo4j`
4. Verify environment variables in `.env` file

### Database not initialized

The database schema is automatically initialized when PostgreSQL starts for the first time. If tables are missing:

```bash
# Manually run setup
docker exec -i knowledgebase-postgres psql -U user -d knowledgebase < database-setup.sql
```

## Additional Resources

- [DOCKER_SETUP.md](../DOCKER_SETUP.md) - Detailed Docker setup guide
- [README.md](../README.md) - Main project documentation
- [QUICK_START.md](../QUICK_START.md) - Quick start guide

