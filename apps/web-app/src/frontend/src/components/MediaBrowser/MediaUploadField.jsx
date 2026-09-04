import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, FolderOpen, X } from 'lucide-react';
import FileBrowserModal from './FileBrowserModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  color: #ccc;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: ${props => props.$variant === 'primary' ? '#0A3E60' : '#1a1a1a'};
  border: 1px solid ${props => props.$variant === 'primary' ? '#0A3E60' : '#333'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#0d5080' : '#222'};
    border-color: ${props => props.$variant === 'primary' ? '#0d5080' : '#444'};
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 12px;
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #333;
  background: #0d0d0d;
  group;
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  backdrop-filter: blur(2px);
`;

const RemoveButton = styled.button`
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.1s;
  
  &:hover {
    background: #DC2626;
    transform: scale(1.05);
  }
`;

const MediaUploadField = ({
    category = 'thumbnail',
    type = '', // 'video' or 'image'
    value,
    onChange,
    label = 'Mídia',
    accept = null  // null = auto-detect by type
}) => {
    const [showBrowser, setShowBrowser] = useState(false);
    const fileInputRef = useRef();

    // Resolve accept: explicit prop > auto by type > default image/*
    const resolvedAccept = accept
        ?? (type === 'video'
            ? 'video/mp4,video/quicktime,video/x-msvideo,video/webm,video/*'
            : 'image/*');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange({
                type: 'upload',
                file: file,
                preview: URL.createObjectURL(file), // Provide immediate preview for standard file
                name: file.name
            });
        }
    };

    const handleExistingSelect = (filePath) => {
        const fileName = filePath.split('/').pop();
        const API_BASE = import.meta.env.VITE_API_BASE || '/api';

        const isVideo = fileName.match(/\.(mp4|mov|avi|wmv|mkv|webm)$/i);

        onChange({
            type: 'existing',
            path: filePath,
            name: fileName,
            preview: isVideo
                ? null // No image preview for videos yet
                : `${API_BASE}/v1/lms/thumbnail/${fileName}`
        });
    };

    const handleRemove = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Container>
            {label && <Label>{label}</Label>}

            <ButtonGroup>
                <Button
                    $variant="primary"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={18} />
                    Fazer Upload
                </Button>

                <Button
                    type="button"
                    onClick={() => setShowBrowser(true)}
                >
                    <FolderOpen size={18} />
                    Usar Existente
                </Button>
            </ButtonGroup>

            <input
                ref={fileInputRef}
                type="file"
                accept={resolvedAccept}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {value && (
                <PreviewContainer>
                    {value.name?.match(/\.(mp4|mov|avi|wmv|mkv|webm)$/i) ? (
                        <div style={{
                            width: '100%', height: '100%', display: 'flex',
                            flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', background: '#051a29', color: '#ED7E13'
                        }}>
                            <Upload size={48} style={{ transform: 'rotate(90deg)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '8px' }}>VÍDEO SELECIONADO</span>
                            <small style={{ color: '#fff', fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>{value.name}</small>
                        </div>
                    ) : (
                        <PreviewImage
                            src={value.preview}
                            alt="Preview"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23111" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    )}
                    <Overlay className="overlay">
                        <RemoveButton onClick={handleRemove} type="button">
                            <X size={16} /> Remover
                        </RemoveButton>
                    </Overlay>
                </PreviewContainer>
            )}

            {showBrowser && (
                <FileBrowserModal
                    category={category}
                    type={type}
                    onSelect={handleExistingSelect}
                    onClose={() => setShowBrowser(false)}
                />
            )}
        </Container>
    );
};

export default MediaUploadField;
