import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FolderTree, Plus, Edit3, Trash2, Save, X, Tag, ChevronDown,
  ChevronRight, DollarSign, RefreshCw, AlertCircle
} from 'lucide-react';
import { financialApi } from '../../../services/api';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 1rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddBtn = styled.button`
  padding: 0.55rem 1.15rem;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  background: #ED7E13;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;

  &:hover {
    background: #D56F0F;
    transform: translateY(-1px);
  }
`;

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  margin-bottom: 0.85rem;
`;

const CenterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: #F8FAFC;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CenterIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(10, 62, 96, 0.08);
  color: #0A3E60;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CenterInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CenterName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #1E293B;
`;

const CenterTag = styled.div`
  font-size: 0.68rem;
  color: #94A3B8;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const CenterStats = styled.div`
  text-align: right;
`;

const CenterTotal = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #dc3545;
`;

const CenterCount = styled.div`
  font-size: 0.65rem;
  color: #94A3B8;
`;

const CenterActions = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 0.35rem;
  cursor: pointer;
  color: #64748B;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $danger }) => $danger ? 'rgba(220, 53, 69, 0.08)' : '#F1F5F9'};
    color: ${({ $danger }) => $danger ? '#dc3545' : '#0A3E60'};
    border-color: ${({ $danger }) => $danger ? '#dc3545' : '#0A3E60'};
  }
`;

const FormCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`;

const FormTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 700;
  color: #0A3E60;
  margin: 0 0 1rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 0.85rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.08);
  }

  &::placeholder {
    color: #CBD5E1;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.08);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #FFFFFF;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: #F8FAFC;
  }
`;

const SaveBtn = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #0A3E60;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: #083450;
  }
`;

const ExpensesPanel = styled.div`
  background: #F8FAFC;
  border-radius: 0 0 0.6rem 0.6rem;
  border-top: 1px solid #F1F5F9;
  padding: 0.85rem 1.15rem;
`;

const ExpenseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #E2E8F0;

  &:last-child {
    border-bottom: none;
  }
`;

const ExpenseDesc = styled.div`
  flex: 1;
  font-size: 0.78rem;
  color: #1E293B;
`;

const ExpenseDate = styled.div`
  font-size: 0.68rem;
  color: #94A3B8;
`;

const ExpenseAmount = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  color: #dc3545;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94A3B8;
  font-size: 0.9rem;
  gap: 0.5rem;
`;

const CostCentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expenses, setExpenses] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState(null);
  const [form, setForm] = useState({ name: '', tag: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount_cents: '', category: '', expense_date: new Date().toISOString().split('T')[0] });
  const [showExpenseFormFor, setShowExpenseFormFor] = useState(null);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const result = await financialApi.getCostCenters();
      setCenters(result?.data || result || []);
    } catch (err) {
      console.error('[CostCentersPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.tag.trim()) {
      alert('Nome e tag sao obrigatorios.');
      return;
    }
    try {
      if (editingId) {
        await financialApi.updateCostCenter(editingId, form);
      } else {
        await financialApi.createCostCenter(form);
      }
      setForm({ name: '', tag: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      await fetchCenters();
    } catch (err) {
      console.error('[CostCentersPage] Save error:', err);
      alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deseja excluir o centro de custo "${name}"?`)) return;
    try {
      await financialApi.deleteCostCenter(id);
      await fetchCenters();
    } catch (err) {
      console.error('[CostCentersPage] Delete error:', err);
      alert('Erro ao excluir: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (center) => {
    setForm({ name: center.name, tag: center.tag, description: center.description || '' });
    setEditingId(center.id);
    setShowForm(true);
  };

  const handleExpand = async (center) => {
    if (expandedId === center.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(center.id);
    if (!expenses[center.id]) {
      try {
        setLoadingExpenses(center.id);
        const result = await financialApi.getCostCenterExpenses(center.id);
        setExpenses(prev => ({ ...prev, [center.id]: result?.data || result }));
      } catch (err) {
        console.error('[CostCentersPage] Load expenses error:', err);
      } finally {
        setLoadingExpenses(null);
      }
    }
  };

  const handleSaveExpense = async (centerId) => {
    if (!expenseForm.description.trim() || !expenseForm.amount_cents) {
      alert('Descricao e valor sao obrigatorios.');
      return;
    }
    try {
      await financialApi.createExpense({
        cost_center_id: centerId,
        description: expenseForm.description,
        amount_cents: Math.round(parseFloat(expenseForm.amount_cents) * 100),
        category: expenseForm.category || null,
        expense_date: expenseForm.expense_date
      });
      setExpenseForm({ description: '', amount_cents: '', category: '', expense_date: new Date().toISOString().split('T')[0] });
      setShowExpenseFormFor(null);
      const result = await financialApi.getCostCenterExpenses(centerId);
      setExpenses(prev => ({ ...prev, [centerId]: result?.data || result }));
      await fetchCenters();
    } catch (err) {
      console.error('[CostCentersPage] Save expense error:', err);
      alert('Erro ao salvar despesa: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const formatCurrency = (cents) => 'R$ ' + ((cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState><RefreshCw size={16} className="spin" /> Carregando centros de custo...</LoadingState>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title><FolderTree size={22} /> Centros de Custo</Title>
          <AddBtn onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', tag: '', description: '' }); }}>
            <Plus size={16} /> Novo Centro
          </AddBtn>
        </PageHeader>

        {showForm && (
          <FormCard>
            <FormTitle>{editingId ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</FormTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input placeholder="Ex: Imersao Turma 04" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label>Tag *</Label>
                <Input placeholder="Ex: imersao-t04" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup>
              <Label>Descricao</Label>
              <TextArea placeholder="Descricao opcional do centro de custo..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </FormGroup>
            <FormActions>
              <CancelBtn onClick={() => { setShowForm(false); setEditingId(null); }}><X size={14} /> Cancelar</CancelBtn>
              <SaveBtn onClick={handleSave}><Save size={14} /> {editingId ? 'Atualizar' : 'Criar'}</SaveBtn>
            </FormActions>
          </FormCard>
        )}

        <Card>
          {centers.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              Nenhum centro de custo cadastrado. Crie o primeiro clicando em "Novo Centro".
            </div>
          )}
          {centers.map((center) => (
            <React.Fragment key={center.id}>
              <CenterItem onClick={() => handleExpand(center)}>
                <CenterIcon>
                  {expandedId === center.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </CenterIcon>
                <CenterInfo>
                  <CenterName>{center.name}</CenterName>
                  <CenterTag><Tag size={10} /> {center.tag}</CenterTag>
                </CenterInfo>
                <CenterStats>
                  <CenterTotal>{center.total_expenses_formatted}</CenterTotal>
                  <CenterCount>{center.expenses_count} despesas</CenterCount>
                </CenterStats>
                <CenterActions onClick={e => e.stopPropagation()}>
                  <ActionBtn onClick={() => handleEdit(center)} title="Editar"><Edit3 size={14} /></ActionBtn>
                  <ActionBtn $danger onClick={() => handleDelete(center.id, center.name)} title="Excluir"><Trash2 size={14} /></ActionBtn>
                </CenterActions>
              </CenterItem>
              {expandedId === center.id && (
                <ExpensesPanel>
                  {loadingExpenses === center.id ? (
                    <div style={{ textAlign: 'center', color: '#94A3B8', padding: '0.5rem', fontSize: '0.78rem' }}>Carregando despesas...</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Despesas</span>
                        <button
                          style={{ background: '#ED7E13', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          onClick={() => setShowExpenseFormFor(showExpenseFormFor === center.id ? null : center.id)}
                        >
                          <Plus size={12} /> Adicionar
                        </button>
                      </div>
                      {showExpenseFormFor === center.id && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <Input placeholder="Descricao" style={{ flex: 2, minWidth: 120 }} value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                          <Input placeholder="Valor (R$)" type="number" step="0.01" style={{ flex: 1, minWidth: 80 }} value={expenseForm.amount_cents} onChange={e => setExpenseForm({ ...expenseForm, amount_cents: e.target.value })} />
                          <Input type="date" style={{ flex: 1, minWidth: 100 }} value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
                          <SaveBtn onClick={() => handleSaveExpense(center.id)} style={{ padding: '0.4rem 0.7rem' }}><Save size={12} /></SaveBtn>
                        </div>
                      )}
                      {expenses[center.id]?.expenses?.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94A3B8', padding: '0.5rem', fontSize: '0.72rem' }}>Nenhuma despesa registrada.</div>
                      )}
                      {expenses[center.id]?.expenses?.map((exp) => (
                        <ExpenseItem key={exp.id}>
                          <ExpenseDesc>{exp.description}</ExpenseDesc>
                          <ExpenseDate>{new Date(exp.expense_date).toLocaleDateString('pt-BR')}</ExpenseDate>
                          <ExpenseAmount>{exp.amount_formatted}</ExpenseAmount>
                        </ExpenseItem>
                      ))}
                    </>
                  )}
                </ExpensesPanel>
              )}
            </React.Fragment>
          ))}
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default CostCentersPage;
