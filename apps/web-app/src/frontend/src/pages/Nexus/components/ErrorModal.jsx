import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';
import { pt } from '../../../i18n/translations';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: #1a1a1a;
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 25px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  
  h3 {
    color: #f44336;
    margin: 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const CloseIcon = styled(X)`
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const ErrorCode = styled.div`
  background: #3a1b1b;
  color: #f44336;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  margin-bottom: 15px;
  font-weight: bold;
`;

const Message = styled.div`
  color: #ccc;
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const DetailsSection = styled.div`
  margin-top: 15px;
`;

const DetailsTitle = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-weight: bold;
  text-transform: uppercase;
`;

const Details = styled.pre`
  background: #111;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 12px;
  color: #888;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 200px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: #f44336;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  font-size: 0.95rem;
  font-weight: bold;
  transition: background 0.2s;
  
  &:hover {
    background: #d32f2f;
  }
`;

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <h3>
            <AlertTriangle size={24} />
            {pt.errors.title}
          </h3>
          <CloseIcon size={20} onClick={onClose} />
        </Header>

        {error.type && (
          <ErrorCode>{error.type}</ErrorCode>
        )}

        <Message>
          {error.type && pt.errors[error.type]
            ? pt.errors[error.type]
            : (error.message || pt.errors.UNKNOWN_ERROR)}
        </Message>

        {error.details && (
          <DetailsSection>
            <DetailsTitle>{pt.errors.technicalDetails}</DetailsTitle>
            <Details>{JSON.stringify(error.details, null, 2)}</Details>
          </DetailsSection>
        )}

        <CloseButton onClick={onClose}>
          {pt.common.close}
        </CloseButton>
      </Modal>
    </Overlay>
  );
};

export default ErrorModal;
