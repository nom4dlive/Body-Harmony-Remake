import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaCalendarAlt, FaThLarge, FaExclamationTriangle, FaCheckSquare, 
  FaClock, FaPlus, FaSearch, FaSyncAlt, FaCalendarCheck, FaListUl
} from 'react-icons/fa';
import AdminLayout from '../../Admin/components/AdminLayout';
import { gestorAgendaApi, rbacApi } from '../../../services/api';
import AgendaCalendarView from './AgendaCalendarView';
import AgendaKanbanListView from './AgendaKanbanListView';
import EventModal from './EventModal';
import EventDetailsDrawer from './EventDetailsDrawer';
import AgendaScopeSelector from '../../../components/Agenda/AgendaScopeSelector';
import AgendaShareModal from '../../../components/Agenda/AgendaShareModal';
import { useToast } from '../../../context/ToastContext';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleArea = styled.div`
  h1 {
    color: #0a3e60;
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    letter-spacing: -0.5px;

    svg {
      color: #ed7e13;
    }
  }

  p {
    color: #64748b;
    font-size: 0.85rem;
    margin: 4px 0 0 0;
    font-weight: 500;
  }
`;

const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const RefreshBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;

  &:hover {
    color: #ed7e13;
    border-color: #ed7e13;
    transform: translateY(-1px);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const PrimaryBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 1.25rem;
  background: linear-gradient(135deg, #ed7e13 0%, #d96d07 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

/* BENTO KPI GRID */
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const KpiCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.2rem;
  border: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const KpiInfo = styled.div`
  .label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.$labelColor || '#64748b'};
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.7rem;
    font-weight: 800;
    color: #0a3e60;
    line-height: 1;
  }
`;

const KpiIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg || '#f1f5f9'};
  color: ${props => props.$color || '#0a3e60'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

/* CONTROL BAR */
const ControlBar = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 240px;
  flex: 1;
  max-width: 380px;

  svg {
    position: absolute;
    left: 12px;
    top: 14px;
    color: #94a3b8;
  }

  input {
    width: 100%;
    height: 44px;
    min-height: 44px;
    padding-left: 2.3rem;
    padding-right: 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
`;

const SelectBox = styled.select`
  height: 44px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  color: #1e293b;
  background: white;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const ViewSwitcher = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 4px;
`;

const ViewTab = styled.button`
  height: 36px;
  min-height: 36px;
  padding: 0 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  background: ${props => props.$active ? '#0a3e60' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};

  &:hover {
    color: ${props => props.$active ? 'white' : '#0a3e60'};
  }
`;

export default function GestorAgendaPage() {
  const { showSuccess, showError } = useToast();
  const [viewMode, setViewMode] = useState('kanban'); // 'calendar' | 'kanban'
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    total_urgencias_ativas: 0,
    total_pendencias_hoje: 0,
    total_agendamentos_hoje: 0,
    total_pendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Multi-User & Scope State (PLAN-076)
  const [currentScope, setCurrentScope] = useState('mine');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Drawer state for subtasks, discussions and attachments (PLAN-063)
  const [drawerEvent, setDrawerEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchRbacMetadata = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        rbacApi.getUsers().catch(() => null),
        rbacApi.getDepartments().catch(() => null)
      ]);
      if (usersRes?.success) {
        setUsersList(usersRes.users || []);
        if (usersRes.current_user) setCurrentUserInfo(usersRes.current_user);
      }
      if (deptsRes?.success) {
        setDepartments(deptsRes.departments || []);
      }
    } catch (e) {
      console.error('Erro ao carregar metadados RBAC:', e);
    }
  };

  const fetchAgendaData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const queryParams = {
        scope: currentScope
      };
      if (currentScope === 'user' && selectedUserId) {
        queryParams.user_id = selectedUserId;
      } else if (currentScope === 'department' && selectedDepartmentId) {
        queryParams.department_id = selectedDepartmentId;
      }

      const [eventsRes, summaryRes] = await Promise.all([
        gestorAgendaApi.getEvents(queryParams),
        gestorAgendaApi.getSummary()
      ]);

      if (eventsRes?.events) setEvents(eventsRes.events);
      if (summaryRes?.summary) setSummary(summaryRes.summary);
    } catch (err) {
      console.error('Erro ao carregar dados da agenda:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacMetadata();
  }, []);

  useEffect(() => {
    fetchAgendaData(false);
    const interval = setInterval(() => {
      fetchAgendaData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentScope, selectedUserId, selectedDepartmentId]);

  const handleSaveEvent = async (formData) => {
    try {
      if (editingEvent) {
        await gestorAgendaApi.updateEvent(editingEvent.id, formData);
        showSuccess('Evento Atualizado', 'Alterações gravadas com sucesso.');
      } else {
        await gestorAgendaApi.createEvent(formData);
        showSuccess('Evento Criado', 'Novo compromisso adicionado à agenda.');
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      fetchAgendaData();
    } catch (err) {
      showError('Erro ao Salvar Evento', err.message || 'Falha de comunicação');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await gestorAgendaApi.updateStatus(id, status);
      showSuccess('Status Atualizado', `Evento marcado como ${status}.`);
      fetchAgendaData();
    } catch (err) {
      showError('Erro ao Atualizar Status', err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Deseja realmente excluir este evento/pendência da agenda?')) return;
    try {
      await gestorAgendaApi.deleteEvent(id);
      showSuccess('Evento Excluído', 'O item foi removido da agenda.');
      fetchAgendaData();
    } catch (err) {
      showError('Erro ao Remover Evento', err.message);
    }
  };

  const handleOpenDrawer = (evt) => {
    setDrawerEvent(evt);
    setIsDrawerOpen(true);
  };

  const filteredEvents = events.filter(evt => {
    const matchesSearch = !search || evt.title.toLowerCase().includes(search.toLowerCase()) || (evt.description && evt.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'ALL' || evt.event_type === filterType;
    const matchesPriority = filterPriority === 'ALL' || evt.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <AdminLayout>
      <Container>
        {/* Top Header */}
        <Header>
          <TitleArea>
            <h1>
              <FaCalendarAlt /> Agenda & Pendências dos Gestores
            </h1>
            <p>
              Gestão unificada de compromissos, tarefas operacionais e urgências compartilhadas da equipe.
            </p>
          </TitleArea>

          <ActionsArea>
            <RefreshBtn
              onClick={() => fetchAgendaData(false)}
              title="Atualizar Dados em Tempo Real"
            >
              <FaSyncAlt className={loading ? 'spin' : ''} />
            </RefreshBtn>

            <PrimaryBtn
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Novo Evento / Pendência
            </PrimaryBtn>
          </ActionsArea>
        </Header>

        {/* Summary KPI Badges (Bento Grid) */}
        <KpiGrid>
          <KpiCard $borderColor="#fee2e2">
            <KpiInfo $labelColor="#ef4444">
              <div className="label">Urgências Ativas</div>
              <div className="value">{summary.total_urgencias_ativas}</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#fef2f2" $color="#ef4444">
              <FaExclamationTriangle />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#fef3c7">
            <KpiInfo $labelColor="#f59e0b">
              <div className="label">Pendências Hoje</div>
              <div className="value">{summary.total_pendencias_hoje}</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#fffbeb" $color="#f59e0b">
              <FaClock />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#dbeafe">
            <KpiInfo $labelColor="#3b82f6">
              <div className="label">Agendamentos Hoje</div>
              <div className="value">{summary.total_agendamentos_hoje}</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#eff6ff" $color="#3b82f6">
              <FaCalendarCheck />
            </KpiIconWrapper>
          </KpiCard>

          <KpiCard $borderColor="#dcfce7">
            <KpiInfo $labelColor="#10b981">
              <div className="label">Total Pendentes</div>
              <div className="value">{summary.total_pendentes}</div>
            </KpiInfo>
            <KpiIconWrapper $bg="#f0fdf4" $color="#10b981">
              <FaCheckSquare />
            </KpiIconWrapper>
          </KpiCard>
        </KpiGrid>

        {/* Multi-User & Scope Selector (PLAN-076) */}
        <AgendaScopeSelector
          currentScope={currentScope}
          onScopeChange={(newScope) => {
            setCurrentScope(newScope);
            if (newScope !== 'user') setSelectedUserId('');
            if (newScope !== 'department') setSelectedDepartmentId('');
          }}
          users={usersList}
          selectedUserId={selectedUserId}
          onUserSelect={(uid) => {
            setSelectedUserId(uid);
            setCurrentScope('user');
          }}
          departments={departments}
          selectedDepartmentId={selectedDepartmentId}
          onDepartmentSelect={(did) => {
            setSelectedDepartmentId(did);
            setCurrentScope('department');
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
        />

        {/* Control Bar: Filters & View Switcher */}
        <ControlBar>
          <FiltersGroup>
            <SearchBox>
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou aluna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchBox>

            <SelectBox
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="agendamento_cliente">📅 Agendamentos</option>
              <option value="pendencia">📌 Pendências</option>
              <option value="urgencia">🚨 Urgências</option>
              <option value="evento_geral">🏢 Eventos Gerais</option>
            </SelectBox>

            <SelectBox
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">Todas as Prioridades</option>
              <option value="critica">🔴 Crítica</option>
              <option value="alta">🟠 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🔵 Baixa</option>
            </SelectBox>
          </FiltersGroup>

          {/* View Mode Switcher */}
          <ViewSwitcher>
            <ViewTab
              $active={viewMode === 'kanban'}
              onClick={() => setViewMode('kanban')}
            >
              <FaThLarge /> Quadro Kanban
            </ViewTab>
            <ViewTab
              $active={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
            >
              <FaCalendarAlt /> Grade de Calendário
            </ViewTab>
          </ViewSwitcher>
        </ControlBar>

        {/* Main Content Area */}
        {viewMode === 'calendar' ? (
          <AgendaCalendarView
            events={filteredEvents}
            onSelectEvent={handleOpenDrawer}
            onCreateEvent={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <AgendaKanbanListView
            events={filteredEvents}
            onUpdateStatus={handleUpdateStatus}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setIsModalOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onSelectEvent={handleOpenDrawer}
          />
        )}

        {/* Form Modal */}
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
        />

        {/* Advanced Details Drawer */}
        <EventDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setDrawerEvent(null);
          }}
          event={drawerEvent}
          onRefresh={() => fetchAgendaData(true)}
        />
        {/* Agenda Delegation & Sharing Modal (PLAN-076) */}
        <AgendaShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          users={usersList}
          currentUserId={currentUserInfo?.id}
        />
      </Container>
    </AdminLayout>
  );
}
