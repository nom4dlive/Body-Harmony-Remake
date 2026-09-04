import styled, { keyframes } from 'styled-components'
import { FaWhatsapp } from 'react-icons/fa'

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(37, 211, 102, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
  }
`

const WhatsAppButtonWrapper = styled.a`
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 99;
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.whatsapp};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation: ${pulse} 2s infinite;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: scale(1.1);
    background: #20c157;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 55px;
    height: 55px;
    font-size: 1.75rem;
    bottom: 20px;
    right: 16px;
  }
`

export default function WhatsAppButton() {
  const phoneNumber = '5518996356825'
  const message = encodeURIComponent('Olá, vi seu contato no site e gostaria de falar sobre o licenciamento')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <WhatsAppButtonWrapper
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <FaWhatsapp />
    </WhatsAppButtonWrapper>
  )
}
