import styled, { keyframes } from 'styled-components'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const scaleIn = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`

const checkmark = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  position: relative;
  animation: ${scaleIn} 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.large};
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textLight};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.dark};
  }
`

const CheckIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: ${checkmark} 0.5s ease 0.2s both;
  
  svg {
    color: white;
    font-size: 2.5rem;
  }
`

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 1rem;
  font-size: 2rem;
`

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1.5rem;
`

const OkButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 1rem;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark};
  }
`

export default function SuccessModal({ isOpen, onClose, title = "Agendamento Recebido!", message = "Em breve entraremos em contato." }) {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <CheckIcon>
          <FaCheckCircle />
        </CheckIcon>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <OkButton onClick={onClose}>OK</OkButton>
      </ModalContent>
    </Overlay>
  )
}
