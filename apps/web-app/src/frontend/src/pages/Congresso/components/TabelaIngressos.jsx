import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Crown, 
  Ticket, 
  Sparkles, 
  Gift, 
  Flame, 
  ArrowRight, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { AURA_COLORS, AuraButtonPrimary } from '../styles/auraGrandPrixTokens';
import LoteCountdownTimer from './LoteCountdownTimer';

// IDs dos produtos confirmados via API de produção
export const PRODUCT_IDS = {
  EXPERIENCE: 2,
  VIP: 1,
};

const pulseBorder = keyframes`
  0% { border-color: rgba(237, 126, 19, 0.4); box-shadow: 0 0 15px rgba(237, 126, 19, 0.15); }
  50% { border-color: rgba(237, 126, 19, 0.85); box-shadow: 0 0 25px rgba(237, 126, 19, 0.35); }
  100% { border-color: rgba(237, 126, 19, 0.4); box-shadow: 0 0 15px rgba(237, 126, 19, 0.15); }
`;

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  font-family: 'Montserrat', sans-serif;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Card = styled.div`
  background: ${props => props.$isVip 
    ? 'linear-gradient(180deg, #131A26 0%, #0C121C 100%)' 
    : 'linear-gradient(180deg, #101620 0%, #0A0F17 100%)'};
  border: ${props => props.$isVip 
    ? '2px solid #ED7E13' 
    : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  box-shadow: ${props => props.$isVip 
    ? '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(237, 126, 19, 0.2)' 
    : '0 15px 40px rgba(0, 0, 0, 0.4)'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  ${props => props.$isVip && css`
    animation: ${pulseBorder} 3s infinite ease-in-out;
  `}

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 600px) {
    padding: 1.5rem 1.25rem;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${props => props.$vip ? css`
    background: linear-gradient(135deg, #ED7E13 0%, #D97706 100%);
    color: #FFFFFF;
    box-shadow: 0 2px 10px rgba(237, 126, 19, 0.4);
  ` : css`
    background: rgba(10, 62, 96, 0.4);
    color: #93C5FD;
    border: 1px solid rgba(59, 130, 246, 0.3);
  `}
`;

const VagasLimitadasTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.15);
  color: #F87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CardTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 900;
  color: #FFFFFF;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;

  span {
    color: ${props => props.$isVip ? '#FBBF24' : '#60A5FA'};
  }

  @media (max-width: 600px) {
    font-size: 1.35rem;
  }
`;

const CardSubtitle = styled.p`
  font-size: 0.88rem;
  color: #94A3B8;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  min-height: 42px;

  @media (max-width: 600px) {
    min-height: auto;
    font-size: 0.82rem;
  }
`;

const PriceBox = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .val {
    font-size: 2.4rem;
    font-weight: 900;
    color: ${props => props.$isVip ? '#FBBF24' : '#FFFFFF'};
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 0.35rem;

    small {
      font-size: 1rem;
      font-weight: 700;
      color: #94A3B8;
    }
  }

  .installments {
    font-size: 0.82rem;
    color: #CBD5E1;
    margin-top: 0.4rem;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .val { font-size: 1.9rem; }
  }
`;

const HighlightCreditBox = styled.div`
  background: linear-gradient(135deg, rgba(237, 126, 19, 0.18) 0%, rgba(237, 126, 19, 0.06) 100%);
  border: 1px solid rgba(237, 126, 19, 0.45);
  border-radius: 14px;
  padding: 1rem 1.15rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  .headline {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.88rem;
    font-weight: 900;
    color: #FBBF24;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .copy {
    font-size: 0.82rem;
    color: #F8FAFC;
    line-height: 1.45;
    font-weight: 600;

    strong {
      color: #FFFFFF;
    }
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    font-size: 0.88rem;
    color: #E2E8F0;
    line-height: 1.4;

    svg {
      color: ${props => props.$isVip ? '#FBBF24' : '#38BDF8'};
      flex-shrink: 0;
      margin-top: 2px;
    }

    strong {
      color: #FFFFFF;
    }
  }

  @media (max-width: 600px) {
    gap: 0.75rem;
    li { font-size: 0.82rem; }
  }
`;

const CtaButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s ease;
  min-height: 48px;
  border: none;
  font-family: inherit;

  ${props => props.$vip ? css`
    background: linear-gradient(135deg, #ED7E13 0%, #FBBF24 50%, #D97706 100%);
    color: #0A1118;
    box-shadow: 0 4px 20px rgba(237, 126, 19, 0.4);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(237, 126, 19, 0.6);
    }
  ` : css`
    background: #0A3E60;
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: #06283D;
      border-color: #ED7E13;
      transform: translateY(-2px);
    }
  `}

  &:active {
    transform: scale(0.98);
  }
