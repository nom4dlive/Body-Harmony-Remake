import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaSearch, FaFilter, FaSyncAlt, FaUserPlus, FaEdit,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner,
  FaCrown, FaUserInjured, FaGraduationCap, FaUserTie
} from "react-icons/fa";
import { googleContactsApi } from "../../../../../services/api";

const TableContainer = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TableHeader = styled.div`
  padding: 0.85rem 1.25rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  .search-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    width: 260px;

    input {
      border: none;
      outline: none;
      font-size: 0.82rem;
      width: 100%;
      color: #0F172A;
    }
  }

  .filters-wrap {
    display: flex;
    gap: 0.4rem;
  }
`;

const FilterPill = styled.button`
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  border: 1px solid ${(props) => (props.$active ? "#0A3E60" : "#E2E8F0")};
  background: ${(props) => (props.$active ? "#0A3E60" : "#FFFFFF")};
  color: ${(props) => (props.$active ? "#FFFFFF" : "#64748B")};
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #0A3E60;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.$gold ? "#ED7E13" : "#0A3E60")};
  color: #FFFFFF;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.82rem;

  th {
    background: #F1F5F9;
    padding: 0.65rem 1rem;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.03em;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #F1F5F9;
    color: #1E293B;
  }

  tr:hover td {
    background: #F8FAFC;
  }
`;

const PersonaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 800;
  background: ${(props) => {
    switch (props.$cat) {
      case "LICENCIADA": return "rgba(237, 126, 19, 0.12)";
      case "PACIENTE": return "rgba(16, 185, 129, 0.12)";
      case "ALUNA": return "rgba(59, 130, 246, 0.12)";
      default: return "rgba(100, 116, 139, 0.12)";
    }
  }};
  color: ${(props) => {
    switch (props.$cat) {
      case "LICENCIADA": return "#B45309";
      case "PACIENTE": return "#047857";
      case "ALUNA": return "#1D4ED8";
      default: return "#475569";
    }
  }};
`;

const SyncPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${(props) => (props.$status === "SYNCED" ? "#059669" : props.$status === "FAILED" ? "#DC2626" : "#D97706")};
`;

