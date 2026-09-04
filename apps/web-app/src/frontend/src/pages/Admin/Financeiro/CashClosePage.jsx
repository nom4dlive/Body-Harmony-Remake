import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Calendar, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  ChevronLeft, ChevronRight, AlertCircle, DollarSign, TrendingUp
} from 'lucide-react';
import { financialApi } from '../../../services/api';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 1rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 0.35rem 0.75rem;
`;

const DateBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748B;
  padding: 0.3rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;

  &:hover {
    background: #F1F5F9;
    color: #0A3E60;
  }
`;

const DateDisplay = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #0A3E60;
  min-width: 160px;
  text-align: center;
`;

const CloseBtn = styled.button`
  padding: 0.55rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  background: ${({ $disabled }) => $disabled ? '#94A3B8' : '#28a745'};
  color: #FFFFFF;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $disabled }) => $disabled ? '#94A3B8' : '#218838'};
    transform: translateY(-1px);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  padding: 1rem;
  border: 1px solid #E2E8F0;
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
`;

const SummaryValue = styled.div`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0A3E60'};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 0.3rem;
  background: ${({ $status }) => {
    if ($status === 'closed') return 'rgba(40, 167, 69, 0.1)';
    if ($status === 'reviewed') return 'rgba(99, 102, 241, 0.1)';
    return 'rgba(237, 126, 19, 0.1)';
  }};
  color: ${({ $status }) => {
    if ($status === 'closed') return '#28a745';
    if ($status === 'reviewed') return '#6366F1';
    return '#ED7E13';
  }};
`;

const EventsSection = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  margin-bottom: 1.25rem;
`;

const EventsHeader = styled.div`
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EventsTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 700;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const EventList = styled.div`
  padding: 0.5rem;
`;

const EventItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ $hasRecord }) => $hasRecord ? 'rgba(40, 167, 69, 0.03)' : 'rgba(220, 53, 69, 0.04)'};
  border: 1px solid ${({ $hasRecord }) => $hasRecord ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.12)'};
  margin-bottom: 0.35rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $type }) => {
    if ($type === 'shop_sale') return 'rgba(237, 126, 19, 0.1)';
    if ($type === 'onboarding_payment') return 'rgba(99, 102, 241, 0.1)';
    if ($type === 'expense') return 'rgba(220, 53, 69, 0.1)';
    return 'rgba(10, 62, 96, 0.08)';
  }};
  color: ${({ $type }) => {
    if ($type === 'shop_sale') return '#ED7E13';
    if ($type === 'onboarding_payment') return '#6366F1';
    if ($type === 'expense') return '#dc3545';
    return '#0A3E60';
  }};
`;

const EventInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventDesc = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: #1E293B;
`;

const EventType = styled.div`
  font-size: 0.65rem;
  color: #94A3B8;
`;

const EventAmount = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ $positive }) => $positive ? '#28a745' : '#dc3545'};
`;

const EventStatus = styled.div`
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: ${({ $ok }) => $ok ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  color: ${({ $ok }) => $ok ? '#28a745' : '#dc3545'};
  font-weight: 600;
`;

const AlertsSection = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  margin-bottom: 1.25rem;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #F1F5F9;

  &:last-child {
    border-bottom: none;
  }
`;

const AlertIcon = styled.div`
  color: ${({ $severity }) => $severity === 'critical' ? '#dc3545' : $severity === 'warning' ? '#ED7E13' : '#0A3E60'};
  flex-shrink: 0;
  margin-top: 2px;
`;

const AlertMsg = styled.div`
  font-size: 0.78rem;
  color: #1E293B;
  line-height: 1.4;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #94A3B8;
  font-size: 0.9rem;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #94A3B8;
