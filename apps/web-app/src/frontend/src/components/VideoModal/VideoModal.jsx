import styled, { keyframes } from 'styled-components'
import { FaTimes, FaPlay, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
import ImageWithFallback from '../ImageWithFallback/ImageWithFallback'


const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(5px);
`

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px; // Mobile/Reels aspect ratio favor
  height: 80vh; // Give it room on vertical
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: ${scaleIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(5px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: rotate(90deg);
  }
`

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Controls = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 0 1rem;
`

const ControlButton = styled.button`
  background: white;
  color: black;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`

const ProfileInfo = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 5;
  
  img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  div {
    display: flex;
    flex-direction: column;
    
    strong {
      color: white;
      font-size: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    span {
      color: rgba(255,255,255,0.8);
      font-size: 0.8rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
  }
`

export default function VideoModal({ isOpen, onClose, videoUrl, student }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true)
      setIsMuted(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleBackdropClick}>
      <ModalContainer>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        {student && (
          <ProfileInfo>
            <ImageWithFallback src={student.photo} alt={student.name} fallbackSrc={'https://ui-avatars.com/api/?name=' + student.name} />

            <div>
              <strong>{student.name}</strong>
              <span>Licenciada Body Harmony</span>
            </div>
          </ProfileInfo>
        )}

        {videoUrl ? (
          <Video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            playsInline
            onClick={togglePlay}
          />
        ) : (
          <div style={{ color: 'white' }}>Vídeo indisponível</div>
        )}

        <Controls>
          <ControlButton onClick={togglePlay}>
            {isPlaying ? <span style={{ fontSize: '1rem' }}>❚❚</span> : <FaPlay style={{ marginLeft: '3px' }} />}
          </ControlButton>
          <ControlButton onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </ControlButton>
        </Controls>
      </ModalContainer>
    </Overlay>
  )
}
