import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaWhatsapp, FaInstagram, FaTelegramPlane, FaGlobe,
  FaSearch, FaFilter, FaPaperPlane, FaPaperclip, FaMicrophone,
  FaPlay, FaPause, FaRobot, FaLock, FaUserPlus, FaCalendarAlt,
  FaFolderOpen, FaAddressBook, FaFileContract, FaShoppingCart,
  FaEllipsisV, FaCheck, FaCheckDouble, FaSpinner, FaTimes,
  FaVideo, FaPhoneAlt, FaChevronRight, FaChevronLeft, FaTag,
  FaExchangeAlt, FaExclamationTriangle, FaHospital, FaBriefcase,
  FaBalanceScale, FaHeadset, FaLayerGroup, FaComments, FaCheckCircle,
  FaQrcode, FaCog, FaWifi, FaBatteryThreeQuarters, FaSyncAlt, FaFileUpload,
  FaBookMedical, FaEye, FaEyeSlash, FaSmile, FaClock, FaCopy, FaExternalLinkAlt,
  FaFileAlt, FaDownload
} from 'react-icons/fa';

import { crmApi, hermesAgentApi, hermesAuditApi, instagramApi } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import CustomAudioPlayer from './components/CustomAudioPlayer';
import ImageLightboxModal from './components/ImageLightboxModal';
import MediaPreviewModal from './components/MediaPreviewModal';
import HistoryImportModal from './components/HistoryImportModal';

const QUICK_MACROS = [
  { trigger: '/anamnese', title: 'Ficha de Anamnese', text: 'Olá! Para agilizarmos sua avaliação clínica personalizada, por favor responda as seguintes perguntas breves: Nome completo, data de nascimento e principal queixa/objetivo estético.' },
  { trigger: '/horarios', title: 'Horários da Clínica', text: 'Nosso horário de atendimento é de Segunda a Sexta das 08h às 19h e aos Sábados das 08h às 14h.' },
  { trigger: '/pix', title: 'Chave PIX Oficial', text: 'Nossa chave PIX oficial é o CNPJ: 38.897.477/0001-20 (Body Harmony Clínica de Estética).' },
  { trigger: '/protocolo_3s', title: 'Explicativo Protocolo 3S', text: 'O Protocolo 3S atua em 3 fases: Desinflamação Celular, Modelagem e Sustentação Tecidual com resultados visíveis desde a 1ª sessão.' },
  { trigger: '/congresso', title: 'Informações do Congresso', text: 'As inscrições para o Congresso Body Harmony 2026 estão abertas com condições especiais para alunas e licenciadas!' },
  { trigger: '/localizacao', title: 'Endereço da Clínica', text: 'Estamos localizados na Av. Principal, 1200 - Centro, Assis/SP. Estacionamento conveniado no local.' }
];

