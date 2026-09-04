# Análise Técnica Completa: Test Suites, CLI Smoke Tests e Web-App Build Pipeline

**Workspace**: `f:\Body-Harmony-Remake`  
**Data da Investigação**: 2026-08-20 (UTC: 2026-08-21T01:18:00Z)  
**Protocolo**: Nexus Protocol V3.1  
**Investigador**: Teamwork Explorer Subagent (Survey 3)

---

## 1. Sumário Executivo

Esta investigação detalhada cobriu a infraestrutura de testes automatizados, scripts de smoke test CLI (`tests/agenda_smoke_test.php`, `tests/agenda_advanced_smoke_test.php`), arquitetura de banco e mocks em memória, conformidade estrita com a **Regra Constitucional 6** (desacoplamento de controllers e isolamento de testes CLI) e a pipeline de build do frontend React 18/Vite 6 em `apps/web-app`.

### Principais Constatações:
1. **`tests/agenda_smoke_test.php` (6 Cenários)**:
   - **Status**: Falha por dependência ausente (`Fatal error: Class "BodyHarmony\Services\AgendaTriggerService" not found in AgendaService.php:164`).
   - **Causa Raiz**: O teste instancia `AgendaService` com um evento de prioridade `'critica'`. O método `AgendaService::createEvent()` tenta instanciar `new AgendaTriggerService($this->db)` para disparar alerta no Telegram. Como `tests/agenda_smoke_test.php` requer apenas `AgendaService.php` (e `AgendaService.php` não faz `require_once __DIR__ . '/AgendaTriggerService.php'` nem usa autoloader para o namespace `BodyHarmony\Services`), o PHP 8.4 emite um `\Error` fatal.
   - **Resolução Proposta**: Incluir `require_once __DIR__ . '/AgendaTriggerService.php';` dentro de `AgendaService.php` (ou em `tests/agenda_smoke_test.php` e `GestorAgendaController.php`) e alterar o catch para `\Throwable`.

2. **`tests/agenda_advanced_smoke_test.php` (4 Cenários)**:
   - **Status**: **100% Aprovado (4/4 passed)** em execução CLI direta (`php tests/agenda_advanced_smoke_test.php`).
   - **Motivo do Sucesso**: O arquivo inclui explicitamente `AgendaService.php`, `AgendaFeedService.php` e `AgendaTriggerService.php`.

3. **Web-App Build Pipeline (`apps/web-app`)**:
   - **Status**: **100% Compilação Limpa (Exit Code 0)** via `npm run build` (`built in 21.33s`).
   - **Artefatos**: Gera bundle completo em `build/public_html`, incluindo `GestorAgendaPage-BlALm6Uq.js` (37.30 kB / gzip: 8.38 kB).
   - **Quirk de Configuração de Testes**: O Vitest (`npx vitest run`) executa com sucesso os testes unitários (`AlunaLessonPlayer.test.jsx` 2/2 OK), mas falha ao tentar rodar os testes de Playwright E2E em `src/frontend/tests/*.spec.ts` porque `vitest.config.js` não exclui o diretório de testes E2E.

4. **Conformidade Constitucional com a Regra 6 & Isolamento de Estado**:
   - **Status**: **100% Conforme**. Ambos os testes de fumaça usam `MockAgendaPDO` / `MockAdvancedPDO` puros, sem manipulação de headers HTTP, sem `$_SESSION`, sem `auth_check.php` e sem poluição de estado global.

---

## 2. Análise Detalhada dos Test Suites CLI

### 2.1. `tests/agenda_smoke_test.php`

#### Cenários de Teste Mapeados (6 Test Cases):
| # | Test Case | Método Testado | Asserção / Verificação | Estado Atual |
|---|---|---|---|---|
| **TEST 1** | Create Urgency Event | `AgendaService::createEvent()` | Retorna `eventId > 0` para evento de tipo `'urgencia'` e prioridade `'critica'` | ❌ Falha (Fatal Error: Class `AgendaTriggerService` not found) |
| **TEST 2** | List Events & Filter | `AgendaService::listEvents(['event_type' => 'urgencia'])` | Retorna exatamente 1 evento com título correto | ⏳ Bloqueado por TEST 1 |
| **TEST 3.1** | Update Status: Em Andamento | `AgendaService::updateStatus($id, 'em_andamento', 1)` | Evento recuperado possui `status === 'em_andamento'` | ⏳ Bloqueado por TEST 1 |
| **TEST 3.2** | Update Status: Concluído | `AgendaService::updateStatus($id, 'concluido', 1)` | Evento recuperado possui `status === 'concluido'` | ⏳ Bloqueado por TEST 1 |
| **TEST 4** | Audit Log Persistence | Inspeção de `$pdo->logs` | Exatamente 3 registros em `gestor_agenda_status_logs` (1 create + 2 updates) | ⏳ Bloqueado por TEST 1 |
| **TEST 5** | Summary Stats Calculation | `AgendaService::getSummaryStats()` | Array contém chaves `total_urgencias_ativas`, `total_pendencias_hoje`, `total_agendamentos_hoje` | ⏳ Bloqueado por TEST 1 |
| **TEST 6** | Soft Delete Event | `AgendaService::deleteEvent($id, 1)` | Evento recebe `deleted_at` e `listEvents()` retorna 0 eventos ativos | ⏳ Bloqueado por TEST 1 |

