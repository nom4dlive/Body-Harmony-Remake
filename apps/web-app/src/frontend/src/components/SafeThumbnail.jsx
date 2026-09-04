import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BookOpen } from 'lucide-react';
import { api } from '../services/api';

const COLORS = {
  primary: '#0A3E60', // Navy
  secondary: '#ED7E13', // Gold
  surface: '#FFFFFF',
  textDim: '#666666'
};

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const FallbackContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  }
`;

const Initials = styled.span`
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const IconWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0.2;
  z-index: 0;
`;

const Skeleton = styled.div`
  width: 100%;
  height: 100%;
  background: #eee;
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

/**
 * SafeThumbnail - Nexus Protocol V3.1
 * Componente auto-curativo para thumbnails do LMS.
 */
const SafeThumbnail = ({ src, title, moduleId, lessonId, videoUrl }) => {
  const hasLocalVideo = videoUrl && !videoUrl.includes('vimeo') && !videoUrl.includes('youtube');
  const [status, setStatus] = useState(src ? 'loading' : (hasLocalVideo ? 'extracting' : 'error')); // loading | error | loaded | extracting
  const [extractedThumb, setExtractedThumb] = useState(null);

  // Auto-trigger frame extraction if starting in extracting state
  React.useEffect(() => {
    if (status === 'extracting') {
      extractFrame();
    }
  }, [status]);

  // Gerar iniciais (max 2 letras)
  const getInitials = (str) => {
    if (!str) return 'BH';
    const words = str.split(' ').filter(w => w.length > 2); // Pula "de", "ao", "o"
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const handleError = () => {
    const id = moduleId || lessonId;
    console.warn(`[SafeThumbnail] 404 for asset ${id}: ${title}`);
    
    if (hasLocalVideo) {
      setStatus('extracting');
      extractFrame();
    } else {
      setStatus('error');
    }
  };

  const extractFrame = async () => {
    let resolvedVideoUrl = videoUrl;

    if (lessonId && videoUrl && !videoUrl.includes('vimeo') && !videoUrl.includes('youtube')) {
      try {
        const alunaToken = localStorage.getItem('bh_aluna_token');
        if (alunaToken) {
          const data = await api.aluna.signUrl(parseInt(lessonId)).catch(() => null);
          if (data && data.url) {
            resolvedVideoUrl = data.url;
            console.info(`[SafeThumbnail] Obtained signed Aluna URL for extraction of lesson ${lessonId}: ${resolvedVideoUrl}`);
          }
        } else {
          const deviceToken = localStorage.getItem('bh_device_token');
          const headers = {};
          if (deviceToken) {
            headers['X-Device-Token'] = deviceToken;
          }
          const data = await api.request(`/lms/sign_url.php?lesson_id=${lessonId}`, { headers });
          if (data && data.url) {
            resolvedVideoUrl = data.url;
            console.info(`[SafeThumbnail] Obtained signed URL for extraction of lesson ${lessonId}: ${resolvedVideoUrl}`);
          }
        }
      } catch (err) {
        console.error(`[SafeThumbnail] Failed to sign video URL for extraction:`, err);
      }
    }

    const video = document.createElement('video');
    video.src = resolvedVideoUrl;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    
    const timeout = setTimeout(() => {
      console.error(`[SafeThumbnail] Timeout extracting frame for ${title}`);
      setStatus('error');
      video.remove();
    }, 10000);

    video.onloadedmetadata = () => {
      video.currentTime = 5; // Pega frame em 5 segundos
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setExtractedThumb(dataUrl);
        setStatus('loaded');
        clearTimeout(timeout);
        
        // Fase 3: Auto-Cache (Persistência no Backend)
        api.saveAutoThumbnail({
          moduleId,
          lessonId,
          image: dataUrl
        }).then(res => {
          console.info(`[SafeThumbnail] Auto-cache success for ${title}`, res);
        }).catch(err => {
          console.warn(`[SafeThumbnail] Auto-cache failed (silent)`, err);
        });
        
        console.info(`[SafeThumbnail] Frame extracted successfully for ${title}`);
      } catch (err) {
        console.error(`[SafeThumbnail] Canvas extraction failed`, err);
        setStatus('error');
        clearTimeout(timeout);
      } finally {
        video.remove();
      }
    };

    video.onerror = () => {
      console.error(`[SafeThumbnail] Video load error for extraction. Checked URL: ${resolvedVideoUrl}`);
      setStatus('error');
      clearTimeout(timeout);
    };
  };

  return (
    <>
      {status === 'loading' && <Skeleton />}
      
      {status === 'error' ? (
        <FallbackContainer title={title}>
          <Initials>{getInitials(title)}</Initials>
          <IconWrapper>
            <BookOpen size={48} />
          </IconWrapper>
        </FallbackContainer>
      ) : (
        <StyledImg 
          src={extractedThumb || src} 
          alt={title}
          $visible={status === 'loaded'}
          onLoad={() => setStatus('loaded')}
          onError={handleError}
        />
      )}
    </>
  );
};

export default SafeThumbnail;
