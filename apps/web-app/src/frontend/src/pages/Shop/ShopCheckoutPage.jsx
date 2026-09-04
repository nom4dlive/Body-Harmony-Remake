import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  FileText,
  MapPin,
  QrCode,
  Copy,
  ExternalLink,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { shopApi } from '../../services/api';

const CheckoutContainer = styled.div`
  min-height: 100vh;
  background-color: #F8FAFC;
  color: #0A3E60;
  font-family: 'Montserrat', sans-serif;
  padding: 2rem 1rem 4rem;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackNav = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #0A3E60;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0.5rem 0;

  &:hover {
    color: #ED7E13;
  }
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 860px) {
    grid-template-columns: 1fr 380px;
  }
`;

const MainCard = styled.div`
  background: #FFFFFF;
  border-radius: 1.25rem;
  padding: 2rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 25px -5px rgba(10, 62, 96, 0.05);
`;

const SummaryCard = styled.div`
  background: #FFFFFF;
  border-radius: 1.25rem;
  padding: 2rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 25px -5px rgba(10, 62, 96, 0.05);
  height: fit-content;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0A3E60;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.4rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1rem;
    color: #94A3B8;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid #CBD5E1;
  font-size: 0.95rem;
  color: #0A3E60;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.15);
  }
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const PaymentSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PaymentOption = styled.button`
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid ${props => props.$active ? '#ED7E13' : '#E2E8F0'};
  background: ${props => props.$active ? 'rgba(237, 126, 19, 0.05)' : '#FFFFFF'};
  color: #0A3E60;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: ${props => props.$active ? '#ED7E13' : '#64748B'};
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #CBD5E1;
  font-size: 0.95rem;
  color: #0A3E60;
  outline: none;
  background: #FFFFFF;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: #ED7E13;
  color: #FFFFFF;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.35);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #DD8F39;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecurityNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  font-size: 0.8rem;
  color: #64748B;
`;

const SuccessBox = styled.div`
  background: #FFFFFF;
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #E2E8F0;
  box-shadow: 0 20px 40px -15px rgba(10, 62, 96, 0.1);
