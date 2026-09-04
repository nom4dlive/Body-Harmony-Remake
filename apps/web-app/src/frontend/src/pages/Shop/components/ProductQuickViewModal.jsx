import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Clock, Users } from 'lucide-react';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(5, 26, 41, 0.75);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalCard = styled(motion.div)`
  background: #FFFFFF;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(237, 126, 19, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 320px 1fr;
  }
`;

const ModalImageSection = styled.div`
  position: relative;
  background: #0A3E60;
  min-height: 240px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const ModalDetailsSection = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F1F5F9;
  border: none;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #0A3E60;
    color: #FFFFFF;
  }
`;

const CategoryTag = styled.span`
  background: rgba(10, 62, 96, 0.08);
  color: #0A3E60;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0 0 0.5rem 0;
  line-height: 1.25;
`;

const ModalDescription = styled.p`
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1.25rem;
`;

const FeaturesContainer = styled.div`
  margin-bottom: 1.5rem;

  h5 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94A3B8;
    margin: 0 0 0.75rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li {
    font-size: 0.82rem;
    color: #1E293B;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #ED7E13;
      flex-shrink: 0;
    }
  }
`;

const CheckoutSection = styled.div`
  border-top: 1px solid #E2E8F0;
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PriceBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  .price {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0A3E60;
  }

  .installments {
    font-size: 0.85rem;
    font-weight: 700;
    color: #ED7E13;
  }
`;

const ModalBuyButton = styled(motion.button)`
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);

  &:hover {
    background: linear-gradient(135deg, #F08B27 0%, #E27712 100%);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.45);
  }
`;

export default function ProductQuickViewModal({ product, isOpen, onClose, onBuy, formatBrl }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence mode="wait">
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalCard
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton type="button" onClick={onClose} title="Fechar">
            <X size={18} />
          </CloseButton>

          <ModalImageSection>
            <img 
              src={product.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} 
              alt={product.name} 
            />
          </ModalImageSection>

          <ModalDetailsSection>
            <div>
              <CategoryTag>{product.category}</CategoryTag>
              <ModalTitle>{product.name}</ModalTitle>
              <ModalDescription>
                {product.description || product.tagline}
              </ModalDescription>

              {Array.isArray(product.features) && product.features.length > 0 && (
                <FeaturesContainer>
                  <h5>Destaques & Benefícios Inclusos</h5>
                  <ul>
                    {product.features.map((feat, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={16} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </FeaturesContainer>
              )}
            </div>

            <CheckoutSection>
              <PriceBox>
                <div className="price">{formatBrl(product.price_cents)}</div>
                <div className="installments">ou 12x no cartão</div>
              </PriceBox>

              <ModalBuyButton
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onBuy(product);
                }}
              >
                Avançar para Checkout Seguro <ArrowRight size={18} />
              </ModalBuyButton>
            </CheckoutSection>
          </ModalDetailsSection>
        </ModalCard>
      </ModalOverlay>
    </AnimatePresence>
  );
}
