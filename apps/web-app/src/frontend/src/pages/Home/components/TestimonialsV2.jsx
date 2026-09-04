import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useData } from '../../../context/DataContext'
import ImgurPlayer from '../../../components/Video/ImgurPlayer'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 6rem 0;
  background: radial-gradient(circle at 50% 100%, #FAFAFA 0%, #F0F0F0 100%);
  position: relative;
  overflow: hidden;

  /* Subtle Noise Texture Pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0.03;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
`

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 2rem;
`

const Title = styled.h2`
  color: #0A3E60;
  margin-bottom: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Subtitle = styled.p`
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`

/* Carousel Styles */
const CarouselWrapper = styled.div`
  position: relative;
  padding: 0 4rem; /* Space for arrows */
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`

const Viewport = styled.div`
  overflow: hidden;
  width: 100%;
`

const Track = styled(motion.div)`
  display: flex;
  gap: 20px;
  width: 100%;
`

const TestimonialCard = styled(motion.div)`
  flex: 0 0 calc(33.333% - 14px); /* 3 items per row */
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    flex: 0 0 calc(50% - 10px); /* 2 items */
  }

  @media (max-width: 600px) {
    flex: 0 0 100%; /* 1 item */
  }
`

const VideoWrapper = styled.div`
  width: 100%;
  aspect-ratio: 9/16;
  background: #000;
  position: relative;
`

const ContentBox = styled.div`
  padding: 1.5rem;
  background: #fff;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
`

const Name = styled.h4`
  color: #222;
  margin-bottom: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  text-transform: uppercase;
`

const Text = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  color: #333;
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
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &.left { left: 1rem; }
  &.right { right: 1rem; }

  @media (max-width: 768px) {
    display: none;
  }
`

const ProgressBar = styled.div`
  height: 3px;
  background: #E0E0E0;
  width: 200px;
  margin: 3rem auto 0;
  border-radius: 3px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.5s ease;
  }
`

const DEFAULT_ITEMS = [
  { id: 1, name: "Adriana Leal", videoUrl: "https://imgur.com/nTfij7l", text: "Depoimento incrível de transformação e aprendizado.", type: "video" },
  { id: 2, name: "Paula Feliciano", videoUrl: "https://imgur.com/wg4N2Gz", text: "O Body Harmony mudou minha visão sobre eletroterapia.", type: "video" },
  { id: 4, name: "Ana Bica (Uruguai)", videoUrl: "https://imgur.com/Y57z1gM", text: "Levando o método Body Harmony para fronteiras internacionais.", type: "video" },
  { id: 6, name: "Transformação", videoUrl: "https://imgur.com/84vx7t7", text: "Eu não sabia que era possível alcançar esses resultados.", type: "video" }
]

export default function TestimonialsV2() {
  const { siteConfig } = useData()

  const title = getSafeContent(siteConfig, 'home_testimonials_section', 'title', 'O QUE DIZEM NOSSAS LICENCIADAS')
  const subtitle = getSafeContent(siteConfig, 'home_testimonials_section', 'subtitle', 'Histórias reais de quem transformou sua carreira com o Body Harmony')
  const testimonials = siteConfig?.home_testimonials_section?.items || DEFAULT_ITEMS

  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

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

  const maxIndex = Math.max(0, testimonials.length - itemsPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1))
  }

  // Manual navigation only - autoplay removed per brand manual
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     nextSlide()
  //   }, 8000)
  //   return () => clearInterval(timer)
  // }, [nextSlide])

  if (!testimonials || testimonials.length === 0) return null

  return (
    <Section id="depoimentos">
      <AnimeDivider position="top" fill="#0A3E60" color="#ED7E13" />
      <Container>
        <Header>
          <Title {...editorAttr('home_testimonials_section', 'title')}>{title}</Title>
          <Subtitle {...editorAttr('home_testimonials_section', 'subtitle')}>{subtitle}</Subtitle>
        </Header>

        <CarouselWrapper>
          <NavButton className="left" onClick={prevSlide} aria-label="Anterior"><FaChevronLeft /></NavButton>

          <Viewport>
            <Track
              animate={{ x: `calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * 20}px)` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((t, i) => (
                <TestimonialCard key={i} whileHover={{ y: -5 }}>
                  <VideoWrapper>
                    {t.videoUrl ? (
                      <ImgurPlayer
                        url={t.videoUrl}
                        aspectRatio="9:16"
                        controls={true}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                        Sem Vídeo
                      </div>
                    )}
                  </VideoWrapper>
                  <ContentBox>
                    <Name>{t.name}</Name>
                    <Text>"{t.text}"</Text>
                  </ContentBox>
                </TestimonialCard>
              ))}
            </Track>
          </Viewport>

          <NavButton className="right" onClick={nextSlide} aria-label="Próximo"><FaChevronRight /></NavButton>
        </CarouselWrapper>

        <ProgressBar>
          <div style={{ width: `${((currentIndex + 1) / (testimonials.length - itemsPerView + 1)) * 100}%` }} />
        </ProgressBar>

      </Container>

      <AnimeDivider position="bottom" fill="#0A3E60" color="#ED7E13" />

    </Section>
  )
}
