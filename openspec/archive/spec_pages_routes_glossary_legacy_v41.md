# 🗺️ SPEC Global: Páginas, Rotas e Glossário

**Versão:** 4.1 (V102.1 — Dual-Auth + Student Unlock)  
**Data de Atualização:** 2026-05-05  
**Protocolo:** OpenSpec V3.1 (Nexus Era)  
**Arquitetura:** Nexus (React/Vite + PHP 8.4 Nativo + Python Bot)

---

## 1. Glossário Oficial (Fonte da Verdade)

Devem ser usados exatamente estes termos para garantir consistência entre UI, Código e Documentação.

| Termo Oficial                 | Uso            | Definição                                                                                                                                                                                       |
| :---------------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **licenciada**                | UI / Marketing | Identificação oficial das clientes e licenciadas. **Nunca usar "Estudante" ou "Cliente" na interface.**                                                                                         |
| **Licenciada**                | UI / B2B       | licenciada que concluiu o treinamento e possui licença ativa.                                                                                                                                   |
| **Lição**                     | UI / LMS       | Unidade atômica de conteúdo de vídeo/texto. Técnico: `Lesson`.                                                                                                                                  |
| **Aula**                      | UI             | Sinônimo de Lição no contexto do Portal da licenciada.                                                                                                                                          |
| **Módulo**                    | UI / LMS       | Conjunto organizado de lições.                                                                                                                                                                  |
| **Portal Licenciada**         | UI             | Área de aprendizado (LMS) e recursos para licenciadas.                                                                                                                                          |
| **Portal Gestor**             | UI             | Painel Administrativo para gerenciamento do site e licenciadas. Rota técnica: `/admin/*`                                                                                                        |
| **Nexus**                     | Técnico / Dev  | Interface de Superadmin "God Mode" para monitoramento e controle total.                                                                                                                         |
| **Watchtower**                | UI / Nexus     | Módulo de monitoramento de segurança/acesso em tempo real.                                                                                                                                      |
| **War Room**                  | UI / Nexus     | Módulo de analytics estratégico e BI (Business Intelligence).                                                                                                                                   |
| **Signal Tower**              | UI / Nexus     | Módulo de transmissão de mensagens (Broadcasts) e notificações.                                                                                                                                 |
| **The Vault**                 | UI / Nexus     | Repositório de dados sensíveis, FAQ e assets do sistema.                                                                                                                                        |
| **Barracks**                  | UI / Nexus     | Gestão centralizada de usuários e logs de acesso.                                                                                                                                               |
| **Engine Room**               | UI / Nexus     | Monitoramento de saúde do servidor e logs técnicos.                                                                                                                                             |
| **Testing Hub**               | UI / Nexus     | Suítes de testes automatizados e validação de sistema.                                                                                                                                          |
| **Review Hub**                | UI / Nexus     | Revisão de casos clínicos do Doctor Harmony (AI).                                                                                                                                               |
| **Database Room**             | UI / Nexus     | Governança de banco de dados, migrações e exports.                                                                                                                                              |
| **Ops**                       | UI / Nexus     | Operações de segurança, regras de IP e auditoria.                                                                                                                                               |
| **AI Control Tower**          | UI / Nexus     | Controle e configuração do Doctor Harmony (Gemini AI).                                                                                                                                          |
| **Scripts Manager**           | UI / Nexus     | Execução de scripts administrativos e automações.                                                                                                                                               |
| **Doctor Harmony**            | UI / Produto   | Assistente de IA clínica (renomeado de "ANA"). Powered by Gemini 2.0 Flash.                                                                                                                     |
| **Nexus Resilience Engine**   | Técnico        | Sistema de captura de falhas de banco de dados (LazyDb + ResponseCache) que serve dados stale em caso de erro 503.                                                                              |
| **Public Global Cache**       | Técnico        | Estratégia de cache unificado no `ResponseCache` para reduzir conexões MySQL simultâneas.                                                                                                       |
| **Content Studio**            | Técnico / Doc  | Guia pedagógico para criação e organização de cursos no LMS.                                                                                                                                    |
| **NexusSQLite Engine**        | Técnico        | Singleton PDO SQLite (`NexusSQLite.php`) com WAL mode e auto-schema. Armazena audit, firewall e cache do Nexus Admin em `private_uploads/nexus/nexus_ops.db`, zerando conexões MySQL do painel. |
| **Forensic Timeline**         | UI / Nexus     | Componente do Watchtower que rastreia eventos de uma licenciada por CPF (login, aulas, dispositivos, ações admin) em ordem cronológica. Rota: `GET /v1/admin/nexus/watchtower/timeline?cpf=`.   |
| **Anti-False-Positive Guard** | Técnico        | Lógica de detecção de compartilhamento de credenciais baseada em `device_token` (não IP). IPv6 excluído. Janela de 72h. Threshold: `device_count > 3 OR ipv4_count > 2`.                        |
| **Protocol Heal**             | UI / Técnico   | Manutenção ativa: Limpeza de logs > 90 dias + Relatório de integridade CSV.                                                                                                                     |
| **Nexus Sync**                | UI / Técnico   | Motor de sincronização de schema que aplica migrations pendentes em lote.                                                                                                                       |
| **Forensic Student Logs**     | UI / Técnico   | Auditoria de 24h/Completa por licenciada (logins, aulas, downloads, dispositivos). Emojis e Contexto (Módulo/Aula) inclusos.                                                                    |
| **aluna**                     | UI / Marketing | Clientes individuais que compram cursos avulsos. Isoladas das Licenciadas.                                                                                                                      |
| **Portal Aluna**              | UI             | Área de aprendizado dedicada para alunas individuais. Rota: `/portal-aluna/*`                                                                                                                   |
| **Body Harmony Support Bot**  | Produto        | Bot de suporte via Telegram (`@Body_Harmony_Support_bot`) para autoatendimento de licenciadas e alunas. Comandos: /start, /novasenha, /verificarcadastro, /atualizar, /ajuda, /faq.             |
| **BOT_API_KEY**               | Técnico        | Chave secreta no `.env` que autentica requisições do bot Telegram à API PHP. Header: `X-Bot-API-Key`.                                                                                            |
| **telegram_user_id**          | Técnico        | Coluna BIGINT nas tabelas `licenciadas` e `alunas` (V86) que vincula o Telegram ID do usuário ao cadastro para auto-detecção.                                                                    |
| **Magic Link**                | Técnico / UI   | Link de autenticação de uso único (`/auth/magic/{token}`) que permite login instantâneo sem senha. Expira em 30 min.                                                                            |
| **CSAT Score**                | Técnico / BI   | Índice de satisfação do cliente (1-5) coletado após o fechamento de um ticket de suporte. Tabela: `support_feedback`.                                                                          |
| **Admin Dashboard (Bot)**     | UI / Bot       | Comando `/admin` que apresenta pendências de cadastros e tickets diretamente na interface do Telegram para administradores.                                                                    |
| **DbFailover**                | Técnico        | Desativado na V150 (Nexus V3.1). Conexão direta estabelecida com o banco local do container na Hostinger para eliminar latência da VPS antiga da Oracle. |
| **Bidirectional Sync**        | Técnico        | Desativado na V150. Toda infraestrutura e dados do LMS foram consolidados na VPS Hostinger unificada, eliminando replicação com a Oracle. |

