import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px rgba(242, 202, 80, 0.6); }
  50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 12px rgba(242, 202, 80, 0.9); }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${AURA_COLORS.blackObsidian};
  color: ${({ $variant }) => $variant === 'vip' ? '#f9e27e' : '#e2e2e2'};
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.45rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid ${({ $variant }) => $variant === 'vip' ? '#d4af37' : '#99907c'};
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(242, 202, 80, 0.3), transparent);
    transform: skewX(-20deg);
    animation: ${shimmer} 3.5s infinite;
  }
`;

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  background: ${({ $variant }) => $variant === 'vip' ? '#f2ca50' : '#d4af37'};
  border-radius: 50%;
  box-shadow: 0 0 6px ${({ $variant }) => $variant === 'vip' ? '#f2ca50' : '#d4af37'};
  animation: ${pulse} 2s infinite ease-in-out;
`;

export default function BadgeUrgencia({ label, variant = 'default', showDot = true }) {
  if (!label) return null;

  return (
    <Badge $variant={variant}>
      {showDot && <Dot $variant={variant} />}
      {label}
    </Badge>
  );
}



