# PowerShell script to start the Knowledge Base server with correct environment variables

Write-Host "Starting AI Knowledge Base Server..." -ForegroundColor Cyan

# Set environment variables for Docker setup
$env:NEO4J_URI = "bolt://localhost:7687"
$env:NEO4J_USER = "neo4j"
$env:NEO4J_PASSWORD = "password"
$env:POSTGRES_URI = "postgresql://postgres:password@localhost:5432/knowledgebase"
$env:PORT = "3000"

# Check if GOOGLE_API_KEY is set
if (-not $env:GOOGLE_API_KEY) {
    Write-Host "Warning: GOOGLE_API_KEY is not set. Some features may not work." -ForegroundColor Yellow
    Write-Host "Set it with: `$env:GOOGLE_API_KEY='your_key_here'" -ForegroundColor Yellow
}

# Start the server
Write-Host "`nStarting server on port $env:PORT..." -ForegroundColor Green
npm start

