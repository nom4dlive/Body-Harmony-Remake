import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  QrCode, 
  RefreshCw, 
  Unlink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare, 
  Smartphone, 
  Loader2 
} from 'lucide-react';
import { crmApi } from '../../services/api';
import ResponsiveModal from '../ui/ResponsiveModal';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const TabsContainer = styled.div`
  display: flex;
  background: #F8FAFC;
  padding: 0.5rem 1rem 0;
  border-bottom: 1px solid #E2E8F0;
  gap: 0.5rem;
  overflow-x: auto;
  margin: -1.25rem -1.5rem 1.25rem -1.5rem;

  @media (max-width: 768px) {
    margin: -1rem -1.15rem 1rem -1.15rem;
    padding: 0.5rem 0.75rem 0;
  }
`;

const TabButton = styled.button`
  padding: 0.65rem 0.85rem;
  border: none;
  background: ${props => props.$active ? '#FFFFFF' : 'transparent'};
  color: ${props => props.$active ? '#0A3E60' : '#64748B'};
  font-weight: ${props => props.$active ? '700' : '600'};
  font-size: 0.82rem;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid ${props => props.$active ? '#ED7E13' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  transition: all 0.15s ease;
  min-height: 40px;

  &:hover {
    color: #0A3E60;
  }
`;

