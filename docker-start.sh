#!/bin/bash

# Start Docker services for knowledgebase

echo "🚀 Starting knowledgebase services..."

docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
docker-compose ps

echo ""
echo "✅ Services started!"
echo ""
echo "PostgreSQL: postgresql://user:password@localhost:5432/knowledgebase"
echo "Neo4j Browser: http://localhost:7474"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"