---

## 2. Mapeamento de Páginas e Rotas Frontend (React Router)

### 2.1. Público (Website)

| Rota                  | Componente           | Descrição                                   | API Endpoints                         | Visual Identity V3 |
| :-------------------- | :------------------- | :------------------------------------------ | :------------------------------------ | :----------------: |
| `/`                   | `Home.jsx`           | Landing page principal de vendas e branding | `/v1/site_config`, `/v1/testimonials` |         ✅         |
| `/workshop`           | `Workshop.jsx`       | Página do workshop exclusivo                | `/v1/site_config`                     |         ✅         |
| `/mentores`           | `Mentors.jsx`        | Listagem oficial de mentores Body Harmony   | `/v1/mentors`                         |         ✅         |
| `/licenciadas-`       | `licenciadas.jsx`    | Galeria de licenciadas                      | `/v1/licenciadas`                     |         ✅         |
| `/licenciadas`        | `licenciadas.jsx`    | Alias para `/licenciadas-licenciadas` (SEO) | `/v1/licenciadas`                     |         ✅         |
| `/resultados`         | `ResultsGallery.jsx` | Vitrine de transformações reais             | `/v1/results`, `/v1/gallery`          |         ✅         |
| `/depoimentos`        | `Testimonials.jsx`   | Depoimentos de licenciadas                  | `/v1/testimonials`                    |         ✅         |
| `/contato`            | `Contact.jsx`        | Formulário de contato e suporte             | `/v1/leads`                           |         ✅         |
| `/proposta-exclusiva` | `Proposal.jsx`       | Landing page oculta de proposta comercial   | N/A                                   |         ✅         |

### 2.2. Autenticação

| Rota                 | Componente        | Descrição                   | API Endpoints               | Segurança |
| :------------------- | :---------------- | :-------------------------- | :-------------------------- | :-------: |
| `/portal-licenciada` | `PortalLogin.jsx` | Login de licenciadas (LMS)  | `/v1/auth/licenciada/login` |  Public   |
| `/portal-aluna`      | `AlunaLogin.jsx`  | Login de alunas individuais | `/v1/auth/aluna/login`      |  Public   |
| `/admin`             | `AdminLogin.jsx`  | Login Admin/Superadmin      | `/v1/auth/login`            |  Public   |

### 2.3. Portal Licenciada (LMS)

| Rota                               | Componente                | Descrição                                         | API Endpoints                                                         |    Role    |
| :--------------------------------- | :------------------------ | :------------------------------------------------ | :-------------------------------------------------------------------- | :--------: |
| `/portal-licenciada/dashboard`     | `PortalDashboard.jsx`     | Dashboard principal (Listagem de Módulos)         | `/v1/lms/modules`, `/v1/doctor-harmony/credits`                       | Licenciada |
| `/portal-licenciada/minhas-aulas`  | `MyLessonsPage.jsx`       | Biblioteca de aulas disponíveis                   | `/v1/lms/modules`, `/v1/lms/modules/{id}/lessons`                     | Licenciada |
| `/portal-licenciada/meu-progresso` | `ProgressPage.jsx`        | Progresso e estatísticas da licenciada            | `/v1/licenciada/progress`                                             | Licenciada |
| `/portal-licenciada/biblioteca`    | `ResourceLibraryPage.jsx` | Biblioteca de recursos complementares             | `/v1/lms/resources`                                                   | Licenciada |
| `/portal-licenciada/suporte-ia`    | `SupportIAPage.jsx`       | Transição p/ Suporte Inteligente                  | N/A                                                                   | Licenciada |
| `/portal-licenciada/mentoria-ia`   | `MentorIAPage.jsx`        | Mentoria com Doctor Harmony (AI)                  | `/v1/doctor-harmony/evaluate`, `/v1/doctor-harmony/credits`           | Licenciada |
| `/portal-licenciada/perfil`        | `ProfilePage.jsx`         | Perfil e configurações da licenciada              | `/v1/auth/licenciada/validate`, `/v1/auth/licenciada/change_password` | Licenciada |
| `/portal-licenciada/nova-senha`    | `ForceChangePassword.jsx` | Troca obrigatória de senha no primeiro acesso     | `/v1/auth/licenciada/first-access`                                    | Licenciada |
| `/portal-licenciada/faq`           | `Faq.jsx`                 | Perguntas frequentes interativas                  | `/v1/faq`                                                             | Licenciada |
| `/lms`                             | `PortalDashboard.jsx`     | Alias técnico para `/portal-licenciada/dashboard` | `/v1/lms/modules`                                                     | Licenciada |
| `/lms/modulo/:id`                  | `ModuleView.jsx`          | Visualização de módulo específico                 | `/v1/lms/modules/{id}/lessons`                                        | Licenciada |
| `/lms/aula/:id`                    | `LessonPlayer.jsx`        | Player de vídeo e material complementar           | `/v1/lms/sign-url`, `/v1/lms/progress`                                | Licenciada |

