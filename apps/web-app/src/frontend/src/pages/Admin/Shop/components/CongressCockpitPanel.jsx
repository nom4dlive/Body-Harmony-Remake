import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Crown, 
  Ticket, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { congressApi, shopApi } from '../../../../services/api';
import CongressCouponsManager from './CongressCouponsManager';
import CongressCheckinScanner from './CongressCheckinScanner';

const CockpitContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: 'Montserrat', sans-serif;
`;

const OperationalBanner = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #0E2A47 100%);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(10, 62, 96, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BannerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: -0.01em;
      color: #FFFFFF;
    }
    span {
      font-size: 0.75rem;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22C55E;
      color: #4ADE80;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
  }
`;

const StatCardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
`;

const StatPill = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .label {
    font-size: 0.72rem;
    color: #94A3B8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .value {
    font-size: 0.95rem;
    color: #F8FAFC;
    font-weight: 900;
  }

  .sub {
    font-size: 0.7rem;
    color: #FBBF24;
    font-weight: 700;
  }
`;

const TeamGuideline = styled.div`
  background: rgba(237, 126, 19, 0.12);
  border: 1px solid rgba(237, 126, 19, 0.3);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #FDE68A;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  strong {
    color: #FFFFFF;
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  ${props => props.$highlight && `
    border-color: #ED7E13;
    box-shadow: 0 6px 20px rgba(237, 126, 19, 0.08);
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ED7E13, #FBBF24, #D97706);
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #F1F5F9;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.$iconBg || 'rgba(10, 62, 96, 0.08)'};
      color: ${props => props.$iconColor || '#0A3E60'};
    }

    h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0A3E60;
      margin: 0;
    }

    p {
      font-size: 0.75rem;
      color: #64748B;
      margin: 0;
    }
  }
`;

const Badge = styled.span`
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.$bg || '#F1F5F9'};
  color: ${props => props.$color || '#475569'};
  border: 1px solid ${props => props.$border || 'transparent'};
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    transition: all 0.2s ease;

    &:focus {
      border-color: #ED7E13;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.12);
    }
  }
