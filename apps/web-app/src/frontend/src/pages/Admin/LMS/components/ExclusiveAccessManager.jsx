import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  UserPlus, GraduationCap, UserCheck, Trash2, Calendar, Lock, Loader2, Sparkles 
} from 'lucide-react';
import LMSService from '../../../../services/LMSService';
import ResponsiveDataTable from '../../../../components/ui/ResponsiveDataTable';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: #0A3E60;
  margin-top: 0;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1.5px solid #F1F5F9;
  padding-bottom: 0.65rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  select, input {
    height: 42px;
    padding: 0 0.85rem;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.88rem;
    background: #F8FAFC;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #ED7E13;
      background: white;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.1);
    }
  }
`;

const PrimaryButton = styled.button`
  background: #ED7E13;
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  height: 42px;
  padding: 0 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #FF8F26;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RevokeButton = styled.button`
  background: none;
  border: 1px solid #FCA5A5;
  color: #EF4444;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  font-size: 0.75rem;
  min-height: 34px;
  transition: all 0.15s ease;

  &:hover {
    background: #FEF2F2;
    border-color: #EF4444;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 0.35rem;
  background: #F1F5F9;
  padding: 0.25rem;
  border-radius: 8px;
  width: fit-content;
  margin-bottom: 1rem;
`;

const ToggleButton = styled.button`
  background: ${props => (props.$active ? 'white' : 'none')};
  color: ${props => (props.$active ? '#0A3E60' : '#64748B')};
  border: none;
  font-weight: ${props => (props.$active ? '700' : '600')};
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: ${props => (props.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none')};
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  min-height: 36px;
`;

const Badge = styled.span`
  background: ${props => (props.$warning ? '#FEF3C7' : '#DCFCE7')};
  color: ${props => (props.$warning ? '#D97706' : '#15803D')};
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`;

const ExclusiveAccessManager = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [targetTab, setTargetTab] = useState('licenciada');
  
  const [alunas, setAlunas] = useState([]);
  const [licenciadas, setLicenciadas] = useState([]);
  const [modules, setModules] = useState([]);
  const [accessList, setAccessList] = useState({ alunas: [], licenciadas: [] });

  const [formType, setFormType] = useState('licenciada');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const targetsData = await LMSService.getExclusiveAccessTargets();
      setAlunas(targetsData.alunas || []);
      setLicenciadas(targetsData.licenciadas || []);
      setModules(targetsData.modules || []);

      const listData = await LMSService.getExclusiveAccessList();
      setAccessList(listData || { alunas: [], licenciadas: [] });
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dados de acesso exclusivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!formType || !selectedTargetId || !selectedModuleId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setSubmitting(true);
    try {
      await LMSService.grantExclusiveAccess({
        type: formType,
        target_id: parseInt(selectedTargetId),
        module_id: parseInt(selectedModuleId),
        expires_at: expiresAt ? expiresAt + 'T23:59:59' : null
      });
      alert('Acesso concedido com sucesso!');
      
      setSelectedTargetId('');
      setSelectedModuleId('');
      setExpiresAt('');
      
      const listData = await LMSService.getExclusiveAccessList();
      setAccessList(listData || { alunas: [], licenciadas: [] });
    } catch (error) {
      console.error(error);
      alert('Erro ao conceder acesso: ' + (error.message || 'Erro interno'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (type, targetId, moduleId) => {
    if (!confirm('Deseja realmente revogar o acesso exclusivo para este usuário?')) {
      return;
    }

    try {
      await LMSService.revokeExclusiveAccess({
        type,
        target_id: targetId,
        module_id: moduleId
      });
      alert('Acesso revogado com sucesso!');
      
      const listData = await LMSService.getExclusiveAccessList();
      setAccessList(listData || { alunas: [], licenciadas: [] });
    } catch (error) {
      console.error(error);
      alert('Erro ao revogar acesso.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Vitalício';
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  };

  const currentTargets = formType === 'aluna' ? alunas : licenciadas;

  const currentData = targetTab === 'licenciada' 
    ? (accessList.licenciadas || []) 
    : (accessList.alunas || []);

  const columns = [
    {
      key: targetTab === 'licenciada' ? 'licenciada_name' : 'aluna_name',
      label: 'Nome da Profissional',
      isTitle: true,
      truncate: true,
      maxWidth: '220px',
      render: (name) => <strong style={{ color: '#0A3E60' }}>{name}</strong>
    },
    {
      key: targetTab === 'licenciada' ? 'licenciada_cpf' : 'aluna_cpf',
      label: 'Documento / CPF',
      render: (cpf) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>{cpf || '—'}</span>
    },
    {
      key: 'module_title',
      label: 'Módulo Exclusivo',
      truncate: true,
      maxWidth: '220px',
      render: (title) => <span style={{ fontWeight: 600, color: '#0A3E60' }}>{title}</span>
    },
    {
      key: 'granted_at',
      label: 'Concessão',
      render: (date) => formatDate(date)
    },
    {
      key: 'expires_at',
      label: 'Validade / Status',
      isBadge: true,
      render: (date) => (
        date ? <Badge $warning>{formatDate(date)}</Badge> : <Badge>Vitalício</Badge>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      isAction: true,
      render: (_, row) => {
        const targetId = targetTab === 'licenciada' ? row.licenciada_id : row.aluna_id;
        return (
          <RevokeButton onClick={() => handleRevoke(targetTab, targetId, row.module_id)}>
            <Trash2 size={13} /> Revogar
          </RevokeButton>
        );
      }
    }
  ];

  return (
    <PanelContainer>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem auto', color: '#0A3E60' }} />
          <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Carregando dados de acesso...</p>
        </div>
      ) : (
        <>
          <SectionCard>
            <SectionTitle><UserPlus size={18} color="#ED7E13" /> Conceder Novo Acesso</SectionTitle>
            <form onSubmit={handleGrant}>
              <FormGrid>
                <FormGroup>
                  <label>Tipo de Usuária</label>
                  <select 
                    value={formType} 
                    onChange={e => {
                      setFormType(e.target.value);
                      setSelectedTargetId('');
                    }}
                  >
                    <option value="licenciada">Licenciada</option>
                    <option value="aluna">Aluna Individual</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Selecionar Usuária</label>
                  <select 
                    value={selectedTargetId} 
                    onChange={e => setSelectedTargetId(e.target.value)}
                    required
                  >
                    <option value="">-- Escolha --</option>
                    {currentTargets.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (CPF: {t.cpf || 'não informado'})</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Selecionar Módulo Exclusivo</label>
                  <select 
                    value={selectedModuleId} 
                    onChange={e => setSelectedModuleId(e.target.value)}
                    required
                  >
                    <option value="">-- Escolha --</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Expiração (Opcional)</label>
                  <input 
                    type="date" 
                    value={expiresAt} 
                    onChange={e => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormGroup>

                <PrimaryButton type="submit" disabled={submitting}>
                  <UserCheck size={16} /> {submitting ? 'PROCESSANDO...' : 'CONCEDER ACESSO'}
                </PrimaryButton>
              </FormGrid>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionTitle><Lock size={18} color="#0A3E60" /> Acessos Ativos</SectionTitle>
            
            <ToggleContainer>
              <ToggleButton 
                $active={targetTab === 'licenciada'} 
                onClick={() => setTargetTab('licenciada')}
                type="button"
              >
                <GraduationCap size={15} /> Licenciadas ({accessList.licenciadas?.length || 0})
              </ToggleButton>
              <ToggleButton 
                $active={targetTab === 'aluna'} 
                onClick={() => setTargetTab('aluna')}
                type="button"
              >
                <UserCheck size={15} /> Alunas ({accessList.alunas?.length || 0})
              </ToggleButton>
            </ToggleContainer>

            <ResponsiveDataTable
              columns={columns}
              data={currentData}
              keyExtractor="id"
              emptyTitle={`Nenhum acesso para ${targetTab === 'licenciada' ? 'Licenciadas' : 'Alunas'}`}
              emptyMessage="Utilize o formulário acima para conceder acesso exclusivo aos módulos do LMS."
            />
          </SectionCard>
        </>
      )}
    </PanelContainer>
  );
};

export default ExclusiveAccessManager;
