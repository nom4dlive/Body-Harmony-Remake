import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: relative;
  cursor: grab;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};
  transition: transform 0.2s, box-shadow 0.2s;
  touch-action: none; // Required for DnD

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:active {
    cursor: grabbing;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  background: #eee;
  pointer-events: none; // Prevent image dragging interfering with lib
`;

const Badge = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
`;

const DraggableImage = ({ image, selected, onClick, style: propStyle }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `image-${image.id}`,
    data: image
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    ...propStyle
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      $selected={selected}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <Image src={image.filepath} alt={image.alt_text || image.filename} loading="lazy" />

      {/* Show badges for active uses */}
      <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
        {(image.usage_locations || [image.section]).map((loc, i) => (
          loc !== 'gallery' && <Badge key={i}>{loc}</Badge>
        ))}
      </div>

    </Card>
  );
};

export default DraggableImage;
