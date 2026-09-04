import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, FaCheckSquare, FaCommentDots, FaPaperclip, 
  FaCalendarAlt, FaClock, FaUser, FaPlus, FaPaperPlane, 
  FaUpload, FaCopy, FaCheck, FaExclamationCircle, FaTrash
} from 'react-icons/fa';
import { gestorAgendaApi } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 62, 96, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  font-family: 'Montserrat', sans-serif;
`;

const DrawerContent = styled.div`
  width: 100%;
  max-width: 540px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #0a3e60 0%, #06263b 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const HeaderTitleArea = styled.div`
  .type {
    font-size: 0.72rem;
    font-weight: 700;
    color: #ed7e13;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h3 {
    margin: 4px 0 0 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: white;
    line-height: 1.3;
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: white;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ed7e13;
  }
`;

const TabsNav = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  padding: 0 1rem;
  gap: 0.5rem;
`;

const TabButton = styled.button`
  padding: 0.85rem 1rem;
  background: none;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${props => props.$active ? '#0a3e60' : '#64748b'};
  border-bottom: 2px solid ${props => props.$active ? '#ed7e13' : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: #0a3e60;
  }
`;

const DrawerBody = styled.div`
  padding: 1.25rem 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/* SUBTASKS CHECKLIST STYLES */
const SubtaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SubtaskItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid ${props => props.$completed ? '#bbf7d0' : '#e2e8f0'};
  background: ${props => props.$completed ? '#f0fdf4' : '#ffffff'};
  transition: all 0.2s;

  label {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$completed ? '#15803d' : '#1e293b'};
    text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
    cursor: pointer;
    flex: 1;

    input {
      width: 18px;
      height: 18px;
      accent-color: #ed7e13;
      cursor: pointer;
    }
  }
`;

const AddInputRow = styled.form`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    height: 44px;
    min-height: 44px;
    padding: 0 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    outline: none;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  button {
    height: 44px;
    min-height: 44px;
    padding: 0 1.2rem;
    background: #0a3e60;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
      background: #06263b;
    }
  }
`;

/* COMMENTS / DISCUSSION STYLES */
const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CommentBubble = styled.div`
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .top {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 700;
    color: #0a3e60;
    margin-bottom: 4px;

    span.time {
      color: #94a3b8;
      font-weight: 500;
    }
  }

  .text {
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.45;
  }
`;

const CommentInputRow = styled.form`
  display: flex;
  gap: 0.5rem;

  textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    font-family: inherit;
    min-height: 44px;
    max-height: 120px;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  button {
    height: 44px;
    min-height: 44px;
    padding: 0 1.2rem;
    background: #ed7e13;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
      background: #d96d07;
    }
  }
`;

