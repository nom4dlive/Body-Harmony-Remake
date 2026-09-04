import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import WaveDivider from '../../../components/Visual/WaveDivider'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const kenBurns = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
`

const HeroWrapper = styled.section`
  position: relative;
  height: 100vh;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Slideshow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Gradient from Left (Clinical Blue) for text readability */
    background: linear-gradient(to right, rgba(10, 62, 96, 0.95) 0%, rgba(10, 62, 96, 0.7) 50%, rgba(10, 62, 96, 0.2) 100%);
    z-index: 2;
  }
`

const SlideImage = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Ken Burns Effect */
  animation: ${kenBurns} 20s ease-out infinite alternate;
`

// ... existing code ...

const Content = styled.div`
  position: relative;
  z-index: 10;
  text-align: left;
  padding: 0 4rem;
  max-width: 1400px; /* Wide container */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align all children left */
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
    align-items: center; /* Center on mobile if desired, or keep left */
    text-align: left;
    /* Improved 3-stop gradient for better text legibility without blocking image */
    background: linear-gradient(
      to bottom,
      rgba(255,255,255,0) 0%,        /* Top clear for image */
      rgba(10, 62, 96, 0.4) 30%,     /* Gentle fade start */
      rgba(10, 62, 96, 0.85) 60%,    /* Strong contrast for text */
      rgba(10, 62, 96, 1) 100%       /* Solid base for buttons */
    );
  }
`

const Title = styled(motion.h1)`
  color: white;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.0rem, 5vw, 3.0rem); 
  line-height: 1.2;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  font-weight: 800; /* Extra Bold */
  max-width: 1000px;
  
  span {
    color: ${({ theme }) => theme.colors.secondary};
    display: inline-block; /* Keep inline flow usually, or block if explicit break */
    font-weight: 900;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const ManifestoBox = styled(motion.p)`
  margin-top: 3rem;
  font-size: 1.1rem;
  font-style: italic;
  color: ${({ theme }) => theme.colors.white};
  border-left: 4px solid ${({ theme }) => theme.colors.secondary};
  padding-left: 1.5rem;
  max-width: 600px;
  line-height: 1.6;
  opacity: 0.9;
`

const Subtitle = styled(motion.p)`
  color: #e0e0e0; /* Off-white */
  font-size: 1.2rem;
  max-width: 800px; /* Narrower column for readability */
  margin: 0 0 3rem 0;
  line-height: 1.8; /* Increased breathing room */
  font-weight: 400;
`

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  justify-content: flex-start; /* Left aligned */
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`

const PrimaryButton = styled.a`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  padding: 1rem 3rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentGoldHover};
    transform: translateY(-2px);
  }
`

const OutlineButton = styled.a`
  background: transparent;
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 1rem 3rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    border-color: white;
    background: rgba(255,255,255,0.05);
  }
`

const DEFAULT_SLIDES = [
  'https://i.imgur.com/smppv21.jpg'
]

export default function HeroSectionV2() {
  const { siteConfig } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Get dynamic content with hardcoded fallbacks
  // Get dynamic content with legacy fallbacks (site_texts)
  const headline = getSafeContent(siteConfig, 'home_hero', 'headline') || getSafeContent(siteConfig, 'site_texts', 'heroTitle', 'Domine o método Body Harmony: Licenciamento premium em eletroestimulação de alta performance..');
  const subheadline = getSafeContent(siteConfig, 'home_hero', 'subheadline') || getSafeContent(siteConfig, 'site_texts', 'heroSubtitle', 'Transforme sua prática estética com o método que une ciência, tecnologia e precisão. Aprenda a ler o corpo e entregar resultados reais desde a primeira sessão.');
  const ctaText = getSafeContent(siteConfig, 'home_hero', 'ctaText') || getSafeContent(siteConfig, 'site_texts', 'heroCta', 'Quero me tornar uma licenciada!');
  const outlineCtaText = getSafeContent(siteConfig, 'home_hero', 'outlineCtaText', 'Agendar consultoria com especialistas');
  const manifesto = getSafeContent(siteConfig, 'home_hero', 'manifesto', 'O método Body Harmony não é sobre apenas operar equipamentos. É sobre leitura biomecânica, seleção precisa de fibras musculares e parâmetros científicos que garantem a entrega de resultados tangíveis e a fidelização do seu paciente..');
  const slides = siteConfig?.home_hero?.slides?.length > 0 ? siteConfig.home_hero.slides : DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <HeroWrapper>
      <Slideshow>
        <AnimatePresence mode="popLayout">
          <SlideImage
            key={currentSlide}
            src={slides[currentSlide]}
            fetchPriority="high"
            decoding="async"
            width="1920"
            height="1080"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        </AnimatePresence>
      </Slideshow>

      <Content>
        {/* Combined Headline */}
        <Title
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          {...editorAttr('home_hero', 'headline')}
          dangerouslySetInnerHTML={{ __html: headline }}
        />

        <Subtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          {...editorAttr('home_hero', 'subheadline')}
        >
          {subheadline}
        </Subtitle>

        <ButtonGroup
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <PrimaryButton
            href="https://wa.me/5518996356825"
            target="_blank"
            {...editorAttr('home_hero', 'ctaText')}
          >
            {ctaText}
          </PrimaryButton>
          <OutlineButton
            href="https://wa.me/5518996356825"
            target="_blank"
            {...editorAttr('home_hero', 'outlineCtaText')}
          >
            {outlineCtaText}
          </OutlineButton>
        </ButtonGroup>

        <ManifestoBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          {...editorAttr('home_hero', 'manifesto')}
        >
          {manifesto}
        </ManifestoBox>
      </Content>

      {/* Visual Transition to Method Section (Light) */}
      <AnimeDivider position="bottom" fill="#FAFAFA" color="#ED7E13" />

    </HeroWrapper>
  )
}
