import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';

const SlotContainer = styled.div`
  background: ${({ $isOver, theme }) => $isOver ? '#e3f2fd' : 'white'};
  border: 2px dashed ${({ $isOver, theme }) => $isOver ? theme.colors.primary : '#ddd'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.2s;
  cursor: default;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Counter = styled.span`
  background: #eee;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  color: #666;
`;

const DroppableSlot = ({ id, label, count = 0, isActive }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${id}`,
    data: { slotId: id }
  });

  return (
    <SlotContainer ref={setNodeRef} $isOver={isOver}>
      <Title>
        {label}
        <Counter>{count}</Counter>
      </Title>
      <div style={{ fontSize: '0.8rem', color: '#888' }}>
        {isOver ? 'Solte para adicionar!' : 'Arraste imagens aqui'}
      </div>
    </SlotContainer>
  );
};

export default DroppableSlot;
