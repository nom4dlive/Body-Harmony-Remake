import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

const TabsWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--bh-border, #e2e8f0);
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  flex-wrap: nowrap;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;

  /* Hide scrollbar on Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: ${props => (props.$active ? '700' : '600')};
  color: ${props => (props.$active ? '#0a3e60' : '#64748b')};
  border-bottom: 3px solid ${props => (props.$active ? '#ed7e13' : 'transparent')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 44px;
  border-radius: 6px 6px 0 0;
  flex-shrink: 0;

  &:hover {
    color: #0a3e60;
    background: rgba(10, 62, 96, 0.03);
  }

  .badge {
    background: ${props => (props.$active ? '#ed7e13' : '#e2e8f0')};
    color: ${props => (props.$active ? '#ffffff' : '#475569')};
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
  }
`;

const EdgeGradientLeft = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 2px;
  width: 24px;
  background: linear-gradient(to right, var(--bh-bg-surface, #ffffff), transparent);
  pointer-events: none;
  opacity: ${props => (props.$show ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const EdgeGradientRight = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 2px;
  width: 24px;
  background: linear-gradient(to left, var(--bh-bg-surface, #ffffff), transparent);
  pointer-events: none;
  opacity: ${props => (props.$show ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

/**
 * ScrollableTabs Component
 *
 * @param {Array} tabs - [{ id, label, icon: LucideIcon, badge, count }]
 * @param {string} activeTab - ID of the active tab
 * @param {Function} onTabChange - Callback (tabId) => void
 */
export default function ScrollableTabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = ''
}) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  return (
    <TabsWrapper className={className}>
      <EdgeGradientLeft $show={canScrollLeft} />
      <ScrollContainer ref={containerRef} onScroll={checkScroll}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TabButton
              key={tab.id}
              $active={isActive}
              onClick={() => onTabChange && onTabChange(tab.id)}
              type="button"
            >
              {IconComponent && (
                React.isValidElement(IconComponent) ? (
                  IconComponent
                ) : (
                  <IconComponent size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                )
              )}
              <span>{tab.label}</span>
              {(tab.badge !== undefined || tab.count !== undefined) && (
                <span className="badge">{tab.badge ?? tab.count}</span>
              )}
            </TabButton>
          );
        })}
      </ScrollContainer>
      <EdgeGradientRight $show={canScrollRight} />
    </TabsWrapper>
  );
}
