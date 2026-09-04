import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Search, X, SlidersHorizontal, ArrowUpDown, FolderOpen, Upload as UploadIcon, Trash2, CheckSquare, Square } from 'lucide-react';
// Note: Using CSS Grid instead of react-window due to build issues
// Performance is acceptable for ~500 files without virtualization
import FilterPanel from './FilterPanel';
import UploadZone from './UploadZone';
import BulkActionsToolbar from './BulkActionsToolbar';
import ConfirmDialog from './ConfirmDialog';
import { api } from '../../services/api';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .close-btn {
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
    
    &:hover {
      color: #fff;
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  background: #0d0d0d;
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  background: ${props => props.$active ? '#1a1a1a' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#0A3E60' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#999'};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #1a1a1a;
    color: #fff;
  }
`;

const TabContent = styled.div`
  display: ${props => props.$active ? 'flex' : 'none'};
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const UploadTabContent = styled.div`
  padding: 40px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 250px);
`;

const Toolbar = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 8px;
  
  &:focus-within {
    border-color: #0A3E60;
  }
  
  input {
    flex: 1;
    background: #0d0d0d; /* Force dark background */
    border: none;
    color: #e0e0e0; /* High contrast text */
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      background: #0d0d0d; /* Maintain on focus */
    }
    
    &::placeholder {
      color: #888;
    }
  }
  
  .clear-btn {
    cursor: pointer;
    color: #666;
    transition: color 0.2s;
    
    &:hover {
      color: #fff;
    }
  }
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: #222;
    border-color: #444;
  }
  
  select {
    background: #0d0d0d; /* Force dark background */
    border: none;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      background: #0d0d0d;
    }
    
    option {
      background: #1a1a1a;
      color: #fff;
    }
  }
