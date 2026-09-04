/**
 * Universal Mind Map Tree Parser — Nexus Protocol V3.1
 * Converte JSON hierárquico, Markdown de tópicos ou listas em uma Árvore Interativa.
 */

let nodeSeq = 1;

/**
 * Converte qualquer entrada (JSON, Markdown, Texto) em uma estrutura de nós em árvore
 * @param {any} input - Dado bruto retornado pelo LLM ou fallback
 * @returns {object} Nó raiz { id, name, children, level }
 */
export function parseMindMapData(input, fallbackTitle = 'Protocolo Clínico Body Harmony') {
  nodeSeq = 1;

  if (!input) {
    return createDefaultTree(fallbackTitle);
  }

  // 1. Caso seja objeto JSON direto
  if (typeof input === 'object' && !Array.isArray(input)) {
    if (input.title || input.name) {
      return normalizeJsonNode(input, 0);
    }
  }

  // 2. Caso seja string JSON
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.title || parsed.name) {
          return normalizeJsonNode(parsed, 0);
        }
      } catch (e) {}
    }

    // 3. Caso seja código Mermaid (flowchart / graph / mindmap)
    if (trimmed.includes('flowchart') || trimmed.includes('graph') || trimmed.includes('-->') || trimmed.includes('mindmap')) {
      const mermaidTree = parseMermaidToTree(trimmed, fallbackTitle);
      if (mermaidTree && mermaidTree.children && mermaidTree.children.length > 0) {
        return mermaidTree;
      }
    }

    // 4. Caso seja Markdown com tópicos (#, *, -, números)
    const markdownTree = parseMarkdownToTree(trimmed, fallbackTitle);
    if (markdownTree && markdownTree.children && markdownTree.children.length > 0) {
      return markdownTree;
    }
  }

  return createDefaultTree(fallbackTitle);
}

/**
 * Normaliza nó JSON com id e level
 */
function normalizeJsonNode(node, level = 0) {
  const name = node.title || node.name || node.label || 'Conceito';
  const rawChildren = node.children || node.nodes || node.subtopics || [];

  return {
    id: `node-${nodeSeq++}`,
    name: cleanLabel(name),
    level,
    children: Array.isArray(rawChildren) 
      ? rawChildren.map(c => normalizeJsonNode(typeof c === 'string' ? { title: c } : c, level + 1))
      : []
  };
}

/**
 * Converte sintaxe Mermaid (flowchart TB / TD com nós A --> B) em Árvore
 */
