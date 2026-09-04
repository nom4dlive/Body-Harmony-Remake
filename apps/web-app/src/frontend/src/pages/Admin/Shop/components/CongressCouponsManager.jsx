import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Ticket, 
  Sparkles, 
  Plus, 
  Users, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  ExternalLink,
  Eye,
  Clock,
  Check,
  MessageSquare,
  Zap,
  Share2
} from 'lucide-react';
import { congressApi } from '../../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #E2E8F0;

  .info {
    h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    p {
      font-size: 0.78rem;
      color: #64748B;
      margin: 0.2rem 0 0;
    }
  }

  .btn-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

const PrimaryBtn = styled.button`
  background: ${props => props.$variant === 'gold' ? 'linear-gradient(135deg, #ED7E13 0%, #FBBF24 100%)' : '#0A3E60'};
  color: ${props => props.$variant === 'gold' ? '#070B0E' : '#FFFFFF'};
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$variant === 'gold' ? '0 2px 10px rgba(237, 126, 19, 0.3)' : 'none'};

  &:hover {
    background: ${props => props.$variant === 'gold' ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' : '#06283D'};
    transform: translateY(-1px);
  }
`;

const CouponsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th {
    text-align: left;
    padding: 0.65rem 0.85rem;
    background: #F8FAFC;
    color: #475569;
    font-weight: 700;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 0.85rem;
    border-bottom: 1px solid #F1F5F9;
    color: #1E293B;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: #F8FAFC;
  }
`;

const Badge = styled.span`
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.25rem 0.55rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.$bg || '#F1F5F9'};
  color: ${props => props.$color || '#475569'};
  border: 1px solid ${props => props.$border || 'transparent'};
