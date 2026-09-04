import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  UploadCloud, 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  Link as LinkIcon, 
  DollarSign, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { shopApi } from '../../../../services/api';

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(5, 26, 41, 0.65);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
`;

const DrawerContent = styled(motion.div)`
  background: #FFFFFF;
  width: 100%;
  max-width: 680px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  padding: 1.5rem 2rem;
  background: #0A3E60;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const HeaderTitle = styled.div`
  h2 {
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  p {
    font-size: 0.8rem;
    color: #94A3B8;
    margin: 0.25rem 0 0 0;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.8);
    transform: rotate(90deg);
  }
`;

const DrawerBody = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: #F8FAFC;
`;

const SectionBox = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0A3E60;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #F1F5F9;

    svg {
      color: #ED7E13;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input, select, textarea {
    padding: 0.7rem 0.9rem;
    border-radius: 0.5rem;
    border: 1px solid #CBD5E1;
    font-size: 0.9rem;
    font-family: inherit;
    color: #1E293B;
    background: #FFFFFF;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #ED7E13;
      box-shadow: 0 0 0 3px rgba(237, 126, 19, 0.15);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .help-text {
    font-size: 0.75rem;
    color: #64748B;
  }
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImagePreviewBox = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

  .preview-img {
    width: 120px;
    height: 80px;
    border-radius: 0.75rem;
    object-fit: cover;
    background: #0A3E60;
    border: 1px solid #CBD5E1;
  }

  .preview-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
  }
`;

const DynamicFeatureRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;

  input {
    flex-grow: 1;
    padding: 0.55rem 0.8rem;
    border-radius: 0.4rem;
    border: 1px solid #CBD5E1;
    font-size: 0.85rem;
  }

  button {
    background: #FEE2E2;
    color: #DC2626;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #DC2626;
      color: #FFFFFF;
    }
  }
`;

const AddFeatureButton = styled.button`
  background: #F1F5F9;
  color: #0A3E60;
  border: 1px dashed #CBD5E1;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #ED7E13;
    color: #ED7E13;
    background: #FFF7ED;
  }
`;

const DrawerFooter = styled.div`
  padding: 1.25rem 2rem;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 0.6rem;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #64748B;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F1F5F9;
    color: #1E293B;
  }
`;

