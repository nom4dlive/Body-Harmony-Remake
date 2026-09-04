import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBrain, FaSyncAlt, FaCheckCircle, FaUserCheck, FaCoins,
  FaSearch, FaLock, FaUnlock, FaGraduationCap, FaStar,
  FaFilePdf, FaMicrophone, FaComments, FaWhatsapp, FaTimes,
  FaCloudUploadAlt, FaListUl, FaPlayCircle, FaCheck, FaUserSecret,
  FaLightbulb, FaCog, FaPodcast, FaFire, FaPlay, FaPause, FaShieldAlt,
  FaGoogle, FaKey, FaCopy, FaExternalLinkAlt
} from 'react-icons/fa';
import { lmsNotebookApi } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import AiNotebookEmbed from '../../../components/AiNotebookEmbed';

// --- STYLED COMPONENTS (UI/UX PRO MAX & LUXURY NAVY/GOLD) ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  color: #FFFFFF;
`;

const NavTabsBar = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(5, 26, 41, 0.7);
  padding: 0.4rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  backdrop-filter: blur(10px);

  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 0.65rem 1.1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &.active {
      background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(237, 126, 19, 0.35);
    }

    &:hover:not(.active) {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.06);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(10, 62, 96, 0.4);
  border: 1px solid rgba(237, 126, 19, 0.2);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(237, 126, 19, 0.5);
    transform: translateY(-2px);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: ${({ $color }) => $color ? `${$color}22` : 'rgba(237, 126, 19, 0.15)'};
    color: ${({ $color }) => $color || '#ED7E13'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;

    .value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.1;
    }

    .label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.65);
      margin-top: 0.25rem;
    }
  }
`;

const SectionCard = styled.div`
  background: rgba(10, 62, 96, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  .title-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: #FFFFFF;
    }

    .badge {
      background: rgba(237, 126, 19, 0.2);
      color: #ED7E13;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-weight: 700;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  min-width: 240px;

  input {
    width: 100%;
    background: rgba(5, 26, 41, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 0.55rem 1rem 0.55rem 2.4rem;
    color: #FFFFFF;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #ED7E13;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.3);
  transition: all 0.2s;
  min-height: 40px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(237, 126, 19, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  min-height: 38px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(237, 126, 19, 0.4);
  }
`;

// Modules Grid
const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
`;

const ModuleCard = styled(motion.div)`
  background: rgba(5, 26, 41, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: rgba(237, 126, 19, 0.4);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;

    .category-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-weight: 700;
      background: ${({ $isExclusive }) => $isExclusive ? 'rgba(237, 126, 19, 0.15)' : 'rgba(49, 107, 156, 0.2)'};
      color: ${({ $isExclusive }) => $isExclusive ? '#ED7E13' : '#64B5F6'};
      border: 1px solid ${({ $isExclusive }) => $isExclusive ? 'rgba(237, 126, 19, 0.3)' : 'rgba(49, 107, 156, 0.3)'};
    }

    .status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #10B981;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  .module-title {
    font-size: 1rem;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0;
    line-height: 1.3;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-wrap: wrap;

    button {
      flex: 1;
      justify-content: center;
    }
  }