### 2.4. Portal Gestor (Admin)

| Rota                   | Componente               | Descrição                                     | API Endpoints                                  |    Role    |
| :--------------------- | :----------------------- | :-------------------------------------------- | :--------------------------------------------- | :--------: |
| `/admin/dashboard`     | `Dashboard.jsx`          | Visão geral de novos leads e métricas rápidas | `/v1/admin/analytics/stats`                    |   Admin    |
| `/portal-gestor/contratos` | `ContractsManager.jsx`  | Gestão de Contratos e Assinaturas Digitais    | `/v1/admin/contracts/*`                        |   Admin    |
| `/portal-gestor/mensagens` | `WhatsAppMessagesManager.jsx` | Central de Mensagens WhatsApp (Modelos & Envio)| `/v1/admin/whatsapp-templates/*`              |   Admin    |
| `/admin/licenciadas`   | `licenciadasManager.jsx` | Gestão de licenciadas (CRUD)                  | `/v1/licenciadas/*`, `/v1/admin/licenciadas/*` |   Admin    |
| `/admin/lms`           | `AdminLMS.jsx`           | Studio de criação de módulos, aulas e gestão  | `/v1/admin/lms/*`                              |   Admin    |
| `/admin/textos`        | `ContentManager.jsx`     | Editor de textos fixos do site                | `/v1/site_config`, `/v1/admin/site_config`     |   Admin    |
| `/admin/aparencia`     | `ThemeManager.jsx`       | Editor de cores e tokens (V3 Standards)       | `/v1/site_config`, `/v1/admin/site_config`     |   Admin    |
| `/admin/mentores`      | `MentorsManager.jsx`     | CRUD de mentores                              | `/v1/mentors`, `/v1/admin/mentors/*`           |   Admin    |
| `/admin/imagens`       | `ImageManager.jsx`       | Gerenciamento de mídia e uploads              | `/v1/admin/media/*`                            |   Admin    |
| `/admin/resultados`    | `ResultsManager.jsx`     | CRUD de resultados/transformações             | `/v1/results/*`                                |   Admin    |
| `/admin/depoimentos`   | `TestimonialManager.jsx` | CRUD de depoimentos                           | `/v1/testimonials`, `/v1/admin/testimonials/*` |   Admin    |
| `/admin/visual-editor` | `VisualEditor.jsx`       | Editor No-code em tempo real para seções      | N/A (Frontend only — sem backend)              |   Admin    |
| `/admin/leads`         | `LeadsManager.jsx`       | Triagem de formulários de contato             | `/v1/admin/leads`, `/v1/admin/leads/*`         |   Admin    |
| `/admin/faq`           | `FaqManager.jsx`         | Gestão de perguntas frequentes                | `/v1/faq`, `/v1/faq/*`                         |   Admin    |
| `/admin/configuracoes` | `SiteSettings.jsx`       | Configurações globais do site                 | `/v1/site_config`, `/v1/admin/site_config`     |   Admin    |
| `/admin/seguranca`     | `SecurityDashboard.jsx`  | Auditoria básica de segurança                 | N/A                                            | Superadmin |

### 2.5. Nexus (Superadmin God Mode)

| Rota                  | Componente                | Descrição                                    | API Endpoints                                                      |       Role       |
| :-------------------- | :------------------------ | :------------------------------------------- | :----------------------------------------------------------------- | :--------------: |
| `/nexus`              | `NexusGatekeeper.jsx`     | Portão de autenticação militarizada          | N/A                                                                | Admin/Superadmin |
| `/nexus/home`         | `NexusHome.jsx`           | Dashboard central do Nexus                   | `/v1/admin/nexus/system-status`                                    | Admin/Superadmin |
| `/nexus/watchtower`   | `NexusWatchtower.jsx`     | Dashboard de segurança ativa e monitoramento | `/v1/admin/analytics/watchtower`                                   | Admin/Superadmin |
| `/nexus/war-room`     | `NexusWarRoom.jsx`        | BI e Analytics de engajamento de licenciadas | `/v1/admin/analytics/war-room`, `/v1/admin/nexus/security-metrics` | Admin/Superadmin |
| `/nexus/barracks`     | `NexusBarracks.jsx`       | Gerenciamento de acessos, usuários e bans    | `/v1/admin/users`, `/v1/admin/admins`                              | Admin/Superadmin |
| `/nexus/engine`       | `NexusEngineRoom.jsx`     | Saúde do servidor e logs técnicos            | `/v1/admin/health`, `/v1/admin/logs`                               | Admin/Superadmin |
| `/nexus/signal-tower` | `NexusSignalTower.jsx`    | Central de Broadcasts globais                | `/v1/admin/broadcasts`                                             | Admin/Superadmin |
| `/nexus/testing-hub`  | `NexusTestingHub.jsx`     | Suítes de testes automatizados               | `/v1/admin/nexus/tests/*`                                          | Admin/Superadmin |
| `/nexus/review-hub`   | `licenciadaReviewHub.jsx` | Revisão de casos clínicos Doctor Harmony     | `/v1/admin/doctor-harmony/cases/pending`                           | Admin/Superadmin |
| `/nexus/vault`        | `NexusVault.jsx`          | Gestão de configurações core e FAQ           | `/v1/faq`                                                          | Admin/Superadmin |
| `/nexus/database`     | `NexusDatabase.jsx`       | Governança de banco de dados                 | `/v1/admin/nexus/db/*`                                             | Admin/Superadmin |
| `/nexus/ops`          | `NexusOps.jsx`            | Operações de segurança e regras de IP        | `/v1/nexus/ops/*`                                                  | Admin/Superadmin |
| `/nexus/ai-control`   | `NexusAIControl.jsx`      | Controle e configuração Doctor Harmony       | `/v1/admin/doctor-harmony/*`                                       | Admin/Superadmin |
| `/nexus/scripts`      | `NexusScriptsManager.jsx` | Execução de scripts administrativos          | `/v1/nexus/scripts/*`                                              | Admin/Superadmin |

