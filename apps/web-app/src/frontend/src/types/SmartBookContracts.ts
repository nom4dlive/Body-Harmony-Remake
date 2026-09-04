/**
 * SmartBook Native TypeScript Contracts
 * Nexus Protocol V3.1 — REGRA 1 (Strict API Contracts)
 * Frontend SPA (React / Vite) <-> Backend Headless (FastAPI / SurrealDB)
 */

export type SmartBookRole = 'GESTOR' | 'LICENCIADA';

export type SourceType = 'pdf' | 'audio' | 'video' | 'text' | 'url';

export type TransformationKey =
  | 'mapa_mental_clinico'
  | 'quiz_simulado_alunas'
  | 'guia_estudos_completo'
  | 'linha_tempo_tratamento'
  | 'glossario_eletroterapia'
  | 'podcast_dialogado'
  | 'infografico_clinico';

export type TransformationOutputType =
  | 'mermaid'
  | 'markdown'
  | 'quiz'
  | 'timeline'
  | 'glossary'
  | 'audio'
  | 'chart'
  | 'image';

// ============================================================================
// 1. RAG QUERY (CONSULTA CLÍNICA DRA. HARMONY)
// ============================================================================

export interface SmartBookChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SmartBookSourceCitation {
  source_id: string;
  title: string;
  source_type: SourceType;
  relevance_score?: number;
  snippet?: string;
}

export interface SmartBookRagQueryRequest {
  notebook_id: string;
  query: string;
  chat_history?: SmartBookChatMessage[];
}

export interface SmartBookRagQueryResponse {
  answer: string;
  sources_cited: SmartBookSourceCitation[];
  model_used?: string;
  timestamp?: string;
}

// ============================================================================
// 2. EXECUTE TRANSFORMATION (AÇÕES 1-CLIQUE)
// ============================================================================

export interface SmartBookTransformationRequest {
  notebook_id: string;
  transformation_key: TransformationKey;
  source_ids?: string[];
  async_mode?: boolean;
}

export interface SmartBookTransformationResponse {
  status: 'completed' | 'processing' | 'failed';
  task_id?: string;
  transformation_key?: string;
  output_type?: TransformationOutputType;
  result?: string;
  audio_url?: string;
  image_url?: string;
  created_at?: string;
}

// ============================================================================
// 3. NOTEBOOK SYNC (SINCRONIZAÇÃO LMS -> SURREALDB PELO GESTOR)
// ============================================================================

export interface SmartBookSyncLesson {
  lesson_id: number;
  title: string;
  source_type: 'video' | 'audio' | 'pdf' | 'text';
  file_path?: string;
  transcription_text?: string;
}

export interface SmartBookSyncNotebookRequest {
  lms_module_id: number;
  title: string;
  description?: string;
  lessons?: SmartBookSyncLesson[];
}

export interface SmartBookSyncNotebookResponse {
  success: boolean;
  lms_module_id: number;
  surreal_notebook_id: string;
  sources_synced: number;
  synced_at: string;
}

// ============================================================================
// 4. METADADOS DE CADERNO E FONTE
// ============================================================================

export interface SmartBookNotebook {
  id: string;
  name: string;
  description?: string;
  is_default?: boolean;
  created_by?: string;
  sources_count: number;
  created_at?: string;
}

export interface SmartBookSource {
  id: string;
  title: string;
  source_type: SourceType;
  content?: string;
  url?: string;
  file_path?: string;
  is_official: boolean;
  created_at?: string;
}
