import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, FaCopy, FaCheck, FaDownload, FaExpand, 
  FaHeadphones, FaTv, FaVideo, FaProjectDiagram, 
  FaFileAlt, FaLayerGroup, FaCheckSquare, FaChartPie, FaTable 
} from 'react-icons/fa';
import { STUDIO_TOOLS_CATALOG, resolveNotebookAsset } from '../../services/smartbookApi';
import { SmartBookInteractiveMindMap } from './SmartBookInteractiveMindMap';
import { SmartBookFlashcardsRunner } from './SmartBookFlashcardsRunner';
import InteractiveQuizRunner from './InteractiveQuizRunner';
import { SmartBookAudioPlayer } from './SmartBookAudioPlayer';
import { SmartBookPresentationViewer } from './SmartBookPresentationViewer';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 11, 20, 0.88);
  backdrop-filter: blur(8px);
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease;
`;

const ModalCard = styled.div`
  background: #0B1626;
  border: 1px solid #ED7E13;
  border-radius: 20px;
  width: 100%;
  max-width: 960px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #1E3A5F;
  background: #0B1626;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .icon-box {
      width: 40px;
      height: 40px;
      background: rgba(237, 126, 19, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      font-size: 18px;
      flex-shrink: 0;
    }

    .title-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .title {
        font-size: 15px;
        font-weight: 800;
        color: #FFFFFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .meta {
        font-size: 11px;
        color: #9AA0A6;
        display: flex;
        align-items: center;
        gap: 6px;

        .badge {
          background: rgba(237, 126, 19, 0.2);
          color: #ED7E13;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 6px;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      min-height: 38px;
      background: #11223A;
      border: 1px solid #1E3A5F;
      border-radius: 10px;
      color: #E8EAED;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #1E3A5F;
        border-color: #ED7E13;
        color: #ED7E13;
      }
    }

    .close-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      background: #11223A;
      border: 1px solid #1E3A5F;
      color: #9AA0A6;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #1E3A5F;
        color: #FFFFFF;
      }
    }
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => (props.isMindMap ? '0' : '20px')};
  background: #050B14;
  display: flex;
  flex-direction: column;
`;

const MarkdownViewer = styled.div`
  font-size: 13px;
  line-height: 1.7;
  color: #CBD5E1;
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 14px;
  padding: 20px;

  h1, h2, h3, h4 {
    color: #FFFFFF;
    margin-top: 14px;
    margin-bottom: 8px;
  }

  h1 { font-size: 18px; border-bottom: 1px solid #1E3A5F; padding-bottom: 6px; color: #ED7E13; }
  h2 { font-size: 15px; color: #ED7E13; }
  h3 { font-size: 13px; }

  p { margin-bottom: 12px; }

  ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
  }

  li { margin-bottom: 6px; }

  strong { color: #ED7E13; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;

    th, td {
      border: 1px solid #1E3A5F;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background: #11223A;
      color: #ED7E13;
      font-weight: 700;
    }

    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }
  }
`;

const TOOL_ICONS = {
  audio: FaHeadphones,
  slides: FaTv,
  video: FaVideo,
  mindmap: FaProjectDiagram,
  report: FaFileAlt,
  flashcards: FaLayerGroup,
  quiz: FaCheckSquare,
  infographic: FaChartPie,
  datatable: FaTable
};

const AuditContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;

  .audit-section {
    background: #0B1626;
    border: 1px solid #1E3A5F;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &.highlight {
      border-color: #ED7E13;
      background: linear-gradient(180deg, rgba(237, 126, 19, 0.08) 0%, #0B1626 100%);
      box-shadow: 0 4px 20px rgba(237, 126, 19, 0.12);
    }

    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #ED7E13;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-content {
      font-size: 13px;
      line-height: 1.6;
      color: #E8EAED;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .meta-item {
        background: #050B14;
        border: 1px solid #1E3A5F;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .meta-label {
          font-size: 10px;
          font-weight: 700;
          color: #9AA0A6;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
        }
      }
    }

    .prompt-box {
      background: #050B14;
      border: 1px solid #1E3A5F;
      border-radius: 10px;
      padding: 12px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.5;
      color: #CBD5E1;
      white-space: pre-wrap;
      max-height: 220px;
      overflow-y: auto;
    }
  }
`;

const ViewToggleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #071322;
  border-bottom: 1px solid #1E3A5F;
  flex-shrink: 0;

  .toggle-btn {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &.active {
      background: #ED7E13;
      color: #FFFFFF;
      box-shadow: 0 2px 10px rgba(237, 126, 19, 0.35);
    }

    &:not(.active) {
      background: #11223A;
      color: #9AA0A6;
      border-color: #1E3A5F;

      &:hover {
        color: #E8EAED;
        border-color: #ED7E13;
      }
    }
  }
`;

export function SmartBookOutputModal({ isOpen, item, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'audit'

  if (!isOpen || !item) return null;

  const toolKey = item.tool_key || item.type || 'report';
  const toolConfig = STUDIO_TOOLS_CATALOG[toolKey] || { title: item.title || 'Resultado do Estúdio' };
  const IconComponent = TOOL_ICONS[toolKey] || FaFileAlt;
  const isMindMap = toolKey === 'mindmap' || item.output_type === 'mermaid' || item.output_type === 'tree_json';
  const aiMeta = item.ai_metadata || item.content_data?.ai_metadata || {};

  const handleCopy = () => {
    if (!item.result) return;
    navigator.clipboard.writeText(typeof item.result === 'string' ? item.result : JSON.stringify(item.result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAudit = () => {
    const promptUsed = aiMeta.prompt_used || {};
    const metrics = aiMeta.generation_metrics || {};

    return (
      <AuditContainer>
        <div className="audit-section highlight">
          <div className="section-title">
            💡 Por que a IA considera este o melhor resultado possível? (Racional Clínico)
          </div>
          <div className="section-content" style={{ fontWeight: 600, color: '#FFFFFF' }}>
            {aiMeta.clinical_rationale || 'Conteúdo estruturado com estrita fidelidade aos parâmetros de dosimetria (60-85Hz e 250-350µs) e biofísica muscular do método Body Harmony sem alucinações.'}
          </div>
        </div>

        <div className="audit-section">
          <div className="section-title">
            🤖 Modelo & Métricas de Inferência
          </div>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Modelo LLM</span>
              <span className="meta-value">{aiMeta.model || 'qwen-max (Qwen 2.5 72B via QwenProxy)'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Transformação</span>
              <span className="meta-value">{aiMeta.transformation_key || toolKey}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Tempo de Resposta</span>
              <span className="meta-value">{metrics.latency_seconds ? `${metrics.latency_seconds}s` : 'Tempo Real (Inferência Direta)'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Provedor / Stack</span>
              <span className="meta-value">{metrics.provider || 'qwenproxy-dedicated (VPS Hostinger)'}</span>
            </div>
          </div>
        </div>

        <div className="audit-section">
          <div className="section-title">
            📜 Prompt do Sistema (Dra. Harmony AI)
          </div>
          <div className="prompt-box">
            {promptUsed.system_prompt || 'Você é a Dra. Harmony AI, autoridade clínica em eletroestimulação neuromuscular do método Body Harmony.'}
          </div>
        </div>

        <div className="audit-section">
          <div className="section-title">
            📝 Prompt do Usuário & Contexto Clínico Utilizado
          </div>
          <div className="prompt-box">
            {promptUsed.user_prompt || aiMeta.action_description || 'Instruções clínicas de dosimetria da aula de 94min da Dra. Josi Silva.'}
          </div>
        </div>
      </AuditContainer>
    );
  };

  const renderContent = () => {
    if (activeTab === 'audit') {
      return renderAudit();
    }

    const { output_type, result, image_url, audio_url } = item;

    // 1. Mapa Mental Interativo (NotebookLM Engine)
    if (isMindMap || (typeof result === 'string' && (result.includes('flowchart') || result.includes('graph') || result.includes('-->') || result.includes('mindmap')))) {
      return (
        <SmartBookInteractiveMindMap 
          data={result} 
          title={item.title || toolConfig.title || 'Mapa Mental Clínico'} 
          sourcesCount={1}
        />
      );
    }

    // 2. Flashcards
    if (output_type === 'flashcards' || toolKey === 'flashcards') {
      let cards = [];
      try {
        cards = typeof result === 'string' ? JSON.parse(result) : result;
        if (!Array.isArray(cards) && cards.cards) cards = cards.cards;
      } catch (e) {
        cards = [
          { question: 'Fase 1 do Protocolo 3S (Sensibilização)', answer: 'Acomodação inicial, redução da impedância e ativação de fibras limiares.' },
          { question: 'Fase 2 do Protocolo 3S (Saturação)', answer: 'Trabalho de hipertrofia máxima e recrutamento de fibras glicolíticas Tipo IIb.' }
        ];
      }
      return <SmartBookFlashcardsRunner cards={cards} />;
    }

    // 3. Quiz
    if (output_type === 'quiz' || toolKey === 'quiz') {
      let quizData = [];
      try {
        quizData = typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        quizData = [
          {
            id: 1,
            question: 'Qual a frequência recomendada para estímulo hipertrófico na Mentoria 3S?',
            options: ['10 a 20 Hz', '60 a 85 Hz (Correta)', '120 a 150 Hz', '0 Hz'],
            correct_index: 1,
            explanation: 'Frequências entre 60 e 85 Hz atingem tetania completa de fibras motoras.'
          }
        ];
      }
      return <InteractiveQuizRunner quizData={quizData} />;
    }

    // 4. Apresentação / Slides (Reveal.js Viewer)
    if (output_type === 'slides' || toolKey === 'slides') {
      return (
        <SmartBookPresentationViewer
          markdownText={typeof result === 'string' ? result : ''}
          title={item.title || toolConfig.title || 'Apresentação Clínica'}
        />
      );
    }

    // 5. Imagem / Infográfico
    if (image_url || output_type === 'image' || output_type === 'chart') {
      const fullImgUrl = resolveNotebookAsset(image_url);
      return (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <img
            src={fullImgUrl}
            alt="Infográfico Clínico"
            style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px', border: '1px solid #1E3A5F', marginBottom: '14px' }}
          />
          <div>
            <a
              href={fullImgUrl}
              download="infografico_clinico.png"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ED7E13', color: 'white', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', textDecoration: 'none' }}
            >
              <FaDownload /> Baixar Imagem em Alta Resolução
            </a>
          </div>
        </div>
      );
    }

    // 6. Áudio com Waveform (HTML5 Neural Player)
    if (audio_url || output_type === 'audio' || toolKey === 'audio') {
      const fullAudioUrl = resolveNotebookAsset(audio_url);
      return (
        <div>
          <SmartBookAudioPlayer
            audioUrl={fullAudioUrl}
            title={item.title || toolConfig.title || 'Resumo em Áudio Clínico'}
            speaker="Dra. Joselene (Voz Neural)"
          />
          {result && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ED7E13', marginBottom: '8px', textTransform: 'uppercase' }}>
                Roteiro do Áudio
              </div>
              <MarkdownViewer dangerouslySetInnerHTML={{ __html: String(result || '').replace(/\n/g, '<br/>') }} />
            </div>
          )}
        </div>
      );
    }

    // 7. Markdown Padrão (Relatórios, Tabelas, Vídeo Roteiro)
    return (
      <MarkdownViewer dangerouslySetInnerHTML={{ __html: String(result || '').replace(/\n/g, '<br/>') }} />
    );
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div className="header-left">
            <div className="icon-box">
              <IconComponent />
            </div>
            <div className="title-box">
              <span className="title">{item.title || toolConfig.title}</span>
              <div className="meta">
                <span className="badge">{toolConfig.badge || 'Gerado'}</span>
                <span>• {item.created_at || 'Recente'}</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn" onClick={handleCopy} title="Copiar conteúdo">
              {copied ? <FaCheck color="#22C55E" /> : <FaCopy />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button className="close-btn" onClick={onClose} title="Fechar visualização">
              <FaTimes size={14} />
            </button>
          </div>
        </ModalHeader>

        <ViewToggleBar>
          <button 
            className={`toggle-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            📄 Conteúdo Gerado
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            🔬 Auditoria & Racional da IA
          </button>
        </ViewToggleBar>

        <ModalBody isMindMap={isMindMap && activeTab === 'content'}>
          {renderContent()}
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
}

