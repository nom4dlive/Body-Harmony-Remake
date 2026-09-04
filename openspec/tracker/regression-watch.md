# 🔍 Monitoramento Semântico e de Regressões (V3.1)

Este arquivo serve para mapear, acompanhar e atestar a ausência de regressões em fluxos críticos do ecossistema Body Harmony a cada ciclo de entrega.

## 🛡️ Watchpoints de Fluxos Críticos

| ID | Área / Componente | Descrição da Validação Crítica | Tipo de Teste | Frequência |
| :--- | :--- | :--- | :--- | :--- |
| **WP-01** | Autenticação / Login | Validar que o login híbrido (CPF/E-mail) responde em `/api/v1/login` e redireciona | Funcional / API | A cada Deploy |
| **WP-02** | Banco de Dados / Latência | Testar conexão via loopback local na VPS (`127.0.0.1:3306`) sem timeouts | Conectividade | A cada Deploy |
| **WP-03** | LMS / Player de Aulas | Validar que o `LessonPlayer` reproduz vídeos do YouTube e arquivos MP4 locais | UI / Player | A cada Reset/Deploy |
| **WP-04** | LGPD Consentimento | Verificar se o modal de consentimento impede loops de redirecionamento | Usabilidade | A cada Ajuste de UI |
| **WP-05** | Identidade Visual | Confirmar se tons Navy Blue (`#0A3E60`) e Gold (`#ED7E13`) renderizam | Design System | A cada Ajuste de UI |
| **WP-12** | LMS / Certificados | Geração dinâmica de certificados em PDF via mPDF no backend e opção de download no frontend após aprovação no Quiz | Funcional / PDF | A cada Deploy |
| **WP-13** | Bot / Telegram Webhook | Recebimento de mensagens via POST /v1/bot/webhook e resposta instantânea (200 OK) com tratamento de handoff | API / Mensageria | A cada Deploy |
| **WP-14** | LMS / Player Fallback | Validação do fallback dinâmico para stream.php em caso de falha física persistente do HLS no player | Resiliência | A cada Deploy |
| **WP-15** | IA / Nvidia NIM | Alternar provedor para Nvidia no painel do Nexus, salvar e validar o fluxo de avaliação clínica no sandbox | Integração | A cada Deploy |
| **WP-17** | Gestor / Agenda Compartilhada | Criar agendamentos, pendências e urgências, alterar status no Kanban/Calendário e validar persistência de logs de auditoria | Funcional / UI & API | A cada Deploy |
| **WP-18** | Gestor / Funil de Onboarding de Licenciadas | Gerar link público com token assinado, submeter pré-cadastro com OCR, emitir contrato em 1-clique, régua de lembrete WhatsApp 24h e confirmar pagamento ativando licenciada via coluna `cpf` (Regra 8) | Funcional / E2E | A cada Deploy |
| **WP-19** | Gestor / Cockpit 360 & Usabilidade Master | Toasts globais Luxury Navy/Gold, Cockpit 360 no Dashboard, Busca Global (Ctrl+K), Quick Action Drawer, Split-Screen Inspector com zoom/rotação, Timeline do Lead, Chips SLA e Preferências Visuais | UX & Usabilidade | A cada Deploy |
| **WP-20** | IA / QwenProxy Exclusivo | Operação 100% local a custo $0 com QwenProxy na porta 3000, multi-serviços simultâneos e tool calling MCPs | Conectividade & IA | A cada Deploy |
| **WP-21** | Financeiro / Consistência de KPIs | Validar que summary.total_contracted_cents é estritamente igual à soma matemática de todas as linhas de taxas retornadas | Integridade / Matemática | A cada Deploy |
| **WP-22** | Financeiro / Idempotência de Taxas | Executar seedHistorical() e syncAll() repetidas vezes não gera registros duplicados em licenciada_taxas | Resiliência / Idempotência | A cada Deploy |
| **WP-23** | Financeiro / Blindagem de Anexos | Comprovantes bancários salvos em private_uploads/financial/ com .htaccess Deny from all; download restrito a HMAC assinado | Segurança / LGPD | A cada Deploy |
| **WP-24** | Onboarding / Resiliência Financeira | O hook de sincronização de taxa no estágio ATIVO_LIBERADO roda em try/catch isolado e não bloqueia a ativação da licenciada | Resiliência / E2E | A cada Deploy |
| **WP-25** | LMS / Ingestão Whisper & SmartBook | Webhook assíncrono PHP -> FastAPI, transcrição Whisper verbatim `[MM:SS - MM:SS]`, aresta `reference` no SurrealDB e atualização de status em `lms_lessons` | Automação / IA | A cada Deploy |
| **WP-26** | DB / Introspecção Read-Only MCP | Servidor FastMCP `mysql-mcp` em modo estrito de leitura via loopback `127.0.0.1:3306` com validação de invariantes (Regras 8 e 12) | Tooling / IA | A cada Deploy |
| **WP-27** | CLI / Paridade Hardlink NTFS | Hardlinks NTFS mantendo 100% de paridade instantânea entre Antigravity IDE e Antigravity CLI (`mcp_config.json` e `mcp_oauth_tokens.json`) | Infra / Zero-Drift | A cada Deploy |

