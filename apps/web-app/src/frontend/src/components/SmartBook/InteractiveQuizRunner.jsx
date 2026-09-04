import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle, FaTimesCircle, FaLightbulb, FaRedo,
  FaAward, FaCopy, FaCheck, FaBookOpen
} from 'react-icons/fa';

const QuizWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Poppins', sans-serif;
`;

const ScoreHeader = styled.div`
  background: linear-gradient(135deg, rgba(10, 62, 96, 0.6) 0%, rgba(5, 26, 41, 0.9) 100%);
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  .stat-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(237, 126, 19, 0.15);
      border: 1px solid #ED7E13;
      color: #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .meta {
      h4 { margin: 0; font-size: 1.1rem; color: #FFFFFF; font-weight: 700; }
      span { font-size: 0.82rem; color: #94A3B8; }
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const ActionBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.2);
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const QuestionCard = styled(motion.div)`
  background: rgba(5, 26, 41, 0.85);
  border: 1px solid ${({ $answered, $isCorrect }) => {
    if (!$answered) return 'rgba(255, 255, 255, 0.1)';
    return $isCorrect ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
  }};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  transition: border-color 0.3s;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  .q-title {
    font-size: 1rem;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.5;
    margin: 0;
  }

  .badge-level {
    background: rgba(237, 126, 19, 0.15);
    border: 1px solid rgba(237, 126, 19, 0.4);
    color: #ED7E13;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

const OptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const OptionButton = styled.button`
  background: ${({ $isSelected, $isCorrectAnswer, $isAnswered }) => {
    if (!$isAnswered) {
      return $isSelected ? 'rgba(237, 126, 19, 0.2)' : 'rgba(10, 62, 96, 0.25)';
    }
    if ($isCorrectAnswer) return 'rgba(34, 197, 94, 0.2)';
    if ($isSelected && !$isCorrectAnswer) return 'rgba(239, 68, 68, 0.25)';
    return 'rgba(10, 62, 96, 0.15)';
  }};
  border: 1px solid ${({ $isSelected, $isCorrectAnswer, $isAnswered }) => {
    if (!$isAnswered) {
      return $isSelected ? '#ED7E13' : 'rgba(255, 255, 255, 0.1)';
    }
    if ($isCorrectAnswer) return '#22c55e';
    if ($isSelected && !$isCorrectAnswer) return '#ef4444';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: #FFFFFF;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  text-align: left;
  font-size: 0.88rem;
  line-height: 1.4;
  cursor: ${({ $isAnswered }) => $isAnswered ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  transition: all 0.2s;

  .key-badge {
    font-weight: 800;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .text {
    flex: 1;
  }

  &:hover:not(:disabled) {
    background: ${({ $isAnswered }) => !$isAnswered ? 'rgba(237, 126, 19, 0.15)' : ''};
    border-color: ${({ $isAnswered }) => !$isAnswered ? '#ED7E13' : ''};
  }
`;

const JustificationBox = styled(motion.div)`
  background: rgba(10, 62, 96, 0.35);
  border-left: 4px solid #ED7E13;
  padding: 1rem 1.25rem;
  border-radius: 0 10px 10px 0;
  margin-top: 0.5rem;

  .box-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ED7E13;
    font-weight: 700;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }

  p {
    margin: 0;
    color: #E2E8F0;
    font-size: 0.85rem;
    line-height: 1.6;
  }
`;

export default function InteractiveQuizRunner({ markdownText }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [copied, setCopied] = useState(false);

  // Parser robusto de Markdown para Questões Estruturadas
  const parsedQuestions = useMemo(() => {
    if (!markdownText) return [];

    const questions = [];
    const rawBlocks = markdownText.split(/(?=\*\*Quest[aã]o\s*\d+|Quest[aã]o\s*\d+:)/gi);

    for (const block of rawBlocks) {
      if (!block.trim() || !block.match(/Quest[aã]o/i)) continue;

      // 1. Extrair enunciado e nível
      let level = 'Intermediário';
      const levelMatch = block.match(/\[N[ií]vel:\s*([^\]]+)\]/i);
      if (levelMatch) level = levelMatch[1].trim();

      // Enunciado
      const titleMatch = block.match(/(?:\*\*Quest[aã]o\s*\d+[^:]*:\*\*|Quest[aã]o\s*\d+[^:]*:)\s*([^\n]+(?:\n(?![A-D]\)|\*\*Gabarito|Gabarito)[^\n]+)*)/i);
      const questionText = titleMatch ? titleMatch[1].replace(/\[N[ií]vel:[^\]]+\]/gi, '').trim() : 'Pergunta Clínica';

      // 2. Extrair Opções A, B, C, D
      const options = [];
      const optionMatches = [...block.matchAll(/(?:^|\n)\s*([A-D])\)\s*([^\n]+)/gi)];
      for (const m of optionMatches) {
        options.push({ key: m[1].toUpperCase(), text: m[2].trim() });
      }

      // 3. Extrair Gabarito
      let correctKey = 'A';
      const gabaritoMatch = block.match(/(?:\*\*Gabarito:\*\*|Gabarito:)\s*([A-D])/i);
      if (gabaritoMatch) correctKey = gabaritoMatch[1].toUpperCase();

      // 4. Extrair Justificativa
      let justification = '';
      const justMatch = block.match(/(?:Justificativa[^\n]*:|Explica[cç][aã]o[^\n]*:)\s*([\s\S]+?)(?=\n\s*(?:\*\*)?Quest[aã]o|\n\s*---|$)/i);
      if (justMatch) justification = justMatch[1].trim();

      if (options.length > 0) {
        questions.push({
          id: questions.length + 1,
          questionText,
          level,
          options,
          correctKey,
          justification
        });
      }
    }

    return questions;
  }, [markdownText]);

  const handleSelectOption = (questionId, optionKey) => {
    if (selectedAnswers[questionId]) return; // Já respondida
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Contagem de Acertos
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = parsedQuestions.filter(q => selectedAnswers[q.id] === q.correctKey).length;
  const totalCount = parsedQuestions.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  if (parsedQuestions.length === 0) {
    return (
      <div style={{ padding: '2rem', background: '#051A29', borderRadius: '12px', color: '#FFF' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{markdownText}</p>
      </div>
    );
  }

  return (
    <QuizWrapper>
      <ScoreHeader>
        <div className="stat-block">
          <div className="icon-badge">
            <FaAward />
          </div>
          <div className="meta">
            <h4>Simulado Interativo de Fixação</h4>
            <span>
              Progresso: {answeredCount}/{totalCount} respondidas • Acertos: {correctCount}/{totalCount} ({scorePercent}%)
            </span>
          </div>
        </div>

        <div className="actions">
          <ActionBtn onClick={handleReset}>
            <FaRedo /> Reiniciar
          </ActionBtn>
          <ActionBtn onClick={handleCopyAll}>
            {copied ? <><FaCheck style={{ color: '#22c55e' }} /> Copiado</> : <><FaCopy /> Copiar Tudo</>}
          </ActionBtn>
        </div>
      </ScoreHeader>

      {parsedQuestions.map((q) => {
        const isAnswered = Boolean(selectedAnswers[q.id]);
        const chosenKey = selectedAnswers[q.id];
        const isCorrect = isAnswered && chosenKey === q.correctKey;

        return (
          <QuestionCard
            key={q.id}
            $answered={isAnswered}
            $isCorrect={isCorrect}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QuestionHeader>
              <h3 className="q-title">
                {q.id}. {q.questionText}
              </h3>
              <span className="badge-level">{q.level}</span>
            </QuestionHeader>

            <OptionsGrid>
              {q.options.map((opt) => {
                const isSelected = chosenKey === opt.key;
                const isCorrectAnswer = opt.key === q.correctKey;

                return (
                  <OptionButton
                    key={opt.key}
                    $isAnswered={isAnswered}
                    $isSelected={isSelected}
                    $isCorrectAnswer={isAnswered && isCorrectAnswer}
                    onClick={() => handleSelectOption(q.id, opt.key)}
                  >
                    <span className="key-badge">{opt.key}</span>
                    <span className="text">{opt.text}</span>
                    {isAnswered && isCorrectAnswer && <FaCheckCircle style={{ color: '#22c55e', fontSize: '1.1rem' }} />}
                    {isAnswered && isSelected && !isCorrectAnswer && <FaTimesCircle style={{ color: '#ef4444', fontSize: '1.1rem' }} />}
                  </OptionButton>
                );
              })}
            </OptionsGrid>

            <AnimatePresence>
              {isAnswered && (
                <JustificationBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="box-header">
                    <FaLightbulb />
                    <span>Justificativa Fisiológica da Dra. Harmony AI (Gabarito: {q.correctKey})</span>
                  </div>
                  <p>{q.justification || 'A alternativa está alinhada com as dosimetrias e fisiologia muscular do Método Body Harmony.'}</p>
                </JustificationBox>
              )}
            </AnimatePresence>
          </QuestionCard>
        );
      })}
    </QuizWrapper>
  );
}
