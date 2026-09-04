import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaSlidersH, FaPalette, FaCheckCircle, FaSpinner,
  FaVolumeUp, FaCommentDots, FaShieldAlt, FaUndo
} from 'react-icons/fa';
import { crmApi } from '../../../../services/api';

/* ==============================================================================
   STYLED COMPONENTS (CRM Settings V4)
   ============================================================================== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 165px);
  min-height: 600px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(10, 62, 96, 0.06);
`;

const TopBar = styled.div`
  padding: 0.85rem 1.25rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: #0A3E60;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #F8FAFC;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
`;

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0A3E60;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 0.65rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    label {
      font-size: 0.78rem;
      font-weight: 800;
      color: #0A3E60;
    }

    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      input[type="color"] {
        width: 42px;
        height: 38px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: transparent;
      }

      input[type="text"] {
        flex: 1;
        padding: 0.45rem 0.65rem;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #0F172A;
      }
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;

      span {
        font-size: 0.8rem;
        font-weight: 700;
        color: #334155;
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }
  }

  .preview-box {
    background: #EFEAE2;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border: 1px solid #E2E8F0;

    .msg-bubble {
      max-width: 80%;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);

      .time {
        font-size: 0.65rem;
        align-self: flex-end;
        opacity: 0.7;
      }

      &.sent {
        align-self: flex-end;
        border-top-right-radius: 2px;
      }

      &.recv {
        align-self: flex-start;
        border-top-left-radius: 2px;
        border: 1px solid #E2E8F0;
      }
    }
  }
`;

const Footer = styled.div`
  padding: 0.85rem 1.25rem;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  button {
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &.reset {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      color: #475569;
    }

    &.save {
      background: linear-gradient(135deg, #ED7E13 0%, #D46D0E 100%);
      border: none;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(237, 126, 19, 0.25);
    }
  }
`;

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    sent_bubble_bg: '#DCF8C6',
    sent_bubble_text: '#0F172A',
    received_bubble_bg: '#FFFFFF',
    received_bubble_text: '#0F172A',
    whisper_bubble_bg: '#FEF3C7',
    default_dossier_open: false,
    audio_notifications_enabled: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await crmApi.getSettings();
      if (res && res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (e) {
      console.warn('Erro ao carregar configurações de aparência:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await crmApi.saveSettings(settings);
      if (res && res.success) {
        alert('Configurações de aparência salvas com sucesso!');
      } else {
        alert('Erro ao salvar: ' + (res?.error || 'Falha de comunicação.'));
      }
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      sent_bubble_bg: '#DCF8C6',
      sent_bubble_text: '#0F172A',
      received_bubble_bg: '#FFFFFF',
      received_bubble_text: '#0F172A',
      whisper_bubble_bg: '#FEF3C7',
      default_dossier_open: false,
      audio_notifications_enabled: true
    });
  };

  return (
    <Container>
      <TopBar>
        <h3>
          <FaPalette style={{ color: '#ED7E13' }} /> Personalização Visual &amp; Preferências do CRM
        </h3>
      </TopBar>

      <Content>
        {/* CARD 1: BALÕES DE CHAT */}
        <Card>
          <div className="card-head">
            <FaCommentDots style={{ color: '#ED7E13' }} /> Cores dos Balões de Mensagem
          </div>

          <div className="form-group">
            <label>Fundo da Mensagem Enviada (Atendente):</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={settings.sent_bubble_bg}
                onChange={(e) => setSettings({ ...settings, sent_bubble_bg: e.target.value })}
              />
              <input
                type="text"
                value={settings.sent_bubble_bg}
                onChange={(e) => setSettings({ ...settings, sent_bubble_bg: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Fundo da Mensagem Recebida (Cliente):</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={settings.received_bubble_bg}
                onChange={(e) => setSettings({ ...settings, received_bubble_bg: e.target.value })}
              />
              <input
                type="text"
                value={settings.received_bubble_bg}
                onChange={(e) => setSettings({ ...settings, received_bubble_bg: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Fundo da Nota Interna (Whisper):</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={settings.whisper_bubble_bg}
                onChange={(e) => setSettings({ ...settings, whisper_bubble_bg: e.target.value })}
              />
              <input
                type="text"
                value={settings.whisper_bubble_bg}
                onChange={(e) => setSettings({ ...settings, whisper_bubble_bg: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* CARD 2: PREVIEW EM TEMPO REAL */}
        <Card>
          <div className="card-head">
            <FaSlidersH style={{ color: '#ED7E13' }} /> Live Preview do Chat
          </div>

          <div className="preview-box">
            <div
              className="msg-bubble recv"
              style={{
                background: settings.received_bubble_bg,
                color: settings.received_bubble_text
              }}
            >
              <span>Olá! Gostaria de saber mais sobre a mentoria Body Harmony.</span>
              <span className="time">10:42</span>
            </div>

            <div
              className="msg-bubble sent"
              style={{
                background: settings.sent_bubble_bg,
                color: settings.sent_bubble_text
              }}
            >
              <span>Perfeito! Estamos com condições especiais abertas hoje.</span>
              <span className="time">10:43</span>
            </div>

            <div
              className="msg-bubble sent"
              style={{
                background: settings.whisper_bubble_bg,
                color: '#92400E',
                border: '1px dashed #F59E0B'
              }}
            >
              <span>🔒 Nota Interna: Cliente tem interesse na franquia de Assis/SP.</span>
              <span className="time">10:44</span>
            </div>
          </div>
        </Card>

        {/* CARD 3: COMPORTAMENTO E NOTIFICAÇÕES */}
        <Card>
          <div className="card-head">
            <FaVolumeUp style={{ color: '#ED7E13' }} /> Comportamento &amp; Sons
          </div>

          <div className="form-group">
            <div className="toggle-row">
              <span>Sons de Notificação para Novas Mensagens</span>
              <input
                type="checkbox"
                checked={settings.audio_notifications_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, audio_notifications_enabled: e.target.checked })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <div className="toggle-row">
              <span>Abrir Dossiê 360° Automaticamente ao Selecionar Contato</span>
              <input
                type="checkbox"
                checked={settings.default_dossier_open}
                onChange={(e) =>
                  setSettings({ ...settings, default_dossier_open: e.target.checked })
                }
              />
            </div>
          </div>
        </Card>
      </Content>

      <Footer>
        <button className="reset" onClick={handleResetDefaults}>
          <FaUndo /> Restaurar Padrões WhatsApp
        </button>
        <button className="save" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
          Salvar Preferências
        </button>
      </Footer>
    </Container>
  );
}
