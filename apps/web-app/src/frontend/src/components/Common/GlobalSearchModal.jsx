import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Search, UserCheck, FileText, Calendar, ArrowRight, X, Sparkles, Command, ShoppingBag, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  padding-left: 16px;
  padding-right: 16px;
  z-index: 10000;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SearchBox = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  border: 1px solid #E2E8F0;
`;

const InputHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F8FAFC;

  svg.search-icon {
    color: #ED7E13;
    flex-shrink: 0;
  }

  input {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 14px;
    font-family: inherit;
    color: #0A3E60;
    font-weight: 500;
    outline: none;

    &::placeholder {
      color: #94A3B8;
    }
  }

  button.close-btn {
    background: transparent;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: #0A3E60;
      background: #E2E8F0;
    }
  }
`;

const ResultsContainer = styled.div`
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  .section-heading {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748B;
    padding: 6px 12px 2px 12px;
  }

  .empty-state {
    text-align: center;
    padding: 32px 16px;
    color: #94A3B8;
    font-size: 13px;
    font-style: italic;
  }
`;

const ResultItem = styled.button`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }

  .content-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(10, 62, 96, 0.08);
      color: #0A3E60;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .info {
      h6 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: #0A3E60;
      }

      p {
        margin: 2px 0 0 0;
        font-size: 11px;
        color: #64748B;
      }
    }
  }

  &:hover .icon-wrapper {
    background: #ED7E13;
    color: #FFFFFF;
  }

  .arrow-icon {
    color: #CBD5E1;
    transition: all 0.2s;
  }

  &:hover .arrow-icon {
    color: #ED7E13;
    transform: translateX(3px);
  }
`;

const SearchFooter = styled.div`
  padding: 12px 20px;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748B;
`;

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { canAccessPage } = usePermissions();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent('open-global-search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allQuickActions = [
    { page: 'onboarding', title: 'Funil de Onboarding', desc: 'Gerenciar pré-cadastros, documentos e aprovações', url: '/portal-gestor/onboarding', icon: UserCheck, category: 'Navegação' },
    { page: 'agenda', title: 'Agenda & Pendências', desc: 'Ver calendário e tarefas de licenciamento', url: '/portal-gestor/agenda', icon: Calendar, category: 'Navegação' },
    { page: 'contratos', title: 'Gestão de Contratos', desc: 'Emitir contratos oficiais e verificar assinaturas', url: '/portal-gestor/contratos', icon: FileText, category: 'Navegação' },
    { page: 'shop', title: 'Loja & Ingressos', desc: 'Gerenciar catálogo de produtos, vendas e leads do E-Shop', url: '/portal-gestor/shop', icon: ShoppingBag, category: 'Navegação' },
    { page: 'financeiro', title: 'Cockpit Financeiro', desc: 'Taxas de licenciamento, transações, fechamentos e relatórios', url: '/portal-gestor/financeiro', icon: ArrowRight, category: 'Navegação' },
    { page: 'crm', title: 'Central CRM & WhatsApp', desc: 'Chatwoot, instâncias da Evolution API e atendimento multicanal', url: '/portal-gestor/crm', icon: MessageSquare, category: 'Navegação' },
    { page: 'mensagens', title: 'Mensagens WhatsApp', desc: 'Disparar mensagens padronizadas e réguas de contato', url: '/portal-gestor/mensagens', icon: Sparkles, category: 'Navegação' },
    { page: 'usuarios', title: 'Gestão de Usuários (RBAC)', desc: 'Controle de colaboradores, setores e acessos', url: '/portal-gestor/usuarios', icon: UserCheck, category: 'Navegação' },
    { page: 'lms', title: 'Painel LMS & Aulas', desc: 'Gerenciar módulos e licenciadas no treinamento', url: '/portal-gestor/lms', icon: Sparkles, category: 'Navegação' },
    { page: 'licenciadas', title: 'Gerenciar Licenciadas', desc: 'Cadastro, módulos e dados cadastrais', url: '/portal-gestor/licenciadas', icon: UserCheck, category: 'Navegação' },
    { page: 'configuracoes', title: 'Configurações do Sistema', desc: 'Ajustes visuais, chaves e dados institucionais', url: '/portal-gestor/configuracoes', icon: Command, category: 'Navegação' }
  ];

  const quickActions = allQuickActions.filter(item => canAccessPage(item.page));

  const filteredItems = useMemo(() => {
    if (!query.trim()) return quickActions;
    const q = query.toLowerCase();
    return quickActions.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <SearchBox onClick={(e) => e.stopPropagation()}>
        <InputHeader>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por candidata, contrato, tarefa ou tela (Ctrl + K)..."
            autoFocus
          />
          <button type="button" onClick={onClose} className="close-btn">
            <X size={16} />
          </button>
        </InputHeader>

        <ResultsContainer>
          <div className="section-heading">
            {query.trim() ? 'Resultados' : 'Atalhos Recomendados'}
          </div>

          {filteredItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <ResultItem key={idx} type="button" onClick={() => handleSelect(item.url)}>
                <div className="content-left">
                  <div className="icon-wrapper">
                    <IconComp size={16} />
                  </div>
                  <div className="info">
                    <h6>{item.title}</h6>
                    <p>{item.desc}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="arrow-icon" />
              </ResultItem>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="empty-state">
              Nenhum item encontrado para "{query}".
            </div>
          )}
        </ResultsContainer>

        <SearchFooter>
          <span>Navegue com o mouse ou teclado</span>
          <span>ESC para fechar</span>
        </SearchFooter>
      </SearchBox>
    </Overlay>
  );
}
