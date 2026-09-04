# Relatório de Investigação da Arquitetura Backend — PLAN-064
**Módulo:** Funil de Onboarding de Licenciadas, Pré-cadastro com OCR e Automação de Contratos  
**Data:** 2026-08-20  
**Autor:** Backend Architecture Explorer  
**Protocolo:** Nexus Protocol V3.1 (PHP 8.4)  

---

## 1. Resumo Executivo

O objetivo desta investigação foi mapear detalhadamente a arquitetura do backend PHP do ecossistema Body Harmony para embasar a implementação segura e de alta fidelidade do **PLAN-064** (Funil de Onboarding de Licenciadas). 

Foram analisados os padrões de conexão de banco de dados (`LazyDb`, `config.php`), convenções de migrations (`infrastructure/database/migrations/`), tabelas legadas e ativas (`licenciadas`, `contracts`, `contract_templates`, `gestor_agenda_events`), camada de serviços (`BodyHarmony\Services\*`), roteamento (`Router`, `api/v1/index.php`), autenticação (`AuthMiddleware`) e a arquitetura de testes de fumaça CLI isolados em `tests/`.

---

## 2. Inventário Arquitetural do Backend

### 2.1. Conexão com Banco de Dados e Proxy PDO
- **Arquivo Central:** `apps/web-app/src/backend/api/config.php`
- **Padrão Utilizado:** Classe `LazyDb` atuando como proxy/lazy loader para `PDO`. A conexão física com o MySQL só é aberta no primeiro método executado (`prepare`, `query`, `beginTransaction`), evitando consumo desnecessário de conexões.
- **Função Global de Acesso:** `getDbConnection()` / `get_db_connection()`, que retorna a instância global `$pdo` (configurada para `HOSTINGER_PROD` ou `DB_HOST`).
- **Timezone e Configurações:** Timezone padronizado em `America/Sao_Paulo`, `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, `PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC`, `PDO::ATTR_PERSISTENT => false` (para evitar estouro de conexões na Hostinger).

### 2.2. Autoloading e Namespaces
- **Composer (`apps/web-app/src/backend/composer.json`):**
  ```json
  "autoload": {
      "psr-4": {
          "BodyHarmony\\": "api/v1/"
      }
  }
  ```
- **Fallback Autoloader em `apps/web-app/src/backend/api/v1/index.php`:**
  Possui `spl_autoload_register` que carrega automaticamente de `Core/`, `Controllers/`, `Services/` e `libs/`.
- **Mapeamento de Namespaces:**
  - `BodyHarmony\Services\*` -> `apps/web-app/src/backend/api/v1/Services/`
  - `BodyHarmony\Controllers\*` / `Controllers\*` -> `apps/web-app/src/backend/api/v1/Controllers/`
  - `BodyHarmony\Core\*` -> `apps/web-app/src/backend/api/v1/Core/`

### 2.3. Convenção de Migrations e Banco de Dados
- **Diretório Oficial:** `infrastructure/database/migrations/`
- **Últimas Migrations Relevantes:**
  - `V101_Create_Contracts_And_Signatures.sql`: Tabelas `contract_templates`, `contracts`, `contract_signatures`.
  - `V105_Create_Gestor_Agenda_Events_Table.sql`: Tabelas `gestor_agenda_events`, `gestor_agenda_status_logs`.
  - `V106_Expand_Gestor_Agenda_Advanced_Features.sql`: Tabelas `gestor_agenda_checklists`, `gestor_agenda_comments`, `gestor_agenda_attachments`.
- **Próxima Migration (PLAN-064):** `V107_Create_Licenciada_Onboarding_Funnel_Table.sql`.
- **Padrão de Tabelas Dinâmicas (`ensure_tables.php`):** Além do script SQL, o módulo de contratos possui rotinas de runtime idempotentes (`CREATE TABLE IF NOT EXISTS` com verificação de colunas via `SHOW COLUMNS`) para garantir resiliência em deploys (ADR-008).

### 2.4. Mapeamento de Esquema de Tabelas Existentes
1. **`licenciadas`** (`infrastructure/database/DATABASE_MASTER_V36_1.sql`):
   - Colunas principais: `id` (INT PK AUTO_INCREMENT), `name` (VARCHAR 100), `email` (VARCHAR 100 UNIQUE), `username` (VARCHAR 50 UNIQUE), `cpf` (VARCHAR 14 — **REGRA CONSTITUCIONAL 8: NUNCA usar `document`**), `state` (VARCHAR 10), `location` (VARCHAR 100), `whatsapp` (VARCHAR 20), `whatsapp_number` (VARCHAR 20), `photo_url` (VARCHAR 255), `is_active` (TINYINT 1), `renewal_date` (DATE), `admin_notes` (TEXT).
2. **`contracts`** (`V101_Create_Contracts_And_Signatures.sql`):
   - Colunas: `id`, `uuid` (VARCHAR 64 UNIQUE), `template_id` (INT), `licenciada_id` (INT NULL), `title` (VARCHAR 255), `status` (ENUM: `DRAFT`, `GENERATED`, `PENDING_SIGNATURE`, `SIGNED`, `CANCELLED`, `ARCHIVED`), `variables_payload` (JSON), `rendered_html` (LONGTEXT), `pdf_path` (VARCHAR 255), `sha256_hash` (VARCHAR 64), `sign_token` (VARCHAR 100 UNIQUE), `sign_token_expires_at` (DATETIME), `created_by` (INT).
3. **`contract_templates`**:
   - `id`, `slug` (VARCHAR 80 UNIQUE), `title`, `category`, `variables_schema` (JSON), `content_html` (LONGTEXT), `is_active`.
   - Categoria principal: `'Licenciamento'` (`slug: 'licenciamento-padrao'`).
4. **`gestor_agenda_events`** (`V105` / `V106`):
   - `id`, `event_type` (`agendamento_cliente`, `pendencia`, `urgencia`, `evento_geral`), `title`, `description`, `start_datetime`, `end_datetime`, `priority` (`baixa`, `media`, `alta`, `critica`), `status` (`pendente`, `em_andamento`, `concluido`, `cancelado`, `adiado`), `client_id`, `client_type` (`licenciada`, `aluna`, `externo`), `created_by_admin_id`, `assigned_to_admin_id`, `color`, `metadata` (JSON), `is_recurring`, `recurrence_freq`, `requires_approval`.

### 2.5. Serviços Existentes Relevantes
1. **`BodyHarmony\Services\AgendaService`** (`apps/web-app/src/backend/api/v1/Services/AgendaService.php`):
   - Métodos: `listEvents(array $filters): array`, `getEventById(int $id): ?array`, `createEvent(array $data, int $adminId): int`, `updateEvent(int $id, array $data, int $adminId): bool`, `updateStatus(int $id, string $status, int $adminId, ?string $notes): bool`, `deleteEvent(int $id, int $adminId): bool`, `getSummaryStats(): array`.
   - Suporte a Checklists, Comentários e Status Logs.
2. **`BodyHarmony\Services\AgendaTriggerService`** (`apps/web-app/src/backend/api/v1/Services/AgendaTriggerService.php`):
   - `onLicenseeRegistered(int $licenciadaId, string $name, string $cpf): int`
   - `notifyTelegramUrgency(string $title, string $description): bool`
3. **`BodyHarmony\Services\ContractPdfService`** (`apps/web-app/src/backend/api/v1/Services/ContractPdfService.php`):
   - `renderTemplate(string $html, array $variables): string`
   - `generatePdf(string $html, string $uuid, string $title, array $signatures = [], bool $isDraft = false, array $logoOptions = []): array`
   - Gera PDF compilado com mPDF, calcula SHA-256 e armazena em `private_uploads/contracts/`.

### 2.6. Padrões de Roteamento, Autenticação e Resposta
- **Roteador:** `Router.php` em `apps/web-app/src/backend/api/v1/Core/Router.php`.
- **Padrão de Resposta JSON:** `Response::json($data, $statusCode)` e `Response::error($message, $statusCode)`.
- **Autenticação:** `AuthMiddleware` valida token Bearer (`AUTHORIZATION` header) ou device token (`X-DEVICE-TOKEN`).
  - Rotas públicas (`/public/*`, `/ping`, `/auth/magic/*`) não chamam `$middleware->handle()`.
  - Rotas administrativas chamam `$middleware->handle()` e o controller verifica permissões via `isAdmin()` / role `admin` | `superadmin`.

### 2.7. Estilo de Testes de Fumaça CLI
- **Localização:** `tests/`
- **Padrão de Execução:** `php tests/<nome_do_teste>.php`
- **Isolamento Completo (REGRA 6):** Os testes instanciam diretamente as classes de serviço (`BodyHarmony\Services\*`) usando um `MockPDO` estruturado em memória, sem depender de banco MySQL externo ou headers globais HTTP, imprimindo saídas canônicas com `[TEST N] ... OK` e finalizando com `VEREDICTO: [PASS]` e exit code 0.

---

## 3. Especificação e Desenho dos Componentes do PLAN-064

### 3.1. Migration SQL `V107_Create_Licenciada_Onboarding_Funnel_Table.sql`
Localização: `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`

```sql
-- ============================================================
-- Migration: V107_Create_Licenciada_Onboarding_Funnel_Table.sql
-- Description: Funil de Onboarding de Licenciadas, Tokens de Pré-cadastro com OCR e Integração de Contratos (PLAN-064)
-- ============================================================

-- 1. Tabela de Tokens de Convite / Pré-cadastro Público
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_tokens` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(64) NOT NULL UNIQUE,
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
  `telefone_whatsapp` VARCHAR(30) NULL,
  `nome_preliminar` VARCHAR(255) NULL,
  `expires_at` DATETIME NOT NULL,
  `created_by_admin_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_token` (`token`),
  INDEX `idx_onboarding_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Requisições / Cards do Funil de Onboarding
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_requests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token_id` BIGINT UNSIGNED NULL,
  `token_str` VARCHAR(64) NULL,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(20) NOT NULL,
  `rg` VARCHAR(30) NULL,
  `email` VARCHAR(150) NULL,
  `telefone_whatsapp` VARCHAR(30) NULL,
  `endereco` TEXT NULL,
  `cidade` VARCHAR(100) NULL,
  `estado` VARCHAR(10) NULL,
  `cep` VARCHAR(20) NULL,
  `nacionalidade` VARCHAR(50) NULL DEFAULT 'brasileira',
  `estado_civil` VARCHAR(50) NULL DEFAULT 'solteira',
  `profissao` VARCHAR(100) NULL DEFAULT 'Esteticista',
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
  `template_slug` VARCHAR(80) NOT NULL DEFAULT 'licenciamento-padrao',
  `documento_img` VARCHAR(255) NULL,
  `ocr_data_json` JSON NULL,
  `ocr_confidence` DECIMAL(5,2) NULL DEFAULT 0.00,
  `status` ENUM('PRE_CADASTRO', 'CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA', 'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO', 'REJEITADO') NOT NULL DEFAULT 'PRE_CADASTRO',
  `contract_uuid` VARCHAR(64) NULL,
  `licenciada_id` INT UNSIGNED NULL,
  `agenda_event_id` BIGINT UNSIGNED NULL,
  `taxa_inicial_num` VARCHAR(50) NULL DEFAULT '7.000,00',
  `taxa_inicial_extenso` VARCHAR(255) NULL DEFAULT 'sete mil reais',
  `condicoes_pagamento` VARCHAR(255) NULL DEFAULT 'à vista via PIX',
  `valor_minimo_sessao` VARCHAR(50) NULL DEFAULT '150,00',
  `cidade_celebracao` VARCHAR(100) NULL DEFAULT 'Assis/SP',
  `last_reminder_sent_at` DATETIME NULL,
  `payment_confirmed_at` DATETIME NULL,
  `activated_at` DATETIME NULL,
  `notas_gestor` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_status` (`status`),
  INDEX `idx_onboarding_cpf` (`cpf`),
  INDEX `idx_onboarding_token_id` (`token_id`),
  INDEX `idx_onboarding_contract_uuid` (`contract_uuid`),
  INDEX `idx_onboarding_licenciada_id` (`licenciada_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.2. Serviço `SimpleOcrService.php`
- **Localização:** `apps/web-app/src/backend/api/v1/Services/SimpleOcrService.php`
- **Namespace:** `BodyHarmony\Services`
- **Responsabilidade:** Extração defensiva e puramente em PHP de campos textuais em documentos (RG/CPF/CNPJ).
- **Diretriz Constitucional:** Sem dependência de APIs externas pagas (Cloud Vision / AWS Textract).
- **Assinatura de Métodos:**
  ```php
  namespace BodyHarmony\Services;

  class SimpleOcrService {
      /**
       * Processa arquivo de imagem ou PDF e extrai dados cadastrais.
       * @param string $filePath Caminho do arquivo no disco
       * @return array [success => bool, extracted => [...], raw_text => string, confidence => float]
       */
      public function processDocument(string $filePath): array;

      /**
       * Valida e sanitiza CPF contra o algoritmo de dígitos verificadores (Módulo 11).
       * @param string $cpf
       * @return bool
       */
      public function validateCpf(string $cpf): bool;

      /**
       * Limpa e formata CPF para o padrão 000.000.000-00.
       * @param string $cpf
       * @return string
       */
      public function formatCpf(string $cpf): string;

      /**
       * Extrai padrões de texto com expressões regulares defensivas.
       * @param string $text
       * @return array [nome => ?, cpf => ?, rg => ?, cep => ?]
       */
      public function extractFieldsFromText(string $text): array;
  }
  ```

---

### 3.3. Serviço `OnboardingService.php`
- **Localização:** `apps/web-app/src/backend/api/v1/Services/OnboardingService.php`
- **Namespace:** `BodyHarmony\Services`
- **Responsabilidade:** Gestão do ciclo de vida das 5 colunas do Funil de Onboarding, integração bidirecional com `AgendaService` e `ContractPdfService`.
- **Assinatura de Métodos:**
  ```php
  namespace BodyHarmony\Services;

  use PDO;

  class OnboardingService {
      private PDO $db;
      private AgendaService $agendaService;
      private ContractPdfService $pdfService;
      private SimpleOcrService $ocrService;

      public function __construct(PDO $db);

      /**
       * 1. Gera link público e token seguro de pré-cadastro (com expiração em 7 dias).
       */
      public function generateToken(array $data, int $adminId): array;

      /**
       * 2. Valida token público recebido pela tela pública da Licenciada.
       */
      public function validateToken(string $token): ?array;

      /**
       * 3. Submete o pré-cadastro público da Licenciada (upload de doc + OCR + criação de tarefa na Agenda).
       */
      public function submitPublicOnboarding(string $token, array $data, ?array $file = null): array;

      /**
       * 4. Lista cards e métricas agregadas para as 5 colunas do Kanban e visualização em Tabela.
       */
      public function listFunnel(array $filters = []): array;

      /**
       * 5. Obtém os detalhes completos de uma requisição de onboarding.
       */
      public function getRequestById(int $id): ?array;

      /**
       * 6. Emissão de Contrato em 1-Clique com auto-preenchimento das variáveis e geração de link de assinatura.
       */
      public function generateContract1Click(int $requestId, array $overrideVars, int $adminId): array;

      /**
       * 7. Disparo / Geração de régua de cobrança e lembrete via WhatsApp em 24h.
       */
      public function sendWhatsAppReminder(int $requestId): array;

      /**
       * 8. Validação de Pagamento em 2 Etapas & Ativação da Licenciada (criação no DB licenciadas).
       */
      public function confirmPaymentAndActivate(int $requestId, array $activationData, int $adminId): array;

      /**
       * 9. Atualização manual de status de uma requisição.
       */
      public function updateStatus(int $requestId, string $newStatus, int $adminId, ?string $notes = null): bool;
  }
  ```

---

### 3.4. Controller `OnboardingController.php`
- **Localização:** `apps/web-app/src/backend/api/v1/Controllers/OnboardingController.php`
- **Endpoints Expostos:**
  1. `POST /api/v1/admin/onboarding/tokens` -> `generateToken()`
  2. `GET /api/v1/public/onboarding/{token}` -> `getPublicTokenInfo($token)`
  3. `POST /api/v1/public/onboarding/{token}` -> `submitPublicOnboarding($token)`
  4. `POST /api/v1/public/onboarding/ocr` -> `processOcrDocument()`
  5. `GET /api/v1/admin/onboarding/funnel` -> `listFunnel()`
  6. `GET /api/v1/admin/onboarding/requests/{id}` -> `getRequestDetail($id)`
  7. `POST /api/v1/admin/onboarding/requests/{id}/generate-contract` -> `generateContract1Click($id)`
  8. `POST /api/v1/admin/onboarding/requests/{id}/whatsapp-reminder` -> `sendWhatsAppReminder($id)`
  9. `POST /api/v1/admin/onboarding/requests/{id}/confirm-payment` -> `confirmPaymentAndActivate($id)`
  10. `PATCH /api/v1/admin/onboarding/requests/{id}/status` -> `updateStatus($id)`

---

### 3.5. Registro de Rotas em `apps/web-app/src/backend/api/v1/index.php`
```php
// === PUBLIC ONBOARDING ROUTES (PLAN-064) ===
$router->add('GET', '/public/onboarding/{token}', function ($token) {
    (new OnboardingController())->getPublicTokenInfo($token);
});