---

## 3. Mapeamento de Rotas Backend (API v1)

### 3.1. System & Health

| Endpoint   | Método | Descrição                          | Categoria |   Segurança    |
| :--------- | :----: | :--------------------------------- | :-------- | :------------: |
| `/v1/ping`    |  GET   | Health Check do servidor             | System    |     Public     |
| `/v1/ping/db` |  GET   | Health Check DB (nó ativo + latência) | System    |     Public     |
| `/v1/me`      |  GET   | Informações do usuário autenticado   | System    | Token Required |

### 3.2. Autenticação

| Endpoint                              | Método | Descrição                           | Categoria |    Segurança     |
| :------------------------------------ | :----: | :---------------------------------- | :-------- | :--------------: |
| `/v1/auth/login`                      |  POST  | Login Admin/Superadmin              | Auth      |      Public      |
| `/v1/auth/licenciada/login`           |  POST  | Login de licenciadas (LMS)          | Auth      |      Public      |
| `/v1/auth/aluna/login`                |  POST  | Login de alunas individuais         | Auth      |      Public      |
| `/v1/auth/licenciada/validate`        |  GET   | Validação de sessão de licenciada   | Auth      | Licenciada Token |
| `/v1/auth/aluna/validate`             |  GET   | Validação de sessão de aluna        | Auth      |   Aluna Token    |
| `/v1/auth/licenciada/change_password` |  POST  | Troca de senha de licenciada        | Auth      | Licenciada Token |
| `/v1/auth/aluna/change_password`      |  POST  | Troca de senha de aluna             | Auth      |   Aluna Token    |
| `/v1/auth/licenciada/first-access`    |  POST  | Primeiro acesso (troca obrigatória) | Auth      | Licenciada Token |
| `/v1/auth/aluna/first-access`         |  POST  | Primeiro acesso aluna               | Auth      |   Aluna Token    |
| `/v1/auth/admin/change_password`      |  POST  | Troca de senha admin                | Auth      |   Admin Token    |
| `/v1/auth/magic/{token}`              |  GET   | Autenticação automática via Magic Link | Auth      |      Public      |

### 3.3. LMS - Licenciada

| Endpoint                       | Método | Descrição                            | Categoria |    Segurança     |
| :----------------------------- | :----: | :----------------------------------- | :-------- | :--------------: |
| `/v1/lms/modules`              |  GET   | Listagem de módulos para licenciadas | LMS       | Licenciada Token |
| `/v1/lms/modules/{id}/lessons` |  GET   | Conteúdo do módulo (Aulas)           | LMS       | Licenciada Token |
| `/v1/lms/resources`            |  GET   | Biblioteca de recursos               | LMS       | Licenciada Token |
| `/v1/lms/thumbnail/{filename}` |  GET   | Serve thumbnail de aula              | LMS       |      Public      |
| `/v1/lms/progress`             |  POST  | Salva progresso de aula              | LMS       | Licenciada Token |
| `/v1/lms/sign-url`             |  POST  | Gera URL assinada para vídeo         | LMS       | Licenciada Token |
| `/v1/lms/quiz`                 |  GET   | Obtém quiz do módulo                 | LMS       | Licenciada Token |
| `/v1/lms/quiz/submit`          |  POST  | Submete quiz                         | LMS       | Licenciada Token |
| `/v1/lms/certificate/generate` |  POST  | Gera certificado de conclusão        | LMS       | Licenciada Token |

### 3.4. LMS - Admin

