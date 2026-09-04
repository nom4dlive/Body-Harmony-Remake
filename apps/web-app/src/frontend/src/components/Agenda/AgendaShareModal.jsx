import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { gestorAgendaApi } from '../../services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 62, 96, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  background: #0A3E60;
  color: #FFFFFF;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
  color: #0A3E60;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShareForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F8FAFC;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(10, 62, 96, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }
`;

const Select = styled.select`
  min-height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #0F172A;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ED7E13;
  }
`;

const SubmitButton = styled.button`
  min-height: 44px;
  background: #ED7E13;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;

  &:hover {
    background: #D96F0E;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShareItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  background: #FFFFFF;
  border: 1px solid rgba(10, 62, 96, 0.12);

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .name {
      font-weight: 700;
      color: #0A3E60;
      font-size: 14px;
    }

    .level {
      font-size: 12px;
      color: #64748B;
    }
  }
`;

const RevokeButton = styled.button`
  background: #EF4444;
  color: #FFFFFF;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  min-height: 36px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #94A3B8;
  text-align: center;
  padding: 16px;
`;

export default function AgendaShareModal({
  isOpen,
  onClose,
  users = [],
  currentUserId
}) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('read_only');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchShares = async () => {
    try {
      setLoading(true);
      const data = await gestorAgendaApi.getAgendaShares();
      if (data && data.success) {
        setShares(data.shares || []);
      }
    } catch (e) {
      console.error('Erro ao buscar compartilhamentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShares();
      setMessage('');
    }
  }, [isOpen]);

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      setMessage('');
      const data = await gestorAgendaApi.shareAgenda({
        shared_with_admin_id: parseInt(selectedUser, 10),
        permission_level: permissionLevel
      });
      if (data && data.success) {
        setMessage('✅ Agenda compartilhada com sucesso!');
        setSelectedUser('');
        fetchShares();
      } else {
        setMessage(`❌ ${data?.error || data?.message || 'Erro ao compartilhar'}`);
      }
    } catch (e) {
      setMessage(`❌ ${e.message || 'Erro de conexão ao compartilhar'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (targetAdminId) => {
    if (!window.confirm('Deseja realmente revogar o acesso deste usuário à sua agenda?')) return;

    try {
      const data = await gestorAgendaApi.revokeAgendaShare(targetAdminId);
      if (data && data.success) {
        fetchShares();
      }
    } catch (e) {
      console.error('Erro ao revogar compartilhamento:', e);
    }
  };

  if (!isOpen) return null;

  const eligibleUsers = users.filter(u => u.id !== currentUserId);

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3><span>🤝</span> Compartilhamento de Agenda</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          <div>
            <SectionTitle>Conceder Acesso a um Colega / Assistente</SectionTitle>
            <ShareForm onSubmit={handleShareSubmit}>
              <FormGroup>
                <label>Selecionar Operador:</label>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Escolha um usuário...</option>
                  {eligibleUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} {u.department_name ? `• ${u.department_name}` : ''}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <label>Nível de Acesso:</label>
                <Select
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value)}
                >
                  <option value="read_only">👁️ Apenas Leitura (Visualizar compromissos)</option>
                  <option value="can_edit">✍️ Edição Total (Criar e alterar em meu nome)</option>
                </Select>
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting || !selectedUser}>
                {submitting ? 'Salvando...' : 'Conceder Acesso'}
              </SubmitButton>

              {message && <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{message}</div>}
            </ShareForm>
          </div>

          <div>
            <SectionTitle>Acessos Concedidos Ativos</SectionTitle>
            {loading ? (
              <EmptyText>Carregando compartilhamentos...</EmptyText>
            ) : shares.length === 0 ? (
              <EmptyText>Nenhum compartilhamento ativo no momento.</EmptyText>
            ) : (
              <SharesList>
                {shares.map(s => (
                  <ShareItem key={s.id}>
                    <div className="info">
                      <span className="name">{s.shared_with_username}</span>
                      <span className="level">
                        {s.permission_level === 'can_edit' ? '✍️ Pode Editar e Criar' : '👁️ Apenas Visualização'}
                      </span>
                    </div>
                    <RevokeButton onClick={() => handleRevoke(s.shared_with_admin_id)}>
                      Revogar
                    </RevokeButton>
                  </ShareItem>
                ))}
              </SharesList>
            )}
          </div>
        </ModalBody>
      </ModalCard>
    </Overlay>
  );
}
