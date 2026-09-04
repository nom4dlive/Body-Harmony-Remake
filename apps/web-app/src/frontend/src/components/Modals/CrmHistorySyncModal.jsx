import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, FaCloudUploadAlt, FaDownload, FaFileAlt, 
  FaCheckCircle, FaSpinner, FaHistory, FaShieldAlt,
  FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import { crmApi } from '../../services/api';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 26, 41, 0.8);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(237, 126, 19, 0.3);
  box-shadow: 0 20px 50px rgba(10, 62, 96, 0.25);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .modal-header {
    background: linear-gradient(135deg, #0A3E60 0%, #072B44 100%);
    color: #FFFFFF;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #ED7E13;

    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #FFFFFF;

      svg {
        color: #ED7E13;
      }
    }

    button.close-btn {
      background: transparent;
      border: none;
      color: #CBD5E1;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;

      &:hover {
        color: #FFFFFF;
      }
    }
  }

  .tabs-bar {
    display: flex;
    background: #F1F5F9;
    border-bottom: 1px solid #E2E8F0;
  }
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 0.85rem 1rem;
  border: none;
  background: ${props => props.$active ? '#FFFFFF' : 'transparent'};
  color: ${props => props.$active ? '#0A3E60' : '#64748B'};
  font-weight: ${props => props.$active ? '800' : '600'};
  font-size: 0.88rem;
  border-bottom: ${props => props.$active ? '3px solid #ED7E13' : '3px solid transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    color: #0A3E60;
  }
`;

const ContentBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0A3E60;
    }

    select, input {
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      font-size: 0.88rem;
      outline: none;
      background: #FFFFFF;

      &:focus {
        border-color: #ED7E13;
        box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.15);
      }
    }
  }

  .dropzone {
    border: 2px dashed #CBD5E1;
    border-radius: 12px;
    padding: 2rem 1.5rem;
    text-align: center;
    background: #F8FAFC;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    &:hover {
      border-color: #ED7E13;
      background: rgba(237, 126, 19, 0.04);
    }

    .icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(10, 62, 96, 0.08);
      color: #0A3E60;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      font-size: 0.88rem;
      color: #64748B;
      strong {
        color: #0A3E60;
      }
    }

    span.hint {
      font-size: 0.75rem;
      color: #94A3B8;
    }
  }

  .file-preview {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #166534;
    font-weight: 700;
  }

  .result-banner {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;

    .stat-row {
      display: flex;
      justify-content: space-between;
      color: #475569;

      strong {
        color: #0A3E60;
      }
    }
  }

  .error-box {
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    color: #B91C1C;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
  }
`;

const FooterActions = styled.div`
  padding: 1rem 1.5rem;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  button.cancel-btn {
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    color: #64748B;
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: #F1F5F9;
    }
  }

  button.action-btn {
    background: #ED7E13;
    border: none;
    color: #FFFFFF;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 8px rgba(237, 126, 19, 0.3);

    &:hover {
      background: #d66d0c;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

export default function CrmHistorySyncModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('import');
  const [inboxId, setInboxId] = useState(1);
  const [file, setFile] = useState(null);
  const [parsedMessages, setParsedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const json = JSON.parse(text);
        const list = Array.isArray(json) ? json : (json.messages || []);
        if (!list.length) {
          throw new Error("O arquivo não contém uma lista de mensagens válida.");
        }
        setParsedMessages(list);
      } catch (err) {
        setError("Erro ao ler JSON: " + err.message);
        setParsedMessages([]);
      }
    };
    reader.readAsText(selected);
  };

  const handleStartImport = async () => {
    if (!parsedMessages.length) return;

    setLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const res = await crmApi.importHistory(inboxId, parsedMessages);
      if (res && res.status === 'success') {
        setImportResult(res.data);
      } else {
        throw new Error(res?.message || 'Falha na importação');
      }
    } catch (err) {
      setError(err.message || 'Erro ao conectar ao servidor de ingestão.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await crmApi.exportHistory(inboxId, 'json');
      if (res && res.status === 'success') {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_crm_inbox_${inboxId}_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error(res?.message || 'Falha ao exportar');
      }
    } catch (err) {
      setError(err.message || 'Erro ao exportar conversas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={() => !loading && onClose()}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaHistory />
            <span>Sincronização & Backup de Histórico</span>
          </h2>
          <button className="close-btn" onClick={() => !loading && onClose()} title="Fechar">
            <FaTimes />
          </button>
        </div>

        <div className="tabs-bar">
          <TabBtn $active={activeTab === 'import'} onClick={() => setActiveTab('import')}>
            <FaCloudUploadAlt />
            <span>Importação Retroativa</span>
          </TabBtn>
          <TabBtn $active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
            <FaDownload />
            <span>Exportação & Backup</span>
          </TabBtn>
        </div>

        <ContentBody>
          <div className="form-group">
            <label>Caixa de Entrada / Canal de Destino:</label>
            <select value={inboxId} onChange={(e) => setInboxId(Number(e.target.value))} disabled={loading}>
              <option value={1}>⚖️ Jurídico & Contratos (Inbox 1)</option>
              <option value={2}>👑 Suporte às Licenciadas (Inbox 2)</option>
              <option value={3}>💼 Comercial & Vendas (Inbox 3)</option>
            </select>
          </div>

          {activeTab === 'import' ? (
            <>
              <div className="dropzone" onClick={() => document.getElementById('history-file-input')?.click()}>
                <input 
                  id="history-file-input" 
                  type="file" 
                  accept=".json,.csv" 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                <div className="icon-wrap">
                  <FaFileAlt />
                </div>
                <p>
                  <strong>Clique ou arraste o arquivo de backup</strong> (JSON/CSV)
                </p>
                <span className="hint">
                  As mensagens serão inseridas com as datas reais de disparo (created_at original) e pareadas com as Licenciadas.
                </span>
              </div>

              {file && (
                <div className="file-preview">
                  <span>📄 {file.name} ({parsedMessages.length} mensagens identificadas)</span>
                  <FaCheckCircle />
                </div>
              )}

              {importResult && (
                <div className="result-banner">
                  <div className="stat-row">
                    <span>Mensagens Recebidas:</span>
                    <strong>{importResult.total_received}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Mensagens Ingeridas com Sucesso:</span>
                    <strong style={{ color: '#059669' }}>{importResult.imported_count}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Licenciadas Reconhecidas no Cadastro:</span>
                    <strong style={{ color: '#ED7E13' }}>{importResult.contacts_matched}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Duplicatas / Ignoradas:</span>
                    <strong>{importResult.skipped_count}</strong>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Baixe um arquivo JSON consolidado contendo todas as conversas, mensagens, telefones e metadados de Licenciadas da caixa de entrada selecionada.
              </p>
            </div>
          )}

          {error && (
            <div className="error-box">
              <FaExclamationTriangle style={{ marginRight: '0.4rem' }} />
              {error}
            </div>
          )}
        </ContentBody>

        <FooterActions>
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Fechar
          </button>
          {activeTab === 'import' ? (
            <button 
              className="action-btn" 
              onClick={handleStartImport} 
              disabled={loading || !parsedMessages.length}
            >
              {loading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processando Lote...</span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt />
                  <span>Iniciar Ingestão</span>
                </>
              )}
            </button>
          ) : (
            <button 
              className="action-btn" 
              onClick={handleStartExport} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <FaDownload />
                  <span>Baixar Backup JSON</span>
                </>
              )}
            </button>
          )}
        </FooterActions>
      </ModalCard>
    </Overlay>
  );
}
