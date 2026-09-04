import React from 'react';
import styled from 'styled-components';
import { Trash2, CheckSquare, Square, X } from 'lucide-react';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0A3E60 0%, #0d5080 100%);
  border-bottom: 1px solid #0A3E60;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SelectionInfo = styled.div`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  
  span {
    color: #ED7E13;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$danger ? '#ff4444' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$danger ? '#ff4444' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$danger ? '#cc0000' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const BulkActionsToolbar = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onDelete,
    onClose
}) => {
    const allSelected = selectedCount === totalCount;

    return (
        <Toolbar>
            <LeftSection>
                <SelectionInfo>
                    <span>{selectedCount}</span> arquivo{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
                </SelectionInfo>

                <ActionButton onClick={allSelected ? onDeselectAll : onSelectAll}>
                    {allSelected ? <Square size={16} /> : <CheckSquare size={16} />}
                    {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </ActionButton>

                <ActionButton $danger onClick={onDelete}>
                    <Trash2 size={16} />
                    Deletar Selecionados
                </ActionButton>
            </LeftSection>

            <CloseButton onClick={onClose}>
                <X size={20} />
            </CloseButton>
        </Toolbar>
    );
};

export default BulkActionsToolbar;