`;

export default function ShopCheckoutPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    city: '',
    neighborhood: ''
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await shopApi.getProduct(productId);
        if (res && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatBrl = (cents) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        product_id: product.id,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          city: formData.city,
          neighborhood: formData.neighborhood
        },
        payment: {
          method: 'direct_link',
          installments: 1
        }
      };

      const res = await shopApi.checkout(payload);
      if (res && res.success) {
        setOrderResult(res);
        if (res.redirect_url) {
          window.open(res.redirect_url, '_blank');
        }
      } else {
        setErrorMsg(res?.message || 'Não foi possível registrar os dados.');
      }
    } catch (err) {
      setErrorMsg('Falha ao registrar dados. Entre em contato com nosso atendimento oficial.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CheckoutContainer>
        <ContentWrapper style={{ textAlign: 'center', padding: '5rem 0' }}>
          Carregando informações do checkout...
        </ContentWrapper>
      </CheckoutContainer>
    );
  }

  if (!product) {
    return (
      <CheckoutContainer>
        <ContentWrapper style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Produto não encontrado.</h2>
          <BackNav onClick={() => navigate('/shop')} style={{ margin: '1rem auto' }}>
            <ArrowLeft size={18} /> Voltar para a Loja
          </BackNav>
        </ContentWrapper>
      </CheckoutContainer>
    );
  }

  if (orderResult) {
    return (
      <CheckoutContainer>
        <ContentWrapper>
          <SuccessBox>
            <div style={{ width: '64px', height: '64px', background: 'rgba(37, 211, 102, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#25D366' }}>
              <CheckCircle2 size={36} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A3E60', marginBottom: '0.75rem' }}>
              {orderResult.redirect_url ? 'Pedido Registrado! Prossiga com o Pagamento Seguro' : (orderResult.status === 'PAID' ? 'Inscrição & Pagamento Confirmados!' : 'Pedido Registrado com Sucesso!')}
            </h1>
            <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
              Recebemos seu pedido <strong>#{orderResult.order_id}</strong> referente ao produto <strong>{product.name}</strong>. Seus dados foram salvos no nosso CRM comercial.
            </p>

            {orderResult.redirect_url && (
              <div style={{ background: '#FFF7ED', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #FED7AA' }}>
                <div style={{ fontWeight: 800, color: '#9A3412', marginBottom: '0.5rem' }}>Página de Pagamento Aberta</div>
                <p style={{ fontSize: '0.9rem', color: '#7C2D12', marginBottom: '1.25rem' }}>
                  Caso a página oficial de pagamento não tenha aberto automaticamente no seu navegador, clique no botão abaixo:
                </p>
                <a
                  href={orderResult.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem 1.5rem',
                    background: '#ED7E13',
                    color: '#FFFFFF',
                    borderRadius: '0.75rem',
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={20} /> Abrir Checkout Oficial ➔
                </a>
              </div>
            )}

            {orderResult.pix_qr_code && (
              <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                <QrCode size={40} style={{ color: '#0A3E60', margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Código PIX Copia e Cola:</div>
                <input 
                  readOnly 
                  value={orderResult.pix_copy_paste || ''} 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', marginBottom: '0.5rem' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a 
                href={`https://wa.me/5518996356825?text=Olá!%20Acabei%20de%20fazer%20o%20pedido%20%23${orderResult.order_id}%20do%20produto%20${encodeURIComponent(product.name)}.%20Gostaria%20de%20acompanhar%20minha%20inscrição.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={20} /> Falar com Atendimento no WhatsApp
              </a>

              <BackNav onClick={() => navigate('/shop')} style={{ margin: '0 auto' }}>
                <ArrowLeft size={16} /> Retornar para a Loja
              </BackNav>
            </div>
          </SuccessBox>
        </ContentWrapper>
      </CheckoutContainer>
    );
  }

  return (
    <CheckoutContainer>
      <ContentWrapper>
        <BackNav onClick={() => navigate('/shop')}>
          <ArrowLeft size={18} /> Voltar para a Loja
        </BackNav>

        <CheckoutGrid>
          <MainCard>
            <form onSubmit={handleSubmit}>
              <SectionTitle>
                <User size={20} color="#ED7E13" /> 1. Seus Dados Cadastrais
              </SectionTitle>

              <FormGroup>
                <Label>Nome Completo *</Label>
                <InputWrapper>
                  <User size={18} />
                  <StyledInput 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="Ex: Dra. Juliana Fernandes"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </FormGroup>

              <TwoCols>
                <FormGroup>
                  <Label>E-mail *</Label>
                  <InputWrapper>
                    <Mail size={18} />
                    <StyledInput 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="juliana@clinica.com.br"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>WhatsApp / Telefone *</Label>
                  <InputWrapper>
                    <Phone size={18} />
                    <StyledInput 
                      type="tel" 
                      name="phone" 
                      required 
                      placeholder="(18) 99999-9999"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </InputWrapper>
                </FormGroup>
              </TwoCols>

              <TwoCols>
                <FormGroup>
                  <Label>CPF *</Label>
                  <InputWrapper>
                    <FileText size={18} />
                    <StyledInput 
                      type="text" 
                      name="cpf" 
                      required 
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Cidade / UF</Label>
                  <InputWrapper>
                    <MapPin size={18} />
                    <StyledInput 
                      type="text" 
                      name="city" 
                      placeholder="Ex: Assis / SP"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </InputWrapper>
                </FormGroup>
              </TwoCols>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '0.5rem', margin: '1.5rem 0', fontSize: '0.85rem' }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <SubmitButton type="submit" disabled={submitting}>
                  <Lock size={18} /> {submitting ? 'Registrando seus dados...' : `Continuar para Pagamento Seguro ➔`}
                </SubmitButton>

                <SecurityNotice style={{ marginTop: '1rem' }}>
                  <ShieldCheck size={16} color="#25D366" />
                  Seus dados estão protegidos. Redirecionamento seguro para o pagamento oficial.
                </SecurityNotice>
              </div>
            </form>
          </MainCard>

          <SummaryCard>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A3E60', marginBottom: '1rem' }}>
              Resumo do Pedido
            </h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <img 
                src={product.image_url} 
                alt={product.name} 
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '0.5rem' }} 
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0A3E60' }}>{product.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#ED7E13', fontWeight: 600 }}>{product.category}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <span>Subtotal</span>
                <span>{formatBrl(product.price_cents)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0A3E60' }}>
                <span>Total</span>
                <span>{formatBrl(product.price_cents)}</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
              <Sparkles size={16} color="#ED7E13" style={{ marginBottom: '0.25rem' }} />
              <div>Garantia de segurança Body Harmony. Atendimento comercial humanizado para ativação da sua vaga.</div>
            </div>
          </SummaryCard>
        </CheckoutGrid>
      </ContentWrapper>
    </CheckoutContainer>
  );
}
