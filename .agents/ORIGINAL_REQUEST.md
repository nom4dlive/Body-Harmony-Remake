# Original User Request

## Initial Request — 2026-08-20T23:14:50-03:00

Desenvolvimento completo do Funil de Onboarding de Licenciadas com Pré-cadastro Público, OCR de Documentos, Emissão de Contratos em 1-Clique, Régua de WhatsApp e Validação em 2 Etapas (PLAN-064).

Working directory: f:\Body-Harmony-Remake
Integrity mode: development

## Requirements

### R1. Backend & Data Layer Implementation
- Migration SQL V107_Create_Licenciada_Onboarding_Funnel_Table.sql
- OnboardingService.php com integração à AgendaService e ContractService
- SimpleOcrService.php leitor defensivo de documentos
- OnboardingController.php e rotas em index.php

### R2. Frontend React 18 & Public Page Implementation
- PublicOnboardingPage.jsx: Tela pública mobile-first para licenciada enviar dados e fotos de documentos
- OnboardingFunnelPage.jsx: Painel do Gestor com visão dupla (Kanban 5 Colunas + Tabela de Licenciadas)
- GenerateContractModal.jsx: Modal de emissão de contrato em 1-clique

### R3. Automated Test Suite & Build Verification
- Testes CLI tests/onboarding_funnel_smoke_test.php com 100% de aprovação
- Compilação limpa do Vite via npm run build no diretório apps/web-app

## Acceptance Criteria

### Security & Functional Criteria
- Prepared Statements PDO em 100% das queries SQL
- Link público protegido por token assinado com tempo de expiração
- Auto-fill de dados e emissão de contrato em 1-clique operacionais

### Verification Criteria
- php tests/onboarding_funnel_smoke_test.php passa com 100% de sucesso
- npm run build em apps/web-app compila com exit code 0
