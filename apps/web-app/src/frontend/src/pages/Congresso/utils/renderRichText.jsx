import React from 'react';
import styled from 'styled-components';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const GoldSpan = styled.span`
  background: linear-gradient(135deg, #FFFFFF 0%, #f9e27e 60%, #ED7E13 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  font-weight: inherit;
`;

/**
 * renderRichText — processador resiliente de texto rico:
 * - **negrito** => <strong>
 * - *ouro:texto* ou [ouro]texto[/ouro] => <GoldSpan>
 * - *itálico* => <em>
 * - Resiliente a erros de digitação (ex: **texto*)
 * - Preserva quebras de linha \n
 */
export function renderRichText(text) {
  if (!text || typeof text !== 'string') return text;

  // Auto-sanitizar placeholders acidentais residuais
  let sanitized = text
    .replace(/\*\*negrito\*\*/gi, '')
    .replace(/\*ouro:texto em ouro\*/gi, '')
    .trim();

  if (!sanitized) return '';

  // Pré-normalização: consertar erros comuns de digitação com asteriscos (ex: **texto* => **texto**)
  if (sanitized.startsWith('**') && sanitized.endsWith('*') && !sanitized.endsWith('**')) {
    sanitized = sanitized + '*';
  } else if (sanitized.startsWith('*') && !sanitized.startsWith('**') && sanitized.endsWith('**')) {
    sanitized = '*' + sanitized;
  }

  // Converter tags de conveniência [ouro]texto[/ouro] em *ouro:texto*
  sanitized = sanitized.replace(/\[ouro\](.*?)\[\/ouro\]/gi, '*ouro:$1*');
  sanitized = sanitized.replace(/\[gold\](.*?)\[\/gold\]/gi, '*gold:$1*');

  // Split por quebras de linha
  const lines = sanitized.split('\n');

  return lines.map((line, lineIdx) => {
    // Regex para capturar:
    // 1. *ouro:texto* ou *gold:texto*
    // 2. **negrito**
    // 3. *itálico*
    const parts = line.split(/(\*(?:ouro|gold):[^*]+\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    const formattedLine = parts.map((part, partIdx) => {
      if ((part.startsWith('*ouro:') || part.startsWith('*gold:')) && part.endsWith('*')) {
        const content = part.slice(6, -1);
        return <GoldSpan key={partIdx}>{content}</GoldSpan>;
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
        return <em key={partIdx}>{part.slice(1, -1)}</em>;
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {formattedLine}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default renderRichText;
