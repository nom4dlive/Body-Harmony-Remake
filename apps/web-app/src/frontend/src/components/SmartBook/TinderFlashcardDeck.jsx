import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  FaCheck, FaTimes, FaUndo, FaRobot, FaLayerGroup,
  FaLightbulb, FaExchangeAlt, FaFire
} from 'react-icons/fa';

const DeckWrapper = styled.div`
  background: #051A29;
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  overflow: hidden;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Poppins', sans-serif;
  color: #FFFFFF;
`;

const DeckHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;

  .title-block {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .counter-badge {
    background: rgba(237, 126, 19, 0.2);
    border: 1px solid rgba(237, 126, 19, 0.4);
    color: #ED7E13;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;

const CardArea = styled.div`
  width: 100%;
  max-width: 360px;
  height: 380px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwipeableCard = styled(motion.div)`
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #0A3E60 0%, #051A29 100%);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
  cursor: grab;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .category {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 800;
      color: #ED7E13;
      background: rgba(237, 126, 19, 0.15);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .flip-hint {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 0.75rem;
    padding: 0.5rem 0;

    h4 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.4;
      color: #FFFFFF;
    }

    .answer-box {
      background: rgba(5, 26, 41, 0.9);
      border: 1px solid rgba(237, 126, 19, 0.3);
      border-radius: 12px;
      padding: 1rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.45;
      text-align: left;
    }
  }

  .card-footer {
    display: flex;
    justify-content: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ActionsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;

  .action-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
    transition: all 0.2s;

    &:hover {
      transform: scale(1.08);
    }

    &.btn-nope {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #EF4444;
      color: #EF4444;
    }

    &.btn-flip {
      background: rgba(237, 126, 19, 0.2);
      border: 1px solid #ED7E13;
      color: #ED7E13;
    }

    &.btn-like {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22C55E;
      color: #22C55E;
    }
  }
`;

function SingleCard({ card, onSwipe, onAskAi }) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0.4, 1, 0.4]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 80) {
      onSwipe('right');
    } else if (info.offset.x < -80) {
      onSwipe('left');
    }
  };

  return (
    <SwipeableCard
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={() => setFlipped(prev => !prev)}
      whileTap={{ scale: 0.98 }}
    >
      <div className="card-top">
        <span className="category">{card.category || 'Parâmetro Clínico'}</span>
        <span className="flip-hint"><FaExchangeAlt /> Toque para virar</span>
      </div>

      <div className="card-body">
        {!flipped ? (
          <h4>{card.question}</h4>
        ) : (
          <div className="answer-box">
            <p style={{ margin: 0, fontWeight: 600, color: '#ED7E13', marginBottom: '0.4rem' }}>
              💡 Resposta de Cabine:
            </p>
            <p style={{ margin: 0 }}>{card.answer}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span>← Arraste para a esquerda (Revisar) | Direita (Dominei) →</span>
      </div>
    </SwipeableCard>
  );
}

export default function TinderFlashcardDeck({
  cardsData = null,
  onAskAi = null
}) {
  const defaultCards = [
    {
      id: 1,
      category: 'Fisiologia & Hz',
      question: 'Qual a frequência (Hz) recomendada para recrutar fibras de contração rápida (Tipo IIb) nos Glúteos?',
      answer: '80 Hz a 100 Hz. Promove tetania máxima e hipertrofia muscular com estímulo neuromuscular concentrado.'
    },
    {
      id: 2,
      category: 'Dosimetria µs',
      question: 'Por que a largura de pulso (µs) deve ser ajustada em 250µs no protocolo 3S?',
      answer: '250µs atinge a cronaxia exata do motoneurônio somático profundo sem ativar nociceptores de dor superficial.'
    },
    {
      id: 3,
      category: 'Canais HTM',
      question: 'Como distribuir os eletrodos dos Canais 1 a 4 para glúteo máximo e médio?',
      answer: 'Canais 1-2 no ventre superior do glúteo máximo; Canais 3-4 no glúteo médio e ponto motor lateral.'
    },
    {
      id: 4,
      category: 'Segurança & Prótese',
      question: 'Paciente com prótese de silicone pode realizar o procedimento no abdômen ou glúteo?',
      answer: 'Sim, desde que os eletrodos fiquem a no mínimo 3cm de distância da cápsula protética e sem cruzar corrente pelo implante.'
    },
    {
      id: 5,
      category: 'Vendas & Avaliação',
      question: 'Qual argumento biológico de ancoragem quebra a objeção de preço na primeira consulta?',
      answer: 'Explicar que 20 minutos de eletroestimulação equivalem a 20.000 contrações supramáximas sem desgaste articular.'
    }
  ];

  const list = cardsData && cardsData.length > 0 ? cardsData : defaultCards;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setMasteredCount(prev => prev + 1);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setMasteredCount(0);
  };

  const isFinished = currentIndex >= list.length;
  const currentCard = list[currentIndex];

  return (
    <DeckWrapper>
      <DeckHeader>
        <div className="title-block">
          <FaFire />
          <span>Tinder dos Protocolos (Flashcards)</span>
        </div>
        <div className="counter-badge">
          {isFinished ? 'Concluído' : `${currentIndex + 1} / ${list.length}`}
        </div>
      </DeckHeader>

      <CardArea>
        <AnimatePresence>
          {!isFinished ? (
            <SingleCard
              key={currentCard.id}
              card={currentCard}
              onSwipe={handleSwipe}
              onAskAi={onAskAi}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
            >
              <FaLayerGroup style={{ fontSize: '3rem', color: '#ED7E13' }} />
              <h3 style={{ margin: 0, color: '#FFFFFF' }}>Parabéns! Baralho Concluído</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', maxWidth: '280px' }}>
                Você fixou <strong>{masteredCount}</strong> de <strong>{list.length}</strong> parâmetros clínicos essenciais de cabine.
              </p>
              <button
                onClick={handleRestart}
                style={{ background: 'linear-gradient(135deg, #ED7E13 0%, #D46A0B 100%)', border: 'none', color: '#FFF', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FaUndo /> Reiniciar Baralho
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardArea>

      {!isFinished && (
        <ActionsBar>
          <button
            className="action-btn btn-nope"
            title="Ainda tenho dúvida (arraste para esquerda)"
            onClick={() => handleSwipe('left')}
          >
            <FaTimes />
          </button>

          {onAskAi && (
            <button
              className="action-btn btn-flip"
              title="Tirar dúvida com a Dra. Harmony AI"
              onClick={() => onAskAi(`Dra. Harmony, me explique sobre este flashcard: "${currentCard.question}"`)}
            >
              <FaRobot />
            </button>
          )}

          <button
            className="action-btn btn-like"
            title="Dominei o protocolo (arraste para direita)"
            onClick={() => handleSwipe('right')}
          >
            <FaCheck />
          </button>
        </ActionsBar>
      )}
    </DeckWrapper>
  );
}
