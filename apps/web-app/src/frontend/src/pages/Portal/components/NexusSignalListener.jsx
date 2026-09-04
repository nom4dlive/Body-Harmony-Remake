import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Megaphone, X, AlertTriangle, Info } from 'lucide-react';
import { useSignals } from '../../../context/SignalContext';

const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BannerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: ${props => props.$type === 'alert' ? '#EF4444' : (props.$type === 'warning' ? '#ED7E13' : '#0A3E60')};
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: ${slideDown} 0.5s ease-out;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 26, 41, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s ease;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #16161E;
  border: 1px solid #1F1F2E;
  border-top: 4px solid ${props => props.$type === 'alert' ? '#EF4444' : '#ED7E13'};
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SignalButton = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  width: 100%;
  min-height: 44px; /* Mobile accessibility */
  
  &:hover { background: #ff8c1a; transform: scale(1.02); }
  &:active { transform: scale(0.98); }
`;

const NexusSignalListener = () => {
    const { signals, acknowledge } = useSignals();

    if (!signals || signals.length === 0) return null;

    // Priorizamos o sinal mais recente para exibição forçada/banner
    const activeSignal = signals[0];

    const handleAcknowledge = (id) => {
        acknowledge(id);
    };

    // Modo Bloqueante (Modal)
    if (activeSignal.is_blocking == 1 || activeSignal.type === 'alert') {
        return (
            <ModalOverlay>
                <ModalContent $type={activeSignal.type}>
                    <div style={{ marginBottom: '20px' }}>
                        {activeSignal.type === 'alert' ? <AlertTriangle size={48} color="#EF4444" /> : <Megaphone size={48} color="#ED7E13" />}
                    </div>
                    <h2 style={{ color: '#fff', marginBottom: '15px' }}>{activeSignal.title || 'COMUNICADO IMPORTANTE'}</h2>
                    <p style={{ color: '#E0E0FF', lineHeight: '1.6', fontSize: '1.1rem' }}>{activeSignal.message}</p>
                    <SignalButton onClick={() => handleAcknowledge(activeSignal.id)}>
                        Entendi e Confirmar Leitura
                    </SignalButton>
                </ModalContent>
            </ModalOverlay>
        );
    }

    // Modo Banner (Top) - Apenas se não estiver no Drawer (Drawer lida com os outros)
    // Mas aqui vamos mostrar apenas o primeiro como banner se for info/warning
    return (
        <BannerContainer $type={activeSignal.type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {activeSignal.type === 'warning' ? <AlertTriangle size={20} style={{ flexShrink: 0 }} /> : <Info size={20} style={{ flexShrink: 0 }} />}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong style={{ marginRight: '8px' }}>{activeSignal.title}:</strong>
                    <span>{activeSignal.message}</span>
                </div>
            </div>
            <button
                onClick={() => handleAcknowledge(activeSignal.id)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', display: 'flex' }}
                aria-label="Fecar notificação"
            >
                <X size={20} />
            </button>
        </BannerContainer>
    );
};

export default NexusSignalListener;
