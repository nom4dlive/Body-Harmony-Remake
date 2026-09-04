import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import AdminLayout from './components/AdminLayout';
import UserFormModal from '../../components/Admin/UserFormModal';
import RolePermissionsDrawer from '../../components/Admin/RolePermissionsDrawer';
import { api } from '../../services/api';
import { 
  Users, UserPlus, Building2, UserCheck, Search, 
  Edit, Key, Shield, RotateCcw, Eye, ShieldCheck, CheckCircle2, XCircle
} from 'lucide-react';
import CompactKpiGrid from '../../components/ui/CompactKpiGrid';
import ResponsiveDataTable from '../../components/ui/ResponsiveDataTable';
import TableRowActionMenu from '../../components/ui/TableRowActionMenu';

const Container = styled.div`
  max-width: 1560px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 90px;

  @media (max-width: 768px) {
    padding: 0.85rem;
    gap: 1rem;
    padding-bottom: 90px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;

  .title-area {
    h1 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    p {
      color: #64748B;
      margin: 0.2rem 0 0 0;
      font-size: 0.85rem;
    }
  }
`;

const PrimaryBtn = styled.button`
  background: #ED7E13;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.15s ease;

  &:hover {
    background: #FF8F26;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.35);
  }
`;

const ControlBar = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 0.85rem 1.15rem;
  box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 240px;
  flex: 1;

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
  }

  input {
    width: 100%;
    padding: 0.55rem 0.85rem 0.55rem 2.3rem;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    font-size: 0.85rem;
    color: #0F172A;

    &:focus {
      outline: none;
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }
  }
`;

const Select = styled.select`
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  font-size: 0.85rem;
  color: #334155;
  background: #ffffff;
  min-height: 38px;

  &:focus {
    outline: none;
    border-color: #ED7E13;
  }
