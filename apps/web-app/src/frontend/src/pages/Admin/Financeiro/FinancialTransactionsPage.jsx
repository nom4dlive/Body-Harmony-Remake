import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  List, Plus, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, Calendar
} from 'lucide-react';
import { financialApi } from '../../../services/api';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 1rem 1.25rem;
  max-width: 1400px;
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

const FiltersBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const FilterInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  background: #FFFFFF;
  min-width: 130px;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const Table = styled.div`
  background: #FFFFFF;
  border-radius: 0.6rem;
  border: 1px solid #E2E8F0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 0.65rem 1rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #F1F5F9;
  align-items: center;
  font-size: 0.78rem;
  transition: background 0.1s ease;

  &:hover {
    background: #F8FAFC;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.3rem;
    padding: 0.85rem;
  }
`;

const CellDesc = styled.div`
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellAmount = styled.div`
  font-weight: 700;
  color: ${({ $positive }) => $positive ? '#28a745' : '#dc3545'};
`;

const CellBadge = styled.span`
  display: inline-flex;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $status }) => {
    if ($status === 'confirmed') return 'rgba(40, 167, 69, 0.1)';
    if ($status === 'pending') return 'rgba(237, 126, 19, 0.1)';
    return 'rgba(220, 53, 69, 0.1)';
  }};
  color: ${({ $status }) => {
    if ($status === 'confirmed') return '#28a745';
    if ($status === 'pending') return '#ED7E13';
    return '#dc3545';
  }};
`;

const CellDate = styled.div`
  color: #94A3B8;
  font-size: 0.72rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-top: 1px solid #F1F5F9;
`;

const PageBtn = styled.button`
  background: none;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  color: ${({ $disabled }) => $disabled ? '#CBD5E1' : '#64748B'};
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  &:hover:not(:disabled) {
    background: #F1F5F9;
    color: #0A3E60;
  }
`;

const PageInfo = styled.div`
  font-size: 0.72rem;
  color: #94A3B8;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0A3E60;
  margin: 0;
`;

const ModalBody = styled.div`
  padding: 1.25rem;
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
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  background: #FFFFFF;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

  &:hover {
    background: #083450;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #94A3B8;
  font-size: 0.9rem;
  gap: 0.5rem;
`;

const FinancialTransactionsPage = () => {
  const [data, setData] = useState({ transactions: [], pagination: { total: 0, page: 1, per_page: 20, total_pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', search: '', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'revenue', amount_cents: '', description: '', category: '', tax_tag: 'nao_definido', payment_method: 'manual', status: 'confirmed' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await financialApi.getTransactions(filters);
      setData(result?.data || result);
    } catch (err) {
      console.error('[FinancialTransactionsPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleCreate = async () => {
    if (!form.amount_cents || !form.description) {
      alert('Valor e descricao sao obrigatorios.');
      return;
    }
    try {
      await financialApi.createTransaction({
        ...form,
        amount_cents: Math.round(parseFloat(form.amount_cents) * 100),
        source_type: 'manual'
      });
      setShowModal(false);
      setForm({ type: 'revenue', amount_cents: '', description: '', category: '', tax_tag: 'nao_definido', payment_method: 'manual', status: 'confirmed' });
      await fetchData();
    } catch (err) {
      console.error('[FinancialTransactionsPage] Create error:', err);
      alert('Erro ao criar transacao: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const { transactions, pagination } = data;

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title><List size={22} /> Transacoes Financeiras</Title>
          <SaveBtn onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Nova Transacao
          </SaveBtn>
        </PageHeader>

        <FiltersBar>
          <FilterInput placeholder="Buscar..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          <FilterSelect value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmado</option>
            <option value="pending">Pendente</option>
            <option value="refunded">Estornado</option>
            <option value="cancelled">Cancelado</option>
          </FilterSelect>
          <FilterSelect value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
            <option value="">Todos os tipos</option>
            <option value="revenue">Receita</option>
            <option value="expense">Despesa</option>
            <option value="refund">Estorno</option>
            <option value="chargeback">Chargeback</option>
          </FilterSelect>
        </FiltersBar>

        <Table>
          <TableHeader>
            <div>Descricao</div>
            <div>Valor</div>
            <div>Tipo</div>
            <div>Status</div>
            <div>Metodo</div>
            <div>Data</div>
          </TableHeader>
          {loading ? (
            <LoadingState><RefreshCw size={16} className="spin" /> Carregando...</LoadingState>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              Nenhuma transacao encontrada.
            </div>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <CellDesc>{tx.description || tx.category || 'Transacao #' + tx.id}</CellDesc>
                <CellAmount $positive={tx.type === 'revenue'}>
                  {tx.type === 'revenue' ? '+' : '-'}{tx.amount_formatted}
                </CellAmount>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'capitalize' }}>{tx.type}</div>
                <div><CellBadge $status={tx.status}>{tx.status}</CellBadge></div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'capitalize' }}>{tx.payment_method || '-'}</div>
                <CellDate>{new Date(tx.created_at).toLocaleDateString('pt-BR')}</CellDate>
              </TableRow>
            ))
          )}
          {!loading && transactions.length > 0 && (
            <Pagination>
              <PageInfo>Pagina {pagination.page} de {pagination.total_pages} ({pagination.total} registros)</PageInfo>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <PageBtn $disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={pagination.page <= 1}>
                  <ChevronLeft size={14} /> Anterior
                </PageBtn>
                <PageBtn $disabled={pagination.page >= pagination.total_pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={pagination.page >= pagination.total_pages}>
                  Proximo <ChevronRight size={14} />
                </PageBtn>
              </div>
            </Pagination>
          )}
        </Table>

        {showModal && (
          <Modal onClick={() => setShowModal(false)}>
            <ModalCard onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Nova Transacao</ModalTitle>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.2rem' }}>x</button>
              </ModalHeader>
              <ModalBody>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <FormGroup>
                    <Label>Tipo *</Label>
                    <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="revenue">Receita</option>
                      <option value="expense">Despesa</option>
                      <option value="refund">Estorno</option>
                      <option value="chargeback">Chargeback</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" placeholder="0,00" value={form.amount_cents} onChange={e => setForm({ ...form, amount_cents: e.target.value })} />
                  </FormGroup>
                </div>
                <FormGroup>
                  <Label>Descricao *</Label>
                  <Input placeholder="Descricao da transacao" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </FormGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <FormGroup>
                    <Label>Categoria</Label>
                    <Input placeholder="Ex: marketing, aluguel" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Metodo de Pagamento</Label>
                    <Select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                      <option value="manual">Manual</option>
                      <option value="card">Cartao</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="transfer">Transferencia</option>
                    </Select>
                  </FormGroup>
                </div>
                <FormGroup>
                  <Label>Tag Tributaria</Label>
                  <Select value={form.tax_tag} onChange={e => setForm({ ...form, tax_tag: e.target.value })}>
                    <option value="nao_definido">Nao definido</option>
                    <option value="estetica_cosmetica">Estetica / Cosmetica</option>
                    <option value="servicos_medicos_educacionais">Servicos Medicos / Educacionais</option>
                  </Select>
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <CancelBtn onClick={() => setShowModal(false)}>Cancelar</CancelBtn>
                <SaveBtn onClick={handleCreate}>Registrar Transacao</SaveBtn>
              </ModalFooter>
            </ModalCard>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

export default FinancialTransactionsPage;
