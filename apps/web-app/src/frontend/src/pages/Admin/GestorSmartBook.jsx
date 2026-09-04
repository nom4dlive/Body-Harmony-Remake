import React, { useState } from 'react';
import styled from 'styled-components';
import AdminLayout from './components/AdminLayout';
import { FaBrain, FaSync, FaBook, FaRobot, FaDatabase, FaLayerGroup } from 'react-icons/fa';
import { SmartBookSyncManager } from '../../components/SmartBook/SmartBookSyncManager';

const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #072338 100%);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  .info {
    h1 {
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #FFFFFF;

      .gold {
        color: #ED7E13;
      }
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: #94A3B8;
    }
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.4);
    padding: 0.35rem;
    border-radius: 12px;
    border: 1px solid rgba(237, 126, 19, 0.2);

    button {
      min-height: 38px;
      padding: 0.4rem 1rem;
      border-radius: 8px;
      border: none;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
      color: #CBD5E1;
      background: transparent;

      &.active {
        background: #ED7E13;
        color: #FFFFFF;
        box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);
      }

      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: #FFFFFF;
      }
    }
  }
`;

export default function GestorSmartBook() {
  const [activeTab, setActiveTab] = useState('sync');

  return (
    <AdminLayout activePage="smartbook">
      <DashboardGrid>
        <HeaderBanner>
          <div className="info">
            <h1>
              <FaBrain className="gold" /> Cockpit Smart Book & <span className="gold">Dra. Harmony AI</span>
            </h1>
            <p>Governança de IA, Sincronização de Fontes do LMS e Monitoramento de Cadernos Clínicos.</p>
          </div>

          <div className="tabs">
            <button
              className={activeTab === 'sync' ? 'active' : ''}
              onClick={() => setActiveTab('sync')}
            >
              <FaSync /> Sincronizador LMS
            </button>
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              <FaLayerGroup /> Visão Geral da Base IA
            </button>
          </div>
        </HeaderBanner>

        {activeTab === 'sync' && <SmartBookSyncManager />}

        {activeTab === 'overview' && (
          <div style={{ background: '#072338', border: '1px solid rgba(237, 126, 19, 0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <FaDatabase size={40} style={{ color: '#ED7E13', marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#FFFFFF' }}>Base de Conhecimento Clínico Conectada</h3>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>
              Motor Google NotebookLM e Dra. Harmony AI operando com sessões permanentes e tokens protegidos.
            </p>
          </div>
        )}
      </DashboardGrid>
    </AdminLayout>
  );
}
