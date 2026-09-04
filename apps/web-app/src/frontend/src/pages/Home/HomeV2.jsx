import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useData } from '../../context/DataContext'
import SEOHead from '../../components/SEO/SEOHead'

// V2 Components
import NavbarV2 from './components/NavbarV2'
import HeroSectionV2 from './components/HeroSectionV2'

import MethodSectionV2 from './components/MethodSectionV2'
import PhilosophyBannerSection from './components/PhilosophyBannerSection' // Philosophy: Vision & Pillars
import PhilosophySection from './components/PhilosophySection'
import BenefitsSection from './components/BenefitsSection' // New
import ResultsGalleryV2 from './components/ResultsGalleryV2'
import TestimonialsV2 from './components/TestimonialsV2'
import InstagramCarousel from './components/InstagramCarousel' // New
import FooterV2 from './components/FooterV2'

const MainWrapper = styled.main`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 0; /* Navbar is absolute/fixed */
`

export default function HomeV2() {
  const { siteConfig } = useData()

  // Ensure dark scrollbar for this page
  useEffect(() => {
    // Optional: Set specific bg if needed, otherwise theme handles it
  }, [])

  return (
    <>
      <SEOHead
        title="Início"
        description="Transforme sua clínica com o Método Body Harmony. Resultados de uma semana de academia em uma única sessão."
      />

      <NavbarV2 />

      <MainWrapper>
        {siteConfig?.section_order && siteConfig.section_order.length > 0 ? (
          siteConfig.section_order.map(section => {
            if (!section.visible) return null;

            switch (section.id) {
              case 'hero': return <HeroSectionV2 key="hero" />;

              case 'metodo': return <MethodSectionV2 key="metodo" />;
              case 'philosophy_banner': return <PhilosophyBannerSection key="phi_banner" />;
              case 'resultados': return <ResultsGalleryV2 key="results" />;
              case 'depoimentos': return <TestimonialsV2 key="testimonials" />;
              case 'philosophy': return <PhilosophySection key="phi" />;
              case 'beneficios': return <BenefitsSection key="benefits" />;
              case 'instagram': return (
                <InstagramCarousel
                  key="insta"
                  images={[
                    'https://i.imgur.com/F7pqkBl.jpg',
                    'https://i.imgur.com/UsvUI0V.jpg',
                    'https://i.imgur.com/hnxwK6g.jpg',
                    'https://i.imgur.com/awRJY6Q.jpg',
                    'https://i.imgur.com/7ogKXxx.jpg',
                    'https://i.imgur.com/5gQfsXa.jpg',
                    'https://i.imgur.com/WNL354x.jpg',
                    'https://i.imgur.com/78Ms1iL.jpg',
                  ]}
                />
              );
              default: return null;
            }
          })
        ) : (
          <>
            <HeroSectionV2 />

            <MethodSectionV2 />
            <PhilosophyBannerSection />
            <ResultsGalleryV2 />
            <TestimonialsV2 />
            <PhilosophySection />
            <BenefitsSection />
            <InstagramCarousel
              images={siteConfig?.home_instagram?.images || [
                'https://i.imgur.com/F7pqkBl.jpg',
                'https://i.imgur.com/UsvUI0V.jpg',
                'https://i.imgur.com/hnxwK6g.jpg',
                'https://i.imgur.com/awRJY6Q.jpg',
                'https://i.imgur.com/7ogKXxx.jpg',
                'https://i.imgur.com/5gQfsXa.jpg',
                'https://i.imgur.com/WNL354x.jpg',
                'https://i.imgur.com/78Ms1iL.jpg',
              ]}
            />
          </>
        )}

        <FooterV2 />
      </MainWrapper>
    </>
  )
}
