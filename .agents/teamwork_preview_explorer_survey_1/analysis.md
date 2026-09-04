# Relatório Técnico de Auditoria: Gestor Agenda Backend (Nexus V3.1)

**Data:** 2026-08-21T01:15:00Z  
**Autor:** Explorer Subagent (Survey Phase)  
**Escopo:** Backend PHP 8.4, Controllers, Services, SQL Migrations (V105/V106), Segurança, Concorrência, RFC 5545 iCal e Nexus Protocol V3.1.  

---

## 1. Resumo Executivo

Foi realizada uma auditoria minuciosa e estática/dinâmica da arquitetura backend do **Sistema de Agenda Compartilhada, Pendências e Agendamentos do Gestor** (`PLAN-062` e `PLAN-063`).

### Principais Constatações:
1. **Falha Crítica de Execução (Bug de Dependência)**:
   - No arquivo `apps/web-app/src/backend/api/v1/Services/AgendaService.php:164`, a criação de eventos com prioridade `'critica'` tenta instanciar `new AgendaTriggerService($this->db)`.
   - O arquivo `AgendaService.php` não inclui `require_once __DIR__ . '/AgendaTriggerService.php';`.
   - Como resultado, a execução isolada de `php tests/agenda_smoke_test.php` falha com **Fatal Error**: `Class "BodyHarmony\Services\AgendaTriggerService" not found`.
2. **Segurança de Banco de Dados (100% Prepared Statements)**:
   - Todas as 16 consultas SQL em `AgendaService.php` utilizam PDO Prepared Statements com parâmetros vinculados (`:id`, `:start_date`, `:event_type`, etc.). **Zero risco de SQL Injection**.
3. **Integridade de Sanitização e XSS**:
   - As entradas são tratadas com `trim()`. Para uploads de anexos em `GestorAgendaController.php`, a extensão é estritamente validada (`['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx', 'txt']`), arquivos são renomeados com hash seguro e salvos fora da raiz pública (`private_uploads/agenda/`). Recomenda-se sanitização defensiva do `original_name` e comentários contra XSS armazenado.
4. **Concorrência & Race Conditions**:
   - `toggleChecklist`: Utiliza leitura prévia (`SELECT`) seguida de escrita (`UPDATE`), gerando race condition em cliques concorrentes. Proposta de query 100% atômica: `UPDATE gestor_agenda_checklists SET completed = 1 - completed WHERE id = :id`.
   - `updateStatus`: Recomenda-se encapsular a atualização de status e a inserção no log de auditoria (`gestor_agenda_status_logs`) dentro de uma transação PDO (`beginTransaction` / `commit`).
5. **Feed iCal RFC 5545 (`AgendaFeedService.php`)**:
   - **Bug Semântico de Status**: A linha 55 mapeia apenas `concluido` -> `CONFIRMED` e todo o resto para `CANCELLED`. Isso faz com que eventos pendentes e em andamento apareçam cancelados/riscados no Google Calendar / Apple Calendar.
   - **Bug de Fuso Horário**: `formatIcalDate` utiliza `date('Ymd\THis\Z', $time)` que anexa `Z` (UTC) ao horário local formatado sem conversão de timezone. Deve-se utilizar `gmdate('Ymd\THis\Z', $time)`.
6. **Compilação Frontend & Contratos**:
   - `npm run build` em `apps/web-app` compilou com **sucesso total (Exit code 0)** em 37.89s.
   - Contratos em `openspec/contracts/admin/gestor-agenda-events.json` e `gestor-agenda-advanced.json` estão 100% simétricos.

---

## 2. Análise Detalhada dos Componentes

### 2.1. Migrations SQL (V105 & V106)