const StatusCard = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;

    .label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748B;
    }

    .val {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .badge {
    padding: 0.35rem 0.65rem;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;

    &.connected {
      background: rgba(37, 211, 102, 0.12);
      color: #15803D;
      border: 1px solid rgba(37, 211, 102, 0.3);
    }

    &.disconnected {
      background: rgba(237, 126, 19, 0.12);
      color: #C2410C;
      border: 1px solid rgba(237, 126, 19, 0.3);
    }
  }
`;

const QrCodeBox = styled.div`
  background: #FFFFFF;
  border: 2px dashed #E2E8F0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 260px;
  margin: 1rem 0;

  .qr-img {
    width: 220px;
    height: 220px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #E2E8F0;
    max-width: 100%;
  }

  .instructions {
    margin-top: 1rem;
    font-size: 0.82rem;
    color: #475569;
    max-width: 380px;
    line-height: 1.4;

    strong {
      color: #0A3E60;
    }
  }

  .pairing-code {
    margin-top: 0.75rem;
    padding: 0.4rem 0.85rem;
    background: #FEF3C7;
    border: 1px solid #F59E0B;
    color: #92400E;
    font-family: monospace;
    font-weight: 700;
    border-radius: 8px;
    font-size: 0.95rem;
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }

  button {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    min-height: 44px;
    transition: all 0.15s ease;
    border: none;

    &.primary {
      background: #ED7E13;
      color: #FFFFFF;
      &:hover { background: #D97706; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    &.secondary {
      background: #F1F5F9;
      color: #0A3E60;
      border: 1px solid #CBD5E1;
      &:hover { background: #E2E8F0; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    &.danger {
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
      &:hover { background: #FECDCD; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spin {
      animation: ${spin} 1s linear infinite;
    }
  }
`;

const INSTANCES_CONFIG = [
  { id: 'inst_juridico', label: 'Jurídico & Contratos', icon: ShieldCheck, color: '#0A3E60' },
  { id: 'inst_licenciadas', label: 'Suporte Licenciadas (Dra. Josi)', icon: MessageSquare, color: '#15803D' },
  { id: 'inst_clinica', label: 'Clínica Matriz (Cibele)', icon: MessageSquare, color: '#10B981' },
  { id: 'inst_comercial', label: 'Comercial & Vendas (Giovanna)', icon: Smartphone, color: '#ED7E13' }
];

export default function WhatsAppConnectionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('inst_juridico');
  const [instancesStatus, setInstancesStatus] = useState({});
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await crmApi.getInstancesStatus();
      if (res && res.data) {
        const mapped = {};
        res.data.forEach(item => {
          mapped[item.instance_key] = item;
        });
        setInstancesStatus(mapped);
      }
    } catch (err) {
      console.warn('Erro ao buscar status do WhatsApp:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateQr = async (instanceKey) => {
    try {
      setQrLoading(true);
      setQrCodeData(null);
      const res = await crmApi.connectInstance(instanceKey);
      if (res && res.data) {
        setQrCodeData(res.data);
        setCountdown(30);
      }
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDisconnect = async (instanceKey) => {
    if (!window.confirm(`Deseja realmente desconectar a linha ${instanceKey}?`)) return;
    try {
      setLoading(true);
      await crmApi.disconnectInstance(instanceKey);
      setQrCodeData(null);
      await fetchStatus();
    } catch (err) {
      console.error('Erro ao desconectar instância:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setQrCodeData(null);
    }
  }, [isOpen, fetchStatus]);

  useEffect(() => {
    let timer;
    if (qrCodeData && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (qrCodeData && countdown <= 0) {
      handleGenerateQr(activeTab);
    }
    return () => clearInterval(timer);
  }, [qrCodeData, countdown, activeTab]);

  const currentInstance = instancesStatus[activeTab] || {};
  const isConnected = currentInstance.status === 'open' || currentInstance.status === 'connected';

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Conexão WhatsApp Evolution"
      subtitle="Central de Linhas & Pareamento de Aparelhos"
      icon={MessageSquare}
      size="lg"
    >
      <TabsContainer>
        {INSTANCES_CONFIG.map(tab => {
          const Icon = tab.icon;
          const status = instancesStatus[tab.id]?.status;
          const active = activeTab === tab.id;
          const isConn = status === 'open' || status === 'connected';
          return (
            <TabButton
              key={tab.id}
              $active={active}
              onClick={() => {
                setActiveTab(tab.id);
                setQrCodeData(null);
              }}
              type="button"
            >
              <Icon size={15} color={active ? '#ED7E13' : '#64748B'} />
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.65rem' }}>{isConn ? '🟢' : '🟡'}</span>
            </TabButton>
          );
        })}
      </TabsContainer>

      <StatusCard>
        <div className="info">
          <span className="label">Status da Conexão</span>
          <span className="val">
            {currentInstance.phone_number || (isConnected ? 'Conectado' : 'Aguardando Pareamento')}
          </span>
        </div>
        <div className={`badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </StatusCard>

      {qrLoading ? (
        <QrCodeBox>
          <Loader2 size={36} color="#ED7E13" className="spin" />
          <p style={{ marginTop: '1rem', color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>
            Gerando QR Code seguro de autenticação...
          </p>
        </QrCodeBox>
      ) : qrCodeData && qrCodeData.qrcode_base64 ? (
        <QrCodeBox>
          <img 
            src={qrCodeData.qrcode_base64} 
            alt="QR Code WhatsApp" 
            className="qr-img"
          />
          <div className="instructions">
            Abra o <strong>WhatsApp</strong> no celular &gt; <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um Aparelho</strong> e aponte para a tela.
          </div>
          {qrCodeData.pairing_code && (
            <div className="pairing-code">
              Código: {qrCodeData.pairing_code}
            </div>
          )}
          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#94A3B8' }}>
            Atualizando automaticamente em {countdown}s
          </div>
        </QrCodeBox>
      ) : isConnected ? (
        <QrCodeBox style={{ borderStyle: 'solid', borderColor: '#BBF7D0', background: '#F0FDF4' }}>
          <CheckCircle2 size={44} color="#16A34A" />
          <h3 style={{ margin: '0.75rem 0 0.25rem', color: '#166534', fontSize: '1rem', fontWeight: 700 }}>
            Linha Ativa e Conectada
          </h3>
          <p style={{ color: '#15803D', fontSize: '0.82rem' }}>
            O WhatsApp está sincronizado e operando em alta velocidade com as caixas de entrada.
          </p>
        </QrCodeBox>
      ) : (
        <QrCodeBox>
          <Smartphone size={44} color="#CBD5E1" />
          <h3 style={{ margin: '0.75rem 0 0.25rem', color: '#0A3E60', fontSize: '1rem', fontWeight: 700 }}>
            Nenhum Aparelho Conectado
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.82rem' }}>
            Clique no botão abaixo para gerar o QR Code e parear o WhatsApp corporativo.
          </p>
        </QrCodeBox>
      )}

      <ActionButtons>
        <button className="secondary" onClick={fetchStatus} disabled={loading} type="button">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Atualizar Status</span>
        </button>

        {isConnected ? (
          <button 
            className="danger" 
            onClick={() => handleDisconnect(activeTab)}
            disabled={loading}
            type="button"
          >
            <Unlink size={15} />
            <span>Desconectar Aparelho</span>
          </button>
        ) : (
          <button 
            className="primary" 
            onClick={() => handleGenerateQr(activeTab)}
            disabled={qrLoading || loading}
            type="button"
          >
            <QrCode size={15} />
            <span>{qrCodeData ? 'Gerar Novo QR Code' : 'Conectar QR Code'}</span>
          </button>
        )}
      </ActionButtons>
    </ResponsiveModal>
  );
}
