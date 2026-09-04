import React from 'react';
import styled from 'styled-components';

const ScopeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  background: rgba(10, 62, 96, 0.05);
  border: 1px solid rgba(10, 62, 96, 0.12);
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }
`;

const ScopeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  white-space: nowrap;

  background: ${props => props.$active ? '#0A3E60' : 'transparent'};
  color: ${props => props.$active ? '#FFFFFF' : '#0A3E60'};
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(10, 62, 96, 0.25)' : 'none'};

  &:hover {
    background: ${props => props.$active ? '#0A3E60' : 'rgba(10, 62, 96, 0.08)'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SelectWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const UserSelect = styled.select`
  min-height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(10, 62, 96, 0.2);
  background: #FFFFFF;
  color: #0A3E60;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 2px rgba(237, 126, 19, 0.15);
  }
`;

const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 8px 14px;
  background: rgba(237, 126, 19, 0.1);
  color: #ED7E13;
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ED7E13;
    color: #FFFFFF;
  }
`;

export default function AgendaScopeSelector({
  currentScope,
  onScopeChange,
  users = [],
  selectedUserId,
  onUserSelect,
  departments = [],
  selectedDepartmentId,
  onDepartmentSelect,
  onOpenShareModal
}) {
  return (
    <ScopeContainer>
      <ScopeButton
        type="button"
        $active={currentScope === 'mine'}
        onClick={() => onScopeChange('mine')}
      >
        <span>👤</span> Minha Agenda
      </ScopeButton>

      <ScopeButton
        type="button"
        $active={currentScope === 'all' || currentScope === 'team'}
        onClick={() => onScopeChange('all')}
      >
        <span>👥</span> Toda a Equipe
      </ScopeButton>

      {departments.length > 0 && (
        <ScopeButton
          type="button"
          $active={currentScope === 'department'}
          onClick={() => onScopeChange('department')}
        >
          <span>🏢</span> Por Setor
        </ScopeButton>
      )}

      {currentScope === 'department' && (
        <UserSelect
          value={selectedDepartmentId || ''}
          onChange={(e) => onDepartmentSelect(e.target.value)}
        >
          <option value="">Selecione um Departamento...</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.members_count || 0})</option>
          ))}
        </UserSelect>
      )}

      <SelectWrapper>
        {users.length > 0 && (
          <UserSelect
            value={selectedUserId || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                onUserSelect(val);
                onScopeChange('user');
              } else {
                onScopeChange('mine');
              }
            }}
          >
            <option value="">Filtrar por Operador...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username} {u.role_name ? `(${u.role_name})` : ''}
              </option>
            ))}
          </UserSelect>
        )}

        {onOpenShareModal && (
          <ShareButton type="button" onClick={onOpenShareModal}>
            <span>🤝</span> Compartilhar Agenda
          </ShareButton>
        )}
      </SelectWrapper>
    </ScopeContainer>
  );
}
