import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaChartLine, FaDownload, FaClock, FaUsers,
  FaDollarSign, FaExternalLinkAlt, FaCheckCircle, FaFileCsv,
  FaSpinner, FaCalendarCheck
} from 'react-icons/fa';
import { crmAnalyticsApi } from '../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Analytics Cockpit V4 Live Real Data)
   ============================================================================== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
  border-radius: 10px;
  overflow: hidden;
`;

const TopBar = styled.div`
  padding: 0.85rem 1.25rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const DashboardBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #F8FAFC;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const MetricCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
    }

    .icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(10, 62, 96, 0.08);
      color: #0A3E60;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
  }

  .big-number {
    font-size: 1.45rem;
    font-weight: 800;
    color: #0A3E60;
    font-family: 'Outfit', sans-serif;
  }

  .trend {
    font-size: 0.7rem;
    font-weight: 700;
    color: #10B981;
  }
`;

const AttendantsTableCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h4 {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;

    th {
      text-align: left;
      padding: 0.5rem 0.6rem;
      background: #F8FAFC;
      color: #64748B;
      font-weight: 700;
      border-bottom: 1px solid #E2E8F0;
    }

    td {
      padding: 0.6rem;
      border-bottom: 1px solid #F1F5F9;
      color: #0F172A;
      font-weight: 600;
    }
  }
`;

const LookerEmbedCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0A3E60;
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    color: #475569;
    max-width: 500px;
  }

  .btn-gold {
    background: #ED7E13;
    color: #FFFFFF;
    border: none;
    padding: 0.5rem 1.15rem;
    border-radius: 6px;
    font-weight: 800;
    font-size: 0.82rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);

    &:hover {
      background: #D46D0E;
    }
  }
`;

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function AnalyticsCockpit() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLiveMetrics();
  }, []);

  const loadLiveMetrics = async () => {
    try {
      const res = await crmAnalyticsApi.getMetrics('30d');
      if (res && res.success) {
        setMetrics(res);
      }
    } catch (e) {
      console.warn('Erro ao carregar métricas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('https://bodyharmony.com.br/api/v1/crm/analytics_export.php?format=csv', '_blank');
  };

  const totalApp = metrics?.clinic_kpis?.total_appointments || 0;
  const confApp = metrics?.clinic_kpis?.confirmed_appointments || 0;
  const confRate = totalApp > 0 ? Math.round((confApp / totalApp) * 100) : (metrics?.clinic_kpis?.confirmation_rate_percent || 0);
  const grossRev = metrics?.congress_sales_kpis?.gross_revenue || 0;
  const totalExp = metrics?.congress_sales_kpis?.experience_tickets_sold || 0;
  const totalVip = metrics?.congress_sales_kpis?.vip_tickets_sold || 0;

  return (
    <Container>
      <TopBar>
        <h3>
          <FaChartLine style={{ color: '#ED7E13' }} /> Relatórios &amp; Indicadores da Clínica
        </h3>

        <div className="actions">
          <button
            style={{
              background: '#FFFFFF',
              color: '#0A3E60',
              border: '1px solid #CBD5E1',
              minHeight: '44px',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
            onClick={handleExportCsv}
            title="Baixar planilha de métricas em formato CSV"
          >
            <FaFileCsv style={{ color: '#ED7E13', fontSize: '1rem' }} /> Exportar Relatório (CSV)
          </button>
        </div>
      </TopBar>

      <DashboardBody>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            <FaSpinner className="fa-spin" /> Carregando métricas em tempo real...
          </div>
        ) : (
          <>
            <MetricsGrid>
              <MetricCard>
                <div className="card-top">
                  <span>Agendamentos Clínicos</span>
                  <div className="icon-wrapper">
                    <FaCalendarCheck />
                  </div>
                </div>
                <div className="big-number">{totalApp} {totalApp === 1 ? 'Consulta' : 'Consultas'}</div>
                <div className="trend">{confApp} {confApp === 1 ? 'confirmada' : 'confirmadas'} ({confRate}%)</div>
              </MetricCard>

              <MetricCard>
                <div className="card-top">
                  <span>Ingressos Congresso</span>
                  <div className="icon-wrapper">
                    <FaUsers />
                  </div>
                </div>
                <div className="big-number">{totalExp + totalVip} {totalExp + totalVip === 1 ? 'Ingresso' : 'Ingressos'}</div>
                <div className="trend">VIP: {totalVip} | Exp: {totalExp}</div>
              </MetricCard>

              <MetricCard>
                <div className="card-top">
                  <span>Taxa de Confirmação</span>
                  <div className="icon-wrapper">
                    <FaCheckCircle />
                  </div>
                </div>
                <div className="big-number">{confRate}%</div>
                <div className="trend">✓ Motor Anti No-Show ativo</div>
              </MetricCard>

              <MetricCard>
                <div className="card-top">
                  <span>Faturamento do Congresso</span>
                  <div className="icon-wrapper">
                    <FaDollarSign />
                  </div>
                </div>
                <div className="big-number">
                  R$ {grossRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="trend">Consolidado em tempo real</div>
              </MetricCard>
            </MetricsGrid>

            {metrics?.attendants_metrics && metrics.attendants_metrics.length > 0 && (
              <AttendantsTableCard>
                <h4>
                  <FaUsers style={{ color: '#ED7E13' }} /> Desempenho Operacional por Atendente
                </h4>
                <table>
                  <thead>
                    <tr>
                      <th>Atendente</th>
                      <th>Função / Departamento</th>
                      <th>Atendimentos</th>
                      <th>Finalizados</th>
                      <th>TMR Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.attendants_metrics.map((att, i) => (
                      <tr key={i}>
                        <td><strong>{att.name}</strong></td>
                        <td>{att.role}</td>
                        <td>{att.total_conversations}</td>
                        <td><span style={{ color: '#10B981', fontWeight: 800 }}>{att.resolved_conversations}</span></td>
                        <td>{att.avg_response_time_minutes} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AttendantsTableCard>
            )}

            <LookerEmbedCard>
              <h4>Painel Executivo Looker Studio</h4>
              <p>
                Acesse o relatório de Business Intelligence completo com cruzamento de dados de conversão por canal (WhatsApp, Instagram, Telegram) e vendas de licenciamento.
              </p>
              <button
                className="btn-gold"
                onClick={() => window.open('https://lookerstudio.google.com', '_blank')}
              >
                <FaExternalLinkAlt /> Abrir Looker Studio em Tela Cheia
              </button>
            </LookerEmbedCard>
          </>
        )}
      </DashboardBody>
    </Container>
  );
}
