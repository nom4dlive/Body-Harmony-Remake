import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaMagic, FaHeadphones, FaFileAlt, FaBrain, FaQuestionCircle, FaClock, FaBook, FaChartBar } from 'react-icons/fa';
import { MermaidBlock } from './MermaidBlock';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 769px) {
    align-items: center;
    padding: 1.5rem;
  }
`;

const SheetContainer = styled.div`
  width: 100%;
  max-height: 85vh;
  background: #072338;
  border-top: 2px solid #ED7E13;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 769px) {
    max-width: 800px;
    border-radius: 20px;
    border: 1px solid rgba(237, 126, 19, 0.4);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(237, 126, 19, 0.2);

    .title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .icon-badge {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(237, 126, 19, 0.15);
        color: #ED7E13;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
        color: #FFFFFF;
      }
    }

    .close-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: #94A3B8;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(237, 126, 19, 0.2);
        color: #ED7E13;
      }
    }
  }

  .sheet-body {
    padding: 1.25rem;
    overflow-y: auto;
    flex: 1;

    .markdown-content {
      font-size: 0.9rem;
      line-height: 1.7;
      color: #CBD5E1;
      white-space: pre-wrap;

      strong {
        color: #ED7E13;
      }
    }

    .chart-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;

      img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        border: 1px solid rgba(237, 126, 19, 0.3);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
    }
  }
`;

export function SmartBookBottomSheet({ isOpen, onClose, title, transformationKey, outputType, content, audioUrl, imageUrl }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <SheetContainer onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <div className="title-group">
            <div className="icon-badge">
              {outputType === 'mermaid' ? <FaBrain /> : outputType === 'quiz' ? <FaQuestionCircle /> : outputType === 'audio' ? <FaHeadphones /> : outputType === 'chart' ? <FaChartBar /> : <FaMagic />}
            </div>
            <h3>{title || 'Material Clínico Dra. Harmony'}</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fechar gaveta">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="sheet-body">
          {outputType === 'mermaid' ? (
            <MermaidBlock chart={content} />
          ) : (outputType === 'chart' || outputType === 'image') && imageUrl ? (
            <div className="chart-wrapper">
              <img src={imageUrl} alt={title || 'Infográfico Clínico'} />
            </div>
          ) : outputType === 'audio' && audioUrl ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <audio controls src={audioUrl} style={{ width: '100%', accentColor: '#ED7E13' }} />
            </div>
          ) : (
            <div className="markdown-content">{content}</div>
          )}
        </div>
      </SheetContainer>
    </Overlay>
  );
}