#### Diagnóstico Técnico do Erro:
```
PHP Fatal error:  Uncaught Error: Class "BodyHarmony\Services\AgendaTriggerService" not found in F:\Body-Harmony-Remake\apps\web-app\src\backend\api\v1\Services\AgendaService.php:164
Stack trace:
#0 F:\Body-Harmony-Remake\tests\agenda_smoke_test.php(144): BodyHarmony\Services\AgendaService->createEvent(Array, 1)
#1 {main}
  thrown in F:\Body-Harmony-Remake\apps\web-app\src\backend\api\v1\Services\AgendaService.php on line 164
```

- **Linha 162-169 de `AgendaService.php`**:
```php
if (($data['priority'] ?? '') === 'critica') {
    try {
        $triggerService = new AgendaTriggerService($this->db);
        $triggerService->notifyTelegramUrgency($data['title'], $data['description'] ?? '');
    } catch (Exception $e) {
        // Ignore telegram failures gracefully
    }
}
```
Como `tests/agenda_smoke_test.php` linha 9 apenas incluiu `require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php'`, e `AgendaService.php` não importa `AgendaTriggerService.php`, o PHP lança `\Error`, que não herda de `\Exception` no PHP 8.4, provocando o encerramento do processo.

---

### 2.2. `tests/agenda_advanced_smoke_test.php`

#### Cenários de Teste Mapeados (4 Test Cases):
| # | Test Case | Serviço / Método Testado | Asserção / Verificação | Estado Atual |
|---|---|---|---|---|
| **TEST 1** | Auto Onboarding Trigger | `AgendaTriggerService::onLicenseeRegistered()` | Cria evento de onboarding com prioridade alta e status pendente, retornando `eventId > 0` | ✅ PASS |
| **TEST 2.1** | Add Subtasks / Checklists | `AgendaService::addChecklist()` | Insere 2 itens de checklist com `id > 0` | ✅ PASS |
| **TEST 2.2** | Toggle Subtask Completion | `AgendaService::toggleChecklist()` | Inverte status `completed` e valida se `checklists[0]['completed'] === true` | ✅ PASS |
| **TEST 3** | Internal Discussion & Mentions | `AgendaService::addComment()` / `getComments()` | Insere comentário com mentions JSON e recupera 1 comentário persistido | ✅ PASS |
| **TEST 4** | iCal RFC 5545 Feed Generator | `AgendaFeedService::generateIcalFeed()` | Gera payload iCal com `BEGIN:VCALENDAR`, `BEGIN:VEVENT`, e `SUMMARY:[URGENTE]...` com caracteres escapados | ✅ PASS |

#### Saída da Execução CLI:
```
=================================================================
   SMOKE TEST: ADVANCED AGENDA (ICAL, CHECKLIST, TRIGGERS)      
=================================================================

[TEST 1] Onboarding Trigger Auto-Creation: OK (Event ID: 1)
[TEST 2.1] Add Subtasks / Checklists: OK
[TEST 2.2] Toggle Subtask Completion: OK
[TEST 3] Internal Discussion Comment & Mention: OK
[TEST 4] iCal RFC 5545 (.ics) Feed Generator: OK

-----------------------------------------------------------------
  ALL ADVANCED AGENDA SMOKE TESTS PASSED (4/4) — 100% SUCCESS  
-----------------------------------------------------------------
```

---

## 3. Análise da Pipeline de Build do Web App

### 3.1. Configuração do Vite e Estrutura de Dependências
- **Arquivo**: `apps/web-app/package.json`
- **Ferramenta**: Vite 6.0.5 + React 18.3.1 + `@vitejs/plugin-react` 4.3.4.
- **Configuração de Diretório de Saída (`apps/web-app/vite.config.js`)**:
  - `outDir`: `../../build/public_html`
  - `emptyOutDir`: `true`
  - `rollupOptions.output`:
    - `entryFileNames`: `'assets/[name]-[hash].js'`
    - `chunkFileNames`: `'assets/[name]-[hash].js'`
    - `assetFileNames`: `'assets/[name]-[hash].[ext]'`
    - `manualChunks`: `{ vendor: ['react', 'react-dom', 'styled-components', 'framer-motion'] }`

