import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaCheckSquare, FaSquare, FaFileAlt, FaVideo, FaTrash, FaTimes, FaCheckCircle } from 'react-icons/fa';

const SourcesContainer = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.25s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const AddSourceButton = styled.button`
  background: #11223A;
  border: 2px dashed #1E3A5F;
  border-radius: 12px;
  padding: 16px;
  min-height: 48px;
  color: #9AA0A6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover, &:active {
    border-color: #ED7E13;
    color: #ED7E13;
    background: rgba(237, 126, 19, 0.06);
    transform: translateY(-1px);
  }

  svg {
    font-size: 14px;
  }
`;

const ContextSummaryBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 10px;
  margin-bottom: 14px;

  .context-info {
    font-size: 11px;
    font-weight: 600;
    color: #E8EAED;
    display: flex;
    align-items: center;
    gap: 6px;

    .count-badge {
      background: #ED7E13;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 8px;
    }
  }

  .toggle-all-btn {
    background: transparent;
    border: none;
    color: #ED7E13;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #EA580C;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 11px;
  font-weight: 700;
  color: #5F6B7A;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 8px;
`;

const SourceCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => (props.selected ? 'rgba(237, 126, 19, 0.08)' : '#11223A')};
  border: 1px solid ${props => (props.selected ? '#ED7E13' : '#1E3A5F')};
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    transform: translateX(2px);
  }

  .source-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .source-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => (props.selected ? 'rgba(237, 126, 19, 0.2)' : 'rgba(255, 255, 255, 0.04)')};
    color: ${props => (props.selected ? '#ED7E13' : '#9AA0A6')};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .source-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .source-title {
      font-size: 12px;
      font-weight: 600;
      color: ${props => (props.selected ? '#FFFFFF' : '#CBD5E1')};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .source-meta {
      font-size: 10px;
      color: #9AA0A6;
      display: flex;
      align-items: center;
      gap: 6px;

      .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #22C55E;
      }
    }
  }

  .checkbox-icon {
    color: ${props => (props.selected ? '#ED7E13' : '#5F6B7A')};
    font-size: 16px;
    flex-shrink: 0;
    margin-left: 8px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 14px;
  margin-top: 10px;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
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

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 11, 20, 0.85);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #0B1626;
  border: 1px solid #ED7E13;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  padding: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.2s ease;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h4 {
      font-size: 14px;
      font-weight: 700;
      color: #E8EAED;
    }

    button {
      background: transparent;
      border: none;
      color: #9AA0A6;
      font-size: 16px;
      cursor: pointer;

      &:hover { color: #E8EAED; }
    }
  }

  input, textarea {
    width: 100%;
    background: #11223A;
    border: 1px solid #1E3A5F;
    border-radius: 10px;
    padding: 10px 12px;
    color: #E8EAED;
    font-size: 12px;
    font-family: inherit;
    margin-bottom: 12px;
    outline: none;

    &:focus {
      border-color: #ED7E13;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 10px;

    button {
      padding: 10px 16px;
      min-height: 44px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .cancel-btn {
      background: #11223A;
      border: 1px solid #1E3A5F;
      color: #9AA0A6;

      &:hover { background: #1E3A5F; color: #E8EAED; }
    }

    .save-btn {
      background: #ED7E13;
      border: none;
      color: white;

      &:hover { background: #EA580C; }
    }
  }
`;

export function SmartBookSourcesTab({
  activeModule,
  lessons = [],
  customSources = [],
  selectedSourceIds = [],
  onToggleSource,
  onToggleAll,
  onAddCustomSource,
  onRemoveCustomSource
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const totalSourcesCount = lessons.length + customSources.length;
  const allSelected = selectedSourceIds.length === totalSourcesCount && totalSourcesCount > 0;

  const handleSaveSource = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddCustomSource({
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      is_custom: true
    });
    setNewTitle('');
    setNewContent('');
    setModalOpen(false);
  };

  return (
    <SourcesContainer>
      <AddSourceButton onClick={() => setModalOpen(true)}>
        <FaPlus />
        <span>Adicionar fonte ou anotação clínica</span>
      </AddSourceButton>

      <ContextSummaryBar>
        <div className="context-info">
          <span>Contexto RAG:</span>
          <span className="count-badge">{selectedSourceIds.length} / {totalSourcesCount} ativas</span>
        </div>
        <button className="toggle-all-btn" onClick={() => onToggleAll(!allSelected)}>
          {allSelected ? 'Desmarcar todas' : 'Selecionar todas'}
        </button>
      </ContextSummaryBar>

      <SectionTitle>Aulas do Módulo LMS ({activeModule?.title})</SectionTitle>
      {lessons.length === 0 ? (
        <EmptyState>
          <div className="empty-icon">📄</div>
          <div className="empty-title">Nenhuma aula encontrada</div>
          <div className="empty-text">Este módulo ainda não possui aulas ou transcrições cadastradas.</div>
        </EmptyState>
      ) : (
        lessons.map((lesson) => {
          const isSelected = selectedSourceIds.includes(String(lesson.id));
          return (
            <SourceCard
              key={lesson.id}
              selected={isSelected}
              onClick={() => onToggleSource(String(lesson.id))}
            >
              <div className="source-left">
                <div className="source-icon">
                  <FaVideo size={14} />
                </div>
                <div className="source-details">
                  <span className="source-title">{lesson.title}</span>
                  <div className="source-meta">
                    <span className="status-dot" />
                    <span>{lesson.duration || 'Transcrição verbatim'}</span>
                    <span>• Sincronizado</span>
                  </div>
                </div>
              </div>
              <div className="checkbox-icon">
                {isSelected ? <FaCheckSquare /> : <FaSquare />}
              </div>
            </SourceCard>
          );
        })
      )}

      {customSources.length > 0 && (
        <>
          <SectionTitle>Suas Anotações & Fontes Customizadas</SectionTitle>
          {customSources.map((cs) => {
            const isSelected = selectedSourceIds.includes(String(cs.id));
            return (
              <SourceCard
                key={cs.id}
                selected={isSelected}
                onClick={() => onToggleSource(String(cs.id))}
              >
                <div className="source-left">
                  <div className="source-icon">
                    <FaFileAlt size={14} />
                  </div>
                  <div className="source-details">
                    <span className="source-title">{cs.title}</span>
                    <div className="source-meta">
                      <span>Nota pessoal</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustomSource(cs.id);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    title="Excluir anotação"
                  >
                    <FaTrash size={12} />
                  </button>
                  <div className="checkbox-icon">
                    {isSelected ? <FaCheckSquare /> : <FaSquare />}
                  </div>
                </div>
              </SourceCard>
            );
          })}
        </>
      )}

      {modalOpen && (
        <ModalBackdrop onClick={() => setModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Adicionar Nova Fonte / Anotação</h4>
              <button onClick={() => setModalOpen(false)}><FaTimes /></button>
            </div>
            <input
              type="text"
              placeholder="Título da anotação (ex: Caso Clínico - Glúteo)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Cole o texto, laudo, transcrição ou notas clínicas..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="save-btn" onClick={handleSaveSource}>Salvar Fonte</button>
            </div>
          </ModalCard>
        </ModalBackdrop>
      )}
    </SourcesContainer>
  );
}
