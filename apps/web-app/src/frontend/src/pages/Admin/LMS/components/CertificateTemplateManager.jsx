import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Award, Save, Eye, RefreshCw, CheckCircle2, AlertCircle, FileText, 
  Sparkles, Sliders, ShieldCheck, Clock, UserCheck
} from 'lucide-react';
import { api } from '../../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const TopBanner = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #051A29 100%);
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(10, 62, 96, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
  }

  .info {
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.4rem;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 0.6rem;

      svg {
        color: #ED7E13;
      }
    }

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.9rem;
      max-width: 680px;
      line-height: 1.5;
    }
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-family: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #ED7E13;
  color: white;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.3);

  &:hover:not(:disabled) {
    background: #FF8F26;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.4);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.75rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);

  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0A3E60;
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 0.75rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.4rem;
  }

  .help {
    font-size: 0.78rem;
    color: #64748B;
    margin-top: 0.35rem;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: inherit;
    color: #0F172A;
    background: #F8FAFC;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #0A3E60;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 90px;
    line-height: 1.5;
  }
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 0.75rem;

    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0A3E60;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .preview-box {
    flex: 1;
    border: 12px solid #0A3E60;
    border-radius: 8px;
    padding: 1.5rem;
    background: #FFFFFF;
    position: relative;
    box-shadow: inset 0 0 0 2px #ED7E13;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 380px;

    .header-tag {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #ED7E13;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .cert-title {
      font-family: 'Playfair Display', serif, Georgia;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0A3E60;
      margin-bottom: 0.25rem;
      font-style: italic;
    }

    .cert-sub {
      font-size: 0.8rem;
      color: #64748B;
      margin-bottom: 1rem;
    }

    .cert-name {
      font-family: 'Playfair Display', serif, Georgia;
      font-size: 1.3rem;
      font-weight: 700;
      color: #ED7E13;
      border-bottom: 2px solid #0A3E60;
      display: inline-block;
      margin: 0 auto 1rem auto;
      padding-bottom: 0.25rem;
    }

    .cert-body {
      font-size: 0.82rem;
      color: #334155;
      line-height: 1.6;
      margin-bottom: 1.5rem;

      strong {
        color: #0A3E60;
      }
    }

    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px dashed #CBD5E1;
      padding-top: 0.75rem;
      font-size: 0.75rem;

      .sign {
        text-align: left;
        strong {
          color: #0A3E60;
          display: block;
        }
        span {
          color: #64748B;
        }
      }

      .hash {
        text-align: right;
        color: #94A3B8;
        font-family: monospace;
        font-size: 0.65rem;
      }
    }
  }
`;

const Notification = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: ${({ $type }) => $type === 'success' ? '#ECFDF5' : '#FEF2F2'};
  color: ${({ $type }) => $type === 'success' ? '#065F46' : '#991B1B'};
  border: 1px solid ${({ $type }) => $type === 'success' ? '#A7F3D0' : '#FECACA'};
`;

