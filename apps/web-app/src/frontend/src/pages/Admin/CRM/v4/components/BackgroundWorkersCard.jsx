import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaCogs, FaPlay, FaSyncAlt, FaBell, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaSpinner, FaHistory
} from 'react-icons/fa';
import { crmWorkerApi } from '../../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Background Workers Card V4.4)
   ============================================================================== */

const CardWrapper = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  padding: 0.85rem 1.25rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    h4 {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 800;
      color: #0A3E60;
    }
    .badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
      background: #D1FAE5;
      color: #065F46;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .actions-group {
    display: flex;
    gap: 0.5rem;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.$primary ? '#ED7E13' : '#0A3E60')};
  color: #FFFFFF;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContentGrid = styled.div`
  padding: 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  .stat-title {
    font-size: 0.74rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0A3E60;
  }

  .stat-sub {
    font-size: 0.7rem;
    color: #475569;
  }
`;

const LogsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
  margin-top: 0.5rem;

  th {
    background: #F1F5F9;
    padding: 0.45rem 0.65rem;
    text-align: left;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 0.45rem 0.65rem;
    border-bottom: 1px solid #F1F5F9;
    color: #1E293B;
  }

  .status-chip {
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-weight: 800;
    font-size: 0.65rem;
    background: #D1FAE5;
    color: #065F46;
  }
`;

export default function BackgroundWorkersCard() {
  const [data, setData] = useState({ logs: [], status: 'ACTIVE' });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadStatus = async () => {
    try {
      const res = await crmWorkerApi.getStatus();
      if (res && res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Erro ao consultar status dos workers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRunFullCycle = async () => {
    setRunning(true);
    setFeedback(null);
    try {
      const res = await crmWorkerApi.runFullCycle();
      if (res && res.success) {
        setFeedback(res.summary || 'Ciclo de automação executado com sucesso!');
        loadStatus();
      }
    } catch (err) {
      alert('Erro na execução do worker: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleRunRemindersOnly = async () => {
    setRunning(true);
    setFeedback(null);
    try {
      const res = await crmWorkerApi.runReminders();
      if (res && res.success) {
        setFeedback(`Lembretes processados: ${res.dispatched_count || 0} enviados.`);
        loadStatus();
      }
    } catch (err) {
      alert('Erro ao disparar lembretes: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <CardWrapper>
      <CardHeader>
        <div className="title-group">
          <FaCogs style={{ color: '#ED7E13', fontSize: '1.1rem' }} />
          <h4>Motor de Background Workers &amp; Anti No-Show</h4>
          <span className="badge">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            24/7 Ativo na VPS (a cada 5min)
          </span>
        </div>

        <div className="actions-group">
          <ActionBtn onClick={handleRunRemindersOnly} disabled={running}>
            <FaBell /> Disparar Lembretes (24h/2h)
          </ActionBtn>
          <ActionBtn $primary onClick={handleRunFullCycle} disabled={running}>
            {running ? <FaSpinner className="fa-spin" /> : <FaPlay />} Executar Ciclo Completo
          </ActionBtn>
        </div>
      </CardHeader>

      <ContentGrid>
        <StatBox>
          <div className="stat-title">Prevenção Anti No-Show (Lembretes Automáticos)</div>
          <div className="stat-value" style={{ color: '#10B981' }}>✓ Autônomo</div>
          <div className="stat-sub">
            Disparos automáticos com confirmação conversacional via WhatsApp (Linha Clínica).
          </div>
          {feedback && (
            <div style={{ marginTop: '0.4rem', padding: '0.35rem 0.6rem', background: '#D1FAE5', borderRadius: '6px', fontSize: '0.72rem', color: '#065F46', fontWeight: 700 }}>
              {feedback}
            </div>
          )}
        </StatBox>

        <StatBox>
          <div className="stat-title">Histórico de Execuções Recentes</div>
          {loading ? (
            <div style={{ padding: '0.5rem', color: '#64748B', fontSize: '0.75rem' }}>
              <FaSpinner className="fa-spin" /> Carregando logs...
            </div>
          ) : (
            <LogsTable>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Itens</th>
                  <th>Tempo</th>
                  <th>Status</th>
                  <th>Horário</th>
                </tr>
              </thead>
              <tbody>
                {(data.logs || []).slice(0, 4).map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td><strong>{log.worker_name}</strong></td>
                    <td>{log.items_processed || 0}</td>
                    <td>{log.execution_time_ms}ms</td>
                    <td><span className="status-chip">{log.status}</span></td>
                    <td>{log.executed_at ? new Date(log.executed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora'}</td>
                  </tr>
                ))}
              </tbody>
            </LogsTable>
          )}
        </StatBox>
      </ContentGrid>
    </CardWrapper>
  );
}
