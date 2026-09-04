import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import TabelaIngressos from '../components/TabelaIngressos';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.5rem' : 
      $spacing === 'generous' ? '9rem 1.5rem' : 
      '7rem 1.5rem'
    )};
  background: ${AURA_COLORS.background};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '3.5rem 1rem'};
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
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${AURA_COLORS.primary};
  margin-bottom: 0.85rem;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.8rem, 3.8vw, 2.8rem);
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  margin: 0 auto 3.5rem;
  max-width: 760px;
  line-height: 1.2;

  @media (max-width: 768px) {
    margin: 0 auto 2rem;
  }

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export default function IngressosSection({ settings = {}, products = [], onCheckout }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const customSpacing = settings.congresso_spacing_tabela;

  return (
    <Section id="ingressos" ref={ref} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{settings.congresso_tabela_label || 'Ingressos Oficiais'}</SectionLabel>
        <Title
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {settings.congresso_tabela_title ? (
            settings.congresso_tabela_title
          ) : (
            <>Escolha o Seu <span>Nível de Experiência</span></>
          )}
        </Title>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <TabelaIngressos onCheckout={onCheckout} products={products} settings={settings} />
        </motion.div>
      </Container>
    </Section>
  );
}


