import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaTimes,
  FaRobot, FaVolumeUp, FaVolumeMute, FaLightbulb, FaCheckCircle
} from 'react-icons/fa';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const StoriesContainer = styled.div`
  width: 100%;
  max-width: 440px;
  height: 82vh;
  max-height: 780px;
  background: linear-gradient(180deg, #0A3E60 0%, #051A29 100%);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;
  user-select: none;
`;

const ProgressBarsRow = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 20;

  .bar-bg {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4px;
    overflow: hidden;

    .bar-fill {
      height: 100%;
      background: #ED7E13;
      border-radius: 4px;
      transition: width 0.1s linear;
    }
  }
`;

const TopHeader = styled.div`
  position: absolute;
  top: 24px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 20;

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #FFFFFF;

    .badge {
      background: #ED7E13;
      font-size: 0.65rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
  }

  .close-btn {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
  }
`;

const SlideContent = styled(motion.div)`
  flex: 1;
  padding: 5rem 1.5rem 6rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  z-index: 10;

  .category-pill {
    align-self: flex-start;
    background: rgba(237, 126, 19, 0.2);
    border: 1px solid rgba(237, 126, 19, 0.4);
    color: #ED7E13;
    padding: 0.3rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    line-height: 1.3;
    color: #FFFFFF;
  }

  .highlight-card {
    background: rgba(5, 26, 41, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    .item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.4;

      svg {
        color: #ED7E13;
        flex-shrink: 0;
        margin-top: 0.2rem;
      }
    }
  }

  p.description {
    margin: 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }
`;

const TouchOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  z-index: 15;

  .touch-left {
    width: 40%;
    height: 100%;
  }

  .touch-right {
    width: 60%;
    height: 100%;
  }
`;

const BottomActions = styled.div`
  position: absolute;
  bottom: 16px;
  left: 14px;
  right: 14px;
  display: flex;
  gap: 0.6rem;
  z-index: 20;

  button {
    flex: 1;
    background: linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%);
    border: none;
    color: #FFFFFF;
    padding: 0.75rem;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    box-shadow: 0 4px 15px rgba(237, 126, 19, 0.35);
  }

  .seek-btn {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: none;
  }
`;

export default function StoriesProtocolViewer({
  moduleTitle = 'Módulo 1: Fundamentos Clínicos',
  storiesData = null,
  onClose = () => {},
  onSeek = null,
  onAskAi = null
}) {
  const defaultStories = [
    {
      id: 1,
      category: '1. Fisiologia & Objetivo',
      title: 'Despolarização e Recrutamento Motor',
      items: [
        'Ativação síncrona de fibras musculares Tipo IIb.',
        'Cronaxia ideal calculada para hipertrofia e firmeza.',
        'Sem fadiga articular ou sobrecarga de tendões.'
      ],
      seekSeconds: 45
    },
    {
      id: 2,
      category: '2. Parâmetros de Dosimetria',
      title: 'Frequência Hz & Largura de Pulso µs',
      items: [
        'Frequência: 80Hz (recrutamento de fibras rápidas).',
        'Largura de pulso: 250µs (conforto e despolarização profunda).',
        'Rampas: Subida 2s | Sustentação 4s | Descida 2s | Repouso 4s.'
      ],
      seekSeconds: 150
    },
    {
      id: 3,
      category: '3. Setup dos Canais 1 a 8',
      title: 'Distribuição dos Eletrodos na Maca',
      items: [
        'Canais 1 e 2: Ventre muscular superior.',
        'Canais 3 e 4: Ponto motor e estabilização.',
        'Canais 5 a 8: Grupos sinérgicos complementares.'
      ],
      seekSeconds: 260
    },
    {
      id: 4,
      category: '4. Intercorrências & Manejo',
      title: 'Segurança com Próteses e Sensibilidade',
      items: [
        'Paciente com prótese: respeitar margem de segurança de 3cm.',
        'Sensação de queimação: reaplicar gel condutor imediatamente.',
        'Ajuste fino de intensidade individual por canal.'
      ],
      seekSeconds: 380
    },
    {
      id: 5,
      category: '5. Argumentos de Alto Ticket',
      title: 'Como Vender o Plano na Avaliação',
      items: [
        'Ancoragem de protocolo 3S de R$ 2.500 a R$ 5.000.',
        'Explicação biológica que gera autoridade imediata.',
        'Garantia de resultados visíveis na 4ª sessão.'
      ],
      seekSeconds: 490
    }
  ];

  const slides = storiesData && storiesData.length > 0 ? storiesData : defaultStories;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const durationMs = 15000; // 15s por story
  const intervalMs = 100;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < slides.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (intervalMs / durationMs) * 100;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, slides.length, onClose]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <ModalBackdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StoriesContainer>
        {/* Barras de Progresso no Topo */}
        <ProgressBarsRow>
          {slides.map((s, idx) => (
            <div key={s.id} className="bar-bg">
              <div
                className="bar-fill"
                style={{
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </ProgressBarsRow>

        {/* Top Header */}
        <TopHeader>
          <div className="brand">
            <span>Dra. Harmony Stories</span>
            <span className="badge">15s PROTOCOLO</span>
          </div>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </TopHeader>

        {/* Áreas de Toque (Voltar / Avançar / Pausar) */}
        <TouchOverlay
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="touch-left" onClick={handlePrev} />
          <div className="touch-right" onClick={handleNext} />
        </TouchOverlay>

        {/* Conteúdo do Slide */}
        <AnimatePresence mode="wait">
          <SlideContent
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25 }}
          >
            <span className="category-pill">{currentSlide.category}</span>
            <h2>{currentSlide.title}</h2>

            <div className="highlight-card">
              {currentSlide.items.map((item, idx) => (
                <div key={idx} className="item">
                  <FaCheckCircle />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </SlideContent>
        </AnimatePresence>

        {/* Botões de Ação Inferiores */}
        <BottomActions>
          {onSeek && currentSlide.seekSeconds && (
            <button
              className="seek-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSeek(currentSlide.seekSeconds);
                onClose();
              }}
            >
              <FaPlay style={{ fontSize: '0.7rem' }} /> Pular Vídeo para este Trecho
            </button>
          )}

          {onAskAi && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAskAi(`Dra. Harmony, me tire uma dúvida sobre: ${currentSlide.title}`);
                onClose();
              }}
            >
              <FaRobot /> Tirar Dúvida com IA
            </button>
          )}
        </BottomActions>
      </StoriesContainer>
    </ModalBackdrop>
  );
}
