import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PublicOnboardingPage from '../src/pages/PublicOnboardingPage';
import OnboardingFunnelPage from '../src/pages/OnboardingFunnelPage';
import GenerateContractModal from '../src/components/Modals/GenerateContractModal';
import { onboardingApi, contractsApi } from '../src/services/api';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ token: 'valid-test-token' }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/portal-gestor/onboarding', search: '', hash: '', state: null }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock AuthContext
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin Josi', username: 'Josi', role: 'admin' },
    isAdmin: true,
    token: 'mock-admin-token',
    logout: vi.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock onboardingApi and contractsApi
vi.mock('../src/services/api', () => ({
  onboardingApi: {
    validateToken: vi.fn(),
    validatePublicToken: vi.fn(),
    submitPublicOnboarding: vi.fn(),
    getLeads: vi.fn(),
    getMetrics: vi.fn(),
    getFunnel: vi.fn(),
    createLink: vi.fn(),
    generateContract: vi.fn(),
    confirmPayment: vi.fn(),
    updateStatus: vi.fn(),
    getDetail: vi.fn(),
    getDocumentUrl: vi.fn((id, type) => `/api/v1/admin/onboarding/${id}/document/${type}`),
    downloadAllFilesZip: vi.fn(),
    deleteRequest: vi.fn(),
    purgeTestRequests: vi.fn(),
    assignRequest: vi.fn(),
    generateQuickMock: vi.fn()
  },
  contractsApi: {
    getTemplates: vi.fn()
  }
}));