export default function GoogleContactsTable() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "PACIENTE",
    phone: "",
    email: "",
    cpf: "",
    city: "Assis",
    state: "SP",
    notes: ""
  });

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await googleContactsApi.listContacts({ search, category, limit: 100 });
      if (res && res.success && Array.isArray(res.contacts)) {
        setContacts(res.contacts);
      }
    } catch (e) {
      console.warn("Erro ao listar contatos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleOpenNew = () => {
    setEditingContact(null);
    setFormData({
      name: "",
      category: "PACIENTE",
      phone: "",
      email: "",
      cpf: "",
      city: "Assis",
      state: "SP",
      notes: ""
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingContact(c);
    const parts = (c.city_state || "Assis/SP").split("/");
    setFormData({
      name: c.formatted_name || "",
      category: c.contact_category || "PACIENTE",
      phone: c.contact_phone || "",
      email: c.email || "",
      cpf: c.cpf || "",
      city: parts[0] || "Assis",
      state: parts[1] || "SP",
      notes: c.notes || ""
    });
    setModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await googleContactsApi.saveContact(formData);
      if (res && res.success) {
        setModalOpen(false);
        loadContacts();
      } else {
        alert(res?.error || "Erro ao salvar contato.");
      }
    } catch (err) {
      alert("Erro ao salvar contato: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableContainer>
      <TableHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="search-wrap">
            <FaSearch style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-wrap">
            <FilterPill $active={category === "ALL"} onClick={() => setCategory("ALL")}>Todos</FilterPill>
            <FilterPill $active={category === "LICENCIADA"} onClick={() => setCategory("LICENCIADA")}>👑 Licenciadas</FilterPill>
            <FilterPill $active={category === "PACIENTE"} onClick={() => setCategory("PACIENTE")}>Pacientes</FilterPill>
            <FilterPill $active={category === "ALUNA"} onClick={() => setCategory("ALUNA")}>Alunas</FilterPill>
            <FilterPill $active={category === "LEAD"} onClick={() => setCategory("LEAD")}>Leads</FilterPill>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ActionButton onClick={loadContacts} title="Recarregar Lista">
            <FaSyncAlt className={loading ? "fa-spin" : ""} />
          </ActionButton>
          <ActionButton $gold onClick={handleOpenNew}>
            <FaUserPlus /> Novo Contato
          </ActionButton>
        </div>
      </TableHeader>

      <div style={{ overflowX: "auto" }}>
        <StyledTable>
          <thead>
            <tr>
              <th>Contato (Google Format)</th>
              <th>Categoria</th>
              <th>WhatsApp / Telefone</th>
              <th>Cidade / UF</th>
              <th>Status Google</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748B" }}>
                  <FaSpinner className="fa-spin" style={{ marginRight: "0.4rem" }} /> Carregando contatos...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748B" }}>
                  Nenhum contato encontrado no catálogo do Google.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.formatted_name || c.name || "Contato"}</strong>
                    {c.email ? (
                      <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{c.email}</div>
                    ) : (
                      <div style={{ fontSize: "0.7rem", color: "#94A3B8", fontStyle: "italic" }}>Sem e-mail</div>
                    )}
                  </td>
                  <td>
                    <PersonaBadge $cat={c.contact_category}>
                      {c.contact_category === "LICENCIADA" && <FaCrown />}
                      {c.contact_category === "PACIENTE" && <FaUserInjured />}
                      {c.contact_category === "ALUNA" && <FaGraduationCap />}
                      {c.contact_category === "LEAD" && <FaUserTie />}
                      {c.contact_category || "CONTATO"}
                    </PersonaBadge>
                  </td>
                  <td>
                    {c.contact_phone ? (
                      <a
                        href={`https://wa.me/${c.contact_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#0A3E60", fontWeight: 700, textDecoration: "none" }}
                      >
                        {c.contact_phone.startsWith('+') ? c.contact_phone : `+${c.contact_phone}`}
                      </a>
                    ) : (
                      <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.75rem" }}>Não informado</span>
                    )}
                  </td>
                  <td>{c.city_state || "Assis/SP"}</td>
                  <td>
                    <SyncPill $status={c.sync_status || "SYNCED"}>
                      <FaCheckCircle /> {c.sync_status === "SYNCED" ? "Google Contatos (Nuvem)" : "Salvo no Sistema"}
                    </SyncPill>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      style={{
                        padding: "0.25rem 0.55rem",
                        borderRadius: "4px",
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#0A3E60",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <FaEdit /> Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </StyledTable>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(7, 43, 68, 0.65)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: "12px", width: "90%", maxWidth: "480px",
            padding: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#0A3E60", fontSize: "1.1rem", fontWeight: 800 }}>
                {editingContact ? "✏️ Editar Contato Google" : "➕ Novo Contato Google People"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.1rem", color: "#64748B", cursor: "pointer" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveContact} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>Nome Completo:</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>Categoria:</label>
                  <select
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="PACIENTE">Paciente</option>
                    <option value="LICENCIADA">👑 Licenciada</option>
                    <option value="ALUNA">Aluna / Curso</option>
                    <option value="LEAD">Lead Geral</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>WhatsApp (com DDD):</label>
                  <input
                    type="text"
                    required
                    placeholder="18997000000"
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>CPF (Opcional):</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>E-mail:</label>
                  <input
                    type="email"
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>Cidade:</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A3E60", display: "block", marginBottom: "0.2rem" }}>UF:</label>
                  <input
                    type="text"
                    maxLength={2}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "0.45rem 0.9rem", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <ActionButton $gold type="submit" disabled={saving}>
                  {saving ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />} Salvar no Google People API
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </TableContainer>
  );
}
