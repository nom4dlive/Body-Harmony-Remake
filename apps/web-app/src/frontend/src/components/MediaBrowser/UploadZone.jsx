import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_BASE } from '../../services/api';

const DropZone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? '#0A3E60' : '#333'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(10, 62, 96, 0.1)' : '#0d0d0d'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #0A3E60;
    background: rgba(10, 62, 96, 0.05);
  }
  
  .icon {
    color: ${props => props.$isDragging ? '#0A3E60' : '#666'};
    margin-bottom: 16px;
    transition: color 0.3s;
  }
  
  h3 {
    margin: 0 0 8px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #999;
    font-size: 0.9rem;
  }
  
  input {
    display: none;
  }
`;

const UploadQueue = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #0d0d0d;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

const UploadItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  margin-bottom: 8px;
  
  .file-info {
    flex: 1;
    min-width: 0;
    
    .file-name {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .file-size {
      color: #666;
      font-size: 0.8rem;
      margin-top: 2px;
    }
  }
  
  .status-icon {
    flex-shrink: 0;
  }
  
  .remove-btn {
    flex-shrink: 0;
    cursor: pointer;
    color: #666;
    transition: color 0.2s;
    
    &:hover {
      color: #fff;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #0d0d0d;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0A3E60, #ED7E13);
    transition: width 0.3s ease;
    width: ${props => props.$progress}%;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 4px;
`;

const UploadZone = ({ category = 'thumbnail', onUploadComplete, accept = 'image/*' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState([]);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const newUploads = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            status: 'pending', // pending, uploading, success, error
            progress: 0,
            error: null
        }));

        setUploads(prev => [...prev, ...newUploads]);

        // Start uploading each file
        newUploads.forEach(upload => {
            uploadFile(upload);
        });
    };

    const uploadFile = async (upload) => {
        // Update status to uploading
        setUploads(prev => prev.map(u =>
            u.id === upload.id ? { ...u, status: 'uploading', progress: 0 } : u
        ));

        try {
            const formData = new FormData();
            formData.append('file', upload.file);
            formData.append('category', category);

            // Use shared API_BASE

            // Fix: Get token from bh_auth (standard admin auth) instead of adminToken
            const savedAuth = localStorage.getItem('bh_auth');
            let token = null;
            if (savedAuth) {
                try {
                    token = JSON.parse(savedAuth).token;
                } catch (e) {
                    console.error('Error parsing auth token', e);
                }
            }

            if (!token) {
                throw new Error('Não autenticado. Por favor, faça login novamente.');
            }

            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploads(prev => prev.map(u =>
                        u.id === upload.id ? { ...u, progress } : u
                    ));
                }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    setUploads(prev => prev.map(u =>
                        u.id === upload.id ? { ...u, status: 'success', progress: 100 } : u
                    ));

                    // Notify parent component
                    if (onUploadComplete) {
                        onUploadComplete(response);
                    }

                    // Remove from queue after 2 seconds
                    setTimeout(() => {
                        setUploads(prev => prev.filter(u => u.id !== upload.id));
                    }, 2000);
                } else if (xhr.status === 401) {
                    window.dispatchEvent(new Event('auth:unauthorized'));
                    throw new Error('Sessão expirada. Faça login novamente.');
                } else {
                    throw new Error('Upload failed');
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                setUploads(prev => prev.map(u =>
                    u.id === upload.id ? {
                        ...u,
                        status: 'error',
                        error: 'Upload failed. Please try again.'
                    } : u
                ));
            });

            xhr.open('POST', url);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);

        } catch (error) {
            setUploads(prev => prev.map(u =>
                u.id === upload.id ? {
                    ...u,
                    status: 'error',
                    error: error.message || 'Upload failed'
                } : u
            ));
        }
    };

    const removeUpload = (id) => {
        setUploads(prev => prev.filter(u => u.id !== id));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploading':
                return <Loader size={20} color="#0A3E60" className="animate-spin" />;
            case 'success':
                return <CheckCircle size={20} color="#4ade80" />;
            case 'error':
                return <AlertCircle size={20} color="#ff4444" />;
            default:
                return <Upload size={20} color="#666" />;
        }
    };

    return (
        <div>
            <DropZone
                $isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                <Upload size={48} className="icon" />
                <h3>Arraste arquivos aqui</h3>
                <p>ou clique para selecionar do seu computador</p>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileInput}
                />
            </DropZone>

            {uploads.length > 0 && (
                <UploadQueue>
                    {uploads.map(upload => (
                        <UploadItem key={upload.id}>
                            <div className="status-icon">
                                {getStatusIcon(upload.status)}
                            </div>

                            <div className="file-info">
                                <div className="file-name">{upload.name}</div>
                                <div className="file-size">{formatBytes(upload.size)}</div>

                                {upload.status === 'uploading' && (
                                    <ProgressBar $progress={upload.progress}>
                                        <div className="progress-fill" />
                                    </ProgressBar>
                                )}

                                {upload.error && (
                                    <ErrorMessage>{upload.error}</ErrorMessage>
                                )}
                            </div>

                            {upload.status !== 'uploading' && (
                                <X
                                    size={18}
                                    className="remove-btn"
                                    onClick={() => removeUpload(upload.id)}
                                />
                            )}
                        </UploadItem>
                    ))}
                </UploadQueue>
            )}
        </div>
    );
};

export default UploadZone;
