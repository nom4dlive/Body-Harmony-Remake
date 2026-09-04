import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaPlayCircle, FaChartLine, FaFolderOpen,
  FaCog, FaLock, FaSignOutAlt, FaTimes, FaRobot, FaStar, FaBrain
} from 'react-icons/fa';

const Overlay = styled(motion.div)`
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.6);
backdrop-filter: blur(4px);
z-index: 1000;
`;

const DrawerContainer = styled(motion.div)`
position: fixed;
top: 0;
right: 0;
width: 85%;
max-width: 320px;
height: 100vh;
background: #0F172A;
z-index: 1001;
display: flex;
flex-direction: column;
box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
`;

const DrawerHeader = styled.div`
padding: 1.5rem;
display: flex;
flex-direction: column;
gap: 1.5rem;
background: rgba(255, 255, 255, 0.03);
border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .top-row {
  display: flex;
  justify-content: flex-end;
}

  .user-info {
  display: flex;
  align-items: center;
  gap: 1rem;

    .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #316B9C, #0A3E60);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    border: 2px solid #ED7E13;
  }

    .meta {
      h3 {
      color: white;
      font-size: 1rem;
      margin: 0;
    }
      span {
      color: #94A3B8;
      font-size: 0.85rem;
      text-transform: uppercase;
    }
  }
}
`;

const CloseButton = styled.button`
background: none;
border: none;
color: #94A3B8;
font-size: 1.5rem;
cursor: pointer;
padding: 0.5rem;
  
  &:hover { color: white; }
`;

const NavList = styled.nav`
flex: 1;
padding: 1rem 0;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 0.5rem;
`;

const NavItem = styled(Link)`
display: flex;
align-items: center;
gap: 1rem;
padding: 1rem 1.5rem;
color: #CBD5E1;
text-decoration: none;
font-size: 1rem;
font-weight: 500;
border-left: 4px solid transparent;
transition: all 0.2s;

  svg { font-size: 1.2rem; min-width: 24px; }

  &:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

  &.active {
  background: rgba(237, 126, 19, 0.1);
  color: white;
  border-left-color: #ED7E13;
    
    svg { color: #ED7E13; }
}
`;

const PremiumNavItem = styled(NavItem)`
  color: #ED7E13;
  font-weight: 700;
  
  svg {
    color: #ED7E13;
  }

  &:hover {
    background: rgba(237, 126, 19, 0.08);
    color: #ED7E13;
  }

  &.active {
    background: rgba(237, 126, 19, 0.15);
    color: #ED7E13;
    border-left-color: #ED7E13;
  }
`;

const Separator = styled.div`
height: 1px;
background: rgba(255, 255, 255, 0.1);
margin: 0.5rem 1.5rem;
`;

const FooterActions = styled.div`
padding: 1.5rem;
border - top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
width: 100 %;
display: flex;
align - items: center;
gap: 1rem;
padding: 1rem;
background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
color: ${props => props.$variant === 'danger' ? '#EF4444' : '#CBD5E1'};
border: ${props => props.$variant === 'danger' ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'};
border - radius: 8px;
font - size: 1rem;
font - weight: 500;
cursor: pointer;
transition: all 0.2s;

  &:hover {
  background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  transform: translateY(-1px);
}
`;

const MobileDrawer = ({ isOpen, onClose, student, onLogout, onChangePassword }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <DrawerContainer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <DrawerHeader>
              <div className="top-row">
                <CloseButton onClick={onClose} aria-label="Fechar menu">
                  <FaTimes />
                </CloseButton>
              </div>
              <div className="user-info">
                <div className="avatar">
                  {student?.name?.charAt(0) || 'A'}
                </div>
                <div className="meta">
                  <h3>{student?.name?.split(' ')[0]}</h3>
                  <span>Licenciada</span>
                </div>
              </div>
            </DrawerHeader>

            <NavList>
              <NavItem to="/portal-licenciada/dashboard" className={isActive('/portal-licenciada/dashboard') || isActive('/portal-licenciada')} onClick={onClose}>
                <FaHome /> Início
              </NavItem>
              <PremiumNavItem to="/portal-licenciada/premium" className={isActive('/portal-licenciada/premium')} onClick={onClose}>
                <FaStar /> Premium ✦
              </PremiumNavItem>
              <NavItem to="/portal-licenciada/minhas-aulas" className={isActive('/portal-licenciada/minhas-aulas')} onClick={onClose}>
                <FaPlayCircle /> Minhas Aulas
              </NavItem>
              {Boolean(student?.ai_notebook_beta_enabled === 1 || student?.ai_notebook_beta_enabled === true) && (
                <NavItem to="/portal-licenciada/smartbook" className={isActive('/portal-licenciada/smartbook')} onClick={onClose} style={{ color: '#ED7E13', fontWeight: 700 }}>
                  <FaBrain style={{ color: '#ED7E13' }} /> Smart Book (IA)
                </NavItem>
              )}
              <NavItem to="/portal-licenciada/meu-progresso" className={isActive('/portal-licenciada/meu-progresso')} onClick={onClose}>
                <FaChartLine /> Progresso
              </NavItem>
              <NavItem to="/portal-licenciada/biblioteca" className={isActive('/portal-licenciada/biblioteca')} onClick={onClose}>
                <FaFolderOpen /> Biblioteca
              </NavItem>

              <Separator />

              <NavItem as="button" onClick={() => { onChangePassword(); onClose(); }}>
                <FaLock /> Alterar Senha
              </NavItem>
            </NavList>

            <FooterActions>
              <ActionButton $variant="danger" onClick={onLogout}>
                <FaSignOutAlt /> Sair da Conta
              </ActionButton>
            </FooterActions>
          </DrawerContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
