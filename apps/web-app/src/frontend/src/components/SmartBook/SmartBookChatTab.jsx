import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPaperPlane, FaPaperclip, FaCopy, FaCheck, FaBrain, FaUser, FaQuoteRight } from 'react-icons/fa';

const wave = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const MessagesScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 100px;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
`;

const WelcomeView = styled.div`
  padding: 16px 4px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .wave-emoji {
    font-size: 40px;
    margin-bottom: 12px;
    display: inline-block;
    animation: ${wave} 2s ease-in-out infinite;
  }

  .chat-title {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 10px;
    line-height: 1.25;
    background: linear-gradient(135deg, #E8EAED 0%, #ED7E13 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chat-description {
    font-size: 13px;
    line-height: 1.6;
    color: #9AA0A6;
    margin-bottom: 20px;
  }

  .chat-question {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #E8EAED;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const StarterOptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StarterOptionButton = styled.button`
  background: #11223A;
  border: 1px solid #1E3A5F;
  border-radius: 14px;
  padding: 12px 16px;
  min-height: 48px;
  color: #E8EAED;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ED7E13;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover, &:active {
    background: #1E3A5F;
    border-color: #ED7E13;
    transform: translateX(4px);
    color: #FFFFFF;

    &::before {
      opacity: 1;
    }
  }
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  align-items: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  animation: fadeIn 0.25s ease;

  .message-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 700;
    color: ${props => (props.isUser ? '#ED7E13' : '#9AA0A6')};
  }

  .bubble-content {
    background: ${props => (props.isUser ? 'linear-gradient(135deg, #1E3A5F 0%, #11223A 100%)' : '#0B1626')};
    border: 1px solid ${props => (props.isUser ? '#ED7E13' : '#1E3A5F')};
    color: #E8EAED;
    border-radius: ${props => (props.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
    padding: 12px 16px;
    font-size: 13px;
    line-height: 1.6;
    max-width: 90%;
    word-break: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    p { margin-bottom: 8px; }
    p:last-child { margin-bottom: 0; }

    strong {
      color: #ED7E13;
    }
  }

  .citations-box {
    margin-top: 8px;
    padding: 8px 12px;
    background: rgba(237, 126, 19, 0.08);
    border-left: 2px solid #ED7E13;
    border-radius: 4px;
    font-size: 11px;
    color: #9AA0A6;

    .citations-title {
      font-weight: 700;
      color: #ED7E13;
      margin-bottom: 2px;
    }
  }
`;

const FixedInputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(11, 22, 38, 0.98);
  backdrop-filter: blur(12px);
  padding: 10px 14px 14px;
  border-top: 1px solid #1E3A5F;
  z-index: 100;
`;

const InputContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #11223A;
  border: 1px solid #1E3A5F;
  border-radius: 24px;
  padding: 6px 12px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #ED7E13;
    box-shadow: 0 0 12px rgba(237, 126, 19, 0.25);
  }
`;

const ChatInputField = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #E8EAED;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  min-height: 40px;

  &::placeholder {
    color: #5F6B7A;
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const AttachBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #ED7E13;
  margin-right: 4px;
`;

const SendButton = styled.button`
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  border-radius: 50%;
  background: #ED7E13;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(237, 126, 19, 0.35);

  &:hover, &:active {
    background: #EA580C;
    transform: scale(1.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 13px;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ED7E13;
    animation: ${bounce} 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

export function SmartBookChatTab({
  messages = [],
  isLoading = false,
  activeSourcesCount = 0,
  onSendMessage,
  onOpenSources
}) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterClick = (promptText) => {
    setInputText(promptText);
  };

  return (
    <ChatContainer>
      <MessagesScrollArea ref={scrollRef}>
        {messages.length === 0 ? (
          <WelcomeView>
            <div className="wave-emoji">👋</div>
            <h1 className="chat-title">Vamos começar seu caderno...</h1>
            <p className="chat-description">
              Esta é sua tela em branco para entender, criar ou fazer progresso em algo novo. A Dra. Harmony AI está pronta para responder dúvidas clínicas baseando-se nas aulas deste módulo.
            </p>
            <h2 className="chat-question">O que você gostaria que este caderno te ajudasse a fazer?</h2>
            <StarterOptionsGrid>
              <StarterOptionButton onClick={() => handleStarterClick('Quais são os principais parâmetros de frequência e cronaxia abordados neste módulo?')}>
                Aprender sobre parâmetros e dosimetria
              </StarterOptionButton>
              <StarterOptionButton onClick={() => handleStarterClick('Como montar um protocolo de eletroestimulação glútea combinada com base nas aulas?')}>
                Criar um protocolo clínico personalizado
              </StarterOptionButton>
              <StarterOptionButton onClick={() => handleStarterClick('Quais são as principais contraindicações e cuidados na aplicação de eletrodos?')}>
                Revisar contraindicações e cuidados de segurança
              </StarterOptionButton>
            </StarterOptionsGrid>
          </WelcomeView>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} isUser={msg.role === 'user'}>
              <div className="message-header">
                {msg.role === 'user' ? (
                  <>
                    <FaUser size={10} />
                    <span>Você</span>
                  </>
                ) : (
                  <>
                    <FaBrain size={10} color="#ED7E13" />
                    <span style={{ color: '#ED7E13' }}>Dra. Harmony AI</span>
                  </>
                )}
              </div>
              <div className="bubble-content">
                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citations-box">
                    <div className="citations-title">Fontes Consultadas:</div>
                    <div>{msg.citations.join(' • ')}</div>
                  </div>
                )}
              </div>
            </MessageBubble>
          ))
        )}

        {isLoading && (
          <MessageBubble isUser={false}>
            <div className="message-header">
              <FaBrain size={10} color="#ED7E13" />
              <span style={{ color: '#ED7E13' }}>Dra. Harmony AI está digitando...</span>
            </div>
            <div className="bubble-content" style={{ padding: '4px 8px' }}>
              <LoadingDots>
                <span />
                <span />
                <span />
              </LoadingDots>
            </div>
          </MessageBubble>
        )}
      </MessagesScrollArea>

      <FixedInputArea>
        <InputContainer>
          <ChatInputField
            type="text"
            placeholder="Faça uma pergunta ou crie algo..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <InputActions>
            <button
              onClick={onOpenSources}
              style={{ background: 'transparent', border: 'none', color: '#9AA0A6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px' }}
              title="Gerenciar fontes de contexto"
            >
              <FaPaperclip size={13} />
              <AttachBadge>({activeSourcesCount})</AttachBadge>
            </button>
            <SendButton onClick={handleSend} disabled={isLoading || !inputText.trim()} title="Enviar mensagem">
              <FaPaperPlane />
            </SendButton>
          </InputActions>
        </InputContainer>
      </FixedInputArea>
    </ChatContainer>
  );
}
