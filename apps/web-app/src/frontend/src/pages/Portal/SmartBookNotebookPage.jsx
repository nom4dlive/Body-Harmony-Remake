import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { smartbookMultiTenancyApi } from '../../services/api';
import SmartBookAudioPlayer from '../../components/SmartBook/SmartBookAudioPlayer';
import SmartBookFlashcardsRunner from '../../components/SmartBook/SmartBookFlashcardsRunner';
import InteractiveQuizRunner from '../../components/SmartBook/InteractiveQuizRunner';
import SmartBookInteractiveMindMap from '../../components/SmartBook/SmartBookInteractiveMindMap';
import SmartBookPresentationViewer from '../../components/SmartBook/SmartBookPresentationViewer';

const Container = styled.div`
  min-height: 100vh;
  background: #06192a;
  color: #ffffff;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 62, 96, 0.4);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(237, 126, 19, 0.2);
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  background: rgba(237, 126, 19, 0.15);
  color: #ED7E13;
  border: 1px solid rgba(237, 126, 19, 0.35);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TabsNav = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(10, 62, 96, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.35rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ED7E13, #b85e09)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#94a3b8'};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #ffffff;
    background: ${props => props.$active ? 'linear-gradient(135deg, #ED7E13, #b85e09)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const MainCard = styled.div`
  background: rgba(10, 62, 96, 0.25);
  border: 1px solid rgba(237, 126, 19, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  min-height: 520px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

/* CHAT STYLES */
const ChatMessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
  margin-bottom: 1.5rem;
  max-height: 480px;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.85rem 1.15rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.$role === 'user' ? 'linear-gradient(135deg, #0A3E60, #062338)' : 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid ${props => props.$role === 'user' ? 'rgba(237, 126, 19, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$role === 'user' ? '#ffffff' : '#f1f5f9'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    max-width: 92%;
  }
`;

const SenderName = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.$role === 'user' ? '#ED7E13' : '#38bdf8'};
  margin-bottom: 0.25rem;
`;

const ChatInputContainer = styled.form`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(237, 126, 19, 0.3);
  padding: 0.5rem;
  border-radius: 0.75rem;
`;

const ChatInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  outline: none;

  &::placeholder {
    color: #64748b;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #ED7E13, #d96f0b);
  border: none;
  color: #ffffff;
  font-weight: 700;
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* STUDIO STYLES */
const StudioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ToolCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(237, 126, 19, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-2px);
    border-color: #ED7E13;
    background: rgba(237, 126, 19, 0.08);
  }
`;

const ToolTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ED7E13;
  margin: 0 0 0.5rem 0;
`;

const ToolDesc = styled.p`
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const GenerateBtn = styled.button`
  background: rgba(237, 126, 19, 0.15);
  border: 1px solid rgba(237, 126, 19, 0.4);
  color: #ED7E13;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    background: #ED7E13;
    color: #ffffff;
  }
`;

const GallerySection = styled.div`
  margin-top: 1rem;