---

## 📈 Histórico de Validação de Regressões

| Data | ID do Delta (PLAN) | Responsável | Watchpoints Auditados | Veredito | Observações |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-05 | PLAN-001 | Principal Engineer | WP-01, WP-02, WP-03 | 🟢 Aprovado | Primeira auditoria estrutural após refatoração |
| 2026-06-05 | PLAN-009 | Antigravity Agent | WP-01, WP-02, WP-03 | 🟢 Aprovado | Implementado controle de exclusividade em módulos LMS e verificado via teste de fumaça |
| 2026-06-05 | PLAN-011 | Antigravity Agent | WP-01, WP-02, WP-03, WP-06, WP-07 | 🟢 Build ✓ — Deploy ✓ (200 OK) | Vitrine de módulos exclusivos: filtro SQL removido, has_access adicionado, seção Premium no Dashboard da licenciada, mensagem WhatsApp com CPF no catálogo da aluna |
| 2026-06-05 | PLAN-012 | Antigravity Agent | WP-01, WP-02, WP-03, WP-06, WP-07, WP-08 | 🟢 Build ✓ — Deploy ✓ (200 OK) | Guia Premium dedicada no portal da licenciada, com destaque na Dashboard, BottomNavbar mobile, PortalNavbar e MobileDrawer |
| 2026-06-05 | PLAN-013 | Antigravity Agent | WP-01, WP-02, WP-03, WP-06, WP-07, WP-08 | 🟢 Build ✓ — Deploy ✓ (200 OK) | Separação visual clara de módulos regulares e premium (ativos/bloqueados) no Dashboard e Minhas Aulas da licenciada |
| 2026-06-05 | PLAN-014 | Antigravity Agent | WP-01, WP-02, WP-03, WP-06, WP-07, WP-08, WP-09 | 🟢 Build ✓ — Deploy ✓ (200 OK) | Blindagem de vídeos do LMS servidos da Hostinger com suporte nativo a fragmentação HLS e Cache da CDN |
| 2026-06-05 | PLAN-015 | Antigravity Agent | WP-01, WP-02, WP-03, WP-09, WP-10 | 🟢 Aprovado (Mock E2E) | Automação HLS em lote: convert-all-hls.php, painel gestor HlsBatchConverter e testes de fumaça aprovados |
| 2026-06-28 | DIAG-SENTINEL-CPU | Antigravity Agent | WP-02 | 🟢 Aprovado | Correção do Crash Loop no container Sentinel com Basic Auth e API Key |
| 2026-07-03 | PLAN-032 | Antigravity Agent | WP-01, WP-02, WP-03, WP-12, WP-13 | 🟢 Aprovado | Implementado emissão de certificados, Webhook do bot do Telegram e histórico de revisões (site_config) |
| 2026-07-03 | PLAN-033 | Antigravity Agent | WP-09, WP-14 | 🟢 Aprovado | Estabilização do player HLS com remoção de lowLatencyMode, otimização de buffers e fallback automático |
| 2026-07-07 | PLAN-035 | Antigravity Agent | WP-15 | 🟢 Aprovado | Integrada a API Nvidia NIM e testado o gateway de IA clínica adaptativo no sandbox |
| 2026-08-18 | PLAN-036 | Antigravity Agent | WP-01, WP-02, WP-05, WP-16 | 🟢 Build ✓ — Tests ✓ (100%) | Implementado Sistema de Gerenciamento de Contratos, Live Builder com auto-fill, mPDF com Chancela Jurídica SHA-256 e Assinatura Digital Touch |
| 2026-08-20 | PLAN-062 | Antigravity Agent | WP-01, WP-02, WP-17 | 🟢 Build ✓ — Tests ✓ (100%) | Implementado Sistema de Agenda Compartilhada, Pendências, Urgências, Dupla Visão (Calendário + Kanban), Mapeamento REST API e audit logs em PHP 8.4 |
| 2026-08-20 | PLAN-063 | Antigravity Agent | WP-01, WP-02, WP-17 | 🟢 Build ✓ — Tests ✓ (100%) | Recursos avançados da Agenda: Feed iCal (.ics RFC 5545), Subtarefas (Checklist 0-100%), Mural de Discussão com Menções, Anexo de Documentos, Triggers de Onboarding e Alertas Telegram |
| 2026-08-21 | PLAN-064 | Antigravity Agent | WP-01, WP-02, WP-17, WP-18 | 🟢 Build ✓ — Tests ✓ (7/7 PASS) | Funil de Onboarding de Licenciadas: V107 SQL, OnboardingService.php (token + OCR + funil 5 colunas + 1-click contrato + régua WhatsApp 24h + validação 2 etapas com Regra 8 CPF), PublicOnboardingPage.jsx, OnboardingFunnelPage.jsx, GenerateContractModal.jsx. Build Vite Exit Code 0. |
| 2026-08-21 | PLAN-066 | Antigravity Agent | WP-01, WP-02, WP-18 | 🟢 Build ✓ — Tests ✓ (8/8 PASS) | Dashboard de Métricas do Funil: getMetrics() em OnboardingService + Controller + rota GET /admin/onboarding/metrics. Widget OnboardingMetricsWidget.jsx com 6 cards de estágio, barra de conversão Gold, badge de alerta, chips de período e CTA. Auto-refresh 60s. |
| 2026-08-21 | PLAN-067 | Antigravity Agent | WP-01, WP-02, WP-16, WP-18 | 🟢 Build ✓ — Tests ✓ (10/10 PASS) | Fluxo Completo de Onboarding: Uploads múltiplos (RG, Pgto, Residência, Contrato Social, Certificados), streaming de ZIP com manifesto, validação manual e edição pelo gestor, aprovação com criação de Licenciada (REGRA 8 CPF) e emissão de Contrato DRAFT, integração bidirecional no dropdown Atalho: Licenciada Já Cadastrada no ContractWizard. |
| 2026-08-21 | PLAN-068 | Antigravity Agent | WP-01, WP-05, WP-17, WP-18, WP-19 | 🟢 Build ✓ — Tests ✓ (10/10 PASS) | Suite de 10 Recursos Visuais do Gestor: ToastContext Navy/Gold, Cockpit 360 no Dashboard, Omnibar Ctrl+K, QuickActionDrawer, HelpTooltips, Split-Screen Inspector, WhatsApp Studio Preview, Lead Timeline View, SLA Chips e Painel de Preferências Visuais. |
| 2026-08-21 | PLAN-059 | Antigravity Agent | WP-01, WP-05, WP-16 | 🟢 Build ✓ — Tests ✓ (100% PASS) | Aprimoramento UX Pro Max do Portal de Assinatura Digital: Destaques executivos dinâmicos, Reading Toolbar (A+/A-, Sepia/Dark), Busca com highlight, Atalhos de cláusulas, Download prévio da minuta em PDF, Barra de progresso e badge de Leitura Completa. |
| 2026-08-21 | PLAN-069 | Antigravity Agent | WP-01, WP-02, WP-17 | 🟢 Build ✓ — Tests ✓ (100% PASS) | Redesign Luxury da Agenda dos Gestores: Substituição de Tailwind por styled-components, encapsulamento em AdminLayout, Bento Grid de 4 KPIs, Calendário Mensal com grade 7 colunas real, Quadro Kanban com 4 colunas fluidas e Drawer lateral deslizante. |
| 2026-08-21 | PLAN-070 | Antigravity Agent | WP-01, WP-02, WP-05, WP-18, WP-19 | 🟢 Build ✓ — Deploy ✓ (200 OK) | Redesign Luxury do Funil de Onboarding: Reconstrução com styled-components, encapsulamento em AdminLayout, Bento Grid de 5 KPIs, Kanban de 5 Colunas Reais com scroll horizontal, Cards com chips SLA/OCR, Modais com Backdrop Blur e visualização alternativa em Tabela. |
| 2026-08-23 | PLAN-083 | Antigravity Agent | WP-01, WP-02, WP-16, WP-18, WP-19 | 🟢 Build ✓ — Tests ✓ (23/23 PASS) | Gestão Avançada de Onboardings, Sandbox de Testes (1-Clique) com gerador matemático de CPF/CNPJ válidos, Exclusão Segura com Blindagem Jurídica para contratos SIGNED (soft-delete), Purga em Massa de Testes, Segmentação de Visão (Reais/Testes/Todos) e Delegação por Gestor/Turmas Futuras. |
| 2026-08-23 | PLAN-086 | Antigravity Agent | WP-02, WP-11, WP-20 | 🟢 Configurado & Auditado (100%) | Integração Exclusiva QwenProxy na VPS (Custo $0), eliminação completa de NVIDIA/OpenRouter, SOUL e config.yaml alinhados com Qwen 2.5 e suporte multi-serviço. |
| 2026-08-25 | PLAN-122 | Antigravity Agent | WP-01, WP-02, WP-05 | 🟢 Build ✓ — Regressão Zero | Painel Financeiro Portal Gestor: Dashboard KPIs (receita, despesas, runway, CAC, inadimplência), fechamento diário, centros de custo com CRUD, transações financeiras paginadas com filtros, relatório DRE por evento, webhook Stone funcional (cria financial_transactions automaticamente). 6 tabelas SQL V122, 3 Services PHP, 2 Controllers, 7 contratos JSON, 4 páginas React styled-components. Build Vite Exit Code 0. |
| 2026-08-25 | PLAN-132 | Antigravity Agent | WP-01, WP-02, WP-05, WP-21, WP-22 | 🟢 Build ✓ — Tests ✓ (100% PASS) | Taxas de Licenciamento: Tabela `licenciada_taxas` + LicenseTaxService + LicenseTaxController + LicenseTaxesPage.jsx (CRUD completo, seed histórica 13 registros R$ 72.400, hook OnboardingService, 8 rotas PHP, rotas React com PermissionRouteGuard). |
| 2026-08-26 | PLAN-139 | Antigravity Agent | WP-21, WP-22, WP-23, WP-24 | 🟢 Tests ✓ (100% PASS) | Rastreabilidade Forense, RBAC Tri-Layer (financial_view, financial_manage, financial_export), auditoria imutável com diff JSON, sanitização CSV anti-fórmula, blindagem de anexos fora de public_html e smoke test puro CLI (REGRA 6). |
| 2026-08-26 | PLAN-137 | Antigravity Agent | WP-02, WP-25, WP-26, WP-27 | 🟢 Build ✓ — Tests ✓ (100% PASS) | Tríade de Infraestrutura & Automação: MySQL Read-Only Introspection MCP (`mysql-mcp` FastMCP), Worker de Transcrição Whisper & SmartBook (PHP Webhook + FastAPI BackgroundTasks + SurrealDB Graph Link) e Sincronização NTFS Hardlink para Antigravity CLI. |

