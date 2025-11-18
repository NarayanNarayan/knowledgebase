#!/bin/bash
# Bash script to start the Knowledge Base server with correct environment variables

echo "Starting AI Knowledge Base Server..."

# Set environment variables for Docker setup
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="password"
export POSTGRES_URI="postgresql://postgres:password@localhost:5432/knowledgebase"
export PORT="3000"

# Check if GOOGLE_API_KEY is set
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "Warning: GOOGLE_API_KEY is not set. Some features may not work."
    echo "Set it with: export GOOGLE_API_KEY='your_key_here'"
fi

# Start the server
echo ""
echo "Starting server on port $PORT..."
npm start

