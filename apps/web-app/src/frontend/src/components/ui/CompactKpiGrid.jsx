import React from 'react';
import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const Card = styled.div`
  background: var(--bh-bg-surface, #ffffff);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
  border: 1px solid var(--bh-border, #e2e8f0);
  border-left: 3.5px solid ${props => props.$color || '#0a3e60'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  max-height: 90px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(10, 62, 96, 0.08);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;

    .val {
      font-size: 1.35rem;
      font-weight: 800;
      color: ${props => props.$color || '#0a3e60'};
      font-family: monospace;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lbl {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--bh-text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: ${props => props.$bg || `${props.$color || '#0a3e60'}15`};
    color: ${props => props.$color || '#0a3e60'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1rem;
  }
`;

/**
 * CompactKpiGrid Component
 *
 * @param {Array} items - [{ label, value, color, bg, icon: LucideIcon }]
 */
export default function CompactKpiGrid({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <Grid className={className}>
      {items.map((item, idx) => {
        const IconComponent = item.icon;

        return (
          <Card key={idx} $color={item.color} $bg={item.bg}>
            <div className="content">
              <span className="val" title={String(item.value)}>{item.value ?? 0}</span>
              <span className="lbl" title={item.label}>{item.label}</span>
            </div>
            {IconComponent && (
              <div className="icon-wrap">
                {React.isValidElement(IconComponent) ? (
                  IconComponent
                ) : (
                  <IconComponent size={18} strokeWidth={2} />
                )}
              </div>
            )}
          </Card>
        );
      })}
    </Grid>
  );
}
