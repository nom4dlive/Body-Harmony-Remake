import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaColumns, FaPlus, FaFilter, FaSearch, FaWhatsapp,
  FaDollarSign, FaUserCircle, FaEllipsisH, FaCheckCircle,
  FaArrowRight, FaTag, FaTimes, FaFire, FaCheck
} from 'react-icons/fa';
import { crmApi } from '../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Kanban Pipeline Luxury V4.5)
   ============================================================================== */

const KanbanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 125px);
  min-height: 600px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid var(--bh-border, #E2E8F0);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(10, 62, 96, 0.05);
`;

const KanbanTopBar = styled.div`
  padding: 0.75rem 1.25rem;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  .left-zone {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: #0A3E60;
      font-family: 'Outfit', sans-serif;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .funnel-selector {
      display: flex;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      overflow: hidden;
      padding: 0.15rem;

      button {
        min-height: 38px;
        padding: 0.4rem 0.95rem;
        font-size: 0.78rem;
        font-weight: 700;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #475569;
        border-radius: 6px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;

        &:focus-visible {
          outline: 2px solid #ED7E13;
          outline-offset: -2px;
        }

        &.active {
          background: #0A3E60;
          color: #FFFFFF;
          box-shadow: 0 2px 4px rgba(10, 62, 96, 0.2);
        }

        &:hover:not(.active) {
          background: rgba(237, 126, 19, 0.12);
          color: #0A3E60;
        }
      }
    }
  }

  .right-zone {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    .add-btn {
      background: #ED7E13;
      color: #FFFFFF;
      border: none;
      min-height: 40px;
      padding: 0.45rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 6px rgba(237, 126, 19, 0.25);

      &:hover {
        background: #D46D0E;
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: 2px solid #ED7E13;
        outline-offset: 2px;
      }
    }
  }
`;

const KanbanBoardArea = styled.div`
  flex: 1;
  overflow-x: auto;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  background: #F8FAFC;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
`;

const Column = styled.div`
  width: 290px;
  min-width: 290px;
  background: ${(props) => (props.$isDragOver ? '#FFFBF5' : '#FFFFFF')};
  border-radius: 12px;
  border: ${(props) => (props.$isDragOver ? '2px dashed #ED7E13' : '1px solid #E2E8F0')};
  display: flex;
  flex-direction: column;
  max-height: 100%;
  box-shadow: ${(props) => (props.$isDragOver ? '0 8px 24px rgba(237, 126, 19, 0.16)' : '0 2px 8px rgba(10, 62, 96, 0.04)')};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform: ${(props) => (props.$isDragOver ? 'translateY(-2px)' : 'none')};
`;

const ColumnHeader = styled.div`
  padding: 0.85rem 1rem;
  border-bottom: 3px solid ${(props) => props.$borderColor || '#0A3E60'};
  background: #FFFFFF;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .col-title {
      font-size: 0.86rem;
      font-weight: 800;
      color: #0A3E60;
    }

    .card-count {
      font-size: 0.72rem;
      font-weight: 800;
      background: #F1F5F9;
      color: #0A3E60;
      padding: 0.15rem 0.5rem;
      border-radius: 8px;
    }
  }

  .sum-row {
    font-size: 0.74rem;
    font-weight: 800;
    color: #ED7E13;
    margin-top: 0.25rem;
  }
`;

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 120px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 2px;
  }
`;

const OpportunityCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 0.85rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #ED7E13;
    box-shadow: 0 4px 14px rgba(237, 126, 19, 0.14);
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
    opacity: 0.85;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.35rem;

    .contact-name {
      font-weight: 800;
      font-size: 0.88rem;
      color: #0A3E60;
    }

    .tag {
      font-size: 0.62rem;
      font-weight: 800;
      background: #FEF3C7;
      color: #92400E;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }
  }

  .city-row {
    font-size: 0.72rem;
    color: #64748B;
    margin-bottom: 0.45rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .days-badge {
      background: #F1F5F9;
      color: #475569;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.66rem;
    }
  }

  .value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #F1F5F9;
    padding-top: 0.45rem;

    .price {
      font-size: 0.84rem;
      font-weight: 800;
      color: #ED7E13;
    }

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 0.3rem;

      button {
        background: transparent;
        border: none;
        color: #10B981;
        cursor: pointer;
        font-size: 0.95rem;
        padding: 0.25rem;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: #059669;
          background: #ECFDF5;
        }

        &.advance-btn {
          color: #ED7E13;
          &:hover {
            color: #D46D0E;
            background: #FFF7ED;
          }
        }
      }
    }
  }
