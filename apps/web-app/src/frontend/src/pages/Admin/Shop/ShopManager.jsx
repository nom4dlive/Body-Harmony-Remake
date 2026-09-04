import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  MessageCircle, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Camera,
  UploadCloud,
  ImageIcon,
  Save,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Crown,
  Maximize2,
  Minimize2,
  ChevronLeft
} from 'lucide-react';
import { shopApi } from '../../../services/api';
import AdminLayout from '../components/AdminLayout';
import ProductDrawerEditor from './components/ProductDrawerEditor';
import CongressoCmsTab from './components/CongressoCmsTab';
import TicketModal from './components/TicketModal';
import { usePermissions } from '../../../hooks/usePermissions';
import ScrollableTabs from '../../../components/ui/ScrollableTabs';
import CompactKpiGrid from '../../../components/ui/CompactKpiGrid';
import RichCmsField from '../../../components/ui/RichCmsField';

const Container = styled.div`
  padding: 0.25rem 0.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.65rem;
  margin-bottom: 0.85rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
`;

const MetricCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.55rem;
  padding: 0.7rem 0.95rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 0.65rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.45rem 0.55rem;
    gap: 0.15rem;

    .icon-wrapper {
      display: none;
    }
    .info .label {
      font-size: 0.6rem;
    }
    .info .value {
      font-size: 0.88rem;
    }
  }

  .icon-wrapper {
    width: 34px;
    height: 34px;
    border-radius: 0.45rem;
    background: ${props => props.$bg || 'rgba(10, 62, 96, 0.1)'};
    color: ${props => props.$color || '#0A3E60'};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    .label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
    }
    .value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0A3E60;
    }
  }
`;

const ShopStudioLayout = styled.div`
  display: flex;
  gap: 1.25rem;
  width: 100%;
  position: relative;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ShopNavSidebar = styled.aside`
  width: ${props => props.$collapsed ? '64px' : '250px'};
  flex-shrink: 0;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: ${props => props.$collapsed ? '0.6rem 0.35rem' : '0.85rem'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 1rem;
  transition: width 0.25s cubic-bezier(0.2, 0, 0, 1), padding 0.2s ease;

  @media (max-width: 1024px) {
    width: 100%;
    position: static;
    display: flex;
    overflow-x: auto;
    gap: 0.4rem;
    padding: 0.4rem;
    border-radius: 12px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const ShopNavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'space-between'};
  padding: ${props => props.$collapsed ? '0.65rem 0.35rem' : '0.65rem 0.85rem'};
  border-radius: 10px;
  border: 1px solid ${props => props.$active ? '#ED7E13' : 'transparent'};
  background: ${props => props.$active ? 'linear-gradient(135deg, #0A3E60 0%, #06283D 100%)' : 'transparent'};
  color: ${props => props.$active ? '#FFFFFF' : '#334155'};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  margin-bottom: 0.35rem;
  font-family: inherit;
  position: relative;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #0A3E60 0%, #06283D 100%)' : '#F8FAFC'};
    border-color: ${props => props.$active ? '#ED7E13' : '#CBD5E1'};
  }

  .left {
    display: flex;
    align-items: center;
    justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
    gap: 0.6rem;
    font-size: 0.82rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    svg {
      color: ${props => props.$active ? '#FBBF24' : '#64748B'};
      flex-shrink: 0;
    }
  }

  .count-badge {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    background: ${props => props.$active ? 'rgba(251, 191, 36, 0.2)' : '#E2E8F0'};
    color: ${props => props.$active ? '#FBBF24' : '#475569'};
  }

  @media (max-width: 1024px) {
    width: auto;
    margin-bottom: 0;
    white-space: nowrap;
    padding: 0.5rem 0.85rem;
  }
`;

const ShopMainArea = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex-grow: 1;
  min-width: 260px;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
  }

  input {
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 2.5rem;
    border-radius: 0.5rem;
    border: 1px solid #CBD5E1;
    font-size: 0.9rem;
    outline: none;

    &:focus {
      border-color: #ED7E13;
    }
  }
`;

const DesktopTableWrapper = styled.div`
  display: block;
  overflow-x: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileCardsContainer = styled.div`
  display: none;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileItemCard = styled.div`
  background: #FFFFFF;
  border: 1px solid ${props => props.$expanded ? '#ED7E13' : '#E2E8F0'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
`;

const MobileItemHeader = styled.div`
  padding: 0.75rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  cursor: pointer;
  background: ${props => props.$expanded ? 'rgba(237, 126, 19, 0.03)' : '#FFFFFF'};
  min-height: 52px;

  &:hover {
    background: #F8FAFC;
  }
`;

const MobileItemBody = styled.div`
  padding: 0.85rem;
  background: #F8FAFC;
  border-top: 1px solid #F1F5F9;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  font-size: 0.82rem;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #FFFFFF;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #E2E8F0;

  th {
    background: #F8FAFC;
    color: #475569;
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
    padding: 0.6rem 0.85rem;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 0.55rem 0.85rem;
    font-size: 0.84rem;
    color: #1E293B;
    border-bottom: 1px solid #F1F5F9;
  }

  tr:hover td {
    background: #F8FAFC;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => {
    const s = String(props.$status || '').toUpperCase();
    switch (s) {
      case 'PAID':
      case 'CONFIRMED':
      case 'RECEIVED':
      case 'PAGO': return '#DCFCE7';
      case 'FREE_APPROVED': return '#E0F2FE';
      case 'PENDING':
      case 'AGUARDANDO PAGAMENTO': return '#FEF9C3';
      case 'FAILED':
      case 'CANCELLED':
      case 'REFUNDED':
      case 'CANCELADO': return '#FEE2E2';
      default: return '#E2E8F0';
    }
  }};
  color: ${props => {
    const s = String(props.$status || '').toUpperCase();
    switch (s) {
      case 'PAID':
      case 'CONFIRMED':
      case 'RECEIVED':
      case 'PAGO': return '#166534';
      case 'FREE_APPROVED': return '#0A3E60';
      case 'PENDING':
      case 'AGUARDANDO PAGAMENTO': return '#854D0E';
      case 'FAILED':
      case 'CANCELLED':
      case 'REFUNDED':
      case 'CANCELADO': return '#991B1B';
      default: return '#475569';
    }
  }};
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #0A3E60;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const ProductThumbnail = styled.div`
  width: 48px;
  height: 38px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #0A3E60;
  border: 1px solid #CBD5E1;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-overlay {
    position: absolute;
    inset: 0;
    background: rgba(10, 62, 96, 0.75);
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 700;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .upload-overlay {
    opacity: 1;
  }
