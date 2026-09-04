/**
 * SmartBook API Client — Nexus Protocol V3.1
 * Espelhamento Matemático dos Contratos JSON (openspec/contracts/smartbook/)
 * REGRA 1 (Strict Contracts) & REGRA 14 (Authenticated Client)
 */

import { request } from './api';

const RAW_VPS_URL = import.meta.env.VITE_NOTEBOOK_API_URL || 'https://notebook.bodyharmony.com.br';
export const SMARTBOOK_VPS_BASE = RAW_VPS_URL.replace(/\/+$/, '') + (RAW_VPS_URL.includes('/api/v1') ? '' : '/api/v1');

/**
 * Catálogo Canônico das 9 Ferramentas do Estúdio SmartBook
 * Extraído e sincronizado com o protótipo Smartbook.html
 */
export const STUDIO_TOOLS_CATALOG = {
  audio: {
    id: 'audio',
    title: 'Resumo em Áudio',
    badge: 'Beta Áudio',
    description: 'Síntese em áudio com explicações e tom conversacional',
    icon: 'audio',
    presets: [
      { label: 'Resumo conciso', icon: '⚡', prompt: 'Crie um resumo em áudio conciso com os pontos principais e dosimetrias clínicas em até 3 minutos.' },
      { label: 'Resumo detalhado', icon: '📚', prompt: 'Gere um resumo em áudio detalhado cobrindo todos os parâmetros e protocolos importantes da aula.' },
      { label: 'Foco em conceitos', icon: '💡', prompt: 'Destaque os conceitos-chave de eletroestimulação, cronaxia e fisiologia muscular em formato de áudio.' },
      { label: 'Estilo podcast', icon: '🎙️', prompt: 'Crie um resumo em estilo podcast dialogado entre especialistas com tom conversacional e casos práticos.' },
      { label: 'Para revisão', icon: '🔄', prompt: 'Faça um resumo em áudio ideal para revisão rápida antes de atendimento clínico.' }
    ]
  },
  slides: {
    id: 'slides',
    title: 'Apresentação',
    badge: 'Ativo',
    description: 'Estruturação de slides e tópicos-chave para apresentação',
    icon: 'slides',
    presets: [
      { label: 'Slides para aula', icon: '🎓', prompt: 'Crie uma apresentação com slides estruturados para capacitação clínica da equipe.' },
      { label: 'Pontos principais', icon: '📌', prompt: 'Gere slides destacando os pontos principais de segurança e contraindicações.' },
      { label: 'Estrutura de palestra', icon: '🎤', prompt: 'Monte uma apresentação no formato de palestra com introdução, biofísica, protocolos e casos de sucesso.' },
      { label: 'Visual minimalista', icon: '✨', prompt: 'Crie slides com design minimalista e foco em informações essenciais e dosagens.' },
      { label: 'Com exemplos', icon: '📋', prompt: 'Inclua exemplos práticos de aplicação de eletrodos e condutas em cada slide.' }
    ]
  },
  video: {
    id: 'video',
    title: 'Resumo em Vídeo',
    badge: 'Beta Roteiro',
    description: 'Roteiro cênico com minutagem e sugestões visuais',
    icon: 'video',
    presets: [
      { label: 'Roteiro de vídeo', icon: '🎬', prompt: 'Crie um roteiro completo para um vídeo explicativo de 5 minutos sobre este protocolo.' },
      { label: 'Narrativa visual', icon: '🎥', prompt: 'Desenvolva uma narrativa visual com cenas, demonstração de eletrodos e transições sugeridas.' },
      { label: 'Tutorial passo a passo', icon: '📹', prompt: 'Estruture um tutorial em vídeo com passos claros e objetivos de higienização, posicionamento e calibração.' },
      { label: 'Resumo animado', icon: '🎞️', prompt: 'Crie um roteiro para vídeo explicativo dinâmico destacando os efeitos celulares da corrente.' }
    ]
  },
  mindmap: {
    id: 'mindmap',
    title: 'Mapa Mental',
    badge: 'Nativo',
    description: 'Diagrama conceitual navegável via Mermaid.js',
    icon: 'mindmap',
    presets: [
      { label: 'Mapa conceitual', icon: '🧠', prompt: 'Crie um mapa mental conceitual conectando as ideias e fases da Mentoria 3S.' },
      { label: 'Hierarquia de temas', icon: '🌳', prompt: 'Organize o conteúdo em uma hierarquia de temas: Fisiologia -> Parâmetros -> Aplicação Prática.' },
      { label: 'Relações entre conceitos', icon: '🔗', prompt: 'Destaque as relações e conexões entre frequência (Hz), largura de pulso (µs) e recrutamento de fibras.' },
      { label: 'Mapa de estudo', icon: '📖', prompt: 'Gere um mapa mental otimizado para estudo rápido e memorização das alunas.' }
    ]
  },
  report: {
    id: 'report',
    title: 'Relatórios',
    badge: 'Nativo',
    description: 'Relatório técnico, executivo e laudos clínicos em Markdown',
    icon: 'report',
    presets: [
      { label: 'Relatório executivo', icon: '📊', prompt: 'Gere um relatório executivo com resumo clínico, embasamento científico e recomendações.' },
      { label: 'Análise detalhada', icon: '🔍', prompt: 'Crie uma análise detalhada com dados de bioimpedância, evolução muscular e conclusões.' },
      { label: 'Relatório técnico', icon: '⚙️', prompt: 'Elabore um relatório técnico com especificações de dosimetria, parâmetros e condutas.' },
      { label: 'Resumo para gestão', icon: '👔', prompt: 'Prepare um relatório resumido focado em métricas de adesão e resultados de pacientes.' }
    ]
  },
  flashcards: {
    id: 'flashcards',
    title: 'Flashcards',
    badge: 'Nativo Interativo',
    description: 'Cartões interativos para repetição espaçada e memorização',
    icon: 'flashcards',
    presets: [
      { label: 'Cards de revisão', icon: '📝', prompt: 'Crie 8 flashcards de revisão com perguntas e respostas objetivas sobre os conceitos da aula.' },
      { label: 'Perguntas e respostas', icon: '❓', prompt: 'Gere pares de pergunta e resposta cobrindo parâmetros técnicos e fisiologia.' },
      { label: 'Definições-chave', icon: '📖', prompt: 'Faça flashcards focados em definições e termos de eletroestimulação de alta intensidade.' },
      { label: 'Para memorização', icon: '🧩', prompt: 'Crie flashcards otimizados para memorização ativa dos protocolos corporais e faciais.' }
    ]
  },
  quiz: {
    id: 'quiz',
    title: 'Questionário',
    badge: 'Nativo Interativo',
    description: 'Quiz simulado com pontuação, gabarito e justificativas',
    icon: 'quiz',
    presets: [
      { label: 'Múltipla escolha', icon: '✅', prompt: 'Crie um questionário de múltipla escolha com 5 perguntas desafiadoras e gabarito comentado.' },
      { label: 'Questões dissertativas', icon: '✍️', prompt: 'Gere questões dissertativas que testem a tomada de decisão clínica da licenciada.' },
      { label: 'Verdadeiro ou falso', icon: '⚖️', prompt: 'Crie 6 afirmações para classificar como verdadeiro ou falso com explicação detalhada.' },
      { label: 'Quiz de revisão', icon: '🎯', prompt: 'Monte um quiz completo de revisão com casos práticos e condutas terapêuticas.' }
    ]
  },
  infographic: {
    id: 'infographic',
    title: 'Infográfico',
    badge: 'Nativo Visual',
    description: 'Visualização gráfica de biofísica e estatísticas clínicas',
    icon: 'infographic',
    presets: [
      { label: 'Dados visuais', icon: '📊', prompt: 'Crie um gráfico de comparação de curva de hipertrofia e recrutamento de unidades motoras.' },
      { label: 'Estatísticas-chave', icon: '📈', prompt: 'Organize as estatísticas de aumento de tônus e redução de gordura em formato visual.' },
      { label: 'Linha do tempo', icon: '⏱️', prompt: 'Desenvolva uma linha do tempo de evolução do tratamento nas 3 fases (Sensibilização, Saturação e Sustentação).' },
      { label: 'Comparação visual', icon: '⚖️', prompt: 'Crie um infográfico comparativo entre eletroestimulação isolada vs combinada.' }
    ]
  },
  datatable: {
    id: 'datatable',
    title: 'Tabela de Dados',
    badge: 'Nativo',
    description: 'Tabela estruturada comparativa com exportação CSV/Markdown',
    icon: 'datatable',
    presets: [
      { label: 'Organizar informações', icon: '🗂️', prompt: 'Organize os parâmetros clínicos (Frequência, Largura de Pulso, Tempo On/Off) em uma tabela estruturada.' },
      { label: 'Comparação de dados', icon: '📑', prompt: 'Crie uma tabela comparativa entre os diferentes grupos musculares e suas intensidades ideais.' },
      { label: 'Resumo tabular', icon: '📊', prompt: 'Gere uma tabela com resumo das sessões, dosimetrias e intervalos de descanso recomendados.' },
      { label: 'Catálogo de protocolos', icon: '📁', prompt: 'Estruture o conteúdo em formato de catálogo com categorias e indicações clínicas.' }
    ]
  }
};