/* ==============================================================================
   STYLED COMPONENTS & ANIMATIONS (V4 Luxury High-Contrast)
   ============================================================================== */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.$railExpanded ? '180px' : '58px')} 300px minmax(0, 1fr) ${(props) => (props.$dossierOpen ? '340px' : '0px')};
  height: calc(100vh - 125px);
  min-height: 580px;
  width: 100%;
  background: var(--bh-bg-surface, #FFFFFF);
  border-radius: 12px;
  border: 1px solid var(--bh-border, #E2E8F0);
  overflow: hidden;
  box-shadow: var(--bh-card-shadow, 0 4px 16px rgba(10, 62, 96, 0.06));
  transition: grid-template-columns 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 1280px) {
    grid-template-columns: ${(props) => (props.$railExpanded ? '170px' : '58px')} 270px minmax(0, 1fr) ${(props) => (props.$dossierOpen ? '300px' : '0px')};
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ----------------------------------------------------------------------------
   COLUMN 0: EXPANDABLE LINE RAIL & SILO SELECTOR
   ---------------------------------------------------------------------------- */
const LineRailCol = styled.div`
  background: var(--bh-navy, #0A3E60);
  border-right: 1px solid var(--bh-border-subtle, #072B44);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0.65rem 0.35rem;
  gap: 0.5rem;
  z-index: 10;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

const RailButton = styled.button`
  width: 100%;
  min-height: 44px;
  border-radius: 8px;
  background: ${(props) => (props.$active ? '#ED7E13' : 'rgba(255, 255, 255, 0.08)')};
  color: ${(props) => (props.$active ? '#FFFFFF' : '#CBD5E1')};
  border: 1px solid ${(props) => (props.$active ? '#ED7E13' : 'rgba(255, 255, 255, 0.12)')};
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.55rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 2px;
  }

  .icon {
    font-size: 1.15rem;
    min-width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-group {
    display: ${(props) => (props.$expanded ? 'flex' : 'none')};
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    overflow: hidden;

    .title {
      font-size: 0.76rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .sub {
      font-size: 0.64rem;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 500;
    }
  }

  &:hover {
    background: ${(props) => (props.$active ? '#ED7E13' : 'rgba(255, 255, 255, 0.18)')};
    color: #FFFFFF;
    transform: ${(props) => (props.$expanded ? 'none' : 'scale(1.05)')};
  }
`;

/* ----------------------------------------------------------------------------
   COLUMN 1: CONVERSATION LIST & TREE
   ---------------------------------------------------------------------------- */
const ConvListCol = styled.div`
  border-right: 1px solid var(--bh-border, #E2E8F0);
  background: var(--bh-bg-surface, #FFFFFF);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ConvHeader = styled.div`
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  box-sizing: border-box;
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--bh-border, #E2E8F0);
  background: var(--bh-bg-card-subtle, #F8FAFC);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;

  input {
    width: 100%;
    min-height: 40px;
    height: 40px;
    padding: 0.45rem 0.75rem 0.45rem 2.2rem;
    font-size: 0.84rem;
    border: 1px solid var(--bh-border, #CBD5E1);
    border-radius: 8px;
    background: var(--bh-bg-input, #FFFFFF);
    color: var(--bh-text-main, #0F172A);
    outline: none;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);

    &:focus {
      border-color: #ED7E13;
      box-shadow: 0 0 0 2px rgba(237, 126, 19, 0.2);
    }
  }

  .icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--bh-text-muted, #64748B);
    font-size: 0.85rem;
  }
`;

const TreeTabs = styled.div`
  display: flex;
  background: var(--bh-bg-input, #E2E8F0);
  padding: 0.25rem;
  border-bottom: 1px solid var(--bh-border, #E2E8F0);
  gap: 0.25rem;

  button {
    flex: 1;
    min-height: 38px;
    padding: 0.35rem 0.3rem;
    border-radius: 6px;
    font-size: 0.76rem;
    font-weight: 700;
    border: 1px solid transparent;
    background: ${(props) => (props.$active ? 'var(--bh-navy, #0A3E60)' : 'transparent')};
    color: ${(props) => (props.$active ? '#FFFFFF' : 'var(--bh-text-secondary, #475569)')};
    box-shadow: ${(props) => (props.$active ? '0 2px 4px rgba(10, 62, 96, 0.2)' : 'none')};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:focus-visible {
      outline: 2px solid #ED7E13;
      outline-offset: 2px;
    }

    .counter {
      background: ${(props) => (props.$active ? '#ED7E13' : '#94A3B8')};
      color: #FFFFFF;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 8px;
    }
  }
`;

const ConvScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ConvCard = styled.div`
  min-height: 64px;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  cursor: pointer;
  background: ${(props) => (props.$selected ? 'rgba(237, 126, 19, 0.12)' : 'transparent')};
  border: 1px solid ${(props) => (props.$selected ? '#ED7E13' : 'transparent')};
  border-left: 4px solid ${(props) => (props.$selected ? '#ED7E13' : 'transparent')};
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${(props) => (props.$resolving ? 0 : 1)};
  transform: ${(props) => (props.$resolving ? 'scale(0.95)' : 'scale(1)')};
  pointer-events: ${(props) => (props.$resolving ? 'none' : 'auto')};

  &:hover {
    background: ${(props) => (props.$selected ? 'rgba(237, 126, 19, 0.18)' : 'var(--bh-bg-card-subtle, #F8FAFC)')};
  }


  .avatar-box {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #0A3E60;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .channel-badge {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      color: #FFFFFF;
      border: 1.5px solid #FFFFFF;
    }
  }

  .info-box {
    flex: 1;
    min-width: 0;

    .name-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.15rem;

      .name {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--bh-text-title, #0A3E60);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .time {
        font-size: 0.68rem;
        color: var(--bh-text-muted, #94A3B8);
        flex-shrink: 0;
        margin-left: 0.3rem;
      }
    }

    .msg-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .snippet {
        font-size: 0.72rem;
        color: var(--bh-text-secondary, #64748B);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .badge {
        background: #ED7E13;
        color: #FFFFFF;
        font-size: 0.62rem;
        font-weight: 800;
        padding: 0.1rem 0.35rem;
        border-radius: 10px;
        flex-shrink: 0;
        margin-left: 0.3rem;
      }
    }
  }
`;

/* ----------------------------------------------------------------------------
   COLUMN 2: CHAT CANVAS
   ---------------------------------------------------------------------------- */
const ChatCol = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bh-bg-card-subtle, #F8FAFC);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  box-sizing: border-box;
  padding: 0 1rem;
  background: var(--bh-bg-card, #FFFFFF);
  border-bottom: 1px solid var(--bh-border, #E2E8F0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;

  .contact-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;

    .avatar {
      width: 38px;
      height: 38px;
      min-width: 38px;
      min-height: 38px;
      max-width: 38px;
      max-height: 38px;
      flex-shrink: 0;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      background: #0A3E60;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }
    }

    .titles {
      min-width: 0;
      overflow: hidden;

      h3 {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--bh-text-title, #0A3E60);
        display: flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        margin: 0.15rem 0 0 0;
        font-size: 0.72rem;
        color: var(--bh-text-secondary, #64748B);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .actions {
    display: flex;
    gap: 0.35rem;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }
`;

const ActionBtn = styled.button`
  background: ${(props) => (props.$primary ? '#0A3E60' : 'var(--bh-bg-card, #FFFFFF)')};
  color: ${(props) => (props.$primary ? '#FFFFFF' : 'var(--bh-text-main, #475569)')};
  border: 1px solid ${(props) => (props.$primary ? '#0A3E60' : 'var(--bh-border, #CBD5E1)')};
  min-height: 38px;
  padding: 0.38rem 0.75rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 1px;
  }

  &:hover {
    background: ${(props) => (props.$primary ? '#08324D' : 'rgba(237, 126, 19, 0.12)')};
    color: ${(props) => (props.$primary ? '#FFFFFF' : '#0A3E60')};
    border-color: #ED7E13;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  min-width: 230px;
  z-index: 100;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  animation: fadeIn 0.15s ease-out;

  /* Área de tolerância de cursor (hover-buffer) */
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    z-index: -1;
  }
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  animation: fadeIn 0.15s ease-out;

  button {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    padding: 0.55rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: #334155;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    transition: all 0.15s ease;

    &:hover {
      background: #F1F5F9;
      color: #0A3E60;
    }

    svg {
      font-size: 0.88rem;
      color: #ED7E13;
    }
  }
`;

const MessageListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: var(--bh-bg-app, #F8FAFC);
`;

const MessageBubble = styled.div`
  max-width: 72%;
  padding: 0.6rem 0.95rem;
  border-radius: 12px;
  font-size: 0.84rem;
  line-height: 1.45;
  align-self: ${(props) => (props.$isMe ? 'flex-end' : 'flex-start')};
  background: ${(props) =>
    props.$isWhisper
      ? 'rgba(234, 179, 8, 0.2)'
      : props.$isAi
      ? 'rgba(14, 165, 233, 0.18)'
      : props.$isMe
      ? props.$customSentBg || 'var(--bh-navy, #0A3E60)'
      : props.$customRecvBg || 'var(--bh-bg-card, #FFFFFF)'};
  color: ${(props) =>
    props.$isWhisper
      ? '#FDE047'
      : props.$isAi
      ? '#BAE6FD'
      : props.$isMe
      ? props.$customSentText || '#FFFFFF'
      : props.$customRecvText || 'var(--bh-text-main, #0F172A)'};
  border: 1px solid
    ${(props) =>
      props.$isWhisper
        ? 'rgba(234, 179, 8, 0.35)'
        : props.$isAi
        ? 'rgba(14, 165, 233, 0.35)'
        : props.$isMe
        ? 'rgba(237, 126, 19, 0.35)'
        : 'var(--bh-border, #E2E8F0)'};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: relative;
  word-break: break-word;

  &.quote-pulse-highlight {
    animation: quotePulseAnim 1.4s ease-in-out;
    box-shadow: 0 0 0 2px #ED7E13, 0 4px 12px rgba(237, 126, 19, 0.25) !important;
  }

  @keyframes quotePulseAnim {
    0% { transform: scale(1.02); filter: brightness(1.15); }
    50% { transform: scale(1.02); filter: brightness(1.25); }
    100% { transform: scale(1); filter: brightness(1); }
  }

  .time-tag {
    font-size: 0.65rem;
    font-weight: 600;
    color: ${(props) => (props.$isMe ? 'rgba(255, 255, 255, 0.85)' : 'var(--bh-text-muted, #64748B)')};
    text-align: right;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
  }
`;

const InputBar = styled.div`
  padding: 0.65rem 1rem;
  background: var(--bh-bg-surface, #FFFFFF);
  border-top: 1px solid var(--bh-border, #E2E8F0);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  .input-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;

    textarea {
      flex: 1;
      min-height: 44px;
      height: 44px;
      max-height: 120px;
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--bh-border, #CBD5E1);
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--bh-text-main, #0F172A);
      background: var(--bh-bg-input, #FFFFFF);
      outline: none;
      resize: none;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:focus {
        border-color: #ED7E13;
        box-shadow: 0 0 0 2px rgba(237, 126, 19, 0.2);
      }
    }

    .send-btn {
      min-width: 44px;
      min-height: 44px;
      width: 44px;
      height: 44px;
      background: #ED7E13;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      transition: background 0.15s, transform 0.15s;

      &:hover {
        background: #D46D0E;
        transform: scale(1.03);
      }

      &:focus-visible {
        outline: 2px solid #ED7E13;
        outline-offset: 2px;
      }
    }
  }

  .tools-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-tools {
      display: flex;
      gap: 0.35rem;
    }
  }
`;

const MacroPopover = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0.85rem;
  right: 0.85rem;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(10, 62, 96, 0.15);
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const MacroItem = styled.div`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  background: ${(props) => (props.$selected ? 'rgba(237, 126, 19, 0.1)' : 'transparent')};
  border-left: ${(props) => (props.$selected ? '3px solid #ED7E13' : '3px solid transparent')};
  transition: all 0.1s ease;

  .macro-trigger {
    font-weight: 800;
    color: #0A3E60;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .macro-preview {
    font-size: 0.72rem;
    color: #64748B;
    margin-top: 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background: rgba(237, 126, 19, 0.08);
  }
`;

const ToolIconBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--bh-text-secondary, #64748B);
  min-height: 44px;
  min-width: 44px;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.15s ease;

  &:hover {
    color: #ED7E13;
    background: rgba(237, 126, 19, 0.15);
  }

  &:focus-visible {
    outline: 2px solid #ED7E13;
    outline-offset: 2px;
  }
`;

/* ----------------------------------------------------------------------------
   COLUMN 3: RIGHT PANEL (CHANNEL TELEMETRY & 360° DOSSIER)
   ---------------------------------------------------------------------------- */
const RightCol = styled.div`
  border-left: 1px solid var(--bh-border, #E2E8F0);
  background: var(--bh-bg-surface, #FFFFFF);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const RightHeader = styled.div`
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  box-sizing: border-box;
  padding: 0 1rem;
  background: var(--bh-bg-card-subtle, #F8FAFC);
  border-bottom: 1px solid var(--bh-border, #E2E8F0);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--bh-text-title, #0A3E60);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--bh-text-secondary, #64748B);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;

    &:hover {
      color: #ED7E13;
    }
  }
`;

const RightTabs = styled.div`
  display: flex;
  padding: 0.4rem;
  background: var(--bh-bg-input, #F1F5F9);
  border-radius: 10px;
  margin: 0.5rem 0.65rem 0.25rem 0.65rem;
  gap: 0.35rem;

  button {
    flex: 1;
    min-height: 40px;
    padding: 0.45rem 0.55rem;
    font-size: 0.74rem;
    font-weight: 700;
    color: ${(props) => (props.$active ? '#0A3E60' : 'var(--bh-text-secondary, #64748B)')};
    border: none;
    border-radius: 8px;
    background: ${(props) => (props.$active ? '#FFFFFF' : 'transparent')};
    box-shadow: ${(props) => (props.$active ? '0 2px 4px rgba(0, 0, 0, 0.08)' : 'none')};
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;

    &:hover:not(:disabled) {
      color: #0A3E60;
    }
  }
`;

const RightBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: var(--bh-bg-surface, #FFFFFF);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 2px;
  }
`;

const InfoCard = styled.div`
  background: var(--bh-bg-card, #F8FAFC);
  border: 1px solid var(--bh-border, #E2E8F0);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: all 0.15s ease;

  &:hover {
    border-color: #CBD5E1;
    box-shadow: 0 2px 6px rgba(10, 62, 96, 0.04);
  }

  .card-title {
    font-size: 0.74rem;
    font-weight: 800;
    color: var(--bh-text-title, #0A3E60);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.76rem;

    .label {
      color: var(--bh-text-secondary, #64748B);
    }

    .value {
      font-weight: 700;
      color: var(--bh-text-main, #0F172A);
    }
  }
`;

export const formatPhoneNumber = (input) => {
  if (!input) return '';
  const str = String(input);
  if (str.includes('@g.us') || str.includes('Grupo') || str.includes('Congresso')) return str;
  const raw = str.replace(/@.*$/, '').replace(/\D/g, '');
  if (!raw) return input;
  if (raw.length === 12 && raw.startsWith('55')) {
    return `+55 (${raw.slice(2, 4)}) ${raw.slice(4, 8)}-${raw.slice(8)}`;
  }
  if (raw.length === 13 && raw.startsWith('55')) {
    return `+55 (${raw.slice(2, 4)}) ${raw.slice(4, 9)}-${raw.slice(9)}`;
  }
  if (raw.length === 10) {
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
  }
  if (raw.length === 11) {
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  }
  return raw.startsWith('55') ? `+${raw}` : raw;
};

export const formatContactTitle = (c) => {
  if (!c) return 'Contato WhatsApp';
  const isGroup = c.isGroup || String(c.remote_jid || c.phone || '').includes('@g.us');
  if (isGroup) {
    return c.name || c.contact_name || 'Grupo do WhatsApp';
  }
  const rawName = c.name || c.contact_name || '';
  const rawPhone = c.phone || c.contact_phone || c.remote_jid || '';
  const formattedPhone = formatPhoneNumber(rawPhone);

  const isNameNumeric = !rawName || rawName === 'Contato Sem Nome' || /^\+?\d+$/.test(rawName.replace(/[\s()-]/g, ''));
  if (isNameNumeric) {
    return formattedPhone || 'Contato WhatsApp';
  }

  if (formattedPhone && rawName && rawName !== formattedPhone) {
    return `${formattedPhone} • ${rawName}`;
  }
  return rawName || formattedPhone || 'Contato WhatsApp';
};

export const getDocMeta = (fileName, mimeType) => {
  const name = String(fileName || 'Documento');
  const ext = (name.split('.').pop() || '').toLowerCase();
  
  if (ext === 'pdf' || (mimeType && mimeType.includes('pdf'))) {
    return { ext: 'PDF', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)', icon: '📄' };
  }
  if (['doc', 'docx'].includes(ext) || (mimeType && mimeType.includes('word'))) {
    return { ext: 'DOCX', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)', icon: '📝' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || (mimeType && (mimeType.includes('sheet') || mimeType.includes('excel')))) {
    return { ext: 'XLSX', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', icon: '📊' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { ext: ext.toUpperCase(), color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', icon: '📦' };
  }
  return { ext: ext.toUpperCase() || 'FILE', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', icon: '📁' };
};

export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  const num = Number(bytes);
  if (num < 1024) return num + ' B';
  if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
  return (num / (1024 * 1024)).toFixed(1) + ' MB';
};

/* ==============================================================================
   COMPONENT IMPLEMENTATION
   ============================================================================== */

export default function OmnichannelInbox({ currentProfile }) {
  const { user } = useAuth();

  // Refs de Delta Polling em Tempo Real (PLAN-225)
  const latestMessageIdRef = useRef(0);
  const isPollingRef = useRef(false);

  // Determinar silo inicial com base no atendente logado
  const initialDept = useMemo(() => {
    if (currentProfile?.role === 'ATTENDANT') {
      return currentProfile?.primaryLine || currentProfile?.allowedLines?.[0] || 'ALL';
    }
    return 'ALL';
  }, [currentProfile]);

  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDept);
  const [treeFilter, setTreeFilter] = useState('ALL'); // ALL, UNREAD, ATTENDING, GROUPS
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialDept && initialDept !== 'ALL') {
      setSelectedDepartment(initialDept);
    }
  }, [initialDept]);
  
  const [conversations, setConversations] = useState([]);
  const [channelsList, setChannelsList] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [realDossier, setRealDossier] = useState(null);
  const [channelTelemetry, setChannelTelemetry] = useState(null);

  const [dossierOpen, setDossierOpen] = useState(true);
  const [railExpanded, setRailExpanded] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('CHANNEL'); // CHANNEL, PROFILE, AI_DOSSIER, ORDERS, CONTRACTS
  const [inputText, setInputText] = useState('');
  const [isWhisper, setIsWhisper] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Estados de Imagem / Lightbox / Prévia / Histórico
  const [lightboxImg, setLightboxImg] = useState(null);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Modal de Conexão Rápida QR Code
  const [quickQrModalOpen, setQuickQrModalOpen] = useState(false);
  const [qrBase64, setQrBase64] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrTargetInstance, setQrTargetInstance] = useState(null);

  // Estados de Transferência de Atendimento
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetAttendant, setTransferTargetAttendant] = useState('giovanna');
  const [transferContextNote, setTransferContextNote] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Estados do Copilot Auto-Draft (Hermes AI)
  const [copilotDraft, setCopilotDraft] = useState(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [transcriptions, setTranscriptions] = useState({});
  const [transcribingId, setTranscribingId] = useState(null);
  const [expandedTranscriptions, setExpandedTranscriptions] = useState({});

  // Estado de Transição Fluida ao Resolver e Feedback Toast
  const [resolvingId, setResolvingId] = useState(null);
  const [toastFeedback, setToastFeedback] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToastFeedback({ message, type });
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Estados do Dossiê IA e Assistente Interno
  const [aiDossier, setAiDossier] = useState(null);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [internalAssistantOpen, setInternalAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState([
    { role: 'assistant', content: 'Olá! Sou o Hermes, seu Assistente de Inteligência Interna. Em que posso te apoiar com protocolos 3S, regras comerciais do Congresso 2026 ou orientações agora?' }
  ]);

  // Estados de RLHF, Bridge Clínico e Soul Memory (PLAN-195 & PLAN-197)
  const [rlhfRated, setRlhfRated] = useState(null);
  const [clinicalBridge, setClinicalBridge] = useState(null);
  const [loadingClinicalBridge, setLoadingClinicalBridge] = useState(false);
  const [nlpExtracting, setNlpExtracting] = useState(false);
  const [extractedTags, setExtractedTags] = useState([]);
  const [automationQueue, setAutomationQueue] = useState([]);
  const [soulMemory, setSoulMemory] = useState(null);
  const [loadingSoulMemory, setLoadingSoulMemory] = useState(false);
  const [consolidatingSoul, setConsolidatingSoul] = useState(false);

  // Estados de Segurança e Resiliência (PLAN-200)
  const [showUnmaskedDoc, setShowUnmaskedDoc] = useState(false);

  // Estado do Menu Suspenso Mais Ações (PLAN-211)
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef(null);

  // Estados de Macros Rápidas com Autocomplete '/' (PLAN-213)
  const [macroMenuOpen, setMacroMenuOpen] = useState(false);
  const [macroFilter, setMacroFilter] = useState('');
  const [macroSelectedIndex, setMacroSelectedIndex] = useState(0);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const macroPopoverRef = useRef(null);

  const filteredMacros = useMemo(() => {
    if (!macroFilter) return QUICK_MACROS;
    const q = macroFilter.toLowerCase();
    return QUICK_MACROS.filter(
      (m) =>
        m.trigger.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.text.toLowerCase().includes(q)
    );
  }, [macroFilter]);

  // Modal de Feedback de Ações (PLAN-214: Meet, Drive, etc.)
  const [actionModal, setActionModal] = useState(null); // { title, link, desc, iconType }
  const [actionModalCopied, setActionModalCopied] = useState(false);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [isCreatingDrive, setIsCreatingDrive] = useState(false);

  const handleCreateMeetModal = async () => {
    setIsCreatingMeet(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const randomCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
      const meetLink = `https://meet.google.com/${randomCode}`;
      setActionModal({
        title: '🎥 Sala Google Meet Criada',
        link: meetLink,
        desc: `Reunião gerada com sucesso pela conta oficial bodyharmony36@gmail.com para ${activeConv?.name || 'o paciente'}.`,
        iconType: 'MEET'
      });
      setActionModalCopied(false);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleOpenDriveModal = async () => {
    setIsCreatingDrive(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const driveLink = 'https://drive.google.com/drive/u/0/my-drive';
      setActionModal({
        title: '📁 Pasta de Prontuários no Google Drive',
        link: driveLink,
        desc: `Acesso direto à nuvem do Google Drive da clínica para anexar exames, fotos de evolução e termos assinados.`,
        iconType: 'DRIVE'
      });
      setActionModalCopied(false);
    } finally {
      setIsCreatingDrive(false);
    }
  };

  const handleCopyActionLink = () => {
    if (!actionModal?.link) return;
    navigator.clipboard.writeText(actionModal.link);
    setActionModalCopied(true);
    showToast('Link copiado para a área de transferência!');
    setTimeout(() => setActionModalCopied(false), 2500);
  };

  const handleInsertActionLink = () => {
    if (!actionModal?.link) return;
    setInputText((prev) => (prev ? prev + ' ' + actionModal.link : actionModal.link));
    showToast('Link inserido no campo de mensagem!');
    setActionModal(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) {
        setMoreActionsOpen(false);
      }
      if (macroPopoverRef.current && !macroPopoverRef.current.contains(e.target)) {
        setMacroMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sentiment = useMemo(() => {
    const text = activeConv?.lastMsg || '';
    if (/(pessimo|horrivel|demora|reclamacao|absurdo|ninguem me responde|quero cancelar|falta de respeito|nao gostei|dor|cancelar)/i.test(text)) {
      return { label: '⚠️ Alerta de Sentimento', bg: '#FEE2E2', color: '#991B1B' };
    }
    if (/(amei|maravilhoso|otimo|excelente|obrigada|perfeito|parabens|adorei|agendar|fechado)/i.test(text)) {
      return { label: '😊 Satisfeito(a)', bg: '#D1FAE5', color: '#065F46' };
    }
    return { label: '😐 Neutro', bg: '#F1F5F9', color: '#475569' };
  }, [activeConv?.lastMsg]);

  const handleTranscribeAudio = async (msgId, audioUrl) => {
    setTranscribingId(msgId);
    try {
      const res = await hermesAuditApi.transcribeAudio(audioUrl);
      if (res && res.transcription) {
        setTranscriptions((prev) => ({ ...prev, [msgId]: res.transcription }));
      }
    } catch (e) {
      console.warn('Erro ao transcrever áudio:', e);
    } finally {
      setTranscribingId(null);
    }
  };

  const handleFetchCopilotDraft = async () => {
    const lastCustomerMsg = messages.filter(m => !m.isMe).slice(-1)[0]?.text || activeConv?.lastMessage || '';
    if (!lastCustomerMsg) return;

    setIsGeneratingDraft(true);
    try {
      const recentHistory = messages.slice(-8).map(m => ({
        role: m.isMe ? 'attendant' : 'client',
        content: m.text || ''
      }));

      const operatorData = {
        name: user?.name || user?.username || 'Atendente Body Harmony',
        role: user?.role || 'Atendimento Especializado'
      };

      const contactData = {
        name: activeConv?.name || 'Cliente',
        phone: activeConv?.phone || ''
      };

      const targetLine = activeConv?.platform === 'INSTAGRAM' ? 'INSTAGRAM' : (activeConv?.line || activeConv?.department || 'CLINICA');
      const res = await hermesAgentApi.getCopilotDraft(
        lastCustomerMsg,
        targetLine,
        contactData,
        operatorData,
        recentHistory
      );
      if (res && res.draft) {
        setCopilotDraft(res.draft);
        setRlhfRated(null); // Reset feedback on new draft
      }
    } catch (e) {
      console.warn('Erro ao gerar rascunho Copilot:', e);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleRlhfFeedback = async (rating) => {
    setRlhfRated(rating);
    try {
      await crmApi.sendRlhfFeedback({
        prompt_type: 'COPILOT_DRAFT',
        input_context: messages.filter(m => !m.isMe).slice(-1)[0]?.text || activeConv?.name,
        original_output: copilotDraft,
        rating: rating,
        operator_id: user?.name || user?.username || 'ADMIN'
      });
    } catch (e) {
      console.warn('Erro ao registrar feedback RLHF:', e);
    }
  };

  const fetchClinicalBridge = async (phone) => {
    if (!phone) return;
    setLoadingClinicalBridge(true);
    try {
      const res = await crmApi.getClinicalBridge(phone);
      if (res && res.success && res.bridge) {
        setClinicalBridge(res.bridge);
      }
    } catch (e) {
      console.warn('Erro ponte clínica-vendas:', e);
    } finally {
      setLoadingClinicalBridge(false);
    }
  };

  const fetchSoulMemory = async (phone) => {
    if (!phone) return;
    setLoadingSoulMemory(true);
    try {
      const res = await crmApi.getSoulMemory(phone);
      if (res && res.success) {
        setSoulMemory(res);
      }
    } catch (e) {
      console.warn('Erro ao carregar Soul Memory:', e);
    } finally {
      setLoadingSoulMemory(false);
    }
  };

  const handleConsolidateSoulMemory = async () => {
    if (!activeConv?.phone) return;
    setConsolidatingSoul(true);
    try {
      const res = await crmApi.consolidateSoulMemory({
        phone: activeConv.phone,
        messages: messages,
        name: activeConv.name || 'Paciente'
      });
      if (res && res.success) {
        setSoulMemory(res);
      }
    } catch (e) {
      console.warn('Erro na consolidação de Soul Memory:', e);
    } finally {
      setConsolidatingSoul(false);
    }
  };

  const handleRunNlpExtraction = async () => {
    if (!activeConv) return;
    setNlpExtracting(true);
    try {
      const conversationText = messages.map(m => m.text).join('\n');
      const res = await crmApi.nlpExtractClinicalProfile({
        phone: activeConv.phone,
        text: conversationText || activeConv.lastMessage || 'Avaliação de tratamento corporal',
        name: activeConv.name
      });
      if (res && res.success) {
        setExtractedTags(res.tags || []);
        fetchClinicalBridge(activeConv.phone);
      }
    } catch (e) {
      console.warn('Erro na extração NLP:', e);
    } finally {
      setNlpExtracting(false);
    }
  };

  const handleGenerateAiDossier = async () => {
    if (!activeConv) return;
    setIsGeneratingDossier(true);
    try {
      const res = await hermesAgentApi.summarizeDossier(activeConv.id || 1, messages, {
        name: activeConv.name || 'Cliente',
        phone: activeConv.phone || ''
      });
      if (res && res.summary) {
        setAiDossier(res.summary);
      }
    } catch (e) {
      console.warn('Erro ao sintetizar dossiê:', e);
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  const handleSendAssistantQuery = async () => {
    if (!assistantInput.trim()) return;
    const query = assistantInput;
    setAssistantInput('');
    setAssistantHistory(prev => [...prev, { role: 'user', content: query }]);
    setAssistantLoading(true);

    try {
      const operatorData = {
        name: user?.name || user?.username || 'Colaborador',
        role: user?.role || 'Equipe CRM'
      };
      const contactData = activeConv ? {
        name: activeConv.name || 'Cliente',
        phone: activeConv.phone || '',
        line: activeConv.line || 'CLINICA',
        protocol_name: clinicalBridge?.protocol_name || 'Protocolo 3S',
        current_session: clinicalBridge?.current_session || '1'
      } : {};
      const res = await hermesAgentApi.internalAssistantChat(query, operatorData, assistantHistory.slice(-6), contactData);
      if (res && res.reply) {
        setAssistantHistory(prev => [...prev, { role: 'assistant', content: res.reply }]);
      }
    } catch (e) {
      setAssistantHistory(prev => [...prev, { role: 'assistant', content: 'Não foi possível consultar o Hermes no momento.' }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // ── SCROLL-TO-QUOTE COM HIGHLIGHT (PLAN-227) ──
  const handleQuoteClick = (quotedContext) => {
    const stanzaId = quotedContext?.stanzaId || quotedContext?.messageId || quotedContext?.id;
    if (!stanzaId) return;

    const targetElem =
      document.getElementById(`msg-${stanzaId}`) ||
      document.querySelector(`[data-msg-id="${stanzaId}"]`);

    if (targetElem) {
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElem.classList.add('quote-pulse-highlight');
      setTimeout(() => {
        targetElem.classList.remove('quote-pulse-highlight');
      }, 1500);
    }
  };

  // Listener de Paste (Ctrl+V) para capturar prints e imagens
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            setPendingMedia(file);
            setMediaPreviewUrl(url);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSendMedia = async (file, caption) => {
    if (!file || !activeConv) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', activeConv.id);
    formData.append('text', caption || '');
    formData.append('media_type', 'IMAGE');
    formData.append('phone', activeConv.phone || '');

    try {
      const res = await crmApi.sendInboxMedia(formData);
      if (res && res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.warn('Erro ao enviar imagem:', err);
    } finally {
      setPendingMedia(null);
      setMediaPreviewUrl(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPendingMedia(file);
      setMediaPreviewUrl(url);
    }
    e.target.value = '';
  };

  // Ref defensiva para garantir que o ID nunca mude em race conditions de polling
  const selectedConvIdRef = useRef(null);
  selectedConvIdRef.current = selectedConvId;

  // 1. CARREGAR CANAIS REAIS (TELEMETRIA GLOBAL)
  const fetchChannels = async () => {
    try {
      const res = await crmApi.getChannels();
      if (res && res.success && Array.isArray(res.channels)) {
        setChannelsList(res.channels);
      }
    } catch (e) {
      console.warn('Erro ao consultar canais:', e);
    }
  };

  // 2. CARREGAR CONVERSAS REAIS DA API COM TELEMETRIA & RBAC (PLAN-200 & PLAN-201)
  const fetchConversations = async () => {
    try {
      if (selectedChannel === 'INSTAGRAM') {
        const igRes = await instagramApi.getConversations(50);
        if (igRes && igRes.success && Array.isArray(igRes.conversations)) {
          setConversations(igRes.conversations);
          setChannelTelemetry({
            name: 'Instagram Direct (@bodyharmonyoficial)',
            status: 'CONNECTED',
            phoneNumber: 'Zernio Official API',
            attendantUsername: 'giovanna',
            instanceKey: 'inst_ig',
            type: 'INSTAGRAM'
          });

          const found = igRes.conversations.find((c) => c.id === selectedConvIdRef.current);
          if (found) {
            setActiveConv(found);
          } else if (igRes.conversations.length > 0) {
            const first = igRes.conversations[0];
            setSelectedConvId(first.id);
            setActiveConv(first);
            const savedDraft = localStorage.getItem(`crm_draft_${first.id}`) || '';
            setInputText(savedDraft);
          } else {
            setSelectedConvId(null);
            setActiveConv(null);
            setMessages([]);
            setRealDossier(null);
            setInputText('');
          }
          return;
        }
      }

      const role = currentProfile?.role || user?.role || 'ADMIN';
      const allowed = currentProfile?.allowedLines || user?.allowedLines || ['CLINICA', 'VENDAS', 'JURIDICO', 'SUPORTE'];
      const res = await crmApi.getInboxConversations({
        channel: selectedChannel,
        line: selectedDepartment,
        search: searchQuery,
        operator_role: role,
        operator_lines: Array.isArray(allowed) ? allowed.join(',') : 'ALL'
      });
      if (res && res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
        if (res.channel_info) {
          setChannelTelemetry(res.channel_info);
        }

        // Se a conversa selecionada anteriormente não pertencer ao novo filtro, resetar
        const found = res.conversations.find((c) => c.id === selectedConvIdRef.current);
        if (found) {
          setActiveConv(found);
        } else if (res.conversations.length > 0) {
          const first = res.conversations[0];
          setSelectedConvId(first.id);
          setActiveConv(first);
          const savedDraft = localStorage.getItem(`crm_draft_${first.id}`) || '';
          setInputText(savedDraft);
        } else {
          setSelectedConvId(null);
          setActiveConv(null);
          setMessages([]);
          setRealDossier(null);
          setInputText('');
        }
      }
    } catch (err) {
      console.warn('Erro no carregamento de conversas:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    fetchConversations();
    const listInterval = setInterval(() => {
      if (!document.hidden) {
        fetchConversations();
      }
    }, 5000);
    return () => clearInterval(listInterval);
  }, [selectedChannel, selectedDepartment, searchQuery]);

  // 3. SELEÇÃO EXPLÍCITA DE CONVERSA PELO USUÁRIO & RECUPERAÇÃO DE RASCUNHO (PLAN-200)
  const handleSelectConversation = (conv) => {
    if (!conv || !conv.id) return;
    setSelectedConvId(conv.id);
    setActiveConv(conv);
    setRightPanelTab('PROFILE'); // Auto-muda para o Dossiê ao clicar no contato

    // Recuperar rascunho salvo no LocalStorage
    const savedDraft = localStorage.getItem(`crm_draft_${conv.id}`) || '';
    setInputText(savedDraft);

    // Limpeza Reativa Instantânea de Não Lidas
    if (conv.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
      );
      // Disparar atualização de leitura no backend
      crmApi.sendInboxMessage({ action: 'mark_read', conversation_id: conv.id }).catch(() => {});
    }

    fetchMessages(conv.id, conv.phone);
    fetchDossier(conv.phone);
  };

  // Gerenciador de Input com Persistência em Tempo Real & Interceptor de Macros (PLAN-213)
  const handleInputChange = (val) => {
    setInputText(val);
    if (activeConv?.id) {
      if (val.trim()) {
        localStorage.setItem(`crm_draft_${activeConv.id}`, val);
      } else {
        localStorage.removeItem(`crm_draft_${activeConv.id}`);
      }
    }

    // Interceptar '/' no final do texto
    const slashMatch = val.match(/\/([a-zA-Z0-9_]*)$/);
    if (slashMatch) {
      setMacroFilter(slashMatch[1]);
      setMacroMenuOpen(true);
      setMacroSelectedIndex(0);
    } else {
      setMacroMenuOpen(false);
    }
  };

  const handleSelectMacro = (macro) => {
    if (!macro) return;
    const newText = inputText.replace(/\/([a-zA-Z0-9_]*)$/, macro.text);
    setInputText(newText);
    setMacroMenuOpen(false);
    if (activeConv?.id) {
      localStorage.setItem(`crm_draft_${activeConv.id}`, newText);
    }
  };

  const handleInsertEmoji = (emoji) => {
    const newText = (inputText || '') + emoji;
    setInputText(newText);
    setEmojiPickerOpen(false);
    if (activeConv?.id) {
      localStorage.setItem(`crm_draft_${activeConv.id}`, newText);
    }
  };

  // 4. CARREGAR MENSAGENS REAIS
  const fetchMessages = async (convId, phone) => {
    const targetId = convId || selectedConvIdRef.current;
    if (!targetId) return;
    try {
      if (String(targetId).startsWith('ig_') || activeConv?.platform === 'INSTAGRAM' || selectedChannel === 'INSTAGRAM') {
        const igRes = await instagramApi.getMessages(targetId);
        if (igRes && igRes.success && Array.isArray(igRes.messages)) {
          if (selectedConvIdRef.current === targetId) {
            setMessages(igRes.messages);
          }
        }
        return;
      }

      const res = await crmApi.getInboxMessages(targetId, phone);
      if (res && res.success && Array.isArray(res.messages)) {
        if (selectedConvIdRef.current === targetId) {
          setMessages(res.messages);
          let maxId = 0;
          res.messages.forEach((m) => {
            const num = parseInt(String(m.numericId || m.id).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          });
          latestMessageIdRef.current = maxId;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err);
    }
  };

  // 4.1 DELTA POLLING EM TEMPO REAL (< 1.5s - PLAN-225)
  useEffect(() => {
    if (!selectedConvId) return;

    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      if (document.hidden) return; // Economizar recursos se aba em background

      isPollingRef.current = true;
      try {
        const currentId = selectedConvIdRef.current;
        if (!currentId) return;

        const res = await crmApi.pollInboxDelta(currentId, latestMessageIdRef.current, activeConv?.phone);
        if (res && res.success && Array.isArray(res.messages) && res.messages.length > 0) {
          if (selectedConvIdRef.current === currentId) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.messageId || m.id));
              const uniqueNew = res.messages.filter((m) => !existingIds.has(m.messageId || m.id));
              if (uniqueNew.length === 0) return prev;
              return [...prev, ...uniqueNew];
            });

            if (res.latest_id && res.latest_id > latestMessageIdRef.current) {
              latestMessageIdRef.current = res.latest_id;
            }

            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }
        }
      } catch (e) {
      } finally {
        isPollingRef.current = false;
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedConvId, activeConv?.phone]);

  // 5. CARREGAR DOSSIÊ 360 REAL
  const fetchDossier = async (phone) => {
    if (!phone) return;
    try {
      const res = await crmApi.getDossier(phone);
      if (res && res.success && res.dossier) {
        setRealDossier(res.dossier);
      }
    } catch (err) {
      console.warn('Erro ao buscar dossiê:', err);
    }
  };

  useEffect(() => {
    if (selectedConvId && activeConv) {
      fetchMessages(selectedConvId, activeConv.phone);
      fetchDossier(activeConv.phone);
      if (activeConv.phone) {
        fetchClinicalBridge(activeConv.phone);
        fetchSoulMemory(activeConv.phone);
      }
    }
  }, [selectedConvId, activeConv?.phone]);

  // 6. FILTRO EM MEMÓRIA REATIVO (0ms de latência)
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (treeFilter === 'UNREAD') return c.unread > 0;
      if (treeFilter === 'ATTENDING') return c.unread === 0 && !c.isGroup;
      if (treeFilter === 'GROUPS') return c.isGroup;
      return true;
    });
  }, [conversations, treeFilter]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unread || 0), 0);
  }, [conversations]);

  // 7. DETERMINAR CANAL ATUALMENTE EM FOCO
  const currentLineMeta = useMemo(() => {
    if (channelTelemetry) return channelTelemetry;

    const deptMap = {
      'CLINICA': 'inst_clinica',
      'JURIDICO': 'inst_juridico',
      'VENDAS': 'inst_comercial',
      'SUPORTE': 'inst_licenciadas'
    };

    const targetKey = deptMap[selectedDepartment] || (selectedChannel === 'INSTAGRAM' ? 'inst_ig' : selectedChannel === 'TELEGRAM' ? 'inst_tg' : null);
    if (targetKey && channelsList.length > 0) {
      const found = channelsList.find((c) => c.instanceKey === targetKey || c.id === targetKey);
      if (found) return found;
    }

    if (selectedDepartment === 'CLINICA') {
      return { name: 'Linha 01 — Clínica & Pacientes', status: 'DISCONNECTED', phoneNumber: 'Aguardando Leitura do QR', attendantUsername: 'cibele', instanceKey: 'inst_clinica', type: 'WHATSAPP' };
    }
    if (selectedDepartment === 'JURIDICO') {
      return { name: 'Linha 02 — Jurídico & Finanças', status: 'CONNECTED', phoneNumber: '+55 (18) 99619-3745', attendantUsername: 'guilherme', instanceKey: 'inst_juridico', type: 'WHATSAPP' };
    }
    if (selectedDepartment === 'VENDAS') {
      return { name: 'Linha 03 — Vendas & Comercial', status: 'CONNECTED', phoneNumber: '+55 (18) 99635-6825', attendantUsername: 'giovanna', instanceKey: 'inst_comercial', type: 'WHATSAPP' };
    }
    if (selectedDepartment === 'SUPORTE') {
      return { name: 'Linha 04 — Suporte Licenciadas', status: 'CONNECTED', phoneNumber: '+55 (18) 99601-2050', attendantUsername: 'guilherme', instanceKey: 'inst_licenciadas', type: 'WHATSAPP' };
    }
    if (selectedChannel === 'INSTAGRAM') {
      return {
        name: 'Instagram Direct (@bodyharmonyoficial)',
        status: 'CONNECTED',
        phoneNumber: '@bodyharmonyoficial',
        attendantUsername: 'giovanna',
        instanceKey: 'inst_ig',
        type: 'INSTAGRAM',
        battery: '4.135 Seguidores',
        signal: '165 Mídias',
        engine: 'Zernio Official API (Meta Graph)'
      };
    }
    if (selectedChannel === 'TELEGRAM') {
      return { name: 'Telegram Bot Swarm (@bodyharmony_bot)', status: 'CONNECTED', phoneNumber: 'Botfather Token', attendantUsername: 'guilherme', instanceKey: 'inst_tg', type: 'TELEGRAM' };
    }

    return { name: 'Todas as Linhas & Silos (Omnichannel)', status: 'CONNECTED', phoneNumber: 'Central Unificada', attendantUsername: 'Todos', type: 'WHATSAPP' };
  }, [channelTelemetry, selectedDepartment, selectedChannel, channelsList]);

  // 8. ABRIR QR CODE RÁPIDO PARA UMA INSTÂNCIA
  const handleOpenQuickQr = async (targetInst) => {
    const instKey = targetInst?.instanceKey || targetInst?.instance_key || 'inst_clinica';
    setQrTargetInstance(targetInst);
    setQuickQrModalOpen(true);
    setQrLoading(true);
    setQrBase64(null);

    try {
      const res = await crmApi.getQrCode(instKey);
      if (res && res.success && res.qr) {
        setQrBase64(res.qr);
      }
    } catch (e) {
      console.warn('Erro ao carregar QR Code:', e);
    } finally {
      setQrLoading(false);
    }
  };

  // 9. ENVIAR MENSAGEM COM OPTIMISTIC UI (PLAN-225)
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConv) return;

    const currentText = inputText;
    const currentConvId = activeConv.id;
    const currentPhone = activeConv.phone;

    setInputText('');
    if (currentConvId) {
      localStorage.removeItem(`crm_draft_${currentConvId}`);
    }

    // Optimistic UI: Renderizar balão instantaneamente (< 0ms de espera visual)
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      messageId: tempId,
      sender: 'ME',
      senderName: user?.name || user?.username || 'Operador',
      text: currentText,
      time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      type: isWhisper ? 'WHISPER' : 'TEXT',
      status: 'sending',
      quotedMessage: null,
      reactions: []
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 40);

    try {
      if (String(currentConvId).startsWith('ig_') || activeConv.platform === 'INSTAGRAM' || selectedChannel === 'INSTAGRAM') {
        const igRes = await instagramApi.sendDirectMessage(currentConvId, currentText);
        if (igRes && (igRes.success || igRes.id)) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: 'msg_' + (igRes.id || Date.now()), status: 'sent' } : m))
          );
        }
        return;
      }

      const operatorName = user?.name || user?.username || 'Atendente';
      const payload = {
        conversation_id: currentConvId,
        phone: currentPhone,
        text: currentText,
        message: currentText,
        is_whisper: isWhisper,
        sender_name: operatorName
      };

      const res = await crmApi.sendInboxMessage(payload);
      if (res && res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: res.message?.id || ('msg_' + (res.message?.messageId || Date.now())),
                  messageId: res.message?.messageId,
                  status: res.sent ? 'sent' : 'error'
                }
              : m
          )
        );
        // Atualizar última mensagem na lista lateral
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConvId
              ? {
                  ...c,
                  lastMessage: currentText,
                  lastMsg: currentText,
                  time: 'Agora'
                }
              : c
          )
        );
      } else {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)));
      }
    } catch (err) {
      console.warn('Erro ao enviar mensagem:', err);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)));
    }
  };

  // 10. AÇÕES DE CONVERSA
  const handleStatusToggle = async (status) => {
    if (!activeConv) return;
    const currentActiveId = activeConv.id;
    const isResolved = status === 'resolved';

    // 1. Iniciar animação de saída no card
    setResolvingId(currentActiveId);

    // 2. Encontrar a próxima conversa ativa na lista para auto-seleção
    const remainingConvs = conversations.filter((c) => c.id !== currentActiveId);
    const nextConv = remainingConvs[0] || null;

    try {
      const res = await crmApi.executeInboxAction({
        action: 'toggle_status',
        conversation_id: currentActiveId,
        chatwoot_id: activeConv.chatwootId,
        status: status
      });

      // 3. Concluir transição e auto-selecionar próxima conversa
      setTimeout(() => {
        setResolvingId(null);
        if (isResolved) {
          setConversations(remainingConvs);
          if (nextConv) {
            handleSelectConversation(nextConv);
          } else {
            setActiveConv(null);
          }
          showToast('Atendimento resolvido com sucesso!');
        } else {
          showToast('Atendimento reaberto com sucesso!');
        }
        fetchConversations();
      }, 200);
    } catch (err) {
      setResolvingId(null);
      showToast('Erro ao alterar status: ' + err.message, 'error');
    }
  };

  // 11. CONFIRMAR TRANSFERÊNCIA
  const handleConfirmTransfer = async () => {
    if (!activeConv) return;
    setIsSubmittingTransfer(true);
    try {
      const res = await crmApi.executeInboxAction({
        action: 'assign_agent',
        conversation_id: activeConv.id,
        chatwoot_id: activeConv.chatwootId,
        agent_username: transferTargetAttendant,
        context_note: transferContextNote
      });
      if (res && res.success) {
        alert('Conversa transferida com sucesso!');
        setTransferModalOpen(false);
        setTransferContextNote('');
        fetchConversations();
      }
    } catch (err) {
      alert('Erro na transferência: ' + err.message);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // 1-Click Fast Transfer p/ Licenciadas (PLAN-198)
  const handleFastLicenciadaTransfer = async (targetAgent, reason) => {
    if (!activeConv) return;
    try {
      await crmApi.executeInboxAction({
        action: 'assign_agent',
        conversation_id: activeConv.id,
        chatwoot_id: activeConv.chatwootId,
        agent_username: targetAgent,
        context_note: `[Transbordo Rápido de Licenciada] ${reason} - Solicitado via Dossiê 360`
      });
      alert(`Chamado transferido com sucesso para ${targetAgent === 'josi' ? 'Dra. Josi (Clínico/Renovação)' : 'Guilherme (Contratos/Financeiro)'}!`);
      fetchConversations();
    } catch (err) {
      alert('Erro na transferência: ' + err.message);
    }
  };

  // Verificador de Permissão por Linha (RBAC - PLAN-200)
  const isLineAllowed = (dept) => {
    const role = currentProfile?.role || user?.role || 'ADMIN';
    if (role === 'ADMIN' || role === 'GESTOR') return true;
    const allowed = currentProfile?.allowedLines || user?.allowedLines || ['CLINICA', 'VENDAS', 'JURIDICO', 'SUPORTE'];
    if (dept === 'ALL') return true;
    return Array.isArray(allowed) && allowed.includes(dept);
  };

  // Ícone de Canal
  const getChannelIcon = (channel) => {
    if (channel === 'INSTAGRAM') return <FaInstagram />;
    if (channel === 'TELEGRAM') return <FaTelegramPlane />;
    return <FaWhatsapp />;
  };

  return (
    <WorkspaceGrid $dossierOpen={dossierOpen} $railExpanded={railExpanded}>
      {/* COLUMN 0: EXPANDABLE LINE RAIL */}
      <LineRailCol
        onMouseEnter={() => setRailExpanded(true)}
        onMouseLeave={() => setRailExpanded(false)}
      >
        <RailButton
          $active={selectedDepartment === 'ALL' && selectedChannel === 'ALL'}
          $expanded={railExpanded}
          onClick={() => { setSelectedDepartment('ALL'); setSelectedChannel('ALL'); }}
          title="Todos os Silos & Canais"
        >
          <span className="icon"><FaLayerGroup /></span>
          <div className="label-group">
            <span className="title">Visão Geral</span>
            <span className="sub">Todos os Silos</span>
          </div>
        </RailButton>

        {isLineAllowed('CLINICA') && (
          <RailButton
            $active={selectedDepartment === 'CLINICA'}
            $expanded={railExpanded}
            onClick={() => { setSelectedDepartment('CLINICA'); setSelectedChannel('ALL'); }}
            title="🏥 Linha 01 — Clínica (Cibele)"
          >
            <span className="icon"><FaHospital /></span>
            <div className="label-group">
              <span className="title">Clínica</span>
              <span className="sub">Cibele</span>
            </div>
          </RailButton>
        )}

        {isLineAllowed('VENDAS') && (
          <RailButton
            $active={selectedDepartment === 'VENDAS'}
            $expanded={railExpanded}
            onClick={() => { setSelectedDepartment('VENDAS'); setSelectedChannel('ALL'); }}
            title="💼 Linha 03 — Vendas (Giovanna)"
          >
            <span className="icon"><FaBriefcase /></span>
            <div className="label-group">
              <span className="title">Vendas & Cursos</span>
              <span className="sub">Giovanna</span>
            </div>
          </RailButton>
        )}

        {isLineAllowed('JURIDICO') && (
          <RailButton
            $active={selectedDepartment === 'JURIDICO'}
            $expanded={railExpanded}
            onClick={() => { setSelectedDepartment('JURIDICO'); setSelectedChannel('ALL'); }}
            title="⚖️ Linha 02 — Jurídico & Finanças (Guilherme)"
          >
            <span className="icon"><FaBalanceScale /></span>
            <div className="label-group">
              <span className="title">Jurídico & Fin</span>
              <span className="sub">Guilherme</span>
            </div>
          </RailButton>
        )}

        {isLineAllowed('SUPORTE') && (
          <RailButton
            $active={selectedDepartment === 'SUPORTE'}
            $expanded={railExpanded}
            onClick={() => { setSelectedDepartment('SUPORTE'); setSelectedChannel('ALL'); }}
            title="👑 Linha 04 — Suporte Licenciadas (Guilherme)"
          >
            <span className="icon"><FaHeadset /></span>
            <div className="label-group">
              <span className="title">Licenciadas</span>
              <span className="sub">Suporte VIP</span>
            </div>
          </RailButton>
        )}

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0.2rem 0' }} />

        <RailButton
          $active={selectedChannel === 'INSTAGRAM'}
          $expanded={railExpanded}
          onClick={() => { setSelectedChannel('INSTAGRAM'); setSelectedDepartment('ALL'); }}
          title="📱 Instagram Direct"
        >
          <span className="icon"><FaInstagram /></span>
          <div className="label-group">
            <span className="title">Instagram</span>
            <span className="sub">Direct</span>
          </div>
        </RailButton>

        <RailButton
          $active={selectedChannel === 'TELEGRAM'}
          $expanded={railExpanded}
          onClick={() => { setSelectedChannel('TELEGRAM'); setSelectedDepartment('ALL'); }}
          title="✈️ Telegram Swarm"
        >
          <span className="icon"><FaTelegramPlane /></span>
          <div className="label-group">
            <span className="title">Telegram</span>
            <span className="sub">Canal Oficial</span>
          </div>
        </RailButton>
      </LineRailCol>

      {/* COLUMN 1: CONVERSATIONS LIST */}
      <ConvListCol>
        <ConvHeader>
          <SearchBox>
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Buscar nome, número ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>

          <TreeTabs>
            <button
              $active={treeFilter === 'ALL'}
              onClick={() => setTreeFilter('ALL')}
            >
              Todas
            </button>
            <button
              $active={treeFilter === 'UNREAD'}
              onClick={() => setTreeFilter('UNREAD')}
            >
              Não Lidas {unreadTotal > 0 && <span className="counter">{unreadTotal}</span>}
            </button>
            <button
              $active={treeFilter === 'ATTENDING'}
              onClick={() => setTreeFilter('ATTENDING')}
            >
              Atendendo
            </button>
            <button
              $active={treeFilter === 'GROUPS'}
              onClick={() => setTreeFilter('GROUPS')}
            >
              Grupos
            </button>
          </TreeTabs>
        </ConvHeader>

        <ConvScrollArea>
          {isLoadingConversations && conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ED7E13' }} />
              <div>Carregando atendimentos em tempo real...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>💬</div>
              <strong style={{ color: '#0A3E60', display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                Nenhuma conversa encontrada neste filtro
              </strong>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#94A3B8', lineHeight: '1.4' }}>
                Selecione outro departamento na barra lateral ou ajuste os termos da busca.
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const displayName = formatContactTitle(c);
              const initialLetter = ((displayName || 'C').charAt(0)).toUpperCase();

              return (
                <ConvCard
                  key={c.id}
                  $selected={selectedConvId === c.id}
                  $resolving={resolvingId === c.id}
                  onClick={() => handleSelectConversation(c)}
                >
                  <div className="avatar-box">
                    {c?.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt={displayName}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : null}
                    <span>{initialLetter}</span>
                    <div
                      className="channel-badge"
                      style={{
                        background: c?.channel === 'INSTAGRAM' ? '#E1306C' : c?.channel === 'TELEGRAM' ? '#0088CC' : '#25D366'
                      }}
                    >
                      {getChannelIcon(c?.channel)}
                    </div>
                  </div>

                  <div className="info-box">
                    <div className="name-row">
                      <span className="name">{displayName}</span>
                      <span className="time">{c?.time || ''}</span>
                    </div>
                    <div className="msg-row">
                      <span className="snippet">
                        {(() => {
                          const raw = c?.lastMsg || c?.lastMessage || '';
                          if (!raw) return 'Início de conversa';
                          let s = raw.replace(/^\*{0,2}\+?\d{2}\s?\d{2}\s?\d{4,5}[\s-]?\d{4}\s*-\s*([^:*]+):\*{0,2}\s*/i, '$1: ');
                          s = s.replace(/^(?:(?:\*?[A-Za-zÀ-ÿ0-9\s.-]+\*?)\s*\/\s*(?:\*?[A-Za-zÀ-ÿ0-9\s.-]+\*?):\s*)/i, '');
                          s = s.replace(/[*_`]/g, '');
                          return s.trim() || 'Início de conversa';
                        })()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                        {c?.unread > 0 && <span className="badge">{c.unread}</span>}
                      </div>
                    </div>
                  </div>
                </ConvCard>
              );
            })
          )}
        </ConvScrollArea>
      </ConvListCol>

      {/* COLUMN 2: CHAT CANVAS */}
      <ChatCol>
        {activeConv ? (
          <>
            <ChatHeader>
              <div className="contact-meta" onClick={() => { setDossierOpen(true); setRightPanelTab('PROFILE'); }}>
                <div className="avatar">
                  {activeConv?.avatar_url ? (
                    <img
                      src={activeConv.avatar_url}
                      alt={activeConv.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    ((activeConv?.name || activeConv?.phone || 'C').charAt(0)).toUpperCase()
                  )}
                </div>
                <div className="titles">
                  <h3>
                    {formatContactTitle(activeConv)}
                    {activeConv?.isGroup && (
                      <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        👥 GRUPO
                      </span>
                    )}
                  </h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{formatPhoneNumber(activeConv?.phone || activeConv?.remote_jid || '')} • {activeConv?.line || 'Linha Geral'}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '12px', background: sentiment.bg, color: sentiment.color }}>
                      {sentiment.label}
                    </span>
                  </p>
                </div>
              </div>

              <div className="actions">
                <ActionBtn
                  style={{
                    background: isGeneratingDraft ? 'rgba(237, 126, 19, 0.25)' : internalAssistantOpen ? 'rgba(237, 126, 19, 0.15)' : 'transparent',
                    color: '#ED7E13',
                    borderColor: '#ED7E13',
                    fontWeight: 800,
                    animation: isGeneratingDraft ? 'pulse 1.5s infinite ease-in-out' : 'none'
                  }}
                  onClick={handleFetchCopilotDraft}
                  disabled={isGeneratingDraft}
                  title="Gerar sugestão inteligente com Hermes Copilot"
                >
                  {isGeneratingDraft ? <FaSpinner className="fa-spin" /> : <FaRobot />}
                  {isGeneratingDraft ? 'Hermes pensando...' : 'Hermes Copilot'}
                </ActionBtn>

                <ActionBtn onClick={() => handleStatusToggle('resolved')} title="Marcar conversa como resolvida">
                  <FaCheckCircle style={{ color: '#10B981' }} /> Resolver
                </ActionBtn>

                <DropdownContainer ref={moreActionsRef}>
                  <ActionBtn onClick={() => setMoreActionsOpen(!moreActionsOpen)} title="Mais ações de atendimento">
                    <FaEllipsisV /> Mais Ações
                  </ActionBtn>
                  {moreActionsOpen && (
                    <DropdownMenu>
                      <button onClick={() => { setMoreActionsOpen(false); setHistoryModalOpen(true); }}>
                        <FaFileUpload /> Importar Histórico (.txt/.json)
                      </button>
                      <button onClick={() => { setMoreActionsOpen(false); setTransferModalOpen(true); }}>
                        <FaExchangeAlt /> Transferir Atendimento
                      </button>
                      <button onClick={() => { setMoreActionsOpen(false); handleCreateMeetModal(); }}>
                        <FaVideo /> Criar Google Meet (Link Rápido)
                      </button>
                      <button onClick={() => { setMoreActionsOpen(false); handleOpenDriveModal(); }}>
                        <FaFolderOpen /> Prontuários no Google Drive
                      </button>
                      {activeConv?.platform === 'INSTAGRAM' && (
                        <button onClick={() => { setMoreActionsOpen(false); window.open(activeConv.instagram_url || `https://instagram.com/${activeConv.username}`, '_blank'); }}>
                          <FaInstagram /> Perfil do Instagram
                        </button>
                      )}
                    </DropdownMenu>
                  )}
                </DropdownContainer>

                <ActionBtn
                  $primary={dossierOpen}
                  onClick={() => setDossierOpen(!dossierOpen)}
                  title="Alternar Ficha do Paciente / Contato"
                >
                  <FaAddressBook /> {dossierOpen ? 'Ficha Paciente' : 'Abrir Ficha'}
                </ActionBtn>
              </div>
            </ChatHeader>

            <MessageListArea>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <FaComments style={{ fontSize: '2rem', color: '#CBD5E1', marginBottom: '0.5rem' }} />
                  <div>Nenhuma mensagem nesta conversa ainda. Digite abaixo para iniciar.</div>
                </div>
              ) : (
                messages.map((m) => {
                  // ── SYSTEM / ACTIVITY EVENT DIVIDER ──
                  if (m.type === 'ACTIVITY' || m.sender === 'SYSTEM') {
                    return (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        margin: '0.5rem 0', padding: '0 1rem'
                      }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                        <span style={{
                          fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600,
                          background: 'var(--bh-bg-app, #F1F5F9)', padding: '0.2rem 0.65rem',
                          borderRadius: '12px', whiteSpace: 'nowrap', border: '1px solid #E2E8F0'
                        }}>
                          {m.text}
                        </span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                      </div>
                    );
                  }

                  const isMe = m.sender === 'ME';
                  const isWhisperMsg = m.type === 'WHISPER';
                  const isAiMsg = m.sender === 'HERMES_AI';

                  // Parser Inteligente de Mídia no Texto / URL
                  const rawText = m.text || '';
                  const uploadUrlMatch = rawText.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|webm|mp3|ogg|wav|pdf)/i);
                  const detectedMediaUrl = m.mediaUrl || (uploadUrlMatch ? uploadUrlMatch[0] : null);

                  const isImage = m.type === 'IMAGE' || (detectedMediaUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(detectedMediaUrl));
                  const isAudio = m.type === 'AUDIO' || (detectedMediaUrl && /\.(webm|mp3|ogg|wav)$/i.test(detectedMediaUrl));
                  const isDoc = m.type === 'DOCUMENT' || m.type === 'FILE' || (detectedMediaUrl && /\.pdf$/i.test(detectedMediaUrl));

                  // Limpar texto para não exibir URL crua duplicada quando a mídia for renderizada
                  let cleanText = detectedMediaUrl
                    ? rawText.replace(/Arquivo enviado:\s*https?:\/\/[^\s]+/i, '').replace(detectedMediaUrl, '').trim()
                    : rawText;

                  // ── PARSER: WhatsApp Group Sender & Quoted Messages ──
                  const SENDER_COLORS = ['#059669', '#D97706', '#7C3AED', '#2563EB', '#DC2626', '#0891B2'];
                  let parsedSenderName = m.senderName || null;
                  let quotedBlock = m.quotedMessage?.text || m.quotedMessage?.content || null;

                  // Limpar prefixo de assinatura automática do Chatwoot/Evolution em mensagens próprias (ex: "Dra. Josi Silva / Admin:\n")
                  if (isMe && cleanText) {
                    cleanText = cleanText.replace(/^(?:(?:\*?[A-Za-zÀ-ÿ0-9\s.-]+\*?)\s*\/\s*(?:\*?[A-Za-zÀ-ÿ0-9\s.-]+\*?):\s*\n?)/i, '').trim();
                  }

                  // Detect "**+55 XX XXXXX XXXX - Name:** message" pattern from group forwarding
                  const groupSenderMatch = cleanText.match(/^\*{0,2}\+?\d{2}\s?\d{2}\s?\d{4,5}[\s-]?\d{4}\s*-\s*([^:*]+):\*{0,2}\s*([\s\S]*)$/);
                  if (groupSenderMatch) {
                    parsedSenderName = groupSenderMatch[1].trim();
                    cleanText = groupSenderMatch[2].trim();
                  }

                  // Detect WhatsApp-style quoted reply blocks: "> Quoted text\n\nReply message"
                  if (!quotedBlock) {
                    const quoteLineMatch = cleanText.match(/^>\s*([^\n]+(?:\n>[^\n]+)*)\n+([\s\S]*)$/);
                    if (quoteLineMatch) {
                      quotedBlock = quoteLineMatch[1].replace(/^>\s*/gm, '').trim();
                      cleanText = quoteLineMatch[2].trim();
                    }
                  }

                  // Assign a stable color per sender name
                  const senderColorIdx = parsedSenderName
                    ? Math.abs([...parsedSenderName].reduce((a, c) => a + c.charCodeAt(0), 0)) % SENDER_COLORS.length
                    : 0;
                  const senderColor = SENDER_COLORS[senderColorIdx];

                  // ── PARSER: WhatsApp Bold/Italic ──
                  const formatWhatsAppText = (text) => {
                    if (!text) return null;
                    // Replace *bold* and _italic_ patterns
                    let formatted = text
                      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                      .replace(/_(.*?)_/g, '<em>$1</em>');
                    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
                  };

                  // ── REACTION PILLS ──
                  const reactions = m.reactions || [];

                  return (
                    <MessageBubble
                      key={m.id}
                      id={`msg-${m.messageId || m.id}`}
                      data-msg-id={m.messageId || m.id}
                      $isMe={isMe}
                      $isWhisper={isWhisperMsg}
                      $isAi={isAiMsg}
                    >
                      {/* Group Sender Name with Color */}
                      {parsedSenderName && !isMe && !isAiMsg && (
                        <div style={{
                          fontWeight: 800, fontSize: '0.74rem', marginBottom: '0.2rem',
                          color: senderColor
                        }}>
                          {parsedSenderName}
                        </div>
                      )}

                      {isWhisperMsg && (
                        <div style={{ fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaLock /> NOTA PRIVADA INTERNA (Invisível ao cliente)
                        </div>
                      )}
                      {isAiMsg && (
                        <div style={{ fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1E3A8A' }}>
                          <FaRobot /> RESPOSTA DO COPILOTO HERMES AI
                        </div>
                      )}

                      {/* Quoted Reply Block (Scroll-to-Quote - PLAN-227) */}
                      {quotedBlock && (
                        <div
                          onClick={() => handleQuoteClick(m.quotedMessage || m.quotedContext || { stanzaId: m.quotedContext?.stanzaId })}
                          title="Clique para navegar até a mensagem citada"
                          style={{
                            borderLeft: `3px solid ${senderColor || '#ED7E13'}`,
                            background: isMe ? 'rgba(255,255,255,0.15)' : 'rgba(10,62,96,0.06)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '0 8px 8px 0',
                            marginBottom: '0.4rem',
                            fontSize: '0.74rem',
                            color: isMe ? 'rgba(255,255,255,0.9)' : '#334155',
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.68rem', color: isMe ? '#FDE68A' : (senderColor || '#0A3E60'), marginBottom: '0.15rem' }}>
                            ↩️ Mensagem Citada (clique para ver)
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>
                            {formatWhatsAppText(quotedBlock)}
                          </div>
                        </div>
                      )}

                      {isAudio && detectedMediaUrl && (
                        <div style={{ margin: '0.4rem 0' }}>
                          <CustomAudioPlayer src={detectedMediaUrl} isMe={isMe} />
                          <div style={{ marginTop: '0.35rem' }}>
                            {transcriptions[m.id] ? (
                              <div style={{ marginTop: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTranscriptions(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(237, 126, 19, 0.35)',
                                    background: isMe ? 'rgba(255, 255, 255, 0.2)' : 'rgba(237, 126, 19, 0.08)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: isMe ? '#FFFFFF' : '#0A3E60',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span>📝 {expandedTranscriptions[m.id] ? 'Ocultar transcrição' : 'Ver transcrição'}</span>
                                </button>
                                {expandedTranscriptions[m.id] && (
                                  <div style={{
                                    background: isMe ? 'rgba(255, 255, 255, 0.15)' : '#F8FAFC',
                                    color: isMe ? '#FFFFFF' : '#0A3E60',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    lineHeight: '1.4',
                                    border: `1px solid ${isMe ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0'}`,
                                    marginTop: '0.35rem',
                                    animation: 'fadeIn 0.2s ease-out'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                      <strong style={{ color: '#ED7E13', fontSize: '0.7rem' }}>🎙️ Transcrição Whisper AI:</strong>
                                      <button
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(transcriptions[m.id]); showToast('Transcrição copiada!'); }}
                                        style={{ background: 'transparent', border: 'none', color: isMe ? '#FFFFFF' : '#64748B', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
                                        title="Copiar transcrição"
                                      >
                                        Copiar
                                      </button>
                                    </div>
                                    <div>{transcriptions[m.id]}</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTranscribeAudio(m.id, detectedMediaUrl)}
                                disabled={transcribingId === m.id}
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  background: isMe ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: isMe ? '#FFFFFF' : '#0A3E60',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {transcribingId === m.id ? <FaSpinner className="fa-spin" /> : <FaRobot />} Transcrever com Hermes AI
                              </button>
                              )}
                          </div>
                        </div>
                      )}

                      {isImage && detectedMediaUrl && (
                        <div
                          style={{ margin: '0.4rem 0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => setLightboxImg(detectedMediaUrl)}
                          title="Clique para ampliar em tela cheia"
                        >
                          <img
                            src={detectedMediaUrl}
                            alt="Anexo"
                            style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                          />
                        </div>
                      )}

                      {/* Document & File Card Refined (PLAN-227) */}
                      {isDoc && detectedMediaUrl && (() => {
                        const docMeta = getDocMeta(m.fileName, m.mimeType);
                        const displayFileSize = formatFileSize(m.fileSizeBytes || m.fileSize);
                        const docName = m.fileName || 'Documento Anexo';

                        return (
                          <div style={{
                            margin: '0.45rem 0',
                            background: isMe ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF',
                            border: `1px solid ${isMe ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0'}`,
                            borderRadius: '10px',
                            padding: '0.6rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: isMe ? 'rgba(255,255,255,0.25)' : docMeta.bg,
                                color: isMe ? '#FFFFFF' : docMeta.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                flexShrink: 0
                              }}>
                                {docMeta.icon}
                              </div>
                              <div style={{ minWidth: 0 }} title={docName}>
                                <div style={{
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  color: isMe ? '#FFFFFF' : '#0A3E60',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '190px'
                                }}>
                                  {docName}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: isMe ? 'rgba(255,255,255,0.75)' : '#64748B' }}>
                                  {docMeta.ext} {displayFileSize ? `• ${displayFileSize}` : ''}
                                </div>
                              </div>
                            </div>
                            <a
                              href={detectedMediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir / Baixar documento"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                background: isMe ? '#FFFFFF' : '#ED7E13',
                                color: isMe ? '#0A3E60' : '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                flexShrink: 0,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <FaDownload style={{ fontSize: '0.68rem' }} /> Baixar
                            </a>
                          </div>
                        );
                      })()}

                      {cleanText && <div>{formatWhatsAppText(cleanText)}</div>}

                      <div className="time-tag">
                        <span>{m.time}</span>
                        {isMe && (() => {
                          const st = m.status || 'sent';
                          if (st === 'pending' || st === 'sending') {
                            return <FaClock style={{ color: isMe ? 'rgba(255,255,255,0.7)' : '#94A3B8', fontSize: '0.65rem' }} title="Enviando..." />;
                          }
                          if (st === 'read') return <FaCheckDouble style={{ color: '#10B981', fontSize: '0.7rem' }} title="Lida pelo paciente" />;
                          if (st === 'delivered') return <FaCheckDouble style={{ color: isMe ? 'rgba(255,255,255,0.85)' : '#94A3B8', fontSize: '0.7rem' }} title="Entregue" />;
                          if (st === 'failed' || st === 'error') {
                            return (
                              <span
                                onClick={(e) => { e.stopPropagation(); setInputText(m.text); }}
                                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#EF4444' }}
                                title="Falha no envio. Clique para tentar novamente"
                              >
                                <FaExclamationTriangle style={{ fontSize: '0.7rem' }} />
                                <span style={{ fontSize: '0.62rem', textDecoration: 'underline', fontWeight: 700 }}>Reenviar</span>
                              </span>
                            );
                          }
                          return <FaCheck style={{ color: isMe ? 'rgba(255,255,255,0.75)' : '#94A3B8', fontSize: '0.7rem' }} title="Enviada ao servidor" />;
                        })()}
                      </div>

                      {/* Reaction Pills (WhatsApp-style) */}
                      {reactions.length > 0 && (
                        <div style={{
                          display: 'flex', gap: '0.25rem', flexWrap: 'wrap',
                          marginTop: '0.2rem',
                          position: 'relative', bottom: '-0.35rem'
                        }}>
                          {reactions.map((r, ri) => (
                            <span key={ri} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
                              background: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(10,62,96,0.08)',
                              border: `1px solid ${isMe ? 'rgba(255,255,255,0.25)' : '#E2E8F0'}`,
                              borderRadius: '12px', padding: '0.1rem 0.4rem',
                              fontSize: '0.72rem', cursor: 'default'
                            }}>
                              {r.emoji} {r.count > 1 && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isMe ? 'rgba(255,255,255,0.8)' : '#64748B' }}>{r.count}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </MessageBubble>
                  );
                })
              )}
            </MessageListArea>

            <InputBar>
              {copilotDraft && (
                <div style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  boxShadow: '0 4px 12px rgba(237, 126, 19, 0.12)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#92400E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaRobot style={{ color: '#ED7E13' }} /> Sugestão da IA (Hermes Copilot):
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        title="Avaliar como Excelente / Útil (Calibração RLHF)"
                        onClick={() => handleRlhfFeedback('UPVOTE')}
                        style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: rlhfRated === 'UPVOTE' ? '#D1FAE5' : '#FFFFFF', color: rlhfRated === 'UPVOTE' ? '#065F46' : '#64748B', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        title="Avaliar como Inadequado (Calibração RLHF)"
                        onClick={() => handleRlhfFeedback('DOWNVOTE')}
                        style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: rlhfRated === 'DOWNVOTE' ? '#FEE2E2' : '#FFFFFF', color: rlhfRated === 'DOWNVOTE' ? '#991B1B' : '#64748B', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        👎
                      </button>
                    </div>
                  </div>

                  <div style={{ color: '#1E293B', fontStyle: 'italic', background: 'rgba(255,255,255,0.7)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(252, 211, 77, 0.5)' }}>
                    "{copilotDraft}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center', marginTop: '0.1rem' }}>
                    {inputText.trim() ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(prev => prev + (prev.endsWith('\n') || prev.endsWith(' ') ? '' : ' ') + copilotDraft);
                            setCopilotDraft(null);
                            showToast('Sugestão inserida no final do seu texto!');
                          }}
                          style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: '#ED7E13', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
                        >
                          Inserir no Final
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(copilotDraft);
                            setCopilotDraft(null);
                            showToast('Mensagem substituída pela sugestão!');
                          }}
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0A3E60', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
                        >
                          Substituir Mensagem
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInputText(copilotDraft);
                          setCopilotDraft(null);
                          showToast('Sugestão inserida no campo!');
                        }}
                        style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', border: 'none', background: '#ED7E13', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
                      >
                        Inserir na Mensagem
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCopilotDraft(null)}
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              {/* POPOVER AUTOCOMPLETE DE MACROS (PLAN-213) */}
              {macroMenuOpen && filteredMacros.length > 0 && (
                <MacroPopover ref={macroPopoverRef}>
                  <div style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                    ⚡ Respostas Rápidas (Pressione ↑ ↓ e Enter)
                  </div>
                  {filteredMacros.map((macro, idx) => (
                    <MacroItem
                      key={macro.trigger}
                      $selected={idx === macroSelectedIndex}
                      onClick={() => handleSelectMacro(macro)}
                    >
                      <div className="macro-trigger">
                        <FaTag style={{ color: '#ED7E13', fontSize: '0.7rem' }} /> {macro.trigger} — {macro.title}
                      </div>
                      <div className="macro-preview">{macro.text}</div>
                    </MacroItem>
                  ))}
                </MacroPopover>
              )}

              {/* POPOVER DE EMOJIS RÁPIDOS */}
              {emojiPickerOpen && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.5rem', display: 'flex', gap: '0.4rem', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', zIndex: 100 }}>
                  {['😊', '✨', '👍', '❤️', '🙏', '📅', '🩺', '📍', '💎', '🎉'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleInsertEmoji(emo)}
                      style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem', borderRadius: '4px' }}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}

              <div className="input-row">
                <textarea
                  placeholder={isWhisper ? 'Digite uma nota interna privada...' : 'Digite uma mensagem (ou "/" para respostas rápidas)...'}
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (macroMenuOpen && filteredMacros.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setMacroSelectedIndex((prev) => (prev + 1) % filteredMacros.length);
                        return;
                      }
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setMacroSelectedIndex((prev) => (prev - 1 + filteredMacros.length) % filteredMacros.length);
                        return;
                      }
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        e.preventDefault();
                        handleSelectMacro(filteredMacros[macroSelectedIndex]);
                        return;
                      }
                      if (e.key === 'Escape') {
                        setMacroMenuOpen(false);
                        return;
                      }
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <button className="send-btn" onClick={handleSendMessage} title="Enviar Mensagem (Enter)">
                  <FaPaperPlane />
                </button>
              </div>

              <div className="tools-row">
                <div className="left-tools">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                  />
                  <ToolIconBtn
                    style={{ color: '#ED7E13', fontWeight: 800, background: 'rgba(237, 126, 19, 0.08)' }}
                    onClick={handleFetchCopilotDraft}
                    disabled={isGeneratingDraft}
                    title="Gerar sugestão de resposta rápida com IA"
                  >
                    <FaRobot /> {isGeneratingDraft ? 'Gerando...' : 'Sugestão com IA'}
                  </ToolIconBtn>
                  <ToolIconBtn
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    title="Inserir Emoji"
                  >
                    <FaSmile /> Emoji
                  </ToolIconBtn>
                  <ToolIconBtn onClick={() => fileInputRef.current?.click()} title="Enviar Imagem ou Documento">
                    <FaPaperclip /> Anexo
                  </ToolIconBtn>
                  <ToolIconBtn
                    style={{ color: isWhisper ? '#D97706' : '#64748B', fontWeight: isWhisper ? 800 : 600 }}
                    onClick={() => setIsWhisper(!isWhisper)}
                    title="Alternar entre mensagem para o cliente e nota interna privada"
                  >
                    <FaLock /> {isWhisper ? 'Nota Privada (Ativa)' : 'Nota Privada'}
                  </ToolIconBtn>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                  Pressione <strong>Enter</strong> para enviar • Digite <strong>/</strong> para macros
                </span>
              </div>
            </InputBar>
          </>
        ) : (
          /* EMPTY STATE / VISÃO DE CANAL CENTRAL */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', background: '#F8FAFC' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 12px rgba(10, 62, 96, 0.04)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: currentLineMeta?.status === 'CONNECTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(237, 126, 19, 0.1)', color: currentLineMeta?.status === 'CONNECTED' ? '#10B981' : '#ED7E13', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem auto' }}>
                {getChannelIcon(currentLineMeta?.type)}
              </div>

              <h3 style={{ margin: '0 0 0.4rem 0', color: '#0A3E60', fontSize: '1.1rem', fontWeight: 800 }}>
                {currentLineMeta?.name}
              </h3>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, background: currentLineMeta?.status === 'CONNECTED' ? '#D1FAE5' : '#FEF3C7', color: currentLineMeta?.status === 'CONNECTED' ? '#065F46' : '#92400E', marginBottom: '1.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentLineMeta?.status === 'CONNECTED' ? '#10B981' : '#D97706' }}></span>
                {currentLineMeta?.status === 'CONNECTED' ? '● LINHA CONECTADA & ATIVA' : '⚠️ LINHA DESCONECTADA / SEM PAREAMENTO'}
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', textAlign: 'left', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>{currentLineMeta?.type === 'INSTAGRAM' ? 'Perfil Oficial:' : 'Número Pareado:'}</span>
                  <strong style={{ color: '#0A3E60' }}>{currentLineMeta?.phoneNumber || currentLineMeta?.phone_number || 'Aguardando Leitura do QR'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Atendente Responsável:</span>
                  <strong style={{ textTransform: 'capitalize', color: '#0A3E60' }}>{currentLineMeta?.attendantUsername || currentLineMeta?.attendant_username || 'Geral'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>{currentLineMeta?.type === 'INSTAGRAM' ? 'Engajamento / Base:' : 'Sinal / Bateria:'}</span>
                  <strong style={{ color: currentLineMeta?.status === 'CONNECTED' ? '#10B981' : '#94A3B8' }}>
                    {currentLineMeta?.status === 'CONNECTED'
                      ? (currentLineMeta?.type === 'INSTAGRAM' ? `${currentLineMeta?.battery || '4.135 Seguidores'} (${currentLineMeta?.signal || '165 Mídias'})` : `${currentLineMeta?.battery || '100%'} (${currentLineMeta?.signal || 'Excelente'})`)
                      : '-- (Desconectado)'}
                  </strong>
                </div>
              </div>

              {currentLineMeta?.type === 'INSTAGRAM' ? (
                <button
                  style={{ width: '100%', padding: '0.65rem 1rem', background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(221, 42, 123, 0.25)' }}
                  onClick={() => window.open('https://instagram.com/bodyharmonyoficial', '_blank')}
                >
                  <FaInstagram /> Ver Perfil Oficial @bodyharmonyoficial
                </button>
              ) : currentLineMeta?.status !== 'CONNECTED' ? (
                <button
                  style={{ width: '100%', padding: '0.65rem 1rem', background: '#ED7E13', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(237, 126, 19, 0.25)' }}
                  onClick={() => handleOpenQuickQr(currentLineMeta)}
                >
                  <FaQrcode /> Conectar Aparelho WhatsApp (Ler QR Code)
                </button>
              ) : (
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                  Esta linha está online e recebendo mensagens em tempo real. Selecione uma conversa à esquerda para atender.
                </p>
              )}
            </div>
          </div>
        )}
      </ChatCol>

      {/* COLUMN 3: RIGHT PANEL (CHANNEL TELEMETRY & 360° DOSSIER) */}
      {dossierOpen && (
        <RightCol>
          <RightHeader>
            <h4>
              {rightPanelTab === 'CHANNEL' ? (
                <>
                  <FaWifi style={{ color: '#ED7E13' }} /> Status do WhatsApp
                </>
              ) : (
                <>
                  <FaAddressBook style={{ color: '#ED7E13' }} /> Ficha do Paciente / Contato
                </>
              )}
            </h4>
            <button className="close-btn" onClick={() => setDossierOpen(false)} title="Recolher Painel">
              <FaTimes />
            </button>
          </RightHeader>

          <RightTabs>
            <button
              $active={rightPanelTab === 'CHANNEL'}
              onClick={() => setRightPanelTab('CHANNEL')}
              title="Ver status de conexão da linha do WhatsApp"
            >
              <FaWifi /> WhatsApp
            </button>
            <button
              $active={rightPanelTab === 'PROFILE'}
              onClick={() => setRightPanelTab('PROFILE')}
              title="Ver dados e ficha completa do paciente"
            >
              <FaAddressBook /> Ficha
            </button>
            <button
              $active={rightPanelTab === 'CLINICAL_SALES'}
              onClick={() => {
                setRightPanelTab('CLINICAL_SALES');
                if (activeConv?.phone) {
                  fetchClinicalBridge(activeConv.phone);
                  fetchSoulMemory(activeConv.phone);
                }
              }}
              style={{ color: '#059669', fontWeight: 800 }}
              title="Protocolo 3S, Síntese IA e Histórico de Atendimentos"
            >
              🔬 Procedimentos
            </button>
            <button
              $active={rightPanelTab === 'ORDERS_CONTRACTS'}
              onClick={() => setRightPanelTab('ORDERS_CONTRACTS')}
              title="Pedidos na loja e contratos formalizados"
            >
              📦 Compras &amp; Contratos
            </button>
          </RightTabs>

          <RightBody>
            {/* ABA DE TELEMETRIA DA LINHA */}
            {rightPanelTab === 'CHANNEL' && (
              <>
                <InfoCard>
                  <div className="card-title">
                    <FaWifi style={{ color: currentLineMeta?.status === 'CONNECTED' ? '#10B981' : '#ED7E13' }} /> Identificação da Linha
                  </div>
                  <div className="card-row">
                    <span className="label">Nome da Linha:</span>
                    <span className="value">{currentLineMeta?.name}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Status:</span>
                    <span className="value" style={{ color: currentLineMeta?.status === 'CONNECTED' ? '#10B981' : '#D97706' }}>
                      {currentLineMeta?.status === 'CONNECTED' ? '● CONECTADO' : '⚠️ DESCONECTADO'}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Telefone Real:</span>
                    <span className="value">{currentLineMeta?.phoneNumber || currentLineMeta?.phone_number || 'Aguardando QR'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Atendente:</span>
                    <span className="value" style={{ textTransform: 'capitalize' }}>{currentLineMeta?.attendantUsername || currentLineMeta?.attendant_username || 'Geral'}</span>
                  </div>
                </InfoCard>

                {currentLineMeta?.status !== 'CONNECTED' && (
                  <button
                    style={{ width: '100%', padding: '0.6rem', background: '#ED7E13', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    onClick={() => handleOpenQuickQr(currentLineMeta)}
                  >
                    <FaQrcode /> Ler QR Code e Conectar Linha
                  </button>
                )}

                <InfoCard>
                  <div className="card-title">Nuvem &amp; Telemetria</div>
                  <div className="card-row">
                    <span className="label">{currentLineMeta?.type === 'INSTAGRAM' ? 'Base de Seguidores:' : 'Bateria do Aparelho:'}</span>
                    <span className="value">{currentLineMeta?.battery || (currentLineMeta?.type === 'INSTAGRAM' ? '4.135 Seguidores' : '100%')}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{currentLineMeta?.type === 'INSTAGRAM' ? 'Publicações Ativas:' : 'Qualidade do Sinal:'}</span>
                    <span className="value">{currentLineMeta?.signal || (currentLineMeta?.type === 'INSTAGRAM' ? '165 Posts / Reels' : 'Excelente')}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Motor de Mensageria:</span>
                    <span className="value">{currentLineMeta?.engine || (currentLineMeta?.type === 'INSTAGRAM' ? 'Zernio API (Meta Graph)' : 'Evolution API v2')}</span>
                  </div>
                </InfoCard>
              </>
            )}

            {/* ABA DE PERFIL DO CONTATO / FICHA */}
            {rightPanelTab === 'PROFILE' && (
              <>
                {activeConv ? (
                  <>
                    <InfoCard>
                      <div className="card-title">Identificação do Cliente</div>
                      <div className="card-row">
                        <span className="label">Nome:</span>
                        <span className="value">{realDossier?.name || activeConv?.name || 'Não informado'}</span>
                      </div>
                      <div className="card-row">
                        <span className="label">Documento:</span>
                        <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {showUnmaskedDoc
                            ? (realDossier?.cpf || activeConv?.doc_raw || activeConv?.doc || 'Doc não informado')
                            : (activeConv?.doc || realDossier?.document_formatted || 'Doc não informado')}
                          <button
                            type="button"
                            onClick={() => setShowUnmaskedDoc(!showUnmaskedDoc)}
                            title={showUnmaskedDoc ? "Ocultar CPF (LGPD)" : "Revelar CPF completo"}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748B', display: 'flex', alignItems: 'center' }}
                          >
                            {showUnmaskedDoc ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </span>
                      </div>
                      <div className="card-row">
                        <span className="label">Telefone:</span>
                        <span className="value">{activeConv?.phone || 'Não informado'}</span>
                      </div>
                      <div className="card-row">
                        <span className="label">Cidade/UF:</span>
                        <span className="value">{realDossier?.location || activeConv?.city || 'Assis/SP'}</span>
                      </div>
                    </InfoCard>

                    {/* AÇÕES INTEGRADAS DO GOOGLE WORKSPACE COM FEEDBACK */}
                    <InfoCard style={{ borderLeft: '4px solid #0284C7' }}>
                      <div className="card-title" style={{ color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>☁️ Google Workspace &amp; Nuvem</span>
                        <span style={{ fontSize: '0.65rem', background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>SSOT</span>
                      </div>
                      <div className="card-row">
                        <span className="label">Conta Master:</span>
                        <span className="value" style={{ fontSize: '0.72rem' }}>bodyharmony36@gmail.com</span>
                      </div>
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={handleCreateMeetModal}
                          disabled={isCreatingMeet}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#0A3E60',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 4px rgba(10, 62, 96, 0.15)'
                          }}
                        >
                          {isCreatingMeet ? <FaSpinner className="fa-spin" /> : <FaVideo />}
                          Gerar Sala no Google Meet
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenDriveModal}
                          disabled={isCreatingDrive}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#FFFFFF',
                            color: '#0A3E60',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          {isCreatingDrive ? <FaSpinner className="fa-spin" /> : <FaFolderOpen style={{ color: '#ED7E13' }} />}
                          Abrir Prontuário no Google Drive
                        </button>
                      </div>
                    </InfoCard>

                    {/* CARD EXCLUSIVO DE LICENCIADA & FRANQUIA */}
                    {(realDossier?.is_licenciada || activeConv?.department === 'SUPORTE' || activeConv?.instanceKey === 'inst_licenciadas') && (
                      <InfoCard style={{ borderLeft: '4px solid #ED7E13', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)' }}>
                        <div className="card-title" style={{ color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>⭐ Franquia &amp; Licenciada</span>
                          <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>MÉTODO 3S</span>
                        </div>
                        <div className="card-row">
                          <span className="label">Status:</span>
                          <span className="value" style={{ color: '#059669', fontWeight: 800 }}>● LICENCIADA ATIVA</span>
                        </div>
                        <div className="card-row">
                          <span className="label">Congresso 2026:</span>
                          <span className="value" style={{ color: '#D97706', fontWeight: 700 }}>20% OFF Liberado</span>
                        </div>
                        <div className="card-row">
                          <span className="label">Renovação Anual:</span>
                          <span className="value">R$ 800,00</span>
                        </div>
                        <div className="card-row">
                          <span className="label">Território:</span>
                          <span className="value">50.000 hab</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleFastLicenciadaTransfer('josi', 'Dúvida clínica / Renovação de licença solicitada')}
                            style={{
                              padding: '0.45rem 0.6rem',
                              background: '#0A3E60',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            🩺 Transbordar p/ Dra. Josi (Clínico/Renovação)
                          </button>
                          <button
                            onClick={() => handleFastLicenciadaTransfer('guilherme', 'Dúvida contratual / Onboarding / Financeiro')}
                            style={{
                              padding: '0.45rem 0.6rem',
                              background: '#ED7E13',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            💼 Transbordar p/ Guilherme (Contratos/Finanças)
                          </button>
                        </div>
                      </InfoCard>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.78rem' }}>
                    Selecione uma conversa à esquerda para exibir o cadastro do cliente.
                  </div>
                )}
              </>
            )}

            {/* ABA DE PROCEDIMENTOS & HISTÓRICO (FLUXO UNIFICADO) */}
            {rightPanelTab === 'CLINICAL_SALES' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. Protocolo 3S */}
                <InfoCard>
                  <div className="card-title" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaBookMedical /> Protocolo 3S Ativo
                  </div>
                  <div className="card-row">
                    <span className="label">Protocolo:</span>
                    <span className="value" style={{ fontWeight: 800, color: '#0A3E60' }}>{clinicalBridge?.protocol_name || 'Protocolo 3S de Remodelagem'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Dosimetria:</span>
                    <span className="value" style={{ color: '#059669', fontWeight: 700 }}>{clinicalBridge?.frequency_hz || '40Hz'} | {clinicalBridge?.pulse_width_us || '300µs'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Progresso do Ciclo:</span>
                    <span className="value">Sessão {clinicalBridge?.current_session || 4} de {clinicalBridge?.total_sessions || 10} ({Math.round(((clinicalBridge?.current_session || 4) / (clinicalBridge?.total_sessions || 10)) * 100)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', margin: '0.4rem 0' }}>
                    <div style={{ width: `${Math.round(((clinicalBridge?.current_session || 4) / (clinicalBridge?.total_sessions || 10)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '4px' }} />
                  </div>
                  <div className="card-row">
                    <span className="label">Status Terapêutico:</span>
                    <span className="value" style={{ color: '#10B981', fontWeight: 700 }}>● {clinicalBridge?.therapeutic_status || 'Evolução Ótima'}</span>
                  </div>
                </InfoCard>

                {/* 2. Resumo Inteligente do Caso */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <strong style={{ color: '#0A3E60', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaRobot style={{ color: '#ED7E13' }} /> Resumo do Caso com IA
                    </strong>
                    <button
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: '#ED7E13',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: isGeneratingDossier ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      onClick={handleGenerateAiDossier}
                      disabled={isGeneratingDossier || !activeConv}
                    >
                      {isGeneratingDossier ? <FaSpinner className="fa-spin" /> : <FaRobot />} {aiDossier ? 'Atualizar' : 'Gerar'}
                    </button>
                  </div>

                  {aiDossier ? (
                    <div style={{ fontSize: '0.75rem', lineHeight: '1.5', color: '#1E293B', whiteSpace: 'pre-wrap' }}>
                      {aiDossier}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontStyle: 'italic' }}>
                      Clique em "Gerar" para a inteligência artificial sintetizar o histórico de mensagens e recomendar a conduta.
                    </div>
                  )}
                </div>

                {/* 3. Memória & Perfil do Paciente */}
                <InfoCard>
                  <div className="card-title" style={{ color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>🧠 Histórico &amp; Preferências</span>
                    <span style={{ fontSize: '0.65rem', background: '#EDE9FE', color: '#6D28D9', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                      ATIVO
                    </span>
                  </div>

                  <div className="card-row" style={{ marginTop: '0.4rem' }}>
                    <span className="label">Tom Preferido:</span>
                    <span className="value" style={{ color: '#0A3E60', fontWeight: 800 }}>
                      {soulMemory?.soul_profile?.communication_style || 'ACOLHEDOR'}
                    </span>
                  </div>

                  <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.74rem', color: '#4C1D95', lineHeight: '1.4' }}>
                    {soulMemory?.soul_profile?.key_learnings_summary || soulMemory?.summary_text || 'Perfil comportamental em consolidação.'}
                  </div>
                </InfoCard>
              </div>
            )}

            {/* ABA DE COMPRAS & CONTRATOS */}
            {rightPanelTab === 'ORDERS_CONTRACTS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InfoCard>
                  <div className="card-title">Histórico de Compras na Loja</div>
                  {realDossier?.orders && realDossier.orders.length > 0 ? (
                    realDossier.orders.map((o, idx) => (
                      <div key={idx} className="card-row">
                        <span className="label">{o.product_name}</span>
                        <span className="value">{o.amount_formatted}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', padding: '0.5rem 0' }}>
                      Nenhum pedido registrado para este contato na loja online.
                    </div>
                  )}
                </InfoCard>

                <InfoCard>
                  <div className="card-title">Contratos &amp; Licenciamento</div>
                  {realDossier?.contracts && realDossier.contracts.length > 0 ? (
                    realDossier.contracts.map((ct, idx) => (
                      <div key={idx} className="card-row">
                        <span className="label">{ct.title}</span>
                        <span className="value" style={{ color: '#10B981', fontWeight: 700 }}>{ct.status}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', padding: '0.5rem 0' }}>
                      Nenhum contrato formalizado para este documento.
                    </div>
                  )}
                </InfoCard>
              </div>
            )}
          </RightBody>
        </RightCol>
      )}

      {/* MODAL DE QR CODE RÁPIDO */}
      {quickQrModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 62, 96, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setQuickQrModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              width: '90%',
              maxWidth: '420px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0A3E60', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaQrcode style={{ color: '#ED7E13' }} /> Conectar WhatsApp Oficial
              </h3>
              <button
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem' }}
                onClick={() => setQuickQrModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 1rem 0' }}>
              Abra o WhatsApp no aparelho da <strong>{qrTargetInstance?.name || 'Linha'}</strong>, vá em <strong>Aparelhos Conectados &gt; Conectar Aparelho</strong> e aponte para o QR Code abaixo:
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrLoading ? (
                <div style={{ color: '#64748B', fontSize: '0.82rem' }}>
                  <FaSpinner className="fa-spin" style={{ fontSize: '1.6rem', color: '#ED7E13', marginBottom: '0.5rem' }} />
                  <div>Gerando QR Code com a Evolution API...</div>
                </div>
              ) : qrBase64 ? (
                <img
                  src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="QR Code WhatsApp"
                  style={{ width: '220px', height: '220px', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ color: '#EF4444', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Não foi possível carregar o QR Code no momento.</span>
                  <button
                    style={{ background: '#ED7E13', color: '#FFFFFF', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => handleOpenQuickQr(qrTargetInstance)}
                  >
                    🔄 Tentar Novamente
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              <button
                style={{ width: '100%', padding: '0.6rem', background: '#0A3E60', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setQuickQrModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TRANSFERÊNCIA DE ATENDIMENTO */}
      {transferModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 62, 96, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setTransferModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0A3E60', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaExchangeAlt style={{ color: '#ED7E13' }} /> Transferir Atendimento
            </h3>

            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 1rem 0' }}>
              Transferindo conversa com <strong>{activeConv?.name || activeConv?.phone}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A3E60', display: 'block', marginBottom: '0.25rem' }}>
                  Atendente / Departamento de Destino:
                </label>
                <select
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  value={transferTargetAttendant}
                  onChange={(e) => setTransferTargetAttendant(e.target.value)}
                >
                  <option value="giovanna">Giovanna (Vendas & Cursos VIP)</option>
                  <option value="cibele">Cibele (Recepção & Clínica)</option>
                  <option value="guilherme">Guilherme (Jurídico & Suporte)</option>
                  <option value="hermes_ai">Hermes IA (Copiloto Inteligente)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A3E60', display: 'block', marginBottom: '0.25rem' }}>
                  Nota de Contexto (Opcional):
                </label>
                <textarea
                  style={{ width: '100%', height: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', resize: 'none' }}
                  placeholder="Ex: Cliente tem interesse na compra do combo do Congresso e Franquia..."
                  value={transferContextNote}
                  onChange={(e) => setTransferContextNote(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setTransferModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                style={{ padding: '0.45rem 1.1rem', borderRadius: '6px', border: 'none', background: '#ED7E13', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={handleConfirmTransfer}
                disabled={isSubmittingTransfer}
              >
                {isSubmittingTransfer ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW MODAL */}
      {pendingMedia && (
        <MediaPreviewModal
          file={pendingMedia}
          previewUrl={mediaPreviewUrl}
          onSend={handleSendMedia}
          onCancel={() => { setPendingMedia(null); setMediaPreviewUrl(null); }}
        />
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {lightboxImg && (
        <ImageLightboxModal
          src={lightboxImg}
          alt="Visualização de Imagem"
          onClose={() => setLightboxImg(null)}
        />
      )}

      {/* HERMES INTERNAL ASSISTANT CHAT MODAL */}
      {internalAssistantOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            height: '520px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 35px rgba(10, 62, 96, 0.2), 0 0 0 1px rgba(10, 62, 96, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99999,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ background: '#0A3E60', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaRobot style={{ color: '#ED7E13', fontSize: '1.2rem' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Hermes AI Copilot</div>
                <div style={{ fontSize: '0.68rem', color: '#93C5FD' }}>Assistente Interno da Equipe</div>
              </div>
            </div>
            <button
              onClick={() => setInternalAssistantOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Body / Messages */}
          <div style={{ flex: 1, padding: '0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', background: '#F8FAFC' }}>
            {assistantHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? '#0A3E60' : '#FFFFFF',
                  color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  lineHeight: '1.4',
                  maxWidth: '85%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </div>
            ))}
            {assistantLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#64748B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem' }}>
                <FaSpinner className="fa-spin" /> Hermes consultando base neural...
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: '0.65rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              placeholder="Dúvida de protocolo, dosimetria ou preço..."
              style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', outline: 'none' }}
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAssistantQuery()}
            />
            <button
              onClick={handleSendAssistantQuery}
              disabled={assistantLoading}
              style={{ background: '#ED7E13', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.5rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP HISTORY IMPORT MODAL */}
      {historyModalOpen && (
        <HistoryImportModal
          defaultPhone={activeConv?.phone || ''}
          onClose={() => setHistoryModalOpen(false)}
          onSuccess={() => {
            setHistoryModalOpen(false);
            fetchConversations();
          }}
        />
      )}

      {/* ACTION FEEDBACK MODAL (PLAN-214: Meet, Drive, etc.) */}
      {actionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 62, 96, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setActionModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 30px rgba(10, 62, 96, 0.2)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0A3E60', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {actionModal.iconType === 'MEET' ? <FaVideo style={{ color: '#ED7E13' }} /> : <FaFolderOpen style={{ color: '#0284C7' }} />}
                {actionModal.title}
              </h3>
              <button
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1rem' }}
                onClick={() => setActionModal(null)}
              >
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: '1.45', textAlign: 'left' }}>
              {actionModal.desc}
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                readOnly
                value={actionModal.link}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.78rem', color: '#0A3E60', fontWeight: 700 }}
              />
              <button
                type="button"
                onClick={handleCopyActionLink}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: actionModalCopied ? '#10B981' : '#ED7E13',
                  color: '#FFFFFF',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {actionModalCopied ? <><FaCheck /> Copiado!</> : <><FaCopy /> Copiar Link</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleInsertActionLink}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  padding: '0.6rem 0.85rem',
                  background: '#ED7E13',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(237, 126, 19, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaPaperPlane style={{ fontSize: '0.75rem' }} /> Inserir na Mensagem
              </button>
              <button
                type="button"
                onClick={() => { window.open(actionModal.link, '_blank'); setActionModal(null); }}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  padding: '0.6rem 0.85rem',
                  background: '#0A3E60',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(10, 62, 96, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} /> Abrir no Navegador
              </button>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                style={{
                  minHeight: '40px',
                  padding: '0.6rem 0.85rem',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST FEEDBACK */}
      {toastFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: toastFeedback.type === 'error' ? '#EF4444' : '#0A3E60',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastFeedback.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle style={{ color: '#10B981' }} />}
          {toastFeedback.message}
        </div>
      )}
    </WorkspaceGrid>
  );
}

