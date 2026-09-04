import styled, { useTheme } from 'styled-components'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaTrash, FaUpload, FaSpinner, FaSave, FaCopy, FaExternalLinkAlt, FaTimes, FaCrosshairs } from 'react-icons/fa'
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, closestCenter } from '@dnd-kit/core';

import { api } from '../../services/api'
import { ROUTES } from '../../config/routes'
import DraggableImage from '../../components/Gallery/DraggableImage'
import DroppableSlot from '../../components/Gallery/DroppableSlot'
import LivePreviewModal from '../../components/LivePreview/LivePreviewModal'

// --- Styled Components ---

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr 350px; // Left Slots | Main Grid | Right Details
  gap: 2rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 200px 1fr;
    // Right Details becomes overlay or below? 
    // For simplicity, let's keep 3 cols or hide slots on mobile
  }
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`

const Column = styled.div`
  min-width: 0;
`

const SidebarPanel = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
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

const UploadArea = styled.label`
  background: white;
  border: 2px dashed ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  margin-bottom: 2rem;
  display: block;
  &:hover { background: #fff9f0; }
  svg { font-size: 2rem; color: ${({ theme }) => theme.colors.secondary}; margin-bottom: 0.5rem; }
  input { display: none; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
`

const PreviewImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  
  img {
    width: 100%;
    display: block;
  }
  
  .focal-point {
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(255, 0, 0, 0.7);
    border: 2px solid white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
`

const Button = styled.button`
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  &.primary { background: ${({ theme }) => theme.colors.primary}; color: white; }
  &.danger { background: #ffebee; color: ${({ theme }) => theme.colors.error}; }
  &.secondary { background: #f5f5f5; color: #333; }
`

const Pill = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
  }
`

// --- Constants ---

const SLOTS = [
  { id: 'gallery', label: 'Galeria Geral' },
  { id: 'home_hero', label: 'Home: Capa (Hero)' },
  { id: 'results', label: 'Resultados (Antes/Depois)' },
  { id: 'students', label: 'Licenciadas' },
  { id: 'mentors', label: 'Mentores' },
  { id: 'testimonials', label: 'Depoimentos' },
  { id: 'home_testimonial_bg', label: 'Home: Depoimento (BG)' },
  { id: 'home_strip', label: 'Home: Strip (3 Fotos)' },
  { id: 'home_pain_side', label: 'Home: Pain Side' },
  { id: 'home_cta_bg', label: 'Home: CTA Final (BG)' },
  { id: 'home_authority_bg', label: 'Home: Autoridade (BG)' }
]

// --- Utils ---

const getUsage = (img) => {
    // Merge legacy 'section' into usage_locations if needed
    let locations = img.usage_locations || [];
    if (!Array.isArray(locations)) locations = [];
    if (img.section && img.section !== 'gallery' && !locations.includes(img.section)) {
        locations = [...locations, img.section];
    }
    // If empty and section is gallery or null, it's just gallery
    if (locations.length === 0 && (!img.section || img.section === 'gallery')) return ['gallery'];
    return locations;
}

// --- Component ---

export default function ImageManager() {
  const theme = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // Adjustments {zoom, overlay}
  const [adjustments, setAdjustments] = useState({ zoom: 100, overlay: 0.0 });
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const [activeDragId, setActiveDragId] = useState(null);

  const fetchImages = async () => {
    try {
      const data = await api.getGallery();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Update selected image if the list changes
  useEffect(() => {
    if (selectedImage) {
        const fresh = images.find(i => i.id === selectedImage.id);
        if (fresh) setSelectedImage(fresh);
    }
    if (selectedImage) {
        const fresh = images.find(i => i.id === selectedImage.id);
        if (fresh) {
            setSelectedImage(fresh);
            // Updating selected image also needs to update local editing state if we want real-time sync
            // But usually we edit local state. Let's just update if fresh has new data from server?
            // Actually, handleSelectImage sets initial state.
        }
    }
  }, [images]);

  const handleSelectImage = (img) => {
    setSelectedImage(img)
    // Legacy support: usage_locations might be null, section might be 'gallery'
    const usage = getUsage(img);
    setEditOrder(img.display_order || 0)
    setEditAlt(img.alt_text || '')
    // Fix: usage is array of strings
    // editUsage state is what? Let's check original code. 
    // It seems ImageManager didn't have setEditUsage in the snippet I read? 
    // Ah, I missed adding the state for editUsage in previous steps? 
    // Wait, the file content shows `getUsage` usage but NO `editUsage` state declared in the top!
    // I need to be careful. The previous file READ showed `setEditUsage` being used in `render`?
    // NO! The previous READ (Step 308) shows `remove button` calling `removeFromSlot` which calls `updateImageUsage`.
    // It DOES NOT use local state for usage. It updates directly.
    // So I only need to init FocalPoint and Adjustments.
    
    setFocalPoint(img.focal_point || { x: 50, y: 50 })
    setAdjustments(img.adjustments || { zoom: 100, overlay: 0.0 })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadImage(file);
      await fetchImages();
    } catch (error) {
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id.replace('image-', ''));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && over.id.startsWith('slot-')) {
        const imageId = parseInt(active.id.replace('image-', ''));
        const slotId = over.data.current.slotId;
        const img = images.find(i => i.id === imageId);
        
        if (img) {
            const currentUsage = getUsage(img);
            if (!currentUsage.includes(slotId)) {
                const newUsage = [...currentUsage.filter(u => u !== 'gallery'), slotId];
                await updateImageUsage(img, newUsage);
            }
        }
    }
  };

  const updateImageUsage = async (img, newUsage) => {
    // If usage is empty, default to gallery
    if (newUsage.length === 0) newUsage = ['gallery'];
    
    // Optimistic Update
    const updatedImg = { ...img, usage_locations: newUsage, section: newUsage[0] || 'gallery' };
    setImages(prev => prev.map(i => i.id === img.id ? updatedImg : i));
    
    try {
        await api.updateGalleryImage(img.id, {
            usage_locations: newUsage,
            section: newUsage[0] // Legacy support
        });
    } catch (err) {
        console.error(err);
        fetchImages(); // Revert on error
    }
  };

  const removeFromSlot = async (slotId) => {
      if (!selectedImage) return;
      const current = getUsage(selectedImage);
      const newUsage = current.filter(s => s !== slotId);
      await updateImageUsage(selectedImage, newUsage);
  };

  const handleFocalPointClick = async (e) => {
      if (!selectedImage) return;
      const rect = e.target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const focalPoint = { x: Math.round(x), y: Math.round(y) };
      
      // Update
      const updated = { ...selectedImage, focal_point: focalPoint };
      setImages(prev => prev.map(i => i.id === selectedImage.id ? updated : i));
      setSelectedImage(updated);
      
      try {
          await api.updateGalleryImage(selectedImage.id, { focal_point: focalPoint });
      } catch (err) {
          console.error(err);
      }
  };

  const handleUpdateAdjustments = async (key, val) => {
      if (!selectedImage) return;
      const newAdj = { ...adjustments, [key]: val };
      setAdjustments(newAdj);
      
      const updated = { ...selectedImage, adjustments: newAdj };
      setSelectedImage(updated);
      setImages(prev => prev.map(i => i.id === selectedImage.id ? updated : i));

      // Debounced auto-save or save on release? For now, user clicks Save manually or we can add a simple timeout.
      // Let's rely on manual Save for now to avoid spam, but update state immediately for preview.
  };

  const handleUpdateMeta = async (field, value) => {
      if (!selectedImage) return;
      const updated = { ...selectedImage, [field]: value };
      setSelectedImage(updated);
      setImages(prev => prev.map(i => i.id === selectedImage.id ? updated : i));
      // Debounce saving in real app, here we just save on blur or button? 
      // This function is for state update. Let's rely on "Save" button for text inputs.
  };
  
  const saveChanges = async () => {
      if (!selectedImage) return;
      setSaving(true);
      try {
          await api.updateGalleryImage(selectedImage.id, {
              alt_text: selectedImage.alt_text,
              display_order: parseInt(selectedImage.display_order || 0),
              adjustments: selectedImage.adjustments // Save adjustments too
          });
          alert('Salvo!');
      } catch (err) {
          alert('Erro ao salvar');
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async () => {
      if(!selectedImage || !window.confirm('Excluir imagem?')) return;
      try {
          await api.deleteGalleryImage(selectedImage.id);
          setImages(prev => prev.filter(i => i.id !== selectedImage.id));
          setSelectedImage(null);
      } catch(err) { alert('Erro ao excluir'); }
  };

  return (
    <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
    >
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        
        {/* Left Column: Drop Slots */}
        <SidebarPanel>
            <h3 style={{ marginBottom: '1rem', color: '#1B4E6B' }}>Seções do Site</h3>
            {SLOTS.map(slot => {
                const count = images.filter(i => getUsage(i).includes(slot.id)).length;
                return (
                    <DroppableSlot 
                        key={slot.id} 
                        id={slot.id} 
                        label={slot.label} 
                        count={count}
                    />
                );
            })}
        </SidebarPanel>

        {/* Middle Column: Grid */}
        <Column>
          <Header>
            <BackLink to={ROUTES.ADMIN_DASHBOARD}>
              <FaArrowLeft /> Voltar ao Painel
            </BackLink>
            <h1 style={{ color: '#1B4E6B' }}>Galeria (Drag & Drop)</h1>
          </Header>

          <UploadArea>
            {uploading ? <FaSpinner className="spin" /> : <FaUpload />}
            <h3>{uploading ? 'Enviando...' : 'Clique para fazer upload'}</h3>
            <input type="file" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
          </UploadArea>

          <Grid>
             {images.map(img => (
                 <DraggableImage 
                    key={img.id} 
                    image={img} 
                    selected={selectedImage?.id === img.id}
                    onClick={() => handleSelectImage(img)}
                 />
             ))}
          </Grid>
        </Column>

        {/* Right Column: Details */}
        {selectedImage ? (
        <SidebarPanel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Detalhes</h3>
                <button onClick={() => setSelectedImage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><FaTimes /></button>
            </div>
            
            <PreviewImageContainer>
                <img 
                    src={selectedImage.filepath} 
                    alt="Preview" 
                    onClick={handleFocalPointClick}
                    style={{ cursor: 'crosshair', objectPosition: selectedImage.focal_point ? `${selectedImage.focal_point.x}% ${selectedImage.focal_point.y}%` : '50% 50%' }}
                />
                {selectedImage.focal_point && (
                    <div className="focal-point" style={{ left: `${selectedImage.focal_point.x}%`, top: `${selectedImage.focal_point.y}%` }} />
                )}
            </PreviewImageContainer>
            <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', margin: '0.5rem 0' }}>
                <FaCrosshairs /> Clique na imagem para definir o ponto focal
            </p>
            
            <Button className="secondary" onClick={() => setShowPreview(true)} style={{ marginTop: '1rem', width: '100%' }}>
                <FaExternalLinkAlt /> Preview Contextual
            </Button>
            
            <div style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Em uso nas seções:</label>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }}>
                    {getUsage(selectedImage).map(slotId => (
                        <Pill key={slotId}>
                            {SLOTS.find(s => s.id === slotId)?.label || slotId}
                            <button onClick={() => removeFromSlot(slotId)}><FaTimes /></button>
                        </Pill>
                    ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 4 }}>Arraste a imagem para os slots à esquerda para adicionar.</div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Texto Alternativo (Alt)</label>
                <input 
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 4 }}
                    value={selectedImage.alt_text || ''} 
                    onChange={e => handleUpdateMeta('alt_text', e.target.value)}
                    placeholder="Descreva a imagem..."
                />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ordem</label>
                <input 
                    type="number"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 4 }}
                    value={selectedImage.display_order || 0} 
                    onChange={e => handleUpdateMeta('display_order', e.target.value)}
                />
            </div>

            <div style={{ marginTop: '1rem', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Ajustes Visuais</h4>
                
                <div style={{marginBottom: '10px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem'}}>
                        <label>Zoom / Escala</label>
                        <span>{adjustments.zoom || 100}%</span>
                    </div>
                    <input 
                        type="range" min="100" max="200" step="5"
                        value={adjustments.zoom || 100}
                        onChange={e => handleUpdateAdjustments('zoom', parseInt(e.target.value))}
                        style={{width: '100%'}}
                    />
                </div>

                <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem'}}>
                        <label>Escurecer Fundo (Overlay)</label>
                        <span>{Math.round((adjustments.overlay || 0) * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="0.9" step="0.05"
                        value={adjustments.overlay || 0}
                        onChange={e => handleUpdateAdjustments('overlay', parseFloat(e.target.value))}
                        style={{width: '100%'}}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <Button className="primary" onClick={saveChanges} disabled={saving}>
                    {saving ? <FaSpinner className="spin" /> : <FaSave />} Salvar
                </Button>
                <Button className="danger" onClick={handleDelete} title="Excluir"><FaTrash /></Button>
            </div>

        </SidebarPanel>
        ) : (
             <SidebarPanel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', height: 200 }}>
                 Selecione uma imagem para editar
             </SidebarPanel>
        )}

      </PageWrapper>

      <DragOverlay>
         {activeDragId ? (
            <div style={{ width: 150, height: 120, background: 'white', borderRadius: 8, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', padding: 5 }}>
                <img src={images.find(i => i.id == activeDragId)?.filepath} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
         ) : null}
      </DragOverlay>
    </div>
      {selectedImage && (
        <LivePreviewModal 
            isOpen={showPreview} 
            onClose={() => setShowPreview(false)}
            image={selectedImage}
            slotId={getUsage(selectedImage)[0]} 
            tempFocalPoint={selectedImage.focal_point}
        />
      )}
    </DndContext>
  )
}

