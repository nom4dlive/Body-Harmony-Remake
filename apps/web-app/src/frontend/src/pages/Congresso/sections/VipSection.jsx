import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import BadgeUrgencia from '../components/BadgeUrgencia';
import LuxuryPhotoWidget from '../components/LuxuryPhotoWidget';
import { PRODUCT_IDS } from '../components/TabelaIngressos';
import { AURA_COLORS, AuraButtonPrimary, AuraShimmerText } from '../styles/auraGrandPrixTokens';
import VipShaderParticles from '../components/VipShaderParticles';
import { renderRichText } from '../utils/renderRichText';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5.5rem 1.5rem' : 
      $spacing === 'generous' ? '9.5rem 1.5rem' : 
      '7.5rem 1.5rem'
    )};
  background: transparent;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4rem 1rem'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 500px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(184, 134, 11, 0.03) 50%, transparent 75%);
    filter: blur(50px);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const BadgeRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize ? `clamp(1.6rem, 4.2vw, ${$customSize})` : 'clamp(2rem, 4.2vw, 3.2rem)'};
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  margin: 0 0 0.8rem;
  line-height: 1.15;
  letter-spacing: -0.01em;

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Sub = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  text-align: center;
  margin: 0 auto 4rem;
  max-width: 660px;
  line-height: 1.7;
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryVipCard = styled(motion.div)`
  background: linear-gradient(180deg, #131A24 0%, #0A0F16 100%);
  border: 1.5px solid #ED7E13;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(237, 126, 19, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${AURA_COLORS.goldGradient};
    z-index: 5;
  }

  @media (max-width: 540px) {
    padding: 2rem 1.4rem;
  }
`;

const SecondaryInfoCard = styled(motion.div)`
  background: linear-gradient(180deg, #101620 0%, #080C10 100%);
  border: 1px solid rgba(233, 195, 73, 0.3);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #4d4635, #d4af37, #4d4635);
  }

  @media (max-width: 540px) {
    padding: 2rem 1.4rem;
  }
`;

const CardTop = styled.div`
  position: relative;
  z-index: 3;
`;

const CardContentZ = styled.div`
  position: relative;
  z-index: 3;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #f9e27e;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Price = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #f9e27e;
  line-height: 1;
  margin-bottom: 0.5rem;
`;

const PriceTag = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 2rem;
  letter-spacing: 0.04em;
