# Docker Setup Guide

This guide explains how to set up the external services (PostgreSQL and Neo4j) using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Using npm scripts (Cross-platform)

1. **Start the services:**
   ```bash
   npm run docker:up
   ```

2. **Check service status:**
   ```bash
   npm run docker:ps
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Stop the services:**
   ```bash
   npm run docker:down
   ```

5. **Restart services:**
   ```bash
   npm run docker:restart
   ```

### Using Docker Compose directly

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f postgres
   docker-compose logs -f neo4j
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (⚠️ deletes all data):**
   ```bash
   docker-compose down -v
   ```

## Services

### PostgreSQL with pgvector

- **Port:** 5432
- **Database:** knowledgebase
- **Username:** user
- **Password:** password
- **Connection String:** `postgresql://user:password@localhost:5432/knowledgebase`

The database will be automatically initialized with the schema from `database-setup.sql` when the container starts for the first time.

### Neo4j

- **HTTP Port:** 7474 (Browser UI)
- **Bolt Port:** 7687 (Application connection)
- **Username:** neo4j
- **Password:** password
- **Connection URI:** `bolt://localhost:7687`

Access the Neo4j Browser at: http://localhost:7474

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
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
```

## Verifying Setup

### PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it knowledgebase-postgres psql -U user -d knowledgebase

# Check if pgvector extension is installed
\dx

# List tables
\dt
```

### Neo4j

1. Open http://localhost:7474 in your browser
2. Login with:
   - Username: `neo4j`
   - Password: `password`
3. Run a test query:
   ```cypher
   MATCH (n) RETURN count(n) as node_count
   ```

## Troubleshooting

### Port Already in Use

If ports 5432 or 7687 are already in use, you can modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

Then update your `.env` file accordingly.

### Database Not Initializing

If the database schema isn't being created:

1. Check the logs: `docker-compose logs postgres`
2. Manually run the setup:
   ```bash
   docker exec -i knowledgebase-postgres psql -U user -d knowledgebase < database-setup.sql
   ```

### Neo4j Not Starting

1. Check the logs: `docker-compose logs neo4j`
2. Ensure you have enough memory allocated to Docker (at least 4GB recommended)
3. Try restarting: `docker-compose restart neo4j`

### Reset Everything

To completely reset all services and data:

```bash
docker-compose down -v
docker-compose up -d
```

## Production Considerations

⚠️ **Important:** The default credentials in `docker-compose.yml` are for development only!

For production:

1. Use strong passwords
2. Set environment variables via `.env` file (not in docker-compose.yml)
3. Use Docker secrets or environment variable injection
4. Enable SSL/TLS for database connections
5. Use managed database services (AWS RDS, Neo4j Aura, etc.) for better security and reliability
6. Set up proper backup strategies
7. Configure resource limits in docker-compose.yml

Example production configuration:

```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # From .env
  NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}      # From .env
```

## Data Persistence

All data is stored in Docker volumes:

- `postgres_data`: PostgreSQL data files
- `neo4j_data`: Neo4j database files
- `neo4j_logs`: Neo4j log files

These volumes persist even when containers are stopped. To backup:

```bash
# Backup PostgreSQL
docker exec knowledgebase-postgres pg_dump -U user knowledgebase > backup.sql

# Backup Neo4j (requires neo4j-admin)
docker exec knowledgebase-neo4j neo4j-admin dump --database=neo4j --to=/var/lib/neo4j/import/backup.dump
```

