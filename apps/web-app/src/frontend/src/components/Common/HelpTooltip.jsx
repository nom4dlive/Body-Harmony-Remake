import React, { useState } from 'react';
import styled from 'styled-components';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
`;

const HelpButton = styled.button`
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #ED7E13;
    background: rgba(10, 62, 96, 0.08);
  }
`;

const TooltipBox = styled(motion.div)`
  position: absolute;
  z-index: 9999;
  width: 240px;
  padding: 12px;
  background: #0A3E60;
  border: 1px solid rgba(237, 126, 19, 0.5);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  color: #FFFFFF;
  font-size: 11px;
  pointer-events: none;
  left: 50%;
  transform: translateX(-50%);

  ${props => props.$placement === 'top' ? `
    bottom: calc(100% + 8px);
  ` : `
    top: calc(100% + 8px);
  `}

  h6 {
    margin: 0 0 4px 0;
    font-size: 11px;
    font-weight: 700;
    color: #ED7E13;
  }

  p {
    margin: 0;
    font-size: 11px;
    color: #E2E8F0;
    line-height: 1.4;
  }
`;

export default function HelpTooltip({ title, content, placement = 'top' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipWrapper>
      <HelpButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        title="Ajuda"
      >
        <HelpCircle size={14} />
      </HelpButton>

      <AnimatePresence>
        {isOpen && (
          <TooltipBox
            $placement={placement}
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {title && <h6>{title}</h6>}
            <p>{content}</p>
          </TooltipBox>
        )}
      </AnimatePresence>
    </TooltipWrapper>
  );
}
