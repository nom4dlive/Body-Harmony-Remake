import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaPlay, FaPause } from "react-icons/fa";

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.75rem;
  background: ${(props) => (props.$isMe ? "rgba(255, 255, 255, 0.12)" : "#F1F5F9")};
  border: 1px solid ${(props) => (props.$isMe ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0")};
  border-radius: 20px;
  min-width: 220px;
  max-width: 320px;
  width: 100%;
  color: ${(props) => (props.$isMe ? "#FFFFFF" : "#0A3E60")};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin: 0.35rem 0;
`;

const PlayBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  background: #ED7E13;
  color: #FFFFFF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(237, 126, 19, 0.35);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: #D46D0E;
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 2px;
  }
`;

const TrackArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const WaveformBar = styled.div`
  position: relative;
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
`;

const WaveStick = styled.div`
  flex: 1;
  height: ${(props) => props.$height}%;
  background: ${(props) => {
    if (props.$played) return "#ED7E13";
    return props.$isMe ? "rgba(255, 255, 255, 0.4)" : "#CBD5E1";
  }};
  border-radius: 2px;
  transition: background 0.1s ease;
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 700;
  color: ${(props) => (props.$isMe ? "#E2E8F0" : "#64748B")};
`;

const SpeedBtn = styled.button`
  background: ${(props) => (props.$isMe ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0")};
  color: ${(props) => (props.$isMe ? "#FFFFFF" : "#0A3E60")};
  border: none;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #ED7E13;
    color: #FFFFFF;
  }
`;

export default function CustomAudioPlayer({ src, isMe = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const waveHeights = [40, 70, 95, 60, 85, 100, 75, 50, 90, 65, 45, 80, 95, 60, 40, 70, 85, 100, 60, 45, 80, 50];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Erro ao reproduzir áudio:", err);
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = newProgress * duration;
    setProgress(newProgress * 100);
  };

  const toggleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    let nextSpeed = 1.0;
    if (speed === 1.0) nextSpeed = 1.5;
    else if (speed === 1.5) nextSpeed = 2.0;
    else nextSpeed = 1.0;

    audio.playbackRate = nextSpeed;
    setSpeed(nextSpeed);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <PlayerContainer $isMe={isMe}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <PlayBtn onClick={togglePlay} title={isPlaying ? "Pausar Áudio" : "Ouvir Mensagem de Voz"}>
        {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "2px" }} />}
      </PlayBtn>

      <TrackArea>
        <WaveformBar onClick={handleSeek} title="Clique para avançar ou retroceder">
          {waveHeights.map((h, i) => {
            const stickProgress = (i / waveHeights.length) * 100;
            const isPlayed = progress >= stickProgress;
            return (
              <WaveStick
                key={i}
                $height={h}
                $played={isPlayed}
                $isMe={isMe}
              />
            );
          })}
        </WaveformBar>

        <TimeRow $isMe={isMe}>
          <span>{isPlaying ? formatTime(currentTime) : (duration > 0 ? formatTime(duration) : "0:00")}</span>
          <SpeedBtn $isMe={isMe} onClick={toggleSpeed} title="Velocidade de reprodução">
            {speed}x
          </SpeedBtn>
        </TimeRow>
      </TrackArea>
    </PlayerContainer>
  );
}
