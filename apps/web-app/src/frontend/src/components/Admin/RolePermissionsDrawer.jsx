import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, FaShieldAlt, FaCalendarAlt, FaFileSignature, FaUserGraduate, 
  FaUserShield, FaFilter, FaWhatsapp, FaVideo, FaUsers, FaGraduationCap, 
  FaPalette, FaLaptopCode, FaImages, FaStar, FaQuoteRight, FaEnvelope, 
  FaQuestionCircle, FaCog, FaCheck, FaSlidersH, FaSave, FaUserEdit, FaLock,
  FaComments
} from 'react-icons/fa';
import { api } from '../../services/api';

const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 26, 41, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
`;

const DrawerContent = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 520px;
  height: 100vh;
  box-shadow: -10px 0 30px rgba(10, 62, 96, 0.25);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease-out;

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const Header = styled.div`
  padding: 1.25rem 1.5rem;
  background: #0A3E60;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
    }
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  font-size: 1.1rem;
  cursor: pointer;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Body = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(10, 62, 96, 0.2);
    border-radius: 4px;
  }
`;

const BadgeCard = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-left: 4px solid ${props => props.$color || '#ED7E13'};
  border-radius: 10px;
  padding: 1rem 1.25rem;

  .name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meta {
    font-size: 0.85rem;
    color: #64748B;
    margin-top: 0.35rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .tag {
    display: inline-block;
    background: #0A3E60;
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }
`;

const CustomToggleBox = styled.div`
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .info {
    h5 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #92400E;
    }
    p {
      margin: 0.2rem 0 0 0;
      font-size: 0.78rem;
      color: #B45309;
      line-height: 1.3;
    }
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #CBD5E1;
    transition: 0.2s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
  }

  input:checked + span {
    background-color: #ED7E13;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const AdvancedToggleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #F1F5F9;
  border-radius: 8px;
  border: 1px solid #E2E8F0;

  span {
    font-size: 0.85rem;
    font-weight: 700;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
`;

const ModulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const ModuleItem = styled.div`
  background: ${props => props.$active ? '#FFFFFF' : '#F8FAFC'};
  border: 1px solid ${props => props.$active ? '#CBD5E1' : '#E2E8F0'};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s;

  .main-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .label-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-size: 0.88rem;
    font-weight: 600;
    color: ${props => props.$active ? '#0A3E60' : '#64748B'};

    svg {
      color: ${props => props.$active ? '#ED7E13' : '#94A3B8'};
      font-size: 1rem;
    }
  }

  .actions-subgrid {
    margin-top: 0.35rem;
    padding-top: 0.5rem;
    border-top: 1px dashed #E2E8F0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-left: 1.65rem;
  }

  .action-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: #475569;
    cursor: pointer;

    input {
      accent-color: #ED7E13;
      cursor: pointer;
    }
  }
`;

