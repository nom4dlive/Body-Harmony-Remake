import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sliders, Check, X, LayoutGrid, List, Volume2, Sun, Moon, Monitor } from 'lucide-react';
import { useGestorTheme } from '../../context/GestorThemeContext';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 62, 96, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #06263B 100%);
  color: #FFFFFF;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
    }

    svg {
      color: #ED7E13;
    }
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #CBD5E1;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label.section-label {
    font-size: 13px;
    font-weight: 700;
    color: #0A3E60;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ChoiceButton = styled.button`
  min-height: 48px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;

  background: ${props => props.$active ? 'rgba(10, 62, 96, 0.08)' : '#F8FAFC'};
  border: 2px solid ${props => props.$active ? '#ED7E13' : '#E2E8F0'};
  color: ${props => props.$active ? '#0A3E60' : '#64748B'};

  &:hover {
    border-color: #ED7E13;
    color: #0A3E60;
  }

  svg {
    color: ${props => props.$active ? '#ED7E13' : '#64748B'};
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;

  .text-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .main-text {
      font-size: 14px;
      font-weight: 700;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 6px;

      svg {
        color: #ED7E13;
      }
    }

    .sub-text {
      font-size: 12px;
      color: #64748B;
    }
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #ED7E13;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelBtn = styled.button`
  min-height: 44px;
  padding: 0 18px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
`;

const SaveBtn = styled.button`
  min-height: 44px;
  padding: 0 20px;
  background: #ED7E13;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;

  &:hover {
    background: #D96F0E;
  }
`;

export default function GestorPreferencesModal({ isOpen, onClose }) {
  const { themeMode: currentThemeMode, setThemeMode: setContextThemeMode } = useGestorTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentThemeMode);
  const [density, setDensity] = useState(() => localStorage.getItem('gestor_density') || 'comfortable');
  const [defaultFunnelView, setDefaultFunnelView] = useState(() => localStorage.getItem('gestor_default_funnel_view') || 'kanban');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('gestor_sound_enabled') === 'true');

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentThemeMode);
    }
  }, [isOpen, currentThemeMode]);

  const handleSave = () => {
    setContextThemeMode(selectedTheme);
    localStorage.setItem('gestor_density', density);
    localStorage.setItem('gestor_default_funnel_view', defaultFunnelView);
    localStorage.setItem('gestor_sound_enabled', String(soundEnabled));
    window.dispatchEvent(new CustomEvent('gestor-preferences-updated', { detail: { density, defaultFunnelView, soundEnabled, themeMode: selectedTheme } }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <ModalHeader>
          <div className="title-group">
            <Sliders size={20} />
            <h4>Preferências Visuais do Gestor</h4>
          </div>
          <CloseBtn onClick={onClose}>
            <X size={18} />
          </CloseBtn>
        </ModalHeader>

        {/* BODY */}
        <ModalBody>
          {/* APARÊNCIA & MODO DE COR (DARK / LIGHT / SYSTEM) */}
          <OptionSection>
            <label className="section-label">Aparência & Tema (Dark Mode)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <ChoiceButton
                type="button"
                $active={selectedTheme === 'light'}
                onClick={() => setSelectedTheme('light')}
              >
                <Sun size={18} />
                <span>Claro</span>
              </ChoiceButton>

              <ChoiceButton
                type="button"
                $active={selectedTheme === 'dark'}
                onClick={() => setSelectedTheme('dark')}
              >
                <Moon size={18} />
                <span>Escuro</span>
              </ChoiceButton>

              <ChoiceButton
                type="button"
                $active={selectedTheme === 'system'}
                onClick={() => setSelectedTheme('system')}
              >
                <Monitor size={18} />
                <span>Sistema</span>
              </ChoiceButton>
            </div>
          </OptionSection>

          {/* DENSIDADE VISUAL */}
          <OptionSection>
            <label className="section-label">Densidade de Informação</label>
            <ButtonGrid>
              <ChoiceButton
                type="button"
                $active={density === 'comfortable'}
                onClick={() => setDensity('comfortable')}
              >
                <LayoutGrid size={18} />
                <span>Confortável (Padrão)</span>
              </ChoiceButton>

              <ChoiceButton
                type="button"
                $active={density === 'compact'}
                onClick={() => setDensity('compact')}
              >
                <List size={18} />
                <span>Compacto (Alta Densidade)</span>
              </ChoiceButton>
            </ButtonGrid>
          </OptionSection>

          {/* VISUALIZAÇÃO PADRÃO DO FUNIL */}
          <OptionSection>
            <label className="section-label">Visão Padrão do Funil de Onboarding</label>
            <ButtonGrid>
              <ChoiceButton
                type="button"
                $active={defaultFunnelView === 'kanban'}
                onClick={() => setDefaultFunnelView('kanban')}
              >
                <span>Kanban (5 Colunas)</span>
              </ChoiceButton>

              <ChoiceButton
                type="button"
                $active={defaultFunnelView === 'table'}
                onClick={() => setDefaultFunnelView('table')}
              >
                <span>Tabela Analítica</span>
              </ChoiceButton>
            </ButtonGrid>
          </OptionSection>

          {/* FEEDBACK AUDITIVO */}
          <ToggleRow>
            <div className="text-info">
              <span className="main-text">
                <Volume2 size={16} /> Feedback Sonoro
              </span>
              <span className="sub-text">Sons sutis em aprovações e ações críticas</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
          </ToggleRow>
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter>
          <CancelBtn type="button" onClick={onClose}>
            Cancelar
          </CancelBtn>
          <SaveBtn type="button" onClick={handleSave}>
            <Check size={16} />
            Salvar Preferências
          </SaveBtn>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  );
}
