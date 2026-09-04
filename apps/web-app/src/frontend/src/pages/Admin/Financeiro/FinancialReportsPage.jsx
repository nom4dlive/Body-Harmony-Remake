import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  BarChart3, TrendingUp, TrendingDown, RefreshCw, Filter, Calendar
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

const FiltersBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const FilterInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
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
  font-size: 0.68rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div`
  font-size: 1.15rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0A3E60'};
`;

const DreTable = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  overflow: hidden;
`;

const DreHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
  padding: 0.65rem 1rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DreRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #F1F5F9;
  align-items: center;
  font-size: 0.82rem;
  transition: background 0.1s ease;

  &:hover {
    background: #F8FAFC;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem;
  }
`;

const EventTag = styled.div`
  font-weight: 700;
  color: #0A3E60;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MarginBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ $status }) => {
    if ($status === 'profit') return 'rgba(40, 167, 69, 0.1)';
    if ($status === 'loss') return 'rgba(220, 53, 69, 0.1)';
    return 'rgba(148, 163, 184, 0.1)';
  }};
  color: ${({ $status }) => {
    if ($status === 'profit') return '#28a745';
    if ($status === 'loss') return '#dc3545';
    return '#94A3B8';
  }};
`;

const BarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 30px;
`;

const BarFill = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${({ $type }) => $type === 'revenue' ? '#0A3E60' : '#ED7E13'};
  width: ${({ $pct }) => $pct || 0}%;
  min-width: 2px;
  transition: width 0.3s ease;
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

const FinancialReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ event_tag: '', date_from: '', date_to: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await financialApi.getDre(filters);
      setData(result?.data || result);
    } catch (err) {
      console.error('[FinancialReportsPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const formatCurrency = (cents) => 'R$ ' + ((cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState><RefreshCw size={16} className="spin" /> Carregando relatorios...</LoadingState>
      </AdminLayout>
    );
  }

  const dre = data?.dre || [];
  const summary = data?.summary || {};
  const period = data?.period || {};

  const maxRevenue = Math.max(...dre.map(d => d.revenue?.total_cents || 0), 1);

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title><BarChart3 size={22} /> Relatorio DRE</Title>
        </PageHeader>

        <FiltersBar>
          <FilterInput placeholder="Tag do evento" value={filters.event_tag} onChange={e => setFilters({ ...filters, event_tag: e.target.value })} />
          <FilterInput type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })} />
          <FilterInput type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })} />
          <button
            onClick={handleFilter}
            style={{
              padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', fontSize: '0.78rem',
              fontWeight: 700, background: '#0A3E60', color: '#FFFFFF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}
          >
            <Filter size={14} /> Filtrar
          </button>
        </FiltersBar>

        {period.from && period.to && (
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem' }}>
            Periodo: {new Date(period.from + 'T12:00:00').toLocaleDateString('pt-BR')} a {new Date(period.to + 'T12:00:00').toLocaleDateString('pt-BR')}
          </div>
        )}

        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Receita Total</SummaryLabel>
            <SummaryValue style={{ color: '#0A3E60' }}>{formatCurrency(summary.total_revenue_cents)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Despesas Totais</SummaryLabel>
            <SummaryValue style={{ color: '#dc3545' }}>{formatCurrency(summary.total_expenses_cents)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Lucro Bruto</SummaryLabel>
            <SummaryValue style={{ color: (summary.total_gross_profit_cents || 0) >= 0 ? '#28a745' : '#dc3545' }}>
              {formatCurrency(summary.total_gross_profit_cents)}
            </SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Margem Media</SummaryLabel>
            <SummaryValue style={{ color: (summary.avg_margin_pct || 0) >= 25 ? '#28a745' : '#ED7E13' }}>
              {summary.avg_margin_pct || 0}%
            </SummaryValue>
          </SummaryCard>
        </SummaryGrid>

        <DreTable>
          <DreHeader>
            <div>Evento</div>
            <div>Receita</div>
            <div>Despesas</div>
            <div>Lucro Bruto</div>
            <div>Margem</div>
            <div>Status</div>
          </DreHeader>
          {dre.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              Nenhum dado DRE encontrado para o periodo selecionado.
            </div>
          ) : (
            dre.map((item, idx) => (
              <DreRow key={idx}>
                <EventTag>
                  <BarContainer>
                    <BarFill $type="revenue" $pct={(item.revenue?.total_cents / maxRevenue) * 100} />
                    <BarFill $type="expense" $pct={(item.expenses?.total_cents / maxRevenue) * 100} />
                  </BarContainer>
                  {item.event_tag}
                </EventTag>
                <div style={{ color: '#28a745', fontWeight: 600 }}>{item.revenue?.total_formatted}</div>
                <div style={{ color: '#dc3545', fontWeight: 600 }}>{item.expenses?.total_formatted}</div>
                <div style={{ color: item.gross_profit_cents >= 0 ? '#28a745' : '#dc3545', fontWeight: 700 }}>
                  {item.gross_profit_formatted}
                </div>
                <div style={{ fontWeight: 600 }}>{item.margin_pct}%</div>
                <div>
                  <MarginBadge $status={item.status}>
                    {item.status === 'profit' ? <TrendingUp size={10} /> : item.status === 'loss' ? <TrendingDown size={10} /> : null}
                    {item.status === 'profit' ? 'Lucro' : item.status === 'loss' ? 'Prejuizo' : 'Empate'}
                  </MarginBadge>
                </div>
              </DreRow>
            ))
          )}
        </DreTable>
      </Container>
    </AdminLayout>
  );
};

export default FinancialReportsPage;
