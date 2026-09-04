import React from 'react';
import styled from 'styled-components';
import { 
  FaClock, FaCheckCircle, FaExclamationTriangle, FaPlay, 
  FaCheck, FaTrash, FaEdit, FaCheckSquare, FaCommentDots
} from 'react-icons/fa';

const KanbanGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  align-items: flex-start;
  font-family: 'Montserrat', sans-serif;
`;

const KanbanColumn = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const ColumnHeader = styled.div`
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$borderColor || '#cbd5e1'};
  background: ${props => props.$bg || 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  font-weight: 800;
  font-size: 0.85rem;
  color: #0a3e60;
`;

const BadgeCount = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  color: #0a3e60;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  max-height: 680px;
  padding-right: 2px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-size: 0.8rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  font-weight: 600;
  background: white;
`;

const CardWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: all 0.2s;

  &:hover {
    border-color: #0a3e60;
    box-shadow: 0 6px 16px rgba(10, 62, 96, 0.08);
    transform: translateY(-1px);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const EventTypeTag = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
`;

const PriorityChip = styled.span`
  font-size: 0.62rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$priority) {
      case 'critica': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: #0a3e60;
  cursor: pointer;
  line-height: 1.35;
  transition: color 0.15s;

  &:hover {
    color: #ed7e13;
  }
`;

const CardDesc = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ChecklistProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 2px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;

  span.label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #ed7e13;
  }
`;

const ProgressBarBg = styled.div`
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: #ed7e13;
  width: ${props => props.$progress}%;
  transition: width 0.3s;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.72rem;
  color: #64748b;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    color: #ed7e13;
  }
`;

const CommentsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  color: #0a3e60;
  font-weight: 700;
  font-size: 0.7rem;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.4rem;
  border-top: 1px solid #f1f5f9;
  gap: 4px;
`;

const ActionBtnGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionBtn = styled.button`
  height: 32px;
  padding: 0 0.55rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${props => props.$color || '#475569'};
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f8fafc;
    border-color: ${props => props.$color || '#0a3e60'};
    transform: translateY(-1px);
  }
`;

export default function AgendaKanbanListView({ events, onUpdateStatus, onEditEvent, onDeleteEvent, onSelectEvent }) {
  const columns = [
    { id: 'pendente', title: '⏳ Pendente', borderColor: '#fde68a', bg: '#fffbeb' },
    { id: 'em_andamento', title: '🔄 Em Andamento', borderColor: '#bfdbfe', bg: '#eff6ff' },
    { id: 'concluido', title: '✅ Concluído', borderColor: '#bbf7d0', bg: '#f0fdf4' },
    { id: 'cancelado', title: '❌ Cancelado / Adiado', borderColor: '#e2e8f0', bg: '#f8fafc' }
  ];

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'urgencia': return '🚨 Urgência';
      case 'agendamento_cliente': return '📅 Agendamento';
      case 'evento_geral': return '🏢 Reunião';
      default: return '📌 Pendência';
    }
  };

  return (
    <KanbanGrid>
      {columns.map((col) => {
        const colEvents = events.filter(e => e.status === col.id || (col.id === 'cancelado' && e.status === 'adiado'));

        return (
          <KanbanColumn key={col.id}>
            {/* Column Header */}
            <ColumnHeader $borderColor={col.borderColor} $bg={col.bg}>
              <span>{col.title}</span>
              <BadgeCount>{colEvents.length}</BadgeCount>
            </ColumnHeader>

            {/* Column Events List */}
            <CardsContainer>
              {colEvents.length === 0 ? (
                <EmptyState>
                  Nenhum registro nesta etapa
                </EmptyState>
              ) : (
                colEvents.map((evt) => (
                  <CardWrapper key={evt.id}>
                    {/* Priority Tag & Type */}
                    <CardTop>
                      <EventTypeTag>{getEventTypeLabel(evt.event_type)}</EventTypeTag>
                      <PriorityChip $priority={evt.priority}>
                        {evt.priority}
                      </PriorityChip>
                    </CardTop>

                    {/* Title & Clickable Drawer Trigger */}
                    <CardTitle onClick={() => onSelectEvent && onSelectEvent(evt)}>
                      {evt.title}
                    </CardTitle>

                    {/* Description snippet */}
                    {evt.description && (
                      <CardDesc>{evt.description}</CardDesc>
                    )}

                    {/* Checklist Progress Bar */}
                    {evt.checklist_total > 0 && (
                      <ChecklistProgress>
                        <ProgressLabel>
                          <span className="label">
                            <FaCheckSquare size={10} /> Subtarefas
                          </span>
                          <span>{evt.checklist_completed}/{evt.checklist_total} ({evt.checklist_progress}%)</span>
                        </ProgressLabel>
                        <ProgressBarBg>
                          <ProgressBarFill $progress={evt.checklist_progress} />
                        </ProgressBarBg>
                      </ChecklistProgress>
                    )}

                    {/* Datetime & Comments Badge */}
                    <CardFooter>
                      <TimeInfo>
                        <FaClock size={10} />
                        <span>{evt.start_datetime ? evt.start_datetime.substring(0, 16).replace('T', ' ') : 'Sem data'}</span>
                      </TimeInfo>
                      {evt.comments_count > 0 && (
                        <CommentsBadge>
                          <FaCommentDots size={10} /> {evt.comments_count}
                        </CommentsBadge>
                      )}
                    </CardFooter>

                    {/* Quick Action Buttons */}
                    <CardActions>
                      <ActionBtnGroup>
                        {evt.status !== 'em_andamento' && evt.status !== 'concluido' && (
                          <ActionBtn
                            onClick={() => onUpdateStatus(evt.id, 'em_andamento')}
                            title="Iniciar em Andamento"
                            $color="#2563eb"
                          >
                            <FaPlay size={9} /> Iniciar
                          </ActionBtn>
                        )}
                        {evt.status !== 'concluido' && (
                          <ActionBtn
                            onClick={() => onUpdateStatus(evt.id, 'concluido')}
                            title="Marcar como Concluído"
                            $color="#16a34a"
                          >
                            <FaCheck size={9} /> Concluir
                          </ActionBtn>
                        )}
                      </ActionBtnGroup>

                      <ActionBtnGroup>
                        <ActionBtn
                          onClick={() => onSelectEvent && onSelectEvent(evt)}
                          title="Ver Detalhes, Anexos e Discussão"
                          $color="#ed7e13"
                        >
                          <FaCheckSquare size={10} /> Detalhes
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => onEditEvent(evt)}
                          title="Editar"
                          $color="#475569"
                        >
                          <FaEdit size={10} />
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => onDeleteEvent(evt.id)}
                          title="Excluir"
                          $color="#dc2626"
                        >
                          <FaTrash size={10} />
                        </ActionBtn>
                      </ActionBtnGroup>
                    </CardActions>
                  </CardWrapper>
                ))
              )}
            </CardsContainer>
          </KanbanColumn>
        );
      })}
    </KanbanGrid>
  );
}
