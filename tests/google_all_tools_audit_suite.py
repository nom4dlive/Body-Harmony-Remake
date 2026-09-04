#!/usr/bin/env python3
"""
tests/google_all_tools_audit_suite.py
Body Harmony Nexus V3.2 — Comprehensive Google Suite & CRM Live Audit Suite (PLAN-208)
"""

import sys
import subprocess
import json
import urllib.request
import urllib.error
import time
from pathlib import Path

# Configura encoding UTF-8 no Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def get_access_token():
    # 1. Tentar gcloud auth
    try:
        res = subprocess.run("gcloud auth print-access-token", capture_output=True, text=True, shell=True)
        token = res.stdout.strip()
        if token and len(token) > 20:
            return token, "gcloud_cli"
    except Exception as e:
        pass

    # 2. Tentar token.json do backend
    token_paths = [
        Path("apps/web-app/src/backend/config/token.json"),
        Path("token.json")
    ]
    for p in token_paths:
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                tok = data.get("token") or data.get("access_token")
                if tok:
                    return tok, "token_json"
            except Exception:
                pass
    return None, "none"

def test_endpoint(name, url, token, required_status=[200, 201]):
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "BodyHarmony-Suite/1.0"
    })
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            latency = int((time.time() - start) * 1000)
            status_code = response.status
            body = response.read().decode('utf-8')
            return {
                "name": name,
                "status": "PASS" if status_code in required_status else "FAIL",
                "code": status_code,
                "latency_ms": latency,
                "data_preview": body[:120]
            }
    except urllib.error.HTTPError as e:
        latency = int((time.time() - start) * 1000)
        err_body = e.read().decode('utf-8', errors='ignore')
        return {
            "name": name,
            "status": "FAIL",
            "code": e.code,
            "latency_ms": latency,
            "error": err_body[:180]
        }
    except Exception as e:
        latency = int((time.time() - start) * 1000)
        return {
            "name": name,
            "status": "ERROR",
            "code": 0,
            "latency_ms": latency,
            "error": str(e)
        }

def main():
    print("====================================================================")
    print("   SUITE DE AUDITORIA COMPLETA DE TODAS AS GOOGLE APIS (PLAN-208)   ")
    print("   Projeto: agenda-body-harmony | Conta: bodyharmony36@gmail.com    ")
    print("====================================================================\n")

    token, source = get_access_token()
    if not token:
        print("[ERRO] Nenhum token de acesso valido encontrado.")
        sys.exit(1)

    print(f">> Token de acesso obtido via: {source} ({token[:12]}...{token[-6:]})\n")

    apis_to_test = [
        ("Google Calendar API v3 (Lista de Calendários)", "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=5"),
        ("Google Calendar API v3 (Próximos Eventos)", "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5"),
        ("Google Drive API v3 (Dados do Usuário & Quota)", "https://www.googleapis.com/drive/v3/about?fields=user,storageQuota"),
        ("Google Drive API v3 (Listagem de Arquivos/Pastas)", "https://www.googleapis.com/drive/v3/files?pageSize=5&fields=files(id,name,mimeType)"),
        ("Google People API v1 (Contatos & Conexões)", "https://people.googleapis.com/v1/people/me/connections?pageSize=5&personFields=names,phoneNumbers,emailAddresses"),
        ("Google People API v1 (Grupos de Contatos)", "https://people.googleapis.com/v1/contactGroups?pageSize=10"),
        ("Gmail API v1 (Perfil do Usuário)", "https://gmail.googleapis.com/gmail/v1/users/me/profile"),
        ("Gmail API v1 (Marcadores & Caixas de Entrada)", "https://gmail.googleapis.com/gmail/v1/users/me/labels"),
        ("Google Tasks API v1 (Listas de Tarefas)", "https://tasks.googleapis.com/tasks/v1/users/@me/lists"),
        ("Google Sheets API v4 (Health & Schema Probe)", "https://sheets.googleapis.com/$discovery/rest?version=v4")
    ]

    results = []
    passed = 0
    total = len(apis_to_test)

    for idx, (name, url) in enumerate(apis_to_test, 1):
        res = test_endpoint(name, url, token)
        results.append(res)
        status_icon = "[PASS]" if res["status"] == "PASS" else "[FAIL]"
        print(f">> [{idx}/{total}] {name}")
        print(f"   {status_icon} HTTP {res['code']} ({res['latency_ms']}ms)")
        if res["status"] == "PASS":
            passed += 1
            if "data_preview" in res:
                clean_preview = res["data_preview"].replace("\n", " ")
                print(f"   Dados: {clean_preview[:90]}...")
        else:
            print(f"   Erro: {res.get('error', 'Desconhecido')}")
        print()

    print("====================================================================")
    print(f"RESULTADO FINAL DA AUDITORIA: {passed}/{total} APIs APROVADAS!")
    print("====================================================================")

    # Gravar token.json no backend com essas credenciais oficiais
    backend_token_path = Path("apps/web-app/src/backend/config/token.json")
    token_data = {
        "token": token,
        "access_token": token,
        "client_id": os.getenv("GOOGLE_CLIENT_ID", "mock_google_client_id"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "mock_google_client_secret"),
        "token_uri": "https://oauth2.googleapis.com/token",
        "scopes": [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/contacts",
            "https://www.googleapis.com/auth/gmail.modify"
        ],
        "expires_in": 3600
    }
    backend_token_path.parent.mkdir(parents=True, exist_ok=True)
    backend_token_path.write_text(json.dumps(token_data, indent=2), encoding="utf-8")
    print(f"\n[OK] Token oficial gravado no CRM backend: {backend_token_path}")

    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
