import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FaFolder, FaFileAlt, FaFilePdf, FaFileImage, FaFileUpload,
  FaFolderPlus, FaSyncAlt, FaExternalLinkAlt, FaEdit, FaDownload,
  FaSpinner, FaTimes, FaCheckCircle, FaSearch
} from "react-icons/fa";
import { googleDriveApi } from "../../../../../services/api";

const ExplorerWrapper = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ExplorerToolbar = styled.div`
  padding: 0.85rem 1.25rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  .left-zone {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0A3E60;
  }

  .actions-zone {
    display: flex;
    gap: 0.5rem;
  }
`;

const ToolBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.$primary ? "#0A3E60" : props.$gold ? "#ED7E13" : "#FFFFFF")};
  color: ${(props) => (props.$primary || props.$gold ? "#FFFFFF" : "#0A3E60")};
  border: 1px solid ${(props) => (props.$primary ? "#0A3E60" : props.$gold ? "#ED7E13" : "#CBD5E1")};
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  min-height: 200px;
`;

const DriveCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    border-color: #ED7E13;
    box-shadow: 0 4px 12px rgba(237, 126, 19, 0.08);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin-bottom: 0.65rem;

    .icon-box {
      font-size: 1.6rem;
      color: ${(props) => (props.$isFolder ? "#ED7E13" : "#0A3E60")};
    }

    .title-box {
      overflow: hidden;
      .name {
        font-size: 0.8rem;
        font-weight: 800;
        color: #0F172A;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        font-size: 0.68rem;
        color: #64748B;
      }
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #F1F5F9;
    padding-top: 0.5rem;

    a, button {
      color: #0A3E60;
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;

      &:hover {
        color: #ED7E13;
      }
    }
  }
`;

export default function GoogleDriveExplorer() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef(null);

  const loadDriveItems = async (folderId = null) => {
    setLoading(true);
    try {
      const res = await googleDriveApi.listItems(folderId);
      if (res && res.success && Array.isArray(res.items)) {
        setItems(res.items);
      }
    } catch (e) {
      console.warn("Erro ao listar arquivos do Drive:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriveItems(currentFolder?.id || null);
  }, [currentFolder]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", currentFolder?.id || "root");

    try {
      const res = await googleDriveApi.uploadFile(formData);
      if (res && res.success) {
        alert("Arquivo enviado com sucesso para o Google Drive!");
        loadDriveItems(currentFolder?.id || null);
      }
    } catch (err) {
      alert("Erro no upload para o Drive: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!selectedItem || !newName.trim()) return;

    try {
      await googleDriveApi.renameItem(selectedItem.id, newName);
      setRenameModalOpen(false);
      loadDriveItems(currentFolder?.id || null);
    } catch (err) {
      alert("Erro ao renomear: " + err.message);
    }
  };

  return (
    <ExplorerWrapper>
      <ExplorerToolbar>
        <div className="left-zone">
          <FaFolder style={{ color: "#ED7E13" }} />
          <span>Prontuários & Arquivos:</span>
          {currentFolder ? (
            <span style={{ color: "#ED7E13", cursor: "pointer" }} onClick={() => setCurrentFolder(null)}>
              / Raiz / <strong>{currentFolder.name}</strong>
            </span>
          ) : (
            <span>/ Diretório Raiz de Pacientes</span>
          )}
        </div>

        <div className="actions-zone">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <ToolBtn onClick={() => loadDriveItems(currentFolder?.id || null)} title="Atualizar">
            <FaSyncAlt className={loading ? "fa-spin" : ""} />
          </ToolBtn>
          <ToolBtn $gold onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <FaSpinner className="fa-spin" /> : <FaFileUpload />} Upload de Documento / PDF
          </ToolBtn>
        </div>
      </ExplorerToolbar>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748B" }}>
          <FaSpinner className="fa-spin" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }} />
          <div>Sincronizando com Google Drive API v3...</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748B" }}>
          Nenhuma pasta ou documento encontrado nesta pasta.
        </div>
      ) : (
        <ItemsGrid>
          {items.map((item) => {
            const isFolder = item.type === "FOLDER" || item.mimeType?.includes("folder");
            const isPdf = item.mimeType?.includes("pdf");
            const isImg = item.mimeType?.includes("image");

            return (
              <DriveCard key={item.id} $isFolder={isFolder}>
                <div className="card-top">
                  <div className="icon-box">
                    {isFolder ? <FaFolder /> : isPdf ? <FaFilePdf style={{ color: "#DC2626" }} /> : isImg ? <FaFileImage style={{ color: "#2563EB" }} /> : <FaFileAlt />}
                  </div>
                  <div className="title-box">
                    <div className="name" title={item.name}>{item.name}</div>
                    <div className="meta">
                      {isFolder ? `${item.files_count || 0} arquivos` : `${Math.round((item.size || 0) / 1024)} KB`}
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setNewName(item.name);
                      setRenameModalOpen(true);
                    }}
                    title="Renomear"
                  >
                    <FaEdit /> Renomear
                  </button>

                  <a href={item.web_link} target="_blank" rel="noreferrer" title="Abrir no Google Drive">
                    <FaExternalLinkAlt /> Abrir
                  </a>
                </div>
              </DriveCard>
            );
          })}
        </ItemsGrid>
      )}

      {/* MODAL DE RENOMEAÇÃO */}
      {renameModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(7, 43, 68, 0.65)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div style={{ background: "#FFFFFF", borderRadius: "12px", width: "90%", maxWidth: "400px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#0A3E60", fontSize: "1.05rem", fontWeight: 800 }}>
              ✏️ Renomear Item do Drive
            </h3>
            <form onSubmit={handleRename}>
              <input
                type="text"
                required
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem", marginBottom: "1rem" }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  style={{ padding: "0.45rem 0.9rem", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <ToolBtn $gold type="submit">Salvar Nome</ToolBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </ExplorerWrapper>
  );
}
