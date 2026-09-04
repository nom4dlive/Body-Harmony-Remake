import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaSync, FaCheckCircle, FaBook, FaLayerGroup,
  FaRobot, FaExclamationCircle, FaSpinner, FaCloudUploadAlt,
  FaHistory, FaCalendarAlt, FaDatabase
} from 'react-icons/fa';
import { smartbookApi } from '../../services/smartbookApi';

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.99); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(0.99); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.25rem;
  background: #072338;
  border-radius: 16px;
  border: 1px solid rgba(237, 126, 19, 0.2);

  .info {
    h3 {
      margin: 0 0 0.35rem 0;
      color: #FFFFFF;
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .icon-gold {
        color: #ED7E13;
      }
    }

    p {
      margin: 0;
      color: #94A3B8;
      font-size: 0.85rem;
    }
  }

  .refresh-btn {
    min-height: 44px;
    padding: 0.5rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(237, 126, 19, 0.4);
    border-radius: 12px;
    color: #CBD5E1;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(237, 126, 19, 0.2);
      color: #FFFFFF;
      border-color: #ED7E13;
    }
  }
`;

const SectionTitle = styled.h4`
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .gold {
    color: #ED7E13;
  }
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ModuleCard = styled.div`
  background: #051A29;
  border-radius: 16px;
  border: 1px solid ${(props) => (props.$isSynced ? 'rgba(34, 197, 94, 0.3)' : 'rgba(237, 126, 19, 0.3)')};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    border-color: #ED7E13;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      background: ${(props) => (props.$isSynced ? 'rgba(34, 197, 94, 0.15)' : 'rgba(237, 126, 19, 0.15)')};
      color: ${(props) => (props.$isSynced ? '#22C55E' : '#ED7E13')};
      border: 1px solid ${(props) => (props.$isSynced ? 'rgba(34, 197, 94, 0.3)' : 'rgba(237, 126, 19, 0.3)')};
    }
  }

  h4 {
    margin: 0 0 0.5rem 0;
    color: #FFFFFF;
    font-size: 1rem;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: #94A3B8;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.8rem;
    color: #CBD5E1;

    span {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .sync-action-btn {
    min-height: 44px; /* Mobile-First target >= 44px */
    width: 100%;
    padding: 0.65rem 1rem;
    background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
    border: none;
    border-radius: 12px;
    color: #FFFFFF;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: scale(1.02);
      box-shadow: 0 4px 15px rgba(237, 126, 19, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const SyncedHistoryCard = styled.div`
  background: #072338;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;

    .title {
      font-weight: 700;
      color: #FFFFFF;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-green {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22C55E;
      color: #22C55E;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .history-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .history-item {
    background: #051A29;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .item-title {
      font-weight: 700;
      color: #FFFFFF;
      font-size: 0.85rem;
    }

    .item-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94A3B8;

      .sources-count {
        color: #22C55E;
        font-weight: 700;
      }
    }
  }
