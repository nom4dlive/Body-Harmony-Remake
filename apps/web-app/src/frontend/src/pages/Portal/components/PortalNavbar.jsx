import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaLock, FaSignOutAlt, FaBell, FaSun, FaMoon } from 'react-icons/fa';
import { useLicenciadaAuth as useStudentAuth } from '../../../context/LicenciadaAuthContext';
import { useLicenciadaTheme } from '../../../context/GestorThemeContext';
import { useSignals } from '../../../context/SignalContext';
import { ROUTES } from '../../../config/routes';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import MobileDrawer from '../../../components/MobileDrawer/MobileDrawer';
import { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 126, 19, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(237, 126, 19, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 126, 19, 0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ED7E13;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #051A29;
  z-index: 10;
  animation: ${pulse} 2s infinite;
  display: ${props => props.$animate ? 'flex' : 'none'};
`;

/* Badge pulsante para o link Premium na navbar */
const PremiumNavBadge = styled.span`
  display: inline-block;
  width: 8px; height: 8px;
  background: #ED7E13;
  border-radius: 50%;
  margin-left: 5px;
  vertical-align: middle;
  animation: ${pulse} 1.8s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(237, 126, 19, 0.8);
  flex-shrink: 0;
`;

/* Link Premium especial com shimmer gold */
const PremiumNavLink = styled.a`
  color: #ED7E13 !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  transition: all 0.2s;
  background: linear-gradient(90deg, #ED7E13 0%, #FFB347 50%, #ED7E13 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;

  &.active {
    opacity: 1;
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ED7E13;
      border-radius: 2px;
    }
  }

  &:hover { opacity: 0.85; }
`;

/* ────────────────────────────────────────────────
   DESKTOP NAVBAR (hidden on mobile)
──────────────────────────────────────────────── */
const NavbarContainer = styled.nav`
  background: linear-gradient(180deg, rgba(5, 26, 41, 0.97) 0%, rgba(5, 26, 41, 0.85) 100%);
  backdrop-filter: blur(20px);
  padding: 1rem 4%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);

  /* Desktop only */
  @media (max-width: 768px) {
    display: none;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    img {
      height: 40px;
      transition: transform 0.3s;
      &:hover { transform: scale(1.05); }
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    @media (max-width: 960px) { display: none; }

    a {
      color: ${({ theme }) => theme.colors.darkTextMuted};
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s;
      position: relative;

      &:hover, &.active { color: #FFFFFF; }

      &.active::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${({ theme }) => theme.colors.secondary};
        border-radius: 2px;
      }
    }
  }

  .mobile-toggle {
    display: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    @media (max-width: 960px) { display: block; }
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary}, #D56A0C);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .user-meta {
    text-align: right;
    strong { display: block; color: #FFFFFF; font-size: 0.95rem; font-weight: 600; }
    span { display: block; font-size: 0.75rem; color: ${({ theme }) => theme.colors.secondary}; text-transform: uppercase; letter-spacing: 0.5px; }
  }

  .actions { display: flex; gap: 0.5rem; }
`;

const ActionBtn = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.darkTextMuted};
  border: 1px solid rgba(255, 255, 255, 0.15);
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
    color: #FFFFFF;
    border-color: #FFFFFF;
    transform: translateY(-2px);
  }

  &.bell-action {
    position: relative;
    color: #ED7E13;
    border-color: rgba(237, 126, 19, 0.3);
    background: rgba(237, 126, 19, 0.05);
    
    span {
      width: 12px;
      height: 12px;
      font-size: 0.55rem;
      top: -4px;
      right: -4px;
      border: none;
    }
  }
`;

/* ────────────────────────────────────────────────
   MOBILE TOP BAR (visible only on mobile ≤ 768px)
   Requisito: logo · nome · cadeado · logout
──────────────────────────────────────────────── */
const MobileTopBarContainer = styled.header`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background: rgba(5, 26, 41, 0.98);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(237, 126, 19, 0.18);
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    height: 46px;
    min-height: 46px;
  }
`;

const MobileLogoArea = styled.div`
  flex-shrink: 0;
  img {
    height: 22px;
    display: block;
    filter: brightness(1.1);
  }
`;

const MobileUserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 0.25rem;

  strong {
    color: #FFFFFF;
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    letter-spacing: 0.2px;
  }
`;

const MobileActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
`;

const MobileActionBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    bottom: -5px;
    left: -5px;
    right: -5px;
  }

  /* Cadeado */
  &.lock-btn {
    background: rgba(49, 107, 156, 0.2);
    color: #94A3B8;
    border: 1px solid rgba(49, 107, 156, 0.25);

    &:active, &:hover {
      background: rgba(49, 107, 156, 0.45);
      color: #FFFFFF;
      border-color: rgba(49, 107, 156, 0.6);
      transform: scale(0.95);
    }
  }

  /* Logout */
  &.logout-btn {
    background: rgba(239, 68, 68, 0.12);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.25);

    &:active, &:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #FFFFFF;
      border-color: rgba(239, 68, 68, 0.6);
      transform: scale(0.95);
    }
  }

  /* Sino / Notificações */
  &.bell-btn {
    position: relative;
    background: rgba(237, 126, 19, 0.1);
    color: #ED7E13;
    border: 1px solid rgba(237, 126, 19, 0.2);

    &:active, &:hover {
      background: rgba(237, 126, 19, 0.2);
      transform: scale(0.95);
    }
  }
