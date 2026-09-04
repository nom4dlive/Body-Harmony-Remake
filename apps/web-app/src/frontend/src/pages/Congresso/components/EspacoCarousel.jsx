import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const CarouselWrapper = styled.div`
  width: 100%;
  height: clamp(260px, 40vw, 480px);
  border: 1px solid ${AURA_COLORS.outlineVariant};
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  margin-bottom: 3.5rem;
  background: #0a0a0a;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${AURA_COLORS.goldGradient};
    z-index: 5;
  }
`;

const SlideBackdrop = styled(motion.img)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: blur(25px) brightness(0.35) saturate(1.2);
  transform: scale(1.15);
  pointer-events: none;
`;

const SlideImage = styled(motion.img)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  z-index: 1;
  filter: brightness(0.95) contrast(1.05) drop-shadow(0 10px 25px rgba(0, 0, 0, 0.7));
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 15, 15, 0.15) 0%, rgba(12, 15, 15, 0.85) 100%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.2rem 2.8rem;
  pointer-events: none;

  @media (max-width: 640px) {
    padding: 1.4rem;
  }
`;

const CaptionTag = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #f9e27e;
  margin-bottom: 0.35rem;
`;

const CaptionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  font-weight: 800;
  color: #FFFFFF;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $prev }) => ($prev ? 'left: 1.2rem;' : 'right: 1.2rem;')}
  z-index: 4;
  background: rgba(12, 15, 15, 0.65);
  border: 1px solid #4d4635;
  color: #f2ca50;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;

  &:hover {
    background: #0a0a0a;
    border-color: #d4af37;
    color: #f9e27e;
    transform: translateY(-50%) scale(1.08);
  }
`;

const DotsRow = styled.div`
  position: absolute;
  bottom: 0.9rem;
  right: 1.5rem;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.45);
  padding: 3px 8px;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 640px) {
    right: 1rem;
    bottom: 0.75rem;
  }
`;

const Dot = styled.button`
  min-width: 14px;
  min-height: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    display: block;
    width: ${({ $active }) => ($active ? '12px' : '4px')};
    height: 4px;
    border-radius: 9999px;
    background: ${({ $active }) => ($active ? '#D4AF37' : 'rgba(255, 255, 255, 0.35)')};
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: ${({ $active }) => ($active ? '0 0 6px rgba(212, 175, 55, 0.6)' : 'none')};
  }

  &:hover span {
    background: #FBBF24;
  }
`;

const DEFAULT_PHOTOS = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP8ZsiQdEABlGV0lJ2fXkmogC_HzaUvlt8INNFdOpALVW88TqJl6Gu9bgko2N6bQ2BD1Dcxj1ZFaF1WucEXurXs4KVnIliXldRouQBsMk6EnKAi24EnqM2CFX3fngVN5O2gYZ4pp0CEMTSXM8QkS3F0O0VB1CNF7dsfnfVPFHxgqFbCO1i_219e3yL_n_OqcyPWhmu_1BFpRpJhhUSUvbBOt-5Ex79N-MkgEYrHMDg86ABI9eMjUnJ',
    title: 'Plenária Executiva & Telão LED +40m²',
    tag: 'Espaço Full Sales · São Paulo',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWmhnCq3l6-gw6hLE3K6yL7pcl4BHAUJ1Jcv12wXvXP-eApwjAJQRlKShRVH7bPIIZqzYzVo3BU-kk-t4YHym8hwFlMUktkDHuFaSUsGVk_ae8wRJ6NBSCq1v1UyZOhsoFa2Q2YXCzbkUUPP65UCZKsz2uDnjnoqCtqKM_xarMbx5qX6Xi2S9tlpNSok6kfylVbNOQge7F_Hwv3B-u4prtKdk8Anea8viiljkGdHMecbDQ7VgglRsj',
    title: 'Palco Imersivo de Alta Tecnologia',
    tag: 'Auditório Triplo A',
  },
  {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1440&q=80',
    title: 'Mesas Prancha com Conectividade Individual',
    tag: 'Conforto & Networking',
  },
];

export default function EspacoCarousel({ galleryJson }) {
  let photos = DEFAULT_PHOTOS;

  if (galleryJson) {
    try {
      const parsed = typeof galleryJson === 'string' ? JSON.parse(galleryJson) : galleryJson;
      if (Array.isArray(parsed) && parsed.length > 0) {
        photos = parsed.map((item, idx) => ({
          url: typeof item === 'string' ? item : (item.url || ''),
          title: typeof item === 'object' && item.title !== undefined ? item.title : `Espaço Full Sales — Vista ${idx + 1}`,
          tag: typeof item === 'object' && item.tag !== undefined ? item.tag : 'Infraestrutura Triplo A',
        })).filter(p => Boolean(p.url));
      }
    } catch {
      photos = DEFAULT_PHOTOS;
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const minSwipeDistance = 45;

  const onTouchStart = (e) => {
    setIsPaused(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  useEffect(() => {
    if (isPaused || photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, photos.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const activePhoto = photos[currentIndex] || photos[0];
  const hasCaption = Boolean(activePhoto?.tag || activePhoto?.title);

  return (
    <CarouselWrapper
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence mode="wait">
        <React.Fragment key={currentIndex}>
          <SlideBackdrop
            src={activePhoto.url}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <SlideImage
            src={activePhoto.url}
            alt={activePhoto.title || 'Foto do Espaço'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </React.Fragment>
      </AnimatePresence>

      {hasCaption && (
        <Overlay>
          {activePhoto.tag && <CaptionTag>{activePhoto.tag}</CaptionTag>}
          {activePhoto.title && <CaptionTitle>{activePhoto.title}</CaptionTitle>}
        </Overlay>
      )}

      {photos.length > 1 && (
        <>
          <NavButton $prev onClick={prevSlide} aria-label="Foto anterior">
            <ChevronLeft size={22} />
          </NavButton>
          <NavButton onClick={nextSlide} aria-label="Próxima foto">
            <ChevronRight size={22} />
          </NavButton>

          <DotsRow>
            {photos.map((_, idx) => (
              <Dot
                key={idx}
                $active={idx === currentIndex}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir para foto ${idx + 1}`}
              >
                <span />
              </Dot>
            ))}
          </DotsRow>
        </>
      )}
    </CarouselWrapper>
  );
}