### 3.2. Verificação de Execução do Build
- **Comando**: `npm run build` em `apps/web-app`
- **Resultado**: Exit code 0, tempo de compilação 21.33s.
- **Chunks gerados com sucesso**:
  - `../../build/public_html/assets/GestorAgendaPage-BlALm6Uq.js` (37.30 kB │ gzip: 8.38 kB)
  - `../../build/public_html/assets/vendor-DQ0Qx5Ar.js` (293.51 kB │ gzip: 96.75 kB)
  - `../../build/public_html/assets/index-83m8DUNb.js` (290.21 kB │ gzip: 92.17 kB)
  - Total de 70+ chunks empacotados sem erros de sintaxe ou de importação.

### 3.3. Bottlenecks e Quirks Identificados
1. **Aviso de Tamanho de Chunks (Rollup warning)**:
   - Pacotes como `dash.all.min` (992 kB), `hls.js` (522 kB) e `BarChart` (recharts 346 kB) excedem 500 kB individualmente. Isso não impede a compilação, mas pode se beneficiar de `React.lazy` / `dynamic import()` caso desejada otimização de tempo de carregamento no primeiro acesso.
2. **Conflito de Runner no Vitest**:
   - `npx vitest run` busca arquivos com padrão `**/*.spec.ts` por padrão. Os arquivos `src/frontend/tests/stabilization.spec.ts` e `src/frontend/tests/nexus-ops.spec.ts` são testes de integração Playwright (`import { test } from '@playwright/test'`), o que gera erro ao rodar `vitest`.
   - **Recomendação**: Adicionar `'src/frontend/tests/**'` e `'**/*.spec.ts'` no `exclude` de `vitest.config.js`.

---

## 4. Análise de Conexão com Banco, Mocks e Isolamento de Estado

### 4.1. Arquitetura de Mocks dos Testes CLI
- `tests/agenda_smoke_test.php` e `tests/agenda_advanced_smoke_test.php` utilizam classes stand-alone que estendem `\PDO` (`MockAgendaPDO`, `MockAdvancedPDO`) e implementam `prepare()`, `execute()`, `fetchAll()`, `fetch()`, `fetchColumn()` e `lastInsertId()`.
- O armazenamento interno simula as tabelas `gestor_agenda_events`, `gestor_agenda_status_logs`, `gestor_agenda_checklists` e `gestor_agenda_comments`.
- **Vantagem**: Os testes rodam instantaneamente (< 50ms), sem necessidade de banco de dados MySQL em execução, sem necessidade de Docker e sem credenciais externas.
- **Isolamento de Estado**: Não há poluição de variáveis superglobais (`$_SESSION`, `$_SERVER`, `$_COOKIE`, `$_POST`, `$_GET`) e não há emissão de headers HTTP.

### 4.2. Conformidade com a Regra 6 (Desacoplamento de Serviços)
- A **Regra 6 da Constituição de IA** estabelece:
  > *"Endpoints HTTP (`api/v1/*.php`) devem atuar estritamente como controladores finos de requisição/resposta. Nenhuma lógica pura de transformação de dados, validação ou compilação deve residir exclusivamente no escopo global do controller. Toda regra de negócio, conversão de schemas ou compilação de documentos deve residir em classes de serviço dedicadas (`BodyHarmony\Services\*`). Scripts de teste de fumaça CLI (`tests/*_smoke_test.php`) devem invocar apenas classes de serviço e helpers puros, nunca arquivos de controller que executam `auth_check.php` ou manipulam headers HTTP no escopo global."*
- **Avaliação de Conformidade**:
  - `AgendaService.php`, `AgendaFeedService.php` e `AgendaTriggerService.php` residem no namespace `BodyHarmony\Services` e recebem instâncias de `PDO` via injeção de dependência no construtor.
  - `GestorAgendaController.php` atua como controlador fino delegando todas as operações para os serviços.
  - Os testes de fumaça chamam diretamente os serviços, sem passar por controllers nem por `auth_check.php`.
  - **Conformidade: 100%**.

---

## 5. Propostas de Ajuste para Resolução dos Pontos Levantados

### 5.1. Correção do Import / Autoload de `AgendaTriggerService`
1. Em `apps/web-app/src/backend/api/v1/Services/AgendaService.php`:
   - Adicionar no topo ou dentro de `createEvent`:
     ```php
     require_once __DIR__ . '/AgendaTriggerService.php';
     ```
   - No bloco `try / catch` da notificação do Telegram (linha 166), capturar `\Throwable $e` em vez de `Exception $e`.
2. Em `apps/web-app/src/backend/api/v1/Controllers/GestorAgendaController.php`:
   - Adicionar no topo:
     ```php
     require_once __DIR__ . '/../Services/AgendaTriggerService.php';
     ```
3. Em `tests/agenda_smoke_test.php`:
   - Adicionar no topo:
     ```php
     require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaTriggerService.php';
     ```

### 5.2. Isolamento do Vitest vs Playwright
- Em `apps/web-app/vitest.config.js`:
  ```js
  exclude: [
      'node_modules/',
      'src/frontend/test/',
      'src/frontend/tests/**',
      '**/*.spec.ts',
      '**/*.config.js',
      '**/dist/**'
  ]
  ```
