import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Check, 
  Save, 
  UserPlus, 
  Edit3, 
  Loader2 
} from 'lucide-react';
import { api } from '../../services/api';
import ResponsiveModal from '../ui/ResponsiveModal';

const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  input, select {
    padding: 0.75rem 0.9rem;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    font-size: 0.9rem;
    color: #1E293B;
    background: #FFFFFF;
    font-family: inherit;
    min-height: 44px;
    outline: none;
    transition: all 0.15s ease;

    &:focus {
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }
  }

  small {
    font-size: 0.72rem;
    color: #64748B;
  }
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  min-height: 44px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
  border: none;

  ${props => props.$primary ? `
    background: #ED7E13;
    color: #FFFFFF;
    &:hover:not(:disabled) {
      background: #D97706;
    }
  ` : `
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #CBD5E1;
    &:hover:not(:disabled) {
      background: #E2E8F0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

export default function UserFormModal({ user, departments, roles, allUsers, onClose, onSaved }) {
  const isEditing = Boolean(user?.id);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState(user?.department_id || '');
  const [roleId, setRoleId] = useState(user?.role_id || '');
  const [supervisorId, setSupervisorId] = useState(user?.supervisor_id || '');
  const [isActive, setIsActive] = useState(user ? (user.is_active ?? 1) : 1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar roles pelo departamento selecionado se houver
  const filteredRoles = departmentId 
    ? roles.filter(r => String(r.department_id) === String(departmentId))
    : roles;

  // Filtrar possíveis supervisores (exclui o próprio usuário editado)
  const availableSupervisors = allUsers.filter(u => !isEditing || String(u.id) !== String(user.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        username,
        email,
        department_id: departmentId ? Number(departmentId) : null,
        role_id: roleId ? Number(roleId) : null,
        supervisor_id: supervisorId ? Number(supervisorId) : null,
        is_active: Number(isActive)
      };

      if (!isEditing || password.trim() !== '') {
        payload.password = password;
      }

      const data = isEditing
        ? await api.rbac.updateUser(user.id, payload)
        : await api.rbac.createUser(payload);

      if (!data.success) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      onSaved();
    } catch (err) {
      setErrorMsg(err.message || 'Ocorreu um erro ao salvar o usuário');
    } finally {
      setLoading(false);
    }
  };

  const footerContent = (
    <>
      <Button type="button" onClick={onClose} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" form="user-form" $primary disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Salvando...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>{isEditing ? 'Salvar Alterações' : 'Criar Colaborador'}</span>
          </>
        )}
      </Button>
    </>
  );

  return (
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? `Editar Colaborador: ${user.username}` : 'Novo Colaborador / Gestor'}
      subtitle="Gestão de Equipe & Hierarquia RBAC"
      icon={isEditing ? Edit3 : UserPlus}
      size="md"
      footer={footerContent}
    >
      <Form onSubmit={handleSubmit} id="user-form">
        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #F87171', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <TwoCols>
          <FormGroup>
            <label><User size={14} /> Nome de Login / Usuário *</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ex: ana_comercial"
            />
          </FormGroup>

          <FormGroup>
            <label><Mail size={14} /> E-mail Institucional</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ex: ana@bodyharmony.com.br"
            />
          </FormGroup>
        </TwoCols>

        <FormGroup>
          <label><Lock size={14} /> {isEditing ? 'Alterar Senha (opcional)' : 'Senha de Acesso *'}</label>
          <input
            type="password"
            required={!isEditing}
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
          />
          {isEditing && <small>Preencha apenas caso deseje redefinir a senha deste colaborador.</small>}
        </FormGroup>

        <TwoCols>
          <FormGroup>
            <label><Building2 size={14} /> Departamento / Setor</label>
            <select
              value={departmentId}
              onChange={e => {
                setDepartmentId(e.target.value);
                setRoleId(''); // Reset role ao mudar setor
              }}
            >
              <option value="">Selecione o Setor...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label><Briefcase size={14} /> Cargo / Role RBAC</label>
            <select
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
            >
              <option value="">Selecione o Cargo...</option>
              {filteredRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (Nível {r.hierarchy_level})
                </option>
              ))}
            </select>
          </FormGroup>
        </TwoCols>

        <TwoCols>
          <FormGroup>
            <label><ShieldCheck size={14} /> Supervisor Direto</label>
            <select
              value={supervisorId}
              onChange={e => setSupervisorId(e.target.value)}
            >
              <option value="">Sem supervisor (Diretoria)</option>
              {availableSupervisors.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username} {u.role_name ? `(${u.role_name})` : ''}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Status da Conta</label>
            <select
              value={isActive}
              onChange={e => setIsActive(Number(e.target.value))}
            >
              <option value={1}>Ativo (Acesso Liberado)</option>
              <option value={0}>Inativo (Acesso Bloqueado)</option>
            </select>
          </FormGroup>
        </TwoCols>
      </Form>
    </ResponsiveModal>
  );
}
