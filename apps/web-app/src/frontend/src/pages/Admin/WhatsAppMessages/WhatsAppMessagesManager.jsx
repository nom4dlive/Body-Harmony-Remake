import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/AdminLayout';
import { whatsappApi } from '../../../services/api';
import {
  FaWhatsapp, FaCopy, FaPaperPlane, FaSearch, FaPlus,
  FaEdit, FaTrash, FaCheckCircle, FaCrown, FaGraduationCap,
  FaFileContract, FaComments, FaInfoCircle
} from 'react-icons/fa';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #06283D 100%);
  border-radius: 14px;
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px -5px rgba(10, 62, 96, 0.3);
  border-left: 5px solid #ED7E13;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
  }
`;

const HeaderTitle = styled.div`
  h1 {
    font-size: 1.6rem;
    margin: 0 0 0.4rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;

    svg {
      color: #25D366;
    }
  }

  p {
    margin: 0;
    color: #94A3B8;
    font-size: 0.95rem;
  }
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CategoryTab = styled.button`
  padding: 0.65rem 1.2rem;
  min-height: 44px;
  border-radius: 30px;
  border: 1px solid ${({ $active }) => ($active ? '#ED7E13' : '#CBD5E1')};
  background: ${({ $active }) => ($active ? '#ED7E13' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#475569')};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => ($active ? '0 4px 12px rgba(237, 126, 19, 0.3)' : 'none')};

  &:hover {
    border-color: #ED7E13;
    color: ${({ $active }) => ($active ? 'white' : '#ED7E13')};
  }
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 280px;

  input {
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 2.5rem;
    min-height: 44px;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    font-size: 0.9rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #0A3E60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 1.25rem 1.25rem 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: #0A3E60;
    font-weight: 700;
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 0.825rem;
    color: #64748B;
  }
`;

const CategoryBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  background: ${({ $category }) => {
    switch ($category) {
      case 'LICENCIADAS': return '#FEF3C7';
      case 'ALUNAS': return '#E0F2FE';
      case 'CONTRATOS': return '#F1F5F9';
      default: return '#DCFCE7';
    }
  }};
  color: ${({ $category }) => {
    switch ($category) {
      case 'LICENCIADAS': return '#B45309';
      case 'ALUNAS': return '#0369A1';
      case 'CONTRATOS': return '#475569';
      default: return '#15803D';
    }
  }};
