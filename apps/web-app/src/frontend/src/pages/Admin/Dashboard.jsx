import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'
import { api } from '../../services/api'
import { MAINTENANCE_CONFIG } from '../../config/maintenance'
import AdminLayout from './components/AdminLayout'
import OnboardingMetricsWidget from './components/OnboardingMetricsWidget'
import Cockpit360Widget from './components/Cockpit360Widget'
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal'
import { usePermissions } from '../../hooks/usePermissions'
import {
  FaFileAlt, FaImages, FaUsers, FaHome, FaStar,
  FaQuoteRight, FaCog, FaEnvelope, FaQuestionCircle, FaPalette,
  FaLock, FaMagic, FaShieldAlt, FaVideo, FaPlusCircle, FaUserGraduate,
  FaFileSignature, FaWhatsapp, FaCalendarAlt, FaChevronRight,
  FaPaintBrush, FaUserShield, FaShoppingBag, FaComments
} from 'react-icons/fa'

// ── Dashboard Header ───────────────────────────────────────────────────────
const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  padding: 0 0.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`

const Welcome = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0A3E60;
    margin: 0;
    letter-spacing: -0.01em;
  }
  p {
    font-size: 0.78rem;
    color: #64748B;
    margin: 2px 0 0 0;
  }
`

const HeaderBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #0A3E60;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    background: #0A3E60;
    color: #FFFFFF;
    border-color: #0A3E60;
    transform: translateY(-1px);
  }

  svg {
    color: #ED7E13;
  }

  &:hover svg {
    color: #FFFFFF;
  }
`

// ── Main Content Layout ────────────────────────────────────────────────────
const DashboardWrapper = styled.div`
  padding: 0.25rem 0.5rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
`

const DesktopWidgetsWrapper = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`

const MobileNative2x2Grid = styled.div`
  display: none;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    display: grid;
  }
`

const MobileTile = styled(Link)`
  background: #FFFFFF;
  border: 1.5px solid ${props => props.$border || '#E2E8F0'};
  border-radius: 14px;
  padding: 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
  min-height: 105px;
  justify-content: space-between;

  &:active {
    transform: scale(0.97);
  }

  .icon-badge {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.45rem;
  }

  .tile-title {
    font-size: 0.92rem;
    font-weight: 800;
    color: #0A3E60;
    line-height: 1.2;
  }

  .tile-sub {
    font-size: 0.72rem;
    color: #64748B;
    font-weight: 600;
    margin-top: 2px;
  }
`

// ── Operações Action Cards Bar ─────────────────────────────────────────────
const OperacoesActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;
  margin-bottom: 1.25rem;
`

const ActionCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.85rem;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  text-decoration: none;
  color: #F8FAFC;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  .icon-box {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: rgba(237, 126, 19, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ED7E13;
    font-size: 1rem;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .label-group {
    display: flex;
    flex-direction: column;
    span {
      font-size: 0.8rem;
      font-weight: 700;
      color: #F8FAFC;
    }
    small {
      font-size: 0.68rem;
      color: #94A3B8;
    }
  }

  &:hover {
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(237, 126, 19, 0.35);
    transform: translateY(-2px);

    .icon-box {
      background: #ED7E13;
      color: #FFFFFF;
      transform: scale(1.05);
    }
  }
`

// ── Bottom 3-Column Grid ───────────────────────────────────────────────────
const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.25rem;
`

const GlassSectionCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
`

const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 0.6rem;

    svg {
      color: #ED7E13;
      font-size: 1.15rem;
    }
  }
`

const ActionListItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0.95rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #E2E8F0;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;

  .left-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: #94A3B8;
      font-size: 1rem;
      transition: color 0.2s;
    }
  }

  .arrow {
    color: #64748B;
    font-size: 0.75rem;
    transition: all 0.2s;
  }

  &:hover {
    background: rgba(237, 126, 19, 0.12);
    border-color: rgba(237, 126, 19, 0.3);
    color: #FFFFFF;
    transform: translateX(3px);

    .left-content svg {
      color: #ED7E13;
    }

    .arrow {
      color: #ED7E13;
      transform: translateX(2px);
    }
  }
`

const ActionListButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.8rem 0.95rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #E2E8F0;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  .left-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: #94A3B8;
      font-size: 1rem;
      transition: color 0.2s;
    }
  }

  .arrow {
    color: #64748B;
    font-size: 0.75rem;
    transition: all 0.2s;
  }

  &:hover {
    background: rgba(237, 126, 19, 0.12);
    border-color: rgba(237, 126, 19, 0.3);
    color: #FFFFFF;
    transform: translateX(3px);

    .left-content svg {
      color: #ED7E13;
    }

    .arrow {
      color: #ED7E13;
      transform: translateX(2px);
    }
  }
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
`

const ContentButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  text-decoration: none;
  color: #E2E8F0;
  height: 84px;
  text-align: center;
  transition: all 0.2s ease;

  svg {
    color: #94A3B8;
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
    transition: all 0.2s;
  }

  span {
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.2;
    color: #E2E8F0;
  }

  &:hover {
    background: rgba(237, 126, 19, 0.15);
    border-color: rgba(237, 126, 19, 0.35);
    transform: translateY(-2px);

    svg {
      color: #ED7E13;
      transform: scale(1.08);
    }

    span {
      color: #FFFFFF;
    }
  }
`

const BotStatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`

const BotStatPill = styled.div`
  flex: 1;
  text-align: center;
  padding: 0.5rem 0.4rem;
  border-radius: 10px;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$border || 'rgba(255, 255, 255, 0.05)'};

  .num {
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.$color || '#FFFFFF'};
    line-height: 1;
  }

  .lbl {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #94A3B8;
    margin-top: 2px;
  }
`

const NexusGodButton = styled(Link)`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #C4B5FD;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.25);
    border-color: #8B5CF6;
    color: #FFFFFF;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    transform: translateY(-1px);
  }
`

// ── Maintenance Panel ──────────────────────────────────────────────────────
const MaintContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`

const PortalCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.1rem;
`

const MaintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
`

const PortalName = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: #F8FAFC;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.15);
    transition: .3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #ED7E13;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`

const MaintField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;

  label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, textarea {
    padding: 0.55rem 0.75rem;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #FFFFFF;
    font-size: 0.8rem;
    font-family: inherit;
    transition: border 0.2s;

    &:focus {
      outline: none;
      border-color: #ED7E13;
    }
  }
