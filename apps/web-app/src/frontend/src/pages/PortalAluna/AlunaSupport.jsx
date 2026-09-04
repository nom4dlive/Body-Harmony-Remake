import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, HelpCircle, PhoneCall, BookOpen } from 'lucide-react';
import AlunaHeader from '../../components/PortalAluna/AlunaHeader';

const Page = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    font-family: ${({ theme }) => theme.fonts.heading};
  }
  
  p {
    color: #64748B;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const FaqContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 4rem;
`;

const FaqItem = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  
  &:hover {
    border-color: rgba(10, 62, 96, 0.2);
  }
`;

const FaqQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  
  svg {
    transition: transform 0.3s;
    transform: ${p => p.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FaqAnswer = styled(motion.div)`
  padding: 0 1.5rem;
  color: #475569;
  line-height: 1.7;
  font-size: 0.95rem;
`;

const SupportCards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  
  .icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: rgba(237, 126, 19, 0.1);
    color: ${({ theme }) => theme.colors.secondary};
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.25rem; margin-bottom: 0.5rem; font-weight: 700;
  }
  
  p { color: #64748B; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5; }
`;

const ActionBtn = styled.a`
  display: inline-flex; align-items: center; gap: 0.75rem;
  background: ${p => p.$primary ? p.theme.colors.secondary : '#FFFFFF'};
  color: ${p => p.$primary ? '#FFFFFF' : p.theme.colors.primary};
  border: ${p => p.$primary ? 'none' : `1px solid ${p.theme.colors.primary}`};
  padding: 0.85rem 2rem; border-radius: 2rem; font-weight: 700; font-size: 0.95rem;
  text-decoration: none; cursor: pointer; transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$primary ? '0 10px 20px rgba(237,126,19,0.2)' : '0 4px 10px rgba(0,0,0,0.05)'};
  }
`;

const FAQS = [
  { q: 'Como acesso meu certificado após concluir o curso?', a: 'O certificado é gerado automaticamente e enviado para o seu e-mail cadastrado em até 24 horas úteis após você marcar 100% das aulas como concluídas no módulo.' },
  { q: 'Como alterar minha senha?', a: 'Acesse o menu "Meu Perfil" no canto superior direito, navegue até a seção "Segurança e Senha" e insira sua senha atual e a nova senha desejada.' },
  { q: 'Meu vídeo travou, o que eu faço?', a: 'Primeiro, recarregue a página (F5). Se o problema persistir, limpe o cache do seu navegador ou tente acessar através de uma aba anônima. Nossos vídeos utilizam qualidade adaptativa conforme sua velocidade de internet.' },
  { q: 'Por quanto tempo tenho acesso ao curso?', a: 'Iso depende do plano adquirido. A maioria dos nossos programas premium possui acesso de 12 meses (1 ano) a partir da data de confirmação do pagamento.' }
];

export default function AlunaSupport() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <Page>
      <AlunaHeader />
      <Main>
        <HeroSection>
          <h1>Como podemos te ajudar?</h1>
          <p>Encontre respostas rápidas para suas dúvidas ou entre em contato com nosso time de Suporte Premium.</p>
        </HeroSection>

        <FaqContainer>
          <h2 style={{ color: '#0A3E60', fontSize: '1.4rem', marginBottom: '1rem' }}>Dúvidas Frequentes</h2>
          {FAQS.map((faq, idx) => (
            <FaqItem key={idx}>
              <FaqQuestion $isOpen={openIndex === idx} onClick={() => toggleFaq(idx)}>
                {faq.q}
                <ChevronDown size={20} />
              </FaqQuestion>
              <AnimatePresence>
                {openIndex === idx && (
                  <FaqAnswer
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, paddingBottom: '1.5rem' }}
                    exit={{ height: 0, opacity: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {faq.a}
                  </FaqAnswer>
                )}
              </AnimatePresence>
            </FaqItem>
          ))}
        </FaqContainer>

        <SupportCards>
          <Card>
            <div className="icon"><MessageCircle size={32} /></div>
            <h3>Suporte Rápido</h3>
            <p>Fale diretamente com nossa equipe de suporte pelo WhatsApp. Respostas em horário comercial.</p>
            <ActionBtn $primary href="https://wa.me/5518996356825?text=Olá! Preciso de ajuda no Portal Aluna." target="_blank">
              Falar no WhatsApp
            </ActionBtn>
          </Card>
          <Card>
            <div className="icon"><PhoneCall size={32} /></div>
            <h3>Problemas Financeiros</h3>
            <p>Dúvidas sobre faturamento, nota fiscal ou liberação de acesso de compras recentes.</p>
            <ActionBtn href="mailto:contato@bodyharmony.com.br">
              Enviar E-mail
            </ActionBtn>
          </Card>
        </SupportCards>
      </Main>
    </Page>
  );
}
