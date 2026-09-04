import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBrain, FaPaperPlane, FaPodcast, FaBookOpen, FaCoins,
  FaRobot, FaUser, FaCheck, FaPlay, FaPause, FaClock,
  FaFilePdf, FaLightbulb, FaSpinner, FaMicrophone, FaExternalLinkAlt,
  FaColumns, FaLayerGroup, FaRedo, FaProjectDiagram, FaQuestionCircle,
  FaBook, FaHistory, FaSpellCheck, FaSyncAlt, FaWhatsapp
} from 'react-icons/fa';
import { lmsNotebookApi } from '../services/api';
import { useLicenciadaAuth } from '../context/LicenciadaAuthContext';
import MermaidViewer from './SmartBook/MermaidViewer';
import DrillDownMindMapViewer from './SmartBook/DrillDownMindMapViewer';
import StoriesProtocolViewer from './SmartBook/StoriesProtocolViewer';
import TinderFlashcardDeck from './SmartBook/TinderFlashcardDeck';
import InteractiveQuizRunner from './SmartBook/InteractiveQuizRunner';
import StudyGuideViewer from './SmartBook/StudyGuideViewer';

// --- STYLED COMPONENTS (LUXURY NAVY & GOLD) ---
const EmbedWrapper = styled.div`
  width: 100%;
  min-height: 720px;
  background: #051A29;
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: 'Poppins', sans-serif;
  color: #FFFFFF;
`;

const TopBar = styled.div`
  background: linear-gradient(90deg, #0A3E60 0%, #051A29 100%);
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(237, 126, 19, 0.25);
  flex-wrap: wrap;
  gap: 0.75rem;

  .brand-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(237, 126, 19, 0.2);
      color: #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      span.badge {
        background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
        color: #FFFFFF;
        font-size: 0.65rem;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        font-weight: 800;
      }
    }
  }

  .actions-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .view-toggle {
    display: flex;
    background: rgba(5, 26, 41, 0.8);
    padding: 0.25rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    gap: 0.3rem;

    button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;

      &.active {
        background: #ED7E13;
        color: #FFFFFF;
      }
    }
  }

  .credits-pill {
    background: rgba(237, 126, 19, 0.15);
    border: 1px solid rgba(237, 126, 19, 0.4);
    padding: 0.35rem 0.8rem;
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #ED7E13;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

/* ── 1-CLICK ACTION BAR ── */
const QuickActionBar = styled.div`
  background: rgba(10, 62, 96, 0.35);
  border-bottom: 1px solid rgba(237, 126, 19, 0.25);
  padding: 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;

  .label-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #ED7E13;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 0.4rem;
    white-space: nowrap;
  }