`;

const BenefitsList = styled.ul`
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.5;

  svg {
    color: #f9e27e;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin: 1.5rem 0 2rem;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const StepNumber = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.15rem;
  font-weight: 900;
  color: #f2ca50;
  background: #0a0a0a;
  border: 1px solid #d4af37;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin: 0;
  line-height: 1.6;

  strong {
    color: #FFFFFF;
    font-weight: 700;
  }
`;

const BENEFICIOS_VIP = [
  'Acesso completo ao Congresso (todas as palestras e imersões científicas)',
  'Coquetel privativo exclusivo com Josi e Kaprice — networking VIP',
  'R$ 1.497 revertidos integralmente como crédito na adesão ao Licenciamento',
  'Assento VIP reservado nas primeiras fileiras com mesa executiva',
];

export default function VipSection({ settings = {}, products = [], onCheckout }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  const vipProduct = products.find(p => p.id === PRODUCT_IDS.VIP || p.slug === 'ingresso-vip');
  const vipFeatures = (vipProduct?.features && vipProduct.features.length > 0)
    ? vipProduct.features
    : BENEFICIOS_VIP;

  const vipPriceDisplay = vipProduct?.price_cents 
    ? (vipProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '1.497';

  const handleVipClick = () => {
    if (onCheckout) {
      onCheckout('vip');
    } else {
      navigate(`/shop/checkout/${PRODUCT_IDS.VIP}`);
    }
  };

  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';
  const customSpacing = settings.congresso_spacing_vip;
  const customTitleSize = settings.congresso_size_vip_title;

  const badge = settings.congresso_vip_badge || '👑 EXPERIÊNCIA VIP EXCLUSIVA';
  const title = settings.congresso_vip_title || 'Experiência VIP: Para Quem Quer Estar no Próximo Nível';
  const subtitle = settings.congresso_vip_subtitle || 'Acesso completo ao Congresso com benefícios que nenhum outro participante terá. 100% do valor é revertido como crédito para você se tornar licenciada.';
  const creditTitle = (settings.congresso_vip_credit_title || 'Como funciona o crédito?').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  const cta = settings.congresso_vip_cta || 'Garantir Meu Passaporte VIP';
  const urgencyBadge = settings.congresso_vip_urgency_badge || (vipProduct?.stock_limit ? `Apenas ${vipProduct.stock_limit} Vagas` : '40 Vagas Apenas');

  return (
    <Section id="vip" ref={ref} $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <Container>
        <BadgeRow>
          <BadgeUrgencia label={badge} variant="vip" />
        </BadgeRow>

        <Title
          $customSize={customTitleSize}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span>{renderRichText(title)}</span>
        </Title>
        <Sub
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderRichText(subtitle)}
        </Sub>

        <SplitGrid>
          {/* Card 1: Passaporte VIP + Shader Particles dedicado */}
          <PrimaryVipCard
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Shader GLSL de partículas orbitais em ouro */}
            <VipShaderParticles />

            <CardTop>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <CardHeader style={{ margin: 0 }}>
                  <Crown size={26} />
                  <CardTitle>Passaporte VIP</CardTitle>
                </CardHeader>
                <BadgeUrgencia label={urgencyBadge} variant="vip" />
              </div>

              <Price><AuraShimmerText>R$ {vipPriceDisplay}</AuraShimmerText></Price>
              <PriceTag>100% Revertido em Crédito no Licenciamento</PriceTag>

              <BenefitsList>
                {vipFeatures.map((b, idx) => (
                  <BenefitItem key={idx}>
                    <CheckCircle2 size={18} />
                    <span>{b}</span>
                  </BenefitItem>
                ))}
              </BenefitsList>
            </CardTop>

            <CardContentZ>
              <AuraButtonPrimary
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVipClick}
                style={{ width: '100%' }}
              >
                <LiquidGoldShaderCanvas opacity={0.7} />
                <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Crown size={20} /> {renderRichText(cta)}
                </span>
              </AuraButtonPrimary>
            </CardContentZ>
          </PrimaryVipCard>

          {/* Card 2: Passos Explicativos do Crédito (Inspirado no Sample_01) */}
          <SecondaryInfoCard
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f9e27e', marginBottom: '1.2rem' }}>
                <Info size={24} />
                <h3 style={{ fontFamily: 'Montserrat', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {creditTitle}
                </h3>
              </div>

              <p style={{ fontFamily: 'Montserrat', fontSize: '0.92rem', color: AURA_COLORS.onSurfaceVariant, lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                Você não gasta no evento — você investe diretamente no seu futuro negócio Body Harmony.
              </p>

              <StepList>
                <StepItem>
                  <StepNumber>01</StepNumber>
                  <StepText>
                    <strong>Inscrição VIP Confirmada:</strong> Você garante sua cadeira de honra e acesso ao coquetel privativo exclusivo com Josi e Kaprice.
                  </StepText>
                </StepItem>

                <StepItem>
                  <StepNumber>02</StepNumber>
                  <StepText>
                    <strong>Voucher Nominal Imediato:</strong> O valor integral de <strong>R$ 1.497</strong> é emitido como crédito em seu nome.
                  </StepText>
                </StepItem>

                <StepItem>
                  <StepNumber>03</StepNumber>
                  <StepText>
                    <strong>Abatimento no Licenciamento:</strong> Ao aderir ao Licenciamento Body Harmony, os R$ 1.497 são deduzidos automaticamente da taxa de adesão.
                  </StepText>
                </StepItem>
              </StepList>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: `1px solid ${AURA_COLORS.outlineVariant}` }}>
              <span style={{ fontFamily: 'Montserrat', fontSize: '0.85rem', color: '#f9e27e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                ⭐ Vagas estritamente limitadas a 40 participantes executivos.
              </span>
            </div>
          </SecondaryInfoCard>
        </SplitGrid>

        {/* Slot de Foto / Carrossel Dinâmico da Seção VIP (PLAN-194) */}
        {(settings.congresso_vip_photos_json || settings.congresso_vip_photo_url) && (
          <LuxuryPhotoWidget
            photos={settings.congresso_vip_photos_json || settings.congresso_vip_photo_url}
            maxWidth={settings.congresso_vip_photo_size || '800px'}
            borderStyle={settings.congresso_vip_photo_border || 'gold-glow'}
            align="center"
            margin="3rem auto 0"
          />
        )}
      </Container>
    </Section>
  );
}

