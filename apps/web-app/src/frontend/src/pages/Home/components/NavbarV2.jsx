import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUserGraduate } from 'react-icons/fa'
import { useData } from '../../../context/DataContext'
import { editorAttr } from '../../../utils/configUtils'
import { shopApi } from '../../../services/api'

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: ${({ $density }) => ($density === 'lg' ? '90px' : $density === 'sm' ? '60px' : '72px')};
  box-sizing: border-box;
  
  /* Glassmorphism Refinado */
  background: ${({ $isScrolled }) =>
    $isScrolled
      ? 'rgba(5, 26, 41, 0.92)' /* Deep Navy Glass */
      : 'linear-gradient(180deg, rgba(5, 26, 41, 0.95) 0%, rgba(5, 26, 41, 0.4) 70%, rgba(5, 26, 41, 0) 100%)'};
      
  backdrop-filter: ${({ $isScrolled }) => ($isScrolled ? 'blur(16px)' : 'blur(4px)')};
  border-bottom: ${({ $isScrolled }) => ($isScrolled ? '1px solid rgba(255,255,255,0.08)' : 'none')};
  box-shadow: ${({ $isScrolled }) => ($isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.2)' : 'none')};

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
  color: #FFFFFF;

  @media (max-width: 1440px) {
    padding: 0 1.5rem;
  }

  @media (max-width: 1140px) {
    padding: 0 1.25rem;
  }
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
  
  img {
    height: 36px;
    width: auto;
    transition: all 0.3s ease;
    filter: brightness(0) invert(1);
    
    @media (max-width: 1280px) {
      height: 30px;
    }
  }
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: auto;
  margin-right: 1.25rem;

  @media (max-width: 1440px) {
    gap: 0.9rem;
    margin-right: 0.9rem;
  }

  @media (max-width: 1280px) {
    gap: 0.65rem;
    margin-right: 0.65rem;
  }

  @media (max-width: 1140px) {
    display: none;
  }
`

const NavLink = styled.a`
  font-size: 0.78rem;
  font-weight: 600;
  color: #E2E8F0;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  opacity: 0.9;
  transition: all 0.2s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
  white-space: nowrap;

  @media (max-width: 1280px) {
    font-size: 0.72rem;
    letter-spacing: 0.2px;
  }

  &:hover {
    opacity: 1;
    color: #ED7E13;
    text-shadow: 0 0 10px rgba(237, 126, 19, 0.4);
  }
`

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.4rem;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;

  @media (max-width: 1140px) {
    display: flex;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 1140px) {
    display: none;
  }
`

const AlunoButton = styled(Link)`
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: #ED7E13;
    color: #ED7E13;
    transform: translateY(-1px);
  }
`

const SecondaryCTAButton = styled.a`
  background: transparent;
  color: #FFFFFF;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.78rem;
  text-transform: uppercase;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  @media (max-width: 1380px) {
    display: none;
  }

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
    border-color: #FFFFFF;
  }
`

const CTAButton = styled.a`
  background: ${({ $color, theme }) => ($color || theme.colors.secondary)};
  color: white;
  padding: 0.5rem 1.15rem;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  transition: all 0.2s ease;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.3);

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.08);
    box-shadow: 0 4px 14px rgba(237, 126, 19, 0.45);
  }
`

export default function NavbarV2() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [shopSettings, setShopSettings] = useState({
    navbar_shop_button_active: 1,
    navbar_shop_button_text: 'Loja & Ingressos',
    navbar_shop_button_badge: 'NOVO',
    navbar_shop_button_badge_active: 1,
    navbar_shop_button_url: '/shop'
  })
  const { siteConfig } = useData()
  const location = useLocation()

  // Dynamic Settings
  const navVisible = siteConfig?.navbar?.enabled !== false
  const rawLinks = siteConfig?.navbar?.links || []
  const style = siteConfig?.navbar?.style || {}

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)

    // Carregar configurações dinâmicas da Loja / Ingressos
    shopApi.getSettings()
      .then(res => {
        if (res?.data) {
          setShopSettings(prev => ({ ...prev, ...res.data }))
        }
      })
      .catch(() => {})

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!navVisible) return null

  // Filtrar links duplicados de Aluna ou Loja da lista de links textuais
  const cleanedLinks = Array.isArray(rawLinks)
    ? rawLinks.filter(l => {
        const lbl = (l.label || '').toLowerCase()
        const url = (l.url || '').toLowerCase()
        return !lbl.includes('aluno') && !lbl.includes('aluna') && !url.includes('portal-licenciada') && !url.includes('/loja') && !url.includes('/shop')
      })
    : null

  return (
    <Nav
      $isScrolled={isScrolled}
      $density={style.density}
    >
      <Logo to="/">
        <img src="/logo.svg" alt="Body Harmony" width="200" height="40" />
      </Logo>

      <NavLinks>
        {Array.isArray(cleanedLinks) ? (
          cleanedLinks.map((link, index) => {
            const isInternal = link.url.startsWith('/')
            return (
              <NavLink
                key={index}
                as={isInternal ? Link : 'a'}
                to={isInternal ? link.url : undefined}
                href={isInternal ? undefined : link.url}
                target={!isInternal && link.url.startsWith('http') ? '_blank' : undefined}
              >
                {link.label}
              </NavLink>
            )
          })
        ) : (
          <>
            <NavLink as={Link} to="/#metodo">O Método</NavLink>
            <NavLink as={Link} to="/licenciadas">Licenciadas</NavLink>
            <NavLink as={Link} to="/resultados">Resultados</NavLink>
            <NavLink as={Link} to="/depoimentos">Depoimentos</NavLink>
            <NavLink as={Link} to="/contato">Contato</NavLink>
          </>
        )}

        {/* Link Oficial da Loja & Ingressos (Configurável no Gestor - PLAN-138) */}
        {shopSettings.navbar_shop_button_active !== 0 && (
          shopSettings.navbar_shop_button_url?.startsWith('http') ? (
            <NavLink 
              as="a" 
              href={shopSettings.navbar_shop_button_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#ED7E13', 
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{shopSettings.navbar_shop_button_text || 'Loja & Ingressos'}</span>
              {shopSettings.navbar_shop_button_badge_active !== 0 && Boolean(shopSettings.navbar_shop_button_badge) && (
                <span style={{
                  background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  letterSpacing: '0.3px',
                  lineHeight: 1.2
                }}>
                  {shopSettings.navbar_shop_button_badge}
                </span>
              )}
            </NavLink>
          ) : (
            <NavLink 
              as={Link} 
              to={shopSettings.navbar_shop_button_url || '/shop'} 
              style={{ 
                color: '#ED7E13', 
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{shopSettings.navbar_shop_button_text || 'Loja & Ingressos'}</span>
              {shopSettings.navbar_shop_button_badge_active !== 0 && Boolean(shopSettings.navbar_shop_button_badge) && (
                <span style={{
                  background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  letterSpacing: '0.3px',
                  lineHeight: 1.2
                }}>
                  {shopSettings.navbar_shop_button_badge}
                </span>
              )}
            </NavLink>
          )
        )}
      </NavLinks>

      <ButtonContainer>
        {/* Botão Ergonômico: Área do Aluno */}
        <AlunoButton
          to="/portal-licenciada"
          title="Acessar Área do Aluno / Licenciada"
        >
          <FaUserGraduate size={12} />
          <span>Área do Aluno</span>
        </AlunoButton>

        {/* Botão Secundário configurado (se existir) */}
        {siteConfig?.navbar?.secondaryCtaText && (
          <SecondaryCTAButton
            as={siteConfig.navbar?.secondaryCtaLink?.startsWith('/') ? Link : 'a'}
            to={siteConfig.navbar?.secondaryCtaLink?.startsWith('/') ? siteConfig.navbar.secondaryCtaLink : undefined}
            href={!siteConfig.navbar?.secondaryCtaLink?.startsWith('/') ? (siteConfig.navbar?.secondaryCtaLink || "https://wa.me/5518996356825") : undefined}
            target={!siteConfig.navbar?.secondaryCtaLink?.startsWith('/') ? "_blank" : undefined}
          >
            {siteConfig.navbar.secondaryCtaText}
          </SecondaryCTAButton>
        )}

        {/* CTA Principal de Conversão */}
        <CTAButton
          as={siteConfig.navbar?.ctaLink?.startsWith('/') ? Link : 'a'}
          to={siteConfig.navbar?.ctaLink?.startsWith('/') ? siteConfig.navbar.ctaLink : undefined}
          href={!siteConfig.navbar?.ctaLink?.startsWith('/') ? (siteConfig.navbar?.ctaLink || "https://wa.me/5518996356825") : undefined}
          target={!siteConfig.navbar?.ctaLink?.startsWith('/') ? "_blank" : undefined}
          $color={style.ctaCustomColor}
        >
          {siteConfig?.navbar?.ctaText || "Seja uma Licenciada"}
        </CTAButton>
      </ButtonContainer>

      <MobileMenuBtn onClick={() => setIsMobileMenuOpen(true)}>
        <FaBars />
      </MobileMenuBtn>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              height: '100vh',
              background: '#081B2B',
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.75rem',
              padding: '2rem'
            }}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                cursor: 'pointer'
              }}
            >
              <FaTimes />
            </button>

            {Array.isArray(cleanedLinks) ? (
              cleanedLinks.map((link, index) => {
                const isInternal = link.url.startsWith('/')
                return (
                  <NavLink
                    key={index}
                    as={isInternal ? Link : 'a'}
                    to={isInternal ? link.url : undefined}
                    href={isInternal ? undefined : link.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ fontSize: '1rem' }}
                  >
                    {link.label}
                  </NavLink>
                )
              })
            ) : (
              <>
                <NavLink as={Link} to="/#metodo" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem' }}>O Método</NavLink>
                <NavLink as={Link} to="/licenciadas" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem' }}>Licenciadas</NavLink>
                <NavLink as={Link} to="/resultados" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem' }}>Resultados</NavLink>
                <NavLink as={Link} to="/depoimentos" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem' }}>Depoimentos</NavLink>
                <NavLink as={Link} to="/contato" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem' }}>Contato</NavLink>
              </>
            )}

            {shopSettings.navbar_shop_button_active !== 0 && (
              shopSettings.navbar_shop_button_url?.startsWith('http') ? (
                <NavLink 
                  as="a" 
                  href={shopSettings.navbar_shop_button_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ color: '#ED7E13', fontWeight: 800, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🛍️ {shopSettings.navbar_shop_button_text || 'Loja & Ingressos'}</span>
                  {shopSettings.navbar_shop_button_badge_active !== 0 && Boolean(shopSettings.navbar_shop_button_badge) && (
                    <span style={{ fontSize: '0.65rem', background: '#ED7E13', color: '#fff', padding: '1px 5px', borderRadius: '9999px' }}>
                      {shopSettings.navbar_shop_button_badge}
                    </span>
                  )}
                </NavLink>
              ) : (
                <NavLink 
                  as={Link} 
                  to={shopSettings.navbar_shop_button_url || '/shop'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ color: '#ED7E13', fontWeight: 800, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🛍️ {shopSettings.navbar_shop_button_text || 'Loja & Ingressos'}</span>
                  {shopSettings.navbar_shop_button_badge_active !== 0 && Boolean(shopSettings.navbar_shop_button_badge) && (
                    <span style={{ fontSize: '0.65rem', background: '#ED7E13', color: '#fff', padding: '1px 5px', borderRadius: '9999px' }}>
                      {shopSettings.navbar_shop_button_badge}
                    </span>
                  )}
                </NavLink>
              )
            )}

            <NavLink 
              as={Link} 
              to="/portal-licenciada" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1rem' }}
            >
              🎓 Área do Aluno / LMS
            </NavLink>

            <CTAButton
              href={siteConfig?.navbar?.ctaLink || "https://wa.me/5518996356825"}
              onClick={() => setIsMobileMenuOpen(false)}
              $color={style.ctaCustomColor}
            >
              {siteConfig?.navbar?.ctaText || "Seja uma Licenciada"}
            </CTAButton>

            <NavLink 
              as={Link} 
              to="/admin/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '1rem' }}
            >
              🔒 Acesso Restrito (Gestor)
            </NavLink>

          </motion.div>
        )}
      </AnimatePresence>
    </Nav>
  )
}
