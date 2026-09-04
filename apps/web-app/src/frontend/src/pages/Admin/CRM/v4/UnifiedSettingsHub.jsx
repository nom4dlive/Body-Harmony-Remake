import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaShieldAlt, FaUsersCog, FaCloud, FaChartLine,
  FaPalette, FaSlidersH, FaRobot
} from 'react-icons/fa';

import ChannelsManager from './ChannelsManager';
import TeamManager from './TeamManager';
import GoogleWorkspaceHub from './GoogleWorkspaceHub';
import AnalyticsCockpit from './AnalyticsCockpit';
import SettingsManager from './SettingsManager';
import HermesAgentCockpit from './components/HermesAgentCockpit';

/* ==============================================================================
   STYLED COMPONENTS (Unified Settings Hub V4.4 - Wago Density & Luxury V4)
   ============================================================================== */

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: 100%;
  height: calc(100vh - 125px);
  min-height: 600px;
  background: var(--bh-bg-surface, #FFFFFF);
  border-radius: 12px;
  border: 1px solid var(--bh-border, #E2E8F0);
  overflow: hidden;
  box-shadow: var(--bh-card-shadow, 0 4px 16px rgba(10, 62, 96, 0.06));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
  }
`;

const SettingsSidebar = styled.nav`
  background: var(--bh-bg-card-subtle, #F8FAFC);
  border-right: 1px solid var(--bh-border, #E2E8F0);
  display: flex;
  flex-direction: column;
  padding: 0.85rem 0.65rem;
  gap: 0.35rem;
  overflow-y: auto;

  .sidebar-title {
    font-size: 0.76rem;
    font-weight: 800;
    color: var(--bh-text-title, #0A3E60);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.5rem 0.65rem;
    margin-bottom: 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    border-bottom: 1px solid var(--bh-border, #E2E8F0);
  }
`;

const NavItem = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$active ? 'rgba(237, 126, 19, 0.4)' : 'transparent')};
  border-left: ${(props) => (props.$active ? '3px solid #ED7E13' : '3px solid transparent')};
  background: ${(props) => (props.$active ? 'var(--bh-navy, #0A3E60)' : 'transparent')};
  color: ${(props) => (props.$active ? '#FFFFFF' : 'var(--bh-text-main, #334155)')};
  font-size: 0.82rem;
  font-weight: ${(props) => (props.$active ? '800' : '600')};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-align: left;
  transition: all 0.15s ease;
  box-shadow: ${(props) => (props.$active ? '0 2px 6px rgba(10, 62, 96, 0.25)' : 'none')};

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 2px;
  }

  .icon {
    font-size: 1rem;
    color: ${(props) => (props.$active ? '#ED7E13' : 'var(--bh-text-secondary, #64748B)')};
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? 'var(--bh-navy, #0A3E60)' : 'rgba(237, 126, 19, 0.12)')};
    color: ${(props) => (props.$active ? '#FFFFFF' : '#0A3E60')};

    .icon {
      color: #ED7E13;
    }
  }
`;

const ContentPanel = styled.div`
  background: var(--bh-bg-surface, #FFFFFF);
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

import { resolveSettingsSection, formatSettingsHash } from './crmRoutingGuard';

function getSectionFromHash() {
  if (typeof window === 'undefined') return 'HERMES';
  return resolveSettingsSection(window.location.hash);
}

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function UnifiedSettingsHub() {
  const [activeSection, setActiveSection] = useState(getSectionFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(getSectionFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchSection = (section) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      window.location.hash = formatSettingsHash(section);
    }
  };

  return (
    <SettingsGrid>
      <SettingsSidebar aria-label="Seções de Configurações">
        <div className="sidebar-title">
          <FaSlidersH style={{ color: '#ED7E13' }} /> Gestão &amp; Configurações
        </div>

        <NavItem
          $active={activeSection === 'HERMES'}
          onClick={() => switchSection('HERMES')}
          aria-current={activeSection === 'HERMES' ? 'page' : undefined}
          title="Configurar Inteligência e respostas do Assistente Virtual"
        >
          <FaRobot className="icon" style={{ color: '#ED7E13' }} /> Assistente Virtual &amp; IA
        </NavItem>

        <NavItem
          $active={activeSection === 'CHANNELS'}
          onClick={() => switchSection('CHANNELS')}
          aria-current={activeSection === 'CHANNELS' ? 'page' : undefined}
          title="Status e conexões dos números de WhatsApp da clínica"
        >
          <FaShieldAlt className="icon" /> Canais do WhatsApp
        </NavItem>

        <NavItem
          $active={activeSection === 'TEAM'}
          onClick={() => switchSection('TEAM')}
          aria-current={activeSection === 'TEAM' ? 'page' : undefined}
          title="Gerenciar atendentes e filas de atendimento"
        >
          <FaUsersCog className="icon" /> Atendentes &amp; Equipe
        </NavItem>

        <NavItem
          $active={activeSection === 'GOOGLE'}
          onClick={() => switchSection('GOOGLE')}
          aria-current={activeSection === 'GOOGLE' ? 'page' : undefined}
          title="Integração com Google Agenda, Contatos e Pastas de Prontuário"
        >
          <FaCloud className="icon" /> Google Agenda &amp; Prontuários
        </NavItem>

        <NavItem
          $active={activeSection === 'ANALYTICS'}
          onClick={() => switchSection('ANALYTICS')}
          aria-current={activeSection === 'ANALYTICS' ? 'page' : undefined}
          title="Relatórios de agendamentos, vendas e conversão"
        >
          <FaChartLine className="icon" /> Relatórios &amp; Métricas
        </NavItem>

        <NavItem
          $active={activeSection === 'COLORS'}
          onClick={() => switchSection('COLORS')}
          aria-current={activeSection === 'COLORS' ? 'page' : undefined}
          title="Personalizar cores e visual do chat"
        >
          <FaPalette className="icon" /> Aparência &amp; Cores
        </NavItem>
      </SettingsSidebar>

      <ContentPanel role="region" aria-live="polite">
        {activeSection === 'HERMES' && <HermesAgentCockpit />}
        {activeSection === 'CHANNELS' && <ChannelsManager />}
        {activeSection === 'TEAM' && <TeamManager />}
        {activeSection === 'GOOGLE' && <GoogleWorkspaceHub />}
        {activeSection === 'ANALYTICS' && <AnalyticsCockpit />}
        {activeSection === 'COLORS' && <SettingsManager />}
      </ContentPanel>
    </SettingsGrid>
  );
}
