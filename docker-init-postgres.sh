#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U user -d knowledgebase; do
  sleep 1
done

# Modify pg_hba.conf to allow password authentication from external hosts
echo "host    all    all    0.0.0.0/0    md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host    all    all    ::/0         md5" >> /var/lib/postgresql/data/pg_hba.conf

# Reload PostgreSQL configuration
psql -U user -d knowledgebase -c "SELECT pg_reload_conf();"

echo "PostgreSQL authentication configured for external connections"

