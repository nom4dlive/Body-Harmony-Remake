import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaFileVideo, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import LMSService from '../../services/LMSService';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

const UploadContainer = styled.div`
  background: #FFFFFF;
  border: 1.5px dashed #E2E8F0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: #316B9C;
    background: #F8FAFC;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const CustomUploadBtn = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.$hasFile ? '#316B9C' : '#E2E8F0'};
  background: ${props => props.$hasFile ? 'rgba(49, 107, 156, 0.05)' : 'white'};
  color: ${props => props.$hasFile ? '#316B9C' : '#64748B'};
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;

  &:hover {
    background: rgba(49, 107, 156, 0.05);
    border-color: #316B9C;
  }
`;

const ProgressWrapper = styled.div`
  margin-top: 1.5rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #ED7E13;
  width: ${props => props.$value}%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StatusText = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$type === 'error' ? '#EF4444' : '#475569'};
`;

const StartActionBtn = styled.button`
  margin-top: 1rem;
  width: 100%;
  background: #316B9C;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #255A8C;
    transform: translateY(-1px);
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressPercentage = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #ED7E13;
`;

const ChunkUploader = ({ onUploadComplete, onUploadStart, initialFile = null }) => {
    const [file, setFile] = useState(initialFile);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, uploading, complete, error
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        if (initialFile) {
            setFile(initialFile);
            setProgress(0);
            setStatus('idle');
        }
    }, [initialFile]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('video/')) {
                alert('Por favor selecione um arquivo de vídeo (MP4, WebM).');
                return;
            }
            setFile(selectedFile);
            setProgress(0);
            setStatus('idle');
        }
    };

    const startUpload = async () => {
        if (!file) return;
        if (onUploadStart) onUploadStart();
        setStatus('uploading');
        setErrorMessage('');

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const fileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

        try {
            let lastResponse = null;
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                lastResponse = await LMSService.uploadVideoChunk(
                    chunk,
                    i,
                    totalChunks,
                    fileName,
                    fileId
                );

                const percent = Math.round(((i + 1) / totalChunks) * 100);
                setProgress(percent);
            }

            setStatus('complete');
            if (onUploadComplete && lastResponse) {
                onUploadComplete(lastResponse);
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Falha na conexão. Tente novamente.');
        }
    };

    return (
        <UploadContainer>
            <HiddenInput
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={status === 'uploading'}
                ref={fileInputRef}
            />

            <CustomUploadBtn
                type="button"
                onClick={() => fileInputRef.current.click()}
                $hasFile={!!file}
                disabled={status === 'uploading'}
            >
                {status === 'complete' ? (
                    <><FaCheck color="#16A34A" /> ARQUIVO SELECIONADO</>
                ) : file ? (
                    <><FaFileVideo /> {file.name.substring(0, 20)}...</>
                ) : (
                    <><FaUpload /> ESCOLHER ARQUIVO</>
                )}
            </CustomUploadBtn>

            {file && status === 'idle' && (
                <StartActionBtn onClick={startUpload}>
                    <FaUpload /> INICIAR UPLOAD ({Math.round(file.size / 1024 / 1024)} MB)
                </StartActionBtn>
            )}

            {status === 'uploading' && (
                <ProgressWrapper>
                    <ProgressHeader>
                        <StatusText>ENVIANDO...</StatusText>
                        <ProgressPercentage>{progress}%</ProgressPercentage>
                    </ProgressHeader>
                    <ProgressBar>
                        <ProgressFill $value={progress} />
                    </ProgressBar>
                </ProgressWrapper>
            )}

            {status === 'complete' && (
                <div style={{ marginTop: '1rem' }}>
                    <StatusText>
                        <FaCheck color="#16A34A" /> Upload concluído com sucesso!
                    </StatusText>
                </div>
            )}

            {status === 'error' && (
                <div style={{ marginTop: '1rem' }}>
                    <StatusText $type="error">
                        <FaExclamationTriangle /> {errorMessage}
                    </StatusText>
                    <StartActionBtn onClick={startUpload} style={{ background: '#EF4444' }}>
                        TENTAR NOVAMENTE
                    </StartActionBtn>
                </div>
            )}
        </UploadContainer>
    );
};

export default ChunkUploader;
