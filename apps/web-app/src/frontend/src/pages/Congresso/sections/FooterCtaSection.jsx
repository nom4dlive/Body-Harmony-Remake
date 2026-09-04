import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, MapPin, Ticket, Crown } from 'lucide-react';
import { PRODUCT_IDS } from '../components/TabelaIngressos';
import { AURA_COLORS, AuraButtonPrimary } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.5rem 3.5rem' : 
      $spacing === 'generous' ? '9rem 1.5rem 6.5rem' : 
      '7.5rem 1.5rem 5rem'
    )};
  background: ${AURA_COLORS.surfaceLowest};
  text-align: center;
  position: relative;
  overflow: hidden;
  border-top: 1px solid ${AURA_COLORS.outlineVariant};

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4rem 1rem 3rem'};
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -10%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 350px;
    background: radial-gradient(ellipse, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 4.4vw, 3.2rem);
  font-weight: 900;
  color: #FFFFFF;
  margin: 0 0 1rem;
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
  max-width: 700px;
  margin: 0 auto 4rem;
  line-height: 1.75;

  @media (max-width: 768px) {
    margin: 0 auto 2rem;
  }
`;

const CardGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const CtaCard = styled(motion.div)`
  background: ${AURA_COLORS.surfaceLow};
  border: 1px solid ${({ $vip }) => $vip ? '#d4af37' : AURA_COLORS.outlineVariant};
  border-radius: 0px;
  padding: 3rem 2.5rem;
  text-align: left;
  box-shadow: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $vip }) => $vip ? AURA_COLORS.goldGradient : 'linear-gradient(90deg, #99907c, #4d4635)'};
  }

  @media (max-width: 540px) {
    padding: 2rem 1.4rem;
  }
`;

const CardIcon = styled.div`
  color: ${AURA_COLORS.primary};
  margin-bottom: 1.2rem;
`;

const CardType = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f9e27e;
  margin-bottom: 0.4rem;
`;

const CardTagline = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.92rem;
  font-weight: 600;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin-bottom: 1.2rem;
`;

const CardPrice = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.3rem;
  font-weight: 900;
  color: #FFFFFF;
  margin-bottom: 1.8rem;
`;

const TrustRow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin-bottom: 3rem;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${AURA_COLORS.onSurfaceVariant};

  svg {
    color: ${AURA_COLORS.primary};
  }
`;

const InstitutionalLine = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
  color: ${AURA_COLORS.outline};
  margin: 0;
  line-height: 1.8;
`;

export default function FooterCtaSection({ settings = {}, onCheckout }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  const handleCheckoutClick = (type) => {
    if (onCheckout) {
      onCheckout(type);
    } else {
      const id = type === 'vip' ? PRODUCT_IDS.VIP : PRODUCT_IDS.EXPERIENCE;
      navigate(`/shop/checkout/${id}`);
    }
  };

  const title = settings.congresso_footer_title || 'SEU LUGAR PRECISA ESTAR ENTRE OS PROFISSIONAIS QUE ESTÃO CONSTRUINDO O FUTURO DO MERCADO.';
  const subtitle = settings.congresso_footer_subtitle || 'Garanta agora seu ingresso para o Congresso de Musculação Elétrica e tenha acesso a um dia completo de conhecimento, prática, tecnologia, conexões e oportunidades. Não deixe para decidir depois. As vagas são limitadas, e os melhores momentos do congresso só poderão ser vividos por quem estiver presente.';
  const customSpacing = settings.congresso_spacing_footer;

  return (
    <Section id="inscricao" ref={ref} $customSpacing={customSpacing}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{title}</span>
        </Title>
        <Sub
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {subtitle}
        </Sub>

        <CardGrid
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <CtaCard whileHover={{ y: -4 }}>
            <CardIcon><Ticket size={32} /></CardIcon>
            <CardType>{settings.congresso_experience_title || 'Ingresso Experience'}</CardType>
            <CardTagline>{settings.congresso_experience_perk_badge || 'Melhor opção Custo-Benefício'}</CardTagline>
            <CardPrice>R$ 697</CardPrice>
            <AuraButtonPrimary
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckoutClick('experience')}
              style={{ width: '100%' }}
            >
              <LiquidGoldShaderCanvas opacity={0.7} />
              <span style={{ position: 'relative', zIndex: 3 }}>
                {renderRichText(settings.congresso_experience_cta || 'Garantir Ingresso Experience')}
              </span>
            </AuraButtonPrimary>
          </CtaCard>

          <CtaCard $vip whileHover={{ y: -4 }}>
            <CardIcon><Crown size={32} /></CardIcon>
            <CardType>Ingresso VIP Exclusive</CardType>
            <CardTagline>40 vagas · Crédito R$ 1.497 no Licenciamento</CardTagline>
            <CardPrice>R$ 1.497</CardPrice>
            <AuraButtonPrimary
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckoutClick('vip')}
              style={{ width: '100%' }}
            >
              <LiquidGoldShaderCanvas opacity={0.7} />
              <span style={{ position: 'relative', zIndex: 3 }}>
                {renderRichText(settings.congresso_vip_cta || 'Garantir Minha Vaga VIP')}
              </span>
            </AuraButtonPrimary>
          </CtaCard>
        </CardGrid>

        <TrustRow
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <TrustItem><ShieldCheck size={18} /> Compra 100% Segura</TrustItem>
          <TrustItem><Award size={18} /> Kit Congressista Exclusivo</TrustItem>
          <TrustItem><MapPin size={18} /> Espaço Full Sales · São Paulo/SP</TrustItem>
        </TrustRow>

        <InstitutionalLine>
          BODY HARMONY ELETROESTIMULAÇÃO LTDA. · CNPJ 68.016.506/0001-22<br />
          Rua Sebastião da Silva Leite, 456 · Vila Rosângela · CEP 19.814-370 · Assis/SP
        </InstitutionalLine>
      </Container>
    </Section>
  );
}


