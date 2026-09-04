import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaImage, FaPlay, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import LMSService from '../../../../services/LMSService';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #0A3E60;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 800;
`;

const Grid = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const StatsGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  flex: 1;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  
  .value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0A3E60;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0 0.5rem 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: #ED7E13;
  width: ${props => props.$progress}%;
  transition: width 0.4s ease;
`;

const Button = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(237, 126, 19, 0.15);

  &:hover:not(:disabled) {
    background: #FF8F26;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(237, 126, 19, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin-icon {
    animation: ${spin} 1s linear infinite;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  user-select: none;
  margin-top: 0.5rem;
`;

const ErrorMsg = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FEF2F2;
  color: #DC2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ThumbnailsBatchConverter = () => {
    const [status, setStatus] = useState({
        is_running: false,
        total_videos: 0,
        converted: 0,
        pending: 0,
        progress_percent: 0,
        last_error: null
    });
    const [force, setForce] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await LMSService.getThumbnailsBatchStatus();
            if (res && res.success) {
                setStatus(res.data);
            }
        } catch (e) {
            console.error('Error fetching thumbnails batch status:', e);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        let interval = null;
        if (status.is_running) {
            interval = setInterval(() => {
                fetchStatus();
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status.is_running]);

    const handleStartBatch = async () => {
        const msg = force 
            ? 'Deseja forçar a extração e regeneração de miniaturas de TODOS os vídeos locais? Isso substituirá as miniaturas atuais.'
            : `Deseja iniciar a geração automática de ${status.pending} miniatura(s) pendente(s) via FFmpeg na VPS?`;

        if (!confirm(msg)) {
            return;
        }

        setSubmitting(true);
        try {
            const res = await LMSService.generateThumbnailsBatch(force);
            if (res && res.success) {
                setStatus(prev => ({
                    ...prev,
                    is_running: true,
                    last_error: null
                }));
                fetchStatus();
            }
        } catch (e) {
            alert('Falha ao iniciar geração de miniaturas: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <Title>
                <FaImage /> Geração de Miniaturas em Lote (FFmpeg)
            </Title>
            <Grid>
                <StatsGroup>
                    <StatItem>
                        <span className="value">{status.total_videos}</span>
                        <span className="label">Aulas Locais</span>
                    </StatItem>
                    <StatItem style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
                        <span className="value" style={{ color: '#10B981' }}>{status.converted}</span>
                        <span className="label">Miniaturas OK</span>
                    </StatItem>
                    <StatItem style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
                        <span className="value" style={{ color: status.pending > 0 ? '#ED7E13' : '#64748B' }}>{status.pending}</span>
                        <span className="label">Sem Miniatura</span>
                    </StatItem>
                </StatsGroup>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Button 
                        disabled={submitting || status.is_running || (status.pending === 0 && !force)} 
                        onClick={handleStartBatch}
                    >
                        {status.is_running ? (
                            <>
                                <FaSpinner className="spin-icon" /> Gerando...
                            </>
                        ) : (
                            <>
                                <FaPlay /> Extrair Miniaturas
                            </>
                        )}
                    </Button>
                    {!status.is_running && status.pending === 0 && (
                        <CheckboxLabel>
                            <input 
                                type="checkbox" 
                                checked={force} 
                                onChange={e => setForce(e.target.checked)} 
                                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                            />
                            Forçar extração global
                        </CheckboxLabel>
                    )}
                </div>
            </Grid>

            {status.is_running && (
                <div style={{ marginTop: '1.2rem' }}>
                    <ProgressBarContainer>
                        <ProgressBar $progress={status.progress_percent} />
                    </ProgressBarContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', fontWeight: 'bold' }}>
                        <span>Progresso Geral</span>
                        <span>{status.progress_percent}%</span>
                    </div>
                </div>
            )}

            {!status.is_running && status.pending === 0 && (
                <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.875rem', fontWeight: '700' }}>
                    <FaCheckCircle fontSize="1.1rem" /> Todas as miniaturas estão configuradas ou extraídas com sucesso.
                </div>
            )}

            {status.last_error && (
                <ErrorMsg>
                    <FaExclamationTriangle fontSize="1.1rem" />
                    <span><strong>Erro Recente:</strong> {status.last_error}</span>
                </ErrorMsg>
            )}
        </Card>
    );
};

export default ThumbnailsBatchConverter;
