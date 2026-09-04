import React, { useState } from 'react'
import styled from 'styled-components'
import { FaDownload, FaFilePdf, FaSpinner, FaEye, FaExclamationCircle } from 'react-icons/fa'
import { api } from '../../../services/api'

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`

const AttachmentCard = styled.div`
  background: rgba(10, 62, 96, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(10, 62, 96, 0.5);
    border-color: ${({ theme }) => theme.colors.secondary}44;
    transform: translateX(5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .file-info {
     display: flex;
     align-items: center;
     gap: 1.25rem;
     
     .icon-box {
       width: 45px;
       height: 45px;
       background: rgba(237, 126, 19, 0.1);
       border-radius: 12px;
       display: flex;
       align-items: center;
       justify-content: center;
       color: #ED7E13;
       font-size: 1.2rem;
     }

     .text {
       display: flex;
       flex-direction: column;
       
       strong {
         color: #FFFFFF;
         font-size: 1rem;
         font-weight: 600;
       }
       span {
         color: rgba(255, 255, 255, 0.4);
         font-size: 0.8rem;
         text-transform: uppercase;
         letter-spacing: 1px;
       }
     }
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`

const IconButton = styled.button`
  background: ${props => props.$primary ? props.theme.colors.secondary : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$primary ? 'white' : 'white'};
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: ${props => props.$primary ? '#FF9124' : 'rgba(255, 255, 255, 0.12)'};
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

export function AttachmentList({ attachments }) {
    const [loadingIds, setLoadingIds] = useState(new Set())

    const handleFileAction = async (att, action) => {
        setLoadingIds(prev => new Set(prev).add(att.id))
        let url = null;
        try {
            const deviceToken = localStorage.getItem('bh_device_token');
            const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
            const headers = {};
            if (deviceToken) headers['X-Device-Token'] = deviceToken;
            if (authData.token) headers['Authorization'] = `Bearer ${authData.token}`;

            const response = await fetch(`${api.API_BASE}/download.php?file_id=${att.id}`, { headers });
            if (!response.ok) throw new Error('Falha ao obter arquivo');

            const contentType = response.headers.get('content-type') || 'application/pdf';
            const blobRaw = await response.blob();
            const blob = new Blob([blobRaw], { type: contentType });
            url = window.URL.createObjectURL(blob);

            if (action === 'view') {
                window.open(url, '_blank');
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = att.filename || `arquivo_${att.id}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (e) {
            console.error('[FILE ERROR]', e)
            alert(`Erro: ${e.message || 'Não foi possível processar o arquivo.'}`)
        } finally {
            if (url) {
                // Extended timeout to ensure browser has time to process the blob URL before revocation
                setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            }
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(att.id);
                return next;
            })
        }
    }

    if (!attachments || attachments.length === 0) {
        return (
            <div style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>Nenhum material complementar disponível.</p>
            </div>
        )
    }

    return (
        <ListContainer>
            {attachments.map(att => (
                <AttachmentCard key={att.id}>
                    <div className="file-info">
                        <div className="icon-box">
                            <FaFilePdf />
                        </div>
                        <div className="text">
                            <strong>{att.title || att.filename}</strong>
                            <span>PDF Document</span>
                        </div>
                    </div>

                    <Actions>
                        <IconButton
                            title="Visualizar"
                            disabled={loadingIds.has(att.id)}
                            onClick={() => handleFileAction(att, 'view')}
                        >
                            {loadingIds.has(att.id) ? <FaSpinner className="spin" size={14} /> : <FaEye size={16} />}
                        </IconButton>

                        <IconButton
                            $primary
                            disabled={loadingIds.has(att.id)}
                            onClick={() => handleFileAction(att, 'download')}
                            title="Baixar Arquivo"
                        >
                            {loadingIds.has(att.id) ? (
                                <FaSpinner className="spin" size={16} />
                            ) : (
                                <FaDownload size={16} />
                            )}
                        </IconButton>
                    </Actions>
                </AttachmentCard>
            ))}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </ListContainer>
    )
}
