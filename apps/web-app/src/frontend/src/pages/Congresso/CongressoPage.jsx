import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { shopApi } from '../../services/api';
import { AURA_COLORS } from './styles/auraGrandPrixTokens';
import AuraShaderBackground from './components/AuraShaderBackground';
import GoldDustParticles from './components/GoldDustParticles';

// Seções da Landing Page
import HeroSection from './sections/HeroSection';
import EspacoSection from './sections/EspacoSection';
import SobreSection from './sections/SobreSection';
import PorQueParticiparSection from './sections/PorQueParticiparSection';
import ComparativoIngressosSection from './sections/ComparativoIngressosSection';
import OfertaExperienceSection from './sections/OfertaExperienceSection';
import IngressosSection from './sections/IngressosSection';
import VipSection from './sections/VipSection';
import CountdownSection from './sections/CountdownSection';
import TestemunhosSection from './sections/TestemunhosSection';
import GaleriaSection from './sections/GaleriaSection';
import FaqSection from './sections/FaqSection';
import FooterCtaSection from './sections/FooterCtaSection';
import CongressCheckoutModal from './components/CongressCheckoutModal';
import CongressTicketLookupModal from './components/CongressTicketLookupModal';
import { Ticket, Sparkles } from 'lucide-react';

/**
 * CongressoPage — Landing Page do Congresso Brasileiro de Musculação Elétrica
 * Design: Aura Grand Prix (Sharp 0px, Midnight Obsidian, WebGL Fluid Shader & Gold Dust)
 * Rota pública: /congresso
 * URL canônica: https://bodyharmony.com.br/congresso
 */

const PageWrapper = styled.div`
  min-height: 100vh;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: transparent;
  color: ${AURA_COLORS.onSurface};
  overflow-x: hidden;
  position: relative;
  letter-spacing: -0.01em;
`;

const TopNavBar = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  background: linear-gradient(180deg, rgba(8, 12, 16, 0.9) 0%, transparent 100%);

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

const BrandBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #FFFFFF;

  span {
    color: #f9e27e;
  }
`;

const LookupNavBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #f9e27e;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.55rem 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
  min-height: 38px;

  &:hover {
    background: rgba(212, 175, 55, 0.15);
    border-color: #d4af37;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
  }
`;

const ShaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% 10%, rgba(10, 62, 96, 0.15) 0%, transparent 70%),
              linear-gradient(180deg, rgba(8, 12, 16, 0.4) 0%, rgba(8, 12, 16, 0.95) 100%);
  pointer-events: none;
  z-index: 2;
`;

const ContentLayer = styled.main`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DEFAULT_SECTIONS_ORDER = [
  'hero',
  'sobre',
  'porque',
  'espaco',
  'oferta',
  'vip',
  'comparativo',
  'galeria',
  'testemunhos',
  'countdown',
  'faq',
  'footer'
];

const SECTION_COMPONENTS = {
  hero: (s, p, c) => <HeroSection key="hero" settings={s} onCheckout={c} />,
  sobre: (s) => <SobreSection key="sobre" settings={s} />,
  porque: (s) => <PorQueParticiparSection key="porque" settings={s} />,
  oferta: (s, p, c) => <OfertaExperienceSection key="oferta" settings={s} products={p} onCheckout={c} />,
  vip: (s, p, c) => <VipSection key="vip" settings={s} products={p} onCheckout={c} />,
  comparativo: (s, p, c) => <ComparativoIngressosSection key="comparativo" settings={s} products={p} onCheckout={c} />,
  tabela: (s, p, c) => <IngressosSection key="tabela" settings={s} products={p} onCheckout={c} />,
  espaco: (s) => <EspacoSection key="espaco" settings={s} />,
  galeria: (s) => <GaleriaSection key="galeria" settings={s} />,
  resumo: (s, p, c) => <ComparativoIngressosSection key="comparativo" settings={s} products={p} onCheckout={c} />,
  testemunhos: (s) => <TestemunhosSection key="testemunhos" settings={s} />,
  countdown: (s, p, c) => <CountdownSection key="countdown" settings={s} onCheckout={c} />,
  faq: (s) => <FaqSection key="faq" settings={s} />,
  footer: (s, p, c) => <FooterCtaSection key="footer" settings={s} onCheckout={c} />
};

export default function CongressoPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, tier: 'experience' });
  const [lookupModalOpen, setLookupModalOpen] = useState(false);

  const openCheckout = (tier = 'experience') => {
    navigate(`/congresso/checkout?tier=${tier}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const prevTitle = document.title;
    document.title = '1º Congresso Brasileiro de Musculação Elétrica | Body Harmony';

    // Carregamento resiliente de settings e produtos
    const loadSettings = shopApi.getSettings || shopApi.getPublicSettings;
    if (typeof loadSettings === 'function') {
      loadSettings()
        .then(res => {
          if (res?.data) {
            setSettings(res.data);
          }
        })
        .catch(err => {
          console.warn('[CongressoPage] Falha ao carregar configurações dinâmicas:', err);
        });
    }

    shopApi.getProducts('ingressos')
      .then(res => {
        if (res?.data && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      })
      .catch(err => {
        console.warn('[CongressoPage] Falha ao carregar ingressos do catálogo:', err);
      });

    return () => { document.title = prevTitle; };
  }, []);

  // Obter ordem personalizada das seções com fallback seguro (PLAN-166)
  const sectionsOrder = useMemo(() => {
    if (!settings.congresso_sections_order || typeof settings.congresso_sections_order !== 'string') {
      return DEFAULT_SECTIONS_ORDER;
    }
    const parsed = settings.congresso_sections_order.split(',').map(s => s.trim()).filter(Boolean);
    const valid = parsed.filter(id => id in SECTION_COMPONENTS);
    const missing = DEFAULT_SECTIONS_ORDER.filter(id => !valid.includes(id));
    return [...valid, ...missing];
  }, [settings.congresso_sections_order]);

  return (
    <PageWrapper>
      {/* Background WebGL Shader FBM fluido */}
      <AuraShaderBackground />
      {/* Sistema de partículas de poeira de ouro */}
      <GoldDustParticles />
      {/* Overlay de contraste para legibilidade AAA */}
      <ShaderOverlay />

      <ContentLayer>
        {sectionsOrder.map((sectionId) => {
          const isActive = settings[`congresso_section_${sectionId}_active`] !== 0;
          if (!isActive) return null;
          const renderFn = SECTION_COMPONENTS[sectionId];
          return renderFn ? renderFn(settings, products, openCheckout) : null;
        })}
      </ContentLayer>

      {/* Modal Luxury de Checkout Embutido Asaas / Mock (PLAN-159) */}
      <CongressCheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, tier: 'experience' })}
        initialTier={checkoutModal.tier}
      />

      {/* Modal de Consulta e Auto-Recuperação de Ingressos por CPF (PLAN-161) */}
      <CongressTicketLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
      />
    </PageWrapper>
  );
}



