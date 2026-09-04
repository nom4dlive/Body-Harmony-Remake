import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBookOpen, FaPrint, FaCopy, FaCheck, FaSearch, FaClock, FaBook } from 'react-icons/fa';

const GuideWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: 'Poppins', sans-serif;
  color: #FFFFFF;
`;

const GuideHeader = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #051A29 100%);
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  .title-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-box {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(237, 126, 19, 0.15);
      border: 1px solid #ED7E13;
      color: #ED7E13;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const ActionBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(237, 126, 19, 0.2);
    border-color: #ED7E13;
    color: #ED7E13;
  }
`;

const ContentCard = styled.div`
  background: rgba(5, 26, 41, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  line-height: 1.7;
  font-size: 0.92rem;
  color: #E2E8F0;

  h1, h2, h3, h4 {
    color: #FFFFFF;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 700;
  }

  h1 { font-size: 1.5rem; border-bottom: 1px solid rgba(237, 126, 19, 0.3); padding-bottom: 0.5rem; color: #ED7E13; }
  h2 { font-size: 1.25rem; color: #ED7E13; }
  h3 { font-size: 1.05rem; }

  ul, ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    li {
      margin-bottom: 0.4rem;
    }
  }

  strong {
    color: #FFFFFF;
    font-weight: 600;
  }

  blockquote {
    background: rgba(10, 62, 96, 0.35);
    border-left: 4px solid #ED7E13;
    margin: 1rem 0;
    padding: 0.75rem 1.25rem;
    border-radius: 0 8px 8px 0;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 1.5rem 0;
  }

  /* Impressão Limpa */
  @media print {
    background: #FFFFFF !important;
    color: #000000 !important;
    padding: 0 !important;
    border: none !important;

    h1, h2, h3, strong {
      color: #000000 !important;
    }
  }
`;

export default function StudyGuideViewer({ title, markdownContent, type = 'guide' }) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getIcon = () => {
    if (type === 'timeline') return <FaClock />;
    if (type === 'glossary') return <FaBook />;
    return <FaBookOpen />;
  };

  return (
    <GuideWrapper>
      <GuideHeader>
        <div className="title-block">
          <div className="icon-box">{getIcon()}</div>
          <h3>{title}</h3>
        </div>

        <div className="actions">
          <ActionBtn onClick={handleCopy}>
            {copied ? <><FaCheck style={{ color: '#22c55e' }} /> Copiado</> : <><FaCopy /> Copiar Texto</>}
          </ActionBtn>
          <ActionBtn onClick={handlePrint}>
            <FaPrint /> Imprimir / PDF
          </ActionBtn>
        </div>
      </GuideHeader>

      <ContentCard>
        {markdownContent.split('\n\n').map((paragraph, pIdx) => {
          const trimmed = paragraph.trim();
          if (trimmed.startsWith('# ')) {
            return <h1 key={pIdx}>{trimmed.replace(/^#\s+/, '')}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={pIdx}>{trimmed.replace(/^##\s+/, '')}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={pIdx}>{trimmed.replace(/^###\s+/, '')}</h3>;
          }
          if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
            return <hr key={pIdx} />;
          }
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const items = trimmed.split('\n').map(i => i.replace(/^[\*\-]\s+/, ''));
            return (
              <ul key={pIdx}>
                {items.map((it, itIdx) => (
                  <li key={itIdx} dangerouslySetInnerHTML={{ __html: it.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </ul>
            );
          }
          return (
            <p
              key={pIdx}
              dangerouslySetInnerHTML={{
                __html: trimmed
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br />')
              }}
            />
          );
        })}
      </ContentCard>
    </GuideWrapper>
  );
}
