import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, X, Save,
  FileText, CreditCard, Smartphone, AlertTriangle, CheckCircle,
  DollarSign, TrendingUp, Users, Clock, Landmark
} from 'lucide-react';
import { licenseTaxesApi } from '../../../services/api';
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

const ActionBtn = styled.button`
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ $variant }) => $variant === 'gold' ? '#ED7E13' : '#0A3E60'};
  color: #FFFFFF;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const KpiCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.55rem;
  padding: 0.9rem 1rem;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $color }) => $color || '#0A3E60'};
  }
`;

const KpiIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg || 'rgba(10, 62, 96, 0.08)'};
  color: ${({ $color }) => $color || '#0A3E60'};
  flex-shrink: 0;
`;

const KpiText = styled.div`
  display: flex;
  flex-direction: column;
`;

const KpiValue = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  color: #1E293B;
  line-height: 1.15;
`;

const KpiLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-top: 2px;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  flex: 1;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const FilterPill = styled.button`
  padding: 0.4rem 0.85rem;
  border: 1px solid ${({ $active }) => $active ? '#0A3E60' : '#E2E8F0'};
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  font-family: 'Montserrat', sans-serif;
  background: ${({ $active }) => $active ? '#0A3E60' : '#FFFFFF'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#64748B'};
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
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
  grid-template-columns: 2.2fr 1.2fr 1fr 0.8fr 1fr 0.7fr;
  padding: 0.6rem 1rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.65rem;
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
  grid-template-columns: 2.2fr 1.2fr 1fr 0.8fr 1fr 0.7fr;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #F1F5F9;
  align-items: center;
  font-size: 0.78rem;
  color: #334155;
  transition: background 0.1s ease;
  min-height: 48px;

  &:hover {
    background: #F8FAFC;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    padding: 0.75rem;
    position: relative;
  }
`;

const LicenciadaCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0A3E60;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LicenciadaInfo = styled.div`
  min-width: 0;
`;

const LicenciadaName = styled.span`
  font-weight: 600;
  color: #1E293B;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LicenciadaLocation = styled.span`
  font-size: 0.65rem;
  color: #94A3B8;
`;

const ValueCell = styled.span`
  font-weight: 700;
  color: #0A3E60;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${({ $bg }) => $bg || '#F1F5F9'};
  color: ${({ $color }) => $color || '#64748B'};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.3rem;

  @media (max-width: 768px) {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }
`;

const ActionIcon = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${({ $bg }) => $bg || '#F1F5F9'};
  color: ${({ $color }) => $color || '#64748B'};
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PageInfo = styled.span`
  font-size: 0.72rem;
  color: #64748B;
