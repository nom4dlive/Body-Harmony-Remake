import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa'
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar'
import { PortalNavbar } from './components/PortalNavbar'
import { api } from '../../services/api'

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.darkBg};
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(49, 107, 156, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(237, 126, 19, 0.05) 0%, transparent 50%);
  background-attachment: fixed;
  color: ${({ theme }) => theme.colors.darkText};
  padding-bottom: 80px;
`

const Header = styled.header`
  padding: 2rem 4% 3rem;
  background: #051A29;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #ED7E13 0%, #051A29 100%);
    opacity: 0.3;
  }

  .header-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 2rem;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: rgba(255,255,255,0.7);
    font-size: 0.95rem;
  }
`

const Content = styled.main`
  padding: 2rem 4%;
  max-width: 800px;
  margin: 0 auto;
`

const CategorySection = styled.section`
  margin-bottom: 2rem;
`

const CategoryTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(237, 126, 19, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FaqItem = styled(motion.div)`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: border-color 0.3s;

  &:hover {
    border-color: rgba(237, 126, 19, 0.3);
  }
`

const FaqQuestion = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  color: #F1F5F9;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: color 0.3s;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  svg {
    flex-shrink: 0;
    transition: transform 0.3s;
  }
`

const FaqAnswer = styled(motion.div)`
  padding: 0 1.25rem 1rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  line-height: 1.7;
  white-space: pre-wrap;

  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255,255,255,0.5);

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: rgba(255,255,255,0.2);
  }

  p {
    font-size: 1rem;
  }
`

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  transition: color 0.3s;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

export default function FaqPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    api.getFaq().then(res => {
      setFaqs(Array.isArray(res) ? res : res.faqs || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const grouped = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {})

  if (loading) {
    return (
      <PageContainer>
        <PortalNavbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'white', gap: '1rem' }}>
          <div className="spin" style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          Carregando perguntas frequentes...
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PortalNavbar />

      <Header>
        <div className="header-content">
          <BackLink href="/portal-licenciada/dashboard">
            <FaArrowLeft /> Voltar ao painel
          </BackLink>
          <h1><FaQuestionCircle /> Perguntas Frequentes</h1>
          <p>Encontre respostas rápidas para as dúvidas mais comuns das licenciadas.</p>
        </div>
      </Header>

      <Content>
        {Object.keys(grouped).length === 0 ? (
          <EmptyState>
            <FaQuestionCircle />
            <p>Nenhuma pergunta cadastrada ainda.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Contate o suporte: <a href="https://wa.me/5518996959486" style={{ color: '#ED7E13' }}>WhatsApp</a>
            </p>
          </EmptyState>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <CategorySection key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <AnimatePresence>
                {items.map(faq => (
                  <FaqItem
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FaqQuestion onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
                      {faq.question}
                      <FaChevronDown
                        style={{
                          transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                          color: openId === faq.id ? '#ED7E13' : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    </FaqQuestion>
                    <AnimatePresence>
                      {openId === faq.id && (
                        <FaqAnswer
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      )}
                    </AnimatePresence>
                  </FaqItem>
                ))}
              </AnimatePresence>
            </CategorySection>
          ))
        )}
      </Content>

      <BottomNavbar />
    </PageContainer>
  )
}
