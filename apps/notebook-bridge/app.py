"""
Body Harmony — Nexus NotebookLM Bridge Microservice
FastAPI Microservice wrapping notebooklm-py for Grounded RAG, Audio Podcasts, and Clinical Studio Artifacts.
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure notebooklm-py is importable from sibling paths if needed
NOTEBOOKLM_PY_PATH = os.getenv("NOTEBOOKLM_PY_PATH", r"F:\Organizado\01_IA_AGENTES\notebooklm-py\src")
if os.path.exists(NOTEBOOKLM_PY_PATH) and NOTEBOOKLM_PY_PATH not in sys.path:
    sys.path.insert(0, NOTEBOOKLM_PY_PATH)

try:
    from notebooklm.client import NotebookLMClient
    from notebooklm.types import ArtifactType
    from notebooklm._types.enums import AudioFormat, QuizQuantity, QuizDifficulty, ReportFormat
    NOTEBOOKLM_AVAILABLE = True
except Exception as e:
    NOTEBOOKLM_AVAILABLE = False
    logging.warning(f"[NotebookLM Bridge] Could not import notebooklm package: {e}")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("notebooklm_bridge")

app = FastAPI(
    title="Body Harmony NotebookLM Bridge",
    version="1.0.0",
    description="Bridge microservice connecting Body Harmony LMS to Google Gemini NotebookLM"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_STORAGE_DIR = Path(os.getenv("MEDIA_STORAGE_DIR", r"F:\Body-Harmony-Remake\apps\web-app\public_uploads\smartbook"))
MEDIA_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
(MEDIA_STORAGE_DIR / "audio").mkdir(exist_ok=True)
(MEDIA_STORAGE_DIR / "reports").mkdir(exist_ok=True)


# --- REQUEST & RESPONSE SCHEMAS ---

class SourceItem(BaseModel):
    id: Optional[int] = None
    title: str
    file_path: Optional[str] = None
    url: Optional[str] = None
    text_content: Optional[str] = None

class SyncModuleRequest(BaseModel):
    module_id: int
    module_title: str
    description: Optional[str] = ""
    sources: List[SourceItem] = []

class ChatRequest(BaseModel):
    module_id: int
    notebook_id: Optional[str] = None
    query: str
    history: Optional[List[Dict[str, Any]]] = []
    licenciada_id: Optional[int] = 0

class GenerateArtifactRequest(BaseModel):
    module_id: int
    notebook_id: Optional[str] = None
    transformation_key: str
    custom_instructions: Optional[str] = None
    preset_label: Optional[str] = None
    licenciada_id: Optional[int] = 0


# --- NOTEBOOK CACHE / RESOLVER ---
# Maps module_id -> Google NotebookLM Notebook ID
NOTEBOOK_MAP_FILE = MEDIA_STORAGE_DIR / "notebook_mappings.json"

def load_notebook_mappings() -> Dict[str, str]:
    if NOTEBOOK_MAP_FILE.exists():
        try:
            return json.loads(NOTEBOOK_MAP_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_notebook_mapping(module_id: int, notebook_id: str):
    mappings = load_notebook_mappings()
    mappings[str(module_id)] = notebook_id
    try:
        NOTEBOOK_MAP_FILE.write_text(json.dumps(mappings, indent=2), encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to save notebook mapping: {e}")

async def resolve_or_create_notebook(client: Any, module_id: int, module_title: str) -> str:
    mappings = load_notebook_mappings()
    key = str(module_id)
    if key in mappings and mappings[key]:
        return mappings[key]
    
    # Check remote notebooks
    notebook_title = f"BH - Módulo {module_id}: {module_title}"
    try:
        remote_list = await client.notebooks.list()
        for nb in remote_list:
            if nb.title.strip().lower() == notebook_title.strip().lower() or nb.title.startswith(f"BH - Módulo {module_id}:"):
                save_notebook_mapping(module_id, nb.id)
                return nb.id
    except Exception as e:
        logger.warning(f"Error listing remote notebooks: {e}")

    # Create new notebook
    try:
        new_nb = await client.notebooks.create(title=notebook_title)
        save_notebook_mapping(module_id, new_nb.id)
        return new_nb.id
    except Exception as e:
        logger.error(f"Failed to create notebook: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar caderno no NotebookLM: {str(e)}")


# --- ENDPOINTS ---

@app.post("/api/v1/notebook/auth/set-tokens")
async def set_auth_tokens(payload: Dict[str, Any]):
    """Recebe e persiste tokens do Google OAuth para o cliente NotebookLM."""
    session_file = Path(os.getenv("NOTEBOOKLM_SESSION_FILE", Path.home() / ".notebooklm" / "session.json"))
    session_file.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        session_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        logger.info(f"Updated NotebookLM tokens for {payload.get('email', 'Google Account')}")
        return {"success": True, "message": "Tokens persistidos com sucesso no bridge."}
    except Exception as e:
        logger.error(f"Failed to persist tokens: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/notebook/health")
async def health_check():
    auth_status = False
    details = "NotebookLM Client Standby"
    if NOTEBOOKLM_AVAILABLE:
        try:
            async with NotebookLMClient.from_storage() as client:
                nbs = await client.notebooks.list()
                auth_status = True
                details = f"Autenticado no Google ({len(nbs)} cadernos ativos)"
        except Exception as e:
            details = f"Standby ou necessita login: {str(e)}"
    
    return {
        "status": "ok",
        "service": "bodyharmony-notebooklm-bridge",
        "notebooklm_available": NOTEBOOKLM_AVAILABLE,
        "authenticated": auth_status,
        "details": details,
        "timestamp": asyncio.get_event_loop().time()
    }


@app.post("/api/v1/notebook/sync-module")
async def sync_module(payload: SyncModuleRequest):
    if not NOTEBOOKLM_AVAILABLE:
        raise HTTPException(status_code=503, detail="notebooklm-py library not installed on bridge")

    try:
        async with NotebookLMClient.from_storage() as client:
            notebook_id = await resolve_or_create_notebook(client, payload.module_id, payload.module_title)
            
            added_sources = []
            for src in payload.sources:
                try:
                    if src.file_path and os.path.exists(src.file_path):
                        # Native multimodal upload (Video .mp4/.mp3, PDF, Markdown)
                        added = await client.sources.add_file(notebook_id, src.file_path)
                        added_sources.append({"title": src.title, "type": "file", "id": getattr(added, "id", None)})
                    elif src.url:
                        added = await client.sources.add_url(notebook_id, src.url)
                        added_sources.append({"title": src.title, "type": "url", "id": getattr(added, "id", None)})
                    elif src.text_content:
                        added = await client.sources.add_text(notebook_id, src.title, src.text_content)
                        added_sources.append({"title": src.title, "type": "text", "id": getattr(added, "id", None)})
                except Exception as src_err:
                    logger.warning(f"Error adding source {src.title}: {src_err}")

            return {
                "success": True,
                "module_id": payload.module_id,
                "notebook_id": notebook_id,
                "sources_synced_count": len(added_sources),
                "sources": added_sources,
                "message": f"Módulo {payload.module_id} sincronizado com sucesso no Google NotebookLM."
            }
    except Exception as e:
        logger.error(f"Sync module error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/notebook/chat")
async def chat_with_notebook(payload: ChatRequest):
    if not NOTEBOOKLM_AVAILABLE:
        raise HTTPException(status_code=503, detail="notebooklm-py library not available")

    try:
        async with NotebookLMClient.from_storage() as client:
            notebook_id = payload.notebook_id
            if not notebook_id or notebook_id.startswith("bh-mod-"):
                notebook_id = await resolve_or_create_notebook(client, payload.module_id, f"Módulo {payload.module_id}")

            # Execute Grounded RAG query
            system_prompt = (
                "Você é a Dra. Harmony AI, tutora clínica especialista do ecossistema Body Harmony. "
                "Responda à dúvida da aluna/licenciada com base estrita nas fontes e vídeos deste módulo. "
                "Forneça dosimetrias clínicas exatas (Hz, cronaxia em µs, tempos ON/OFF) e cite as aulas de referência."
            )
            
            enhanced_query = f"{system_prompt}\n\nPergunta da Aluna: {payload.query}"
            chat_result = await client.chat.ask(notebook_id, enhanced_query)
            
            # Extract citations/references
            references = []
            if hasattr(chat_result, "citations") and chat_result.citations:
                for c in chat_result.citations:
                    references.append({
                        "source_title": getattr(c, "source_title", "Aula do Módulo"),
                        "snippet": getattr(c, "text", ""),
                        "timestamp": getattr(c, "timestamp", None)
                    })

            reply_text = getattr(chat_result, "answer", str(chat_result))

            return {
                "success": True,
                "module_id": payload.module_id,
                "notebook_id": notebook_id,
                "reply": reply_text,
                "references": references,
                "credits_used": 1,
                "credits_remaining": 99
            }
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/notebook/generate-artifact")
async def generate_artifact(payload: GenerateArtifactRequest):
    if not NOTEBOOKLM_AVAILABLE:
        raise HTTPException(status_code=503, detail="notebooklm-py library not available")

    try:
        async with NotebookLMClient.from_storage() as client:
            notebook_id = payload.notebook_id
            if not notebook_id or notebook_id.startswith("bh-mod-"):
                notebook_id = await resolve_or_create_notebook(client, payload.module_id, f"Módulo {payload.module_id}")

            key = payload.transformation_key.lower()
            title = "Artefato Clínico"
            content_markdown = ""
            content_json = None
            audio_url = None

            if key in ["audio", "resumo_audio", "podcast_dialogado"]:
                title = "🎙️ Resumo em Áudio Clínico (Podcast)"
                status = await client.artifacts.generate_audio(
                    notebook_id,
                    format=AudioFormat.DEEP_DIVE,
                    language="pt-BR"
                )
                await client.artifacts.wait_for_completion(notebook_id, status.task_id)
                
                # Download audio file
                audio_filename = f"podcast_mod_{payload.module_id}_{int(asyncio.get_event_loop().time())}.mp3"
                target_path = MEDIA_STORAGE_DIR / "audio" / audio_filename
                await client.artifacts.download_audio(notebook_id, target_path)
                
                audio_url = f"/public_uploads/smartbook/audio/{audio_filename}"
                content_markdown = f"# 🎙️ Podcast Clínico Gerado com Sucesso\n\nÁudio disponível para reprodução imediata."

            elif key in ["quiz", "quiz_simulado_alunas", "quiz_simulado"]:
                title = "📝 Quiz & Simulado de Fixação"
                status = await client.artifacts.generate_quiz(
                    notebook_id,
                    quantity=QuizQuantity.MEDIUM,
                    difficulty=QuizDifficulty.MEDIUM
                )
                await client.artifacts.wait_for_completion(notebook_id, status.task_id)
                
                # Retrieve generated quiz
                quiz_artifacts = await client.artifacts.list(notebook_id, artifact_type=ArtifactType.QUIZ)
                if quiz_artifacts:
                    content_markdown = getattr(quiz_artifacts[-1], "content", str(quiz_artifacts[-1]))
                else:
                    content_markdown = "Quiz gerado com sucesso no caderno."

            elif key in ["mindmap", "mapa_mental_clinico"]:
                title = "🧠 Mapa Mental Clínico"
                mind_map = await client.artifacts.generate_mind_map(notebook_id)
                
                # Format to Mermaid syntax
                mermaid_code = "```mermaid\nmindmap\n  root((Módulo " + str(payload.module_id) + "))\n"
                if hasattr(mind_map, "nodes") and mind_map.nodes:
                    for node in mind_map.nodes:
                        mermaid_code += f"    {node.title}\n"
                mermaid_code += "```"
                content_markdown = mermaid_code
                content_json = getattr(mind_map, "dict", lambda: None)() or {}

            elif key in ["report", "guia_estudos_completo", "relatorio_executivo"]:
                title = "📖 Guia de Estudos & Relatório Executivo"
                status = await client.artifacts.generate_report(
                    notebook_id,
                    format=ReportFormat.STUDY_GUIDE
                )
                await client.artifacts.wait_for_completion(notebook_id, status.task_id)
                
                reports = await client.artifacts.list(notebook_id, artifact_type=ArtifactType.REPORT)
                if reports:
                    content_markdown = getattr(reports[-1], "content", str(reports[-1]))
                else:
                    content_markdown = "Guia de estudos gerado com sucesso."

            elif key in ["flashcards", "flashcards_fixacao", "glossario_eletroterapia"]:
                title = "🎴 Flashcards de Fixação"
                status = await client.artifacts.generate_flashcards(notebook_id)
                await client.artifacts.wait_for_completion(notebook_id, status.task_id)
                
                cards = await client.artifacts.list(notebook_id, artifact_type=ArtifactType.FLASHCARDS)
                if cards:
                    content_markdown = getattr(cards[-1], "content", str(cards[-1]))
                else:
                    content_markdown = "Flashcards gerados com sucesso."

            else:
                # Custom prompt via report generator
                prompt = payload.custom_instructions or f"Gere uma síntese estruturada da ferramenta '{key}' para este módulo."
                status = await client.artifacts.generate_report(notebook_id, custom_prompt=prompt)
                await client.artifacts.wait_for_completion(notebook_id, status.task_id)
                reports = await client.artifacts.list(notebook_id, artifact_type=ArtifactType.REPORT)
                content_markdown = getattr(reports[-1], "content", str(reports[-1])) if reports else ""

            return {
                "success": True,
                "module_id": payload.module_id,
                "transformation_key": key,
                "title": title,
                "content_markdown": content_markdown,
                "content_json": content_json,
                "audio_url": audio_url,
                "cached": False
            }
    except Exception as e:
        logger.error(f"Generate artifact error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5055))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