| Endpoint                               | Método | Descrição                      | Categoria | Segurança |
| :------------------------------------- | :----: | :----------------------------- | :-------- | :-------: |
| `/v1/admin/lms/dashboard`              |  GET   | Métricas de engajamento global | LMS Admin |   Admin   |
| `/v1/admin/lms/modules`                |  GET   | Lista módulos (admin)          | LMS Admin |   Admin   |
| `/v1/admin/lms/modules`                |  POST  | Cria módulo                    | LMS Admin |   Admin   |
| `/v1/admin/lms/modules`                |  PUT   | Atualiza módulo                | LMS Admin |   Admin   |
| `/v1/admin/lms/modules/{id}`           | DELETE | Deleta módulo                  | LMS Admin |   Admin   |
| `/v1/admin/lms/modules/reorder`        | PATCH  | Reordena módulos               | LMS Admin |   Admin   |
| `/v1/admin/lms/modules/{id}/status`    | PATCH  | Atualiza status de módulo      | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons`                |  POST  | Cria aula                      | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons`                |  PUT   | Atualiza aula                  | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/{id}`           | DELETE | Deleta aula                    | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/reorder`        | PATCH  | Reordena aulas                 | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/{id}/status`    | PATCH  | Atualiza status de aula        | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/{id}/file-info` |  GET   | Info de arquivo de aula        | LMS Admin |   Admin   |
| `/v1/admin/lms/upload-chunk`           |  POST  | Upload de chunk de vídeo       | LMS Admin |   Admin   |
| `/v1/admin/lms/upload-thumbnail`       |  POST  | Upload de thumbnail            | LMS Admin |   Admin   |
| `/v1/admin/lms/attachments`            |  POST  | Upload de anexo                | LMS Admin |   Admin   |
| `/v1/admin/lms/attachments/{id}`       | DELETE | Deleta anexo                   | LMS Admin |   Admin   |
| `/v1/admin/lms/sign-url`               |  POST  | Gera URL assinada (admin)      | LMS Admin |   Admin   |
| `/v1/admin/quiz`                       |  GET   | Obtém quiz (admin)             | LMS Admin |   Admin   |
| `/v1/admin/quiz`                       |  POST  | Salva quiz                     | LMS Admin |   Admin   |
| `/v1/gestor/lms/licenciadas`           |  GET   | Lista licenciadas do LMS       | LMS Admin |   Admin   |
| `/v1/admin/lms/exclusive-access/list`  |  GET   | Lista acessos exclusivos ativos | LMS Admin |   Admin   |
| `/v1/admin/lms/exclusive-access/targets` |  GET  | Lista alvos licenciadas/módulos  | LMS Admin |   Admin   |
| `/v1/admin/lms/exclusive-access/grant`  |  POST  | Concede acesso a módulo excl.   | LMS Admin |   Admin   |
| `/v1/admin/lms/exclusive-access/revoke` |  POST  | Revoga acesso a módulo excl.    | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/convert-hls-batch` |  POST  | Dispara conversão HLS em lote   | LMS Admin |   Admin   |
| `/v1/admin/lms/lessons/convert-hls-batch-status` | GET | Consulta status da conversão em lote | LMS Admin | Admin |

### 3.5. Conteúdo Público

| Endpoint                | Método | Descrição                             | Categoria | Segurança |
| :---------------------- | :----: | :------------------------------------ | :-------- | :-------: |
| `/v1/site_config`       |  GET   | Parametrização global do site         | Config    |  Public   |
| `/v1/mentors`           |  GET   | Lista mentores                        | Content   |  Public   |
| `/v1/testimonials`      |  GET   | Lista depoimentos                     | Content   |  Public   |
| `/v1/gallery`           |  GET   | Lista galeria                         | Content   |  Public   |
| `/v1/results`           |  GET   | Lista resultados (ResponseCache 300s) | Content   |  Public   |
| `/v1/licenciadas`       |  GET   | Lista licenciadas/licenciadas         | Content   |  Public   |
| `/v1/licenciadas/{id}`  |  GET   | Detalhes de licenciada                | Content   |  Public   |
| `/v1/faq`               |  GET   | Lista FAQs                            | Content   |  Public   |
| `/v1/leads`             |  POST  | Cria lead (formulário contato)        | Content   |  Public   |
| `/v1/broadcasts/active` |  GET   | Broadcasts ativos                     | Content   |  Public   |

### 3.6. Administração - Content

| Endpoint                      | Método | Descrição                | Categoria |  Segurança  |
| :---------------------------- | :----: | :----------------------- | :-------- | :---------: |
| `/v1/admin/site_config`       |  POST  | Atualiza configurações   | Config    |    Admin    |
| `/v1/admin/mentors`           |  POST  | Cria mentor              | Content   |    Admin    |
| `/v1/admin/mentors/{id}`      |  PUT   | Atualiza mentor          | Content   |    Admin    |
| `/v1/admin/mentors/{id}`      | DELETE | Deleta mentor            | Content   |    Admin    |
| `/v1/admin/testimonials`      |  POST  | Cria depoimento          | Content   |    Admin    |
| `/v1/admin/testimonials/{id}` | DELETE | Deleta depoimento        | Content   |    Admin    |
| `/v1/admin/gallery/{id}`      |  PUT   | Atualiza item de galeria | Content   |    Admin    |
| `/v1/admin/gallery/{id}`      | DELETE | Deleta item de galeria   | Content   |    Admin    |
| `/v1/results`                 |  POST  | Cria resultado           | Content   | Admin Token |
| `/v1/results/{id}`            |  PUT   | Atualiza resultado       | Content   | Admin Token |
| `/v1/results/{id}`            | DELETE | Deleta resultado         | Content   | Admin Token |
| `/v1/faq`                     |  POST  | Cria FAQ                 | Content   | Admin Token |
| `/v1/faq/{id}`                |  PUT   | Atualiza FAQ             | Content   | Admin Token |
| `/v1/faq/{id}`                | DELETE | Deleta FAQ               | Content   | Admin Token |

### 3.7. Administração - Users & Leads

| Endpoint                       | Método | Descrição           | Categoria |  Segurança  |
| :----------------------------- | :----: | :------------------ | :-------- | :---------: |
| `/v1/licenciadas`              |  POST  | Cria licenciada     | Users     | Admin Token |
| `/v1/licenciadas/{id}`         |  PUT   | Atualiza licenciada | Users     | Admin Token |
| `/v1/licenciadas/{id}`         | DELETE | Deleta licenciada   | Users     | Admin Token |
| `/v1/admin/licenciadas/export` |  GET   | Exporta licenciadas | Users     |    Admin    |
| `/v1/admin/licenciadas`        |  POST  | Cria licenciada     | Users     |    Admin    |
| `/v1/admin/licenciadas/{id}`   |  POST  | Atualiza licenciada | Users     |    Admin    |
| `/v1/admin/leads`              |  GET   | Lista leads         | Leads     |    Admin    |
| `/v1/admin/leads/{id}`         |  PUT   | Atualiza lead       | Leads     |    Admin    |
| `/v1/admin/leads/{id}`         | DELETE | Deleta lead         | Leads     |    Admin    |
| `/v1/admin/alunas/{id}/unlock` |  POST  | Desbloqueia aluna   | Users     |    Admin    |

### 3.8. Media Browser

| Endpoint                       | Método | Descrição                 | Categoria | Segurança |
| :----------------------------- | :----: | :------------------------ | :-------- | :-------: |
| `/v1/admin/media/list`         |  GET   | Lista arquivos de mídia   | Media     |   Admin   |
| `/v1/admin/media/track-usage`  |  POST  | Rastreia uso de arquivo   | Media     |   Admin   |
| `/v1/admin/media/batch-delete` | DELETE | Deleta múltiplos arquivos | Media     |   Admin   |
| `/v1/admin/media/update/{id}`  |  PUT   | Atualiza metadados        | Media     |   Admin   |
| `/v1/admin/media/upload`       |  POST  | Upload de arquivo         | Media     |   Admin   |
| `/v1/admin/media/sync`         |  POST  | Sincroniza com filesystem | Media     |   Admin   |

### 3.9. Biblioteca de Recursos

| Endpoint                         | Método | Descrição       | Categoria | Segurança |
| :------------------------------- | :----: | :-------------- | :-------- | :-------: |
| `/v1/admin/library`              |  GET   | Lista recursos  | Library   |   Admin   |
| `/v1/admin/library`              |  POST  | Cria recurso    | Library   |   Admin   |
| `/v1/admin/library/{id}`         | DELETE | Deleta recurso  | Library   |   Admin   |
| `/v1/admin/library/{id}/approve` | PATCH  | Aprova recurso  | Library   |   Admin   |
| `/v1/admin/library/{id}/reject`  | PATCH  | Rejeita recurso | Library   |   Admin   |
| `/v1/admin/library/{id}/grant`   |  POST  | Concede acesso  | Library   |   Admin   |

### 3.10. Nexus - Analytics & Monitoring

| Endpoint                           | Método | Descrição                    | Categoria | Segurança |
| :--------------------------------- | :----: | :--------------------------- | :-------- | :-------: |
| `/v1/admin/analytics/watchtower`   |  GET   | Feed de alertas de segurança | Nexus     |   Admin   |
| `/v1/admin/analytics/war-room`     |  GET   | Métricas War Room            | Nexus     |   Admin   |
| `/v1/admin/analytics/stats`        |  GET   | Estatísticas gerais          | Nexus     |   Admin   |
| `/v1/admin/analytics/bot-stats`    |  GET   | Estatísticas de tickets bot  | Nexus     |   Admin   |
| `/v1/admin/nexus/system-status`    |  GET   | Status do sistema            | Nexus     |   Admin   |
| `/v1/admin/nexus/security-metrics` |  GET   | Métricas de segurança        | Nexus     |   Admin   |

### 3.11. Nexus - User Management

| Endpoint                       | Método | Descrição                | Categoria | Segurança |
| :----------------------------- | :----: | :----------------------- | :-------- | :-------: |
| `/v1/admin/users`              |  GET   | Gestão Nexus de usuários | Nexus     |   Admin   |
| `/v1/admin/users`              |  POST  | Gerencia usuário         | Nexus     |   Admin   |
| `/v1/admin/users/check-access` |  POST  | Diagnóstico de acesso    | Nexus     |   Admin   |
| `/v1/admin/impersonate`        |  POST  | Impersonar usuário       | Nexus     |   Admin   |
| `/v1/admin/admins`             |  GET   | Lista administradores    | Nexus     |   Admin   |
| `/v1/admin/admins`             |  POST  | Gerencia administrador   | Nexus     |   Admin   |
| `/v1/admin/sessions`           |  GET   | Lista sessões ativas     | Nexus     |   Admin   |
| `/v1/admin/sessions/terminate` |  POST  | Termina sessão           | Nexus     |   Admin   |

### 3.12. Nexus - System Operations

| Endpoint                    | Método | Descrição                  | Categoria | Segurança |
| :-------------------------- | :----: | :------------------------- | :-------- | :-------: |
| `/v1/admin/health`          |  GET   | Status de saúde do sistema | Nexus     |   Admin   |
| `/v1/admin/logs`            |  GET   | Logs do sistema            | Nexus     |   Admin   |
| `/v1/admin/maintenance`     |  POST  | Toggle modo manutenção     | Nexus     |   Admin   |
| `/v1/admin/flush-cache`     |  POST  | Limpa cache                | Nexus     |   Admin   |
| `/v1/admin/broadcasts`      |  GET   | Lista broadcasts           | Nexus     |   Admin   |
| `/v1/admin/broadcasts`      |  POST  | Gerencia broadcast         | Nexus     |   Admin   |
| `/v1/admin/broadcasts/{id}` | DELETE | Deleta broadcast           | Nexus     |   Admin   |

### 3.13. Nexus - Database Governance

| Endpoint                            | Método | Descrição                           | Categoria | Segurança  |
| :---------------------------------- | :----: | :---------------------------------- | :-------- | :--------: |
| `/v1/admin/nexus/db/status`         |  GET   | Status do banco (Nexus)             | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/rebuild`        |  POST  | Rebuild do banco                    | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/migrations`     |  GET   | Lista migrações                     | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/migrations/run` |  POST  | Executa migração                    | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/seeds`          |  GET   | Lista seeds                         | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/seeds/run`      |  POST  | Executa seed                        | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/scripts`        |  GET   | Lista scripts                       | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/export`         |  POST  | Exporta banco                       | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/download`       |  GET   | Download de snapshot                | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/heal`           |  POST  | Protocol Heal (Limpeza + Relatório) | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/sync`           |  POST  | Nexus Sync (Batch Migration)        | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/upload`         |  POST  | Migration Upload (Arquivo .sql)     | Nexus DB  |   Admin    |
| `/v1/admin/nexus/db/switch`         |  POST  | Switch Active Node (Env update)     | Nexus DB  | Superadmin |