export default function CertificateTemplateManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Certificado de Conclusão',
    subtitle: 'Certificamos com distinção acadêmica que',
    course_name: 'Formação Profissional Método Body Harmony',
    body_text: 'concluiu com êxito a {course} no portal de capacitação técnica do ecossistema Body Harmony, cumprindo integralmente toda a carga horária de {hours} e obtendo aproveitamento de {score} em avaliação de competência técnico-prática.',
    workload_hours: 60,
    min_score_default: 70,
    issuer_name: 'Dra. Thais Borges',
    issuer_role: 'Coordenação Técnica & Mentoria',
    badge_text: 'ESTÉTICA E SAÚDE INTEGRATIVA'
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCertificateTemplate();
      if (res.success && res.template) {
        setFormData(res.template);
      }
    } catch (err) {
      console.error('Erro ao carregar template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setNotification(null);
      await api.updateAdminCertificateTemplate(formData);
      setNotification({ type: 'success', message: 'Template de certificado e regras salvas com sucesso!' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Erro ao salvar template.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = () => {
    const previewUrl = `${import.meta.env.VITE_API_BASE || '/api'}/v1/admin/lms/certificate-preview?t=${Date.now()}`;
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
        <p>Carregando configurações de certificação...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderedPreviewBody = (formData.body_text || '')
    .replace('{course}', `“${formData.course_name}”`)
    .replace('{hours}', `${formData.workload_hours} horas`)
    .replace('{score}', '95.0%');

  return (
    <Container>
      <TopBanner>
        <div className="info">
          <h2><Award size={24} /> Governança de Certificados & Avaliações</h2>
          <p>
            Personalize a identidade visual, carga horária oficial, textos institucionais e a nota de corte para aprovação nos quizzes das licenciadas.
          </p>
        </div>
        <div className="actions">
          <SecondaryButton onClick={handlePreviewPdf}>
            <Eye size={16} /> Ver PDF Real
          </SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </PrimaryButton>
        </div>
      </TopBanner>

      {notification && (
        <Notification $type={notification.type}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </Notification>
      )}

      <LayoutGrid>
        {/* Left Column: Form Settings */}
        <FormCard>
          <div className="section-title">
            <Sliders size={18} /> Estrutura do Documento
          </div>

          <TwoCols>
            <FormGroup>
              <label>Título Principal</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => handleChange('title', e.target.value)} 
                placeholder="Ex: Certificado de Conclusão"
              />
            </FormGroup>

            <FormGroup>
              <label>Selo / Tag Superior</label>
              <input 
                type="text" 
                value={formData.badge_text} 
                onChange={e => handleChange('badge_text', e.target.value)} 
                placeholder="Ex: ESTÉTICA E SAÚDE INTEGRATIVA"
              />
            </FormGroup>
          </TwoCols>

          <FormGroup>
            <label>Subtítulo de Introdução</label>
            <input 
              type="text" 
              value={formData.subtitle} 
              onChange={e => handleChange('subtitle', e.target.value)} 
              placeholder="Ex: Certificamos com distinção acadêmica que"
            />
          </FormGroup>

          <FormGroup>
            <label>Nome Oficial da Formação Principal</label>
            <input 
              type="text" 
              value={formData.course_name} 
              onChange={e => handleChange('course_name', e.target.value)} 
              placeholder="Ex: Formação Profissional Método Body Harmony"
            />
          </FormGroup>

          <FormGroup>
            <label>Texto de Conclusão (Corpo do Certificado)</label>
            <textarea 
              value={formData.body_text} 
              onChange={e => handleChange('body_text', e.target.value)}
              rows={4}
            />
            <div className="help">
              💡 <strong>Tags dinâmicas suportadas:</strong> <code>{'{course}'}</code> = Nome do Curso, <code>{'{hours}'}</code> = Carga Horária, <code>{'{score}'}</code> = Aproveitamento Médio.
            </div>
          </FormGroup>

          <div className="section-title" style={{ marginTop: '2rem' }}>
            <ShieldCheck size={18} /> Regras de Quiz & Assinatura Oficial
          </div>

          <TwoCols>
            <FormGroup>
              <label><Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Carga Horária Oficial (Horas)</label>
              <input 
                type="number" 
                min="1"
                max="500"
                value={formData.workload_hours} 
                onChange={e => handleChange('workload_hours', parseInt(e.target.value) || 0)} 
              />
            </FormGroup>

            <FormGroup>
              <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Nota Mínima de Aprovação no Quiz (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={formData.min_score_default} 
                onChange={e => handleChange('min_score_default', parseInt(e.target.value) || 0)} 
              />
              <div className="help">Alunas devem atingir pelo menos esta nota nos quizzes para liberar o certificado.</div>
            </FormGroup>
          </TwoCols>

          <TwoCols>
            <FormGroup>
              <label><UserCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Nome do Assinante / Responsável</label>
              <input 
                type="text" 
                value={formData.issuer_name} 
                onChange={e => handleChange('issuer_name', e.target.value)} 
                placeholder="Ex: Dra. Thais Borges"
              />
            </FormGroup>

            <FormGroup>
              <label>Cargo / Função do Assinante</label>
              <input 
                type="text" 
                value={formData.issuer_role} 
                onChange={e => handleChange('issuer_role', e.target.value)} 
                placeholder="Ex: Coordenação Técnica & Mentoria"
              />
            </FormGroup>
          </TwoCols>
        </FormCard>

        {/* Right Column: Dynamic Live Visual Preview */}
        <PreviewCard>
          <div className="preview-header">
            <h3><Sparkles size={18} style={{ color: '#ED7E13' }} /> Pré-visualização Dinâmica</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Padrão Luxury Navy & Gold</span>
          </div>

          <div className="preview-box">
            <div>
              <div className="header-tag">{formData.badge_text || 'ESTÉTICA E SAÚDE INTEGRATIVA'}</div>
              <div className="cert-title">{formData.title || 'Certificado de Conclusão'}</div>
              <div className="cert-sub">{formData.subtitle || 'Certificamos com distinção acadêmica que'}</div>
              <div className="cert-name">Nome da Licenciada</div>
              <div className="cert-body">{renderedPreviewBody}</div>
            </div>

            <div className="cert-footer">
              <div className="sign">
                <strong>{formData.issuer_name || 'Dra. Thais Borges'}</strong>
                <span>{formData.issuer_role || 'Coordenação Técnica'}</span>
              </div>
              <div className="hash">
                <div>• Carga Horária: {formData.workload_hours}h •</div>
                <div>AUTENTICIDADE: BH-PREVIEW-HASH-VALID</div>
              </div>
            </div>
          </div>
        </PreviewCard>
      </LayoutGrid>
    </Container>
  );
}
