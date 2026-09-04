import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { FaClock, FaWhatsapp, FaHome, FaInfoCircle } from 'react-icons/fa'
import { MAINTENANCE_CONFIG } from '../../config/maintenance'

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(237, 126, 19, 0.2); }
  50% { box-shadow: 0 0 40px rgba(237, 126, 19, 0.5); }
`

const textShimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0B2B43 0%, #05131E 100%);
  color: #FFFFFF;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', 'Inter', sans-serif;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 70% 30%, rgba(237, 126, 19, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 24px;
  padding: 3.5rem 2.5rem;
  width: 100%;
  max-width: 540px;
  text-align: center;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 10;

  @media (max-width: 480px) {
    padding: 2.5rem 1.5rem;
  }
`

const LogoWrapper = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
`

const Logo = styled.img`
  width: 160px;
  opacity: 0.95;
`

const IconContainer = styled.div`
  width: 90px;
  height: 90px;
  background: rgba(237, 126, 19, 0.1);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2.5rem;
  color: #ED7E13;
  font-size: 2.5rem;
  animation: ${float} 4s ease-in-out infinite, ${glow} 3s ease-in-out infinite;
`

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: #FFFFFF;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #ED7E13 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Message = styled.p`
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
  font-weight: 400;
`

// Caixa de Destaque Animada e Premium
const DisclaimerBox = styled(motion.div)`
  background: rgba(237, 126, 19, 0.05);
  border: 1px dashed rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
  box-shadow: inset 0 0 15px rgba(237, 126, 19, 0.03);

  svg {
    color: #ED7E13;
    font-size: 1.4rem;
    margin-top: 0.2rem;
    flex-shrink: 0;
  }
`

const DisclaimerText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;

  span.highlight {
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    background: linear-gradient(90deg, #FF9124, #FFF5E6, #ED7E13);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${textShimmer} 3s linear infinite;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 400px) {
    flex-direction: column;
  }
`

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #ED7E13;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 1rem 1.8rem;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px rgba(237, 126, 19, 0.25);

  &:hover {
    background: #FF9124;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(237, 126, 19, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 1rem 1.8rem;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

export default function MaintenancePage({ type = 'aluna' }) {
  const config = MAINTENANCE_CONFIG[type] || MAINTENANCE_CONFIG.aluna

  // Particionando o disclaimer para aplicar o gradiente animado
  const getDisclaimerElements = (text) => {
    if (!text) return null;
    const highlightPart = type === 'licenciada' 
      ? 'O PROBLEMA NÃO É COM O SEU DISPOSITIVO OU NAVEGADOR!' 
      : 'O PROBLEMA NÃO É COM O SEU CELULAR, TABLET OU NAVEGADOR!';
    
    const parts = text.split(highlightPart);
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          <span className="highlight">{highlightPart}</span>
          {parts[1]}
        </>
      );
    }
    return text;
  }

  return (
    <Container>
      <Card
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <LogoWrapper>
          <Logo src="/logo-white.svg" alt="Body Harmony Logo" />
        </LogoWrapper>

        <IconContainer>
          <FaClock />
        </IconContainer>

        <Title>{config.title}</Title>
        <Message>{config.message}</Message>

        {config.disclaimer && (
          <DisclaimerBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <FaInfoCircle />
            <DisclaimerText>
              {getDisclaimerElements(config.disclaimer)}
            </DisclaimerText>
          </DisclaimerBox>
        )}

        <ButtonGroup>
          <PrimaryButton 
            href="https://api.whatsapp.com/send/?phone=5518996356825&text=Olá! Gostaria de saber mais informações sobre os portais em manutenção."
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp size={20} />
            Suporte WhatsApp
          </PrimaryButton>
          
          <SecondaryButton href="/">
            <FaHome size={18} />
            Ir para a Home
          </SecondaryButton>
        </ButtonGroup>
      </Card>
    </Container>
  )
}