`;

const ComparisonBox = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 800;
    color: #FBBF24;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 0.85rem;
    }
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    strong {
      font-size: 0.88rem;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    p {
      font-size: 0.82rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.4;

      span {
        color: #FBBF24;
        font-weight: 700;
      }
    }
  }

  @media (max-width: 600px) {
    padding: 1.25rem 1rem;
  }
`;

const DEFAULT_EXPERIENCE_FEATURES = [
  'Acesso ao Congresso Brasileiro de Musculação Elétrica (07/Nov)',
  'Assento reservado com mesa e tomada individual',
  'Acesso total à área de expositores e feira de tecnologias',
  'Networking ativo com profissionais de todo o Brasil',
  'Conteúdo científico e palestras práticas completas',
  'Certificado oficial de participação'
];

const DEFAULT_VIP_FEATURES = [
  'Tudo o que está incluído no Experience',
  'Apenas 40 vagas disponíveis (Garantia de exclusividade)',
  'Acesso aos bastidores com Josi e Kaprice',
  'Mesa de Negócios exclusiva com palestrantes e convidados',
  'Happy Hour & Networking estratégico de alto nível',
  'Oportunidades diretas de negócios e parcerias clínicas',
  'Kit VIP Luxury exclusivo (Bolsa, copo térmico e bloco)'
];

