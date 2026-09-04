import React, { useState } from 'react'
import styled from 'styled-components'
import { FaImage } from 'react-icons/fa' // Added FaImage
import ImagePickerModal from '../../../../components/Shared/ImagePickerModal' // Corrected Path
import { FaEdit } from 'react-icons/fa'
import { getContrastColor } from '../../../../utils/colorUtils'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const SectionSelector = styled.select`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  margin-bottom: 1rem;
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #1B4E6B;
  }
`

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1B4E6B;
  }
`

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0;
`

// Helper: Controles reutilizáveis de vídeo para qualquer seção
function VideoControls({ section, localConfig, handleChange }) {
    const videoConfig = localConfig[section]?.video || {}

    return (
        <>
            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid #eee' }} />
            <h4 style={{ marginBottom: '1.5rem', color: '#555', fontSize: '1.1rem' }}>🎥 Vídeo (Opcional)</h4>

            <FieldGroup>
                <Label>URL do Vídeo</Label>
                <Input
                    type="url"
                    value={videoConfig.url || ''}
                    onChange={(e) => {
                        const newVideo = { ...videoConfig, url: e.target.value }
                        handleChange(section, 'video', newVideo)
                    }}
                    placeholder="https://exemplo.com/video.mp4"
                />
                <HelperText>Deixe vazio para não exibir vídeo nesta seção</HelperText>
            </FieldGroup>

            {videoConfig.url && (
                <>
                    <FieldGroup>
                        <Label>Layout do Vídeo</Label>
                        <select
                            value={videoConfig.layout || 'none'}
                            onChange={(e) => {
                                const newVideo = { ...videoConfig, layout: e.target.value }
                                handleChange(section, 'video', newVideo)
                            }}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                        >
                            <option value="none">Sem Vídeo</option>
                            <option value="side-left">Lado a Lado - Vídeo à Esquerda</option>
                            <option value="side-right">Lado a Lado - Vídeo à Direita</option>
                            <option value="background">Vídeo de Fundo (Fullscreen)</option>
                            <option value="above">Vídeo Acima do Texto</option>
                            <option value="below">Vídeo Abaixo do Texto</option>
                        </select>
                        <HelperText>Como o vídeo será posicionado</HelperText>
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Modo de Exibição</Label>
                        <select
                            value={videoConfig.objectFit || 'cover'}
                            onChange={(e) => {
                                const newVideo = { ...videoConfig, objectFit: e.target.value }
                                handleChange(section, 'video', newVideo)
                            }}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                        >
                            <option value="cover">Cobrir (Recomendado)</option>
                            <option value="contain">Conter</option>
                        </select>
                        <HelperText>Como o vídeo se ajusta ao espaço</HelperText>
                    </FieldGroup>

                    {videoConfig.layout === 'background' && (
                        <FieldGroup>
                            <Label>Opacidade do Vídeo de Fundo</Label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoConfig.opacity || 0.3}
                                onChange={(e) => {
                                    const newVideo = { ...videoConfig, opacity: parseFloat(e.target.value) }
                                    handleChange(section, 'video', newVideo)
                                }}
                                style={{ width: '100%' }}
                            />
                            <HelperText>{Math.round((videoConfig.opacity || 0.3) * 100)}% - Ajusta legibilidade do texto sobre o vídeo</HelperText>
                        </FieldGroup>
                    )}
                </>
            )}
        </>
    )
}

