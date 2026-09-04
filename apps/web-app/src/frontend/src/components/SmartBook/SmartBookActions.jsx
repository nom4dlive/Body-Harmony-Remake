import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaBrain, FaQuestionCircle, FaBookOpen, FaClock,
  FaBookmark, FaHeadphones, FaMagic, FaTimes, FaPlay, FaVolumeUp,
  FaChartBar, FaDownload, FaShareAlt, FaStar, FaSpinner, FaCheckCircle, FaInfoCircle
} from 'react-icons/fa';
import { smartbookApi, resolveNotebookAsset } from '../../services/smartbookApi';
import { SmartBookMermaidBlock } from './SmartBookMermaidBlock';

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: rgba(7, 35, 56, 0.98);
  border-bottom: 1px solid rgba(237, 126, 19, 0.2);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    display: none;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: #ED7E13;
    text-transform: uppercase;
    white-space: nowrap;
    letter-spacing: 0.05em;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px; /* Mobile-First target >= 44px (REGRA 3) */
  padding: 0.4rem 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 22px;
  color: #CBD5E1;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover, &:active {
    background: rgba(237, 126, 19, 0.2);
    color: #FFFFFF;
    border-color: #ED7E13;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    color: #ED7E13;
    font-size: 0.9rem;
  }
`;

const BottomSheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 769px) {
    align-items: center;
    padding: 1.5rem;
  }
`;

const SheetModal = styled.div`
  width: 100%;
  max-height: 90vh;
  background: #051A29;
  border-top: 3px solid #ED7E13;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 769px) {
    max-width: 860px;
    border-radius: 20px;
    border: 1px solid rgba(237, 126, 19, 0.4);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: #072338;
    border-bottom: 1px solid rgba(237, 126, 19, 0.2);

    .title-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .badge {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: rgba(237, 126, 19, 0.15);
        color: #ED7E13;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }

      h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #FFFFFF;
      }
    }

    .close-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: #94A3B8;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(237, 126, 19, 0.2);
        color: #ED7E13;
      }
    }
  }

  .body {
    padding: 1.25rem;
    overflow-y: auto;
    flex: 1;

    .rich-text {
      font-size: 0.95rem;
      line-height: 1.7;
      color: #CBD5E1;
      white-space: pre-wrap;

      strong {
        color: #ED7E13;
      }
    }
  }

  .footer-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: #072338;
    border-top: 1px solid rgba(237, 126, 19, 0.2);

    button {
      flex: 1;
      min-height: 44px; /* Mobile-First touch target >= 44px */
      padding: 0.65rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;

      &.primary {
        background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
        color: #FFFFFF;
        border: none;

        &:hover, &:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(237, 126, 19, 0.4);
        }
      }

      &.secondary {
        background: rgba(255, 255, 255, 0.05);
        color: #CBD5E1;
        border: 1px solid rgba(237, 126, 19, 0.3);

        &:hover, &:active {
          background: rgba(237, 126, 19, 0.15);
          color: #FFFFFF;
          border-color: #ED7E13;
        }
      }
    }
  }
`;

const ChartViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem 0;

  .chart-title-gold {
    color: #ED7E13;
    font-size: 1.1rem;
    font-weight: 800;
    text-align: center;
    margin: 0;
  }

  .image-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #03111C;
    border-radius: 16px;
    padding: 0.75rem;
    border: 1px solid rgba(237, 126, 19, 0.25);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);

    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      object-fit: contain;
    }
  }

  .chart-fallback {
    width: 100%;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: #03111C;
    border-radius: 16px;
    border: 1px dashed rgba(237, 126, 19, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    animation: ${pulse} 2s infinite ease-in-out;

    .icon-star {
      font-size: 2rem;
      color: #ED7E13;
    }

    p {
      margin: 0;
      color: #CBD5E1;
      font-size: 0.95rem;
      line-height: 1.5;
    }
  }
`;

const CustomAudioPlayer = styled.div`
  background: #072338;
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .audio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ED7E13;
    font-size: 0.9rem;
    font-weight: 700;
  }

  audio {
    width: 100%;
    outline: none;
    accent-color: #ED7E13;
  }
