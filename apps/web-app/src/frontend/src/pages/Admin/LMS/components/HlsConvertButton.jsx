import React, { useState } from 'react';
import styled from 'styled-components';
import { FaServer, FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import LMSService from '@/services/LMSService';

const ConvertButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => {
        if (props.$status === 'success') return '#D1FAE5';
        if (props.$status === 'error') return '#FEE2E2';
        if (props.$status === 'loading') return '#DBEAFE';
        return '#E0E7FF';
    }};
  
  color: ${props => {
        if (props.$status === 'success') return '#065F46';
        if (props.$status === 'error') return '#991B1B';
        if (props.$status === 'loading') return '#1E40AF';
        return '#3730A3';
    }};

  &:hover:not(:disabled) {
    background: #C7D2FE;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export default function HlsConvertButton({ lesson }) {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    if (!lesson || lesson.video_type !== 'hostinger' || !lesson.video_ref) {
        return null;
    }

    // Se já tem hls_path, não exibimos ou exibimos como concluído
    if (lesson.v84_hls_path || lesson.hls_path) {
        return (
            <ConvertButton $status="success" disabled title="Vídeo já possui versão HLS pronta">
                <FaCheckCircle /> HLS Ativo
            </ConvertButton>
        );
    }

    const handleConvert = async () => {
        if (!confirm('Iniciar conversão do vídeo para HLS? Isso rodará em background no servidor.')) return;

        setStatus('loading');
        setMessage('Iniciando...');

        try {
            const res = await LMSService.convertToHls(lesson.id);
            if (res.success) {
                setStatus('success');
                setMessage('Conversão iniciada em background!');
            } else {
                setStatus('error');
                setMessage(res.error || 'Falha ao iniciar conversão');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Erro de conexão ou servidor.');
            console.error(err);
        }
    };

    return (
        <ConvertButton
            $status={status}
            onClick={handleConvert}
            disabled={status === 'loading' || status === 'success'}
            title={message || "Converter MP4 legado para formato de streaming HLS (mais rápido, sem erros 503)"}
        >
            {status === 'idle' && <><FaServer /> Converter para HLS</>}
            {status === 'loading' && <><FaSpinner className="fa-spin" /> {message}</>}
            {status === 'success' && <><FaCheckCircle /> {message}</>}
            {status === 'error' && <><FaTimesCircle /> {message}</>}
        </ConvertButton>
    );
}
