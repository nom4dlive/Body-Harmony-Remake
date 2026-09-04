import React, { useEffect, useRef, useState, useId } from 'react';
import styled from 'styled-components';
import { FaCopy, FaCheck, FaSpinner, FaNetworkWired } from 'react-icons/fa';

const Container = styled.div`
  background: rgba(7, 35, 56, 0.9);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 14px;
  padding: 1.25rem;
  margin: 1rem 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(237, 126, 19, 0.15);

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ED7E13;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      min-height: 36px;
      padding: 0.25rem 0.65rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(237, 126, 19, 0.3);
      border-radius: 8px;
      color: #CBD5E1;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(237, 126, 19, 0.15);
        color: #ED7E13;
        border-color: #ED7E13;
      }
    }
  }

  .svg-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow-x: auto;

    svg {
      max-width: 100%;
      height: auto;
    }
  }

  .raw-fallback {
    width: 100%;
    background: #051A29;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.8rem;
    color: #94A3B8;
    white-space: pre-wrap;
    border: 1px dashed rgba(237, 126, 19, 0.25);
  }
`;

/**
 * Sanitizador defensivo no cliente React
 */
function sanitizeMermaid(code) {
  if (!code) return 'flowchart TB\n  A["🌟 Protocolo Clínico"] --> B["⚡ Parâmetros"]';
  let clean = code.replace(/```(?:mermaid)?/g, '').replace(/```/g, '').trim();
  
  // Normaliza aspas internas
  clean = clean.replace(/([a-zA-Z0-9_-]+)\s*(\[|\()\"([\s\S]*?)\"(\]|\))/g, (_, id, open, inner, close) => {
    const sanitizedInner = inner.replace(/"/g, "'").replace(/\n/g, ' ').trim();
    return `${id}${open}"${sanitizedInner}"${close}`;
  });

  if (!clean.startsWith('flowchart') && !clean.startsWith('graph') && !clean.startsWith('mindmap')) {
    clean = `flowchart TB\n${clean}`;
  }
  return clean;
}

export function MermaidBlock({ chart }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const rawId = useId();
  const uniqueId = `mermaid-luxury-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        setLoading(true);
        setError(null);

        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#0A3E60',
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#ED7E13',
            lineColor: '#ED7E13',
            secondaryColor: '#072338',
            tertiaryColor: '#051A29',
            background: '#072338',
            fontFamily: 'Poppins, sans-serif',
          },
          securityLevel: 'loose',
        });

        const cleanCode = sanitizeMermaid(chart);
        const { svg } = await mermaid.render(uniqueId, cleanCode);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[MermaidBlock] Erro de renderização:', err);
          setError(err?.message || 'Falha ao processar diagrama.');
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container ref={containerRef}>
      <div className="header-actions">
        <span className="tag">
          <FaNetworkWired /> Mapa Mental Interativo
        </span>
        <button className="copy-btn" onClick={handleCopy} title="Copiar código Mermaid">
          {copied ? <><FaCheck style={{ color: '#22C55E' }} /> Copiado</> : <><FaCopy /> Copiar</>}
        </button>
      </div>

      {loading && (
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ED7E13' }}>
          <FaSpinner className="animate-spin" />
          <span style={{ fontSize: '0.85rem' }}>Renderizando Mapa Mental Luxury...</span>
        </div>
      )}

      {!loading && error && (
        <pre className="raw-fallback">{chart}</pre>
      )}

      {!loading && !error && (
        <div className="svg-wrapper" dangerouslySetInnerHTML={{ __html: svgContent }} />
      )}
    </Container>
  );
}
