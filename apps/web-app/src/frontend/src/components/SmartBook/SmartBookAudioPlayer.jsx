import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlay, FaPause, FaRedoAlt, FaVolumeUp, FaVolumeMute, 
  FaDownload, FaHeadphones 
} from 'react-icons/fa';

const PlayerCard = styled.div`
  background: linear-gradient(135deg, #0B1626 0%, #11223A 100%);
  border: 1px solid #1E3A5F;
  border-radius: 16px;
  padding: 20px;
  color: #E8EAED;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  margin-bottom: 20px;
`;

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .track-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(237, 126, 19, 0.15);
      border: 1px solid #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      font-size: 20px;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .title {
        font-size: 15px;
        font-weight: 700;
        color: #FFFFFF;
      }

      .speaker {
        font-size: 12px;
        color: #9AA0A6;
      }
    }
  }

  .speed-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #050B14;
    padding: 3px 6px;
    border-radius: 8px;
    border: 1px solid #1E3A5F;

    button {
      background: transparent;
      border: none;
      color: #9AA0A6;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: #ED7E13;
        color: #FFFFFF;
      }
    }
  }
`;

const WaveformContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  height: 48px;
  background: rgba(5, 11, 20, 0.6);
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 14px;
  cursor: pointer;
  border: 1px solid rgba(30, 58, 95, 0.5);
`;

const WaveBar = styled.div`
  flex: 1;
  background: ${props => (props.active ? '#ED7E13' : '#1E3A5F')};
  height: ${props => props.height}%;
  border-radius: 3px;
  transition: all 0.15s ease;

  &:hover {
    background: #FF9E3B;
  }
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9AA0A6;
  font-weight: 600;
  margin-bottom: 12px;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .main-controls {
    display: flex;
    align-items: center;
    gap: 12px;

    .play-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #ED7E13;
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(237, 126, 19, 0.4);
      transition: all 0.2s;

      &:hover {
        transform: scale(1.05);
        background: #F08E2D;
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .secondary-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #11223A;
      color: #9AA0A6;
      border: 1px solid #1E3A5F;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #FFFFFF;
        border-color: #ED7E13;
      }
    }
  }

  .extra-controls {
    display: flex;
    align-items: center;
    gap: 10px;

    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #11223A;
      border: 1px solid #1E3A5F;
      border-radius: 8px;
      color: #E8EAED;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #ED7E13;
        color: #ED7E13;
      }
    }
  }
`;

export function SmartBookAudioPlayer({ audioUrl, title = 'Resumo em Áudio Clínico', speaker = 'Dra. Joselene (Voz Neural)' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Gera alturas estáticas para o waveform visual (40 barras)
  const [waveformBars] = useState(() => 
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 70) + 20)
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 120);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (index) => {
    if (!audioRef.current || duration === 0) return;
    const seekTime = (index / waveformBars.length) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSpeedChange = (rate) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleRewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentBarIndex = Math.floor((progressPercent / 100) * waveformBars.length);

  return (
    <PlayerCard>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <PlayerHeader>
        <div className="track-info">
          <div className="icon-badge">
            <FaHeadphones />
          </div>
          <div className="meta">
            <span className="title">{title}</span>
            <span className="speaker">{speaker}</span>
          </div>
        </div>

        <div className="speed-selector">
          {[1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              className={playbackRate === rate ? 'active' : ''}
              onClick={() => handleSpeedChange(rate)}
            >
              {rate}x
            </button>
          ))}
        </div>
      </PlayerHeader>

      <WaveformContainer>
        {waveformBars.map((height, i) => (
          <WaveBar
            key={i}
            height={height}
            active={i <= currentBarIndex}
            onClick={() => handleSeek(i)}
          />
        ))}
      </WaveformContainer>

      <TimeRow>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </TimeRow>

      <ControlsRow>
        <div className="main-controls">
          <button className="secondary-btn" onClick={handleRewind} title="Voltar 10 segundos">
            <FaRedoAlt style={{ transform: 'scaleX(-1)' }} />
          </button>
          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '3px' }} />}
          </button>
          <button className="secondary-btn" onClick={toggleMute} title="Silenciar áudio">
            {isMuted ? <FaVolumeMute color="#ED7E13" /> : <FaVolumeUp />}
          </button>
        </div>

        <div className="extra-controls">
          {audioUrl && (
            <a href={audioUrl} download="resumo_clinico_bodyharmony.mp3" target="_blank" rel="noreferrer" className="download-btn">
              <FaDownload /> Baixar MP3
            </a>
          )}
        </div>
      </ControlsRow>
    </PlayerCard>
  );
}

export default SmartBookAudioPlayer;
