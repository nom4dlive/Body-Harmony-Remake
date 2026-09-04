import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAlunaAuth } from '../../context/AlunaAuthContext'
import { useAlunaTheme } from '../../context/GestorThemeContext'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { LogOut, Sun, Moon } from 'lucide-react'

const COLORS = {
  primary: '#0A3E60',
  secondary: '#ED7E13',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.5)',
}

const HeaderWrapper = styled.header`
  background: rgba(10, 62, 96, 0.85); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 50;
  
  @media (min-width: 768px) { padding: 1rem 3rem; }
`

const LeftSection = styled.div`
  display: flex; align-items: center; gap: 2.5rem;
`

const LogoImg = styled(motion.img)`
  height: 28px;
  @media (min-width: 768px) { height: 32px; }
`

const DesktopNav = styled.nav`
  display: none;
  @media (min-width: 768px) {
    display: flex; align-items: center; gap: 2rem;
  }
`

const NavLink = styled(Link)`
  color: ${p => p.$active ? '#FFF' : COLORS.textMuted}; 
  text-decoration: none; font-size: 0.95rem; font-weight: 500;
  transition: color 0.2s;
  &:hover { color: #FFF; }
  position: relative;
  
  &::after {
    content: ''; position: absolute; bottom: -6px; left: 0; right: 0;
    height: 2px; background: ${COLORS.secondary};
    transform: scaleX(${p => p.$active ? 1 : 0});
    transition: transform 0.3s ease;
  }
`

const RightSection = styled.div`
  display: flex; align-items: center; gap: 1rem;
`

const ThemeToggleBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${COLORS.border};
  color: ${p => p.$isDark ? COLORS.secondary : '#FFFFFF'};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${COLORS.secondary};
    transform: translateY(-1px);
  }
`

const UserProfile = styled(Link)`
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.4rem 0.5rem 0.4rem 1rem; border-radius: 2rem;
  background: rgba(255,255,255,0.05); border: 1px solid ${COLORS.border};
  text-decoration: none; transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.08); }
  @media (max-width: 640px) { padding: 0.4rem; background: none; border: none; }
`

const UserName = styled.span`
  font-size: 0.85rem; font-weight: 500; color: ${COLORS.text};
  @media (max-width: 640px) { display: none; }
`

const Avatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, ${COLORS.secondary}, #F59A2E);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: #fff;
  flex-shrink: 0; border: 2px solid rgba(255,255,255,0.1);
`

const LogoutBtn = styled.button`
  background: none; border: none; color: ${COLORS.textMuted};
  display: none; align-items: center; gap: 0.5rem; cursor: pointer;
  font-size: 0.9rem; font-weight: 500; transition: color 0.2s;
  &:hover { color: #fca5a5; }
  @media (min-width: 768px) { display: flex; }
`

export default function AlunaHeader() {
  const { aluna, logout } = useAlunaAuth()
  const { isDark, toggleTheme } = useAlunaTheme()
  const location = useLocation()
  const navigate = useNavigate()
  
  const firstName = aluna?.name?.split(' ')[0] || 'Aluna'
  
  const handleLogout = () => {
    logout()
    navigate('/portal-aluna', { replace: true })
  }

  return (
    <HeaderWrapper>
      <LeftSection>
        <Link to="/portal-aluna/dashboard">
          <LogoImg 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            src="/logo-white.svg" 
            alt="Body Harmony" 
          />
        </Link>
        <DesktopNav>
          <NavLink to="/portal-aluna/dashboard" $active={location.pathname === '/portal-aluna/dashboard' && location.search !== '?tab=catalog'}>
            Cursos
          </NavLink>
          <NavLink to="/portal-aluna/dashboard?tab=catalog" $active={location.pathname === '/portal-aluna/dashboard' && location.search === '?tab=catalog'}>
            Loja
          </NavLink>
        </DesktopNav>
      </LeftSection>
      
      <RightSection>
        <ThemeToggleBtn
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Mudar para Modo Claro (Ctrl+Shift+D)" : "Mudar para Modo Escuro (Ctrl+Shift+D)"}
          $isDark={isDark}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </ThemeToggleBtn>
        <UserProfile to="/portal-aluna/perfil">
          <UserName>{aluna?.name}</UserName>
          <Avatar>{firstName.charAt(0)}</Avatar>
        </UserProfile>
        <LogoutBtn onClick={handleLogout}>
          <LogOut size={18} /> Sair
        </LogoutBtn>
      </RightSection>
    </HeaderWrapper>
  )
}
