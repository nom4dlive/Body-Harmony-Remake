import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const WidgetContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.12);
  }

  /* On desktop, stacks properly in grid layout */
  @media (min-width: 769px) {
    margin-bottom: 0;
  }

  /* On mobile, full-width cards with margin between */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const WidgetHeader = styled.div`
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.light || '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 44px; /* Touch-first minimum */

  h3 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.6rem;

    svg {
      color: ${({ theme }) => theme.colors.secondary};
      font-size: 1rem;
    }
  }

  @media (min-width: 769px) {
    cursor: default;
    .toggle-icon { display: none; }
  }

  @media (max-width: 768px) {
    cursor: pointer;
  }
`;

const WidgetContent = styled(motion.div)`
  overflow: hidden;

  @media (min-width: 769px) {
    display: block !important;
    height: auto !important;
    opacity: 1 !important;
  }
`;

const ContentInner = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
  grid-auto-rows: auto;
  gap: 0.75rem;

  @media (min-width: 769px) {
    gap: 0.875rem;
    padding: 1.125rem;
  }
`;

const DashboardWidget = ({ title, icon: Icon, children, defaultExpanded = false }) => {
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 769;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !isMobile());

  const toggle = () => {
    if (isMobile()) setIsExpanded(prev => !prev);
  };

  return (
    <WidgetContainer>
      <WidgetHeader onClick={toggle}>
        <h3>
          {Icon && <Icon />}
          {title}
        </h3>
        <div className="toggle-icon" style={{ color: '#0A3E60', fontSize: '0.85rem' }}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </WidgetHeader>

      <AnimatePresence initial={false}>
        {(isExpanded || !isMobile()) && (
          <WidgetContent
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ContentInner>
              {children}
            </ContentInner>
          </WidgetContent>
        )}
      </AnimatePresence>
    </WidgetContainer>
  );
};

export default DashboardWidget;