const SaveButton = styled(motion.button)`
  padding: 0.8rem 1.75rem;
  border-radius: 0.6rem;
  border: none;
  background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(237, 126, 19, 0.3);

  &:hover {
    background: linear-gradient(135deg, #F08B27 0%, #E27712 100%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CATEGORY_OPTIONS = [
  'Congresso & Evento',
  'Curso Online',
  'Licenciamento',
  'Evento Presencial',
  'Mentoria'
];

export default function ProductDrawerEditor({ isOpen, onClose, product, onSaved }) {
  const isEditing = Boolean(product && product.id);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkGenSuccess, setLinkGenSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Congresso & Evento',
    tagline: '',
    description: '',
    long_description: '',
    price_real: '',
    payment_link_url: '',
    image_url: '',
    stock_limit: '',
    is_unlimited_stock: true,
    is_active: 1,
    sort_order: 1,
    features: ['']
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category: product.category || 'Congresso & Evento',
        tagline: product.tagline || '',
        description: product.description || '',
        long_description: product.long_description || '',
        price_real: product.price_cents ? (product.price_cents / 100).toFixed(2).replace('.', ',') : '',
        payment_link_url: product.payment_link_url || '',
        image_url: product.image_url || '',
        stock_limit: product.stock_limit ? String(product.stock_limit) : '',
        is_unlimited_stock: product.stock_limit === null || product.stock_limit === undefined,
        is_active: product.is_active !== undefined ? product.is_active : 1,
        sort_order: product.sort_order || 1,
        features: Array.isArray(product.features) && product.features.length > 0 ? product.features : ['']
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category: 'Congresso & Evento',
        tagline: '',
        description: '',
        long_description: '',
        price_real: '',
        payment_link_url: '',
        image_url: '',
        stock_limit: '',
        is_unlimited_stock: true,
        is_active: 1,
        sort_order: 1,
        features: ['']
      });
    }
  }, [product, isOpen]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => {
      // Auto generate slug if creating or if slug was empty
      const autoSlug = !isEditing && (!prev.slug || prev.slug === '') 
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : prev.slug;

      return {
        ...prev,
        name: val,
        slug: autoSlug
      };
    });
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index) => {
    const updated = formData.features.filter((_, idx) => idx !== index);
    setFormData({ ...formData, features: updated.length ? updated : [''] });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      if (isEditing) {
        const res = await shopApi.uploadProductImage(product.id, file);
        if (res?.image_url) {
          setFormData(prev => ({ ...prev, image_url: res.image_url }));
        }
      } else {
        // For new products, temporary upload preview or data url
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, image_url: e.target.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Por favor, informe o nome do produto.");
      return;
    }

    // Convert price to cents
    const cleanPrice = String(formData.price_real).replace(/[^\d.,]/g, '').replace(',', '.');
    const priceCents = Math.round(parseFloat(cleanPrice || 0) * 100);

    if (priceCents < 0) {
      alert("Por favor, informe um preço válido.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      long_description: formData.long_description.trim(),
      price_cents: priceCents,
      payment_link_url: formData.payment_link_url.trim() || null,
      image_url: formData.image_url.trim() || null,
      stock_limit: formData.is_unlimited_stock ? null : (parseInt(formData.stock_limit, 10) || null),
      is_active: formData.is_active ? 1 : 0,
      sort_order: parseInt(formData.sort_order, 10) || 1,
      features: formData.features.filter(f => f && f.trim() !== '')
    };

    setSaving(true);
    try {
      if (isEditing) {
        await shopApi.updateProduct(product.id, payload);
        alert(`Produto "${payload.name}" atualizado com sucesso!`);
      } else {
        await shopApi.createProduct(payload);
        alert(`Produto "${payload.name}" criado com sucesso!`);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Falha ao salvar produto: " + (err.message || 'Erro de conexão'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <DrawerOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <DrawerContent
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <DrawerHeader>
            <HeaderTitle>
              <h2>
                <Sparkles size={20} color="#ED7E13" />
                {isEditing ? `Editar Produto #${product.id}` : 'Novo Produto para a Loja'}
              </h2>
              <p>{isEditing ? 'Atualize as informações completas e publicação' : 'Cadastre um novo ingresso, curso ou evento'}</p>
            </HeaderTitle>
            <CloseButton onClick={onClose} title="Fechar Drawer">
              <X size={20} />
            </CloseButton>
          </DrawerHeader>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
            <DrawerBody>
              {/* 1. Identificação Básica */}
              <SectionBox>
                <div className="section-header">
                  <Layers size={18} /> 1. Identificação Básica
                </div>

                <FormGroup>
                  <label>Nome do Produto *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Ingresso VIP — Experience Limited"
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </FormGroup>

                <TwoCols>
                  <FormGroup>
                    <label>Slug da URL</label>
                    <input 
                      type="text" 
                      placeholder="ingresso-vip"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <span className="help-text">bodyharmony.com.br/shop/checkout/{formData.slug || 'slug'}</span>
                  </FormGroup>

                  <FormGroup>
                    <label>Categoria *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </FormGroup>
                </TwoCols>

                <TwoCols>
                  <FormGroup>
                    <label>Ordem na Vitrine (Prioridade)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Status de Publicação</label>
                    <select
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value, 10) })}
                    >
                      <option value={1}>🟢 Ativo na Loja (Público)</option>
                      <option value={0}>🔴 Inativo (Oculto da Loja)</option>
                    </select>
                  </FormGroup>
                </TwoCols>
              </SectionBox>

              {/* 2. Mídia & Foto do Produto */}
              <SectionBox>
                <div className="section-header">
                  <Camera size={18} /> 2. Imagem & Mídia
                </div>

                <ImagePreviewBox>
                  <img 
                    src={formData.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'} 
                    alt="Preview" 
                    className="preview-img"
                  />
                  <div className="preview-actions">
                    <input 
                      type="file" 
                      id="drawer-photo-file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('drawer-photo-file')?.click()}
                      disabled={uploadingImage}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '0.4rem',
                        border: '1px solid #ED7E13',
                        background: '#FFF7ED',
                        color: '#ED7E13',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <UploadCloud size={16} />
                      {uploadingImage ? 'Enviando...' : 'Fazer Upload de Foto'}
                    </button>
                    <span className="help-text">Recomendado: 800x500px JPG ou WEBP</span>
                  </div>
                </ImagePreviewBox>

                <FormGroup>
                  <label>Ou insira a URL direta da Imagem</label>
                  <input 
                    type="text"
                    placeholder="https://images.unsplash.com/... ou /uploads/shop/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </FormGroup>
              </SectionBox>

              {/* 3. Precificação & Link de Pagamento */}
              <SectionBox>
                <div className="section-header">
                  <DollarSign size={18} /> 3. Valores & Link de Pagamento
                </div>

                <TwoCols>
                  <FormGroup>
                    <label>Preço à Vista (R$) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 1497,00"
                      value={formData.price_real}
                      onChange={(e) => setFormData({ ...formData, price_real: e.target.value })}
                    />
                    <span className="help-text">O sistema simula automaticamente 12x no cartão</span>
                  </FormGroup>

                  <FormGroup>
                    <label>Vagas / Limite</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="number"
                        min="1"
                        placeholder="Ex: 40"
                        disabled={formData.is_unlimited_stock}
                        value={formData.stock_limit}
                        onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                        style={{ flexGrow: 1 }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.is_unlimited_stock}
                          onChange={(e) => setFormData({ ...formData, is_unlimited_stock: e.target.checked })}
                        />
                        Ilimitado
                      </label>
                    </div>
                  </FormGroup>
                </TwoCols>

                <FormGroup>
                  <label>Link Oficial de Pagamento (Asaas / Gateway)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <input 
                      type="text"
                      placeholder="https://www.asaas.com/c/... ou clique em Gerar Link"
                      value={formData.payment_link_url}
                      onChange={(e) => setFormData({ ...formData, payment_link_url: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    {product?.id && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (generatingLink) return;
                          setGeneratingLink(true);
                          try {
                            const res = await shopApi.generateAsaasPaymentLink(product.id);
                            if (res?.data?.payment_link_url) {
                              setFormData(prev => ({ ...prev, payment_link_url: res.data.payment_link_url }));
                              setLinkGenSuccess(true);
                              setTimeout(() => setLinkGenSuccess(false), 3000);
                            } else {
                              alert(res?.message || 'Erro ao gerar link de pagamento');
                            }
                          } catch (err) {
                            alert('Erro ao gerar link: ' + (err?.message || 'Falha na comunicação'));
                          } finally {
                            setGeneratingLink(false);
                          }
                        }}
                        style={{
                          background: linkGenSuccess ? 'rgba(74, 222, 128, 0.15)' : 'linear-gradient(135deg, #0A3E60, #0d4a73)',
                          border: linkGenSuccess ? '1px solid #4ade80' : '1px solid #ED7E13',
                          color: linkGenSuccess ? '#4ade80' : '#ED7E13',
                          padding: '0.5rem 1rem',
                          cursor: generatingLink ? 'wait' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: '4px',
                          opacity: generatingLink ? 0.6 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        disabled={generatingLink}
                      >
                        {generatingLink ? '⏳ Gerando...' : linkGenSuccess ? '✅ Gerado!' : '⚡ Gerar Link Asaas'}
                      </button>
                    )}
                  </div>
                  <span className="help-text">
                    {formData.payment_link_url 
                      ? '🔗 Link ativo — compradores serão direcionados para este checkout seguro'
                      : 'Clique em "Gerar Link Asaas" para criar automaticamente ou cole um link manualmente'}
                  </span>
                </FormGroup>
              </SectionBox>

              {/* 4. Descrições */}
              <SectionBox>
                <div className="section-header">
                  <Sparkles size={18} /> 4. Chamada & Descrição
                </div>

                <FormGroup>
                  <label>Tagline / Chamada de Destaque</label>
                  <input 
                    type="text"
                    placeholder="Ex: Acesso exclusivo aos bastidores, Josi & Kaprice..."
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                  <span className="help-text">Aparece diretamente no card da vitrine</span>
                </FormGroup>

                <FormGroup>
                  <label>Descrição do Produto / Evento</label>
                  <textarea 
                    rows={3}
                    placeholder="Descreva o que está incluso, benefícios práticos e público-alvo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormGroup>
              </SectionBox>

              {/* 5. Lista Dinâmica de Benefícios */}
              <SectionBox>
                <div className="section-header">
                  <CheckCircle2 size={18} /> 5. Tópicos & Benefícios Inclusos
                </div>

                {formData.features.map((feat, idx) => (
                  <DynamicFeatureRow key={idx}>
                    <input 
                      type="text"
                      placeholder={`Benefício #${idx + 1} (ex: Kit Didático Oficial)`}
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFeature(idx)}
                      title="Remover este benefício"
                    >
                      <Trash2 size={15} />
                    </button>
                  </DynamicFeatureRow>
                ))}

                <AddFeatureButton type="button" onClick={handleAddFeature}>
                  <Plus size={16} /> Adicionar Novo Benefício
                </AddFeatureButton>
              </SectionBox>
            </DrawerBody>

            <DrawerFooter>
              <CancelButton type="button" onClick={onClose} disabled={saving}>
                Cancelar
              </CancelButton>
              <SaveButton
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={18} />
                {saving ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Publicar Produto')}
              </SaveButton>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </DrawerOverlay>
    </AnimatePresence>
  );
}