`;

const QuickActionBtn = styled.button`
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%)' : 'rgba(5, 26, 41, 0.8)'};
  border: 1px solid ${({ $active }) => $active ? '#ED7E13' : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#CBD5E1'};
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => $active ? '0 2px 10px rgba(237, 126, 19, 0.35)' : 'none'};

  &:hover {
    background: ${({ $active }) => $active ? 'linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%)' : 'rgba(237, 126, 19, 0.15)'};
    color: #FFFFFF;
    border-color: #ED7E13;
    transform: translateY(-1px);
  }

  &.chat-tab {
    margin-left: auto;
    background: ${({ $active }) => $active ? 'linear-gradient(135deg, #316B9C 0%, #0A3E60 100%)' : 'rgba(10, 62, 96, 0.4)'};
    border-color: ${({ $active }) => $active ? '#60A5FA' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const SubTabsNav = styled.div`
  display: flex;
  background: rgba(5, 26, 41, 0.95);
  padding: 0.4rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 0.5rem;
  overflow-x: auto;

  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    transition: all 0.2s ease;
    white-space: nowrap;

    &.active {
      background: rgba(237, 126, 19, 0.2);
      color: #ED7E13;
      border: 1px solid rgba(237, 126, 19, 0.4);
    }

    &:hover:not(.active) {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.05);
    }
  }
`;

const ContentBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  overflow: hidden;
  background: #051A29;
  position: relative;
`;

const ToolContentContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 650px;
`;

const ToolStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 62, 96, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
  color: #94A3B8;

  .status-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #FFFFFF;
    strong { color: #ED7E13; }
  }

  .refresh-btn {
    background: transparent;
    border: 1px solid rgba(237, 126, 19, 0.3);
    color: #ED7E13;
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(237, 126, 19, 0.2);
      color: #FFFFFF;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const LoadingStateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
  color: #FFFFFF;

  .spinner {
    font-size: 2.2rem;
    color: #ED7E13;
    animation: spin 1s linear infinite;
  }

  h4 { margin: 0; font-size: 1.15rem; font-weight: 700; }
  p { margin: 0; color: #94A3B8; font-size: 0.88rem; max-width: 420px; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #051A29;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  }
`;

// --- CHAT COMPONENTS ---
const ChatMessagesList = styled.div`
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
`;

const ChatBubble = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  max-width: 85%;

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: ${({ $isUser }) => $isUser ? '#316B9C' : '#ED7E13'};
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .bubble-content {
    background: ${({ $isUser }) => $isUser ? 'linear-gradient(135deg, #0A3E60 0%, #316B9C 100%)' : 'rgba(10, 62, 96, 0.35)'};
    border: 1px solid ${({ $isUser }) => $isUser ? 'rgba(49, 107, 156, 0.4)' : 'rgba(237, 126, 19, 0.25)'};
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: #FFFFFF;
    white-space: pre-wrap;

    .references {
      margin-top: 0.75rem;
      padding-top: 0.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      .ref-tag {
        font-size: 0.75rem;
        color: #ED7E13;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
    }
  }
`;

const SuggestionsBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(5, 26, 41, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;

  button {
    background: rgba(237, 126, 19, 0.08);
    border: 1px solid rgba(237, 126, 19, 0.25);
    color: #ED7E13;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      background: rgba(237, 126, 19, 0.2);
      transform: translateY(-1px);
    }
  }
`;

const ChatInputArea = styled.form`
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  background: rgba(5, 26, 41, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  input {
    flex: 1;
    background: rgba(10, 62, 96, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.65rem 1rem;
    color: #FFFFFF;
    font-size: 0.88rem;
    outline: none;

    &:focus {
      border-color: #ED7E13;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  button {
    background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
    border: none;
    border-radius: 8px;
    padding: 0 1.25rem;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: transform 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export default function AiNotebookEmbed({
  moduleId = 1,
  moduleTitle = 'Módulo 1: Fundamentos de Eletroestimulação',
  onSeek = null
}) {
  const { student, licenciada } = useLicenciadaAuth();
  const currentLicenciada = student || licenciada;

  const [viewMode, setViewMode] = useState('native'); // native | 3column
  const [activeTab, setActiveTab] = useState('tools'); // tools | chat | podcasts | sources
  const [activeTool, setActiveTool] = useState('mapa_mental_clinico'); // mapa_mental_clinico | quiz_simulado_alunas | guia_estudos_completo | linha_tempo_tratamento | glossario_eletroterapia
  
  // Transformações & Cache
  const [artifacts, setArtifacts] = useState({});
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);
  const [generatingTool, setGeneratingTool] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);

  // Chat States
  const [remainingCredits, setRemainingCredits] = useState(100);
  const [quotaExceededInfo, setQuotaExceededInfo] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Olá! Sou a Dra. Harmony AI, sua tutora clínica oficial.
Estou pronta para responder qualquer dúvida sobre os protocolos, parâmetros e fisiologia das aulas do ${moduleTitle}.

Você também pode utilizar a Barra de Ações Rápidas acima para gerar Mapas Mentais, Quizzes e Guias de Estudo em 1 clique!`,
      references: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Podcasts States
  const [podcasts, setPodcasts] = useState([
    {
      id: 'p1',
      title: 'Resumo Clínico: Cronaxia Muscular e Parâmetros Hz',
      duration: '05:42',
      summary: 'Revisão dos parâmetros ideais de frequência e recrutamento de fibras do Tipo IIb para hipertrofia e definição corporal.'
    }
  ]);
  const [newTopic, setNewTopic] = useState('');
  const [generatingPodcast, setGeneratingPodcast] = useState(false);

  // Renderizador de timestamps clicáveis [MM:SS]
  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\d{1,2}:\d{2}\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d{1,2}):(\d{2})\]$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const totalSeconds = minutes * 60 + seconds;
        return (
          <span
            key={index}
            onClick={() => onSeek && onSeek(totalSeconds)}
            title={onSeek ? `Pular vídeo para ${match[1]}:${match[2]}` : `Minutagem ${match[1]}:${match[2]}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'rgba(237, 126, 19, 0.25)',
              color: '#ED7E13',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontWeight: 700,
              cursor: onSeek ? 'pointer' : 'default',
              margin: '0 0.2rem',
              border: '1px solid rgba(237, 126, 19, 0.4)'
            }}
          >
            <FaPlay style={{ fontSize: '0.55rem' }} /> {part}
          </span>
        );
      }
      return part;
    });
  };

  // Open Notebook 3-Colunas URL
  const openNotebookUrl = `https://notebook.bodyharmony.com.br/?notebook=bh-mod-${moduleId}&theme=luxury-navy-gold`;

  // Carregar artefatos em cache ao trocar de módulo
  useEffect(() => {
    const fetchArtifacts = async () => {
      setLoadingArtifacts(true);
      try {
        const res = await lmsNotebookApi.getModuleArtifacts(moduleId);
        if (res && res.success && res.artifacts) {
          setArtifacts(res.artifacts);
        } else {
          setArtifacts({});
        }
      } catch (err) {
        console.warn('[AiNotebookEmbed] Failed to load artifacts cache:', err);
      } finally {
        setLoadingArtifacts(false);
      }
    };

    fetchArtifacts();
  }, [moduleId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Executar ferramenta de 1-clique
  const handleTriggerTool = async (toolKey, forceRefresh = false) => {
    setActiveTab('tools');
    setActiveTool(toolKey);

    // Se já estiver em cache e não for refresh forçado, não precisa fazer nova requisição
    if (artifacts[toolKey]?.content_markdown && !forceRefresh) {
      return;
    }

    setGeneratingTool(true);
    try {
      const res = await lmsNotebookApi.executeTransformation(
        moduleId,
        toolKey,
        forceRefresh,
        currentLicenciada?.id
      );

      if (res && res.success) {
        setArtifacts(prev => ({
          ...prev,
          [toolKey]: {
            title: res.title,
            content_markdown: res.content_markdown,
            content_json: res.content_json,
            updated_at: res.updated_at,
            cached: res.cached
          }
        }));
      }
    } catch (err) {
      alert('Erro ao gerar material com a Dra. Harmony AI: ' + (err.message || 'Tente novamente.'));
    } finally {
      setGeneratingTool(false);
    }
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || sending) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      references: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await lmsNotebookApi.sendChatMessage(moduleId, textToSend, messages, currentLicenciada?.id);
      if (res?.credits_remaining !== undefined) {
        setRemainingCredits(res.credits_remaining);
      }
      if (res?.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: res.reply,
            references: res.references || [],
            timestamps: res.timestamps || []
          }
        ]);
        setQuotaExceededInfo(null);
      }
    } catch (err) {
      if (err?.quota_exceeded || err?.message?.includes('Limite diário') || err?.status === 429) {
        setQuotaExceededInfo({
          daily_limit: err.daily_limit || 100,
          today_spent: err.today_spent || 100,
          whatsapp_url: err.whatsapp_url || 'https://wa.me/5511999999999'
        });
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: '⚠️ Limite diário de créditos de IA atingido. Você pode solicitar uma recarga antecipada para a coordenação pedagógica.',
            isQuotaWarning: true,
            whatsapp_url: err.whatsapp_url
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: err.message || 'Desculpe, ocorreu uma oscilação na resposta clínica. Por favor, tente novamente.',
            references: []
          }
        ]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePodcast = async (e) => {
    e.preventDefault();
    if (!newTopic.trim() || generatingPodcast) return;

    setGeneratingPodcast(true);
    try {
      const res = await lmsNotebookApi.generatePodcast(moduleId, newTopic, currentLicenciada?.id);
      if (res?.podcast) {
        setPodcasts(prev => [
          {
            id: res.podcast.id,
            title: res.podcast.title,
            duration: res.podcast.duration,
            summary: res.podcast.transcript_summary
          },
          ...prev
        ]);
        setNewTopic('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPodcast(false);
    }
  };

  const currentArtifact = artifacts[activeTool];

  return (
    <EmbedWrapper>
      {/* Top Header */}
      <TopBar>
        <div className="brand-block">
          <div className="icon-box"><FaBrain /></div>
          <div>
            <h4>
              Smart Book & Central Pedagógica
              <span className="badge">DRA. HARMONY AI</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              {moduleTitle}
            </span>
          </div>
        </div>

        <div className="actions-block">
          <div className="view-toggle">
            <button
              className={viewMode === 'native' ? 'active' : ''}
              onClick={() => setViewMode('native')}
            >
              <FaRobot /> Ferramentas & Chat
            </button>
            <button
              className={viewMode === '3column' ? 'active' : ''}
              onClick={() => setViewMode('3column')}
            >
              <FaColumns /> Open Notebook (3-Colunas)
            </button>
          </div>

          <a
            href={openNotebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
            title="Abrir Open Notebook em tela cheia"
          >
            <FaExternalLinkAlt />
          </a>

          <div className="credits-pill" style={{ color: remainingCredits <= 10 ? '#EF4444' : '#ED7E13', borderColor: remainingCredits <= 10 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(237, 126, 19, 0.3)' }}>
            <FaCoins /> {remainingCredits} 🪙 Créditos
          </div>
        </div>
      </TopBar>

      {/* MODO OPEN NOTEBOOK 3-COLUNAS */}
      {viewMode === '3column' ? (
        <ContentBody style={{ height: '650px' }}>
          <IframeContainer>
            <iframe
              src={openNotebookUrl}
              title="Open Notebook 3-Colunas"
              allow="autoplay; clipboard-write; encrypted-media"
            />
          </IframeContainer>
        </ContentBody>
      ) : (
        /* MODO NATIVO COM 1-CLIQUE */
        <>
          {/* BARRA DE AÇÕES RÁPIDAS DE 1-CLIQUE */}
          <QuickActionBar>
            <div className="label-group">
              <FaLightbulb />
              <span>Ações 1-Clique:</span>
            </div>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'mapa_mental_clinico'}
              onClick={() => handleTriggerTool('mapa_mental_clinico')}
            >
              🧠 Mapa Mental
            </QuickActionBtn>

            <QuickActionBtn
              style={{ background: 'rgba(237, 126, 19, 0.25)', borderColor: '#ED7E13', color: '#ED7E13' }}
              onClick={() => setShowStoriesModal(true)}
            >
              ⏱️ Stories 15s
            </QuickActionBtn>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'tinder_flashcards'}
              onClick={() => { setActiveTab('tools'); setActiveTool('tinder_flashcards'); }}
            >
              🃏 Flashcards
            </QuickActionBtn>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'quiz_simulado_alunas'}
              onClick={() => handleTriggerTool('quiz_simulado_alunas')}
            >
              📝 Simulado & Quiz
            </QuickActionBtn>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'guia_estudos_completo'}
              onClick={() => handleTriggerTool('guia_estudos_completo')}
            >
              📖 Guia de Estudos
            </QuickActionBtn>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'linha_tempo_tratamento'}
              onClick={() => handleTriggerTool('linha_tempo_tratamento')}
            >
              ⏳ Linha do Tempo
            </QuickActionBtn>

            <QuickActionBtn
              $active={activeTab === 'tools' && activeTool === 'glossario_eletroterapia'}
              onClick={() => handleTriggerTool('glossario_eletroterapia')}
            >
              📚 Glossário
            </QuickActionBtn>

            <QuickActionBtn
              className="chat-tab"
              $active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat RAG
            </QuickActionBtn>
          </QuickActionBar>

          {/* SUB TABS NATIVAS */}
          <SubTabsNav>
            <button className={activeTab === 'tools' ? 'active' : ''} onClick={() => setActiveTab('tools')}>
              <FaLayerGroup /> Material Selecionado
            </button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
              <FaRobot /> Tutor Clínico RAG
            </button>
            <button className={activeTab === 'podcasts' ? 'active' : ''} onClick={() => setActiveTab('podcasts')}>
              <FaPodcast /> Estúdio de Podcasts ({podcasts.length})
            </button>
          </SubTabsNav>

          <ContentBody>
            {/* ABA 1: FERRAMENTAS CLÍNICAS (1-CLIQUE) */}
            {activeTab === 'tools' && (
              <ToolContentContainer>
                <ToolStatusBar>
                  <div className="status-info">
                    <span>Recurso Ativo: <strong>{currentArtifact?.title || 'Material Clínico'}</strong></span>
                    {currentArtifact?.updated_at && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        • Salvo em cache ({new Date(currentArtifact.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>

                  <button
                    className="refresh-btn"
                    onClick={() => handleTriggerTool(activeTool, true)}
                    disabled={generatingTool}
                  >
                    <FaSyncAlt className={generatingTool ? 'fa-spin' : ''} />
                    {generatingTool ? 'Gerando...' : '🔄 Gerar Nova Versão'}
                  </button>
                </ToolStatusBar>

                {generatingTool ? (
                  <LoadingStateBox>
                    <FaSpinner className="spinner" />
                    <h4>A Dra. Harmony AI está compilando este material...</h4>
                    <p>Analisando todas as aulas e parâmetros clínicos deste módulo para estruturar o melhor conteúdo para você.</p>
                  </LoadingStateBox>
                ) : !currentArtifact?.content_markdown ? (
                  <LoadingStateBox>
                    <FaLightbulb style={{ fontSize: '2.5rem', color: '#ED7E13' }} />
                    <h4>Pronto para gerar este material</h4>
                    <p>Clique no botão abaixo para que a Dra. Harmony AI processe as aulas deste módulo.</p>
                    <button
                      onClick={() => handleTriggerTool(activeTool, true)}
                      style={{ background: 'linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%)', border: 'none', borderRadius: '10px', padding: '0.8rem 1.8rem', color: '#FFF', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
                    >
                      ✨ Gerar {activeTool === 'mapa_mental_clinico' ? 'Mapa Mental' : activeTool === 'quiz_simulado_alunas' ? 'Simulado' : 'Material'} Agora
                    </button>
                  </LoadingStateBox>
                ) : (
                  <>
                    {activeTool === 'mapa_mental_clinico' && (
                      <DrillDownMindMapViewer
                        chartCode={currentArtifact.content_markdown}
                        title={currentArtifact.title}
                        onAskAi={(q) => {
                          setActiveTab('chat');
                          handleSendMessage(q);
                        }}
                      />
                    )}

                    {activeTool === 'tinder_flashcards' && (
                      <TinderFlashcardDeck
                        onAskAi={(q) => {
                          setActiveTab('chat');
                          handleSendMessage(q);
                        }}
                      />
                    )}

                    {activeTool === 'quiz_simulado_alunas' && (
                      <InteractiveQuizRunner markdownText={currentArtifact.content_markdown} />
                    )}

                    {activeTool === 'guia_estudos_completo' && (
                      <StudyGuideViewer title={currentArtifact.title} markdownContent={currentArtifact.content_markdown} type="guide" />
                    )}

                    {activeTool === 'linha_tempo_tratamento' && (
                      <StudyGuideViewer title={currentArtifact.title} markdownContent={currentArtifact.content_markdown} type="timeline" />
                    )}

                    {activeTool === 'glossario_eletroterapia' && (
                      <StudyGuideViewer title={currentArtifact.title} markdownContent={currentArtifact.content_markdown} type="glossary" />
                    )}
                  </>
                )}
              </ToolContentContainer>
            )}

            {/* MODAL DE STORIES 15s */}
            <AnimatePresence>
              {showStoriesModal && (
                <StoriesProtocolViewer
                  moduleTitle={moduleTitle}
                  onClose={() => setShowStoriesModal(false)}
                  onSeek={onSeek}
                  onAskAi={(q) => {
                    setActiveTab('chat');
                    handleSendMessage(q);
                  }}
                />
              )}
            </AnimatePresence>

            {/* ABA 2: CHAT RAG */}
            {activeTab === 'chat' && (
              <>
                <ChatMessagesList>
                  {messages.map(msg => (
                    <ChatBubble key={msg.id} $isUser={msg.sender === 'user'}>
                      <div className="avatar">
                        {msg.sender === 'user' ? <FaUser /> : <FaBrain />}
                      </div>
                      <div className="bubble-content">
                        {renderMessageContent(msg.text)}

                        {msg.isQuotaWarning && msg.whatsapp_url && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <a
                              href={msg.whatsapp_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: '#25D366', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
                            >
                              <FaWhatsapp style={{ fontSize: '1rem' }} /> Solicitar Recarga via WhatsApp
                            </a>
                          </div>
                        )}

                        {msg.references && msg.references.length > 0 && (
                          <div className="references">
                            {msg.references.map((ref, idx) => (
                              <div key={idx} className="ref-tag">
                                📖 Referência: {ref.lesson_title} (⏱ {ref.timestamp})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ChatBubble>
                  ))}

                  {quotaExceededInfo && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(5, 26, 41, 0.95) 100%)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1.25rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
                      <FaCoins style={{ fontSize: '1.8rem', color: '#ED7E13' }} />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#FFFFFF', fontSize: '1rem', fontWeight: 800 }}>
                          Limite Diário de Créditos Atingido ({quotaExceededInfo.today_spent}/{quotaExceededInfo.daily_limit} 🪙)
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', maxWidth: '420px' }}>
                          Sua cota diária de interações com a Dra. Harmony AI será renovada automaticamente amanhã. Caso precise de mais créditos imediatamente para seus estudos, solicite à coordenação:
                        </p>
                      </div>
                      <a
                        href={quotaExceededInfo.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#25D366', color: '#FFFFFF', padding: '0.65rem 1.3rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}
                      >
                        <FaWhatsapp style={{ fontSize: '1.1rem' }} /> Solicitar Recarga no WhatsApp da Coordenação
                      </a>
                    </div>
                  )}

                  {sending && (
                    <ChatBubble $isUser={false}>
                      <div className="avatar"><FaBrain /></div>
                      <div className="bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaSpinner className="fa-spin" /> Consultando base clínica do módulo...
                      </div>
                    </ChatBubble>
                  )}
                  <div ref={messagesEndRef} />
                </ChatMessagesList>

                <SuggestionsBar>
                  <button onClick={() => handleSendMessage('Quais os parâmetros de Hz e Cronaxia para Glúteos?')}>
                    ✨ Parâmetros para Glúteos
                  </button>
                  <button onClick={() => handleSendMessage('Quais as contraindicações em pacientes com Próteses?')}>
                    ⚠️ Próteses e Contraindicações
                  </button>
                  <button onClick={() => handleSendMessage('Como associar com Enzimas Lipolíticas?')}>
                    💡 Associação com Enzimas
                  </button>
                </SuggestionsBar>

                <ChatInputArea onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
                  <input
                    type="text"
                    placeholder={quotaExceededInfo ? "Limite diário atingido. Solicite recarga via WhatsApp." : "Tire sua dúvida clínica sobre este módulo..."}
                    value={inputMessage}
                    disabled={!!quotaExceededInfo}
                    onChange={e => setInputMessage(e.target.value)}
                  />
                  <button type="submit" disabled={sending || !inputMessage.trim() || !!quotaExceededInfo}>
                    <FaPaperPlane /> Enviar
                  </button>
                </ChatInputArea>
              </>
            )}

            {/* ABA 3: PODCASTS */}
            {activeTab === 'podcasts' && (
              <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <form onSubmit={handleGeneratePodcast} style={{ background: 'rgba(10, 62, 96, 0.4)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(237, 126, 19, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ED7E13', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMicrophone /> Gerar Novo Resumo em Áudio com IA (10 🪙)
                  </h5>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Ex: Resumo de Fisiologia Muscular para Glúteos..."
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      style={{ flex: 1, background: 'rgba(5, 26, 41, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <button type="submit" disabled={generatingPodcast || !newTopic.trim()} style={{ background: 'linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%)', border: 'none', borderRadius: '8px', padding: '0 1.25rem', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      {generatingPodcast ? <FaSpinner className="fa-spin" /> : 'Gerar Áudio'}
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {podcasts.map(pod => (
                    <div key={pod.id} style={{ background: 'rgba(5, 26, 41, 0.7)', padding: '1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h6 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>{pod.title}</h6>
                        <span style={{ fontSize: '0.75rem', color: '#ED7E13', fontWeight: 700 }}>⏱ {pod.duration}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{pod.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ContentBody>
        </>
      )}
    </EmbedWrapper>
  );
}