`;

const FileGridContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const FileCard = styled.div`
  background: #0d0d0d;
  border: 2px solid ${props => props.$selected ? '#0A3E60' : '#222'};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: ${props => props.$selected ? '#0A3E60' : '#444'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  img, .video-placeholder {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 6px;
    background: #111;
  }

  .video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #051a29;
    color: #ED7E13;
    gap: 10px;

    svg {
      width: 40px;
      height: 40px;
    }

    span {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
`;

const Checkbox = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: ${props => props.$checked ? '#0A3E60' : 'rgba(0, 0, 0, 0.6)'};
  border: 2px solid ${props => props.$checked ? '#0A3E60' : '#fff'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    background: ${props => props.$checked ? '#0d5080' : 'rgba(0, 0, 0, 0.8)'};
    transform: scale(1.1);
  }
  
  svg {
    color: #fff;
  }
`;

const FileName = styled.div`
  margin-top: 10px;
  font-size: 0.85rem;
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const FileInfo = styled.div`
  margin-top: 6px;
  font-size: 0.75rem;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const UsageBadge = styled.span`
  background: ${props => props.$count > 5 ? '#ED7E13' : '#333'};
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0d0d0d;
  flex-wrap: wrap;
  gap: 12px;
`;

const Pagination = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  button {
    padding: 8px 16px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    &:hover:not(:disabled) {
      background: #222;
      border-color: #444;
    }
  }
  
  span {
    color: #999;
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 24px;
  background: ${props => props.$primary ? '#0A3E60' : 'transparent'};
  border: 1px solid ${props => props.$primary ? '#0A3E60' : '#444'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.$primary ? '#0d5080' : '#222'};
  }
`;

const EmptyState = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 16px;
  }
  
  p {
    margin: 10px 0 0;
    font-size: 0.95rem;
  }
`;

const SkeletonCard = styled.div`
  background: #0d0d0d;
  border: 2px solid #222;
  border-radius: 10px;
  padding: 12px;
  height: 100%;
  
  .skeleton-img {
    width: 100%;
    height: 140px;
    background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
  }
  
  .skeleton-text {
    margin-top: 10px;
    height: 12px;
    background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const FileBrowserModal = ({ category = 'thumbnail', type = '', onSelect, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchFiles();
    }
  }, [page, debouncedSearch, filters, sort, order, activeTab]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await api.media.listFiles({
        category,
        page,
        limit: 50,
        search: debouncedSearch,
        type,
        ...filters,
        sort,
        order
      });

      setFiles(response.files || []);
      setPagination(response.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile.file_path);
      onClose();
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const toggleOrder = () => {
    setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    setSelectedFiles(new Set(files.map(f => f.id)));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const handleBulkDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      await api.media.batchDelete(fileIds);

      // Refresh files and clear selection
      await fetchFiles();
      setSelectedFiles(new Set());
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Erro ao deletar arquivos. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUploadComplete = () => {
    fetchFiles();
    setActiveTab('browse');
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>
            <SlidersHorizontal size={20} />
            Gerenciador de Mídia
          </h2>
          <X size={24} className="close-btn" onClick={onClose} />
        </Header>

        <Tabs>
          <Tab $active={activeTab === 'browse'} onClick={() => setActiveTab('browse')}>
            <FolderOpen size={18} />
            Navegar Arquivos
          </Tab>
          <Tab $active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
            <UploadIcon size={18} />
            Fazer Upload
          </Tab>
        </Tabs>

        {selectedFiles.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedFiles.size}
            totalCount={files.length}
            onSelectAll={selectAllFiles}
            onDeselectAll={deselectAllFiles}
            onDelete={handleBulkDelete}
            onClose={deselectAllFiles}
          />
        )}

        <TabContent $active={activeTab === 'browse'}>
          <Toolbar>
            <SearchBar>
              <Search size={18} color="#666" />
              <input
                type="text"
                placeholder="Buscar por nome do arquivo..."
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <X size={18} className="clear-btn" onClick={clearSearch} />
              )}
            </SearchBar>

            <SortButton>
              <select value={sort} onChange={handleSortChange}>
                <option value="created_at">Data</option>
                <option value="file_size">Tamanho</option>
                <option value="access_count">Popularidade</option>
                <option value="file_name">Nome</option>
              </select>
              <ArrowUpDown
                size={16}
                onClick={toggleOrder}
                style={{ cursor: 'pointer', transform: order === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </SortButton>
          </Toolbar>

          <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />

          <FileGridContainer>
            {loading ? (
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[...Array(10)].map((_, i) => (
                  <SkeletonCard key={i}>
                    <div className="skeleton-img" />
                    <div className="skeleton-text" style={{ width: '80%' }} />
                    <div className="skeleton-text" style={{ width: '60%', marginTop: '8px' }} />
                  </SkeletonCard>
                ))}
              </div>
            ) : files.length === 0 ? (
              <EmptyState>
                <div className="icon">📂</div>
                <p>Nenhum arquivo encontrado</p>
                {search && <p style={{ color: '#888', fontSize: '0.85rem' }}>Tente uma busca diferente</p>}
              </EmptyState>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                padding: '24px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {files.map(file => {
                  const isSelected = selectedFiles.has(file.id);
                  return (
                    <FileCard
                      key={file.id}
                      $selected={selectedFile?.id === file.id}
                      onClick={() => setSelectedFile(file)}
                    >
                      <Checkbox
                        $checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.id);
                        }}
                      >
                        {isSelected && <CheckSquare size={16} />}
                      </Checkbox>

                      {file.file_name.match(/\.(mp4|mov|avi|wmv|mkv|webm)$/i) ? (
                        <div className="video-placeholder">
                          <UploadIcon size={40} style={{ transform: 'rotate(90deg)' }} />
                          <span>VÍDEO</span>
                        </div>
                      ) : (
                        <img
                          src={file.preview_url || '/placeholder.png'}
                          alt={file.file_name}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="140"%3E%3Crect fill="%23111" width="200" height="140"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                      <FileName title={file.file_name}>{file.file_name}</FileName>
                      <FileInfo>
                        <span>{file.size_formatted}</span>
                        {file.width && file.height && (
                          <span>{file.width}×{file.height}</span>
                        )}
                        {file.access_count > 0 && (
                          <UsageBadge $count={file.access_count}>
                            {file.access_count}
                          </UsageBadge>
                        )}
                      </FileInfo>
                    </FileCard>
                  );
                })}
              </div>
            )}
          </FileGridContainer>

          <Footer>
            <Pagination>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {page} de {pagination.pages || 1} ({pagination.total} arquivos)
              </span>
              <button
                disabled={page >= (pagination.pages || 1)}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima →
              </button>
            </Pagination>

            <ButtonGroup>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                $primary
                disabled={!selectedFile}
                onClick={handleSelect}
              >
                Selecionar
              </Button>
            </ButtonGroup>
          </Footer>
        </TabContent>

        <TabContent $active={activeTab === 'upload'}>
          <UploadTabContent>
            <UploadZone
              category={category}
              onUploadComplete={handleUploadComplete}
              accept={type === 'video' ? 'video/*' : 'image/*'}
            />
          </UploadTabContent>
        </TabContent>
      </ModalContent>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirmar Exclusão em Massa"
        message={`Você está prestes a deletar <strong>${selectedFiles.size} arquivo${selectedFiles.size !== 1 ? 's' : ''}</strong>.<br/><br/>Esta ação não pode ser desfeita. Deseja continuar?`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowConfirmDialog(false)}
        loading={deleteLoading}
      />
    </Modal>
  );
};

export default FileBrowserModal;