`;

/* ────────────────────────────────────────────────
   COMPONENT
──────────────────────────────────────────────── */
export const PortalNavbar = () => {
  const { student, logout } = useStudentAuth();
  const { unreadCount, setIsDrawerOpen } = useSignals();
  const { isDark, toggleTheme } = useLicenciadaTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PORTAL);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const firstName = student?.name?.split(' ')[0] || 'Licenciada';

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <MobileTopBarContainer>
        <MobileLogoArea>
          <img src="/logo-white.svg" alt="Body Harmony" />
        </MobileLogoArea>

        <MobileUserInfo>
          <strong>{firstName}</strong>
        </MobileUserInfo>

        <MobileActionsArea>
          <MobileActionBtn
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            style={{ color: isDark ? '#ED7E13' : 'rgba(255,255,255,0.85)' }}
          >
            {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
          </MobileActionBtn>
          <MobileActionBtn
            className="bell-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Notificações"
          >
            <FaBell />
            {unreadCount > 0 ? <Badge $animate={true}>{unreadCount}</Badge> : null}
          </MobileActionBtn>
          <MobileActionBtn
            className="lock-btn"
            onClick={() => setShowPasswordModal(true)}
            aria-label="Alterar Senha"
            title="Alterar Senha"
          >
            <FaLock />
          </MobileActionBtn>
          <MobileActionBtn
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Sair da conta"
            title="Sair"
          >
            <FaSignOutAlt />
          </MobileActionBtn>
        </MobileActionsArea>
      </MobileTopBarContainer>

      {/* ── DESKTOP NAVBAR ── */}
      <NavbarContainer>
        <div className="logo-container">
          <img src="/logo-white.svg" alt="Body Harmony" />
        </div>

        <div className="nav-links">
          <Link to="/portal-licenciada/dashboard" className={location.pathname === '/portal-licenciada/dashboard' || location.pathname === '/portal-licenciada' ? 'active' : ''}>Início</Link>
          <Link to="/portal-licenciada/minhas-aulas" className={location.pathname.includes('minhas-aulas') ? 'active' : ''}>Minhas Aulas</Link>
          <Link to="/portal-licenciada/certificados" className={location.pathname.includes('certificados') ? 'active' : ''}>Certificados</Link>
          {Boolean(student?.ai_notebook_beta_enabled === 1 || student?.ai_notebook_beta_enabled === true) && (
            <Link to="/portal-licenciada/smartbook" className={location.pathname.includes('smartbook') ? 'active' : ''} style={{ color: '#ED7E13', fontWeight: 700 }}>🧠 Smart Book</Link>
          )}
          <Link to="/portal-licenciada/biblioteca" className={location.pathname.includes('biblioteca') ? 'active' : ''}>Biblioteca</Link>
          <PremiumNavLink
            as={Link}
            to="/portal-licenciada/premium"
            className={location.pathname.includes('premium') ? 'active' : ''}
            id="nav-premium-link"
          >
            ✦ Premium
            <PremiumNavBadge />
          </PremiumNavLink>
          <Link to="/portal-licenciada/perfil" className={location.pathname.includes('perfil') ? 'active' : ''}>Perfil</Link>
          <Link to="/portal-licenciada/faq" className={location.pathname.includes('faq') ? 'active' : ''}>FAQ</Link>
        </div>

        <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
          <FaBars />
        </div>

        <UserProfile>
          <div className="user-meta">
            <strong>{student?.name || 'Visitante'}</strong>
            <span>Licenciada Oficial</span>
          </div>
          <div className="avatar">
            {student?.photo_url ? (
              <img
                src={student.photo_url.startsWith('/') ? student.photo_url : `/${student.photo_url}`}
                alt={student.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.textContent = getInitials(student?.name);
                }}
              />
            ) : (
              getInitials(student?.name)
            )}
          </div>
          <div className="actions">
            <ActionBtn
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Mudar para Modo Claro (Ctrl+Shift+D)" : "Mudar para Modo Escuro (Ctrl+Shift+D)"}
              style={{ color: isDark ? '#ED7E13' : 'rgba(255,255,255,0.85)' }}
            >
              {isDark ? <FaSun size={15} /> : <FaMoon size={14} />}
            </ActionBtn>
            <ActionBtn onClick={() => setIsDrawerOpen(true)} title="Notificações" className="bell-action">
              <FaBell size={14} />
              {unreadCount > 0 ? <Badge $animate={true}>{unreadCount}</Badge> : null}
            </ActionBtn>
            <ActionBtn onClick={() => setShowPasswordModal(true)} title="Alterar Senha">
              <FaLock size={14} />
            </ActionBtn>
            <ActionBtn onClick={handleLogout} title="Sair">
              <FaSignOutAlt size={14} />
            </ActionBtn>
          </div>
        </UserProfile>
      </NavbarContainer>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        student={student}
        onLogout={handleLogout}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};
