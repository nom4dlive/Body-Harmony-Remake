import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, TrendingUp, Sparkles, Shield, Zap } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import { ContextualIconBadge } from '../utils/renderContextualIcon';

const Section = styled.section`
  padding: 6.5rem 1.5rem;
  background: #060A0E;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  color: #ED7E13;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.6rem, 3.5vw, 2.5rem);
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  line-height: 1.2;
  margin: 0 auto 1.25rem;
  max-width: 850px;
`;

const Intro = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  color: #94A3B8;
  text-align: center;
  line-height: 1.75;
  max-width: 750px;
  margin: 0 auto 3.5rem;
`;

const ReasonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 1.25rem;
  margin-bottom: 3.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }
`;

const ReasonCard = styled(motion.div)`
  background: rgba(14, 19, 24, 0.7);
  border: 1px solid rgba(233, 195, 73, 0.18);
  border-radius: 14px;
  padding: 1.25rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #F1F5F9;
    line-height: 1.5;
  }
`;

const ManifestoBox = styled(motion.div)`
  background: linear-gradient(135deg, rgba(237, 126, 19, 0.1) 0%, rgba(10, 62, 96, 0.25) 100%);
  border: 1px solid #ED7E13;
  border-radius: 18px;
  padding: 2.25rem 2rem;
  text-align: center;
  max-width: 850px;
  margin: 0 auto;
  box-shadow: 0 8px 30px rgba(237, 126, 19, 0.12);

  p {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.7;
    margin: 0;
  }
`;

export default function PorQueParticiparSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const label = settings.congresso_por_que_label || 'POR QUE PARTICIPAR?';
  const title = settings.congresso_por_que_title || 'PORQUE ESPERAR PODE CUSTAR MAIS DO QUE O SEU INGRESSO';
  const intro = settings.congresso_por_que_intro || 'O mercado está evoluindo rapidamente. Novas tecnologias, métodos e oportunidades estão surgindo, e quem se atualiza primeiro se prepara melhor para tomar decisões e se posicionar.';
  const fechamento = settings.congresso_por_que_fechamento || 'Um único dia pode gerar ideias, contatos e aprendizados capazes de influenciar seus próximos meses de trabalho. Não espere o mercado mudar para depois tentar alcançá-lo.';

  let items = [
    'Conteúdo direcionado para sua realidade profissional',
    'Demonstrações e experiências práticas ao vivo',
    'Profissionais e especialistas de referência do mercado',
    'Tecnologias e soluções inovadoras em eletroestimulação',
    'Marcas e expositores oficiais reunidos em um único local',
    'Networking estratégico com tomadores de decisão',
    'Competição exclusiva de atletas no palco',
    'Convidados especiais e revelações em primeira mão',
    'Novas possibilidades reais de atuação, faturamento e negócios'
  ];

  try {
    if (settings.congresso_por_que_items_json) {
      const parsed = JSON.parse(settings.congresso_por_que_items_json);
      if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
    }
  } catch (_) {}

  return (
    <Section ref={ref}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderRichText(title)}
        </Title>
        <Intro
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderRichText(intro)}
        </Intro>

        <ReasonsGrid>
          {items.map((it, idx) => {
            const isObj = typeof it === 'object' && it !== null;
            const text = isObj ? (it.text || it.title || '') : String(it);
            const iconName = isObj ? it.icon : null;
            const emoji = isObj ? it.emoji : null;

            return (
              <ReasonCard
                key={idx}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <ContextualIconBadge
                  iconName={iconName}
                  emoji={emoji}
                  size={20}
                  color="#ED7E13"
                  style={{ marginTop: '2px' }}
                />
                <span>{renderRichText(text)}</span>
              </ReasonCard>
            );
          })}
        </ReasonsGrid>

        <ManifestoBox
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>{renderRichText(fechamento)}</p>
        </ManifestoBox>
      </Container>
    </Section>
  );
}
