import React, { useState } from 'react';
import styled from 'styled-components';
import { Inbox, ChevronDown, ChevronUp } from 'lucide-react';

const TableContainer = styled.div`
  background: var(--bh-bg-surface, #ffffff);
  border: 1px solid var(--bh-border, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(10, 62, 96, 0.04);
  overflow: hidden;
  width: 100%;
`;

const DesktopWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;

  th {
    background: var(--bh-bg-card-subtle, #f8fafc);
    color: var(--bh-primary, #0a3e60);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bh-border, #e2e8f0);
    white-space: nowrap;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bh-border-subtle, #f1f5f9);
    color: var(--bh-text-primary, #1e293b);
    vertical-align: middle;
  }

  tbody tr {
    transition: background 0.15s ease;
    &:hover {
      background: var(--bh-bg-hover, #f8fafc);
    }
    &:last-child td {
      border-bottom: none;
    }
  }
`;

const TruncatedCell = styled.span`
  display: inline-block;
  max-width: ${props => props.$maxWidth || '200px'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`;

const MobileCardList = styled.div`
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const MobileCard = styled.div`
  background: var(--bh-bg-surface, #ffffff);
  border: 1px solid ${props => props.$expanded ? '#ED7E13' : 'var(--bh-border, #e2e8f0)'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
`;

const MobileCardCompactHeader = styled.div`
  padding: 0.75rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  cursor: pointer;
  background: ${props => props.$expanded ? 'rgba(237, 126, 19, 0.04)' : '#FFFFFF'};
  min-height: 48px;

  &:hover {
    background: rgba(10, 62, 96, 0.02);
  }
`;

const MobileCardTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  flex: 1;
`;

const MobileCardTitle = styled.div`
  font-weight: 700;
  color: var(--bh-primary, #0a3e60);
  font-size: 0.88rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MobileCardExpandedContent = styled.div`
  padding: 0.85rem;
  border-top: 1px solid var(--bh-border-subtle, #f1f5f9);
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 0.75rem;
  font-size: 0.82rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 0.68rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #64748b;
  }

  .value {
    color: #1e293b;
    font-weight: 500;
    word-break: break-word;
  }
`;

const MobileCardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--bh-border-subtle, #e2e8f0);
`;

const EmptyStateContainer = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #94a3b8;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0a3e60;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    max-width: 320px;
  }
`;

/**
 * ResponsiveDataTable Component
 *
 * @param {Array} columns - [{ key, label, width, render, truncate, maxWidth, hideOnMobile, mobileOrder }]
 * @param {Array} data - Array of data objects
 * @param {string} keyExtractor - Function or string key for unique row identification (default: 'id')
 * @param {Function} renderMobileCard - Custom card renderer (optional)
 * @param {string} emptyTitle - Text for empty title
 * @param {string} emptyMessage - Text for empty message
 * @param {React.ReactNode} emptyAction - Optional button for empty state
 */
export default function ResponsiveDataTable({
  columns = [],
  data = [],
  keyExtractor = 'id',
  renderMobileCard,
  emptyTitle = 'Nenhum registro encontrado',
  emptyMessage = 'Não há dados disponíveis para os filtros atuais.',
  emptyAction = null,
  className = ''
}) {
  const [expandedKeys, setExpandedKeys] = useState({});

  const toggleExpand = (key) => {
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getKey = (item, index) => {
    if (typeof keyExtractor === 'function') return keyExtractor(item, index);
    return item[keyExtractor] ?? index;
  };

  if (!data || data.length === 0) {
    return (
      <TableContainer className={className}>
        <EmptyStateContainer>
          <Inbox size={40} strokeWidth={1.5} />
          <h3>{emptyTitle}</h3>
          <p>{emptyMessage}</p>
          {emptyAction && <div style={{ marginTop: '0.5rem' }}>{emptyAction}</div>}
        </EmptyStateContainer>
      </TableContainer>
    );
  }

  return (
    <TableContainer className={className}>
      {/* ── Desktop Table (> 1024px) ── */}
      <DesktopWrapper>
        <StyledTable>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={{ width: col.width, minWidth: col.minWidth }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={getKey(row, rowIdx)}>
                {columns.map((col, colIdx) => {
                  const val = row[col.key];
                  const rendered = col.render ? col.render(val, row, rowIdx) : val;

                  return (
                    <td key={col.key || colIdx} style={{ width: col.width }}>
                      {col.truncate ? (
                        <TruncatedCell $maxWidth={col.maxWidth} title={typeof val === 'string' ? val : undefined}>
                          {rendered}
                        </TruncatedCell>
                      ) : (
                        rendered
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </DesktopWrapper>

      {/* ── Mobile Compact Accordion List (<= 1024px) ── */}
      <MobileCardList>
        {data.map((row, rowIdx) => {
          if (renderMobileCard) {
            return (
              <React.Fragment key={getKey(row, rowIdx)}>
                {renderMobileCard(row, rowIdx)}
              </React.Fragment>
            );
          }

          const rowKey = getKey(row, rowIdx);
          const isExpanded = !!expandedKeys[rowKey];

          const photoCol = columns.find(c => c.key === 'photo' || c.key === 'avatar' || c.key === 'image');
          const titleCol = columns.find(c => c.isTitle) || columns.find(c => c.key === 'name' || c.key === 'title') || columns[0];
          const badgeCol = columns.find(c => c.isBadge || c.key === 'status');
          const actionCol = columns.find(c => c.isAction || c.key === 'actions' || c.label?.toLowerCase().includes('ação') || c.label?.toLowerCase().includes('ações'));
          const bodyCols = columns.filter(c => c !== titleCol && c !== badgeCol && c !== actionCol && c !== photoCol && !c.hideOnMobile);

          return (
            <MobileCard key={rowKey} $expanded={isExpanded}>
              <MobileCardCompactHeader onClick={() => toggleExpand(rowKey)} $expanded={isExpanded}>
                <MobileCardTitleArea>
                  {photoCol && (
                    <div style={{ flexShrink: 0 }}>
                      {photoCol.render ? photoCol.render(row[photoCol.key], row, rowIdx) : null}
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <MobileCardTitle>
                      {titleCol?.render ? titleCol.render(row[titleCol.key], row, rowIdx) : row[titleCol?.key] || `Item #${rowIdx + 1}`}
                    </MobileCardTitle>
                  </div>
                </MobileCardTitleArea>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {badgeCol && (
                    <div style={{ transform: 'scale(0.92)' }}>
                      {badgeCol.render ? badgeCol.render(row[badgeCol.key], row, rowIdx) : row[badgeCol.key]}
                    </div>
                  )}
                  <div style={{ color: isExpanded ? '#ED7E13' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </MobileCardCompactHeader>

              {isExpanded && (
                <MobileCardExpandedContent>
                  <MobileCardBody>
                    {bodyCols.map((col, cIdx) => {
                      const val = row[col.key];
                      const rendered = col.render ? col.render(val, row, rowIdx) : val;

                      return (
                        <MobileCardField key={col.key || cIdx}>
                          <span className="label">{col.label}</span>
                          <span className="value">{rendered ?? '—'}</span>
                        </MobileCardField>
                      );
                    })}
                  </MobileCardBody>

                  {actionCol && (
                    <MobileCardActions>
                      {actionCol.render ? actionCol.render(row[actionCol.key], row, rowIdx) : row[actionCol.key]}
                    </MobileCardActions>
                  )}
                </MobileCardExpandedContent>
              )}
            </MobileCard>
          );
        })}
      </MobileCardList>
    </TableContainer>
  );
}
