import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import mermaid from 'mermaid';
import { FaSearchPlus, FaSearchMinus, FaUndo, FaCopy, FaCheck, FaProjectDiagram } from 'react-icons/fa';

const ViewerWrapper = styled.div`
  background: #051A29;
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
`;

const Toolbar = styled.div`
  background: linear-gradient(90deg, #0A3E60 0%, #051A29 100%);
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: 0.5rem;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.92rem;
  }

  .controls {
    display: flex;
    gap: 0.4rem;
  }
`;

const ControlBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.2);
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const DiagramContainer = styled.div`
  padding: 1.5rem;
  overflow: auto;
  min-height: 420px;
  max-height: 650px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 50%, rgba(10, 62, 96, 0.2) 0%, transparent 80%), #051A29;

  .svg-wrapper {
    transition: transform 0.2s ease;
    transform-origin: center center;
    width: 100%;
    display: flex;
    justify-content: center;

    svg {
      max-width: 100%;
      height: auto;
    }
  }
`;

const FallbackBox = styled.div`
  padding: 1.5rem;
  color: #CBD5E1;
  font-family: monospace;
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.6;
`;

export default function MermaidViewer({ chartCode, title = 'Mapa Mental Clínico' }) {
  const [svgContent, setSvgContent] = useState('');
  const [renderError, setRenderError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const uniqueIdRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  // Extrair código limpo entre blocos ```mermaid se houver
  const cleanCode = React.useMemo(() => {
    if (!chartCode) return '';
    let code = chartCode;
    const match = chartCode.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
    if (match) {
      code = match[1].trim();
    }
    return code.trim();
  }, [chartCode]);

  useEffect(() => {
    if (!cleanCode) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        background: '#051A29',
        primaryColor: '#0A3E60',
        primaryTextColor: '#FFFFFF',
        primaryBorderColor: '#ED7E13',
        lineColor: '#ED7E13',
        secondaryColor: '#316B9C',
        tertiaryColor: '#051A29',
        fontFamily: 'Poppins, sans-serif'
      }
    });

    const renderChart = async () => {
      try {
        setRenderError(false);
        const { svg } = await mermaid.render(uniqueIdRef.current, cleanCode);
        setSvgContent(svg);
      } catch (err) {
        console.warn('[MermaidViewer] Render error, using fallback:', err);
        setRenderError(true);
      }
    };

    renderChart();
  }, [cleanCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ViewerWrapper>
      <Toolbar>
        <div className="title-group">
          <FaProjectDiagram />
          <span>{title}</span>
        </div>
        <div className="controls">
          <ControlBtn onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.5))} title="Aumentar Zoom">
            <FaSearchPlus /> Zoom +
          </ControlBtn>
          <ControlBtn onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))} title="Diminuir Zoom">
            <FaSearchMinus /> Zoom -
          </ControlBtn>
          <ControlBtn onClick={() => setZoom(1)} title="Redefinir Zoom">
            <FaUndo /> 100%
          </ControlBtn>
          <ControlBtn onClick={handleCopy} title="Copiar Sintaxe">
            {copied ? <><FaCheck style={{ color: '#22c55e' }} /> Copiado</> : <><FaCopy /> Copiar</>}
          </ControlBtn>
        </div>
      </Toolbar>

      <DiagramContainer>
        {renderError ? (
          <FallbackBox>{cleanCode}</FallbackBox>
        ) : (
          <div
            className="svg-wrapper"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </DiagramContainer>
    </ViewerWrapper>
  );
}
