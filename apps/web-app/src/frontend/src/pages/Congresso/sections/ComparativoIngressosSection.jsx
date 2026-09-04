import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';
import { renderRichText } from '../utils/renderRichText';
import LiquidGoldShaderCanvas from '../components/LiquidGoldShaderCanvas';

const Section = styled.section`
  padding: ${({ $customSpacing, $spacing }) => 
    $customSpacing || 
    ($spacing === 'compact' ? '3.5rem 0' : $spacing === 'spacious' ? '7rem 0' : '5rem 0')
  };
  background: #04080C;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1000px;
    height: 400px;
    background: radial-gradient(circle, rgba(237, 126, 19, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;
`;

const HeaderBox = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Badge = styled.span`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #FBBF24 100%);
  border: 1px solid #FFF4D0;
  color: #070B0E;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7), 0 0 12px rgba(212, 175, 55, 0.35);
  margin-bottom: 0.85rem;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $customSize }) => $customSize || 'clamp(1.6rem, 3.2vw, 2.4rem)'};
  font-weight: 900;
  color: #FFFFFF;
  line-height: 1.25;
  margin: 0 0 0.85rem;
`;

const Subtitle = styled.p`
  font-size: clamp(0.9rem, 1.8vw, 1.05rem);
  color: #94A3B8;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.6;
`;

/* MOBILE TABS */
const MobileTabs = styled.div`
  display: none;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileTabBtn = styled.button`
  flex: 1;
  max-width: 180px;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.25s ease;
  min-height: 44px;

  ${({ $active, $isVip }) => $active ? css`
    background: ${$isVip ? 'linear-gradient(135deg, #0A3E60 0%, #062338 100%)' : '#0A3E60'};
    color: #FFFFFF;
    border: 1.5px solid ${$isVip ? '#ED7E13' : 'rgba(255, 255, 255, 0.25)'};
    box-shadow: ${$isVip ? '0 0 20px rgba(237, 126, 19, 0.35)' : '0 4px 15px rgba(0,0,0,0.4)'};
  ` : css`
    background: rgba(255, 255, 255, 0.04);
    color: #94A3B8;
    border: 1px solid rgba(255, 255, 255, 0.08);
  `}
`;

/* DESKTOP TABLE */
const TableWrapper = styled.div`
  display: block;
  background: rgba(10, 15, 22, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    display: none;
  }
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1.6rem 1.4rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.92rem;
  font-weight: 800;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ $color }) => $color || '#FFFFFF'};
  background: ${({ $bg }) => $bg || 'transparent'};
  width: ${({ $width }) => $width || 'auto'};
  text-align: ${({ $align }) => $align || 'left'};
  vertical-align: bottom;
`;

const Td = styled.td`
  padding: 1.15rem 1.4rem;
  font-size: 0.88rem;
  color: #CBD5E1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: ${({ $bg }) => $bg || 'transparent'};
  text-align: ${({ $align }) => $align || 'left'};
  vertical-align: middle;
  padding: 0.65rem 0.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? '#0A3E60' : 'transparent'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#94A3B8'};
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  ${({ $active, $isVip }) => $active && $isVip && css`
    background: #ED7E13;
    color: #FFFFFF;
  `}
