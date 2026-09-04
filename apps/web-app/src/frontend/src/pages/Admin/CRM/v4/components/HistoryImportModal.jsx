import React, { useState, useRef } from "react";
import styled from "styled-components";
import {
  FaFileUpload, FaTimes, FaCheckCircle, FaSpinner,
  FaFileAlt, FaWhatsapp, FaInfoCircle, FaFileCode
} from "react-icons/fa";
import { crmApi } from "../../../../../services/api";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(7, 43, 68, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  width: 90%;
  maxWidth: 520px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DropZone = styled.div`
  border: 2px dashed ${(props) => (props.$isDragging ? "#ED7E13" : "#CBD5E1")};
  background: ${(props) => (props.$isDragging ? "rgba(237, 126, 19, 0.05)" : "#F8FAFC")};
  border-radius: 10px;
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    background: rgba(237, 126, 19, 0.04);
  }

  .icon-box {
    font-size: 2.2rem;
    color: #ED7E13;
    margin-bottom: 0.5rem;
  }

  .title {
    font-size: 0.88rem;
    font-weight: 800;
    color: #0A3E60;
    margin-bottom: 0.2rem;
  }

  .sub {
    font-size: 0.72rem;
    color: #64748B;
  }
`;

export default function HistoryImportModal({ defaultPhone = "", onClose, onSuccess }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [inboxId, setInboxId] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleImport = async () => {
    if (!file) {
      alert("Por favor selecione um arquivo .txt do WhatsApp ou .json.");
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("inbox_id", inboxId);
    formData.append("phone", phone);

    try {
      const res = await crmApi.importChatHistory(formData);
      if (res && res.status === "success") {
        setResult(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        alert(res?.message || "Erro na importação de histórico.");
      }
    } catch (err) {
      alert("Falha na importação: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#0A3E60", fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <FaWhatsapp style={{ color: "#10B981" }} /> Importar Conversa do WhatsApp
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.1rem", color: "#64748B", cursor: "pointer" }}>
            <FaTimes />
          </button>
        </div>

        {result ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <FaCheckCircle style={{ color: "#10B981", fontSize: "2.5rem", marginBottom: "0.5rem" }} />
            <h4 style={{ margin: "0 0 0.4rem 0", color: "#0A3E60" }}>Importação Concluída!</h4>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>
              <strong>{result.imported_count || 0}</strong> mensagens importadas com timestamps originais preservados.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: "1.25rem", padding: "0.5rem 1.25rem", borderRadius: "6px", border: "none", background: "#ED7E13", color: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}
            >
              Concluir & Visualizar Chat
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>WhatsApp do Contato:</label>
                <input
                  type="text"
                  placeholder="Ex: 5518997000000"
                  style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>Linha de Destino:</label>
                <select
                  style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  value={inboxId}
                  onChange={(e) => setInboxId(Number(e.target.value))}
                >
                  <option value={7}>🏥 Linha 01 — Clínica (Cibele)</option>
                  <option value={3}>💼 Linha 03 — Vendas (Giovanna)</option>
                  <option value={1}>⚖️ Linha 02 — Jurídico & Finanças (Guilherme)</option>
                  <option value={2}>👑 Linha 04 — Suporte Licenciadas (Guilherme)</option>
                </select>
              </div>
            </div>

            <input
              type="file"
              ref={fileRef}
              accept=".txt,.json"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />

            <DropZone
              $isDragging={isDragging}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="icon-box">
                {file ? <FaFileAlt /> : <FaFileUpload />}
              </div>
              <div className="title">
                {file ? file.name : "Clique ou arraste o arquivo .txt / .json aqui"}
              </div>
              <div className="sub">
                {file ? `${Math.round(file.size / 1024)} KB selecionado` : "Exportado do WhatsApp (Conversa sem mídia)"}
              </div>
            </DropZone>

            <div style={{ background: "#F1F5F9", padding: "0.65rem", borderRadius: "6px", fontSize: "0.72rem", color: "#475569", display: "flex", gap: "0.4rem" }}>
              <FaInfoCircle style={{ color: "#0A3E60", flexShrink: 0, marginTop: "2px" }} />
              <div>
                O sistema processa automaticamente mensagens nos formatos Android e iOS, normaliza datas, vincula à linha de atendimento e deduplica mensagens idênticas.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: "0.45rem 0.9rem", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#475569", fontWeight: 700, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !file}
                style={{ padding: "0.45rem 1.1rem", borderRadius: "6px", border: "none", background: "#ED7E13", color: "#FFFFFF", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                {importing ? <FaSpinner className="fa-spin" /> : <FaFileUpload />} Iniciar Importação
              </button>
            </div>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}
