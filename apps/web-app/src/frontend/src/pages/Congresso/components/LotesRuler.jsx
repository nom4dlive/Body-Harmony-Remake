import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { Flame, Clock, Lock, Sparkles } from 'lucide-react';
import useCountdown from '../hooks/useCountdown';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';
import LoteCountdownTimer from './LoteCountdownTimer';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.25), inset 0 0 15px rgba(212, 175, 55, 0.05); }
  50% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.45), inset 0 0 20px rgba(251, 191, 36, 0.12); }
  100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.25), inset 0 0 15px rgba(212, 175, 55, 0.05); }
`;

const RulerContainer = styled.div`
  width: 100%;
  max-width: 860px;
  margin: 1.5rem auto 2.5rem;
  font-family: 'Montserrat', sans-serif;
`;

const LotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const LoteCard = styled(motion.div)`
  position: relative;
  background: ${({ $status }) => (
    $status === 'ativo' ? 'linear-gradient(180deg, rgba(14, 25, 40, 0.95) 0%, rgba(7, 11, 15, 0.98) 100%)' : 
    $status === 'encerrado' ? 'rgba(15, 23, 42, 0.3)' : 
    'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 15, 22, 0.8) 100%)'
  )};
  border: 1.5px solid ${({ $status }) => (
    $status === 'ativo' ? '#D4AF37' : 
    $status === 'encerrado' ? 'rgba(255, 255, 255, 0.06)' : 
    'rgba(212, 175, 55, 0.22)'
  )};
  border-radius: 14px;
  padding: 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.25s ease;
  overflow: hidden;
  backdrop-filter: blur(12px);
  opacity: ${({ $status }) => ($status === 'encerrado' ? 0.45 : 1)};
  ${({ $status }) => $status === 'ativo' && css`
    animation: ${pulseGlow} 3.5s infinite;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $status }) => (
      $status === 'ativo' ? 'linear-gradient(90deg, #B8860B, #FFF4D0, #FBBF24)' : 
      $status === 'encerrado' ? '#334155' : 
      'linear-gradient(90deg, rgba(212, 175, 55, 0.4), rgba(255, 244, 208, 0.6), rgba(212, 175, 55, 0.2))'
    )};
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.65rem;
  background: ${({ $status }) => (
    $status === 'ativo' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #926C00 100%)' : 
    $status === 'encerrado' ? 'rgba(239, 68, 68, 0.12)' : 
    'rgba(212, 175, 55, 0.08)'
  )};
  color: ${({ $status }) => (
    $status === 'ativo' ? '#0A1017' : 
    $status === 'encerrado' ? '#F87171' : 
    '#FBBF24'
  )};
  border: 1px solid ${({ $status }) => (
    $status === 'ativo' ? '#FFF4D0' : 
    $status === 'encerrado' ? 'rgba(239, 68, 68, 0.3)' : 
    'rgba(212, 175, 55, 0.3)'
  )};
  box-shadow: ${({ $status }) => ($status === 'ativo' ? '0 2px 10px rgba(212, 175, 55, 0.4)' : 'none')};
`;

const LoteName = styled.div`
  font-size: 0.92rem;
  font-weight: 800;
  color: ${({ $status }) => ($status === 'ativo' ? '#FFFFFF' : '#CBD5E1')};
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
`;

const PricesBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0.4rem 0;
  width: 100%;
`;

const PriceLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #CBD5E1;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: ${({ $isVip }) => ($isVip ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)')};
  border: ${({ $isVip }) => ($isVip ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid transparent')};

  span.label {
    font-size: 0.74rem;
    font-weight: 600;
    color: ${({ $isVip }) => ($isVip ? '#f9e27e' : '#94A3B8')};
  }

  span.val {
    font-size: 0.98rem;
    font-weight: 900;
    color: ${({ $status, $isVip }) => (
      $status === 'encerrado' ? '#64748B' : 
      $isVip ? '#f9e27e' : 
      '#FFFFFF'
    )};
    text-decoration: ${({ $status }) => ($status === 'encerrado' ? 'line-through' : 'none')};
  }
`;

const TimerBox = styled.div`
  margin-top: 0.75rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px dashed rgba(237, 126, 19, 0.4);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  box-sizing: border-box;

  .timer-label {
    font-size: clamp(0.58rem, 1.8vw, 0.68rem);
    font-weight: 800;
    color: #f2ca50;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    line-height: 1.2;
  }

  .timer-digits {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(0.72rem, 2.4vw, 0.92rem);
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: 0.04em;
    white-space: nowrap;
    line-height: 1.2;
  }
`;

export default function LotesRuler() {
  return null;
}
