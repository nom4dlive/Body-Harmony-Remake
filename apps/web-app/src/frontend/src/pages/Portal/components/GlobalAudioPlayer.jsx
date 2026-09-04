import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaTimes, FaMusic, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useAudio } from '../../../context/AudioContext';

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Container = styled.div`
  position: fixed;
  bottom: 85px; /* Above BottomNavbar */
  left: 50%;
  transform: translateX(-50%);
  width: min(94%, 600px);
  background: rgba(5, 26, 41, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 12px 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: ${slideUp} 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  
  @media (max-width: 768px) {
    width: 96%;
    bottom: 75px;
    padding: 10px 16px;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h4 {
    margin: 0;
    font-size: 0.95rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
  }
  
  p {
    margin: 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover { color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'}; }
  }
  
  .play-pause {
    width: 42px;
    height: 42px;
    background: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
    border-radius: 50%;
    color: white;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);
    
    &:hover { transform: scale(1.05); }
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  
  span {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    min-width: 32px;
    font-variant-numeric: tabular-nums;
  }
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  appearance: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
    border-radius: 50%;
    transition: transform 0.1s;
  }
  
  &:hover::-webkit-slider-thumb { transform: scale(1.2); }
  
  background-image: linear-gradient(${({ theme }) => theme.colors?.secondary || '#ED7E13'}, ${({ theme }) => theme.colors?.secondary || '#ED7E13'});
  background-size: ${props => props.progress}% 100%;
  background-repeat: no-repeat;
`;

const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GlobalAudioPlayer = () => {
    const { currentTrack, isPlaying, progress, duration, togglePlay, seek, skip, currentTime } = useAudio();
    const [isMinimized, setIsMinimized] = useState(false);

    if (!currentTrack) return null;

    if (isMinimized) {
        return (
            <Container style={{ width: 'auto', padding: '8px 12px', bottom: '85px' }}>
                <button
                    onClick={() => setIsMinimized(false)}
                    style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                    <FaMusic size={14} color="#ED7E13" />
                    <span style={{ fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentTrack.title}
                    </span>
                    <FaChevronUp size={12} />
                </button>
            </Container>
        );
    }

    return (
        <Container>
            <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: 10, top: 5 }}>
                <button onClick={() => setIsMinimized(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                    <FaChevronDown size={14} />
                </button>
            </div>

            <Content>
                <div style={{ padding: 8, background: 'rgba(237, 126, 19, 0.1)', borderRadius: 12 }}>
                    <FaMusic size={20} color="#ED7E13" />
                </div>

                <TrackInfo>
                    <h4>{currentTrack.title}</h4>
                    <p>{currentTrack.category || 'Áudio do Método'}</p>
                </TrackInfo>

                <Controls>
                    <button onClick={() => skip(-15)}><FaStepBackward /></button>
                    <button className="play-pause" onClick={togglePlay}>
                        {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: 2 }} />}
                    </button>
                    <button onClick={() => skip(15)}><FaStepForward /></button>
                </Controls>
            </Content>

            <ProgressContainer>
                <span>{formatTime(currentTime)}</span>
                <Slider
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    progress={progress || 0}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                />
                <span>{formatTime(duration)}</span>
            </ProgressContainer>
        </Container>
    );
};