export default function ContentTab({ localConfig, setLocalConfig, activeSection, setActiveSection, focusRequest }) {
    // Local activeSection removed (lifted to parent)

    // Ref map for scrolling to fields
    const fieldRefs = React.useRef({})

    // Handle Focus Request
    React.useEffect(() => {
        if (focusRequest && focusRequest.section === activeSection) {
            // Wait for render cycle
            setTimeout(() => {
                const el = fieldRefs.current[focusRequest.field]
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    el.focus()
                    // Optional: Flash visual feedback
                    el.style.transition = 'box-shadow 0.3s'
                    el.style.boxShadow = '0 0 0 4px rgba(27, 78, 107, 0.3)'
                    setTimeout(() => { el.style.boxShadow = 'none' }, 2000)
                }
            }, 100)
        }
    }, [focusRequest, activeSection])

    // Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [pickerCallback, setPickerCallback] = useState(null)

    const openPicker = (callback) => {
        setPickerCallback(() => callback)
        setIsPickerOpen(true)
    }

    const handlePickerSelect = (url) => {
        if (pickerCallback) pickerCallback(url)
        setIsPickerOpen(false)
    }

    const handleChange = (section, key, value) => {
        setLocalConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }))
    }

    return (
        <Container>
            <SectionSelector
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
            >
                <option value="home_hero">Topo (Hero)</option>
                <option value="home_navbar">Menu Principal (Navbar)</option>
                <option value="home_metodo">O Método (Body Harmony)</option>
                <option value="home_philosophy_banner">Banner Josi/Pilares</option>
                <option value="home_philosophy">Filosofia/Sobre</option>
                <option value="home_course_cta">CTA Cursos (WhatsApp)</option>
                <option value="home_founder">Sobre a Fundadora</option>
                <option value="home_trustbar">Barra de Confiança</option>
                <option value="home_benefits">Grid de Benefícios</option>
                <option value="home_resultados">Resultados (Galeria)</option>
                <option value="home_video_gallery">Galeria de Vídeos (Novo)</option>
                <option value="home_testimonials_section">Depoimentos (Novo)</option>
                <option value="home_instagram">Instagram Feed</option>
                <option value="topBar">Barra de Aviso (Topo)</option>
                <option value="home_footer">Rodapé & Globais</option>
            </SectionSelector>

            {/* ... HERO ... */}
            {activeSection === 'home_hero' && (
                <>
                    <FieldGroup>
                        <Label>Manchete (Headline)</Label>
                        <TextArea
                            ref={el => fieldRefs.current['headline'] = el}
                            value={localConfig.home_hero?.headline || ''}
                            onChange={(e) => handleChange('home_hero', 'headline', e.target.value)}
                            placeholder="Ex: Não é a Máquina..."
                        />
                        <HelperText>Use &lt;br /&gt; para quebrar linha e &lt;span&gt; para destaque roxo/gradiente.</HelperText>
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Subtítulo</Label>
                        <TextArea
                            ref={el => fieldRefs.current['subheadline'] = el}
                            value={localConfig.home_hero?.subheadline || ''}
                            onChange={(e) => handleChange('home_hero', 'subheadline', e.target.value)}
                            placeholder="Descrição curta..."
                            style={{ minHeight: '80px' }}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Texto do Botão Primário</Label>
                        <Input
                            ref={el => fieldRefs.current['ctaText'] = el}
                            type="text"
                            value={localConfig.home_hero?.ctaText || ''}
                            onChange={(e) => handleChange('home_hero', 'ctaText', e.target.value)}
                            placeholder="Ex: Quero me tornar uma licenciada!"
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Texto do Botão Outline</Label>
                        <Input
                            ref={el => fieldRefs.current['outlineCtaText'] = el}
                            type="text"
                            value={localConfig.home_hero?.outlineCtaText || ''}
                            onChange={(e) => handleChange('home_hero', 'outlineCtaText', e.target.value)}
                            placeholder="Ex: Agendar consultoria com especialistas"
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Texto do Manifesto</Label>
                        <TextArea
                            ref={el => fieldRefs.current['manifesto'] = el}
                            value={localConfig.home_hero?.manifesto || ''}
                            onChange={(e) => handleChange('home_hero', 'manifesto', e.target.value)}
                            placeholder="Texto curto do manifesto..."
                            style={{ minHeight: '60px' }}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Link do Vídeo (Opcional)</Label>
                        <Input
                            type="url"
                            value={localConfig.home_hero?.videoLink || ''}
                            onChange={(e) => handleChange('home_hero', 'videoLink', e.target.value)}
                            placeholder="https://youtube.com/..."
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Imagem da Especialista (URL)</Label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Input
                                ref={el => fieldRefs.current['expertImage'] = el}
                                type="text"
                                value={localConfig.home_hero?.expertImage || ''}
                                onChange={(e) => handleChange('home_hero', 'expertImage', e.target.value)}
                                placeholder="/assets/images/..."
                                style={{ flex: 1 }}
                            />
                            <button
                                onClick={() => openPicker((url) => handleChange('home_hero', 'expertImage', url))}
                                style={{ padding: '0 1rem', borderRadius: '4px', border: '1px solid #ddd', background: '#f8f9fa', cursor: 'pointer' }}
                                title="Selecionar da Galeria"
                            >
                                <FaImage />
                            </button>
                        </div>
                        <HelperText>Cole a URL de uma imagem enviada em "Imagens".</HelperText>
                    </FieldGroup>

                    {/* Slideshow Manager */}
                    <div style={{ padding: '15px', background: '#f0f4f8', borderRadius: '8px', marginTop: '1rem' }}>
                        <Label style={{ display: 'block', marginBottom: '10px' }}>🖼️ Slideshow de Fundo (Hero)</Label>
                        <HelperText style={{ marginBottom: '1rem' }}>Adicione imagens para criar um efeito de transição no fundo. Se vazio, usa o fundo padrão.</HelperText>

                        {(localConfig.home_hero?.slides || []).map((slide, index) => (
                            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Input
                                        value={slide}
                                        onChange={(e) => {
                                            const newSlides = [...(localConfig.home_hero?.slides || [])]
                                            newSlides[index] = e.target.value
                                            handleChange('home_hero', 'slides', newSlides)
                                        }}
                                        placeholder={`URL da Imagem ${index + 1}`}
                                    />
                                </div>
                                <button
                                    onClick={() => openPicker((url) => {
                                        const newSlides = [...(localConfig.home_hero?.slides || [])]
                                        newSlides[index] = url
                                        handleChange('home_hero', 'slides', newSlides)
                                    })}
                                    style={{ padding: '0 1rem', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                >
                                    <FaImage />
                                </button>
                                <button
                                    onClick={() => {
                                        const newSlides = (localConfig.home_hero?.slides || []).filter((_, i) => i !== index)
                                        handleChange('home_hero', 'slides', newSlides)
                                    }}
                                    style={{ padding: '0 1rem', borderRadius: '4px', border: '1px solid #ffcfcf', background: '#fff0f0', color: 'red', cursor: 'pointer' }}
                                >
                                    ✖
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                const newSlides = [...(localConfig.home_hero?.slides || []), '']
                                handleChange('home_hero', 'slides', newSlides)
                            }}
                            style={{
                                width: '100%', padding: '10px', marginTop: '5px',
                                border: '2px dashed #ccc', borderRadius: '6px',
                                background: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#666'
                            }}
                        >
                            + Adicionar Slide
                        </button>
                    </div>

                    {/* Controles de Vídeo */}
                    <VideoControls
                        section="home_hero"
                        localConfig={localConfig}
                        handleChange={handleChange}
                    />
                </>
            )}

            {/* ... MÉTODO (BODY HARMONY) ... */}
            {activeSection === 'home_metodo' && localConfig.home_metodo && (
                <>
                    <FieldGroup>
                        <Label>Título da Seção</Label>
                        <Input
                            value={localConfig.home_metodo.title || ''}
                            onChange={(e) => handleChange('home_metodo', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Descrição (HTML permitido)</Label>
                        <TextArea
                            value={localConfig.home_metodo.description || ''}
                            onChange={(e) => handleChange('home_metodo', 'description', e.target.value)}
                            style={{ minHeight: '120px' }}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Itens: Você vai aprender a</Label>
                    {(localConfig.home_metodo.learningItems || []).map((item, index) => (
                        <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    value={item.text}
                                    onChange={(e) => {
                                        const newItems = [...localConfig.home_metodo.learningItems]
                                        newItems[index] = { ...item, text: e.target.value }
                                        handleChange('home_metodo', 'learningItems', newItems)
                                    }}
                                    placeholder={`Item ${index + 1}`}
                                />
                                <button
                                    onClick={() => {
                                        const newItems = localConfig.home_metodo.learningItems.filter((_, i) => i !== index)
                                        handleChange('home_metodo', 'learningItems', newItems)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    ✖
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newItems = [...(localConfig.home_metodo.learningItems || []), { text: '' }]
                            handleChange('home_metodo', 'learningItems', newItems)
                        }}
                        style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}
                    >
                        + Adicionar Item de Aprendizado
                    </button>

                    <Label>Itens: O Body Harmony é</Label>
                    {(localConfig.home_metodo.harmonyItems || []).map((item, index) => (
                        <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    value={item.text}
                                    onChange={(e) => {
                                        const newItems = [...localConfig.home_metodo.harmonyItems]
                                        newItems[index] = { ...item, text: e.target.value }
                                        handleChange('home_metodo', 'harmonyItems', newItems)
                                    }}
                                    placeholder={`Item ${index + 1}`}
                                />
                                <button
                                    onClick={() => {
                                        const newItems = localConfig.home_metodo.harmonyItems.filter((_, i) => i !== index)
                                        handleChange('home_metodo', 'harmonyItems', newItems)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    ✖
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newItems = [...(localConfig.home_metodo.harmonyItems || []), { text: '' }]
                            handleChange('home_metodo', 'harmonyItems', newItems)
                        }}
                        style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}
                    >
                        + Adicionar Item de Harmonia
                    </button>

                    <FieldGroup>
                        <Label>URL do Vídeo (Destaque)</Label>
                        <Input
                            value={localConfig.home_metodo.videoUrl || ''}
                            onChange={(e) => handleChange('home_metodo', 'videoUrl', e.target.value)}
                        />
                    </FieldGroup>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <Label>Banner Final (CTA)</Label>
                        <FieldGroup>
                            <Label style={{ fontSize: '0.8rem' }}>Título</Label>
                            <Input
                                value={localConfig.home_metodo.ctaTitle || ''}
                                onChange={(e) => handleChange('home_metodo', 'ctaTitle', e.target.value)}
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <Label style={{ fontSize: '0.8rem' }}>Descrição</Label>
                            <TextArea
                                value={localConfig.home_metodo.ctaDescription || ''}
                                onChange={(e) => handleChange('home_metodo', 'ctaDescription', e.target.value)}
                                style={{ minHeight: '60px' }}
                            />
                        </FieldGroup>
                    </div>
                </>
            )}


            {/* ... NAVBAR (MENU PRINCIPAL) ... */}
            {activeSection === 'home_navbar' && localConfig.navbar && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* 1. Global Enable/Disable */}
                    <div style={{ background: '#eef2f5', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Exibir Menu Principal</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={localConfig.navbar?.enabled ?? true}
                                onChange={(e) => handleChange('navbar', 'enabled', e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {localConfig.navbar?.enabled ? (
                        <>
                            {/* 2. ESTRUTURA (Layout & Density) */}
                            <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                <Label style={{ color: '#1B4E6B', borderBottom: '2px solid #1B4E6B', paddingBottom: '5px', marginBottom: '15px', display: 'block' }}>
                                    📐 Estrutura & Layout
                                </Label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <FieldGroup>
                                        <Label>Layout</Label>
                                        <select
                                            value={localConfig.navbar?.style?.layout || 'standard'}
                                            onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, layout: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        >
                                            <option value="standard">Padrão (Esq/Dir)</option>
                                            <option value="center">Centralizado</option>
                                            <option value="minimal">Minimalista (Hambúrguer)</option>
                                        </select>
                                    </FieldGroup>

                                    <FieldGroup>
                                        <Label>Altura (Densidade)</Label>
                                        <select
                                            value={localConfig.navbar?.style?.density || 'md'}
                                            onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, density: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        >
                                            <option value="sm">Compacta (P)</option>
                                            <option value="md">Normal (M)</option>
                                            <option value="lg">Espaçosa (G)</option>
                                        </select>
                                    </FieldGroup>
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <Label>Links Visíveis</Label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {[
                                            { key: 'mentors', label: 'Mentores' },
                                            { key: 'licenciadas', label: 'Licenciadas' },
                                            { key: 'results', label: 'Resultados' },
                                            { key: 'testimonials', label: 'Depoimentos' },
                                            { key: 'contact', label: 'Contato' }
                                        ].map(link => (
                                            <div key={link.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={localConfig.navbar?.links?.[link.key] ?? true}
                                                    onChange={(e) => {
                                                        const newLinks = { ...localConfig.navbar.links, [link.key]: e.target.checked }
                                                        handleChange('navbar', 'links', newLinks)
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.9rem' }}>{link.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3. ESTILO (Cores & Vidro) */}
                            <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                <Label style={{ color: '#1B4E6B', borderBottom: '2px solid #1B4E6B', paddingBottom: '5px', marginBottom: '15px', display: 'block' }}>
                                    🎨 Estilo Visual
                                </Label>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <input
                                        type="checkbox"
                                        checked={localConfig.navbar?.style?.glass || false}
                                        onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, glass: e.target.checked })}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <div>
                                        <span style={{ fontWeight: 600 }}>Ativar Efeito Vidro (Glassmorphism)</span>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Torna a barra translúcida e borra o fundo.</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <FieldGroup>
                                        <Label>Cor de Fundo</Label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input type="color"
                                                value={localConfig.navbar?.style?.background?.slice(0, 7) || '#FFFFFF'}
                                                onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, background: e.target.value })}
                                                style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                            />
                                            <Input
                                                type="text"
                                                value={localConfig.navbar?.style?.background || '#FFFFFF'}
                                                onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, background: e.target.value })}
                                                style={{ color: getContrastColor(localConfig.navbar?.style?.background || '#FFFFFF') }}
                                            />
                                        </div>
                                    </FieldGroup>
                                    <FieldGroup>
                                        <Label>Cor do Texto</Label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input type="color"
                                                value={localConfig.navbar?.style?.textColor || '#333333'}
                                                onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, textColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                            />
                                            <Input
                                                type="text"
                                                value={localConfig.navbar?.style?.textColor || '#333333'}
                                                onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, textColor: e.target.value })}
                                                style={{ color: getContrastColor(localConfig.navbar?.style?.textColor || '#333333') }}
                                            />
                                        </div>
                                    </FieldGroup>
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <Label>Cor do Logo (Opcional)</Label>
                                    <HelperText style={{ marginBottom: '5px' }}>Se vazio, usa o logo original. Selecione uma cor para pintar o logo.</HelperText>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="color"
                                            value={localConfig.navbar?.style?.logoColor || '#000000'}
                                            onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, logoColor: e.target.value })}
                                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                        />
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <Input
                                                type="text"
                                                value={localConfig.navbar?.style?.logoColor || ''}
                                                onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, logoColor: e.target.value })}
                                                placeholder="Original"
                                                style={{ color: getContrastColor(localConfig.navbar?.style?.logoColor || '#000000') }}
                                            />
                                            {localConfig.navbar?.style?.logoColor && (
                                                <button
                                                    onClick={() => handleChange('navbar', 'style', { ...localConfig.navbar.style, logoColor: null })}
                                                    style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}
                                                    title="Limpar cor (Usar Original)"
                                                >
                                                    ✖
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. AÇÕES (Highlight CTA) */}
                            <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                <Label style={{ color: '#1B4E6B', borderBottom: '2px solid #1B4E6B', paddingBottom: '5px', marginBottom: '15px', display: 'block' }}>
                                    🚨 Chamada para Ação (CTA)
                                </Label>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <Label>Cor de Destaque Personalizada</Label>
                                        <HelperText>Sobrescreve a cor padrão do tema para o botão "Inscrever".</HelperText>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="color"
                                            value={localConfig.navbar?.style?.ctaCustomColor || '#000000'}
                                            onChange={(e) => handleChange('navbar', 'style', { ...localConfig.navbar.style, ctaCustomColor: e.target.value })}
                                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                        />
                                        {localConfig.navbar?.style?.ctaCustomColor && (
                                            <button
                                                onClick={() => handleChange('navbar', 'style', { ...localConfig.navbar.style, ctaCustomColor: null })}
                                                style={{ padding: '0 10px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* 5. ALTERNATIVE MODE UI */
                        <div style={{ border: '1px solid #da8e3a', background: '#fffcf5', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ fontWeight: 600, color: '#da8e3a' }}>Modo Alternativo (Logo Apenas)</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={localConfig.navbar?.logoFallback?.enabled ?? false}
                                        onChange={(e) => handleChange('navbar', 'logoFallback', { ...localConfig.navbar.logoFallback, enabled: e.target.checked })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            {localConfig.navbar?.logoFallback?.enabled && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <FieldGroup>
                                        <Label>Cor de Fundo da Faixa</Label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input type="color"
                                                value={localConfig.navbar?.logoFallback?.background || '#FFFFFF'}
                                                onChange={(e) => handleChange('navbar', 'logoFallback', { ...localConfig.navbar.logoFallback, background: e.target.value })}
                                                style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                            />
                                            <Input
                                                value={localConfig.navbar?.logoFallback?.background || ''}
                                                onChange={(e) => handleChange('navbar', 'logoFallback', { ...localConfig.navbar.logoFallback, background: e.target.value })}
                                                placeholder="Transparent"
                                                style={{ color: getContrastColor(localConfig.navbar?.logoFallback?.background || '#FFFFFF') }}
                                            />
                                        </div>
                                    </FieldGroup>

                                    <FieldGroup>
                                        <Label>Cor do Logo</Label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input type="color"
                                                value={(['navy', 'white'].includes(localConfig.navbar?.logoFallback?.color) ? '#000000' : localConfig.navbar?.logoFallback?.color) || '#000000'}
                                                onChange={(e) => handleChange('navbar', 'logoFallback', { ...localConfig.navbar.logoFallback, color: e.target.value })}
                                                style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                            />
                                            <Input
                                                type="text"
                                                value={localConfig.navbar?.logoFallback?.color || ''}
                                                onChange={(e) => handleChange('navbar', 'logoFallback', { ...localConfig.navbar.logoFallback, color: e.target.value })}
                                                placeholder="Original"
                                                style={{ color: getContrastColor(localConfig.navbar?.logoFallback?.color || '#000000') }}
                                            />
                                        </div>
                                    </FieldGroup>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}


            {/* ... CTA CURSOS ... */}
            {activeSection === 'home_course_cta' && localConfig.home_course_cta && (
                <>
                    <FieldGroup>
                        <Label>Título</Label>
                        <Input
                            value={localConfig.home_course_cta.title || ''}
                            onChange={(e) => handleChange('home_course_cta', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Subtítulo</Label>
                        <TextArea
                            value={localConfig.home_course_cta.subtitle || ''}
                            onChange={(e) => handleChange('home_course_cta', 'subtitle', e.target.value)}
                            style={{ minHeight: '60px' }}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Número do WhatsApp (Apenas números)</Label>
                        <Input
                            value={localConfig.home_course_cta.whatsappNumber || ''}
                            onChange={(e) => handleChange('home_course_cta', 'whatsappNumber', e.target.value)}
                            placeholder="Ex: 5511999999999"
                        />
                        <HelperText>Inclua código do país e DDD (Ex: 5511...).</HelperText>
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Texto do Botão</Label>
                        <Input
                            value={localConfig.home_course_cta.buttonText || ''}
                            onChange={(e) => handleChange('home_course_cta', 'buttonText', e.target.value)}
                        />
                    </FieldGroup>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <Label>Estilo</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Cor de Fundo</Label>
                                <div style={{ display: 'flex' }}>
                                    <input type="color"
                                        value={localConfig.home_course_cta.style?.backgroundColor || '#081B2B'}
                                        onChange={(e) => handleChange('home_course_cta', 'style', { ...localConfig.home_course_cta.style, backgroundColor: e.target.value })}
                                    />
                                </div>
                            </FieldGroup>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Imagem de Fundo</Label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <Input
                                        value={localConfig.home_course_cta.style?.backgroundImage || ''}
                                        onChange={(e) => handleChange('home_course_cta', 'style', { ...localConfig.home_course_cta.style, backgroundImage: e.target.value })}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => openPicker((url) => handleChange('home_course_cta', 'style', { ...localConfig.home_course_cta.style, backgroundImage: url }))}
                                        style={{ padding: '0 1rem', background: '#eee', border: 'none', cursor: 'pointer' }}
                                    >
                                        <FaImage />
                                    </button>
                                </div>
                            </FieldGroup>
                        </div>
                    </div>
                </>
            )}

            {/* ... SOBRE A FUNDADORA ... */}
            {activeSection === 'home_founder' && localConfig.home_founder && (
                <>
                    <FieldGroup>
                        <Label>Nome</Label>
                        <Input
                            value={localConfig.home_founder.name || ''}
                            onChange={(e) => handleChange('home_founder', 'name', e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Foto da Fundadora</Label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Input
                                value={localConfig.home_founder.photo || ''}
                                onChange={(e) => handleChange('home_founder', 'photo', e.target.value)}
                                placeholder="URL da foto..."
                            />
                            <button
                                onClick={() => openPicker((url) => handleChange('home_founder', 'photo', url))}
                                style={{ padding: '0 1rem', background: '#eee', border: 'none', cursor: 'pointer' }}
                            >
                                <FaImage />
                            </button>
                        </div>
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Biografia (HTML permitido)</Label>
                        <TextArea
                            value={localConfig.home_founder.bio || ''}
                            onChange={(e) => handleChange('home_founder', 'bio', e.target.value)}
                            style={{ minHeight: '150px' }}
                        />
                        <HelperText>Use &lt;p&gt; para parágrafos.</HelperText>
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Credenciais (uma por linha)</Label>
                        <TextArea
                            value={localConfig.home_founder.credentials?.join('\n') || ''}
                            onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(l => l.trim() !== '')
                                handleChange('home_founder', 'credentials', lines)
                            }}
                            style={{ minHeight: '100px' }}
                            placeholder="Especialista em..."
                        />
                    </FieldGroup>
                </>
            )}

            {/* ... TRUSTBAR ... */}
            {activeSection === 'home_trustbar' && localConfig.home_trustbar?.items && (
                <>
                    <HelperText>Edite os 4 itens da barra de confiança.</HelperText>
                    {localConfig.home_trustbar.items.map((item, index) => (
                        <div key={item.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                            <Label style={{ fontSize: '0.8rem', color: '#999' }}>Item {index + 1} ({item.icon})</Label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <Label style={{ fontSize: '0.8rem' }}>Título</Label>
                                    <Input
                                        value={item.label}
                                        onChange={(e) => {
                                            const newItems = [...localConfig.home_trustbar.items]
                                            newItems[index] = { ...item, label: e.target.value }
                                            handleChange('home_trustbar', 'items', newItems)
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label style={{ fontSize: '0.8rem' }}>Valor</Label>
                                    <Input
                                        value={item.value}
                                        onChange={(e) => {
                                            const newItems = [...localConfig.home_trustbar.items]
                                            newItems[index] = { ...item, value: e.target.value }
                                            handleChange('home_trustbar', 'items', newItems)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* ... BENEFITS ... */}
            {activeSection === 'home_benefits' && localConfig.home_benefits && (
                <>
                    <FieldGroup>
                        <Label>Título da Seção</Label>
                        <Input
                            value={localConfig.home_benefits.headline || ''}
                            onChange={(e) => handleChange('home_benefits', 'headline', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Descrição da Seção</Label>
                        <TextArea
                            value={localConfig.home_benefits.description || ''}
                            onChange={(e) => handleChange('home_benefits', 'description', e.target.value)}
                            style={{ minHeight: '60px' }}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Cards de Benefícios</Label>
                    {(localConfig.home_benefits.cards || []).map((card, index) => (
                        <div key={card.id || index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <Label style={{ fontSize: '0.8rem', color: '#1B4E6B' }}>Card {index + 1}</Label>
                                <button
                                    onClick={() => {
                                        const newCards = localConfig.home_benefits.cards.filter((_, i) => i !== index)
                                        handleChange('home_benefits', 'cards', newCards)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Remover
                                </button>
                            </div>
                            <FieldGroup>
                                <Input
                                    value={card.title}
                                    placeholder="Título"
                                    onChange={(e) => {
                                        const newCards = [...localConfig.home_benefits.cards]
                                        newCards[index] = { ...card, title: e.target.value }
                                        handleChange('home_benefits', 'cards', newCards)
                                    }}
                                    style={{ fontWeight: 'bold' }}
                                />
                                <TextArea
                                    value={card.text}
                                    placeholder="Descrição"
                                    onChange={(e) => {
                                        const newCards = [...localConfig.home_benefits.cards]
                                        newCards[index] = { ...card, text: e.target.value }
                                        handleChange('home_benefits', 'cards', newCards)
                                    }}
                                    style={{ minHeight: '80px' }}
                                />
                            </FieldGroup>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newCards = [...(localConfig.home_benefits.cards || []), { id: Date.now().toString(), title: 'Novo Benefício', text: '' }]
                            handleChange('home_benefits', 'cards', newCards)
                        }}
                        style={{ width: '100%', padding: '10px', border: '2px dashed #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Adicionar Card
                    </button>

                    {/* Controles de Vídeo */}
                    <VideoControls
                        section="home_benefits"
                        localConfig={localConfig}
                        handleChange={handleChange}
                    />
                </>
            )}

            {/* ... VIDEO GALLERY EDITOR ... */}
            {activeSection === 'home_video_gallery' && localConfig.home_video_gallery && (
                <>
                    <FieldGroup>
                        <Label>Título da Galeria</Label>
                        <Input
                            value={localConfig.home_video_gallery.title || ''}
                            onChange={(e) => handleChange('home_video_gallery', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Subtítulo</Label>
                        <Input
                            value={localConfig.home_video_gallery.subtitle || ''}
                            onChange={(e) => handleChange('home_video_gallery', 'subtitle', e.target.value)}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Vídeos</Label>
                    {(localConfig.home_video_gallery.videos || []).map((video, index) => (
                        <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <Label style={{ fontSize: '0.8rem', color: '#1B4E6B' }}>Vídeo {index + 1}</Label>
                                <button
                                    onClick={() => {
                                        const newVideos = localConfig.home_video_gallery.videos.filter((_, i) => i !== index)
                                        handleChange('home_video_gallery', 'videos', newVideos)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Remover
                                </button>
                            </div>

                            <FieldGroup>
                                <Label>Título do Vídeo</Label>
                                <Input
                                    value={video.title}
                                    onChange={(e) => {
                                        const newVideos = [...localConfig.home_video_gallery.videos]
                                        newVideos[index] = { ...video, title: e.target.value }
                                        handleChange('home_video_gallery', 'videos', newVideos)
                                    }}
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Label>URL (Imgur/Youtube)</Label>
                                <Input
                                    value={video.url}
                                    onChange={(e) => {
                                        const newVideos = [...localConfig.home_video_gallery.videos]
                                        newVideos[index] = { ...video, url: e.target.value }
                                        handleChange('home_video_gallery', 'videos', newVideos)
                                    }}
                                    placeholder="https://imgur.com/..."
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Label>Descrição Curta</Label>
                                <TextArea
                                    value={video.description}
                                    onChange={(e) => {
                                        const newVideos = [...localConfig.home_video_gallery.videos]
                                        newVideos[index] = { ...video, description: e.target.value }
                                        handleChange('home_video_gallery', 'videos', newVideos)
                                    }}
                                    style={{ minHeight: '60px' }}
                                />
                            </FieldGroup>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newVideos = [...(localConfig.home_video_gallery.videos || []), { title: 'Novo Vídeo', url: '', description: '' }]
                            handleChange('home_video_gallery', 'videos', newVideos)
                        }}
                        style={{ width: '100%', padding: '10px', border: '2px dashed #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Adicionar Vídeo
                    </button>
                </>
            )}

            {/* ... RESULTADOS (GALLERY) ... */}
            {activeSection === 'home_resultados' && localConfig.home_resultados && (
                <>
                    <FieldGroup>
                        <Label>Título</Label>
                        <Input
                            value={localConfig.home_resultados.title || ''}
                            onChange={(e) => handleChange('home_resultados', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Subtítulo</Label>
                        <Input
                            value={localConfig.home_resultados.subtitle || ''}
                            onChange={(e) => handleChange('home_resultados', 'subtitle', e.target.value)}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Imagens de Antes & Depois</Label>
                    {(localConfig.home_resultados.results || []).map((res, index) => (
                        <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <Label style={{ fontSize: '0.8rem' }}>Imagem {index + 1}</Label>
                                <button
                                    onClick={() => {
                                        const newRes = localConfig.home_resultados.results.filter((_, i) => i !== index)
                                        handleChange('home_resultados', 'results', newRes)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    ✖
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <Input
                                    value={res.src}
                                    onChange={(e) => {
                                        const newRes = [...localConfig.home_resultados.results]
                                        newRes[index] = { ...res, src: e.target.value }
                                        handleChange('home_resultados', 'results', newRes)
                                    }}
                                    placeholder="URL da imagem..."
                                />
                                <button
                                    onClick={() => openPicker((url) => {
                                        const newRes = [...localConfig.home_resultados.results]
                                        newRes[index] = { ...res, src: url }
                                        handleChange('home_resultados', 'results', newRes)
                                    })}
                                    style={{ padding: '0 10px', background: '#eee', border: 'none', cursor: 'pointer' }}
                                >
                                    <FaImage />
                                </button>
                            </div>
                            <Input
                                value={res.alt}
                                onChange={(e) => {
                                    const newRes = [...localConfig.home_resultados.results]
                                    newRes[index] = { ...res, alt: e.target.value }
                                    handleChange('home_resultados', 'results', newRes)
                                }}
                                placeholder="Descrição (ALT) para acessibilidade..."
                                style={{ fontSize: '0.8rem' }}
                            />
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newRes = [...(localConfig.home_resultados.results || []), { src: '', alt: '' }]
                            handleChange('home_resultados', 'results', newRes)
                        }}
                        style={{ width: '100%', padding: '10px', border: '2px dashed #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Adicionar Resultado
                    </button>
                </>
            )}

            {/* ... SHOWCASE (DEVICES) ... */}
            {/* ... INSTAGRAM FEED ... */}
            {activeSection === 'home_instagram' && localConfig.home_instagram && (
                <>
                    <FieldGroup>
                        <Label>Título da Seção</Label>
                        <Input
                            value={localConfig.home_instagram.title || ''}
                            onChange={(e) => handleChange('home_instagram', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Nome de Usuário (@...)</Label>
                        <Input
                            value={localConfig.home_instagram.username || ''}
                            onChange={(e) => handleChange('home_instagram', 'username', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>URL do Instagram</Label>
                        <Input
                            value={localConfig.home_instagram.instagramUrl || ''}
                            onChange={(e) => handleChange('home_instagram', 'instagramUrl', e.target.value)}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Imagens do Feed (URLs)</Label>
                    {(localConfig.home_instagram.images || []).map((img, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <Input
                                value={img}
                                onChange={(e) => {
                                    const newImages = [...localConfig.home_instagram.images]
                                    newImages[index] = e.target.value
                                    handleChange('home_instagram', 'images', newImages)
                                }}
                            />
                            <button
                                onClick={() => openPicker((url) => {
                                    const newImages = [...localConfig.home_instagram.images]
                                    newImages[index] = url
                                    handleChange('home_instagram', 'images', newImages)
                                })}
                                style={{ padding: '0 10px', background: '#eee', border: 'none', cursor: 'pointer' }}
                            >
                                <FaImage />
                            </button>
                            <button
                                onClick={() => {
                                    const newImages = localConfig.home_instagram.images.filter((_, i) => i !== index)
                                    handleChange('home_instagram', 'images', newImages)
                                }}
                                style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                ✖
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newImages = [...(localConfig.home_instagram.images || []), '']
                            handleChange('home_instagram', 'images', newImages)
                        }}
                        style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Adicionar Imagem
                    </button>
                </>
            )}

            {/* ... DEPOIMENTOS (NEW SECTION) ... */}
            {activeSection === 'home_testimonials_section' && localConfig.home_testimonials_section && (
                <>
                    <FieldGroup>
                        <Label>Título</Label>
                        <Input
                            value={localConfig.home_testimonials_section.title || ''}
                            onChange={(e) => handleChange('home_testimonials_section', 'title', e.target.value)}
                        />
                    </FieldGroup>
                    <FieldGroup>
                        <Label>Subtítulo</Label>
                        <Input
                            value={localConfig.home_testimonials_section.subtitle || ''}
                            onChange={(e) => handleChange('home_testimonials_section', 'subtitle', e.target.value)}
                        />
                    </FieldGroup>

                    <Label style={{ marginTop: '1rem' }}>Depoimentos Individuais</Label>
                    {(localConfig.home_testimonials_section.items || []).map((item, index) => (
                        <div key={item.id || index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <Label style={{ fontSize: '0.8rem', color: '#1B4E6B' }}>Depoimento {index + 1}</Label>
                                <button
                                    onClick={() => {
                                        const newItems = localConfig.home_testimonials_section.items.filter((_, i) => i !== index)
                                        handleChange('home_testimonials_section', 'items', newItems)
                                    }}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    ✖ Remover
                                </button>
                            </div>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Nome</Label>
                                <Input
                                    value={item.name}
                                    onChange={(e) => {
                                        const newItems = [...localConfig.home_testimonials_section.items]
                                        newItems[index] = { ...item, name: e.target.value }
                                        handleChange('home_testimonials_section', 'items', newItems)
                                    }}
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Papel/Cargo</Label>
                                <Input
                                    value={item.role}
                                    onChange={(e) => {
                                        const newItems = [...localConfig.home_testimonials_section.items]
                                        newItems[index] = { ...item, role: e.target.value }
                                        handleChange('home_testimonials_section', 'items', newItems)
                                    }}
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Texto do Depoimento</Label>
                                <TextArea
                                    value={item.text}
                                    onChange={(e) => {
                                        const newItems = [...localConfig.home_testimonials_section.items]
                                        newItems[index] = { ...item, text: e.target.value }
                                        handleChange('home_testimonials_section', 'items', newItems)
                                    }}
                                    style={{ minHeight: '100px' }}
                                />
                            </FieldGroup>
                            <FieldGroup>
                                <Label style={{ fontSize: '0.8rem' }}>Foto</Label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Input
                                        value={item.image}
                                        onChange={(e) => {
                                            const newItems = [...localConfig.home_testimonials_section.items]
                                            newItems[index] = { ...item, image: e.target.value }
                                            handleChange('home_testimonials_section', 'items', newItems)
                                        }}
                                    />
                                    <button
                                        onClick={() => openPicker((url) => {
                                            const newItems = [...localConfig.home_testimonials_section.items]
                                            newItems[index] = { ...item, image: url }
                                            handleChange('home_testimonials_section', 'items', newItems)
                                        })}
                                        style={{ padding: '0 10px', background: '#eee', border: 'none', cursor: 'pointer' }}
                                    >
                                        <FaImage />
                                    </button>
                                </div>
                            </FieldGroup>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newItems = [...(localConfig.home_testimonials_section.items || []), { id: Date.now(), name: '', role: '', text: '', image: '' }]
                            handleChange('home_testimonials_section', 'items', newItems)
                        }}
                        style={{ width: '100%', padding: '10px', border: '2px dashed #ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Adicionar Depoimento
                    </button>
                </>
            )}

            {/* ... RODAPÉ & GLOBAIS ... */}
            {activeSection === 'home_footer' && localConfig.home_footer && (
                <>
                    <FieldGroup>
                        <Label>Texto de Identidade (Bio Footer)</Label>
                        <TextArea
                            value={localConfig.home_footer.identityText || ''}
                            onChange={(e) => handleChange('home_footer', 'identityText', e.target.value)}
                            style={{ minHeight: '100px' }}
                        />
                    </FieldGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <FieldGroup>
                            <Label>E-mail de Contato</Label>
                            <Input
                                value={localConfig.home_footer.contactEmail || ''}
                                onChange={(e) => handleChange('home_footer', 'contactEmail', e.target.value)}
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <Label>Telefone</Label>
                            <Input
                                value={localConfig.home_footer.contactPhone || ''}
                                onChange={(e) => handleChange('home_footer', 'contactPhone', e.target.value)}
                            />
                        </FieldGroup>
                    </div>

                    <FieldGroup>
                        <Label>Instagram (@...)</Label>
                        <Input
                            value={localConfig.home_footer.instagram || ''}
                            onChange={(e) => handleChange('home_footer', 'instagram', e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Texto de Copyright</Label>
                        <Input
                            value={localConfig.home_footer.copyright || ''}
                            onChange={(e) => handleChange('home_footer', 'copyright', e.target.value)}
                        />
                    </FieldGroup>
                </>
            )}


            {isPickerOpen && (
                <ImagePickerModal
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={handlePickerSelect}
                />
            )}
        </Container>
    )
}
