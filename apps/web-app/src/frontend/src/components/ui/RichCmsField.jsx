import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Bold, Sparkles, Type, Smile, Eye, EyeOff, Check, Eraser } from 'lucide-react';
import { renderRichText } from '../../pages/Congresso/utils/renderRichText';

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  margin-bottom: 1.25rem;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Label = styled.label`
  font-size: 0.84rem;
  font-weight: 700;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.2rem 0.35rem;
  flex-wrap: wrap;
`;

const ToolBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  min-height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #475569;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: #EDF2F7;
    color: #0F172A;
    border-color: #CBD5E1;
  }

  &:active {
    transform: scale(0.96);
  }

  ${({ $active }) => $active && css`
    background: #0A3E60;
    color: #FFFFFF;
    border-color: #0A3E60;
    &:hover {
      background: #0d4e78;
      color: #FFFFFF;
    }
  `}

  ${({ $gold, $active }) => $gold && css`
    color: ${$active ? '#FFFFFF' : '#B45309'};
    background: ${$active ? '#D97706' : 'transparent'};
    border-color: ${$active ? '#B45309' : 'transparent'};
    font-weight: 800;
    &:hover {
      background: ${$active ? '#B45309' : '#FEF3C7'};
      border-color: #FCD34D;
      color: ${$active ? '#FFFFFF' : '#92400E'};
    }
  `}
`;

const EmojiPickerDropdown = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 0.15rem 0.3rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const EmojiBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 0.95rem;
  padding: 0.2rem 0.3rem;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.1s ease;

  &:hover {
    background: #F1F5F9;
    transform: scale(1.2);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid #CBD5E1;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0F172A;
  background: #FFFFFF;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }

  &::placeholder {
    color: #94A3B8;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid #CBD5E1;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0F172A;
  background: #FFFFFF;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0A3E60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.12);
  }

  &::placeholder {
    color: #94A3B8;
  }
`;

const LivePreviewCard = styled.div`
  margin-top: 0.35rem;
  padding: 0.6rem 0.85rem;
  background: #0E1318;
  border: 1px solid #1E293B;
  border-radius: 8px;
  font-size: 0.86rem;
  color: #F8FAFC;
  line-height: 1.5;

  .preview-badge {
    font-size: 0.68rem;
    font-weight: 800;
    color: #ED7E13;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .gold-gradient {
    background: linear-gradient(135deg, #FFFFFF 0%, #f9e27e 60%, #ED7E13 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }

  strong {
    font-weight: 800;
    color: #FFFFFF;
  }
`;

const QUICK_EMOJIS = ['📍', '⚡', '👑', '🚀', '🎯', '✨', '🔥', '🛡️', '🏆', '💎'];