`;

const PageBtns = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const PageBtn = styled.button`
  padding: 0.4rem 0.7rem;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 0.72rem;
  background: #FFFFFF;
  color: #334155;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;

  &:hover {
    border-color: #0A3E60;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: #FFFFFF;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #0A3E60;
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #F1F5F9;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &:hover {
    background: #E2E8F0;
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const FormLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const FormInput = styled.input`
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const FormSelect = styled.select`
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  background: #FFFFFF;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.55rem 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  min-height: 60px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0A3E60;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #E2E8F0;
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #94A3B8;
  font-size: 0.85rem;
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.78rem;
  background: ${({ $bg }) => $bg || '#FFF7ED'};
  color: ${({ $color }) => $color || '#9A3412'};
  border: 1px solid ${({ $border }) => $border || '#FDBA74'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94A3B8;
  font-size: 0.85rem;
  gap: 0.5rem;
`;

const STATUSES = {
  pending_payment: { label: 'Pendente', bg: '#FEF3C7', color: '#92400E', icon: Clock },
  paid: { label: 'Pago', bg: '#D1FAE5', color: '#065F46', icon: DollarSign },
  contract_signed: { label: 'Contrato Assinado', bg: '#DBEAFE', color: '#1E40AF', icon: FileText },
  cancelled: { label: 'Cancelado', bg: '#FEE2E2', color: '#991B1B', icon: X }
};

const METHODS = {
  pix: { label: 'PIX', bg: '#D1FAE5', color: '#065F46', icon: Smartphone },
  card: { label: 'Cartão', bg: '#EDE9FE', color: '#6D28D9', icon: CreditCard },
  transfer: { label: 'Transferência', bg: '#DBEAFE', color: '#1E40AF', icon: Landmark },
  manual: { label: 'Manual', bg: '#F1F5F9', color: '#475569', icon: Edit2 }
};

export default function LicenseTaxesPage() {
  const [data, setData] = useState({ data: [], pagination: {}, summary: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    licenciada_name: '', licenciada_cpf: '', licenciada_cnpj: '',
    licenciada_location: '', valor_cents: '', valor_extenso: '',
    payment_method: 'pix', payment_condition: '', installments: 1,
    status: 'pending_payment', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = { page, per_page: 20 };
      if (search) filters.search = search;
      if (filterStatus) filters.status = filterStatus;
      if (filterMethod) filters.method = filterMethod;
      const result = await licenseTaxesApi.list(filters);
      setData(result.data || result);
    } catch (err) {
      console.error('Erro ao carregar taxas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [page, filterStatus, filterMethod, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const resetForm = () => {
    setFormData({
      licenciada_name: '', licenciada_cpf: '', licenciada_cnpj: '',
      licenciada_location: '', valor_cents: '', valor_extenso: '',
      payment_method: 'pix', payment_condition: '', installments: 1,
      status: 'pending_payment', notes: ''
    });
    setEditMode(false);
    setSelectedTax(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEdit = (tax) => {
    setFormData({
      licenciada_name: tax.licenciada_name || '',
      licenciada_cpf: tax.licenciada_cpf || '',
      licenciada_cnpj: tax.licenciada_cnpj || '',
      licenciada_location: tax.licenciada_location || '',
      valor_cents: tax.valor_cents ? String(tax.valor_cents / 100).replace('.', ',') : '',
      valor_extenso: tax.valor_extenso || '',
      payment_method: tax.payment_method || 'pix',
      payment_condition: tax.payment_condition || '',
      installments: tax.installments || 1,
      status: tax.status || 'pending_payment',
      notes: tax.notes || ''
    });
    setEditMode(true);
    setSelectedTax(tax);
    setShowCreateModal(true);
  };

  const openDetail = (tax) => {
    setSelectedTax(tax);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta taxa?')) return;
    try {
      await licenseTaxesApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Erro ao excluir taxa.');
    }
  };

  const handleSave = async () => {
    if (!formData.licenciada_name.trim()) {
      alert('Nome da licenciada é obrigatório.');
      return;
    }
    if (!formData.valor_cents && formData.valor_cents !== 0) {
      alert('Valor é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      const valorStr = String(formData.valor_cents).replace(/\./g, '').replace(',', '.');
      const payload = {
        ...formData,
        valor_cents: Math.round(parseFloat(valorStr || '0') * 100),
        installments: parseInt(formData.installments) || 1
      };

      if (editMode && selectedTax) {
        await licenseTaxesApi.update(selectedTax.id, payload);
      } else {
        await licenseTaxesApi.create(payload);
      }
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert(err.message || 'Erro ao salvar taxa.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      const result = await licenseTaxesApi.seedHistorical();
      setSeedResult(result.data);
      loadData();
    } catch (err) {
      alert(err.message || 'Erro ao importar dados.');
    }
  };

  const summary = data.summary || {};
  const summaryTotal = data.summary?.total_contracted_cents || 0;
  const summaryPending = data.summary?.total_pending || 0;
  const summarySigned = data.summary?.total_signed || 0;
  const avgTicket = data.summary?.average_ticket_cents || 0;

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title>
            <Landmark size={22} />
            Taxas de Licenciamento
          </Title>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ActionBtn onClick={handleSeed} title="Importar 13 registros históricos">
              <FileText size={15} /> Importar Relatório
            </ActionBtn>
            <ActionBtn $variant="gold" onClick={openCreate}>
              <Plus size={16} /> Nova Taxa
            </ActionBtn>
          </div>
        </PageHeader>

        {seedResult && (
          <AlertBanner $bg="#D1FAE5" $color="#065F46" $border="#6EE7B7">
            <CheckCircle size={16} /> {seedResult.message}
            <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setSeedResult(null)}>&times;</span>
          </AlertBanner>
        )}

        {summaryPending > 0 && (
          <AlertBanner>
            <AlertTriangle size={16} /> {summaryPending} taxa(s) pendente(s) de pagamento ou contrato.
          </AlertBanner>
        )}

        <KpiGrid>
          <KpiCard $color="#ED7E13">
            <KpiIcon $bg="rgba(237, 126, 19, 0.1)" $color="#ED7E13">
              <DollarSign size={18} />
            </KpiIcon>
            <KpiText>
              <KpiValue>R$ {((summaryTotal) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</KpiValue>
              <KpiLabel>Total Contratado</KpiLabel>
            </KpiText>
          </KpiCard>

          <KpiCard $color="#0A3E60">
            <KpiIcon $bg="rgba(10, 62, 96, 0.08)" $color="#0A3E60">
              <TrendingUp size={18} />
            </KpiIcon>
            <KpiText>
              <KpiValue>R$ {((avgTicket) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</KpiValue>
              <KpiLabel>Ticket Médio</KpiLabel>
            </KpiText>
          </KpiCard>

          <KpiCard $color="#059669">
            <KpiIcon $bg="rgba(5, 150, 105, 0.08)" $color="#059669">
              <CheckCircle size={18} />
            </KpiIcon>
            <KpiText>
              <KpiValue>{summarySigned}</KpiValue>
              <KpiLabel>Contratos Assinados</KpiLabel>
            </KpiText>
          </KpiCard>

          <KpiCard $color="#D97706">
            <KpiIcon $bg="rgba(217, 119, 6, 0.08)" $color="#D97706">
              <Clock size={18} />
            </KpiIcon>
            <KpiText>
              <KpiValue>{summaryPending}</KpiValue>
              <KpiLabel>Pendências</KpiLabel>
            </KpiText>
          </KpiCard>
        </KpiGrid>

        <FiltersBar>
          <SearchInput
            placeholder="Buscar por nome, CPF ou cidade..."
            value={search}
            onChange={handleSearch}
          />
          <FilterPill $active={!filterStatus} onClick={() => { setFilterStatus(''); setPage(1); }}>
            Todas
          </FilterPill>
          {Object.entries(STATUSES).map(([key, s]) => (
            <FilterPill
              key={key}
              $active={filterStatus === key}
              onClick={() => { setFilterStatus(filterStatus === key ? '' : key); setPage(1); }}
            >
              {s.label}
            </FilterPill>
          ))}
          <span style={{ color: '#CBD5E1', margin: '0 0.2rem' }}>|</span>
          {Object.entries(METHODS).map(([key, m]) => (
            <FilterPill
              key={key}
              $active={filterMethod === key}
              onClick={() => { setFilterMethod(filterMethod === key ? '' : key); setPage(1); }}
            >
              {m.label}
            </FilterPill>
          ))}
        </FiltersBar>

        {loading ? (
          <LoadingSpinner><RefreshCw size={16} className="spin" /> Carregando...</LoadingSpinner>
        ) : (
          <>
            <Table>
              <TableHeader>
                <span>Licenciada</span>
                <span>Local</span>
                <span>Valor</span>
                <span>Modalidade</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Ações</span>
              </TableHeader>

              {(data.data || []).length === 0 ? (
                <EmptyState>
                  <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} /><br />
                  Nenhum registro encontrado.
                </EmptyState>
              ) : (
                (data.data || []).map((tax) => {
                  const statusInfo = STATUSES[tax.status] || STATUSES.pending_payment;
                  const methodInfo = METHODS[tax.payment_method] || METHODS.manual;
                  const StatusIcon = statusInfo.icon;
                  const initials = (tax.licenciada_name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <TableRow key={tax.id}>
                      <LicenciadaCell>
                        <Avatar>
                          {tax.licenciada_photo
                            ? <img src={tax.licenciada_photo} alt="" />
                            : initials
                          }
                        </Avatar>
                        <LicenciadaInfo>
                          <LicenciadaName>{tax.licenciada_name}</LicenciadaName>
                          <LicenciadaLocation>{tax.licenciada_cpf || tax.licenciada_cnpj || '—'}</LicenciadaLocation>
                        </LicenciadaInfo>
                      </LicenciadaCell>

                      <span>{tax.licenciada_location || '—'}</span>
                      <ValueCell>{tax.valor_display}</ValueCell>

                      <span>
                        <Badge $bg={methodInfo.bg} $color={methodInfo.color}>
                          <methodInfo.icon size={11} /> {methodInfo.label}
                        </Badge>
                      </span>

                      <span>
                        <Badge $bg={statusInfo.bg} $color={statusInfo.color}>
                          <StatusIcon size={11} /> {statusInfo.label}
                        </Badge>
                      </span>

                      <ActionsCell>
                        <ActionIcon $bg="#EFF6FF" $color="#2563EB" title="Detalhes" onClick={() => openDetail(tax)}>
                          <Eye size={14} />
                        </ActionIcon>
                        <ActionIcon $bg="#FFF7ED" $color="#ED7E13" title="Editar" onClick={() => openEdit(tax)}>
                          <Edit2 size={14} />
                        </ActionIcon>
                        {tax.status !== 'contract_signed' && (
                          <ActionIcon $bg="#FEF2F2" $color="#DC2626" title="Excluir" onClick={() => handleDelete(tax.id)}>
                            <Trash2 size={14} />
                          </ActionIcon>
                        )}
                      </ActionsCell>
                    </TableRow>
                  );
                })
              )}
            </Table>

            <Pagination>
              <PageInfo>
                Página {data.pagination?.page || 1} de {data.pagination?.total_pages || 1} — {data.pagination?.total || 0} registro(s)
              </PageInfo>
              <PageBtns>
                <PageBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</PageBtn>
                <PageBtn disabled={page >= (data.pagination?.total_pages || 1)} onClick={() => setPage(p => p + 1)}>Próxima</PageBtn>
              </PageBtns>
            </Pagination>
          </>
        )}

        {/* MODAL CRIAR / EDITAR */}
        {showCreateModal && (
          <ModalOverlay onClick={() => setShowCreateModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>{editMode ? 'Editar Taxa' : 'Nova Taxa de Licenciamento'}</ModalTitle>
                <CloseBtn onClick={() => { setShowCreateModal(false); resetForm(); }}>&times;</CloseBtn>
              </ModalHeader>
              <ModalBody>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Nome da Licenciada *</FormLabel>
                    <FormInput
                      value={formData.licenciada_name}
                      onChange={(e) => setFormData({ ...formData, licenciada_name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Localização</FormLabel>
                    <FormInput
                      value={formData.licenciada_location}
                      onChange={(e) => setFormData({ ...formData, licenciada_location: e.target.value })}
                      placeholder="Cidade/Estado"
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>CPF</FormLabel>
                    <FormInput
                      value={formData.licenciada_cpf}
                      onChange={(e) => setFormData({ ...formData, licenciada_cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>CNPJ</FormLabel>
                    <FormInput
                      value={formData.licenciada_cnpj}
                      onChange={(e) => setFormData({ ...formData, licenciada_cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormInput
                      value={formData.valor_cents}
                      onChange={(e) => setFormData({ ...formData, valor_cents: e.target.value })}
                      placeholder="7.000,00"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Parcelas</FormLabel>
                    <FormInput
                      type="number"
                      min="1"
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>Modalidade *</FormLabel>
                    <FormSelect
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <option value="pix">PIX</option>
                      <option value="card">Cartão</option>
                      <option value="transfer">Transferência</option>
                      <option value="manual">Manual</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Status</FormLabel>
                    <FormSelect
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending_payment">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="contract_signed">Contrato Assinado</option>
                      <option value="cancelled">Cancelado</option>
                    </FormSelect>
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <FormLabel>Condição de Pagamento</FormLabel>
                  <FormInput
                    value={formData.payment_condition}
                    onChange={(e) => setFormData({ ...formData, payment_condition: e.target.value })}
                    placeholder="Ex: 5x de R$ 1.400,00"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Valor por Extenso</FormLabel>
                  <FormInput
                    value={formData.valor_extenso}
                    onChange={(e) => setFormData({ ...formData, valor_extenso: e.target.value })}
                    placeholder="sete mil reais"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Observações</FormLabel>
                  <FormTextarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas internas..."
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <ActionBtn onClick={() => { setShowCreateModal(false); resetForm(); }} style={{ background: '#F1F5F9', color: '#475569' }}>
                  Cancelar
                </ActionBtn>
                <ActionBtn $variant="gold" onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? 'Salvando...' : (editMode ? 'Atualizar' : 'Criar Taxa')}
                </ActionBtn>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}

        {/* MODAL DETALHES */}
        {showDetailModal && selectedTax && (
          <ModalOverlay onClick={() => setShowDetailModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Detalhes da Taxa</ModalTitle>
                <CloseBtn onClick={() => setShowDetailModal(false)}>&times;</CloseBtn>
              </ModalHeader>
              <ModalBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Avatar style={{ width: 48, height: 48, fontSize: '0.9rem' }}>
                    {(selectedTax.licenciada_name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{selectedTax.licenciada_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{selectedTax.licenciada_location || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div>
                    <FormLabel>Valor</FormLabel>
                    <div style={{ fontWeight: 700, color: '#0A3E60', fontSize: '1.1rem' }}>{selectedTax.valor_display}</div>
                  </div>
                  <div>
                    <FormLabel>Modalidade</FormLabel>
                    <div><Badge $bg={METHODS[selectedTax.payment_method]?.bg} $color={METHODS[selectedTax.payment_method]?.color}>
                      {React.createElement(METHODS[selectedTax.payment_method]?.icon || Edit2, { size: 12 })} {METHODS[selectedTax.payment_method]?.label}
                    </Badge></div>
                  </div>
                  <div>
                    <FormLabel>Status</FormLabel>
                    <div><Badge $bg={STATUSES[selectedTax.status]?.bg} $color={STATUSES[selectedTax.status]?.color}>
                      {React.createElement(STATUSES[selectedTax.status]?.icon || Clock, { size: 12 })} {STATUSES[selectedTax.status]?.label}
                    </Badge></div>
                  </div>
                  <div>
                    <FormLabel>Parcelas</FormLabel>
                    <div style={{ color: '#334155' }}>{selectedTax.installments}x</div>
                  </div>
                  <div>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <div style={{ color: '#334155' }}>{selectedTax.licenciada_cpf || selectedTax.licenciada_cnpj || '—'}</div>
                  </div>
                  <div>
                    <FormLabel>Origem</FormLabel>
                    <div style={{ color: '#334155' }}>{selectedTax.source}</div>
                  </div>
                </div>

                {selectedTax.payment_condition && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <FormLabel>Condição</FormLabel>
                    <div style={{ color: '#334155' }}>{selectedTax.payment_condition}</div>
                  </div>
                )}

                {selectedTax.notes && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <FormLabel>Observações</FormLabel>
                    <div style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedTax.notes}</div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <ActionBtn onClick={() => { setShowDetailModal(false); openEdit(selectedTax); }} style={{ background: '#0A3E60' }}>
                  <Edit2 size={14} /> Editar
                </ActionBtn>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}
      </Container>
    </AdminLayout>
  );
}
