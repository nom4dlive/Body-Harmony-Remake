import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Clock, Users, CreditCard, BarChart3, ArrowUpRight,
  ArrowDownRight, Activity, Calendar, RefreshCw, Plus,
  Search, FileText, Smartphone, CheckCircle, Download,
  Paperclip, ExternalLink, Trash2, Edit2, Eye, X, Save,
  Landmark, MessageSquare, ChevronRight, ChevronLeft,
  ShieldCheck, Filter, Megaphone, Server, MoreHorizontal,
  PieChart, ArrowRight, UploadCloud, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { financialApi, licenseTaxesApi, licenciadasApi } from '../../../services/api';
import AdminLayout from '../components/AdminLayout';
import LicenciadaDossierDrawer from '../../../components/LicenciadaDossierDrawer';

// Defensive monetary formatter in BRL (handles cents integer, float, string or null)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  // Financial backend stores values in cents; divide by 100
  const amount = num / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ==========================================
// STYLED COMPONENTS (LUXURY EXECUTIVE DESIGN)
// ==========================================
// ── LAYOUT CONTAINERS ───────────────────────────────────────────────────
const Container = styled.div`
  padding: 0.25rem 0.5rem;
  max-width: 1500px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const HeaderTitles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 0.78rem;
  color: #64748B;
  margin: 0;
  font-weight: 500;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 0.45rem 0.85rem;
  border: none;
  border-radius: 7px;
  font-size: 0.76rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
  white-space: nowrap;

  ${({ $variant }) => {
    if ($variant === 'gold') {
      return `
        background: linear-gradient(135deg, #ED7E13 0%, #D96F0E 100%);
        color: #FFFFFF;
        box-shadow: 0 2px 6px rgba(237, 126, 19, 0.25);
        &:hover { opacity: 0.92; transform: translateY(-1px); }
      `;
    }
    if ($variant === 'navy') {
      return `
        background: #0A3E60;
        color: #FFFFFF;
        box-shadow: 0 2px 6px rgba(10, 62, 96, 0.2);
        &:hover { opacity: 0.92; transform: translateY(-1px); }
      `;
    }
    if ($variant === 'outline') {
      return `
        background: #FFFFFF;
        color: #0A3E60;
        border: 1px solid #CBD5E1;
        &:hover { background: #F8FAFC; border-color: #0A3E60; }
      `;
    }
    return `
      background: #F1F5F9;
      color: #475569;
      &:hover { background: #E2E8F0; }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// TAB NAVIGATION BAR
const TabBar = styled.div`
  display: flex;
  gap: 0.3rem;
  border-bottom: 2px solid #E2E8F0;
  margin-bottom: 0.75rem;
  overflow-x: auto;
  padding-bottom: -2px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
`;

const TabItem = styled.button`
  padding: 0.45rem 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${({ $active }) => $active ? '#ED7E13' : 'transparent'};
  color: ${({ $active }) => $active ? '#0A3E60' : '#64748B'};
  font-weight: ${({ $active }) => $active ? '800' : '600'};
  font-size: 0.78rem;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.15s ease;
  white-space: nowrap;
  margin-bottom: -2px;

  &:hover {
    color: #0A3E60;
  }
`;

// KPI CARDS GRID
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.65rem;
  margin-bottom: 0.85rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const KpiCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.65rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $color }) => $color || '#0A3E60'};
  }

  @media (max-width: 600px) {
    padding: 0.45rem 0.55rem;
    gap: 0.45rem;
    border-radius: 0.5rem;
  }
`;

const KpiIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg || 'rgba(10, 62, 96, 0.08)'};
  color: ${({ $color }) => $color || '#0A3E60'};

  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const KpiContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const KpiLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;

  @media (max-width: 600px) {
    font-size: 0.64rem;
    margin-bottom: 0.15rem;
  }
`;

const KpiValue = styled.div`
  font-size: clamp(0.95rem, 2.2vw, 1.4rem);
  font-weight: 800;
  color: #0A3E60;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const KpiSubtext = styled.div`
  font-size: 0.72rem;
  color: ${({ $color }) => $color || '#64748B'};
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 0.62rem;
    margin-top: 0.18rem;
    gap: 0.15rem;
    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

// ALERTS & PENDENCIES BANNER
const BannerCard = styled.div`
  background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%);
  border: 1px solid #FCD34D;
  border-radius: 0.75rem;
  padding: 0.9rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: #92400E;
  font-weight: 600;

  strong {
    color: #78350F;
  }
`;