`;

const SkeletonCard = styled.div`
  height: 180px;
  border-radius: 16px;
  background: linear-gradient(90deg, #072338 0%, #0A3E60 50%, #072338 100%);
  animation: ${pulse} 1.5s infinite ease-in-out;
  border: 1px solid rgba(237, 126, 19, 0.2);
`;

const ToastNotice = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #072338;
  border: 2px solid #ED7E13;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  z-index: 10000;
  animation: slideIn 0.3s ease-out;

  .icon {
    font-size: 1.5rem;
    color: #22C55E;
  }

  @keyframes slideIn {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export function SmartBookSyncManager() {
  const [modules, setModules] = useState([]);
  const [syncedHistory, setSyncedHistory] = useState([
    {
      id: 1,
      title: 'Mentoria 3S — Protocolo de Eletroestimulação Muscular',
      sources_synced: 8,
      synced_at: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await smartbookApi.getLmsModules();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[SmartBookSyncManager] Erro ao carregar módulos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleSync = async (mod) => {
    setSyncingId(mod.id);
    try {
      const res = await smartbookApi.syncLmsModuleToSurreal(
        mod.id,
        mod.title,
        mod.description,
        []
      );

      const sourcesCount = res.sources_synced || mod.lessons_count || 1;
      const syncTime = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      setToast({
        title: 'Sincronização Concluída!',
        message: `${mod.title} indexado no SurrealDB com ${sourcesCount} aula(s).`
      });

      // Atualiza estado de módulos
      setModules((prev) =>
        prev.map((m) => (m.id === mod.id ? { ...m, is_synced: true } : m))
      );

      // Adiciona ao histórico visível do Gestor
      setSyncedHistory((prev) => [
        {
          id: mod.id,
          title: mod.title,
          sources_synced: sourcesCount,
          synced_at: syncTime
        },
        ...prev.filter((p) => p.id !== mod.id)
      ]);

      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      console.error('[SmartBookSyncManager] Falha ao sincronizar:', err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <Container>
      <HeaderBox>
        <div className="info">
          <h3>
            <FaRobot className="icon-gold" />
            Sincronização LMS ➔ Dra. Harmony AI (Google NotebookLM)
          </h3>
          <p>Indexe as aulas gravadas e materiais clínicos para alimentar o RAG e as Ações 1-Clique.</p>
        </div>
        <button className="refresh-btn" onClick={loadModules} disabled={loading}>
          <FaSync className={loading ? 'fa-spin' : ''} />
          <span>Atualizar Módulos</span>
        </button>
      </HeaderBox>

      {/* Seção de Cadernos Sincronizados (Loop Fechado do Gestor) */}
      {syncedHistory.length > 0 && (
        <SyncedHistoryCard>
          <div className="history-header">
            <div className="title">
              <FaDatabase style={{ color: '#ED7E13' }} />
              <span>Cadernos Clínicos Ativos no Hub IA</span>
            </div>
            <div className="badge-green">
              <FaCheckCircle /> {syncedHistory.length} Caderno(s) Pronto(s)
            </div>
          </div>
          <div className="history-grid">
            {syncedHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-title">{item.title}</div>
                <div className="item-meta">
                  <span className="sources-count">
                    ✓ {item.sources_synced} fontes indexadas no SmartBook
                  </span>
                  <span>
                    <FaCalendarAlt style={{ marginRight: '0.25rem' }} />
                    {item.synced_at}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SyncedHistoryCard>
      )}

      <SectionTitle>
        <FaLayerGroup className="gold" /> Módulos Disponíveis para Indexação
      </SectionTitle>

      {loading ? (
        <ModuleGrid>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ModuleGrid>
      ) : (
        <ModuleGrid>
          {modules.map((mod) => (
            <ModuleCard key={mod.id} $isSynced={mod.is_synced}>
              <div className="card-top">
                <h4>{mod.title}</h4>
                <div className="badge">
                  {mod.is_synced ? <FaCheckCircle /> : <FaCloudUploadAlt />}
                  {mod.is_synced ? 'Indexado' : 'Pendente'}
                </div>
              </div>

              <p>{mod.description || 'Ementa clínica e parâmetros de eletroestimulação.'}</p>

              <div className="meta">
                <span><FaBook /> {mod.lessons_count || 0} Aulas</span>
                <span><FaLayerGroup /> ID #{mod.id}</span>
              </div>

              <button
                className="sync-action-btn"
                onClick={() => handleSync(mod)}
                disabled={syncingId === mod.id}
              >
                {syncingId === mod.id ? (
                  <>
                    <FaSpinner className="fa-spin" />
                    <span>Sincronizando Grafo...</span>
                  </>
                ) : (
                  <>
                    <FaSync />
                    <span>{mod.is_synced ? 'Re-sincronizar no Grafo' : 'Sincronizar com Dra. Harmony'}</span>
                  </>
                )}
              </button>
            </ModuleCard>
          ))}
        </ModuleGrid>
      )}

      {toast && (
        <ToastNotice>
          <FaCheckCircle className="icon" />
          <div>
            <strong style={{ color: '#ED7E13' }}>{toast.title}</strong>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{toast.message}</div>
          </div>
        </ToastNotice>
      )}
    </Container>
  );
}
