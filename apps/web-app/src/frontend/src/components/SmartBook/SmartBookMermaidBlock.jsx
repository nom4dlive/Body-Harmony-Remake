import React, { useEffect, useRef, useState, useId } from 'react';
import styled from 'styled-components';
import { FaCopy, FaCheck, FaSpinner, FaNetworkWired, FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';
import { sanitizeMermaidCode } from '../../utils/sanitizeMermaidCode';

const Container = styled.div`
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 16px;
  padding: 16px;
  margin: 10px 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow: hidden;

  .header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(237, 126, 19, 0.2);

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #ED7E13;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tools-group {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #11223A;
      border: 1px solid #1E3A5F;
      border-radius: 8px;
      color: #CBD5E1;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #1E3A5F;
        color: #ED7E13;
        border-color: #ED7E13;
      }
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 10px;
      background: #11223A;
      border: 1px solid #1E3A5F;
      border-radius: 8px;
      color: #CBD5E1;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #1E3A5F;
        color: #ED7E13;
        border-color: #ED7E13;
      }
    }
  }

  .svg-viewport {
    width: 100%;
    min-height: 260px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    padding: 12px;
    background: #050B14;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .svg-wrapper {
    display: flex;
    justify-content: center;
    transition: transform 0.2s ease;
    transform-origin: center center;

    svg {
      max-width: 100%;
      height: auto;
    }
  }
`;

const ConceptTreeFallback = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 480px;
  padding: 10px;

  .root-node {
    background: linear-gradient(135deg, #1E3A5F 0%, #11223A 100%);
    border: 1px solid #ED7E13;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 800;
    color: #FFFFFF;
    text-align: center;
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.2);
  }

  .branches-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 16px;
    border-left: 2px dashed #ED7E13;
    margin-left: 24px;
  }

  .branch-node {
    background: #11223A;
    border: 1px solid #1E3A5F;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px;
    color: #E8EAED;
    line-height: 1.4;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -18px;
      top: 50%;
      width: 16px;
      height: 2px;
      background: #ED7E13;
    }

    strong {
      color: #ED7E13;
    }
  }
`;

export function SmartBookMermaidBlock({ chart }) {
  const [svgContent, setSvgContent] = useState('');
  const [useFallbackTree, setUseFallbackTree] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const rawId = useId();
  const uniqueId = `mermaid-shield-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        setLoading(true);
        setUseFallbackTree(false);

        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#0B1626',
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#ED7E13',
            lineColor: '#ED7E13',
            secondaryColor: '#11223A',
            tertiaryColor: '#050B14',
            background: '#0B1626',
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontSize: '13px'
          },
          securityLevel: 'loose',
        });

        const cleanCode = sanitizeMermaidCode(chart);
        const { svg } = await mermaid.render(uniqueId, cleanCode);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[SmartBookMermaidBlock] Erro contido. Ativando Concept Tree View:', err);
          setUseFallbackTree(true);
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  // Extrai linhas para a árvore conceitual caso necessário
  const parseTreeNodes = (text) => {
    if (!text) return [];
    return text.split(/\r?\n/).map(l => l.replace(/^[#*•\d.-]+\s*/, '').replace(/[*`]/g, '').trim()).filter(Boolean);
  };

  return (
    <Container>
      <div className="header-actions">
        <span className="tag">
          <FaNetworkWired />
          <span>Mapa Mental Clínico Dra. Harmony</span>
        </span>
        <div className="tools-group">
          {!useFallbackTree && (
            <>
              <button className="tool-btn" onClick={handleZoomOut} title="Diminuir Zoom">
                <FaSearchMinus />
              </button>
              <button className="tool-btn" onClick={handleResetZoom} title="Resetar Zoom">
                <FaUndo />
              </button>
              <button className="tool-btn" onClick={handleZoomIn} title="Aumentar Zoom">
                <FaSearchPlus />
              </button>
            </>
          )}
          <button className="copy-btn" onClick={handleCopyCode} title="Copiar código do mapa mental">
            {copied ? <FaCheck color="#22C55E" /> : <FaCopy />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      <div className="svg-viewport">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ED7E13', padding: '20px' }}>
            <FaSpinner className="spin-animate" />
            <span>Compilando diagrama clínico...</span>
          </div>
        ) : useFallbackTree ? (
          <ConceptTreeFallback>
            <div className="root-node">🌟 Mapa Conceitual da Aula</div>
            <div className="branches-container">
              {parseTreeNodes(chart).slice(0, 8).map((nodeText, idx) => (
                <div key={idx} className="branch-node">
                  {nodeText}
                </div>
              ))}
            </div>
          </ConceptTreeFallback>
        ) : (
          <div
            className="svg-wrapper"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </Container>
  );
}
