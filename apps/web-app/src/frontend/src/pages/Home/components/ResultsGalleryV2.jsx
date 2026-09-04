import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 6rem 0;
  background-color: #FFFFFF; /* White background per updated manual */
  position: relative;
  overflow: hidden;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 2rem;
`

const Title = styled.h2`
  color: #0A3E60;
  margin-bottom: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2rem, 5vw, 3rem);
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Subtitle = styled.p`
  color: #316B9C;
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.25rem;
`

const CarouselWrapper = styled.div`
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem; /* Space for arrows */
  z-index: 2; /* Bring above gradient */
  overflow: hidden; /* Fix: Hide extra slides */
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`

const Viewport = styled.div`
  overflow: visible; 
  width: 100%;
  padding: 40px 10px; /* Space for zoom scale */
  margin: -40px -10px; /* Compensate padding */
`

const Track = styled(motion.div)`
  display: flex;
  gap: 20px;
  width: 100%;
`

const CardPromise = styled(motion.div)`
  flex: 0 0 calc(33.333% - 13.33px); /* 3 items per row with 20px gap ==> (100% - 2*20px)/3 */

  aspect-ratio: 9/16; 
  max-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  cursor: pointer; /* Clickable */

  @media (max-width: 1024px) {
    flex: 0 0 calc(50% - 10px); /* 2 items */
  }

  @media (max-width: 600px) {
    flex: 0 0 100%; /* 1 item */
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Visual Hint Overlay */
  &::after {
    content: 'Ampliar';
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
  }
`

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentGold};
    border-color: ${({ theme }) => theme.colors.accentGold};
    color: black;
  }

  &.left { left: 0.5rem; }
  &.right { right: 0.5rem; }

  @media (max-width: 768px) {
    display: none;
  }
`

const ProgressBar = styled.div`
  height: 2px;
  background: ${({ theme }) => theme.colors.grayDark};
  width: 100%;
  margin-top: 2rem;
  border-radius: 2px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: ${({ theme }) => theme.colors.accentGold};
    transition: width 0.5s ease;
  }
`

/* Lightbox Styles */
const LightboxOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
`

const LightboxModal = styled(motion.div)`
  width: 50vw; /* 50% screen width as requested */
  max-width: 800px;
  aspect-ratio: 9/16;
  max-height: 90vh;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  cursor: default;

  @media (max-width: 768px) {
    width: 90vw;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #FFFFFF;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1001;

  &:hover {
    background: red;
    transform: rotate(90deg);
  }
`

const DEFAULT_RESULTS = [
  { src: 'https://i.imgur.com/HyUSsZi.png', alt: 'Resultado Body Harmony - Tratamento para Celulite Antes e Depois' },
  { src: 'https://i.imgur.com/QQaUSJr.png', alt: 'Resultado Body Harmony - Remodelação Glútea' },
  { src: 'https://i.imgur.com/AAyamCz.png', alt: 'Resultado Body Harmony - Definição Abdominal' },
  { src: 'https://i.imgur.com/Iig4Rmq.png', alt: 'Resultado Body Harmony - Tonificação Muscular' },
  { src: 'https://i.imgur.com/nlKsZxX.png', alt: 'Resultado Body Harmony - Redução de Flacidez' },
  { src: 'https://i.imgur.com/JE4Tb1U.png', alt: 'Resultado Body Harmony - Transformação Corporal Completa' }
]

export default function ResultsGalleryV2() {
  const { siteConfig } = useData()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [lightboxImage, setLightboxImage] = useState(null)

  const title = getSafeContent(siteConfig, 'home_resultados', 'title', 'TRANSFORMAÇÕES REAIS')
  const subtitle = getSafeContent(siteConfig, 'home_resultados', 'subtitle', 'Resultados comprovados do método Body Harmony')
  const results = siteConfig?.home_resultados?.results || DEFAULT_RESULTS

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) setItemsPerView(1)
      else if (window.innerWidth < 1024) setItemsPerView(2)
      else setItemsPerView(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Keyboard shortcuts (ESC to close)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const maxIndex = Math.max(0, results.length - itemsPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1))
  }

  // Auto loop 6s (paused if lightbox open)
  useEffect(() => {
    if (lightboxImage) return;

    const timer = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(timer)
  }, [nextSlide, lightboxImage])

  // Helper to get Imgur thumbnail (Large Thumbnail suffix 'l')
  const getThumbnail = (url) => {
    if (!url || !url.includes('imgur.com')) return url;
    return url.replace(/(\.[^.]+)$/, 'l$1');
  }

  return (
    <Section id="resultados">
      <Header>
        <AnimeDivider position="top" fill="#FFFFFF" color="#ED7E13" />
        <Title {...editorAttr('home_resultados', 'title')}>{title}</Title>
        <Subtitle {...editorAttr('home_resultados', 'subtitle')}>{subtitle}</Subtitle>
      </Header>

      <CarouselWrapper>
        <NavButton className="left" onClick={prevSlide} aria-label="Anterior"><FaChevronLeft /></NavButton>

        <Viewport>
          <Track
            animate={{ x: `calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * 20}px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {results.map((item, i) => (
              <CardPromise
                key={i}
                whileHover={{ scale: 1.5, zIndex: 100 }} // 50% Zoom
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage(item.src)}
              >
                <img
                  src={getThumbnail(item.src)}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="1066"
                  alt={item.alt}
                  onError={(e) => e.target.src = `https://placehold.co/600x1066/1a1a1a/D4AF37?text=Caso+${i + 1}`}
                />
              </CardPromise>
            ))}
          </Track>
        </Viewport>

        <NavButton className="right" onClick={nextSlide} aria-label="Próximo"><FaChevronRight /></NavButton>
      </CarouselWrapper>

      {/* Progress Indicator */}
      <div style={{ maxWidth: '300px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <ProgressBar>
          <div style={{ width: `${((currentIndex + 1) / (results.length - itemsPerView + 1)) * 100}%` }} />
        </ProgressBar>
      </div>

      <AnimeDivider position="bottom" fill="#F5F5F5" color="#ED7E13" />


      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <LightboxOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <LightboxModal
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent close on modal click
            >
              <CloseButton onClick={() => setLightboxImage(null)}><FaTimes /></CloseButton>
              <img src={lightboxImage} alt="Detalhe do Resultado" />
            </LightboxModal>
          </LightboxOverlay>
        )}
      </AnimatePresence>

    </Section>
  )
}
