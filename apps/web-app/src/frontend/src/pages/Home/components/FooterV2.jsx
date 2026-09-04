import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import {
  FaInstagram, FaWhatsapp, FaEnvelope,
  FaCcVisa, FaCcMastercard, FaCcAmex, FaBarcode
} from 'react-icons/fa'
import { SiPix } from 'react-icons/si'
import { useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'
import { shopApi } from '../../../services/api'

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const FooterSection = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #FFFFFF;
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow: hidden;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ColumnTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Text = styled.p`
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  text-align: justify;
`

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`

const LinkItem = styled.li`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #DD8F39;
    padding-left: 5px;
  }
`

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #FFFFFF;
  
  svg {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 1.2rem;
    animation: ${pulse} 2s infinite ease-in-out;
  }
`

const PaymentRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  svg {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s;
    
    &:hover {
      color: #FFFFFF;
      transform: translateY(-2px);
    }
  }
`

const Credits = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const LogoImage = styled.img`
  max-width: 180px;
  height: auto;
  margin-bottom: 0.5rem;
  filter: brightness(0) invert(1); 
`

export default function FooterV2() {
  const { siteConfig } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [shopSettings, setShopSettings] = useState({
    footer_shop_link_active: 1,
    navbar_shop_button_text: 'Loja & Ingressos',
    navbar_shop_button_url: '/shop'
  })

  useEffect(() => {
    shopApi.getSettings()
      .then(res => {
        if (res?.data) {
          setShopSettings(prev => ({ ...prev, ...res.data }))
        }
      })
      .catch(() => {})
  }, [])

  const identityText = getSafeContent(siteConfig, 'home_footer', 'identityText', 'Um método desenvolvido e validado através de inúmeros resultados reais. Transformamos clínicas e pacientes através da fisiologia aplicada.')
  const contactEmail = getSafeContent(siteConfig, 'home_footer', 'contactEmail', 'contato@bodyharmony.com')
  const contactPhone = getSafeContent(siteConfig, 'home_footer', 'contactPhone', '(18) 99635-6825')
  const instagram = getSafeContent(siteConfig, 'home_footer', 'instagram', '@bodyharmonyoficial')
  const copyright = getSafeContent(siteConfig, 'home_footer', 'copyright', '© 2026 Protocolo Body Harmony. Todos os direitos reservados.')

  const handleNavigation = (path, hash = '') => {
    if (path.startsWith('http')) {
      window.open(path, '_blank')
      return
    }

    if (hash) {
      if (location.pathname === '/') {
        const element = document.querySelector(hash)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) element.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      }
    } else {
      navigate(path)
      window.scrollTo(0, 0)
    }
  }

  return (
    <FooterSection>
      <Container>
        {/* Block 1: Identity */}
        <Column>
          <LogoImage src="/logo.svg" alt="Body Harmony" />
          <Text {...editorAttr('home_footer', 'identityText')}>
            {identityText}
          </Text>
        </Column>

        {/* Block 2: Quick Links */}
        <Column>
          <ColumnTitle>LINKS RÁPIDOS</ColumnTitle>
          <LinkList>
            <LinkItem onClick={() => handleNavigation('/')}>Início</LinkItem>
            {shopSettings.footer_shop_link_active !== 0 && (
              <LinkItem 
                onClick={() => handleNavigation(shopSettings.navbar_shop_button_url || '/shop')} 
                style={{ color: '#ED7E13', fontWeight: 700 }}
              >
                🛍️ {shopSettings.navbar_shop_button_text || 'Loja & Ingressos'}
              </LinkItem>
            )}
            <LinkItem onClick={() => handleNavigation('/', '#metodo')}>O Método</LinkItem>
            <LinkItem onClick={() => handleNavigation('/resultados')}>Resultados</LinkItem>
            <LinkItem onClick={() => handleNavigation('/licenciadas')}>Licenciadas</LinkItem>
            <LinkItem onClick={() => handleNavigation('/mentores')}>Mentores</LinkItem>
            <LinkItem onClick={() => handleNavigation('/depoimentos')}>Depoimentos</LinkItem>
            <LinkItem onClick={() => handleNavigation('/contato')}>Contato</LinkItem>
            <LinkItem onClick={() => handleNavigation('/portal-licenciada')}>Área do Aluno (LMS)</LinkItem>
            <LinkItem onClick={() => handleNavigation('/admin/login')} style={{ opacity: 0.7 }}>Acesso Gestor</LinkItem>
          </LinkList>
        </Column>

        {/* Block 3: Contact */}
        <Column>
          <ColumnTitle>CONTATO</ColumnTitle>
          <ContactItem {...editorAttr('home_footer', 'contactEmail')}>
            <FaEnvelope />
            <span>{contactEmail}</span>
          </ContactItem>
          <ContactItem {...editorAttr('home_footer', 'contactPhone')}>
            <FaWhatsapp />
            <span>{contactPhone}</span>
          </ContactItem>
          <ContactItem {...editorAttr('home_instagram', 'username')}>
            <FaInstagram />
            <span>{instagram}</span>
          </ContactItem>
        </Column>

        {/* Block 4: Payment */}
        <Column>
          <ColumnTitle>PAGAMENTO SEGURO</ColumnTitle>
          <PaymentRow>
            <FaCcVisa title="Visa" />
            <FaCcMastercard title="Mastercard" />
            <FaCcAmex title="Amex" />
            <SiPix title="Pix" />
            <FaBarcode title="Boleto" />
          </PaymentRow>
        </Column>
      </Container>

      {/* Block 5: Credits */}
      <Credits>
        <p {...editorAttr('home_footer', 'copyright')}>{copyright}</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Made by N4-Labs</p>
      </Credits>
    </FooterSection>
  )
}
