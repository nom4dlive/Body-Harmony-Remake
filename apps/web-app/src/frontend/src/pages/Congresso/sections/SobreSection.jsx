import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { CheckCircle2, Crown, Sparkles, Instagram, MessageCircle, Mic, Zap, Trophy, Building2, Users } from 'lucide-react';
import LuxuryPhotoWidget from '../components/LuxuryPhotoWidget';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import { ContextualIconBadge } from '../utils/renderContextualIcon';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5.5rem 1.5rem' : 
      $spacing === 'generous' ? '9.5rem 1.5rem' : 
      '7.5rem 1.5rem'
    )};
  background: ${AURA_COLORS.background};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4rem 1rem'};
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  color: ${AURA_COLORS.primary};
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 1rem;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize || '2.75rem'};
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  line-height: 1.15;
  margin: 0 auto 1.5rem;
  max-width: 860px;
  letter-spacing: -0.02em;

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Intro = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize || '1.1rem'};
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  text-align: center;
  line-height: 1.8;
  max-width: 760px;
  margin: 0 auto 3.5rem;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3.5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const BenefitsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: ${AURA_COLORS.surfaceLow};
  border: 1px solid ${AURA_COLORS.outlineVariant};
  border-radius: 12px;
  transition: all 0.25s ease;

  svg {
    color: ${AURA_COLORS.primary};
    flex-shrink: 0;
    margin-top: 2px;
  }

  span {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    color: ${AURA_COLORS.onSurface};
    line-height: 1.6;
  }

  &:hover {
    border-color: #d4af37;
    background: ${AURA_COLORS.surfaceDefault};
    transform: translateX(4px);
  }
`;

const PalestrantesBlock = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PalCard = styled.div`
  background: ${({ $cardBg }) => $cardBg || AURA_COLORS.surfaceLow};
  border: 1px solid ${({ $borderColor }) => $borderColor || AURA_COLORS.outlineVariant};
  border-radius: 16px;
  padding: ${({ $layout }) => ($layout === 'compact' ? '1.25rem' : '1.75rem')};
  display: flex;
  flex-direction: ${({ $layout }) => (
    $layout === 'vertical' ? 'column' : 
    $layout === 'reverse' ? 'row-reverse' : 
    'row'
  )};
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: #d4af37;
    background: ${AURA_COLORS.surfaceDefault};
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 520px) {
    flex-direction: ${({ $layout }) => ($layout === 'horizontal_keep' ? 'row' : 'column')};
    text-align: ${({ $layout }) => ($layout === 'horizontal_keep' ? 'left' : 'center')};
    align-items: center;
    padding: 1.25rem 1rem;
    gap: 1rem;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: ${({ $size }) => $size ? `${$size}px` : '96px'};
  height: ${({ $size }) => $size ? `${$size}px` : '96px'};
  flex-shrink: 0;
  border-radius: 50%;
  padding: 2px;
  background: ${AURA_COLORS.goldGradient};
  cursor: ${({ $isClickable }) => $isClickable ? 'pointer' : 'default'};
  transition: all 0.25s ease;

  &:hover {
    transform: ${({ $isClickable }) => $isClickable ? 'scale(1.06)' : 'none'};
    box-shadow: ${({ $isClickable }) => $isClickable ? '0 0 16px rgba(237, 126, 19, 0.5)' : 'none'};
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: #0a0a0a;
    display: block;
  }
`;

const SocialBadge = styled.a`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #0A3E60;
  border: 2px solid #ED7E13;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    transform: scale(1.15);
    background: #ED7E13;
  }
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${AURA_COLORS.primary};
`;

const PalInfo = styled.div`
  flex: 1;
  text-align: ${({ $align }) => $align || 'left'};
`;

const PalName = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : $align === 'right' ? 'flex-end' : 'flex-start')};

  @media (max-width: 520px) {
    justify-content: center;
  }
`;

const PalRole = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f9e27e;
  margin: 0 0 0.6rem;
  letter-spacing: 0.03em;
`;

const PalDesc = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.88rem;
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin: 0;
  line-height: 1.65;
`;