`;

const CashClosePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await financialApi.getCashClose(date);
      setData(result?.data || result);
    } catch (err) {
      console.error('[CashClosePage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const handleClose = async () => {
    if (!window.confirm(`Deseja fechar o caixa do dia ${date}? Esta acao nao pode ser desfeita.`)) return;
    try {
      setClosing(true);
      await financialApi.performCashClose(date);
      await fetchData();
    } catch (err) {
      console.error('[CashClosePage] Close error:', err);
      alert('Erro ao fechar caixa: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setClosing(false);
    }
  };

  const navigateDate = (offset) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const formatCurrency = (cents) => 'R$ ' + ((cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState><RefreshCw size={16} className="spin" /> Carregando fechamento...</LoadingState>
      </AdminLayout>
    );
  }

  const summary = data?.summary || {};
  const events = data?.events || [];
  const alerts = data?.alerts || [];
  const status = data?.status || 'pending';

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title><Calendar size={22} /> Fechamento do Dia</Title>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <DateNav>
              <DateBtn onClick={() => navigateDate(-1)}><ChevronLeft size={18} /></DateBtn>
              <DateDisplay>{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</DateDisplay>
              <DateBtn onClick={() => navigateDate(1)}><ChevronRight size={18} /></DateBtn>
            </DateNav>
            <CloseBtn $disabled={status === 'closed'} onClick={handleClose} disabled={closing || status === 'closed'}>
              <CheckCircle2 size={16} /> {status === 'closed' ? 'Fechado' : closing ? 'Fechando...' : 'Fechar Dia'}
            </CloseBtn>
          </div>
        </PageHeader>

        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Receitas</SummaryLabel>
            <SummaryValue style={{ color: '#28a745' }}>{formatCurrency(summary.total_revenue_cents)}</SummaryValue>
            <StatusBadge $status={status}>{status === 'closed' ? 'Fechado' : status === 'reviewed' ? 'Revisado' : 'Pendente'}</StatusBadge>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Despesas</SummaryLabel>
            <SummaryValue style={{ color: '#dc3545' }}>{formatCurrency(summary.total_expenses_cents)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Resultado Liquido</SummaryLabel>
            <SummaryValue style={{ color: (summary.net_result_cents || 0) >= 0 ? '#28a745' : '#dc3545' }}>
              {formatCurrency(summary.net_result_cents)}
            </SummaryValue>
          </SummaryCard>
        </SummaryGrid>

        {alerts.length > 0 && (
          <AlertsSection>
            <EventsHeader>
              <EventsTitle><AlertTriangle size={16} style={{ color: '#dc3545' }} /> Alertas ({alerts.length})</EventsTitle>
            </EventsHeader>
            {alerts.map((alert, idx) => (
              <AlertItem key={idx}>
                <AlertIcon $severity={alert.severity}>
                  {alert.severity === 'critical' ? <AlertCircle size={16} /> : <AlertTriangle size={16} />}
                </AlertIcon>
                <AlertMsg>{alert.message}</AlertMsg>
              </AlertItem>
            ))}
          </AlertsSection>
        )}

        <EventsSection>
          <EventsHeader>
            <EventsTitle><TrendingUp size={16} /> Eventos do Dia ({events.length})</EventsTitle>
          </EventsHeader>
          <EventList>
            {events.length === 0 && (
              <EmptyState>Nenhum evento registrado para esta data.</EmptyState>
            )}
            {events.map((event, idx) => (
              <EventItem key={idx} $hasRecord={event.has_financial_record}>
                <EventIcon $type={event.event_type}>
                  {event.event_type === 'shop_sale' ? <DollarSign size={16} /> :
                   event.event_type === 'onboarding_payment' ? <TrendingUp size={16} /> :
                   <AlertCircle size={16} />}
                </EventIcon>
                <EventInfo>
                  <EventDesc>{event.description}</EventDesc>
                  <EventType>{event.event_type.replace('_', ' ')}</EventType>
                </EventInfo>
                <EventAmount $positive={event.event_type !== 'expense'}>
                  {event.event_type !== 'expense' ? '+' : '-'}{formatCurrency(event.amount_cents)}
                </EventAmount>
                <EventStatus $ok={event.has_financial_record}>
                  {event.has_financial_record ? 'Baixado' : 'Sem baixa'}
                </EventStatus>
              </EventItem>
            ))}
          </EventList>
        </EventsSection>
      </Container>
    </AdminLayout>
  );
};

export default CashClosePage;
