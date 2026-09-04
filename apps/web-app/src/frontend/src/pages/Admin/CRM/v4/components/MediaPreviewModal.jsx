import React, { useState } from "react";
import styled from "styled-components";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(7, 43, 68, 0.8);
  backdrop-filter: blur(6px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: #FFFFFF;
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 12px 35px rgba(10, 62, 96, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #0A3E60;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 800;
  }

  button {
    background: transparent;
    border: none;
    color: #CBD5E1;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #FFFFFF;
    }
  }
`;

const PreviewBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: #F8FAFC;

  img {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
  }
`;

const CaptionInput = styled.input`
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  color: #0F172A;

  &:focus {
    border-color: #ED7E13;
  }
`;

const ModalFooter = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  background: #FFFFFF;

  button {
    padding: 0.45rem 1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid #CBD5E1;
    background: #FFFFFF;
    color: #475569;
    transition: all 0.15s ease;

    &.send {
      background: #ED7E13;
      border-color: #ED7E13;
      color: #FFFFFF;

      &:hover {
        background: #D46D0E;
      }
    }

    &:hover:not(.send) {
      background: #F1F5F9;
    }
  }
`;

export default function MediaPreviewModal({ file, previewUrl, onSend, onCancel }) {
  const [caption, setCaption] = useState("");

  if (!file && !previewUrl) return null;

  const handleSend = () => {
    onSend(file, caption);
  };

  return (
    <ModalBackdrop onClick={onCancel}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h4>📷 Enviar Imagem / Anexo</h4>
          <button onClick={onCancel}><FaTimes /></button>
        </ModalHeader>

        <PreviewBody>
          <img src={previewUrl} alt="Prévia do anexo" />
          <CaptionInput
            placeholder="Adicione uma legenda opcional..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            autoFocus
          />
        </PreviewBody>

        <ModalFooter>
          <button onClick={onCancel}>Cancelar</button>
          <button className="send" onClick={handleSend}>
            <FaPaperPlane /> Enviar Imagem
          </button>
        </ModalFooter>
      </ModalBox>
    </ModalBackdrop>
  );
}
