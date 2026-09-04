import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import LuxuryPhotoWidget from '../components/LuxuryPhotoWidget';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => {
    if ($customSpacing === 'compact') return '3rem 1.5rem';
    if ($customSpacing === 'generous') return '7rem 1.5rem';
    if ($spacing === 'compact') return '3.5rem 1.5rem';
    if ($spacing === 'generous') return '6.5rem 1.5rem';
    return '5rem 1.5rem';
  }};
  background: radial-gradient(circle at 50% 30%, #0d1e2d 0%, #050b10 100%);
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(237, 126, 19, 0.15);
  border-bottom: 1px solid rgba(237, 126, 19, 0.15);
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  text-align: ${({ $align }) => $align || 'center'};
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.35rem 1rem;
  background: rgba(237, 126, 19, 0.12);
  border: 1px solid rgba(237, 126, 19, 0.35);
  color: #ED7E13;
  border-radius: 50px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 1rem;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => {
    if ($customSize === '2rem') return '2rem';
    if ($customSize === '3rem') return '3rem';
    return 'clamp(1.8rem, 3.8vw, 2.7rem)';
  }};
  font-weight: 900;
  color: #FFFFFF;
  line-height: 1.2;
  margin-bottom: 0.9rem;
  letter-spacing: -0.02em;

  span {
    background: linear-gradient(135deg, #FFFFFF 0%, #f9e27e 60%, #ED7E13 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(0.95rem, 1.6vw, 1.12rem);
  color: #94A3B8;
  max-width: 750px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
`;

export default function GaleriaSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  // Se o gestor desativar a seção de galeria, não renderiza nada
  if (settings.congresso_galeria_active === 0 || settings.congresso_galeria_active === false || settings.congresso_galeria_active === '0') {
    return null;
  }

  const badge = settings.congresso_galeria_badge || 'IMERSÃO & BASTIDORES';
  const title = settings.congresso_galeria_title || 'A Atmosfera Exclusiva do Congresso';
  const subtitle = settings.congresso_galeria_subtitle || 'Momentos de alta performance, networking executivo e tecnologia que transformam a musculação elétrica.';
  
  const photos = settings.congresso_galeria_photos_json || [];
  const maxWidth = settings.congresso_galeria_size || '800px';
  const borderStyle = settings.congresso_galeria_border || 'gold-glow';
  const align = settings.congresso_galeria_align || 'center';
  const spacing = settings.congresso_galeria_spacing || 'normal';
  const customTitleSize = settings.congresso_size_galeria_title;

  return (
    <Section id="galeria" ref={ref} $customSpacing={spacing}>
      <Container $align={align}>
        {badge && <Badge>{badge}</Badge>}
        
        <Title
          $customSize={customTitleSize}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span>{title}</span>
        </Title>

        {subtitle && (
          <Subtitle
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {subtitle}
          </Subtitle>
        )}

        <LuxuryPhotoWidget
          photos={photos}
          maxWidth={maxWidth}
          aspectRatio="16/9"
          borderStyle={borderStyle}
          align={align}
          margin="1rem 0"
        />
      </Container>
    </Section>
  );
}
