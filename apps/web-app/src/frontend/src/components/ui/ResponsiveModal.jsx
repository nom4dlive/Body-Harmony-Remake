import React, { useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { X } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${props => props.$dark 
    ? 'rgba(5, 10, 16, 0.85)' 
    : 'rgba(10, 62, 96, 0.7)'};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: ${props => props.$zIndex || 9999};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const getMaxWidth = (size) => {
  switch (size) {
    case 'sm': return '420px';
    case 'md': return '520px';
    case 'lg': return '640px';
    case 'xl': return '768px';
    case '2xl': return '880px';
    case '3xl': return '1024px';
    case '4xl': return '1200px';
    case 'full': return '96vw';
    default: return '640px';
  }
};

const ModalCard = styled.div`
  background: ${props => props.$dark ? '#0B132B' : '#FFFFFF'};
  color: ${props => props.$dark ? '#F8FAFC' : '#1E293B'};
  border-radius: 16px;
  width: 100%;
  max-width: ${props => getMaxWidth(props.$size)};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35), 0 0 20px rgba(237, 126, 19, 0.08);
  border: 1px solid ${props => props.$dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(237, 126, 19, 0.2)'};
  animation: ${scaleUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: calc(100dvh - 24px);
    border-radius: 20px 20px 0 0;
    border-bottom: none;
    animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.4);
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 44px;
  height: 5px;
  background: ${props => props.$dark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'};
  border-radius: 9999px;
  margin: 8px auto 2px auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ModalHeader = styled.header`
  padding: 1.15rem 1.5rem;
  background: ${props => props.$dark 
    ? 'rgba(15, 23, 42, 0.85)' 
    : 'linear-gradient(135deg, #0A3E60 0%, #06283D 100%)'};
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ED7E13;
  flex-shrink: 0;
  position: relative;
  z-index: 10;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;

    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(237, 126, 19, 0.15);
      border: 1px solid #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .titles {
      display: flex;
      flex-direction: column;
      min-width: 0;

      h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #FFFFFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Poppins', sans-serif;
      }

      p {
        margin: 2px 0 0 0;
        font-size: 0.75rem;
        color: #94A3B8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  font-family: inherit;

  @media (max-width: 768px) {
    padding: 1rem 1.15rem;
    padding-bottom: 2rem;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$dark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1'};
    border-radius: 4px;
  }
`;

const ModalFooter = styled.footer`
  padding: 0.85rem 1.5rem;
  background: ${props => props.$dark ? '#070E22' : '#F8FAFC'};
  border-top: 1px solid ${props => props.$dark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 0.75rem 1.15rem;
    position: sticky;
    bottom: 0;
    z-index: 10;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = 'lg',
  theme = 'luxury-light',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  zIndex = 9999
}) {
  const isDark = theme === 'luxury-dark' || theme === 'obsidian';

  // Fechar com tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Bloqueio de rolagem do body
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <Overlay $dark={isDark} $zIndex={zIndex} onClick={handleBackdropClick}>
      <ModalCard $dark={isDark} $size={size} onClick={e => e.stopPropagation()}>
        <DragHandle $dark={isDark} />
        
        {(title || showCloseButton) && (
          <ModalHeader $dark={isDark}>
            <div className="title-group">
              {Icon && (
                <div className="icon-box">
                  <Icon size={18} />
                </div>
              )}
              <div className="titles">
                {title && <h2>{title}</h2>}
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>

            {showCloseButton && (
              <button
                className="close-btn"
                onClick={onClose}
                aria-label="Fechar"
                type="button"
              >
                <X size={20} />
              </button>
            )}
          </ModalHeader>
        )}

        <ModalBody $dark={isDark}>
          {children}
        </ModalBody>

        {footer && (
          <ModalFooter $dark={isDark}>
            {footer}
          </ModalFooter>
        )}
      </ModalCard>
    </Overlay>
  );
}