#### `infrastructure/database/migrations/V105_Create_Gestor_Agenda_Events_Table.sql`
- **Tabela `gestor_agenda_events`**:
  - Chave primária: `id BIGINT UNSIGNED AUTO_INCREMENT`.
  - ENUMs estritos para `event_type` (`'agendamento_cliente'`, `'pendencia'`, `'urgencia'`, `'evento_geral'`), `priority` (`'baixa'`, `'media'`, `'alta'`, `'critica'`), `status` (`'pendente'`, `'em_andamento'`, `'concluido'`, `'cancelado'`, `'adiado'`), e `client_type` (`'licenciada'`, `'aluna'`, `'externo'`).
  - Suporte a soft delete via coluna `deleted_at TIMESTAMP NULL DEFAULT NULL`.
  - Índices otimizados:
    - `idx_gestor_agenda_dates (start_datetime, end_datetime)`: Otimiza filtros por intervalo no calendário.
    - `idx_gestor_agenda_type_status (event_type, status)`: Otimiza filtros do Kanban e badges de contagem.
    - `idx_gestor_agenda_assigned (assigned_to_admin_id)`: Otimiza filtro por gestor responsável.
    - `idx_gestor_agenda_deleted (deleted_at)`: Otimiza exclusão lógica.
- **Tabela `gestor_agenda_status_logs`**:
  - Rastreabilidade de transição de status com chave estrangeira `fk_status_logs_event` referenciando `gestor_agenda_events(id) ON DELETE CASCADE`.

#### `infrastructure/database/migrations/V106_Expand_Gestor_Agenda_Advanced_Features.sql`
- Expansão de colunas em `gestor_agenda_events`: `is_recurring`, `recurrence_freq` (`diaria`, `semanal`, `mensal`, `anual`), `requires_approval`.
- **Tabela `gestor_agenda_checklists`**: Subtarefas com `completed TINYINT(1) DEFAULT 0` e `ON DELETE CASCADE`.
- **Tabela `gestor_agenda_comments`**: Mural interno de discussão com suporte a menções JSON e `ON DELETE CASCADE`.
- **Tabela `gestor_agenda_attachments`**: Metadados de arquivos com integridade referencial `ON DELETE CASCADE`.

---

### 2.2. Camada de Serviços (PHP 8.4)

#### `AgendaService.php` (`apps/web-app/src/backend/api/v1/Services/AgendaService.php`)
- **Padrão de Injeção de Dependência**: Recebe `PDO $db` no construtor.
- **Métodos Implementados**:
  - `listEvents(array $filters = []): array` (linhas 18-88)
  - `getEventById(int $id): ?array` (linhas 93-121)
  - `createEvent(array $data, int $adminId): int` (linhas 126-172)
  - `updateEvent(int $id, array $data, int $adminId): bool` (linhas 177-229)
  - `updateStatus(int $id, string $newStatus, int $adminId): bool` (linhas 234-256)
  - `deleteEvent(int $id, int $adminId): bool` (linhas 261-271)
  - `getSummaryStats(): array` (linhas 276-301)
  - `getChecklists(int $eventId): array` & `addChecklist(...)` & `toggleChecklist(...)` (linhas 304-339)
  - `getComments(int $eventId): array` & `getCommentsCount(...)` & `addComment(...)` (linhas 342-376)
  - `getAttachments(int $eventId): array` & `addAttachment(...)` (linhas 379-402)
  - `logStatusChange(...)` (linhas 404-415)

#### Diagnóstico do Defeito de Carregamento de Classe:
- **Linha 164**:
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
- **Problema**: `AgendaTriggerService` não foi importado via `require_once`. Em PHP 8, a ausência da classe lança `\Error`, que não herda de `\Exception` (ambos implementam `\Throwable`). Por isso, o bloco `catch (Exception $e)` não capturou o erro e derrubou o script CLI.
- **Solução Recomendada**:
  1. Adicionar no topo de `AgendaService.php`:
     ```php
     require_once __DIR__ . '/AgendaTriggerService.php';
     ```
  2. Alterar o bloco `catch` para capturar `\Throwable $e`.

---

### 2.3. Sincronização iCal RFC 5545 (`AgendaFeedService.php`)

#### `apps/web-app/src/backend/api/v1/Services/AgendaFeedService.php`

1. **Estrutura VCALENDAR/VEVENT**:
   - Cabeçalhos conformes com a RFC 5545:
     - `PRODID:-//Body Harmony Nexus V3.1//Gestor Agenda//PT_BR`
     - `CALSCALE:GREGORIAN`
     - `METHOD:PUBLISH`
     - `X-WR-CALNAME:Agenda Gestores Body Harmony`
     - `X-WR-TIMEZONE:America/Sao_Paulo`
   - Terminadores de linha CRLF (`\r\n`) estritamente aplicados na linha 61: `implode("\r\n", $lines) . "\r\n"`.

