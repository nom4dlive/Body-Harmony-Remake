import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaFilter, FaSpinner, FaBook, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import LMSService from '../../../services/LMSService';
import ResourceCard from '../components/ResourceCard';
import GrantAccessModal from '../components/GrantAccessModal';

const LibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeaderArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .filters {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 5px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    
    .filters {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const ActionButton = styled.button`
  background: #ED7E13;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d96d07;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  border: 1px dashed #E2E8F0;
  color: #64748B;
  
  h3 { color: #0A3E60; margin-bottom: 0.5rem; }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 5px;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? 'transparent' : '#cbd5e1'};
  background: ${props => {
    if (!props.$active) return 'white';
    if (props.$type === 'approved') return '#16a34a'; // green-600
    if (props.$type === 'pending') return '#ED7E13'; // luxury gold
    return '#0A3E60'; // navy-blue
  }};
  color: ${props => props.$active ? 'white' : '#64748b'};

  &:hover {
    background: ${props => props.$active ? '' : '#f8fafc'};
    border-color: ${props => props.$active ? 'transparent' : '#0A3E60'};
    color: ${props => props.$active ? 'white' : '#0A3E60'};
  }
`;

const LoaderWrapper = styled.div`
  padding: 5rem 0;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;

  .spin {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
    display: inline-block;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0A3E60;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #ED7E13;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const FileInput = styled.input`
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  outline: none;

  &::file-selector-button {
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 0;
    font-size: 0.75rem;
    font-weight: 700;
    background: #0A3E60;
    color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #06263b;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const CancelBtn = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #1e293b;
  }
`;

const SubmitBtn = styled.button`
  padding: 0.5rem 2rem;
  background: #ED7E13;
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;

  &:hover {
    background: #d96d07;
    transform: translateY(-1px);
  }
`;

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved
    const [grantTarget, setGrantTarget] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadCategory, setUploadCategory] = useState('other');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await LMSService.getLibraryResources();
            setResources(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadTitle || !uploadFile) return;

        setUploading(true);
        try {
            await LMSService.uploadLibraryResource(uploadTitle, uploadFile, uploadCategory);
            setUploadTitle('');
            setUploadFile(null);
            setShowUploadModal(false);
            loadResources();
        } catch (error) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await LMSService.approveResource(id);
            loadResources();
        } catch (error) { alert(error.message); }
    };

    const handleReject = async (id) => {
        try {
            await LMSService.rejectResource(id);
            loadResources();
        } catch (error) { alert(error.message); }
    };

    const handleGrant = async (id, studentIds) => {
        try {
            await LMSService.grantResourceAccess(id, studentIds);
            alert('Acesso concedido com sucesso!');
        } catch (error) { alert(error.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await LMSService.deleteLibraryResource(id);
            loadResources();
        } catch (error) { alert(error.message); }
    };

    const filteredResources = resources.filter(res => {
        if (filter === 'all') return true;
        return res.status === filter;
    });

    return (
        <LibraryContainer>
            <HeaderArea>
                <FilterBar>
                    <FilterButton
                        $active={filter === 'all'}
                        $type="all"
                        onClick={() => setFilter('all')}
                    >
                        TODOS
                    </FilterButton>
                    <FilterButton
                        $active={filter === 'pending'}
                        $type="pending"
                        onClick={() => setFilter('pending')}
                    >
                        PENDENTES
                    </FilterButton>
                    <FilterButton
                        $active={filter === 'approved'}
                        $type="approved"
                        onClick={() => setFilter('approved')}
                    >
                        APROVADOS
                    </FilterButton>
                </FilterBar>

                <ActionButton onClick={() => setShowUploadModal(true)}>
                    <FaPlus /> Novo Material
                </ActionButton>
            </HeaderArea>

            {loading ? (
                <LoaderWrapper>
                    <FaSpinner className="spin" /> Carregando biblioteca...
                </LoaderWrapper>
            ) : filteredResources.length === 0 ? (
                <EmptyState>
                    <FaBook size={48} style={{ opacity: 0.2, margin: '0 auto 1.5rem' }} />
                    <h3>Biblioteca Vazia</h3>
                    <p>Nenhum material encontrado com o filtro selecionado.</p>
                </EmptyState>
            ) : (
                <Grid>
                    {filteredResources.map(res => (
                        <ResourceCard
                            key={res.id}
                            resource={res}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onGrant={(r) => setGrantTarget(r)}
                            onDelete={handleDelete}
                        />
                    ))}
                </Grid>
            )}

            {/* Grant Access Modal */}
            {grantTarget && (
                <GrantAccessModal
                    resource={grantTarget}
                    onClose={() => setGrantTarget(null)}
                    onGrant={handleGrant}
                />
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <ModalOverlay onClick={() => setShowUploadModal(false)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <ModalTitle>
                            <FaPlus /> Adicionar Recurso
                        </ModalTitle>

                        <Form onSubmit={handleUpload}>
                            <FieldGroup>
                                <label>Título do Material</label>
                                <Input
                                    type="text"
                                    required
                                    placeholder="Ex: Guia de Procedimentos Posturais"
                                    value={uploadTitle}
                                    onChange={e => setUploadTitle(e.target.value)}
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <label>Categoria</label>
                                <Select
                                    value={uploadCategory}
                                    onChange={e => setUploadCategory(e.target.value)}
                                >
                                    <option value="manual">Manual Técnico</option>
                                    <option value="evaluation">Avaliação</option>
                                    <option value="marketing">Marketing / Social</option>
                                    <option value="template">Template / Documento</option>
                                    <option value="other">Outros</option>
                                </Select>
                            </FieldGroup>

                            <FieldGroup>
                                <label>Arquivo</label>
                                <FileInput
                                    type="file"
                                    required
                                    onChange={e => setUploadFile(e.target.files[0])}
                                />
                            </FieldGroup>

                            <FormActions>
                                <CancelBtn
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    CANCELAR
                                </CancelBtn>
                                <SubmitBtn
                                    type="submit"
                                    disabled={uploading}
                                >
                                    {uploading ? <FaSpinner className="animate-spin" /> : 'ENVIAR'}
                                </SubmitBtn>
                            </FormActions>
                        </Form>
                    </ModalCard>
                </ModalOverlay>
            )}
        </LibraryContainer>
    );
};

export default ResourceLibrary;
