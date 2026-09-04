/**
 * SmartBook Native Frontend Service
 * Nexus Protocol V3.1 — REGRA 1 & REGRA 14
 * Conexão autenticada e tipada com o Microserviço Headless do Smart Book
 */

import { request } from './api';
import type {
  SmartBookRagQueryRequest,
  SmartBookRagQueryResponse,
  SmartBookTransformationRequest,
  SmartBookTransformationResponse,
  SmartBookSyncNotebookRequest,
  SmartBookSyncNotebookResponse,
  SmartBookNotebook,
  SmartBookSource
} from '../types/SmartBookContracts';

export const smartBookService = {
  /**
   * Consulta RAG Clínica com a Dra. Harmony AI sobre as fontes do caderno
   */
  async queryDraHarmony(payload: SmartBookRagQueryRequest): Promise<SmartBookRagQueryResponse> {
    return await request('/v1/smartbook/query', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  /**
   * Executa Ação 1-Clique (Mapa Mental Mermaid, Quiz, Guia de Estudos, etc.)
   */
  async executeTransformation(payload: SmartBookTransformationRequest): Promise<SmartBookTransformationResponse> {
    return await request('/v1/smartbook/transformations/execute', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  /**
   * Sincronização de Módulos e Aulas do LMS para o Grafo SurrealDB (Exclusivo Gestor)
   */
  async syncNotebookFromLms(payload: SmartBookSyncNotebookRequest): Promise<SmartBookSyncNotebookResponse> {
    return await request('/v1/smartbook/sync/notebook', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  /**
   * Lista todos os cadernos clínicos disponíveis
   */
  async listNotebooks(): Promise<SmartBookNotebook[]> {
    return await request('/notebooks', {
      method: 'GET'
    });
  },

  /**
   * Lista fontes oficiais vinculadas
   */
  async listSources(): Promise<SmartBookSource[]> {
    return await request('/sources', {
      method: 'GET'
    });
  }
};