`;

const CodeTag = styled.button`
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 800;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  color: #0A3E60;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    background: #E2E8F0;
    border-color: #94A3B8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #E2E8F0;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #E2E8F0;

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;

  label {
    font-size: 0.76rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input, select {
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    font-size: 0.88rem;
    font-family: inherit;
    color: #0F172A;
    font-weight: 600;
    outline: none;

    &:focus {
      border-color: #ED7E13;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }
  }
`;

export default function CongressCouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usagesModal, setUsagesModal] = useState({ isOpen: false, coupon: null, usages: [], loading: false });
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedWa, setCopiedWa] = useState(null);

  const [form, setForm] = useState({
    id: 0,
    code: '',
    description: '',
    type: 'LICENCIADA_NOMINAL',
    discount_percentage: 20,
    limit_mode: 'one_per_cpf',
    max_uses: '',
    restricted_cpf: '',
    expires_at: '',
    is_active: 1
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await congressApi.getAdminCoupons();
      if (res?.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar cupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyWhatsAppCopy = (c) => {
    const text = `🏛️ *CONGRESSO BRASILEIRO DE MUSCULAÇÃO ELÉTRICA — EXCLUSIVO LICENCIADAS* ⚡\n\nOlá, Licenciada Body Harmony! 🌟\n\nPreparamos uma condição muito especial para que você e sua equipe estejam presentes no nosso grande encontro presencial em São Paulo (07 de Novembro · Espaço Full Sales · JK Iguatemi).\n\n🎟️ *SEU CUPOM DE ${c.discount_percentage}% DE DESCONTO:*\n👉 Código: *${c.code}*\n💰 *${c.discount_percentage}% de Desconto* em qualquer lote (Experience ou VIP Exclusive)\n\n📌 *REGRAS & COMO UTILIZAR:*\n1️⃣ Acesse o site oficial: https://bodyharmony.com.br/shop\n2️⃣ Clique em *Garantir Ingresso* (Experience ou VIP)\n3️⃣ No checkout, insira o código *${c.code}* no campo de cupom e clique em *Aplicar*\n4️⃣ Preencha seus dados com o seu CPF de licenciada e conclua via PIX ou Cartão em até 12x\n\n⚠️ *Atenção:* O cupom é exclusivo e limitado estritamente a *1 utilização por CPF*. Garanta o seu antes da virada de lote!\n\nDúvidas ou suporte? Estamos à disposição! 💙✨`;
    navigator.clipboard.writeText(text);
    setCopiedWa(c.code);
    setTimeout(() => setCopiedWa(null), 2500);
  };

  const setQuickLicenciada = () => {
    setForm({
      id: 0,
      code: 'LICENCIADA20',
      description: '20% OFF Exclusivo Licenciadas Body Harmony (1 uso por CPF)',
      type: 'LICENCIADA_NOMINAL',
      discount_percentage: 20,
      limit_mode: 'one_per_cpf',
      max_uses: '',
      restricted_cpf: '',
      expires_at: '',
      is_active: 1
    });
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const isUnique = form.limit_mode === 'unique';
      const isOnePerCpf = form.limit_mode === 'one_per_cpf' || form.limit_mode === 'unique';

      const payload = {
        id: form.id,
        code: form.code,
        description: form.description,
        type: form.type,
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        one_per_cpf: isOnePerCpf ? 1 : 0,
        max_uses: isUnique ? 1 : (form.max_uses ? parseInt(form.max_uses, 10) : null),
        restricted_cpf: form.restricted_cpf || null,
        expires_at: form.expires_at || null,
        is_active: form.is_active
      };

      const res = await congressApi.saveAdminCoupon(payload);
      if (res?.ok) {
        setModalOpen(false);
        await loadCoupons();
        alert('Cupom salvo com sucesso!');
      } else {
        alert('Erro ao salvar cupom: ' + (res?.message || 'Falha'));
      }
    } catch (err) {
      console.error('saveCoupon error', err);
      const errMsg = err?.response?.message || err?.message || 'Erro ao salvar cupom.';
      alert('Erro: ' + errMsg);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
    try {
      const res = await congressApi.deleteAdminCoupon(couponId);
      if (res?.ok) {
        await loadCoupons();
      } else {
        alert('Erro: ' + (res?.message || 'Falha'));
      }
    } catch (err) {
      alert('Erro ao excluir: ' + (err?.response?.message || err.message));
    }
  };

  const handleViewUsages = async (coupon) => {
    try {
      setUsagesModal({ isOpen: true, coupon, usages: [], loading: true });
      const res = await congressApi.getCouponUsages(coupon.id);
      setUsagesModal({
        isOpen: true,
        coupon,
        usages: res?.data || [],
        loading: false
      });
    } catch (err) {
      alert('Erro ao buscar utilizações: ' + err.message);
      setUsagesModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Container>
      <HeaderBar>
        <div className="info">
          <h3><Ticket size={20} color="#ED7E13" /> Central Blindada de Cupons & Isenções</h3>
          <p>Crie cupons de 20% para licenciadas (1 uso por CPF), isenções para convidadas e gere textos de WhatsApp prontos.</p>
        </div>
        <div className="btn-group">
          <PrimaryBtn 
            type="button" 
            $variant="gold"
            onClick={setQuickLicenciada}
          >
            <Zap size={15} /> Criar Cupom Licenciada 20% (1 uso/CPF)
          </PrimaryBtn>
          <PrimaryBtn 
            type="button" 
            onClick={() => {
              setForm({
                id: 0,
                code: '',
                description: '',
                type: 'ATLETA_CONVIDADA',
                discount_percentage: 100,
                limit_mode: 'unique',
                max_uses: 1,
                restricted_cpf: '',
                expires_at: '',
                is_active: 1
              });
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Novo Cupom Blindado
          </PrimaryBtn>
        </div>
      </HeaderBar>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
          Carregando cupons...
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
          Nenhum cupom cadastrado. Clique no botão acima para criar o primeiro cupom!
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <CouponsTable>
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Finalidade</th>
                <th>Regra de Uso</th>
                <th>Blindagem & CPF</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const isExhausted = c.max_uses !== null && c.current_uses >= c.max_uses;
                return (
                  <tr key={c.id}>
                    <td>
                      <CodeTag 
                        type="button" 
                        onClick={() => handleCopy(c.code)}
                        title="Clique para copiar o código"
                      >
                        {copiedCode === c.code ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        {c.code}
                      </CodeTag>
                    </td>
                    <td>
                      <Badge 
                        $bg={c.discount_percentage >= 100 ? 'rgba(237, 126, 19, 0.15)' : '#EFF6FF'} 
                        $color={c.discount_percentage >= 100 ? '#ED7E13' : '#1E40AF'}
                        $border={c.discount_percentage >= 100 ? 'rgba(237, 126, 19, 0.3)' : '#BFDBFE'}
                      >
                        {c.discount_percentage >= 100 ? '100% ISENÇÃO' : `${c.discount_percentage}% OFF`}
                      </Badge>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.78rem' }}>
                      {c.description || (c.type === 'ATLETA_CONVIDADA' ? 'Convidada / Atleta' : 'Licenciada Nominal')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.76rem' }}>
                        {c.one_per_cpf ? (
                          <span style={{ color: '#0A3E60', fontWeight: 800 }}>
                            🔒 1 Uso por CPF
                          </span>
                        ) : null}
                        {c.max_uses !== null ? (
                          <span style={{ fontWeight: 700, color: isExhausted ? '#EF4444' : '#10B981' }}>
                            {c.current_uses} de {c.max_uses} usos ({isExhausted ? 'Esgotado' : 'Disponível'})
                          </span>
                        ) : (
                          <span style={{ color: '#64748B' }}>{c.current_uses} usos realizados</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.74rem' }}>
                        {c.restricted_cpf && (
                          <span style={{ color: '#0A3E60', fontWeight: 700 }}>
                            🔒 CPF Restrito: {c.restricted_cpf}
                          </span>
                        )}
                        {c.expires_at && (
                          <span style={{ color: '#D97706' }}>
                            ⏱️ Expira: {new Date(c.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {!c.restricted_cpf && !c.expires_at && (
                          <span style={{ color: '#94A3B8' }}>Toda a Rede</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge $bg={c.is_active ? '#F0FDF4' : '#FEF2F2'} $color={c.is_active ? '#166534' : '#991B1B'}>
                        {c.is_active ? '✓ Ativo' : 'Desativado'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => copyWhatsAppCopy(c)}
                          title="Copiar mensagem formatada para WhatsApp"
                          style={{
                            background: copiedWa === c.code ? '#DCFCE7' : '#F0FDF4',
                            border: '1px solid #86EFAC',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: copiedWa === c.code ? '#15803D' : '#166534',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedWa === c.code ? <Check size={13} /> : <MessageSquare size={13} />}
                          {copiedWa === c.code ? 'Copiado!' : 'WhatsApp'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewUsages(c)}
                          title="Ver quem já utilizou este cupom"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#0A3E60',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Users size={13} /> {c.confirmed_usages || c.current_uses || 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          title="Excluir cupom"
                          style={{
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#991B1B',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </CouponsTable>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO DE CUPOM */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div className="header">
              <h4>✨ Configurar Cupom Blindado</h4>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <FormGroup>
                <label>Código do Cupom (Maiúsculas)</label>
                <input
                  type="text"
                  required
                  placeholder="EX: LICENCIADA20, ATLETA100, VIPBODY"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                />
              </FormGroup>

              <FormGroup>
                <label>Finalidade / Identificação Interna</label>
                <input
                  type="text"
                  placeholder="Ex: 20% OFF Exclusivo Licenciadas Body Harmony"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormGroup>
                  <label>Desconto (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={form.discount_percentage}
                    onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Tipo de Cupom</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="LICENCIADA_NOMINAL">Licenciada Nominal (Rede)</option>
                    <option value="ATLETA_CONVIDADA">Atleta / Convidada (100% OFF)</option>
                    <option value="DESCONTO_FIXO">Desconto Promocional %</option>
                  </select>
                </FormGroup>
              </div>

              {/* MODALIDADE DE LIMITAÇÃO */}
              <FormGroup>
                <label>Regra de Utilização & Blindagem</label>
                <select
                  value={form.limit_mode}
                  onChange={(e) => setForm({ ...form, limit_mode: e.target.value })}
                >
                  <option value="one_per_cpf">🔒 1 Uso por CPF (Ideal para Licenciadas / Várias usam, 1 vez cada)</option>
                  <option value="unique">⚡ Uso Único Global (Esgota após o 1º uso no total)</option>
                  <option value="custom">♾️ Limite Numérico / Ilimitado</option>
                </select>
              </FormGroup>

              {form.limit_mode === 'custom' && (
                <FormGroup>
                  <label>Limite Máximo de Usos Globais</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Deixe em branco para ilimitado"
                    value={form.max_uses || ''}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  />
                </FormGroup>
              )}

              {/* BLINDAGEM 2: RESTRITO POR CPF */}
              <FormGroup>
                <label>
                  <span>Restringir a 1 CPF Específico (Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Deixe em branco para toda a rede, ou digite o CPF específico"
                  value={form.restricted_cpf}
                  onChange={(e) => setForm({ ...form, restricted_cpf: e.target.value })}
                />
              </FormGroup>

              {/* BLINDAGEM 3: DATA DE EXPIRAÇÃO */}
              <FormGroup>
                <label>Data & Hora de Expiração (Opcional)</label>
                <input
                  type="datetime-local"
                  value={form.expires_at ? form.expires_at.replace(' ', 'T').substring(0, 16) : ''}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value ? e.target.value.replace('T', ' ') + ':00' : '' })}
                />
              </FormGroup>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.65rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <PrimaryBtn type="submit">
                  Salvar e Ativar Cupom
                </PrimaryBtn>
              </div>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* MODAL DE HISTÓRICO DE QUEM USOU */}
      {usagesModal.isOpen && (
        <ModalOverlay onClick={() => setUsagesModal({ isOpen: false, coupon: null, usages: [] })}>
          <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="header">
              <div>
                <h4>👥 Inscrições com o Cupom: {usagesModal.coupon?.code}</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                  Auditoria em tempo real de participantes que validaram este cupom.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setUsagesModal({ isOpen: false, coupon: null, usages: [] })}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {usagesModal.loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                Consultando histórico...
              </div>
            ) : usagesModal.usages.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '8px' }}>
                Nenhum participante utilizou este cupom até o momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {usagesModal.usages.map((u) => (
                  <div 
                    key={u.id}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#0A3E60' }}>{u.customer_name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        CPF: {u.customer_cpf} · WhatsApp: {u.customer_phone}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#0F172A', marginTop: '2px' }}>
                        Ingresso: <strong>{u.tier_name || 'Experience'}</strong> · {u.category || 'Geral'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge 
                        $bg={u.payment_status === 'CONFIRMED' || u.payment_status === 'FREE_APPROVED' ? '#F0FDF4' : '#FEF3C7'}
                        $color={u.payment_status === 'CONFIRMED' || u.payment_status === 'FREE_APPROVED' ? '#166534' : '#92400E'}
                      >
                        {u.payment_status === 'FREE_APPROVED' ? 'ISENÇÃO 100%' : (u.payment_status === 'CONFIRMED' ? 'PAGO' : u.payment_status)}
                      </Badge>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '3px' }}>
                        {new Date(u.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}
