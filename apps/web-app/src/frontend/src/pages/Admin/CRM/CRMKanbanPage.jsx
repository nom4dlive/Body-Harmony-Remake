import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/AdminLayout';
import { crmApi } from '../../../services/api';
import { 
  FaColumns, 
  FaHeartbeat, 
  FaCreditCard, 
  FaWhatsapp, 
  FaCalendarCheck, 
  FaBell, 
  FaPlus, 
  FaSyncAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUserCheck,
  FaVideo
} from 'react-icons/fa';

const Container = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: calc(100vh - 70px);
  background: #F8FAFC;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0A3E60 0%, #07131E 100%);
      color: #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }

    h1 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748B;
    }
  }

  .actions-group {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }
`;

const PipelineSwitcher = styled.div`
  display: flex;
  background: #E2E8F0;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;

  button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 1rem;
    border-radius: 8px;
    border: none;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$active === 'true' ? '#0A3E60' : 'transparent'};
    color: ${props => props.$active === 'true' ? '#FFFFFF' : '#64748B'};

    &:hover {
      color: #0A3E60;
    }
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: ${props => props.$primary ? 'none' : '1px solid #CBD5E1'};
  background: ${props => props.$primary ? 'linear-gradient(135deg, #ED7E13 0%, #D96E0D 100%)' : '#FFFFFF'};
  color: ${props => props.$primary ? '#FFFFFF' : '#0A3E60'};
  box-shadow: ${props => props.$primary ? '0 2px 8px rgba(237, 126, 19, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(10, 62, 96, 0.12);
  }
`;

const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

const Column = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

  .col-header {
    padding: 0.85rem 1rem;
    border-bottom: 2px solid ${props => props.$accent || '#0A3E60'};
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 800;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .badge {
      background: #F1F5F9;
      color: #64748B;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 10px;
    }
  }

  .col-body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    overflow-y: auto;
  }
`;

const Card = styled.div`
  background: #F8FAFC;
  border-radius: 9px;
  border: 1px solid #E2E8F0;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    border-color: #ED7E13;
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.12);
    transform: translateY(-1px);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .name {
      font-weight: 700;
      font-size: 0.85rem;
      color: #0F172A;
    }

    .prio {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 6px;
      background: ${props => props.$prio === 'ALTA' || props.$prio === 'VIP' ? '#FEE2E2' : '#FEF3C7'};
      color: ${props => props.$prio === 'ALTA' || props.$prio === 'VIP' ? '#DC2626' : '#D97706'};
    }
  }

  .phone {
    font-size: 0.75rem;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed #E2E8F0;
    padding-top: 0.4rem;

    select {
      font-size: 0.72rem;
      padding: 0.2rem 0.35rem;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #0A3E60;
      font-weight: 600;
      cursor: pointer;
    }

    .quick-icons {
      display: flex;
      gap: 0.3rem;

      button {
        background: none;
        border: none;
        color: #0A3E60;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0.15rem;

        &:hover {
          color: #ED7E13;
        }
      }
    }
  }
`;

const CLINICAL_STAGES = [
  { key: 'novo_contato', name: '1. Novo Contato', accent: '#3B82F6' },
  { key: 'anamnese_enviada', name: '2. Anamnese', accent: '#8B5CF6' },
  { key: 'avaliacao_agendada', name: '3. Agendada', accent: '#ED7E13' },
  { key: 'em_tratamento', name: '4. Em Tratamento', accent: '#10B981' },
  { key: 'pacote_renovado', name: '5. Renovado / VIP', accent: '#0A3E60' }
];

const COMMERCIAL_STAGES = [
  { key: 'lead_captado', name: '1. Lead Captado', accent: '#3B82F6' },
  { key: 'apresentacao_curso', name: '2. Apresentação', accent: '#8B5CF6' },
  { key: 'link_enviado', name: '3. Link Checkout', accent: '#ED7E13' },
  { key: 'inscricao_confirmada', name: '4. Confirmado ✨', accent: '#10B981' }
];

