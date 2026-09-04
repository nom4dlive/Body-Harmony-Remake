import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Clock } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const TimerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  max-width: 320px;
  margin: 0.65rem auto 0;
  font-family: 'Montserrat', sans-serif;
  user-select: none;
`;

const HeaderLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  color: #D4AF37;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const UnitsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
`;

const UnitCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const BoxDigit = styled.div`
  width: 100%;
  background: rgba(11, 18, 24, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 6px;
  padding: 0.45rem 0.15rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.15rem;
  font-weight: 900;
  color: #FBBF24;
  line-height: 1;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #B8860B 0%, #FFF4D0 50%, #FBBF24 100%);
  }
`;

const UnitText = styled.span`
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94A3B8;
`;

const Sep = styled.div`
  font-size: 0.95rem;
  font-weight: 900;
  color: #D4AF37;
  margin-bottom: 0.75rem;
`;

const PositivePill = styled.div`
  padding: 0.45rem 0.85rem;
  background: rgba(237, 126, 19, 0.15);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 9999px;
  color: #FBBF24;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

export default function LoteCountdownTimer({
  targetDate,
  deadline,
  label = 'Virada de Lote em:',
  style = {}
}) {
  const rawDate = targetDate || deadline || '2026-09-30T23:59:59';
  const finalDeadline = typeof rawDate === 'string' ? rawDate.trim().replace(' ', 'T') : rawDate;

  const calculateTimeLeft = useMemo(() => {
    return () => {
      const parsedTarget = new Date(finalDeadline).getTime();
      if (isNaN(parsedTarget)) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const difference = parsedTarget - Date.now();
      if (difference <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        total: difference,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };
  }, [finalDeadline]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.total <= 0) {
    return (
      <TimerWrapper style={style}>
        <PositivePill>⚡ 1º Lote Vigente — Vagas Restritas</PositivePill>
      </TimerWrapper>
    );
  }

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <TimerWrapper style={style}>
      {label && (
        <HeaderLabel>
          <Clock size={12} color="#D4AF37" />
          {label}
        </HeaderLabel>
      )}
      <UnitsRow>
        <UnitCol>
          <BoxDigit>{pad(timeLeft.days)}</BoxDigit>
          <UnitText>DIAS</UnitText>
        </UnitCol>
        <Sep>:</Sep>
        <UnitCol>
          <BoxDigit>{pad(timeLeft.hours)}</BoxDigit>
          <UnitText>HORAS</UnitText>
        </UnitCol>
        <Sep>:</Sep>
        <UnitCol>
          <BoxDigit>{pad(timeLeft.minutes)}</BoxDigit>
          <UnitText>MIN</UnitText>
        </UnitCol>
        <Sep>:</Sep>
        <UnitCol>
          <BoxDigit>{pad(timeLeft.seconds)}</BoxDigit>
          <UnitText>SEG</UnitText>
        </UnitCol>
      </UnitsRow>
    </TimerWrapper>
  );
}