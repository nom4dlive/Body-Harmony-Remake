import React from 'react';
import styled from 'styled-components';
import { FaClock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${props => props.$bg || '#f1f5f9'};
  color: ${props => props.$color || '#475569'};
  border: 1px solid ${props => props.$border || '#cbd5e1'};
  white-space: nowrap;
`;

export default function SlaBadge({ createdAt, status }) {
  if (!createdAt) return null;

  const now = new Date();
  const created = new Date(createdAt.replace(' ', 'T'));
  const diffHours = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60)));

  if (status === 'ATIVO_LIBERADO' || status === 'concluido') {
    return (
      <Badge $bg="#f0fdf4" $color="#16a34a" $border="#bbf7d0">
        <FaCheckCircle size={9} />
        <span>Concluído</span>
      </Badge>
    );
  }

  let label = `${diffHours}h no funil`;
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    label = `${days}d ${remHours}h no funil`;
  }

  // <24h: Verde | 24h-48h: Amarelo | >48h: Vermelho / Urgente
  if (diffHours < 24) {
    return (
      <Badge $bg="#f0fdf4" $color="#16a34a" $border="#bbf7d0">
        <FaClock size={9} />
        <span>{label}</span>
      </Badge>
    );
  }

  if (diffHours < 48) {
    return (
      <Badge $bg="#fffbeb" $color="#d97706" $border="#fde68a">
        <FaClock size={9} />
        <span>{label} (Atenção)</span>
      </Badge>
    );
  }

  return (
    <Badge $bg="#fef2f2" $color="#dc2626" $border="#fecaca">
      <FaExclamationCircle size={9} />
      <span>{label} (Urgente)</span>
    </Badge>
  );
}
