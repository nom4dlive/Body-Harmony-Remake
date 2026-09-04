#!/usr/bin/env python3
"""
scripts/devops/sync_project_to_gdrive.py
Body Harmony Nexus Protocol V3.1 — Google Drive Project Clone & Sync (PLAN-161)

Clona a estrutura essencial do repositório (Specs, Código, Infraestrutura, Schemas)
para a pasta Central_de_Projetos no Google Drive, com exclusão estrita de binários,
mídias pesadas, dependências e backups.
"""

import os
import sys
import json
import time
import mimetypes
from pathlib import Path
from typing import Dict, List, Set

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from googleapiclient.errors import HttpError
except ImportError:
    print("❌ Dependências ausentes. Instalando google-api-python-client google-auth-oauthlib...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-api-python-client", "google-auth-oauthlib"])
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from googleapiclient.errors import HttpError

# Configurações do Google OAuth
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
SCOPES = ["https://www.googleapis.com/auth/drive"]

TOKEN_PATH = Path("C:/Users/NOM4D/.gemini/antigravity/google_drive_user_token.json")
ROOT_DIR = Path("F:/Body-Harmony-Remake")
TARGET_FOLDER_ID = "1iGIhPf5OTo8WZkGr8WGPlQM5Qt0ibePh"
CLONE_FOLDER_NAME = "Body-Harmony-Remake"

# Diretórios Excluídos
EXCLUDED_DIRS = {
    "node_modules", "vendor", ".git", ".venv", ".gemini", "dist", "build",
    "uploads", "private_uploads", "__pycache__", ".system_generated",
    ".idea", ".vscode", "tmp", "temp", "postgres_data", "redis_data",
    "chatwoot_data", "evolution_instances", "evolution_store", "ttfonts"
}

# Extensões Excluídas
EXCLUDED_EXTS = {
    ".mp4", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".aac", ".flac",
    ".zip", ".tar", ".gz", ".tgz", ".7z", ".rar", ".iso", ".vhdx",
    ".vmdk", ".exe", ".dmg", ".bin", ".map", ".log", ".tmp", ".ttf", ".otf"
}

# Limite de tamanho por arquivo (10 MB)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def get_drive_service():
    """Obtém cliente autenticado do Google Drive API v3."""
    creds = None
    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        except Exception as e:
            print(f"⚠️ Erro ao ler token salvo: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                print("🔄 Renovando token OAuth expirado...")
                creds.refresh(Request())
            except Exception as e:
                print(f"⚠️ Falha ao renovar: {e}, iniciando novo fluxo...")
                creds = None

        if not creds:
            print("\n🔑 Iniciando autenticação OAuth com Google Drive no navegador...")
            client_config = {
                "installed": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:8088/"]
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=8088, prompt="consent")

        TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_PATH, "w", encoding="utf-8") as f:
            f.write(creds.to_json())
        print(f"✅ Token salvo em {TOKEN_PATH}")

    return build("drive", "v3", credentials=creds)


def get_or_create_folder(service, name: str, parent_id: str) -> str:
    """Busca ou cria uma pasta no Google Drive."""
    query = f"name = '{name}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    res = service.files().list(q=query, spaces="drive", fields="files(id, name)").execute()
    files = res.get("files", [])
    if files:
        return files[0]["id"]

    folder_metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id]
    }
    folder = service.files().create(body=folder_metadata, fields="id").execute()
    print(f"📁 Pasta criada no Drive: {name} (ID: {folder['id']})")
    return folder["id"]


def list_existing_files_in_folder(service, folder_id: str) -> Dict[str, str]:
    """Lista arquivos existentes em uma pasta para evitar uploads duplicados."""
    query = f"'{folder_id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"
    res = service.files().list(q=query, spaces="drive", fields="files(id, name)").execute()
    return {f["name"]: f["id"] for f in res.get("files", [])}


def scan_project_files() -> List[Path]:
    """Varre o projeto respeitando as regras de exclusão."""
    eligible_files = []
    for root, dirs, files in os.walk(ROOT_DIR):
        # Filtrar diretórios in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith(".")]

        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in EXCLUDED_EXTS:
                continue
            if file.startswith(".env") and not file.endswith(".example"):
                # Ignorar .env reais por segurança adicional se não solicitado
                pass
            try:
                if file_path.stat().st_size > MAX_FILE_SIZE_BYTES:
                    continue
                eligible_files.append(file_path)
            except (OSError, PermissionError):
                continue

    return eligible_files


def upload_file(service, local_path: Path, parent_folder_id: str, existing_files: Dict[str, str]):
    """Faz upload de um arquivo para o Google Drive."""
    filename = local_path.name
    mime_type, _ = mimetypes.guess_type(str(local_path))
    if not mime_type:
        mime_type = "text/plain" if local_path.suffix in {".md", ".php", ".json", ".jsx", ".js", ".sql", ".sh", ".ps1", ".yml", ".yaml"} else "application/octet-stream"

    file_metadata = {
        "name": filename,
        "parents": [parent_folder_id]
    }

    media = MediaFileUpload(str(local_path), mimetype=mime_type, resumable=True)

    if filename in existing_files:
        # Atualizar arquivo existente
        file_id = existing_files[filename]
        service.files().update(fileId=file_id, media_body=media).execute()
        return file_id, "updated"
    else:
        # Criar novo arquivo
        created = service.files().create(body=file_metadata, media_body=media, fields="id").execute()
        return created["id"], "created"


