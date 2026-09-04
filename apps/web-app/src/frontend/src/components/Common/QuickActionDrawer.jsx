import React from 'react';
import styled from 'styled-components';
import { UserPlus, CalendarPlus, FilePlus, MessageSquarePlus, X, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
  z-index: 10000;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DrawerPanel = styled.div`
  background: #FFFFFF;
  width: 100%;
  max-width: 380px;
  height: 100%;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 1px solid #E2E8F0;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const DrawerHeader = styled.div`
  padding: 20px 24px;
  background: linear-gradient(135deg, #0A3E60 0%, #06263B 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-box {
    display: flex;
    align-items: center;
    gap: 10px;

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
    }

    svg {
      color: #ED7E13;
    }
  }

  button.close-btn {
    background: transparent;
    border: none;
    color: #CBD5E1;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ActionsList = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
`;

const ActionCard = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  &:hover {
    background: #FFFFFF;
    border-color: #ED7E13;
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.12);
    transform: translateY(-2px);
  }

  .icon-box {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || 'rgba(10, 62, 96, 0.1)'};
    color: ${props => props.$color || '#0A3E60'};
    border: 1px solid ${props => props.$border || 'rgba(10, 62, 96, 0.2)'};
  }

  .text-box {
    display: flex;
    flex-direction: column;
    gap: 3px;

    h6 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: #0A3E60;
      transition: color 0.2s;
    }

    p {
      margin: 0;
      font-size: 11px;
      color: #64748B;
      line-height: 1.4;
    }
  }

  &:hover h6 {
    color: #ED7E13;
  }
`;

const DrawerFooter = styled.div`
  padding: 16px 24px;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  text-align: center;
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
`;

export default function QuickActionDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { canAccessPage, canPerform } = usePermissions();

  const allActions = [
    {
      page: 'onboarding',
      title: 'Gerar Link de Onboarding',
      desc: 'Criar link assinado de pré-cadastro para nova licenciada',
      icon: UserPlus,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/onboarding');
      }
    },
    {
      page: 'agenda',
      title: 'Criar Tarefa / Pendência',
      desc: 'Adicionar urgência ou agendamento na Agenda do Gestor',
      icon: CalendarPlus,
      color: '#ED7E13',
      bg: 'rgba(237, 126, 19, 0.12)',
      border: 'rgba(237, 126, 19, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/agenda');
      }
    },
    {
      page: 'contratos',
      title: 'Emitir Novo Contrato',
      desc: 'Criar contrato oficial ou termo de ouvinte em 1-clique',
      icon: FilePlus,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/contratos/novo');
      }
    },
    {
      page: 'shop',
      title: 'Gerenciar Loja & Ingressos',
      desc: 'Cadastrar links de pagamento, gerenciar catálogo e pedidos',
      icon: ShoppingBag,
      color: '#ED7E13',
      bg: 'rgba(237, 126, 19, 0.12)',
      border: 'rgba(237, 126, 19, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/shop');
      }
    },
    {
      page: 'crm',
      title: 'Central CRM & Chatwoot',
      desc: 'Atender clientes e gerenciar conversas multicanal',
      icon: MessageSquarePlus,
      color: '#25D366',
      bg: 'rgba(37, 211, 102, 0.12)',
      border: 'rgba(37, 211, 102, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/crm');
      }
    },
    {
      page: 'mensagens',
      title: 'Régua de WhatsApp',
      desc: 'Acessar mensagens padronizadas e automações de disparo',
      icon: MessageSquarePlus,
      color: '#25D366',
      bg: 'rgba(37, 211, 102, 0.12)',
      border: 'rgba(37, 211, 102, 0.25)',
      action: () => {
        onClose();
        navigate('/portal-gestor/mensagens');
      }
    }
  ];

  const actions = allActions.filter(act => canAccessPage(act.page));

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <DrawerPanel onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div>
          <DrawerHeader>
            <div className="title-box">
              <Sparkles size={18} />
              <h4>Ações Rápidas do Gestor</h4>
            </div>
            <button type="button" onClick={onClose} className="close-btn">
              <X size={18} />
            </button>
          </DrawerHeader>

          {/* ACTIONS LIST */}
          <ActionsList>
            {actions.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <ActionCard
                  key={idx}
                  type="button"
                  $color={act.color}
                  $bg={act.bg}
                  $border={act.border}
                  onClick={act.action}
                >
                  <div className="icon-box">
                    <IconComp size={20} />
                  </div>
                  <div className="text-box">
                    <h6>{act.title}</h6>
                    <p>{act.desc}</p>
                  </div>
                </ActionCard>
              );
            })}
          </ActionsList>
        </div>

        {/* FOOTER */}
        <DrawerFooter>
          Nexus Protocol V3.1 • Body Harmony
        </DrawerFooter>
      </DrawerPanel>
    </Overlay>
  );
}