## 📋 Novos Watchpoints (PLAN-011/PLAN-012/PLAN-013/PLAN-014/PLAN-036)

| ID | Área / Componente | Descrição da Validação Crítica | Tipo de Teste | Frequência |
| :--- | :--- | :--- | :--- | :--- |
| **WP-06** | LMS / Vitrine Exclusiva (Licenciada) | Licenciada sem acesso ao módulo exclusivo vê seção "Módulos Premium" com card bloqueado e botão WhatsApp com CPF | Funcional / UI | A cada Deploy |
| **WP-07** | LMS / Catálogo (Aluna) | Aluna sem acesso vê módulo exclusivo como card bloqueado na aba Catálogo; botão WhatsApp inclui CPF via `aluna?.cpf`; aluna com acesso vê card normal | Funcional / UI | A cada Deploy |
| **WP-08** | LMS / Guia Premium (Licenciada) | Acesso à PremiumPage (/portal-licenciada/premium) via Navbar desktop, BottomNavbar mobile e MobileDrawer; exibição da listagem de módulos exclusivos bloqueados e conteúdo programático expansível. | Funcional / UI | A cada Deploy |
| **WP-09** | LMS / Player HLS (Aluna/Licenciada) | Reprodução de mídias no formato HLS (.m3u8 + fragmentos .ts) através do player com suporte adaptativo e cache local robusto | Funcional / Player | A cada Deploy |
| **WP-10** | LMS / Automação HLS (Batch Process) | A execução do script em lote deve atualizar o banco MySQL sequencialmente, mantendo a CPU estável e gerando fragmentos estáticos corretos e cacheáveis. | Funcional / Lote | A cada Deploy |
| **WP-11** | Infraestrutura / Monitoramento | Integridade e consumo de CPU dos containers da VPS monitorados e saudáveis. | Telemetria | A cada Deploy |
| **WP-12** | LMS / Certificados | Geração dinâmica de certificados em PDF via mPDF no backend e opção de download no frontend após aprovação no Quiz | Funcional / PDF | A cada Deploy |
| **WP-13** | Bot / Telegram Webhook | Recebimento de mensagens via POST /v1/bot/webhook e resposta instantânea (200 OK) com tratamento de handoff | API / Mensageria | A cada Deploy |
| **WP-14** | LMS / Player Fallback | Validação do fallback dinâmico para stream.php em caso de falha física persistente do HLS no player | Resiliência | A cada Deploy |
| **WP-15** | IA / Nvidia NIM | Alternar provedor para Nvidia no painel do Nexus, salvar e validar o fluxo de avaliação clínica no sandbox | Integração | A cada Deploy |
| **WP-16** | Contratos / Assinaturas Digitais | Emissão de contratos a partir de templates, live preview no React, compilação de PDF com mPDF, trilha de auditoria forense SHA-256 e assinatura touch em tela | Funcional / PDF & e-Sign | A cada Deploy |

