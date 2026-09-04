import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, FileText, Clock, AlertTriangle,
  CheckCircle2, XCircle, TrendingUp, ChevronRight, RefreshCw,
  Store, ArrowRight
} from 'lucide-react';
import { onboardingApi } from '../../../services/api';
import { usePermissions } from '../../../hooks/usePermissions';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const STAGES = [
  { key: 'PRE_CADASTRO',          label: 'Pré-cadastro',       color: '#64748b' },
  { key: 'VALIDAR_PAGAMENTO',     label: 'Validar Pagamento',  color: '#8b5cf6' },
  { key: 'CONTRATO_EMITIDO',      label: 'Contrato Emitido',   color: '#3b82f6' },
  { key: 'ATIVO_LIBERADO',        label: 'Ativo & Liberado',   color: '#14B8A6' },
  { key: 'AGUARDANDO_ASSINATURA', label: 'Aguardando Assin.',  color: '#f59e0b' },
  { key: 'CANCELADO',             label: 'Cancelado',          color: '#ef4444' },
];

const SectionWrapper = styled.section`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 0.6rem;

    svg {
      color: #ED7E13;
    }
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: #ED7E13;
    text-decoration: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.2s;

    &:hover {
      color: #FFA542;
    }
  }
`;

const OperationsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 1024px) {
    grid-template-columns: 3fr 1.2fr;
  }
`;

const StageCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const GlassStageCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 3px solid ${props => props.$color || '#ED7E13'};
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 86px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(255, 255, 255, 0.15);
    border-left-color: ${props => props.$color || '#ED7E13'};
  }

  .stage-title {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .stage-val-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 0.35rem;

    .count {
      font-size: 1.75rem;
      font-weight: 800;
      color: ${props => props.$color || '#FFFFFF'};
      line-height: 1;
    }

    .pct {
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748B;
    }
  }
`;

const DonutCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(237, 126, 19, 0.3);
  }

  .donut-container {
    width: 90px;
    height: 90px;
    position: relative;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .pct-text {
      position: absolute;
      font-size: 1.35rem;
      font-weight: 800;
      color: #F8FAFC;
    }
  }

  .donut-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #E2E8F0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .donut-sub {
    font-size: 0.72rem;
    color: #94A3B8;
    margin-top: 2px;
  }
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: #F87171;
  font-weight: 600;
  margin-bottom: 1rem;

  svg { flex-shrink: 0; color: #EF4444; }
`;

const SkeletonCard = styled.div`
  height: 86px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

export default function OnboardingMetricsWidget() {
  const { canAccessPage } = usePermissions();
  const [metrics, setMetrics] = useState(null);

  const loadMetrics = useCallback(async () => {
    if (!canAccessPage('onboarding')) return;
    try {
      const data = await onboardingApi.getMetrics(30);
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      // Falha silenciosa
    }
  }, [canAccessPage]);

  useEffect(() => {
    if (!canAccessPage('onboarding')) return;
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, [loadMetrics, canAccessPage]);

  if (!canAccessPage('onboarding')) {
    return null;
  }

  if (!metrics) {
    return (
      <SectionWrapper>
        <SectionHeader>
          <h3><Store size={20} /> Operações & Licenciamento</h3>
        </SectionHeader>
        <StageCardsGrid>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </StageCardsGrid>
      </SectionWrapper>
    );
  }

  const {
    total = 0,
    por_estagio = {},
    taxa_conversao_pct = 0,
    alertas_assinatura_pendente = 0
  } = metrics;

  // Calculo SVG Dasharray para Donut (raio 15.9155 -> circunferencia 100)
  const pct = Math.min(100, Math.max(0, taxa_conversao_pct));
  const dashArray = `${pct}, 100`;

  return (
    <SectionWrapper>
      <SectionHeader>
        <h3>
          <Store size={20} />
          Operações & Licenciamento
        </h3>
        <Link to="/portal-gestor/onboarding" className="view-all">
          Ver Funil Completo
          <ArrowRight size={14} />
        </Link>
      </SectionHeader>

      {alertas_assinatura_pendente > 0 && (
        <AlertBanner>
          <AlertTriangle size={15} />
          <span>
            {alertas_assinatura_pendente} licenciada{alertas_assinatura_pendente > 1 ? 's' : ''} aguardando assinatura há mais de 24h.
          </span>
        </AlertBanner>
      )}

      <OperationsGrid>
        {/* Esquerda: 6 Stage Cards */}
        <StageCardsGrid>
          {STAGES.map(({ key, label, color }) => {
            const count = por_estagio[key] ?? 0;
            const stagePct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <GlassStageCard key={key} $color={color}>
                <span className="stage-title">{label}</span>
                <div className="stage-val-row">
                  <span className="count">{count}</span>
                  <span className="pct">{total > 0 ? `${stagePct}%` : '—'}</span>
                </div>
              </GlassStageCard>
            );
          })}
        </StageCardsGrid>

        {/* Direita: Donut Gauge Card */}
        <DonutCard>
          <div className="donut-container">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="3.2"
                strokeDasharray={dashArray}
                strokeLinecap="round"
              />
            </svg>
            <span className="pct-text">{pct}%</span>
          </div>
          <span className="donut-title">Taxa de Conversão</span>
          <span className="donut-sub">Desempenho do Funil</span>
        </DonutCard>
      </OperationsGrid>
    </SectionWrapper>
  );
}
