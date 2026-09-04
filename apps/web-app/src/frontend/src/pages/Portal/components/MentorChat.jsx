import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRobot, FaRegCommentDots, FaPaperPlane, FaImage, FaHistory,
    FaChartPie, FaExclamationTriangle, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { api } from '../../../services/api';
import HarmonyActions from '../../../components/DoctorHarmony/HarmonyActions';

// --- Styled Components (Visual Identity V3) ---

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: ${props => props.$fullHeight ? 'calc(100vh - 120px)' : '100%'};
    background: ${props => props.$noBg ? 'transparent' : 'rgba(5, 26, 41, 0.8)'};
    backdrop-filter: ${props => props.$noBg ? 'none' : 'blur(20px)'};
    border-radius: ${props => props.$noBg ? '0' : '20px'};
    border: ${props => props.$noBg ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'};
    overflow: hidden;
    position: relative;
`;

const ChatHeader = styled.div`
    padding: 1.5rem;
    background: rgba(10, 62, 96, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .harmony-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .avatar {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #0A3E60, #0A3E60);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            box-shadow: 0 0 0px rgba(0, 0, 0, 0.3);
        }

        h2 {
            margin: 0;
            font-size: 1.2rem;
            color: #FFFFFF;
            letter-spacing: 1px;
            span { color: #ED7E13; }
        }
    }
`;

const CreditsWidget = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
    }
    .value {
        font-weight: bold;
        color: #ED7E13;
    }
`;

const MessageArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: radial-gradient(circle at bottom right, rgba(237, 126, 19, 0.03), transparent);

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
`;

const Message = styled(motion.div)`
    display: flex;
    gap: 0.8rem;
    align-self: ${props => props.$isAi ? 'flex-start' : 'flex-end'};
    flex-direction: ${props => props.$isAi ? 'row' : 'row-reverse'};
    max-width: 85%;

    .avatar-mini {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: ${props => props.$isAi ? 'linear-gradient(135deg, #0A3E60, #ED7E13)' : 'rgba(255, 255, 255, 0.1)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: white;
        flex-shrink: 0;
        margin-top: 4px;
        box-shadow: ${props => props.$isAi ? '0 4px 10px rgba(237, 126, 19, 0.2)' : 'none'};
    }

    .content {
        padding: 1rem 1.25rem;
        border-radius: ${props => props.$isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px'};
        background: ${props => props.$isAi
        ? 'rgba(255, 255, 255, 0.05)'
        : 'linear-gradient(135deg, rgba(237, 126, 19, 0.15), rgba(237, 126, 19, 0.05))'};
        backdrop-filter: blur(10px);
        border: 1px solid ${props => props.$isAi ? 'rgba(255, 255, 255, 0.1)' : 'rgba(237, 126, 19, 0.2)'};
        color: #E2E8F0;
        line-height: 1.6;
        font-size: 0.92rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        
        p { margin: 0 0 1rem 0; }
        p:last-child { margin-bottom: 0; }

        pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.85rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            overflow: hidden;
            
            th, td {
                padding: 0.8rem;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            th { 
                background: rgba(237, 126, 19, 0.1);
                color: #ED7E13;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            td { font-size: 0.85rem; }
        }
    }
`;

const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${props => props.$active ? '#ED7E13' : 'rgba(255, 255, 255, 0.4)'};
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.2rem;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.05);
        color: #ED7E13;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SendButton = styled(IconButton)`
    background: #ED7E13;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);

    &:hover:not(:disabled) {
        background: #F18F2F;
        color: white;
    }
`;

const InputSection = styled.div`
    padding: 1rem 1.5rem;
    background: rgba(10, 62, 96, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;

    .input-wrapper {
        display: flex;
        align-items: flex-end;
        gap: 0.8rem;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);

        textarea {
            flex: 1;
            background: transparent;
            border: none;
            color: white;
            padding: 0.6rem;
            font-size: 0.9rem;
            resize: none;
            max-height: 120px;
            font-family: inherit;
            
            &:focus { outline: none; }
        }
    }
`;

const PreviewImage = styled.div`
    position: absolute;
    bottom: 100%;
    left: 1.5rem;
    margin-bottom: 1rem;
    background: rgba(10, 62, 96, 0.8);
    backdrop-filter: blur(10px);
    padding: 8px;
    border-radius: 12px;
    border: 1px solid #ED7E13;
    display: flex;
    gap: 8px;

    img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
    }

    button {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ED7E13;
        color: white;
        border: none;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const TypingIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    
    svg {
        width: 40px;
        height: 10px;
        circle {
            fill: #ED7E13;
            animation: pulse-dot 1.5s infinite ease-in-out;
            
            &:nth-child(2) { animation-delay: 0.2s; }
            &:nth-child(3) { animation-delay: 0.4s; }
        }
    }

    @keyframes pulse-dot {
        0%, 100% { transform: translateY(0); opacity: 0.3; }
        50% { transform: translateY(-3px); opacity: 1; }
    }
`;

const ImageOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    
    img {
        max-width: 90%;
        max-height: 90%;
        border-radius: 12px;
        box-shadow: 0 0 50px rgba(237, 126, 19, 0.3);
    }
`;

export default function MentorChat({ fullHeight = true, noBg = false, hideHeader = false, lessonId = null }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [status, setStatus] = useState({ credits: { ai_credits_total: 10, ai_credits_used: 0 } });
    const [zoomedImage, setZoomedImage] = useState(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [lessonContext, setLessonContext] = useState(null);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        loadInitialData();

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load queued messages from localStorage
        const savedQueue = JSON.parse(localStorage.getItem('harmony_offline_queue') || '[]');
        if (savedQueue.length > 0) setOfflineQueue(savedQueue);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [lessonId]);

    useEffect(() => {
        if (isOnline && offlineQueue.length > 0) {
            processOfflineQueue();
        }
    }, [isOnline, offlineQueue]);

    const processOfflineQueue = async () => {
        const queue = [...offlineQueue];
        setOfflineQueue([]);
        localStorage.removeItem('harmony_offline_queue');

        for (const item of queue) {
            await handleSend(item.text, item.file);
        }
    };

    const loadInitialData = async () => {
        setIsLoadingHistory(true);
        await loadStatus();

        // 1. Tentar sessão persistida no backend
        let initialMessages = [];
        try {
            const sessionRes = await api.doctorHarmony.getSession();
            if (sessionRes?.success && sessionRes.session?.messages?.length > 0) {
                initialMessages = sessionRes.session.messages;
            }
        } catch (err) {
            // Sessão indisponível — ignorar silenciosamente
        }

        // 2. Fallback: histórico de casos clínicos
        if (initialMessages.length === 0) {
            try {
                const historyRes = await api.doctorHarmony.getHistory();
                if (historyRes?.success) {
                    initialMessages = historyRes.messages || [];
                }
            } catch (err) {
                console.error("Erro ao carregar histórico", err);
            }
        }

        // 3. Contexto de aula
        let ctx = null;
        if (lessonId) {
            try {
                const ctxRes = await api.doctorHarmony.getContext(lessonId);
                if (ctxRes?.success) {
                    ctx = ctxRes.context;
                    setLessonContext(ctx);
                }
            } catch (err) {
                console.error("Erro ao carregar contexto", err);
            }
        }

        const studentData = JSON.parse(localStorage.getItem('bh_student') || '{}');
        const firstName = studentData.full_name ? studentData.full_name.split(' ')[0] : 'Licenciada';

        if (initialMessages.length > 0) {
            setMessages(initialMessages);
        } else {
            setMessages([{
                id: 'greeting',
                type: 'ai',
                content: ctx
                    ? `Olá, ${firstName}! Estou te acompanhando na aula **${ctx.title}**. Como posso ajudar na sua prática clínica hoje?`
                    : `Olá, ${firstName}! Eu sou a Doctor Harmony. Como posso ajudar nas suas avaliações clínicas hoje?`
            }]);
        }
        setIsLoadingHistory(false);
    };

    // Persistir sessão no backend quando mensagens mudam (debounced 30s - preserva conexões DB)
    const persistSessionRef = useRef(null);
    useEffect(() => {
        if (isLoadingHistory || messages.length <= 1) return;
        clearTimeout(persistSessionRef.current);
        persistSessionRef.current = setTimeout(() => {
            api.doctorHarmony.saveSession({ messages }).catch(() => { });
        }, 30000); // 30s — salva no máximo 2x/min para economizar conexões Hostinger
        return () => clearTimeout(persistSessionRef.current);
    }, [messages, isLoadingHistory]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    const loadStatus = async () => {
        try {
            const res = await api.doctorHarmony.getCredits();
            if (res) {
                setStatus({ credits: res.credits || { ai_credits_total: 10, ai_credits_used: 0 } });
            }
        } catch (err) {
            console.error("Erro ao carregar créditos", err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleQuickAction = (action) => {
        const prompts = {
            parameters: "Quais os parâmetros recomendados para esse caso clínico? (Frequência, Largura de Pulso e Intensidade em Tabela)",
            technique: "Pode me explicar detalhadamente a técnica sugerida para este objetivo?",
            safety: "Quais os principais riscos ou contraindicações eu devo observar neste tratamento?"
        }
        setInputText(prompts[action]);
    }

    const handleSend = async (overrideText = null) => {
        const textToSend = overrideText || inputText;
        if ((!textToSend && !selectedFile) || isSending) return;

        // --- CREDIT CHECK ---
        const availableCredits = status.credits.ai_credits_total - status.credits.ai_credits_used;
        if (availableCredits <= 0) {
            // Trigger Conversion Modal (Simplified for now)
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'ai',
                content: "🔒 **Acesso Restrito**\n\nSua análise exige alta fidelidade clínica e seus créditos de consultoria se esgotaram.\n\n[Clique aqui para renovar seu acesso à Doctor Harmony](https://bodyharmony.com.br/checkout/credits)",
                isSystem: true
            }]);
            return;
        }

        const userMsg = {
            id: Date.now(),
            type: 'user',
            content: textToSend || '(Imagem enviada)',
            image: filePreview
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setSelectedFile(null);
        setFilePreview(null);
        setIsSending(true);

        // --- MULTIMODAL UX ---
        if (selectedFile) {
            setMessages(prev => [...prev, {
                id: Date.now() + 0.5,
                type: 'ai',
                content: '📸 **Imagem Recebida.**\n\nIniciando escaneamento de marcadores fisiológicos e comparação com protocolos Body Harmony...',
                isSystem: true
            }]);
        }
        // ---------------------

        try {
            const formData = new FormData();
            if (textToSend) formData.append('notes', textToSend);
            if (selectedFile) formData.append('file', selectedFile);
            if (lessonId) formData.append('lesson_id', lessonId);

            const res = await api.doctorHarmony.evaluate(formData);

            if (res && res.success) {
                const aiMsg = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: res.response,
                    needsReview: res.needs_review
                };
                setMessages(prev => [...prev, aiMsg]);
                loadStatus();
            }
        } catch (err) {
            if (!navigator.onLine) {
                const queuedItem = { text: textToSend, timestamp: Date.now() };
                const newQueue = [...offlineQueue, queuedItem];
                setOfflineQueue(newQueue);
                localStorage.setItem('harmony_offline_queue', JSON.stringify(newQueue));

                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: '📡 **Modo Offline Ativado.**\n\nSua mensagem foi salva localmente e será enviada automaticamente assim que sua conexão for restabelecida.',
                    isSystem: true
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: '⚠️ Ocorreu um erro na análise. Verifique sua conexão ou créditos.'
                }]);
            }
        } finally {
            setIsSending(false);
        }
    };

    // Helper to render markdown-like tables or paragraphs
    const renderContent = (content) => {
        if (!content) return null;

        // Simple MD-like converter for the UI
        return content.split('\n\n').map((para, i) => {
            if (para.includes('|') && para.includes('---')) {
                const rows = para.split('\n');
                const headers = rows[0].split('|').filter(s => s.trim()).map(s => s.trim());
                const dataRows = rows.slice(2).filter(r => r.trim());

                return (
                    <table key={i}>
                        <thead>
                            <tr>{headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {dataRows.map((row, rj) => (
                                <tr key={rj}>
                                    {row.split('|').filter(s => s.trim()).map((cell, cj) => (
                                        <td key={cj}>{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            }
            return <p key={i}>{para}</p>;
        });
    }

    return (
        <Container $fullHeight={fullHeight} $noBg={noBg}>
            <AnimatePresence>
                {zoomedImage && (
                    <ImageOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomedImage(null)}
                    >
                        <img src={zoomedImage} alt="Zoomed case" />
                    </ImageOverlay>
                )}
            </AnimatePresence>

            {!hideHeader && (
                <ChatHeader>
                    <div className="harmony-brand">
                        <div className="avatar"><FaRobot /></div>
                        <div>
                            <h2>Doctor Harmony <span>Mentora IA</span></h2>
                        </div>
                    </div>
                    <CreditsWidget>
                        <FaChartPie />
                        <span className="label">Créditos: {status.credits.ai_credits_total - status.credits.ai_credits_used} / {status.credits.ai_credits_total}</span>
                    </CreditsWidget>
                </ChatHeader>
            )}

            <MessageArea ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <Message
                            key={msg.id}
                            $isAi={msg.type === 'ai'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="avatar-mini">
                                {msg.type === 'ai' ? <FaRobot /> : 'EU'}
                            </div>
                            <div className="content">
                                {msg.image && (
                                    <img
                                        src={msg.image}
                                        onClick={() => setZoomedImage(msg.image)}
                                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px', cursor: 'zoom-in' }}
                                        alt="Case upload"
                                    />
                                )}
                                {renderContent(msg.content)}
                                {msg.needsReview && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(237, 126, 19, 0.1)', borderRadius: '8px', border: '1px solid #ED7E13', fontSize: '0.8rem' }}>
                                        <FaExclamationTriangle /> Caso em revisão pelas mentoras.
                                    </div>
                                )}
                            </div>
                        </Message>
                    ))}
                    {isSending && (
                        <Message $isAi={true}>
                            <div className="avatar-mini"><FaRobot /></div>
                            <div className="content">
                                <TypingIndicator>
                                    <svg viewBox="0 0 40 10">
                                        <circle cx="5" cy="5" r="3" />
                                        <circle cx="20" cy="5" r="3" />
                                        <circle cx="35" cy="5" r="3" />
                                    </svg>
                                </TypingIndicator>
                            </div>
                        </Message>
                    )}
                </AnimatePresence>
            </MessageArea>

            <HarmonyActions onAction={handleQuickAction} />

            <InputSection>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileSelect} />
                {filePreview && (
                    <PreviewImage>
                        <img src={filePreview} alt="Preview" />
                        <button onClick={() => { setSelectedFile(null); setFilePreview(null); }}>X</button>
                    </PreviewImage>
                )}
                <div className="input-wrapper">
                    <IconButton onClick={() => fileInputRef.current.click()} $active={!!selectedFile}>
                        <FaImage />
                    </IconButton>
                    <textarea
                        placeholder="Descreva o caso..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <SendButton onClick={handleSend} disabled={isSending}>
                        {isSending ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                    </SendButton>
                </div>
            </InputSection>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </Container>
    );
}
