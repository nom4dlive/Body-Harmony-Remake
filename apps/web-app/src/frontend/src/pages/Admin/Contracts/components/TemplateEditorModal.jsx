import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { FaTimes, FaSave, FaMagic, FaFileAlt, FaSpinner, FaCode, FaImage } from 'react-icons/fa'
import { contractsApi } from '../../../../services/api'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 26, 41, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
`

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  max-width: 980px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`

const Header = styled.div`
  padding: 1.25rem 1.75rem;
  background: #0a3e60;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const Body = styled.div`
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    color: #334155;
    margin-bottom: 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #1e293b;
    box-sizing: border-box;
    outline: none;

    &:focus {
      border-color: #0a3e60;
      box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
    }
  }
`

const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .quill {
    background: white;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    display: flex;
    flex-direction: column;
    height: 300px;

    .ql-toolbar {
      border: none;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 8px 8px 0 0;
    }

    .ql-container {
      border: none;
      flex: 1;
      overflow-y: auto;
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
    }
  }
`

const VariablesBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;

  .title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #15803d;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-badge {
    background: #ffffff;
    border: 1px solid #86efac;
    color: #166534;
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #dcfce7;
      border-color: #22c55e;
    }
  }
`

const Footer = styled.div`
  padding: 1rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

const PrimaryBtn = styled.button`
  background: #ed7e13;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CancelBtn = styled.button`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;

  &:hover {
    background: #e2e8f0;
  }
`

const CATEGORIES = [
  'Licenciamento',
  'Ouvinte',
  'Cursos e Eventos',
  'Clinica e Pacientes',
  'Recibos',
  'Parcerias'
]

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean']
  ]
}

export default function TemplateEditorModal({ isOpen, onClose, template, onSuccess }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Licenciamento')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('v1.0')
  const [contentHtml, setContentHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (template) {
      setTitle(template.title || '')
      setCategory(template.category || 'Licenciamento')
      setDescription(template.description || '')
      setVersion(template.version || 'v1.0')
      const raw = template.default_content_html || template.content_html || ''
      setContentHtml(raw.replace(/\\n/g, ' ').replace(/\\r/g, '').replace(/\\N/g, ' '))
    } else {
      setTitle('')
      setCategory('Licenciamento')
      setDescription('')
      setVersion('v1.0')
      setContentHtml('<h2>TÍTULO DO DOCUMENTO</h2><p>Pelo presente instrumento, Eu, {{NOME}}, inscrito sob o CPF {{CPF}}...</p>')
    }
  }, [template, isOpen])

  // Real-time extraction of {{TAGS}}
  const detectedTags = useMemo(() => {
    const matches = contentHtml.match(/{{\s*([A-Z0-9_]+)\s*}}/g)
    if (!matches) return []
    return Array.from(new Set(matches.map(m => m.replace(/[{}]/g, '').trim())))
  }, [contentHtml])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !contentHtml.trim()) {
      setError('Título e Conteúdo são obrigatórios.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const payload = {
        title,
        category,
        description,
        version,
        content_html: contentHtml
      }

      let res
      if (template && template.id) {
        res = await contractsApi.updateTemplate(template.id, payload)
      } else {
        res = await contractsApi.createTemplate(payload)
      }

      if (res.ok) {
        if (onSuccess) onSuccess(res)
        onClose()
      } else {
        setError(res.error || 'Falha ao salvar modelo.')
      }
    } catch (err) {
      console.error(err)
      setError('Erro de comunicação com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>
            <FaFileAlt /> {template ? 'Editar Modelo de Contrato' : 'Criar Novo Modelo de Contrato'}
          </h2>
          <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        </Header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Body>
            {error && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <FormRow>
              <FormGroup>
                <label>Título do Modelo:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Termo de Parceria Clínica"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Categoria:</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup>
                <label>Versão:</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label>Descrição / Finalidade do Documento:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumo de quando e como utilizar este modelo..."
              />
            </FormGroup>

            <EditorWrapper>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Texto Base do Documento & Cláusulas:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const hasLogo = contentHtml.includes('contract-logo-header');
                    if (hasLogo) {
                      setContentHtml(contentHtml.replace(/<div\s+class=['"]contract-logo-header['"][^>]*>.*?<\/div>/si, ''));
                    } else {
                      const logoBlock = '<div class="contract-logo-header" style="text-align: center; margin-bottom: 20px;"><img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: 75px; width: auto; max-width: 280px; object-fit: contain;" /></div>';
                      setContentHtml(logoBlock + contentHtml);
                    }
                  }}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0A3E60',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <FaImage style={{ color: '#ED7E13' }} /> {contentHtml.includes('contract-logo-header') ? 'Remover Logotipo' : 'Inserir Logotipo no Topo'}
                </button>
              </div>
              <ReactQuill
                theme="snow"
                value={contentHtml}
                onChange={setContentHtml}
                modules={QUILL_MODULES}
              />
            </EditorWrapper>

            <VariablesBox>
              <div className="title">
                <FaMagic /> Variáveis Detectadas Automaticamente no Texto ({detectedTags.length}):
              </div>
              <div className="tags-list">
                {detectedTags.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Digite tags no formato <code>{"{{NOME_DO_CAMPO}}"}</code> no editor acima para criar variáveis dinâmicas.
                  </span>
                ) : (
                  detectedTags.map(tag => (
                    <span key={tag} className="tag-badge" title="Tag auto-detectada">
                      {"{{" + tag + "}}"}
                    </span>
                  ))
                )}
              </div>
            </VariablesBox>
          </Body>

          <Footer>
            <CancelBtn type="button" onClick={onClose}>Cancelar</CancelBtn>
            <PrimaryBtn type="submit" disabled={loading}>
              {loading ? <FaSpinner className="fa-spin" /> : <FaSave />}
              {loading ? 'Salvando...' : 'Salvar Modelo'}
            </PrimaryBtn>
          </Footer>
        </form>
      </ModalCard>
    </ModalOverlay>
  )
}