`;

const PriceRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
  margin: 0.5rem 0 0.35rem;

  .fill {
    height: 100%;
    background: ${props => props.$percent >= 90 ? '#EF4444' : (props.$percent >= 70 ? '#F59E0B' : '#10B981')};
    width: ${props => Math.min(100, Math.max(0, props.$percent))}%;
    transition: width 0.4s ease;
  }
`;

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0.5rem 0;
`;

const ModeButton = styled.button`
  border-radius: 10px;
  padding: 0.85rem;
  border: 2px solid ${props => props.$active ? '#0A3E60' : '#E2E8F0'};
  background: ${props => props.$active ? 'rgba(10, 62, 96, 0.05)' : '#FFFFFF'};
  color: ${props => props.$active ? '#0A3E60' : '#64748B'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.82rem;
  transition: all 0.2s ease;

  strong {
    color: ${props => props.$active ? '#0A3E60' : '#1E293B'};
  }

  span {
    font-size: 0.72rem;
    font-weight: 500;
  }

  &:hover {
    border-color: #0A3E60;
  }
`;

const ActionBtn = styled.button`
  background: ${props => props.$variant === 'gold' ? '#ED7E13' : '#0A3E60'};
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
  min-height: 40px;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function CongressCockpitPanel({ settings = {}, onSaveSettings = () => {} }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTier, setSavingTier] = useState(null);
  const [genLinkState, setGenLinkState] = useState({});
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const res = await congressApi.getTiers();
      if (res?.data && Array.isArray(res.data)) {
        setTiers(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar lotes do congresso:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const handleUpdateTier = async (tierId, payload) => {
    try {
      setSavingTier(tierId);
      const res = await congressApi.updateTier(tierId, payload);
      if (res?.ok) {
        await loadTiers();
        alert('Lote atualizado com sucesso!');
      } else {
        alert('Erro ao salvar: ' + (res?.message || 'Falha desconhecida'));
      }
    } catch (err) {
      alert('Erro: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingTier(null);
    }
  };

  const handleGenerateAsaasLink = async (productId, tierSlug) => {
    try {
      setGenLinkState(prev => ({ ...prev, [tierSlug]: 'loading' }));
      const res = await shopApi.generateAsaasPaymentLink(productId);
      if (res?.ok && res?.payment_link_url) {
        const key = tierSlug === 'vip' ? 'congresso_link_asaas_vip' : 'congresso_link_asaas_experience';
        const updated = { ...localSettings, [key]: res.payment_link_url };
        setLocalSettings(updated);
        await onSaveSettings(updated);
        setGenLinkState(prev => ({ ...prev, [tierSlug]: 'success' }));
        setTimeout(() => setGenLinkState(prev => ({ ...prev, [tierSlug]: null })), 3000);
      } else {
        alert('Erro ao gerar link Asaas: ' + (res?.error || 'Falha'));
        setGenLinkState(prev => ({ ...prev, [tierSlug]: null }));
      }
    } catch (err) {
      alert('Erro: ' + (err?.response?.data?.error || err.message));
      setGenLinkState(prev => ({ ...prev, [tierSlug]: null }));
    }
  };

  const expTier = tiers.find(t => t.slug === 'experience') || { id: 2, price_cents: 69700, original_price_cents: 99700, name: 'Ingresso Experience' };
  const vipTier = tiers.find(t => t.slug === 'vip') || { id: 1, price_cents: 149700, original_price_cents: 199700, max_slots: 40, sold_slots: 0, name: 'Passaporte VIP Exclusive' };

  const [expPrice, setExpPrice] = useState((expTier.price_cents / 100).toFixed(2));
  const [expOrigPrice, setExpOrigPrice] = useState(expTier.original_price_cents ? (expTier.original_price_cents / 100).toFixed(2) : '997.00');

  const [vipPrice, setVipPrice] = useState((vipTier.price_cents / 100).toFixed(2));
  const [vipOrigPrice, setVipOrigPrice] = useState(vipTier.original_price_cents ? (vipTier.original_price_cents / 100).toFixed(2) : '1997.00');
  const [vipSlots, setVipSlots] = useState(vipTier.max_slots || 40);

  useEffect(() => {
    if (expTier.price_cents) setExpPrice((expTier.price_cents / 100).toFixed(2));
    if (expTier.original_price_cents) setExpOrigPrice((expTier.original_price_cents / 100).toFixed(2));
    if (vipTier.price_cents) setVipPrice((vipTier.price_cents / 100).toFixed(2));
    if (vipTier.original_price_cents) setVipOrigPrice((vipTier.original_price_cents / 100).toFixed(2));
    if (vipTier.max_slots) setVipSlots(vipTier.max_slots);
  }, [tiers]);

  const vipSold = vipTier.sold_slots || 0;
  const vipMax = vipTier.max_slots || 40;
  const vipPercent = Math.round((vipSold / vipMax) * 100);

  return (
    <CockpitContainer>
      {/* STATUS DA OPERAÇÃO EM TEMPO REAL (PAINEL DA EQUIPE) */}
      <OperationalBanner>
        <BannerHeader>
          <div className="title-group">
            <ShieldCheck size={20} color="#ED7E13" />
            <h2>Cockpit Operacional do Congresso</h2>
            <span>🟢 Sistema 100% Ativo & No Ar</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
            Fonte Única da Verdade · Sincronizado com a Landing Page
          </div>
        </BannerHeader>

        <StatCardsRow>
          <StatPill>
            <div className="label"><Ticket size={13} color="#60A5FA" /> Lote Vigente</div>
            <div className="value">{localSettings.congresso_lote_experience_name || '1º LOTE OFICIAL'}</div>
            <div className="sub">Experience: R$ {expPrice} · VIP: R$ {vipPrice}</div>
          </StatPill>

          <StatPill>
            <div className="label"><Clock size={13} color="#FBBF24" /> Virada Programada</div>
            <div className="value">
              {localSettings.congresso_countdown_end_date 
                ? localSettings.congresso_countdown_end_date.substring(0, 16).replace('T', ' ')
                : '30/09/2026 23:59'}
            </div>
            <div className="sub">Cronômetro ativo na Landing Page</div>
          </StatPill>

          <StatPill>
            <div className="label"><Sparkles size={13} color="#ED7E13" /> Cupom de Rede Ativo</div>
            <div className="value" style={{ color: '#FBBF24', letterSpacing: '0.05em' }}>LICENCIADA20</div>
            <div className="sub">20% OFF · Trava: 1 uso por CPF</div>
          </StatPill>

          <StatPill>
            <div className="label"><Crown size={13} color="#FBBF24" /> Ocupação VIP</div>
            <div className="value">{vipSold} / {vipMax} Vagas</div>
            <div className="sub">{vipPercent}% preenchido ({vipMax - vipSold} restantes)</div>
          </StatPill>
        </StatCardsRow>

        <TeamGuideline>
          <Sparkles size={16} color="#ED7E13" style={{ flexShrink: 0 }} />
          <span>
            <strong>Orientação para o Time de Atendimento:</strong> Quando uma licenciada solicitar desconto, acesse a aba <strong>Cupons & Isenções</strong> abaixo e clique no botão <strong>WhatsApp</strong> do cupom <strong>LICENCIADA20</strong> para copiar a mensagem oficial formatada com regras e link direto.
          </span>
        </TeamGuideline>
      </OperationalBanner>

      {/* SEÇÃO 1: MODO DE CHECKOUT & VIRADA DE LOTE */}
      <BentoGrid>
        <Card $highlight>
          <div>
            <CardHeader $iconBg="rgba(237, 126, 19, 0.1)" $iconColor="#ED7E13">
              <div className="title-group">
                <div className="icon-box">
                  <Zap size={18} />
                </div>
                <div>
                  <h3>Modo de Checkout do Congresso</h3>
                  <p>Como o comprador finaliza a inscrição no site</p>
                </div>
              </div>
              <Badge $bg="#FEF3C7" $color="#92400E" $border="#FDE68A">
                {localSettings.congresso_checkout_mode === 'asaas_direct' ? 'Link Asaas' : 'Modal Nativo'}
              </Badge>
            </CardHeader>

            <ModeSelector>
              <ModeButton
                type="button"
                $active={localSettings.congresso_checkout_mode !== 'asaas_direct'}
                onClick={() => {
                  const updated = { ...localSettings, congresso_checkout_mode: 'native' };
                  setLocalSettings(updated);
                  onSaveSettings(updated);
                }}
              >
                <ShieldCheck size={20} color={localSettings.congresso_checkout_mode !== 'asaas_direct' ? '#0A3E60' : '#64748B'} />
                <strong>Modal Transparente</strong>
                <span>Paga no site via PIX/Cartão</span>
              </ModeButton>

              <ModeButton
                type="button"
                $active={localSettings.congresso_checkout_mode === 'asaas_direct'}
                onClick={() => {
                  const updated = { ...localSettings, congresso_checkout_mode: 'asaas_direct' };
                  setLocalSettings(updated);
                  onSaveSettings(updated);
                }}
              >
                <ExternalLink size={20} color={localSettings.congresso_checkout_mode === 'asaas_direct' ? '#ED7E13' : '#64748B'} />
                <strong>Link Direto Asaas</strong>
                <span>Redireciona para o Asaas</span>
              </ModeButton>
            </ModeSelector>
          </div>

          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#64748B' }}>
            💡 <strong>Recomendado:</strong> O <em>Modal Transparente</em> tem maior taxa de conversão (gera PIX e Cartão dentro da página).
          </div>
        </Card>

        {/* CONTROLE DE LOTE ATIVO E CRONÔMETRO */}
        <Card>
          <div>
            <CardHeader $iconBg="rgba(10, 62, 96, 0.08)" $iconColor="#0A3E60">
              <div className="title-group">
                <div className="icon-box">
                  <Clock size={18} />
                </div>
                <div>
                  <h3>Lote Ativo & Cronômetro</h3>
                  <p>Defina o lote atual e a data da virada de preço</p>
                </div>
              </div>
              <Badge $bg="#EFF6FF" $color="#1E40AF" $border="#BFDBFE">
                Lote {localSettings.congresso_lote_active_index || '1'}
              </Badge>
            </CardHeader>

            <FormGroup>
              <label>Nome do Lote Atual</label>
              <input
                type="text"
                value={localSettings.congresso_lote_experience_name || localSettings.congresso_lote_nome || '1º LOTE PROMOCIONAL'}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = { 
                    ...localSettings, 
                    congresso_lote_experience_name: val,
                    congresso_lote_nome: val,
                    congresso_lote_1_nome: val
                  };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
                placeholder="Ex: 1º LOTE PROMOCIONAL"
              />
            </FormGroup>

            <FormGroup>
              <label>Data & Hora da Virada do Lote (Countdown)</label>
              <input
                type="datetime-local"
                value={localSettings.congresso_countdown_end_date ? localSettings.congresso_countdown_end_date.replace(' ', 'T').substring(0, 16) : '2026-09-30T23:59'}
                onChange={(e) => {
                  const val = e.target.value.replace('T', ' ') + ':00';
                  const updated = { 
                    ...localSettings, 
                    congresso_countdown_end_date: val,
                    congresso_lote_1_deadline: val,
                    congresso_lote_deadline: val
                  };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
              />
            </FormGroup>
          </div>
        </Card>
      </BentoGrid>

      {/* SEÇÃO 2: GESTÃO DE PREÇOS DOS INGRESSOS */}
      <BentoGrid>
        {/* CARD INGRESSO EXPERIENCE */}
        <Card>
          <div>
            <CardHeader $iconBg="rgba(10, 62, 96, 0.08)" $iconColor="#0A3E60">
              <div className="title-group">
                <div className="icon-box">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3>Ingresso Experience</h3>
                  <p>Acesso essencial às palestras e feira</p>
                </div>
              </div>
              <Badge $bg="#F0FDF4" $color="#166534">Ativo</Badge>
            </CardHeader>

            <PriceRow>
              <FormGroup>
                <label>Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expPrice}
                  onChange={(e) => setExpPrice(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label>Preço "De" (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expOrigPrice}
                  onChange={(e) => setExpOrigPrice(e.target.value)}
                />
              </FormGroup>
            </PriceRow>

            <FormGroup>
              <label>Link Direto Asaas (Opcional)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={localSettings.congresso_link_asaas_experience || ''}
                  onChange={(e) => {
                    const updated = { ...localSettings, congresso_link_asaas_experience: e.target.value };
                    setLocalSettings(updated);
                  }}
                  onBlur={() => onSaveSettings(localSettings)}
                  placeholder="https://www.asaas.com/c/..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAsaasLink(2, 'experience')}
                  disabled={genLinkState['experience'] === 'loading'}
                  style={{
                    background: genLinkState['experience'] === 'success' ? '#10B981' : '#0A3E60',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genLinkState['experience'] === 'loading' ? '...' : (genLinkState['experience'] === 'success' ? '✓ Gerado' : '⚡ Gerar')}
                </button>
              </div>
            </FormGroup>
          </div>

          <ActionBtn
            type="button"
            onClick={() => handleUpdateTier(expTier.id, {
              price_cents: Math.round(parseFloat(expPrice) * 100),
              original_price_cents: Math.round(parseFloat(expOrigPrice) * 100)
            })}
            disabled={savingTier === expTier.id}
          >
            <Save size={15} />
            {savingTier === expTier.id ? 'Salvando...' : 'Salvar Preço Experience'}
          </ActionBtn>
        </Card>

        {/* CARD PASSAPORTE VIP EXCLUSIVE */}
        <Card $highlight>
          <div>
            <CardHeader $iconBg="rgba(237, 126, 19, 0.1)" $iconColor="#ED7E13">
              <div className="title-group">
                <div className="icon-box">
                  <Crown size={18} />
                </div>
                <div>
                  <h3>Passaporte VIP Exclusive</h3>
                  <p>Bastidores, Coquetel & R$ 1.497 em Crédito</p>
                </div>
              </div>
              <Badge $bg={vipPercent >= 100 ? '#FEE2E2' : '#FEF3C7'} $color={vipPercent >= 100 ? '#991B1B' : '#92400E'}>
                {vipPercent >= 100 ? 'Esgotado' : `${vipSold} / ${vipMax} Vagas`}
              </Badge>
            </CardHeader>

            <PriceRow>
              <FormGroup>
                <label>Preço VIP (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={vipPrice}
                  onChange={(e) => setVipPrice(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label>Preço "De" (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={vipOrigPrice}
                  onChange={(e) => setVipOrigPrice(e.target.value)}
                />
              </FormGroup>
            </PriceRow>

            <FormGroup>
              <label>
                <span>Limite Máximo de Vagas VIP</span>
                <strong style={{ color: '#ED7E13' }}>{vipSlots} Vagas</strong>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={vipSlots}
                onChange={(e) => setVipSlots(parseInt(e.target.value, 10) || 40)}
              />
            </FormGroup>

            {/* BARRA DE VAGAS PREENCHIDAS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                <span>Ocupação VIP:</span>
                <span>{vipSold} de {vipMax} preenchidas ({vipPercent}%)</span>
              </div>
              <ProgressBar $percent={vipPercent}>
                <div className="fill" />
              </ProgressBar>
            </div>

            <FormGroup style={{ marginTop: '0.65rem' }}>
              <label>Link Direto Asaas VIP (Opcional)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={localSettings.congresso_link_asaas_vip || ''}
                  onChange={(e) => {
                    const updated = { ...localSettings, congresso_link_asaas_vip: e.target.value };
                    setLocalSettings(updated);
                  }}
                  onBlur={() => onSaveSettings(localSettings)}
                  placeholder="https://www.asaas.com/c/..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAsaasLink(1, 'vip')}
                  disabled={genLinkState['vip'] === 'loading'}
                  style={{
                    background: genLinkState['vip'] === 'success' ? '#10B981' : '#ED7E13',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genLinkState['vip'] === 'loading' ? '...' : (genLinkState['vip'] === 'success' ? '✓ Gerado' : '⚡ Gerar')}
                </button>
              </div>
            </FormGroup>
          </div>

          <ActionBtn
            $variant="gold"
            type="button"
            onClick={() => handleUpdateTier(vipTier.id, {
              price_cents: Math.round(parseFloat(vipPrice) * 100),
              original_price_cents: Math.round(parseFloat(vipOrigPrice) * 100),
              max_slots: parseInt(vipSlots, 10)
            })}
            disabled={savingTier === vipTier.id}
          >
            <Save size={15} />
            {savingTier === vipTier.id ? 'Salvando...' : 'Salvar Preço & Vagas VIP'}
          </ActionBtn>
        </Card>
      </BentoGrid>

      {/* SEÇÃO 3: CENTRAL BLINDADA DE CUPONS & ISENÇÕES */}
      <Card style={{ marginTop: '0.5rem' }}>
        <CongressCouponsManager />
      </Card>

      {/* SEÇÃO DE CREDENCIAMENTO / SCANNER DE PORTARIA */}
      <CongressCheckinScanner />

      {/* SEÇÃO 4: DESIGN & REGRAS DO PASSAPORTE VIRTUAL / COMPROVANTE */}
      <Card style={{ marginTop: '0.5rem' }}>
        <div>
          <CardHeader $iconBg="rgba(10, 62, 96, 0.08)" $iconColor="#0A3E60">
            <div className="title-group">
              <div className="icon-box">
                <Sparkles size={18} />
              </div>
              <div>
                <h3>Comprovante / Passaporte Virtual do Comprador</h3>
                <p>Personalize os textos, horários e instruções que aparecem no ingresso emitido</p>
              </div>
            </div>
            <Badge $bg="#EFF6FF" $color="#1E40AF">Template Oficial</Badge>
          </CardHeader>

          <BentoGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <FormGroup>
              <label>Instruções de Credenciamento na Portaria</label>
              <input
                type="text"
                value={localSettings.congresso_ticket_instructions || 'Apresente o QR Code na recepção com documento com foto.'}
                onChange={(e) => {
                  const updated = { ...localSettings, congresso_ticket_instructions: e.target.value };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
                placeholder="Ex: Apresente o QR Code na recepção com documento com foto."
              />
            </FormGroup>

            <FormGroup>
              <label>Horário de Abertura & Credenciamento</label>
              <input
                type="text"
                value={localSettings.congresso_ticket_schedule || 'Recepção e Check-in a partir das 08h00 · Início 09h00'}
                onChange={(e) => {
                  const updated = { ...localSettings, congresso_ticket_schedule: e.target.value };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
                placeholder="Ex: Recepção a partir das 08h00"
              />
            </FormGroup>

            <FormGroup>
              <label>Localização / Endereço Exibido no Ingresso</label>
              <input
                type="text"
                value={localSettings.congresso_ticket_venue || 'Auditório de Alto Padrão · São Paulo / SP'}
                onChange={(e) => {
                  const updated = { ...localSettings, congresso_ticket_venue: e.target.value };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
                placeholder="Ex: Auditório de Alto Padrão · São Paulo / SP"
              />
            </FormGroup>

            <FormGroup>
              <label>WhatsApp Oficial de Suporte ao Congressista</label>
              <input
                type="text"
                value={localSettings.congresso_ticket_support_whatsapp || '5511999999999'}
                onChange={(e) => {
                  const updated = { ...localSettings, congresso_ticket_support_whatsapp: e.target.value };
                  setLocalSettings(updated);
                }}
                onBlur={() => onSaveSettings(localSettings)}
                placeholder="Ex: 5511999999999"
              />
            </FormGroup>
          </BentoGrid>
        </div>
      </Card>
    </CockpitContainer>
  );
}
