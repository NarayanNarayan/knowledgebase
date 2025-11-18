#!/bin/bash

# View Docker service logs

SERVICE=${1:-""}

if [ -z "$SERVICE" ]; then
    echo "📋 Viewing logs for all services..."
    docker-compose logs -f
else
    echo "📋 Viewing logs for $SERVICE..."
    docker-compose logs -f "$SERVICE"
fi

