import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaQuestionCircle, FaCheckCircle, FaTimesCircle, 
  FaAward, FaRedo, FaPaperPlane, FaSpinner, FaStar, FaShieldAlt 
} from 'react-icons/fa';
import { api } from '../../../services/api';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 26, 41, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #0A3E60;
  background-image: 
    radial-gradient(circle at 100% 0%, rgba(237, 126, 19, 0.15) 0%, transparent 50%),
    linear-gradient(to bottom, #0A3E60 0%, #051A29 100%);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon {
      color: #ED7E13;
      font-size: 1.5rem;
    }

    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
    }

    p {
      font-size: 0.75rem;
      color: #94A3B8;
      margin: 2px 0 0 0;
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94A3B8;
    font-size: 1.25rem;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;

    &:hover {
      color: #FFFFFF;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.75rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(237, 126, 19, 0.3);
    border-radius: 3px;
  }
`;

const QuestionCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;

  .q-number {
    font-size: 0.75rem;
    font-weight: 700;
    color: #ED7E13;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.35rem;
  }

  .q-text {
    font-size: 0.95rem;
    font-weight: 600;
    color: #FFFFFF;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: ${props => props.$selected ? 'rgba(237, 126, 19, 0.15)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$selected ? '#ED7E13' : 'rgba(255, 255, 255, 0.06)'};
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.08);
    border-color: rgba(237, 126, 19, 0.3);
  }

  input {
    margin-top: 3px;
    accent-color: #ED7E13;
  }

  .option-text {
    font-size: 0.88rem;
    color: ${props => props.$selected ? '#FFFFFF' : '#CBD5E1'};
    line-height: 1.4;
  }
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(5, 26, 41, 0.5);

  .info {
    font-size: 0.8rem;
    color: #94A3B8;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #D86D0B 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultCard = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  .result-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    color: ${props => props.$passed ? '#10B981' : '#EF4444'};
  }

  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
  }

  .score-badge {
    display: inline-block;
    font-size: 2rem;
    font-weight: 800;
    color: ${props => props.$passed ? '#10B981' : '#ED7E13'};
    margin-bottom: 1rem;
  }

  p {
    font-size: 0.95rem;
    color: #CBD5E1;
    max-width: 440px;
    margin: 0 auto 2rem auto;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
`;

export default function QuizModal({ moduleId, moduleTitle, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen && moduleId) {
      loadQuiz();
    }
  }, [isOpen, moduleId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setResult(null);
      setAnswers({});
      const res = await api.getStudentQuiz(moduleId);
      if (res && res.quiz) {
        setQuiz(res.quiz);
        setQuestions(res.questions || []);
      } else {
        setQuiz(null);
        setQuestions([]);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      const res = await api.submitStudentQuiz(quiz.id, answers);
      setResult(res);
      if (res.passed && onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      alert(err.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <ModalHeader>
            <div className="title-group">
              <FaQuestionCircle className="icon" />
              <div>
                <h3>{quiz?.title || `Avaliação – ${moduleTitle}`}</h3>
                <p>Nota mínima de corte: {quiz?.min_score || 70}%</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </ModalHeader>

          <ModalBody>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#ED7E13' }}>
                <FaSpinner className="spin" size={32} />
                <p style={{ marginTop: '0.75rem', color: '#94A3B8' }}>Carregando questões...</p>
                <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : !quiz || questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <FaShieldAlt size={40} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
                <h4>Avaliação Pendente de Cadastro</h4>
                <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>
                  A coordenação técnica ainda não disponibilizou as questões para este módulo.
                </p>
              </div>
            ) : result ? (
              <ResultCard $passed={result.passed}>
                {result.passed ? (
                  <FaCheckCircle className="result-icon" />
                ) : (
                  <FaTimesCircle className="result-icon" />
                )}
                <h2>{result.passed ? 'Parabéns! Você foi Aprovada!' : 'Quase lá! Tente Novamente'}</h2>
                <div className="score-badge">{Math.round(result.score)}%</div>
                <p>
                  {result.passed
                    ? `Você acertou ${result.correct_count} de ${result.total} questões e atingiu a nota exigida para a certificação oficial.`
                    : `Você acertou ${result.correct_count} de ${result.total} questões. A nota mínima para aprovação é de ${result.min_score}%.`}
                </p>
                <div className="actions">
                  {!result.passed ? (
                    <SubmitButton onClick={() => { setResult(null); setAnswers({}); }}>
                      <FaRedo /> Tentar Novamente
                    </SubmitButton>
                  ) : (
                    <SubmitButton onClick={onClose}>
                      <FaCheckCircle /> Concluir e Fechar
                    </SubmitButton>
                  )}
                </div>
              </ResultCard>
            ) : (
              questions.map((q, idx) => (
                <QuestionCard key={q.id || idx}>
                  <div className="q-number">Questão {idx + 1} de {questions.length}</div>
                  <div className="q-text">{q.text}</div>
                  {q.options && q.options.map((opt) => (
                    <OptionLabel
                      key={opt.id}
                      $selected={answers[q.id] === opt.id}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={answers[q.id] === opt.id}
                        onChange={() => handleSelect(q.id, opt.id)}
                      />
                      <span className="option-text">{opt.text}</span>
                    </OptionLabel>
                  ))}
                </QuestionCard>
              ))
            )}
          </ModalBody>

          {!loading && quiz && questions.length > 0 && !result && (
            <ModalFooter>
              <div className="info">
                Respondidas: {Object.keys(answers).length} de {questions.length}
              </div>
              <SubmitButton
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
              >
                {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                {submitting ? 'Enviando...' : 'Finalizar Avaliação'}
              </SubmitButton>
            </ModalFooter>
          )}
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
}
