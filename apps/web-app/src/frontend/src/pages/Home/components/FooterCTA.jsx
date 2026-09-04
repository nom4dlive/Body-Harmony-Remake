import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useHomeAssets } from '../../../hooks/useHomeAssets'
import { useData } from '../../../context/DataContext'

import { VideoSection } from '../../../components/VideoSection'

const Section = styled.section`
  padding: 100px 20px;
  text-align: center;
  background-color: ${({ $style }) => $style?.backgroundColor || '#333'};
  background-image: ${({ $bgImage, $overlay }) => `linear-gradient(rgba(0,0,0,${$overlay}), rgba(0,0,0,${$overlay}))`}, ${({ $bgImage }) => $bgImage ? `url(${$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  color: ${({ $style }) => $style?.textColor || '#fff'};
  transition: all 0.5s ease-in-out;
  
  /* Fallback color if image fails or is removed */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $style }) => $style?.backgroundColor || 'transparent'};
    z-index: 0;
    opacity: ${({ $bgImage }) => $bgImage ? 0.5 : 1}; /* Blend if image exists */
  }
`

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`
const Title = styled.h2`
  font-family: Bebas Neue, sans-serif;
  font-size: 3rem;
  margin-bottom: 20px;
  color: inherit;
`

const Text = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: inherit;
  opacity: 0.9;
`

const CTAButton = styled(Link)`
  display: inline-block;
  background: ${({ theme }) => theme.colors.secondary};
  color: #000;
  padding: 1.2rem 3rem;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(212, 175, 55, 0.6);
    filter: brightness(1.1);
  }
`

const FooterCTA = () => {
  const { siteConfig } = useData()
  const { home_cta } = siteConfig || {}
  const videoConfig = home_cta?.video || {}
  
  // Legacy/Fallback Assets
  const { ctaBgImage } = useHomeAssets();
  
  // Logic: Config Style > Legacy Asset > Default
  // If video layout is 'background', we suppress the section background image to avoid conflict/double background
  const isBackgroundVideo = videoConfig?.layout === 'background'
  const bgImage = isBackgroundVideo ? null : (home_cta?.style?.backgroundImage || ctaBgImage);
  const overlay = 0.8; 

  const styleConfig = home_cta?.style || {};
  // If video is background, ensure section bg color is transparent or compatible
  const sectionStyle = isBackgroundVideo ? { ...styleConfig, backgroundColor: 'transparent' } : styleConfig

  return (
    <VideoSection videoConfig={videoConfig}>
      <Section $bgImage={bgImage} $overlay={overlay} $style={sectionStyle}>
        <Content>
          <Title
              data-sb-section="home_cta"
              data-sb-field="title"
          >
            {home_cta?.title || 'Apenas Uma Licenciada por Região'}
          </Title>
          <Text
              data-sb-section="home_cta"
              data-sb-field="subtitle"
          >
            {home_cta?.subtitle || 'Não deixe sua concorrente descobrir isso antes de você. Garanta sua exclusividade territorial agora.'}
          </Text>
          <CTAButton 
              to="/contato"
              data-sb-section="home_cta"
              data-sb-field="buttonText"
          >
              {home_cta?.buttonText || 'Verificar Disponibilidade'}
          </CTAButton>
        </Content>
      </Section>
    </VideoSection>
  )
}

export default FooterCTA
