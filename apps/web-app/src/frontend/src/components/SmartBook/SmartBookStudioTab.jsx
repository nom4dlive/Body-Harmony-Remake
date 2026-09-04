import React from 'react';
import styled from 'styled-components';
import { 
  FaHeadphones, FaTv, FaVideo, FaProjectDiagram, 
  FaFileAlt, FaLayerGroup, FaCheckSquare, FaChartPie, 
  FaTable, FaChevronRight, FaExternalLinkAlt, FaClock
} from 'react-icons/fa';
import { STUDIO_TOOLS_CATALOG } from '../../services/smartbookApi';

const StudioContainer = styled.div`
  padding: 14px 16px 90px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.25s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StudioGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

const StudioCard = styled.div`
  background: #11223A;
  border: 1px solid #1E3A5F;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 72px;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ED7E13, transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover, &:active {
    transform: translateY(-2px);
    border-color: #ED7E13;
    box-shadow: 0 4px 16px rgba(237, 126, 19, 0.15);
  }

  &:hover::before, &:active::before {
    opacity: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .card-icon {
      color: #ED7E13;
      font-size: 15px;
      flex-shrink: 0;
    }

    .card-title {
      font-size: 12px;
      font-weight: 700;
      color: #E8EAED;
      line-height: 1.25;
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .maturity-badge {
      font-size: 9px;
      font-weight: 700;
      color: #9AA0A6;
      background: rgba(255, 255, 255, 0.05);
      padding: 1px 6px;
      border-radius: 6px;
    }

    .card-arrow {
      color: #5F6B7A;
      font-size: 14px;
      transition: all 0.2s ease;
    }
  }

  &:hover .card-arrow {
    color: #ED7E13;
    transform: translateX(2px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  h3 {
    font-size: 11px;
    font-weight: 700;
    color: #5F6B7A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SavedOutputsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OutputItemCard = styled.div`
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    background: #11223A;
  }

  .output-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    .output-icon {
      color: #ED7E13;
      font-size: 14px;
    }

    .output-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .output-name {
        font-size: 12px;
        font-weight: 700;
        color: #E8EAED;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .output-time {
        font-size: 10px;
        color: #9AA0A6;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 28px 16px;
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 12px;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 13px;
    font-weight: 700;
    color: #E8EAED;
    margin-bottom: 4px;
  }

  .empty-text {
    font-size: 11px;
    line-height: 1.5;
    color: #9AA0A6;
    max-width: 280px;
    margin: 0 auto;
  }
`;

const TOOL_ICONS = {
  audio: FaHeadphones,
  slides: FaTv,
  video: FaVideo,
  mindmap: FaProjectDiagram,
  report: FaFileAlt,
  flashcards: FaLayerGroup,
  quiz: FaCheckSquare,
  infographic: FaChartPie,
  datatable: FaTable
};

const AiBadge = styled.span`
  font-size: 9px;
  font-weight: 800;
  color: #ED7E13;
  background: rgba(237, 126, 19, 0.15);
  border: 1px solid rgba(237, 126, 19, 0.3);
  padding: 2px 7px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export function SmartBookStudioTab({
  savedOutputs = [],
  onOpenTool,
  onOpenSavedOutput
}) {
  const toolsKeys = Object.keys(STUDIO_TOOLS_CATALOG);

  return (
    <StudioContainer>
      <StudioGrid>
        {toolsKeys.map((key) => {
          const tool = STUDIO_TOOLS_CATALOG[key];
          const IconComponent = TOOL_ICONS[key] || FaFileAlt;
          const existingSaved = savedOutputs.find(s => (s.tool_key === key || s.type === key));

          return (
            <StudioCard 
              key={key} 
              onClick={() => {
                if (existingSaved) {
                  onOpenSavedOutput(existingSaved);
                } else {
                  onOpenTool(key);
                }
              }}
            >
              <div className="card-header">
                <IconComponent className="card-icon" />
                <span className="card-title">{tool.title}</span>
              </div>
              <div className="card-footer">
                {existingSaved ? (
                  <span className="maturity-badge" style={{ color: '#22C55E', background: 'rgba(34, 197, 94, 0.15)' }}>
                    ✓ Pronto
                  </span>
                ) : (
                  <span className="maturity-badge">{tool.badge}</span>
                )}
                <span className="card-arrow">›</span>
              </div>
            </StudioCard>
          );
        })}
      </StudioGrid>

      <SectionHeader>
        <h3>Resultados Salvos do Estúdio</h3>
      </SectionHeader>

      {savedOutputs.length === 0 ? (
        <EmptyState>
          <div className="empty-icon">✨</div>
          <div className="empty-title">A saída do Estúdio será salva aqui.</div>
          <div className="empty-text">
            Selecione uma das 9 ferramentas acima para gerar Resumo em Áudio, Apresentação, Mapa Mental, Flashcards e muito mais!
          </div>
        </EmptyState>
      ) : (
        <SavedOutputsList>
          {savedOutputs.map((item, idx) => {
            const toolKey = item.tool_key || item.type;
            const tool = STUDIO_TOOLS_CATALOG[toolKey] || { title: item.title };
            const IconComponent = TOOL_ICONS[toolKey] || FaFileAlt;
            const aiMeta = item.ai_metadata || item.content_data?.ai_metadata || {};

            return (
              <OutputItemCard key={idx} onClick={() => onOpenSavedOutput(item)}>
                <div className="output-left">
                  <IconComponent className="output-icon" />
                  <div className="output-info">
                    <span className="output-name">{item.title || tool.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="output-time">
                        <FaClock size={9} />
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recente'}
                      </span>
                      <AiBadge>
                        🔬 {aiMeta.model ? 'qwen-max (Qwen 2.5 72B)' : 'IA Generativa'}
                      </AiBadge>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#ED7E13', fontWeight: '700' }}>Ver & Auditar</span>
                  <FaChevronRight size={11} color="#ED7E13" />
                </div>
              </OutputItemCard>
            );
          })}
        </SavedOutputsList>
      )}
    </StudioContainer>
  );
}