### 3.14. Nexus - Testing & Scripts

| Endpoint                       | Método | Descrição                 | Categoria     | Segurança |
| :----------------------------- | :----: | :------------------------ | :------------ | :-------: |
| `/v1/admin/nexus/tests/suites` |  GET   | Lista suítes de teste     | Nexus Test    |   Admin   |
| `/v1/admin/nexus/tests/run`    |  POST  | Executa teste             | Nexus Test    |   Admin   |
| `/v1/admin/nexus/tests/status` |  GET   | Status de teste           | Nexus Test    |   Admin   |
| `/v1/nexus/scripts/list`       |  GET   | Lista scripts disponíveis | Nexus Scripts |   Admin   |
| `/v1/nexus/scripts/execute`    |  POST  | Executa script            | Nexus Scripts |   Admin   |
| `/v1/nexus/scripts/history`    |  GET   | Histórico de execuções    | Nexus Scripts |   Admin   |

### 3.15. Nexus - Security Operations

| Endpoint                            | Método | Descrição                               | Categoria | Segurança |
| :---------------------------------- | :----: | :-------------------------------------- | :-------- | :-------: |
| `/v1/nexus/ops/rules`               |  GET   | Obtém regras de segurança               | Nexus Ops |   Admin   |
| `/v1/nexus/ops/rules`               |  POST  | Atualiza regras                         | Nexus Ops |   Admin   |
| `/v1/nexus/ops/audit`               |  GET   | Logs de auditoria                       | Nexus Ops |   Admin   |
| `/v1/nexus/ops/ip-rules`            |  POST  | Gerencia regras de IP                   | Nexus Ops |   Admin   |
| `/v1/nexus/ops/trust-device`        |  POST  | Marca dispositivo como confiável        | Nexus Ops |   Admin   |
| `/v1/gestor/lms/students/{id}/logs` |  GET   | Auditoria forense de licenciada (V66.3) | LMS Admin |   Admin   |

