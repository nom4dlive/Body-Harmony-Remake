import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import Hls from 'hls.js'

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px; /* Ensure video is visible even if parent has no height */
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .react-player {
    width: 100% !important;
    height: 100% !important;
  }
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 10;
  pointer-events: none;
`

export const VideoPlayerWrapper = forwardRef(({ url, lessonId, onComplete }, ref) => {
    const playerRef = useRef(null)
    const hlsRef = useRef(null)
    const [completed, setCompleted] = useState(false)
    const [streamUrl, setStreamUrl] = useState(null)
    const [isHls, setIsHls] = useState(false)
    const [error, setError] = useState(false)
    const lastSyncTime = useRef(0)
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Coleta de Lixo (Garbage Collection) explícita no Unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            if (playerRef.current && typeof playerRef.current.pause === 'function') {
                playerRef.current.pause()
                playerRef.current.removeAttribute('src')
                playerRef.current.load()
            }
        }
    }, [])

    useImperativeHandle(ref, () => ({
        seekTo: (seconds) => {
            if (playerRef.current) {
                if (isHls || (streamUrl && streamUrl.includes('stream.php'))) {
                    playerRef.current.currentTime = seconds;
                    playerRef.current.play();
                } else {
                    playerRef.current.seekTo(seconds, 'seconds');
                }
            }
        }
    }));

    const fallbackToStream = useCallback(async () => {
        try {
            console.warn('[FALLBACK] HLS failed, requesting stream.php signed URL for Licenciada...');
            const token = localStorage.getItem('bh_device_token');
            const res = await fetch(`/api/lms/sign_url.php?lesson_id=${lessonId}&fallback=1`, {
                headers: { 'X-Device-Token': token }
            });
            if (!res.ok) throw new Error('Auth Failed');
            
            const data = await res.json();
            if (data?.url) {
                setIsHls(false);
                const apiBase = import.meta.env.VITE_API_BASE || '/api';
                const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                const finalUrl = import.meta.env.PROD
                    ? String(data.url)
                    : `${apiBaseNoSlash.replace('/api', '')}${String(data.url)}`;
                
                setStreamUrl(finalUrl);
                console.log('[FALLBACK] Switched to stream.php:', finalUrl);
            }
        } catch (e) {
            console.error('[FALLBACK] Licenciada player fallback failed:', e);
            setError(true);
        }
    }, [lessonId]);

    useEffect(() => {
        setIsPlayerReady(false);
        setStreamUrl(null);
        setIsHls(false);
        setError(false);
        setCompleted(false);

        const fetchSignedUrl = async () => {
            // If URL is already signed (from LessonPlayer) or an HLS playlist, use it directly
            if (url && (url.includes('stream.php') && url.includes('signature='))) {
                console.log('[DRM] URL already signed, bypassing second signature');
                setStreamUrl(url);
                return;
            }
            if (url && url.endsWith('.m3u8')) {
                setIsHls(true);
                setStreamUrl(url);
                return;
            }

            const isExternal = url && (
                url.includes('youtube.com') ||
                url.includes('youtu.be') ||
                url.includes('vimeo.com') ||
                url.includes('dailymotion.com')
            );

            const isInternal = url && (
                url.includes('stream.php') ||
                (!url.startsWith('http') && !isExternal)
            );

            if (isInternal) {
                try {
                    console.log('[DRM] Fetching signed URL for Lesson ID:', lessonId);
                    const token = localStorage.getItem('bh_device_token');
                    const res = await fetch(`/api/lms/sign_url.php?lesson_id=${lessonId}`, {
                        headers: { 'X-Device-Token': token }
                    });

                    if (!res.ok) throw new Error('Auth Failed');

                    const apiBase = import.meta.env.VITE_API_BASE || '/api';
                    const apiBaseNoSlash = apiBase.replace(/\/$/, '');

                    const data = await res.json();
                    if (!data || !data.url) throw new Error('Invalid signed URL data');

                    const safeUrl = String(data.url);
                    const finalUrl = import.meta.env.PROD
                        ? safeUrl
                        : `${apiBaseNoSlash.replace('/api', '')}${safeUrl}`;

                    console.log('[DRM] Signed URL:', finalUrl);
                    setIsHls(!!data.is_hls);
                    setStreamUrl(finalUrl);

                } catch (e) {
                    console.error('[DRM] Error signing URL:', e);
                    setError(true);
                }
            } else {
                setStreamUrl(url);
            }
        };

        if (url) fetchSignedUrl();
    }, [url, lessonId]);

    useEffect(() => {
        if (!streamUrl || !isHls || !playerRef.current) return;

        let hls = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                maxBufferLength: 30, // 30 seconds buffered max
                maxMaxBufferLength: 60,
                enableWorker: true
            });
            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(playerRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsPlayerReady(true);
                console.log('[DRM] HLS Manifest Parsed');
            });
            let networkRetryCount = 0;
            let mediaRetryCount = 0;
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            if (networkRetryCount >= 3) {
                                console.error("[HLS] Exceeded network retry limit, falling back to stream.php");
                                hls.destroy();
                                hlsRef.current = null;
                                fallbackToStream();
                            } else {
                                networkRetryCount++;
                                console.error(`[HLS] fatal network error encountered (attempt ${networkRetryCount}), trying to recover`);
                                hls.startLoad();
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            if (mediaRetryCount >= 3) {
                                console.error("[HLS] Exceeded media recovery limit, falling back to stream.php");
                                hls.destroy();
                                hlsRef.current = null;
                                fallbackToStream();
                            } else {
                                mediaRetryCount++;
                                console.error(`[HLS] fatal media error encountered (attempt ${mediaRetryCount}), trying to recover`);
                                hls.recoverMediaError();
                            }
                            break;
                        default:
                            console.error("[HLS] fatal unrecoverable error, falling back to stream.php", data);
                            hls.destroy();
                            hlsRef.current = null;
                            fallbackToStream();
                            break;
                    }
                }
            });
        } else if (playerRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS fallback
            playerRef.current.src = streamUrl;
            playerRef.current.addEventListener('loadedmetadata', () => {
                setIsPlayerReady(true);
            });
            playerRef.current.addEventListener('error', () => {
                console.error('[HLS] Safari native error, falling back to stream.php');
                fallbackToStream();
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamUrl, isHls, fallbackToStream]);


    const syncProgress = async (id, percent, isCompleted, retryCount = 0) => {
        const MAX_RETRIES = 2;
        try {
            const token = localStorage.getItem('bh_device_token');
            if (!token) {
                console.error('[V97] No device token found — progress will not be saved');
                return;
            }
            const res = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Token': token
                },
                body: JSON.stringify({
                    lesson_id: id,
                    progress_percent: percent,
                    is_completed: isCompleted
                })
            });
            if (!res.ok) {
                const errText = await res.text().catch(() => 'unknown');
                console.error(`[V97] syncProgress HTTP ${res.status}: ${errText}`);
                // Retry with backoff for server errors
                if (res.status >= 500 && retryCount < MAX_RETRIES) {
                    const delay = (retryCount + 1) * 2000;
                    console.warn(`[V97] Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                    setTimeout(() => syncProgress(id, percent, isCompleted, retryCount + 1), delay);
                }
            }
        } catch (err) {
            console.error('[V97] syncProgress network error:', err.message);
            // Retry on network failure
            if (retryCount < MAX_RETRIES) {
                const delay = (retryCount + 1) * 3000;
                setTimeout(() => syncProgress(id, percent, isCompleted, retryCount + 1), delay);
            }
        }
    }

    const handleProgress = (state) => {
        const percent = Math.round(state.played * 100)
        const now = Date.now()
        // V97: Throttle to 30s to prevent PLAY log flood (was 15s)
        // Also skip 0% progress syncs (no meaningful data)
        if (percent > 0 && now - lastSyncTime.current > 30000) {
            syncProgress(lessonId, percent, false)
            lastSyncTime.current = now
        }
    }

    const updateVideoDuration = async (lessonId, durationSeconds) => {
        try {
            const token = localStorage.getItem('bh_device_token');
            await fetch(`/api/v1/lms/lessons/${lessonId}/duration`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Token': token
                },
                body: JSON.stringify({ duration_seconds: durationSeconds })
            });
            console.log('[VIDEO] Duration updated:', durationSeconds);
        } catch (e) {
            console.error("Failed to update duration", e);
        }
    }

    const captureThumbnail = async (videoElement, lessonId) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, 320, 180);
            const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.7);
            const token = localStorage.getItem('bh_device_token');
            await fetch(`/api/v1/lms/lessons/${lessonId}/thumbnail`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
                body: JSON.stringify({ thumbnail_base64: thumbnailBase64 })
            });
            console.log('[VIDEO] Thumbnail captured and saved');
        } catch (e) {
            console.error("Failed to capture thumbnail", e);
        }
    }

    const isInternalRender = streamUrl && (streamUrl.includes('stream.php') || isHls);

    return (
        <PlayerContainer onContextMenu={(e) => { e.preventDefault(); return false; }}>
            {streamUrl && (isInternalRender ? (
                <video
                    ref={playerRef}
                    className="react-player"
                    // If it is HLS, hls.js manages the src except on Safari native
                    src={!isHls ? streamUrl : undefined}
                    width="100%"
                    height="100%"
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onTimeUpdate={(e) => {
                        const percent = (e.target.currentTime / e.target.duration) * 100;
                        handleProgress({ played: percent / 100, playedSeconds: e.target.currentTime });
                    }}
                    onEnded={() => {
                        if (!completed) {
                            setCompleted(true)
                            syncProgress(lessonId, 100, true)
                            if (onComplete) onComplete()
                        }
                    }}
                    onError={(e) => console.error('[VIDEO ERROR]', e)}
                    onLoadedMetadata={(e) => {
                        if (e.target.duration && e.target.duration > 0 && !isHls) {
                            // Don't update duration for HLS right away if Live or variable.
                            // But for VOD HLS, e.target.duration is valid once metadata loads.
                            updateVideoDuration(lessonId, Math.floor(e.target.duration));
                        }
                        // Only capture thumbnail automatically for legacy MP4 to save processing if HLS takes a bit
                        if (!isHls) {
                            setTimeout(() => captureThumbnail(e.target, lessonId), 500);
                        }
                    }}
                    onPlay={() => setIsPlayerReady(true)}
                    autoPlay
                    style={{ position: 'absolute', top: 0, left: 0, background: '#000' }}
                />
            ) : (
                <ReactPlayer
                    ref={playerRef}
                    className="react-player"
                    url={streamUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing={isPlayerReady}
                    onReady={() => setIsPlayerReady(true)}
                    onProgress={handleProgress}
                    onEnded={() => {
                        if (!completed) {
                            setCompleted(true)
                            syncProgress(lessonId, 100, true)
                            if (onComplete) onComplete()
                        }
                    }}
                    config={{
                        youtube: { playerVars: { showinfo: 0, modestbranding: 1 } },
                        vimeo: { playerOptions: { title: 0, byline: 0, portrait: 0 } }
                    }}
                />
            ))}

            {!streamUrl && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'black', zIndex: 20 }}>
                    Carregando vídeo...
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', background: 'black', zIndex: 30 }}>
                    Erro ao carregar vídeo seguro.
                </div>
            )}

            <Overlay />
        </PlayerContainer>
    )
});
