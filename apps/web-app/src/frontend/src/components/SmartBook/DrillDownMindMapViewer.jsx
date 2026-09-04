import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaProjectDiagram, FaChevronRight, FaArrowLeft, FaHome,
  FaRobot, FaSearch, FaCompressAlt, FaExpandAlt, FaListUl
} from 'react-icons/fa';
import MermaidViewer from './MermaidViewer';

const Container = styled.div`
  background: #051A29;
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Poppins', sans-serif;
  color: #FFFFFF;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #0A3E60 0%, #051A29 100%);
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(237, 126, 19, 0.25);
  flex-wrap: wrap;
  gap: 0.5rem;

  .title-box {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .mode-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.2rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;

      &.active {
        background: #ED7E13;
        color: #FFFFFF;
      }
    }
  }
`;

const BreadcrumbsBar = styled.div`
  background: rgba(10, 62, 96, 0.3);
  padding: 0.65rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(237, 126, 19, 0.4);
    border-radius: 4px;
  }

  .crumb {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #ED7E13;
      background: rgba(237, 126, 19, 0.1);
    }

    &.current {
      color: #ED7E13;
      font-weight: 700;
      cursor: default;
      background: rgba(237, 126, 19, 0.15);
    }
  }

  .sep {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
  }
`;

const ContentBody = styled.div`
  padding: 1.25rem;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CurrentNodeCard = styled.div`
  background: linear-gradient(135deg, rgba(10, 62, 96, 0.6) 0%, rgba(5, 26, 41, 0.9) 100%);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #FFFFFF;
    }

    .level-badge {
      background: rgba(237, 126, 19, 0.2);
      color: #ED7E13;
      border: 1px solid rgba(237, 126, 19, 0.4);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
    }
  }

  p {
    margin: 0;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .action-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }
`;

const AiAskBtn = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
  border: none;
  color: #FFFFFF;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.4);
  }
`;

const BackBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ChildrenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChildCard = styled(motion.div)`
  background: rgba(10, 62, 96, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 56px;
  transition: all 0.2s;

  &:hover {
    background: rgba(10, 62, 96, 0.6);
    border-color: #ED7E13;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    h5 {
      margin: 0;
      font-size: 0.92rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    span {
      font-size: 0.74rem;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .arrow {
    color: #ED7E13;
    font-size: 0.85rem;
    flex-shrink: 0;
  }
`;

/**
 * Parser simples de Mermaid Mindmap para Árvore JSON
 */
function parseMindmapTree(markdownText, defaultTitle = 'Módulo Clínico') {
  if (!markdownText) {
    return {
      id: 'root',
      title: defaultTitle,
      description: 'Mapa Mental Clínico do Módulo',
      children: [
        { id: '1', title: '1. Bases Fisiológicas', description: 'Recrutamento motor e cronaxia', children: [] },
        { id: '2', title: '2. Parâmetros e Dosimetria', description: 'Hz, µs e rampas de estimulação', children: [] },
        { id: '3', title: '3. Setup dos Canais 1 a 8', description: 'Distribuição anatômica de eletrodos', children: [] },
        { id: '4', title: '4. Intercorrências e Cuidados', description: 'Próteses, queixas e despolarização', children: [] }
      ]
    };
  }

  // Tenta extrair linhas indentadas do mindmap
  const lines = markdownText.split('\n');
  const root = {
    id: 'root',
    title: defaultTitle,
    description: 'Explore os conceitos tocando em cada ramo abaixo.',
    children: []
  };

  const stack = [{ node: root, indent: -1 }];

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('mindmap') || trimmed.startsWith('```')) continue;

    // Calcular indentação
    const indent = rawLine.search(/\S/);
    const cleanTitle = trimmed
      .replace(/^root\(\((.*?)\)\)/, '$1')
      .replace(/^[\(\[\{]+/, '')
      .replace(/[\)\]\}]+$/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^#+\s*/, '')
      .trim();

    if (!cleanTitle) continue;

    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      title: cleanTitle,
      description: `Ramo de aprofundamento: ${cleanTitle}`,
      children: []
    };

    // Ajustar stack com base na indentação
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    stack.push({ node: newNode, indent });
  }

  if (root.children.length === 0) {
    root.children = [
      { id: '1', title: '1. Fisiologia e Cronaxia', description: 'Despolarização de membrana', children: [] },
      { id: '2', title: '2. Parâmetros Hz / µs', description: 'Frequência e largura de pulso', children: [] },
      { id: '3', title: '3. Aplicação em Cabine', description: 'Posicionamento de eletrodos', children: [] }
    ];
  }

  return root;
}