`;

const WhatsAppBubble = styled.div`
  background: #EFEAE2;
  background-image: radial-gradient(#CBD5E1 1px, transparent 0);
  background-size: 16px 16px;
  padding: 1.25rem;
  margin: 0.75rem 1.25rem;
  border-radius: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;

  .bubble {
    background: #FFFFFF;
    border-radius: 8px 8px 8px 0;
    padding: 0.9rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    font-size: 0.875rem;
    line-height: 1.5;
    color: #111827;
    white-space: pre-wrap;
    word-break: break-word;
    border-left: 3px solid #25D366;
  }
`;

const CardFooter = styled.div`
  padding: 1rem 1.25rem;
  background: #F8FAFC;
  border-top: 1px solid #F1F5F9;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;

  &.secondary {
    background: white;
    border: 1px solid #CBD5E1;
    color: #334155;

    &:hover {
      background: #F1F5F9;
      border-color: #94A3B8;
    }
  }

  &.primary {
    background: #25D366;
    border: none;
    color: white;

    &:hover {
      background: #1EBE57;
      box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
    }
  }

  &.edit {
    min-width: 44px;
    flex: 0;
    background: white;
    border: 1px solid #CBD5E1;
    color: #475569;

    &:hover {
      background: #F1F5F9;
      color: #ED7E13;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 14px;
  width: 92%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  .modal-header {
    padding: 1.1rem 1.5rem;
    background: #0A3E60;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    button {
      background: none;
      border: none;
      color: white;
      font-size: 1.6rem;
      cursor: pointer;
    }
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #0A3E60;
  color: white;
  padding: 0.9rem 1.4rem;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 2000;
  font-weight: 600;
  font-size: 0.9rem;
  border-left: 4px solid #25D366;
`;

export default function WhatsAppMessagesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal Send WhatsApp State
  const [sendModalTemplate, setSendModalTemplate] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [docInput, setDocInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  // Modal Edit Template State
  const [editModalTemplate, setEditModalTemplate] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('LICENCIADAS');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [activeCategory, searchTerm]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await whatsappApi.getTemplates(activeCategory, searchTerm);
      if (res && res.templates) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error(err);
      showToast('Falha ao carregar modelos de mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopyText = (content) => {
    navigator.clipboard.writeText(content);
    showToast('Texto copiado com sucesso para a área de transferência! 📋');
  };

  const handleOpenSendModal = (tpl) => {
    setSendModalTemplate(tpl);
    setNameInput('');
    setPhoneInput('');
    setDocInput('');
    setLinkInput('');
    setEmailInput('');
    setPassInput('');
  };

  const getReplacedContent = (content) => {
    let text = content;
    if (nameInput) text = text.replace(/\{\{NOME\}\}/g, nameInput);
    if (docInput) text = text.replace(/\{\{CPF_CNPJ\}\}/g, docInput);
    if (linkInput) text = text.replace(/\{\{LINK_ASSINATURA\}\}/g, linkInput);
    if (emailInput) text = text.replace(/\{\{EMAIL\}\}/g, emailInput);
    if (passInput) text = text.replace(/\{\{SENHA\}\}/g, passInput);
    return text;
  };

  const handleDirectSendWhatsApp = () => {
    if (!sendModalTemplate) return;
    const finalContent = getReplacedContent(sendModalTemplate.content);
    const cleanPhone = phoneInput.replace(/\D/g, '');
    let url = '';

    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(finalContent)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(finalContent)}`;
    }

    window.open(url, '_blank');
    setSendModalTemplate(null);
    showToast('Redirecionando para o WhatsApp... 🚀');
  };

  const handleSaveEditTemplate = async () => {
    if (!editTitle || !editContent) return;
    try {
      setSavingEdit(true);
      if (editModalTemplate.id) {
        await whatsappApi.updateTemplate({
          id: editModalTemplate.id,
          title: editTitle,
          category: editCategory,
          description: editDescription,
          content: editContent
        });
        showToast('Modelo atualizado com sucesso!');
      } else {
        await whatsappApi.createTemplate({
          title: editTitle,
          category: editCategory,
          description: editDescription,
          content: editContent
        });
        showToast('Novo modelo criado com sucesso!');
      }
      setEditModalTemplate(null);
      loadTemplates();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar modelo.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AdminLayout>
      <PageWrapper>
        <HeaderBanner>
          <HeaderTitle>
            <h1>
              <FaWhatsapp /> Central de Mensagens WhatsApp
            </h1>
            <p>
              Modelos pré-formatados acolhedores para envio rápido a licenciadas, alunas e clientes.
            </p>
          </HeaderTitle>
          <ActionButton
            className="primary"
            style={{ minWidth: '180px', flex: 'none' }}
            onClick={() => {
              setEditModalTemplate({});
              setEditTitle('');
              setEditCategory('LICENCIADAS');
              setEditDescription('');
              setEditContent('');
            }}
          >
            <FaPlus /> Novo Modelo
          </ActionButton>
        </HeaderBanner>

        <FilterSection>
          <CategoryTabs>
            <CategoryTab $active={activeCategory === 'ALL'} onClick={() => setActiveCategory('ALL')}>
              Todas
            </CategoryTab>
            <CategoryTab $active={activeCategory === 'LICENCIADAS'} onClick={() => setActiveCategory('LICENCIADAS')}>
              <FaCrown /> Licenciadas
            </CategoryTab>
            <CategoryTab $active={activeCategory === 'ALUNAS'} onClick={() => setActiveCategory('ALUNAS')}>
              <FaGraduationCap /> Alunas
            </CategoryTab>
            <CategoryTab $active={activeCategory === 'CONTRATOS'} onClick={() => setActiveCategory('CONTRATOS')}>
              <FaFileContract /> Contratos
            </CategoryTab>
            <CategoryTab $active={activeCategory === 'SUPORTE'} onClick={() => setActiveCategory('SUPORTE')}>
              <FaComments /> Suporte
            </CategoryTab>
          </CategoryTabs>

          <SearchBox>
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </FilterSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            Carregando biblioteca de mensagens...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', color: '#64748B' }}>
            Nenhum modelo de mensagem encontrado para os filtros selecionados.
          </div>
        ) : (
          <TemplatesGrid>
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id}>
                <CardHeader>
                  <div className="top-row">
                    <CategoryBadge $category={tpl.category}>{tpl.category}</CategoryBadge>
                    <ActionButton
                      className="edit"
                      onClick={() => {
                        setEditModalTemplate(tpl);
                        setEditTitle(tpl.title);
                        setEditCategory(tpl.category);
                        setEditDescription(tpl.description || '');
                        setEditContent(tpl.content);
                      }}
                      title="Editar Modelo"
                    >
                      <FaEdit />
                    </ActionButton>
                  </div>
                  <h3>{tpl.title}</h3>
                  {tpl.description && <p>{tpl.description}</p>}
                </CardHeader>

                <WhatsAppBubble>
                  <div className="bubble">{tpl.content}</div>
                </WhatsAppBubble>

                <CardFooter>
                  <ActionButton className="secondary" onClick={() => handleCopyText(tpl.content)}>
                    <FaCopy /> Copiar Texto
                  </ActionButton>
                  <ActionButton className="primary" onClick={() => handleOpenSendModal(tpl)}>
                    <FaPaperPlane /> Disparar no WhatsApp
                  </ActionButton>
                </CardFooter>
              </TemplateCard>
            ))}
          </TemplatesGrid>
        )}

        {/* MODAL DE DISPARO E PERSONALIZAÇÃO DE MENSAGEM */}
        {sendModalTemplate && (
          <ModalOverlay onClick={() => setSendModalTemplate(null)}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FaWhatsapp style={{ color: '#25D366' }} />
                  Disparar Mensagem no WhatsApp
                </h3>
                <button onClick={() => setSendModalTemplate(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.85rem', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <FaInfoCircle size={18} />
                  <span>Preencha os dados abaixo para personalizar as variáveis do modelo antes de enviar.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Telefone de Destino (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                  <small style={{ color: '#64748B', fontSize: '0.75rem' }}>Deixe em branco se quiser selecionar o contato diretamente no app do WhatsApp.</small>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Nome da Licenciada / Aluna
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Mariana Silva"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                {sendModalTemplate.content.includes('{{CPF_CNPJ}}') && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      value={docInput}
                      onChange={(e) => setDocInput(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                {sendModalTemplate.content.includes('{{LINK_ASSINATURA}}') && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                      Link de Assinatura do Contrato
                    </label>
                    <input
                      type="text"
                      placeholder="https://bodyharmony.com.br/assinar/..."
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                {sendModalTemplate.content.includes('{{EMAIL}}') && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                      E-mail de Login
                    </label>
                    <input
                      type="email"
                      placeholder="aluna@exemplo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                {sendModalTemplate.content.includes('{{SENHA}}') && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                      Senha Provisória
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: BH2026@Aluno"
                      value={passInput}
                      onChange={(e) => setPassInput(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Pré-visualização Final do Texto
                  </label>
                  <div style={{ background: '#EFEAE2', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.5, borderLeft: '3px solid #25D366' }}>
                    {getReplacedContent(sendModalTemplate.content)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSendModalTemplate(null)}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(getReplacedContent(sendModalTemplate.content))}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FaCopy /> Copiar Texto
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectSendWhatsApp}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FaPaperPlane /> Abrir no WhatsApp
                  </button>
                </div>
              </div>
            </ModalContainer>
          </ModalOverlay>
        )}

        {/* MODAL DE CRIAÇÃO E EDIÇÃO DE MODELO */}
        {editModalTemplate && (
          <ModalOverlay onClick={() => setEditModalTemplate(null)}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FaEdit style={{ color: '#ED7E13' }} />
                  {editModalTemplate.id ? 'Editar Modelo de Mensagem' : 'Novo Modelo de Mensagem'}
                </h3>
                <button onClick={() => setEditModalTemplate(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Título do Modelo
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Ex: 👑 Documentos Obrigatórios (Novas Licenciadas)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Categoria
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: 'white' }}
                  >
                    <option value="LICENCIADAS">👑 LICENCIADAS</option>
                    <option value="ALUNAS">🎓 ALUNAS</option>
                    <option value="CONTRATOS">📄 CONTRATOS</option>
                    <option value="SUPORTE">💬 SUPORTE</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Descrição Curta (Objetivo)
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Ex: Solicitação amigável de fotos legíveis dos documentos"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0A3E60', marginBottom: '0.4rem' }}>
                    Conteúdo da Mensagem (suporta emojis e *negrito*)
                  </label>
                  <textarea
                    rows={8}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'inherit', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditModalTemplate(null)}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditTemplate}
                    disabled={savingEdit}
                    style={{ padding: '0.6rem 1.2rem', minHeight: '44px', borderRadius: '8px', border: 'none', background: '#ED7E13', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {savingEdit ? 'Salvando...' : 'Salvar Modelo'}
                  </button>
                </div>
              </div>
            </ModalContainer>
          </ModalOverlay>
        )}

        {toastMessage && (
          <Toast>
            <FaCheckCircle style={{ color: '#25D366' }} /> {toastMessage}
          </Toast>
        )}
      </PageWrapper>
    </AdminLayout>
  );
}
