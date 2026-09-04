import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaShieldAlt, FaChartLine, FaRobot, FaSearch,
  FaCalendarCheck, FaMoneyBillWave, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaBookMedical, FaSpinner, FaSyncAlt
} from 'react-icons/fa';
import { hermesAuditApi } from '../../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Hermes AI Audit Trail & Forensics V4.5)
   ============================================================================== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  .label {
    font-size: 0.74rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .value {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0A3E60;
  }

  .sub {
    font-size: 0.7rem;
    color: #10B981;
    font-weight: 700;
  }
`;

const SectionCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .card-header {
    padding: 0.85rem 1.25rem;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    h4 {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 800;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
  }
`;

const FeedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;

  th {
    background: #F1F5F9;
    padding: 0.55rem 0.85rem;
    text-align: left;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid #F1F5F9;
    color: #1E293B;
  }

  tr:hover td {
    background: #F8FAFC;
  }

  .line-chip {
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-weight: 800;
    font-size: 0.68rem;
    background: rgba(10, 62, 96, 0.08);
    color: #0A3E60;
  }

  .action-badge {
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.68rem;
    background: #FEF3C7;
    color: #92400E;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

export default function HermesAuditTrailView() {
  const [data, setData] = useState({ feed: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState([]);
  const [searchingRag, setSearchingRag] = useState(false);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const res = await hermesAuditApi.getFeedAndMetrics();
      if (res && res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Erro ao carregar trilha forense:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const handleSearchRag = async (e) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setSearchingRag(true);
    try {
      const res = await hermesAuditApi.searchKnowledge(ragQuery);
      if (res && res.protocols) {
        setRagResults(res.protocols);
      }
    } catch (err) {
      console.warn('Erro na busca RAG:', err);
    } finally {
      setSearchingRag(false);
    }
  };

  return (
    <Container>
      {/* 4 TOP METRICS */}
      <MetricsGrid>
        <MetricCard>
          <div className="label"><FaChartLine /> Assertividade da IA</div>
          <div className="value">{data.metrics?.ai_accuracy_percentage ?? 100}%</div>
          <div className="sub">✓ Avaliada em interações reais</div>
        </MetricCard>

        <MetricCard>
          <div className="label"><FaClock /> Tempo Economizado</div>
          <div className="value">{data.metrics?.hours_saved_monthly ?? 0}h</div>
          <div className="sub">✓ Baseado em execuções ativas</div>
        </MetricCard>

        <MetricCard>
          <div className="label"><FaRobot /> Ações Registradas</div>
          <div className="value">{data.metrics?.total_actions_performed ?? (data.feed?.length || 0)}</div>
          <div className="sub">✓ Copilot, Simulações &amp; Ferramentas</div>
        </MetricCard>

        <MetricCard>
          <div className="label"><FaShieldAlt /> Latência Média</div>
          <div className="value">{data.metrics?.avg_latency_ms || 0}ms</div>
          <div className="sub">✓ Qwen 3.7 Plus Neural</div>
        </MetricCard>
      </MetricsGrid>

      {/* FEED AO VIVO DE AÇÕES FORENSES */}
      <SectionCard>
        <div className="card-header">
          <h4>
            <FaShieldAlt style={{ color: '#ED7E13' }} /> Feed Forense de Ações da IA (Tempo Real)
          </h4>
          <button
            onClick={loadAuditData}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FaSyncAlt className={loading ? 'fa-spin' : ''} /> Atualizar Feed
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <FaSpinner className="fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ED7E13' }} />
            <div>Carregando registros forenses do Hermes...</div>
          </div>
        ) : (data.feed || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B', background: '#F8FAFC' }}>
            <FaShieldAlt style={{ fontSize: '2.5rem', color: '#94A3B8', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.9rem' }}>Nenhum log forense registrado ainda</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>As simulações no Cockpit, Copilots da Inbox e consultas ao Assistente aparecerão aqui em tempo real.</div>
          </div>
        ) : (
          <FeedTable>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Linha</th>
                <th>Ação / Ferramenta</th>
                <th>Entrada do Usuário</th>
                <th>Execução da IA</th>
                <th>Sentimento</th>
                <th>Latência</th>
              </tr>
            </thead>
            <tbody>
              {(data.feed || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora'}
                  </td>
                  <td><span className="line-chip">{item.line_code}</span></td>
                  <td>
                    <span className="action-badge">
                      {item.tool_name === 'google_calendar_schedule' ? <FaCalendarCheck style={{ color: '#10B981' }} /> : item.tool_name === 'crm_generate_pix' ? <FaMoneyBillWave style={{ color: '#ED7E13' }} /> : <FaRobot />}
                      {item.tool_name || item.action_type}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.user_input}>
                    {item.user_input || 'Mensagem recebida'}
                  </td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#0A3E60' }} title={item.ai_output}>
                    {item.ai_output || 'Ação executada'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: item.sentiment_status === 'POSITIVE' ? '#10B981' : item.sentiment_status === 'URGENT_FRUSTRATION' ? '#EF4444' : '#64748B' }}>
                      {item.sentiment_status === 'POSITIVE' ? '😊 Positivo' : item.sentiment_status === 'URGENT_FRUSTRATION' ? '⚠️ Frustração' : '😐 Neutro'}
                    </span>
                  </td>
                  <td>{item.execution_time_ms || 0}ms</td>
                </tr>
              ))}
            </tbody>
          </FeedTable>
        )}
      </SectionCard>

      {/* EXPLORADOR RAG DE PROTOCOLOS CLÍNICOS */}
      <SectionCard>
        <div className="card-header">
          <h4>
            <FaBookMedical style={{ color: '#ED7E13' }} /> Base de Conhecimento Científica &amp; Protocolos 3S (RAG)
          </h4>
        </div>

        <div style={{ padding: '1rem' }}>
          <form onSubmit={handleSearchRag} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Pesquisar protocolo ou indicação clínica (Ex: celulite, flacidez, hipertrofia, pós-parto)..."
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
            />
            <button
              type="submit"
              disabled={searchingRag}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#0A3E60', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            >
              {searchingRag ? <FaSpinner className="fa-spin" /> : <FaSearch />} Buscar no RAG
            </button>
          </form>

          {ragResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {ragResults.map((p) => (
                <div key={p.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.78rem' }}>
                  <strong style={{ color: '#0A3E60', display: 'block', marginBottom: '0.3rem', fontSize: '0.84rem' }}>{p.protocol_title}</strong>
                  <div style={{ color: '#475569', marginBottom: '0.2rem' }}><strong>Indicação:</strong> {p.clinical_indication}</div>
                  <div style={{ color: '#065F46', marginBottom: '0.2rem' }}><strong>Parâmetros:</strong> {p.frequency_hz} | {p.pulse_width_us}</div>
                  <div style={{ color: '#64748B' }}><strong>Regiões:</strong> {p.body_regions}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </Container>
  );
}