/**
 * Matriz de Aliases para compatibilidade retroativa e dual
 */
const LEGACY_ALIASES = {
  mindmap: 'mapa_mental_clinico',
  infographic: 'infografico_clinico',
  quiz: 'quiz_simulado_alunas',
  audio: 'podcast_dialogado',
  report: 'guia_estudos_completo',
  datatable: 'linha_tempo_tratamento',
  flashcards: 'glossario_eletroterapia'
};

/**
 * Helper de resolução Cross-Domain de assets (gráficos, áudios) da VPS
 */
export function resolveNotebookAsset(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const rootDomain = SMARTBOOK_VPS_BASE.replace(/\/api\/v1$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${rootDomain}${cleanPath}`;
}

/**
 * Recupera o Bearer Token de autorização com suporte dinâmico a Licenciada, Aluna e Gestor
 */
function getSmartBookAuthToken() {
  const deviceToken = localStorage.getItem('bh_device_token');
  if (deviceToken) return deviceToken;

  const licAuth = localStorage.getItem('bh_licenciada') || localStorage.getItem('bh_student');
  if (licAuth) {
    try {
      const parsed = JSON.parse(licAuth);
      if (parsed.device_token) return parsed.device_token;
      if (parsed.token) return parsed.token;
      if (parsed.id) return String(parsed.id);
      if (parsed.cpf) return String(parsed.cpf);
    } catch (e) {}
  }

  const adminAuth = localStorage.getItem('bh_auth');
  if (adminAuth) {
    try {
      const parsed = JSON.parse(adminAuth);
      if (parsed.token) return parsed.token;
    } catch (e) {}
  }

  const alunaToken = localStorage.getItem('bh_aluna_token');
  if (alunaToken) return alunaToken;

  return '';
}

/**
 * Helper genérico para chamadas autenticadas diretas à VPS
 */
async function fetchVps(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${SMARTBOOK_VPS_BASE}${cleanEndpoint}`;
  const token = getSmartBookAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMsg = `Erro na requisição Smart Book (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorData.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

export const smartbookApi = {
  /**
   * 1. Consulta RAG Clínica com a Dra. Harmony AI (rag-query.json)
   */
  async queryNotebook(notebook_id, query, chat_history = [], active_source_ids = []) {
    return await fetchVps('/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        notebook_id: String(notebook_id),
        query,
        chat_history,
        active_source_ids
      })
    });
  },

  /**
   * 2. Execução das 9 Ferramentas do Estúdio SmartBook com suporte a fallback dual
   */
  async executeTransformation(notebook_id, transformation_key, source_ids = [], async_mode = false, custom_instructions = '', preset_label = '') {
    const rawKey = transformation_key;
    const primaryKey = rawKey;
    const fallbackKey = LEGACY_ALIASES[rawKey] || rawKey;

    const buildPayload = (key, includeExtended = true) => {
      const base = {
        notebook_id: String(notebook_id || '1'),
        transformation_key: key,
        source_ids: Array.isArray(source_ids) ? source_ids.map(String) : [],
        async_mode: Boolean(async_mode)
      };
      if (includeExtended && (custom_instructions || preset_label)) {
        base.custom_instructions = custom_instructions || '';
        base.preset_label = preset_label || '';
      }
      return base;
    };

    try {
      return await fetchVps('/transform/execute', {
        method: 'POST',
        body: JSON.stringify(buildPayload(primaryKey, true))
      });
    } catch (err) {
      console.warn(`[SmartBookApi] Primeira tentativa falhou (${primaryKey}). Tentando com alias/payload estrito:`, err);
      try {
        return await fetchVps('/transform/execute', {
          method: 'POST',
          body: JSON.stringify(buildPayload(fallbackKey, false))
        });
      } catch (err2) {
        console.warn(`[SmartBookApi] Segunda tentativa falhou (${fallbackKey}):`, err2);
        throw err2;
      }
    }
  },

  /**
   * 2b. Wrapper de execução de ferramenta
   */
  async executeStudioTool(notebook_id, tool_key, options = {}) {
    const { custom_instructions = '', preset_label = '', source_ids = [], async_mode = false } = options;
    return await this.executeTransformation(
      notebook_id,
      tool_key,
      source_ids,
      async_mode,
      custom_instructions,
      preset_label
    );
  },

  /**
   * 3. Sincronização de Módulos e Aulas do LMS para o SurrealDB (notebook-sync.json)
   */
  async syncLmsModuleToSurreal(lms_module_id, title, description = '', lessons = []) {
    return await fetchVps('/notebooks/sync', {
      method: 'POST',
      body: JSON.stringify({
        lms_module_id,
        title,
        description,
        lessons
      })
    });
  },

  /**
   * 3b. Sincronização Simplificada por ID de Módulo (Portal do Gestor)
   */
  async syncNotebook(lms_module_id, title = '', description = '', lessons = []) {
    return await this.syncLmsModuleToSurreal(lms_module_id, title, description, lessons);
  },

  /**
   * 4. Listagem de Fontes do Caderno
   */
  async getNotebookSources(notebook_id) {
    try {
      const res = await fetchVps(`/notebooks/${notebook_id}/sources`, { method: 'GET' });
      if (Array.isArray(res)) return res;
      if (res?.sources && Array.isArray(res.sources)) return res.sources;
    } catch (err) {
      console.warn('[SmartBookApi] Fallback local para fontes do módulo:', err);
    }
    return [];
  },

  /**
   * 5. Listagem de Módulos do LMS para Sincronização e Navegação
   */
  async getLmsModules() {
    try {
      const res = await request('/v1/lms/modules', { method: 'GET' });
      if (Array.isArray(res) && res.length > 0) return res;
      if (res?.modules && Array.isArray(res.modules)) return res.modules;
      if (res?.data && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.warn('[SmartBookApi] Fallback para /v1/aluna/modules:', err);
      try {
        const resAluna = await request('/v1/aluna/modules', { method: 'GET' });
        if (Array.isArray(resAluna) && resAluna.length > 0) return resAluna;
        if (resAluna?.modules && Array.isArray(resAluna.modules)) return resAluna.modules;
      } catch (e2) {}
    }

    return [
      { 
        id: 1, 
        title: 'Mentoria 3S — Protocolo de Eletroestimulação Muscular', 
        description: 'Metodologia exclusiva de 3 fases (Sensibilização, Saturação e Sustentação).', 
        lessons_count: 8, 
        is_synced: true,
        lessons: [
          { id: 101, title: 'Aula 1: Fundamentos da Corrente e Cronaxia Muscular', duration: '18:40', is_synced: true },
          { id: 102, title: 'Aula 2: Posicionamento Anatômico de Eletrodos no Abdômen', duration: '24:15', is_synced: true },
          { id: 103, title: 'Aula 3: Dosimetria e Rampas de Subida/Descida (Rise/Decay)', duration: '20:30', is_synced: true },
          { id: 104, title: 'Aula 4: Protocolos de Remodelamento Glúteo de Alta Intensidade', duration: '31:10', is_synced: true },
          { id: 105, title: 'Aula 5: Gestão de Contraindicações e Cuidados Clínicos', duration: '15:20', is_synced: true }
        ]
      },
      { 
        id: 2, 
        title: 'Biofísica e Dosimetria de Alta Intensidade', 
        description: 'Parâmetros de frequência (Hz), cronaxia muscular e rampas Rise/Decay.', 
        lessons_count: 6, 
        is_synced: true,
        lessons: [
          { id: 201, title: 'Aula 1: Fisiologia da Junção Neuromuscular', duration: '22:00', is_synced: true },
          { id: 202, title: 'Aula 2: Cálculo de Densidade de Corrente por cm²', duration: '19:45', is_synced: true },
          { id: 203, title: 'Aula 3: Prevenção de Fadiga e Períodos Refratários', duration: '25:10', is_synced: true }
        ]
      },
      { 
        id: 3, 
        title: 'Protocolos de Remodelamento Glúteo & Abdominal', 
        description: 'Casos clínicos, posicionamento de eletrodos e condutas combinadas.', 
        lessons_count: 10, 
        is_synced: true,
        lessons: [
          { id: 301, title: 'Aula 1: Avaliação de Ptose Glútea e Tônus', duration: '26:30', is_synced: true },
          { id: 302, title: 'Aula 2: Protocolo Avançado de Hipertrofia Glúteo Médio/Máximo', duration: '35:00', is_synced: true }
        ]
      },
      { 
        id: 4, 
        title: 'Gestão de Resultados Clínicos e Pré/Pós Tratamento', 
        description: 'Bioimpedância, avaliação antropométrica e retenção de alunas.', 
        lessons_count: 5, 
        is_synced: true,
        lessons: [
          { id: 401, title: 'Aula 1: Registro Fotográfico Padronizado e Antropometria', duration: '17:15', is_synced: true },
          { id: 402, title: 'Aula 2: Interpretação de Índices de Massa Magra e Retenção', duration: '21:40', is_synced: true }
        ]
      },
    ];
  }
};
