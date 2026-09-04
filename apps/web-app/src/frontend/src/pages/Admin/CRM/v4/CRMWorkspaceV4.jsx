import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../components/AdminLayout';
import OmnichannelInbox from './OmnichannelInbox';
import KanbanPipeline from './KanbanPipeline';
import UnifiedSettingsHub from './UnifiedSettingsHub';
import CRMErrorBoundary from './components/CRMErrorBoundary';
import {
  FaComments, FaColumns, FaSlidersH, FaCircle, FaUserCheck
} from 'react-icons/fa';
import { crmApi } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { resolveCrmTab, CRM_TABS } from './crmRoutingGuard';

/* ==============================================================================
   STYLED COMPONENTS (CRM Workspace V4.5 Luxury & Clean Architecture)
   ============================================================================== */

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0.35rem 0.65rem 0.65rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-sizing: border-box;
`;

const WorkspaceTopNav = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid var(--bh-border, #E2E8F0);
  padding: 0.35rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
  min-height: 48px;

  .nav-tabs {
    display: flex;
    gap: 0.35rem;
    background: #F1F5F9;
    padding: 0.2rem;
    border-radius: 8px;
    border: 1px solid #E2E8F0;

    button {
      min-height: 38px;
      padding: 0.4rem 0.95rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid transparent;
      background: transparent;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &.active {
        background: #0A3E60;
        color: #FFFFFF;
        box-shadow: 0 2px 6px rgba(10, 62, 96, 0.2);
        border: 1px solid rgba(237, 126, 19, 0.4);
      }

      &:hover:not(.active) {
        color: #0A3E60;
        background: rgba(237, 126, 19, 0.12);
      }

      &:focus-visible {
        outline: 2px solid #ED7E13;
        outline-offset: 1px;
      }
    }
  }

  .status-zone {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;

    .attendant-pill {
      font-size: 0.74rem;
      font-weight: 700;
      color: #0A3E60;
      background: rgba(10, 62, 96, 0.06);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .presence-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #065F46;
      background: #D1FAE5;
      padding: 0.3rem 0.65rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;

      svg {
        animation: pulse 2s infinite ease-in-out;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.25); opacity: 0.75; }
    }
  }
`;

function getTabFromHash() {
  if (typeof window === 'undefined') return CRM_TABS.INBOX;
  return resolveCrmTab(window.location.hash);
}

