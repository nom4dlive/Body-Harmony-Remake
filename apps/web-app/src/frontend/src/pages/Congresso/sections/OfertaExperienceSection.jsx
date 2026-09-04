import React, { useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ticket, Zap, CheckCircle2, Clock, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { PRODUCT_IDS } from '../components/TabelaIngressos';
import { AURA_COLORS, AuraButtonPrimary, AuraBadgeChip } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.5rem' : 
      $spacing === 'generous' ? '8.5rem 1.5rem' : 
      '6.5rem 1.5rem'
    )};
  background: #070B0F;
  position: relative;
  overflow: hidden;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '4rem 1rem'};
  }
`;

const Container = styled.div`
  max-width: 920px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Headline = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize ? `clamp(1.6rem, 4.2vw, ${$customSize})` : 'clamp(1.8rem, 3.8vw, 2.8rem)'};
  font-weight: 900;
  color: #FFFFFF;
  line-height: 1.2;
  margin: 1.5rem 0 1rem;
  letter-spacing: -0.01em;

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Copy = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #94A3B8;
  line-height: 1.75;
  margin: 0 auto 2.5rem;
  max-width: 700px;
`;

const ExperienceMasterCard = styled(motion.div)`
  background: linear-gradient(180deg, #0D141C 0%, #080D12 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  border-radius: 22px;
  padding: 3rem 2.5rem;
  max-width: 760px;
  margin: 0 auto 2.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(10, 62, 96, 0.2);
  position: relative;
  overflow: hidden;
  text-align: left;

  @media (max-width: 600px) {
    padding: 2rem 1.25rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TierBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38BDF8;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`;

const TicketTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: #FFFFFF;
  margin: 0;
  line-height: 1.2;
`;

const PriceTag = styled.div`
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
    width: 100%;
  }

  .value {
    font-size: 2.2rem;
    font-weight: 900;
    color: #F8FAFC;
    line-height: 1;
  }

  .installments {
    font-size: 0.8rem;
    color: #94A3B8;
    margin-top: 0.35rem;
    font-weight: 600;
  }
`;

const PerksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const PerkItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: #E2E8F0;
  font-weight: 600;
  line-height: 1.45;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const UrgencyBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(237, 126, 19, 0.1);
  border: 1px dashed rgba(237, 126, 19, 0.4);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #FBBF24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  text-align: center;
`;

const CtaWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
`;

const CtaNote = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: #64748B;
  margin: 0;
`;

export default function OfertaExperienceSection({ settings = {}, onCheckout, products = [] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (onCheckout) {
      onCheckout('experience');
    } else {
      navigate(`/shop/checkout/${PRODUCT_IDS.EXPERIENCE}`);
    }
  };

  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';
  const customSpacing = settings.congresso_spacing_oferta;
  const customTitleSize = settings.congresso_size_oferta_title;

  const badge = settings.congresso_oferta_badge || '1º LOTE DE LANÇAMENTO · VAGAS LIMITADAS';
  const title = settings.congresso_oferta_title || 'Ingresso Experience — O Melhor Custo-Benefício do Ano';
  const copy = settings.congresso_oferta_copy || 'Garanta seu acesso oficial ao 1º Congresso Brasileiro de Musculação Elétrica com valor especial de 1º lote. Tenha acesso a todas as talks, demonstrações práticas, competição de atletas e feira de negócios.';
  const cta = settings.congresso_oferta_cta || 'Garantir Ingresso Experience (1º Lote)';
  const note = settings.congresso_oferta_note || 'Parcelamento em até 12x no cartão. Virada de lote iminente sujeita à lotação do auditório.';

  // Extrair preço dinâmico do produto
  const expProduct = products.find(p => p.id === PRODUCT_IDS.EXPERIENCE || p.slug === 'ingresso-experience');
  const expPrice = expProduct?.price_cents ? `R$ ${(expProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : 'R$ 697';

  const perks = [
    'Acesso a todas as Talks e Palestras do Congresso',
    'Acesso à Feira de Expositores e Marcas Oficiais',
    'Acesso às Demonstrações Práticas ao Vivo',
    'Acesso à Competição Inédita de Atletas EMS',
    'Kit Congressista Body Harmony Exclusivo'
  ];

  return (
    <Section id="oferta" ref={ref} $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <Container>
        <AuraBadgeChip
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Zap size={14} /> {badge}
        </AuraBadgeChip>

        <Headline
          $customSize={customTitleSize}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{renderRichText(title)}</span>
        </Headline>

        <Copy
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderRichText(copy)}
        </Copy>

        {/* Card Mestre do Ingresso Experience com Background Sólido */}
        <ExperienceMasterCard
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardHeader>
            <div>
              <TierBadge>
                <Ticket size={13} /> {settings.congresso_experience_badge || 'Conteúdo & Networking'}
              </TierBadge>
              <TicketTitle>{settings.congresso_experience_title || 'Ingresso Experience'}</TicketTitle>
            </div>
            <PriceTag>
              <div className="value">{expPrice}</div>
              <div className="installments">ou em até 12x no cartão</div>
            </PriceTag>
          </CardHeader>

          <PerksGrid>
            {perks.map((perk, idx) => (
              <PerkItem key={idx}>
                <CheckCircle2 size={18} color="#38BDF8" />
                <span>{perk}</span>
              </PerkItem>
            ))}
          </PerksGrid>

          <CtaWrap>
            <AuraButtonPrimary
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCtaClick}
              style={{ width: '100%', maxWidth: '420px', padding: '1.15rem 2rem', fontSize: '1rem' }}
            >
              <LiquidGoldShaderCanvas opacity={0.7} />
              <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <Ticket size={20} />
                {renderRichText(cta)}
              </span>
            </AuraButtonPrimary>
            <CtaNote>{note}</CtaNote>
          </CtaWrap>
        </ExperienceMasterCard>
      </Container>
    </Section>
  );
}
