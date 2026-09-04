import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaChevronLeft, FaChevronRight, FaRedo, FaCheck, 
  FaTimes, FaTrophy, FaKeyboard, FaLightbulb 
} from 'react-icons/fa';

const RunnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  perspective: 1000px;
  outline: none;
`;

const FlipCardWrapper = styled.div`
  width: 100%;
  height: 260px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => (props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
  cursor: pointer;
  user-select: none;
`;

const CardFace = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
  border: 1px solid #1E3A5F;
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(145deg, #11223A 0%, #0B1626 100%);
  border-color: #ED7E13;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-label {
      font-size: 11px;
      font-weight: 800;
      color: #ED7E13;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .category-tag {
      font-size: 10px;
      font-weight: 700;
      background: rgba(237, 126, 19, 0.15);
      color: #ED7E13;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }

  .card-question {
    font-size: 16px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.5;
    text-align: center;
    margin: auto 0;
  }

  .card-hint {
    font-size: 11px;
    color: #9AA0A6;
    text-align: center;
  }
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(145deg, #072338 0%, #051A29 100%);
  transform: rotateY(180deg);
  border-color: #22C55E;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-label {
      font-size: 11px;
      font-weight: 800;
      color: #22C55E;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .card-answer {
    font-size: 15px;
    line-height: 1.6;
    color: #E8EAED;
    text-align: center;
    margin: auto 0;
  }

  .card-hint {
    font-size: 11px;
    color: #9AA0A6;
    text-align: center;
  }
`;

const EvaluationRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;

  button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &.btn-wrong {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #EF4444;
      color: #F87171;

      &:hover {
        background: #EF4444;
        color: #FFFFFF;
      }
    }

    &.btn-correct {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid #22C55E;
      color: #4ADE80;

      &:hover {
        background: #22C55E;
        color: #FFFFFF;
      }
    }
  }
`;

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;

  .nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #11223A;
    border: 1px solid #1E3A5F;
    color: #E8EAED;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #1E3A5F;
      border-color: #ED7E13;
      color: #ED7E13;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .counter-text {
    font-size: 13px;
    font-weight: 700;
    color: #ED7E13;
  }
`;

const KeyboardHints = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 11px;
  color: #5F6B7A;
  margin-top: 4px;

  kbd {
    background: #0B1626;
    border: 1px solid #1E3A5F;
    border-radius: 4px;
    padding: 2px 6px;
    color: #9AA0A6;
    font-family: monospace;
    font-size: 10px;
  }
`;

const CompletedCard = styled.div`
  background: #0B1626;
  border: 1px solid #ED7E13;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: #E8EAED;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);

  .trophy-icon {
    font-size: 48px;
    color: #ED7E13;
  }

  h3 {
    font-size: 20px;
    font-weight: 800;
    color: #FFFFFF;
    margin: 0;
  }

  .score-badge {
    font-size: 28px;
    font-weight: 900;
    color: #22C55E;
  }

  .restart-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #ED7E13;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #F08E2D;
      transform: scale(1.03);
    }
  }
`;

export function SmartBookFlashcardsRunner({ cards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const total = cards.length;
  const currentCard = cards[currentIndex];

  const handleEvaluate = useCallback((isCorrect) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 180);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, cards.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setWrongCount(0);
    setIsCompleted(false);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted) return;

      if (e.code === 'Space' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleEvaluate(false);
      } else if (e.key === '2') {
        e.preventDefault();
        handleEvaluate(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, handleNext, handlePrev, handleEvaluate, isCompleted]);

  if (!cards || cards.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#9AA0A6' }}>
        Nenhum flashcard disponível para este conteúdo.
      </div>
    );
  }

  if (isCompleted) {
    const percent = Math.round((correctCount / total) * 100);

    return (
      <RunnerContainer>
        <CompletedCard>
          <FaTrophy className="trophy-icon" />
          <h3>Revisão Concluída!</h3>
          <p style={{ color: '#9AA0A6', margin: 0 }}>Você finalizou todos os flashcards deste caderno.</p>
          <div className="score-badge">{percent}% de Acertos</div>
          <p style={{ fontSize: '13px', color: '#D1D5DB' }}>
            🎯 {correctCount} acertos • 🔄 {wrongCount} revisões
          </p>
          <button className="restart-btn" onClick={handleRestart}>
            <FaRedo /> Praticar Novamente
          </button>
        </CompletedCard>
      </RunnerContainer>
    );
  }

  return (
    <RunnerContainer tabIndex={0}>
      <FlipCardWrapper isFlipped={isFlipped} onClick={toggleFlip}>
        <CardFront>
          <div className="card-header">
            <span className="card-label">Pergunta / Conceito</span>
            <span className="category-tag">Eletroterapia</span>
          </div>
          <div className="card-question">{currentCard?.question || currentCard?.front || 'Conceito Clínico'}</div>
          <span className="card-hint">Toque ou pressione [Espaço] para virar ↻</span>
        </CardFront>

        <CardBack>
          <div className="card-header">
            <span className="card-label">Resposta Clínica</span>
          </div>
          <div className="card-answer">{currentCard?.answer || currentCard?.back || 'Explicação técnica'}</div>
          <span className="card-hint">Toque ou pressione [Espaço] para voltar ↻</span>
        </CardBack>
      </FlipCardWrapper>

      <EvaluationRow>
        <button className="btn-wrong" onClick={() => handleEvaluate(false)} title="Pressione [1]">
          <FaTimes /> Preciso Revisar [1]
        </button>
        <button className="btn-correct" onClick={() => handleEvaluate(true)} title="Pressione [2]">
          <FaCheck /> Acertei [2]
        </button>
      </EvaluationRow>

      <ControlsBar>
        <button className="nav-btn" onClick={handlePrev} disabled={currentIndex === 0} title="Anterior [←]">
          <FaChevronLeft size={14} />
        </button>

        <span className="counter-text">
          {currentIndex + 1} de {cards.length}
        </span>

        <button className="nav-btn" onClick={handleNext} disabled={currentIndex === cards.length - 1} title="Próximo [→]">
          <FaChevronRight size={14} />
        </button>
      </ControlsBar>

      <KeyboardHints>
        <FaKeyboard />
        <span><kbd>Espaço</kbd> virar</span>
        <span><kbd>←</kbd> <kbd>→</kbd> navegar</span>
        <span><kbd>1</kbd> revisar</span>
        <span><kbd>2</kbd> acertei</span>
      </KeyboardHints>
    </RunnerContainer>
  );
}

export default SmartBookFlashcardsRunner;

