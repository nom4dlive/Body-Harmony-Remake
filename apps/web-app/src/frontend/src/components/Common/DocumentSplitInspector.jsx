import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaSearchPlus, FaSearchMinus, FaRedo, FaDownload, 
  FaFileAlt, FaEye, FaExclamationCircle, FaExternalLinkAlt 
} from 'react-icons/fa';
import { onboardingApi } from '../../services/api';

const Container = styled.div`
  background: var(--bh-bg-card, #ffffff);
  border: 1px solid var(--bh-border, #e2e8f0);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const TabsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: var(--bh-bg-subtle, #f8fafc);
  border-bottom: 1px solid var(--bh-border, #e2e8f0);
  overflow-x: auto;
`;

const DocTab = styled.button`
  height: 36px;
  padding: 0 0.85rem;
  border-radius: 10px;
  border: 1.5px solid ${props => props.$active ? 'var(--bh-primary, #0a3e60)' : 'var(--bh-border, #cbd5e1)'};
  background: ${props => props.$active ? 'var(--bh-primary, #0a3e60)' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : 'var(--bh-text-secondary, #475569)'};
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    color: ${props => props.$active ? '#ffffff' : 'var(--bh-primary, #0a3e60)'};
    border-color: var(--bh-primary, #0a3e60);
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: #ffffff;
  border-bottom: 1px solid var(--bh-border, #e2e8f0);
  font-size: 0.8rem;

  .name {
    font-weight: 800;
    color: var(--bh-text-title, #0a3e60);
    letter-spacing: -0.2px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 6px;

    button, a {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      border-radius: 8px;
      border: 1px solid var(--bh-border, #cbd5e1);
      background: #ffffff;
      color: var(--bh-text-secondary, #475569);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--bh-primary, #0a3e60);
        color: var(--bh-primary, #0a3e60);
        background: #f1f5f9;
      }
    }

    .zoom-val {
      font-size: 0.75rem;
      font-family: monospace;
      width: 42px;
      text-align: center;
      color: #64748b;
      font-weight: 700;
    }
  }
`;

const ViewerArea = styled.div`
  min-height: 380px;
  max-height: 520px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 1rem;
  position: relative;

  img {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
    transition: transform 0.2s ease;
    transform-origin: center center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
  }

  iframe {
    width: 100%;
    height: 460px;
    border: none;
    border-radius: 8px;
    background: white;
  }

  .empty, .error-state {
    color: #94a3b8;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    max-width: 400px;
    padding: 2rem;

    .icon-box {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: rgba(237, 126, 19, 0.15);
      color: var(--bh-gold, #ed7e13);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h4 {
      color: #f8fafc;
      font-size: 0.95rem;
      margin: 0;
      font-weight: 700;
    }

    p {
      color: #94a3b8;
      font-size: 0.8rem;
      margin: 0;
      line-height: 1.4;
    }

    a {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--bh-gold, #ed7e13);
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.75rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }
`;

export default function DocumentSplitInspector({ lead, onRefresh }) {
  const [activeTab, setActiveTab] = useState('doc_frente');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [activeTab, lead?.id]);

  if (!lead) return null;

  // Monta lista de documentos disponíveis
  const docs = [
    { key: 'doc_frente', label: 'Documento (Frente)', path: lead.documento_frente_path || lead.documento_img },
    { key: 'doc_verso', label: 'Documento (Verso)', path: lead.documento_verso_path || lead.documento_verso_img },
    { key: 'pagamento', label: 'Comprovante Pagamento', path: lead.comprovante_pagamento_path || lead.comprovante_pagamento_img },
    { key: 'residencia', label: 'Comprovante Residência', path: lead.comprovante_residencia_path || lead.comprovante_residencia_img },
    { key: 'contrato_social', label: 'Contrato Social / CNPJ', path: lead.contrato_social_path || lead.contrato_social_img }
  ].filter(d => !!d.path);

  // Adiciona múltiplos certificados se houver
  if (lead.certificados_imgs) {
    try {
      const certs = Array.isArray(lead.certificados_imgs) 
        ? lead.certificados_imgs 
        : JSON.parse(lead.certificados_imgs);
      if (Array.isArray(certs)) {
        certs.forEach((cert, idx) => {
          if (cert) {
            docs.push({
              key: `certificado_${idx + 1}`,
              label: `Certificado #${idx + 1}`,
              path: cert
            });
          }
        });
      }
    } catch (e) {
      // ignore parsing error
    }
  }

  const currentDoc = docs.find(d => d.key === activeTab) || docs[0] || null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); setHasError(false); };

  if (!currentDoc) {
    return (
      <Container>
        <ViewerArea>
          <div className="empty">
            <div className="icon-box">
              <FaFileAlt size={28} />
            </div>
            <h4>Nenhum Documento Anexado</h4>
            <p>Este pré-cadastro ainda não possui arquivos ou comprovantes anexados.</p>
          </div>
        </ViewerArea>
      </Container>
    );
  }

  const isPdf = currentDoc.path?.toLowerCase().endsWith('.pdf');
  
  // Constrói URL autenticada de streaming para evitar bloqueio do Apache /private_uploads
  let fileUrl = '';
  if (currentDoc.path?.startsWith('http')) {
    fileUrl = currentDoc.path;
  } else if (lead.id) {
    fileUrl = onboardingApi.getDocumentUrl(lead.id, currentDoc.key);
  } else {
    fileUrl = currentDoc.path?.startsWith('/') ? currentDoc.path : `/${currentDoc.path}`;
  }

  return (
    <Container>
      {docs.length > 1 && (
        <TabsBar>
          {docs.map((d) => (
            <DocTab
              key={d.key}
              $active={currentDoc.key === d.key}
              onClick={() => { setActiveTab(d.key); handleReset(); }}
            >
              <FaFileAlt size={12} />
              <span>{d.label}</span>
            </DocTab>
          ))}
        </TabsBar>
      )}

      <Toolbar>
        <span className="name">{currentDoc.label}</span>
        <div className="controls">
          <button onClick={handleZoomOut} title="Diminuir Zoom">
            <FaSearchMinus />
          </button>
          <span className="zoom-val">{zoom}%</span>
          <button onClick={handleZoomIn} title="Aumentar Zoom">
            <FaSearchPlus />
          </button>
          <button onClick={handleRotate} title="Girar 90º">
            <FaRedo />
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            title="Download Arquivo"
            style={{ background: 'var(--bh-gold, #ed7e13)', color: 'white', borderColor: 'var(--bh-gold, #ed7e13)' }}
          >
            <FaDownload size={12} />
          </a>
        </div>
      </Toolbar>

      <ViewerArea>
        {hasError ? (
          <div className="error-state">
            <div className="icon-box">
              <FaExclamationCircle size={28} />
            </div>
            <h4>Visualização Indisponível</h4>
            <p>O arquivo original foi protegido ou precisa ser baixado diretamente para visualização externa.</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt size={11} /> Abrir em Nova Aba
            </a>
          </div>
        ) : isPdf ? (
          <iframe 
            src={fileUrl} 
            title={currentDoc.label} 
            onError={() => setHasError(true)}
          />
        ) : (
          <img
            src={fileUrl}
            alt={currentDoc.label}
            onError={() => setHasError(true)}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
            }}
          />
        )}
      </ViewerArea>
    </Container>
  );
}
