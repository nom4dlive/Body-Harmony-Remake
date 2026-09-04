import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaChevronDown, FaBrain, FaBook, FaPlus, FaCheck } from 'react-icons/fa';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
`;

const HeaderContainer = styled.header`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1E3A5F;
  background: #0B1626;
  gap: 12px;
  position: relative;
  z-index: 50;
  flex-shrink: 0;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  background: #11223A;
  border: 1px solid #1E3A5F;
  color: #9AA0A6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover, &:active {
    background: #1E3A5F;
    color: #ED7E13;
    border-color: #ED7E13;
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: linear-gradient(135deg, #ED7E13 0%, #EA580C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(237, 126, 19, 0.35);

  svg {
    width: 18px;
    height: 18px;
    color: #FFFFFF;
  }
`;

const TitleSelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #E8EAED;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  text-align: left;
  min-width: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(237, 126, 19, 0.1);
    color: #ED7E13;
  }

  .title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;

    @media (max-width: 480px) {
      max-width: 150px;
    }
  }

  svg {
    font-size: 11px;
    color: #ED7E13;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  max-width: 440px;
  background: #0B1626;
  border: 1px solid #ED7E13;
  border-radius: 14px;
  padding: 10px;
  margin-top: 6px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  z-index: 100;
  max-height: 60vh;
  overflow-y: auto;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dropdown-title {
    font-size: 11px;
    font-weight: 700;
    color: #ED7E13;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 6px 10px;
    margin-bottom: 4px;
  }
`;

const ModuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => (props.active ? 'rgba(237, 126, 19, 0.15)' : 'transparent')};
  border: 1px solid ${props => (props.active ? '#ED7E13' : 'transparent')};
  margin-bottom: 4px;

  &:hover {
    background: #11223A;
  }

  .module-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .module-name {
      font-size: 12px;
      font-weight: 600;
      color: ${props => (props.active ? '#ED7E13' : '#E8EAED')};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .module-meta {
      font-size: 10px;
      color: #9AA0A6;
    }
  }

  .check-icon {
    color: #ED7E13;
    font-size: 12px;
    flex-shrink: 0;
  }
`;

const ActionButton = styled.button`
  background: #11223A;
  border: 1px solid #1E3A5F;
  border-radius: 20px;
  padding: 8px 14px;
  min-height: 40px;
  color: #E8EAED;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover, &:active {
    background: #1E3A5F;
    border-color: #ED7E13;
    color: #ED7E13;
  }

  svg {
    font-size: 10px;
    color: #ED7E13;
  }
`;

export function SmartBookHeader({
  activeModule,
  modules = [],
  onSelectModule,
  onBack,
  onNewNotebook
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <HeaderContainer>
      <LeftSection>
        {onBack && (
          <BackButton onClick={onBack} title="Voltar">
            <FaArrowLeft size={13} />
          </BackButton>
        )}
        
        <LogoIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </LogoIcon>

        <div style={{ position: 'relative' }}>
          <TitleSelectorButton onClick={() => setDropdownOpen(!dropdownOpen)} title="Clique para trocar de módulo">
            <span className="title-text">
              {activeModule?.title || 'Caderno sem título'}
            </span>
            <FaChevronDown style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </TitleSelectorButton>

          {dropdownOpen && (
            <DropdownMenu>
              <div className="dropdown-title">Cadernos dos Módulos LMS</div>
              {modules.map((mod) => (
                <ModuleItem
                  key={mod.id}
                  active={activeModule?.id === mod.id}
                  onClick={() => {
                    onSelectModule(mod);
                    setDropdownOpen(false);
                  }}
                >
                  <div className="module-info">
                    <span className="module-name">{mod.title}</span>
                    <span className="module-meta">{mod.lessons_count || mod.lessons?.length || 0} aulas sincronizadas</span>
                  </div>
                  {activeModule?.id === mod.id && <FaCheck className="check-icon" />}
                </ModuleItem>
              ))}
            </DropdownMenu>
          )}
        </div>
      </LeftSection>

      <ActionButton onClick={onNewNotebook}>
        <FaPlus />
        <span>Novo Caderno</span>
      </ActionButton>
    </HeaderContainer>
  );
}