`;

export default function ShopManager() {
  const { isSuperadmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('orders');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpandItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Ticket Modal state
  const [selectedOrderForTicket, setSelectedOrderForTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Check-in state
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);

  // Modal / Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // CMS Settings state
  const [cmsSettings, setCmsSettings] = useState({
    hero_title: 'INGRESSOS, CURSOS & CAPACITAÇÕES OFICIAIS',
    hero_subtitle: 'Garanta sua vaga nos maiores eventos e programas avançados de eletroestimulação do Brasil com a segurança oficial Body Harmony.',
    badge_1: 'Pagamento 100% Seguro',
    badge_2: 'Vagas Oficiais Garantidas',
    badge_3: 'Confirmação Imediata',
    announcement_text: '',
    announcement_active: 0,
    support_title: 'Dúvidas sobre ingressos ou inscrições?',
    support_subtitle: 'Nossa equipe de consultores oficiais está disponível para auxiliar você.',
    support_whatsapp: '5518996959486',
    navbar_shop_button_active: 1,
    navbar_shop_button_text: 'Loja & Ingressos',
    navbar_shop_button_badge: 'NOVO',
    navbar_shop_button_badge_active: 1,
    navbar_shop_button_url: '/shop',
    footer_shop_link_active: 1,
  });
  const [savingCms, setSavingCms] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, leadsRes, productsRes, settingsRes] = await Promise.all([
        shopApi.getAdminOrders({ search: searchTerm }),
        shopApi.getAdminLeads({ search: searchTerm }),
        shopApi.getAdminProducts(),
        shopApi.getAdminSettings().catch(() => null)
      ]);

      if (ordersRes?.data) setOrders(ordersRes.data);
      if (leadsRes?.data) setLeads(leadsRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
      if (settingsRes?.data) setCmsSettings(settingsRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados do gestor da loja:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCms = async (e) => {
    e?.preventDefault();
    setSavingCms(true);
    try {
      const res = await shopApi.updateAdminSettings(cmsSettings);
      if (res?.data) {
        setCmsSettings(res.data);
      }
      alert('Textos e configurações da vitrine atualizados com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar CMS:', err);
      if (err?.response?.status === 401 || err?.message?.includes('Unauthorized') || String(err).includes('Unauthorized')) {
        alert('Sua sessão de administrador expirou. Por favor, atualize a página ou faça login novamente no Portal Gestor.');
      } else {
        alert('Erro ao salvar textos da vitrine.');
      }
    } finally {
      setSavingCms(false);
    }
  };

  // Suporte a atalho universal Ctrl+S / Cmd+S para salvar CMS
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTab === 'cms' || activeTab === 'congresso_cms') {
          handleSaveCms(e);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, cmsSettings]);

  const handleResetCms = () => {
    if (window.confirm('Deseja restaurar os textos padrão da vitrine oficial?')) {
      setCmsSettings(prev => ({
        ...prev,
        hero_title: 'INGRESSOS, CURSOS & CAPACITAÇÕES OFICIAIS',
        hero_title_active: 1,
        hero_subtitle: 'Garanta sua vaga nos maiores eventos e programas avançados de eletroestimulação do Brasil com a segurança oficial Body Harmony.',
        hero_subtitle_active: 1,
        badge_1: 'Pagamento 100% Seguro',
        badge_1_active: 1,
        badge_2: 'Vagas Oficiais Garantidas',
        badge_2_active: 1,
        badge_3: 'Confirmação Imediata',
        badge_3_active: 1,
        announcement_text: '',
        announcement_active: 0,
        support_title: 'Dúvidas sobre ingressos ou inscrições?',
        support_subtitle: 'Nossa equipe de consultores oficiais está disponível para auxiliar você.',
        support_whatsapp: '5518996959486',
        support_whatsapp_active: 1,
        navbar_shop_button_active: 1,
        navbar_shop_button_text: 'Loja & Ingressos',
        navbar_shop_button_badge: 'NOVO',
        navbar_shop_button_badge_active: 1,
        navbar_shop_button_url: '/shop',
        footer_shop_link_active: 1,
      }));
    }
  };

  const handleResetCongressoCms = () => {
    if (window.confirm('Deseja restaurar as copys padrão da Landing Page do Congresso?')) {
      setCmsSettings(prev => ({
        ...prev,
        congresso_hero_badge: 'EVENTO PRESENCIAL · 07 DE NOVEMBRO DE 2026',
        congresso_hero_badge_active: 1,
        congresso_hero_location_badge: 'SÃO PAULO · SP',
        congresso_hero_title: 'O Maior Congresso de Musculação Elétrica do Brasil Acontece em Novembro. Você Vai Estar Lá?',
        congresso_hero_subtitle: 'Uma imersão presencial completa sobre EMS (Eletroestimulação Muscular), negócios de elite no mercado fitness e o futuro da musculação elétrica no Brasil — com as maiores referências do setor.',
        congresso_date_text: '07 de Novembro de 2026',
        congresso_location_title: 'Espaço Full Sales — Em frente ao Shopping JK Iguatemi, São Paulo/SP',
        congresso_location_sub: 'A 10 passos do metrô/trem · 15 min do Aeroporto de Congonhas',
        congresso_hero_cta: 'Garanta Seu Ingresso Agora',
        congresso_espaco_label: 'O Local',
        congresso_espaco_title: 'Um Palco à Altura do Congresso que o Mercado Merecia',
        congresso_espaco_subtitle: 'Escolhemos o Espaço Full Sales porque cada detalhe importa quando se trata de aprendizado de alto nível.',
        congresso_sobre_label: 'O Congresso',
        congresso_sobre_title: 'O Que Você Vai Levar Para Sempre Deste Dia',
        congresso_sobre_intro: 'O Congresso Brasileiro de Musculação Elétrica é o único evento no país dedicado exclusivamente ao universo EMS — reunindo profissionais, empreendedores e apaixonados por tecnologia aplicada ao corpo humano.',
        congresso_palestrante_1_name: 'Joselene Silva (Josi)',
        congresso_palestrante_1_role: 'Fundadora & CEO da Body Harmony',
        congresso_palestrante_1_desc: 'A mulher que trouxe a revolução EMS para o Brasil e construiu uma rede de licenciadas de ponta a ponta no território nacional.',
        congresso_palestrante_1_image: '',
        congresso_palestrante_2_name: 'Kaprice',
        congresso_palestrante_2_role: 'Co-fundadora & Diretora de Expansão',
        congresso_palestrante_2_desc: 'A arquiteta da metodologia Body Harmony, responsável por transformar resultados em sistema replicável.',
        congresso_palestrante_2_image: '',
        congresso_oferta_badge: 'Oferta Exclusiva do Congresso',
        congresso_oferta_title: 'Garanta Seu Acesso no 1º Lote com a Melhor Condição do Ano',
        congresso_oferta_copy: 'Aproveite os valores de abertura para o Congresso Brasileiro de Musculação Elétrica. No Ingresso Experience você garante a melhor opção de custo-benefício para aprendizado e networking, e no VIP você garante 100% de crédito integral para a franquia.',
        congresso_oferta_cta: 'Garantir Ingresso no 1º Lote',
        congresso_oferta_note: 'Parcelamento em até 12x no cartão. Virada de lote sujeita à capacidade do auditório.',
        congresso_experience_title: 'Ingresso Experience',
        congresso_experience_badge: 'Conteúdo & Networking',
        congresso_experience_perk_badge: 'Melhor opção Custo-Benefício',
        congresso_experience_cta: 'Garantir Ingresso Experience',
        congresso_vip_title: 'Ingresso VIP Exclusive',
        congresso_vip_badge: '🔥 MAIS ESCOLHIDO • APENAS 40 VAGAS',
        congresso_vip_perk_badge: '🎁 R$ 1.497 em Crédito Integral',
        congresso_vip_cta: 'Garantir Ingresso VIP + Crédito',
        congresso_vip_subtitle: 'Mais que um ingresso — um investimento que se converte em crédito real.',
        congresso_vip_credit_title: '💡 Como funciona o crédito?',
        congresso_vip_credit_desc: 'O valor integral do seu ingresso VIP (R$ 1.497) é contabilizado como crédito na sua adesão ao Licenciamento Body Harmony. Você não perde um centavo — transforma o custo do evento em investimento no seu negócio.',
        congresso_vip_urgency_badge: '🔴 40 vagas apenas',
        congresso_countdown_label: 'Tempo Restante',
        congresso_countdown_title: 'O Congresso começa em:',
        congresso_countdown_urgency: 'As vagas não esperam. Garanta a sua agora.',
        congresso_countdown_cta: 'Inscrever-me Agora',
        congresso_depoimentos_label: 'Depoimentos',
        congresso_depoimentos_title: 'Quem Já Faz Parte do Universo Body Harmony Fala por Nós',
        congresso_faq_label: 'FAQ',
        congresso_faq_title: 'Perguntas Frequentes',
        congresso_footer_title: '07 de Novembro. São Paulo. Sua Vaga Está Esperando.',
        congresso_footer_subtitle: 'Não deixe para amanhã o que pode mudar sua trajetória profissional hoje. O Congresso Brasileiro de Musculação Elétrica é único — e as vagas são limitadas.',
        congresso_sections_order: 'hero,sobre,oferta,vip,tabela,espaco,testemunhos,countdown,faq,footer'
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const formatBrl = (cents) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setIsDrawerOpen(true);
  };

  const handleToggleProductStatus = async (id, currentStatus, name) => {
    try {
      await shopApi.toggleProductStatus(id);
      loadData();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      alert('Erro ao alternar status do produto.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja EXCLUIR o produto "${name}" (ID #${id})?\n\nEsta ação removerá o produto definitivamente do catálogo da loja.`)) {
      try {
        await shopApi.deleteProduct(id);
        alert(`Produto "${name}" excluído com sucesso!`);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        alert('Erro ao excluir produto.');
      }
    }
  };

  const handleValidateOrder = async (orderId) => {
    if (window.confirm(`Deseja validar manualmente o Pedido #${orderId} e emitir o Ingresso Digital oficial com QR Code?`)) {
      try {
        const res = await shopApi.validateOrder(orderId, 'Validação manual pelo Gestor Comercial');
        if (res && res.success) {
          alert(`Pedido #${orderId} validado com sucesso! Ingresso ${res.ticket_code || ''} gerado.`);
        }
        loadData();
      } catch (err) {
        alert('Erro ao validar pedido.');
      }
    }
  };

  const handleOpenTicket = (order) => {
    setSelectedOrderForTicket(order);
    setIsTicketModalOpen(true);
  };

  const handleCheckinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!checkinCode.trim()) return;

    setCheckinLoading(true);
    setCheckinResult(null);
    try {
      const res = await shopApi.checkinTicket(checkinCode.trim());
      setCheckinResult(res);
      if (res && res.success) {
        setCheckinCode('');
        loadData();
      }
    } catch (err) {
      setCheckinResult({
        success: false,
        status: 'ERROR',
        message: 'Erro de comunicação ao processar credenciamento.'
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, customerName) => {
    if (window.confirm(`⚠️ ATENÇÃO: Deseja EXCLUIR definitivamente o Pedido #${orderId} (${customerName})?\n\nEsta ação removerá o pedido e o lead correspondente do sistema.`)) {
      try {
        await shopApi.deleteOrder(orderId);
        alert(`Pedido #${orderId} excluído com sucesso!`);
        loadData();
      } catch (err) {
        alert('Erro ao excluir pedido.');
      }
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (window.confirm(`⚠️ ATENÇÃO: Deseja EXCLUIR o Lead #${leadId} (${leadName})?`)) {
      try {
        await shopApi.deleteLead(leadId);
        alert(`Lead #${leadId} excluído com sucesso!`);
        loadData();
      } catch (err) {
        alert('Erro ao excluir lead.');
      }
    }
  };

  const handleProductPhotoUpload = async (productId, file) => {
    if (!file) return;
    try {
      setUploadingId(productId);
      const res = await shopApi.uploadProductImage(productId, file);
      if (res?.success) {
        alert('Foto do produto atualizada com sucesso!');
        loadData();
      } else {
        alert(res?.message || 'Falha ao enviar foto.');
      }
    } catch (err) {
      console.error('Erro no upload da foto:', err);
      alert('Erro no envio da foto do produto.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSaveImageUrl = async (productId) => {
    const input = document.getElementById(`image-url-input-${productId}`);
    const url = input?.value || '';
    try {
      await shopApi.updateProduct(productId, { image_url: url });
      alert('URL da foto atualizada com sucesso!');
      loadData();
    } catch (err) {
      alert('Erro ao salvar URL da foto.');
    }
  };

  const totalPaidCents = orders
    .filter(o => ['PAID', 'CONFIRMED', 'RECEIVED', 'FREE_APPROVED'].includes(String(o.payment_status || o.status).toUpperCase()))
    .reduce((sum, o) => sum + (parseInt(o.amount_cents, 10) || 0), 0);

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title>
            <ShoppingBag color="#ED7E13" /> Gestão da Loja Virtual & Congresso (Gateway Asaas)
          </Title>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: isFocusMode ? '1.5px solid #ED7E13' : '1px solid #CBD5E1',
                background: isFocusMode ? '#FFF7ED' : '#FFFFFF',
                color: isFocusMode ? '#C2410C' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isFocusMode ? 'Restaurar menu lateral completo' : 'Ocultar menu lateral e maximizar espaço para edição'}
            >
              {isFocusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>{isFocusMode ? 'Painel Completo' : 'Modo Foco (Max. Tela)'}</span>
            </button>
          </div>
        </PageHeader>

        {activeTab !== 'congresso_cms' && (
          <CompactKpiGrid
            items={[
              { label: 'Faturado (Asaas / Total)', value: formatBrl(totalPaidCents), color: '#15803D', icon: DollarSign },
              { label: 'Total de Transações', value: orders.length, color: '#0A3E60', icon: ShoppingBag },
              { label: 'Leads Gerados', value: leads.length, color: '#ED7E13', icon: Users },
            ]}
          />
        )}

        <ShopStudioLayout>
          {/* MENU LATERAL VERTICAL INTEGRADO (MASTER-DETAIL) */}
          <ShopNavSidebar $collapsed={isFocusMode}>
            <div style={{ display: 'flex', justifyContent: isFocusMode ? 'center' : 'space-between', alignItems: 'center', padding: '0.4rem 0.5rem 0.6rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.5rem' }}>
              {!isFocusMode && (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Módulos do E-Shop
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                title={isFocusMode ? 'Expandir Menu' : 'Recolher Menu'}
              >
                {isFocusMode ? <Maximize2 size={14} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {[
              { id: 'orders', label: 'Pedidos & Transações', count: orders.length, icon: CreditCard },
              { id: 'leads', label: 'Leads do E-Shop', count: leads.length, icon: Users },
              { id: 'checkin', label: 'Check-in & Portaria', icon: QrCode },
              { id: 'products', label: 'Catálogo de Produtos', count: products.length, icon: ShoppingBag },
              { id: 'cms', label: 'Textos da Vitrine & CMS', icon: Sparkles },
              { id: 'congresso_cms', label: 'CMS Congresso (07/Nov)', icon: Crown },
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <ShopNavItem
                  key={tab.id}
                  type="button"
                  $active={isSelected}
                  $collapsed={isFocusMode}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                >
                  <div className="left">
                    <Icon size={16} />
                    {!isFocusMode && <span>{tab.label}</span>}
                  </div>
                  {!isFocusMode && typeof tab.count !== 'undefined' && (
                    <span className="count-badge">
                      {tab.count}
                    </span>
                  )}
                </ShopNavItem>
              );
            })}
          </ShopNavSidebar>

          {/* ÁREA DE CONTEÚDO PRINCIPAL À DIREITA */}
          <ShopMainArea>
            {activeTab !== 'cms' && activeTab !== 'congresso_cms' && (
          <FilterBar>
            <SearchInput>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nome, email, telefone, CPF ou identificador..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>

            {activeTab === 'products' && (
              <button
                onClick={handleCreateProduct}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(237, 126, 19, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} /> + Novo Produto
              </button>
            )}
          </FilterBar>
        )}

        {activeTab === 'orders' && (
          <>
            <DesktopTableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th>ID / Data</th>
                    <th>Cliente</th>
                    <th>Produto / Lote</th>
                    <th>Valor</th>
                    <th>Método</th>
                    <th>Status Gateway (Asaas)</th>
                    <th>Ações Comerciais</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => {
                      const currentStatus = order.payment_status || order.status;
                      const isPaid = ['PAID', 'CONFIRMED', 'RECEIVED', 'FREE_APPROVED'].includes(String(currentStatus).toUpperCase());
                      return (
                        <tr key={`${order.source_type || 'order'}-${order.id}`}>
                          <td>
                            <strong>#{order.id}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}
                            </div>
                            {order.source_type === 'congress_registration' && (
                              <span style={{ fontSize: '0.65rem', background: '#0A3E60', color: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginTop: '2px' }}>
                                CONGRESSO
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.customer_email}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.customer_phone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.product_name || `Produto #${order.product_id}`}</div>
                            <div style={{ fontSize: '0.75rem', color: '#ED7E13', fontWeight: 600 }}>{order.product_category || 'Loja Oficial'}</div>
                          </td>
                          <td>
                            <strong>{formatBrl(order.amount_cents)}</strong>
                            {order.installments > 1 && (
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.installments}x</div>
                            )}
                          </td>
                          <td>
                            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                              {order.payment_method}
                            </span>
                          </td>
                          <td>
                            <StatusBadge $status={currentStatus}>{currentStatus}</StatusBadge>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <a 
                                href={`https://wa.me/55${(order.customer_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                  order.ticket_token 
                                    ? `Olá ${order.customer_name}! Sua inscrição para o 1º Congresso Brasileiro de Musculação Elétrica está confirmada! 🎉\n\nAcesse sua credencial oficial com QR Code aqui: https://bodyharmony.com.br/congresso (Token: ${order.ticket_token})\n\nNos vemos em São Paulo!`
                                    : `Olá ${order.customer_name}, confirmamos seu pedido Body Harmony!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                              >
                                <ActionButton style={{ borderColor: '#25D366', color: '#166534' }}>
                                  <MessageCircle size={14} color="#25D366" /> WhatsApp
                                </ActionButton>
                              </a>

                              {!isPaid && (
                                <ActionButton onClick={() => handleValidateOrder(order.id)} style={{ borderColor: '#ED7E13', color: '#ED7E13' }}>
                                  <CheckCircle2 size={14} color="#ED7E13" /> Validar
                                </ActionButton>
                              )}

                              <ActionButton 
                                onClick={() => handleOpenTicket(order)}
                                style={{ background: '#0A3E60', color: '#FFFFFF', borderColor: '#0A3E60' }}
                              >
                                <QrCode size={14} color="#ED7E13" /> 🎫 Ver Ingresso
                              </ActionButton>

                              {isSuperadmin && (
                                <ActionButton 
                                  onClick={() => handleDeleteOrder(order.id, order.customer_name)}
                                  style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
                                  title="Excluir Pedido (Superadmin)"
                                >
                                  <Trash2 size={14} color="#DC2626" />
                                </ActionButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </DataTable>
            </DesktopTableWrapper>

            <MobileCardsContainer>
              {orders.length === 0 ? (
                <div style={{ background: '#FFFFFF', padding: '2rem', textAlign: 'center', color: '#64748B', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  Nenhum pedido encontrado.
                </div>
              ) : (
                orders.map(order => {
                  const currentStatus = order.payment_status || order.status;
                  const isPaid = ['PAID', 'CONFIRMED', 'RECEIVED', 'FREE_APPROVED'].includes(String(currentStatus).toUpperCase());
                  const isExp = !!expandedItems[`order-${order.id}`];
                  const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');

                  return (
                    <MobileItemCard key={`m-order-${order.id}`} $expanded={isExp}>
                      <MobileItemHeader onClick={() => toggleExpandItem(`order-${order.id}`)} $expanded={isExp}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, color: '#0A3E60', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            #{order.id} {order.customer_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#ED7E13', fontWeight: 700, marginTop: '2px' }}>
                            {formatBrl(order.amount_cents)} · {order.product_name || `Item #${order.product_id}`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                          <StatusBadge $status={currentStatus} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>{currentStatus}</StatusBadge>
                          <div style={{ color: isExp ? '#ED7E13' : '#94A3B8' }}>
                            {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </MobileItemHeader>

                      {isExp && (
                        <MobileItemBody>
                          <div><strong>Email:</strong> {order.customer_email || '—'}</div>
                          <div><strong>Telefone:</strong> {order.customer_phone || '—'}</div>
                          <div><strong>Método:</strong> {order.payment_method} {order.installments > 1 ? `(${order.installments}x)` : ''}</div>
                          <div><strong>Data:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '—'}</div>

                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                                  order.ticket_token 
                                    ? `Olá ${order.customer_name}! Sua inscrição para o 1º Congresso Brasileiro de Musculação Elétrica está confirmada! 🎉\n\nAcesse sua credencial oficial com QR Code aqui: https://bodyharmony.com.br/congresso (Token: ${order.ticket_token})\n\nNos vemos em São Paulo!`
                                    : `Olá ${order.customer_name}, confirmamos seu pedido Body Harmony!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', flex: 1 }}
                              >
                                <ActionButton style={{ borderColor: '#25D366', color: '#166534', width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
                                  <MessageCircle size={15} color="#25D366" /> WhatsApp
                                </ActionButton>
                              </a>
                            )}

                            <ActionButton 
                              onClick={() => handleOpenTicket(order)}
                              style={{ background: '#0A3E60', color: '#FFFFFF', borderColor: '#0A3E60', flex: 1, justifyContent: 'center', padding: '0.6rem' }}
                            >
                              <QrCode size={15} color="#ED7E13" /> Ver Ingresso
                            </ActionButton>

                            {!isPaid && (
                              <ActionButton onClick={() => handleValidateOrder(order.id)} style={{ borderColor: '#ED7E13', color: '#ED7E13', width: '100%', justifyContent: 'center' }}>
                                <CheckCircle2 size={15} color="#ED7E13" /> Validar Pagamento
                              </ActionButton>
                            )}
                          </div>
                        </MobileItemBody>
                      )}
                    </MobileItemCard>
                  );
                })
              )}
            </MobileCardsContainer>
          </>
        )}

        {activeTab === 'leads' && (
          <>
            <DesktopTableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Lead / Contato</th>
                    <th>Interesse</th>
                    <th>Cidade / Região</th>
                    <th>Status Funil</th>
                    <th>Contato Rápido</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        Nenhum lead encontrado.
                      </td>
                    </tr>
                  ) : (
                    leads.map(lead => (
                      <tr key={lead.id}>
                        <td style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{lead.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{lead.email}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{lead.phone}</div>
                        </td>
                        <td>
                          <strong>{lead.offering_title}</strong>
                          {lead.value_cents > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{formatBrl(lead.value_cents)}</div>
                          )}
                        </td>
                        <td>
                          {lead.city ? `${lead.city} ${lead.neighborhood ? `- ${lead.neighborhood}` : ''}` : 'Não informado'}
                        </td>
                        <td>
                          <StatusBadge $status={lead.status}>{lead.status}</StatusBadge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <a 
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20equipe%20Body%20Harmony!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <ActionButton style={{ borderColor: '#25D366', color: '#166534' }}>
                                <MessageCircle size={14} color="#25D366" /> WhatsApp
                              </ActionButton>
                            </a>

                            {isSuperadmin && (
                              <ActionButton 
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
                                title="Excluir Lead (Superadmin)"
                              >
                                <Trash2 size={14} color="#DC2626" />
                              </ActionButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </DataTable>
            </DesktopTableWrapper>

            <MobileCardsContainer>
              {leads.length === 0 ? (
                <div style={{ background: '#FFFFFF', padding: '2rem', textAlign: 'center', color: '#64748B', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  Nenhum lead encontrado.
                </div>
              ) : (
                leads.map(lead => {
                  const isExp = !!expandedItems[`lead-${lead.id}`];
                  const cleanPhone = (lead.phone || '').replace(/\D/g, '');

                  return (
                    <MobileItemCard key={`m-lead-${lead.id}`} $expanded={isExp}>
                      <MobileItemHeader onClick={() => toggleExpandItem(`lead-${lead.id}`)} $expanded={isExp}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, color: '#0A3E60', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lead.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#ED7E13', fontWeight: 700, marginTop: '2px' }}>
                            {lead.offering_title}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                          <StatusBadge $status={lead.status} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>{lead.status}</StatusBadge>
                          <div style={{ color: isExp ? '#ED7E13' : '#94A3B8' }}>
                            {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </MobileItemHeader>

                      {isExp && (
                        <MobileItemBody>
                          <div><strong>Email:</strong> {lead.email || '—'}</div>
                          <div><strong>Telefone:</strong> {lead.phone || '—'}</div>
                          <div><strong>Cidade / Região:</strong> {lead.city ? `${lead.city} ${lead.neighborhood ? `- ${lead.neighborhood}` : ''}` : 'Não informado'}</div>
                          <div><strong>Data:</strong> {new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>

                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                            {cleanPhone && (
                              <a 
                                href={`https://wa.me/55${cleanPhone}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20equipe%20Body%20Harmony!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                              >
                                <ActionButton style={{ borderColor: '#25D366', color: '#166534', width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                                  <MessageCircle size={16} color="#25D366" /> Iniciar Conversa no WhatsApp
                                </ActionButton>
                              </a>
                            )}
                          </div>
                        </MobileItemBody>
                      )}
                    </MobileItemCard>
                  );
                })
              )}
            </MobileCardsContainer>
          </>
        )}

        {activeTab === 'checkin' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(10, 62, 96, 0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A3E60', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={22} color="#ED7E13" /> Credenciamento & Portaria do Congresso
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
                Escaneie o QR Code do passaporte ou digite o código único (ex: <code>TKT-CONG-...</code>, <code>BH-ING-...</code> ou CPF) para validar a entrada em tempo real.
              </p>

              <form onSubmit={handleCheckinSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Escaneie o QR Code ou digite o código / CPF..." 
                  value={checkinCode}
                  onChange={(e) => setCheckinCode(e.target.value)}
                  style={{
                    flexGrow: 1,
                    minWidth: '240px',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: 700,
                    outline: 'none',
                    letterSpacing: '0.5px'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={checkinLoading || !checkinCode.trim()}
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(237, 126, 19, 0.3)',
                    opacity: (checkinLoading || !checkinCode.trim()) ? 0.6 : 1
                  }}
                >
                  {checkinLoading ? 'Verificando...' : '✓ Validar Check-in'}
                </button>
              </form>

              {checkinResult && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  border: `2px solid ${checkinResult.success ? '#10B981' : '#EF4444'}`,
                  background: checkinResult.success ? '#ECFDF5' : '#FEF2F2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: checkinResult.order ? '0.75rem' : 0 }}>
                    {checkinResult.success ? (
                      <CheckCircle2 size={28} color="#10B981" />
                    ) : (
                      <AlertCircle size={28} color="#EF4444" />
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: checkinResult.success ? '#065F46' : '#991B1B' }}>
                        {checkinResult.message}
                      </div>
                    </div>
                  </div>

                  {checkinResult.order && (
                    <div style={{ background: '#FFFFFF', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #E2E8F0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <div><strong>Participante / Atleta:</strong> {checkinResult.order.customer_name}</div>
                      <div><strong>Ingresso / Lote:</strong> {checkinResult.order.product_name || checkinResult.order.tier_name}</div>
                      {checkinResult.order.category && (
                        <div><strong>Categoria:</strong> {checkinResult.order.category}</div>
                      )}
                      <div><strong>CPF:</strong> {checkinResult.order.customer_cpf_masked || checkinResult.order.customer_cpf || 'Não informado'}</div>
                      <div><strong>Código / Token:</strong> <code>{checkinResult.order.ticket_code || checkinResult.order.ticket_token}</code></div>
                      {checkinResult.order.checked_in_at && (
                        <div style={{ color: '#166534', fontWeight: 700 }}><strong>Horário do Check-in:</strong> {checkinResult.order.checked_in_at}</div>
                      )}

                      {!checkinResult.success && checkinResult.status === 'UNPAID' && checkinResult.order.id && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <ActionButton 
                            onClick={() => handleValidateOrder(checkinResult.order.id)}
                            style={{ background: '#ED7E13', color: '#FFFFFF', borderColor: '#ED7E13', width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                          >
                            <CheckCircle2 size={16} color="#FFFFFF" /> Liberar e Validar Entrada Manualmente
                          </ActionButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A3E60', margin: '0 0 1rem 0' }}>
                Últimos Credenciamentos Realizados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {orders.filter(o => o.checked_in).length === 0 ? (
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Nenhum check-in realizado ainda.</div>
                ) : (
                  orders.filter(o => o.checked_in).slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                      <div>
                        <strong>{o.customer_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.ticket_code || `#${o.id}`} · {o.product_name}</div>
                      </div>
                      <div style={{ color: '#166534', fontWeight: 700, fontSize: '0.8rem' }}>
                        ✓ {new Date(o.checked_in_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <DesktopTableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Foto do Produto</th>
                    <th>Produto & Categoria</th>
                    <th>Preço à Vista</th>
                    <th>Link Direto de Pagamento (Oficial)</th>
                    <th>Vagas</th>
                    <th>Status (Loja)</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        Nenhum produto cadastrado. Clique em "+ Novo Produto" acima para começar.
                      </td>
                    </tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id}>
                        <td style={{ width: '130px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ProductThumbnail 
                              onClick={() => handleEditProduct(p)}
                              title="Clique para editar as informações ou foto"
                            >
                              <img 
                                src={p.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} 
                                alt={p.name} 
                              />
                              <div className="upload-overlay">
                                <Camera size={12} />
                              </div>
                            </ProductThumbnail>

                            <div>
                              <input 
                                type="file"
                                id={`file-upload-${p.id}`}
                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleProductPhotoUpload(p.id, file);
                                }}
                              />
                              <ActionButton 
                                onClick={() => document.getElementById(`file-upload-${p.id}`)?.click()}
                                disabled={uploadingId === p.id}
                                style={{ 
                                  borderColor: '#ED7E13', 
                                  color: '#ED7E13',
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.45rem',
                                  minHeight: 'auto'
                                }}
                                title="Alterar imagem do produto"
                              >
                                <UploadCloud size={11} />
                                {uploadingId === p.id ? '...' : 'Upload'}
                              </ActionButton>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.88rem', lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {p.name}
                            {p.payment_link_url && (
                              <span style={{
                                background: 'rgba(74, 222, 128, 0.12)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '3px',
                                letterSpacing: '0.03em'
                              }}>🔗 Asaas</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#ED7E13', fontWeight: 600 }}>{p.category}</div>
                          {p.tagline && (
                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{p.tagline}"
                            </div>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{formatBrl(p.price_cents)}</strong>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>ou 12x no cartão</div>
                        </td>
                        <td style={{ minWidth: '220px' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <input 
                              type="text"
                              placeholder="https://sandbox.asaas.com/c/... ou link direto"
                              defaultValue={p.payment_link_url || ''}
                              id={`link-input-${p.id}`}
                              style={{
                                padding: '0.3rem 0.5rem',
                                borderRadius: '0.35rem',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.74rem',
                                width: '100%',
                                height: '30px'
                              }}
                            />
                            <ActionButton 
                              onClick={async () => {
                                const val = document.getElementById(`link-input-${p.id}`)?.value || '';
                                try {
                                  await shopApi.updateProduct(p.id, { payment_link_url: val });
                                  alert(`Link de pagamento salvo para: ${p.name}!`);
                                  loadData();
                                } catch (e) {
                                  alert('Erro ao salvar link de pagamento.');
                                }
                              }}
                              style={{ background: '#0A3E60', color: '#FFFFFF', whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '0.3rem 0.6rem', height: '30px' }}
                            >
                              Salvar
                            </ActionButton>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                            {p.stock_limit ? `${p.stock_limit} vagas` : 'Ilimitado'}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleToggleProductStatus(p.id, p.is_active, p.name)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '2rem',
                              border: p.is_active ? '1px solid #86EFAC' : '1px solid #FECACA',
                              background: p.is_active ? '#F0FDF4' : '#FEF2F2',
                              color: p.is_active ? '#166534' : '#991B1B',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Clique para alternar o status do produto na vitrine"
                          >
                            {p.is_active ? <ToggleRight size={14} color="#16A34A" /> : <ToggleLeft size={14} color="#DC2626" />}
                            {p.is_active ? 'Ativo na Loja' : 'Inativo (Oculto)'}
                          </button>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                            <ActionButton 
                              onClick={() => handleEditProduct(p)}
                              style={{ borderColor: '#0A3E60', color: '#0A3E60', padding: '0.3rem 0.55rem', fontSize: '0.74rem' }}
                              title="Editar todos os 12 campos deste produto"
                            >
                              <Edit3 size={13} /> Editar
                            </ActionButton>
                            <ActionButton 
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              style={{ borderColor: '#EF4444', color: '#EF4444', padding: '0.3rem 0.45rem' }}
                              title="Excluir produto definitivamente"
                            >
                              <Trash2 size={13} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </DataTable>
            </DesktopTableWrapper>

            <MobileCardsContainer>
              {products.length === 0 ? (
                <div style={{ background: '#FFFFFF', padding: '2rem', textAlign: 'center', color: '#64748B', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  Nenhum produto cadastrado.
                </div>
              ) : (
                products.map(p => {
                  const isExp = !!expandedItems[`prod-${p.id}`];

                  return (
                    <MobileItemCard key={`m-prod-${p.id}`} $expanded={isExp}>
                      <MobileItemHeader onClick={() => toggleExpandItem(`prod-${p.id}`)} $expanded={isExp}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                          <img 
                            src={p.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} 
                            alt={p.name}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1', flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#0A3E60', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#ED7E13', fontWeight: 700 }}>
                              {p.category} · {formatBrl(p.price_cents)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                          <StatusBadge $status={p.is_active ? 'PAID' : 'CANCELLED'} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                            {p.is_active ? 'ATIVO' : 'INATIVO'}
                          </StatusBadge>
                          <div style={{ color: isExp ? '#ED7E13' : '#94A3B8' }}>
                            {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </MobileItemHeader>

                      {isExp && (
                        <MobileItemBody>
                          {p.tagline && <div style={{ color: '#64748B', fontStyle: 'italic' }}>"{p.tagline}"</div>}
                          <div><strong>Preço:</strong> {formatBrl(p.price_cents)}</div>
                          {p.stock_limit && <div><strong>Vagas:</strong> {p.stock_limit}</div>}
                          {p.payment_link_url && (
                            <div>
                              <strong>Link Pagamento:</strong>{' '}
                              <a href={p.payment_link_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', wordBreak: 'break-all' }}>
                                {p.payment_link_url}
                              </a>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                            <ActionButton onClick={() => handleEditProduct(p)} style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}>
                              <Edit3 size={15} /> Editar Produto
                            </ActionButton>

                            <ActionButton 
                              onClick={() => document.getElementById(`file-upload-${p.id}`)?.click()}
                              disabled={uploadingId === p.id}
                              style={{ borderColor: '#ED7E13', color: '#ED7E13', flex: 1, justifyContent: 'center', padding: '0.6rem' }}
                            >
                              <UploadCloud size={15} /> {uploadingId === p.id ? '...' : 'Alterar Foto'}
                            </ActionButton>
                          </div>
                        </MobileItemBody>
                      )}
                    </MobileItemCard>
                  );
                })
              )}
            </MobileCardsContainer>
          </>
        )}

        {/* CMS Tab: Personalização de Textos e Toggles da Vitrine */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveCms} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            {/* Live Preview Box */}
            <div style={{
              background: 'linear-gradient(135deg, #0A3E60 0%, #06263B 100%)',
              borderRadius: '1rem',
              padding: '2rem',
              color: '#FFFFFF',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(10, 62, 96, 0.25)',
              position: 'relative'
            }}>
              <span style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'rgba(237, 126, 19, 0.2)', 
                color: '#ED7E13', 
                padding: '0.25rem 0.6rem', 
                borderRadius: '0.4rem', 
                fontSize: '0.72rem', 
                fontWeight: 700 
              }}>
                Prévia da Vitrine /shop
              </span>

              {Boolean(cmsSettings.hero_title_active !== 0) && (
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {cmsSettings.hero_title || 'INGRESSOS, CURSOS & CAPACITAÇÕES OFICIAIS'}
                </h2>
              )}

              {Boolean(cmsSettings.hero_subtitle_active !== 0) && (
                <p style={{ fontSize: '0.95rem', color: '#E2E8F0', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  {cmsSettings.hero_subtitle || 'Garanta sua vaga nos maiores eventos e programas avançados de eletroestimulação do Brasil.'}
                </p>
              )}

              {Boolean(cmsSettings.trust_bar_active !== 0) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {Boolean(cmsSettings.badge_1_active !== 0 && cmsSettings.badge_1) && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '2rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={14} color="#ED7E13" /> {cmsSettings.badge_1}
                    </div>
                  )}
                  {Boolean(cmsSettings.badge_2_active !== 0 && cmsSettings.badge_2) && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '2rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} color="#ED7E13" /> {cmsSettings.badge_2}
                    </div>
                  )}
                  {Boolean(cmsSettings.badge_3_active !== 0 && cmsSettings.badge_3) && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '2rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={14} color="#ED7E13" /> {cmsSettings.badge_3}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Fields Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {/* Card 0: Botão no Menu Superior (Navbar) & Rodapé */}
              <div style={{ background: '#FFFFFF', border: '2px solid #ED7E13', borderRadius: '0.75rem', padding: '1.5rem', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A3E60', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="#ED7E13" /> 🎯 Botão "Loja & Ingressos" (Menu Superior & Rodapé)
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 800, color: cmsSettings.navbar_shop_button_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.navbar_shop_button_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, navbar_shop_button_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.navbar_shop_button_active !== 0 ? '✓ Exibir no Menu (Navbar)' : 'Oculto no Menu'}
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 800, color: cmsSettings.footer_shop_link_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.footer_shop_link_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, footer_shop_link_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.footer_shop_link_active !== 0 ? '✓ Exibir no Rodapé' : 'Oculto no Rodapé'}
                    </label>
                  </div>
                </div>

                {/* Prévia do Botão Real */}
                <div style={{ padding: '0.85rem 1.25rem', background: '#051A29', borderRadius: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Prévia ao Vivo do Botão no Topo:
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ED7E13', fontWeight: 800, fontSize: '0.92rem', padding: '0.35rem 0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(237, 126, 19, 0.3)' }}>
                    <span>{cmsSettings.navbar_shop_button_text || 'Loja & Ingressos'}</span>
                    {cmsSettings.navbar_shop_button_badge_active !== 0 && Boolean(cmsSettings.navbar_shop_button_badge) && (
                      <span style={{
                        background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        letterSpacing: '0.3px',
                        lineHeight: 1.2
                      }}>
                        {cmsSettings.navbar_shop_button_badge}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                      1. Texto Principal do Botão:
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Loja & Ingressos, Ingressos Congresso, E-Shop"
                      value={cmsSettings.navbar_shop_button_text || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, navbar_shop_button_text: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        2. Tag / Selo de Destaque:
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.navbar_shop_button_badge_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={cmsSettings.navbar_shop_button_badge_active !== 0}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, navbar_shop_button_badge_active: e.target.checked ? 1 : 0 })}
                        />
                        {cmsSettings.navbar_shop_button_badge_active !== 0 ? 'Tag Ativa' : 'Ocultar Tag'}
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ex: NOVO, 2026, LOTE 2, VIP"
                      value={cmsSettings.navbar_shop_button_badge || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, navbar_shop_button_badge: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                      3. Link de Destino (URL):
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: /shop, /congresso, /shop/checkout/bh-prod-vip ou link externo"
                      value={cmsSettings.navbar_shop_button_url || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, navbar_shop_button_url: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 1: Hero Section */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3E60', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="#ED7E13" /> 1. Seção Hero (Topo)
                </h3>

                <RichCmsField
                  label="Título Principal"
                  value={cmsSettings.hero_title || ''}
                  onChange={(val) => setCmsSettings({ ...cmsSettings, hero_title: val })}
                  showPreviewDefault={true}
                  activeBadge={
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: cmsSettings.hero_title_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.hero_title_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, hero_title_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.hero_title_active !== 0 ? '✓ Exibir Título' : 'Oculto'}
                    </label>
                  }
                />

                <RichCmsField
                  label="Subtítulo / Frase de Impacto"
                  value={cmsSettings.hero_subtitle || ''}
                  onChange={(val) => setCmsSettings({ ...cmsSettings, hero_subtitle: val })}
                  multiline={true}
                  rows={3}
                  showPreviewDefault={true}
                  activeBadge={
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: cmsSettings.hero_subtitle_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.hero_subtitle_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, hero_subtitle_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.hero_subtitle_active !== 0 ? '✓ Exibir Subtítulo' : 'Oculto'}
                    </label>
                  }
                />
              </div>

              {/* Card 2: Selos de Confiança */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1rem 0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3E60', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="#ED7E13" /> 2. Selos de Confiança
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: cmsSettings.trust_bar_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={cmsSettings.trust_bar_active !== 0}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, trust_bar_active: e.target.checked ? 1 : 0 })}
                    />
                    {cmsSettings.trust_bar_active !== 0 ? '✓ Barra Ativa' : 'Barra Oculta'}
                  </label>
                </div>

                <div style={{ marginBottom: '0.75rem', opacity: cmsSettings.trust_bar_active === 0 ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      Selo 1 (Garantia de Pagamento)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.badge_1_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.badge_1_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, badge_1_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.badge_1_active !== 0 ? 'Ativo' : 'Oculto'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={cmsSettings.badge_1}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, badge_1: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem', opacity: cmsSettings.trust_bar_active === 0 ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      Selo 2 (Vagas / Exclusividade)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.badge_2_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.badge_2_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, badge_2_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.badge_2_active !== 0 ? 'Ativo' : 'Oculto'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={cmsSettings.badge_2}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, badge_2: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ opacity: cmsSettings.trust_bar_active === 0 ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      Selo 3 (Velocidade de Confirmação)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.badge_3_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.badge_3_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, badge_3_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.badge_3_active !== 0 ? 'Ativo' : 'Oculto'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={cmsSettings.badge_3}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, badge_3: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Card 3: Barra de Anúncio e Filtros */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3E60', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#ED7E13" /> 3. Barra de Destaque & Filtros
                </h3>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      Texto do Anúncio de Topo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: cmsSettings.announcement_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={Boolean(cmsSettings.announcement_active)}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, announcement_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.announcement_active ? '✓ Anúncio Ativo' : 'Anúncio Oculto'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ex: 🔥 Lote 1 com Condições Especiais por tempo limitado"
                    value={cmsSettings.announcement_text}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, announcement_text: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ padding: '0.9rem', background: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#0A3E60', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={cmsSettings.filters_active !== 0}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, filters_active: e.target.checked ? 1 : 0 })}
                    />
                    Exibir Barra de Filtros de Categoria (Todos, Eventos, Cursos, etc.)
                  </label>
                </div>
              </div>

              {/* Card 4: Suporte e WhatsApp */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3E60', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageCircle size={18} color="#25D366" /> 4. Suporte & Atendimento
                </h3>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      Chamada de Dúvidas (Topo)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.support_topbar_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={cmsSettings.support_topbar_active !== 0}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, support_topbar_active: e.target.checked ? 1 : 0 })}
                      />
                      {cmsSettings.support_topbar_active !== 0 ? 'Ativo' : 'Oculto'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={cmsSettings.support_title}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, support_title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                        Número do WhatsApp (com DDI/DDD)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: cmsSettings.support_whatsapp_active !== 0 ? '#166534' : '#991B1B', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={cmsSettings.support_whatsapp_active !== 0}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, support_whatsapp_active: e.target.checked ? 1 : 0 })}
                        />
                        {cmsSettings.support_whatsapp_active !== 0 ? 'Ativo' : 'Oculto'}
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={cmsSettings.support_whatsapp || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, support_whatsapp: e.target.value })}
                      placeholder="5518996959486"
                      style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Texto / Rótulo do Botão de WhatsApp
                    </label>
                    <input 
                      type="text" 
                      value={cmsSettings.support_whatsapp_button_text || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, support_whatsapp_button_text: e.target.value })}
                      placeholder="Atendimento Oficial"
                      style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Mensagem Automática Pré-preenchida (ao iniciar conversa)
                  </label>
                  <textarea 
                    rows={2}
                    value={cmsSettings.support_whatsapp_message || ''}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, support_whatsapp_message: e.target.value })}
                    placeholder="Olá! Gostaria de tirar dúvidas sobre os produtos e cursos da Body Harmony."
                    style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                    Esta mensagem será automaticamente codificada no link oficial <code>https://wa.me/&lt;número&gt;?text=...</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <ActionButton 
                type="button" 
                onClick={handleResetCms}
                style={{ borderColor: '#94A3B8', color: '#64748B', padding: '0.65rem 1.25rem' }}
              >
                Restaurar Padrões
              </ActionButton>

              <button
                type="submit"
                disabled={savingCms}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(237, 126, 19, 0.3)'
                }}
              >
                <Save size={18} />
                {savingCms ? 'Salvando Alterações...' : 'Salvar Textos & Toggles'}
              </button>
            </div>
          </form>
        )}

        {/* Guia de Edição Dedicada — CMS Congresso Brasileiro de Musculação Elétrica (PLAN-093) */}
        {activeTab === 'congresso_cms' && (
          <CongressoCmsTab
            settings={cmsSettings}
            onChange={setCmsSettings}
            onSave={handleSaveCms}
            onReset={handleResetCongressoCms}
            saving={savingCms}
          />
        )}
          </ShopMainArea>
        </ShopStudioLayout>

        {/* Drawer Lateral Luxury de Criação e Edição */}
        <ProductDrawerEditor
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          product={editingProduct}
          onSaved={loadData}
        />

        {/* Modal Luxury de Visualização e Envio do Ingresso Digital (PLAN-142) */}
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          order={selectedOrderForTicket}
        />
      </Container>
    </AdminLayout>
  );
}