`;

const MobileCard = styled(motion.div)`
  background: rgba(14, 20, 27, 0.95);
  border: 1.5px solid ${({ $isVip }) => $isVip ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  padding: 1.5rem 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileFeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 1.5rem 0;
`;

const MobileFeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.88rem;
  color: ${({ $included }) => $included ? '#F1F5F9' : '#64748B'};
  line-height: 1.45;
`;

const ActionBtn = styled.button`
  width: 100%;
  padding: 0.95rem 1.25rem;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.92rem;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.25s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #FBBF24 100%);
  color: #070B0E;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid #FFF4D0;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);

  &:hover {
    box-shadow: 0 6px 25px rgba(212, 175, 55, 0.6);
    transform: translateY(-2px);
  }

  span, strong, em {
    color: #070B0E !important;
    font-weight: 900 !important;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) !important;
  }

  svg {
    color: #070B0E;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.5));
  }
`;

const COMPARISON_ITEMS = [
  {
    feature: 'Acesso completo às Palestras Científicas & Práticas',
    experience: true,
    vip: true,
    note: 'Programação de ponta a ponta com especialistas'
  },
  {
    feature: 'Demonstrações práticas com aparelhos EMS de última geração',
    experience: true,
    vip: true,
    note: 'Hands-on e visualização prática do método'
  },
  {
    feature: 'Acesso à Feira de Expositores, Tecnologias & Serviços',
    experience: true,
    vip: true,
    note: 'Marcas líderes do ecossistema fitness e saúde'
  },
  {
    feature: 'Assento reservado com mesa e tomada individual',
    experience: true,
    vip: true,
    note: 'Conforto executivo no Espaço Full Sales'
  },
  {
    feature: 'Certificado Oficial de Participação (Digital)',
    experience: true,
    vip: true,
    note: 'Chancela oficial Body Harmony'
  },
  {
    feature: 'Kit Especial do Congressista',
    experience: true,
    vip: true,
    note: 'Material de apoio e credenciamento oficial'
  },
  {
    feature: 'Mesa de Negócios & Coquetel Privativo com Josi e Kaprice',
    experience: false,
    vip: true,
    note: 'Ambiente intimista e estratégico de alto nível'
  },
  {
    feature: 'Networking Executivo VIP Reservado',
    experience: false,
    vip: true,
    note: 'Conexões diretas com fundadoras e palestrantes'
  },
  {
    feature: '100% do Valor (R$ 1.497) Revertido em Crédito no Licenciamento',
    experience: false,
    vip: true,
    note: 'Investimento revertido integralmente no seu estúdio'
  },
  {
    feature: 'Limite Estrito de Participantes',
    experience: 'Lotação do Auditório',
    vip: 'Apenas 40 Vagas',
    note: 'Exclusividade estrita sem reposição de vagas'
  }
];

export default function ComparativoIngressosSection({ settings = {}, products = [], onCheckout }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const [mobileTab, setMobileTab] = useState('vip'); // 'experience' | 'vip'

  const sectionSpacing = settings.congresso_typo_section_spacing || 'normal';
  const customSpacing = settings.congresso_spacing_comparativo;
  const customTitleSize = settings.congresso_size_comparativo_title;

  const label = settings.congresso_comparativo_label || 'COMPARAÇÃO DE PASSAPORTES';
  const title = settings.congresso_comparativo_title || 'Qual Experiência é a Ideal Para o Seu Momento?';
  const subtitle = settings.congresso_comparativo_subtitle || 'Compare os benefícios de cada categoria e garanta o seu acesso com condições exclusivas de virada de lote.';

  const expProduct = products.find(p => p.id === 2 || p.slug === 'ingresso-experience');
  const vipProduct = products.find(p => p.id === 1 || p.slug === 'ingresso-vip');

  const expPriceStr = expProduct?.price_cents 
    ? `R$ ${(expProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : 'R$ 697';

  const vipPriceStr = vipProduct?.price_cents 
    ? `R$ ${(vipProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : 'R$ 1.497';

  const handleCheckout = (tier) => {
    if (onCheckout) {
      onCheckout(tier);
    } else {
      window.location.href = `/shop/checkout/${tier === 'vip' ? 'ingresso-vip' : 'ingresso-experience'}`;
    }
  };

  return (
    <Section id="comparativo" ref={ref} $spacing={sectionSpacing} $customSpacing={customSpacing}>
      <Container>
        <HeaderBox>
          <Badge>
            <Sparkles size={14} /> {label}
          </Badge>
          <Title $customSize={customTitleSize}>
            {renderRichText(title)}
          </Title>
          <Subtitle>
            {renderRichText(subtitle)}
          </Subtitle>
        </HeaderBox>

        {/* MOBILE TABS CONTROLLER */}
        <MobileTabs>
          <MobileTabBtn
            type="button"
            $active={mobileTab === 'experience'}
            onClick={() => setMobileTab('experience')}
          >
            <Zap size={15} /> Experience
          </MobileTabBtn>
          <MobileTabBtn
            type="button"
            $isVip
            $active={mobileTab === 'vip'}
            onClick={() => setMobileTab('vip')}
          >
            <Crown size={15} color="#ED7E13" /> VIP Exclusive
          </MobileTabBtn>
        </MobileTabs>

        {/* MOBILE CARD ACCORDION / VIEW */}
        <AnimatePresence mode="wait">
          {mobileTab === 'experience' && (
            <MobileCard
              key="mobile-exp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Passaporte Oficial
                  </span>
                  <h3 style={{ fontFamily: 'Montserrat', fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: '0.2rem 0' }}>
                    Ingresso Experience
                  </h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F1F5F9' }}>
                    {expPriceStr} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8' }}>/ 1º Lote</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(10, 62, 96, 0.4)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, color: '#60A5FA' }}>
                  Custo-Benefício
                </div>
              </div>

              <MobileFeatureList>
                {COMPARISON_ITEMS.map((item, idx) => {
                  const isInc = item.experience === true || typeof item.experience === 'string';
                  return (
                    <MobileFeatureItem key={idx} $included={isInc}>
                      {isInc ? (
                        <Check size={18} color="#60A5FA" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <X size={18} color="#475569" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <div>
                        <strong>{item.feature}</strong>
                        {typeof item.experience === 'string' && (
                          <div style={{ fontSize: '0.78rem', color: '#60A5FA', fontWeight: 700 }}>
                            {item.experience}
                          </div>
                        )}
                      </div>
                    </MobileFeatureItem>
                  );
                })}
              </MobileFeatureList>

              <ActionBtn type="button" onClick={() => handleCheckout('experience')}>
                <LiquidGoldShaderCanvas opacity={0.7} />
                <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Garantir Ingresso Experience <ArrowRight size={16} />
                </span>
              </ActionBtn>
            </MobileCard>
          )}

          {mobileTab === 'vip' && (
            <MobileCard
              key="mobile-vip"
              $isVip
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Crown size={13} /> Experiência Boutique
                  </span>
                  <h3 style={{ fontFamily: 'Montserrat', fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: '0.2rem 0' }}>
                    VIP Exclusive
                  </h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f9e27e' }}>
                    {vipPriceStr} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FBBF24' }}>(100% em Crédito)</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, color: '#FBBF24' }}>
                  Apenas 40 Vagas
                </div>
              </div>

              <MobileFeatureList>
                {COMPARISON_ITEMS.map((item, idx) => (
                  <MobileFeatureItem key={idx} $included={true}>
                    <Check size={18} color="#ED7E13" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>{item.feature}</strong>
                      {typeof item.vip === 'string' && (
                        <div style={{ fontSize: '0.78rem', color: '#ED7E13', fontWeight: 800 }}>
                          {item.vip}
                        </div>
                      )}
                    </div>
                  </MobileFeatureItem>
                ))}
              </MobileFeatureList>

              <ActionBtn type="button" $isVip onClick={() => handleCheckout('vip')}>
                <LiquidGoldShaderCanvas opacity={0.7} />
                <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Crown size={16} /> Garantir Ingresso VIP Exclusive
                </span>
              </ActionBtn>
            </MobileCard>
          )}
        </AnimatePresence>

        {/* DESKTOP TABLE VIEW */}
        <TableWrapper>
          <ComparisonTable>
            <thead>
              <tr>
                <Th $width="44%">Benefícios & Diferenciais</Th>
                <Th $width="28%" $align="center" $bg="rgba(255, 255, 255, 0.02)">
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Passaporte Oficial
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 900 }}>
                    Experience
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#60A5FA', fontWeight: 800, marginTop: '0.2rem' }}>
                    {expPriceStr} <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>(Acesso Individual)</span>
                  </div>
                </Th>
                <Th $width="28%" $align="center" $bg="rgba(212, 175, 55, 0.08)">
                  <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Experiência Boutique
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 900 }}>
                    VIP Exclusive
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#f9e27e', fontWeight: 800, marginTop: '0.2rem' }}>
                    {vipPriceStr} <span style={{ fontSize: '0.72rem', color: '#FBBF24' }}>(100% Crédito)</span>
                  </div>
                </Th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ITEMS.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isEven ? 'rgba(255, 255, 255, 0.015)' : 'transparent';
                const vipColBg = isEven ? 'rgba(237, 126, 19, 0.06)' : 'rgba(237, 126, 19, 0.04)';
                return (
                  <tr key={idx}>
                    <Td $bg={rowBg}>
                      <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '0.15rem' }}>
                        {item.feature}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                        {item.note}
                      </div>
                    </Td>

                    <Td $align="center" $bg={rowBg}>
                      {item.experience === true ? (
                        <Check size={20} color="#60A5FA" style={{ margin: '0 auto' }} />
                      ) : item.experience === false ? (
                        <X size={20} color="#475569" style={{ margin: '0 auto' }} />
                      ) : (
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8' }}>
                          {item.experience}
                        </span>
                      )}
                    </Td>

                    <Td $align="center" $bg={vipColBg}>
                      {item.vip === true ? (
                        <Check size={22} color="#ED7E13" style={{ margin: '0 auto' }} />
                      ) : (
                        <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#f9e27e' }}>
                          {item.vip}
                        </span>
                      )}
                    </Td>
                  </tr>
                );
              })}
              <tr>
                <Td $bg="rgba(0,0,0,0.3)" style={{ borderBottom: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.82rem' }}>
                    <ShieldCheck size={18} color="#ED7E13" /> Pagamento 100% seguro via Stone / Asaas com parcelamento em até 12x
                  </div>
                </Td>
                <Td $align="center" $bg="rgba(0,0,0,0.3)" style={{ borderBottom: 'none', padding: '1.25rem 1rem' }}>
                  <ActionBtn type="button" onClick={() => handleCheckout('experience')}>
                    <LiquidGoldShaderCanvas opacity={0.7} />
                    <span style={{ position: 'relative', zIndex: 3 }}>
                      Garantir Experience
                    </span>
                  </ActionBtn>
                </Td>
                <Td $align="center" $bg="rgba(237, 126, 19, 0.12)" style={{ borderBottom: 'none', padding: '1.25rem 1rem' }}>
                  <ActionBtn type="button" $isVip onClick={() => handleCheckout('vip')}>
                    <LiquidGoldShaderCanvas opacity={0.7} />
                    <span style={{ position: 'relative', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Crown size={16} /> Garantir VIP
                    </span>
                  </ActionBtn>
                </Td>
              </tr>
            </tbody>
          </ComparisonTable>
        </TableWrapper>
      </Container>
    </Section>
  );
}