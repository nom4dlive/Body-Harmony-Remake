import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPalette, FaSave, FaUndo } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
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

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`

// Preset Button Components
const PresetList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const PresetBtn = styled.button`
  background: white;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : '#eee'};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`

const ColorPreview = styled.div`
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
`

const ColorStrip = styled.div`
  flex: 1;
  background: ${props => props.$color};
`

// Color Picker Inputs
const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`

const ColorInputGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #666;
  }
  
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    input[type="color"] {
      width: 50px;
      height: 50px;
      border: none;
      cursor: pointer;
      background: none;
    }
    
    input[type="text"] {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      text-transform: uppercase;
    }
  }
`

// Preview Card
const PreviewCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  
  .preview-header {
    background: ${props => props.$colors.primary};
    padding: 1.5rem;
    color: white;
    text-align: center;
  }
  
  .preview-body {
    padding: 1.5rem;
    background: ${props => props.$colors.light};
    color: ${props => props.$colors.text};
    text-align: center;
  }
  
  .preview-btn {
    background: ${props => props.$colors.secondary};
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 50px;
    margin-top: 1rem;
    font-weight: bold;
    display: inline-block;
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
  font-size: 1.1rem;
  
  &:hover { background: #388e3c; }
`

const PRESETS = [
  {
    id: 'original',
    name: 'Original (Navy)',
    colors: {
      primary: '#1B4E6B',
      secondary: '#DA8E3A',
      dark: '#081B2B',
      light: '#FAFAFA',
      white: '#FFFFFF',
      text: '#333333',
      grayDark: '#222222',
      grayMedium: '#444444'
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalista (P&B)',
    colors: { primary: '#000000', secondary: '#666666', dark: '#111111', light: '#F5F5F5', white: '#FFFFFF', text: '#222222' }
  },
  {
    id: 'nature',
    name: 'Nature (Verde)',
    colors: { primary: '#2E4A3B', secondary: '#C1A68D', dark: '#1A2F25', light: '#Fdfcf8', white: '#FFFFFF', text: '#3E3E3E' }
  },
  {
    id: 'berry',
    name: 'Berry (Roxo)',
    colors: { primary: '#4A154B', secondary: '#E1306C', dark: '#2D0C2E', light: '#FFF0F5', white: '#FFFFFF', text: '#4A154B' }
  },
  {
    id: 'ocean',
    name: 'Ocean (Azul)',
    colors: { primary: '#01579B', secondary: '#00BCD4', dark: '#002F6C', light: '#E0F7FA', white: '#FFFFFF', text: '#0D47A1' }
  }
]

export default function ThemeManager() {
  const { siteConfig, updateConfig } = useData()
  const [currentSettings, setCurrentSettings] = useState(siteConfig?.theme_settings || PRESETS[0])

  useEffect(() => {
    if (siteConfig?.theme_settings) {
      setCurrentSettings(siteConfig.theme_settings)
    }
  }, [siteConfig])

  const handlePresetSelect = (preset) => {
    setCurrentSettings({
      presetId: preset.id,
      colors: { ...preset.colors }
    })
  }

  const handleColorChange = (key, value) => {
    setCurrentSettings(prev => ({
      ...prev,
      presetId: 'custom',
      colors: { ...prev.colors, [key]: value }
    }))
  }

  const handleSave = async () => {
    await updateConfig('theme_settings', currentSettings)
    alert('Tema atualizado com sucesso!')
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}><FaArrowLeft /> Voltar</BackLink>
          <h1 style={{ color: '#1B4E6B', display: 'flex', gap: '0.5rem' }}><FaPalette /> Gerenciar Aparência</h1>
        </Header>

        <Grid>
          {/* Main Controls */}
          <div style={{ gridColumn: 'span 2' }}>
            <Section>
              <h2>Presets de Cores</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>Escolha um estilo pré-definido clique em Salvar.</p>

              <PresetList>
                {PRESETS.map(preset => (
                  <PresetBtn
                    key={preset.id}
                    $active={currentSettings.presetId === preset.id}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <ColorPreview>
                      <ColorStrip $color={preset.colors.primary} />
                      <ColorStrip $color={preset.colors.secondary} />
                      <ColorStrip $color={preset.colors.light} />
                    </ColorPreview>
                    <strong>{preset.name}</strong>
                  </PresetBtn>
                ))}
              </PresetList>

              <h2 style={{ marginTop: '2rem' }}>Personalizar Cores</h2>
              <ColorGrid>
                {Object.entries(currentSettings.colors).map(([key, value]) => (
                  <ColorInputGroup key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <div>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                    </div>
                  </ColorInputGroup>
                ))}
              </ColorGrid>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <SaveBtn onClick={handleSave}><FaSave /> Salvar Tema</SaveBtn>
              </div>
            </Section>
          </div>

          {/* Live Preview */}
          <div>
            <div style={{ position: 'sticky', top: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Preview Ao Vivo</h3>
              <PreviewCard $colors={currentSettings.colors}>
                <div className="preview-header">
                  <h3>Título Principal</h3>
                  <p>Subtítulo ou slogan da marca</p>
                </div>
                <div className="preview-body">
                  <p>Este é um exemplo de como o texto e o fundo interagem com as cores escolhidas.</p>
                  <button className="preview-btn">Botão de Ação</button>
                </div>
              </PreviewCard>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '12px' }}>
                <h4 style={{ color: currentSettings.colors.primary }}>Títulos (Primary)</h4>
                <p style={{ color: currentSettings.colors.text }}>Texto Comum (Text)</p>
                <small style={{ color: currentSettings.colors.secondary }}>Destaques (Secondary)</small>
              </div>
            </div>
          </div>
        </Grid>
      </PageWrapper>
    </div>
  )
}
