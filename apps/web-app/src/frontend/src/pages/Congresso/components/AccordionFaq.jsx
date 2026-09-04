import React, { useState } from 'react';
import styled from 'styled-components';
 import { ChevronDown } from 'lucide-react';
 import { motion, AnimatePresence } from 'framer-motion';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const Item = styled.div`
  border-bottom: 1px solid ${AURA_COLORS.outlineVariant};
  &:first-child { border-top: 1px solid ${AURA_COLORS.outlineVariant}; }
  transition: all 0.2s ease;
`;

const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.6rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #FFFFFF;
  text-align: left;
  min-height: 48px;
  transition: color 0.2s ease;

  &:hover {
    color: #f9e27e;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 1.2rem 0.2rem;
  }
`;

const Icon = styled(ChevronDown)`
  flex-shrink: 0;
  color: ${AURA_COLORS.primary};
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const Answer = styled(motion.div)`
  overflow: hidden;
`;

const AnswerInner = styled.p`
  padding: 0 0.5rem 1.8rem;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: ${AURA_COLORS.onSurfaceVariant};
  line-height: 1.75;
`;

export default function AccordionFaq({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div>
      {items.map((item, idx) => (
        <Item key={idx}>
          <Trigger onClick={() => toggle(idx)} aria-expanded={openIndex === idx}>
            <span>{item.question}</span>
            <Icon size={22} $open={openIndex === idx} />
          </Trigger>
          <AnimatePresence initial={false}>
            {openIndex === idx && (
              <Answer
                key="answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnswerInner>{item.answer}</AnswerInner>
              </Answer>
            )}
          </AnimatePresence>
        </Item>
      ))}
    </div>
  );
}


