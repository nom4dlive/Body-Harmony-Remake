import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaRobot, FaExternalLinkAlt, FaShieldAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A3E60;
  overflow: hidden;
  position: relative;
`;

const Header = styled.div`
  height: 60px;
  background: #0A3E60;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  border-bottom: 1px solid rgba(237, 126, 19, 0.2);
  z-index: 100;
`;

const Logo = styled.img`
  height: 30px;
`;

const Title = styled.h1`
  color: white;
  font-size: 1rem;
  margin-left: 2rem;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  span {
    color: #ED7E13;
    font-weight: 700;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at center, #114a70 0%, #0A3E60 100%);
`;

const TransitionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(237, 126, 19, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ED7E13;
  margin: 0 auto 2rem;
`;

const CardTitle = styled.h2`
  color: white;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const CardText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: #ED7E13;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(237, 126, 19, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(237, 126, 19, 0.3);
    background: #FF9124;
  }
`;

const SecurityNote = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
`;

const SupportEmbedPage = () => {
  const aiStudioUrl = "https://ai.studio/apps/e43206b1-7a2e-4982-82eb-d52435dd5abe?fullscreenApplet=true";

  return (
    <PageContainer>
      <Header>
        <Logo src="/logo-white.svg" alt="Body Harmony" />
        <Title>Suporte Inteligente <span>Nexus</span></Title>
      </Header>

      <Content>
        <TransitionCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <IconWrapper>
            <FaRobot size={40} />
          </IconWrapper>
          <CardTitle>Portal de Suporte Nexus</CardTitle>
          <CardText>
            Para garantir sua segurança e a melhor experiência interativa,
            nosso suporte inteligente opera em uma plataforma blindada do Google.
          </CardText>

          <ActionButton
            href={aiStudioUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Iniciar Conversa <FaExternalLinkAlt size={16} />
          </ActionButton>

          <SecurityNote>
            <FaShieldAlt size={12} /> Conexão protegida por criptografia Google Nexus
          </SecurityNote>
        </TransitionCard>
      </Content>
    </PageContainer>
  );
};

export default SupportEmbedPage;