// CONTENT SECTIONS
const SectionCard = styled.div`
  background: #FFFFFF;
  border-radius: 0.75rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  margin-bottom: 1.25rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #FAFAFA;
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// FILTERS BAR
const FiltersBar = styled.div`
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F5F9;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.85rem 0.5rem 2.2rem;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  outline: none;
  transition: all 0.15s ease;

  &:focus {
    border-color: #ED7E13;
    box-shadow: 0 0 0 2px rgba(237, 126, 19, 0.15);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  display: flex;
  align-items: center;
`;

const FilterPillsGroup = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  padding: 0.35rem 0.75rem;
  border: 1px solid ${({ $active }) => $active ? '#0A3E60' : '#E2E8F0'};
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  font-family: 'Montserrat', sans-serif;
  background: ${({ $active }) => $active ? '#0A3E60' : '#FFFFFF'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#64748B'};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #0A3E60;
  }
`;

// DATA TABLES
const Table = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 1.1fr 1fr 0.9fr 1.1fr 1.1fr;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #F1F5F9;
  align-items: center;
  font-size: 0.8rem;
  color: #334155;
  transition: background 0.1s ease;

  &:hover {
    background: #F8FAFC;
  }

  ${({ $isHeader }) => $isHeader && `
    background: #F8FAFC;
    font-size: 0.68rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #E2E8F0;
    &:hover { background: #F8FAFC; }
  `}

  @media (max-width: 900px) {
    grid-template-columns: 1fr auto auto;
    grid-template-rows: auto auto auto;
    gap: 0.35rem 0.5rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    margin-bottom: 0.45rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    align-items: center;
    ${({ $isHeader }) => $isHeader && 'display: none;'}

    /* LicenciadaCell na col 1-2, row 1 */
    & > :nth-child(1) {
      grid-column: 1 / 3;
      grid-row: 1;
      min-width: 0;
    }

    /* StatusBadge na col 3, row 1 (alinhado a direita) */
    & > :nth-child(5) {
      grid-column: 3;
      grid-row: 1;
      justify-self: end;
      align-self: center;
    }

    /* Localização (Cidade/UF) na col 1, row 2 */
    & > :nth-child(2) {
      grid-column: 1;
      grid-row: 2;
      font-size: 0.74rem;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &::before {
        content: '📍 ';
      }
    }

    /* Modalidade na col 2, row 2 (meio) */
    & > :nth-child(4) {
      grid-column: 2;
      grid-row: 2;
      justify-self: center;
      margin: 0 0.5rem;
      font-size: 0.64rem;
      font-weight: 700;
      color: #475569;
      background: #F1F5F9;
      padding: 0.08rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    /* Valor + Condição na col 3, row 2 (alinhado a direita) */
    & > :nth-child(3) {
      grid-column: 3;
      grid-row: 2;
      justify-self: end;
      text-align: right;
      font-size: 0.78rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    /* Actions na col 1/3, row 3 */
    & > :nth-child(6) {
      grid-column: 1 / 4;
      grid-row: 3;
      display: flex;
      justify-content: flex-end;
      padding-top: 0.35rem;
      border-top: 1px solid #F1F5F9;
      margin-top: 0.15rem;
      width: 100%;
    }
  }
`;

const LicenciadaCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(237, 126, 19, 0.5);
  flex-shrink: 0;
  background: #F1F5F9;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #0A3E60;
  flex-shrink: 0;
`;

const LicenciadaInfo = styled.div`
  min-width: 0;
  line-height: 1.3;
`;

const LicenciadaName = styled.div`
  font-weight: 700;
  color: #0A3E60;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LicenciadaDoc = styled.div`
  font-size: 0.7rem;
  color: #94A3B8;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;

  ${({ $status }) => {
    switch ($status) {
      case 'contract_signed':
        return 'background: rgba(10, 62, 96, 0.1); color: #0A3E60; border: 1px solid rgba(10, 62, 96, 0.2);';
      case 'paid':
        return 'background: rgba(40, 167, 69, 0.1); color: #28a745; border: 1px solid rgba(40, 167, 69, 0.2);';
      case 'pending_payment':
        return 'background: rgba(237, 126, 19, 0.1); color: #ED7E13; border: 1px solid rgba(237, 126, 19, 0.2);';
      case 'cancelled':
        return 'background: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.2);';
      default:
        return 'background: #F1F5F9; color: #64748B;';
    }
  }}
`;

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  color: ${({ $color }) => $color || '#64748B'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: currentColor;
    background: #F8FAFC;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// ── FILTROS TEMPORAIS / PERÍODO (PLAN-152) ──────────────────────────────
const DateFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  background: #FFFFFF;
  padding: 0.5rem 0.75rem;
  border-radius: 0.65rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  @media (max-width: 600px) {
    padding: 0.4rem 0.5rem;
    gap: 0.35rem;
  }
`;

const DateRangeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${({ $active }) => ($active ? '#0A3E60' : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#0A3E60' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : '#475569')};

  &:hover {
    border-color: #0A3E60;
    color: ${({ $active }) => ($active ? '#FFFFFF' : '#0A3E60')};
  }

  @media (max-width: 600px) {
    font-size: 0.68rem;
    padding: 0.28rem 0.5rem;
  }
`;

const CustomDateInput = styled.input`
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  font-size: 0.74rem;
  color: #0A3E60;
  outline: none;

  &:focus {
    border-color: #0A3E60;
    box-shadow: 0 0 0 2px rgba(10, 62, 96, 0.1);
  }
`;

// MODAL OVERLAY
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 62, 96, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 0.85rem;
  width: 100%;
  max-width: ${({ $width }) => $width || '580px'};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalBody = styled.div`
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Input = styled.input`
  padding: 0.6rem 0.85rem;
  border: 1px solid #CBD5E1;
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;

  &:focus {
    border-color: #ED7E13;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.6rem 0.85rem;
  border: 1px solid #CBD5E1;
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  background: #FFFFFF;

  &:focus {
    border-color: #ED7E13;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 0.6rem 0.85rem;
  border: 1px solid #CBD5E1;
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: 'Montserrat', sans-serif;
  color: #1E293B;
  min-height: 80px;
  resize: vertical;

  &:focus {
    border-color: #ED7E13;
    outline: none;
  }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.4rem;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  background: #F8FAFC;
`;

// ── TDAH-FRIENDLY VISUAL CHIPS BAR ──────────────────────────────────────
const ChipsBar = styled.div`
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.4rem 0.1rem;
  margin-bottom: 0.75rem;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
`;

const ChipButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  min-height: 36px;
  border: 1.5px solid ${({ $active, $color }) => $active ? ($color || '#0A3E60') : '#E2E8F0'};
  background: ${({ $active, $color }) => $active ? ($color || '#0A3E60') : '#FFFFFF'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#475569'};
  box-shadow: ${({ $active }) => $active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    border-color: ${({ $color }) => $color || '#0A3E60'};
    transform: translateY(-1px);
  }
`;

// ── 3-STEP EXPENSE WIZARD ───────────────────────────────────────────────
const StepWizardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.4rem;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $active, $done }) => $active ? '#ED7E13' : ($done ? '#059669' : '#94A3B8')};
`;

const StepNumber = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  background: ${({ $active, $done }) => $active ? '#ED7E13' : ($done ? '#059669' : '#E2E8F0')};
  color: #FFFFFF;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-top: 0.5rem;
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.85rem 0.5rem;
  border-radius: 8px;
  border: 2px solid ${({ $active, $color }) => $active ? ($color || '#ED7E13') : '#E2E8F0'};
  background: ${({ $active, $color }) => $active ? `${$color || '#ED7E13'}12` : '#FFFFFF'};
  color: ${({ $active, $color }) => $active ? ($color || '#ED7E13') : '#475569'};
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 75px;

  &:hover {
    border-color: ${({ $color }) => $color || '#ED7E13'};
    transform: translateY(-2px);
  }
`;

// ── DRE EXPANDED METRICS & PROGRESS ─────────────────────────────────────
const DreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DreCard = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #F1F5F9;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.4rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $color }) => $color || '#0A3E60'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

// ==========================================
// MAIN COMPONENT (FINANCIAL COCKPIT HUB)
// ==========================================

export default function FinanceiroDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlTab = searchParams.get('tab');
  const getInitialTab = () => {
    if (initialUrlTab === 'taxas' || initialUrlTab === 'taxes') return 'taxes';
    if (initialUrlTab === 'comprovantes' || initialUrlTab === 'attachments') return 'attachments';
    if (initialUrlTab === 'dre') return 'dre';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Sync tab when searchParams change externally (e.g. navigation / redirect)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if ((tab === 'taxas' || tab === 'taxes') && activeTab !== 'taxes') {
      setActiveTab('taxes');
    } else if (tab && tab !== activeTab && ['overview', 'taxes', 'attachments', 'dre'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    const urlTab = tabKey === 'taxes' ? 'taxas' : (tabKey === 'attachments' ? 'comprovantes' : tabKey);
    setSearchParams({ tab: urlTab });
  };

  // Data states
  const [taxesData, setTaxesData] = useState([]);
  const [summary, setSummary] = useState({
    total_contracted_cents: 0,
    total_formatted: 'R$ 0,00',
    total_signed: 0,
    total_paid: 0,
    total_pending: 0,
    total_cancelled: 0,
    average_ticket_formatted: 'R$ 0,00'
  });

  const [transactions, setTransactions] = useState([]);
  const [attachmentsList, setAttachmentsList] = useState([]);
  const [licenciadasList, setLicenciadasList] = useState([]);

  // Filter states for Taxes tab
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('all');

  // Dossier 360 states (PLAN-142)
  const [dossierLicenciadaId, setDossierLicenciadaId] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const openDossier = (licenciadaId) => {
    if (licenciadaId) {
      setDossierLicenciadaId(licenciadaId);
      setIsDossierOpen(true);
    }
  };

  // Modals state
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickEntryModalOpen, setIsQuickEntryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [selectedTax, setSelectedTax] = useState(null);
  const [whatsAppData, setWhatsAppData] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTargetTaxId, setUploadTargetTaxId] = useState(null);

  // ── EXPENSE WIZARD STATE (PLAN-141) ─────────────────────────────────────
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseStep, setExpenseStep] = useState(1);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount_raw: '',
    amount_cents: 0,
    description: '',
    category: 'marketing',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'pix',
    supplier_name: '',
    notes: '',
    attachment_id: null
  });
  const [expenseFile, setExpenseFile] = useState(null);
  const [expenseCategories] = useState([
    { key: 'marketing', label: 'Marketing & Tráfego', icon: 'Megaphone', color: '#ED7E13' },
    { key: 'infraestrutura', label: 'Infraestrutura & Software', icon: 'Server', color: '#0A3E60' },
    { key: 'eventos', label: 'Eventos & Congressos', icon: 'Calendar', color: '#8B5CF6' },
    { key: 'operacional', label: 'Operacional & Clínica', icon: 'Activity', color: '#10B981' },
    { key: 'juridico_contabil', label: 'Jurídico & Contábil', icon: 'ShieldCheck', color: '#3B82F6' },
    { key: 'pessoal', label: 'Pró-Labore & Equipe', icon: 'Users', color: '#EC4899' },
    { key: 'outros', label: 'Outras Despesas', icon: 'MoreHorizontal', color: '#64748B' }
  ]);

  // ── DRE EXPANDED STATE (PLAN-141) ───────────────────────────────────────
  const [dreData, setDreData] = useState(null);
  const [dreLoading, setDreLoading] = useState(false);

  // ── DATE PERIOD FILTER STATE (PLAN-152) ──────────────────────────────────
  const [dateRangeType, setDateRangeType] = useState('all'); // all | this_month | last_month | current_year | custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [isLegalSummaryOpen, setIsLegalSummaryOpen] = useState(false);

  const handleDateRangeSelect = (type) => {
    setDateRangeType(type);
    if (type === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (type === 'this_month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (type === 'last_month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (type === 'current_year') {
      const year = new Date().getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  };

  // Form states for Create/Edit Tax
  const [taxForm, setTaxForm] = useState({
    licenciada_id: '',
    licenciada_name: '',
    licenciada_cpf: '',
    licenciada_cnpj: '',
    licenciada_location: '',
    valor_cents: 700000,
    payment_method: 'pix',
    payment_condition: 'à vista',
    installments: 1,
    status: 'pending_payment',
    notes: ''
  });

  // Form states for Quick Financial Entry
  const [entryForm, setEntryForm] = useState({
    type: 'revenue', // revenue | expense
    category: 'licenciamento',
    description: '',
    amount_cents: 0,
    payment_method: 'pix',
    tax_tag: 'nao_definido',
    notes: ''
  });

  // Load all data
  const loadData = useCallback(async (autoSyncIfEmpty = false) => {
    try {
      setLoading(true);
      const filterParams = {
        search,
        status: statusFilter,
        method: methodFilter,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        per_page: 50
      };
      const [taxRes, licRes, view360Res] = await Promise.all([
        licenseTaxesApi.list(filterParams).catch(() => null),
        licenciadasApi.list().catch(() => ({ data: [] })),
        licenciadasApi.getView360(filterParams).catch(() => null)
      ]);

      if (view360Res && view360Res.data && Array.isArray(view360Res.data) && view360Res.data.length > 0) {
        // Map 360 unified items to tax table format
        const mapped360 = view360Res.data.map(item => ({
          id: item.tax_id || item.unified_key,
          licenciada_id: item.licenciada_id,
          licenciada_name: item.nome_oficial,
          licenciada_cpf: item.documento_cpf,
          licenciada_cnpj: item.documento_cnpj,
          licenciada_location: item.localizacao,
          photo_url: item.photo_url || item.foto_url || item.profile_photo || null,
          profile_photo: item.profile_photo || item.photo_url || item.foto_url || null,
          valor_cents: item.valor_taxa_cents,
          valor_display: item.valor_taxa_formatado,
          payment_method: item.forma_pagamento,
          payment_condition: item.condicao_pagamento,
          installments: item.parcelas,
          status: item.status_financeiro || (item.status_unificado === 'REGULAR_ASSINADO' ? 'contract_signed' : (item.status_unificado === 'QUITADO_PENDENTE_CONTRATO' ? 'paid' : 'pending_payment')),
          contract_uuid: item.contract_uuid,
          onboarding_request_id: item.onboarding_request_id,
          is_locked: item.is_locked,
          created_at: item.data_entrada
        }));
        setTaxesData(mapped360);

        if (view360Res.summary) {
          setSummary(prev => ({
            ...prev,
            total_records: view360Res.summary.total_registros ?? prev.total_records,
            total_contracted_cents: view360Res.summary.total_contratado_cents ?? prev.total_contracted_cents,
            total_formatted: view360Res.summary.total_contratado_formatted ?? prev.total_formatted,
            total_received_cents: view360Res.summary.total_recebido_cents ?? prev.total_received_cents,
            total_received_formatted: view360Res.summary.total_recebido_formatted ?? prev.total_received_formatted,
            total_received_count: view360Res.summary.total_recebido_count ?? prev.total_received_count,
            total_pending: view360Res.summary.total_pendencias_count ?? prev.total_pending,
            total_signed: view360Res.summary.total_signed ?? prev.total_signed,
            average_ticket_cents: view360Res.summary.ticket_medio_cents ?? prev.average_ticket_cents,
            average_ticket_formatted: view360Res.summary.ticket_medio_formatted ?? prev.average_ticket_formatted,
            signed_percentage: view360Res.summary.percentual_assinados ?? prev.signed_percentage,
            pending_names_preview: view360Res.summary.pending_names_preview ?? prev.pending_names_preview
          }));
        }
      } else if (taxRes && taxRes.data) {
        setTaxesData(taxRes.data.data || []);
        if (taxRes.data.summary) {
          setSummary(taxRes.data.summary);
        }

        // If no records in production yet and autoSyncIfEmpty is true, auto-sync
        if ((!taxRes.data.data || taxRes.data.data.length === 0) && autoSyncIfEmpty) {
          await licenseTaxesApi.syncAll();
          const refreshed = await licenseTaxesApi.list({ per_page: 50 });
          setTaxesData(refreshed.data.data || []);
          if (refreshed.data.summary) setSummary(refreshed.data.summary);
        }
      }

      if (licRes && licRes.data) {
        setLicenciadasList(licRes.data.data || licRes.data || []);
      }
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, methodFilter, startDate, endDate]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Sync All Handler
  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const res = await licenseTaxesApi.syncAll();
      setFeedbackMsg('✓ Dados históricos e contratos sincronizados com sucesso!');
      await loadData(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg('❌ Erro na sincronização.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      const res = await licenseTaxesApi.exportReport({ status: statusFilter, method: methodFilter, search });
      if (res && res.data && res.data.csv_content) {
        const blob = new Blob([res.data.csv_content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.data.filename || 'relatorio_financeiro.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao exportar:', err);
    }
  };

  // Open WhatsApp Receipt Modal
  const handleOpenWhatsApp = async (tax) => {
    try {
      setSelectedTax(tax);
      const res = await licenseTaxesApi.getWhatsAppReceipt(tax.id);
      if (res && res.data) {
        setWhatsAppData(res.data);
        setIsWhatsAppModalOpen(true);
      }
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao gerar recibo WhatsApp:', err);
    }
  };

  // Open Upload Modal
  const handleOpenUpload = (tax) => {
    setSelectedTax(tax);
    setUploadTargetTaxId(tax.id);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('parent_type', 'license_tax');
      formData.append('parent_id', uploadTargetTaxId);

      await licenseTaxesApi.uploadAttachment(formData);
      setFeedbackMsg('✓ Comprovante anexado com sucesso!');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      await loadData(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao fazer upload:', err);
      setFeedbackMsg('❌ Erro ao enviar anexo.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Save Tax Handler
  const handleSaveTax = async (e) => {
    e.preventDefault();
    try {
      if (selectedTax) {
        await licenseTaxesApi.update(selectedTax.id, taxForm);
        setFeedbackMsg('✓ Taxa atualizada com sucesso!');
      } else {
        await licenseTaxesApi.create(taxForm);
        setFeedbackMsg('✓ Nova taxa registrada com sucesso!');
      }
      setIsTaxModalOpen(false);
      setSelectedTax(null);
      await loadData(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao salvar taxa:', err);
    }
  };

  // ── DRE EXPANDED LOADER (PLAN-141) ──────────────────────────────────────
  const loadDreData = useCallback(async () => {
    try {
      setDreLoading(true);
      const res = await financialApi.getDreExpanded();
      if (res && res.data) {
        setDreData(res.data);
      }
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao carregar DRE Expandido:', err);
    } finally {
      setDreLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dre') {
      loadDreData();
    }
  }, [activeTab, loadDreData]);

  // ── EXPENSE WIZARD HANDLERS (PLAN-141) ──────────────────────────────────
  const handleOpenNewExpense = () => {
    setExpenseStep(1);
    setExpenseForm({
      amount_raw: '',
      amount_cents: 0,
      description: '',
      category: 'marketing',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
      supplier_name: '',
      notes: '',
      attachment_id: null
    });
    setExpenseFile(null);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e) => {
    if (e) e.preventDefault();
    try {
      setExpenseSaving(true);
      let uploadedAttachId = null;

      // If file attached, upload first
      if (expenseFile) {
        const formData = new FormData();
        formData.append('parent_type', 'transaction');
        formData.append('parent_id', '0');
        formData.append('file', expenseFile);
        try {
          const attachRes = await licenseTaxesApi.uploadAttachment(formData);
          if (attachRes && attachRes.data && attachRes.data.id) {
            uploadedAttachId = attachRes.data.id;
          }
        } catch (uploadErr) {
          console.warn('[FinanceiroDashboard] Erro ao subir anexo de despesa:', uploadErr);
        }
      }

      const payload = {
        amount_cents: expenseForm.amount_cents,
        description: expenseForm.description,
        category: expenseForm.category,
        expense_date: expenseForm.expense_date,
        payment_method: expenseForm.payment_method,
        supplier_name: expenseForm.supplier_name,
        notes: expenseForm.notes,
        attachment_id: uploadedAttachId
      };

      await financialApi.createExpense(payload);
      setFeedbackMsg('✓ Despesa operacional lançada com sucesso!');
      setIsExpenseModalOpen(false);
      await loadData(false);
      if (activeTab === 'dre') await loadDreData();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('[FinanceiroDashboard] Erro ao lançar despesa:', err);
      alert(err.message || 'Erro ao lançar despesa.');
    } finally {
      setExpenseSaving(false);
    }
  };

  // ── TDAH-FRIENDLY FILTER CHIPS HANDLER ──────────────────────────────────
  const handleFilterChipClick = (chipKey) => {
    setActiveFilterChip(chipKey);
    if (chipKey === 'all') {
      setStatusFilter('');
      setMethodFilter('');
      setSearch('');
    } else if (chipKey === 'regularized' || chipKey === 'signed') {
      setStatusFilter('contract_signed');
      setMethodFilter('');
    } else if (chipKey === 'pending_contract' || chipKey === 'paid') {
      setStatusFilter('paid');
      setMethodFilter('');
    } else if (chipKey === 'pending_receipt' || chipKey === 'pending') {
      setStatusFilter('pending_payment');
      setMethodFilter('');
    } else if (chipKey === 'pix') {
      setStatusFilter('');
      setMethodFilter('pix');
    } else if (chipKey === 'card') {
      setStatusFilter('');
      setMethodFilter('card');
    }
  };

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return 'BH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AdminLayout>
      <Container>
        {/* PAGE HEADER */}
        <PageHeader>
          <HeaderTitles>
            <Title>
              <DollarSign style={{ color: '#ED7E13' }} /> Painel Financeiro Body Harmony®
            </Title>
            <Subtitle>
              Cockpit Executivo de Finanças, Contratos, Lançamentos e Recibos da Josi
            </Subtitle>
          </HeaderTitles>

          <HeaderActions>
            <ActionBtn $variant="outline" onClick={handleExportCsv}>
              <Download size={15} /> Exportar CSV
            </ActionBtn>
            <ActionBtn $variant="navy" onClick={handleSyncAll} disabled={syncing}>
              <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : '⚡ Sincronizar Histórico'}
            </ActionBtn>
            <ActionBtn
              $variant="outline"
              style={{ borderColor: '#EF4444', color: '#DC2626', fontWeight: 700 }}
              onClick={handleOpenNewExpense}
            >
              <TrendingDown size={15} color="#DC2626" /> + Nova Despesa
            </ActionBtn>
            <ActionBtn
              $variant="gold"
              onClick={() => {
                setSelectedTax(null);
                setTaxForm({
                  licenciada_id: '',
                  licenciada_name: '',
                  licenciada_cpf: '',
                  licenciada_cnpj: '',
                  licenciada_location: '',
                  valor_cents: 700000,
                  payment_method: 'pix',
                  payment_condition: 'à vista',
                  installments: 1,
                  status: 'pending_payment',
                  notes: ''
                });
                setIsTaxModalOpen(true);
              }}
            >
              <Plus size={15} /> + Nova Taxa
            </ActionBtn>
          </HeaderActions>
        </PageHeader>

        {/* FEEDBACK TOAST */}
        {feedbackMsg && (
          <BannerCard style={{ background: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}>
            <BannerContent style={{ color: '#065F46' }}>
              <CheckCircle size={18} color="#059669" />
              <span>{feedbackMsg}</span>
            </BannerContent>
          </BannerCard>
        )}

        {/* LUXURY TAB NAVIGATION */}
        <TabBar>
          <TabItem $active={activeTab === 'overview'} onClick={() => handleTabSelect('overview')}>
            <BarChart3 size={16} /> Visão Geral & Cockpit da Josi
          </TabItem>
          <TabItem $active={activeTab === 'taxes'} onClick={() => handleTabSelect('taxes')}>
            <FileText size={16} /> Taxas & Contratos de Licenciadas ({taxesData.length})
          </TabItem>
          <TabItem $active={activeTab === 'attachments'} onClick={() => handleTabSelect('attachments')}>
            <Paperclip size={16} /> Comprovantes & Documentos
          </TabItem>
          <TabItem $active={activeTab === 'dre'} onClick={() => handleTabSelect('dre')}>
            <Landmark size={16} /> DRE & Fechamento Contábil
          </TabItem>
        </TabBar>

        {/* FILTROS TEMPORAIS / PERÍODO (PLAN-152) */}
        <DateFilterBar>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem' }}>
            <Calendar size={14} color="#0A3E60" /> Período:
          </span>
          <DateRangeBtn $active={dateRangeType === 'all'} onClick={() => handleDateRangeSelect('all')}>
            💎 Todo o Histórico
          </DateRangeBtn>
          <DateRangeBtn $active={dateRangeType === 'this_month'} onClick={() => handleDateRangeSelect('this_month')}>
            📅 Este Mês
          </DateRangeBtn>
          <DateRangeBtn $active={dateRangeType === 'last_month'} onClick={() => handleDateRangeSelect('last_month')}>
            🗓️ Mês Anterior
          </DateRangeBtn>
          <DateRangeBtn $active={dateRangeType === 'current_year'} onClick={() => handleDateRangeSelect('current_year')}>
            🎯 Ano Vigente (2026)
          </DateRangeBtn>
          <DateRangeBtn $active={dateRangeType === 'custom'} onClick={() => handleDateRangeSelect('custom')}>
            🔍 Personalizado
          </DateRangeBtn>

          {dateRangeType === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.25rem' }}>
              <CustomDateInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data inicial"
              />
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>até</span>
              <CustomDateInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data final"
              />
            </div>
          )}
        </DateFilterBar>

        {/* TDAH-FRIENDLY VISUAL CHIPS BAR (1-CLIQUE) */}
        <ChipsBar>
          <ChipButton $active={activeFilterChip === 'all'} $color="#0A3E60" onClick={() => handleFilterChipClick('all')}>
            💎 Todas ({summary.total_records ?? taxesData.length})
          </ChipButton>
          <ChipButton $active={activeFilterChip === 'regularized'} $color="#10B981" onClick={() => handleFilterChipClick('regularized')}>
            🟢 100% Regularizadas ({summary.total_regularized ?? summary.total_signed ?? 0})
          </ChipButton>
          <ChipButton $active={activeFilterChip === 'pending_contract'} $color="#ED7E13" onClick={() => handleFilterChipClick('pending_contract')}>
            🟡 Aguardando Contrato ({summary.total_pending_contract ?? summary.total_pending ?? 0})
          </ChipButton>
          <ChipButton $active={activeFilterChip === 'pending_receipt'} $color="#8B5CF6" onClick={() => handleFilterChipClick('pending_receipt')}>
            🧾 Aguardando Comprovante ({summary.total_pending_receipt ?? 0})
          </ChipButton>
          <ChipButton $active={activeFilterChip === 'pix'} $color="#0A3E60" onClick={() => handleFilterChipClick('pix')}>
            ⚡ PIX ({summary.by_method?.pix?.count ?? 0})
          </ChipButton>
          <ChipButton $active={activeFilterChip === 'card'} $color="#2563EB" onClick={() => handleFilterChipClick('card')}>
            💳 Cartão ({summary.by_method?.card?.count ?? 0})
          </ChipButton>
        </ChipsBar>

        {/* TAB 1: VISÃO GERAL & COCKPIT DA JOSI */}
        {activeTab === 'overview' && (
          <>
            {/* KPI CARDS GRID */}
            <KpiGrid>
              <KpiCard $color="#0A3E60">
                <KpiIcon $bg="rgba(10, 62, 96, 0.12)" $color="#0A3E60">
                  <DollarSign size={22} />
                </KpiIcon>
                <KpiContent>
                  <KpiLabel>Total Confirmado (Mapeado)</KpiLabel>
                  <KpiValue>{summary.total_formatted || 'R$ 0,00'}</KpiValue>
                  <KpiSubtext $color="#0A3E60">
                    <ShieldCheck size={13} /> {summary.total_signed ?? 0} taxas confirmadas
                  </KpiSubtext>
                </KpiContent>
              </KpiCard>

              <KpiCard $color="#28a745">
                <KpiIcon $bg="rgba(40, 167, 69, 0.12)" $color="#28a745">
                  <TrendingUp size={22} />
                </KpiIcon>
                <KpiContent>
                  <KpiLabel>Recebido em Caixa</KpiLabel>
                  <KpiValue>{summary.total_received_formatted || formatCurrency(summary.total_received_cents || 0)}</KpiValue>
                  <KpiSubtext $color="#28a745">
                    <CheckCircle size={13} /> {summary.total_received_count ?? 0} taxas quitadas
                  </KpiSubtext>
                </KpiContent>
              </KpiCard>

              <KpiCard $color="#ED7E13">
                <KpiIcon $bg="rgba(237, 126, 19, 0.12)" $color="#ED7E13">
                  <Clock size={22} />
                </KpiIcon>
                <KpiContent>
                  <KpiLabel>Em Levantamento Documental</KpiLabel>
                  <KpiValue>{summary.in_document_survey ?? summary.total_pending_contract ?? summary.total_pending ?? 0}</KpiValue>
                  <KpiSubtext $color="#ED7E13">
                    <AlertTriangle size={13} /> Licenciadas em saneamento
                  </KpiSubtext>
                </KpiContent>
              </KpiCard>

              <KpiCard $color="#10B981">
                <KpiIcon $bg="rgba(16, 185, 129, 0.12)" $color="#10B981">
                  <Activity size={22} />
                </KpiIcon>
                <KpiContent>
                  <KpiLabel>Taxa de Regularidade</KpiLabel>
                  <KpiValue>{summary.regularity_percentage ?? 0}%</KpiValue>
                  <KpiSubtext $color="#10B981">
                    <CheckCircle size={13} /> {summary.total_regularized ?? 0} de {summary.total_records ?? 104} regularizadas
                  </KpiSubtext>
                </KpiContent>
              </KpiCard>
            </KpiGrid>

            {/* PENDENCY BANNER DINÂMICO */}
            {(summary.total_pending > 0 || summary.total_paid > 0) && (
              <BannerCard>
                <BannerContent>
                  <AlertTriangle size={20} color="#D97706" />
                  <div>
                    <strong>Atenção Jurídica & Financeira:</strong>
                    {summary.total_pending > 0 && (
                      <span> Existem <strong>{summary.total_pending} licenciada(s)</strong> com pendência documental ou valor em aberto ({summary.pending_names_preview || 'consulte a tabela de taxas'}).</span>
                    )}
                    {summary.total_paid > 0 && (
                      <span> <strong>{summary.total_paid} licenciada(s)</strong> com taxa quitada em caixa aguardando assinatura formal de contrato.</span>
                    )}
                  </div>
                </BannerContent>
                <ActionBtn
                  $variant="navy"
                  onClick={() => {
                    setActiveTab('taxes');
                    setStatusFilter('pending_payment');
                  }}
                >
                  Ver Pendências <ChevronRight size={14} />
                </ActionBtn>
              </BannerCard>
            )}

            {/* RESUMO DE MÉTODOS DE PAGAMENTO E DISTRIBUIÇÃO (ACCORDIONS COMPACTOS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <SectionCard>
                <SectionHeader
                  style={{ cursor: 'pointer', padding: '0.65rem 0.85rem' }}
                  onClick={() => setIsPaymentMethodOpen(!isPaymentMethodOpen)}
                >
                  <SectionTitle style={{ fontSize: '0.85rem' }}>
                    <CreditCard size={15} color="#ED7E13" /> Formas de Pagamento Registradas
                  </SectionTitle>
                  <IconButton
                    as="div"
                    style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                  >
                    {isPaymentMethodOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </SectionHeader>
                {isPaymentMethodOpen && (
                  <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                    {summary.by_method_breakdown && summary.by_method_breakdown.length > 0 ? (
                      summary.by_method_breakdown.map((item, idx) => {
                        const icon = item.key === 'pix' ? <Smartphone size={15} color="#8B5CF6" /> :
                                     item.key === 'card' ? <CreditCard size={15} color="#2563EB" /> :
                                     item.key === 'transfer' ? <Landmark size={15} color="#059669" /> :
                                     <DollarSign size={15} color="#ED7E13" />;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: idx < summary.by_method_breakdown.length - 1 ? '1px solid #F1F5F9' : 'none', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: 600, color: '#0A3E60', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              {icon} {item.label}
                            </span>
                            <strong style={{ color: '#0A3E60' }}>{item.count} Licenciada{item.count !== 1 ? 's' : ''} ({item.total_formatted})</strong>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: '#0A3E60', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Smartphone size={15} color="#ED7E13" /> PIX
                          </span>
                          <strong style={{ color: '#0A3E60' }}>{summary.by_method?.pix?.count ?? 0} Licenciadas</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: '#0A3E60', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <CreditCard size={15} color="#2563EB" /> Cartão de Crédito
                          </span>
                          <strong style={{ color: '#0A3E60' }}>{summary.by_method?.card?.count ?? 0} Licenciadas</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: '#0A3E60', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Landmark size={15} color="#059669" /> Transferência Bancária
                          </span>
                          <strong style={{ color: '#0A3E60' }}>{summary.by_method?.transfer?.count ?? 0} Licenciadas</strong>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <SectionHeader
                  style={{ cursor: 'pointer', padding: '0.65rem 0.85rem' }}
                  onClick={() => setIsLegalSummaryOpen(!isLegalSummaryOpen)}
                >
                  <SectionTitle style={{ fontSize: '0.85rem' }}>
                    <ShieldCheck size={15} color="#0A3E60" /> Panorama Jurídico dos Contratos
                  </SectionTitle>
                  <IconButton
                    as="div"
                    style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                  >
                    {isLegalSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </SectionHeader>
                {isLegalSummaryOpen && (
                  <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Contratos Digitais Assinados</span>
                      <span style={{ fontWeight: 800, color: '#0A3E60' }}>
                        {summary.total_signed ?? 0} de {summary.total_records ?? 0} ({summary.signed_percentage ?? 0}%)
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Taxas de Licenciamento Cadastradas</span>
                      <span style={{ fontWeight: 800, color: '#ED7E13' }}>
                        {summary.total_records ?? 0} Unidades
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Regularidade Financeira Geral</span>
                      <span style={{ fontWeight: 800, color: summary.total_pending === 0 ? '#10B981' : '#ED7E13' }}>
                        {summary.total_records > 0 ? Math.round(((summary.total_received_count || summary.total_signed || 0) / summary.total_records) * 100) : 0}% Regular
                      </span>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          </>
        )}

        {/* TAB 2: TAXAS & CONTRATOS DE LICENCIADAS */}
        {(activeTab === 'taxes' || activeTab === 'overview') && (
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <FileText size={17} /> Relatório de Taxas Iniciais & Contratos ({taxesData.length})
              </SectionTitle>
              {activeTab === 'overview' && (
                <ActionBtn $variant="outline" onClick={() => setActiveTab('taxes')}>
                  Ver Tabela Expandida <ChevronRight size={14} />
                </ActionBtn>
              )}
            </SectionHeader>

            {/* FILTERS */}
            <FiltersBar>
              <SearchInputWrapper>
                <SearchIconWrapper>
                  <Search size={15} />
                </SearchIconWrapper>
                <SearchInput
                  placeholder="Buscar por Licenciada, CPF, Cidade ou UF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchInputWrapper>

              <FilterPillsGroup>
                <FilterPill $active={statusFilter === ''} onClick={() => setStatusFilter('')}>
                  Todas
                </FilterPill>
                <FilterPill $active={statusFilter === 'contract_signed'} onClick={() => setStatusFilter('contract_signed')}>
                  ✓ Assinadas
                </FilterPill>
                <FilterPill $active={statusFilter === 'paid'} onClick={() => setStatusFilter('paid')}>
                  💰 Pagas
                </FilterPill>
                <FilterPill $active={statusFilter === 'pending_payment'} onClick={() => setStatusFilter('pending_payment')}>
                  ⏳ Pendentes
                </FilterPill>
                <FilterPill $active={methodFilter === 'pix'} onClick={() => setMethodFilter(methodFilter === 'pix' ? '' : 'pix')}>
                  PIX
                </FilterPill>
                <FilterPill $active={methodFilter === 'card'} onClick={() => setMethodFilter(methodFilter === 'card' ? '' : 'card')}>
                  Cartão
                </FilterPill>
              </FilterPillsGroup>
            </FiltersBar>

            {/* MAIN TABLE */}
            <Table>
              <TableRow $isHeader>
                <div>Licenciada & Documento</div>
                <div>Localização</div>
                <div>Valor da Taxa</div>
                <div>Modalidade</div>
                <div>Status Jurídico</div>
                <div style={{ textAlign: 'right' }}>Ações Rápidas</div>
              </TableRow>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div>Carregando taxas de licenciamento...</div>
                </div>
              ) : taxesData.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                  <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600 }}>Nenhum registro encontrado.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Clique no botão "⚡ Sincronizar Histórico" acima para importar as 13 taxas do relatório jurídico.
                  </div>
                </div>
              ) : (
                taxesData.map((tax) => (
                  <TableRow key={tax.id}>
                    {/* Licenciada */}
                    <LicenciadaCell
                      onClick={() => openDossier(tax.licenciada_id)}
                      style={{ cursor: tax.licenciada_id ? 'pointer' : 'default' }}
                      title={tax.licenciada_id ? "Clique para abrir o Dossiê 360º da Licenciada" : "Licenciada não vinculada"}
                    >
                      {tax.profile_photo || tax.photo_url ? (
                        <AvatarImg
                          src={tax.profile_photo || tax.photo_url}
                          alt={tax.licenciada_name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <Avatar style={{ display: (tax.profile_photo || tax.photo_url) ? 'none' : 'flex' }}>
                        {getInitials(tax.licenciada_name)}
                      </Avatar>
                      <LicenciadaInfo>
                        <LicenciadaName style={{ color: tax.licenciada_id ? '#0A3E60' : 'inherit' }}>
                          {tax.licenciada_name} {tax.licenciada_id && <span style={{ fontSize: '0.68rem', color: '#ED7E13' }}>✦ 360º</span>}
                        </LicenciadaName>
                        <LicenciadaDoc>{tax.licenciada_cpf || tax.licenciada_cnpj || 'Doc não informado'}</LicenciadaDoc>
                      </LicenciadaInfo>
                    </LicenciadaCell>

                    {/* Local */}
                    <div style={{ color: '#475569', fontWeight: 500 }}>
                      {tax.licenciada_location || 'A definir'}
                    </div>

                    {/* Valor */}
                    <div>
                      {tax.valor_cents > 0 ? (
                        <div style={{ fontWeight: 800, color: '#0A3E60' }}>
                          {tax.valor_display}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          A Definir
                        </span>
                      )}
                      {tax.payment_condition && (
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{tax.payment_condition}</div>
                      )}
                    </div>

                    {/* Modalidade */}
                    <div>
                      <span style={{ fontWeight: 600, color: '#334155', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        {tax.payment_method || 'A Definir'}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <StatusBadge $status={tax.status}>
                        {tax.status === 'contract_signed' && '✓ 100% Regularizada'}
                        {tax.status === 'paid' && '🟡 Quitado (Aguard. Contrato)'}
                        {tax.status === 'pending_payment' && (tax.has_contract ? '🧾 Aguard. Comprovante' : '⏳ Em Levantamento')}
                        {tax.status === 'cancelled' && 'Cancelado'}
                      </StatusBadge>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <RowActions>
                        <IconButton
                          title="Ver Detalhes da Licenciada & Cláusula"
                          $color="#0A3E60"
                          onClick={() => {
                            setSelectedTax(tax);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye size={14} />
                        </IconButton>
                        <IconButton
                          title="Anexar Comprovante / PDF"
                          $color="#ED7E13"
                          onClick={() => handleOpenUpload(tax)}
                        >
                          <Paperclip size={14} />
                        </IconButton>
                        <IconButton
                          title="Gerar Recibo WhatsApp para Licenciada"
                          $color="#25D366"
                          onClick={() => handleOpenWhatsApp(tax)}
                        >
                          <MessageSquare size={14} />
                        </IconButton>
                        <IconButton
                          title="Editar Dados da Taxa"
                          $color="#475569"
                          onClick={() => {
                            setSelectedTax(tax);
                            setTaxForm({
                              licenciada_id: tax.licenciada_id || '',
                              licenciada_name: tax.licenciada_name,
                              licenciada_cpf: tax.licenciada_cpf || '',
                              licenciada_cnpj: tax.licenciada_cnpj || '',
                              licenciada_location: tax.licenciada_location || '',
                              valor_cents: tax.valor_cents,
                              payment_method: tax.payment_method,
                              payment_condition: tax.payment_condition || '',
                              installments: tax.installments || 1,
                              status: tax.status,
                              notes: tax.notes || ''
                            });
                            setIsTaxModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </IconButton>
                      </RowActions>
                    </div>
                  </TableRow>
                ))
              )}
            </Table>
          </SectionCard>
        )}

        {/* TAB 3: COMPROVANTES & ANEXOS */}
        {activeTab === 'attachments' && (
          <SectionCard>
            <SectionHeader>
              <SectionTitle><Paperclip size={17} /> Galeria de Comprovantes & Documentos Anexados</SectionTitle>
            </SectionHeader>
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
              <Paperclip size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: '#0A3E60' }} />
              <h4 style={{ color: '#0A3E60', fontWeight: 700, margin: '0 0 0.5rem' }}>Central de Comprovantes</h4>
              <p style={{ fontSize: '0.82rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
                Todos os comprovantes PIX, recibos de cartão e PDFs de contratos assinados à mão ficam salvos com segurança no servidor e vinculados às licenciadas.
              </p>
              <ActionBtn
                $variant="gold"
                style={{ margin: '0 auto' }}
                onClick={() => {
                  if (taxesData.length > 0) {
                    handleOpenUpload(taxesData[0]);
                  } else {
                    alert('Nenhuma taxa cadastrada para anexar.');
                  }
                }}
              >
                <Plus size={15} /> Fazer Upload de Novo Comprovante
              </ActionBtn>
            </div>
          </SectionCard>
        )}

        {/* TAB 4: DRE & FECHAMENTO CONTÁBIL EXPANDIDO (PLAN-141) */}
        {activeTab === 'dre' && (
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <Landmark size={17} /> Demonstrativo do Resultado do Exercício (DRE Expandido)
              </SectionTitle>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionBtn $variant="outline" onClick={handleExportCsv}>
                  <Download size={14} /> Exportar CSV
                </ActionBtn>
                <ActionBtn $variant="gold" onClick={handleOpenNewExpense}>
                  <TrendingDown size={14} /> + Lançar Despesa
                </ActionBtn>
              </div>
            </SectionHeader>
            <div style={{ padding: '1.25rem' }}>
              {dreLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div>Carregando demonstrativo contábil...</div>
                </div>
              ) : (
                <>
                  {/* RESUMO EXECUTIVO DO DRE */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Receita Bruta Real</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3E60', marginTop: '0.25rem' }}>
                        {dreData?.summary?.total_revenue_formatted || 'R$ 0,00'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600, marginTop: '0.2rem' }}>
                        (+) Entradas Confirmadas
                      </div>
                    </div>

                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>Despesas Totais</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#DC2626', marginTop: '0.25rem' }}>
                        {dreData?.summary?.total_expenses_formatted || 'R$ 0,00'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600, marginTop: '0.2rem' }}>
                        (-) Saídas Lançadas
                      </div>
                    </div>

                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Lucro Líquido Real</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
                        {dreData?.summary?.net_profit_formatted || 'R$ 0,00'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                        (=) Margem Líquida: {dreData?.summary?.margin_pct ?? 100}%
                      </div>
                    </div>
                  </div>

                  {/* DISTRIBUIÇÃO PERCENTUAL POR CATEGORIA DE CUSTO */}
                  <h4 style={{ color: '#0A3E60', fontWeight: 800, fontSize: '0.9rem', margin: '1rem 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PieChart size={16} color="#ED7E13" /> Distribuição de Custos por Categoria (Impacto na Receita)
                  </h4>

                  {dreData?.categories && dreData.categories.length > 0 ? (
                    <DreGrid>
                      {dreData.categories.map((cat) => (
                        <DreCard key={cat.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#0A3E60', fontSize: '0.82rem' }}>{cat.label}</span>
                            <span style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.85rem' }}>{cat.total_formatted}</span>
                          </div>
                          <ProgressBar>
                            <ProgressFill $pct={cat.pct_of_expenses || cat.pct_of_revenue} $color={cat.color} />
                          </ProgressBar>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B' }}>
                            <span>{cat.count} lançamentos</span>
                            <span><strong>{cat.pct_of_expenses}%</strong> das despesas ({cat.pct_of_revenue}% da receita)</span>
                          </div>
                        </DreCard>
                      ))}
                    </DreGrid>
                  ) : (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                      <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
                        Nenhuma despesa operacional lançada no período selecionado. Use o botão <strong>"+ Lançar Despesa"</strong> para adicionar custos operacionais, marketing ou infraestrutura.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </SectionCard>
        )}

        {/* ========================================== */}
        {/* MODAL: CRIAR / EDITAR TAXA */}
        {/* ========================================== */}
        {isTaxModalOpen && (
          <ModalOverlay onClick={() => setIsTaxModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <DollarSign size={18} color="#ED7E13" />
                  {selectedTax ? 'Editar Taxa de Licenciamento' : 'Nova Taxa de Licenciamento'}
                </ModalTitle>
                <IconButton onClick={() => setIsTaxModalOpen(false)}>
                  <X size={16} />
                </IconButton>
              </ModalHeader>
              <form onSubmit={handleSaveTax}>
                <ModalBody>
                  <FormGroup>
                    <Label>Vincular a Licenciada Existente (Opcional)</Label>
                    <Select
                      value={taxForm.licenciada_id}
                      onChange={(e) => {
                        const val = e.target.value;
                        const lic = licenciadasList.find((l) => String(l.id) === String(val));
                        setTaxForm({
                          ...taxForm,
                          licenciada_id: val,
                          licenciada_name: lic ? lic.nome : taxForm.licenciada_name,
                          licenciada_cpf: lic ? (lic.cpf || '') : taxForm.licenciada_cpf,
                          licenciada_location: lic ? `${lic.cidade || ''}/${lic.estado || ''}` : taxForm.licenciada_location
                        });
                      }}
                    >
                      <option value="">-- Cadastro Avulso / Não Vinculado --</option>
                      {licenciadasList.map((lic) => (
                        <option key={lic.id} value={lic.id}>
                          {lic.nome} ({lic.cpf || 'Sem CPF'})
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Nome Completo da Licenciada *</Label>
                    <Input
                      required
                      value={taxForm.licenciada_name}
                      onChange={(e) => setTaxForm({ ...taxForm, licenciada_name: e.target.value })}
                      placeholder="Ex: Dra. Jaqueline Leal Venturini"
                    />
                  </FormGroup>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormGroup>
                      <Label>CPF da Licenciada</Label>
                      <Input
                        value={taxForm.licenciada_cpf}
                        onChange={(e) => setTaxForm({ ...taxForm, licenciada_cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Localização (Cidade/UF)</Label>
                      <Input
                        value={taxForm.licenciada_location}
                        onChange={(e) => setTaxForm({ ...taxForm, licenciada_location: e.target.value })}
                        placeholder="Ex: Linhares/ES"
                      />
                    </FormGroup>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormGroup>
                      <Label>Valor da Taxa (em Centavos) *</Label>
                      <Input
                        type="number"
                        required
                        value={taxForm.valor_cents}
                        onChange={(e) => setTaxForm({ ...taxForm, valor_cents: parseInt(e.target.value) || 0 })}
                        placeholder="700000 = R$ 7.000,00"
                      />
                      <div style={{ fontSize: '0.72rem', color: '#ED7E13', fontWeight: 600 }}>
                        Equivale a: R$ {((taxForm.valor_cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label>Forma de Pagamento *</Label>
                      <Select
                        value={taxForm.payment_method}
                        onChange={(e) => setTaxForm({ ...taxForm, payment_method: e.target.value })}
                      >
                        <option value="pix">PIX</option>
                        <option value="card">Cartão de Crédito</option>
                        <option value="transfer">Transferência Bancária</option>
                        <option value="manual">Manual / Outro</option>
                      </Select>
                    </FormGroup>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormGroup>
                      <Label>Condições de Pagamento</Label>
                      <Input
                        value={taxForm.payment_condition}
                        onChange={(e) => setTaxForm({ ...taxForm, payment_condition: e.target.value })}
                        placeholder="Ex: 5x de R$ 1.400,00 ou à vista"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Status *</Label>
                      <Select
                        value={taxForm.status}
                        onChange={(e) => setTaxForm({ ...taxForm, status: e.target.value })}
                      >
                        <option value="contract_signed">✓ Contrato Assinado</option>
                        <option value="paid">💰 Pago (Aguardando Contrato)</option>
                        <option value="pending_payment">⏳ Pagamento Pendente</option>
                        <option value="cancelled">Cancelado</option>
                      </Select>
                    </FormGroup>
                  </div>

                  <FormGroup>
                    <Label>Observações Internas</Label>
                    <TextArea
                      value={taxForm.notes}
                      onChange={(e) => setTaxForm({ ...taxForm, notes: e.target.value })}
                      placeholder="Anotações da Josi ou detalhes da negociação..."
                    />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <ActionBtn type="button" onClick={() => setIsTaxModalOpen(false)}>
                    Cancelar
                  </ActionBtn>
                  <ActionBtn $variant="gold" type="submit">
                    <Save size={14} /> Salvar Taxa
                  </ActionBtn>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ========================================== */}
        {/* MODAL: DETALHES DA TAXA & CLÁUSULA */}
        {/* ========================================== */}
        {isDetailModalOpen && selectedTax && (
          <ModalOverlay onClick={() => setIsDetailModalOpen(false)}>
            <ModalContent $width="680px" onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <ShieldCheck size={20} color="#0A3E60" />
                  Dossiê Jurídico & Financeiro da Licenciada
                </ModalTitle>
                <IconButton onClick={() => setIsDetailModalOpen(false)}>
                  <X size={16} />
                </IconButton>
              </ModalHeader>
              <ModalBody>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#0A3E60', fontSize: '1.1rem', fontWeight: 800 }}>
                    {selectedTax.licenciada_name}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                    <div><strong>CPF/CNPJ:</strong> {selectedTax.licenciada_cpf || selectedTax.licenciada_cnpj || 'Não informado'}</div>
                    <div><strong>Localização:</strong> {selectedTax.licenciada_location || 'A definir'}</div>
                    <div><strong>Valor da Taxa:</strong> <span style={{ color: '#0A3E60', fontWeight: 800 }}>{selectedTax.valor_display}</span></div>
                    <div><strong>Método:</strong> {selectedTax.payment_method?.toUpperCase()}</div>
                    <div><strong>Status:</strong> {selectedTax.status}</div>
                    <div><strong>Origem:</strong> {selectedTax.source}</div>
                  </div>
                </div>

                {/* CLÁUSULA 7ª */}
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.4rem', color: '#92400E', fontSize: '0.85rem', fontWeight: 800 }}>
                    📜 CLÁUSULA SÉTIMA — DA TAXA DE LICENCIAMENTO
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: '1.5', margin: 0 }}>
                    "Pela outorga da licença de uso da marca e do método Body Harmony®, a LICENCIADA pagará à LICENCIANTE a quantia de <strong>{selectedTax.valor_display}</strong>, a ser quitada mediante <strong>{selectedTax.payment_method?.toUpperCase()} ({selectedTax.payment_condition || 'conforme ajustado'})</strong>."
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <ActionBtn $variant="outline" onClick={() => handleOpenWhatsApp(selectedTax)}>
                  <MessageSquare size={14} color="#25D366" /> Enviar Recibo WhatsApp
                </ActionBtn>
                <ActionBtn $variant="gold" onClick={() => handleOpenUpload(selectedTax)}>
                  <Paperclip size={14} /> Anexar Comprovante
                </ActionBtn>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ========================================== */}
        {/* MODAL: UPLOAD DE COMPROVANTE */}
        {/* ========================================== */}
        {isUploadModalOpen && selectedTax && (
          <ModalOverlay onClick={() => setIsUploadModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Paperclip size={18} color="#ED7E13" />
                  Anexar Comprovante — {selectedTax.licenciada_name}
                </ModalTitle>
                <IconButton onClick={() => setIsUploadModalOpen(false)}>
                  <X size={16} />
                </IconButton>
              </ModalHeader>
              <form onSubmit={handleUploadSubmit}>
                <ModalBody>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    Selecione o comprovante de pagamento bancário (PIX, recibo ou cartão) ou o arquivo PDF do contrato assinado à mão.
                  </p>
                  <FormGroup>
                    <Label>Arquivo (PDF, JPG, PNG, WebP — máx 10MB) *</Label>
                    <Input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <ActionBtn type="button" onClick={() => setIsUploadModalOpen(false)}>
                    Cancelar
                  </ActionBtn>
                  <ActionBtn $variant="gold" type="submit" disabled={!uploadFile}>
                    <Paperclip size={14} /> Enviar Comprovante
                  </ActionBtn>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ========================================== */}
        {/* MODAL: RECIBO OFICIAL WHATSAPP */}
        {/* ========================================== */}
        {isWhatsAppModalOpen && whatsAppData && (
          <ModalOverlay onClick={() => setIsWhatsAppModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <MessageSquare size={18} color="#25D366" />
                  Enviar Recibo de Quitação via WhatsApp
                </ModalTitle>
                <IconButton onClick={() => setIsWhatsAppModalOpen(false)}>
                  <X size={16} />
                </IconButton>
              </ModalHeader>
              <ModalBody>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  A mensagem abaixo foi formatada para a Josi enviar diretamente para o WhatsApp da Licenciada <strong>{whatsAppData.licenciada_name}</strong>:
                </p>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.78rem', color: '#166534' }}>
                  {whatsAppData.message}
                </div>
              </ModalBody>
              <ModalFooter>
                <ActionBtn type="button" onClick={() => setIsWhatsAppModalOpen(false)}>
                  Fechar
                </ActionBtn>
                <a
                  href={whatsAppData.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <ActionBtn $variant="gold">
                    <ExternalLink size={14} /> Abrir WhatsApp Agora
                  </ActionBtn>
                </a>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ========================================== */}
        {/* MODAL: LANÇAMENTO DE DESPESA EM 3 PASSOS (PLAN-141) */}
        {/* ========================================== */}
        {isExpenseModalOpen && (
          <ModalOverlay onClick={() => setIsExpenseModalOpen(false)}>
            <ModalContent $width="640px" onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <TrendingDown size={20} color="#DC2626" />
                  Lançar Nova Despesa Operacional
                </ModalTitle>
                <IconButton onClick={() => setIsExpenseModalOpen(false)}>
                  <X size={16} />
                </IconButton>
              </ModalHeader>

              {/* STEP WIZARD HEADER */}
              <StepWizardHeader>
                <StepItem $active={expenseStep === 1} $done={expenseStep > 1}>
                  <StepNumber $active={expenseStep === 1} $done={expenseStep > 1}>
                    {expenseStep > 1 ? <Check size={12} /> : '1'}
                  </StepNumber>
                  <span>1. Valor & Data</span>
                </StepItem>
                <ChevronRight size={14} color="#CBD5E1" />
                <StepItem $active={expenseStep === 2} $done={expenseStep > 2}>
                  <StepNumber $active={expenseStep === 2} $done={expenseStep > 2}>
                    {expenseStep > 2 ? <Check size={12} /> : '2'}
                  </StepNumber>
                  <span>2. Destino & Categoria</span>
                </StepItem>
                <ChevronRight size={14} color="#CBD5E1" />
                <StepItem $active={expenseStep === 3} $done={expenseStep > 3}>
                  <StepNumber $active={expenseStep === 3} $done={expenseStep > 3}>
                    {expenseStep > 3 ? <Check size={12} /> : '3'}
                  </StepNumber>
                  <span>3. Comprovante</span>
                </StepItem>
              </StepWizardHeader>

              <form onSubmit={handleSaveExpense}>
                <ModalBody>
                  {/* PASSO 1: QUANTO & QUANDO */}
                  {expenseStep === 1 && (
                    <>
                      <FormGroup>
                        <Label>Valor da Despesa (R$) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          required
                          autoFocus
                          placeholder="Ex: 450.00"
                          value={expenseForm.amount_raw}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cents = Math.round(parseFloat(val || '0') * 100);
                            setExpenseForm({
                              ...expenseForm,
                              amount_raw: val,
                              amount_cents: cents
                            });
                          }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>
                          Equivale a: R$ {((expenseForm.amount_cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </FormGroup>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <FormGroup>
                          <Label>Data de Competência / Pagamento *</Label>
                          <Input
                            type="date"
                            required
                            value={expenseForm.expense_date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label>Forma de Pagamento *</Label>
                          <Select
                            value={expenseForm.payment_method}
                            onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                          >
                            <option value="pix">⚡ PIX</option>
                            <option value="cartao_credito">💳 Cartão de Crédito</option>
                            <option value="cartao_debito">💳 Cartão de Débito</option>
                            <option value="boleto">📄 Boleto Bancário</option>
                            <option value="ted">🏦 Transferência / TED</option>
                            <option value="dinheiro">💵 Dinheiro em Espécie</option>
                            <option value="outro">Outro</option>
                          </Select>
                        </FormGroup>
                      </div>
                    </>
                  )}

                  {/* PASSO 2: DESTINO & CATEGORIA */}
                  {expenseStep === 2 && (
                    <>
                      <FormGroup>
                        <Label>Selecione a Categoria da Despesa *</Label>
                        <CategoryGrid>
                          {expenseCategories.map((cat) => (
                            <CategoryCard
                              type="button"
                              key={cat.key}
                              $active={expenseForm.category === cat.key}
                              $color={cat.color}
                              onClick={() => setExpenseForm({ ...expenseForm, category: cat.key })}
                            >
                              <span>{cat.label}</span>
                            </CategoryCard>
                          ))}
                        </CategoryGrid>
                      </FormGroup>

                      <FormGroup>
                        <Label>Descrição da Despesa *</Label>
                        <Input
                          required
                          placeholder="Ex: Anúncios Facebook/Instagram — Campanha Congresso"
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Fornecedor / Favorecido (Opcional)</Label>
                        <Input
                          placeholder="Ex: Meta Ads, Hostinger, Gráfica Assis..."
                          value={expenseForm.supplier_name}
                          onChange={(e) => setExpenseForm({ ...expenseForm, supplier_name: e.target.value })}
                        />
                      </FormGroup>
                    </>
                  )}

                  {/* PASSO 3: COMPROVANTE & NOTAS */}
                  {expenseStep === 3 && (
                    <>
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Resumo do Lançamento:</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontWeight: 800, color: '#0A3E60' }}>
                          <span>{expenseForm.description || 'Despesa sem descrição'}</span>
                          <span style={{ color: '#DC2626' }}>R$ {((expenseForm.amount_cents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>
                          Categoria: <strong>{expenseCategories.find(c => c.key === expenseForm.category)?.label || expenseForm.category}</strong> | Data: <strong>{expenseForm.expense_date}</strong>
                        </div>
                      </div>

                      <FormGroup>
                        <Label>Anexar Cupom Fiscal / Comprovante PIX (Opcional)</Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => setExpenseFile(e.target.files[0])}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Observações Adicionais (Opcional)</Label>
                        <TextArea
                          placeholder="Detalhes ou anotações para o fechamento contábil..."
                          value={expenseForm.notes}
                          onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        />
                      </FormGroup>
                    </>
                  )}
                </ModalBody>

                <ModalFooter>
                  {expenseStep > 1 && (
                    <ActionBtn type="button" onClick={() => setExpenseStep(expenseStep - 1)}>
                      <ChevronLeft size={14} /> Voltar
                    </ActionBtn>
                  )}
                  {expenseStep < 3 ? (
                    <ActionBtn
                      $variant="gold"
                      type="button"
                      disabled={expenseStep === 1 ? (!expenseForm.amount_cents || expenseForm.amount_cents <= 0) : !expenseForm.description}
                      onClick={() => setExpenseStep(expenseStep + 1)}
                    >
                      Avançar <ChevronRight size={14} />
                    </ActionBtn>
                  ) : (
                    <ActionBtn $variant="gold" type="submit" disabled={expenseSaving}>
                      {expenseSaving ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} /> Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Concluir Lançamento
                        </>
                      )}
                    </ActionBtn>
                  )}
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* LICENCIADA 360º DOSSIER DRAWER (PLAN-142) */}
        <LicenciadaDossierDrawer
          licenciadaId={dossierLicenciadaId}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          onUpdated={() => {
            loadData();
          }}
        />
      </Container>
    </AdminLayout>
  );
}
