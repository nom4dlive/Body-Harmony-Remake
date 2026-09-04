import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FaSave, FaArrowLeft, FaPalette, FaList, FaEdit, FaMobileAlt, FaTabletAlt, FaDesktop } from 'react-icons/fa' // Added Device Icons
import { Link } from 'react-router-dom'

import { useData } from '../../../context/DataContext'
import { ROUTES } from '../../../config/routes'
import Home from '../../Home/Home' // Import Home directly for preview
import Header from '../../../components/Header/Header'
import ContentTab from './components/ContentTab'

// --- Theme Presets ---
const THEME_PRESETS = {
  original: {
    label: 'Original Navy',
    colors: {
      primary: '#1B4E6B',
      secondary: '#DA8E3A',
      dark: '#081B2B',
      light: '#FAFAFA',
      white: '#FFFFFF',
      text: '#333333',
      highlight: '#7B2CBF',
      premium: '#081B2B',
      premiumLight: '#0d2b45',
      textPrim: '#FFFFFF',
      textSec: '#B0C4DE'
    }
  },
  darkPremium: {
    label: 'Dark Premium',
    colors: {
      primary: '#000000',
      secondary: '#D4AF37', // Gold
      dark: '#111111',
      light: '#1A1A1A',
      white: '#F5F5F5',
      text: '#F5F5F5',
      highlight: '#D4AF37', // Gold override
      premium: '#000000',
      premiumLight: '#1A1A1A',
      textPrim: '#D4AF37',
      textSec: '#CCCCCC'
    }
  },
  medicalClean: {
    label: 'Medical Clean',
    colors: {
      primary: '#00B090', // Teal
      secondary: '#4A90E2', // Blue
      dark: '#2C3E50',
      light: '#F0F8FF',
      white: '#FFFFFF',
      text: '#2C3E50',
      highlight: '#00B090',
      premium: '#FFFFFF',
      premiumLight: '#F0F8FF',
      textPrim: '#2C3E50',
      textSec: '#7F8C8D'
    }
  },
  royalPurple: {
    label: 'Royal Purple',
    colors: {
      primary: '#5D1B6B',
      secondary: '#F72585',
      dark: '#1A051A',
      light: '#FFF0F5',
      white: '#FFFFFF',
      text: '#333333',
      highlight: '#F72585',
      premium: '#2D0A31',
      premiumLight: '#4A1D50',
      textPrim: '#F72585',
      textSec: '#E0B0FF'
    }
  }
}

// --- Styled Components ---

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`

const Sidebar = styled.div`
  width: 350px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
`

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
`

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`

const PreviewArea = styled.div`
  flex: 1;
  background: #e0e0e0;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column; /* Changed to column for toolbar */
  align-items: center; /* Center horizontally */
  padding: 20px;
`

const PreviewToolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`

const DeviceBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $active }) => $active ? '#1B4E6B' : '#999'};
  font-size: 1.2rem;
  padding: 5px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover { color: #1B4E6B; transform: scale(1.1); }
`

const PreviewFrame = styled.div`
  width: ${({ $width }) => $width || '100%'};
  max-width: 1400px; /* Max Desktop Width */
  background: white;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  min-height: 100%;
  transform-origin: top center;
  transition: width 0.3s ease; /* Smooth transition */
  border: ${({ $width }) => $width !== '100%' ? '10px solid #333' : 'none'};
  border-radius: ${({ $width }) => $width !== '100%' ? '20px' : '0'};
  /* Isolation for fixed elements */
  isolation: isolate;
  overflow-x: hidden; 
`

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`

const TabBtn = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${({ $active }) => $active ? 'white' : '#f0f0f0'};
  border: none;
  font-weight: bold;
  color: ${({ $active }) => $active ? '#1B4E6B' : '#666'};
  cursor: pointer;
  border-bottom: 2px solid ${({ $active }) => $active ? '#1B4E6B' : 'transparent'};
  
  &:hover { background: #fff; }
`

const SaveBtn = styled.button`
  background: #00B090;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { background: #009e82; }
`

// --- Sortable Item Component ---
function SortableItem({ id, label, visible, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '1rem',
    margin: '0.5rem 0',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'grab', flex: 1 }}>
        <FaList color="#ccc" />
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(id, e.target.checked)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  )
}

// --- Global Styles for Inline Editing ---
const GlobalEditorStyles = styled.div`
  /* Highlight editable elements in Preview */
  [data-sb-field] {
    transition: outline 0.2s;
    cursor: pointer !important;
  }
  [data-sb-field]:hover {
    outline: 2px dashed #1B4E6B !important;
    outline-offset: 4px;
    z-index: 9999;
  }
`

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Preview Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', textAlign: 'center' }}>
          <h3>Erro no Preview</h3>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main Component ---
export default function VisualEditor() {
  const { siteConfig, siteTexts, enablePreview, disablePreview, updateConfig } = useData()
  const [activeTab, setActiveTab] = useState('structure')
  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop', 'tablet', 'mobile'

  // Lifted State for Inline Editing
  const [activeSection, setActiveSection] = useState('home_hero')
  const [focusRequest, setFocusRequest] = useState(null) // { section, field, timestamp }

  // Local State for Changes
  const [localConfig, setLocalConfig] = useState(null)

  // History & Rollback State (PLAN-032)
  const [historyList, setHistoryList] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (activeTab === 'history') {
      const loadHistory = async () => {
        setLoadingHistory(true)
        try {
          const res = await api.get('/admin/site_config/history')
          setHistoryList(res?.history || [])
        } catch (err) {
          console.error('Failed to load site config history', err)
        } finally {
          setLoadingHistory(false)
        }
      }
      loadHistory()
    }
  }, [activeTab])

  const handleRollback = async (revisionId) => {
    if (window.confirm(`Tem certeza que deseja restaurar o layout para a revisão #${revisionId}? Suas alterações locais não salvas serão perdidas.`)) {
      try {
        const res = await api.post('/admin/site_config/rollback', { revision_id: revisionId })
        if (res?.ok) {
          setLocalConfig(res.config)
          alert('Layout restaurado com sucesso no preview! Salve no topo para publicar.')
        } else {
          alert('Erro ao restaurar revisão.')
        }
      } catch (err) {
        alert('Erro de conexão ao restaurar: ' + err.message)
      }
    }
  }

  // Initialize local config from real config
  useEffect(() => {
    if (siteConfig && !localConfig) {
      // Ensure structure exists to avoid crashes
      const safeConfig = JSON.parse(JSON.stringify(siteConfig))

      if (!safeConfig.section_order || safeConfig.section_order.length === 0) {
        safeConfig.section_order = [
          { id: 'hero', visible: true, label: 'Hero (Topo)' },
          { id: 'metodo', visible: true, label: 'O Método' },
          { id: 'philosophy_banner', visible: true, label: 'Banner Josi/Pilares' },
          { id: 'resultados', visible: true, label: 'Resultados' },
          { id: 'depoimentos', visible: true, label: 'Depoimentos' },
          { id: 'philosophy', visible: true, label: 'Filosofia/Sobre' },
          { id: 'beneficios', visible: true, label: 'Benefícios' },
          { id: 'instagram', visible: true, label: 'Instagram Carousel' }
        ]
      }
      if (!safeConfig.theme_settings) safeConfig.theme_settings = { colors: {} }
      if (!safeConfig.theme_settings.colors) safeConfig.theme_settings.colors = {}

      if (!safeConfig.navbar) {
        safeConfig.navbar = {
          enabled: true,
          links: { mentors: true, licenciadas: true, results: true, testimonials: true, contact: true },
          style: {
            background: '#FFFFFF',
            textColor: '#333333',
            layout: 'standard', // 'standard', 'center', 'minimal'
            density: 'md',      // 'sm', 'md', 'lg'
            glass: false,
            ctaCustomColor: null,
            logoColor: null     // Universal Logo
          },
          logoFallback: {
            enabled: false,
            color: null,        // 'navy'/'white' or Hex
            background: 'transparent'
          }
        }
      } else {
        // Retro-compatibility: Ensure style object exists
        if (!safeConfig.navbar.style) safeConfig.navbar.style = { background: '#FFFFFF', textColor: '#333333' }
        if (!safeConfig.navbar.logoFallback) safeConfig.navbar.logoFallback = { enabled: false, color: 'navy', background: 'transparent' }

        // Set defaults for new fields if missing
        if (!safeConfig.navbar.style.layout) safeConfig.navbar.style.layout = 'standard'
        if (!safeConfig.navbar.style.density) safeConfig.navbar.style.density = 'md'
        if (safeConfig.navbar.style.glass === undefined) safeConfig.navbar.style.glass = false
      }

      // Merge siteTexts for editing
      if (siteTexts) safeConfig.site_texts = { ...siteTexts }

      setLocalConfig(safeConfig)
    }
  }, [siteConfig, siteTexts, localConfig])

  // Sync Local Changes to Global Preview
  useEffect(() => {
    if (localConfig) {
      enablePreview({ ...localConfig })
    }
    return () => disablePreview() // Cleanup on unmount
  }, [localConfig])

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!localConfig) return <div>Carregando Editor...</div>

  // Handlers
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setLocalConfig((prev) => {
        const oldIndex = prev.section_order.findIndex(i => i.id === active.id)
        const newIndex = prev.section_order.findIndex(i => i.id === over.id)

        return {
          ...prev,
          section_order: arrayMove(prev.section_order, oldIndex, newIndex)
        }
      })
    }
  }

  const handleVisibilityToggle = (id, isVisible) => {
    setLocalConfig(prev => ({
      ...prev,
      section_order: prev.section_order.map(s => s.id === id ? { ...s, visible: isVisible } : s)
    }))
  }

  const handleColorChange = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      theme_settings: {
        ...prev.theme_settings,
        colors: {
          ...prev.theme_settings.colors,
          [key]: value
        }
      }
    }))
  }

  const handlePreviewClick = (e) => {
    // Intercept clicks on instrumented elements
    const target = e.target.closest('[data-sb-field]')

    if (target) {
      e.preventDefault()
      e.stopPropagation()

      const section = target.dataset.sbSection
      const field = target.dataset.sbField

      if (section && field) {
        console.log('Inline Edit:', section, field)
        setActiveTab('content')
        setActiveSection(section)
        setFocusRequest({ section, field, timestamp: Date.now() })
      }
    }
  }

  const saveChanges = async () => {
    if (window.confirm('Salvar alterações e publicar no site?')) {
      try {
        await updateConfig(localConfig) // Bulk update via context
        alert('Site atualizado com sucesso!')
      } catch (error) {
        console.error(error)
        alert('Erro ao salvar: ' + (error.message || 'Verifique sua conexão ou login.'))
      }
    }
  }

  return (
    <EditorContainer>
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <Link to={ROUTES.ADMIN_DASHBOARD} style={{ color: '#666' }}><FaArrowLeft /></Link>
          <h3 style={{ margin: 0 }}>Editor Visual</h3>
          <SaveBtn onClick={saveChanges}><FaSave /> Salvar</SaveBtn>
        </SidebarHeader>

        <TabButtons>
          <TabBtn $active={activeTab === 'structure'} onClick={() => setActiveTab('structure')}>Estrutura</TabBtn>
          <TabBtn $active={activeTab === 'content'} onClick={() => setActiveTab('content')}>Conteúdo</TabBtn>
          <TabBtn $active={activeTab === 'colors'} onClick={() => setActiveTab('colors')}>Cores</TabBtn>
          <TabBtn $active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Histórico</TabBtn>
        </TabButtons>

        <SidebarContent>
          {activeTab === 'structure' && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localConfig.section_order} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {localConfig.section_order.map((section) => (
                    <SortableItem
                      key={section.id}
                      id={section.id}
                      label={section.label || section.id}
                      visible={section.visible}
                      onToggle={handleVisibilityToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {activeTab === 'content' && (
            <ContentTab
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              focusRequest={focusRequest}
            />
          )}

          {activeTab === 'colors' && localConfig.theme_settings?.colors && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Theme Presets */}
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>
                  🎨 Temas Predefinidos
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.entries(THEME_PRESETS).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (window.confirm(`Aplicar tema "${theme.label}"?`)) {
                          setLocalConfig(prev => ({
                            ...prev,
                            theme_settings: {
                              ...prev.theme_settings,
                              colors: { ...theme.colors }
                            }
                          }))
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title={theme.label}
                    >
                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: theme.colors.primary }}></div>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: theme.colors.secondary, marginLeft: '-5px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr style={{ margin: '0', border: 'none', borderTop: '1px solid #eee' }} />

              {Object.entries(localConfig.theme_settings.colors).map(([key, val]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="color"
                      value={val}
                      onChange={e => handleColorChange(key, e.target.value)}
                      style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={e => handleColorChange(key, e.target.value)}
                      style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  if (window.confirm('Resetar todas as cores para o padrão orignial?')) {
                    setLocalConfig(prev => ({
                      ...prev,
                      theme_settings: {
                        ...prev.theme_settings,
                        colors: {
                          primary: '#1B4E6B',
                          secondary: '#DA8E3A',
                          dark: '#081B2B',
                          light: '#FAFAFA',
                          white: '#FFFFFF',
                          text: '#333333',
                          highlight: '#7B2CBF'
                        }
                      }
                    }))
                  }
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                ↺ Resetar Cores
              </button>

              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px', fontSize: '0.9rem' }}>
                <p>💡 As cores alteram o tema global do site.</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>
                🕰️ Revisões de Layout (Undo/Redo)
              </label>
              {loadingHistory ? (
                <p style={{ opacity: 0.5, textAlign: 'center' }}>Carregando histórico...</p>
              ) : historyList.length === 0 ? (
                <p style={{ opacity: 0.5, textAlign: 'center' }}>Nenhuma revisão anterior salva.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyList.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: '#f8f9fa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                        <span>Revisão #{rev.id}</span>
                        <span>{new Date(rev.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0A3E60' }}>{rev.summary_diff}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Por: {rev.admin_name}</div>
                      <button
                        onClick={() => handleRollback(rev.id)}
                        style={{
                          padding: '6px 10px',
                          background: '#ED7E13',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          width: '100%',
                          transition: 'background 0.2s'
                        }}
                      >
                        Restaurar esta Versão
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SidebarContent>
      </Sidebar>

      {/* Preview */}
      {/* Preview */}
      <PreviewArea>
        <PreviewToolbar>
          <DeviceBtn
            $active={previewMode === 'mobile'}
            onClick={() => setPreviewMode('mobile')}
            title="Mobile (375px)"
          >
            <FaMobileAlt />
          </DeviceBtn>
          <DeviceBtn
            $active={previewMode === 'tablet'}
            onClick={() => setPreviewMode('tablet')}
            title="Tablet (768px)"
          >
            <FaTabletAlt />
          </DeviceBtn>
          <DeviceBtn
            $active={previewMode === 'desktop'}
            onClick={() => setPreviewMode('desktop')}
            title="Desktop (Full)"
          >
            <FaDesktop />
          </DeviceBtn>
        </PreviewToolbar>

        <PreviewFrame
          $width={previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%'}
          onClickCapture={handlePreviewClick} // Click-to-Focus Logic
        >
          <ErrorBoundary>
            <Header />
            <Home />
            {/* <div style={{ padding: 50, textAlign: 'center' }}>
                  <h2>Preview Placeholder</h2>
                  <p>Se você vê isso, o Editor está carregando, mas a Home foi removida temporariamente para debug.</p>
              </div> */}
          </ErrorBoundary>
        </PreviewFrame>
      </PreviewArea>
      <GlobalEditorStyles />
    </EditorContainer>
  )
}
