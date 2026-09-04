import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Filter, FileSignature, AlertCircle, ArrowUpRight } from 'lucide-react';
import { onboardingApi, contractsApi, gestorAgendaApi } from '../../../services/api';
import { usePermissions } from '../../../hooks/usePermissions';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const HighlightCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-top: 3px solid ${props => props.$accentColor || '#14B8A6'};
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);

  &:hover {
    transform: translateY(-2px);
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(255, 255, 255, 0.15);
    border-top-color: ${props => props.$accentColor || '#14B8A6'};
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    .icon-wrapper {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: ${props => props.$iconBg || 'rgba(20, 184, 166, 0.15)'};
      color: ${props => props.$accentColor || '#14B8A6'};
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background: ${props => props.$badgeBg || 'rgba(20, 184, 166, 0.12)'};
      color: ${props => props.$accentColor || '#14B8A6'};
      letter-spacing: 0.02em;
    }
  }

  .card-data {
    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      color: #F8FAFC;
      line-height: 1;
      margin-bottom: 0.35rem;
      font-family: inherit;
    }

    .stat-sub {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
`;

export default function Cockpit360Widget() {
  const navigate = useNavigate();
  const { canAccessPage } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    onboardingCount: 0,
    pendingContractsCount: 0,
    agendaUrgentCount: 0
  });

  useEffect(() => {
    let mounted = true;
    async function loadCockpitData() {
      try {
        setLoading(true);
        const promises = [];
        if (canAccessPage('onboarding')) promises.push(onboardingApi.getMetrics(30));
        else promises.push(Promise.resolve(null));

        if (canAccessPage('contratos')) promises.push(contractsApi.getContracts());
        else promises.push(Promise.resolve(null));

        if (canAccessPage('agenda')) promises.push(gestorAgendaApi.getEvents());
        else promises.push(Promise.resolve(null));

        const [onbRes, contrRes, agendaRes] = await Promise.allSettled(promises);

        let onbCount = 0;
        if (onbRes.status === 'fulfilled' && onbRes.value?.metrics) {
          onbCount = onbRes.value.metrics.total || 0;
        }

        let pendingContracts = 0;
        if (contrRes.status === 'fulfilled' && Array.isArray(contrRes.value)) {
          pendingContracts = contrRes.value.filter(c => c.status === 'PENDING_SIGNATURE' || c.status === 'DRAFT').length;
        }

        let urgentAgenda = 0;
        if (agendaRes.status === 'fulfilled' && agendaRes.value?.events) {
          urgentAgenda = agendaRes.value.events.filter(e => e.priority === 'alta' || e.priority === 'urgente' || e.priority === 'critica').length;
        }

        if (mounted) {
          setMetrics({
            onboardingCount: onbCount,
            pendingContractsCount: pendingContracts,
            agendaUrgentCount: urgentAgenda
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do Cockpit 360:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCockpitData();
    return () => { mounted = false; };
  }, [canAccessPage]);

  const hasAnyCard = canAccessPage('onboarding') || canAccessPage('contratos') || canAccessPage('agenda');
  if (!hasAnyCard) return null;

  return (
    <MetricsGrid>
      {/* 1. FUNIL DE ONBOARDING */}
      {canAccessPage('onboarding') && (
        <HighlightCard
          $accentColor="#14B8A6"
          $iconBg="rgba(20, 184, 166, 0.15)"
          $badgeBg="rgba(20, 184, 166, 0.12)"
          onClick={() => navigate('/portal-gestor/onboarding')}
        >
          <div className="card-header">
            <div className="icon-wrapper">
              <Filter size={18} />
            </div>
            <span className="badge">Em Andamento</span>
          </div>
          <div className="card-data">
            <div className="stat-number">{loading ? '...' : metrics.onboardingCount}</div>
            <div className="stat-sub">Candidatas em triagem</div>
          </div>
        </HighlightCard>
      )}

      {/* 2. CONTRATOS EM ASSINATURA */}
      {canAccessPage('contratos') && (
        <HighlightCard
          $accentColor="#F59E0B"
          $iconBg="rgba(245, 158, 11, 0.15)"
          $badgeBg="rgba(245, 158, 11, 0.12)"
          onClick={() => navigate('/portal-gestor/contratos')}
        >
          <div className="card-header">
            <div className="icon-wrapper">
              <FileSignature size={18} />
            </div>
            <span className="badge">Atenção</span>
          </div>
          <div className="card-data">
            <div className="stat-number">{loading ? '...' : metrics.pendingContractsCount}</div>
            <div className="stat-sub">Aguardando firma</div>
          </div>
        </HighlightCard>
      )}

      {/* 3. PENDÊNCIAS & URGÊNCIAS */}
      {canAccessPage('agenda') && (
        <HighlightCard
          $accentColor="#EF4444"
          $iconBg="rgba(239, 68, 68, 0.15)"
          $badgeBg="rgba(239, 68, 68, 0.12)"
          onClick={() => navigate('/portal-gestor/agenda')}
        >
          <div className="card-header">
            <div className="icon-wrapper">
              <AlertCircle size={18} />
            </div>
            <span className="badge">Urgente</span>
          </div>
          <div className="card-data">
            <div className="stat-number">{loading ? '...' : metrics.agendaUrgentCount}</div>
            <div className="stat-sub">Tarefas prioritárias</div>
          </div>
        </HighlightCard>
      )}
    </MetricsGrid>
  );
}
