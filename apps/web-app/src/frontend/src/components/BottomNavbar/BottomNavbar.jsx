import React from 'react'
import styled, { keyframes } from 'styled-components'
import { NavLink, useLocation } from 'react-router-dom'
import { FaHome, FaVideo, FaBook, FaUser, FaStar, FaBrain } from 'react-icons/fa'
import { useLicenciadaAuth } from '../../context/LicenciadaAuthContext'

const pulseDot = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(237, 126, 19, 0.8); }
  70%  { box-shadow: 0 0 0 6px rgba(237, 126, 19, 0); }
  100% { box-shadow: 0 0 0 0 rgba(237, 126, 19, 0); }
`

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: linear-gradient(180deg, rgba(5, 26, 41, 0.98) 0%, #051A29 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: none;
  justify-content: space-around;
  align-items: center;
  padding: 0 4px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 1000;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    display: flex;
  }
`

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 6px;
  border-radius: 8px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors?.darkTextMuted || '#94A3B8'};
  font-size: 0.62rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 68px;
  min-height: 44px;
  position: relative;
  -webkit-tap-highlight-color: transparent;

  svg {
    font-size: 1.1rem;
    transition: transform 0.2s ease;
  }

  &.active {
    color: ${({ theme }) => theme.colors?.secondary || '#ED7E13'};
    background: rgba(237, 126, 19, 0.08);
    svg { transform: scale(1.08); }
  }

  &:active { transform: scale(0.95); }
`

const PremiumNavItem = styled(NavItem)`
  color: #ED7E13;
  font-weight: 700;
  svg { color: #ED7E13; }
  &.active {
    background: rgba(237, 126, 19, 0.12);
    color: #ED7E13;
  }
`

const PremiumDot = styled.span`
  position: absolute;
  top: 4px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: #ED7E13;
  border-radius: 50%;
  border: 1px solid #051A29;
  animation: ${pulseDot} 1.8s ease-in-out infinite;
`

const navItems = [
  { to: '/portal-licenciada/dashboard',   icon: FaHome,  label: 'Início',    premium: false },
  { to: '/portal-licenciada/minhas-aulas', icon: FaVideo, label: 'Aulas',    premium: false },
  { to: '/portal-licenciada/smartbook',   icon: FaBrain, label: 'Smart Book',premium: false },
  { to: '/portal-licenciada/premium',     icon: FaStar,  label: 'Premium',   premium: true  },
  { to: '/portal-licenciada/biblioteca',  icon: FaBook,  label: 'Biblioteca',premium: false },
  { to: '/portal-licenciada/perfil',      icon: FaUser,  label: 'Perfil',    premium: false },
]

export const BottomNavbar = () => {
  const location = useLocation()
  const { student } = useLicenciadaAuth()

  const hasSmartBook = Boolean(student?.ai_notebook_beta_enabled === 1 || student?.ai_notebook_beta_enabled === true)

  const activeNavItems = navItems.filter(item => {
    if (item.to === '/portal-licenciada/smartbook' && !hasSmartBook) return false
    return true
  })

  return (
    <NavContainer>
      {activeNavItems.map(({ to, icon: Icon, label, premium }) => {
        const isActive = location.pathname === to ||
          (to !== '/portal-licenciada/dashboard' && location.pathname.startsWith(to))
        if (premium) {
          return (
            <PremiumNavItem
              key={to}
              to={to}
              id="bottom-nav-premium"
              className={isActive ? 'active' : ''}
            >
              <Icon />
              <span>{label}</span>
              <PremiumDot />
            </PremiumNavItem>
          )
        }
        return (
          <NavItem
            key={to}
            to={to}
            className={isActive ? 'active' : ''}
          >
            <Icon />
            <span>{label}</span>
          </NavItem>
        )
      })}
    </NavContainer>
  )
}

export default BottomNavbar
