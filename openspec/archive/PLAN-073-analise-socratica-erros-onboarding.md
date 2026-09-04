# 🎯 Objetivo Fullstack (PLAN-073)
Eliminar de forma definitiva os erros de runtime, falhas de métodos inexistentes no cliente API e erros 500 no funil de Onboarding das Licenciadas (`/portal-gestor/onboarding`) e no Cockpit do Gestor, através de contratos de API consistentes, auto-ensure de tabelas (ADR-008) e autenticação simétrica.

---

## 🏛️ Análise Socrática dos Erros de `tmp/onbording.log`

### ❓ Pergunta 1: O que é o erro `TypeError: B.getLeads is not a function`?
- **O que a evidência mostra?**  
  No log do console, a chamada `onboardingApi.getLeads()` em `OnboardingFunnelPage.jsx:1067` falhava com `TypeError: B.getLeads is not a function`.
- **Por que aconteceu?**  
  No objeto `onboardingApi` em `apps/web-app/src/frontend/src/services/api.js`, o método responsável por listar os leads do funil chamava-se `getFunnel` (`/v1/admin/onboarding/funnel`), mas o componente recém-refatorado `OnboardingFunnelPage.jsx` tentava invocar `onboardingApi.getLeads()`. A ausência do alias causava o crash da renderização do Kanban no React.
- **Como solucionar de forma definitiva?**  
  Exportar os aliases `getLeads` e `getFunnel` no objeto `onboardingApi`, além de adicionar `getMetrics: (periodoDias = 30) => request(...)` diretamente no serviço e tornar a desestruturação de `items` / `leads` no React 100% tolerante a variações de payload.

---

### ❓ Pergunta 2: Por que `GET /api/v1/admin/onboarding/metrics?periodo_dias=30` retornava HTTP 500?
- **O que a evidência mostra?**  
  As requisições para `/api/v1/admin/onboarding/metrics` e `/api/v1/admin/onboarding/links` falhavam com erro 500 no console.
- **Por que aconteceu?**  
  O método `OnboardingController::__construct()` instanciava `new OnboardingService($this->db)`, que por sua vez instanciava `new AgendaService($this->db)`. Antes de removermos a tipagem estrita de `$db`, isso disparava um `Fatal TypeError` por conta do proxy `LazyDb`. Adicionalmente, o método `isAdmin()` em `OnboardingController` checava exclusivamente `$_SESSION` e ignorava `$loggedUser` preenchido pelo Bearer Token JWT do `AuthMiddleware`.
- **Como solucionar de forma definitiva?**  
  1. Desacoplamento polimórfico de `$db` em `OnboardingService`.
  2. Implementação do método `isAdmin()` e `getAdminId()` em `OnboardingController` com prioridade para `$loggedUser['is_admin']` e `$loggedUser['id']`.
  3. Auto-criação das tabelas `licenciada_onboarding_tokens` e `licenciada_onboarding_requests` via `ensureOnboardingTablesExist()` em runtime (ADR-008).

---

### ❓ Pergunta 3: Por que o dashboard misturava erros de Agenda e Onboarding?
- **O que a evidência mostra?**  
  No `Dashboard.jsx`, widgets como `Cockpit360Widget` e `OnboardingMetricsWidget` disparam requisições simultâneas para a Agenda (`/admin/agenda/events`, `/admin/agenda/summary`) e para o Onboarding (`/admin/onboarding/metrics`).
- **Por que aconteceu?**  
  Quando qualquer um dos serviços de backend falhava com `Fatal TypeError (LazyDb)` ou tabela inexistente, os widgets do cockpit caíam em loop de retry do `installHook.js`, poluindo os logs do navegador.
- **Como solucionar de forma definitiva?**  
  Com a auto-recuperação (ADR-008) ativa em ambos os serviços (`AgendaService` e `OnboardingService`) e a compatibilidade total com o proxy `LazyDb`, todas as requisições paralelas do Dashboard respondem imediatamente com HTTP 200 e dados estruturados.

---

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON verificado em `openspec/contracts/onboarding/admin.json`
- [x] Sincronia de métodos em `api.js` (`getFunnel`, `getLeads`, `getMetrics`)

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Preservação de loopback MySQL 127.0.0.1 (REGRA 2)
- [x] Blindagem de credenciais (REGRA 2)

# 🗄️ Camada de Dados (SQL)
- [x] Auto-criação em runtime de `licenciada_onboarding_tokens` e `licenciada_onboarding_requests`

# ⚙️ Camada de Backend (PHP 8.4)
- [x] `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php` (Autenticação Bearer Token)
- [x] `apps/web-app/src/backend/api/v1/Services/OnboardingService.php` (Auto-ensure + Compatibilidade LazyDb)

# ⚛️ Camada de Interface (React V3.1)
- [x] `apps/web-app/src/frontend/src/services/api.js` (Métodos `getLeads` e `getMetrics` em `onboardingApi`)
- [x] `apps/web-app/src/frontend/src/pages/OnboardingFunnelPage.jsx` (Parsing defensivo de `items` e `leads`)

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium:** Deploy consolidado via `Operations/deploy-pro.ps1`.

# 🔍 Monitoramento Semântico (Regression Watch)
- [x] `php tests/onboarding_funnel_smoke_test.php` (10/10 PASS)
- [x] `php tests/agenda_smoke_test.php` (6/6 PASS)
- [x] `php tests/agenda_advanced_smoke_test.php` (4/4 PASS)

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Baixo. Modificações aditivas e defensivas de métodos.
- **Rollback:** `git checkout HEAD~1` e deploy via `Operations/deploy-pro.ps1`.

# ✅ Checklist de Execução Atômica
- [x] 1. Métodos `getLeads` e `getMetrics` declarados em `api.js`
- [x] 2. Desacoplamento de `LazyDb` e auto-ensure das tabelas do funil
- [x] 3. Autenticação unificada por Bearer Token no `OnboardingController`
- [x] 4. Testes automatizados executados e 100% aprovados
- [x] 5. Deploy de produção realizado com sucesso (HTTP 200 OK)
