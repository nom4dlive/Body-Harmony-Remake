import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaUsersCog, FaUserShield, FaHeadset, FaCircle,
  FaCheckCircle, FaTimesCircle, FaExchangeAlt, FaShieldAlt,
  FaRobot, FaClock, FaEdit, FaSave, FaSpinner, FaTag
} from 'react-icons/fa';
import { crmApi } from '../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Team Manager Luxury V4)
   ============================================================================== */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.25s ease;
`;

const TopBanner = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 1.1rem 1.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  box-shadow: 0 2px 8px rgba(10, 62, 96, 0.04);

  .info-zone {
    h2 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Outfit', sans-serif;
    }
    p {
      margin: 0.25rem 0 0 0;
      font-size: 0.78rem;
      color: #475569;
    }
  }

  .stats-zone {
    display: flex;
    gap: 0.8rem;

    .stat-pill {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.74rem;
      font-weight: 700;
      color: #0A3E60;
    }
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
`;

const AttendantCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  border-top: 4px solid ${(props) => props.$accentColor || '#0A3E60'};

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${(props) => props.$accentBg || 'rgba(10, 62, 96, 0.1)'};
        color: ${(props) => props.$accentColor || '#0A3E60'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1.1rem;
      }

      .titles {
        h3 {
          margin: 0;
          font-size: 0.94rem;
          font-weight: 800;
          color: #0A3E60;
        }
        span {
          font-size: 0.74rem;
          color: #64748B;
        }
      }
    }

    .status-tag {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.3rem;

      &.online {
        background: #D1FAE5;
        color: #065F46;
      }
      &.busy {
        background: #FEF3C7;
        color: #92400E;
      }
      &.offline {
        background: #F1F5F9;
        color: #64748B;
      }
    }
  }

  .lines-section {
    background: #F8FAFC;
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    border: 1px solid #E2E8F0;

    .section-title {
      font-size: 0.7rem;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .line-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;

      .badge {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        color: #0A3E60;

        &.primary {
          background: #0A3E60;
          color: #FFFFFF;
          border-color: #0A3E60;
        }
      }
    }
  }

  .permissions-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.74rem;
    color: #475569;

    .perm-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      svg {
        color: #10B981;
      }
    }
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    border-top: 1px solid #F1F5F9;
    padding-top: 0.75rem;

    button {
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 700;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #0A3E60;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.15s ease;

      &:hover {
        background: #0A3E60;
        color: #FFFFFF;
      }
    }
  }