### Critérios de Aceitação Manual (WP-06, WP-07, WP-08, WP-09, WP-16)
- [x] **Licenciada SEM acesso**: Login no portal da licenciada → Dashboard → seção "Módulos Premium" aparece com card do módulo exclusivo
- [x] **Licenciada SEM acesso**: Card mostra thumbnail escurecida + overlay de cadeado com ícone `#ED7E13` + badge "Premium" dourado
- [x] **Licenciada SEM acesso**: Botão "Solicitar Acesso via WhatsApp" abre link com mensagem pré-formatada contendo CPF
- [x] **Licenciada COM acesso**: Módulo exclusivo aparece normalmente no carrossel de aulas sem overlay de cadeado (seção Premium some)
- [x] **Aluna SEM acesso**: Login no portal da aluna → aba "Catálogo" → módulo exclusivo aparece com badge `🔒 Exclusivo`
- [x] **Aluna SEM acesso**: Botão "Solicitar Acesso" abre WhatsApp com CPF correto da aluna na mensagem
- [x] **Aulas protegidas**: Mesmo com vitrine visível, acessar `/v1/lms/modules/{id}/lessons` de módulo exclusivo sem acesso retorna `403`
- [x] **Player HLS**: Aulas com HLS ativo reproduzem no player nativo de vídeo (Aluna/Licenciada) sem lentidão, carregando os fragmentos estáticos de 10s e mantendo suporte completo a iOS/Safari.
- [x] **Zero regressão**: Login de licenciadas e alunas continua funcionando normalmente (WP-01)
- [x] **Automação HLS (Batch)**: Teste de fumaça executado (`tests/hls_smoke_test.php`) com sucesso atestando a geração correta de m3u8, fragmentos .ts e .htaccess CORS/Cache da CDN sem regressões.
- [x] **Painel Gestor HLS Lote**: Painel HlsBatchConverter renderiza total de vídeos, convertidos e pendentes; botão de conversão ativa polling de 3s enquanto o job está rodando.
- [x] **Monitoramento da VPS (WP-11)**: O script `self-healing.ps1` é executado com sucesso e os containers (`sentinel`, `traefik`, `infrastructure`, `evo-crm-community`) estão todos ativos, saudáveis e com consumption de CPU normalizado.
- [x] **LMS Certificados (WP-12)**: Aprovado no Quiz (nota >= 70%) libera o botão dourado "Baixar Certificado". O download do PDF é compilado e servido instantaneamente em formato de luxo (Navy/Gold) usando mPDF.
- [x] **Telegram Webhook (WP-13)**: O webhook recebe eventos POST do Telegram, responde com 200 OK em milissegundos e gerencia comandos (/start, /id) e dúvidas com encaminhamento para o grupo de suporte.
- [x] **Histórico do Editor Visual**: O editor do admin grava histórico completo das configurações pós-atualização e a aba de "Histórico" permite restaurar qualquer versão anterior.
- [x] **Estabilização HLS (WP-09)**: Removido `lowLatencyMode` e configurados buffers de 30s a 60s no player de alunas e licenciadas. Reprodução fluida e estável em conexões móveis.
- [x] **Fallback do Player (WP-14)**: Limite de 3 retentativas para erros fatais de rede e mídia inseridos em ambos os players. Em caso de falha física contínua do HLS, o fallback para stream.php ocorre em milissegundos sem congelar a interface.
- [x] **Nvidia IA Gateway (WP-15)**: Alternar para Nvidia no painel, atualizar chaves, e processar caso clínico no sandbox atestando recebimento e estruturação JSON sem quebras.
- [x] **Contratos & Assinaturas Digitais (WP-16)**: Emissão de contratos a partir de templates dinâmicos, auto-complete de licenciadas, live-preview com tags variáveis, compilação de PDF oficial com mPDF 8.2, assinatura digital em tela com canvas/touch, gravação de trilha forense (IP, User-Agent, SHA-256) e folha de chancela com QR Code (Lei 14.063/2020). Upload de PDF assinado externamente via gov.br testado com sucesso.
- [x] **Painel Financeiro (PLAN-122)**: Dashboard KPIs, Fechamento Diário, Centros de Custo, Transações Financeiras, Relatório DRE, Webhook Stone, 6 tabelas SQL, 3 Services, 2 Controllers, 4 páginas React — Build OK, Deploy Hostinger, Smoke Test 200 OK.
- [x] **Taxas de Licenciamento (PLAN-132)**: Tabela `licenciada_taxas` + LicenseTaxService + LicenseTaxController + LicenseTaxesPage.jsx (CRUD completo com KPIs, filtros, modais, seed histórica de 13 registros R$ 74.400) + hook automático no OnboardingService + 8 rotas PHP + rotas React no App.jsx + PermissionRouteGuard. Build OK.
- [x] **Sonda Unificada de Saúde CRM (WP-CRM-01)**: Endpoint `/api/v1/crm/health` agregando MySQL, Evolution API, Google SA, Redis e Chatwoot em resposta sub-50ms com agregação `healthy`, `degraded` e `unhealthy` (503).
- [x] **Persistência das 3 Linhas Oficiais WhatsApp (WP-CRM-02)**: Instâncias `juridico`, `licenciadas` e `comercial` ativas na Evolution API v2 com pareamento por QR Code direto no Portal do Gestor e tolerância a falhas (REGRA 60).
- [x] **Google Workspace Service Account (WP-CRM-03)**: Sincronização automatizada da Google Agenda com links de Google Meet, pastas de prontuário no Google Drive e padronização da Google People API (`[Paciente] Nome - Assis/SP`, `👑 [Licenciada] Nome`).
- [x] **Hermes Agent Copilot & Plantão Noturno (WP-CRM-04)**: Webhook integrado ao Chatwoot injetando Notas Privadas Douradas com dosimetria do Protocolo 3S (Cibele), plantão noturno de vendas com links do Congresso (Giovanna) e silenciamento 100% humano no canal Jurídico (Dra. Josi Silva).