`;

const ToastBanner = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #072338;
  border: 2px solid #ED7E13;
  border-radius: 14px;
  padding: 0.75rem 1.25rem;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
  z-index: 100000;
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 90vw;
  text-align: center;
  animation: fadeIn 0.2s ease-out;

  .icon {
    color: #ED7E13;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

export function SmartBookActions({ notebookId, notebookTitle, onStartLoading, onEndLoading }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    outputType: 'markdown',
    content: '',
    audioUrl: '',
    imageUrl: '',
    imageError: false
  });
  const [toastNotice, setToastNotice] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const showToast = (message, iconType = 'info') => {
    setToastNotice({ message, iconType });
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleAction = async (transformationKey, title) => {
    onStartLoading?.();
    try {
      const response = await smartbookApi.executeTransformation(
        notebookId,
        transformationKey,
        [],
        false
      );

      const resolvedImg = resolveNotebookAsset(response.image_url);
      const resolvedAudio = resolveNotebookAsset(response.audio_url);

      setModalState({
        isOpen: true,
        title: `${title} — ${notebookTitle}`,
        outputType: response.output_type || 'markdown',
        content: response.result || 'Conteúdo gerado com sucesso.',
        audioUrl: resolvedAudio,
        imageUrl: resolvedImg,
        imageError: false
      });
    } catch (err) {
      console.error('[SmartBookActions] Erro na transformação:', err);
    } finally {
      onEndLoading?.();
    }
  };

  const handleDownloadChart = async (imageUrl, title) => {
    if (!imageUrl) return;
    setDownloading(true);

    try {
      // 1. Tenta baixar via fetch assíncrono e Blob
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `infografico_${(notebookTitle || 'smartbook').toLowerCase().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast('✓ Imagem baixada com sucesso!', 'success');
    } catch (err) {
      console.warn('[SmartBookActions] Download direto via blob falhou. Ativando fallback para iOS/Safari:', err);
      // Fallback para iOS Safari e restrições de sandbox
      window.open(imageUrl, '_blank');
      showToast('ℹ️ Toque e segure na imagem aberta para salvar na galeria.', 'info');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareChart = async (imageUrl, title) => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Infográfico Clínico Body Harmony',
          text: `Confira este infográfico clínico oficial gerado pela Dra. Harmony AI:`,
          url: imageUrl
        });
        showToast('✓ Compartilhado com sucesso!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(imageUrl);
          showToast('✓ Link copiado! Cole no WhatsApp ou Instagram.', 'success');
        }
      }
    } else {
      // Fallback para área de transferência
      try {
        await navigator.clipboard.writeText(imageUrl);
        showToast('✓ Link do infográfico copiado! Cole no WhatsApp.', 'success');
      } catch (copyErr) {
        showToast('ℹ️ Abra o link para compartilhar: ' + imageUrl, 'info');
      }
    }
  };

  const isChartOutput = modalState.outputType === 'chart' || modalState.outputType === 'image';

  return (
    <>
      <ActionContainer>
        <div className="label">
          <FaMagic /> 1-Clique:
        </div>
        <ActionButton onClick={() => handleAction('mapa_mental_clinico', '🧠 Mapa Mental Clínico')}>
          <FaBrain className="icon" />
          <span>Mapa Mental</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('infografico_clinico', '📊 Infográfico Clínico')}>
          <FaChartBar className="icon" />
          <span>Infográfico</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('quiz_simulado_alunas', '📝 Simulado Clínico')}>
          <FaQuestionCircle className="icon" />
          <span>Quiz & Simulado</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('guia_estudos_completo', '📖 Guia de Estudos')}>
          <FaBookOpen className="icon" />
          <span>Guia Clínico</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('linha_tempo_tratamento', '⏳ Linha do Tempo')}>
          <FaClock className="icon" />
          <span>Cronograma</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('glossario_eletroterapia', '📚 Glossário')}>
          <FaBookmark className="icon" />
          <span>Glossário</span>
        </ActionButton>
        <ActionButton onClick={() => handleAction('podcast_dialogado', '🎙️ Podcast Clínico')}>
          <FaHeadphones className="icon" />
          <span>Podcast</span>
        </ActionButton>
      </ActionContainer>

      {modalState.isOpen && (
        <BottomSheetOverlay onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
          <SheetModal onClick={(e) => e.stopPropagation()}>
            <div className="header">
              <div className="title-box">
                <div className="badge">
                  {modalState.outputType === 'mermaid' ? <FaBrain /> : isChartOutput ? <FaChartBar /> : modalState.outputType === 'audio' ? <FaHeadphones /> : <FaMagic />}
                </div>
                <h3>{modalState.title}</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                aria-label="Fechar"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="body">
              {modalState.outputType === 'mermaid' ? (
                <SmartBookMermaidBlock chart={modalState.content} />
              ) : isChartOutput && modalState.imageUrl ? (
                <ChartViewWrapper>
                  <h4 className="chart-title-gold">📊 Evidências e Parâmetros Clínicos Oficiais</h4>
                  {modalState.imageError ? (
                    <div className="chart-fallback">
                      <FaStar className="icon-star" />
                      <p>A Dra. Harmony ainda está processando seus dados clínicos...</p>
                    </div>
                  ) : (
                    <div className="image-container">
                      <img
                        src={modalState.imageUrl}
                        alt={modalState.title}
                        onError={() => setModalState((prev) => ({ ...prev, imageError: true }))}
                      />
                    </div>
                  )}
                </ChartViewWrapper>
              ) : modalState.outputType === 'audio' && modalState.audioUrl ? (
                <CustomAudioPlayer>
                  <div className="audio-label">
                    <FaVolumeUp /> Podcast Exclusivo — Dra. Harmony AI & Dra. Joselene
                  </div>
                  <audio controls src={modalState.audioUrl} />
                </CustomAudioPlayer>
              ) : (
                <div className="rich-text">{modalState.content}</div>
              )}
            </div>

            {isChartOutput && modalState.imageUrl && !modalState.imageError && (
              <div className="footer-actions">
                <button
                  className="primary"
                  onClick={() => handleDownloadChart(modalState.imageUrl, modalState.title)}
                  disabled={downloading}
                >
                  {downloading ? <FaSpinner className="fa-spin" /> : <FaDownload />}
                  <span>{downloading ? 'Baixando...' : 'Baixar Imagem'}</span>
                </button>
                <button
                  className="secondary"
                  onClick={() => handleShareChart(modalState.imageUrl, modalState.title)}
                >
                  <FaShareAlt />
                  <span>Compartilhar</span>
                </button>
              </div>
            )}
          </SheetModal>
        </BottomSheetOverlay>
      )}

      {toastNotice && (
        <ToastBanner>
          {toastNotice.iconType === 'success' ? (
            <FaCheckCircle className="icon" style={{ color: '#22C55E' }} />
          ) : (
            <FaInfoCircle className="icon" />
          )}
          <span>{toastNotice.message}</span>
        </ToastBanner>
      )}
    </>
  );
}
