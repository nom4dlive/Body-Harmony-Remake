#!/usr/bin/env bash
# scripts/vps/reset-smartbook-beta.sh
# Nexus Protocol V3.1 — PLAN-142: Reset Total Beta & Caderno Piloto Afterburning

set -e

echo "=========================================================="
echo "🔥 INICIANDO RESET TOTAL BETA — SMARTBOOK & OPEN NOTEBOOK"
echo "=========================================================="

# 1. Limpeza no SurrealDB (Dropar tabelas de dados mantendo schema)
echo "[1/4] Limpando tabelas no SurrealDB..."
docker exec -i bodyharmony-surrealdb /surreal sql --endpoint http://127.0.0.1:8000 --ns bodyharmony_lms --db notebooks --user bodyharmony_admin --pass bh_surreal_secure_pass_2026 << 'EOSQL'
REMOVE TABLE IF EXISTS notebooks;
REMOVE TABLE IF EXISTS instances;
REMOVE TABLE IF EXISTS chats;
REMOVE TABLE IF EXISTS studiocontent;
REMOVE TABLE IF EXISTS sources;
REMOVE TABLE IF EXISTS transformationlog;
DEFINE TABLE notebookinstances SCHEMAFULL;
DEFINE FIELD id ON notebookinstances TYPE record<notebookinstances>;
DEFINE FIELD user_id ON notebookinstances TYPE int;
DEFINE FIELD notebook_id ON notebookinstances TYPE string;
DEFINE FIELD created_at ON notebookinstances TYPE datetime;
DEFINE INDEX idx_user_notebook ON notebookinstances COLUMNS user_id, notebook_id UNIQUE;
EOSQL

# 2. Flush no Redis (Filas e jobs do Smartbook)
echo "[2/4] Limpando filas e jobs no Redis..."
docker exec -i bodyharmony-open-notebook redis-cli flushdb || true

# 3. Limpeza de artefatos de mídia e checkpoints SQLite
echo "[3/4] Removendo mídias geradas e checkpoints SQLite do LangGraph..."
docker exec -i bodyharmony-open-notebook sh -c "rm -rf /app/data/media/* /app/data/*.sqlite /app/data/checkpoints/*" || true

# 4. Limpeza da tabela MySQL de cache de artefatos
echo "[4/4] Limpando cache de artefatos no MySQL..."
docker exec -i bodyharmony-db mysql -u root -pbh_db_root_pass_2026 bodyharmony_db -e "TRUNCATE TABLE smartbook_generated_artifacts;" || true

echo "=========================================================="
echo "✅ RESET TOTAL BETA CONCLUÍDO COM SUCESSO!"
echo "=========================================================="