### 3.16. Doctor Harmony (AI Clinical)

| Endpoint                                     | Método | Descrição                  | Categoria |    Segurança     |
| :------------------------------------------- | :----: | :------------------------- | :-------- | :--------------: |
| `/v1/doctor-harmony/credits`                 |  GET   | Obtém créditos disponíveis | AI        |      Public      |
| `/v1/doctor-harmony/evaluate`                |  POST  | Avaliação clínica (AI)     | AI        | Licenciada Token |
| `/v1/admin/doctor-harmony/cases/pending`     |  GET   | Casos pendentes de revisão | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/cases/{id}/review` |  POST  | Submete revisão de caso    | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/config`            |  GET   | Obtém configuração         | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/config`            |  POST  | Atualiza configuração      | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/audit`             |  GET   | Logs de auditoria          | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/health`            |  GET   | Health check               | AI Admin  |      Admin       |
| `/v1/admin/doctor-harmony/sandbox`           |  POST  | Sandbox de teste           | AI Admin  |      Admin       |

### 3.17. Telegram Bot API (V88)

| Endpoint                                  | Método | Descrição                                   | Categoria |    Segurança     |
| :---------------------------------------- | :----: | :------------------------------------------ | :-------- | :--------------: |
| `/v1/bot/find-by-cpf?cpf=XXX`             |  GET   | Busca usuário por CPF                       | Bot       |   BOT_API_KEY    |
| `/v1/bot/find-by-name?name=XXX`           |  GET   | Busca usuário por nome                      | Bot       |   BOT_API_KEY    |
| `/v1/bot/find-by-email?email=XXX`         |  GET   | Busca usuário por email                     | Bot       |   BOT_API_KEY    |
| `/v1/bot/find-by-whatsapp?phone=XXX`      |  GET   | Busca usuário por WhatsApp                  | Bot       |   BOT_API_KEY    |
| `/v1/bot/find-by-telegram?id=XXX`         |  GET   | Busca usuário por Telegram ID               | Bot       |   BOT_API_KEY    |
| `/v1/bot/profile/{type}/{id}`             |  GET   | Obtém perfil completo                       | Bot       |   BOT_API_KEY    |
| `/v1/bot/profile/{type}/{id}`             |  PUT   | Atualiza perfil (whatsapp, instagram, etc)  | Bot       |   BOT_API_KEY    |
| `/v1/bot/reset-password/{type}/{id}`      |  POST   | Gera senha temporária (expira em 15 min)   | Bot       |   BOT_API_KEY    |

### 3.18. Portal da Licenciada (Rotas Específicas)

| Endpoint                  | Método | Descrição               | Categoria  |    Segurança     |
| :------------------------ | :----: | :---------------------- | :--------- | :--------------: |
| `/v1/licenciada/progress` |  GET   | Progresso da licenciada | Licenciada | Licenciada Token |
| `/v1/licenciada/lessons`  |  GET   | Aulas da licenciada     | Licenciada | Licenciada Token |

---

## 4. Governança de Nomenclatura

### 4.1. Padrões Identificados

| Contexto            | Padrão Atual | Status OpenSpec |
| ------------------- | ------------ | --------------- |
| Frontend Routes     | `kebab-case` | ✅ Consistente  |
| Frontend Components | `PascalCase` | ✅ Consistente  |
| Backend Endpoints   | `snake_case` | ✅ Consistente  |
| Controllers         | `PascalCase` | ✅ Consistente  |
| Database Tables     | `snake_case` | ✅ Consistente  |
| Variáveis JS        | `camelCase`  | ✅ Consistente  |

### 4.2. Regras de Nomenclatura

1. **Componentes React:** Devem seguir o Glossário Oficial. Ex: `licenciadasManager.jsx` em vez de `StudentManager.jsx`, `licenciadaGuard.jsx` em vez de `StudentGuard.jsx`.
2. **API Endpoints:** Devem ser em Inglês, seguindo padrões REST (plural). Ex: `/v1/students`, `/v1/lessons`.
3. **Variáveis:** Devem usar Inglês (ex: `lessonsWatched`, `moduleProgress`).
4. **UI Content:** Deve ser em Português-BR, seguindo tom de voz **Empático** e **Premium**.
5. **Database:** Tabelas e colunas em `snake_case` (ex: `student_progress`, `lesson_id`).

### 4.3. Aliases e Duplicações

| Rota Principal                 | Alias              | Motivo                         | Status        |
| ------------------------------ | ------------------ | ------------------------------ | ------------- |
| `/licenciadas-licenciadas`     | `/licenciadas`     | SEO & Usabilidade              | ✅ Mantido    |
| `/portal-licenciada/dashboard` | `/lms`             | Compatibilidade técnica/legada | ✅ Mantido    |
| `/admin/*`                     | `/portal-gestor/*` | Termo UI vs Rota técnica       | ⚠️ Consolidar |

---

## 5. Auditoria de Conflitos e Inconsistências

### 5.1. Páginas Órfãs (Frontend sem Backend)

| Página             | Rota                   | Status           | Ação Recomendada                                     |
| ------------------ | ---------------------- | ---------------- | ---------------------------------------------------- |
| `VisualEditor.jsx` | `/admin/visual-editor` | ⚠️ Frontend Only | Implementar backend ou documentar como frontend-only |

### 5.2. Endpoints Órfãos (Backend sem Frontend)

| Endpoint          | Controller               | Status        | Ação Recomendada                                                      |
| ----------------- | ------------------------ | ------------- | --------------------------------------------------------------------- |
| `/v1/admin/nudge` | Legacy file              | ⚠️ Legacy     | Refatorar para `NudgeController.php`                                  |
| `/v1/admin/db/*`  | `DatabaseController.php` | 🗑️ DEPRECATED | **Removido.** Funcionalidades consolidadas em `NexusDbController.php` |

### 5.3. Consolidação de Rotas Admin

> [!IMPORTANT]
> **Inconsistência Identificada:** O código usa `/admin/*` mas a documentação anterior mencionava `/portal-gestor/*`.
>
> **Decisão:** A rota técnica oficial é `/admin/*`. O termo "Portal Gestor" é usado apenas na UI/UX para clareza semântica.

### 5.4. Consolidação de Alias LMS

> [!NOTE]
> **Alias `/lms`:** Mantido para compatibilidade técnica e integridade de links legados. A rota oficial para navegação é `/portal-licenciada/dashboard`.

---

## 6. Estatísticas do Sistema

| Métrica                        | Valor |
| ------------------------------ | ----- |
| **Total de Rotas Frontend**    | 54    |
| **Rotas Públicas**             | 9     |
| **Rotas Admin**                | 13    |
| **Rotas Portal Licenciada**    | 10    |
| **Rotas Nexus**                | 14    |
| **Total de Endpoints Backend** | 120+  |
| **Controllers**                | 28    |
| **Endpoints Públicos**         | 15    |
| **Endpoints Admin**            | 85+   |
| **Endpoints Student**          | 20+   |

---

## 7. Conformidade Visual Identity V3.1

### 7.1. Cores Primárias

| Cor                | Código    | Uso              | Status        |
| ------------------ | --------- | ---------------- | ------------- |
| Navy Blue (Master) | `#0A3E60` | Principal        | ✅ Verificado |
| Navy Blue (Darker) | `#051A29` | Variant          | ✅ Verificado |
| Gold (Authority)   | `#ED7E13` | Primário         | ✅ Verificado |
| Gold (Secondary)   | `#DD8F39` | Hover            | ✅ Verificado |
| White              | `#FFFFFF` | Superfície       | ✅ Verificado |
| Off-white          | `#F5F5F5` | Layouts técnicos | ✅ Verificado |

### 7.2. Tipografia

| Uso      | Fonte                 | Aplicação                        | Status        |
| -------- | --------------------- | -------------------------------- | ------------- |
| Headings | Montserrat ou Oswald  | All Caps para títulos de impacto | ✅ Verificado |
| Body     | Montserrat ou Poppins | Legibilidade                     | ✅ Verificado |

### 7.3. Assets

| Asset        | Localização                                 | Status        |
| ------------ | ------------------------------------------- | ------------- |
| Logo/Favicon | `src/frontend/src/assets/icons/BH-icon.svg` | ✅ Verificado |

---

## 8. Próximos Passos (Roadmap)

### 8.1. Refatorações Prioritárias

1. **Migrar `/v1/admin/nudge`** de arquivo legacy para `NudgeController.php`
2. **Implementar backend para `VisualEditor.jsx`** (se necessário) ou documentar como frontend-only
3. **Consolidar rotas duplicadas** de Database (`DatabaseController` vs `NexusDbController`)
4. **Adicionar testes automatizados** para rotas críticas (Auth, LMS, Doctor Harmony)

### 8.2. Documentação Adicional

1. **Criar OpenAPI Spec** completo em `openspec/master/openapi.yaml`
2. **Documentar fluxos de autenticação** em `openspec/master/authentication-flows.md`
3. **Mapear permissões por role** em `openspec/master/rbac-matrix.md`

---

**Versão:** 4.1 (V102.1 — Dual-Auth + Student Unlock)  
**Última Atualização:** 2026-05-05  
**Gerado por:** Antigravity (OpenSpec V3.1)  
**Protocolo:** Nexus Protocol V3.1
