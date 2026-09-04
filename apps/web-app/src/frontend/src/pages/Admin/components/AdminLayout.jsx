import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../config/routes';
import ChangePasswordModal from '../../../components/Modals/ChangePasswordModal';
import AdminBottomNav from './AdminBottomNav';
import GlobalSearchModal from '../../../components/Common/GlobalSearchModal';
import QuickActionDrawer from '../../../components/Common/QuickActionDrawer';
import GestorPreferencesModal from '../../../components/Common/GestorPreferencesModal';
import { usePermissions } from '../../../hooks/usePermissions';
import { useGestorTheme } from '../../../context/GestorThemeContext';
import { GestorDarkStyles } from '../../../styles/GestorDarkStyles';
import {
  FaFileAlt, FaImages, FaUsers, FaSignOutAlt, FaHome, FaStar,
  FaQuoteRight, FaCog, FaEnvelope, FaQuestionCircle, FaPalette,
  FaLock, FaShieldAlt, FaVideo, FaBars, FaTimes, FaFileContract,
  FaLaptopCode, FaGraduationCap, FaTachometerAlt, FaWhatsapp,
  FaUserCheck, FaCalendarAlt, FaSearch, FaSlidersH, FaPlusCircle,
  FaUserShield, FaShoppingBag, FaSun, FaMoon, FaChartLine, FaComments
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bh-bg-app, ${({ theme }) => theme?.colors?.light || '#f8fafc'});
  transition: background-color 0.25s ease;
  
  @media (max-width: ${({ theme }) => theme?.breakpoints?.tablet || '768px'}) {
    flex-direction: column;
    padding-bottom: 70px; // Space for bottom nav
  }
`;

const Sidebar = styled.aside`
  width: ${({ $hidden }) => $hidden ? '0px' : '235px'};
  min-width: ${({ $hidden }) => $hidden ? '0px' : '235px'};
  background: ${({ theme }) => theme?.colors?.primary || '#0a3e60'};
  color: white;
  padding: ${({ $hidden }) => $hidden ? '0px' : '0.75rem 0.5rem'};
  opacity: ${({ $hidden }) => $hidden ? 0 : 1};
  pointer-events: ${({ $hidden }) => $hidden ? 'none' : 'auto'};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  box-sizing: border-box;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;

  /* Custom Luxury Scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(237, 126, 19, 0.5);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(237, 126, 19, 0.9);
  }
  
  @media (max-width: ${({ theme }) => theme?.breakpoints?.tablet || '768px'}) {
    display: none; // Hide completely on mobile (replaced by BottomNav)
  }
`;

const AdminLogo = styled.img`
  width: 100%;
  max-width: 145px;
  height: auto;
  margin: 0.15rem auto 0.75rem auto;
  background: transparent;
  padding: 0;
  border: none;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ $active }) => $active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)'};
  padding: 0.38rem 0.65rem;
  border-radius: 7px;
  margin-bottom: 0.1rem;
  font-size: 0.8rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  text-decoration: none;
  transition: all 0.15s ease;
  background: ${({ $active }) => $active ? 'rgba(237, 126, 19, 0.22)' : 'transparent'};
  border-left: ${({ $active }) => $active ? '3px solid #ED7E13' : '3px solid transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    transform: translateX(2px);
  }
  
  svg {
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const LogoutButton = styled.button`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #FCA5A5;
  padding: 0.38rem 0.65rem;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #FFFFFF;
    border-color: #EF4444;
  }
  
  svg {
    font-size: 0.9rem;
    flex-shrink: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.15rem 1.4rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 0.75rem 0.85rem;
  }
`;

const MobileHeader = styled.header`
  display: none;
  /* REGRA 48 — Barra única mobile: MobileHeader suprimido.
     Toda navegação mobile via AdminBottomNav (barra inferior). */
`;

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1001;
`;

const DrawerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: ${({ theme }) => theme?.colors?.primary || '#0a3e60'};
  z-index: 1002;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
