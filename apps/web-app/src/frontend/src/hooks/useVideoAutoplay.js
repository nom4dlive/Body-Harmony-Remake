import { useEffect, useRef } from 'react'

/**
 * Hook para autoplay/pause de vídeos baseado em scroll (Intersection Observer)
 * 
 * @param {Object} options - Configurações do observer
 * @param {number} options.threshold - Porcentagem de visibilidade para ativar (0-1), padrão: 0.5 (50%)
 * @param {string} options.rootMargin - Margem da viewport para ativação, padrão: '-15% 0px' (zona morta 15% topo/fundo)
 * @returns {React.RefObject} - Ref para anexar ao elemento <video>
 * 
 * @example
 * const videoRef = useVideoAutoplay({ threshold: 0.5 })
 * <video ref={videoRef} src="..." muted loop playsInline />
 */
export function useVideoAutoplay({ 
  threshold = 0.5,
  rootMargin = '-15% 0px'
} = {}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Garante que está mudo para permitir autoplay (política de navegadores)
    video.muted = true

    // Callback executado quando visibilidade muda
    const handleIntersection = ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        // Vídeo entrou no centro da viewport (>= threshold% visível)
        video.play().catch(e => {
          console.warn('Autoplay blocked by browser:', e)
          // Browsers podem bloquear autoplay se não for muted
        })
      } else {
        // Vídeo saiu do foco ou está parcialmente visível
        video.pause()
      }
    }

    // Criar observer
    const observer = new IntersectionObserver(handleIntersection, { 
      threshold: [0, threshold, 1], // Monitora 0%, threshold%, 100%
      rootMargin // Zona morta (ignora 15% superior/inferior)
    })

    observer.observe(video)

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return videoRef
}