`;

const GalleryTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default function SmartBookNotebookPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
  const user = authData.user || { id: 'licenciada_default', name: 'Licenciada' };

  const [activeTab, setActiveTab] = useState('chat');
  const [instance, setInstance] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatBottomRef = useRef(null);

  // Studio State
  const [studioItems, setStudioItems] = useState([]);
  const [generatingTool, setGeneratingTool] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState(null);

  useEffect(() => {
    loadInstanceData();
  }, [instanceId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadInstanceData = async () => {
    try {
      setLoading(true);
      const data = await smartbookMultiTenancyApi.getInstanceDetails(instanceId, user.id);
      setInstance(data.instance);
      setSources(data.sources || []);

      // Carrega chat e studio iniciais
      const chatHist = await smartbookMultiTenancyApi.getChatHistory(instanceId, user.id);
      setMessages(chatHist || []);

      const studioList = await smartbookMultiTenancyApi.listStudioContent(instanceId, user.id);
      setStudioItems(studioList || []);
    } catch (err) {
      console.error('Erro ao carregar dados do caderno:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setSendingMessage(true);

    // Otimista
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await smartbookMultiTenancyApi.sendChatMessage(instanceId, user.id, content, true);
      if (res.assistant_message) {
        setMessages(prev => [...prev, res.assistant_message]);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleGenerateTool = async (toolKey, toolLabel) => {
    setGeneratingTool(toolKey);
    try {
      const res = await smartbookMultiTenancyApi.generateStudioContent(
        instanceId,
        user.id,
        toolKey,
        '',
        toolLabel
      );
      setStudioItems(prev => [res, ...prev]);
      setSelectedOutput(res);
    } catch (err) {
      console.error('Erro ao gerar material no studio:', err);
    } finally {
      setGeneratingTool(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#ED7E13' }}>
          ✨ Carregando seu Caderno Privado...
        </div>
      </Container>
    );
  }

  const TOOLS = [
    { key: 'mindmap', label: '🧠 Mapa Mental', desc: 'Estrutura conceitual e biofísica de 4 níveis.' },
    { key: 'audio', label: '🎙️ Resumo em Áudio', desc: 'Podcast sintetizado com voz neural fluida.' },
    { key: 'flashcards', label: '📇 Flashcards', desc: 'Repetição espaçada com flip cards 3D.' },
    { key: 'quiz', label: '📝 Simulado Clínico', desc: 'Questões com gabarito e justificativa.' },
    { key: 'slides', label: '📊 Apresentação', desc: 'Slides em formato executivo Reveal.js.' },
    { key: 'video', label: '🎬 Roteiro de Vídeo', desc: 'Cenas cronometradas para capacitação.' },
    { key: 'report', label: '📑 Relatório Completo', desc: 'Guia analítico com resumo e condutas.' },
    { key: 'datatable', label: '📈 Tabela Comparativa', desc: 'Matriz comparativa de parâmetros.' }
  ];

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/portal-licenciada/smartbook')}>
            ← Meus Cadernos
          </BackButton>
          <div>
            <Title>
              📘 {instance?.title || 'Caderno SmartBook'}
            </Title>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Espaço Privado de <strong style={{ color: '#ED7E13' }}>{user.name || 'Dra. Licenciada'}</strong>
            </div>
          </div>
        </HeaderLeft>
        <Badge>🔒 100% Isolado & Privado</Badge>
      </Header>

      <TabsNav>
        <TabButton $active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
          💬 Chat com Dra. Harmony
        </TabButton>
        <TabButton $active={activeTab === 'studio'} onClick={() => setActiveTab('studio')}>
          🎨 SmartBook Studio ({studioItems.length})
        </TabButton>
        <TabButton $active={activeTab === 'sources'} onClick={() => setActiveTab('sources')}>
          📄 Fontes & Aulas ({sources.length})
        </TabButton>
      </TabsNav>

      <MainCard>
        {/* TAB 1: CHAT */}
        {activeTab === 'chat' && (
          <>
            <ChatMessagesList>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', margin: 'auto' }}>
                  👋 Olá! Eu sou a <strong>Dra. Harmony AI</strong>.<br />
                  Tire dúvidas sobre os protocolos e aulas deste caderno em total privacidade.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <MessageBubble key={m.id || idx} $role={m.role}>
                    <SenderName $role={m.role}>
                      {m.role === 'user' ? 'Você' : 'Dra. Harmony AI'}
                    </SenderName>
                    <div>{m.content}</div>
                  </MessageBubble>
                ))
              )}
              {sendingMessage && (
                <MessageBubble $role="assistant" style={{ opacity: 0.7 }}>
                  <SenderName $role="assistant">Dra. Harmony AI</SenderName>
                  <div>✨ Consultando fontes e gerando resposta clínica...</div>
                </MessageBubble>
              )}
              <div ref={chatBottomRef} />
            </ChatMessagesList>

            <ChatInputContainer onSubmit={handleSendMessage}>
              <ChatInput
                type="text"
                placeholder="Pergunte sobre parâmetros, condutas ou fisiologia deste caderno..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <SendButton type="submit" disabled={!inputMessage.trim() || sendingMessage}>
                Enviar
              </SendButton>
            </ChatInputContainer>
          </>
        )}

        {/* TAB 2: STUDIO */}
        {activeTab === 'studio' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem' }}>
              ⚡ Ferramentas de Transformação
            </h2>
            <StudioGrid>
              {TOOLS.map((tool) => (
                <ToolCard key={tool.key} onClick={() => handleGenerateTool(tool.key, tool.label)}>
                  <div>
                    <ToolTitle>{tool.label}</ToolTitle>
                    <ToolDesc>{tool.desc}</ToolDesc>
                  </div>
                  <GenerateBtn disabled={generatingTool === tool.key}>
                    {generatingTool === tool.key ? '⏳ Gerando...' : '⚡ Gerar'}
                  </GenerateBtn>
                </ToolCard>
              ))}
            </StudioGrid>

            <GallerySection>
              <GalleryTitle>📂 Meus Materiais Gerados ({studioItems.length})</GalleryTitle>
              {studioItems.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Nenhum material gerado ainda. Clique em uma das ferramentas acima para criar seu primeiro resumo.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {studioItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ED7E13' }}>{item.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                          ({item.type})
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOutput(item)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ED7E13',
                          color: '#ED7E13',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.4rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Visualizar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </GallerySection>
          </div>
        )}

        {/* TAB 3: FONTES & AULAS */}
        {activeTab === 'sources' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem' }}>
              📚 Fontes e Aulas deste Caderno
            </h2>
            {sources.length === 0 ? (
              <div style={{ color: '#64748b' }}>Nenhuma fonte catalogada para este caderno template.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sources.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '0.5rem',
                      padding: '1rem'
                    }}
                  >
                    <strong style={{ color: '#38bdf8' }}>{s.title || `Aula #${idx + 1}`}</strong>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.4rem 0 0 0' }}>
                      {s.content ? `${s.content.substring(0, 200)}...` : 'Transcrição e parâmetros clínicos indexados.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </MainCard>

      {/* Visualizador Modal para materiais selecionados */}
      {selectedOutput && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#0a233a',
              border: '1px solid #ED7E13',
              borderRadius: '1rem',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#ED7E13' }}>{selectedOutput.title}</h2>
              <button
                onClick={() => setSelectedOutput(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {selectedOutput.type === 'audio' && (
              <SmartBookAudioPlayer audioUrl={selectedOutput.file_url} title={selectedOutput.title} />
            )}

            {selectedOutput.type === 'mindmap' && (
              <SmartBookInteractiveMindMap treeData={typeof selectedOutput.result === 'string' ? JSON.parse(selectedOutput.result || '{}') : selectedOutput.result} />
            )}

            {selectedOutput.type === 'slides' && (
              <SmartBookPresentationViewer markdownContent={selectedOutput.result} />
            )}

            {selectedOutput.type !== 'audio' && selectedOutput.type !== 'mindmap' && selectedOutput.type !== 'slides' && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedOutput.result}
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
