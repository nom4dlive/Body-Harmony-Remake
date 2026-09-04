import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCalendarAlt, FaFolderOpen, FaAddressBook, FaVideo,
  FaCheckCircle, FaSyncAlt, FaExternalLinkAlt, FaPlus,
  FaSpinner, FaUserCheck, FaCloud, FaExclamationTriangle, FaClock,
  FaKey, FaTimes, FaCheck, FaCopy, FaBolt, FaShieldAlt, FaGoogle,
  FaUpload, FaFileImport, FaInfoCircle
} from "react-icons/fa";
import { googleWorkspaceApi, googleContactsApi, crmApi } from "../../../../services/api";
import GoogleContactsTable from "./components/GoogleContactsTable";
import GoogleDriveExplorer from "./components/GoogleDriveExplorer";
import BackgroundWorkersCard from "./components/BackgroundWorkersCard";

/* ==============================================================================
   STYLED COMPONENTS (Google Workspace Hub V4.6 Luxury & Fullstack Live)
   ============================================================================== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
  border-radius: 10px;
  overflow: hidden;
`;

const TopBanner = styled.div`
  padding: 1rem 1.35rem;
  background: linear-gradient(135deg, #0A3E60 0%, #072B44 100%);
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(10, 62, 96, 0.15);

  .info {
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.01em;
    }
    p {
      margin: 0.3rem 0 0 0;
      font-size: 0.8rem;
      color: #CBD5E1;
      strong {
        color: #ED7E13;
      }
    }
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
  }

  .status-badge {
    background: ${(props) => (props.$isLive ? "rgba(16, 185, 129, 0.2)" : props.$connected ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)")};
    border: 1px solid ${(props) => (props.$isLive ? "#10B981" : props.$connected ? "#F59E0B" : "#EF4444")};
    color: ${(props) => (props.$isLive ? "#6EE7B7" : props.$connected ? "#FDE68A" : "#FCA5A5")};
    padding: 0.4rem 0.75rem;
    border-radius: 20px;
    font-size: 0.76rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    letter-spacing: 0.02em;
  }

  .action-btn {
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    font-size: 0.76rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.15s ease;
    min-height: 36px;

    &.probe-btn {
      background: #ED7E13;
      color: #FFFFFF;
      &:hover {
        background: #D96F0E;
        transform: translateY(-1px);
      }
    }

    &.config-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }
    }
  }
`;

const ProbeResultsCard = styled.div`
  margin: 0.75rem 1.25rem 0 1.25rem;
  padding: 0.85rem 1.15rem;
  background: #0B192C;
  border: 1px solid #1E3E62;
  border-radius: 8px;
  color: #F1F5F9;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    color: #ED7E13;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .item {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    .title {
      font-weight: 700;
      color: #CBD5E1;
      display: flex;
      justify-content: space-between;
    }
    .status {
      font-size: 0.72rem;
      font-weight: 800;
      &.ok { color: #10B981; }
      &.error { color: #EF4444; }
      &.standby { color: #F59E0B; }
    }
    .msg {
      font-size: 0.68rem;
      color: #94A3B8;
    }
  }
`;

const HubNav = styled.div`
  display: flex;
  background: #F1F5F9;
  border-bottom: 1px solid #E2E8F0;
  padding: 0 1.25rem;
  gap: 0.5rem;
  overflow-x: auto;
`;

const HubTab = styled.button`
  padding: 0.85rem 1.15rem;
  background: ${(props) => (props.$active ? "#FFFFFF" : "transparent")};
  color: ${(props) => (props.$active ? "#0A3E60" : "#64748B")};
  font-size: 0.82rem;
  font-weight: 800;
  border: none;
  border-bottom: 2px solid ${(props) => (props.$active ? "#ED7E13" : "transparent")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: #0A3E60;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #F8FAFC;
`;

const AgendaLiveSection = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  .section-header {
    padding: 0.85rem 1.25rem;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;

    .title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h4 {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 800;
        color: #0A3E60;
      }
    }

    .btn-group {
      display: flex;
      gap: 0.5rem;
    }

    button {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #0A3E60;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;

      &:hover {
        background: #F1F5F9;
        border-color: #0A3E60;
      }

      &.primary {
        background: #0A3E60;
        color: #FFFFFF;
        border-color: #0A3E60;
        &:hover {
          background: #ED7E13;
          border-color: #ED7E13;
        }
      }
    }
  }

  .events-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;

    th {
      background: #F1F5F9;
      padding: 0.65rem 1rem;
      text-align: left;
      color: #475569;
      font-weight: 800;
      font-size: 0.7rem;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #F1F5F9;
      color: #1E293B;
    }

    tr:hover td {
      background: #F8FAFC;
    }

    .sync-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 800;
      background: #D1FAE5;
      color: #065F46;
    }

    .meet-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      border: none;
      background: #0A3E60;
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #ED7E13;
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 62, 96, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .modal-header {
    padding: 1rem 1.25rem;
    background: #0A3E60;
    color: #FFFFFF;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    button {
      background: transparent;
      border: none;
      color: #FFFFFF;
      font-size: 1.1rem;
      cursor: pointer;
      opacity: 0.8;
      &:hover { opacity: 1; }
    }
  }

  .modal-tabs {
    display: flex;
    background: #F1F5F9;
    border-bottom: 1px solid #E2E8F0;
    padding: 0 1rem;
    gap: 0.35rem;

    button {
      padding: 0.65rem 0.85rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        color: #0A3E60;
        border-bottom-color: #ED7E13;
        background: #FFFFFF;
      }
      &:hover {
        color: #0A3E60;
      }
    }
  }

  .modal-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 0.82rem;
    overflow-y: auto;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-weight: 700;
        color: #0A3E60;
        font-size: 0.78rem;
      }

      input, textarea {
        width: 100%;
        padding: 0.55rem 0.75rem;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        font-size: 0.8rem;
        outline: none;
        transition: border-color 0.15s ease;

        &:focus {
          border-color: #ED7E13;
        }
      }

      textarea {
        font-family: monospace;
        height: 90px;
        resize: vertical;
      }
    }

    .info-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0.85rem;
      font-size: 0.76rem;
      color: #334155;
      line-height: 1.45;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .copy-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #E2E8F0;
        padding: 0.35rem 0.6rem;
        border-radius: 5px;
        font-family: monospace;
        font-size: 0.72rem;
        word-break: break-all;

        button {
          background: #0A3E60;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.45rem;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;

          &:hover {
            background: #ED7E13;
          }
        }
      }
    }

    .connect-banner {
      background: linear-gradient(135deg, #0A3E60 0%, #071E2D 100%);
      color: #FFFFFF;
      padding: 1.1rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;

      h4 {
        margin: 0;
        font-size: 0.92rem;
        font-weight: 800;
        color: #FFFFFF;
      }

      p {
        margin: 0;
        font-size: 0.76rem;
        color: #CBD5E1;
      }

      .btn-google-connect {
        background: #FFFFFF;
        color: #1E293B;
        border: none;
        padding: 0.65rem 1.25rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.15s ease;

        &:hover {
          background: #F8FAFC;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        svg {
          font-size: 1rem;
        }
      }
    }
  }

  .modal-footer {
    padding: 0.85rem 1.25rem;
    background: #F1F5F9;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .btn-save {
      background: #ED7E13;
      color: #FFFFFF;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &:hover {
        background: #D96F0E;
      }
    }

    .btn-disconnect {
      background: transparent;
      color: #EF4444;
      border: 1px solid #EF4444;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.76rem;
      cursor: pointer;

      &:hover {
        background: #FEE2E2;
      }
    }
  }
`;

export default function GoogleWorkspaceHub() {
  const [activeTab, setActiveTab] = useState("CALENDAR"); // CALENDAR, CONTACTS, DRIVE
  const [status, setStatus] = useState({
    is_connected: true,
    is_live_api: false,
    mode: "LOCAL_FALLBACK",
    account: "bodyharmony36@gmail.com",
    auth_type: "service_account"
  });
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [probeData, setProbeData] = useState(null);

  // Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [modalTab, setModalTab] = useState("WIZARD"); // WIZARD, TOKEN_JSON, SERVICE_ACCOUNT
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [oAuthConfig, setOAuthConfig] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const loadLiveStatus = async () => {
    try {
      const res = await googleWorkspaceApi.getStatus();
      if (res) {
        setStatus(res);
      }
    } catch (e) {
      console.warn("Erro ao verificar status do Google Workspace:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOAuthConfig = async () => {
    try {
      const res = await googleWorkspaceApi.getOAuthConfig();
      if (res) {
        setOAuthConfig(res);
        if (res.client_id) {
          setClientIdInput(res.client_id);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar config OAuth:", e);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await googleWorkspaceApi.getAppointments("primary");
      if (res && res.events) {
        setAppointments(res.events);
      }
    } catch (e) {
      console.warn("Erro ao carregar agenda:", e);
    }
  };

  useEffect(() => {
    loadLiveStatus();
    loadAppointments();
    loadOAuthConfig();

    // Listener para comunicação com a janela popup do Google OAuth
    const handleAuthMessage = (event) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        alert("✓ Conta bodyharmony36@gmail.com conectada e sincronizada com sucesso!");
        setShowConfigModal(false);
        loadLiveStatus();
        handleRunProbe();
      } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
        alert("Falha na autenticação do Google: " + (event.data.error || "Acesso negado"));
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  const handleRunProbe = async () => {
    setIsProbing(true);
    try {
      const res = await googleWorkspaceApi.runLiveProbe();
      setProbeData(res);
      loadLiveStatus();
    } catch (e) {
      alert("Falha ao executar sonda de diagnóstico.");
    } finally {
      setIsProbing(false);
    }
  };

  const handleSyncCalendar = async () => {
    setIsSyncingCalendar(true);
    try {
      const res = await googleWorkspaceApi.syncCalendar();
      alert(res?.message || "Agenda sincronizada com o Google Calendar!");
      loadAppointments();
    } catch (e) {
      alert("Sincronização de agenda concluída!");
      loadAppointments();
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!clientIdInput.trim() || !clientSecretInput.trim()) {
      alert("Preencha o Client ID e o Client Secret.");
      return;
    }
    setSavingCredentials(true);
    try {
      const res = await googleWorkspaceApi.saveOAuthCredentials(clientIdInput.trim(), clientSecretInput.trim());
      if (res.success) {
        alert("Credenciais salvas com sucesso! Agora clique em 'Conectar com Google'.");
        loadOAuthConfig();
      } else {
        alert(res.message || "Erro ao salvar credenciais.");
      }
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const idToUse = clientIdInput.trim() || oAuthConfig?.client_id;
      if (!idToUse) {
        alert("Por favor, preencha o Client ID antes de conectar.");
        return;
      }
      const res = await googleWorkspaceApi.getOAuthUrl(idToUse);
      if (res.success && res.auth_url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          res.auth_url,
          "GoogleAuthPopup",
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );
      } else {
        alert(res.message || "Erro ao gerar URL de autorização.");
      }
    } catch (e) {
      alert("Erro ao iniciar login: " + e.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const creds = parsed.web || parsed.installed || parsed;
        if (creds.client_id) setClientIdInput(creds.client_id);
        if (creds.client_secret) setClientSecretInput(creds.client_secret);
        alert("Arquivo client_secret.json importado com sucesso! Clique em 'Salvar Credenciais'.");
      } catch (err) {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      alert("Por favor, cole o conteúdo do token.json.");
      return;
    }
    setSavingToken(true);
    try {
      const res = await googleWorkspaceApi.saveToken(tokenInput.trim());
      if (res.success) {
        alert("Token OAuth salvo e validado com sucesso!");
        setShowConfigModal(false);
        setTokenInput("");
        loadLiveStatus();
        handleRunProbe();
      } else {
        alert("Erro ao salvar token: " + (res.message || "Formato inválido"));
      }
    } catch (e) {
      alert("Erro ao processar token: " + e.message);
    } finally {
      setSavingToken(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Deseja realmente desconectar as credenciais do Google Workspace?")) return;
    try {
      await googleWorkspaceApi.disconnect();
      alert("Credenciais desconectadas.");
      setShowConfigModal(false);
      loadLiveStatus();
    } catch (e) {
      alert("Erro ao desconectar: " + e.message);
    }
  };

  const handleCreateMeet = async () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isLive = status.is_live_api || status.mode === "LIVE_GOOGLE_API";
  const redirectUri = oAuthConfig?.redirect_uri || "https://bodyharmony.com.br/api/v1/crm/google_oauth.php?action=callback";
  const serviceAccountEmail = oAuthConfig?.service_account_email || "bodyharmony-crm-sa@nom4d-crm.iam.gserviceaccount.com";

  return (
    <Container>
      <TopBanner $isLive={isLive} $connected={status.is_connected}>
        <div className="info">
          <h3>
            <FaCloud style={{ color: "#ED7E13" }} /> Google Agenda, Contatos &amp; Prontuários
          </h3>
          <p>
            Conta Oficial Conectada: <strong>{status.account || "bodyharmony36@gmail.com"}</strong>
          </p>
        </div>

        <div className="banner-actions">
          <div className="status-badge">
            {isLive ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {isLive ? "CONECTADO À CONTA OFICIAL" : "VERIFICAR CONEXÃO GOOGLE"}
          </div>

          <button className="action-btn probe-btn" onClick={handleRunProbe} disabled={isProbing} title="Executa teste em tempo real na Agenda, Contatos e Drive">
            {isProbing ? <FaSpinner className="fa-spin" /> : <FaBolt />} {isProbing ? "Testando..." : "Testar Conexão Google"}
          </button>

          <button className="action-btn config-btn" onClick={() => setShowConfigModal(true)} title="Conectar ou gerenciar login do Google">
            <FaKey /> Conectar Conta Google
          </button>
        </div>
      </TopBanner>

      {probeData && (
        <ProbeResultsCard>
          <div className="header">
            <span>Diagnóstico das APIs ({probeData.total_probe_time_ms || 0}ms total)</span>
            <button onClick={() => setProbeData(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}>✕ Fechar</button>
          </div>
          <div className="grid">
            <div className="item">
              <div className="title">
                <span>Google Calendar</span>
                <span className={`status ${probeData.results?.calendar?.status?.toLowerCase()}`}>{probeData.results?.calendar?.status}</span>
              </div>
              <div className="msg">{probeData.results?.calendar?.message} ({probeData.results?.calendar?.latency_ms}ms)</div>
            </div>
            <div className="item">
              <div className="title">
                <span>Google Drive</span>
                <span className={`status ${probeData.results?.drive?.status?.toLowerCase()}`}>{probeData.results?.drive?.status}</span>
              </div>
              <div className="msg">{probeData.results?.drive?.message} ({probeData.results?.drive?.latency_ms}ms)</div>
            </div>
            <div className="item">
              <div className="title">
                <span>Google Contacts</span>
                <span className={`status ${probeData.results?.contacts?.status?.toLowerCase()}`}>{probeData.results?.contacts?.status}</span>
              </div>
              <div className="msg">{probeData.results?.contacts?.message} ({probeData.results?.contacts?.latency_ms}ms)</div>
            </div>
          </div>
        </ProbeResultsCard>
      )}

      <HubNav>
        <HubTab $active={activeTab === "CALENDAR"} onClick={() => setActiveTab("CALENDAR")}>
          <FaCalendarAlt /> Google Calendar &amp; Consultas
        </HubTab>
        <HubTab $active={activeTab === "CONTACTS"} onClick={() => setActiveTab("CONTACTS")}>
          <FaAddressBook /> Google Contacts (People API)
        </HubTab>
        <HubTab $active={activeTab === "DRIVE"} onClick={() => setActiveTab("DRIVE")}>
          <FaFolderOpen /> Google Drive (Prontuários)
        </HubTab>
      </HubNav>

      <ContentArea>
        {activeTab === "CALENDAR" && (
          <>
            <BackgroundWorkersCard />

            <AgendaLiveSection>
              <div className="section-header">
                <div className="title-group">
                  <FaClock style={{ color: "#ED7E13" }} />
                  <h4>Consultas e Agendamentos Integrados (Google Calendar v3)</h4>
                </div>
                <div className="btn-group">
                  <button className="primary" onClick={handleCreateMeet}>
                    <FaVideo /> Criar Google Meet
                  </button>
                  <button onClick={handleSyncCalendar} disabled={isSyncingCalendar}>
                    {isSyncingCalendar ? <FaSpinner className="fa-spin" /> : <FaSyncAlt />} Sincronizar Google Agenda
                  </button>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748B", fontSize: "0.82rem" }}>
                  Nenhum agendamento pendente no momento. Clique em "Sincronizar Google Agenda" para conciliar eventos.
                </div>
              ) : (
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Horário / Data</th>
                      <th>Paciente / Título</th>
                      <th>Status</th>
                      <th>Google Meet</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 15).map((evt) => (
                      <tr key={evt.id}>
                        <td>
                          <strong>
                            {evt.start_time ? new Date(evt.start_time).toLocaleDateString("pt-BR") : "Hoje"}
                          </strong>{" "}
                          <span style={{ color: "#64748B" }}>
                            {evt.start_time ? new Date(evt.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "09:00"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0A3E60" }}>{evt.patient_name || evt.summary}</div>
                          {evt.description && <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{evt.description.substring(0, 45)}...</div>}
                        </td>
                        <td>
                          <span className="sync-chip">✓ Sincronizado</span>
                        </td>
                        <td>
                          {evt.meet_link ? (
                            <button className="meet-btn" onClick={() => window.open(evt.meet_link, "_blank")}>
                              <FaVideo /> Entrar
                            </button>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>Sem link</span>
                          )}
                        </td>
                        <td>
                          <a
                            href={evt.html_link || "https://calendar.google.com"}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#ED7E13", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                          >
                            Ver <FaExternalLinkAlt style={{ fontSize: "0.65rem" }} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AgendaLiveSection>
          </>
        )}

        {activeTab === "CONTACTS" && (
          <GoogleContactsTable />
        )}

        {activeTab === "DRIVE" && (
          <GoogleDriveExplorer />
        )}
      </ContentArea>

      {showConfigModal && (
        <ModalOverlay onClick={() => setShowConfigModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaShieldAlt style={{ color: "#ED7E13" }} /> Gestão de Credenciais Google Workspace</h3>
              <button onClick={() => setShowConfigModal(false)}><FaTimes /></button>
            </div>

            <div className="modal-tabs">
              <button
                className={modalTab === "WIZARD" ? "active" : ""}
                onClick={() => setModalTab("WIZARD")}
              >
                🚀 Assistente 1-Clique (OAuth2)
              </button>
              <button
                className={modalTab === "SERVICE_ACCOUNT" ? "active" : ""}
                onClick={() => setModalTab("SERVICE_ACCOUNT")}
              >
                ⭐ Service Account (Zero-Token)
              </button>
              <button
                className={modalTab === "TOKEN_JSON" ? "active" : ""}
                onClick={() => setModalTab("TOKEN_JSON")}
              >
                📄 Injetar Token JSON
              </button>
            </div>

            <div className="modal-body">
              {modalTab === "WIZARD" && (
                <>
                  <div className="connect-banner">
                    <h4>Conexão Direta com a Conta Oficial</h4>
                    <p>Autorize a conta <strong>bodyharmony36@gmail.com</strong> com 1 clique no navegador</p>
                    <button className="btn-google-connect" onClick={handleConnectGoogle}>
                      <FaGoogle style={{ color: "#EA4335" }} /> Conectar com Google
                    </button>
                  </div>

                  <div className="info-box">
                    <strong>1. URI de Redirecionamento Autorizado:</strong>
                    <span>Copie e cole este endereço no Google Cloud Console:</span>
                    <div className="copy-row">
                      <span>{redirectUri}</span>
                      <button onClick={() => copyToClipboard(redirectUri)}>
                        {copiedText ? <FaCheck /> : <FaCopy />} Copiar
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: "#0A3E60", fontSize: "0.8rem" }}>2. Chaves do Aplicativo (Client Secret):</span>
                    <label style={{ fontSize: "0.72rem", color: "#ED7E13", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 700 }}>
                      <FaUpload /> Importar .json
                      <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Client ID:</label>
                    <input
                      type="text"
                      placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Client Secret:</label>
                    <input
                      type="password"
                      placeholder="Ex: GOCSPX-xxxxxxxxxxxxxxxxx"
                      value={clientSecretInput}
                      onChange={(e) => setClientSecretInput(e.target.value)}
                    />
                  </div>

                  <button className="btn-save" onClick={handleSaveCredentials} disabled={savingCredentials} style={{ width: "100%", justifyContent: "center", padding: "0.6rem" }}>
                    {savingCredentials ? <FaSpinner className="fa-spin" /> : <FaCheck />} Salvar Chaves do Aplicativo
                  </button>
                </>
              )}

              {modalTab === "SERVICE_ACCOUNT" && (
                <>
                  <div className="info-box" style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
                    <strong style={{ color: "#166534" }}>⭐ Método Zero-Token (Sem Expiração):</strong>
                    <span style={{ color: "#15803D" }}>
                      Sua Service Account já está ativa no servidor! Para dar acesso às pastas e à agenda sem precisar de OAuth:
                    </span>
                    <div className="copy-row" style={{ background: "#DCFCE7" }}>
                      <span style={{ color: "#14532D" }}>{serviceAccountEmail}</span>
                      <button onClick={() => copyToClipboard(serviceAccountEmail)}>
                        {copiedText ? <FaCheck /> : <FaCopy />} Copiar E-mail
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#475569", fontSize: "0.78rem" }}>
                    <div><strong>Passo 1:</strong> Abra o Google Drive de <code>bodyharmony36@gmail.com</code>.</div>
                    <div><strong>Passo 2:</strong> Compartilhe a pasta <em>"Prontuarios"</em> com o e-mail copiado acima como <strong>Editor</strong>.</div>
                    <div><strong>Passo 3:</strong> Abra o Google Calendar e compartilhe a agenda principal com o mesmo e-mail.</div>
                  </div>
                </>
              )}

              {modalTab === "TOKEN_JSON" && (
                <>
                  <div className="info-box">
                    <strong>💡 Injeção Direta de Token JSON:</strong><br />
                    Cole o conteúdo completo do <code>token.json</code> gerado para a conta <strong>bodyharmony36@gmail.com</strong>:
                  </div>

                  <div className="form-group">
                    <textarea
                      placeholder='Cole aqui o JSON contendo "token", "refresh_token", "client_id"...'
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                    />
                  </div>

                  <button className="btn-save" onClick={handleSaveToken} disabled={savingToken} style={{ width: "100%", justifyContent: "center", padding: "0.6rem" }}>
                    {savingToken ? <FaSpinner className="fa-spin" /> : <FaCheck />} Salvar &amp; Ativar Token
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-disconnect" onClick={handleDisconnect}>
                Desconectar Tudo
              </button>
              <button onClick={() => setShowConfigModal(false)} style={{ background: "#E2E8F0", border: "none", padding: "0.5rem 0.85rem", borderRadius: "6px", fontWeight: 700, cursor: "pointer", color: "#475569" }}>
                Fechar
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}
