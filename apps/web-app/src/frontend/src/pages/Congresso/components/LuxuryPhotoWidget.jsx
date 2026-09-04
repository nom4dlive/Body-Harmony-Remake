import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const goldGlowAnim = keyframes`
  0%, 100% { box-shadow: 0 0 25px rgba(237, 126, 19, 0.25), 0 10px 30px rgba(0, 0, 0, 0.8); }
  50% { box-shadow: 0 0 45px rgba(249, 226, 126, 0.4), 0 15px 40px rgba(0, 0, 0, 0.9); }
`;

const WidgetWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: ${({ $align }) => 
    $align === 'left' ? 'flex-start' : 
    $align === 'right' ? 'flex-end' : 
    'center'
  };
  margin: ${({ $margin }) => $margin || '2rem 0'};
  position: relative;
  z-index: 5;
`;

const PhotoContainer = styled.div`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || '600px'};
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '16/9'};
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(14, 19, 24, 0.85);

  /* Estilos de Borda Dourada Luxury */
  ${({ $borderStyle }) => {
    switch ($borderStyle) {
      case 'gold-glow':
        return css`
          border: 1.5px solid #f9e27e;
          animation: ${goldGlowAnim} 5s ease-in-out infinite;
        `;
      case 'gold-border':
        return css`
          border: 1.5px solid #ED7E13;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(237, 126, 19, 0.2);
        `;
      case 'minimal':
        return css`
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
      case 'none':
      default:
        return css`
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
    }
  }}

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 14px;
  }
`;

const SlideBackdrop = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
  display: block;
  filter: blur(22px) brightness(0.35) saturate(1.2);
  transform: scale(1.15);
  pointer-events: none;
`;

const SlideImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  inset: 0;
  display: block;
  z-index: 2;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6));
`;

const NavArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $direction }) => ($direction === 'left' ? 'left: 12px;' : 'right: 12px;')}
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(8, 12, 16, 0.75);
  border: 1px solid rgba(249, 226, 126, 0.4);
  color: #f9e27e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  opacity: 0.85;

  &:hover {
    background: #ED7E13;
    color: #FFFFFF;
    border-color: #f9e27e;
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
    box-shadow: 0 0 15px rgba(237, 126, 19, 0.6);
  }

  @media (max-width: 640px) {
    width: 38px;
    height: 38px;
    ${({ $direction }) => ($direction === 'left' ? 'left: 6px;' : 'right: 6px;')}
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.45);
  padding: 3px 8px;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
    border-radius: 2px;
    background: ${({ $active }) => ($active ? '#D4AF37' : 'rgba(255, 255, 255, 0.35)')};
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: ${({ $active }) => ($active ? '0 0 6px rgba(212, 175, 55, 0.6)' : 'none')};
  }

  &:hover span {
    background: #FBBF24;
  }
`;

const CaptionOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 1.5rem 1rem;
  background: linear-gradient(180deg, transparent 0%, rgba(8, 12, 16, 0.95) 100%);
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  z-index: 8;
  pointer-events: none;
`;

export default function LuxuryPhotoWidget({
  photos = [],
  mode = 'auto', // 'single', 'carousel', 'auto'
  maxWidth = '600px',
  aspectRatio = '16/9',
  borderStyle = 'gold-border', // 'gold-border', 'gold-glow', 'minimal', 'none'
  align = 'center',
  margin = '2rem 0',
  autoPlayInterval = 4500,
  showCaption = true
}) {
  // Normalizar array de fotos
  let photoList = [];
  if (Array.isArray(photos)) {
    photoList = photos.map(p => typeof p === 'string' ? { url: p, caption: '' } : p).filter(p => !!p?.url);
  } else if (typeof photos === 'string' && photos.trim()) {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) {
        photoList = parsed.map(p => typeof p === 'string' ? { url: p, caption: '' } : p).filter(p => !!p?.url);
      } else {
        photoList = [{ url: photos, caption: '' }];
      }
    } catch (e) {
      photoList = [{ url: photos, caption: '' }];
    }
  }

  // Limite estrito de até 7 fotos
  photoList = photoList.slice(0, 7);

  if (!photoList.length) return null;

  const isCarousel = mode === 'carousel' || (mode === 'auto' && photoList.length > 1);
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
      setCurrentIndex(prev => (prev + 1) % photoList.length);
    } else if (isRightSwipe) {
      setCurrentIndex(prev => (prev - 1 + photoList.length) % photoList.length);
    }
  };

  // Auto-play suave Fade In/Out
  useEffect(() => {
    if (!isCarousel || isPaused || photoList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photoList.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isCarousel, isPaused, photoList.length, autoPlayInterval]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + photoList.length) % photoList.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % photoList.length);
  };

  const currentPhoto = photoList[currentIndex] || photoList[0];

  return (
    <WidgetWrapper $align={align} $margin={margin}>
      <PhotoContainer
        $maxWidth={maxWidth}
        $aspectRatio={aspectRatio}
        $borderStyle={borderStyle}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait">
          <React.Fragment key={currentPhoto.url + currentIndex}>
            <SlideBackdrop
              src={currentPhoto.url}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <SlideImage
              src={currentPhoto.url}
              alt={currentPhoto.caption || currentPhoto.alt || 'Foto do Congresso Body Harmony'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </React.Fragment>
        </AnimatePresence>

        {showCaption && currentPhoto.caption && (
          <CaptionOverlay>
            {currentPhoto.caption}
          </CaptionOverlay>
        )}

        {isCarousel && photoList.length > 1 && (
          <>
            <NavArrow $direction="left" type="button" onClick={handlePrev} aria-label="Foto Anterior">
              <ChevronLeft size={20} />
            </NavArrow>
            <NavArrow $direction="right" type="button" onClick={handleNext} aria-label="Próxima Foto">
              <ChevronRight size={20} />
            </NavArrow>

            <DotsContainer>
              {photoList.map((_, idx) => (
                <Dot
                  key={idx}
                  type="button"
                  $active={idx === currentIndex}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ir para foto ${idx + 1}`}
                >
                  <span />
                </Dot>
              ))}
            </DotsContainer>
          </>
        )}
      </PhotoContainer>
    </WidgetWrapper>
  );
}
