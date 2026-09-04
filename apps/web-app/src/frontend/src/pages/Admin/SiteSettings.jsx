import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaToggleOn, FaToggleOff, FaCog, FaSave, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'
import { useState, useEffect } from 'react'

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 100px; /* Space for fixed footer */
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
  
  &:hover {
    text-decoration: underline;
  }
`

const SettingsContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: 2rem;
`

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`

const Info = styled.div`
  h3 {
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.dark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    color: #777;
  }
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 2.5rem;
  color: ${({ $isActive, theme }) => $isActive ? theme.colors.success : '#ccc'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: scale(1.1);
  }
`

const StatusBadge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ $isActive }) => $isActive ? '#e8f5e9' : '#ffebee'};
  color: ${({ $isActive }) => $isActive ? '#2e7d32' : '#c62828'};
  font-weight: 600;
  margin-left: 0.5rem;
`

const SaveBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  transition: transform 0.3s ease;
  transform: translateY(${({ $visible }) => $visible ? '0' : '100%'});
`

const Button = styled.button`
  background: ${({ theme, $variant }) => $variant === 'secondary' ? '#eee' : theme.colors.primary};
  color: ${({ theme, $variant }) => $variant === 'secondary' ? '#333' : theme.colors.white};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
    transform: none;
  }