export default function CRMWorkspaceV4() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(getTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === CRM_TABS.SETTINGS) {
        const currentHash = window.location.hash.replace(/^[#/]+/, '').toLowerCase();
        if (currentHash.startsWith('settings')) {
          // Mantém a sub-rota de configurações
        } else {
          window.location.hash = 'settings-hermes';
        }
      } else {
        window.location.hash = tab.toLowerCase();
      }
    }
  };

  // Resolução Dinâmica de Perfil Autenticado
  const profile = useMemo(() => {
    const rawName = user?.name || user?.username || user?.email || 'Atendente';
    const lower = rawName.toLowerCase();

    if (lower.includes('cibele')) {
      return {
        username: 'cibele',
        name: user?.name || 'Cibele (Clínica & Pacientes)',
        role: 'ATTENDANT',
        primaryLine: 'CLINICA',
        allowedLines: ['CLINICA']
      };
    }
    if (lower.includes('giovanna') || lower.includes('vendas')) {
      return {
        username: 'giovanna',
        name: user?.name || 'Giovanna (Vendas & Comercial)',
        role: 'ATTENDANT',
        primaryLine: 'VENDAS',
        allowedLines: ['VENDAS', 'INSTAGRAM']
      };
    }
    if (lower.includes('guilherme') || lower.includes('nom4d') || lower.includes('juridico')) {
      return {
        username: user?.username || 'guilherme',
        name: user?.name && user.name !== 'Admin' && user.name !== 'Administrador' ? user.name : 'Guilherme (Jurídico & Gestor)',
        role: 'ADMIN',
        primaryLine: 'JURIDICO',
        allowedLines: ['CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE', 'INSTAGRAM']
      };
    }
    if (lower.includes('josi')) {
      return {
        username: user?.username || 'josi',
        name: user?.name || 'Dra. Josi Silva',
        role: 'ADMIN',
        primaryLine: 'ALL',
        allowedLines: ['CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE', 'INSTAGRAM']
      };
    }
    if (user?.role === 'ADMIN' || user?.role === 'GESTOR') {
      return {
        username: user?.username || 'admin',
        name: user?.name || 'Administrador',
        role: 'ADMIN',
        primaryLine: 'ALL',
        allowedLines: ['CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE', 'INSTAGRAM']
      };
    }

    return {
      username: user?.username || 'atendente',
      name: user?.name || 'Atendente',
      role: user?.role || 'ATTENDANT',
      primaryLine: 'CLINICA',
      allowedLines: ['CLINICA']
    };
  }, [user]);

  const [healthData, setHealthData] = useState({
    overall_status: 'HEALTHY',
    average_latency_ms: 18,
    services: {}
  });

  useEffect(() => {
    const probeHealth = () => {
      crmApi.getHealth().then(res => {
        if (res && res.success) {
          setHealthData(res);
        }
      }).catch(() => {});
    };

    probeHealth();
    const interval = setInterval(probeHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  const canManage = profile.role === 'ADMIN' || profile.role === 'SUPERVISOR';
  const isHealthy = healthData.overall_status === 'HEALTHY';
  const isDegraded = healthData.overall_status === 'DEGRADED';

  return (
    <AdminLayout>
      <Container>
        <WorkspaceTopNav>
          <div className="nav-tabs">
            <button
              className={activeTab === 'INBOX' ? 'active' : ''}
              onClick={() => switchTab('INBOX')}
            >
              <FaComments /> Atendimento Omnichannel
            </button>
            <button
              className={activeTab === 'KANBAN' ? 'active' : ''}
              onClick={() => switchTab('KANBAN')}
            >
              <FaColumns /> Funil &amp; Kanban
            </button>
            {canManage && (
              <button
                className={activeTab === 'SETTINGS' ? 'active' : ''}
                onClick={() => switchTab('SETTINGS')}
              >
                <FaSlidersH /> Configurações &amp; Gestão
              </button>
            )}
          </div>

          <div className="status-zone">
            <span className="attendant-pill" title="Operador Autenticado">
              <FaUserCheck style={{ color: '#ED7E13' }} /> {profile.name || profile.username}
            </span>

            <span
              className="presence-badge"
              style={{
                background: isHealthy ? '#D1FAE5' : isDegraded ? '#FEF3C7' : '#FEE2E2',
                color: isHealthy ? '#065F46' : isDegraded ? '#92400E' : '#991B1B',
                cursor: 'pointer'
              }}
              title={
                Object.values(healthData.services || {})
                  .map(s => `${s.name}: ${s.status} (${s.latency_ms}ms)`)
                  .join(' | ') || 'Telemetria Nexus Ativa'
              }
            >
              <FaCircle style={{ fontSize: '0.45rem', color: isHealthy ? '#10B981' : isDegraded ? '#D97706' : '#EF4444' }} />
              {isHealthy ? `CONECTADO (${healthData.average_latency_ms || 18}ms)` : isDegraded ? `DEGRADADO (${healthData.average_latency_ms}ms)` : 'OFFLINE'}
            </span>
          </div>
        </WorkspaceTopNav>

        {/* ACTIVE MODULE VIEW COM ISOLAMENTO ERROR BOUNDARY */}
        {activeTab === 'INBOX' && (
          <CRMErrorBoundary moduleName="Atendimento Omnichannel">
            <OmnichannelInbox currentProfile={profile} />
          </CRMErrorBoundary>
        )}

        {activeTab === 'KANBAN' && (
          <CRMErrorBoundary moduleName="Funil & Kanban">
            <KanbanPipeline currentProfile={profile} />
          </CRMErrorBoundary>
        )}

        {activeTab === 'SETTINGS' && canManage && (
          <CRMErrorBoundary moduleName="Configurações & Gestão">
            <UnifiedSettingsHub />
          </CRMErrorBoundary>
        )}
      </Container>
    </AdminLayout>
  );
}
