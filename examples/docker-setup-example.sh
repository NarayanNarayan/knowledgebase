#!/bin/bash

# Example script showing how to set up and use Docker services
# This demonstrates the complete workflow from setup to running examples

set -e  # Exit on error

echo "🚀 Knowledge Base Docker Setup Example"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Docker is running
echo -e "${BLUE}Step 1: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start services
echo -e "${BLUE}Step 2: Starting Docker services...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 3: Wait for services to be ready
echo -e "${BLUE}Step 3: Waiting for services to be ready...${NC}"
echo "Waiting for PostgreSQL..."
until docker exec knowledgebase-postgres pg_isready -U user -d knowledgebase > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

echo "Waiting for Neo4j..."
until docker exec knowledgebase-neo4j cypher-shell -u neo4j -p password "RETURN 1" > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""
echo -e "${GREEN}✅ Neo4j is ready${NC}"
echo ""

# Step 4: Check service status
echo -e "${BLUE}Step 4: Service status...${NC}"
docker-compose ps
echo ""

# Step 5: Verify database connections
echo -e "${BLUE}Step 5: Verifying database connections...${NC}"

# Check PostgreSQL
echo "Testing PostgreSQL connection..."
docker exec knowledgebase-postgres psql -U user -d knowledgebase -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL connection successful${NC}"
    
    # Check if pgvector extension is installed
    EXTENSION=$(docker exec knowledgebase-postgres psql -U user -d knowledgebase -t -c "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector');" | tr -d ' ')
    if [ "$EXTENSION" = "t" ]; then
        echo -e "${GREEN}✅ pgvector extension is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  pgvector extension not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL connection failed${NC}"
fi

# Check Neo4j
echo "Testing Neo4j connection..."
docker exec knowledgebase-neo4j cypher-shell -u neo4j -p password "RETURN 1 as test;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Neo4j connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Neo4j connection failed${NC}"
fi
echo ""

# Step 6: Display connection information
echo -e "${BLUE}Step 6: Connection Information${NC}"
echo "PostgreSQL:"
echo "  Connection String: postgresql://user:password@localhost:5432/knowledgebase"
echo "  Test: docker exec -it knowledgebase-postgres psql -U user -d knowledgebase"
echo ""
echo "Neo4j:"
echo "  Browser UI: http://localhost:7474"
echo "  Bolt URI: bolt://localhost:7687"
echo "  Username: neo4j"
echo "  Password: password"
echo ""

# Step 7: Environment setup reminder
echo -e "${BLUE}Step 7: Next Steps${NC}"
echo "1. Create a .env file in the project root with your API keys:"
echo ""
cat << 'EOF'
# Model API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Databases (Docker defaults)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

POSTGRES_URI=postgresql://user:password@localhost:5432/knowledgebase

# Server
PORT=3000
MCP_PORT=3001
NODE_ENV=development
EOF
echo ""
echo "2. Start the API server:"
echo "   npm start"
echo ""
echo "3. Run examples:"
echo "   node examples/basic-usage.js"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Useful commands:"
echo "  npm run docker:ps      - Check service status"
echo "  npm run docker:logs    - View service logs"
echo "  npm run docker:down    - Stop services"
echo "  docker-compose down -v - Stop and remove all data"
echo ""

