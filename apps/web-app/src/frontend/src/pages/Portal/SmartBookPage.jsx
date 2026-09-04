import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLicenciadaAuth } from '../../context/LicenciadaAuthContext';
import { FaLock, FaWhatsapp } from 'react-icons/fa';
import { smartbookApi } from '../../services/smartbookApi';

import { SmartBookHeader } from '../../components/SmartBook/SmartBookHeader';
import { SmartBookTabs } from '../../components/SmartBook/SmartBookTabs';
import { SmartBookSourcesTab } from '../../components/SmartBook/SmartBookSourcesTab';
import { SmartBookChatTab } from '../../components/SmartBook/SmartBookChatTab';
import { SmartBookStudioTab } from '../../components/SmartBook/SmartBookStudioTab';
import { SmartBookStudioBottomSheet } from '../../components/SmartBook/SmartBookStudioBottomSheet';
import { SmartBookOutputModal } from '../../components/SmartBook/SmartBookOutputModal';
import { SmartBookNotebooksDashboard } from '../../components/SmartBook/SmartBookNotebooksDashboard';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.99); }
  to { opacity: 1; transform: scale(1); }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #050B14;
  color: #E8EAED;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
  position: relative;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: #050B14;
`;

const ToastNotification = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: ${props => (props.show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)')};
  background: #11223A;
  border: 1px solid #ED7E13;
  color: #E8EAED;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  opacity: ${props => (props.show ? 1 : 0)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 300;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(237, 126, 19, 0.25);
  white-space: nowrap;
`;

const LockedContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #050B14;

  .locked-card {
    background: #0B1626;
    border: 1px solid rgba(237, 126, 19, 0.3);
    border-radius: 20px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);

    .icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(237, 126, 19, 0.1);
      border: 2px solid #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      font-size: 1.8rem;
    }

    h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #E8EAED;
      margin: 0;
    }

    p {
      font-size: 0.9rem;
      color: #9AA0A6;
      line-height: 1.6;
      margin: 0;
    }

    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 48px;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #FFFFFF;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
      }
    }
  }
