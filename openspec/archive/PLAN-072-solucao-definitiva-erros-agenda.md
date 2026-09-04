# 🎯 Objetivo Fullstack (PLAN-072)
Erradicar de forma definitiva todos os erros 500, inconsistências de tipo de conexão MySQL e falhas de persistência de eventos no módulo de Agenda Compartilhada dos Gestores (`/portal-gestor/agenda`), através do padrão de auto-ensure em runtime (ADR-008), desacoplamento de drivers e blindagem de formulário.

---

## 🏛️ Análise Socrática dos Erros de `tmp/agenda.log`

### ❓ Pergunta 1: O que é o erro `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'gestor_agenda_events' doesn't exist`?
- **Por que ele acontece?** O backend da aplicação foi desenvolvido com novas funcionalidades que dependem das tabelas `gestor_agenda_events`, `gestor_agenda_status_logs`, `gestor_agenda_checklists`, `gestor_agenda_comments` e `gestor_agenda_attachments`. Em ambientes de hospedagem compartilhada como a Hostinger, se os scripts de migration não forem executados manualmente via phpMyAdmin ou se o backend não possuir auto-criação em tempo de execução, as queries `SELECT` e `INSERT` falham com erro fatal 1146.
- **Como solucionar de forma definitiva?** Aplicar o padrão **ADR-008 (Auto-Ensure em Runtime)**: No método construtor de `AgendaService`, invocar `ensureAgendaTablesExist()` que executa `CREATE TABLE IF NOT EXISTS` com tratamento defensivo de exceções e cache em flag estática.

### ❓ Pergunta 2: O que é o erro `Argument #1 ($db) must be of type PDO, LazyDb given`?
- **Por que ele acontece?** O arquivo `config.php` da Hostinger utiliza um wrapper/proxy inteligente chamado `LazyDb` para adiar a abertura da conexão MySQL até a primeira query real. Quando classes de serviço como `AgendaFeedService` e `AgendaTriggerService` declaravam tipagem estrita `public function __construct(PDO $db)`, o PHP 8.4 lançava um `Fatal TypeError` no momento da instanciação (`new AgendaFeedService($this->db)`), derrubando a requisição com HTTP 500 antes de qualquer código de negócio ser executado.
- **Como solucionar de forma definitiva?** Remover a restrição estrita `PDO $db` para `$db` polimórfico em todos os construtores de serviço (`AgendaService`, `AgendaFeedService`, `AgendaTriggerService`, `OnboardingService`), garantindo total compatibilidade com `LazyDb` e mocks de teste.

### ❓ Pergunta 3: Por que novos eventos não podiam ser gravados no modal de agendamento?
- **Por que ele acontece?** Quando um operador preenchia o formulário de "Novo Evento" sem preencher a data de término opcional, o componente React enviava uma string vazia `""`. No MySQL com `STRICT_TRANS_TABLES`, passar `""` para uma coluna do tipo `DATETIME` (`end_datetime`) causa o erro `1292 Incorrect datetime value: ''`. Além disso, a conversão do formato HTML5 `YYYY-MM-DDTHH:MM` para `YYYY-MM-DD HH:MM:00` não era tratada no backend.
- **Como solucionar de forma definitiva?** Implementar uma camada de normalização defensiva de datas no `AgendaService::createEvent()` e `updateEvent()`: converter strings vazias em `null`, substituir `T` por espaço e assegurar o sufixo `:00` nos segundos.

---

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON verificado em `openspec/contracts/gestor/agenda.json`
- [x] Validar 100% de simetria do payload de entrada e saída:
  - `GET /api/v1/admin/agenda/summary` ➔ Retorna contadores de urgências, pendências e agendamentos.
  - `GET /api/v1/admin/agenda/events` ➔ Retorna lista de eventos com checklists e criadores.
  - `POST /api/v1/admin/agenda/events` ➔ Criação atômica com status inicial e log de auditoria.

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Infraestrutura Docker/Traefik e restrição de loopback `127.0.0.1:3306` na VPS (Imutável)
- [x] Chaves SSH e credenciais do banco mantidas blindadas (REGRA 2)
- [x] Estrutura das tabelas de autenticação (`admin_users`, `admin_sessions`) mantida intacta

# 🗄️ Camada de Dados (SQL)
- [x] Auto-criação garantida em runtime via `ensureAgendaTablesExist()`:
  - `gestor_agenda_events`
  - `gestor_agenda_status_logs`
  - `gestor_agenda_checklists`
  - `gestor_agenda_comments`
  - `gestor_agenda_attachments`

# ⚙️ Camada de Backend (PHP 8.4)
- [x] `apps/web-app/src/backend/api/v1/Services/AgendaService.php` (Auto-ensure + Normalização de Datas + Desacoplamento LazyDb)
- [x] `apps/web-app/src/backend/api/v1/Services/AgendaFeedService.php` (Desacoplamento LazyDb)
- [x] `apps/web-app/src/backend/api/v1/Services/AgendaTriggerService.php` (Desacoplamento LazyDb + Injeção Lazy)
- [x] `apps/web-app/src/backend/api/v1/Controllers/GestorAgendaController.php` (Autenticação unificada via `$loggedUser`)

# ⚛️ Camada de Interface (React V3.1)
- [x] `apps/web-app/src/frontend/src/pages/Portal/Premium/PremiumPage.jsx` (Correção de ícone `FaMagic`)
- [x] `apps/web-app/src/frontend/src/pages/Gestor/Agenda/EventModal.jsx` (Modal com tratamento de estados)
- [x] Conformidade de estilos (Navy `#0A3E60`, Gold `#ED7E13`, targets >= 44x44px)

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend & API PHP):** Deploy de build consolidado via `Operations/deploy-pro.ps1`.

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] `php tests/agenda_smoke_test.php` (6/6 PASS)
- [x] `php tests/agenda_advanced_smoke_test.php` (4/4 PASS)
- [x] `php tests/onboarding_funnel_smoke_test.php` (10/10 PASS)

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Baixo. Modificações defensivas sem alteração de contratos existentes.
- **Rollback:** `git checkout HEAD~1` e novo deploy via `Operations/deploy-pro.ps1`.

# ✅ Checklist de Execução Atômica
- [x] 1. Auto-Ensure das 5 tabelas da Agenda no banco de produção
- [x] 2. Desacoplamento da tipagem `PDO` para compatibilidade total com `LazyDb`
- [x] 3. Normalização de datas vazias para `null` no backend
- [x] 4. Suíte de testes locais de fumaça CLI executada e 100% aprovada
- [x] 5. Build Vite e sincronização em produção na Hostinger concluídos
