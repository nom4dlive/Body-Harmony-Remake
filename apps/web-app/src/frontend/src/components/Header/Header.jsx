import styled, { css } from 'styled-components'
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useData } from '../../context/DataContext'

// --- Props Helpers ---
const getDensity = (density) => {
  switch(density) {
    case 'sm': return '0.5rem 1rem';
    case 'lg': return '1.5rem 1rem';
    case 'md': default: return '1rem 1rem'; // Increased default slightly
  }
}

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all 0.3s ease;

  /* Background & Glassmorphism Logic */
  ${({ $glass, $bg, theme }) => $glass ? css`
    background: ${$bg ? `${$bg}cc` : 'rgba(255, 255, 255, 0.8)'}; /* Fallback to 0.8 alpha */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  ` : css`
    background: ${$bg || theme.colors.white};
  `}
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  max-width: 1240px;
  margin: 0 auto;
  padding: ${({ $density }) => getDensity($density)};
  width: 100%;

  /* Layout Logic */
  ${({ $layout }) => $layout === 'center' ? css`
    flex-direction: column;
    gap: 1.5rem;
    justify-content: center;
  ` : css`
    flex-direction: row;
    justify-content: space-between;
  `}
`

// --- Universal Colored Logo (Masking) ---
const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`

const ColoredLogo = styled.div`
  height: 60px;
  width: 200px; /* Aspect ratio safety */
  max-width: 100%;
  
  /* Masking Magic */
  mask-image: url(${({ $src }) => $src});
  -webkit-mask-image: url(${({ $src }) => $src});
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: ${({ $center }) => $center ? 'center' : 'left center'};
  -webkit-mask-position: ${({ $center }) => $center ? 'center' : 'left center'};
  
  background-color: ${({ $color }) => $color}; /* The actual paint */
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      height: 40px;
      width: 140px;
  }
`

const StandardLogo = styled.img`
  height: 60px;
  width: auto;
  max-width: 100%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 40px;
  }
`

const NavLinks = styled.ul`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  /* Mobile Menu Logic */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${({ $bg }) => $bg || '#FFFFFF'};
    padding: 2rem 1.5rem;
    gap: 1.2rem;
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
    z-index: 99;
  }

  /* Desktop Visibility for Minimal Layout */
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
     display: ${({ $layout }) => $layout === 'minimal' ? 'none' : 'flex'};
  }
`

const NavItem = styled.li`
  list-style: none;
`