`

const SaveButton = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.5rem;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);

  &:hover {
    background: #FF9429;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.45);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export default function Dashboard() {
  const { user } = useAuth()
  const { config, updateConfig } = useData()
  const { canAccessPage, canPerform, isSuperadmin } = usePermissions()
  const [maintenance, setMaintenance] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    if (config?.maintenance) {
      setMaintenance(config.maintenance)
    } else {
      setMaintenance(MAINTENANCE_CONFIG)
    }
  }, [config])

  const handleToggle = (portal) => {
    setMaintenance(prev => ({
      ...prev,
      [portal]: {
        ...prev[portal],
        active: !prev[portal]?.active
      }
    }))
  }

  const handleFieldChange = (portal, field, value) => {
    setMaintenance(prev => ({
      ...prev,
      [portal]: {
        ...prev[portal],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateConfig({ maintenance })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Erro ao salvar manutenção:', err)
      alert('Erro ao salvar configurações de manutenção')
    } finally {
      setIsSaving(false)
    }
  }

  const [botStats, setBotStats] = useState(null)
  useEffect(() => {
    const fetchStats = () =>
      api.nexus.getBotStats()
        .then(data => setBotStats(data))
        .catch(() => {})
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const hasOperationsActions = canAccessPage('agenda') || canAccessPage('contratos') || canAccessPage('shop') || canAccessPage('crm') || canAccessPage('mensagens') || canAccessPage('leads');
  const hasAcademiaCol = canAccessPage('lms') || canAccessPage('licenciadas') || canAccessPage('alunas') || canAccessPage('mentores');
  const hasContentCol = canAccessPage('visual_editor') || canAccessPage('textos') || canAccessPage('imagens') || canAccessPage('resultados') || canAccessPage('depoimentos') || canAccessPage('faq');
  const hasGovernanceCol = canAccessPage('usuarios') || canAccessPage('aparencia') || canAccessPage('configuracoes') || isSuperadmin;

  return (
    <AdminLayout>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {/* ── Dashboard Header ────────────────────────────────────────────── */}
      <DashboardHeader>
        <Welcome>
          <h1>Olá, {user?.username?.split(' ')[0] || 'Gestor'}</h1>
          <p>Visão geral e controle operacional das franquias</p>
        </Welcome>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <HeaderBtn href="/shop" target="_blank" title="Ver Loja & Ingressos Oficial">
            <FaShoppingBag />
            <span>Ver Loja Oficial</span>
          </HeaderBtn>

          <HeaderBtn href="/portal-licenciada" target="_blank" title="Ver Portal da Licenciada">
            <FaHome />
            <span>Ver Portal Licenciada</span>
          </HeaderBtn>
        </div>
      </DashboardHeader>

      {/* ── Dashboard Content ───────────────────────────────────────────────── */}
      <DashboardWrapper>
        {/* MOBILE 2x2 FAST ACTIONS GRID (ESTILO APP NATIVO) */}
        <MobileNative2x2Grid>
          <MobileTile to="/portal-gestor/licenciadas" $color="#0A3E60" $border="#0A3E60" id="m-dash-licenciadas">
            <div className="icon-badge" style={{ background: 'rgba(10, 62, 96, 0.1)', color: '#0A3E60' }}>
              <FaUsers size={19} />
            </div>
            <div>
              <div className="tile-title">Licenciadas</div>
              <div className="tile-sub">Unidades & 360°</div>
            </div>
          </MobileTile>

          <MobileTile to="/portal-gestor/shop" $color="#ED7E13" $border="#ED7E13" id="m-dash-shop">
            <div className="icon-badge" style={{ background: 'rgba(237, 126, 19, 0.12)', color: '#ED7E13' }}>
              <FaShoppingBag size={19} />
            </div>
            <div>
              <div className="tile-title">Loja & Vendas</div>
              <div className="tile-sub">Ingressos & Leads</div>
            </div>
          </MobileTile>

          <MobileTile to="/portal-gestor/contratos" $color="#2563EB" $border="#2563EB" id="m-dash-contratos">
            <div className="icon-badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
              <FaFileSignature size={19} />
            </div>
            <div>
              <div className="tile-title">Contratos</div>
              <div className="tile-sub">Emissão & Firmas</div>
            </div>
          </MobileTile>

          <MobileTile to="/portal-gestor/lms" $color="#8B5CF6" $border="#8B5CF6" id="m-dash-lms">
            <div className="icon-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <FaUserGraduate size={19} />
            </div>
            <div>
              <div className="tile-title">LMS & Aulas</div>
              <div className="tile-sub">Treinamentos</div>
            </div>
          </MobileTile>
        </MobileNative2x2Grid>

        {/* DESKTOP EXCLUSIVE WIDGETS */}
        <DesktopWidgetsWrapper>
          {/* 1. HIGHLIGHT CARDS (3 Colunas) */}
          <Cockpit360Widget />

          {/* 2. OPERAÇÕES & LICENCIAMENTO (Hero Section 4 Colunas) */}
          <OnboardingMetricsWidget />
        </DesktopWidgetsWrapper>

        {/* 2.1 AÇÕES RÁPIDAS DE OPERAÇÕES */}
        {hasOperationsActions && (
          <OperacoesActionsGrid>
            {canAccessPage('agenda') && (
              <ActionCard to={`${ROUTES.ADMIN}/agenda`} id="dash-agenda">
                <div className="icon-box">
                  <FaCalendarAlt />
                </div>
                <div className="label-group">
                  <span>Agenda & Tarefas</span>
                  <small>Urgências e prazos</small>
                </div>
              </ActionCard>
            )}

            {canAccessPage('contratos') && (
              <ActionCard to={`${ROUTES.ADMIN}/contratos`} id="dash-contratos">
                <div className="icon-box">
                  <FaFileSignature />
                </div>
                <div className="label-group">
                  <span>Contratos Oficiais</span>
                  <small>Emissão e minutas</small>
                </div>
              </ActionCard>
            )}

            {canAccessPage('crm') && (
              <ActionCard to="/portal-gestor/crm" id="dash-crm">
                <div className="icon-box" style={{ color: '#25D366', background: 'rgba(37, 211, 102, 0.12)' }}>
                  <FaComments />
                </div>
                <div className="label-group">
                  <span>Central CRM</span>
                  <small>Chatwoot & WhatsApp</small>
                </div>
              </ActionCard>
            )}

            {canAccessPage('shop') && (
              <ActionCard to="/portal-gestor/shop" id="dash-shop">
                <div className="icon-box" style={{ color: '#ED7E13', background: 'rgba(237, 126, 19, 0.12)' }}>
                  <FaShoppingBag />
                </div>
                <div className="label-group">
                  <span>Loja & Ingressos</span>
                  <small>Vendas e leads do E-Shop</small>
                </div>
              </ActionCard>
            )}

            {canAccessPage('mensagens') && (
              <ActionCard to={`${ROUTES.ADMIN}/mensagens`} id="dash-mensagens">
                <div className="icon-box" style={{ color: '#25D366', background: 'rgba(37, 211, 102, 0.12)' }}>
                  <FaWhatsapp />
                </div>
                <div className="label-group">
                  <span>Régua WhatsApp</span>
                  <small>Disparos automáticos</small>
                </div>
              </ActionCard>
            )}

            {canAccessPage('leads') && (
              <ActionCard to={`${ROUTES.ADMIN}/leads`} id="dash-leads">
                <div className="icon-box">
                  <FaEnvelope />
                </div>
                <div className="label-group">
                  <span>Caixa de Entrada</span>
                  <small>Contatos e leads</small>
                </div>
              </ActionCard>
            )}
          </OperacoesActionsGrid>
        )}

        {/* 3. BOTTOM GRID (3 Colunas Balanceadas) */}
        {(hasAcademiaCol || hasContentCol || hasGovernanceCol) && (
          <BottomGrid>
            {/* Coluna 1: Academia & Comunidade */}
            {hasAcademiaCol && (
              <GlassSectionCard>
                <SectionCardHeader>
                  <h3>
                    <FaUserGraduate />
                    Academia & Comunidade
                  </h3>
                </SectionCardHeader>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {canAccessPage('lms') && (
                    <>
                      <ActionListItem to={`${ROUTES.ADMIN}/lms`} id="dash-lms">
                        <div className="left-content">
                          <FaVideo />
                          <span>Módulos & Aulas</span>
                        </div>
                        <FaChevronRight className="arrow" />
                      </ActionListItem>

                      <ActionListItem to={`${ROUTES.ADMIN}/lms?action=new_module`} id="dash-novo-modulo">
                        <div className="left-content">
                          <FaPlusCircle />
                          <span>Novo Módulo LMS</span>
                        </div>
                        <FaChevronRight className="arrow" />
                      </ActionListItem>
                    </>
                  )}

                  {canAccessPage('licenciadas') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/licenciadas`} id="dash-licenciadas">
                      <div className="left-content">
                        <FaUsers />
                        <span>Licenciadas</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}

                  {canAccessPage('alunas') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/alunas`} id="dash-alunas">
                      <div className="left-content">
                        <FaUserGraduate />
                        <span>Alunas Individuais</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}

                  {canAccessPage('mentores') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/mentores`} id="dash-mentores">
                      <div className="left-content">
                        <FaUsers />
                        <span>Mentores & Treinadores</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}
                </div>
              </GlassSectionCard>
            )}

            {/* Coluna 2: Estúdio de Conteúdo */}
            {hasContentCol && (
              <GlassSectionCard>
                <SectionCardHeader>
                  <h3>
                    <FaPaintBrush />
                    Estúdio de Conteúdo
                  </h3>
                </SectionCardHeader>
                <ContentGrid>
                  {canAccessPage('visual_editor') && (
                    <ContentButton to="/portal-gestor/visual-editor" id="dash-visual-editor">
                      <FaMagic />
                      <span>Editor Visual</span>
                    </ContentButton>
                  )}

                  {canAccessPage('textos') && (
                    <ContentButton to={`${ROUTES.ADMIN}/textos`} id="dash-textos">
                      <FaFileAlt />
                      <span>Textos do Site</span>
                    </ContentButton>
                  )}

                  {canAccessPage('imagens') && (
                    <ContentButton to={`${ROUTES.ADMIN}/imagens`} id="dash-imagens">
                      <FaImages />
                      <span>Banco Imagens</span>
                    </ContentButton>
                  )}

                  {canAccessPage('resultados') && (
                    <ContentButton to={`${ROUTES.ADMIN}/resultados`} id="dash-resultados">
                      <FaStar />
                      <span>Transformações</span>
                    </ContentButton>
                  )}

                  {canAccessPage('depoimentos') && (
                    <ContentButton to={`${ROUTES.ADMIN}/depoimentos`} id="dash-depoimentos">
                      <FaQuoteRight />
                      <span>Depoimentos</span>
                    </ContentButton>
                  )}

                  {canAccessPage('faq') && (
                    <ContentButton to={`${ROUTES.ADMIN}/faq`} id="dash-faq">
                      <FaQuestionCircle />
                      <span>FAQ & Ajuda</span>
                    </ContentButton>
                  )}
                </ContentGrid>
              </GlassSectionCard>
            )}

            {/* Coluna 3: Governança, Sistema & IA */}
            {hasGovernanceCol && (
              <GlassSectionCard>
                <SectionCardHeader>
                  <h3>
                    <FaShieldAlt />
                    Governança & IA
                  </h3>
                </SectionCardHeader>

                {/* Mini stats do robô */}
                <BotStatsRow>
                  <BotStatPill $color="#F59E0B" $bg="rgba(245, 158, 11, 0.1)" $border="rgba(245, 158, 11, 0.2)">
                    <div className="num">{botStats?.pending ?? 2}</div>
                    <div className="lbl">Pendentes</div>
                  </BotStatPill>
                  <BotStatPill $color="#14B8A6" $bg="rgba(20, 184, 166, 0.1)" $border="rgba(20, 184, 166, 0.2)">
                    <div className="num">{botStats?.approved ?? 1}</div>
                    <div className="lbl">Aprovados</div>
                  </BotStatPill>
                  <BotStatPill $color="#EF4444" $bg="rgba(239, 68, 68, 0.1)" $border="rgba(239, 68, 68, 0.2)">
                    <div className="num">{botStats?.rejected ?? 4}</div>
                    <div className="lbl">Rejeitados</div>
                  </BotStatPill>
                </BotStatsRow>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {canAccessPage('usuarios') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/usuarios`} id="dash-usuarios">
                      <div className="left-content">
                        <FaUserShield />
                        <span>Gestão de Usuários (RBAC)</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}

                  {canAccessPage('aparencia') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/aparencia`} id="dash-aparencia">
                      <div className="left-content">
                        <FaPalette />
                        <span>Aparência</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}

                  {canAccessPage('configuracoes') && (
                    <ActionListItem to={`${ROUTES.ADMIN}/configuracoes`} id="dash-config">
                      <div className="left-content">
                        <FaCog />
                        <span>Configurações</span>
                      </div>
                      <FaChevronRight className="arrow" />
                    </ActionListItem>
                  )}

                  <ActionListButton onClick={() => setShowPasswordModal(true)} id="dash-senha">
                    <div className="left-content">
                      <FaLock />
                      <span>Trocar Senha</span>
                    </div>
                    <FaChevronRight className="arrow" />
                  </ActionListButton>
                </div>

                {isSuperadmin && (
                  <NexusGodButton to="/nexus/watchtower" id="dash-nexus">
                    <FaShieldAlt />
                    <span>NEXUS (GOD MODE)</span>
                  </NexusGodButton>
                )}
              </GlassSectionCard>
            )}
          </BottomGrid>
        )}

        {/* 4. MODO DE MANUTENÇÃO (Rodapé Full-Width) */}
        {maintenance && canAccessPage('configuracoes') && (
          <GlassSectionCard style={{ marginTop: '1rem' }}>
            <SectionCardHeader>
              <h3>
                <FaCog />
                Modo de Manutenção dos Portais
              </h3>
            </SectionCardHeader>
            <MaintContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', width: '100%' }}>
                {/* Portal Licenciada */}
                <PortalCard>
                  <MaintHeader>
                    <PortalName>Portal da Licenciada</PortalName>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={!!maintenance.licenciada?.active}
                        onChange={() => handleToggle('licenciada')}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </MaintHeader>
                  <MaintField>
                    <label>Título do Alerta</label>
                    <input
                      type="text"
                      value={maintenance.licenciada?.title || ''}
                      onChange={(e) => handleFieldChange('licenciada', 'title', e.target.value)}
                      placeholder="Ex: Portal em Manutenção"
                    />
                  </MaintField>
                  <MaintField>
                    <label>Mensagem Principal</label>
                    <textarea
                      value={maintenance.licenciada?.message || ''}
                      onChange={(e) => handleFieldChange('licenciada', 'message', e.target.value)}
                      placeholder="Descreva o motivo da manutenção..."
                      rows={2}
                    />
                  </MaintField>
                </PortalCard>

                {/* Portal Aluna */}
                <PortalCard>
                  <MaintHeader>
                    <PortalName>Portal da Aluna</PortalName>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={!!maintenance.aluna?.active}
                        onChange={() => handleToggle('aluna')}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </MaintHeader>
                  <MaintField>
                    <label>Título do Alerta</label>
                    <input
                      type="text"
                      value={maintenance.aluna?.title || ''}
                      onChange={(e) => handleFieldChange('aluna', 'title', e.target.value)}
                      placeholder="Ex: Portal em Manutenção"
                    />
                  </MaintField>
                  <MaintField>
                    <label>Mensagem Principal</label>
                    <textarea
                      value={maintenance.aluna?.message || ''}
                      onChange={(e) => handleFieldChange('aluna', 'message', e.target.value)}
                      placeholder="Descreva o motivo da manutenção..."
                      rows={2}
                    />
                  </MaintField>
                </PortalCard>
              </div>

              <SaveButton
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : saveSuccess ? '✓ Salvo com Sucesso!' : 'Salvar Alterações de Manutenção'}
              </SaveButton>
            </MaintContainer>
          </GlassSectionCard>
        )}
      </DashboardWrapper>
    </AdminLayout>
  )
}
