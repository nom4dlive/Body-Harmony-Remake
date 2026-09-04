import React from 'react'
import styled from 'styled-components'
import { useVideoAutoplay } from '../hooks/useVideoAutoplay'

// Container principal
const Container = styled.div`
  position: relative;
  width: 100%;
`

// Layout Grid (Side-by-Side)
const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`

// Layout Stack (Empilhado)
const StackLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

// Vídeo de Background (Fullscreen)
const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  opacity: ${props => props.$opacity || 0.3};
  z-index: 0;
  pointer-events: none; /* Permite clicar no conteúdo acima */
`

// Vídeo Normal (Side-by-Side / Stacked)
const VideoElement = styled.video`
  width: 100%;
  height: auto;
  min-height: 300px;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  cursor: pointer; /* Indica interatividade */
`

// Wrapper para conteúdo (quando vídeo é background)
const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`

/**
 * Componente para renderizar vídeos com diferentes layouts
 * Suporta scroll-triggered autoplay/pause via useVideoAutoplay hook
 * 
 * @param {Object} videoConfig - Configuração do vídeo
 * @param {string} videoConfig.url - URL do vídeo
 * @param {string} videoConfig.layout - Layout: 'side-left', 'side-right', 'background', 'above', 'below', 'none'
 * @param {string} videoConfig.objectFit - 'cover' ou 'contain'
 * @param {string} videoConfig.objectPosition - 'center', 'top', 'bottom', etc
 * @param {number} videoConfig.opacity - Opacidade (0-1) para layout background
 * @param {boolean} videoConfig.muted - Sem som (padrão: true)
 * @param {boolean} videoConfig.loop - Repetir (padrão: true)
 * @param {boolean} videoConfig.playsinline - Evitar fullscreen automático (padrão: true)
 * @param {React.ReactNode} children - Conteúdo de texto/elementos
 * @param {string} className - Classes CSS adicionais
 */
export function VideoSection({ 
  videoConfig, 
  children, 
  className 
}) {
  const videoRef = useVideoAutoplay({ 
    threshold: 0.5,        // 50% do vídeo precisa estar visível
    rootMargin: '-15% 0px' // Zona morta 15% topo/fundo
  })

  // Se não há vídeo ou layout é 'none', renderizar apenas children
  if (!videoConfig?.url || videoConfig?.layout === 'none') {
    return <Container className={className}>{children}</Container>
  }

  const layout = videoConfig.layout || 'none'

  // Layout: Background (Vídeo Fullscreen com Overlay)
  if (layout === 'background') {
    return (
      <Container className={className}>
        <BackgroundVideo
          ref={videoRef}
          src={videoConfig.url}
          muted={true} // Background sempre mudo
          loop={videoConfig.loop !== false}
          playsInline={true}
          autoPlay={true} // Autoplay nativo
          $objectFit={videoConfig.objectFit}
          $objectPosition={videoConfig.objectPosition}
          $opacity={videoConfig.opacity}
          preload="auto"
        />
        <ContentWrapper>{children}</ContentWrapper>
      </Container>
    )
  }

  // Layout: Side-by-Side (Lado a Lado)
  if (layout === 'side-left' || layout === 'side-right') {
    const togglePlay = (e) => {
      const vid = e.target;
      if (vid.paused) vid.play(); else vid.pause();
    }

    return (
      <GridLayout className={className}>
        {layout === 'side-left' && (
          <VideoElement
            ref={videoRef}
            src={videoConfig.url}
            muted={true} // Forçar true no JSX
            loop={videoConfig.loop !== false}
            playsInline={true} // Forçar true
            autoPlay={true} // Tentar autoplay nativo também
            controls={true} // ADICIONADO: Controles nativos para garantir play manual se script falhar
            $objectFit={videoConfig.objectFit}
            $objectPosition={videoConfig.objectPosition}
            preload="auto" // Mudado de metadata para auto
            onError={(e) => console.error("Video Error:", e.nativeEvent)}
            onClick={togglePlay}
          />
        )}
        <div>{children}</div>
        {layout === 'side-right' && (
          <VideoElement
            ref={videoRef}
            src={videoConfig.url}
            muted={true}
            loop={videoConfig.loop !== false}
            playsInline={true}
            autoPlay={true}
            controls={true}
            $objectFit={videoConfig.objectFit}
            $objectPosition={videoConfig.objectPosition}
            preload="auto"
            onError={(e) => console.error("Video Error:", e.nativeEvent)}
            onClick={togglePlay}
          />
        )}
      </GridLayout>
    )
  }

  // Layout: Stacked (Empilhado - Acima/Abaixo)
  if (layout === 'above' || layout === 'below') {
    const togglePlay = (e) => {
      const vid = e.target;
      if (vid.paused) vid.play(); else vid.pause();
    }

    return (
      <StackLayout className={className}>
        {layout === 'above' && (
          <VideoElement
            ref={videoRef}
            src={videoConfig.url}
            muted={true}
            loop={videoConfig.loop !== false}
            playsInline={true}
            autoPlay={true}
            controls={true}
            $objectFit={videoConfig.objectFit}
            $objectPosition={videoConfig.objectPosition}
            preload="auto"
            onError={(e) => console.error("Video Error:", e.nativeEvent)}
            onClick={togglePlay}
          />
        )}
        <div>{children}</div>
        {layout === 'below' && (
          <VideoElement
            ref={videoRef}
            src={videoConfig.url}
            muted={true}
            loop={videoConfig.loop !== false}
            playsInline={true}
            autoPlay={true}
            controls={true}
            $objectFit={videoConfig.objectFit}
            $objectPosition={videoConfig.objectPosition}
            preload="auto"
            onError={(e) => console.error("Video Error:", e.nativeEvent)}
            onClick={togglePlay}
          />
        )}
      </StackLayout>
    )
  }

  // Fallback: sem layout conhecido
  return <Container className={className}>{children}</Container>
}