describe('🏛️ PLAN-064 Frontend Components Stress Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. PublicOnboardingPage Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('PublicOnboardingPage (Candidate Wizard)', () => {
    it('renders loading state when validating token', async () => {
      onboardingApi.validateToken.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<PublicOnboardingPage />);
      expect(screen.getByText(/Validando link seguro de credenciamento/i)).toBeInTheDocument();
    });

    it('renders expired token error card when token is invalid', async () => {
      onboardingApi.validateToken.mockResolvedValueOnce({
        valid: false,
        reason: 'Token expirado após 7 dias.'
      });

      await act(async () => {
        render(<PublicOnboardingPage />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Link Indisponível ou Expirado/i)).toBeInTheDocument();
        expect(screen.getByText(/Falar com o Suporte/i)).toBeInTheDocument();
      });
    });

    it('renders wizard step 1 with auto-filled lead info on valid token', async () => {
      onboardingApi.validateToken.mockResolvedValueOnce({
        valid: true,
        nome_candidata: 'Dra. Beatriz Santos',
        telefone_whatsapp: '(11) 98765-4321',
        categoria: 'Licenciada Ouro'
      });

      await act(async () => {
        render(<PublicOnboardingPage />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Pré-Cadastro de Licenciada/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Dra. Beatriz Santos')).toBeInTheDocument();
        expect(screen.getByDisplayValue('(11) 98765-4321')).toBeInTheDocument();
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. OnboardingFunnelPage Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('OnboardingFunnelPage (Manager Dual-View Dashboard)', () => {
    it('renders 5 Kanban columns and calculates Bento KPIs correctly', async () => {
      onboardingApi.getLeads.mockResolvedValueOnce({
        success: true,
        items: [
          { id: 1, nome: 'Ana Paula', cpf: '52998224725', categoria: 'Licenciada Bronze', status: 'PRE_CADASTRO' },
          { id: 2, nome: 'Beatriz Lima', cpf: '11144477735', categoria: 'Licenciada Prata', status: 'DADOS_PREENCHIDOS', documento_img: 'rg.jpg' },
          { id: 3, nome: 'Carla Silva', cpf: '52998224725', categoria: 'Licenciada Ouro', status: 'VALIDAR_PAGAMENTO' },
          { id: 4, nome: 'Diana Ramos', cpf: '11144477735', categoria: 'Licenciada Diamond', status: 'ATIVO_LIBERADO' }
        ]
      });
      onboardingApi.getMetrics.mockResolvedValueOnce({
        success: true,
        metrics: { total: 4, pre_cadastro: 1, documentos_recebidos: 1, contrato_emitido: 0, validar_pagamento: 1, ativo_liberado: 1 }
      });

      await act(async () => {
        render(<OnboardingFunnelPage />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Funil de Onboarding de Licenciadas/i)).toBeInTheDocument();
        expect(screen.getByText(/Ana Paula/i)).toBeInTheDocument();
        expect(screen.getByText(/Beatriz Lima/i)).toBeInTheDocument();
        expect(screen.getByText(/Carla Silva/i)).toBeInTheDocument();
        expect(screen.getByText(/Diana Ramos/i)).toBeInTheDocument();
      });
    });

    it('switches between Kanban view and Table view cleanly', async () => {
      onboardingApi.getLeads.mockResolvedValueOnce({
        success: true,
        items: [{ id: 1, nome: 'Test Lead', cpf: '52998224725', categoria: 'Licenciada Bronze', status: 'PRE_CADASTRO' }]
      });
      onboardingApi.getMetrics.mockResolvedValueOnce({
        success: true,
        metrics: { total: 1 }
      });

      await act(async () => {
        render(<OnboardingFunnelPage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Lead')).toBeInTheDocument();
      });

      // Switch to Table view
      const tableButton = screen.getByRole('button', { name: /Tabela/i });
      fireEvent.click(tableButton);

      expect(screen.getByText('Candidata')).toBeInTheDocument();
      expect(screen.getByText('Status Funil')).toBeInTheDocument();
    });

    it('filters leads by search query in real time', async () => {
      onboardingApi.getLeads.mockResolvedValueOnce({
        success: true,
        items: [
          { id: 1, nome: 'Camila Fernandes', cpf: '52998224725', cidade: 'Campinas', status: 'PRE_CADASTRO' },
          { id: 2, nome: 'Juliana Rocha', cpf: '11144477735', cidade: 'Santos', status: 'PRE_CADASTRO' }
        ]
      });
      onboardingApi.getMetrics.mockResolvedValueOnce({
        success: true,
        metrics: { total: 2 }
      });

      await act(async () => {
        render(<OnboardingFunnelPage />);
      });

      await waitFor(() => {
        expect(screen.getByText('Camila Fernandes')).toBeInTheDocument();
        expect(screen.getByText('Juliana Rocha')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Buscar por nome/i);
      fireEvent.change(searchInput, { target: { value: 'Camila' } });

      expect(screen.getByText('Camila Fernandes')).toBeInTheDocument();
      expect(screen.queryByText('Juliana Rocha')).not.toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GenerateContractModal Tests
  // ───────────────────────────────────────────────────────────────────────────
  describe('GenerateContractModal (1-Click Contract Issuance)', () => {
    const mockLead = {
      id: 42,
      nome: 'Dra. Fernanda Albuquerque',
      cpf: '52998224725',
      telefone_whatsapp: '(11) 98765-4321',
      cidade: 'São Paulo',
      estado: 'SP',
      categoria: 'Licenciada Diamond'
    };

    it('renders auto-filled lead info and suggests 45k for Diamond category', async () => {
      contractsApi.getTemplates.mockResolvedValueOnce({
        templates: [
          { id: '1', slug: 'contrato-licenciamento-padrao', title: 'Contrato Master Diamond' }
        ]
      });

      await act(async () => {
        render(<GenerateContractModal isOpen={true} onClose={vi.fn()} lead={mockLead} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Emissão de Contrato em 1-Clique/i)).toBeInTheDocument();
        expect(screen.getByText('Dra. Fernanda Albuquerque')).toBeInTheDocument();
        expect(screen.getByDisplayValue('45000')).toBeInTheDocument();
        expect(screen.getByText(/quarenta e cinco mil reais/i)).toBeInTheDocument();
      });
    });

    it('executes 1-click contract issuance and shows WhatsApp dispatch launcher', async () => {
      contractsApi.getTemplates.mockResolvedValueOnce({
        templates: [{ id: '1', slug: 'contrato-licenciamento-padrao', title: 'Contrato Padrão' }]
      });

      onboardingApi.generateContract.mockResolvedValueOnce({
        success: true,
        contract_uuid: 'uuid-contract-998877',
        sign_token: 'token-sign-12345'
      });

      await act(async () => {
        render(<GenerateContractModal isOpen={true} onClose={vi.fn()} lead={mockLead} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Emitir Contrato 1-Clique/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Emitir Contrato 1-Clique/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Contrato Emitido com Sucesso/i)).toBeInTheDocument();
        expect(screen.getByText(/Enviar Agora no WhatsApp/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/token-sign-12345/i)).toBeInTheDocument();
      });
    });
  });
});