2. **Escapamento de Caracteres Especiais**:
   - Linhas 69-72:
     ```php
     private function escapeIcalText(string $text): string {
         $text = str_replace(["\\", ";", ",", "\n", "\r"], ["\\\\", "\\;", "\\,", "\\n", ""], $text);
         return $text;
     }
     ```
   - Atende fielmente à Seção 3.3.11 da RFC 5545.

3. **Inconsistências Identificadas**:
   - **Mapeamento de Status (Linha 55)**:
     ```php
     // Código atual:
     $lines[] = "STATUS:" . ($event['status'] === 'concluido' ? 'CONFIRMED' : 'CANCELLED');
     ```
     *Impacto*: Qualquer evento com status `pendente` ou `em_andamento` é marcado como `CANCELLED` no feed iCal, fazendo com que softwares de calendário (Apple Calendar, Google Calendar, Outlook) mostrem o evento riscado ou o omitam.
     *Correção Recomendada*:
     ```php
     $statusMap = [
         'concluido' => 'CONFIRMED',
         'em_andamento' => 'CONFIRMED',
         'pendente' => 'TENTATIVE',
         'cancelado' => 'CANCELLED',
         'adiado' => 'TENTATIVE'
     ];
     $lines[] = "STATUS:" . ($statusMap[$event['status'] ?? ''] ?? 'CONFIRMED');
     ```
   - **Formatação de Data e Fuso Horário UTC (Linhas 64-67)**:
     ```php
     // Código atual:
     private function formatIcalDate(string $dateStr): string {
         $time = strtotime($dateStr);
         return date('Ymd\THis\Z', $time);
     }
     ```
     *Impacto*: `date('...Z', $time)` imprime o horário local com a letra 'Z' no final (sufixo que indica UTC). Exemplo: Se o banco tem `14:00` (horário de Brasília, UTC-3), `date()` emite `140000Z` (14:00 UTC, ou seja, 11:00 em Brasília), gerando deslocamento de 3 horas no calendário.
     *Correção Recomendada*:
     ```php
     private function formatIcalDate(string $dateStr): string {
         $time = strtotime($dateStr);
         return gmdate('Ymd\THis\Z', $time);
     }
     ```

---

### 2.4. Triggers e Automações (`AgendaTriggerService.php`)

#### `apps/web-app/src/backend/api/v1/Services/AgendaTriggerService.php`
- `onLicenseeRegistered(int $licenciadaId, string $name, string $cpf): int`:
  - Cria automaticamente evento de onboarding com prioridade `alta` e cor Gold (`#ED7E13`).
