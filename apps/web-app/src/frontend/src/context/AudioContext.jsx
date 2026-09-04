import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const playTrack = (track) => {
        const audio = audioRef.current;

        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().catch(console.error);
                setIsPlaying(true);
            }
            return;
        }

        setCurrentTrack(track);
        audio.src = track.stream_url;
        audio.play().catch(console.error);
        setIsPlaying(true);
        setProgress(0);
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const seek = (percent) => {
        const audio = audioRef.current;
        if (audio.duration) {
            audio.currentTime = (percent / 100) * audio.duration;
            setProgress(percent);
        }
    };

    const skip = (seconds) => {
        const audio = audioRef.current;
        audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    };

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            progress,
            duration,
            playTrack,
            togglePlay,
            seek,
            skip,
            currentTime: audioRef.current.currentTime
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export const useAudio = () => useContext(AudioContext);
