import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Dialog = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .icon {
    color: #ff4444;
  }
  
  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const Content = styled.div`
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 24px;
  
  strong {
    color: #ED7E13;
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 24px;
  background: ${props => props.$danger ? '#ff4444' : 'transparent'};
  border: 1px solid ${props => props.$danger ? '#ff4444' : '#444'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$danger ? '#cc0000' : '#222'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    loading = false
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onCancel}>
            <Dialog onClick={(e) => e.stopPropagation()}>
                <Header>
                    <AlertTriangle size={24} className="icon" />
                    <h3>{title}</h3>
                </Header>

                <Content dangerouslySetInnerHTML={{ __html: message }} />

                <Actions>
                    <Button onClick={onCancel} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button $danger onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processando...' : confirmText}
                    </Button>
                </Actions>
            </Dialog>
        </Overlay>
    );
};

export default ConfirmDialog;