function parseMermaidToTree(mermaidCode, defaultTitle) {
  const lines = mermaidCode.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const nodeLabels = {};
  const adjacency = {};
  const allNodes = new Set();
  const childNodes = new Set();

  for (const line of lines) {
    if (line.startsWith('flowchart') || line.startsWith('graph') || line.startsWith('subgraph') || line.startsWith('end')) {
      continue;
    }

    // Extrai definições de nós: A["Texto"]
    const defMatches = line.matchAll(/([a-zA-Z0-9_-]+)\s*(\[|\()\"?([\s\S]*?)\"?(\]|\))/g);
    for (const match of defMatches) {
      const id = match[1];
      const label = match[3];
      if (id && label) {
        nodeLabels[id] = cleanLabel(label);
        allNodes.add(id);
      }
    }

    // Extrai conexões: A --> B ou A --- B
    const linkMatch = line.match(/([a-zA-Z0-9_-]+)\s*(?:-->|---|==>)\s*([a-zA-Z0-9_-]+)/);
    if (linkMatch) {
      const from = linkMatch[1];
      const to = linkMatch[2];
      allNodes.add(from);
      allNodes.add(to);
      childNodes.add(to);

      if (!adjacency[from]) adjacency[from] = [];
      adjacency[from].push(to);
    }
  }

  // Raiz é o nó que não é filho de ninguém
  const rootIds = Array.from(allNodes).filter(id => !childNodes.has(id));
  const rootId = rootIds[0] || Array.from(allNodes)[0];

  if (!rootId) return null;

  function buildSubtree(currentId, level = 0, visited = new Set()) {
    if (visited.has(currentId)) return null;
    visited.add(currentId);

    const childrenIds = adjacency[currentId] || [];
    const children = childrenIds
      .map(childId => buildSubtree(childId, level + 1, new Set(visited)))
      .filter(Boolean);

    return {
      id: `node-${nodeSeq++}`,
      name: nodeLabels[currentId] || cleanLabel(currentId),
      level,
      children
    };
  }

  return buildSubtree(rootId, 0);
}

/**
 * Converte texto Markdown em Árvore Hierárquica por recuo ou cabeçalhos
 */
function parseMarkdownToTree(text, defaultTitle) {
  const lines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;

  let rootTitle = defaultTitle;
  const items = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      rootTitle = cleanLabel(trimmed.replace(/^#\s+/, ''));
      continue;
    }

    // Calcula profundidade
    let depth = 1;
    if (trimmed.startsWith('## ')) depth = 1;
    else if (trimmed.startsWith('### ')) depth = 2;
    else if (trimmed.startsWith('#### ')) depth = 3;
    else {
      const leadingSpaces = line.search(/\S/);
      depth = Math.max(1, Math.floor(leadingSpaces / 2) + 1);
    }

    const label = cleanLabel(trimmed.replace(/^[#*•\d.-]+\s*/, ''));
    if (label) {
      items.push({ label, depth });
    }
  }

  if (items.length === 0) return null;

  // Constrói árvore a partir de itens planos com depth
  const root = {
    id: `node-${nodeSeq++}`,
    name: rootTitle,
    level: 0,
    children: []
  };

  const stack = [{ node: root, depth: 0 }];

  for (const item of items) {
    const newNode = {
      id: `node-${nodeSeq++}`,
      name: item.label,
      level: item.depth,
      children: []
    };

    while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    stack.push({ node: newNode, depth: item.depth });
  }

  return root;
}

/**
 * Limpa strings de rótulos removendo markdown residual e quebras
 */
function cleanLabel(str) {
  if (!str) return '';
  return String(str)
    .replace(/^["']|["']$/g, '')
    .replace(/[*_`#]/g, '')
    .replace(/\\n/g, ' ')
    .trim();
}

/**
 * Árvore padrão de demonstração clínica Body Harmony
 */
function createDefaultTree(title) {
  return {
    id: 'node-root',
    name: title || '🌟 Protocolo Clínico Body Harmony',
    level: 0,
    children: [
      {
        id: 'node-1',
        name: '⚡ Parâmetros Biofísicos & Dosimetria',
        level: 1,
        children: [
          { id: 'node-1-1', name: 'Frequência Operacional: 60Hz a 85Hz', level: 2, children: [] },
          { id: 'node-1-2', name: 'Largura de Pulso: 250µs a 350µs (Cronaxia)', level: 2, children: [] },
          { id: 'node-1-3', name: 'Rampas Rise/Decay: 1.5s a 2.0s Suaves', level: 2, children: [] }
        ]
      },
      {
        id: 'node-2',
        name: '💆‍♀️ Metodologia das 3 Fases (3S)',
        level: 1,
        children: [
          { id: 'node-2-1', name: 'Fase 1: Sensibilização (Acomodação Limiar)', level: 2, children: [] },
          { id: 'node-2-2', name: 'Fase 2: Saturação (Pico Metabólico & Tônus)', level: 2, children: [] },
          { id: 'node-2-3', name: 'Fase 3: Sustentação (Drenagem & Consolidação)', level: 2, children: [] }
        ]
      },
      {
        id: 'node-3',
        name: '🛡️ Segurança & Posicionamento Anatômico',
        level: 1,
        children: [
          { id: 'node-3-1', name: 'Mapeamento dos Pontos Motores (Glúteo/Abdômen)', level: 2, children: [] },
          { id: 'node-3-2', name: 'Higienização e Hidratação Tecidual Pré-Sessão', level: 2, children: [] }
        ]
      }
    ]
  };
}
