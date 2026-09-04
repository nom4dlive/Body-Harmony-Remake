import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MoreVertical } from 'lucide-react';

const ActionWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: flex-end;
`;

const PrimaryBtn = styled.button`
  background: ${props => (props.$variant === 'gold' ? '#ed7e13' : props.$variant === 'navy' ? '#0a3e60' : '#ffffff')};
  color: ${props => (props.$variant === 'gold' || props.$variant === 'navy' ? '#ffffff' : '#0a3e60')};
  border: 1px solid ${props => (props.$variant === 'gold' ? '#ed7e13' : props.$variant === 'navy' ? '#0a3e60' : '#cbd5e1')};
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 36px;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(10, 62, 96, 0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const MoreBtn = styled.button`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: #0a3e60;
    border-color: #0a3e60;
    background: #f8fafc;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  min-width: 170px;
  z-index: 100;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => (props.$danger ? '#dc2626' : props.$warning ? '#d97706' : '#334155')};
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.12s ease;

  &:hover {
    background: ${props => (props.$danger ? '#fee2e2' : props.$warning ? '#fef3c7' : '#f1f5f9')};
  }

  svg {
    flex-shrink: 0;
  }
`;

/**
 * TableRowActionMenu Component
 *
 * @param {Object} primaryAction - { label, onClick, icon: LucideIcon, variant: 'gold' | 'navy' | 'outline', disabled }
 * @param {Array} secondaryActions - [{ label, onClick, icon: LucideIcon, danger: boolean, warning: boolean, disabled }]
 */
export default function TableRowActionMenu({
  primaryAction,
  secondaryActions = [],
  className = ''
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const PrimaryIcon = primaryAction?.icon;

  return (
    <ActionWrapper ref={menuRef} className={className}>
      {primaryAction && (
        <PrimaryBtn
          type="button"
          onClick={primaryAction.onClick}
          $variant={primaryAction.variant || 'gold'}
          disabled={primaryAction.disabled}
        >
          {PrimaryIcon && (
            React.isValidElement(PrimaryIcon) ? (
              PrimaryIcon
            ) : (
              <PrimaryIcon size={14} strokeWidth={2} />
            )
          )}
          <span>{primaryAction.label}</span>
        </PrimaryBtn>
      )}

      {secondaryActions && secondaryActions.length > 0 && (
        <>
          <MoreBtn
            type="button"
            onClick={() => setOpen(!open)}
            title="Mais opções"
            aria-expanded={open}
          >
            <MoreVertical size={16} />
          </MoreBtn>

          {open && (
            <DropdownMenu>
              {secondaryActions.map((action, idx) => {
                const IconComp = action.icon;

                return (
                  <MenuItem
                    key={idx}
                    type="button"
                    $danger={action.danger}
                    $warning={action.warning}
                    disabled={action.disabled}
                    onClick={() => {
                      setOpen(false);
                      action.onClick && action.onClick();
                    }}
                  >
                    {IconComp && (
                      React.isValidElement(IconComp) ? (
                        IconComp
                      ) : (
                        <IconComp size={15} />
                      )
                    )}
                    <span>{action.label}</span>
                  </MenuItem>
                );
              })}
            </DropdownMenu>
          )}
        </>
      )}
    </ActionWrapper>
  );
}
