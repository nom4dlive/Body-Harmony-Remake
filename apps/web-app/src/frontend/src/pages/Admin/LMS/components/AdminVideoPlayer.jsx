import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';
import LMSService from '@/services/LMSService';
import Hls from 'hls.js';

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);

  .react-player {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
  background: #1E293B;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
`;

const AdminVideoPlayer = ({ lesson }) => {
    const [url, setUrl] = useState(null);
    const [isHls, setIsHls] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    // Coleta de Lixo (Garbage Collection) explícita no Unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            if (videoRef.current && typeof videoRef.current.pause === 'function') {
                videoRef.current.pause()
                videoRef.current.removeAttribute('src')
                videoRef.current.load()
            }
        }
    }, [])

    useEffect(() => {
        const fetchUrl = async () => {
            setLoading(true);
            setError(null);
            setIsHls(false);

            if (!lesson) {
                setLoading(false);
                return;
            }

            try {
                if (lesson.video_type === 'hostinger') {
                    const res = await LMSService.signAdminUrl(lesson.id);
                    if (res && res.url) {
                        console.log("[PLAYER] Loading URL:", res.url);
                        setUrl(res.url);
                        setIsHls(!!res.is_hls);
                    } else {
                        throw new Error("Falha ao assinar URL");
                    }
                } else {
                    if (lesson.video_ref && lesson.video_ref.endsWith('.m3u8')) setIsHls(true);
                    setUrl(lesson.video_ref);
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "Erro ao carregar vídeo");
            } finally {
                setLoading(false);
            }
        };

        setIsReady(false); // Reset ready state on lesson change
        fetchUrl();
    }, [lesson]);

    useEffect(() => {
        if (!url || !isHls || !videoRef.current) return;

        let hls = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                enableWorker: true
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsReady(true);
                console.log('[DRM] HLS Manifest Parsed (Admin)');
            });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = url;
            videoRef.current.addEventListener('loadedmetadata', () => {
                setIsReady(true);
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
                hlsRef.current = null;
            }
        };
    }, [url, isHls]);

    if (!lesson) return null;

    const isInternalRender = url && (url.includes('stream.php') || isHls);

    return (
        <PlayerWrapper>
            {url && (isInternalRender ? (
                <video
                    ref={videoRef}
                    className="react-player"
                    src={!isHls ? url : undefined}
                    width="100%"
                    height="100%"
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onPlay={() => setIsReady(true)}
                    autoPlay
                    style={{ position: 'absolute', top: 0, left: 0, background: '#000' }}
                    onError={(e) => {
                        console.error("[VIDEO ERROR]", e);
                        setError("Erro ao carregar arquivo de vídeo.");
                    }}
                />
            ) : (
                <ReactPlayer
                    className="react-player"
                    url={url}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={isReady} // Only play when player is actually ready
                    onReady={() => setIsReady(true)}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                disablePictureInPicture: true
                            }
                        }
                    }}
                    onError={(e) => {
                        console.error("[VIDEO ERROR]", e);
                        setError("Erro ao carregar arquivo de vídeo.");
                    }}
                />
            ))}

            {/* Loading Overlay */}
            {loading && !isReady && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', zIndex: 5
                }}>
                    Carregando player...
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <ErrorMessage style={{ zIndex: 10 }}>
                    <strong>Erro de Reprodução</strong>
                    <span>{error}</span>
                </ErrorMessage>
            )}
        </PlayerWrapper>
    );
};

export default AdminVideoPlayer;

