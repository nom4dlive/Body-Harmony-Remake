import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useHomeAssets } from '../../../hooks/useHomeAssets'
import { useData } from '../../../context/DataContext'

const HeroWrapper = styled.section`
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  /* Gradiente sobreposto à imagem dinâmica */
  background-image: ${({ overlay }) => `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay}))`}, ${({ bgImage }) => bgImage ? `url(${bgImage})` : '#111'};
  background-size: ${({ zoom }) => zoom ? `${zoom}%` : 'cover'};
  background-position: ${({ bgPos }) => bgPos ? `${bgPos.x}% ${bgPos.y}%` : 'center'};
  background-repeat: no-repeat;
  color: #fff;
  text-align: center;
  transition: background-image 0.5s ease-in-out, background-size 0.5s ease-in-out;
`

const HeroContent = styled.div`
  max-width: 1000px;
  animation: fadeInUp 1s ease-out;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(3rem, 6vw, 5rem);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  line-height: 1.1;

  span {
    display: block;
    color: #d4af37;
    font-size: 0.6em;
    margin-bottom: 10px;
    letter-spacing: 2px;
  }
`

const Subtitle = styled.p`
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-weight: 300;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: #ddd;
  line-height: 1.6;
`

const CTAButton = styled(Link)`
  display: inline-block;
  background: #d4af37;
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
    background: #f2c94c;
  }
`

const HeroSection = ({ previewImage, previewFocalPoint, previewAdjustments }) => {
  const { heroImage, heroFocalPoint, heroAdjustments } = useHomeAssets();
  const { siteTexts } = useData();
  
  // Logic: Preview props take precedence entirely if present
  const activeImage = previewImage || heroImage;
  const activeFocalPoint = previewFocalPoint || heroFocalPoint;
  const activeAdj = previewAdjustments || heroAdjustments || { zoom: 100, overlay: 0.6 }; // Default overlay 0.6

  // Use default if not set
  const zoom = activeAdj.zoom || 100;
  const overlay = activeAdj.overlay !== undefined ? activeAdj.overlay : 0.6;
  const bgSize = zoom === 100 ? 'cover' : `${zoom}%`;

  // Content Defaults
  const defaultTitle = `<span>FOI O QUE ELA PENSOU ANTES DE DESCOBRIR O MÉTODO BODY HARMONY.</span> VOCÊ ACHA QUE DOMINA A ELETROESTIMULAÇÃO?`
  const defaultSubtitle = `Deixe de aplicar protocolos rasos. Descubra a profundidade clínica que transformou carreiras em um "recomeço" e que pode levar você a uma <strong>Alta Rentabilidade</strong>.`

  return (
    <HeroWrapper 
        bgImage={activeImage} 
        bgPos={activeFocalPoint}
        overlay={overlay}
        zoom={bgSize}
    >
      <HeroContent>
        <Title dangerouslySetInnerHTML={{ __html: siteTexts?.heroTitle || defaultTitle }} />
        <Subtitle dangerouslySetInnerHTML={{ __html: siteTexts?.heroSubtitle || defaultSubtitle }} />
        <CTAButton to="/contato">
          {siteTexts?.heroCta || 'Quero Ser Uma Referência'}
        </CTAButton>
      </HeroContent>
    </HeroWrapper>
  )
}

export default HeroSection

