import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaFilePdf, FaImage, FaDownload, FaFileArchive, FaSpinner, FaHeadphones, FaPlay, FaPause } from 'react-icons/fa'
import { API_BASE } from '../../../services/api'
import LMSService from '../../../services/LMSService'
import { useAudio } from '../../../context/AudioContext'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
  overflow-y: auto;
`;

const ResourceItem = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #E2E8F0;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.2);
    
    .icon-box {
      background: ${({ theme }) => theme.colors.secondary};
      color: white;
    }
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(15, 23, 42, 0.4);
    color: ${({ theme }) => theme.colors.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
    &:hover { 
        background: ${({ theme }) => theme.colors.secondary}; 
        color: #fff;
        box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);
    }
  }
`

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.01);
    border-radius: 16px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    
    .emoji { font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5; }
`

const getIcon = (type) => {
  if (type?.includes('pdf')) return <FaFilePdf />;
  if (type?.includes('audio') || type?.includes('mp3')) return <FaHeadphones />;
  if (type?.includes('zip') || type?.includes('rar')) return <FaFileArchive />;
  return <FaImage />;
}

export function ResourceLibrary() {
  const { playTrack, currentTrack, isPlaying } = useAudio()
  const [resources, setResources] = useState([])
  const [loadingIds, setLoadingIds] = useState(new Set())
  const [error, setError] = useState(null)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoadingIds(prev => new Set(prev).add('initial'))
      const data = await LMSService.getStudentResources();
      setResources(data || [])
    } catch (err) {
      console.error("Erro ao carregar recursos:", err)
      setError("Não foi possível carregar os materiais.")
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete('initial');
        return next;
      })
    }
  }

  const handleDownload = async (res) => {
    if (loadingIds.has(res.id)) return;
    setLoadingIds(prev => new Set(prev).add(res.id))

    let url = null;
    try {
      const deviceToken = localStorage.getItem('bh_device_token');
      const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      if (authData.token) headers['Authorization'] = `Bearer ${authData.token}`;

      // Prioridade: usar download_url pre-assinada da API (tem student_id, expires, signature).
      // Fallback: construir URL basica (sem autenticacao por assinatura, usa headers).
      const signedUrl = res.download_url
        ? (res.download_url.startsWith('http') ? res.download_url : `${window.location.origin}${res.download_url}`)
        : null;
      const downloadEndpoint = signedUrl || `${API_BASE}/download.php?lib_id=${res.id}`;

      const response = await fetch(downloadEndpoint, { headers });
      if (!response.ok) throw new Error('Falha ao obter arquivo');

      const contentType = response.headers.get('content-type') || res.file_type || 'application/octet-stream';
      const blobRaw = await response.blob();
      const blob = new Blob([blobRaw], { type: contentType });
      url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Normalização de extensão se for PDF
      const title = res.title || 'arquivo';
      const extension = res.file_type?.includes('pdf') ? '.pdf' : '';
      a.download = title.endsWith(extension) ? title : `${title}${extension}`;

      document.body.appendChild(a);
      a.click();

      // Melhora o ciclo de vida da limpeza (Sync com api.js)
      setTimeout(() => {
        if (document.body.contains(a)) a.remove();
        if (url) window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (e) {
      console.error('[DOWNLOAD ERROR]', e)
      alert(`Erro: ${e.message || 'Não foi possível baixar o arquivo.'}`)
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(res.id);
        return next;
      })
    }
  }

  if (loadingIds.has('initial')) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
      <FaSpinner className="spin" />
      <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Organizando biblioteca...</p>
      <style>{`.spin { animation: spin 1s linear infinite; font-size: 1.5rem; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return <EmptyState><span className="emoji">⚠️</span>{error}</EmptyState>

  if (resources.length === 0) return (
    <EmptyState>
      <span className="emoji">📂</span>
      Nenhum material disponível no momento.
    </EmptyState>
  )

  return (
    <List>
      {resources.map(res => {
        const isAudio = res.file_type?.includes('audio') || res.file_type?.includes('mp3');
        const isCurrent = currentTrack?.id === res.id;

        return (
          <ResourceItem
            key={res.id}
            as="div"
            style={{ cursor: (loadingIds.has(res.id) || (isAudio && isCurrent && isPlaying)) ? 'default' : 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              if (isAudio) {
                // Let the specific play/pause button handle it, or toggle here
                if (!(isCurrent && isPlaying)) {
                  playTrack({
                    id: res.id,
                    title: res.title,
                    category: res.category,
                    stream_url: res.download_url
                  });
                }
              } else {
                handleDownload(res);
              }
            }}
          >
            <div className="icon-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div className="icon-box" style={{
                background: (isCurrent && isPlaying) || loadingIds.has(res.id) ? 'rgba(237, 126, 19, 0.2)' : undefined,
                color: (isCurrent && isPlaying) || loadingIds.has(res.id) ? '#ED7E13' : undefined
              }}>
                {loadingIds.has(res.id) ? <FaSpinner className="spin" /> : (isAudio && isCurrent && isPlaying ? <FaPlay className="spin-slow" /> : getIcon(res.file_type))}
              </div>
              <div className="info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: '600', color: '#F1F5F9' }}>{res.title}</span>
                <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {res.file_type ? (res.file_type.split('/')[1] || 'ARQUIVO') : 'ARQUIVO'}
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isAudio && (
                <div
                  className="btn-download"
                  style={{ background: isCurrent && isPlaying ? '#ED7E13' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '50%', display: 'flex' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack({
                      id: res.id,
                      title: res.title,
                      category: res.category,
                      stream_url: res.download_url
                    });
                  }}
                >
                  {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
                </div>
              )}

              {!isAudio && (
                <div
                  className="btn-download"
                  title="Baixar Arquivo"
                  style={{ opacity: loadingIds.has(res.id) ? 1 : 0.5, padding: '8px', display: 'flex' }}
                >
                  {loadingIds.has(res.id) ? <FaSpinner className="spin" size={16} color="#ED7E13" /> : <FaDownload size={16} />}
                </div>
              )}
            </div>
          </ResourceItem>
        );
      })}
      <style>{`
        .spin-slow { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </List>
  )
}