`

const SuccessMessage = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function SiteSettings() {
  const { siteConfig, updateConfig } = useData()

  const defaultValues = {
    showMentors: true,
    showLicentiates: true,
    showResults: true,
    showTestimonials: true,
    showContact: true,
    showNavbar: true,
    showGallery: true,
    showStrip: true,
    showFeatures: true,
    showModules: true,
    showVideos: true,
    seo: { titleSuffix: '', description: '', keywords: '' },
    topBar: { enabled: false, text: '', link: '', color: '#DA8E3A' }
  }

  const [localConfig, setLocalConfig] = useState(defaultValues)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Sync with global config on load
  useEffect(() => {
    if (siteConfig) {
      // Merge with defaults to ensure structure
      setLocalConfig(prev => ({
        ...defaultValues,
        ...siteConfig,
        seo: { ...defaultValues.seo, ...(siteConfig.seo || {}) },
        topBar: { ...defaultValues.topBar, ...(siteConfig.topBar || {}) }
      }))
    }
  }, [siteConfig])

  const handleChange = (section, key, value) => {
    setLocalConfig(prev => {
      const newState = { ...prev }
      if (section) {
        newState[section] = {
          ...prev[section],
          [key]: value
        }
      } else {
        newState[key] = value
      }
      return newState
    })
    setIsDirty(true)
    setShowSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare Bulk Object
      const settingsToSave = {
        showMentors: localConfig.showMentors,
        showLicentiates: localConfig.showLicentiates,
        showResults: localConfig.showResults,
        showTestimonials: localConfig.showTestimonials,
        showContact: localConfig.showContact,
        showNavbar: localConfig.showNavbar,
        showGallery: localConfig.showGallery,
        showStrip: localConfig.showStrip,
        showFeatures: localConfig.showFeatures,
        showModules: localConfig.showModules,
        showVideos: localConfig.showVideos,
        seo: localConfig.seo,
        topBar: localConfig.topBar
      }

      // Use the new Bulk Update method exposed via context
      await updateConfig(null, null, settingsToSave) // overloading updateConfig or need new context method? 
      // Actually, let's check DataContext. It exposes 'updateConfig'. 
      // I should update DataContext to handle this too.

      // For now, let's assume I will update DataContext to accept a 3rd arg OR 
      // I should call api directly? Better to use Context to keep state sync.
      // So I will modify DataContext next.

      setIsDirty(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm("Descartar alterações não salvas?")) {
      setLocalConfig({ ...defaultValues, ...siteConfig })
      setIsDirty(false)
    }
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}>
            <FaArrowLeft /> Voltar ao Painel
          </BackLink>
          <h1 style={{ color: '#1B4E6B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCog /> Configurações do Site
          </h1>
        </Header>

        <SettingsContainer>
          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#1B4E6B', marginBottom: '0.5rem' }}>SEO Simplificado</h2>
            <p style={{ color: '#666' }}>Melhore como o site aparece no Google e redes sociais.</p>

            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sufixo do Título</label>
                <input
                  type="text"
                  value={localConfig.seo.titleSuffix}
                  onChange={(e) => handleChange('seo', 'titleSuffix', e.target.value)}
                  placeholder="Ex: Body Harmony"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Descrição Padrão</label>
                <textarea
                  value={localConfig.seo.description}
                  onChange={(e) => handleChange('seo', 'description', e.target.value)}
                  placeholder="Descrição curta do site..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Palavras-chave</label>
                <input
                  type="text"
                  value={localConfig.seo.keywords}
                  onChange={(e) => handleChange('seo', 'keywords', e.target.value)}
                  placeholder="Separe por vírgulas..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#1B4E6B', marginBottom: '0.5rem' }}>Barra de Avisos (Top Bar)</h2>
            <p style={{ color: '#666' }}>Configure uma mensagem de destaque no topo do site.</p>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '600' }}>Ativar Barra</span>
                <ToggleButton
                  $isActive={localConfig.topBar.enabled}
                  onClick={() => handleChange('topBar', 'enabled', !localConfig.topBar.enabled)}
                >
                  {localConfig.topBar.enabled ? <FaToggleOn /> : <FaToggleOff />}
                </ToggleButton>
              </div>

              {localConfig.topBar.enabled && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Texto do aviso"
                    value={localConfig.topBar.text}
                    onChange={(e) => handleChange('topBar', 'text', e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                  <input
                    type="text"
                    placeholder="Link (opcional)"
                    value={localConfig.topBar.link}
                    onChange={(e) => handleChange('topBar', 'link', e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label>Cor de Fundo:</label>
                    <input
                      type="color"
                      value={localConfig.topBar.color}
                      onChange={(e) => handleChange('topBar', 'color', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#1B4E6B', marginBottom: '0.5rem' }}>Seções da Home Page</h2>
            <p style={{ color: '#666' }}>Ocultar ou exibir blocos de conteúdo da página inicial.</p>
          </div>

          <SettingItem>
            <Info>
              <h3>
                Momentos Body Harmony (Galeria)
                <StatusBadge $isActive={localConfig.showGallery !== false}>
                  {localConfig.showGallery !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Carrossel principal de fotos da marca.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showGallery !== false}
              onClick={() => handleChange(null, 'showGallery', !localConfig.showGallery)}
            >
              {localConfig.showGallery !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Faixa Visual (Strip)
                <StatusBadge $isActive={localConfig.showStrip !== false}>
                  {localConfig.showStrip !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Carrossel intermediário de fotos (Visual Break).</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showStrip !== false}
              onClick={() => handleChange(null, 'showStrip', !localConfig.showStrip)}
            >
              {localConfig.showStrip !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <div style={{ marginBottom: '2rem', marginTop: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#1B4E6B', marginBottom: '0.5rem' }}>Visibilidade do Menu & Links</h2>
            <p style={{ color: '#666' }}>Controle quais páginas aparecem no menu principal e no rodapé.</p>
          </div>

          <SettingItem>
            <Info>
              <h3>
                Menu do Topo (Navbar)
                <StatusBadge $isActive={localConfig.showNavbar !== false}>
                  {localConfig.showNavbar !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Ocultar ou exibir a barra de navegação principal.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showNavbar !== false}
              onClick={() => handleChange(null, 'showNavbar', !localConfig.showNavbar)}
            >
              {localConfig.showNavbar !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Mentores
                <StatusBadge $isActive={localConfig.showMentors}>
                  {localConfig.showMentors ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Exibir página "Mentores" no menu.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showMentors}
              onClick={() => handleChange(null, 'showMentors', !localConfig.showMentors)}
            >
              {localConfig.showMentors ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Licenciadas
                <StatusBadge $isActive={localConfig.showLicentiates}>
                  {localConfig.showLicentiates ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Exibir o mapa e lista de licenciadas.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showLicentiates}
              onClick={() => handleChange(null, 'showLicentiates', !localConfig.showLicentiates)}
            >
              {localConfig.showLicentiates ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Transformações
                <StatusBadge $isActive={localConfig.showResults}>
                  {localConfig.showResults ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Exibir a galeria de antes e depois.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showResults}
              onClick={() => handleChange(null, 'showResults', !localConfig.showResults)}
            >
              {localConfig.showResults ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Depoimentos
                <StatusBadge $isActive={localConfig.showTestimonials}>
                  {localConfig.showTestimonials ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Exibir página de feedback de clientes.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showTestimonials}
              onClick={() => handleChange(null, 'showTestimonials', !localConfig.showTestimonials)}
            >
              {localConfig.showTestimonials ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Contato
                <StatusBadge $isActive={localConfig.showContact}>
                  {localConfig.showContact ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Exibir página de contato e formulário.</p>
            </Info>
            <ToggleButton
              $isActive={localConfig.showContact}
              onClick={() => handleChange(null, 'showContact', !localConfig.showContact)}
            >
              {localConfig.showContact ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <div style={{ marginBottom: '2rem', marginTop: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#1B4E6B', marginBottom: '0.5rem' }}>Dynamic Home Showcase 🧩</h2>
            <p style={{ color: '#666' }}>Personalize os blocos de destaque, conteúdo e vídeos.</p>
          </div>

          <SettingItem>
            <Info>
              <h3>
                Diferenciais (Bento Grid)
                <StatusBadge $isActive={localConfig.showFeatures !== false}>
                  {localConfig.showFeatures !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Bloco de destaque para "Online", "Certificado", etc.</p>
            </Info>
            <ToggleButton $isActive={localConfig.showFeatures !== false} onClick={() => handleChange(null, 'showFeatures', !localConfig.showFeatures)}>
              {localConfig.showFeatures !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Módulos do Curso
                <StatusBadge $isActive={localConfig.showModules !== false}>
                  {localConfig.showModules !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Lista expandida do conteúdo programático.</p>
            </Info>
            <ToggleButton $isActive={localConfig.showModules !== false} onClick={() => handleChange(null, 'showModules', !localConfig.showModules)}>
              {localConfig.showModules !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

          <SettingItem>
            <Info>
              <h3>
                Vídeos (Global)
                <StatusBadge $isActive={localConfig.showVideos !== false}>
                  {localConfig.showVideos !== false ? 'VISÍVEL' : 'OCULTO'}
                </StatusBadge>
              </h3>
              <p>Habilitar exibição de vídeos incorporados nas posições definidas.</p>
            </Info>
            <ToggleButton $isActive={localConfig.showVideos !== false} onClick={() => handleChange(null, 'showVideos', !localConfig.showVideos)}>
              {localConfig.showVideos !== false ? <FaToggleOn /> : <FaToggleOff />}
            </ToggleButton>
          </SettingItem>

        </SettingsContainer>
      </PageWrapper>

      {/* Persistent Save Bar */}
      <SaveBar $visible={isDirty}>
        {showSuccess && (
          <SuccessMessage>
            <FaCheckCircle /> Alterações salvas!
          </SuccessMessage>
        )}
        <Button $variant="secondary" onClick={handleReset} disabled={isSaving}>
          Descartar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><FaSpinner className="spin" /> Salvando...</> : <><FaSave /> Salvar Alterações</>}
        </Button>
      </SaveBar>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