const Footer = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SaveBtn = styled.button`
  background: #ED7E13;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.3);

  &:hover:not(:disabled) {
    background: #D96D0E;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MODULES_DEF = [
  { key: 'onboarding', label: 'Funil de Onboarding', icon: <FaFilter />, actions: [{ key: 'onboarding_create', label: 'Gerar Links de Onboarding' }, { key: 'onboarding_approve', label: 'Aprovar/Rejeitar Candidatas' }] },
  { key: 'agenda', label: 'Agenda & Tarefas', icon: <FaCalendarAlt />, actions: [{ key: 'agenda_manage', label: 'Gerenciar Tarefas de Toda a Equipe' }] },
  { key: 'contratos', label: 'Contratos & Assinaturas', icon: <FaFileSignature />, actions: [{ key: 'contracts_create', label: 'Emitir Novos Contratos' }, { key: 'contracts_sign', label: 'Assinar como Licenciante (Josi)' }] },
  { key: 'crm', label: 'Central CRM & WhatsApp', icon: <FaComments />, actions: [{ key: 'crm_manage', label: 'Acessar Central CRM e Atendimentos' }] },
  { key: 'mensagens', label: 'Mensagens WhatsApp', icon: <FaWhatsapp />, actions: [{ key: 'messages_broadcast', label: 'Disparo de Mensagens em Massa' }] },
  { key: 'lms', label: 'Gestão LMS & Cursos', icon: <FaVideo />, actions: [{ key: 'lms_manage', label: 'Criar, Editar e Excluir Aulas/Módulos' }] },
  { key: 'licenciadas', label: 'Gerenciar Licenciadas', icon: <FaUsers />, actions: [{ key: 'licenciadas_edit', label: 'Editar Dados Cadastrais de Licenciadas' }] },
  { key: 'alunas', label: 'Alunas Individuais', icon: <FaGraduationCap />, actions: [{ key: 'alunas_manage', label: 'Gerenciar Acessos de Alunas' }] },
  { key: 'usuarios', label: 'Gestão de Usuários (RBAC)', icon: <FaUserShield />, actions: [{ key: 'users_manage', label: 'Criar e Editar Colaboradores' }, { key: 'users_reset_password', label: 'Redefinir Senhas de Acesso' }] },
  { key: 'mentores', label: 'Gerenciar Mentores', icon: <FaUsers />, actions: [] },
  { key: 'textos', label: 'Editar Textos do Site', icon: <FaSlidersH />, actions: [{ key: 'content_edit', label: 'Publicar Alterações de Textos' }] },
  { key: 'aparencia', label: 'Aparência & Tema', icon: <FaPalette />, actions: [{ key: 'theme_edit', label: 'Modificar Cores e Identidade' }] },
  { key: 'visual_editor', label: 'Editor Visual', icon: <FaLaptopCode />, actions: [] },
  { key: 'imagens', label: 'Banco de Imagens', icon: <FaImages />, actions: [] },
  { key: 'resultados', label: 'Transformações & Resultados', icon: <FaStar />, actions: [] },
  { key: 'depoimentos', label: 'Depoimentos de Clientes', icon: <FaQuoteRight />, actions: [] },
  { key: 'leads', label: 'Caixa de Entrada / Leads', icon: <FaEnvelope />, actions: [] },
  { key: 'faq', label: 'Perguntas Frequentes (FAQ)', icon: <FaQuestionCircle />, actions: [] },
  { key: 'configuracoes', label: 'Configurações Globais', icon: <FaCog />, actions: [{ key: 'config_edit', label: 'Alterar Chaves e Manutenção' }] }
];

export default function RolePermissionsDrawer({ role, user, onClose, onSaved }) {
  const isUserMode = Boolean(user && user.id);
  const targetName = isUserMode ? user.username : role?.name;
  
  const [hasCustom, setHasCustom] = useState(isUserMode ? Boolean(Number(user.has_custom_permissions) === 1) : false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [pagesState, setPagesState] = useState({});
  const [actionsState, setActionsState] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Inicializar estado das permissões
    let initialPerms = {};
    if (isUserMode) {
      if (Number(user.has_custom_permissions) === 1 && user.custom_permissions_json) {
        try {
          initialPerms = typeof user.custom_permissions_json === 'string' 
            ? JSON.parse(user.custom_permissions_json) 
            : user.custom_permissions_json;
        } catch {
          initialPerms = user.permissions || {};
        }
      } else {
        initialPerms = user.permissions || {};
      }
    } else if (role) {
      initialPerms = role.permissions || {};
    }

    const pages = initialPerms.pages || {};
    const actions = initialPerms.actions || {};

    // Converter para booleans mapeados
    const newPages = {};
    MODULES_DEF.forEach(m => {
      // Checar se veio no formato novo ou legado (string manage/view/all)
      if (typeof pages[m.key] !== 'undefined') {
        newPages[m.key] = Boolean(pages[m.key]);
      } else if (typeof initialPerms[m.key] !== 'undefined') {
        newPages[m.key] = initialPerms[m.key] !== 'none' && Boolean(initialPerms[m.key]);
      } else {
        newPages[m.key] = false;
      }
    });

    const newActions = {};
    MODULES_DEF.forEach(m => {
      m.actions.forEach(a => {
        if (typeof actions[a.key] !== 'undefined') {
          newActions[a.key] = Boolean(actions[a.key]);
        } else if (newPages[m.key]) {
          newActions[a.key] = true;
        } else {
          newActions[a.key] = false;
        }
      });
    });

    setPagesState(newPages);
    setActionsState(newActions);
  }, [role, user, isUserMode]);

  if (!role && !user) return null;

  const togglePage = (pageKey) => {
    setPagesState(prev => {
      const nextVal = !prev[pageKey];
      // Se desmarcar a página, desmarca as ações dela
      if (!nextVal) {
        const mod = MODULES_DEF.find(m => m.key === pageKey);
        if (mod && mod.actions) {
          setActionsState(actPrev => {
            const nextActs = { ...actPrev };
            mod.actions.forEach(a => { nextActs[a.key] = false; });
            return nextActs;
          });
        }
      } else {
        // Se marcar a página, habilita as ações básicas dela
        const mod = MODULES_DEF.find(m => m.key === pageKey);
        if (mod && mod.actions) {
          setActionsState(actPrev => {
            const nextActs = { ...actPrev };
            mod.actions.forEach(a => { nextActs[a.key] = true; });
            return nextActs;
          });
        }
      }
      return { ...prev, [pageKey]: nextVal };
    });
  };

  const toggleAction = (actionKey) => {
    setActionsState(prev => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payloadPermissions = {
        pages: pagesState,
        actions: actionsState,
        agenda_scope: pagesState.agenda ? (actionsState.agenda_manage ? 'all' : 'own') : 'none'
      };

      if (isUserMode) {
        await api.rbac.updateUserPermissions(user.id, payloadPermissions, hasCustom ? 1 : 0);
      } else {
        await api.rbac.updateRolePermissions(role.id, payloadPermissions);
      }

      alert('Permissões atualizadas com sucesso!');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.message || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerOverlay onClick={onClose}>
      <DrawerContent onClick={e => e.stopPropagation()}>
        <Header>
          <div className="title-group">
            <FaShieldAlt style={{ color: '#ED7E13' }} />
            <h3>{isUserMode ? 'Permissões do Usuário' : 'Permissões do Cargo'}</h3>
          </div>
          <CloseBtn onClick={onClose} aria-label="Fechar">
            <FaTimes />
          </CloseBtn>
        </Header>

        <Body>
          <BadgeCard $color={isUserMode ? user.department_color : role?.department_color}>
            <div className="name">
              {isUserMode ? <FaUserEdit /> : <FaShieldAlt />}
              {targetName}
            </div>
            <div className="meta">
              <span>Depto: <strong>{isUserMode ? user.department_name : role?.department_name}</strong></span>
              <span>Cargo: <strong>{isUserMode ? user.role_name : role?.name}</strong></span>
              <span className="tag">Nível {isUserMode ? user.hierarchy_level : role?.hierarchy_level}</span>
            </div>
          </BadgeCard>

          {/* MODO ALTERNADO PARA USUÁRIOS */}
          {isUserMode && (
            <CustomToggleBox>
              <div className="info">
                <h5>Personalizar Matriz Deste Usuário</h5>
                <p>
                  {hasCustom 
                    ? 'Permissões exclusivas ativadas. Este usuário não segue mais as alterações do cargo base.' 
                    : 'Seguindo as permissões padrão do cargo. Ative o toggle para criar uma matriz independente.'}
                </p>
              </div>
              <Switch>
                <input 
                  type="checkbox" 
                  checked={hasCustom} 
                  onChange={e => setHasCustom(e.target.checked)} 
                />
                <span></span>
              </Switch>
            </CustomToggleBox>
          )}

          {/* BARRA DE MODO AVANÇADO */}
          <AdvancedToggleBar>
            <span>
              <FaSlidersH style={{ color: '#ED7E13' }} />
              Modo Avançado (Botões & Ações Específicas)
            </span>
            <Switch>
              <input 
                type="checkbox" 
                checked={isAdvanced} 
                onChange={e => setIsAdvanced(e.target.checked)} 
              />
              <span></span>
            </Switch>
          </AdvancedToggleBar>

          {/* LISTA DE MÓDULOS */}
          <h4 style={{ margin: '0.25rem 0 0 0', color: '#0A3E60', fontSize: '0.92rem', fontWeight: 800 }}>
            Módulos & Telas Autorizadas:
          </h4>

          <ModulesList>
            {MODULES_DEF.map(mod => {
              const isAllowed = Boolean(pagesState[mod.key]);
              const hasActions = mod.actions && mod.actions.length > 0;

              return (
                <ModuleItem key={mod.key} $active={isAllowed}>
                  <div className="main-row">
                    <div className="label-group">
                      {mod.icon}
                      <span>{mod.label}</span>
                    </div>
                    <Switch>
                      <input 
                        type="checkbox" 
                        checked={isAllowed} 
                        onChange={() => togglePage(mod.key)} 
                      />
                      <span></span>
                    </Switch>
                  </div>

                  {/* AÇÕES NO MODO AVANÇADO */}
                  {isAdvanced && hasActions && isAllowed && (
                    <div className="actions-subgrid">
                      {mod.actions.map(act => (
                        <label key={act.key} className="action-checkbox">
                          <input 
                            type="checkbox" 
                            checked={Boolean(actionsState[act.key])} 
                            onChange={() => toggleAction(act.key)} 
                          />
                          <span>{act.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </ModuleItem>
              );
            })}
          </ModulesList>
        </Body>

        <Footer>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
          >
            Cancelar
          </button>

          <SaveBtn onClick={handleSave} disabled={saving}>
            {saving ? <FaLock /> : <FaSave />}
            <span>{saving ? 'Gravando...' : 'Salvar Permissões'}</span>
          </SaveBtn>
        </Footer>
      </DrawerContent>
    </DrawerOverlay>
  );
}
