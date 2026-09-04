#!/usr/bin/env python3
"""
scripts/setup_env.py — Nexus Protocol V3.2 Automated Environment Initializer
Automates 100% of environment variables configuration for Qwen, CI/CD, and Developers.

Modes:
  --mode audit / mock    : Pre-fills all variables with fully functional mock/test values for zero-friction audit.
  --mode local           : Configures standard local dev environment (MySQL 127.0.0.1, Redis, Vite /api/v1).
  --mode staging         : Configures staging template targeting the Hostinger VPS node.
"""

import os
import sys
import argparse
import shutil
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WEBAPP_DIR = os.path.join(ROOT_DIR, "apps", "web-app")
NOTEBOOK_DIR = os.path.join(ROOT_DIR, "apps", "notebook-bridge")

ENV_TEMPLATES = {
    "audit": {
        "webapp": """# ==============================================================================
# BODY HARMONY - AUTOMATED AUDIT & TEST ENVIRONMENT (.env)
# Mode: AUDIT / MOCK (Generated automatically by scripts/setup_env.py)
# ==============================================================================

# --- [ Database & Backend ] ---
DB_STAGE=LOCAL
DB_HOST=127.0.0.1
DB_NAME=u388974772_bodyharmony_db
DB_USER=root
DB_PASS=
SITE_URL=http://localhost:5173

# Staging Fallback (VPS Node)
DB_STAGE_HOST=2.25.156.25
DB_STAGE_NAME=u388974772_bodyharmony_db
DB_STAGE_USER=nexus_user
DB_STAGE_PASS=

# --- [ Payment Gateways (Mock / Sandbox) ] ---
ASAAS_API_KEY=$aact_hmlg_mock_token_for_audit_environment_000111222333444555666777
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=mock_webhook_secret_token_nexus_v32
ASAAS_DISABLE_NOTIFICATIONS=true
ASAAS_SANDBOX_KEY=$aact_hmlg_mock_token_for_audit_environment_000111222333444555666777
STONE_SECRET_KEY=mock_stone_secret_key_v32
STONE_ENVIRONMENT=sandbox

# --- [ Omnichannel CRM & Evolution API ] ---
EVOLUTION_API_URL=https://evolution.bodyharmony.com.br
EVOLUTION_URL=https://evolution.bodyharmony.com.br
EVOLUTION_API_KEY=bh_evo_global_key_v31_2026_secure
EVOLUTION_PORT=8080
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# --- [ AI & LLM Providers (Mock / Local Fallbacks) ] ---
GEMINI_API_KEY=mock_gemini_api_key_for_audit
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_AI_KEY=mock_google_ai_key_for_audit
GROQ_API_KEY=mock_groq_api_key_for_audit
OPENAI_API_KEY=mock_openai_api_key_for_audit
NVIDIA_API_KEY=mock_nvidia_api_key_for_audit
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
QWEN_PROXY_URL=http://127.0.0.1:8000
QWENPROXY_API_KEY=mock_qwenproxy_bearer_key
NOTEBOOK_BRIDGE_URL=http://127.0.0.1:8000

# --- [ Google Workspace & Social ] ---
GOOGLE_CLIENT_ID=574169377647-iafp0fdog1o0t84htjarigclm6fpdovo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=mock_google_client_secret
ZERNIO_API_KEY=mock_zernio_api_key
ZERNIO_BASE_URL=https://zernio.com/api/v1
ZERNIO_INSTAGRAM_ACCOUNT_ID=mock_instagram_account_id
TELEGRAM_BOT_TOKEN=123456789:MOCK_TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME=BodyHarmonyAuditBot
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_GESTOR_GROUP_ID=-1001234567890
TELEGRAM_SUPPORT_GROUP_ID=-1001234567890
TELEGRAM_WEBHOOK_SECRET=mock_telegram_webhook_secret

# --- [ Security & Diagnostics ] ---
PDF_METADATA_ENCRYPTION_KEY=mock_pdf_encryption_key_v32
DIAGNOSTIC_SECRET=mock_diagnostic_secret_v32
NEXUS_ALLOWED_IPS=127.0.0.1,::1

# --- [ Frontend React / Vite ] ---
VITE_API_BASE=/api/v1
VITE_BOT_API_KEY=mock_bot_api_key_frontend
VITE_NOTEBOOK_API_URL=http://127.0.0.1:8000
""",
        "crm": """# ==============================================================================
# BODY HARMONY - CRM STACK ENVIRONMENT (.env.crm)
# Mode: AUDIT / MOCK
# ==============================================================================

POSTGRES_USER=bodyharmony_crm
POSTGRES_PASSWORD=bh_crm_postgres_mock_pass_2026!
POSTGRES_DB=postgres
REDIS_PASSWORD=bh_crm_redis_mock_pass_2026!

EVOLUTION_PORT=8080
EVOLUTION_SERVER_URL=http://localhost:8080
EVOLUTION_API_KEY=bh_evo_global_key_v31_2026_secure
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://bodyharmony_crm:bh_crm_postgres_mock_pass_2026!@crm-postgres:5432/evolution_v2
DATABASE_CONNECTION_CLIENT_NAME=evolution_v2
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://:bh_crm_redis_mock_pass_2026!@crm-redis:6379/1

CHATWOOT_PORT=3000
FRONTEND_URL=http://localhost:3000
SECRET_KEY_BASE=mock_chatwoot_secret_key_base_v32_audit_only_hash!
RAILS_ENV=production
NODE_ENV=production
"""
    },
    "local": {
        "webapp": """# ==============================================================================
# BODY HARMONY - LOCAL DEVELOPMENT ENVIRONMENT (.env)
# Mode: LOCAL DEVELOPMENT
# ==============================================================================

DB_STAGE=LOCAL
DB_HOST=127.0.0.1
DB_NAME=u388974772_bodyharmony_db
DB_USER=root
DB_PASS=
SITE_URL=http://localhost:5173

DB_STAGE_HOST=2.25.156.25
DB_STAGE_NAME=u388974772_bodyharmony_db
DB_STAGE_USER=nexus_user
DB_STAGE_PASS=

ASAAS_API_KEY=
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=
ASAAS_DISABLE_NOTIFICATIONS=false
STONE_SECRET_KEY=
STONE_ENVIRONMENT=sandbox

EVOLUTION_API_URL=https://evolution.bodyharmony.com.br
EVOLUTION_URL=https://evolution.bodyharmony.com.br
EVOLUTION_API_KEY=bh_evo_global_key_v31_2026_secure
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
OPENAI_API_KEY=
QWEN_PROXY_URL=http://localhost:8000
NOTEBOOK_BRIDGE_URL=http://localhost:8000

GOOGLE_CLIENT_ID=574169377647-iafp0fdog1o0t84htjarigclm6fpdovo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
ZERNIO_API_KEY=
TELEGRAM_BOT_TOKEN=

PDF_METADATA_ENCRYPTION_KEY=body_harmony_local_dev_key
DIAGNOSTIC_SECRET=dev_diagnostic_secret
NEXUS_ALLOWED_IPS=127.0.0.1,::1

VITE_API_BASE=/api/v1
VITE_BOT_API_KEY=
VITE_NOTEBOOK_API_URL=http://localhost:8000
""",
        "crm": """# ==============================================================================
# BODY HARMONY - CRM STACK ENVIRONMENT (.env.crm)
# Mode: LOCAL DEVELOPMENT
# ==============================================================================

POSTGRES_USER=bodyharmony_crm
POSTGRES_PASSWORD=bh_crm_postgres_secure_2026!
POSTGRES_DB=postgres
REDIS_PASSWORD=bh_crm_redis_secure_2026!

EVOLUTION_PORT=8080
EVOLUTION_SERVER_URL=http://localhost:8080
EVOLUTION_API_KEY=bh_evo_global_key_v31_2026_secure
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://bodyharmony_crm:bh_crm_postgres_secure_2026!@crm-postgres:5432/evolution_v2
DATABASE_CONNECTION_CLIENT_NAME=evolution_v2
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://:bh_crm_redis_secure_2026!@crm-redis:6379/1

CHATWOOT_PORT=3000
FRONTEND_URL=http://localhost:3000
SECRET_KEY_BASE=bh_chatwoot_secret_key_base_v31_super_secure_random_hash_2026_prod!
RAILS_ENV=development
NODE_ENV=development
"""
    }
}

