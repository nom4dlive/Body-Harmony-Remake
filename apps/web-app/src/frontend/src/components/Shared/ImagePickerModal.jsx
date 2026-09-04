import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FaTimes, FaSearch, FaCheck, FaImage } from 'react-icons/fa'
import { api } from '../../services/api'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
`

const ModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: 900px;
  height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
`

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SearchBar = styled.div`
  margin: 0 1rem;
  flex: 1;
  max-width: 400px;
  position: relative;
  
  input {
    width: 100%;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 0.9rem;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  &:hover { color: #d00; }
`

const Grid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  align-content: start;
`

const ImageCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : 'transparent')};
  transition: all 0.2s;
  background: #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .check-overlay {
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.primary}99;
    display: ${({ $selected }) => ($selected ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
  }
`

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: white;
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  
  &.cancel {
    background: #f1f3f5;
    color: #495057;
    &:hover { background: #e9ecef; }
  }
  
  &.confirm {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { opacity: 0.9; }
  }
`

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #888;
`

export default function ImagePickerModal({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    }
  }, [isOpen])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const data = await api.getGallery()
      setImages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load images", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage.filepath)
      onClose()
    }
  }

  const filteredImages = images.filter(img => 
    img.alt_text?.toLowerCase().includes(search.toLowerCase()) || 
    img.filename?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <Title><FaImage /> Biblioteca de Mídia</Title>
          <SearchBar>
            <FaSearch />
            <input 
                type="text" 
                placeholder="Buscar por nome ou alt..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </SearchBar>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </Header>
        
        <Grid>
          {loading ? (
             <EmptyState>Carregando...</EmptyState>
          ) : filteredImages.length > 0 ? (
             filteredImages.map(img => (
                <ImageCard 
                    key={img.id} 
                    $selected={selectedImage?.id === img.id}
                    onClick={() => setSelectedImage(img)}
                    title={img.alt_text}
                >
                    <img src={img.filepath} alt={img.alt_text || 'Imagem'} loading="lazy" />
                    <div className="check-overlay"><FaCheck /></div>
                </ImageCard>
             ))
          ) : (
             <EmptyState>Nenhuma imagem encontrada.</EmptyState>
          )}
        </Grid>

        <Footer>
           <Button className="cancel" onClick={onClose}>Cancelar</Button>
           <Button className="confirm" disabled={!selectedImage} onClick={handleConfirm}>
             Confirmar Seleção
           </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  )
}
