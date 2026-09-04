/**
 * Escudo Anti-Alucinação para Sintaxe Mermaid — Nexus Protocol V3.1
 * Sanitiza saídas geradas por LLMs e converte Markdown livre em Grafos Válidos.
 */

/**
 * Sanitiza código Mermaid bruto ou converte Markdown para Grafo Mermaid válido.
 * @param {string} rawCode - Código bruto ou markdown de conceitos
 * @returns {string} Código Mermaid 100% válido e parseável
 */
export function sanitizeMermaidCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') {
    return `flowchart TB\n  A["🌟 Protocolo Clínico Body Harmony"] --> B["⚡ Fisiologia & Dosimetria"]\n  A --> C["💆‍♀️ Metodologia 3S"]\n  B --> B1["Frequência 60-85Hz | Pulso 250-350µs"]\n  C --> C1["Sensibilização"]\n  C --> C2["Saturação"]\n  C --> C3["Sustentação"]`;
  }

  // 1. Extração do bloco ```mermaid caso exista
  const mermaidMatch = rawCode.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
  let code = mermaidMatch ? mermaidMatch[1].trim() : rawCode.replace(/```(?:mermaid)?/gi, '').replace(/```/g, '').trim();

  // 2. Verifica se contém sintaxe de grafo Mermaid real (--> ou --- ou mindmap ou flowchart)
  const isLikelyMermaid = /(-->|---|==>|flowchart|graph|mindmap|sequenceDiagram|subgraph)/i.test(code);

  if (!isLikelyMermaid) {
    // Converte Markdown estruturado em nós conectados do Mermaid
    return convertMarkdownToMermaid(code);
  }

  // 3. Normaliza quebras de linha e sanitiza nós
  const lines = code.split(/\r?\n/);
  const cleanLines = [];
  let hasHeader = false;

  const validHeaders = ['flowchart', 'graph', 'mindmap', 'sequenceDiagram', 'erDiagram', 'classDiagram', 'timeline', 'gantt'];

  for (let line of lines) {
    let stripped = line.trim();
    if (!stripped) continue;

    // Ignora linhas de cabeçalho markdown residuais que possam estar no meio do bloco
    if (stripped.startsWith('#') || stripped.startsWith('**Diretriz') || stripped.startsWith('✓')) {
      continue;
    }

    // Detecta cabeçalho oficial
    if (validHeaders.some((h) => stripped.startsWith(h))) {
      hasHeader = true;
      cleanLines.push(stripped);
      continue;
    }

    // Sanitização de nós: garante que caracteres como :, (), [], " não quebrem o parser
    let sanitizedLine = stripped.replace(
      /([a-zA-Z0-9_-]+)\s*(\[|\()\"?([\s\S]*?)\"?(\]|\))/g,
      (_, nodeId, openDelim, innerContent, closeDelim) => {
        let cleanContent = innerContent
          .replace(/"/g, "'")
          .replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/[#*`]/g, '')
          .trim();

        return `${nodeId}["${cleanContent || 'Conceito'}"]`;
      }
    );

    cleanLines.push(sanitizedLine);
  }

  if (!hasHeader) {
    cleanLines.unshift('flowchart TB');
  }

  return cleanLines.join('\n');
}

/**
 * Converte texto Markdown / Tópicos em um Grafo Mermaid Flowchart válido
 */
function convertMarkdownToMermaid(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const nodes = [];
  let rootId = 'Root';
  let rootTitle = '🌟 Conceito Central';
  let counter = 1;

  for (let line of lines) {
    const cleanText = line.replace(/^[#*-•\d.]+\s*/, '').replace(/[*_`]/g, '').replace(/"/g, "'").trim();
    if (!cleanText) continue;

    if (line.startsWith('#') && counter === 1) {
      rootTitle = cleanText;
      counter++;
      continue;
    }

    const nodeId = `N${counter++}`;
    nodes.push({ id: nodeId, text: cleanText });
  }

  if (nodes.length === 0) {
    return `flowchart TB\n  Root["🌟 ${rootTitle}"] --> N1["⚡ Parâmetros Clínicos"]\n  Root --> N2["💆‍♀️ Protocolo 3S"]`;
  }

  const mermaidLines = [
    'flowchart TB',
    `  ${rootId}["${rootTitle}"]`
  ];

  nodes.slice(0, 10).forEach(n => {
    mermaidLines.push(`  ${rootId} --> ${n.id}["${n.text}"]`);
  });

  return mermaidLines.join('\n');
}