export default function DrillDownMindMapViewer({
  chartCode = '',
  title = 'Mapa Mental Clínico',
  onAskAi = null
}) {
  const [viewType, setViewType] = useState('drilldown'); // 'drilldown' | 'diagram'
  const rootNode = useMemo(() => parseMindmapTree(chartCode, title), [chartCode, title]);
  
  // Caminho de navegação (Breadcrumbs)
  const [path, setPath] = useState([rootNode]);
  const currentNode = path[path.length - 1];

  const handleDrillDown = (childNode) => {
    setPath(prev => [...prev, childNode]);
  };

  const handleGoBack = () => {
    if (path.length > 1) {
      setPath(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleGoToCrumb = (index) => {
    setPath(prev => prev.slice(0, index + 1));
  };

  const handleAskDraHarmony = () => {
    if (onAskAi) {
      const query = `Dra. Harmony, me explique detalhadamente o tópico "${currentNode.title}" do mapa mental clínico deste módulo.`;
      onAskAi(query);
    }
  };

  return (
    <Container>
      <Header>
        <div className="title-box">
          <FaProjectDiagram />
          <span>{title}</span>
        </div>

        <div className="mode-toggle">
          <button
            className={viewType === 'drilldown' ? 'active' : ''}
            onClick={() => setViewType('drilldown')}
          >
            <FaListUl /> Modo Tátil (Níveis)
          </button>
          <button
            className={viewType === 'diagram' ? 'active' : ''}
            onClick={() => setViewType('diagram')}
          >
            <FaProjectDiagram /> Diagrama Completo
          </button>
        </div>
      </Header>

      {viewType === 'diagram' ? (
        <MermaidViewer chartCode={chartCode} title={title} />
      ) : (
        <>
          {/* Barra de Breadcrumbs */}
          <BreadcrumbsBar>
            {path.map((node, index) => {
              const isLast = index === path.length - 1;
              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`crumb ${isLast ? 'current' : ''}`}
                    onClick={() => !isLast && handleGoToCrumb(index)}
                  >
                    {index === 0 && <FaHome style={{ fontSize: '0.8rem' }} />}
                    <span>{node.title}</span>
                  </div>
                  {!isLast && <FaChevronRight className="sep" />}
                </React.Fragment>
              );
            })}
          </BreadcrumbsBar>

          <ContentBody>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNode.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Cartão do Nó Focado */}
                <CurrentNodeCard>
                  <div className="node-header">
                    <h3>{currentNode.title}</h3>
                    <span className="level-badge">Nível {path.length}</span>
                  </div>

                  <p>{currentNode.description}</p>

                  <div className="action-row">
                    {onAskAi && (
                      <AiAskBtn onClick={handleAskDraHarmony}>
                        <FaRobot /> Tirar Dúvida deste Tópico
                      </AiAskBtn>
                    )}

                    {path.length > 1 && (
                      <BackBtn onClick={handleGoBack}>
                        <FaArrowLeft /> Voltar Nível
                      </BackBtn>
                    )}
                  </div>
                </CurrentNodeCard>

                {/* Sub-nós / Ramos Filhos */}
                {currentNode.children && currentNode.children.length > 0 ? (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#ED7E13', fontWeight: 700 }}>
                      Subtópicos & Ramos de Aprofundamento ({currentNode.children.length}):
                    </h4>
                    <ChildrenGrid>
                      {currentNode.children.map(child => (
                        <ChildCard
                          key={child.id}
                          onClick={() => handleDrillDown(child)}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="info">
                            <h5>{child.title}</h5>
                            <span>{child.children?.length > 0 ? `${child.children.length} sub-ramos` : 'Ver detalhes'}</span>
                          </div>
                          <FaChevronRight className="arrow" />
                        </ChildCard>
                      ))}
                    </ChildrenGrid>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <p style={{ margin: 0 }}>📍 Você chegou ao nível mais profundo deste ramo clínico.</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>Clique em "Tirar Dúvida deste Tópico" acima para explorar parâmetros específicos com a Dra. Harmony AI.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </ContentBody>
        </>
      )}
    </Container>
  );
}
