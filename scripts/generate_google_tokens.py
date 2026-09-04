#!/usr/bin/env python3
"""
scripts/generate_google_tokens.py
Body Harmony Nexus V3.1 — Dedicated Google Workspace OAuth2 Token Generator (PLAN-183)

Gera e renova credenciais OAuth2 (token.json) para a conta oficial bodyharmony36@gmail.com
com escopos dedicados de Drive, Calendar, People (Contacts) e Gmail.
"""

import os
import sys
import json
from pathlib import Path

# Suporte a UTF-8 no Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Escopos dedicados do ecossistema Body Harmony
SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/gmail.modify'
]

DEFAULT_CLIENT_SECRET_PATHS = [
    Path('apps/web-app/src/backend/config/client_secret.json'),
    Path('client_secret_574169377647-iafp0fdog1o0t84htjarigclm6fpdovo.apps.googleusercontent.com.json'),
    Path('/opt/bodyharmony-crm/client_secret.json'),
    Path('client_secret.json')
]

DEFAULT_TOKEN_PATHS = [
    Path('apps/web-app/src/backend/config/token.json'),
    Path('/opt/bodyharmony-crm/token.json'),
    Path('token.json')
]

def find_client_secret() -> Path:
    for p in DEFAULT_CLIENT_SECRET_PATHS:
        if p.exists():
            return p
    return DEFAULT_CLIENT_SECRET_PATHS[0]

def find_token_path() -> Path:
    for p in DEFAULT_TOKEN_PATHS:
        if p.parent.exists():
            return p
    return DEFAULT_TOKEN_PATHS[0]

def generate_tokens(client_secret_file: str = None, token_output_file: str = None, port: int = 8085):
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
    except ImportError:
        print("[ERRO] Dependencias ausentes. Execute: pip install google-auth-oauthlib google-api-python-client")
        sys.exit(1)

    secret_path = Path(client_secret_file) if client_secret_file else find_client_secret()
    token_path = Path(token_output_file) if token_output_file else find_token_path()

    if not secret_path.exists():
        print(f"[AVISO] Arquivo client_secret nao encontrado em: {secret_path}")
        print("[DICA] Crie o arquivo client_secret.json do app Body Harmony no Google Cloud Console.")
        return

    creds = None
    if token_path.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        except Exception as e:
            print(f"[AVISO] Token existente invalido: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("[INFO] Renovando token de acesso expirado...")
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"[AVISO] Falha ao renovar: {e}. Iniciando novo login OAuth...")
                creds = None

        if not creds:
            print("[INFO] Iniciando fluxo OAuth2 para a conta: bodyharmony36@gmail.com")
            print("[INFO] Abrindo navegador para autorizacao...")
            flow = InstalledAppFlow.from_client_secrets_file(str(secret_path), SCOPES)
            creds = flow.run_local_server(port=port, prompt='consent', access_type='offline')

        token_path.parent.mkdir(parents=True, exist_ok=True)
        with open(token_path, 'w', encoding='utf-8') as f:
            f.write(creds.to_json())

        # Permissoes estritas no Linux/VPS (REGRA 2)
        try:
            os.chmod(str(token_path), 0o600)
        except Exception:
            pass

        print(f"[SUCESSO] Token OAuth2 exclusivo gravado com sucesso em: {token_path}")
    else:
        print(f"[SUCESSO] Token ja valido e ativo para os escopos Body Harmony em: {token_path}")

def main():
    print("=== Body Harmony Dedicated Google Workspace Token Generator ===")
    print("Conta Oficial Alvo: bodyharmony36@gmail.com\n")
    generate_tokens()

if __name__ == '__main__':
    main()