`;

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function KanbanPipeline({ currentProfile }) {
  const [pipelineType, setPipelineType] = useState('SALES');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    city: '',
    value: '',
    tag: 'Lead Inbound'
  });

  const [stages, setStages] = useState([
    {
      id: 'stg_1',
      title: 'Novos Leads (Inbound)',
      color: '#64748B',
      cards: [
        { id: 'c1', name: 'Clínica Harmonize', phone: '5519999990001', city: 'Campinas/SP', tag: 'Franquia', value: 35000, days: 'Há 2h' },
        { id: 'c2', name: 'Dra. Beatriz Santos', phone: '5511999990002', city: 'São Paulo/SP', tag: 'Curso VIP', value: 8500, days: 'Há 4h' }
      ]
    },
    {
      id: 'stg_2',
      title: 'Qualificados & Triagem',
      color: '#0A3E60',
      cards: [
        { id: 'c3', name: 'Instituto Estética Avançada', phone: '5516999990003', city: 'Ribeirão Preto/SP', tag: 'Franquia', value: 45000, days: 'Há 1d' }
      ]
    },
    {
      id: 'stg_3',
      title: 'Apresentação / Proposta',
      color: '#ED7E13',
      cards: [
        { id: 'c4', name: 'Dra. Camila Vasconcelos', phone: '5519999990004', city: 'Campinas/SP', tag: 'Franquia', value: 50000, days: 'Há 2d' }
      ]
    },
    {
      id: 'stg_4',
      title: 'Contrato em Assinatura',
      color: '#8B5CF6',
      cards: [
        { id: 'c5', name: 'Dra. Roberta Bueno', phone: '5541999990005', city: 'Curitiba/PR', tag: 'Licenciamento', value: 60000, days: 'Há 3d' }
      ]
    },
    {
      id: 'stg_5',
      title: 'Fechado / Licenciada Ativa',
      color: '#10B981',
      cards: [
        { id: 'c6', name: 'Clínica Body Shape', phone: '5518999990006', city: 'Assis/SP', tag: 'Licenciada', value: 120000, days: 'Ganho' },
        { id: 'c7', name: 'Espaço Harmony VIP', phone: '5544999990007', city: 'Maringá/PR', tag: 'Licenciada', value: 90000, days: 'Ganho' }
      ]
    }
  ]);

  const [dragOverStageId, setDragOverStageId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    crmApi.getKanbanCards(pipelineType)
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.cards) && res.cards.length > 0) {
          const newStages = stages.map(stg => ({ ...stg, cards: [] }));
          res.cards.forEach(card => {
             const mappedCard = {
                id: card.id,
                name: card.contact_name || 'Desconhecido',
                phone: card.contact_phone || '',
                city: card.contact_phone || '',
                tag: card.priority || 'Normal',
                value: Number(card.value_amount) || 0,
                days: 'Recente'
             };
             const targetStage = newStages.find(s => s.id === card.stage);
             if (targetStage) {
                targetStage.cards.push(mappedCard);
             } else if (newStages.length > 0) {
                newStages[0].cards.push(mappedCard);
             }
          });
          setStages(newStages);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [pipelineType]);

  const handleMoveCard = (cardId, fromStageId, toStageId) => {
    crmApi.moveKanbanCard(cardId, toStageId).catch(() => {});

    setStages((prevStages) => {
      let cardToMove = null;
      const newStages = prevStages.map((stg) => {
        if (stg.id === fromStageId) {
          const remaining = stg.cards.filter((c) => {
            if (c.id === cardId) {
              cardToMove = c;
              return false;
            }
            return true;
          });
          return { ...stg, cards: remaining };
        }
        return stg;
      });

      if (cardToMove) {
        return newStages.map((stg) => {
          if (stg.id === toStageId) {
            return { ...stg, cards: [...stg.cards, cardToMove] };
          }
          return stg;
        });
      }
      return prevStages;
    });
  };

  const handleOpenWhatsApp = (card) => {
    const raw = card.phone || card.city || '';
    const digits = raw.replace(/\D/g, '');
    const finalPhone = digits ? (digits.startsWith('55') ? digits : '55' + digits) : '5518996959486';
    window.open(`https://wa.me/${finalPhone}`, '_blank');
  };

  const handleSaveNewLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) return;

    const newCard = {
      id: 'lead_' + Date.now(),
      name: newLeadForm.name,
      phone: newLeadForm.phone || '5518996959486',
      city: newLeadForm.city || 'São Paulo/SP',
      tag: newLeadForm.tag || 'Novo Lead',
      value: Number(newLeadForm.value) || 1500,
      days: 'Hoje'
    };

    setStages((prev) => {
      const copy = [...prev];
      if (copy[0]) {
        copy[0] = { ...copy[0], cards: [newCard, ...copy[0].cards] };
      }
      return copy;
    });

    setIsNewLeadModalOpen(false);
    setNewLeadForm({ name: '', phone: '', city: '', value: '', tag: 'Lead Inbound' });
  };

  return (
    <KanbanWrapper>
      <KanbanTopBar>
        <div className="left-zone">
          <h3>
            <FaColumns style={{ color: '#ED7E13' }} /> Funil de Oportunidades
          </h3>
          <div className="funnel-selector">
            <button
              className={pipelineType === 'SALES' ? 'active' : ''}
              onClick={() => setPipelineType('SALES')}
            >
              Vendas &amp; Franquias
            </button>
            <button
              className={pipelineType === 'CLINIC' ? 'active' : ''}
              onClick={() => setPipelineType('CLINIC')}
            >
              Suporte Clínico &amp; Alunas
            </button>
          </div>
        </div>

        <div className="right-zone">
          <button
            className="add-btn"
            onClick={() => setIsNewLeadModalOpen(true)}
          >
            <FaPlus /> Novo Lead
          </button>
        </div>
      </KanbanTopBar>

      <KanbanBoardArea>
        {stages.map((stage, idx) => {
          const totalVal = stage.cards.reduce((acc, c) => acc + (c.value || 0), 0);
          const isOver = dragOverStageId === stage.id;

          return (
            <Column
              key={stage.id}
              $isDragOver={isOver}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverStageId !== stage.id) {
                  setDragOverStageId(stage.id);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDragOverStageId(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStageId(null);
                try {
                  const raw = e.dataTransfer.getData('text/plain');
                  if (raw) {
                    const data = JSON.parse(raw);
                    if (data && data.cardId && data.fromStageId !== stage.id) {
                      handleMoveCard(data.cardId, data.fromStageId, stage.id);
                    }
                  }
                } catch (err) {
                  console.warn('Erro ao soltar card no kanban:', err);
                }
              }}
            >
              <ColumnHeader $borderColor={stage.color}>
                <div className="title-row">
                  <span className="col-title">{stage.title}</span>
                  <span className="card-count">{stage.cards.length}</span>
                </div>
                <div className="sum-row">
                  R$ {totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </ColumnHeader>

              <CardList>
                {stage.cards.map((card) => (
                  <OpportunityCard
                    key={card.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ cardId: card.id, fromStageId: stage.id })
                      );
                    }}
                  >
                    <div className="card-top">
                      <span className="contact-name">{card.name}</span>
                      <span className="tag">{card.tag}</span>
                    </div>

                    <div className="city-row">
                      <span>{card.city}</span>
                      <span className="days-badge">⏱️ {card.days}</span>
                    </div>

                    <div className="value-row">
                      <span className="price">
                        R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>

                      <div className="quick-actions">
                        <button
                          title="Abrir no WhatsApp"
                          onClick={() => handleOpenWhatsApp(card)}
                        >
                          <FaWhatsapp />
                        </button>
                        {idx < stages.length - 1 && (
                          <button
                            className="advance-btn"
                            title="Avançar Etapa"
                            onClick={() => handleMoveCard(card.id, stage.id, stages[idx + 1].id)}
                          >
                            <FaArrowRight style={{ fontSize: '0.8rem' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </OpportunityCard>
                ))}
              </CardList>
            </Column>
          );
        })}
      </KanbanBoardArea>

      {/* MODAL DE NOVO LEAD */}
      {isNewLeadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 62, 96, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0A3E60', fontSize: '1rem', fontWeight: 800 }}>
                ✨ Novo Lead no Funil
              </h3>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveNewLead} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Nome / Clínica *</label>
                <input
                  required
                  type="text"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="Ex: Dra. Juliana Costa"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>WhatsApp</label>
                <input
                  type="text"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="5511999999999"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Cidade / UF</label>
                <input
                  type="text"
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  placeholder="Ex: Campinas/SP"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Valor Estimado (R$)</label>
                <input
                  type="number"
                  value={newLeadForm.value}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, value: e.target.value })}
                  placeholder="Ex: 5000"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', border: 'none', background: '#ED7E13', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  Adicionar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KanbanWrapper>
  );
}