def main():
    print("==========================================================")
    print("  GOOGLE DRIVE PROJECT CLONE & SYNC — BODY HARMONY V3.1   ")
    print("==========================================================")
    print(f"Fonte Local: {ROOT_DIR}")
    print(f"Destino Drive: Central_de_Projetos ({TARGET_FOLDER_ID})\n")

    service = get_drive_service()

    # 1. Verificar/Criar pasta raiz do clone
    clone_root_id = get_or_create_folder(service, CLONE_FOLDER_NAME, TARGET_FOLDER_ID)

    # 2. Varrer arquivos locais
    print("\n🔍 Analisando árvore de arquivos locais...")
    files_to_sync = scan_project_files()
    total_files = len(files_to_sync)
    total_bytes = sum(f.stat().st_size for f in files_to_sync)
    print(f"✅ Total de arquivos selecionados: {total_files} ({total_bytes / (1024*1024):.2f} MB)")

    # 3. Mapeamento de pastas remotas
    folder_id_map: Dict[str, str] = {"": clone_root_id}
    existing_files_cache: Dict[str, Dict[str, str]] = {}

    success_count = 0
    error_count = 0
    categories_count = {
        "governance_specs": 0,
        "source_code": 0,
        "infrastructure_devops": 0,
        "configs_schemas": 0
    }

    start_time = time.time()

    for idx, local_file in enumerate(files_to_sync, 1):
        rel_path = local_file.relative_to(ROOT_DIR)
        rel_dir = str(rel_path.parent).replace("\\", "/")
        if rel_dir == ".":
            rel_dir = ""

        # Garantir hierarquia de pastas remotas
        if rel_dir not in folder_id_map:
            parts = rel_dir.split("/")
            curr_path = ""
            curr_parent_id = clone_root_id
            for part in parts:
                curr_path = f"{curr_path}/{part}" if curr_path else part
                if curr_path not in folder_id_map:
                    folder_id = get_or_create_folder(service, part, curr_parent_id)
                    folder_id_map[curr_path] = folder_id
                curr_parent_id = folder_id_map[curr_path]

        target_parent_id = folder_id_map[rel_dir]

        # Cache de arquivos na pasta remota
        if target_parent_id not in existing_files_cache:
            existing_files_cache[target_parent_id] = list_existing_files_in_folder(service, target_parent_id)

        existing_files = existing_files_cache[target_parent_id]

        # Categorização
        rel_str = str(rel_path).replace("\\", "/")
        if "openspec" in rel_str or rel_str.endswith(".md"):
            categories_count["governance_specs"] += 1
        elif "apps/web-app/src" in rel_str:
            categories_count["source_code"] += 1
        elif "infrastructure" in rel_str or "Operations" in rel_str or "scripts" in rel_str:
            categories_count["infrastructure_devops"] += 1
        else:
            categories_count["configs_schemas"] += 1

        # Upload com retries
        for attempt in range(3):
            try:
                file_id, action = upload_file(service, local_file, target_parent_id, existing_files)
                success_count += 1
                if idx % 10 == 0 or idx == total_files:
                    elapsed = time.time() - start_time
                    print(f"[{idx}/{total_files}] ({success_count/total_files*100:.1f}%) {rel_str} -> {action} (ID: {file_id})")
                break
            except Exception as e:
                if attempt == 2:
                    print(f"❌ Falha no arquivo {rel_str}: {e}")
                    error_count += 1
                else:
                    time.sleep(1.5)

    # 4. Gerar manifesto de conclusão
    manifest = {
        "target_folder_id": TARGET_FOLDER_ID,
        "target_folder_name": "Central_de_Projetos",
        "clone_root_id": clone_root_id,
        "clone_root_name": CLONE_FOLDER_NAME,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_files": success_count,
        "total_bytes": total_bytes,
        "categories": categories_count,
        "exclusions_applied": list(EXCLUDED_DIRS) + list(EXCLUDED_EXTS)
    }

    manifest_file = ROOT_DIR / "drive_clone_manifest.json"
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("\n==========================================================")
    print("           SINCRONIZAÇÃO GOOGLE DRIVE CONCLUÍDA!          ")
    print("==========================================================")
    print(f"✅ Arquivos sincronizados: {success_count}/{total_files}")
    print(f"📁 Pasta Raiz no Drive: Body-Harmony-Remake (ID: {clone_root_id})")
    print(f"📋 Manifesto salvo em: {manifest_file}")
    print("==========================================================")


if __name__ == "__main__":
    main()
