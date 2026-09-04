import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Megaphone, AlertTriangle, Info, BellOff } from 'lucide-react';
import { useSignals } from '../../../context/SignalContext';

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10001;
  animation: ${fadeIn} 0.3s ease;
`;

const DrawerContent = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: #0A3E60; /* Navy Blue principal */
  color: white;
  box-shadow: -5px 0 25px rgba(0,0,0,0.5);
  animation: ${slideIn} 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 10002;
  
  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const DrawerHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(5, 26, 41, 0.5);

  h3 {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    color: #ED7E13; /* Gold */
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

const SignalList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(237, 126, 19, 0.3); border-radius: 10px; }
`;

const SignalCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid ${props => props.$type === 'alert' ? '#EF4444' : (props.$type === 'warning' ? '#ED7E13' : '#3B82F6')};
  border-radius: 8px;
  padding: 15px;
  position: relative;
  transition: transform 0.2s, background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
`;

const SignalTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SignalMessage = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  font-family: 'Poppins', sans-serif;
`;

const SignalAcknowledge = styled.button`
  background: none;
  border: 1px solid rgba(237, 126, 19, 0.4);
  color: #ED7E13;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ED7E13;
    color: white;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 40px;
  
  p { margin-top: 15px; font-size: 0.9rem; }
`;

const NexusSignalDrawer = () => {
  const { signals, history, isDrawerOpen, setIsDrawerOpen, acknowledge } = useSignals();

  if (!isDrawerOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={16} color="#EF4444" />;
      case 'warning': return <AlertTriangle size={16} color="#ED7E13" />;
      default: return <Info size={16} color="#3B82F6" />;
    }
  };

  return (
    <>
      <DrawerOverlay onClick={() => setIsDrawerOpen(false)} />
      <DrawerContent>
        <DrawerHeader>
          <h3><Megaphone size={20} /> Central de Notificações</h3>
          <CloseButton onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </CloseButton>
        </DrawerHeader>

        <SignalList>
          {history.length === 0 ? (
            <EmptyState>
              <BellOff size={48} />
              <p>Tudo em silêncio por aqui.<br />Nenhuma notificação ativa no momento.</p>
            </EmptyState>
          ) : (
            history.map((signal) => (
              <SignalCard
                key={signal.id}
                $type={signal.type}
                style={{ opacity: signal.is_read ? 0.6 : 1 }}
              >
                <SignalTitle>
                  {getIcon(signal.type)}
                  {signal.title || 'Informativo'}
                  {signal.is_read && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Lido)</span>}
                </SignalTitle>
                <SignalMessage>{signal.message}</SignalMessage>
                {!signal.is_read && (
                  <SignalAcknowledge onClick={() => acknowledge(signal.id)}>
                    Marcar como lido
                  </SignalAcknowledge>
                )}
              </SignalCard>
            ))
          )}
        </SignalList>
      </DrawerContent>
    </>
  );
};

export default NexusSignalDrawer;
