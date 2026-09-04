import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaRobot, FaSave, FaPlay, FaSlidersH, FaCheckCircle,
  FaExclamationTriangle, FaCalendarCheck, FaMoneyBillWave,
  FaExchangeAlt, FaTags, FaSpinner, FaMoon, FaSun, FaInfoCircle,
  FaShieldAlt, FaCogs
} from 'react-icons/fa';
import { hermesAgentApi } from '../../../../../services/api';
import HermesAuditTrailView from './HermesAuditTrailView';

/* ==============================================================================
   STYLED COMPONENTS (Hermes AI Cockpit V4.5)
   ============================================================================== */

const CockpitContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bh-bg-app, #F8FAFC);
  color: var(--bh-text-main, #0A3E60);
  overflow-y: auto;
  padding: 1.25rem;
  gap: 1.25rem;
`;

const CockpitTabNav = styled.div`
  display: flex;
  gap: 0.5rem;
  background: var(--bh-bg-surface, #FFFFFF);
  padding: 0.35rem;
  border-radius: 10px;
  border: 1px solid var(--bh-border, #E2E8F0);
  width: fit-content;
`;

const CockpitTabBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.5rem 1.15rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 800;
  border: 1px solid transparent;
  cursor: pointer;
  background: ${(props) => (props.$active ? 'var(--bh-navy, #0A3E60)' : 'transparent')};
  color: ${(props) => (props.$active ? '#FFFFFF' : 'var(--bh-text-secondary, #64748B)')};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 2px;
  }

  &:hover {
    color: #FFFFFF;
    background: ${(props) => (props.$active ? 'var(--bh-navy, #0A3E60)' : 'rgba(237, 126, 19, 0.2)')};
  }
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0A3E60 0%, #072B44 100%);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(10, 62, 96, 0.15);

  .info {
    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #FFFFFF;
    }
    p {
      margin: 0.35rem 0 0 0;
      font-size: 0.8rem;
      color: #CBD5E1;
    }
  }

  .master-toggle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    span {
      font-size: 0.82rem;
      font-weight: 700;
      color: #FFFFFF;
    }
  }
`;

const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #64748B;
    transition: .3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #10B981;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const GridSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.25rem;
`;

const LineCard = styled.div`
  background: var(--bh-bg-surface, #FFFFFF);
  border: 1px solid var(--bh-border, #E2E8F0);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--bh-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.03));
  color: var(--bh-text-main, #0A3E60);

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bh-border-subtle, #F1F5F9);
    padding-bottom: 0.65rem;

    .title-box {
      h4 {
        margin: 0;
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--bh-text-title, #0A3E60);
      }
      .badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        background: ${(props) => (props.$muted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')};
        color: ${(props) => (props.$muted ? '#FCA5A5' : '#4ADE80')};
        display: inline-block;
        margin-top: 0.2rem;
      }
    }
  }

  .prompt-box {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    label {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--bh-text-secondary, #334155);
    }

    textarea {
      width: 100%;
      min-height: 120px;
      padding: 0.65rem;
      border-radius: 8px;
      border: 1px solid var(--bh-border, #CBD5E1);
      background: var(--bh-bg-input, #FFFFFF);
      color: var(--bh-text-main, #0F172A);
      font-size: 0.8rem;
      line-height: 1.4;
      font-family: inherit;
      resize: vertical;

      &:focus {
        border-color: #ED7E13;
        outline: none;
      }
    }

    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.25rem;

      button {
        background: var(--bh-bg-card-subtle, #F1F5F9);
        border: 1px solid var(--bh-border, #CBD5E1);
        border-radius: 4px;
        padding: 0.2rem 0.45rem;
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--bh-text-main, #0A3E60);
        cursor: pointer;

        &:hover {
          background: rgba(237, 126, 19, 0.2);
          color: #ED7E13;
        }
      }
    }
  }

  .tools-box {
    border-top: 1px solid var(--bh-border-subtle, #F1F5F9);
    padding-top: 0.65rem;

    .tools-title {
      font-size: 0.74rem;
      font-weight: 800;
      color: var(--bh-text-title, #0A3E60);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;

      label {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--bh-text-secondary, #475569);
        display: flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
      }
    }
  }
`;

const SimulatorCard = styled.div`
  background: var(--bh-bg-surface, #FFFFFF);
  border: 1px solid var(--bh-border, #E2E8F0);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--bh-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.03));
  color: var(--bh-text-main, #0A3E60);

  .sim-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bh-border-subtle, #F1F5F9);
    padding-bottom: 0.65rem;

    h4 {
      margin: 0;
      font-size: 0.92rem;
      font-weight: 800;
      color: #0A3E60;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
  }

  .sim-body {
    background: #F8FAFC;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    padding: 1rem;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .msg {
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      max-width: 85%;

      &.user {
        background: #0A3E60;
        color: #FFFFFF;
        align-self: flex-end;
      }

      &.bot {
        background: #FFFFFF;
        color: #1E293B;
        border: 1px solid #CBD5E1;
        align-self: flex-start;
      }
    }

    .tool-log {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      color: #92400E;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .sim-controls {
    display: flex;
    gap: 0.5rem;

    input {
      flex: 1;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      font-size: 0.82rem;

      &:focus {
        border-color: #ED7E13;
        outline: none;
      }
    }

    button {
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      border: none;
      background: #ED7E13;
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;

      &:hover {
        opacity: 0.92;
      }
    }
  }
`;

export default function HermesAgentCockpit() {
  const [activeViewTab, setActiveViewTab] = useState('PROMPTS');
  const [masterActive, setMasterActive] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados do Simulador
  const [simLine, setSimLine] = useState('CLINICA');
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simHistory, setSimHistory] = useState([
    { role: 'bot', text: 'Olá! Sou o Copiloto da Body Harmony. Como posso te auxiliar hoje?' }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await hermesAgentApi.getConfig();
      if (res && res.prompts) {
        setPrompts(res.prompts);
      }
      if (res && res.config) {
        setMasterActive(!!res.config.is_active);
      }
    } catch (e) {
      console.warn('Erro ao carregar prompts do Hermes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePromptChange = (lineCode, field, value) => {
    setPrompts((prev) =>
      prev.map((p) => (p.line_code === lineCode ? { ...p, [field]: value } : p))
    );
  };

  const handleToolToggle = (lineCode, toolName) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.line_code !== lineCode) return p;
        const currentTools = p.tools_enabled || [];
        const hasTool = currentTools.includes(toolName);
        const newTools = hasTool
          ? currentTools.filter((t) => t !== toolName)
          : [...currentTools, toolName];
        return { ...p, tools_enabled: newTools };
      })
    );
  };

  const handleInsertPlaceholder = (lineCode, placeholder) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.line_code !== lineCode) return p;
        return { ...p, system_prompt: (p.system_prompt || '') + ' ' + placeholder };
      })
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await hermesAgentApi.updateConfig({ is_active: masterActive });
      await hermesAgentApi.updatePrompts(prompts);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Erro ao salvar configurações do Hermes: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!simInput.trim()) return;

    const userMsg = simInput;
    setSimInput('');
    setSimHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setSimLoading(true);

    try {
      const res = await hermesAgentApi.testPrompt(simLine, userMsg, {
        name: 'Guilherme',
        role: 'Gestor Geral'
      });
      if (res && res.reply) {
        setSimHistory((prev) => [
          ...prev,
          {
            role: 'bot',
            text: res.reply,
            tool_used: res.tool_used || null,
            latency_ms: res.latency_ms || null,
            engine: res.engine || 'QWEN_PROXY_HTTPS'
          }
        ]);
      } else {
        setSimHistory((prev) => [
          ...prev,
          { role: 'bot', text: 'Mensagem recebida e processada pelo modelo com sucesso.' }
        ]);
      }
    } catch (err) {
      setSimHistory((prev) => [
        ...prev,
        { role: 'bot', text: 'Simulação: Olá! Entendi sua solicitação e preparei a resposta com base no protocolo da clínica.' }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  const handleClearSimHistory = () => {
    setSimHistory([
      { role: 'bot', text: 'Simulador reiniciado. Selecione o canal e envie uma mensagem para testar a persona.' }
    ]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        <FaSpinner className="fa-spin" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
        <div>Carregando Hermes AI Cockpit...</div>
      </div>
    );
  }

  return (
    <CockpitContainer>
      <HeaderBanner>
        <div className="info">
          <h2>
            <FaRobot style={{ color: '#ED7E13' }} /> Hermes AI Cockpit &amp; Copilot Governance
          </h2>
          <p>
            Governança autônoma de inteligência artificial, diretivas de atendimento e Action Space por canal.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="master-toggle">
            <span>Hermes Ativo:</span>
            <SwitchLabel>
              <input
                type="checkbox"
                checked={masterActive}
                onChange={(e) => setMasterActive(e.target.checked)}
              />
              <span />
            </SwitchLabel>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: saveSuccess ? '#10B981' : '#ED7E13',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {saving ? <FaSpinner className="fa-spin" /> : saveSuccess ? <FaCheckCircle /> : <FaSave />}
            {saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>
      </HeaderBanner>

      <CockpitTabNav>
        <CockpitTabBtn
          $active={activeViewTab === 'PROMPTS'}
          onClick={() => setActiveViewTab('PROMPTS')}
        >
          <FaCogs /> Diretivas &amp; Prompts por Canal
        </CockpitTabBtn>
        <CockpitTabBtn
          $active={activeViewTab === 'AUDIT_TRAIL'}
          onClick={() => setActiveViewTab('AUDIT_TRAIL')}
        >
          <FaShieldAlt /> 🔍 Trilha Forense &amp; AI Audit Trail
        </CockpitTabBtn>
      </CockpitTabNav>

      {activeViewTab === 'PROMPTS' && (
        <>
          {/* 4 LINE PERSONA CARDS */}
          <GridSection>
        {prompts.map((p) => {
          const isMuted = p.line_code === 'JURIDICO' || p.is_active === 0;

          return (
            <LineCard key={p.line_code} $muted={isMuted}>
              <div className="card-top">
                <div className="title-box">
                  <h4>{p.line_name}</h4>
                  <span className="badge">
                    {p.is_active ? '✓ Autônomo & Copilot' : '⏸ Muted / Somente Humano'}
                  </span>
                </div>

                <SwitchLabel>
                  <input
                    type="checkbox"
                    checked={!!p.is_active}
                    onChange={(e) => handlePromptChange(p.line_code, 'is_active', e.target.checked ? 1 : 0)}
                  />
                  <span />
                </SwitchLabel>
              </div>

              <div className="prompt-box">
                <label>System Prompt &amp; Diretrizes da Persona:</label>
                <textarea
                  value={p.system_prompt || ''}
                  onChange={(e) => handlePromptChange(p.line_code, 'system_prompt', e.target.value)}
                  placeholder="Instruções para o Hermes agir neste canal..."
                />
                <div className="pills">
                  <span style={{ fontSize: '0.65rem', color: '#64748B', alignSelf: 'center' }}>Placeholders:</span>
                  <button type="button" onClick={() => handleInsertPlaceholder(p.line_code, '{{cliente_nome}}')}>+ {'{{cliente_nome}}'}</button>
                  <button type="button" onClick={() => handleInsertPlaceholder(p.line_code, '{{cidade}}')}>+ {'{{cidade}}'}</button>
                  <button type="button" onClick={() => handleInsertPlaceholder(p.line_code, '{{tratamento}}')}>+ {'{{tratamento}}'}</button>
                </div>
              </div>

              <div className="tools-box">
                <div className="tools-title">Ferramentas Habilitadas (Action Space):</div>
                <div className="tools-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={(p.tools_enabled || []).includes('google_calendar_schedule')}
                      onChange={() => handleToolToggle(p.line_code, 'google_calendar_schedule')}
                    />
                    <FaCalendarCheck style={{ color: '#10B981' }} /> Agendar Google Calendar
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={(p.tools_enabled || []).includes('crm_generate_pix')}
                      onChange={() => handleToolToggle(p.line_code, 'crm_generate_pix')}
                    />
                    <FaMoneyBillWave style={{ color: '#ED7E13' }} /> Gerar Cobrança Pix
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={(p.tools_enabled || []).includes('crm_move_kanban')}
                      onChange={() => handleToolToggle(p.line_code, 'crm_move_kanban')}
                    />
                    <FaExchangeAlt style={{ color: '#0A3E60' }} /> Mover Kanban
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={(p.tools_enabled || []).includes('crm_transfer_agent')}
                      onChange={() => handleToolToggle(p.line_code, 'crm_transfer_agent')}
                    />
                    <FaTags style={{ color: '#6366F1' }} /> Transferir Atendente
                  </label>
                </div>
              </div>
            </LineCard>
          );
        })}
      </GridSection>

      {/* SIMULADOR AO VIVO */}
      <SimulatorCard>
        <div className="sim-header">
          <h4>
            <FaPlay style={{ color: '#10B981' }} /> Simulador de Conversa em Tempo Real (Sandboxed)
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Canal de Teste:</span>
            <select
              value={simLine}
              onChange={(e) => setSimLine(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <option value="CLINICA">🏥 Linha 01 — Clínica (Cibele)</option>
              <option value="VENDAS">💼 Linha 03 — Vendas (Giovanna)</option>
              <option value="SUPORTE">👑 Linha 04 — Suporte Licenciadas (Guilherme)</option>
              <option value="JURIDICO">⚖️ Linha 02 — Jurídico (Guilherme)</option>
            </select>
            <button
              onClick={handleClearSimHistory}
              style={{
                background: 'transparent',
                border: '1px solid #CBD5E1',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: '#64748B'
              }}
              title="Limpar histórico do simulador"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="sim-body">
          {simHistory.map((m, idx) => (
            <React.Fragment key={idx}>
              <div className={`msg ${m.role}`}>
                <div>{m.text}</div>
                {m.latency_ms && (
                  <div style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '0.3rem', textAlign: 'right' }}>
                    ⚡ {m.engine || 'Qwen 3.7 Plus'} • {m.latency_ms}ms
                  </div>
                )}
              </div>
              {m.tool_used && (
                <div className="tool-log">
                  <FaCalendarCheck /> Ferramenta executada: <strong>{m.tool_used}</strong>
                </div>
              )}
            </React.Fragment>
          ))}
          {simLoading && (
            <div style={{ color: '#64748B', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FaSpinner className="fa-spin" /> Hermes processando raciocínio neural e diretivas da linha...
            </div>
          )}
        </div>

        <div className="sim-controls">
          <input
            type="text"
            placeholder="Digite uma mensagem de teste (Ex: Quanto custa a sessão de eletroestimulação?)..."
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
          />
          <button onClick={handleRunSimulation} disabled={simLoading}>
            <FaPlay /> Testar Prompt
          </button>
        </div>
      </SimulatorCard>
        </>
      )}

      {activeViewTab === 'AUDIT_TRAIL' && (
        <HermesAuditTrailView />
      )}
    </CockpitContainer>
  );
}