$router->add('POST', '/public/onboarding/{token}', function ($token) {
    (new OnboardingController())->submitPublicOnboarding($token);
});

$router->add('POST', '/public/onboarding/ocr', function () {
    (new OnboardingController())->processOcrDocument();
});

// === GESTOR ONBOARDING FUNNEL ROUTES (PLAN-064) ===
$router->add('POST', '/admin/onboarding/tokens', function () use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->generateToken();
});

$router->add('GET', '/admin/onboarding/funnel', function () use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->listFunnel();
});

$router->add('GET', '/admin/onboarding/requests/{id}', function ($id) use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->getRequestDetail($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/generate-contract', function ($id) use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->generateContract1Click($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/whatsapp-reminder', function ($id) use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->sendWhatsAppReminder($id);
});

$router->add('POST', '/admin/onboarding/requests/{id}/confirm-payment', function ($id) use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->confirmPaymentAndActivate($id);
});

$router->add('PATCH', '/admin/onboarding/requests/{id}/status', function ($id) use ($middleware) {
    $middleware->handle();
    (new OnboardingController())->updateStatus($id);
});
```

---

### 3.6. Suíte de Testes CLI `tests/onboarding_funnel_smoke_test.php`
- **Arquivo:** `tests/onboarding_funnel_smoke_test.php`
- **Execução:** `php tests/onboarding_funnel_smoke_test.php`
- **Cenários a Validar com MockPDO:**
  1. **[TEST 1] Geração de Token Público com Expiração e Proteção SHA-256.**
  2. **[TEST 2] Validação de CPF e Extração OCR Defensiva (`SimpleOcrService`).**
  3. **[TEST 3] Submissão de Pré-cadastro Público & Gatilho Automático na Agenda do Gestor (`gestor_agenda_events`).**
  4. **[TEST 4] Geração de Contrato em 1-Clique com Preenchimento Automático de Variáveis e Link de Assinatura.**
  5. **[TEST 5] Régua de Cobrança WhatsApp (Geração de Lembrete após 24h).**
  6. **[TEST 6] Validação de Pagamento em 2 Etapas e Ativação no DB (`licenciadas.cpf`).**
  7. **[TEST 7] Transição das 5 Colunas do Kanban de Onboarding.**

---

## 4. Conformidade Constitucional (AGENTS.md)

| Regra Constitucional | Requisito | Status na Análise |
|----------------------|-----------|-------------------|
| **Regra 1: Strict Contracts** | Contrato JSON em `openspec/contracts/admin/gestor-onboarding-funnel.json` | Verificado e alinhado aos payloads. |
| **Regra 2: Espaço Negativo VPS** | Não alterar loopback `127.0.0.1:3306`, Traefik ou Docker Compose | Preservado (100% PHP/SQL). |
| **Regra 3: UX Elite / Paleta** | Navy `#0A3E60`, Gold `#ED7E13`, Mobile-first | Documentado para frontend. |
| **Regra 6: Desacoplamento de Serviços** | Lógica de negócio em `BodyHarmony\Services\*`, testes CLI isolados de auth global | 100% aderente (`OnboardingService`, `SimpleOcrService`). |
| **Regra 7: Sanitização de Seeds** | Uso de Heredoc (`<<<'EOD'`) em templates/seeds SQL | Especificado para migrations. |
| **Regra 8: Schema MySQL Licenciadas** | Uso estrito de `cpf` (proibido `document`) na tabela `licenciadas` | Validado e aplicado em `confirmPaymentAndActivate`. |

---

## 5. Conclusão da Investigação
A arquitetura backend está completamente mapeada, com contratos, modelos e serviços prontos para integração limpa. O design atende aos princípios de robustez, desacoplamento e testabilidade via CLI.