export default function RichCmsField({
  label,
  value = '',
  onChange,
  multiline = false,
  rows = 3,
  placeholder = '',
  hint,
  activeBadge,
  showPreviewDefault = false,
  style = {}
}) {
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(showPreviewDefault);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const rawText = value || '';
  const isBoldActive = rawText.includes('**');
  const isGoldActive = rawText.includes('*ouro:');

  // Smart Toggle: Envolve ou desenvolve seleção ou texto inteiro sem inserir texto literal
  const applySmartToggle = (prefix, suffix = prefix, placeholderText = 'texto') => {
    const el = inputRef.current;
    if (!el) return;

    const text = value || '';
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = text.substring(start, end);

    // CASO 1: Há texto selecionado
    if (selected && selected.length > 0) {
      // Se a seleção já começa com prefix e termina com suffix -> remove (unwrap)
      if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= (prefix.length + suffix.length)) {
        const unwrapped = selected.slice(prefix.length, -suffix.length || undefined);
        const newText = text.substring(0, start) + unwrapped + text.substring(end);
        onChange?.(newText);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start, start + unwrapped.length);
        }, 10);
        return;
      }

      // Envolve a seleção
      const replacement = `${prefix}${selected}${suffix}`;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      onChange?.(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + replacement.length);
      }, 10);
      return;
    }

    // CASO 2: NÃO há seleção, mas o campo já contém texto!
    if (text.trim().length > 0) {
      const trimmed = text.trim();
      // Se o texto inteiro já está envelopado com este prefixo/sufixo -> remove (unwrap)
      if (trimmed.startsWith(prefix) && trimmed.endsWith(suffix) && trimmed.length >= (prefix.length + suffix.length)) {
        const unwrapped = trimmed.slice(prefix.length, -suffix.length || undefined);
        onChange?.(unwrapped);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(0, unwrapped.length);
        }, 10);
        return;
      }

      // Se não está envelopado, envolve o texto INTEIRO diretamente sem inserir palavras literais
      const replacement = `${prefix}${trimmed}${suffix}`;
      onChange?.(replacement);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(0, replacement.length);
      }, 10);
      return;
    }

    // CASO 3: Campo totalmente vazio -> insere placeholder selecionado
    const replacement = `${prefix}${placeholderText}${suffix}`;
    onChange?.(replacement);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(prefix.length, prefix.length + placeholderText.length);
    }, 10);
  };

  const handleBold = (e) => {
    e?.preventDefault();
    applySmartToggle('**', '**', 'negrito');
  };

  const handleGold = (e) => {
    e?.preventDefault();
    applySmartToggle('*ouro:', '*', 'texto em ouro');
  };

  const handleClearFormatting = (e) => {
    e?.preventDefault();
    const text = value || '';
    // Remove tags de negrito e ouro e resíduos de placeholders
    let clean = text
      .replace(/\*\*negrito\*\*/gi, '')
      .replace(/\*ouro:texto em ouro\*/gi, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*ouro:([^*]+)\*/g, '$1')
      .replace(/\*\*+/g, '')
      .trim();
    onChange?.(clean);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(clean.length, clean.length);
      }
    }, 10);
  };

  const handleCaps = (e) => {
    e?.preventDefault();
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const text = value || '';
    const selected = text.substring(start, end);

    if (selected) {
      const isAllUpper = selected === selected.toUpperCase();
      const toggled = isAllUpper ? selected.toLowerCase() : selected.toUpperCase();
      const newText = text.substring(0, start) + toggled + text.substring(end);
      onChange?.(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + toggled.length);
      }, 10);
    } else {
      // Sem seleção: alternar todo o campo
      const isAllUpper = text === text.toUpperCase();
      onChange?.(isAllUpper ? text.toLowerCase() : text.toUpperCase());
    }
  };

  const handleInsertEmoji = (emoji) => {
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const text = value || '';

    const newText = text.substring(0, start) + emoji + text.substring(end);
    onChange?.(newText);
    setShowEmojiPicker(false);

    setTimeout(() => {
      el.focus();
      const nextPos = start + emoji.length;
      el.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  return (
    <FieldContainer style={style}>
      <LabelRow>
        {label && <Label>{label}</Label>}
        {activeBadge}

        <Toolbar>
          <ToolBtn 
            type="button" 
            $active={isBoldActive}
            onClick={handleBold} 
            title="Smart Toggle Negrito (Aplica/Remove do texto)"
          >
            <Bold size={13} /> Negrito
          </ToolBtn>

          <ToolBtn 
            type="button" 
            $gold 
            $active={isGoldActive}
            onClick={handleGold} 
            title="Smart Toggle Ouro (Aplica/Remove gradiente dourado)"
          >
            <Sparkles size={13} /> Ouro
          </ToolBtn>

          <ToolBtn type="button" onClick={handleCaps} title="Alternar Caixa Alta (MAIÚSCULAS)">
            <Type size={13} /> CAPS
          </ToolBtn>

          <ToolBtn 
            type="button" 
            onClick={handleClearFormatting} 
            title="Limpar todas as formatações e tags (Borracha)"
            style={{ color: '#DC2626' }}
          >
            <Eraser size={13} /> Limpar
          </ToolBtn>

          <div style={{ position: 'relative' }}>
            <ToolBtn 
              type="button" 
              $active={showEmojiPicker}
              onClick={() => setShowEmojiPicker(prev => !prev)} 
              title="Inserir Emojis de Luxo"
            >
              <Smile size={13} /> Emojis
            </ToolBtn>

            {showEmojiPicker && (
              <div style={{ position: 'absolute', top: '105%', right: 0, zIndex: 10 }}>
                <EmojiPickerDropdown>
                  {QUICK_EMOJIS.map(emoji => (
                    <EmojiBtn 
                      key={emoji} 
                      type="button" 
                      onClick={() => handleInsertEmoji(emoji)}
                    >
                      {emoji}
                    </EmojiBtn>
                  ))}
                </EmojiPickerDropdown>
              </div>
            )}
          </div>

          <ToolBtn 
            type="button" 
            $active={showPreview}
            onClick={() => setShowPreview(prev => !prev)} 
            title="Alternar Pré-visualização Live"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />} Live
          </ToolBtn>
        </Toolbar>
      </LabelRow>

      <InputWrapper>
        {multiline ? (
          <StyledTextarea
            ref={inputRef}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ) : (
          <StyledInput
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
      </InputWrapper>

      {showPreview && value && (
        <LivePreviewCard>
          <div className="preview-badge">👁️ Visualização Real no Site:</div>
          <div>{renderRichText(value)}</div>
        </LivePreviewCard>
      )}

      {hint && <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{hint}</span>}
    </FieldContainer>
  );
}
