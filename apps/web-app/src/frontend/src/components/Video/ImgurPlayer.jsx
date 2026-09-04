import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: ${({ $aspectRatio }) => ($aspectRatio === '9:16' ? '177.77%' : '56.25%')}; /* Default 16:9 */
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`

const VideoElement = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  cursor: pointer;
  transition: opacity 0.3s ease;
  z-index: 2;

  &:hover {
    background: rgba(0,0,0,0.1);
    
    .play-icon {
      transform: scale(1.1);
    }
  }

  &.playing {
    opacity: 0;
    pointer-events: none;
  }
`

const PlayIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
  
  &::after {
    content: '';
    display: block;
    width: 0; 
    height: 0; 
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 16px solid white;
    margin-left: 4px;
  }
`

const ImgurPlayer = ({ 
  url, 
  autoplay = false, 
  muted = true, 
  loop = true, 
  controls = true,
  aspectRatio = '16:9', // '16:9' or '9:16'
  className 
}) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [videoSrc, setVideoSrc] = useState('')
  const [isMuted, setIsMuted] = useState(muted)
  const [hasError, setHasError] = useState(false)

  // 1. Convert Imgur URL to Direct .mp4
  useEffect(() => {
    if (!url) return

    let finalUrl = url
    // Handle standard imgur links (https://imgur.com/ID)
    if (url.includes('imgur.com') && !url.includes('.mp4')) {
        const id = url.split('/').pop()
        finalUrl = `https://i.imgur.com/${id}.mp4`
    }

    setVideoSrc(finalUrl)
  }, [url])

  // 2. Handle Autoplay & Visibility via IntersectionObserver
  useEffect(() => {
    if (!autoplay || !videoRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => {
                // Autoplay blocked handling
                console.log('Autoplay prevented by browser')
                setIsPlaying(false)
            })
            setIsPlaying(true)
          } else {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [autoplay, videoSrc])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  if (hasError) {
    return (
        <PlayerWrapper $aspectRatio={aspectRatio} className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
            <span style={{ color: '#666', fontSize: '0.8rem' }}>Vídeo indisponível</span>
        </PlayerWrapper>
    )
  }

  return (
    <PlayerWrapper $aspectRatio={aspectRatio} className={className}>
      {videoSrc && (
        <>
            <VideoElement
                ref={videoRef}
                src={videoSrc}
                loop={loop}
                muted={isMuted} 
                playsInline
                controls={controls} // Note: if controls are true, native controls take over
                poster={videoSrc.replace('.mp4', '.jpg')} 
                onError={() => setHasError(true)}
            />
            
            {/* Unmute Button Overlay if autoplaying and muted and no controls */ }
            {!controls && isPlaying && isMuted && (
                <div 
                    onClick={toggleMute}
                    style={{
                        position: 'absolute', bottom: '20px', right: '20px', 
                        zIndex: 10, background: 'rgba(0,0,0,0.6)', 
                        padding: '8px', borderRadius: '50%', cursor: 'pointer',
                        color: 'white', display: 'flex'
                    }}
                >
                    {/* Simple Speaker Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                </div>
            )}
            
            {!controls && (
                <PlayOverlay 
                    onClick={togglePlay} 
                    className={isPlaying ? 'playing' : ''}
                >
                    <PlayIcon className="play-icon" />
                </PlayOverlay>
            )}
        </>
      )}
    </PlayerWrapper>
  )
}

export default ImgurPlayer
