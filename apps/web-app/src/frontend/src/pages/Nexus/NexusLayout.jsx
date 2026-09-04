import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, LogOut, Radio, BarChart2, Database, Archive, Server, Settings, Brain, Terminal, Search } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { pt } from '../../i18n/translations';

// Void Runner Theme (Cyber/System)
// Cyberpunk Hardcoded Theme
const nexusTheme = {
  colors: {
    background: '#051A29', // Deep Navy (V3)
    surface: 'rgba(10, 62, 96, 0.4)', // Glass Clinical
    primary: '#00F2FF',    // Cyan Neon
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.5)',
    accent: '#FF0055',     // Pink Neon
    secondary: '#ED7E13', // Orange Legacy/Brand matches V2
    success: '#00FF94',
    warning: '#FFB800',
    danger: '#FF0055',
    border: 'rgba(255, 255, 255, 0.08)'
  },
  fonts: {
    heading: "'Bison', sans-serif",
    body: "'Montserrat', sans-serif",
    detail: "'JetBrains Mono', monospace"
  }
};

const Scanline = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.15;
`;

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  position: relative;
  overflow: hidden;
`;

// ... (imports)
import NexusBottomNav from './components/NexusBottomNav';

// ... (existing styled components)

const Sidebar = styled.aside`
  width: 260px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  z-index: 10;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 3rem;
  letter-spacing: 2px;
  
  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.detail};
  font-size: 0.9rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: ${({ theme }) => theme.colors.text};
  }

  &.active {
    background: rgba(0, 242, 255, 0.05);
    color: ${({ theme }) => theme.colors.accent};
    border-left-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 20px rgba(0, 242, 255, 0.1);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 80px; // Space for BottomNav
  }
`;

const NexusLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bh_auth');
    navigate(ROUTES.ADMIN);
  };

  return (
    <ThemeProvider theme={nexusTheme}>
      <LayoutContainer>
        <Scanline />
        <Sidebar>
          {/* ... Sidebar Content ... */}
          <Logo>
            <Shield size={24} color={nexusTheme.colors.accent} />
            NEXUS // <span>SYS</span>
          </Logo>

          <nav style={{ flex: 1 }}>
            <NavItem to="/nexus/home">
              <Activity size={18} />
              Core Dashboard
            </NavItem>
            <NavItem to="/nexus/watchtower">
              <Radio size={18} />
              Watchtower
            </NavItem>
            <NavItem to="/nexus/war-room">
              <BarChart2 size={18} />
              War Room
            </NavItem>
            {/* ... other nav items ... */}
            <NavItem to="/nexus/signal-tower">
              <Radio size={18} />
              Signal Tower
            </NavItem>
            <NavItem to="/nexus/testing-hub">
              <Shield size={18} />
              Testing Hub
            </NavItem>
            <NavItem to="/nexus/vault">
              <Archive size={18} />
              The Vault
            </NavItem>
            <NavItem to="/nexus/database">
              <Database size={18} />
              Database
            </NavItem>
            <NavItem to="/nexus/barracks">
              <Users size={18} />
              Barracks
            </NavItem>
            <NavItem to="/nexus/ops">
              <Settings size={18} />
              Ops Center
            </NavItem>
            <NavItem to="/nexus/engine">
              <Server size={18} />
              Engine Room
            </NavItem>
            {/* Added Scripts Manager */}
            <NavItem to="/nexus/scripts">
              <Terminal size={18} />
              Scripts Manager
            </NavItem>
            {/* Added Neural Oversight */}
            <NavItem to="/nexus/ai-control">
              <Brain size={18} />
              Neural Oversight
            </NavItem>
            {/* Added Forensics Lab */}
            <NavItem to="/nexus/forensics">
              <Search size={18} />
              Forensics Lab
            </NavItem>
            {/* V68.1 — Portal Aluna */}
            <NavItem to="/nexus/alunas">
              <Users size={18} />
              Alunas
            </NavItem>
          </nav>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
              fontWeight: '600',
              marginTop: '1rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 42, 42, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <LogOut size={16} /> {pt.navigation.logout}
          </button>
        </Sidebar>

        <MainContent>
          <Outlet />
        </MainContent>

        <NexusBottomNav />
      </LayoutContainer>
    </ThemeProvider>
  );
};




export default NexusLayout;
