# Example script showing how to set up and use Docker services (Windows PowerShell)
# This demonstrates the complete workflow from setup to running examples

$ErrorActionPreference = "Stop"

Write-Host "🚀 Knowledge Base Docker Setup Example" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "Step 1: Checking Docker..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker is not running. Please start Docker Desktop." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Start services
Write-Host "Step 2: Starting Docker services..." -ForegroundColor Blue
docker-compose up -d
Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Step 3: Wait for services to be ready
Write-Host "Step 3: Waiting for services to be ready..." -ForegroundColor Blue
Write-Host "Waiting for PostgreSQL..."
do {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline
    $result = docker exec knowledgebase-postgres pg_isready -U user -d knowledgebase 2>&1
} while ($LASTEXITCODE -ne 0)
Write-Host ""
Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

Write-Host "Waiting for Neo4j..."
do {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline
    docker exec knowledgebase-neo4j cypher-shell -u neo4j -p password "RETURN 1" 2>&1 | Out-Null
} while ($LASTEXITCODE -ne 0)
Write-Host ""
Write-Host "✅ Neo4j is ready" -ForegroundColor Green
Write-Host ""

# Step 4: Check service status
Write-Host "Step 4: Service status..." -ForegroundColor Blue
docker-compose ps
Write-Host ""

# Step 5: Verify database connections
Write-Host "Step 5: Verifying database connections..." -ForegroundColor Blue

# Check PostgreSQL
Write-Host "Testing PostgreSQL connection..."
docker exec knowledgebase-postgres psql -U user -d knowledgebase -c "SELECT version();" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
    
    # Check if pgvector extension is installed
    $extension = docker exec knowledgebase-postgres psql -U user -d knowledgebase -t -c "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector');" 2>&1
    if ($extension -match "t") {
        Write-Host "✅ pgvector extension is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  pgvector extension not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  PostgreSQL connection failed" -ForegroundColor Yellow
}

# Check Neo4j
Write-Host "Testing Neo4j connection..."
docker exec knowledgebase-neo4j cypher-shell -u neo4j -p password "RETURN 1 as test;" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Neo4j connection successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Neo4j connection failed" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Display connection information
Write-Host "Step 6: Connection Information" -ForegroundColor Blue
Write-Host "PostgreSQL:"
Write-Host "  Connection String: postgresql://user:password@localhost:5432/knowledgebase"
Write-Host "  Test: docker exec -it knowledgebase-postgres psql -U user -d knowledgebase"
Write-Host ""
Write-Host "Neo4j:"
Write-Host "  Browser UI: http://localhost:7474"
Write-Host "  Bolt URI: bolt://localhost:7687"
Write-Host "  Username: neo4j"
Write-Host "  Password: password"
Write-Host ""

# Step 7: Environment setup reminder
Write-Host "Step 7: Next Steps" -ForegroundColor Blue
Write-Host "1. Create a .env file in the project root with your API keys:"
Write-Host ""
Write-Host @"
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
"@
Write-Host ""
Write-Host "2. Start the API server:"
Write-Host "   npm start"
Write-Host ""
Write-Host "3. Run examples:"
Write-Host "   node examples/basic-usage.js"
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  npm run docker:ps      - Check service status"
Write-Host "  npm run docker:logs    - View service logs"
Write-Host "  npm run docker:down    - Stop services"
Write-Host "  docker-compose down -v - Stop and remove all data"
Write-Host ""

