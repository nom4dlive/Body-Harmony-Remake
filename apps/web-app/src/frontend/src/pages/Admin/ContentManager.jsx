import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaFileAlt, FaSave, FaList, FaHeading } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'
import { api } from '../../services/api'

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 80px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  &:hover { text-decoration: underline; }
`

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 5px;
`

const Tab = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : '#f0f0f0'};
  }
`

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.small};
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.dark};
  }
  input, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
  }
`

const SaveBtn = styled.button`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover { background: #388e3c; }
`

// --- Sub-components for Array Editing ---
const ArrayEditor = ({ items, onChange, itemTemplate }) => {
  const handleChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  const handleDelete = (index) => {
    if (window.confirm('Remover item?')) {
      onChange(items.filter((_, i) => i !== index))
    }
  }

  const handleAdd = () => {
    onChange([...items, { id: Date.now(), ...itemTemplate }])
  }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          {Object.keys(itemTemplate).map(key => (
            <input
              key={key}
              placeholder={key}
              value={item[key]}
              onChange={(e) => handleChange(idx, key, e.target.value)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          ))}
          <button onClick={() => handleDelete(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
            <FaList /> X
          </button>
        </div>
      ))}
      <button onClick={handleAdd} style={{ color: '#1B4E6B', background: '#e3f2fd', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
        + Adicionar Item
      </button>
    </div>
  )
}

import RichTextEditor from '../../components/Admin/RichTextEditor'

/* ... imports ... */
import AdminLayout from './components/AdminLayout'

export default function ContentManager() {
  const { siteTexts, siteConfig, updateSiteText, updateConfig } = useData()
  const [activeTab, setActiveTab] = useState('home')

  // Local state for Arrays
  const [benefits, setBenefits] = useState(siteConfig?.site_benefits || [])
  const [topics, setTopics] = useState(siteConfig?.course_topics || [])
  const [features, setFeatures] = useState(siteConfig?.site_features || [])
  const [videos, setVideos] = useState(siteConfig?.site_videos || [])

  const handleSaveArrays = async () => {
    await updateConfig('site_benefits', benefits)
    await updateConfig('course_topics', topics)
    await updateConfig('site_features', features)
    await updateConfig('site_videos', videos)
    alert('Listas salvas com sucesso!')
  }

  // Local state for Texts
  const [localTexts, setLocalTexts] = useState(siteTexts || {})

  // Default content for initial migration
  const DEFAULTS = {
    heroTitle: `<span>FOI O QUE ELA PENSOU ANTES DE DESCOBRIR O MÉTODO BODY HARMONY.</span> VOCÊ ACHA QUE DOMINA A ELETROESTIMULAÇÃO?`,
    heroSubtitle: `Deixe de aplicar protocolos rasos. Descubra a profundidade clínica que transformou carreiras em um "recomeço" e que pode levar você a uma <strong>Alta Rentabilidade</strong>.`,
    heroCta: 'Quero Ser Uma Referência',
    painTitle: 'Eu já fiz cursos de eletroestimulação. <span>O Body Harmony é para mim?</span>',
    painCard1Title: '❌ Estética Comum',
    painCard1Content: `<ul><li>🚫 Acha que domina apenas por <strong>ter o aparelho</strong>.</li><li>🚫 Falsa sensação de <strong>domínio técnico</strong>.</li><li>🚫 Resultados <strong>estagnados</strong> e clientes insatisfeitas.</li><li>🚫 Aplicação de protocolos <strong>rasos e genéricos</strong>.</li></ul>`,
    painCard2Title: '✅ Body Harmony',
    painCard2Content: `<ul><li>⚡ <strong>Raciocínio Clínico Integrativo</strong> de verdade.</li><li>⚡ Tratar a <strong>inflamação</strong> na causa raiz.</li><li>⚡ Metodologia <strong>"absurda"</strong> de tão eficaz.</li><li>⚡ Seja a <strong>autoridade exclusiva</strong> na sua cidade.</li></ul>`,
    testimonialQuote: `"Foi um recomeço. Eu não sabia que não sabia nada... <span>até ver o nível absurdo de conhecimento aqui.</span>"`,
    testimonialAuthor: 'Lilian',
    testimonialRole: 'Licenciada Body Harmony - Venda Nova'
  }

  // Sync with context on load
  useEffect(() => {
    // If siteTexts is loaded, merge with defaults (filling missing keys)
    // If siteTexts is empty/null, use valid Defaults
    if (siteTexts) {
      setLocalTexts(prev => ({ ...DEFAULTS, ...siteTexts }))
    } else {
      setLocalTexts(DEFAULTS)
    }
  }, [siteTexts])

  const handleSaveTexts = async () => {
    await updateConfig('site_texts', localTexts)
    alert('Textos salvos com sucesso!')
  }

  // Helper for local update
  const updateLocalText = (key, value) => {
    setLocalTexts(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}><FaArrowLeft /> Voltar</BackLink>
          <h1 style={{ color: '#1B4E6B', display: 'flex', gap: '0.5rem' }}><FaFileAlt /> Editor de Conteúdo</h1>
        </Header>

        <Tabs>
          <Tab $active={activeTab === 'home'} onClick={() => setActiveTab('home')}>Home Page</Tab>
          <Tab $active={activeTab === 'features'} onClick={() => setActiveTab('features')}>Diferenciais</Tab>
          <Tab $active={activeTab === 'topics'} onClick={() => setActiveTab('topics')}>Tópicos</Tab>
          <Tab $active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>Vídeos</Tab>
          <Tab $active={activeTab === 'benefits'} onClick={() => setActiveTab('benefits')}>Benefícios</Tab>
          <Tab $active={activeTab === 'footer'} onClick={() => setActiveTab('footer')}>Rodapé</Tab>
        </Tabs>

        {activeTab === 'home' && (
          <Section>
            <h2><FaHeading /> Seção Hero (Topo)</h2>
            {/* ... Content Omitted for brevity, assuming replace_file_content handles large blocks if context is enough ... */}
            {/* Actually, I should use multi_replace for safer partial revert or just targeted replace */}
            <FormGroup>
              <label>Título Principal</label>
              <RichTextEditor
                isTitle={true}
                value={localTexts.heroTitle}
                onChange={val => updateLocalText('heroTitle', val)}
              />
            </FormGroup>
            <FormGroup>
              <label>Subtítulo</label>
              <RichTextEditor
                value={localTexts.heroSubtitle}
                onChange={val => updateLocalText('heroSubtitle', val)}
              />
            </FormGroup>
            <FormGroup>
              <label>Texto do Botão CTA</label>
              <input
                value={localTexts.heroCta || ''}
                onChange={e => updateLocalText('heroCta', e.target.value)}
                placeholder="Ex: Quero Ser Uma Referência"
              />
            </FormGroup>

            <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

            <h2><FaHeading /> Dor vs Solução</h2>
            <FormGroup>
              <label>Título da Seção</label>
              <RichTextEditor
                isTitle={true}
                value={localTexts.painTitle}
                onChange={val => updateLocalText('painTitle', val)}
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3>Cartão 1 (Dor)</h3>
                <FormGroup>
                  <label>Título</label>
                  <RichTextEditor isTitle={true} value={localTexts.painCard1Title} onChange={v => updateLocalText('painCard1Title', v)} />
                </FormGroup>
                <FormGroup>
                  <label>Conteúdo (Lista)</label>
                  <RichTextEditor value={localTexts.painCard1Content} onChange={v => updateLocalText('painCard1Content', v)} />
                </FormGroup>
              </div>
              <div>
                <h3>Cartão 2 (Solução)</h3>
                <FormGroup>
                  <label>Título</label>
                  <RichTextEditor isTitle={true} value={localTexts.painCard2Title} onChange={v => updateLocalText('painCard2Title', v)} />
                </FormGroup>
                <FormGroup>
                  <label>Conteúdo (Lista)</label>
                  <RichTextEditor value={localTexts.painCard2Content} onChange={v => updateLocalText('painCard2Content', v)} />
                </FormGroup>
              </div>
            </div>

            <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

            <h2><FaHeading /> Testemunho (Autoridade)</h2>
            <FormGroup>
              <label>Citação</label>
              <RichTextEditor isTitle={true} value={localTexts.testimonialQuote} onChange={v => updateLocalText('testimonialQuote', v)} />
            </FormGroup>
            <FormGroup>
              <label>Nome da Autor</label>
              <RichTextEditor isTitle={true} value={localTexts.testimonialAuthor} onChange={v => updateLocalText('testimonialAuthor', v)} />
            </FormGroup>

            <FormGroup>
              <label>Foto do Autor (Opcional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {localTexts.testimonialPhoto && (
                  <img
                    src={localTexts.testimonialPhoto}
                    alt="Preview"
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    try {
                      const res = await api.uploadImage(file)
                      if (res.success) {
                        updateLocalText('testimonialPhoto', res.filepath)
                      } else {
                        alert('Erro no upload')
                      }
                    } catch (err) {
                      console.error(err)
                      alert('Erro ao enviar imagem')
                    }
                  }}
                />
              </div>
              <small style={{ color: '#666' }}>Recomendado: Imagem Quadrada. Será exibida em formato circular.</small>
            </FormGroup>

            <FormGroup>
              <label>Cargo / Descrição</label>
              <RichTextEditor isTitle={true} value={localTexts.testimonialRole} onChange={v => updateLocalText('testimonialRole', v)} />
            </FormGroup>

            <SaveBtn onClick={handleSaveTexts}><FaSave /> Salvar Home Page</SaveBtn>
          </Section>
        )}

        {activeTab === 'footer' && (
          <Section>
            <h2>Rodapé</h2>
            <FormGroup>
              <label>Link de Contato (Email)</label>
              <input value={localTexts.footerEmail || ''} onChange={e => updateLocalText('footerEmail', e.target.value)} />
            </FormGroup>
            <SaveBtn onClick={handleSaveTexts}><FaSave /> Salvar Rodapé</SaveBtn>
          </Section>
        )}

        {activeTab === 'benefits' && (
          <Section>
            <h2><FaList /> Lista de Benefícios</h2>
            <ArrayEditor
              items={benefits}
              onChange={setBenefits}
              itemTemplate={{ title: '', icon: 'FaStar' }}
            />
            <SaveBtn onClick={handleSaveArrays}><FaSave /> Salvar Lista</SaveBtn>
          </Section>
        )}

        {activeTab === 'features' && (
          <Section>
            <h2><FaList /> Diferenciais (Bento Grid)</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Use ícones do FontAwesome (Ex: FaRocket, FaStar, FaUserMd).</p>
            <ArrayEditor
              items={features}
              onChange={setFeatures}
              itemTemplate={{ icon: 'FaStar', title: '', text: '' }}
            />
            <SaveBtn onClick={handleSaveArrays}><FaSave /> Salvar Diferenciais</SaveBtn>
          </Section>
        )}

        {activeTab === 'videos' && (
          <Section>
            <h2><FaList /> Gerenciador de Vídeos</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Posições: <strong>top</strong> (Topo), <strong>middle</strong> (Meio), <strong>bottom</strong> (Fundo).<br />
              Tamanhos: <strong>small</strong>, <strong>medium</strong>, <strong>full</strong>.
            </p>
            <ArrayEditor
              items={videos}
              onChange={setVideos}
              itemTemplate={{ url: 'https://youtube.com/embed/...', position: 'top', size: 'medium' }}
            />
            <SaveBtn onClick={handleSaveArrays}><FaSave /> Salvar Vídeos</SaveBtn>
          </Section>
        )}

        {activeTab === 'topics' && (
          <Section>
            <h2><FaList /> Tópicos de Aprendizado (Accordion)</h2>
            <ArrayEditor
              items={topics}
              onChange={setTopics}
              itemTemplate={{ title: '' }}
            />
            <SaveBtn onClick={handleSaveArrays}><FaSave /> Salvar Tópicos</SaveBtn>
          </Section>
        )}

      </PageWrapper>
    </div>
  )
}
