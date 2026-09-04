import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, FaBolt, FaHeadphones, FaTv, FaVideo, 
  FaProjectDiagram, FaFileAlt, FaLayerGroup, 
  FaCheckSquare, FaChartPie, FaTable 
} from 'react-icons/fa';
import { STUDIO_TOOLS_CATALOG } from '../../services/smartbookApi';

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 11, 20, 0.75);
  backdrop-filter: blur(6px);
  z-index: 200;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  pointer-events: ${props => (props.isOpen ? 'all' : 'none')};
  transition: opacity 0.3s ease;
`;

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: ${props => (props.isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)')};
  width: 100%;
  max-width: 540px;
  max-height: 85vh;
  background: #0B1626;
  border-top: 1px solid #1E3A5F;
  border-radius: 24px 24px 0 0;
  z-index: 201;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7);
`;

const PanelHandle = styled.div`
  width: 40px;
  height: 4px;
  background: #1E3A5F;
  border-radius: 2px;
  margin: 10px auto 4px;
  flex-shrink: 0;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px 14px;
  border-bottom: 1px solid #1E3A5F;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;

    .tool-icon-box {
      width: 36px;
      height: 36px;
      background: rgba(237, 126, 19, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      font-size: 16px;
      flex-shrink: 0;
    }

    .tool-title {
      font-size: 15px;
      font-weight: 800;
      color: #E8EAED;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tool-subtitle {
      font-size: 11px;
      color: #9AA0A6;
      margin-top: 1px;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    border-radius: 50%;
    background: #11223A;
    border: 1px solid #1E3A5F;
    color: #9AA0A6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover, &:active {
      background: #1E3A5F;
      color: #E8EAED;
    }
  }
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #5F6B7A;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const PresetChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const PresetChip = styled.button`
  background: ${props => (props.selected ? '#ED7E13' : '#11223A')};
  border: 1px solid ${props => (props.selected ? '#ED7E13' : '#1E3A5F')};
  color: ${props => (props.selected ? '#FFFFFF' : '#9AA0A6')};
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &:hover, &:active {
    background: ${props => (props.selected ? '#ED7E13' : 'rgba(237, 126, 19, 0.12)')};
    border-color: #ED7E13;
    color: ${props => (props.selected ? '#FFFFFF' : '#ED7E13')};
  }
`;

const CustomTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  background: #11223A;
  border: 1px solid #1E3A5F;
  border-radius: 12px;
  padding: 12px;
  color: #E8EAED;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  line-height: 1.5;
  margin-bottom: 8px;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 10px rgba(237, 126, 19, 0.2);
  }

  &::placeholder {
    color: #5F6B7A;
  }
`;

const PanelFooter = styled.div`
  padding: 12px 18px;
  border-top: 1px solid #1E3A5F;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  background: #0B1626;

  .btn-cancel {
    flex: 1;
    background: #11223A;
    border: 1px solid #1E3A5F;
    border-radius: 12px;
    padding: 12px 16px;
    min-height: 48px;
    color: #9AA0A6;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover, &:active {
      background: #1E3A5F;
      color: #E8EAED;
    }
  }

  .btn-generate {
    flex: 2;
    background: linear-gradient(135deg, #ED7E13 0%, #EA580C 100%);
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    min-height: 48px;
    color: white;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(237, 126, 19, 0.35);

    &:hover, &:active {
      background: #EA580C;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;

  span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: white;
    animation: ${bounce} 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

const TOOL_ICONS = {
  audio: FaHeadphones,
  slides: FaTv,
  video: FaVideo,
  mindmap: FaProjectDiagram,
  report: FaFileAlt,
  flashcards: FaLayerGroup,
  quiz: FaCheckSquare,
  infographic: FaChartPie,
  datatable: FaTable
};

export function SmartBookStudioBottomSheet({
  isOpen,
  toolKey,
  onClose,
  onGenerate,
  isGenerating = false
}) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const toolConfig = STUDIO_TOOLS_CATALOG[toolKey] || {
    title: 'Ferramenta do Estúdio',
    presets: []
  };

  const IconComponent = TOOL_ICONS[toolKey] || FaFileAlt;

  useEffect(() => {
    if (isOpen) {
      setSelectedPresetIndex(null);
      setCustomPrompt('');
    }
  }, [isOpen, toolKey]);

  const handleSelectPreset = (index, preset) => {
    setSelectedPresetIndex(index);
    setCustomPrompt(preset.prompt);
  };

  const handleTriggerGenerate = () => {
    const selectedPreset = selectedPresetIndex !== null ? toolConfig.presets[selectedPresetIndex] : null;
    onGenerate({
      toolKey,
      customInstructions: customPrompt,
      presetLabel: selectedPreset?.label || ''
    });
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <Panel isOpen={isOpen}>
        <PanelHandle />
        <PanelHeader>
          <div className="header-left">
            <div className="tool-icon-box">
              <IconComponent />
            </div>
            <div>
              <div className="tool-title">{toolConfig.title}</div>
              <div className="tool-subtitle">Configure e gere seu conteúdo com a Dra. Harmony</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Fechar">
            <FaTimes size={13} />
          </button>
        </PanelHeader>

        <PanelBody>
          {toolConfig.presets && toolConfig.presets.length > 0 && (
            <>
              <SectionTitle>Presets rápidos</SectionTitle>
              <PresetChips>
                {toolConfig.presets.map((preset, idx) => (
                  <PresetChip
                    key={idx}
                    selected={selectedPresetIndex === idx}
                    onClick={() => handleSelectPreset(idx, preset)}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </PresetChip>
                ))}
              </PresetChips>
            </>
          )}

          <SectionTitle>Instruções personalizadas</SectionTitle>
          <CustomTextarea
            placeholder="Descreva como você deseja estruturar o conteúdo ou selecione um preset acima..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </PanelBody>

        <PanelFooter>
          <button className="btn-cancel" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </button>
          <button className="btn-generate" onClick={handleTriggerGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <LoadingDots>
                  <span />
                  <span />
                  <span />
                </LoadingDots>
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <FaBolt />
                <span>Gerar conteúdo</span>
              </>
            )}
          </button>
        </PanelFooter>
      </Panel>
    </>
  );
}
