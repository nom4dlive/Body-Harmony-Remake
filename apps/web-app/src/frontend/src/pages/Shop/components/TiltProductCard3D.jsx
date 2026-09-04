import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Eye, Sparkles } from 'lucide-react';

const CardPerspectiveContainer = styled.div`
  perspective: 1200px;
  transform-style: preserve-3d;
  height: 100%;
`;

const CardInner = styled(motion.div)`
  background: #FFFFFF;
  border-radius: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 0 12px 30px -8px rgba(10, 62, 96, 0.08);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;

  &:hover {
    border-color: rgba(237, 126, 19, 0.45);
    box-shadow: 0 24px 45px -12px rgba(10, 62, 96, 0.22);
  }
`;

const SheenOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  pointer-events: none;
  z-index: 10;
  background: radial-gradient(
    circle 300px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.35) 0%,
    rgba(237, 126, 19, 0.08) 40%,
    transparent 80%
  );
  opacity: 0;
  transition: opacity 0.3s ease;

  ${CardInner}:hover & {
    opacity: 1;
  }
`;

const ImageWrapper3D = styled.div`
  position: relative;
  height: 210px;
  overflow: hidden;
  background: #0A3E60;
  transform: translateZ(20px);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  ${CardInner}:hover & img {
    transform: scale(1.08);
  }
`;

const FloatingBadgeGroup = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  transform: translateZ(40px);
`;

const CategoryBadge = styled.span`
  background: rgba(10, 62, 96, 0.9);
  backdrop-filter: blur(10px);
  color: #FFFFFF;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const StockBadge = styled.span`
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const CardBody3D = styled.div`
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transform: translateZ(25px);
`;

const ProductTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0A3E60;
  margin-bottom: 0.45rem;
  line-height: 1.3;
  transform: translateZ(10px);
`;

const ProductTagline = styled.p`
  font-size: 0.85rem;
  color: #64748B;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  flex-grow: 1;
  transform: translateZ(5px);
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transform: translateZ(15px);
`;

const FeatureItem = styled.li`
  font-size: 0.8rem;
  color: #334155;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.4;

  svg {
    color: #ED7E13;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
`;

const PriceRow3D = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #F1F5F9;
  margin-bottom: 1.25rem;
  transform: translateZ(20px);
`;

const PriceValue = styled.div`
  font-size: 1.55rem;
  font-weight: 800;
  color: #0A3E60;

  span {
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748B;
    margin-left: 0.25rem;
  }
`;

const ActionsRow3D = styled.div`
  display: flex;
  gap: 0.6rem;
  transform: translateZ(35px);
`;

const QuickViewBtn = styled(motion.button)`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 0.75rem;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  color: #0A3E60;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #0A3E60;
    color: #FFFFFF;
    border-color: #0A3E60;
  }
`;

const BuyButton3D = styled(motion.button)`
  flex: 1;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #F08B27 0%, #E27712 100%);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.45);
  }
`;

export default function TiltProductCard3D({ product, onBuy, onQuickView, formatBrl }) {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position inside the card (-1 to 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for rotation
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], shouldReduceMotion ? ['0deg', '0deg'] : ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], shouldReduceMotion ? ['0deg', '0deg'] : ['-9deg', '9deg']);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct);
    y.set(yPct);

    cardRef.current.style.setProperty('--mouse-x', `${(mouseX / width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(mouseY / height) * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <CardPerspectiveContainer>
      <CardInner
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <SheenOverlay />

        <ImageWrapper3D>
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} 
            alt={product.name} 
          />
          <FloatingBadgeGroup>
            <CategoryBadge>{product.category}</CategoryBadge>
            {product.stock_limit && (
              <StockBadge>
                <Sparkles size={12} /> Apenas {product.stock_limit} vagas
              </StockBadge>
            )}
          </FloatingBadgeGroup>
        </ImageWrapper3D>

        <CardBody3D>
          <ProductTitle>{product.name}</ProductTitle>
          <ProductTagline>{product.tagline || product.description}</ProductTagline>

          {Array.isArray(product.features) && product.features.length > 0 && (
            <FeaturesList>
              {product.features.map((feat, idx) => (
                <FeatureItem key={idx}>
                  <CheckCircle2 size={16} />
                  <span>{feat}</span>
                </FeatureItem>
              ))}
            </FeaturesList>
          )}

          <PriceRow3D>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Investimento
              </span>
              <PriceValue>
                {formatBrl(product.price_cents)}
                <span>à vista</span>
              </PriceValue>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ED7E13', fontWeight: 700 }}>
              ou 12x no cartão
            </div>
          </PriceRow3D>

          <ActionsRow3D>
            <QuickViewBtn
              type="button"
              title="Visualização Rápida & Detalhes"
              onClick={() => onQuickView(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye size={18} />
            </QuickViewBtn>

            <BuyButton3D
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onBuy(product)}
            >
              Garantir Vaga / Comprar <ArrowRight size={18} />
            </BuyButton3D>
          </ActionsRow3D>
        </CardBody3D>
      </CardInner>
    </CardPerspectiveContainer>
  );
}
