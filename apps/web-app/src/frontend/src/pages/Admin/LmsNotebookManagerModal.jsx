import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { lmsNotebookApi } from '../../services/api';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(4, 15, 24, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  background: #0A1E2D;
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  background: linear-gradient(135deg, #0A3E60 0%, #062235 100%);
  border-bottom: 1px solid rgba(237, 126, 19, 0.25);
  color: #FFFFFF;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  &:hover { color: #ED7E13; }
`;

const ModalBody = styled.div`
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  color: #FFFFFF;
`;

const ActionBanner = styled.div`
  background: rgba(10, 62, 96, 0.35);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SyncButton = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
  color: #FFFFFF;
  font-weight: 700;
  border: none;
  padding: 0.75rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.4);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  th {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    text-transform: uppercase;
    font-weight: 700;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #ED7E13;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

export default function LmsNotebookManagerModal({ isOpen, onClose }) {
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTesters();
    }
  }, [isOpen]);

  async function loadTesters() {
    setLoading(true);
    try {
      const res = await lmsNotebookApi.getBetaTesters();
      if (res && res.beta_testers) {
        setTesters(res.beta_testers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await lmsNotebookApi.syncModules(1);
      if (res && res.success) {
        setMessage(`✅ ${res.modules_synced} Módulos sincronizados (${res.lessons_enqueued} aulas enfileiradas para Faster-Whisper).`);
      }
    } catch (e) {
      setMessage(`❌ Falha na sincronização: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function handleToggleBeta(tester) {
    const nextStatus = !tester.ai_notebook_beta_enabled;
    try {
      await lmsNotebookApi.updateBetaTester(tester.id, nextStatus, tester.ai_notebook_credits_limit || 100);
      setTesters(prev => prev.map(t => t.id === tester.id ? { ...t, ai_notebook_beta_enabled: nextStatus ? 1 : 0 } : t));
    } catch (e) {
      alert(`Erro ao atualizar: ${e.message}`);
    }
  }

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>⚙️ Cockpit IA Notebook & Beta Testers</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          <ActionBanner>
            <div>
              <h4 style={{ margin: 0, color: '#FFFFFF' }}>Sincronizador de Módulos LMS ➔ IA Notebook</h4>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Cria 1 Caderno Mestre por Módulo e transcreve aulas via Faster-Whisper local (Custo R$ 0).
              </p>
            </div>
            <SyncButton onClick={handleSync} disabled={syncing}>
              {syncing ? '🔄 Sincronizando...' : '⚡ Sincronizar Módulos'}
            </SyncButton>
          </ActionBanner>

          {message && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(237, 126, 19, 0.15)', border: '1px solid #ED7E13', color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {message}
            </div>
          )}

          <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Licenciadas & Liberação Manual de Acesso Beta</h4>

          {loading ? (
            <p>Carregando alunas...</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Licenciada</th>
                  <th>E-mail / CPF</th>
                  <th>Cota Diária</th>
                  <th>Acesso Beta</th>
                </tr>
              </thead>
              <tbody>
                {testers.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>{t.email || t.cpf}</td>
                    <td><span style={{ color: '#ED7E13', fontWeight: 700 }}>{t.ai_notebook_credits_limit || 100} 🪙</span></td>
                    <td>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={Boolean(t.ai_notebook_beta_enabled && Number(t.ai_notebook_beta_enabled) === 1)}
                          onChange={() => handleToggleBeta(t)}
                        />
                        <span />
                      </ToggleSwitch>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}