`;

const IconBtn = styled.button`
  background: transparent;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #F1F5F9;
    color: #0A3E60;
    border-color: #0A3E60;
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: ${props => props.$bg || '#0A3E60'};
    color: #ffffff;
    font-weight: 700;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .details {
    display: flex;
    flex-direction: column;
    .username {
      font-weight: 700;
      color: #0A3E60;
      font-size: 0.88rem;
    }
    .email {
      font-size: 0.75rem;
      color: #64748B;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.$bg || '#F1F5F9'};
  color: ${props => props.$color || '#334155'};
  border: 1px solid ${props => props.$border || 'transparent'};
  white-space: nowrap;
`;

const RoleBtn = styled.button`
  background: #F1F5F9;
  color: #0A3E60;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s;

  &:hover {
    background: #0A3E60;
    color: #ffffff;
  }
`;

export default function GestorUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modais e Drawers
  const [modalUser, setModalUser] = useState(null);
  const [drawerRole, setDrawerRole] = useState(null);
  const [drawerUser, setDrawerUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes, rolesRes] = await Promise.all([
        api.rbac.getUsers(),
        api.rbac.getDepartments(),
        api.rbac.getRoles()
      ]);

      if (usersRes?.success) {
        setUsers(usersRes.users || []);
        setCurrentUser(usersRes.current_user || null);
      }
      if (deptsRes?.success) setDepartments(deptsRes.departments || []);
      if (rolesRes?.success) setRoles(rolesRes.roles || []);
    } catch (e) {
      console.error('Erro ao carregar dados de usuários:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search || 
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.role_name && u.role_name.toLowerCase().includes(search.toLowerCase()));

      const matchDept = !selectedDept || String(u.department_id) === String(selectedDept);
      const matchStatus = selectedStatus === '' || String(u.is_active) === String(selectedStatus);

      return matchSearch && matchDept && matchStatus;
    });
  }, [users, search, selectedDept, selectedStatus]);

  const totalCount = users.length;
  const activeCount = users.filter(u => Number(u.is_active) === 1).length;
  const deptCount = departments.length;
  const supervisorCount = new Set(users.map(u => u.supervisor_id).filter(Boolean)).size;

  const handleToggleStatus = async (user) => {
    if (currentUser?.id === user.id) {
      alert('Você não pode desativar seu próprio usuário.');
      return;
    }
    const actionText = user.is_active === 1 ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja realmente ${actionText} o usuário '${user.username}'?`)) return;

    try {
      const data = await api.rbac.toggleStatus(user.id);
      if (!data.success) throw new Error(data.error);
      fetchData();
    } catch (err) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleResetPassword = async (user) => {
    const newPass = window.prompt(`Digite a nova senha para '${user.username}' (mínimo 6 caracteres):`);
    if (!newPass) return;
    if (newPass.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      const data = await api.rbac.resetPassword(user.id, newPass);
      if (!data.success) throw new Error(data.error);
      alert(`Senha do usuário '${user.username}' redefinida com sucesso!`);
    } catch (err) {
      alert(err.message || 'Erro ao redefinir senha');
    }
  };

  const openRoleDrawerForUser = (user) => {
    const roleObj = roles.find(r => r.id === user.role_id) || {
      id: 0,
      name: user.role_name || user.legacy_role || 'Administrador',
      department_name: user.department_name || 'Geral',
      department_color: user.department_color || '#0A3E60',
      hierarchy_level: user.hierarchy_level || 2,
      permissions: user.permissions || {}
    };
    setDrawerRole(roleObj);
    setDrawerUser(user);
  };

  const kpiItems = [
    { label: 'Total Colaboradores', value: totalCount, color: '#0A3E60', icon: Users },
    { label: 'Contas Ativas', value: activeCount, color: '#16A34A', icon: ShieldCheck },
    { label: 'Departamentos', value: deptCount, color: '#ED7E13', icon: Building2 },
    { label: 'Líderes / Supervisores', value: supervisorCount, color: '#8B5CF6', icon: UserCheck },
  ];

  const columns = [
    {
      key: 'username',
      label: 'Colaborador',
      isTitle: true,
      truncate: true,
      maxWidth: '220px',
      render: (_, u) => {
        const initials = (u.username || 'U').slice(0, 2).toUpperCase();
        return (
          <UserCell $bg={u.department_color || '#0A3E60'}>
            <div className="avatar">{initials}</div>
            <div className="details">
              <div className="username">{u.username}</div>
              <div className="email">{u.email || 'Sem e-mail cadastrado'}</div>
            </div>
          </UserCell>
        );
      }
    },
    {
      key: 'department_name',
      label: 'Departamento',
      render: (_, u) => (
        <Badge 
          $bg={`${u.department_color || '#0A3E60'}15`}
          $color={u.department_color || '#0A3E60'}
          $border={`${u.department_color || '#0A3E60'}40`}
        >
          <Building2 size={12} />
          {u.department_name || 'Geral'}
        </Badge>
      )
    },
    {
      key: 'role_name',
      label: 'Cargo / Nível',
      render: (_, u) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
          <RoleBtn onClick={() => openRoleDrawerForUser(u)} title="Ver / Editar matriz de permissões">
            <Eye size={12} />
            {u.role_name || u.legacy_role || 'Administrador'}
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Nível {u.hierarchy_level || 1})</span>
          </RoleBtn>
          {Number(u.has_custom_permissions) === 1 && (
            <Badge $bg="#FEF3C7" $color="#92400E" $border="#FDE68A" style={{ fontSize: '0.68rem', padding: '0.12rem 0.35rem' }}>
              ⚡ Matriz Customizada
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'supervisor_name',
      label: 'Supervisor Direto',
      render: (_, u) => (
        u.supervisor_name ? (
          <Badge $bg="#F1F5F9" $color="#475569">
            <UserCheck size={12} />
            {u.supervisor_name}
          </Badge>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>—</span>
        )
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      isBadge: true,
      render: (isActive) => (
        Number(isActive) === 1 ? (
          <Badge $bg="#DCFCE7" $color="#15803D" $border="#BBF7D0">
            <CheckCircle2 size={12} /> Ativo
          </Badge>
        ) : (
          <Badge $bg="#FEE2E2" $color="#991B1B" $border="#FECACA">
            <XCircle size={12} /> Inativo
          </Badge>
        )
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      isAction: true,
      width: '130px',
      render: (_, u) => {
        const isActive = Number(u.is_active) === 1;
        const secondary = [
          {
            label: 'Editar Cadastro',
            icon: Edit,
            onClick: () => setModalUser(u)
          },
          {
            label: 'Redefinir Senha',
            icon: Key,
            onClick: () => handleResetPassword(u)
          },
          {
            label: isActive ? 'Desativar Usuário' : 'Ativar Usuário',
            icon: Shield,
            warning: isActive,
            onClick: () => handleToggleStatus(u)
          }
        ];

        return (
          <TableRowActionMenu
            primaryAction={{
              label: 'RBAC',
              icon: Shield,
              variant: 'gold',
              onClick: () => openRoleDrawerForUser(u)
            }}
            secondaryActions={secondary}
          />
        );
      }
    }
  ];

  return (
    <AdminLayout activeNav="usuarios">
      <Container>
        <PageHeader>
          <div className="title-area">
            <h1>
              <ShieldCheck size={24} color="#ED7E13" />
              Gestão de Usuários & Roles (RBAC)
            </h1>
            <p>Controle de colaboradores, departamentos, níveis hierárquicos e permissões operacionais.</p>
          </div>
          <PrimaryBtn onClick={() => setModalUser({})}>
            <UserPlus size={16} />
            Novo Colaborador
          </PrimaryBtn>
        </PageHeader>

        {/* Compact KPIs */}
        <CompactKpiGrid items={kpiItems} />

        {/* Barra de Filtros */}
        <ControlBar>
          <FiltersGroup>
            <SearchBox>
              <Search size={15} />
              <input
                type="text"
                placeholder="Buscar por login, e-mail ou cargo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchBox>

            <Select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="">Todos os Departamentos</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>

            <Select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">Todos os Status</option>
              <option value="1">Apenas Ativos</option>
              <option value="0">Apenas Inativos</option>
            </Select>
          </FiltersGroup>

          <IconBtn onClick={fetchData} title="Recarregar lista" aria-label="Recarregar lista">
            <RotateCcw size={16} />
          </IconBtn>
        </ControlBar>

        {/* Tabela Responsiva */}
        <ResponsiveDataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor="id"
          emptyTitle="Nenhum colaborador encontrado"
          emptyMessage="Verifique os filtros selecionados ou cadastre um novo colaborador."
        />

        {/* Modal de Criação / Edição */}
        {modalUser !== null && (
          <UserFormModal
            user={modalUser.id ? modalUser : null}
            departments={departments}
            roles={roles}
            allUsers={users}
            onClose={() => setModalUser(null)}
            onSaved={() => {
              setModalUser(null);
              fetchData();
            }}
          />
        )}

        {/* Drawer de Permissões do Cargo / Usuário */}
        {(drawerRole !== null || drawerUser !== null) && (
          <RolePermissionsDrawer
            role={drawerRole}
            user={drawerUser}
            onClose={() => {
              setDrawerRole(null);
              setDrawerUser(null);
            }}
            onSaved={() => {
              setDrawerRole(null);
              setDrawerUser(null);
              fetchData();
            }}
          />
        )}
      </Container>
    </AdminLayout>
  );
}