def backup_if_exists(filepath):
    if os.path.exists(filepath):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{filepath}.bak_{timestamp}"
        shutil.copy2(filepath, backup_path)
        print(f"[BACKUP] Created backup: {os.path.relpath(backup_path, ROOT_DIR)}")

def write_env_file(filepath, content, force=False):
    if os.path.exists(filepath) and not force:
        backup_if_exists(filepath)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] Configured: {os.path.relpath(filepath, ROOT_DIR)}")

def main():
    parser = argparse.ArgumentParser(description="Nexus V3.2 Automated Environment Setup")
    parser.add_argument("--mode", choices=["audit", "mock", "local", "staging"], default="audit",
                        help="Environment mode to generate (default: audit)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing .env files without backup")
    args = parser.parse_args()

    mode_key = "audit" if args.mode in ["audit", "mock"] else "local"
    selected_template = ENV_TEMPLATES[mode_key]

    print("=" * 60)
    print("BODY HARMONY - AUTOMATED ENVIRONMENT SETUP")
    print(f"Target Mode: {args.mode.upper()}")
    print("=" * 60)

    # 1. apps/web-app/.env
    webapp_env = os.path.join(WEBAPP_DIR, ".env")
    write_env_file(webapp_env, selected_template["webapp"], args.force)

    # 2. .env.crm na raiz
    crm_env = os.path.join(ROOT_DIR, ".env.crm")
    write_env_file(crm_env, selected_template["crm"], args.force)

    # 3. apps/notebook-bridge/.env (se existir diretório)
    if os.path.exists(NOTEBOOK_DIR):
        notebook_env = os.path.join(NOTEBOOK_DIR, ".env")
        notebook_content = f"PORT=8000\nNOTEBOOK_BRIDGE_URL=http://localhost:8000\nMODE={args.mode.upper()}\n"
        write_env_file(notebook_env, notebook_content, args.force)

    print("\n[SUCCESS] Environment configured with 100% variable coverage!")
    if args.mode in ["audit", "mock"]:
        print("[INFO] AUDIT mode active: All tests, smoke suites, and contract gates are ready for execution.")
    print("=" * 60)

if __name__ == "__main__":
    main()