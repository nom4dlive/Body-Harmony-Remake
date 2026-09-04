import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaSearch, FaCheckSquare, FaSquare, FaSpinner } from 'react-icons/fa';
import LMSService from '../../../services/LMSService';

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const StudentList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  min-height: 48px; /* Mobile First: Touch target */
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmBtn = styled(ActionButton)`
  background: #ED7E13;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.2);

  &:hover:not(:disabled) {
    background: #FF8F26;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CancelBtn = styled(ActionButton)`
  background: transparent;
  color: #0A3E60;
  border: 2px solid #0A3E60;

  &:hover:not(:disabled) {
    background: rgba(10, 62, 96, 0.05);
    border-color: #0A3E60;
  }
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => props.international ? '#ED7E1333' : '#0A3E6033'};
  color: ${props => props.international ? '#ED7E13' : '#0A3E60'};
  border: 1px solid ${props => props.international ? '#ED7E1333' : '#0A3E6033'};
`;

const MassActionButton = styled.button`
  font-size: 11px;
  font-weight: 700;
  color: #0A3E60;
  background: transparent;
  border: 1px solid #0A3E6033;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #0A3E6011;
    border-color: #0A3E60;
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
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const HeaderTitleGroup = styled.div`
  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;

    svg {
      color: #ED7E13;
    }
  }

  p {
    font-size: 0.75rem;
    color: #64748b;
    margin: 4px 0 0 0;
    font-weight: 600;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ResourceSubtitle = styled.p`
  font-size: 0.875rem;
  color: #475569;
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  margin: 1rem 0 0 0;

  strong {
    color: #0A3E60;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
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

const StudentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: justify;
  padding: 1rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$selected ? '#cbd5e1' : '#f1f5f9'};
  background: ${props => props.$selected ? '#f0f7ff' : 'white'};

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const StudentInfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #64748b;
  font-size: 0.875rem;
`;

const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p.name {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  p.subtext {
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }
`;

const CheckboxWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 1.25rem;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GrantAccessModal = ({ resource, onClose, onGrant }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await LMSService.getStudents();
            setStudents(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAll = (select) => {
        if (select) {
            setSelected(students.map(s => s.id));
        } else {
            setSelected([]);
        }
    };

    const toggleStudent = (id) => {
        setSelected(prev => prev.includes(id)
            ? prev.filter(s => s !== id)
            : [...prev, id]
        );
    };

    const handleGrant = async () => {
        if (selected.length === 0) return;
        setSaving(true);
        try {
            await onGrant(resource.id, selected);
            onClose();
        } catch (error) {
            alert('Erro ao conceder acesso: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase()) ||
        (s.state && s.state.toLowerCase().includes(search.toLowerCase())) ||
        (s.location && s.location.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                <ModalHeader>
                    <HeaderTop>
                        <HeaderTitleGroup>
                            <h2>
                                <FaUsers /> DISTRIBUIR RECURSO
                            </h2>
                            <p>
                                {selected.length}/{students.length} licenciadas selecionadas
                            </p>
                        </HeaderTitleGroup>
                        <ActionButtonsGroup>
                            <MassActionButton onClick={() => toggleAll(true)}>
                                ✅ Marcar Todos
                            </MassActionButton>
                            <MassActionButton onClick={() => toggleAll(false)}>
                                ❌ Desmarcar
                            </MassActionButton>
                        </ActionButtonsGroup>
                    </HeaderTop>
                    <ResourceSubtitle>
                        Arquivo: <strong>{resource.title}</strong>
                    </ResourceSubtitle>
                </ModalHeader>

                <div style={{ padding: '1.5rem' }}>
                    <SearchContainer>
                        <FaSearch />
                        <SearchInput
                            type="text"
                            placeholder="Buscar por nome, usuário, estado ou cidade..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </SearchContainer>

                    <StudentList style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                        {loading ? (
                            <div style={{ padding: '5rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                <FaSpinner className="animate-spin inline mr-2 text-xl" /> Carregando lista de licenciadas...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '5rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                Nenhuma licenciada encontrada com esses critérios.
                            </div>
                        ) : (
                            filtered.map(student => (
                                <StudentItem
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    $selected={selected.includes(student.id)}
                                >
                                    <StudentInfoGroup>
                                        <Avatar>
                                            {student.name.charAt(0)}
                                        </Avatar>
                                        <StudentDetails>
                                            <div className="name-row">
                                                <p className="name">{student.name}</p>
                                                {student.state && (
                                                    <Badge international={!/^[A-Z]{2}$/.test(student.state)}>
                                                        {student.state}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="subtext">
                                                {student.username} {student.location && `• ${student.location}`}
                                            </p>
                                        </StudentDetails>
                                    </StudentInfoGroup>
                                    <CheckboxWrapper>
                                        {selected.includes(student.id) ? (
                                            <FaCheckSquare style={{ color: '#0A3E60' }} />
                                        ) : (
                                            <FaSquare style={{ color: '#cbd5e1' }} />
                                        )}
                                    </CheckboxWrapper>
                                </StudentItem>
                            ))
                        )}
                    </StudentList>
                </div>

                <ModalFooter>
                    <CancelBtn onClick={onClose}>
                        ◀ CANCELAR
                    </CancelBtn>
                    <ConfirmBtn
                        onClick={handleGrant}
                        disabled={selected.length === 0 || saving}
                        style={{ minWidth: '200px' }}
                    >
                        {saving ? <FaSpinner className="animate-spin" /> : (
                            <>
                                <FaCheckSquare /> CONFIRMAR DISTRIBUIÇÃO
                            </>
                        )}
                    </ConfirmBtn>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

export default GrantAccessModal;