export default function TabelaIngressos({ onCheckout, products = [], settings = {} }) {
  const navigate = useNavigate();

  const expProduct = products.find(p => p.id === PRODUCT_IDS.EXPERIENCE || p.slug === 'ingresso-experience');
  const vipProduct = products.find(p => p.id === PRODUCT_IDS.VIP || p.slug === 'ingresso-vip');

  const expFeatures = (expProduct?.features && expProduct.features.length > 0)
    ? expProduct.features
    : DEFAULT_EXPERIENCE_FEATURES;

  const vipFeatures = (vipProduct?.features && vipProduct.features.length > 0)
    ? vipProduct.features
    : DEFAULT_VIP_FEATURES;

  const expPriceDisplay = expProduct?.price_cents 
    ? (expProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '697';

  const vipPriceDisplay = vipProduct?.price_cents 
    ? (vipProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '1.497';

  const expBadge = settings.congresso_experience_badge || 'Conteúdo & Networking';
  const expTitle = settings.congresso_experience_title || settings.congresso_lote_experience_name || 'Ingresso Experience';
  const expSubtitle = settings.congresso_lote_experience_subtitle || expProduct?.tagline || expProduct?.description || 'A melhor opção para aprender, fazer contatos e dominar as novidades da musculação elétrica com um investimento acessível.';
  const expCta = settings.congresso_experience_cta || 'Garantir Ingresso Experience';

  const vipBadge = settings.congresso_vip_badge || 'Mais Escolhido';
  const vipTitle = settings.congresso_vip_title || settings.congresso_lote_vip_name || 'Ingresso VIP Exclusive';
  const vipSubtitle = settings.congresso_lote_vip_subtitle || vipProduct?.tagline || vipProduct?.description || 'Experiência premium com acesso direto aos bastidores, mesa de negócios e crédito integral para o seu próximo passo profissional.';
  const vipCreditHeadline = settings.congresso_vip_perk_badge || settings.congresso_vip_highlight_headline || `R$ ${vipPriceDisplay} de Crédito Integral`;
  const vipCta = settings.congresso_vip_cta || 'Garantir Ingresso VIP + Crédito';

  let activeLote = null;
  if (settings.congresso_lotes_config_json) {
    try {
      const parsed = typeof settings.congresso_lotes_config_json === 'string'
        ? JSON.parse(settings.congresso_lotes_config_json)
        : settings.congresso_lotes_config_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeLote = parsed.find(l => l.status === 'active') || parsed[0];
      }
    } catch (_) {}
  }

  const goCheckout = (productId) => {
    if (onCheckout) {
      onCheckout(productId === PRODUCT_IDS.VIP ? 'vip' : 'experience');
    } else {
      navigate(`/shop/checkout/${productId}`);
    }
  };

  return (
    <SectionWrapper>
      <CardsGrid>
        {/* CARD 1: INGRESSO EXPERIENCE */}
        <Card>
          <div>
            <BadgeContainer>
              <Badge>
                <Ticket size={14} /> {expBadge}
              </Badge>
              {settings.congresso_experience_perk_badge && (
                <Badge style={{ background: 'rgba(237, 126, 19, 0.15)', color: '#ED7E13', border: '1px solid rgba(237, 126, 19, 0.3)' }}>
                  <Sparkles size={12} /> {settings.congresso_experience_perk_badge}
                </Badge>
              )}
              {activeLote?.show_timer && activeLote?.deadline && (
                <LoteCountdownTimer
                  targetDate={activeLote.deadline}
                  label={activeLote.timer_label || 'Vira em:'}
                  variant="gold"
                />
              )}
            </BadgeContainer>

            <CardTitle>
              {expTitle.includes('Experience') ? (
                <>Ingresso <span>Experience</span></>
              ) : (
                expTitle
              )}
            </CardTitle>

            <CardSubtitle>
              {expSubtitle}
            </CardSubtitle>

            <PriceBox>
              <div className="val">
                <small>R$</small> {expPriceDisplay}
              </div>
              <div className="installments">
                À vista no PIX ou em até 12x no cartão com juros
              </div>
            </PriceBox>

            <BenefitsList>
              {expFeatures.map((feat, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={16} />
                  <span>{feat}</span>
                </li>
              ))}
            </BenefitsList>
          </div>

          <CtaButton 
            type="button" 
            onClick={() => goCheckout(PRODUCT_IDS.EXPERIENCE)}
          >
            <Ticket size={18} />
            <span>{expCta}</span>
          </CtaButton>
        </Card>

        {/* CARD 2: INGRESSO VIP EXCLUSIVE (DESTAQUE MESTRE) */}
        <Card $isVip>
          <div>
            <BadgeContainer>
              <Badge $vip>
                <Flame size={14} /> {vipBadge}
              </Badge>
              <VagasLimitadasTag>
                <Crown size={13} /> {vipProduct?.stock_limit ? `Apenas ${vipProduct.stock_limit} Vagas` : 'Apenas 40 Vagas'}
              </VagasLimitadasTag>
              {activeLote?.show_timer && activeLote?.deadline && (
                <LoteCountdownTimer
                  targetDate={activeLote.deadline}
                  label={activeLote.timer_label || 'Vira em:'}
                  variant="gold"
                />
              )}
            </BadgeContainer>

            <CardTitle $isVip>
              {vipTitle.includes('VIP') ? (
                <>Ingresso <span>VIP Exclusive</span></>
              ) : (
                vipTitle
              )}
            </CardTitle>

            <CardSubtitle>
              {vipSubtitle}
            </CardSubtitle>

            <PriceBox $isVip>
              <div className="val">
                <small>R$</small> {vipPriceDisplay}
              </div>
              <div className="installments">
                À vista no PIX ou em até 12x no cartão com juros
              </div>
            </PriceBox>

            {/* MEGA HIGHLIGHT BOX: CRÉDITO INTEGRAL */}
            <HighlightCreditBox>
              <div className="headline">
                <Gift size={16} /> {vipCreditHeadline}
              </div>
              <div className="copy">
                <strong>100% do valor do seu ingresso</strong> é convertido em desconto direto na sua adesão ao Licenciamento Body Harmony.
              </div>
            </HighlightCreditBox>

            <BenefitsList $isVip>
              {vipFeatures.map((feat, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={16} />
                  <span>{feat}</span>
                </li>
              ))}
            </BenefitsList>
          </div>

          <CtaButton 
            $vip 
            type="button" 
            onClick={() => goCheckout(PRODUCT_IDS.VIP)}
          >
            <Sparkles size={18} />
            <span>{vipCta}</span>
          </CtaButton>
        </Card>
      </CardsGrid>

      {/* SEÇÃO COMPARATIVA / RESUMO DE DECISÃO */}
      <ComparisonBox>
        <div className="header">
          <HelpCircle size={16} /> Qual ingresso escolher?
        </div>
        <div className="grid">
          <div className="item">
            <strong>
              <Ticket size={15} color="#60A5FA" /> Ingresso Experience (R$ {expPriceDisplay})
            </strong>
            <p>
              Ideal se seu objetivo imediato for <strong>conhecimento científico, prática clínica e networking</strong> no evento com investimento acessível.
            </p>
          </div>
          <div className="item">
            <strong>
              <Crown size={15} color="#FBBF24" /> Ingresso VIP Exclusive (R$ {vipPriceDisplay})
            </strong>
            <p>
              Ideal se você busca os bastidores e mesa de negócios, e <span>recebe 100% do valor (R$ {vipPriceDisplay}) de volta em desconto na adesão ao Licenciamento</span>.
            </p>
          </div>
        </div>
      </ComparisonBox>
    </SectionWrapper>
  );
}
