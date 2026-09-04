import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
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
  max-width: 960px;
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
  margin: 0 auto 4rem;
  max-width: 820px;
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

const SliderWrapper = styled.div`
  position: relative;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TestCard = styled(motion.div)`
  background: ${AURA_COLORS.surfaceLow};
  border: 1px solid ${AURA_COLORS.outlineVariant};
  border-radius: 0px;
  padding: 3.5rem;
  text-align: left;
  box-shadow: none;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${AURA_COLORS.goldGradient};
  }

  @media (max-width: 540px) {
    padding: 2rem 1.4rem;
  }
`;

const StarRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 1.2rem;
  color: ${AURA_COLORS.primary};
`;

const QuoteIcon = styled(Quote)`
  color: ${AURA_COLORS.primary};
  margin-bottom: 1.2rem;
  opacity: 0.6;
`;

const Testimonial = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.12rem;
  font-weight: 500;
  color: ${AURA_COLORS.onSurface};
  font-style: italic;
  line-height: 1.8;
  margin: 0 0 2rem;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Avatar = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: ${AURA_COLORS.goldGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  color: #000000;
  flex-shrink: 0;
  position: relative;
  padding: 2px;
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease;

  &:hover {
    transform: ${({ $isClickable }) => ($isClickable ? 'scale(1.08)' : 'none')};
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const SocialTag = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #ED7E13;
  margin-top: 0.25rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #f9e27e;
    text-decoration: underline;
  }
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: #FFFFFF;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AuthorCity = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 0.85rem;
  color: #f9e27e;
  margin-top: 0.15rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
`;

const NavBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 0px;
  border: 1px solid ${AURA_COLORS.outlineVariant};
  background: ${AURA_COLORS.surfaceLow};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #f9e27e;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d4af37;
    color: #0a0a0a;
    background: ${AURA_COLORS.goldGradient};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Dots = styled.div`
  display: flex;
  gap: 0.6rem;
`;

const Dot = styled.div`
  width: 24px;
  height: 3px;
  border-radius: 0px;
  background: ${({ $active }) => $active ? '#d4af37' : AURA_COLORS.outlineVariant};
  transition: all 0.3s;
`;

const DEFAULT_DEPOIMENTOS = [
  {
    id: 'dep_1',
    text: '"Participar dos eventos Body Harmony mudou completamente a minha visão de negócio. Hoje tenho um estúdio lucrativo e uma clientela fiel que indica e retorna todo mês."',
    name: 'Ana Paula Rodrigues',
    city: 'Licenciada em Curitiba/PR',
    initials: 'AP',
    image: '',
    link: 'https://instagram.com/bodyharmonybrasil',
  },
  {
    id: 'dep_2',
    text: '"A metodologia Body Harmony é o diferencial que eu precisava para sair da concorrência de preços. Meu faturamento triplicou em 8 meses após o licenciamento."',
    name: 'Fernanda Costa',
    city: 'Licenciada em Belo Horizonte/MG',
    initials: 'FC',
    image: '',
    link: '',
  },
  {
    id: 'dep_3',
    text: '"O suporte e a formação da Body Harmony são incomparáveis. Não me sinto sozinha no negócio — é como ter uma rede inteira trabalhando pela minha prosperidade."',
    name: 'Carla Mendes',
    city: 'Licenciada em Goiânia/GO',
    initials: 'CM',
    image: '',
    link: '',
  },
  {
    id: 'dep_4',
    text: '"Eu achei que EMS era só mais uma tendência. Depois do congresso, entendi que é uma revolução no fitness. Hoje sou a maior referência da minha cidade nesse nicho."',
    name: 'Juliana Ferreira',
    city: 'Licenciada em Salvador/BA',
    initials: 'JF',
    image: '',
    link: '',
  },
];

export default function TestemunhosSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [idx, setIdx] = useState(0);

  const label = settings.congresso_depoimentos_label || 'Depoimentos';
  const title = settings.congresso_depoimentos_title || 'Quem Já Faz Parte do Universo Body Harmony Fala por Nós';

  let depoimentosList = DEFAULT_DEPOIMENTOS;
  if (settings.congresso_depoimentos_json) {
    try {
      const parsed = typeof settings.congresso_depoimentos_json === 'string'
        ? JSON.parse(settings.congresso_depoimentos_json)
        : settings.congresso_depoimentos_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        depoimentosList = parsed;
      }
    } catch {
      depoimentosList = DEFAULT_DEPOIMENTOS;
    }
  }

  const prev = () => setIdx((i) => (i - 1 + depoimentosList.length) % depoimentosList.length);
  const next = () => setIdx((i) => (i + 1) % depoimentosList.length);

  const safeIdx = Math.min(idx, depoimentosList.length - 1);
  const dep = depoimentosList[safeIdx] || depoimentosList[0] || {};
  const customSpacing = settings.congresso_spacing_testemunhos;

  const hasLink = !!dep.link;
  const targetUrl = dep.link && dep.link.startsWith('@') ? `https://instagram.com/${dep.link.replace('@', '')}` : dep.link;

  return (
    <Section id="depoimentos" ref={ref} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{title}</span>
        </Title>

        <SliderWrapper>
          <AnimatePresence mode="wait">
            <TestCard
              key={safeIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <StarRow>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#f2ca50" color="#f2ca50" />)}
              </StarRow>
              <QuoteIcon size={36} />
              <Testimonial>{dep.text}</Testimonial>
              <AuthorRow>
                <Avatar
                  as={hasLink ? 'a' : 'div'}
                  href={hasLink ? targetUrl : undefined}
                  target={hasLink ? '_blank' : undefined}
                  rel={hasLink ? 'noopener noreferrer' : undefined}
                  $isClickable={hasLink}
                >
                  {dep.image ? (
                    <img src={dep.image} alt={dep.name} />
                  ) : (
                    <div>{dep.initials || (dep.name ? dep.name.slice(0, 2).toUpperCase() : 'BH')}</div>
                  )}
                </Avatar>
                <AuthorInfo>
                  <AuthorName>
                    {dep.name}
                  </AuthorName>
                  <AuthorCity>{dep.city}</AuthorCity>
                  {hasLink && (
                    <SocialTag href={targetUrl} target="_blank" rel="noopener noreferrer">
                      📸 Ver no Instagram
                    </SocialTag>
                  )}
                </AuthorInfo>
              </AuthorRow>
            </TestCard>
          </AnimatePresence>
        </SliderWrapper>

        {depoimentosList.length > 1 && (
          <Controls>
            <NavBtn onClick={prev} aria-label="Anterior"><ChevronLeft size={22} /></NavBtn>
            <Dots>
              {depoimentosList.map((_, i) => <Dot key={i} $active={i === safeIdx} />)}
            </Dots>
            <NavBtn onClick={next} aria-label="Próximo"><ChevronRight size={22} /></NavBtn>
          </Controls>
        )}
      </Container>
    </Section>
  );
}