const BENEFICIOS = [
  'Palestras técnicas e científicas sobre EMS com base clínica e prática',
  'Cases reais de licenciadas Body Harmony que transformaram suas carreiras',
  'Estratégias de negócio para crescer no mercado fitness de alta performance',
  'Networking exclusivo com os maiores nomes do setor',
  'A visão de futuro da musculação elétrica para os próximos 5 anos no Brasil',
  'Kit Congressista Body Harmony Exclusivo',
];

export default function SobreSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';
  const customSpacing = settings.congresso_spacing_sobre;
  const customTitleSize = settings.congresso_size_sobre_title;
  const customBodySize = settings.congresso_size_sobre_body;
  const avatarSize = parseInt(settings.congresso_avatar_size, 10) || 96;
  const palAlign = settings.congresso_palestrante_align || 'left';
  const palCardBg = settings.congresso_palestrante_card_bg;
  const palBorderColor = settings.congresso_palestrante_border_color;
  const [activeTab, setActiveTab] = useState('talks');
  const TAB_IDS = ['talks', 'demos', 'competicao', 'expositores', 'convidados', 'networking'];

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 45;
    const currentIdx = TAB_IDS.indexOf(activeTab);
    if (info.offset.x < -swipeThreshold && currentIdx < TAB_IDS.length - 1) {
      setActiveTab(TAB_IDS[currentIdx + 1]);
    } else if (info.offset.x > swipeThreshold && currentIdx > 0) {
      setActiveTab(TAB_IDS[currentIdx - 1]);
    }
  };

  const label = settings.congresso_sobre_label || 'O Congresso';
  const title = settings.congresso_sobre_title || 'O Que Você Vai Levar Para Sempre Deste Dia';
  const intro = settings.congresso_sobre_intro || 'O Congresso Brasileiro de Musculação Elétrica é o único evento no país dedicado exclusivamente ao universo EMS — reunindo profissionais, empreendedores e apaixonados por tecnologia aplicada ao corpo humano.';

  // Processa lista dinâmica de palestrantes com fallback para Josi e Kaprice
  let palestrantes = [];
  if (settings.congresso_palestrantes_json) {
    try {
      const parsed = typeof settings.congresso_palestrantes_json === 'string'
        ? JSON.parse(settings.congresso_palestrantes_json)
        : settings.congresso_palestrantes_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        palestrantes = parsed;
      }
    } catch (e) {
      console.warn('Erro ao processar congresso_palestrantes_json:', e);
    }
  }

  if (palestrantes.length === 0) {
    palestrantes = [
      {
        id: 'pal_1',
        name: settings.congresso_palestrante_1_name || 'Joselene Silva (Josi)',
        role: settings.congresso_palestrante_1_role || 'Fundadora & CEO da Body Harmony',
        desc: settings.congresso_palestrante_1_desc || 'A mulher que trouxe a revolução EMS para o Brasil e construiu uma rede de licenciadas de ponta a ponta no território nacional.',
        image: settings.congresso_palestrante_1_image || '',
        link: settings.congresso_palestrante_1_link || '',
        icon: <Crown size={28} />,
      },
      {
        id: 'pal_2',
        name: settings.congresso_palestrante_2_name || 'Kaprice',
        role: settings.congresso_palestrante_2_role || 'Licenciada de Destaque & Especialista Prática',
        desc: settings.congresso_palestrante_2_desc || 'A primeira licenciada a provar o modelo no campo de batalha e referência em atendimento clínico de excelência.',
        image: settings.congresso_palestrante_2_image || '',
        link: settings.congresso_palestrante_2_link || '',
        icon: <Sparkles size={28} />,
      },
    ];
  }

  let beneficiosList = BENEFICIOS;
  if (settings.congresso_sobre_beneficios_json) {
    try {
      const parsed = typeof settings.congresso_sobre_beneficios_json === 'string'
        ? JSON.parse(settings.congresso_sobre_beneficios_json)
        : settings.congresso_sobre_beneficios_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        beneficiosList = parsed;
      }
    } catch (e) {
      beneficiosList = BENEFICIOS;
    }
  }

  return (
    <Section id="sobre" ref={ref} $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title
          $customSize={customTitleSize}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{renderRichText(title)}</span>
        </Title>
        <Intro
          $customSize={customBodySize}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderRichText(intro)}
        </Intro>

        {/* CITAÇÃO DE IMPACTO (PLAN-195) */}
        {settings.congresso_sobre_quote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              maxWidth: '860px',
              margin: '0 auto 3.5rem',
              padding: '1.25rem 2rem',
              background: 'rgba(237, 126, 19, 0.06)',
              border: '1px solid rgba(237, 126, 19, 0.3)',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <p style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#F8FAFC',
              lineHeight: 1.6
            }}>
              "{renderRichText(settings.congresso_sobre_quote || 'Enquanto muitos ainda estão tentando entender o futuro do setor, você pode estar no ambiente onde essas transformações já estão acontecendo.')}"
            </p>
          </motion.div>
        )}

        <TwoCol>
          <BenefitsList
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={18} color="#ED7E13" /> Em um único dia, você poderá:
            </h3>
            {beneficiosList.map((b, i) => {
              const isObj = typeof b === 'object' && b !== null;
              const text = isObj ? (b.text || b.title || '') : String(b);
              const iconName = isObj ? b.icon : null;
              const emoji = isObj ? b.emoji : null;

              return (
                <BenefitItem key={i}>
                  <ContextualIconBadge
                    iconName={iconName}
                    emoji={emoji}
                    size={20}
                    color="#ED7E13"
                    style={{ marginTop: '2px' }}
                  />
                  <span>{renderRichText(text)}</span>
                </BenefitItem>
              );
            })}
          </BenefitsList>

          <PalestrantesBlock
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Crown size={18} color="#ED7E13" /> Palestrantes Confirmadas:
            </h3>
            {palestrantes.map((pal, i) => {
              const hasLink = !!pal.link;
              const isWhatsapp = pal.link && (pal.link.includes('wa.me') || pal.link.includes('whatsapp'));
              const targetUrl = pal.link && pal.link.startsWith('@') ? `https://instagram.com/${pal.link.replace('@', '')}` : pal.link;

              return (
                <PalCard 
                  key={pal.id || i} 
                  $cardBg={palCardBg} 
                  $borderColor={palBorderColor}
                  $layout={settings.congresso_palestrante_layout || 'horizontal'}
                >
                  <AvatarWrapper
                    as={hasLink ? 'a' : 'div'}
                    href={hasLink ? targetUrl : undefined}
                    target={hasLink ? '_blank' : undefined}
                    rel={hasLink ? 'noopener noreferrer' : undefined}
                    $size={avatarSize}
                    $isClickable={hasLink}
                    title={hasLink ? `Abrir perfil de ${pal.name}` : undefined}
                  >
                    {pal.image ? (
                      <img
                        src={pal.image}
                        alt={pal.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <DefaultAvatar>{pal.icon || <Crown size={28} />}</DefaultAvatar>
                    )}

                    {hasLink && (
                      <SocialBadge
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={isWhatsapp ? 'Conversar no WhatsApp' : 'Ver perfil no Instagram'}
                      >
                        {isWhatsapp ? <MessageCircle size={13} /> : <Instagram size={13} />}
                      </SocialBadge>
                    )}
                  </AvatarWrapper>
                  <PalInfo $align={palAlign}>
                    <PalName $align={palAlign}>
                      {pal.name}
                    </PalName>
                    <PalRole>{pal.role}</PalRole>
                    <PalDesc>{pal.desc}</PalDesc>
                  </PalInfo>
                </PalCard>
              );
            })}
          </PalestrantesBlock>
        </TwoCol>

        {/* BLOCO 3: PARA QUEM É? (PLAN-195) */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            marginTop: '4.5rem',
            padding: '2.5rem 2rem',
            background: 'linear-gradient(180deg, rgba(14, 19, 24, 0.8) 0%, rgba(10, 62, 96, 0.25) 100%)',
            border: '1px solid rgba(237, 126, 19, 0.25)',
            borderRadius: '20px',
            textAlign: 'center'
          }}
        >
          <h3 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            maxWidth: '850px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.3
          }}>
            {settings.congresso_publico_alvo_title || 'SE VOCÊ TRABALHA COM RESULTADOS, PERFORMANCE OU TRANSFORMAÇÃO, ESTE EVENTO FOI FEITO PARA VOCÊ.'}
          </h3>

          {/* CHIPS DAS 10 ÁREAS PROFISSIONAIS */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.65rem',
            maxWidth: '900px',
            margin: '0 auto 2rem'
          }}>
            {(() => {
              let publicos = [
                'Fisioterapeutas', 'Profissionais de Ed. Física', 'Profissionais de Estética', 'Biomédicos', 'Área da Saúde',
                'Personal Trainers', 'Profissionais de Performance', 'Empresários & Gestores', 'Usuários de EMS', 'Novos Empreendedores'
              ];
              try {
                if (settings.congresso_publico_alvo_json) {
                  const parsed = JSON.parse(settings.congresso_publico_alvo_json);
                  if (Array.isArray(parsed) && parsed.length > 0) publicos = parsed;
                }
              } catch (_) {}
              return publicos.map((pub, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(233, 195, 73, 0.3)',
                    color: '#F1F5F9',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <Sparkles size={12} color="#ED7E13" /> {pub}
                </span>
              ));
            })()}
          </div>

          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.95rem',
            color: '#94A3B8',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {settings.congresso_publico_alvo_quote || 'Você não precisa ter um nível específico de experiência. Precisa apenas estar disposto a aprender, se atualizar e enxergar novas oportunidades antes que elas se tornem comuns.'}
          </p>
        </motion.div>

        {/* BLOCO 4: AS 6 GRANDES ATRAÇÕES & EXPERIÊNCIAS (SEÇÕES 04 A 09 - COPY 31-08) */}
        <div style={{ marginTop: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#ED7E13',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.5rem'
            }}>
              ⚡ PROGRAMAÇÃO & EXPERIÊNCIAS
            </div>
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(1.4rem, 3.2vw, 2.2rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: 0
            }}>
              O Que Espera Por Você no Congresso
            </h3>
          </div>

          {/* NAVEGAÇÃO POR ABAS INTERATIVAS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.55rem',
            marginBottom: '2rem'
          }}>
            {[
              { id: 'talks', label: '🎙️ Talks', icon: <Mic size={15} /> },
              { id: 'demos', label: '⚡ Demos & Prática', icon: <Zap size={15} /> },
              { id: 'competicao', label: '🏆 Competição de Atletas', icon: <Trophy size={15} /> },
              { id: 'expositores', label: '🤝 Expositores', icon: <Building2 size={15} /> },
              { id: 'convidados', label: '✨ Convidados Especiais', icon: <Sparkles size={15} /> },
              { id: 'networking', label: '🌐 Networking', icon: <Users size={15} /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '9999px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 900 : 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: isActive ? 'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #FBBF24 100%)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#070B0E' : '#94A3B8',
                    textShadow: isActive ? '0 1px 0 rgba(255, 255, 255, 0.5)' : 'none',
                    border: isActive ? '1px solid #FFF4D0' : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isActive ? '0 4px 15px rgba(0, 0, 0, 0.7), 0 0 14px rgba(212, 175, 55, 0.4)' : 'none'
                  }}
                >
                  {isActive && <LiquidGoldShaderCanvas opacity={0.75} />}
                  <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'talks' && (
              <motion.div
                key="talks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 20, 27, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
                  border: '1.5px solid rgba(237, 126, 19, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_talks_badge || '🎙️ TALKS'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_talks_title || 'CONHECIMENTO PARA APLICAR, DECIDIR E CRESCER'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_talks_desc || 'Uma programação pensada para ir além da teoria e oferecer ideias, informações e perspectivas que podem ser aplicadas diretamente à sua rotina profissional. Os profissionais convidados compartilharão experiências, estratégias e visões práticas para ajudar você a tomar decisões mais seguras, aprimorar seus atendimentos e identificar caminhos de crescimento.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {['Musculação elétrica', 'Saúde', 'Estética', 'Performance', 'Ciência', 'Treinamento', 'Tecnologia', 'Mercado', 'Empreendedorismo'].map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#F1F5F9' }}>
                      <CheckCircle2 size={16} color="#ED7E13" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(237, 126, 19, 0.06)', border: '1px dashed rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC', textAlign: 'center' }}>
                  "{settings.congresso_talks_footer || 'Você não vai apenas ouvir sobre tendências. Vai entender como elas podem impactar sua atuação.'}"
                </div>
              </motion.div>
            )}

            {activeTab === 'demos' && (
              <motion.div
                key="demos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 20, 27, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
                  border: '1.5px solid rgba(237, 126, 19, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_demos_badge || '⚡ EXPERIÊNCIAS E DEMONSTRAÇÕES'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_demos_title || 'VEJA, COMPARE E ENTENDA A MUSCULAÇÃO ELÉTRICA NA PRÁTICA'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_demos_desc || 'O conhecimento se torna ainda mais valioso quando você consegue visualizar sua aplicação. Durante o congresso, você poderá acompanhar demonstrações práticas, conhecer equipamentos, observar diferentes aplicações e entender como a musculação elétrica pode ser utilizada em contextos de saúde, estética, treinamento e performance.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[
                    'Ampliar sua compreensão sobre a metodologia',
                    'Conhecer novas possibilidades de aplicação',
                    'Avaliar tecnologias com mais clareza',
                    'Identificar soluções para sua rotina ou negócio',
                    'Transformar informação em ação'
                  ].map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#F1F5F9' }}>
                      <Zap size={16} color="#ED7E13" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(237, 126, 19, 0.06)', border: '1px dashed rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC', textAlign: 'center' }}>
                  "{settings.congresso_demos_footer || 'Você verá de perto o que pode fazer diferença na prática profissional.'}"
                </div>
              </motion.div>
            )}

            {activeTab === 'competicao' && (
              <motion.div
                key="competicao"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(135deg, rgba(237, 126, 19, 0.12) 0%, rgba(14, 19, 24, 0.98) 100%)',
                  border: '1.5px solid #ED7E13',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(237, 126, 19, 0.15)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_competicao_badge || '🏆 COMPETIÇÃO DE ATLETAS'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_competicao_title || 'UMA EXPERIÊNCIA EXCLUSIVA QUE COLOCA A MUSCULAÇÃO ELÉTRICA NO CENTRO DA PERFORMANCE'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_competicao_desc || 'Prepare-se para acompanhar uma competição especial, criada para mostrar o potencial da musculação elétrica em um contexto de preparação, disciplina e alto desempenho. Atletas serão preparadas utilizando a musculação elétrica como parte central de sua jornada e subirão ao palco para serem avaliadas por uma equipe de jurados.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {['Preparação', 'Estratégia', 'Evolução', 'Performance', 'Aplicação prática'].map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(237, 126, 19, 0.08)', border: '1px solid rgba(237, 126, 19, 0.25)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF' }}>
                      <Trophy size={16} color="#FBBF24" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(237, 126, 19, 0.08)', border: '1px dashed #ED7E13', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 800, color: '#FBBF24', textAlign: 'center' }}>
                  {settings.congresso_competicao_footer || 'É uma experiência inédita em um congresso do setor e uma oportunidade de enxergar, ao vivo, até onde a musculação elétrica pode contribuir para a performance. Você realmente quer ficar de fora desse momento?'}
                </div>
              </motion.div>
            )}

            {activeTab === 'expositores' && (
              <motion.div
                key="expositores"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 20, 27, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
                  border: '1.5px solid rgba(237, 126, 19, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_expositores_badge || '🤝 EXPOSITORES'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_expositores_title || 'ENCONTRE TECNOLOGIAS, PRODUTOS E OPORTUNIDADES PARA O SEU NEGÓCIO'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_expositores_desc || 'A área de expositores reunirá marcas e soluções que estão movimentando o mercado da musculação elétrica. Você poderá conhecer equipamentos, produtos, tecnologias e serviços, conversar diretamente com representantes e descobrir alternativas para aprimorar sua atuação ou expandir seu negócio.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[
                    'Comparar soluções em um único ambiente',
                    'Conhecer lançamentos e novidades',
                    'Tirar dúvidas diretamente com as marcas',
                    'Encontrar possíveis fornecedores e parceiros',
                    'Identificar oportunidades de investimento e crescimento'
                  ].map((e, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#F1F5F9' }}>
                      <Building2 size={16} color="#ED7E13" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(237, 126, 19, 0.06)', border: '1px dashed rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 800, color: '#ED7E13', textAlign: 'center' }}>
                  ⚡ {settings.congresso_expositores_manifesto || 'CONHECIMENTO + TECNOLOGIA + CONEXÕES = MAIS POSSIBILIDADES PARA VOCÊ'}
                </div>
              </motion.div>
            )}

            {activeTab === 'convidados' && (
              <motion.div
                key="convidados"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 20, 27, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
                  border: '1.5px solid rgba(237, 126, 19, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_convidados_badge || '✨ CONVIDADOS ESPECIAIS'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_convidados_title || 'ALGUNS DOS MOMENTOS MAIS IMPORTANTES AINDA SERÃO REVELADOS'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_convidados_desc || 'O congresso contará com convidados especiais, que serão anunciados ao longo da jornada até o evento. São profissionais e nomes capazes de ampliar sua visão, provocar novas reflexões e tornar a experiência ainda mais relevante. Mas existe um detalhe: algumas surpresas só serão descobertas por quem estiver presente.'}
                </p>

                <div style={{ background: 'rgba(237, 126, 19, 0.06)', border: '1px dashed rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 800, color: '#F8FAFC', textAlign: 'center' }}>
                  👑 {settings.congresso_convidados_cta_text || 'QUEM SERÃO? Garanta seu ingresso e esteja no local para acompanhar cada revelação em primeira mão.'}
                </div>
              </motion.div>
            )}

            {activeTab === 'networking' && (
              <motion.div
                key="networking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 20, 27, 0.95) 0%, rgba(9, 13, 18, 0.98) 100%)',
                  border: '1.5px solid rgba(237, 126, 19, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  cursor: 'grab',
                  touchAction: 'pan-y'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ED7E13', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {settings.congresso_networking_badge || '🌐 NETWORKING'}
                </span>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 0.85rem' }}>
                  {settings.congresso_networking_title || 'UMA CONEXÃO PODE MUDAR O PRÓXIMO PASSO DA SUA CARREIRA'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  {settings.congresso_networking_desc || 'O Congresso de Musculação Elétrica reunirá profissionais de diferentes áreas em um mesmo ambiente, criando oportunidades para conversas que dificilmente aconteceriam no dia a dia.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[
                    'Trocar experiências com profissionais do setor',
                    'Conhecer pessoas com objetivos semelhantes',
                    'Encontrar possíveis parceiros e clientes',
                    'Compartilhar desafios e soluções',
                    'Ampliar sua rede de contatos',
                    'Criar oportunidades para sua carreira ou empresa'
                  ].map((n, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#F1F5F9' }}>
                      <Users size={16} color="#ED7E13" />
                      <span>{n}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(237, 126, 19, 0.06)', border: '1px dashed rgba(237, 126, 19, 0.4)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC', textAlign: 'center' }}>
                  "{settings.congresso_networking_footer || 'Venha pelo conteúdo. Permaneça pelas conexões. E saia com contatos que podem continuar gerando valor muito depois do evento.'}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INDICADORES / DOTS DE PAGINAÇÃO MOBILE COM ALVOS >= 44x44px */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            marginTop: '1.25rem'
          }}>
            {TAB_IDS.map((id, idx) => {
              const isCurrent = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-label={`Ir para atração ${idx + 1}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    width: isCurrent ? '26px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    background: isCurrent ? '#ED7E13' : 'rgba(255, 255, 255, 0.22)',
                    display: 'block',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isCurrent ? '0 0 10px rgba(237, 126, 19, 0.6)' : 'none'
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot de Foto / Carrossel Dinâmico da Seção Sobre (PLAN-194) */}
        {(settings.congresso_sobre_photos_json || settings.congresso_sobre_photo_url) && (
          <LuxuryPhotoWidget
            photos={settings.congresso_sobre_photos_json || settings.congresso_sobre_photo_url}
            maxWidth={settings.congresso_sobre_photo_size || '750px'}
            borderStyle={settings.congresso_sobre_photo_border || 'gold-border'}
            align="center"
            margin="3.5rem auto 0"
          />
        )}
      </Container>
    </Section>
  );
}
