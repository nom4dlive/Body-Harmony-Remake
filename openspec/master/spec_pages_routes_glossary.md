??? SPEC Global: Páginas, Rotas e Glossário Oficial (Nexus V3.1)
Versão: 5.0 (Nexus Era — CRM V4, Google Workspace & Workspace-First)
Data de Atualização: 2026-08-31
Protocolo: OpenSpec V3.1 (Nexus Protocol)
Arquitetura: Híbrida (React 18 + Styled-Components + PHP 8.4 Vanilla + Evolution API v2 + Chatwoot CE)


1. Glossário Oficial (Fonte Única da Verdade — SSOT)
Devem ser utilizados rigorosamente estes termos em UI, Código e Documentação:

Termo Oficial
Uso
Definição
licenciada
UI / Marketing
Identificação oficial das parceiras e alunas de capacitação da rede. Nunca usar "Estudante" ou "Cliente" na interface.
Licenciada
UI / B2B
Profissional que concluiu o treinamento e possui licença clínica ativa da marca.
Portal Licenciada
UI
Área de aprendizado (LMS), prontuários e recursos exclusivos. Rota: /portal-licenciada/*
Portal Gestor
UI
Painel Administrativo unificado para gerenciamento do ecossistema. Rota canônica: /portal-gestor/*
CRM V4
UI / Operacional
Central de Atendimento Omnichannel (WhatsApp, Chatwoot, Silos e Dossiê 360°). Rota: /portal-gestor/crm
Loja Virtual (Shop)
UI / E-Commerce
Vitrine e catálogo oficial de produtos, insumos e equipamentos. Rota canônica: /shop
Congresso
UI / Evento
Landing Page e checkout de ingressos (Experience R$ 697 e VIP R$ 1.497). Rota: /congresso
Doctor Harmony
UI / Produto
Assistente de IA clínica para licenciadas. Powered by Gemini / QwenProxy local.
SmartBook AI
UI / LMS
Caderno digital com transcrições verbatim, mapas mentais e RAG.



2. Rotas do Frontend SPA (React 18 / Vite)
2.1 Rotas Públicas & Institucionais
Rota
Componente
Descrição / Função
/
Home.jsx
Landing Page institucional oficial.
/shop
ShopPage.jsx
Loja Virtual e catálogo de produtos oficiais.
/congresso
CongressoPage.jsx
Landing Page e checkout do Congresso Brasileiro de Eletroestimulação.
/onboarding/:token
PublicOnboardingPage.jsx
Wizard mobile-first de pré-cadastro e envio de documentos para candidatas.
/assinar/:token
PublicSignPage.jsx
Assinatura digital mobile-first com desenho touch canvas.
/portal-licenciada
PortalLogin.jsx
Login de acesso ao Portal da Licenciada.
/portal-gestor/login
AdminLogin.jsx
Login de acesso administrativo do Gestor.

2.2 Rotas do Portal do Gestor (Protegidas — AdminLayout)
Rota
Componente
Descrição / Função
/portal-gestor/dashboard
Dashboard.jsx
Painel Executivo 360°, KPIs em tempo real e atalhos.
/portal-gestor/crm
CRMWorkspaceV4.jsx
Hub Omnichannel: Atendimento, Linhas WhatsApp, Equipe e Google Workspace.
/portal-gestor/agenda
GestorAgendaPage.jsx
Agenda clínica, sincronização Google Calendar e lembretes Anti No-Show.
/portal-gestor/contratos
ContractsDashboard.jsx
Hub Jurídico: Emissão, modelos, chancelas e assinaturas digitais.
/portal-gestor/onboarding
OnboardingFunnelPage.jsx
Funil de Onboarding de Licenciadas (Kanban 5 colunas + Tabela densa).
/portal-gestor/shop
ShopManager.jsx
Gestor da Loja, catálogo de produtos, estoque e pedidos.
/portal-gestor/lms
LMSContainer.jsx
Gestão de cursos, módulos, lições e certificados.
/portal-gestor/usuarios
GestorUsersManager.jsx
Gestão de equipe RBAC e permissões de atendentes.



3. Mapa de Endpoints REST (Backend PHP 8.4)
Todos os endpoints da API principal seguem rigorosamente o prefixo /api/v1/*:
3.1 Autenticação & Sessão
POST /api/v1/auth/login — Autenticação administrativa (retorna token bh_auth).
POST /api/v1/auth/licenciada/login — Autenticação de licenciadas.
GET /api/v1/auth/validate-token — Validação em tempo real de tokens de sessão.
3.2 CRM & Comunicação
GET /api/v1/crm/channels — Telemetria de linhas e instâncias Evolution API v2.
GET|POST /api/v1/crm/inbox_conversations — Lista de conversas e histórico por silo.
POST /api/v1/crm/inbox_messages — Envio de mensagens de texto, mídias e áudio PTT.
GET /api/v1/crm/google_status — Status de conexão com Google Workspace (bodyharmony36@gmail.com).
3.3 Gestor & Operações
GET|POST /api/v1/admin/contracts/* — Gestão, emissão 1-clique e download de contratos.
GET|POST /api/v1/admin/onboarding/* — Gestão de tokens e etapas do funil de onboarding.
GET|POST /api/v1/admin/agenda/* — Gestão de agendamentos e sincronização de eventos.
GET|POST /api/v1/shop/* — Catálogo de produtos, pedidos e configurações da loja.

