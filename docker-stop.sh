#!/bin/bash

# Stop Docker services for knowledgebase

echo "🛑 Stopping knowledgebase services..."

docker-compose down

echo ""
echo "✅ Services stopped!"