export default function CRMKanbanPage() {
  const [pipeline, setPipeline] = useState('CLINICA');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noShowProcessing, setNoShowProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const stages = pipeline === 'CLINICA' ? CLINICAL_STAGES : COMMERCIAL_STAGES;

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await crmApi.getKanbanCards(pipeline);
      if (res?.cards) {
        setCards(res.cards);
      }
    } catch (err) {
      console.error("Erro ao carregar cartões:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [pipeline]);

  const handleMoveStage = async (cardId, newStage) => {
    try {
      await crmApi.moveKanbanCard(cardId, newStage);
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, stage: newStage } : c));
      showToast("✓ Etapa atualizada e sincronizada com Chatwoot!");
    } catch (err) {
      showToast("Erro ao mover etapa.");
    }
  };

  const handleRunAntiNoShow = async () => {
    setNoShowProcessing(true);
    try {
      const res = await crmApi.processAntiNoShow();
      showToast(`✓ Anti No-Show: ${res.reminders_24h_sent} lembretes 24h e ${res.reminders_2h_sent} lembretes 2h disparados!`);
    } catch (err) {
      showToast("Erro ao disparar Anti No-Show.");
    } finally {
      setNoShowProcessing(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <div className="title-group">
            <div className="icon-box">
              <FaColumns />
            </div>
            <div>
              <h1>Funil de Atendimento CRM</h1>
              <p>Pipelines visuais integrados ao Chatwoot, Google Calendar e WhatsApp</p>
            </div>
          </div>

          <div className="actions-group">
            <PipelineSwitcher>
              <button 
                $active={pipeline === 'CLINICA' ? 'true' : 'false'} 
                onClick={() => setPipeline('CLINICA')}
              >
                <FaHeartbeat />
                <span>💆 Atendimento Clínico</span>
              </button>
              <button 
                $active={pipeline === 'COMERCIAL' ? 'true' : 'false'} 
                onClick={() => setPipeline('COMERCIAL')}
              >
                <FaCreditCard />
                <span>💼 Vendas & Congresso</span>
              </button>
            </PipelineSwitcher>

            <ActionBtn onClick={handleRunAntiNoShow} disabled={noShowProcessing}>
              <FaBell />
              <span>{noShowProcessing ? 'Disparando...' : 'Testar Anti No-Show'}</span>
            </ActionBtn>

            <ActionBtn $primary onClick={loadCards} title="Recarregar cartões">
              <FaSyncAlt />
            </ActionBtn>
          </div>
        </Header>

        {toastMsg && (
          <div style={{ background: '#0A3E60', color: '#FFFFFF', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {toastMsg}
          </div>
        )}

        <KanbanBoard>
          {stages.map(st => {
            const stageCards = cards.filter(c => c.stage === st.key);
            return (
              <Column key={st.key} $accent={st.accent}>
                <div className="col-header">
                  <h3>{st.name}</h3>
                  <span className="badge">{stageCards.length}</span>
                </div>
                <div className="col-body">
                  {stageCards.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', padding: '1rem 0' }}>
                      Nenhum contato nesta etapa
                    </div>
                  ) : (
                    stageCards.map(card => (
                      <Card key={card.id} $prio={card.priority}>
                        <div className="card-top">
                          <span className="name">{card.contact_name}</span>
                          <span className="prio">{card.priority}</span>
                        </div>
                        <div className="phone">
                          <FaWhatsapp color="#10B981" />
                          <span>{card.contact_phone}</span>
                        </div>
                        <div className="card-actions">
                          <select 
                            value={card.stage} 
                            onChange={(e) => handleMoveStage(card.id, e.target.value)}
                          >
                            {stages.map(s => (
                              <option key={s.key} value={s.key}>{s.name}</option>
                            ))}
                          </select>
                          <div className="quick-icons">
                            <button 
                              title="Abrir no WhatsApp"
                              onClick={() => window.open(`https://wa.me/${card.contact_phone}`, '_blank')}
                            >
                              <FaWhatsapp />
                            </button>
                            <button 
                              title="Criar Google Meet"
                              onClick={() => window.open('https://meet.google.com/new', '_blank')}
                            >
                              <FaVideo />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Column>
            );
          })}
        </KanbanBoard>
      </Container>
    </AdminLayout>
  );
}