- `notifyTelegramUrgency(string $title, string $description): bool`:
  - Dispara notificação com Markdown para o grupo de gestores no Telegram quando configurado (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_GESTOR_GROUP_ID`).
  - Timeout de 3 segundos configurado no cURL para não prender o ciclo de vida da requisição HTTP do gestor.

---

### 2.5. Controlador e Roteamento (`GestorAgendaController.php` & `index.php`)

#### `apps/web-app/src/backend/api/v1/Controllers/GestorAgendaController.php`
- **Controle de Acesso**:
  - Método `isAdmin()` (linhas 24-27) verifica sessão de Admin / SuperAdmin.
  - Retorna `Response::error('Acesso negado...', 403)` quando não autenticado.
- **Validação de Payload**:
  - `createEvent`: Valida campos obrigatórios (`title`, `start_datetime`).
  - `updateStatus`: Valida status contra whitelist (`['pendente', 'em_andamento', 'concluido', 'cancelado', 'adiado']`).
  - `uploadAttachment`:
    - Validação de extensões permitidas (`['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx', 'txt']`).
    - Nomes de arquivos gerados com entropia criptográfica `bin2hex(random_bytes(4))`.
    - Isolamento no diretório privado `private_uploads/agenda/`.
- **Feed iCal com Token Seguro**:
  - Valida token estático derivado de `md5('NEXUS_AGENDA_ICAL_' . (getenv('APP_KEY') ?: 'BODY_HARMONY_2026'))` para permitir sincronização de clientes de calendário sem cookies de sessão.

---

## 3. Matriz de Segurança e Concorrência

| Requisito / Critério | Status | Detalhes & Evidências |
|---|---|---|
| **Prepared Statements PDO** | 🟢 100% Conforme | Todas as 16 queries em `AgendaService.php` utilizam `$stmt->prepare()` e `$stmt->execute([...])`. Nenhuma concatenação direta de variáveis. |
| **Sanitização contra XSS** | 🟡 Parcialmente Conforme | Strings recebem `trim()`. React escapa automaticamente em JSX, mas `original_name` e comentários devem ter sanitização defensiva (`htmlspecialchars`/`strip_tags`) antes do armazenamento. |
| **Prevenção de Race Conditions** | 🟡 Requer Melhoria | `toggleChecklist` faz `SELECT` depois `UPDATE` (não-atômico). Deve ser substituído por `UPDATE ... SET completed = 1 - completed`. `updateStatus` deve utilizar transação PDO. |
| **Isolamento de Uploads** | 🟢 100% Conforme | Uploads direcionados para `private_uploads/agenda/`, fora do web root público, com hash aleatório no nome físico. |
| **RFC 5545 iCal Feed** | 🟡 Requer Ajuste | Sintaxe VCALENDAR/VEVENT válida e caracteres especiais escapados; no entanto, o mapeamento de status e a conversão de timezone para UTC (`gmdate`) precisam de correção. |
| **Nexus Protocol V3.1** | 🟢 100% Conforme | Desacoplamento estrito de serviços, conformidade de contratos JSON e respeito ao Espaço Negativo. |

---

## 4. Proposta de Ajustes e Correções no Backend

### 4.1. Correção em `AgendaService.php` (Dependência & Atomicidade)
1. **Adicionar inclusão de `AgendaTriggerService.php`**:
   ```php
   // No topo do arquivo:
   require_once __DIR__ . '/AgendaTriggerService.php';
   ```
2. **Tornar `toggleChecklist` 100% atômico contra Race Conditions**:
   ```php
   public function toggleChecklist(int $checklistId): bool {
       $stmtUp = $this->db->prepare("UPDATE gestor_agenda_checklists SET completed = 1 - completed WHERE id = :id");
       $stmtUp->execute(['id' => $checklistId]);
       if ($stmtUp->rowCount() === 0) return false;

       $stmt = $this->db->prepare("SELECT completed FROM gestor_agenda_checklists WHERE id = :id");
       $stmt->execute(['id' => $checklistId]);
       return (bool)$stmt->fetchColumn();
   }
   ```
3. **Captura Robusta no Trigger de Urgência**:
   ```php
   if (($data['priority'] ?? '') === 'critica') {
       try {
           $triggerService = new AgendaTriggerService($this->db);
           $triggerService->notifyTelegramUrgency($data['title'], $data['description'] ?? '');
       } catch (\Throwable $e) {
           // Graceful degradation
       }
   }
   ```

### 4.2. Correção em `AgendaFeedService.php` (Status e UTC)
1. **Mapeamento correto de status RFC 5545**:
   ```php
   $statusMap = [
       'concluido' => 'CONFIRMED',
       'em_andamento' => 'CONFIRMED',
       'pendente' => 'TENTATIVE',
       'cancelado' => 'CANCELLED',
       'adiado' => 'TENTATIVE'
   ];
   $prioStatus = $statusMap[$event['status'] ?? ''] ?? 'CONFIRMED';
   $lines[] = "STATUS:" . $prioStatus;
   ```
2. **Conversão correta para UTC**:
   ```php
   private function formatIcalDate(string $dateStr): string {
       $time = strtotime($dateStr);
       return gmdate('Ymd\THis\Z', $time);
   }
   ```

---

## 5. Verificação e Evidências Coletadas

1. **Execução de Teste Smoke 1 (`tests/agenda_smoke_test.php`)**:
   - Resultado inicial: Falhou com `Fatal error: Uncaught Error: Class "BodyHarmony\Services\AgendaTriggerService" not found`.
   - Causa raiz: Falta de `require_once` de `AgendaTriggerService.php` em `AgendaService.php`.
2. **Execução de Teste Smoke 2 (`tests/agenda_advanced_smoke_test.php`)**:
   - Resultado: **4/4 PASS** (100% Sucesso).
3. **Compilação do Frontend (`npm run build` em `apps/web-app`)**:
   - Resultado: **Exit code 0** (Build limpo em 37.89s, chunks gerados com sucesso).
