import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaExpand, FaCompress, FaSearchPlus, FaSearchMinus, 
  FaUndo, FaDownload, FaThumbsUp, FaThumbsDown, 
  FaProjectDiagram 
} from 'react-icons/fa';
import { parseMindMapData } from '../../utils/mindmapTreeParser';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: ${props => (props.isFullscreen ? '100vh' : '580px')};
  background: #050B14;
  border: ${props => (props.isFullscreen ? 'none' : '1px solid #1E3A5F')};
  border-radius: ${props => (props.isFullscreen ? '0' : '16px')};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);

  ${props => props.isFullscreen && `
    position: fixed;
    inset: 0;
    z-index: 9999;
  `}
`;

const HeaderBar = styled.div`
  position: absolute;
  top: 14px;
  left: 18px;
  right: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
  pointer-events: none;

  .header-left {
    pointer-events: auto;
    background: rgba(11, 22, 38, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(237, 126, 19, 0.3);
    border-radius: 12px;
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    .map-title {
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.2px;
    }

    .map-subtitle {
      font-size: 11px;
      color: #9AA0A6;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .header-right {
    pointer-events: auto;
    display: flex;
    gap: 8px;
  }
`;

const IconButton = styled.button`
  background: rgba(11, 22, 38, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid #1E3A5F;
  border-radius: 10px;
  color: #CBD5E1;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);

  &:hover {
    background: #11223A;
    border-color: #ED7E13;
    color: #ED7E13;
    transform: translateY(-1px);
  }
`;

const BottomToolbar = styled.div`
  position: absolute;
  bottom: 14px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(11, 22, 38, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid #1E3A5F;
  border-radius: 12px;
  padding: 6px;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

  .btn-toggle-all {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #11223A;
    border: 1px solid #1E3A5F;
    border-radius: 8px;
    color: #E8EAED;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #1E3A5F;
      border-color: #ED7E13;
      color: #ED7E13;
    }
  }

  .divider {
    width: 1px;
    height: 18px;
    background: #1E3A5F;
    margin: 0 2px;
  }
`;

const FeedbackBar = styled.div`
  position: absolute;
  bottom: 14px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(11, 22, 38, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid #1E3A5F;
  border-radius: 12px;
  padding: 6px 12px;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

  .feedback-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: #9AA0A6;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background: #11223A;
      color: #ED7E13;
    }

    &.active {
      color: #22C55E;
    }
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  cursor: grab;
  position: relative;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

const NODE_COLORS = {
  root: {
    bg: 'linear-gradient(135deg, #1E3A5F 0%, #0A3E60 100%)',
    border: '#ED7E13',
    text: '#FFFFFF',
    shadow: '0 6px 20px rgba(237, 126, 19, 0.3)'
  },
  level1: {
    bg: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    shadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
  },
  level2: {
    bg: '#064E3B',
    border: '#047857',
    text: '#ECFDF5',
    shadow: '0 4px 14px rgba(4, 120, 87, 0.25)'
  },
  level3: {
    bg: '#11223A',
    border: '#ED7E13',
    text: '#F8FAFC',
    shadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
  }
};

export function SmartBookInteractiveMindMap({
  data,
  title = 'Mapa Mental Clínico — Dra. Harmony AI',
  sourcesCount = 1
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // Estados de Pan & Zoom
  const [transform, setTransform] = useState({ x: 80, y: 220, scale: 1.0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Nós recolhidos (Set de IDs)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());

  // Parser universal de dados
  const rootTree = useMemo(() => {
    return parseMindMapData(data, title);
  }, [data, title]);

  // Listener ativo não-passivo para Wheel (elimina erros no console)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheelHandler = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * zoomFactor, 0.4), 2.2)
      }));
    };

    el.addEventListener('wheel', onWheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheelHandler);
    };
  }, []);

  // Layout dos nós em árvore horizontal
  const layout = useMemo(() => {
    if (!rootTree) return { nodes: [], links: [] };

    const nodes = [];
    const links = [];

    const HORIZONTAL_GAP = 240;
    const VERTICAL_GAP = 70;
    let currentY = 0;

    function traverse(node, depth = 0, parent = null) {
      const isCollapsed = collapsedNodeIds.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      const currentNode = {
        ...node,
        depth,
        hasChildren,
        isCollapsed,
        parent,
        x: depth * HORIZONTAL_GAP + 60,
        y: 0
      };

      if (!hasChildren || isCollapsed) {
        currentNode.y = currentY;
        currentY += VERTICAL_GAP;
      } else {
        const childNodes = [];
        for (const child of node.children) {
          const childLayout = traverse(child, depth + 1, currentNode);
          childNodes.push(childLayout);
        }
        const minY = childNodes[0].y;
        const maxY = childNodes[childNodes.length - 1].y;
        currentNode.y = (minY + maxY) / 2;
      }

      nodes.push(currentNode);
      return currentNode;
    }

    currentY = 40;
    const rootNode = traverse(rootTree, 0, null);

    // Ajusta links após cálculo de todas as posições
    for (const node of nodes) {
      if (node.parent) {
        links.push({
          id: `${node.parent.id}->${node.id}`,
          source: node.parent,
          target: node
        });
      }
    }

    return { nodes, links };
  }, [rootTree, collapsedNodeIds]);

  // Toggle de recolher/expandir nó individual
  const handleToggleNode = (nodeId, e) => {
    e.stopPropagation();
    setCollapsedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Expandir / Recolher Todos
  const allParentIds = useMemo(() => {
    const ids = [];
    function collect(n) {
      if (n.children && n.children.length > 0) {
        ids.push(n.id);
        n.children.forEach(collect);
      }
    }
    if (rootTree) collect(rootTree);
    return ids;
  }, [rootTree]);

  const areAllExpanded = collapsedNodeIds.size === 0;

  const handleToggleAll = () => {
    if (areAllExpanded) {
      const nonRootIds = allParentIds.filter(id => id !== rootTree?.id);
      setCollapsedNodeIds(new Set(nonRootIds));
    } else {
      setCollapsedNodeIds(new Set());
    }
  };

  // Handlers de Pan
  const handleMouseDown = (e) => {
    if (e.target.closest('.node-card') || e.target.closest('.pill-btn')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.15, 2.2) }));
  const handleZoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.15, 0.4) }));
  const handleReset = () => setTransform({ x: 80, y: 220, scale: 1.0 });

  // Download SVG
  const handleDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapa_mental_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Cores por nível
  const getNodeStyle = (depth) => {
    if (depth === 0) return NODE_COLORS.root;
    if (depth === 1) return NODE_COLORS.level1;
    if (depth === 2) return NODE_COLORS.level2;
    return NODE_COLORS.level3;
  };

  return (
    <Container isFullscreen={isFullscreen} ref={containerRef}>
      {/* 1. Header com Título, Fontes e Ações */}
      <HeaderBar>
        <div className="header-left">
          <div className="map-title">{title}</div>
          <div className="map-subtitle">
            <FaProjectDiagram color="#ED7E13" />
            <span>Baseado em {sourcesCount} {sourcesCount === 1 ? 'fonte oficial' : 'fontes oficiais'}</span>
          </div>
        </div>

        <div className="header-right">
          <IconButton onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </IconButton>
          <IconButton onClick={handleDownload} title="Exportar Mapa em SVG">
            <FaDownload />
          </IconButton>
        </div>
      </HeaderBar>

      {/* 2. Canvas Interativo SVG com Pan e Zoom */}
      <CanvasArea
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* Linhas de conexão em Curvas Bezier Orgânicas */}
            {layout.links.map(link => {
              const x1 = link.source.x + 130;
              const y1 = link.source.y;
              const x2 = link.target.x - 70;
              const y2 = link.target.y;
              const dx = (x2 - x1) * 0.55;

              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={link.id}
                  d={pathData}
                  fill="none"
                  stroke={link.source.depth === 0 ? 'rgba(237, 126, 19, 0.7)' : 'rgba(148, 163, 184, 0.4)'}
                  strokeWidth={link.source.depth === 0 ? '2.5' : '1.8'}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nós Interativos em Cartões Arredondados */}
            {layout.nodes.map(node => {
              const style = getNodeStyle(node.depth);
              const isRoot = node.depth === 0;
              const width = isRoot ? 170 : 150;
              const height = isRoot ? 48 : 42;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="node-card"
                  style={{ cursor: 'pointer' }}
                >
                  {/* Sombra / Card */}
                  <rect
                    x={-width / 2}
                    y={-height / 2}
                    width={width}
                    height={height}
                    rx={14}
                    fill={node.depth === 0 ? '#0A3E60' : style.bg}
                    stroke={style.border}
                    strokeWidth={isRoot ? 2 : 1.2}
                    filter="drop-shadow(0px 6px 14px rgba(0,0,0,0.6))"
                  />

                  {/* Texto do Nó */}
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize={isRoot ? '12px' : '11px'}
                    fontWeight={isRoot ? '800' : '600'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.length > 20 ? `${node.name.slice(0, 19)}...` : node.name}
                  </text>

                  {/* Botão em Pílula para Expandir/Recolher Filhos */}
                  {node.hasChildren && (
                    <g
                      transform={`translate(${width / 2 + 10}, 0)`}
                      className="pill-btn"
                      onClick={(e) => handleToggleNode(node.id, e)}
                    >
                      <circle
                        r={9}
                        fill="#0B1626"
                        stroke="#ED7E13"
                        strokeWidth="1.5"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#ED7E13"
                        fontSize="9px"
                        fontWeight="800"
                      >
                        {node.isCollapsed ? '>' : '<'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </CanvasArea>

      {/* 3. Barra de Feedback no Canto Inferior Esquerdo */}
      <FeedbackBar>
        <button
          className={`feedback-btn ${feedback === 'good' ? 'active' : ''}`}
          onClick={() => setFeedback('good')}
        >
          <FaThumbsUp size={11} />
          <span>{feedback === 'good' ? 'Obrigado!' : 'Bom conteúdo'}</span>
        </button>
        <button
          className={`feedback-btn ${feedback === 'bad' ? 'active' : ''}`}
          onClick={() => setFeedback('bad')}
        >
          <FaThumbsDown size={11} />
          <span>Feedback</span>
        </button>
      </FeedbackBar>

      {/* 4. Toolbar Flutuante no Canto Inferior Direito */}
      <BottomToolbar>
        <button className="btn-toggle-all" onClick={handleToggleAll}>
          <span>{areAllExpanded ? 'Recolher nós' : 'Expandir tudo'}</span>
        </button>
        <div className="divider" />
        <IconButton onClick={handleZoomOut} title="Diminuir Zoom">
          <FaSearchMinus />
        </IconButton>
        <IconButton onClick={handleReset} title="Resetar Visualização">
          <FaUndo />
        </IconButton>
        <IconButton onClick={handleZoomIn} title="Aumentar Zoom">
          <FaSearchPlus />
        </IconButton>
      </BottomToolbar>
    </Container>
  );
}

export default SmartBookInteractiveMindMap;