const StyledNavLink = styled(NavLink)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 500;
  color: ${({ theme, $color }) => $color || theme.colors.dark};
  padding: 0.5rem 0;
  position: relative;
  text-decoration: none;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.secondary};
    transition: ${({ theme }) => theme.transitions.normal};
  }
  
  &:hover::after,
  &.active::after {
    width: 100%;
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const CTAButton = styled(Link)`
  background: ${({ theme, $customColor }) => $customColor || theme.colors.dark};
  color: ${({ theme }) => theme.colors.white}; 
  /* Todo: Add custom text color if we get really fancy */
  
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  letter-spacing: 1px;
  transition: ${({ theme }) => theme.transitions.normal};
  text-decoration: none;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`

const MenuToggle = styled.button`
  display: none; /* Default Hidden */
  
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme, $color }) => $color || theme.colors.dark};
  
  /* Show on Mobile OR Minimal Layout */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
  
  ${({ $layout }) => $layout === 'minimal' && css`
    display: block; /* Force show desktop */
  `}
`

const LogoFallbackWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding: ${({ $density }) => getDensity($density)};
    
    /* Background & Glass support for Alternative Mode */
    ${({ $glass, $bg }) => $glass ? css`
      background: ${$bg ? `${$bg}cc` : 'transparent'};
      backdrop-filter: blur(12px);
    ` : css`
      background: ${$bg || 'transparent'};
    `}
`

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { siteConfig } = useData()

  // Use new Navbar config or fallback to old structure
  const navbarConfig = siteConfig?.navbar || {
    enabled: siteConfig?.showNavbar !== false,
    links: {
      mentors: siteConfig?.showMentors !== false,
      licenciadas: siteConfig?.showLicentiates !== false,
      results: siteConfig?.showResults !== false,
      testimonials: siteConfig?.showTestimonials !== false,
      contact: siteConfig?.showContact !== false
    },
    style: {
      background: '#FFFFFF',
      textColor: '#333333'
    },
    logoFallback: {
        enabled: false,
        color: 'navy'
    }
  }

  // --- Destructure Super Props with Defaults ---
  const { 
    background, 
    textColor, 
    glass = false, 
    density = 'md', 
    layout = 'standard',
    ctaCustomColor = null,
    logoColor = null // New: Universal Logo Color
  } = navbarConfig.style || { background: '#FFF', textColor: '#333' }

  const links = navbarConfig.links || {}
  const logoSrc = "/logo.svg"

  // 1. ALTERNATIVE MODE (Hidden Menu)
  if (navbarConfig.enabled === false) {
      if (navbarConfig.logoFallback?.enabled) {
          // New: Super Fallback Logic
          const fallbackBg = navbarConfig.logoFallback.background || 'transparent'
          const fallbackColor = navbarConfig.logoFallback.color 
            ? (['navy', 'white'].includes(navbarConfig.logoFallback.color) ? null : navbarConfig.logoFallback.color) // Legacy check
            : null; 
            
          // Legacy Filter Handling (if user hasn't migrated to Hex)
          const legacyFilter = navbarConfig.logoFallback.color === 'white' ? 'brightness(0) invert(1)' : 'none';

          return (
              <LogoFallbackWrapper $bg={fallbackBg} $density={density}>
                  <Link to="/">
                    {fallbackColor ? (
                        <ColoredLogo $src={logoSrc} $color={fallbackColor} $center />
                    ) : (
                        <StandardLogo src={logoSrc} alt="Body Harmony" style={{ filter: legacyFilter }} />
                    )}
                  </Link>
              </LogoFallbackWrapper>
          )
      }
      return null
  }

  // 2. STANDARD SUPER NAVBAR
  return (
    <HeaderWrapper $bg={background} $glass={glass}>
      <Nav $layout={layout} $density={density}>
        <LogoContainer to="/">
           {/* Universal Logo Color Logic */}
           {logoColor ? (
             <ColoredLogo $src={logoSrc} $color={logoColor} />
           ) : (
             <StandardLogo src={logoSrc} alt="Body Harmony" />
           )}
        </LogoContainer>
        
        <MenuToggle 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            $color={textColor}
            $layout={layout}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </MenuToggle>
        
        <NavLinks $isOpen={isMenuOpen} $bg={background} $layout={layout}>
          <NavItem>
            <StyledNavLink to="/" onClick={() => setIsMenuOpen(false)} $color={textColor}>Início</StyledNavLink>
          </NavItem>
          
          {links.mentors && (
            <NavItem>
              <StyledNavLink to="/mentores" onClick={() => setIsMenuOpen(false)} $color={textColor}>Mentores</StyledNavLink>
            </NavItem>
          )}

          {links.licenciadas && (
            <NavItem>
              <StyledNavLink to="/licenciadas" onClick={() => setIsMenuOpen(false)} $color={textColor}>Licenciadas</StyledNavLink>
            </NavItem>
          )}

          {links.results && (
            <NavItem>
              <StyledNavLink to="/resultados" onClick={() => setIsMenuOpen(false)} $color={textColor}>Transformações</StyledNavLink>
            </NavItem>
          )}

          {links.testimonials && (
            <NavItem>
              <StyledNavLink to="/depoimentos" onClick={() => setIsMenuOpen(false)} $color={textColor}>Depoimentos</StyledNavLink>
            </NavItem>
          )}

          {links.contact && (
            <NavItem>
              <StyledNavLink to="/contato" onClick={() => setIsMenuOpen(false)} $color={textColor}>Contato</StyledNavLink>
            </NavItem>
          )}

          <NavItem>
            <CTAButton 
                to="/contato" 
                onClick={() => setIsMenuOpen(false)}
                $customColor={ctaCustomColor}
            >
              Quero Me Inscrever
            </CTAButton>
          </NavItem>
        </NavLinks>
      </Nav>
    </HeaderWrapper>
  )
}