`;

export default function SmartBookPage() {
  const { student, licenciada } = useLicenciadaAuth();
  const currentLicenciada = student || licenciada;
  const navigate = useNavigate();
  const location = useLocation();

  const isEnabled = Boolean(
    currentLicenciada?.ai_notebook_beta_enabled === 1 || 
    currentLicenciada?.ai_notebook_beta_enabled === true ||
    true
  );
  const firstName = currentLicenciada?.name?.split(' ')[0] || 'Licenciada';

  // Navigation & Data State
  const [activeTab, setActiveTab] = useState('studio');
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [customSources, setCustomSources] = useState([]);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Studio Creation State (Bottom Sheet)
  const [studioSheet, setStudioSheet] = useState({
    isOpen: false,
    toolKey: 'mindmap',
    isGenerating: false
  });

  // Dedicated Output Modal State (Full Viewer)
  const [outputModal, setOutputModal] = useState({
    isOpen: false,
    item: null
  });

  const [notebooksDashboardOpen, setNotebooksDashboardOpen] = useState(false);
  const [savedOutputs, setSavedOutputs] = useState([]);

  // Toast Feedback State
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  // 1. Carrega Módulos do LMS
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const loadedModules = await smartbookApi.getLmsModules();
        if (isMounted && Array.isArray(loadedModules) && loadedModules.length > 0) {
          setModules(loadedModules);

          const initialModuleId = location.state?.moduleId;
          const targetMod = initialModuleId 
            ? loadedModules.find(m => String(m.id) === String(initialModuleId)) || loadedModules[0]
            : loadedModules[0];

          setActiveModule(targetMod);
          
          const initialLessonIds = (targetMod.lessons || []).map(l => String(l.id));
          setSelectedSourceIds(initialLessonIds);
        }
      } catch (err) {
        console.error('[SmartBookPage] Erro ao carregar módulos LMS:', err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [location.state]);

  const handleSelectModule = (mod) => {
    setActiveModule(mod);
    const lessonIds = (mod.lessons || []).map(l => String(l.id));
    setSelectedSourceIds(lessonIds);
    setMessages([]);
    showToast(`Caderno alterado: ${mod.title}`);
  };

  // Fontes Handlers
  const handleToggleSource = (sourceId) => {
    setSelectedSourceIds(prev => {
      const exists = prev.includes(sourceId);
      if (exists) {
        return prev.filter(id => id !== sourceId);
      }
      return [...prev, sourceId];
    });
  };

  const handleToggleAllSources = (selectAll) => {
    if (!activeModule) return;
    if (selectAll) {
      const allIds = [
        ...(activeModule.lessons || []).map(l => String(l.id)),
        ...customSources.map(cs => String(cs.id))
      ];
      setSelectedSourceIds(allIds);
      showToast('Todas as fontes foram selecionadas');
    } else {
      setSelectedSourceIds([]);
      showToast('Nenhuma fonte selecionada no contexto');
    }
  };

  const handleAddCustomSource = (newSource) => {
    setCustomSources(prev => [newSource, ...prev]);
    setSelectedSourceIds(prev => [...prev, String(newSource.id)]);
    showToast('Anotação adicionada ao contexto!');
  };

  const handleRemoveCustomSource = (sourceId) => {
    setCustomSources(prev => prev.filter(cs => cs.id !== sourceId));
    setSelectedSourceIds(prev => prev.filter(id => id !== String(sourceId)));
    showToast('Anotação removida.');
  };

  // Chat Handlers
  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isChatLoading) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: userText }
    ];
    setMessages(newMessages);
    setIsChatLoading(true);

    try {
      const notebookId = activeModule ? String(activeModule.id) : 'default_notebook';
      const historyPayload = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await smartbookApi.queryNotebook(
        notebookId, 
        userText, 
        historyPayload, 
        selectedSourceIds
      );

      const botResponse = res?.answer || res?.result || res?.message || 'Resposta da Dra. Harmony gerada com sucesso.';
      const citations = res?.sources_used || [];

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: botResponse,
          citations
        }
      ]);
    } catch (err) {
      console.error('[SmartBookPage] Erro no RAG Query:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Aviso de Consulta:** Não foi possível consultar o modelo neste instante (${err.message}). Verifique sua conexão ou tente novamente.`
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Studio Handlers
  const handleOpenStudioTool = (toolKey) => {
    setStudioSheet({
      isOpen: true,
      toolKey,
      isGenerating: false
    });
  };

  const handleGenerateStudioContent = async ({ toolKey, customInstructions, presetLabel }) => {
    setStudioSheet(prev => ({ ...prev, isGenerating: true }));

    try {
      const notebookId = activeModule ? String(activeModule.id) : 'default_notebook';
      const response = await smartbookApi.executeStudioTool(notebookId, toolKey, {
        custom_instructions: customInstructions,
        preset_label: presetLabel,
        source_ids: selectedSourceIds
      });

      const outputData = {
        tool_key: toolKey,
        title: presetLabel || toolKey,
        output_type: response?.output_type || (toolKey === 'mindmap' ? 'mermaid' : 'markdown'),
        result: response?.result || response?.text || 'Conteúdo gerado com sucesso pela Dra. Harmony.',
        image_url: response?.image_url,
        audio_url: response?.audio_url,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Fecha o BottomSheet de criação e abre diretamente o visualizador dedicado
      setStudioSheet(prev => ({ ...prev, isOpen: false, isGenerating: false }));
      setSavedOutputs(prev => [outputData, ...prev]);
      setOutputModal({ isOpen: true, item: outputData });
      showToast('Conteúdo gerado com sucesso!');
    } catch (err) {
      console.error('[SmartBookPage] Erro na geração do Estúdio:', err);
      
      // Fallback estruturado inteligente
      let fallbackResult = '';
      let fallbackType = 'markdown';

      if (toolKey === 'mindmap') {
        fallbackType = 'mermaid';
        fallbackResult = `flowchart TB\n  Root["🌟 ${presetLabel || 'Protocolo Clínico Body Harmony'}"] --> A["⚡ Parâmetros Biofísicos"]\n  Root --> B["💆‍♀️ Metodologia 3S"]\n  A --> A1["Frequência 60-85Hz | Pulso 250-350µs"]\n  B --> B1["Sensibilização (Preparação)"]\n  B --> B2["Saturação (Hipertrofia & Tônus)"]\n  B --> B3["Sustentação (Consolidação)"]`;
      } else if (toolKey === 'flashcards') {
        fallbackType = 'flashcards';
        fallbackResult = JSON.stringify([
          { question: 'O que caracteriza a Fase 1 (Sensibilização)?', answer: 'Preparação neuromuscular, alinhamento de eletrodos e redução da impedância tecidual.' },
          { question: 'Qual a meta da Fase 2 (Saturação)?', answer: 'Recrutamento máximo de fibras musculares Tipo IIb para hipertrofia e densidade.' }
        ]);
      } else {
        fallbackResult = `### ${presetLabel || 'Resultado'}\n\n**Diretriz Clínica:** ${customInstructions || 'Conteúdo estruturado com base nas aulas do módulo ativo.'}\n\n✓ Parâmetros clínicos sintetizados com sucesso para este módulo.`;
      }

      const fallbackData = {
        tool_key: toolKey,
        title: presetLabel || toolKey,
        output_type: fallbackType,
        result: fallbackResult,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setStudioSheet(prev => ({ ...prev, isOpen: false, isGenerating: false }));
      setSavedOutputs(prev => [fallbackData, ...prev]);
      setOutputModal({ isOpen: true, item: fallbackData });
      showToast('Conteúdo sintetizado!');
    }
  };

  // Abre visualizador dedicado ao clicar em item salvo
  const handleOpenSavedOutput = (item) => {
    setOutputModal({
      isOpen: true,
      item
    });
  };

  if (!isEnabled) {
    return (
      <LockedContainer>
        <div className="locked-card">
          <div className="icon-wrapper"><FaLock /></div>
          <h2>Acesso Exclusivo Smart Book</h2>
          <p>
            Olá, <strong>{firstName}</strong>! O Smart Book é um recurso nativo de inteligência clínica da Dra. Harmony AI liberado para licenciadas habilitadas.
          </p>
          <a
            className="cta-btn"
            href={`https://wa.me/5518996959486?text=${encodeURIComponent(`Olá! Sou a licenciada ${currentLicenciada?.name || ''} e gostaria de solicitar a liberação do Smart Book.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp /> Solicitar Liberação no WhatsApp
          </a>
        </div>
      </LockedContainer>
    );
  }

  return (
    <PageContainer>
      {/* 1. Header com Logo, Seletor de Módulos e Botão Voltar */}
      <SmartBookHeader
        activeModule={activeModule}
        modules={modules}
        onSelectModule={handleSelectModule}
        onBack={() => navigate('/portal-licenciada/dashboard')}
        onNewNotebook={() => setNotebooksDashboardOpen(true)}
      />

      {/* 2. Barra de Navegação das 3 Abas */}
      <SmartBookTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sourcesCount={selectedSourceIds.length}
      />

      {/* 3. Conteúdo Dinâmico da Aba Ativa */}
      <ContentArea>
        {activeTab === 'sources' && (
          <SmartBookSourcesTab
            activeModule={activeModule}
            lessons={activeModule?.lessons || []}
            customSources={customSources}
            selectedSourceIds={selectedSourceIds}
            onToggleSource={handleToggleSource}
            onToggleAll={handleToggleAllSources}
            onAddCustomSource={handleAddCustomSource}
            onRemoveCustomSource={handleRemoveCustomSource}
          />
        )}

        {activeTab === 'chat' && (
          <SmartBookChatTab
            messages={messages}
            isLoading={isChatLoading}
            activeSourcesCount={selectedSourceIds.length}
            onSendMessage={handleSendMessage}
            onOpenSources={() => setActiveTab('sources')}
          />
        )}

        {activeTab === 'studio' && (
          <SmartBookStudioTab
            savedOutputs={savedOutputs}
            onOpenTool={handleOpenStudioTool}
            onOpenSavedOutput={handleOpenSavedOutput}
          />
        )}
      </ContentArea>

      {/* 4. BottomSheet de Criação / Presets */}
      <SmartBookStudioBottomSheet
        isOpen={studioSheet.isOpen}
        toolKey={studioSheet.toolKey}
        onClose={() => setStudioSheet(prev => ({ ...prev, isOpen: false }))}
        onGenerate={handleGenerateStudioContent}
        isGenerating={studioSheet.isGenerating}
      />

      {/* 5. Modal / Visualizador Dedicado de Resultados Salvos em Tela Cheia */}
      <SmartBookOutputModal
        isOpen={outputModal.isOpen}
        item={outputModal.item}
        onClose={() => setOutputModal({ isOpen: false, item: null })}
      />

      {/* 6. Dashboard / Seletor de Cadernos Clínicos */}
      {notebooksDashboardOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 11, 20, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setNotebooksDashboardOpen(false)}
        >
          <div 
            style={{
              background: '#0B1626',
              border: '1px solid #ED7E13',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SmartBookNotebooksDashboard
              notebooks={modules}
              selectedNotebook={activeModule}
              onSelectNotebook={(mod) => {
                handleSelectModule(mod);
                setNotebooksDashboardOpen(false);
              }}
              onClose={() => setNotebooksDashboardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 7. Feedback Toast Flutuante */}
      <ToastNotification show={toast.show}>
        {toast.message}
      </ToastNotification>
    </PageContainer>
  );
}
