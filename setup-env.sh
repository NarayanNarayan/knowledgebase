#!/bin/bash

# Setup script for AI Knowledge Base

echo "🚀 Setting up AI Knowledge Base..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Model API Keys
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Databases
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

POSTGRES_URI=postgresql://user:password@localhost:5432/knowledgebase

# Server
PORT=3000
MCP_PORT=3001
NODE_ENV=development

# Default Settings
DEFAULT_MODEL=gemini-pro
DEFAULT_EMBEDDING_MODEL=text-embedding-004
EOF
    echo "✅ .env file created. Please edit it with your credentials."
else
    echo "ℹ️  .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "ℹ️  Dependencies already installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys and database credentials"
echo "2. Set up PostgreSQL with pgvector extension"
echo "3. Set up Neo4j database"
echo "4. Run 'npm start' to start the API server"
echo "5. Run 'npm run mcp:start' to start the MCP server"
echo ""

