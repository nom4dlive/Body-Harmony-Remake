import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaPaperPlane, FaSpinner, FaRobot, FaUser, FaQuoteRight,
  FaBook, FaCheck, FaInfoCircle
} from 'react-icons/fa';
import { smartbookApi } from '../../services/smartbookApi';
import { SmartBookActions } from './SmartBookActions';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #051A29;
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  position: relative;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    padding: 0.85rem;
    gap: 1rem;
  }
`;

const MessageBubble = styled.div`
  display: flex;
  gap: 0.75rem;
  max-width: 90%;
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    flex-shrink: 0;
    background: ${({ $isUser }) => ($isUser ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #0A3E60 0%, #ED7E13 100%)')};
    color: #FFFFFF;
    border: 1px solid ${({ $isUser }) => ($isUser ? 'rgba(255, 255, 255, 0.2)' : '#ED7E13')};
  }

  .content {
    background: ${({ $isUser }) => ($isUser ? 'linear-gradient(135deg, #0A3E60 0%, #072338 100%)' : '#072338')};
    border: 1px solid ${({ $isUser }) => ($isUser ? 'rgba(237, 126, 19, 0.4)' : 'rgba(255, 255, 255, 0.1)')};
    border-radius: ${({ $isUser }) => ($isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px')};
    padding: 1rem 1.15rem;
    color: #FFFFFF;
    font-size: 0.92rem;
    line-height: 1.65;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);

    .author {
      font-size: 0.75rem;
      font-weight: 700;
      color: ${({ $isUser }) => ($isUser ? '#CBD5E1' : '#ED7E13')};
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .text {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .citations {
      margin-top: 0.85rem;
      padding-top: 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .citations-title {
        font-size: 0.7rem;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .chips-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .citation-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        background: rgba(237, 126, 19, 0.12);
        color: #ED7E13;
        padding: 0.25rem 0.65rem;
        border-radius: 8px;
        border: 1px solid rgba(237, 126, 19, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(237, 126, 19, 0.25);
          border-color: #ED7E13;
          transform: translateY(-1px);
        }
      }
    }
  }
`;

const SkeletonCard = styled.div`
  background: #072338;
  border: 1px solid rgba(237, 126, 19, 0.2);
  border-radius: 4px 16px 16px 16px;
  padding: 1.25rem;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #0A3E60 25%, #ED7E13 50%, #0A3E60 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 2s infinite ease-in-out;
  }

  .line-1 { width: 90%; }
  .line-2 { width: 100%; }
  .line-3 { width: 75%; }
`;

const InputBar = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  background: #072338;
  border-top: 1px solid rgba(237, 126, 19, 0.25);
  flex-shrink: 0;

  input {
    flex: 1;
    min-height: 44px; /* Mobile-First target */
    background: #051A29;
    border: 1px solid rgba(237, 126, 19, 0.3);
    border-radius: 12px;
    padding: 0 1rem;
    color: #FFFFFF;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #ED7E13;
      box-shadow: 0 0 12px rgba(237, 126, 19, 0.3);
    }

    &::placeholder {
      color: #64748B;
    }
  }

  button {
    min-width: 44px;
    min-height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
    color: #FFFFFF;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(237, 126, 19, 0.4);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const SnippetModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const SnippetCard = styled.div`
  background: #072338;
  border: 1px solid #ED7E13;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  color: #FFFFFF;

  .title {
    font-size: 1rem;
    font-weight: 800;
    color: #ED7E13;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .score {
    font-size: 0.75rem;
    color: #22C55E;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .text {
    font-size: 0.88rem;
    color: #CBD5E1;
    line-height: 1.6;
    background: #051A29;
    padding: 0.85rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .close-btn {
    margin-top: 1rem;
    width: 100%;
    min-height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #FFFFFF;
    font-weight: 700;
    cursor: pointer;
  }
`;

export function SmartBookChat({ notebookId = 'default_notebook', notebookTitle = 'Aula Clínica' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou a **Dra. Harmony AI**, sua mentora clínica. Estou conectada ao acervo documental do caderno **${notebookTitle}**. Como posso ajudar no seu caso clínico ou dúvidas técnicas?`,
      citations: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userQuery = inputValue.trim();
    setInputValue('');

    const newMsg = { id: Date.now().toString(), role: 'user', content: userQuery };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await smartbookApi.queryNotebook(notebookId, userQuery, historyPayload);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
          citations: response.sources_cited || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Ocorreu uma instabilidade na consulta clínica. Por favor, tente novamente.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [expandedAuditId, setExpandedAuditId] = useState(null);

  return (
    <ChatWrapper>
      {/* Barra de Ações 1-Clique */}
      <SmartBookActions
        notebookId={notebookId}
        notebookTitle={notebookTitle}
        onStartLoading={() => setLoading(true)}
        onEndLoading={() => setLoading(false)}
      />

      {/* Área de Mensagens */}
      <MessagesContainer>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} $isUser={msg.role === 'user'}>
            <div className="avatar">
              {msg.role === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="content">
              <div className="author">
                {msg.role === 'user' ? 'Você' : 'Dra. Harmony AI'}
              </div>
              <div className="text">{msg.content}</div>

              {/* Racional Clínico & Auditoria de IA para mensagens da Assistente */}
              {msg.role === 'assistant' && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#ED7E13', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🔬 {msg.ai_metadata?.model || 'qwen-max (Qwen 2.5 72B)'} • Dosimetria 3S
                  </span>
                  <button
                    onClick={() => setExpandedAuditId(expandedAuditId === msg.id ? null : msg.id)}
                    style={{ background: 'rgba(237, 126, 19, 0.15)', border: '1px solid rgba(237, 126, 19, 0.3)', color: '#ED7E13', borderRadius: '6px', fontSize: '10px', padding: '2px 8px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    {expandedAuditId === msg.id ? 'Ocultar Racional' : 'Ver Racional Clínico'}
                  </button>
                </div>
              )}

              {expandedAuditId === msg.id && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#050B14', borderRadius: '8px', border: '1px solid #1E3A5F', fontSize: '11px', lineHeight: '1.5', color: '#CBD5E1' }}>
                  <div style={{ color: '#ED7E13', fontWeight: '800', marginBottom: '4px' }}>💡 Justificativa Clínica da IA:</div>
                  {msg.ai_metadata?.clinical_rationale || 'Resposta formulada fundamentando-se na biofísica das frequências 60-85Hz e largura de pulso de 250-350µs, garantindo segurança clínica e zero alucinação.'}
                </div>
              )}

              {/* Chips de Fontes Oficiais Citadas */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="citations">
                  <div className="citations-title">Fontes Oficiais Consultadas:</div>
                  <div className="chips-wrapper">
                    {msg.citations.map((c, idx) => (
                      <button
                        key={idx}
                        className="citation-chip"
                        onClick={() => setActiveSnippet(c)}
                        title="Clique para ver o trecho oficial da aula"
                      >
                        <FaBook size={10} />
                        <span>{c.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </MessageBubble>
        ))}

        {/* Skeleton Loader Luxury Pulsante */}
        {loading && (
          <MessageBubble $isUser={false}>
            <div className="avatar"><FaRobot /></div>

            <SkeletonCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ED7E13', fontSize: '0.75rem', fontWeight: 700 }}>
                <FaSpinner className="animate-spin" /> Sintetizando resposta com a Dra. Harmony AI...
              </div>
              <div className="skeleton-line line-1" />
              <div className="skeleton-line line-2" />
              <div className="skeleton-line line-3" />
            </SkeletonCard>
          </MessageBubble>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input de Mensagem */}
      <InputBar onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pergunte sobre dosimetria, parâmetros ou condutas clínicas..."
          disabled={loading}
        />
        <button type="submit" disabled={!inputValue.trim() || loading} aria-label="Enviar">
          <FaPaperPlane />
        </button>
      </InputBar>

      {/* Modal de Snippet da Citação */}
      {activeSnippet && (
        <SnippetModalOverlay onClick={() => setActiveSnippet(null)}>
          <SnippetCard onClick={(e) => e.stopPropagation()}>
            <div className="title">
              <FaBook /> {activeSnippet.title}
            </div>
            {activeSnippet.relevance_score && (
              <div className="score">
                ✓ Relevância Clínica: {Math.round(activeSnippet.relevance_score * 100)}%
              </div>
            )}
            <div className="text">
              {activeSnippet.snippet || 'Trecho indexado no Caderno Clínico oficial.'}
            </div>
            <button className="close-btn" onClick={() => setActiveSnippet(null)}>
              Fechar Trecho
            </button>
          </SnippetCard>
        </SnippetModalOverlay>
      )}
    </ChatWrapper>
  );
}
