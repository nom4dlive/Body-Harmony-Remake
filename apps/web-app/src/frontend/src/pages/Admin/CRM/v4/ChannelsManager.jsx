import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaWhatsapp, FaInstagram, FaTelegramPlane, FaQrcode,
  FaBatteryThreeQuarters, FaSignal, FaRedo, FaPowerOff,
  FaCheckCircle, FaExclamationTriangle, FaPlus, FaSpinner,
  FaShieldAlt, FaComments, FaEdit, FaTrashAlt, FaTimes,
  FaUserCircle, FaBuilding, FaPhoneAlt
} from 'react-icons/fa';
import { crmApi } from '../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (Channels & Instances V4)
   ============================================================================== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 165px);
  min-height: 600px;
  background: var(--bh-bg-surface, #FFFFFF);
  border-radius: 12px;
  border: 1px solid var(--bh-border, #E2E8F0);
  overflow: hidden;
  box-shadow: var(--bh-card-shadow, 0 4px 16px rgba(10, 62, 96, 0.06));
`;

const TopBar = styled.div`
  padding: 0.85rem 1.25rem;
  background: var(--bh-bg-card-subtle, #F8FAFC);
  border-bottom: 1px solid var(--bh-border, #E2E8F0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--bh-text-title, #0A3E60);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const Grid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.1rem;
  background: var(--bh-bg-app, #F8FAFC);
`;

const InstanceCard = styled.div`
  background: var(--bh-bg-surface, #FFFFFF);
  border: 1px solid var(--bh-border, #E2E8F0);
  border-radius: 10px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: var(--bh-card-shadow, 0 2px 6px rgba(0, 0, 0, 0.03));
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    box-shadow: 0 4px 14px rgba(237, 126, 19, 0.12);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .brand-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 800;
      font-size: 0.92rem;
      color: var(--bh-text-title, #0A3E60);
    }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.3rem;

      &.connected {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }

      &.qr {
        background: rgba(237, 126, 19, 0.15);
        color: #D46D0E;
      }

      &.disconnected {
        background: rgba(239, 68, 68, 0.12);
        color: #DC2626;
      }
    }
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    background: var(--bh-bg-card, #F8FAFC);
    border: 1px solid var(--bh-border, #E2E8F0);
    border-radius: 8px;
    padding: 0.75rem;

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .label {
        font-size: 0.68rem;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
      }

      .val {
        font-size: 0.8rem;
        font-weight: 800;
        color: #0F172A;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
    }
  }

  .actions-row {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;

    button {
      flex: 1;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #0A3E60;
      transition: all 0.15s ease;

      &.primary {
        background: #ED7E13;
        color: #FFFFFF;
        border-color: #ED7E13;
      }

      &.danger {
        border-color: #FCA5A5;
        color: #DC2626;
        background: #FEF2F2;

        &:hover {
          background: #FEE2E2;
        }
      }

      &:hover {
        background: #F1F5F9;
        &.primary {
          background: #D46D0E;
        }
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.65);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 14px;
  padding: 1.5rem;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #E2E8F0;

  .modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 0.75rem;

    h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    button {
      background: none;
      border: none;
      font-size: 1.1rem;
      color: #64748B;
      cursor: pointer;
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      label {
        font-size: 0.75rem;
        font-weight: 800;
        color: #0A3E60;
      }

      input, select {
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
        font-size: 0.82rem;
        font-weight: 600;
        color: #0F172A;
        outline: none;

        &:focus {
          border-color: #ED7E13;
        }
      }
    }
  }

  .modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    border-top: 1px solid #E2E8F0;
    padding-top: 0.75rem;
    margin-top: 0.5rem;

    button {
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;

      &.cancel {
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        color: #475569;
      }

      &.save {
        background: linear-gradient(135deg, #ED7E13 0%, #D46D0E 100%);
        border: none;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
    }
  }
`;

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function ChannelsManager() {
  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Edição / Cadastro
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [team, setTeam] = useState([]);
  const [formState, setFormState] = useState({
    id: null,
    instanceKey: '',
    name: '',
    type: 'WHATSAPP',
    department: 'Clínica',
    attendantUsername: 'cibele',
    status: 'DISCONNECTED'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estado de QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeInstanceQr, setActiveInstanceQr] = useState(null);

  // 1. Carregar Canais e Equipe do Sistema (admin_users)
  const loadChannels = async () => {
    try {
      const [chanRes, teamRes] = await Promise.all([
        crmApi.getChannels(),
        crmApi.getTeam()
      ]);
      if (chanRes && chanRes.success && Array.isArray(chanRes.channels)) {
        setInstances(chanRes.channels);
      }
      if (teamRes && teamRes.success && Array.isArray(teamRes.attendants)) {
        setTeam(teamRes.attendants);
      }
    } catch (e) {
      console.warn('Fallback no carregamento de canais/equipe:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  // 2. Abrir Modal de Criação
  const handleOpenCreate = () => {
    setEditingChannel(null);
    setFormState({
      id: null,
      instanceKey: `inst_${Date.now()}`,
      name: '',
      type: 'WHATSAPP',
      department: 'Vendas',
      attendantUsername: team[0]?.username || 'admin',
      status: 'DISCONNECTED'
    });
    setEditModalOpen(true);
  };

  // 3. Abrir Modal de Edição
  const handleOpenEdit = (inst) => {
    setEditingChannel(inst);
    setFormState({
      id: inst.id,
      instanceKey: inst.instanceKey || inst.id,
      name: inst.name,
      type: inst.type || 'WHATSAPP',
      department: inst.department || inst.dept || 'Clínica',
      attendantUsername: inst.attendantUsername || 'cibele',
      status: inst.status || 'CONNECTED'
    });
    setEditModalOpen(true);
  };

  // 4. Salvar Canal (Criação / Atualização)
  const handleSaveChannel = async () => {
    if (!formState.name.trim()) {
      alert('Por favor, preencha o Nome da Linha / Identificação.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await crmApi.saveChannel(formState);
      if (res && res.success) {
        alert('Linha salva com sucesso! O número será preenchido automaticamente ao escanear o QR Code.');
        setEditModalOpen(false);
        loadChannels();
      } else {
        alert('Erro ao salvar canal: ' + (res?.error || 'Falha de comunicação.'));
      }
    } catch (err) {
      alert('Erro ao salvar canal: ' + (err.message || 'Falha na requisição.'));
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Excluir / Desativar Canal
  const handleDeleteChannel = async (inst) => {
    const confirmDelete = window.confirm(`Deseja realmente remover/desativar a linha: "${inst.name}"?`);
    if (!confirmDelete) return;

    try {
      await crmApi.deleteChannel(inst.id || inst.instanceKey);
      alert('Linha desativada com sucesso!');
      loadChannels();
    } catch (err) {
      alert('Erro ao desativar canal: ' + err.message);
    }
  };

  const [qrBase64, setQrBase64] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);

  const handleOpenQr = async (inst) => {
    setActiveInstanceQr(inst);
    setQrBase64('');
    setPairingCode(null);
    setQrError(null);
    setQrLoading(true);
    setQrModalOpen(true);
    
    try {
      const res = await crmApi.getQrCode(inst.instanceKey || inst.id);
      if (res && res.success && res.qr) {
        setQrBase64(res.qr.startsWith('data:') ? res.qr : `data:image/png;base64,${res.qr}`);
        setPairingCode(res.pairingCode || null);
      } else {
        setQrError(res?.error || 'Não foi possível gerar o QR Code. Verifique se o aparelho já está conectado ou aguarde reinicialização.');
      }
    } catch (err) {
      setQrError("Erro de comunicação com o servidor: " + (err.message || 'Falha na requisição'));
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <Container>
      <TopBar>
        <h3>
          <FaShieldAlt style={{ color: '#ED7E13' }} /> Central de Conexões &amp; Gestão de Números
        </h3>

        <div className="actions">
          <button
            style={{
              background: 'linear-gradient(135deg, #ED7E13 0%, #D46D0E 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(237, 126, 19, 0.25)'
            }}
            onClick={handleOpenCreate}
          >
            <FaPlus /> Adicionar Novo Número / Canal
          </button>
        </div>
      </TopBar>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', gap: '0.75rem', color: '#64748B' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '2.5rem', color: '#ED7E13' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Carregando linhas e conexões...</span>
        </div>
      ) : instances.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', gap: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '2px dashed #CBD5E1', margin: '1rem' }}>
          <FaShieldAlt style={{ fontSize: '3rem', color: '#94A3B8' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A' }}>Nenhuma linha conectada no momento</h4>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Adicione sua primeira linha do WhatsApp ou canal social para começar a atender.</p>
          </div>
          <button
            style={{
              background: '#0A3E60',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={handleOpenCreate}
          >
            <FaPlus /> Adicionar Linha Agora
          </button>
        </div>
      ) : (
        <Grid>
          {instances.map((inst) => (
            <InstanceCard key={inst.id || inst.instanceKey}>
              <div className="header">
                <div className="brand-title">
                  {inst.type === 'WHATSAPP' && <FaWhatsapp style={{ color: '#10B981', fontSize: '1.1rem' }} />}
                  {inst.type === 'INSTAGRAM' && <FaInstagram style={{ color: '#E1306C', fontSize: '1.1rem' }} />}
                  {inst.type === 'TELEGRAM' && <FaTelegramPlane style={{ color: '#0088CC', fontSize: '1.1rem' }} />}
                  {inst.name}
                </div>

                <span
                  className={`status-badge ${
                    inst.status === 'CONNECTED'
                      ? 'connected'
                      : inst.status === 'QRCODE'
                      ? 'qr'
                      : 'disconnected'
                  }`}
                >
                  {inst.status === 'CONNECTED' ? '● CONECTADO' : '⏳ AGUARDANDO QR'}
                </span>
              </div>

              <div className="meta-grid">
                <div className="meta-item">
                  <span className="label">Número / Identificador</span>
                  <span className="val" style={{ color: inst.phoneNumber && !inst.phoneNumber.includes('Aguardando') ? '#0A3E60' : '#D97706' }}>
                    <FaPhoneAlt style={{ fontSize: '0.7rem', color: '#ED7E13' }} />{' '}
                    {inst.phoneNumber && !inst.phoneNumber.includes('Aguardando')
                      ? inst.phoneNumber
                      : '⏳ Aguardando pareamento QR'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Departamento</span>
                  <span className="val">
                    <FaBuilding style={{ fontSize: '0.7rem', color: '#64748B' }} /> {inst.department || inst.dept}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Atendente Responsável</span>
                  <span className="val" style={{ textTransform: 'capitalize' }}>
                    <FaUserCircle style={{ fontSize: '0.75rem', color: '#8B5CF6' }} /> {inst.attendantUsername || 'Todos'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Bateria / Nuvem</span>
                  <span className="val" style={{ color: inst.status === 'CONNECTED' ? '#10B981' : '#94A3B8' }}>
                    <FaBatteryThreeQuarters style={{ color: inst.status === 'CONNECTED' ? '#10B981' : '#94A3B8' }} />{' '}
                    {inst.status === 'CONNECTED' ? (inst.battery || 'Online (100%)') : '-- (Desconectado)'}
                  </span>
                </div>
              </div>

              <div className="actions-row">
                <button onClick={() => handleOpenEdit(inst)} title="Editar dados da linha">
                  <FaEdit style={{ color: '#0A3E60' }} /> Editar
                </button>
                <button className="primary" onClick={() => handleOpenQr(inst)} title="Conectar QR Code">
                  <FaQrcode /> QR Code
                </button>
                <button className="danger" onClick={() => handleDeleteChannel(inst)} title="Desativar Linha">
                  <FaTrashAlt /> Excluir
                </button>
              </div>
            </InstanceCard>
          ))}
        </Grid>
      )}

      {/* MODAL DE EDIÇÃO E CADASTRO DE CANAL / NÚMERO */}
      {editModalOpen && (
        <ModalOverlay onClick={() => setEditModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h4>
                <FaEdit style={{ color: '#ED7E13' }} />
                {editingChannel ? 'Editar Linha / Configurações' : 'Cadastrar Nova Linha'}
              </h4>
              <button onClick={() => setEditModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome / Identificação da Linha:</label>
                <input
                  type="text"
                  placeholder="Ex: Linha 05 — Pós-Venda VIP"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Canal:</label>
                <select
                  value={formState.type}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                >
                  <option value="WHATSAPP">WhatsApp (Evolution API v2)</option>
                  <option value="INSTAGRAM">Instagram Direct (Graph API)</option>
                  <option value="TELEGRAM">Telegram Bot (Swarm)</option>
                </select>
              </div>

              {formState.type === 'WHATSAPP' && (
                <div className="form-group">
                  <label>Número de Telefone:</label>
                  <div style={{ padding: '0.6rem 0.85rem', background: '#F1F5F9', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPhoneAlt style={{ color: '#ED7E13', fontSize: '0.9rem', flexShrink: 0 }} />
                    <span><strong>100% Automático:</strong> O número do chip é detectado e vinculado automaticamente após você ler o QR Code no aparelho WhatsApp.</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Departamento / Silo:</label>
                <select
                  value={formState.department}
                  onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                >
                  <option value="Clínica">🏥 Clínica &amp; Recepção</option>
                  <option value="Vendas">💼 Vendas &amp; Franquias</option>
                  <option value="Jurídico">⚖️ Jurídico &amp; Finanças</option>
                  <option value="Suporte">🩺 Suporte às Licenciadas</option>
                  <option value="Social">📱 Social &amp; Comunidade</option>
                  <option value="Geral">🌐 Geral / Triagem</option>
                </select>
              </div>

              <div className="form-group">
                <label>Atendente Responsável (Usuários do Portal Gestor):</label>
                <select
                  value={formState.attendantUsername}
                  onChange={(e) => setFormState({ ...formState, attendantUsername: e.target.value })}
                >
                  {team && team.length > 0 ? (
                    team.map((t) => (
                      <option key={t.username} value={t.username}>
                        {t.name} ({t.roleDescription || 'Atendente'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="cibele">Cibele (Recepção &amp; Clínica)</option>
                      <option value="giovanna">Giovanna (Vendas &amp; Cursos)</option>
                      <option value="guilherme">Guilherme (Jurídico &amp; Suporte)</option>
                      <option value="admin">Administrador</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="modal-foot">
              <button className="cancel" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </button>
              <button className="save" onClick={handleSaveChannel} disabled={isSaving}>
                {isSaving ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
                {editingChannel ? 'Salvar Alterações' : 'Cadastrar Linha'}
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* MODAL DE QR CODE */}
      {qrModalOpen && (
        <ModalOverlay onClick={() => setQrModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()} style={{ width: '400px', textAlign: 'center', alignItems: 'center' }}>
            <div className="modal-head" style={{ width: '100%' }}>
              <h4>
                <FaQrcode style={{ color: '#ED7E13' }} /> Pareamento WhatsApp Oficial
              </h4>
              <button onClick={() => setQrModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.25rem 0 0.5rem 0' }}>
              Linha: <strong>{activeInstanceQr?.name}</strong>
            </div>

            <div
              style={{
                width: '220px',
                height: '220px',
                background: '#F8FAFC',
                border: qrError ? '2px solid #EF4444' : '2px dashed #ED7E13',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.5rem 0',
                overflow: 'hidden',
                padding: '0.5rem'
              }}
            >
              {qrLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#0A3E60' }}>
                  <FaSpinner className="fa-spin" style={{ fontSize: '2.2rem', color: '#ED7E13' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Gerando sessão Baileys segura...</span>
                </div>
              ) : qrBase64 ? (
                <img src={qrBase64} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : qrError ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#EF4444', padding: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <span style={{ fontSize: '0.72rem', lineHeight: '1.3', fontWeight: 600 }}>{qrError}</span>
                </div>
              ) : (
                <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#CBD5E1' }} />
              )}
            </div>

            {pairingCode && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#1E40AF', margin: '0.35rem 0', fontWeight: 700 }}>
                Código de Pareamento: <span style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>{pairingCode}</span>
              </div>
            )}

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
              Abra o WhatsApp no smartphone da linha &gt; <strong>Aparelhos Conectados</strong> &gt;{' '}
              <strong>Conectar um Aparelho</strong> e aponte para a tela.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', width: '100%', justifyContent: 'center' }}>
              {qrError && (
                <button
                  style={{
                    background: '#ED7E13',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  onClick={() => handleOpenQr(activeInstanceQr)}
                >
                  🔄 Tentar Novamente
                </button>
              )}
              <button
                style={{
                  background: '#0A3E60',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.45rem 1.2rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                onClick={() => setQrModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}
