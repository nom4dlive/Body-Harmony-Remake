import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ShieldCheck, 
  Award, 
  MessageCircle, 
  ArrowLeft,
  Zap,
  Sparkles
} from 'lucide-react';
import { shopApi } from '../../services/api';
import TiltProductCard3D from './components/TiltProductCard3D';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CongressCheckoutModal from '../Congresso/components/CongressCheckoutModal';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #F8FAFC;
  color: #0A3E60;
  font-family: 'Montserrat', sans-serif;
  overflow-x: hidden;
`;

const TopBar = styled.div`
  background: #051A29;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
  }
`;

const BackHomeLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #E2E8F0;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #ED7E13;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const HeroStage3D = styled.section`
  background: linear-gradient(135deg, #0A3E60 0%, #06263B 100%);
  color: #FFFFFF;
  padding: 4.5rem 1.5rem 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  /* 3D Ambient Stage Lighting */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle 600px at var(--stage-x, 50%) var(--stage-y, 40%), rgba(237, 126, 19, 0.15) 0%, rgba(10, 62, 96, 0.05) 50%, transparent 80%);
    pointer-events: none;
    transition: background 0.1s ease-out;
  }

  @media (max-width: 768px) {
    padding: 3rem 1rem 2.5rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.18;
  max-width: 850px;
  margin: 0 auto 1rem;
  color: #FFFFFF;
  letter-spacing: -0.02em;

  span {
    background: linear-gradient(135deg, #ED7E13 0%, #FFA843 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (min-width: 768px) {
    font-size: 3.4rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.05rem;
  color: #E2E8F0;
  max-width: 640px;
  margin: 0 auto 1.75rem;
  line-height: 1.6;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }
`;

const TrustBar = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    border-radius: 12px;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #F1F5F9;

  svg {
    color: #ED7E13;
    flex-shrink: 0;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 2.5rem 1.5rem 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterButton = styled(motion.button)`
  padding: 0.55rem 1.2rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? '#ED7E13' : '#E2E8F0'};
  background: ${props => props.$active ? '#ED7E13' : '#FFFFFF'};
  color: ${props => props.$active ? '#FFFFFF' : '#0A3E60'};
  box-shadow: ${props => props.$active ? '0 4px 14px rgba(237, 126, 19, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: ${props => props.$active ? '#FFFFFF' : '#ED7E13'};
  }
`;

const GridSection3D = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.25rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const CATEGORIES = ['Todos', 'Congresso & Evento', 'Curso Online', 'Licenciamento', 'Evento Presencial', 'Mentoria'];

export default function ShopPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [settings, setSettings] = useState({
    hero_title: 'INGRESSOS, CURSOS & CAPACITAÇÕES OFICIAIS',
    hero_subtitle: 'Garanta sua vaga nos maiores eventos e programas avançados de eletroestimulação do Brasil com a segurança oficial Body Harmony.',
    badge_1: 'Pagamento 100% Seguro',
    badge_2: 'Vagas Oficiais Garantidas',
    badge_3: 'Confirmação Imediata',
    announcement_text: '',
    announcement_active: 0,
    support_title: 'Dúvidas sobre ingressos ou inscrições?',
    support_subtitle: 'Nossa equipe de consultores oficiais está disponível para auxiliar você.',
    support_whatsapp: '5518996959486',
    support_whatsapp_message: 'Olá! Gostaria de tirar dúvidas sobre os produtos e cursos da Body Harmony.',
    support_whatsapp_button_text: 'Atendimento Oficial'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await shopApi.getSettings();
        if (res && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações da loja:", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await shopApi.getProducts(activeCategory !== 'Todos' ? activeCategory : null);
        if (res && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCategory]);

  const handleHeroMouseMove = (e) => {
    if (shouldReduceMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty('--stage-x', `${x}%`);
    heroRef.current.style.setProperty('--stage-y', `${y}%`);
  };

  const formatBrl = (cents) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const [congressCheckoutTier, setCongressCheckoutTier] = useState(null);

  const handleBuy = (product) => {
    const isCongress = product.category === 'ingressos' || 
                       product.category === 'Congresso & Evento' || 
                       product.slug?.includes('ingresso') || 
                       product.id === 1 || 
                       product.id === 2;
    if (isCongress) {
      const tier = (product.slug === 'ingresso-vip' || product.id === 1) ? 'vip' : 'experience';
      navigate(`/congresso/checkout?tier=${tier}`);
    } else if (product.payment_link_url && product.payment_link_url.trim()) {
      window.open(product.payment_link_url.trim(), '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/shop/checkout/${product.slug || product.id}`);
    }
  };

  // Helper to format title with gold accent on last words if not specified
  const renderHeroTitle = (title) => {
    if (!title) return null;
    const words = title.split(' ');
    if (words.length > 2) {
      const mainPart = words.slice(0, -2).join(' ');
      const highlightPart = words.slice(-2).join(' ');
      return (
        <>
          {mainPart} <span>{highlightPart}</span>
        </>
      );
    }
    return <span>{title}</span>;
  };

  return (
    <PageContainer>
      {/* Barra de Anúncio / Promoção de Topo (Opcional) */}
      {Boolean(settings.announcement_active && settings.announcement_text) && (
        <div style={{
          background: 'linear-gradient(90deg, #ED7E13 0%, #D96F0E 100%)',
          color: '#FFFFFF',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          letterSpacing: '0.02em'
        }}>
          <Sparkles size={15} />
          {settings.announcement_text}
        </div>
      )}

      {/* TopBar com navegação e suporte */}
      <TopBar>
        <BackHomeLink onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Voltar para o Site Principal
        </BackHomeLink>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.85rem' }}>
          {Boolean(settings.support_topbar_active !== 0 && settings.support_title) && (
            <span style={{ color: '#94A3B8' }}>{settings.support_title}</span>
          )}
          {Boolean(settings.support_whatsapp_active !== 0 && settings.support_whatsapp) && (
            <a 
              href={`https://wa.me/${settings.support_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(settings.support_whatsapp_message || 'Olá! Gostaria de tirar dúvidas sobre os produtos e cursos da Body Harmony.')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#25D366', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <MessageCircle size={15} /> {settings.support_whatsapp_button_text || 'Atendimento Oficial'}
            </a>
          )}
        </div>
      </TopBar>

      {/* Hero 3D Stage */}
      {(settings.hero_title_active !== 0 || settings.hero_subtitle_active !== 0 || settings.trust_bar_active !== 0) && (
        <HeroStage3D ref={heroRef} onMouseMove={handleHeroMouseMove}>
          {Boolean(settings.hero_title_active !== 0 && settings.hero_title) && (
            <HeroTitle>
              {renderHeroTitle(settings.hero_title)}
            </HeroTitle>
          )}
          {Boolean(settings.hero_subtitle_active !== 0 && settings.hero_subtitle) && (
            <HeroSubtitle>
              {settings.hero_subtitle}
            </HeroSubtitle>
          )}

          {Boolean(settings.trust_bar_active !== 0) && (
            <TrustBar>
              {Boolean(settings.badge_1_active !== 0 && settings.badge_1) && (
                <TrustItem>
                  <ShieldCheck size={16} />
                  <span>{settings.badge_1}</span>
                </TrustItem>
              )}
              {Boolean(settings.badge_2_active !== 0 && settings.badge_2) && (
                <TrustItem>
                  <Award size={16} />
                  <span>{settings.badge_2}</span>
                </TrustItem>
              )}
              {Boolean(settings.badge_3_active !== 0 && settings.badge_3) && (
                <TrustItem>
                  <Zap size={16} />
                  <span>{settings.badge_3}</span>
                </TrustItem>
              )}
            </TrustBar>
          )}
        </HeroStage3D>
      )}

      {/* Filtros com Micro-interações táteis */}
      {Boolean(settings.filters_active !== 0) && (
        <FilterContainer>
          {CATEGORIES.map(cat => (
            <FilterButton
              key={cat}
              $active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {cat}
            </FilterButton>
          ))}
        </FilterContainer>
      )}

      {/* Vitrine 3D Interativa Multi-camada */}
      <GridSection3D>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
            Carregando vitrine e vagas disponíveis...
          </div>
        ) : products.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
            Nenhum produto encontrado nesta categoria.
          </div>
        ) : (
          products.map(product => (
            <TiltProductCard3D
              key={product.id}
              product={product}
              onBuy={handleBuy}
              onQuickView={(prod) => setSelectedProduct(prod)}
              formatBrl={formatBrl}
            />
          ))
        )}
      </GridSection3D>

      {/* Modal Imersivo 3D de Quick View */}
      <ProductQuickViewModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onBuy={handleBuy}
        formatBrl={formatBrl}
      />

      {/* Modal Luxury de Checkout Embutido do Congresso (Fallback para ingressos sem link externo) */}
      <CongressCheckoutModal
        isOpen={Boolean(congressCheckoutTier)}
        onClose={() => setCongressCheckoutTier(null)}
        initialTier={congressCheckoutTier || 'experience'}
      />
    </PageContainer>
  );
}