`;

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const { canAccessPage, isSuperadmin } = usePermissions();
  const { isDark, toggleTheme } = useGestorTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
    try {
      return localStorage.getItem('bh_gestor_sidebar_hidden') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarHidden(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bh_gestor_sidebar_hidden', String(next));
      } catch (e) {
        console.warn('Falha ao gravar estado do menu:', e);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-global-search', handleOpenSearch);

    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      
      if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'b') {
        if (!isInput) {
          e.preventDefault();
          toggleSidebar();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-global-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <LayoutWrapper data-gestor-theme={isDark ? 'dark' : 'light'}>
      <GestorDarkStyles />
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickActionDrawer isOpen={isQuickActionOpen} onClose={() => setIsQuickActionOpen(false)} />
      <GestorPreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />

      {/* Mobile Header */}
      <MobileHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AdminLogo src="/logo_simple.svg" alt="BH" style={{ width: '32px', margin: 0, padding: 0, borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Body Harmony</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Modo Claro" : "Modo Escuro"}
            style={{ background: 'none', border: 'none', color: isDark ? '#ED7E13' : 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px' }}
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={15} />}
          </button>
          <button onClick={() => setIsSearchOpen(true)} style={{ background: 'none', border: 'none', color: '#ED7E13' }}>
            <FaSearch size={16} />
          </button>
          <button onClick={() => setShowPasswordModal(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)' }}>
            <FaLock size={16} />
          </button>
        </div>
      </MobileHeader>

      {/* Desktop Sidebar */}
      <Sidebar $hidden={isSidebarHidden}>
        <AdminLogo src="/logo-white.svg" alt="Body Harmony" />

        <NavItem to="/" target="_blank">
          <FaHome /> <span>Ver Site</span>
        </NavItem>
        <NavItem to={ROUTES.ADMIN_DASHBOARD} $active={isActive(ROUTES.ADMIN_DASHBOARD)}>
          <FaTachometerAlt /> <span>Visão Geral</span>
        </NavItem>
        
        {/* PILARES GESTOR V3.1 FILTRADOS POR PERMISSÃO */}
        {canAccessPage('onboarding') && (
          <NavItem to={`${ROUTES.ADMIN}/onboarding`} $active={location.pathname.includes('/onboarding')}>
            <FaUserCheck style={{ color: '#3b82f6' }} /> <span>Funil Onboarding</span>
          </NavItem>
        )}

        {canAccessPage('agenda') && (
          <NavItem to={`${ROUTES.ADMIN}/agenda`} $active={location.pathname.includes('/agenda')}>
            <FaCalendarAlt style={{ color: '#ED7E13' }} /> <span>Agenda & Tarefas</span>
          </NavItem>
        )}

        {canAccessPage('contratos') && (
          <NavItem to={`${ROUTES.ADMIN}/contratos`} $active={location.pathname.includes('/contratos')}>
            <FaFileContract style={{ color: '#10b981' }} /> <span>Contratos & Assinaturas</span>
          </NavItem>
        )}

        {canAccessPage('shop') && (
          <NavItem to="/portal-gestor/shop" $active={location.pathname.includes('/shop')}>
            <FaShoppingBag style={{ color: '#ED7E13' }} /> <span>Loja & Ingressos</span>
          </NavItem>
        )}

        {canAccessPage('financeiro') && (
          <NavItem to="/portal-gestor/financeiro" $active={location.pathname.includes('/financeiro')}>
            <FaChartLine style={{ color: '#28a745' }} /> <span>Financeiro</span>
          </NavItem>
        )}

        {canAccessPage('mensagens') && (
          <NavItem to={`${ROUTES.ADMIN}/mensagens`} $active={location.pathname.includes('/mensagens')}>
            <FaWhatsapp style={{ color: '#25D366' }} /> <span>Mensagens WhatsApp</span>
          </NavItem>
        )}

        {canAccessPage('crm') && (
          <NavItem to="/portal-gestor/crm" $active={location.pathname.includes('/crm')}>
            <FaComments style={{ color: '#25D366' }} /> <span>CRM & WhatsApp</span>
          </NavItem>
        )}

        {canAccessPage('lms') && (
          <NavItem to={`${ROUTES.ADMIN}/lms`} $active={location.pathname.includes('/lms')}>
            <FaVideo /> <span>Gestão LMS</span>
          </NavItem>
        )}

        {canAccessPage('licenciadas') && (
          <NavItem to={`${ROUTES.ADMIN}/licenciadas`} $active={location.pathname.includes('/licenciadas')}>
            <FaUsers /> <span>Gerenciar Licenciadas</span>
          </NavItem>
        )}

        {canAccessPage('alunas') && (
          <NavItem to={`${ROUTES.ADMIN}/alunas`} $active={location.pathname.includes('/alunas')}>
            <FaGraduationCap /> <span>Alunas Individuais</span>
          </NavItem>
        )}

        {canAccessPage('usuarios') && (
          <NavItem to={`${ROUTES.ADMIN}/usuarios`} $active={location.pathname.includes('/usuarios')}>
            <FaUserShield style={{ color: '#8B5CF6' }} /> <span>Gestão de Usuários</span>
          </NavItem>
        )}

        {canAccessPage('mentores') && (
          <NavItem to={`${ROUTES.ADMIN}/mentores`} $active={location.pathname.includes('/mentores')}>
            <FaUsers /> <span>Gerenciar Mentores</span>
          </NavItem>
        )}

        {canAccessPage('textos') && (
          <NavItem to={`${ROUTES.ADMIN}/textos`} $active={location.pathname.includes('/textos')}>
            <FaFileAlt /> <span>Editar Textos</span>
          </NavItem>
        )}

        {canAccessPage('aparencia') && (
          <NavItem to={`${ROUTES.ADMIN}/aparencia`} $active={location.pathname.includes('/aparencia')}>
            <FaPalette /> <span>Aparência</span>
          </NavItem>
        )}

        {canAccessPage('visual_editor') && (
          <NavItem to={`${ROUTES.ADMIN}/visual-editor`} $active={location.pathname.includes('/visual-editor')}>
            <FaLaptopCode /> <span>Editor Visual</span>
          </NavItem>
        )}

        {canAccessPage('imagens') && (
          <NavItem to={`${ROUTES.ADMIN}/imagens`} $active={location.pathname.includes('/imagens')}>
            <FaImages /> <span>Banco de Imagens</span>
          </NavItem>
        )}

        {canAccessPage('resultados') && (
          <NavItem to={`${ROUTES.ADMIN}/resultados`} $active={location.pathname.includes('/resultados')}>
            <FaStar /> <span>Transformações</span>
          </NavItem>
        )}

        {canAccessPage('depoimentos') && (
          <NavItem to={`${ROUTES.ADMIN}/depoimentos`} $active={location.pathname.includes('/depoimentos')}>
            <FaQuoteRight /> <span>Depoimentos</span>
          </NavItem>
        )}

        {canAccessPage('leads') && (
          <NavItem to={`${ROUTES.ADMIN}/leads`} $active={location.pathname.includes('/leads')}>
            <FaEnvelope /> <span>Caixa de Entrada</span>
          </NavItem>
        )}

        {canAccessPage('faq') && (
          <NavItem to={`${ROUTES.ADMIN}/faq`} $active={location.pathname.includes('/faq')}>
            <FaQuestionCircle /> <span>Perguntas Frequentes</span>
          </NavItem>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '1rem 0' }} />

        {canAccessPage('configuracoes') && (
          <NavItem to={`${ROUTES.ADMIN}/configuracoes`} $active={location.pathname.includes('/configuracoes')}>
            <FaCog /> <span>Configurações</span>
          </NavItem>
        )}

        <NavItem as="button" onClick={() => setIsPreferencesOpen(true)} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <FaSlidersH style={{ color: '#ED7E13' }} /> <span>Preferências Visuais</span>
        </NavItem>

        {isSuperadmin && (
          <NavItem to="/nexus/watchtower" style={{ background: '#1a1a1a', border: '1px solid #ef4444', color: '#ef4444', marginTop: '1rem' }}>
            <FaShieldAlt /> <span>Nexus (God Mode)</span>
          </NavItem>
        )}

        <NavItem as="button" onClick={() => setShowPasswordModal(true)} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <FaLock /> <span>Trocar Senha</span>
        </NavItem>

        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> <span>Sair</span>
        </LogoutButton>
      </Sidebar>

      <MainContent>
        {/* TOP BAR DO GESTOR COM BUSCA E AÇÕES (PLAN-077 / PLAN-167) */}
        <TopBarWrapper>
          <TopLeftGroup>
            <SidebarToggleBtn
              type="button"
              onClick={toggleSidebar}
              title={isSidebarHidden ? "Exibir Menu Principal (Ctrl+B)" : "Ocultar Menu Principal (Ctrl+B)"}
              aria-label="Alternar Menu Principal"
              $hidden={isSidebarHidden}
            >
              <FaBars size={16} />
            </SidebarToggleBtn>

            <TopSearchBtn type="button" onClick={() => setIsSearchOpen(true)}>
              <FaSearch />
              <span>Busca Rápida Global...</span>
              <kbd>Ctrl K</kbd>
            </TopSearchBtn>
          </TopLeftGroup>

          <TopActionsGroup>
            <ThemeToggleBtn
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Mudar para Modo Claro (Ctrl+Shift+D)" : "Mudar para Modo Escuro (Ctrl+Shift+D)"}
              $isDark={isDark}
            >
              {isDark ? <FaSun size={17} /> : <FaMoon size={16} />}
            </ThemeToggleBtn>

            <PrefsBtn
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              title="Preferências Visuais"
            >
              <FaSlidersH size={16} />
            </PrefsBtn>

            <QuickActionBtn type="button" onClick={() => setIsQuickActionOpen(true)}>
              <FaPlusCircle size={16} />
              <span>Ação Rápida</span>
            </QuickActionBtn>
          </TopActionsGroup>
        </TopBarWrapper>

        {children || <Outlet />}
      </MainContent>

      <AdminBottomNav onMenuClick={toggleDrawer} />

      {/* Admin Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <DrawerOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <DrawerContainer
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Menu</h3>
                <button onClick={closeDrawer} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}>
                  <FaTimes />
                </button>
              </div>
              <div style={{ padding: '1rem', overflowY: 'auto' }}>
                {/* Secondary Navigation Items */}
                {canAccessPage('contratos') && (
                  <NavItem to={`${ROUTES.ADMIN}/contratos`} onClick={closeDrawer}>
                    <FaFileContract /> <span>Contratos & Assinaturas</span>
                  </NavItem>
                )}
                {canAccessPage('shop') && (
                  <NavItem to="/portal-gestor/shop" onClick={closeDrawer}>
                    <FaShoppingBag style={{ color: '#ED7E13' }} /> <span>Loja & Ingressos</span>
                  </NavItem>
                )}
                {canAccessPage('financeiro') && (
                  <NavItem to="/portal-gestor/financeiro" onClick={closeDrawer}>
                    <FaChartLine style={{ color: '#28a745' }} /> <span>Financeiro</span>
                  </NavItem>
                )}
                {canAccessPage('mensagens') && (
                  <NavItem to={`${ROUTES.ADMIN}/mensagens`} onClick={closeDrawer}>
                    <FaWhatsapp style={{ color: '#25D366' }} /> <span>Mensagens WhatsApp</span>
                  </NavItem>
                )}
                {canAccessPage('crm') && (
                  <NavItem to="/portal-gestor/crm" onClick={closeDrawer}>
                    <FaComments style={{ color: '#25D366' }} /> <span>CRM & WhatsApp</span>
                  </NavItem>
                )}
                {canAccessPage('textos') && (
                  <NavItem to={`${ROUTES.ADMIN}/textos`} onClick={closeDrawer}>
                    <FaFileAlt /> <span>Editar Textos</span>
                  </NavItem>
                )}
                {canAccessPage('aparencia') && (
                  <NavItem to={`${ROUTES.ADMIN}/aparencia`} onClick={closeDrawer}>
                    <FaPalette /> <span>Aparência</span>
                  </NavItem>
                )}
                {canAccessPage('visual_editor') && (
                  <NavItem to={`${ROUTES.ADMIN}/visual-editor`} onClick={closeDrawer}>
                    <FaLaptopCode /> <span>Editor Visual</span>
                  </NavItem>
                )}
                {canAccessPage('mentores') && (
                  <NavItem to={`${ROUTES.ADMIN}/mentores`} onClick={closeDrawer}>
                    <FaUsers /> <span>Gerenciar Mentores</span>
                  </NavItem>
                )}
                {canAccessPage('alunas') && (
                  <NavItem to={`${ROUTES.ADMIN}/alunas`} onClick={closeDrawer}>
                    <FaGraduationCap /> <span>Alunas Individuais</span>
                  </NavItem>
                )}
                {canAccessPage('usuarios') && (
                  <NavItem to={`${ROUTES.ADMIN}/usuarios`} onClick={closeDrawer}>
                    <FaUserShield style={{ color: '#8B5CF6' }} /> <span>Gestão de Usuários</span>
                  </NavItem>
                )}
                {canAccessPage('imagens') && (
                  <NavItem to={`${ROUTES.ADMIN}/imagens`} onClick={closeDrawer}>
                    <FaImages /> <span>Banco de Imagens</span>
                  </NavItem>
                )}
                {canAccessPage('resultados') && (
                  <NavItem to={`${ROUTES.ADMIN}/resultados`} onClick={closeDrawer}>
                    <FaStar /> <span>Transformações</span>
                  </NavItem>
                )}
                {canAccessPage('depoimentos') && (
                  <NavItem to={`${ROUTES.ADMIN}/depoimentos`} onClick={closeDrawer}>
                    <FaQuoteRight /> <span>Depoimentos</span>
                  </NavItem>
                )}
                {canAccessPage('leads') && (
                  <NavItem to={`${ROUTES.ADMIN}/leads`} onClick={closeDrawer}>
                    <FaEnvelope /> <span>Caixa de Entrada</span>
                  </NavItem>
                )}
                {canAccessPage('faq') && (
                  <NavItem to={`${ROUTES.ADMIN}/faq`} onClick={closeDrawer}>
                    <FaQuestionCircle /> <span>Perguntas Frequentes</span>
                  </NavItem>
                )}
                {canAccessPage('configuracoes') && (
                  <NavItem to={`${ROUTES.ADMIN}/configuracoes`} onClick={closeDrawer}>
                    <FaCog /> <span>Configurações</span>
                  </NavItem>
                )}

                {isSuperadmin && (
                  <NavItem to="/nexus/watchtower" onClick={closeDrawer} style={{ background: '#1a1a1a', border: '1px solid #ef4444', color: '#ef4444', marginTop: '1rem' }}>
                    <FaShieldAlt /> <span>Nexus (God Mode)</span>
                  </NavItem>
                )}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

                <NavItem as="button" onClick={() => { setShowPasswordModal(true); closeDrawer(); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}>
                  <FaLock /> <span>Trocar Senha</span>
                </NavItem>
                <NavItem as="button" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginTop: '0.5rem', border: 'none' }}>
                  <FaSignOutAlt /> <span>Sair</span>
                </NavItem>
              </div>
            </DrawerContainer>
          </>
        )}
      </AnimatePresence>
    </LayoutWrapper>
  );
};

export default AdminLayout;
const TopBarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(10, 62, 96, 0.1);
  gap: 0.75rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TopLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const SidebarToggleBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: ${({ $hidden }) => $hidden ? 'rgba(237, 126, 19, 0.12)' : '#FFFFFF'};
  border: 1px solid ${({ $hidden }) => $hidden ? '#ED7E13' : '#CBD5E1'};
  border-radius: 10px;
  color: ${({ $hidden }) => $hidden ? '#ED7E13' : '#0A3E60'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(237, 126, 19, 0.2);
  }
`;

const TopSearchBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  height: 44px;
  min-height: 44px;
  padding: 0 1.15rem;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: #0A3E60;
  }

  svg {
    color: #ED7E13;
  }

  kbd {
    display: inline-block;
    padding: 2px 6px;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    font-size: 11px;
    font-family: monospace;
    color: #64748B;
    margin-left: 0.5rem;
  }
`;

const TopActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ThemeToggleBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  color: ${({ $isDark }) => $isDark ? '#ED7E13' : '#0A3E60'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
    transform: translateY(-1px);
  }
`;

const PrefsBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
    transform: translateY(-1px);
  }
`;

const QuickActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 44px;
  min-height: 44px;
  padding: 0 1.25rem;
  background: #ED7E13;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: #D96F0E;
    transform: translateY(-1px);
  }
`;