`;

// Table
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;

  th {
    background: rgba(5, 26, 41, 0.8);
    padding: 0.9rem 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.9);
    vertical-align: middle;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const TierSelect = styled.select`
  background: rgba(5, 26, 41, 0.9);
  border: 1px solid rgba(237, 126, 19, 0.4);
  color: #FFFFFF;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;

  option {
    background: #051A29;
    color: #FFFFFF;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;
  }

  .slider:before {
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

  input:checked + .slider {
    background-color: #ED7E13;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

// Slide-over Drawers & Modals
const DrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
`;

const DrawerContainer = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  height: 100%;
  background: #051A29;
  border-left: 1px solid rgba(237, 126, 19, 0.3);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  button.close-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;

    &:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const DrawerBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
`;

// Impersonate Modal (Full Screen Luxury View)
const ImpersonateModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ImpersonateWindow = styled(motion.div)`
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  background: #051A29;
  border: 1px solid #ED7E13;
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(237, 126, 19, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ImpersonateBanner = styled.div`
  background: linear-gradient(90deg, #0A3E60 0%, #ED7E13 100%);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #FFFFFF;

  .banner-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    font-size: 0.95rem;

    .badge-test {
      background: #FFFFFF;
      color: #0A3E60;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 800;
    }
  }

  button.exit-btn {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &:hover {
      background: rgba(0, 0, 0, 0.6);
    }
  }
`;

export default function LMSNotebooksManager() {
  const toastContext = useToast();
  const notifyError = (msg) => {
    if (toastContext?.showError) toastContext.showError('Atenção', msg);
    else console.error(msg);
  };
  const notifySuccess = (msg) => {
    if (toastContext?.showSuccess) toastContext.showSuccess('Sucesso', msg);
    else console.log(msg);
  };

  // Tabs
  const [activeTab, setActiveTab] = useState('modules'); // modules | testers | podcasts | insights | governance

  // Data States
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [betaTesters, setBetaTesters] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [govSettings, setGovSettings] = useState({
    maintenance_mode: false,
    maintenance_message: '',
    default_daily_credits: 100,
    system_prompt: '',
    llm_model: ''
  });
  const [googleAuth, setGoogleAuth] = useState({
    authenticated: false,
    connected_email: null,
    auto_refresh_active: false
  });
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleModalTab, setGoogleModalTab] = useState('oauth');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleSessionToken, setGoogleSessionToken] = useState('');
  const [savingGoogleConfig, setSavingGoogleConfig] = useState(false);
  const [googleRedirectUri, setGoogleRedirectUri] = useState('https://bodyharmony.com.br/api/v1/admin/lms/notebook/auth/google/callback');

  // Filters & Search
  const [moduleSearch, setModuleSearch] = useState('');
  const [testerSearch, setTesterSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Drawers & Impersonate States
  const [activeSyncModule, setActiveSyncModule] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [sourcesModule, setSourcesModule] = useState(null);
  const [sourcesData, setSourcesData] = useState(null);
  const [loadingSources, setLoadingSources] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [impersonateData, setImpersonateData] = useState(null); // { embedUrl, userName, moduleTitle }

  useEffect(() => {
    loadAllData();
  }, [categoryFilter]);

  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        notifySuccess(`Conta Google vinculada com sucesso: ${event.data.email || ''}!`);
        setGoogleAuth({
          authenticated: true,
          connected_email: event.data.email || 'Conta Google Conectada',
          auto_refresh_active: true
        });
        loadAllData();
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [modsRes, testersRes, govRes, insightsRes, podsRes] = await Promise.all([
        lmsNotebookApi.getModulesWithNotebooks(categoryFilter),
        lmsNotebookApi.getBetaTesters(),
        lmsNotebookApi.getGovernanceSettings(),
        lmsNotebookApi.getClinicalInsights(),
        lmsNotebookApi.getPodcastsGallery()
      ]);

      if (modsRes?.modules) setModules(modsRes.modules);
      if (testersRes?.beta_testers) setBetaTesters(testersRes.beta_testers);
      if (govRes?.settings) {
        setGovSettings(govRes.settings);
        if (govRes.settings.google_auth) {
          setGoogleAuth(govRes.settings.google_auth);
        }
      }
      if (insightsRes?.top_insights) setInsights(insightsRes.top_insights);
      if (podsRes?.podcasts) setPodcasts(podsRes.podcasts);
    } catch (err) {
      notifyError('Erro ao carregar dados do Hub LMS.');
    } finally {
      setLoading(false);
    }
  };

  // Alterar Cota por Nível
  const handleChangeTier = async (tester, tierCredits) => {
    try {
      await lmsNotebookApi.updateBetaTester(tester.id, tester.ai_notebook_beta_enabled === 1, tierCredits);
      setBetaTesters(prev => prev.map(t => t.id === tester.id ? { ...t, ai_notebook_credits_limit: tierCredits } : t));
      notifySuccess(`Cota de ${tester.name} atualizada para ${tierCredits} 🪙/dia.`);
    } catch (err) {
      notifyError('Erro ao atualizar cota da licenciada.');
    }
  };

  // Toggle Beta Status
  const handleToggleTester = async (tester) => {
    const nextStatus = tester.ai_notebook_beta_enabled !== 1;
    try {
      await lmsNotebookApi.updateBetaTester(tester.id, nextStatus, tester.ai_notebook_credits_limit || 100);
      setBetaTesters(prev => prev.map(t => t.id === tester.id ? { ...t, ai_notebook_beta_enabled: nextStatus ? 1 : 0 } : t));
      notifySuccess(nextStatus ? `Acesso ao Smart Book liberado para ${tester.name}` : `Acesso pausado para ${tester.name}`);
    } catch (err) {
      notifyError('Erro ao atualizar status da licenciada.');
    }
  };

  // Iniciar Personificação (Impersonate)
  const handleStartImpersonation = (testerId, moduleId, modTitle, testerName) => {
    const targetName = testerName || (testerId === 1 ? 'Dra. Joselene Aparecida da Silva' : `Licenciada #${testerId}`);
    setImpersonateData({
      moduleId: moduleId || 1,
      userName: targetName,
      moduleTitle: modTitle || 'Módulo 1: Fundamentos de Eletroestimulação'
    });
    notifySuccess(`Modo Personificação Ativado: ${targetName}`);
  };

  // Disparar sincronização real com Live Drawer (Google NotebookLM & Dra. Harmony AI)
  const triggerSync = async (module) => {
    setActiveSyncModule(module);
    setIsSyncing(true);
    setSyncProgress(25);
    setSyncLogs([
      { id: 1, title: 'Iniciando Pipeline do SmartBook', desc: 'Estruturando aulas, PDFs e fontes clínicas', status: 'running' }
    ]);

    const isAll = !module.id || module.id === 0 || module.id === 'all';

    try {
      setSyncProgress(55);
      setSyncLogs(prev => [
        { id: 1, title: 'Processamento de Mídia & Textos', desc: 'Fontes clínicas verificadas com sucesso', status: 'done' },
        { id: 2, title: 'Sincronização com Google NotebookLM & Dra. Harmony AI', desc: isAll ? 'Indexando todos os cadernos clínicos ativos' : `Indexando Caderno do Módulo: ${module.title}`, status: 'running' }
      ]);

      if (isAll) {
        await lmsNotebookApi.syncAllNotebooks();
      } else {
        await lmsNotebookApi.syncSingleModule(module.id);
      }

      setSyncProgress(100);
      setSyncLogs(prev => [
        { id: 1, title: 'Processamento de Mídia & Textos', desc: 'Fontes clínicas verificadas com sucesso', status: 'done' },
        { id: 2, title: 'Caderno Indexado com Sucesso', desc: 'Base RAG pronta para perguntas, simulação e podcasts', status: 'done' }
      ]);
      setIsSyncing(false);
      notifySuccess(isAll ? 'Todos os módulos foram sincronizados com sucesso!' : `Módulo '${module.title}' sincronizado com sucesso!`);
      loadAllData();
    } catch (err) {
      console.error('[Hub LMS] Erro ao sincronizar:', err);
      setIsSyncing(false);
      notifyError(err.message || 'Erro na sincronização do módulo.');
    }
  };

  // Abrir Drawer de Fontes
  const openSourcesDrawer = async (module) => {
    setSourcesModule(module);
    setLoadingSources(true);
    try {
      const res = await lmsNotebookApi.getModuleSources(module.id);
      setSourcesData(res);
    } catch (err) {
      notifyError('Erro ao carregar fontes do módulo.');
    } finally {
      setLoadingSources(false);
    }
  };

  // Upload de PDF
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notifyError('Por favor, envie apenas arquivos em formato PDF.');
      return;
    }

    setUploadingPdf(true);
    try {
      const res = await lmsNotebookApi.uploadModulePdf(sourcesModule.id, file);
      if (res?.source) {
        setSourcesData(prev => ({
          ...prev,
          manual_sources: [res.source, ...(prev?.manual_sources || [])]
        }));
        notifySuccess('PDF indexado com sucesso no Caderno de IA!');
      }
    } catch (err) {
      notifyError('Erro ao fazer upload do PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Salvar Governança
  const handleSaveGovernance = async () => {
    try {
      await lmsNotebookApi.updateGovernanceSettings(govSettings);
      notifySuccess('Configurações de governança salvas com sucesso!');
    } catch (err) {
      notifyError('Erro ao salvar governança.');
    }
  };

  // Carregar Configurações do Google OAuth
  const loadAuthConfig = async () => {
    try {
      const res = await lmsNotebookApi.getAuthConfig();
      if (res?.google_client_id) setGoogleClientId(res.google_client_id);
      if (res?.redirect_uri) setGoogleRedirectUri(res.redirect_uri);
    } catch (e) {
      // Silencioso
    }
  };

  const openGoogleConfigModal = async () => {
    await loadAuthConfig();
    setShowGoogleModal(true);
  };

  const handleSaveGoogleConfig = async () => {
    if (!googleClientId.trim()) {
      notifyError('Por favor, informe o Google Client ID.');
      return;
    }
    try {
      setSavingGoogleConfig(true);
      await lmsNotebookApi.saveAuthConfig({
        google_client_id: googleClientId.trim(),
        google_client_secret: googleClientSecret.trim()
      });
      notifySuccess('Credenciais do Google salvas com sucesso!');
      setShowGoogleModal(false);
    } catch (e) {
      notifyError('Erro ao salvar credenciais do Google.');
    } finally {
      setSavingGoogleConfig(false);
    }
  };

  const handleSaveSessionToken = async () => {
    if (!googleSessionToken.trim()) {
      notifyError('Por favor, insira o token ou JSON de sessão.');
      return;
    }
    try {
      setSavingGoogleConfig(true);
      const res = await lmsNotebookApi.saveSessionToken({ session_json: googleSessionToken.trim() });
      notifySuccess('Token de sessão salvo e sincronizado com sucesso!');
      setGoogleAuth({
        authenticated: true,
        connected_email: res?.email || 'Conta Google Conectada',
        auto_refresh_active: true
      });
      setShowGoogleModal(false);
      setGoogleSessionToken('');
      loadAllData();
    } catch (e) {
      notifyError(e?.message || 'Erro ao salvar token de sessão.');
    } finally {
      setSavingGoogleConfig(false);
    }
  };

  // Conectar Conta Google em 1-Clique (OAuth Permanente)
  const handleConnectGoogle = async () => {
    try {
      setConnectingGoogle(true);
      const res = await lmsNotebookApi.getGoogleAuthUrl();
      if (res?.auth_url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(res.auth_url, 'GoogleAuth', `width=${width},height=${height},top=${top},left=${left}`);
      } else {
        notifyError('Não foi possível gerar a URL de autorização.');
      }
    } catch (err) {
      notifyError(err.message || 'Configure seu Client ID do Google Cloud para conectar.');
      openGoogleConfigModal();
    } finally {
      setConnectingGoogle(false);
    }
  };

  // Desconectar Conta Google
  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Deseja realmente desconectar a conta Google do NotebookLM?')) return;
    try {
      await lmsNotebookApi.disconnectGoogle();
      setGoogleAuth({ authenticated: false, connected_email: null, auto_refresh_active: false });
      notifySuccess('Conta Google desconectada com sucesso.');
    } catch (err) {
      notifyError('Erro ao desconectar conta Google.');
    }
  };

  // Toggle Podcast Featured
  const handleTogglePodcast = async (podId) => {
    try {
      await lmsNotebookApi.togglePodcastFeature(podId);
      setPodcasts(prev => prev.map(p => p.id === podId ? { ...p, is_featured: !p.is_featured } : p));
      notifySuccess('Destaque do podcast atualizado na biblioteca!');
    } catch (err) {
      notifyError('Erro ao atualizar destaque.');
    }
  };

  // Métricas
  const totalModules = modules.length;
  const syncedNotebooks = modules.filter(m => m.status === 'synced').length;
  const activeBetaCount = betaTesters.filter(t => t.ai_notebook_beta_enabled === 1).length;

  const filteredModules = modules.filter(m => m.title.toLowerCase().includes(moduleSearch.toLowerCase()));
  const filteredTesters = betaTesters.filter(t => t.name.toLowerCase().includes(testerSearch.toLowerCase()) || (t.cpf && t.cpf.includes(testerSearch)));

  return (
    <Container>
      {/* 1. NAVEGAÇÃO PRINCIPAL DAS 5 ABAS */}
      <NavTabsBar>
        <button className={activeTab === 'modules' ? 'active' : ''} onClick={() => setActiveTab('modules')}>
          <FaBrain /> Módulos & Cadernos
        </button>
        <button className={activeTab === 'testers' ? 'active' : ''} onClick={() => setActiveTab('testers')}>
          <FaUserCheck /> Licenciadas & Cotas ({activeBetaCount})
        </button>
        <button className={activeTab === 'podcasts' ? 'active' : ''} onClick={() => setActiveTab('podcasts')}>
          <FaPodcast /> Podcasts do Estúdio ({podcasts.length})
        </button>
        <button className={activeTab === 'insights' ? 'active' : ''} onClick={() => setActiveTab('insights')}>
          <FaLightbulb /> Radar de Insights
        </button>
        <button className={activeTab === 'governance' ? 'active' : ''} onClick={() => setActiveTab('governance')}>
          <FaCog /> Governança & Persona IA
        </button>
      </NavTabsBar>

      {/* 2. STATS CLUSTER */}
      <StatsGrid>
        <StatCard $color="#ED7E13">
          <div className="icon-wrapper"><FaBrain /></div>
          <div className="info">
            <span className="value">{totalModules}</span>
            <span className="label">Módulos no LMS</span>
          </div>
        </StatCard>

        <StatCard $color="#10B981">
          <div className="icon-wrapper"><FaCheckCircle /></div>
          <div className="info">
            <span className="value">{syncedNotebooks}</span>
            <span className="label">Cadernos Indexados</span>
          </div>
        </StatCard>

        <StatCard $color="#3B82F6">
          <div className="icon-wrapper"><FaUserCheck /></div>
          <div className="info">
            <span className="value">{activeBetaCount}</span>
            <span className="label">Licenciadas Beta Ativas</span>
          </div>
        </StatCard>

        <StatCard $color="#F59E0B">
          <div className="icon-wrapper"><FaCoins /></div>
          <div className="info">
            <span className="value">{govSettings.default_daily_credits || 100} 🪙</span>
            <span className="label">Cota Diária Padrão</span>
          </div>
        </StatCard>
      </StatsGrid>

      {/* 3. CONTEÚDO DAS ABAS */}

      {/* ABA 1: MÓDULOS & CADERNOS */}
      {activeTab === 'modules' && (
        <SectionCard>
          <SectionHeader>
            <div className="title-block">
              <FaBrain style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <h3>Grade de Módulos & Cadernos de IA</h3>
              <span className="badge">{filteredModules.length} Módulos</span>
            </div>

            <div className="actions">
              <SearchInputWrapper>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar módulo..."
                  value={moduleSearch}
                  onChange={e => setModuleSearch(e.target.value)}
                />
              </SearchInputWrapper>

              <PrimaryButton onClick={() => triggerSync({ id: 'all', title: 'Todos os Módulos', notebook_id: 'bh-all' })}>
                <FaSyncAlt /> Sincronizar Todos
              </PrimaryButton>
            </div>
          </SectionHeader>

          <ModulesGrid>
            {filteredModules.map(mod => (
              <ModuleCard key={mod.id} $isExclusive={mod.is_exclusive === 1}>
                <div className="card-top">
                  <span className="category-badge">{mod.category}</span>
                  <span className="status-badge">
                    <FaCheck /> {mod.lessons_count} Aulas Transcritas
                  </span>
                </div>

                <h4 className="module-title">{mod.title}</h4>

                <div className="card-actions">
                  <SecondaryButton onClick={() => handleStartImpersonation(1, mod.id, mod.title)} style={{ borderColor: 'rgba(237, 126, 19, 0.4)' }}>
                    <FaUserSecret style={{ color: '#ED7E13' }} /> Personificar & Testar
                  </SecondaryButton>
                  <SecondaryButton onClick={() => openSourcesDrawer(mod)}>
                    <FaListUl /> Fontes & PDFs
                  </SecondaryButton>
                  <PrimaryButton onClick={() => triggerSync(mod)} style={{ minHeight: '38px', padding: '0.4rem 0.8rem' }}>
                    <FaSyncAlt /> Sincronizar
                  </PrimaryButton>
                </div>
              </ModuleCard>
            ))}
          </ModulesGrid>
        </SectionCard>
      )}

      {/* ABA 2: LICENCIADAS & COTAS */}
      {activeTab === 'testers' && (
        <SectionCard>
          <SectionHeader>
            <div className="title-block">
              <FaUserCheck style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <h3>Gestão de Licenciadas & Níveis de Cotas</h3>
              <span className="badge">{filteredTesters.length} Licenciadas</span>
            </div>

            <div className="actions">
              <SearchInputWrapper>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar aluna, email ou CPF..."
                  value={testerSearch}
                  onChange={e => setTesterSearch(e.target.value)}
                />
              </SearchInputWrapper>
            </div>
          </SectionHeader>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>LICENCIADA</th>
                  <th>NÍVEL DE COTA (DIÁRIA)</th>
                  <th>CONSUMO HOJE</th>
                  <th>ATIVIDADE IA</th>
                  <th>LIBERAR BETA</th>
                  <th>PERSONIFICAR</th>
                  <th>CONTATO</th>
                </tr>
              </thead>
              <tbody>
                {filteredTesters.map(tester => (
                  <tr key={tester.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{tester.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>CPF: {tester.cpf || 'N/D'}</div>
                    </td>
                    <td>
                      <TierSelect
                        value={tester.ai_notebook_credits_limit || 100}
                        onChange={e => handleChangeTier(tester, parseInt(e.target.value))}
                      >
                        <option value={50}>🟢 Básico (50 🪙/dia)</option>
                        <option value={100}>🟡 Padrão (100 🪙/dia)</option>
                        <option value={250}>🟠 Master (250 🪙/dia)</option>
                        <option value={9999}>💎 VIP Ilimitado (♾️)</option>
                      </TierSelect>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {tester.credits_used_today || 0} / {tester.ai_notebook_credits_limit || 100} 🪙
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                        <span><FaComments style={{ color: '#60A5FA' }} /> {tester.questions_count_today || 0}</span>
                        <span><FaMicrophone style={{ color: '#F59E0B' }} /> {tester.podcasts_count_today || 0}</span>
                      </div>
                    </td>
                    <td>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={tester.ai_notebook_beta_enabled === 1}
                          onChange={() => handleToggleTester(tester)}
                        />
                        <span className="slider" />
                      </ToggleSwitch>
                    </td>
                    <td>
                      <SecondaryButton
                        onClick={() => handleStartImpersonation(tester.id, 1, 'Módulo 1')}
                        style={{ minHeight: '32px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: '#ED7E13' }}
                      >
                        <FaUserSecret style={{ color: '#ED7E13' }} /> Testar
                      </SecondaryButton>
                    </td>
                    <td>
                      {tester.whatsapp ? (
                        <SecondaryButton
                          onClick={() => window.open(`https://wa.me/55${tester.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(tester.name)}!%20Seu%20acesso%20ao%20Smart%20Book%20est%C3%A1%20liberado.`, '_blank')}
                          style={{ minHeight: '32px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <FaWhatsapp style={{ color: '#10B981' }} />
                        </SecondaryButton>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </SectionCard>
      )}

      {/* ABA 3: PODCASTS DO ESTÚDIO */}
      {activeTab === 'podcasts' && (
        <SectionCard>
          <SectionHeader>
            <div className="title-block">
              <FaPodcast style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <h3>Galeria de Podcasts do Estúdio de IA</h3>
              <span className="badge">{podcasts.length} Áudios Gerados</span>
            </div>
          </SectionHeader>

          {podcasts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(5, 26, 41, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <FaPodcast style={{ fontSize: '2.5rem', color: '#ED7E13', opacity: 0.6, marginBottom: '1rem' }} />
              <h4 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Nenhum podcast gerado ainda</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                Os episódios de áudio e debates clínicos gerados pelo Google NotebookLM aparecerão aqui automaticamente com player de reprodução.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {podcasts.map(pod => (
                <div key={pod.id} style={{ background: 'rgba(5, 26, 41, 0.8)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ED7E13', fontWeight: 700 }}>{pod.module_title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>⏱ {pod.duration}</span>
                  </div>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{pod.title}</h5>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Gerado por: {pod.author_name}</span>

                  {/* Player de áudio com proteção anti-download */}
                  {pod.audio_url ? (
                    <audio controls controlsList="nodownload" style={{ width: '100%', height: '36px', marginTop: '0.5rem' }}>
                      <source src={pod.audio_url} type="audio/mpeg" />
                    </audio>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                      {pod.transcript_summary || 'Áudio disponível no Caderno do Módulo.'}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <SecondaryButton
                      onClick={() => handleTogglePodcast(pod.id)}
                      style={{ borderColor: pod.is_featured ? '#10B981' : 'rgba(255,255,255,0.2)' }}
                    >
                      <FaStar style={{ color: pod.is_featured ? '#10B981' : '#FFFFFF' }} />
                      {pod.is_featured ? '✓ Destaque na Biblioteca' : 'Destacar na Biblioteca'}
                    </SecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ABA 4: RADAR DE INSIGHTS CLÍNICOS */}
      {activeTab === 'insights' && (
        <SectionCard>
          <SectionHeader>
            <div className="title-block">
              <FaLightbulb style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <h3>Radar de Dúvidas Clínicas & Insights Pedagógicos</h3>
              <span className="badge">
                {insights.reduce((acc, i) => acc + (parseInt(i.questions_count) || 0), 0)} Dúvidas Registradas
              </span>
            </div>
          </SectionHeader>

          {insights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(5, 26, 41, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <FaLightbulb style={{ fontSize: '2.5rem', color: '#ED7E13', opacity: 0.6, marginBottom: '1rem' }} />
              <h4 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Nenhuma dúvida clínica registrada ainda</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                Conforme as alunas interagirem com o chat da Dra. Harmony AI, os tópicos mais recorrentes e recomendações pedagógicas serão agregados aqui em tempo real.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insights.map((ins, idx) => (
                <div key={idx} style={{ background: 'rgba(5, 26, 41, 0.7)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {ins.trending && <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}><FaFire /> EM ALTA</span>}
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{ins.topic}</h5>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#ED7E13', fontWeight: 800 }}>{ins.questions_count} Dúvidas</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Módulo: {ins.module_title}</div>
                  <div style={{ background: 'rgba(237, 126, 19, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '8px', borderLeft: '3px solid #ED7E13', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)' }}>
                    💡 <strong>Recomendação Pedagógica:</strong> {ins.pedagogical_recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ABA 5: GOVERNANÇA & PERSONA IA */}
      {activeTab === 'governance' && (
        <SectionCard>
          <SectionHeader>
            <div className="title-block">
              <FaShieldAlt style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <h3>Governança do Tutor Clínico & Segurança</h3>
            </div>
            <PrimaryButton onClick={handleSaveGovernance}>
              <FaCheck /> Salvar Configurações
            </PrimaryButton>
          </SectionHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
            {/* Kill Switch */}
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h5 style={{ margin: '0 0 0.25rem 0', color: '#EF4444', fontSize: '1rem', fontWeight: 700 }}>
                  Interruptor Geral de Manutenção (Global Kill Switch)
                </h5>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  Quando ativado, suspende o Smart Book para as alunas e exibe a mensagem de manutenção amigável.
                </p>
              </div>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={govSettings.maintenance_mode}
                  onChange={e => setGovSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                />
                <span className="slider" />
              </ToggleSwitch>
            </div>

            {/* Prompt do Sistema */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Prompt do Sistema — Persona da Dra. Harmony AI (Tutora Clínica)
              </label>
              <textarea
                rows={5}
                value={govSettings.system_prompt}
                onChange={e => setGovSettings(prev => ({ ...prev, system_prompt: e.target.value }))}
                style={{ width: '100%', background: 'rgba(5, 26, 41, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            {/* Conexão com Google NotebookLM (Gemini Engine) */}
            <div style={{ background: 'linear-gradient(135deg, rgba(10, 62, 96, 0.6) 0%, rgba(5, 26, 41, 0.9) 100%)', border: '1px solid rgba(237, 126, 19, 0.3)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(237, 126, 19, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED7E13', fontSize: '1.3rem' }}>
                    <FaGoogle />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Motor Neural Google NotebookLM <span style={{ color: '#ED7E13', fontSize: '0.8rem', background: 'rgba(237, 126, 19, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>Gemini 2.0 Native</span>
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                      Conexão oficial OAuth permanente com renovação automática contínua (0 scripts / sem expiração de 30 dias).
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={openGoogleConfigModal}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' }}
                  >
                    <FaCog /> Configurar Credenciais
                  </button>

                  {googleAuth.authenticated ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>
                          <FaCheckCircle /> Conectado & Ativo
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                          {googleAuth.connected_email || 'Conta Vinculada'}
                        </div>
                      </div>
                      <button
                        onClick={handleDisconnectGoogle}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectGoogle}
                      disabled={connectingGoogle}
                      style={{ background: 'linear-gradient(135deg, #ED7E13 0%, #D96E0E 100%)', border: 'none', color: '#FFFFFF', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(237, 126, 19, 0.4)', transition: 'all 0.2s ease' }}
                    >
                      <FaGoogle /> {connectingGoogle ? 'Abrindo Google...' : 'Conectar com Google em 1-Clique'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(5, 26, 41, 0.6)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                <FaKey style={{ color: '#ED7E13', flexShrink: 0 }} />
                <span>
                  <strong>Garantia de Permanência:</strong> O Refresh Token fica protegido no banco de dados. A transcrição de aulas, RAG clínico e podcasts são processados instantaneamente na nuvem do Google.
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* 4. IMPERSONATE & TEST MODAL (LUXURY VIEWER) */}
      <AnimatePresence>
        {impersonateData && (
          <ImpersonateModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImpersonateWindow
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <ImpersonateBanner>
                <div className="banner-info">
                  <FaUserSecret style={{ fontSize: '1.2rem' }} />
                  <span>Modo Personificação Ativo: <strong>{impersonateData.userName}</strong></span>
                  <span className="badge-test">PERMISSÃO TOTAL DE TESTE</span>
                  <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>• {impersonateData.moduleTitle}</span>
                </div>
                <button className="exit-btn" onClick={() => setImpersonateData(null)}>
                  <FaTimes /> Encerrar Teste
                </button>
              </ImpersonateBanner>

              <div style={{ flex: 1, background: '#051A29', overflowY: 'auto', padding: '1rem' }}>
                <AiNotebookEmbed
                  moduleId={impersonateData.moduleId || 1}
                  moduleTitle={impersonateData.moduleTitle}
                />
              </div>
            </ImpersonateWindow>
          </ImpersonateModalOverlay>
        )}
      </AnimatePresence>

      {/* 5. LIVE EXECUTION DRAWER */}
      <AnimatePresence>
        {activeSyncModule && (
          <DrawerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSyncing && setActiveSyncModule(null)}
          >
            <DrawerContainer
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <DrawerHeader>
                <h4><FaBrain style={{ color: '#ED7E13' }} /> Sincronização em Tempo Real</h4>
                {!isSyncing && (
                  <button className="close-btn" onClick={() => setActiveSyncModule(null)}>
                    <FaTimes />
                  </button>
                )}
              </DrawerHeader>

              <DrawerBody>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem 0', color: '#FFFFFF', fontSize: '1rem' }}>
                    {activeSyncModule.title}
                  </h5>
                  <span style={{ fontSize: '0.78rem', color: '#ED7E13' }}>
                    Caderno: {activeSyncModule.notebook_id}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>Progresso do Pipeline</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${syncProgress}%`, background: 'linear-gradient(90deg, #ED7E13 0%, #F59E0B 100%)', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {syncLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.95rem', color: log.status === 'done' ? '#10B981' : '#ED7E13', marginTop: '0.15rem' }}>
                        {log.status === 'done' ? <FaCheck /> : <FaSyncAlt className="fa-spin" />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>{log.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{log.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {!isSyncing && (
                  <PrimaryButton onClick={() => setActiveSyncModule(null)} style={{ marginTop: 'auto' }}>
                    <FaCheck /> Concluir e Fechar
                  </PrimaryButton>
                )}
              </DrawerBody>
            </DrawerContainer>
          </DrawerOverlay>
        )}
      </AnimatePresence>

      {/* 6. MODULE SOURCES DRAWER */}
      <AnimatePresence>
        {sourcesModule && (
          <DrawerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSourcesModule(null)}
          >
            <DrawerContainer
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <DrawerHeader>
                <h4><FaListUl style={{ color: '#ED7E13' }} /> Fontes & Transcrições</h4>
                <button className="close-btn" onClick={() => setSourcesModule(null)}>
                  <FaTimes />
                </button>
              </DrawerHeader>

              <DrawerBody>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem 0', color: '#FFFFFF', fontSize: '1rem' }}>
                    {sourcesModule.title}
                  </h5>
                  <span style={{ fontSize: '0.78rem', color: '#ED7E13' }}>
                    Caderno: {sourcesModule.notebook_id}
                  </span>
                </div>

                {/* Upload de PDFs */}
                <label style={{ border: '2px dashed rgba(237, 126, 19, 0.4)', borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(237, 126, 19, 0.04)' }}>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={uploadingPdf} style={{ display: 'none' }} />
                  <FaCloudUploadAlt style={{ fontSize: '2rem', color: '#ED7E13' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {uploadingPdf ? 'Enviando e indexando PDF...' : 'Adicionar Apostila ou PDF Complementar'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Formatos aceitos: PDF (máx. 25MB)</span>
                </label>

                {/* Lista de Aulas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h6 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                    Aulas Transcritas ({sourcesData?.lessons?.length || 0})
                  </h6>
                  {loadingSources ? (
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Carregando aulas...</span>
                  ) : (
                    sourcesData?.lessons?.map(lesson => (
                      <div key={lesson.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>{lesson.title}</span>
                          <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✓ Transcrita</span>
                        </div>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                          {lesson.transcript_preview}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DrawerBody>
            </DrawerContainer>
          </DrawerOverlay>
        )}
      </AnimatePresence>

      {/* 7. GOOGLE OAUTH & CREDENTIALS CONFIG MODAL */}
      <AnimatePresence>
        {showGoogleModal && (
          <DrawerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGoogleModal(false)}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', background: '#051A29', border: '1px solid rgba(237, 126, 19, 0.4)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <DrawerHeader style={{ background: 'rgba(10, 62, 96, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaGoogle style={{ color: '#ED7E13', fontSize: '1.3rem' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Credenciais Google NotebookLM</h4>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Configuração de Autenticação Permanente</span>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowGoogleModal(false)}>
                  <FaTimes />
                </button>
              </DrawerHeader>

              {/* Tabs do Modal */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                <button
                  onClick={() => setGoogleModalTab('oauth')}
                  style={{ flex: 1, padding: '0.85rem', background: googleModalTab === 'oauth' ? 'rgba(237, 126, 19, 0.15)' : 'transparent', color: googleModalTab === 'oauth' ? '#ED7E13' : 'rgba(255,255,255,0.7)', border: 'none', borderBottom: googleModalTab === 'oauth' ? '2px solid #ED7E13' : '2px solid transparent', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <FaGoogle /> Google Cloud OAuth (1-Clique)
                </button>
                <button
                  onClick={() => setGoogleModalTab('token')}
                  style={{ flex: 1, padding: '0.85rem', background: googleModalTab === 'token' ? 'rgba(237, 126, 19, 0.15)' : 'transparent', color: googleModalTab === 'token' ? '#ED7E13' : 'rgba(255,255,255,0.7)', border: 'none', borderBottom: googleModalTab === 'token' ? '2px solid #ED7E13' : '2px solid transparent', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <FaKey /> Token de Sessão Direto
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {googleModalTab === 'oauth' ? (
                  <>
                    <div style={{ background: 'rgba(237, 126, 19, 0.08)', padding: '0.9rem', borderRadius: '8px', borderLeft: '3px solid #ED7E13', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                      💡 Crie um <strong>OAuth Client ID (Web Application)</strong> no Google Cloud Console com o seu e-mail (ex: <code>bodyharmony36@gmail.com</code>) e cole as credenciais abaixo.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        URL de Redirecionamento Autorizada (Redirect URI)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          readOnly
                          value={googleRedirectUri}
                          style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.6rem 0.75rem', color: '#10B981', fontSize: '0.8rem', fontFamily: 'monospace' }}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(googleRedirectUri);
                            notifySuccess('URI copiada para a área de transferência!');
                          }}
                          style={{ background: 'rgba(237, 126, 19, 0.2)', border: '1px solid #ED7E13', color: '#ED7E13', borderRadius: '6px', padding: '0.6rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          <FaCopy /> Copiar
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                        Adicione exatamente esta URI em "URIs de redirecionamento autorizados" no Google Cloud Console.
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Google Client ID
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 123456789-xxx.apps.googleusercontent.com"
                        value={googleClientId}
                        onChange={e => setGoogleClientId(e.target.value)}
                        style={{ background: 'rgba(5, 26, 41, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.6rem 0.75rem', color: '#FFFFFF', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Google Client Secret
                      </label>
                      <input
                        type="password"
                        placeholder="Ex: GOCSPX-xxxxxxxxxxxxxxxx"
                        value={googleClientSecret}
                        onChange={e => setGoogleClientSecret(e.target.value)}
                        style={{ background: 'rgba(5, 26, 41, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.6rem 0.75rem', color: '#FFFFFF', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#ED7E13', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Abrir Google Cloud Console <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                      </a>
                      <PrimaryButton onClick={handleSaveGoogleConfig} disabled={savingGoogleConfig}>
                        <FaCheck /> {savingGoogleConfig ? 'Salvando...' : 'Salvar Credenciais'}
                      </PrimaryButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.9rem', borderRadius: '8px', borderLeft: '3px solid #10B981', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                      🔑 Caso não queira criar projeto no Google Cloud, você pode colar o <strong>Master Token</strong> ou o conteúdo do arquivo <code>session.json</code> gerado via CLI.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Token de Sessão ou Session JSON
                      </label>
                      <textarea
                        rows={6}
                        placeholder='Cole aqui seu session.json ou Master Token (aas_et/xxx)...'
                        value={googleSessionToken}
                        onChange={e => setGoogleSessionToken(e.target.value)}
                        style={{ background: 'rgba(5, 26, 41, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem', color: '#FFFFFF', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <PrimaryButton onClick={handleSaveSessionToken} disabled={savingGoogleConfig}>
                        <FaCheck /> {savingGoogleConfig ? 'Sincronizando...' : 'Salvar e Sincronizar Token'}
                      </PrimaryButton>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </DrawerOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}
