import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress, 
  FaTv, FaLayerGroup 
} from 'react-icons/fa';

const DeckContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 520px;
  max-height: 70vh;
  background: #050B14;
  border: 1px solid #1E3A5F;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  &.fullscreen {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    z-index: 9999;
    border-radius: 0;
  }
`;

const SlideViewport = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: radial-gradient(circle at center, #11223A 0%, #050B14 100%);
  position: relative;
  overflow-y: auto;
`;

const SlideCard = styled.div`
  width: 100%;
  max-width: 780px;
  background: rgba(11, 22, 38, 0.85);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 20px;
  padding: 36px 40px;
  color: #E8EAED;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  h1, h2, h3 {
    color: #FFFFFF;
    margin-top: 0;
    margin-bottom: 18px;
    font-weight: 800;
    line-height: 1.25;
    border-bottom: 2px solid #ED7E13;
    padding-bottom: 8px;
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 17px; }

  ul, ol {
    margin: 0;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  li {
    font-size: 15px;
    line-height: 1.6;
    color: #D1D5DB;

    strong {
      color: #ED7E13;
    }
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    color: #D1D5DB;
    margin-bottom: 14px;
  }
`;

const DeckControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #0B1626;
  border-top: 1px solid #1E3A5F;
  flex-shrink: 0;

  .slide-counter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #ED7E13;

    .total {
      color: #9AA0A6;
      font-weight: 500;
    }
  }

  .nav-buttons {
    display: flex;
    align-items: center;
    gap: 10px;

    button {
      padding: 8px 14px;
      background: #11223A;
      border: 1px solid #1E3A5F;
      border-radius: 8px;
      color: #E8EAED;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: #ED7E13;
        color: #ED7E13;
      }

      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
  }

  .extra-actions {
    button {
      background: transparent;
      border: none;
      color: #9AA0A6;
      font-size: 15px;
      cursor: pointer;
      padding: 6px;
      transition: color 0.2s;

      &:hover {
        color: #FFFFFF;
      }
    }
  }
`;

const ProgressBar = styled.div`
  height: 3px;
  background: #1E3A5F;
  width: 100%;

  .fill {
    height: 100%;
    background: #ED7E13;
    width: ${props => props.percent}%;
    transition: width 0.3s ease;
  }
`;

export function SmartBookPresentationViewer({ markdownText = '', title = 'Apresentação Clínica' }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Divide o Markdown pelos separadores clássicos de slides '---'
  const slides = React.useMemo(() => {
    if (!markdownText || typeof markdownText !== 'string') {
      return [
        `# 🎓 ${title}\n* Visão Geral dos Protocolos Clínicos\n* Apresentação para capacitação da equipe`
      ];
    }

    const rawParts = markdownText.split(/^---$/m).map(s => s.trim()).filter(Boolean);
    return rawParts.length > 0 ? rawParts : [markdownText];
  }, [markdownText, title]);

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, isFullscreen]);

  // Renderizador simples de Markdown para o slide
  const renderSlideContent = (md) => {
    const lines = md.split('\n');
    return (
      <div>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) {
            return <h1 key={idx}>{trimmed.replace('# ', '')}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx}>{trimmed.replace('## ', '')}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx}>{trimmed.replace('### ', '')}</h3>;
          }
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const clean = trimmed.replace(/^[\*\-]\s+/, '');
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
          }
          if (trimmed.length > 0) {
            return (
              <p key={idx} dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
          }
          return null;
        })}
      </div>
    );
  };

  const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <DeckContainer className={isFullscreen ? 'fullscreen' : ''}>
      <ProgressBar percent={progressPercent}>
        <div className="fill" />
      </ProgressBar>

      <SlideViewport>
        <SlideCard>
          {renderSlideContent(slides[currentSlideIndex])}
        </SlideCard>
      </SlideViewport>

      <DeckControls>
        <div className="slide-counter">
          <FaTv />
          <span>Slide {currentSlideIndex + 1}</span>
          <span className="total">de {totalSlides}</span>
        </div>

        <div className="nav-buttons">
          <button onClick={prevSlide} disabled={currentSlideIndex === 0}>
            <FaChevronLeft size={12} /> Anterior
          </button>
          <button onClick={nextSlide} disabled={currentSlideIndex === totalSlides - 1}>
            Próximo <FaChevronRight size={12} />
          </button>
        </div>

        <div className="extra-actions">
          <button onClick={() => setIsFullscreen(!isFullscreen)} title="Alternar Tela Cheia">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </DeckControls>
    </DeckContainer>
  );
}

export default SmartBookPresentationViewer;