`;

const RoutingRuleBox = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.75rem;

    .rule-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      .rule-header {
        font-size: 0.76rem;
        font-weight: 800;
        color: #0A3E60;
        display: flex;
        justify-content: space-between;
      }

      .rule-desc {
        font-size: 0.72rem;
        color: #475569;
      }

      .dest-badge {
        margin-top: 0.3rem;
        font-size: 0.7rem;
        font-weight: 800;
        color: #D46D0E;
        background: rgba(237, 126, 19, 0.12);
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        width: fit-content;
      }
    }
  }
`;

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function TeamManager() {
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmApi.getTeam().then(res => {
      if (res && res.success && res.attendants) {
        setAttendants(res.attendants);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    crmApi.getAttendants()
      .then((res) => {
        if (res && res.success && Array.isArray(res.attendants)) {
          // Atualiza dados reais se vierem do backend
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Container>
      <TopBanner>
        <div className="info-zone">
          <h2>
            <FaUsersCog style={{ color: '#ED7E13' }} /> Gestão de Atendentes &amp; Silos por Linha
          </h2>
          <p>
            Configuração de acessos por departamento, isolamento de caixas de entrada e regras de transbordo da IA.
          </p>
        </div>

        <div className="stats-zone">
          <div className="stat-pill">
            <FaCircle style={{ color: '#10B981', fontSize: '0.5rem' }} /> 3 Operadores Ativos (4 Linhas)
          </div>
          <div className="stat-pill">
            <FaShieldAlt style={{ color: '#0A3E60' }} /> Isolamento Estrito Ativado
          </div>
        </div>
      </TopBanner>

      {/* CARDS DOS 3 ATENDENTES PRINCIPAIS */}
      <TeamGrid>
        {attendants.map((a) => (
          <AttendantCard key={a.id} $accentColor={a.accentColor} $accentBg={a.accentBg}>
            <div className="card-header">
              <div className="user-info">
                <div className="avatar">{((a?.name || 'A').charAt(0)).toUpperCase()}</div>
                <div className="titles">
                  <h3>{a?.name || 'Atendente'}</h3>
                  <span>{a?.roleDescription || ''}</span>
                </div>
              </div>
              <span className={`status-tag ${(a?.status || 'ONLINE').toLowerCase()}`}>
                <FaCircle style={{ fontSize: '0.45rem' }} /> {a?.status || 'ONLINE'}
              </span>
            </div>


            <div className="lines-section">
              <div className="section-title">
                <FaTag /> Silo de Atendimento
              </div>
              <div className="line-badges">
                <span className="badge primary">{a.primaryLine}</span>
                {a.secondaryLine && (
                  <span className="badge primary" style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>
                    {a.secondaryLine}
                  </span>
                )}
                {a.isSupervisor && (
                  <span className="badge" title="Visão total das 4 linhas">
                    + Acesso Panorâmico Admin
                  </span>
                )}
              </div>
            </div>

            <div className="permissions-list">
              <div className="perm-item">
                <FaCheckCircle /> Recebimento exclusivo de novos leads do silo
              </div>
              <div className="perm-item">
                <FaCheckCircle /> Transferência em 1-clique com nota de contexto
              </div>
              {a.isSupervisor && (
                <div className="perm-item">
                  <FaCheckCircle /> Supervisão global e relatórios consolidados
                </div>
              )}
            </div>
          </AttendantCard>
        ))}
      </TeamGrid>

      {/* REGRAS DE ROTEAMENTO AUTOMÁTICO & PLANTÃO */}
      <RoutingRuleBox>
        <h3>
          <FaRobot style={{ color: '#0A3E60' }} /> Roteamento Automático &amp; Plantão Noturno (Hermes IA)
        </h3>

        <div className="rules-grid">
          <div className="rule-item">
            <div className="rule-header">
              <span>Linha 01 (Clínica)</span>
              <FaHeadset style={{ color: '#0A3E60' }} />
            </div>
            <span className="rule-desc">
              Novas mensagens de agendamento presencial e bioimpedância:
            </span>
            <span className="dest-badge">👉 Roteado para: Cibele (Recepção)</span>
          </div>

          <div className="rule-item">
            <div className="rule-header">
              <span>Linha 03 (Vendas &amp; Franquias)</span>
              <FaHeadset style={{ color: '#ED7E13' }} />
            </div>
            <span className="rule-desc">
              Leads de novos licenciamentos, cursos presenciais e congressos:
            </span>
            <span className="dest-badge">👉 Roteado para: Giovanna (Vendas)</span>
          </div>

          <div className="rule-item">
            <div className="rule-header">
              <span>Linha 02 (Jurídico &amp; Cobrança)</span>
              <FaHeadset style={{ color: '#8B5CF6' }} />
            </div>
            <span className="rule-desc">
              Solicitações de minutas de contrato, cartão CNPJ e taxas:
            </span>
            <span className="dest-badge">👉 Roteado para: Guilherme (Jurídico)</span>
          </div>

          <div className="rule-item">
            <div className="rule-header">
              <span>Linha 04 (Suporte às Licenciadas)</span>
              <FaHeadset style={{ color: '#7C3AED' }} />
            </div>
            <span className="rule-desc">
              Dúvidas clínicas pós-venda, acompanhamento e suporte:
            </span>
            <span className="dest-badge">👉 Roteado para: Guilherme (Suporte)</span>
          </div>

          <div className="rule-item">
            <div className="rule-header">
              <span>Plantão 24/7 (Fora do Horário)</span>
              <FaClock style={{ color: '#10B981' }} />
            </div>
            <span className="rule-desc">
              Triagem acolhedora pela IA Hermes com enfileiramento matinal (08h):
            </span>
            <span className="dest-badge">👉 Etiqueta: 🚨 Transbordo IA</span>
          </div>
        </div>
      </RoutingRuleBox>
    </Container>
  );
}

