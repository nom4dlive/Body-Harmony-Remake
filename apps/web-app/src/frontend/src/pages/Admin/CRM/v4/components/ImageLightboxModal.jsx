import React, { useState } from "react";
import styled from "styled-components";
import { FaTimes, FaSearchPlus, FaSearchMinus, FaDownload, FaRedo } from "react-icons/fa";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(7, 43, 68, 0.88);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Toolbar = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(10, 62, 96, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.45rem 0.85rem;
  border-radius: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  button {
    background: transparent;
    border: none;
    color: #FFFFFF;
    font-size: 1.1rem;
    cursor: pointer;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ED7E13;
    }
  }
`;

const ImageContainer = styled.div`
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5);
    transform: scale(${(props) => props.$zoom}) rotate(${(props) => props.$rotation}deg);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

export default function ImageLightboxModal({ src, alt, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!src) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = "imagem_crm_" + Date.now();
    a.target = "_blank";
    a.click();
  };

  return (
    <Overlay onClick={onClose}>
      <Toolbar onClick={e => e.stopPropagation()}>
        <button onClick={handleZoomIn} title="Aumentar Zoom"><FaSearchPlus /></button>
        <button onClick={handleZoomOut} title="Diminuir Zoom"><FaSearchMinus /></button>
        <button onClick={handleRotate} title="Girar Imagem"><FaRedo /></button>
        <button onClick={handleDownload} title="Baixar Imagem Original"><FaDownload /></button>
        <button onClick={onClose} title="Fechar (Esc)" style={{ color: "#EF4444" }}><FaTimes /></button>
      </Toolbar>

      <ImageContainer $zoom={zoom} $rotation={rotation} onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt || "Imagem do Atendimento"} />
      </ImageContainer>
    </Overlay>
  );
}
