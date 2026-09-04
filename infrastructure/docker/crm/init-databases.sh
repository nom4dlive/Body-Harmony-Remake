#!/bin/bash
set -e

# Nexus Protocol V3.1 — PLAN-151: Multi-Database Initializer for CRM Stack (pgvector 16)
# Creates isolated databases for Chatwoot and Evolution API

echo ">> Initializing CRM PostgreSQL databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- 1. Setup Chatwoot Database
    SELECT 'CREATE DATABASE chatwoot_production'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chatwoot_production')\gexec

    -- 2. Setup Evolution API Database
    SELECT 'CREATE DATABASE evolution_v2'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution_v2')\gexec
EOSQL

# Enable required PostgreSQL extensions on chatwoot_production
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "chatwoot_production" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "vector";
EOSQL

# Enable required PostgreSQL extensions on evolution_v2
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "evolution_v2" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL

echo ">> CRM PostgreSQL databases initialized successfully."
