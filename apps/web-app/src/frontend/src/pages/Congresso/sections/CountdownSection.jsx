import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { renderRichText } from '../utils/renderRichText';
import useCountdown from '../hooks/useCountdown';
import { PRODUCT_IDS } from '../components/TabelaIngressos';
import { AURA_COLORS, AuraButtonPrimary } from '../styles/auraGrandPrixTokens';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

// Data-alvo: 07 de Novembro de 2026, às 08:00 BRT (UTC-3)
const EVENTO_DATE = '2026-11-07T08:00:00-03:00';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '4.5rem 1.5rem' : 
      $spacing === 'generous' ? '8.5rem 1.5rem' : 
      '6.5rem 1.5rem'
    )};
  background: ${AURA_COLORS.surfaceLowest};
  text-align: center;
  position: relative;
  overflow: hidden;
  border-top: 1px solid ${AURA_COLORS.outlineVariant};
  border-bottom: 1px solid ${AURA_COLORS.outlineVariant};

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '3.5rem 1rem'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(ellipse, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${AURA_COLORS.primary};
  margin-bottom: 0.85rem;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  font-weight: 900;
  color: #FFFFFF;
  margin: 0 auto 3.5rem;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    margin: 0 auto 2rem;
  }
`;

const TimerRow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.2rem, 1.8vw, 1.5rem);
  margin-bottom: 2.5rem;
  flex-wrap: nowrap;
  width: 100%;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.3rem, 1vw, 0.6rem);
  flex: 1;
  min-width: 0;
`;

const Digits = styled.div`
  width: 100%;
  min-width: 0;
  background: ${AURA_COLORS.surfaceLow};
  border: 1px solid ${AURA_COLORS.outline};
  border-radius: 8px;
  padding: clamp(0.65rem, 2.2vw, 1.3rem) clamp(0.15rem, 0.8vw, 0.5rem);
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.35rem, 5.2vw, 3.4rem);
  font-weight: 900;
  color: #f9e27e;
  line-height: 1;
  box-shadow: none;
  position: relative;
  text-align: center;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${AURA_COLORS.goldGradient};
  }
`;

const UnitLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(0.55rem, 1.5vw, 0.75rem);
  font-weight: 800;
  letter-spacing: clamp(0.04em, 0.2vw, 0.15em);
  text-transform: uppercase;
  color: ${AURA_COLORS.onSurfaceVariant};
  white-space: nowrap;
`;

const Separator = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.1rem, 3.5vw, 2.2rem);
  font-weight: 900;
  color: ${AURA_COLORS.primary};
  padding-bottom: clamp(0.8rem, 2vw, 1.6rem);
  flex-shrink: 0;
`;

const Urgency = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin: 0 0 3.5rem;
`;

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownSection({ settings = {}, onCheckout }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const targetDate = settings.congresso_countdown_end_date || EVENTO_DATE;
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  const handleCtaClick = () => {
    if (onCheckout) {
      onCheckout('experience');
    } else {
      navigate(`/shop/checkout/${PRODUCT_IDS.EXPERIENCE}`);
    }
  };

  const label = settings.congresso_countdown_badge || settings.congresso_countdown_label || 'VAGAS LIMITADAS · 1º LOTE';
  const title = settings.congresso_countdown_title || 'O Congresso começa em:';
  const urgency = settings.congresso_countdown_urgency || 'As vagas não esperam. Garanta a sua agora.';
  const cta = settings.congresso_countdown_cta || 'Inscrever-me Agora';
  const customSpacing = settings.congresso_spacing_countdown;

  return (
    <Section id="countdown" ref={ref} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title>{title}</Title>

        {expired ? (
          <p style={{ color: '#f9e27e', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Montserrat' }}>
            🎉 O evento já aconteceu. Fique ligado nas próximas edições!
          </p>
        ) : (
          <>
            <TimerRow
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <TimeUnit>
                <Digits>{pad(days)}</Digits>
                <UnitLabel>Dias</UnitLabel>
              </TimeUnit>
              <Separator>:</Separator>
              <TimeUnit>
                <Digits>{pad(hours)}</Digits>
                <UnitLabel>Horas</UnitLabel>
              </TimeUnit>
              <Separator>:</Separator>
              <TimeUnit>
                <Digits>{pad(minutes)}</Digits>
                <UnitLabel>Min</UnitLabel>
              </TimeUnit>
              <Separator>:</Separator>
              <TimeUnit>
                <Digits>{pad(seconds)}</Digits>
                <UnitLabel>Seg</UnitLabel>
              </TimeUnit>
            </TimerRow>

            <Urgency>{urgency}</Urgency>

            <AuraButtonPrimary
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCtaClick}
            >
              <LiquidGoldShaderCanvas opacity={0.7} />
              <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <Ticket size={20} /> {renderRichText(cta)}
              </span>
            </AuraButtonPrimary>
          </>
        )}
      </Container>
    </Section>
  );
}


