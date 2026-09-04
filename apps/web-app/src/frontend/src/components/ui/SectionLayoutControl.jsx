import React from 'react';
import styled, { css } from 'styled-components';
import { AlignLeft, AlignCenter, AlignRight, Layout, ArrowUp, ArrowDown, Sparkles, RotateCcw, Image, MousePointerClick } from 'lucide-react';

const Box = styled.div`
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin: 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Title = styled.div`
  font-size: 0.84rem;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ResetBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748B;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #991B1B;
    border-color: #FCA5A5;
    background: #FEF2F2;
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const GroupLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const PillGroup = styled.div`
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
`;

const PillBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  font-size: 0.74rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #64748B;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 30px;
  white-space: nowrap;

  &:hover {
    color: #0F172A;
    background: #F1F5F9;
  }

  ${({ $active }) => $active && css`
    background: #0A3E60;
    color: #FFFFFF;
    font-weight: 800;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    &:hover {
      background: #0d4e78;
      color: #FFFFFF;
    }
  `}
`;

export default function SectionLayoutControl({
  sectionName = 'Seção',
  photoPosition,
  onPhotoPositionChange,
  ctaPosition,
  onCtaPositionChange,
  align = 'center',
  onAlignChange,
  ctaPreset,
  onCtaPresetChange,
  onResetSection
}) {
  const handleReset = (e) => {
    e?.preventDefault();
    if (window.confirm(`Deseja restaurar as posições e textos originais da seção "${sectionName}"?`)) {
      onResetSection?.();
    }
  };

  return (
    <Box>
      <HeaderRow>
        <Title>
          <Layout size={14} color="#0A3E60" />
          Estrutura & Posições: {sectionName}
        </Title>
        {onResetSection && (
          <ResetBtn type="button" onClick={handleReset} title="Restaurar padrão desta seção">
            <RotateCcw size={12} /> Restaurar {sectionName}
          </ResetBtn>
        )}
      </HeaderRow>

      <ControlsGrid>
        {/* Alinhamento de Texto */}
        {onAlignChange && (
          <ControlGroup>
            <GroupLabel>Alinhamento de Conteúdo</GroupLabel>
            <PillGroup>
              <PillBtn 
                type="button" 
                $active={align === 'left'} 
                onClick={() => onAlignChange('left')}
                title="Alinhar à Esquerda"
              >
                <AlignLeft size={13} /> Esquerda
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={!align || align === 'center'} 
                onClick={() => onAlignChange('center')}
                title="Centralizado"
              >
                <AlignCenter size={13} /> Centro
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={align === 'right'} 
                onClick={() => onAlignChange('right')}
                title="Alinhar à Direita"
              >
                <AlignRight size={13} /> Direita
              </PillBtn>
            </PillGroup>
          </ControlGroup>
        )}

        {/* Posição da Foto */}
        {onPhotoPositionChange && (
          <ControlGroup>
            <GroupLabel><Image size={12} /> Posição da Foto/Carrossel</GroupLabel>
            <PillGroup>
              <PillBtn 
                type="button" 
                $active={photoPosition === 'top'} 
                onClick={() => onPhotoPositionChange('top')}
                title="Foto Acima do Texto Principal"
              >
                <ArrowUp size={13} /> Acima
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={!photoPosition || photoPosition === 'bottom'} 
                onClick={() => onPhotoPositionChange('bottom')}
                title="Foto Abaixo do Texto Principal"
              >
                <ArrowDown size={13} /> Abaixo
              </PillBtn>
            </PillGroup>
          </ControlGroup>
        )}

        {/* Posição do CTA */}
        {onCtaPositionChange && (
          <ControlGroup>
            <GroupLabel><MousePointerClick size={12} /> Posição do Botão CTA</GroupLabel>
            <PillGroup>
              <PillBtn 
                type="button" 
                $active={!ctaPosition || ctaPosition === 'after_details'} 
                onClick={() => onCtaPositionChange('after_details')}
                title="Botão CTA após o bloco de detalhes"
              >
                Após Detalhes
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={ctaPosition === 'before_details'} 
                onClick={() => onCtaPositionChange('before_details')}
                title="Botão CTA antes do bloco de detalhes"
              >
                Antes Detalhes
              </PillBtn>
            </PillGroup>
          </ControlGroup>
        )}

        {/* Preset de Estilo CTA & Shader */}
        {onCtaPresetChange && (
          <ControlGroup>
            <GroupLabel><Sparkles size={12} /> Acabamento do Botão / Shader</GroupLabel>
            <PillGroup>
              <PillBtn 
                type="button" 
                $active={!ctaPreset || ctaPreset === 'shader_gold' || ctaPreset === 'gold'} 
                onClick={() => onCtaPresetChange('shader_gold')}
                title="Shader de Ouro Líquido WebGL em Tempo Real"
              >
                💫 Ouro Líquido
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={ctaPreset === 'gold_static'} 
                onClick={() => onCtaPresetChange('gold_static')}
                title="Dourado Metálico Clássico (Sem Shader)"
              >
                ✨ Ouro Clássico
              </PillBtn>
              <PillBtn 
                type="button" 
                $active={ctaPreset === 'navy'} 
                onClick={() => onCtaPresetChange('navy')}
                title="Azul Marinho Luxury"
              >
                ⚓ Navy
              </PillBtn>
            </PillGroup>
          </ControlGroup>
        )}
      </ControlsGrid>
    </Box>
  );
}
