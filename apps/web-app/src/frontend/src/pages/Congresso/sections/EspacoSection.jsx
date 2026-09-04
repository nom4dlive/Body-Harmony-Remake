import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { Building2, Monitor, Armchair, Train, Plane, ShoppingBag } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';
import EspacoCarousel from '../components/EspacoCarousel';
import { renderRichText } from '../utils/renderRichText';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.5rem 6rem' : 
      $spacing === 'generous' ? '9rem 1.5rem 10.5rem' : 
      '6.5rem 1.5rem 7.5rem'
    )};
  background: ${AURA_COLORS.surfaceLowest};
  position: relative;
  border-top: 1px solid ${AURA_COLORS.outlineVariant};
  border-bottom: 1px solid ${AURA_COLORS.outlineVariant};

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4rem 1rem'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #d4af37, transparent);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize ? `clamp(1.5rem, 3.8vw, ${$customSize})` : 'clamp(1.8rem, 3.8vw, 2.8rem)'};
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  margin: 0 auto 1.2rem;
  max-width: 860px;
  line-height: 1.2;
  letter-spacing: -0.01em;

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  text-align: center;
  max-width: 660px;
  margin: 0 auto 3.5rem;
  line-height: 1.7;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }
`;

const Card = styled(motion.div)`
  background: ${AURA_COLORS.surfaceLow};
  border: 1px solid ${AURA_COLORS.outlineVariant};
  border-radius: 12px;
  padding: 1rem 1.15rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #F9E27E 100%);
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #d4af37;
    background: ${AURA_COLORS.surfaceDefault};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 640px) {
    padding: 0.85rem 1rem;
    gap: 0.75rem;
  }
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #0a0a0a;
  border: 1px solid #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f9e27e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CardTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 0.25rem;
  letter-spacing: 0.01em;
  line-height: 1.3;
`;

const CardDesc = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  margin: 0;
  line-height: 1.5;
`;

const DIFERENCIAIS = [
  {
    icon: <Building2 size={22} />,
    title: 'Edifício Triplo A',
    desc: 'Infraestrutura de altíssimo padrão corporativo no centro financeiro de São Paulo.',
  },
  {
    icon: <Armchair size={22} />,
    title: 'Plenária com Mesas Prancha',
    desc: 'Conforto executivo com tomadas embutidas individuais em cada assento para seus dispositivos.',
  },
  {
    icon: <Monitor size={22} />,
    title: 'Painel LED de +40m²',
    desc: 'Imersão visual cinematográfica em cada palestra e demonstração de tecnologia.',
  },
  {
    icon: <Train size={22} />,
    title: 'A 10 Passos do Metrô/Trem',
    desc: 'Acesso rápido, pontual e sem preocupações com o trânsito da capital.',
  },
  {
    icon: <Plane size={22} />,
    title: '15 min do Aeroporto de Congonhas',
    desc: 'Perfeito para participantes de outros estados. Desembarque e chegue em minutos.',
  },
  {
    icon: <ShoppingBag size={22} />,
    title: 'Em Frente ao JK Iguatemi',
    desc: 'O endereço mais nobre e desejado de São Paulo. Estacionamento VIP e alta conveniência.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function EspacoSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';
  const customSpacing = settings.congresso_spacing_espaco;
  const customTitleSize = settings.congresso_size_espaco_title;

  const label = settings.congresso_espaco_label || 'O Local';
  const title = settings.congresso_espaco_title || 'Um Palco à Altura do Congresso que o Mercado Merecia';
  const subtitle = settings.congresso_espaco_subtitle || 'Escolhemos o Espaço Full Sales porque cada detalhe importa quando se trata de aprendizado de alto nível.';
  const galleryJson = settings.congresso_espaco_gallery_json;

  let diferenciaisList = DIFERENCIAIS;
  if (settings.congresso_espaco_diferenciais_json) {
    try {
      const parsed = typeof settings.congresso_espaco_diferenciais_json === 'string'
        ? JSON.parse(settings.congresso_espaco_diferenciais_json)
        : settings.congresso_espaco_diferenciais_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        diferenciaisList = parsed.map((item, idx) => ({
          ...item,
          icon: DIFERENCIAIS[idx]?.icon || DIFERENCIAIS[0].icon
        }));
      }
    } catch (e) {
      diferenciaisList = DIFERENCIAIS;
    }
  }

  return (
    <Section id="espaco" $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title $customSize={customTitleSize}>
          <span>{renderRichText(title)}</span>
        </Title>
        <Subtitle>{renderRichText(subtitle)}</Subtitle>

        {/* Carrossel fotográfico automático com fotos gerenciáveis via CMS */}
        <EspacoCarousel galleryJson={galleryJson} />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Grid>
            {diferenciaisList.map((item, idx) => (
              <Card key={idx} variants={cardVariants}>
                <IconWrap>{item.icon}</IconWrap>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDesc>{item.desc}</CardDesc>
                </div>
              </Card>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Section>
  );
}




