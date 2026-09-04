import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Ticket } from 'lucide-react';
import BadgeUrgencia from '../components/BadgeUrgencia';
import LuxuryPhotoWidget from '../components/LuxuryPhotoWidget';
import { PRODUCT_IDS } from '../components/TabelaIngressos';
import { AURA_COLORS, AuraButtonPrimary } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

const floatGlow = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
  50% { transform: translateY(-8px) scale(1.05); opacity: 0.8; }
`;

const Section = styled.section`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => ($align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center')};
  justify-content: center;
  text-align: ${({ $align }) => $align || 'center'};
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.25rem 3.5rem' : 
      $spacing === 'generous' ? '9rem 1.5rem 6.5rem' : 
      '7rem 1.5rem 5rem'
    )};
  background: transparent;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: auto;
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4.5rem 1rem 3rem'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 650px;
    height: 380px;
    background: radial-gradient(ellipse, rgba(212, 175, 55, 0.1) 0%, rgba(184, 134, 11, 0.02) 50%, transparent 80%);
    filter: blur(45px);
    pointer-events: none;
    animation: ${floatGlow} 6s ease-in-out infinite;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center')};
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
  position: relative;
  z-index: 2;
  width: 100%;

  @media (max-width: 768px) {
    justify-content: center;
    margin-bottom: 1.25rem;
  }
`;

const Headline = styled(motion.h1)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $sizeScale, $customSize }) => {
    if ($customSize) return `clamp(1.8rem, 5vw, ${$customSize})`;
    switch ($sizeScale) {
      case 'compact': return 'clamp(1.8rem, 4.2vw, 3.2rem)';
      case 'large': return 'clamp(2.5rem, 6vw, 4.6rem)';
      case 'titanic': return 'clamp(2.8rem, 7vw, 5.4rem)';
      case 'normal':
      default: return 'clamp(2.2rem, 5.2vw, 4rem)';
    }
  }};
  font-weight: ${({ $weight }) => $weight || '900'};
  color: #FFFFFF;
  line-height: 1.15;
  max-width: 980px;
  margin: ${({ $align }) => ($align === 'left' ? '0 0 1.5rem' : $align === 'right' ? '0 0 1.5rem auto' : '0 auto 1.5rem')};
  letter-spacing: -0.02em;
  position: relative;
  z-index: 2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    margin: 0 auto 1.2rem;
    text-align: center;
  }

  .gold-gradient {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
`;

const Sub = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize ? `clamp(0.9rem, 2vw, ${$customSize})` : 'clamp(1.05rem, 2vw, 1.25rem)'};
  font-weight: 400;
  color: ${AURA_COLORS.onSurface};
  max-width: 760px;
  margin: ${({ $align }) => ($align === 'left' ? '0 0 2.5rem' : $align === 'right' ? '0 0 2.5rem auto' : '0 auto 2.5rem')};
  line-height: 1.75;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);

  @media (max-width: 768px) {
    margin: 0 auto 1.8rem;
    text-align: center;
  }
`;

const InfoBlock = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => ($align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center')};
  gap: 0.85rem;
  background: ${({ $cardBg }) => $cardBg || AURA_COLORS.surfaceLow};
  border: 1px solid ${({ $borderColor }) => $borderColor || 'rgba(233, 195, 73, 0.25)'};
  border-radius: 14px;
  padding: 1.2rem 1.8rem;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: ${({ $align }) => $align || 'left'};
  align-items: ${({ $align }) => ($align === 'center' ? 'center' : $align === 'right' ? 'flex-end' : 'flex-start')};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${AURA_COLORS.goldGradient};
  }

  @media (max-width: 640px) {
    padding: 1rem 1.2rem;
    margin-bottom: 1.8rem;
    align-items: center;
    text-align: center;
  }
`;

const InfoLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  color: ${AURA_COLORS.onSurface};
  text-align: left;
  width: 100%;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : $align === 'right' ? 'flex-end' : 'flex-start')};

  svg {
    color: #f2ca50;
    flex-shrink: 0;
    margin-right: 0.2rem;
  }

  strong {
    color: #FFFFFF;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    font-size: 0.88rem;
    gap: 0.6rem;
    text-align: left;
    justify-content: flex-start;
  }
`;

const InfoSub = styled.div`
  font-size: 0.8rem;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin-top: 0.15rem;
`;

export default function HeroSection({ settings = {}, onCheckout }) {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (onCheckout) {
      onCheckout('experience');
    } else {
      navigate(`/shop/checkout/${PRODUCT_IDS.EXPERIENCE}`);
    }
  };

  const align = settings.congresso_typo_hero_align || 'center';
  const titleSize = settings.congresso_typo_hero_title_size || 'normal';
  const titleWeight = settings.congresso_typo_hero_title_weight || '900';
  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';

  const showHeroBadge = settings.congresso_hero_badge_active !== 0 && settings.congresso_hero_badge_active !== '0' && settings.congresso_hero_badge_active !== false;
  const heroBadge = settings.congresso_hero_badge || '07 DE NOVEMBRO | SÃO PAULO';
  const locationBadge = settings.congresso_hero_location_badge || settings.congresso_location_badge || '📍 AUDITÓRIO DE ALTO PADRÃO · SÃO PAULO/SP';
  const heroTitle = settings.congresso_hero_title || 'O Encontro Definitivo dos Profissionais que Estão Moldando o Futuro da Musculação Elétrica no Brasil';
  const heroSubtitle = settings.congresso_hero_subtitle || 'Descubra as estratégias, tecnologias e modelos de negócio que estão transformando studios e clínicas em operações de alta lucratividade.';
  const dateText = settings.congresso_date_text || '07 de Novembro de 2026';
  const locationTitle = settings.congresso_location_title || 'Espaço Full Sales — Em frente ao Shopping JK Iguatemi, São Paulo/SP';
  const locationSub = settings.congresso_location_sub || 'A 10 passos do metrô/trem · 15 min do Aeroporto de Congonhas';
  const heroCta = settings.congresso_hero_cta || 'Garanta Seu Ingresso Agora';

  const customSpacing = settings.congresso_spacing_hero;
  const customH1Size = settings.congresso_size_hero_h1;
  const customSubtitleSize = settings.congresso_size_hero_subtitle;

  const showInfoBlock = settings.congresso_hero_infoblock_active !== 0 && settings.congresso_hero_infoblock_active !== '0' && settings.congresso_hero_infoblock_active !== false;
  const infoBlockAlign = settings.congresso_hero_infoblock_align || align;
  const infoCardBg = settings.congresso_hero_card_bg;
  const infoBorderColor = settings.congresso_hero_border_color;
  // Deduplicação inteligente de badges do Hero (PLAN-198)
  const cleanHeroBadge = (heroBadge || '🗓️ 07 DE NOVEMBRO DE 2026').trim();
  let cleanLocationBadge = (locationBadge || '📍 AUDITÓRIO DE ALTO PADRÃO · SÃO PAULO/SP').trim();

  if (cleanHeroBadge.toUpperCase().includes('SÃO PAULO') && cleanLocationBadge.toUpperCase().includes('SÃO PAULO')) {
    cleanLocationBadge = cleanLocationBadge.replace(/·?\s*SÃO PAULO(?:\/SP)?/gi, '').trim();
    if (cleanLocationBadge.endsWith('·')) {
      cleanLocationBadge = cleanLocationBadge.slice(0, -1).trim();
    }
  }

  const photoPosition = settings.congresso_hero_photo_position || 'bottom';
  const ctaPosition = settings.congresso_hero_cta_position || 'after_details';
  const ctaPreset = settings.congresso_hero_cta_preset || 'gold';

  const renderPhotoWidget = () => {
    if (!settings.congresso_hero_photos_json && !settings.congresso_hero_photo_url) return null;
    return (
      <LuxuryPhotoWidget
        photos={settings.congresso_hero_photos_json || settings.congresso_hero_photo_url}
        maxWidth={settings.congresso_hero_photo_size || '400px'}
        borderStyle={settings.congresso_hero_photo_border || 'gold-border'}
        align={align}
        margin="2rem auto 1.5rem"
      />
    );
  };

  const renderCtaBlock = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0' }}>
      <AuraButtonPrimary
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCtaClick}
        style={ctaPreset === 'navy' ? { background: '#0A3E60', color: '#FFFFFF', border: '1.5px solid #ED7E13' } : undefined}
      >
        <LiquidGoldShaderCanvas opacity={0.7} />
        <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
          <Ticket size={20} /> {renderRichText(heroCta)}
        </span>
      </AuraButtonPrimary>

      {/* Micro-copy de Urgência (Seção 1 - Copy 31-08) */}
      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, letterSpacing: '0.01em', marginTop: '0.2rem', textAlign: 'center', maxWidth: '580px' }}>
        {settings.congresso_hero_urgency_text || 'Garanta seu ingresso agora e assegure sua participação em uma experiência única para o mercado brasileiro.'}
      </span>
    </div>
  );

  const renderInfoBlock = () => {
    if (!showInfoBlock) return null;
    return (
      <InfoBlock
        $align={infoBlockAlign}
        $cardBg={infoCardBg}
        $borderColor={infoBorderColor}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <InfoLine $align={infoBlockAlign}>
          <Calendar size={20} />
          <strong>{dateText}</strong>
        </InfoLine>
        <InfoLine $align={infoBlockAlign}>
          <MapPin size={20} />
          <div>
            <div>{locationTitle}</div>
            <InfoSub>{locationSub}</InfoSub>
          </div>
        </InfoLine>
      </InfoBlock>
    );
  };

  return (
    <Section id="hero" $align={align} $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <BadgeRow $align={align}>
        {showHeroBadge && cleanHeroBadge && <BadgeUrgencia label={cleanHeroBadge} />}
        {cleanLocationBadge && <BadgeUrgencia label={cleanLocationBadge} variant="vip" />}
      </BadgeRow>

      {/* Se a foto foi configurada para o Topo */}
      {photoPosition === 'top' && renderPhotoWidget()}

      <Headline
        $align={align}
        $sizeScale={titleSize}
        $weight={titleWeight}
        $customSize={customH1Size}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="gold-gradient">{renderRichText(heroTitle)}</span>
      </Headline>

      <Sub
        $align={align}
        $customSize={customSubtitleSize}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderRichText(heroSubtitle)}
      </Sub>

      {/* Texto de Apoio Oficial (Seção 1 - Copy 31-08) */}
      {(settings.congresso_hero_support_text !== '' && settings.congresso_hero_support_text !== null) && (
        <motion.p
          style={{
            maxWidth: '680px',
            fontSize: '0.92rem',
            color: '#CBD5E1',
            lineHeight: 1.6,
            margin: '0 auto 1.5rem',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {renderRichText(settings.congresso_hero_support_text || 'Tenha acesso a conteúdos relevantes, demonstrações, tecnologias, marcas, profissionais de referência. Conexões que podem impulsionar seus próximos resultados.')}
        </motion.p>
      )}

      {/* Ordem do CTA e Detalhes */}
      {ctaPosition === 'before_details' ? (
        <>
          {renderCtaBlock()}
          {renderInfoBlock()}
        </>
      ) : (
        <>
          {renderInfoBlock()}
          {renderCtaBlock()}
        </>
      )}

      {/* Se a foto foi configurada para a Base (Padrão) */}
      {photoPosition === 'bottom' && renderPhotoWidget()}
    </Section>
  );
}