/* ATTACHMENTS STYLES */
const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;

  .info {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0a3e60;

    svg {
      color: #ed7e13;
    }
  }

  a {
    font-size: 0.75rem;
    font-weight: 700;
    color: #2563eb;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
`;

export default function EventDetailsDrawer({ isOpen, onClose, event, onRefresh }) {
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'comments' | 'attachments'
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // New item inputs
  const [newChecklist, setNewChecklist] = useState('');
  const [newComment, setNewComment] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const { showSuccess, showError, showWarning } = useToast();

  const fetchDetails = async () => {
    if (!event?.id) return;
    try {
      setLoading(true);
      const res = await gestorAgendaApi.getEventDetail(event.id);
      if (res?.event) {
        setDetails(res.event);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do evento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event?.id) {
      fetchDetails();
    }
  }, [isOpen, event?.id]);

  if (!isOpen || !event) return null;

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklist.trim()) return;
    try {
      await gestorAgendaApi.addChecklist(event.id, newChecklist.trim());
      setNewChecklist('');
      await fetchDetails();
      if (onRefresh) onRefresh();
      showSuccess('Subtarefa Adicionada', 'Item incluído na lista.');
    } catch (err) {
      showError('Erro no Checklist', err.message || 'Falha de comunicação');
    }
  };

  const handleToggleChecklist = async (checklistId) => {
    try {
      await gestorAgendaApi.toggleChecklist(checklistId);
      await fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      showError('Erro no Checklist', err.message || 'Falha de comunicação');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await gestorAgendaApi.addComment(event.id, newComment.trim());
      setNewComment('');
      await fetchDetails();
      if (onRefresh) onRefresh();
      showSuccess('Comentário Registrado', 'Mensagem gravada no mural.');
    } catch (err) {
      showError('Erro no Comentário', err.message || 'Falha de comunicação');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFile(true);
      await gestorAgendaApi.uploadAttachment(event.id, file);
      await fetchDetails();
      if (onRefresh) onRefresh();
      showSuccess('Arquivo Anexado', `${file.name} foi anexado com sucesso.`);
    } catch (err) {
      showError('Erro no Anexo', err.message || 'Falha no upload');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  return (
    <DrawerOverlay onClick={onClose}>
      <DrawerContent onClick={(e) => e.stopPropagation()}>
        <DrawerHeader>
          <HeaderTitleArea>
            <div className="type">{event.event_type} • {event.priority}</div>
            <h3>{event.title}</h3>
          </HeaderTitleArea>
          <CloseBtn onClick={onClose} title="Fechar Detalhes">
            <FaTimes />
          </CloseBtn>
        </DrawerHeader>

        <TabsNav>
          <TabButton
            $active={activeTab === 'checklists'}
            onClick={() => setActiveTab('checklists')}
          >
            <FaCheckSquare /> Subtarefas ({details?.checklists?.length || 0})
          </TabButton>
          <TabButton
            $active={activeTab === 'comments'}
            onClick={() => setActiveTab('comments')}
          >
            <FaCommentDots /> Discussão ({details?.comments?.length || 0})
          </TabButton>
          <TabButton
            $active={activeTab === 'attachments'}
            onClick={() => setActiveTab('attachments')}
          >
            <FaPaperclip /> Anexos ({details?.attachments?.length || 0})
          </TabButton>
        </TabsNav>

        <DrawerBody>
          {/* TAB 1: SUBTASKS */}
          {activeTab === 'checklists' && (
            <>
              <AddInputRow onSubmit={handleAddChecklist}>
                <input
                  type="text"
                  placeholder="Adicionar nova subtarefa..."
                  value={newChecklist}
                  onChange={(e) => setNewChecklist(e.target.value)}
                />
                <button type="submit">
                  <FaPlus /> Adicionar
                </button>
              </AddInputRow>

              <SubtaskList>
                {(!details?.checklists || details.checklists.length === 0) ? (
                  <EmptyNotice>
                    Nenhuma subtarefa registrada neste item.
                  </EmptyNotice>
                ) : (
                  details.checklists.map((chk) => (
                    <SubtaskItem key={chk.id} $completed={chk.completed}>
                      <label>
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => handleToggleChecklist(chk.id)}
                        />
                        <span>{chk.title}</span>
                      </label>
                    </SubtaskItem>
                  ))
                )}
              </SubtaskList>
            </>
          )}

          {/* TAB 2: COMMENTS / MURAL */}
          {activeTab === 'comments' && (
            <>
              <CommentInputRow onSubmit={handleAddComment}>
                <textarea
                  rows={2}
                  placeholder="Escreva um comentário ou atualização da equipe..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit">
                  <FaPaperPlane />
                </button>
              </CommentInputRow>

              <CommentsList>
                {(!details?.comments || details.comments.length === 0) ? (
                  <EmptyNotice>
                    Nenhum comentário ou menção registrado.
                  </EmptyNotice>
                ) : (
                  details.comments.map((comm) => (
                    <CommentBubble key={comm.id}>
                      <div className="top">
                        <span>{comm.author_name || 'Gestor'}</span>
                        <span className="time">{comm.created_at?.substring(0, 16).replace('T', ' ')}</span>
                      </div>
                      <div className="text">{comm.comment}</div>
                    </CommentBubble>
                  ))
                )}
              </CommentsList>
            </>
          )}

          {/* TAB 3: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem',
                    background: '#f8fafc',
                    border: '1px dashed #0a3e60',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#0a3e60',
                    cursor: uploadingFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaUpload /> {uploadingFile ? 'Enviando anexo...' : 'Anexar Documento / Imagem'}
                  <input
                    type="file"
                    disabled={uploadingFile}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(!details?.attachments || details.attachments.length === 0) ? (
                  <EmptyNotice>
                    Nenhum documento anexado.
                  </EmptyNotice>
                ) : (
                  details.attachments.map((att) => (
                    <AttachmentItem key={att.id}>
                      <div className="info">
                        <FaPaperclip />
                        <span>{att.file_name}</span>
                      </div>
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer" download>
                        Baixar
                      </a>
                    </AttachmentItem>
                  ))
                )}
              </div>
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </DrawerOverlay>
  );
}
