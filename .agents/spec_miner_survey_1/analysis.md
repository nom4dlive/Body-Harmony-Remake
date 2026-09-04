# ⚛️ SPECIFICATION & REQUIREMENTS MINING REPORT — PLAN-064
## Funil de Onboarding de Licenciadas, Pré-cadastro com OCR, Emissão em 1-Clique, Régua WhatsApp e Validação em 2 Etapas

**Documento:** `f:\Body-Harmony-Remake\.agents\spec_miner_survey_1\analysis.md`  
**Data:** 2026-08-20  
**Autor:** Specification & Requirements Miner (`spec_miner_survey_1`)  
**Protocolo:** Nexus Protocol V3.1 (Doctor Harmony Protocol / PHP 8.4 / React 18)  
**Status da Auditoria:** 🟢 MINERADO & FORMALIZADO (100% Cobertura de Requisitos)

---

## 1. Sumário Executivo & Visão Geral

O **PLAN-064** estabelece a esteira de ponta a ponta para captação, validação, emissão jurídica e credenciamento de novas licenciadas da rede Body Harmony. O sistema unifica:
1. **Link Público de Auto-preenchimento com OCR:** Envio de convite via WhatsApp com token criptográfico seguro com expiração. A licenciada anexa fotos de documentos (RG, CPF, CNPJ, Alvará ou CNH) com extração defensiva automatizada de dados via OCR nativo PHP.
2. **Automação de Tarefas na Agenda do Gestor:** Ao submeter o pré-cadastro, uma tarefa de alta prioridade (`#ED7E13`) *"Emitir contrato para [Nome]"* é criada instantaneamente na Agenda do Gestor (`gestor_agenda_events`).
3. **Emissão de Contrato em 1-Clique:** O Gestor pré-visualiza os dados validados do onboarding, seleciona o modelo de contrato correspondente (`contract_templates`) e emite o documento em 1-clique com compilação de PDF oficial (`ContractPdfService`), assinatura da Licenciante e link de assinatura digital SHA-256 (`/assinar/{signToken}`).
4. **Régua de Comunicação & Cobrança Amigável via WhatsApp:** Integração com o ecossistema de templates do gestor para disparo de convite, link de assinatura, lembrete em 24h caso pendente de assinatura, e boas-vindas com credenciais.
5. **Validação de Pagamento em 2 Etapas:** Após a assinatura digital (`SIGNED`), a solicitação avança para validação financeira. O gestor confere o comprovante de pagamento/matrícula e clica em *"Confirmar Pagamento & Liberar Acesso"*, provisionando a conta na tabela `licenciadas`, liberando os módulos LMS (PLAN-009/011), fechando a pendência na Agenda e enviando mensagem de boas-vindas.
6. **Visão Dupla do Funil (React V3.1):** Painel executivo no Portal do Gestor com alternância fluida entre **Kanban de 5 Colunas** (`[1. Pré-cadastro] → [2. Contrato Emitido] → [3. Aguardando Assinatura] → [4. Validar Pagamento] → [5. Ativo & Liberado]`) e **Tabela Analítica de Licenciadas** com filtros rápidos e busca instantânea.

---

## 2. Verificação de Invariantes Constitucionais (Nexus Protocol V3.1)

| Invariante Constitucional | Diretriz Constitucional (AGENTS.md) | Aplicação e Conformidade no PLAN-064 | Status |
| :--- | :--- | :--- | :--- |
| **REGRA 1: Contratos de API Primeiro** | Proibido codificar sem contrato JSON em `openspec/contracts/` pré-definido com 100% de simetria. | Especificação detalhada do contrato `openspec/contracts/admin/gestor-onboarding-funnel.json` com schemas estritos para todos os endpoints. | 🟢 Conforme |
| **REGRA 2: Espaço Negativo & Blindagem da VPS** | Infraestrutura Docker/Traefik e restrição de loopback `127.0.0.1:3306` imutáveis. | Nenhuma porta pública MySQL exposta. Armazenamento de uploads restrito a diretório privado `private_uploads/onboarding/`. | 🟢 Conforme |
| **REGRA 3: Identidade Estética Luxury & Mobile-First** | Uso de Navy Blue (`#0A3E60`), Gold (`#ED7E13`), WhatsApp (`#25D366`), superfícies limpas, alvos de toque $\ge 44\times 44\text{px}$. | UI mobile-first para upload pelo celular com botões touch-friendly, paleta oficial e estados visuais elegantes. | 🟢 Conforme |
| **REGRA 4: Simetria de Governança** | Toda alteração nasce de especificação em `openspec/deltas/PLAN-*.md` e checklist rastreável. | Planejamento formal em `openspec/deltas/PLAN-064-funil-onboarding-licenciadas.md` e logs vinculados no Obsidian Vault. | 🟢 Conforme |
| **REGRA 5: Guardrails de Workflow** | Pré-verificação obrigatória antes de deploy e testes de contingência. | Suíte de testes CLI antes de commit e script de rollback atômico. | 🟢 Conforme |
| **REGRA 6: Desacoplamento & Isolamento de Testes CLI** | Controllers finos; regras de negócio em `BodyHarmony\Services\*`; testes sem invocar `auth_check.php` global. | `OnboardingService` e `SimpleOcrService` desacoplados; `tests/onboarding_funnel_smoke_test.php` executável via MockPDO sem dependência externa. | 🟢 Conforme |
| **REGRA 7: Limpeza de Seeds e Sanitização** | Proibido escape literal `\n` em seeds de banco; uso de Heredoc `<<<'EOD'`. | Textos e templates de onboarding semeados com Heredoc e sanitizados no frontend React. | 🟢 Conforme |
| **REGRA 8: Licenciadas CPF Invariant** | Terminantemente proibido usar `document` na tabela `licenciadas`. Usar sempre `cpf`. | Em todas as queries SQL, migrações e services, utiliza-se estritamente `cpf` (ex: `l.cpf`, `l.cpf AS licenciada_doc_db`). | 🟢 Conforme |

---

## 3. Matriz de Descoberta de Funcionalidades (Features Discovered)

## Features Discovered
| # | Categoria | Funcionalidade | Descrição | Entradas (Inputs) | Saídas (Outputs) | Comportamento de Erro | Descoberto Via |
|---|---|---|---|---|---|---|---|
| **F01** | Token & Link Público | Geração de Token Seguro de Onboarding | Gestor gera link exclusivo assinado para uma candidata | `categoria` (string), `telefone_whatsapp` (string), `nome_candidata` (string opcional), `expires_in_days` (int default 7) | `token` (64-hex), `public_link` (URL), `expires_at` (datetime), `whatsapp_message` (string) | Retorna HTTP 400 se telefone inválido ou categoria ausente; HTTP 401 se admin não logado | `gestor-onboarding-funnel.json`, `MagicTokenService.php` |
| **F02** | Token & Link Público | Validação de Token Público | Valida integridade e expiração do token ao abrir a página pública | `token` (URL path param) | `valid` (bool), `categoria` (string), `telefone_whatsapp` (string), `nome_candidata` (string) | Retorna HTTP 404/410 com mensagem amigável "Link expirado ou inválido" se token expirado/usado | `PublicOnboardingPage.jsx`, `PLAN-064.md` |
| **F03** | Pré-cadastro Público | Upload e Análise Defensiva de Documento (OCR) | Processa imagem/PDF de RG/CNH/CPF/CNPJ e extrai campos cadastrais | `file` (multipart: jpg, png, webp, pdf, max 10MB) | `extracted_data` (JSON: cpf, rg, nome, data_nasc, etc.), `confidence` (0-100), `raw_text` (string) | Se imagem ilegível ou sem texto, retorna `confidence: 0` e campos vazios sem erro 500 | `SimpleOcrService.php`, `ORIGINAL_REQUEST.md` |
| **F04** | Pré-cadastro Público | Submissão de Formulário de Pré-cadastro | Licenciada envia dados pessoais, endereço e documento | `token`, `nome`, `cpf`, `rg`, `email`, `telefone_whatsapp`, `cep`, `endereco`, `numero`, `bairro`, `cidade`, `estado`, `documento_img` | `success` (true), `onboarding_id` (int), `message` (string) | Valida CPF matematicamente; retorna HTTP 422 se CPF inválido ou email mal formatado; HTTP 409 se CPF duplicado | `PublicOnboardingPage.jsx`, `AGENTS.md` |
| **F05** | Automação & Agenda | Criação Automática de Tarefa na Agenda | Ao submeter o pré-cadastro, agenda recebe pendência de onboarding | `onboarding_id`, `nome`, `cpf`, `categoria` | `agenda_event_id` (int), evento criado com prioridade `alta`, cor `#ED7E13` | Trata exceção de banco de dados e registra log sem bloquear a criação do onboarding | `AgendaTriggerService.php`, `PLAN-064.md` |
| **F06** | Funil do Gestor | Listagem em 5 Colunas (Kanban) | Gestor visualiza os cards divididos pelos 5 estágios operacionais | Filtros opcionais: `search`, `categoria`, `date_start`, `date_end` | Objeto `columns` com `pre_cadastro`, `contrato_emitido`, `aguardando_assinatura`, `validar_pagamento`, `ativo_liberado` + contadores | HTTP 401 para requisições não autorizadas | `OnboardingFunnelPage.jsx`, `gestor-onboarding-funnel.json` |
| **F07** | Funil do Gestor | Listagem em Tabela Analítica | Visão tabular com paginação, busca por CPF/Nome/Cidade e badges | `page`, `limit`, `search`, `status`, `categoria` | Array de licenciadas em onboarding, totalizadores, paginação | Retorna array vazio com total 0 caso nenhum registro encontrado | `OnboardingFunnelPage.jsx` |
| **F08** | Emissão 1-Clique | Modal de Emissão de Contrato | Modal que pré-carrega os dados do onboarding e permite emitir em 1-clique | `onboarding_id`, `template_slug` (opcional), customizações de variáveis | `contract_uuid`, `sign_token`, `sign_url`, `pdf_url`, `whatsapp_share_text` | HTTP 404 se onboarding_id ou template não existir; HTTP 500 se mPDF falhar | `GenerateContractModal.jsx`, `ContractPdfService.php` |
| **F09** | Emissão 1-Clique | Transição Automática pós-Emissão | Atualiza status do onboarding para `contrato_emitido` e vincula contrato | `onboarding_id`, `contract_uuid` | `status: contrato_emitido`, atualiza tarefa da agenda para "Aguardando Assinatura" | Transação atômica PDO com rollback em caso de falha | `OnboardingService.php` |
| **F10** | Régua de WhatsApp | Disparo & Cópia de Mensagens Formatadas | Exibe régua de mensagens personalizadas prontas para envio via WhatsApp | `onboarding_id`, `template_stage` (`convite`, `assinatura`, `lembrete_24h`, `boas_vindas`) | Texto formatado com substituição de tags e link direto `https://wa.me/{phone}?text={encoded}` | Substitui tags vazias por fallback legível (`N/A` ou `[Dado Pendente]`) | `BRAINSTORM-051.md`, `WhatsAppShareModal.jsx` |
| **F11** | Assinatura Digital | Sincronização de Assinatura Externa | Ao assinar em `/assinar/{signToken}`, onboarding é promovido para validar pagamento | `sign_token`, dados da assinatura digital touch/gov.br | Contrato `status: SIGNED`, Onboarding `status: validar_pagamento` | Se já assinado, impede dupla assinatura com HTTP 400 | `sign.php`, `PLAN-036.md` |
| **F12** | Validação 2 Etapas | Confirmação de Pagamento & Liberação de Acesso | Gestor confirma pagamento, cria licenciada e concede acesso LMS | `onboarding_id`, `admin_notes` (opcional) | `licenciada_id` criado/ativado, `lms_access_granted: true`, tarefa agenda `status: concluido`, onboarding `status: ativo_liberado` | HTTP 400 se contrato ainda não foi assinado; Rollback completo em caso de falha no MySQL | `OnboardingService.php`, `AdminAlunaController.php` |
| **F13** | Governança | Histórico & Auditoria de Onboarding | Trilha de auditoria das mudanças de status do funil com ID do gestor e timestamps | `onboarding_id` | Array de eventos históricos: status anterior, status novo, alterado_por, data | Gravação silenciosa com log de fallback | `gestor_agenda_status_logs`, `V107.sql` |

---

## 4. Matriz de Casos de Borda (Edge Cases)

## Edge Cases
| # | Funcionalidade | Entrada (Input) / Cenário | Comportamento Observado & Tratamento Requerido |
|---|---|---|---|
| **E01** | Token de Onboarding | Token expirado (ex: gerado há mais de 7 dias) | Retorna HTTP 410 (Gone) ou payload `{ valid: false, reason: "expired" }`. Frontend exibe banner de erro amigável e botão para solicitar novo link ao suporte via WhatsApp. |
| **E02** | Token de Onboarding | Token já utilizado e com pré-cadastro concluído | Retorna HTTP 409 (Conflict) ou `{ valid: false, reason: "already_submitted" }`. Exibe tela de "Pré-cadastro já recebido, aguarde nosso contato". |
| **E03** | Upload de Documento | Arquivo corrompido, executável (.exe/.sh) ou > 10MB | Rejeição imediata no backend com HTTP 400 (`Arquivo inválido. Formatos permitidos: JPG, PNG, WEBP, PDF até 10MB`). Nenhum arquivo temporário gravado. |
| **E04** | OCR de Documentos | Imagem sem texto legível (foto borrada, objeto aleatório) | `SimpleOcrService` retorna `confidence: 0` e campos vazios. O frontend permite preenchimento manual de todos os campos sem interromper o fluxo. |
| **E05** | Validação de CPF | CPF com dígitos repetidos (`111.111.111-11`) ou dígito verificador inválido | Validador de CPF em PHP e React rejeita com erro `CPF inválido. Verifique os números digitados.`. Impede submissão de dados fraudulentos. |
| **E06** | Licenciadas CPF Invariant | Licenciada já existente no banco com o mesmo CPF | Se a licenciada já existir em `licenciadas`, o sistema vincula o `licenciada_id` existente sem duplicar registro nem quebrar a constraint UNIQUE `cpf`. |
| **E07** | Emissão 1-Clique | Tentativa de gerar contrato sem pré-cadastro concluído | Backend retorna HTTP 400 (`Dados cadastrais insuficientes para geração do contrato`). Modal sinaliza quais campos obrigatórios estão ausentes. |
| **E08** | Assinatura Digital | Contrato assinado fisicamente (PDF externo via Cartório/Gov.br) | Gestor pode utilizar o modal de `UploadSignedModal` existente para subir o PDF assinado, avançando o onboarding para `validar_pagamento`. |
| **E09** | Validação 2 Etapas | Gestor tenta liberar acesso sem confirmação de pagamento | O botão de liberação exige confirmação explícita no modal ("Declaro que conferi o comprovante financeiro") antes de disparar o provisionamento LMS. |
| **E10** | Concorrência de Gestores | Dois administradores tentam aprovar o mesmo onboarding simultaneamente | Bloqueio otimista via PDO com checagem de status atual (`WHERE id = ? AND status = 'validar_pagamento'`). O segundo recebe mensagem de que a ação já foi concluída. |

---

## 5. Especificação da Camada de Dados (SQL & Migrations)

### 5.1 Arquivo de Migração: `infrastructure/database/migrations/V107_Create_Licenciada_Onboarding_Funnel_Table.sql`

```sql
-- =========================================================================
-- MIGRATION: V107_Create_Licenciada_Onboarding_Funnel_Table.sql
-- AUTHOR: Antigravity Agent (Nexus Protocol V3.1)
-- DATE: 2026-08-20
-- SCOPE: Funil de Onboarding de Licenciadas, Tokens Públicos e Validação em 2 Etapas (PLAN-064)
-- =========================================================================

-- 1. Tabela de Tokens Públicos de Acesso ao Onboarding
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_tokens` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Token criptografico seguro de 64 caracteres hex',
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento' COMMENT 'Categoria do contrato pretendido',
  `telefone_whatsapp` VARCHAR(20) NOT NULL COMMENT 'Telefone WhatsApp da candidata',
  `nome_candidata` VARCHAR(150) NULL COMMENT 'Nome inicial da candidata fornecido pelo gestor',
  `created_by_admin_id` INT UNSIGNED NULL COMMENT 'ID do gestor que emitiu o convite',
  `expires_at` DATETIME NOT NULL COMMENT 'Data e hora limite de validade do link',
  `used_at` DATETIME NULL COMMENT 'Momento em que o formulario foi enviado',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_token` (`token`),
  INDEX `idx_onboarding_phone` (`telefone_whatsapp`),
  INDEX `idx_onboarding_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela Principal de Solicitações de Onboarding (Funil de 5 Colunas)
CREATE TABLE IF NOT EXISTS `licenciada_onboarding_requests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token_id` BIGINT UNSIGNED NULL COMMENT 'Vinculo com o token de origem',
  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
  `nome` VARCHAR(255) NOT NULL COMMENT 'Nome completo ou Razao Social',
  `cpf` VARCHAR(14) NOT NULL COMMENT 'CPF ou CNPJ formatado (Licenciadas CPF Invariant)',
  `rg` VARCHAR(30) NULL COMMENT 'Documento de identidade RG / CNH',
  `email` VARCHAR(150) NOT NULL COMMENT 'E-mail principal de contato',
  `telefone_whatsapp` VARCHAR(20) NOT NULL COMMENT 'Telefone WhatsApp oficial',
  `cep` VARCHAR(10) NULL COMMENT 'CEP do endereco profissional/residencial',
  `endereco` VARCHAR(255) NULL COMMENT 'Logradouro completo',
  `numero` VARCHAR(30) NULL COMMENT 'Numero do imovel',
  `bairro` VARCHAR(100) NULL COMMENT 'Bairro',
  `cidade` VARCHAR(100) NULL COMMENT 'Cidade de atuacao',
  `estado` VARCHAR(10) NULL COMMENT 'UF do estado (ex: SP, RJ)',
  `documento_img` VARCHAR(255) NULL COMMENT 'Caminho do upload seguro em private_uploads/onboarding/',
  `ocr_extracted_data` JSON NULL COMMENT 'Dados brutos e confianca extraidos pelo SimpleOcrService',
  `status` ENUM('pre_cadastro', 'contrato_emitido', 'aguardando_assinatura', 'validar_pagamento', 'ativo_liberado', 'cancelado') NOT NULL DEFAULT 'pre_cadastro' COMMENT 'Etapa do funil',
  `contract_uuid` VARCHAR(64) NULL COMMENT 'UUID do contrato gerado na tabela contracts',
  `licenciada_id` INT(11) NULL COMMENT 'ID da licenciada criada/vinculada na tabela licenciadas',
  `agenda_event_id` BIGINT UNSIGNED NULL COMMENT 'ID da tarefa de onboarding na Agenda do Gestor',
  `payment_confirmed_at` DATETIME NULL COMMENT 'Data de confirmacao da taxa/pagamento',
  `payment_confirmed_by_admin_id` INT UNSIGNED NULL COMMENT 'Gestor que validou a 2a etapa',
  `admin_notes` TEXT NULL COMMENT 'Observacoes internas da equipe do gestor',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_onboarding_status` (`status`),
  INDEX `idx_onboarding_cpf` (`cpf`),
  INDEX `idx_onboarding_contract_uuid` (`contract_uuid`),
  INDEX `idx_onboarding_licenciada_id` (`licenciada_id`),
  CONSTRAINT `fk_onboarding_token` FOREIGN KEY (`token_id`) REFERENCES `licenciada_onboarding_tokens` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. Arquitetura de Backend (PHP 8.4) & Classes de Serviço

### 6.1 `OnboardingService.php` (`BodyHarmony\Services\OnboardingService`)

Classe central de orquestração do funil de onboarding, totalmente desacoplada dos controladores HTTP:

```php
namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;

class OnboardingService {
    private PDO $db;
    private AgendaService $agendaService;
    private SimpleOcrService $ocrService;

    public function __construct(PDO $db) {
        $this->db = $db;
        $this->agendaService = new AgendaService($this->db);
        $this->ocrService = new SimpleOcrService();
    }

    // 1. Gera token criptográfico assinado e link público
    public function createOnboardingToken(string $categoria, string $telefone, ?string $nome = null, ?int $adminId = null, int $expiresInDays = 7): array;

    // 2. Valida token público e retorna metadados
    public function validateToken(string $token): ?array;

    // 3. Processa submissão do formulário público + OCR defensivo + cria tarefa na Agenda
    public function submitPublicOnboarding(string $token, array $data, ?array $fileUpload): array;

    // 4. Lista o funil completo organizado nas 5 colunas do Kanban + estatísticas
    public function listFunnel(array $filters = []): array;

    // 5. Retorna detalhes completos de uma solicitação de onboarding
    public function getOnboardingDetail(int $id): ?array;

    // 6. Emissão de contrato em 1-clique (auto-fill das tags + mPDF + sign_token + update de status)
    public function generateContract(int $onboardingId, ?string $templateSlug = null, ?int $adminId = null): array;

    // 7. Validação em 2 Etapas: Confirmação de Pagamento, Criação de Licenciada e Liberação LMS
    public function confirmPaymentAndLiberate(int $onboardingId, ?int $adminId = null, ?string $notes = null): array;

    // 8. Atualização manual de status ou cancelamento
    public function updateStatus(int $onboardingId, string $newStatus, ?int $adminId = null): bool;

    // 9. Constrói régua de mensagens WhatsApp com variáveis preenchidas
    public function getWhatsAppMessagePayload(int $onboardingId, string $stageType): array;
}
```

### 6.2 `SimpleOcrService.php` (`BodyHarmony\Services\SimpleOcrService`)

Leitor defensivo em PHP 8.4 nativo para extração de padrões e dados cadastrais a partir de documentos:
- **Formatos suportados:** JPEG, PNG, WEBP, PDF (até 10MB).
- **Mecanismos de Extração:** Leitura de cabeçalhos de metadados, análise de fluxos binários e aplicação de expressões regulares defensivas para:
  - CPF: `/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/`
  - RG: `/\b(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9X])\b/i`
  - CNPJ: `/\b(\d{2}\.?\d{3}\.?\d{3}\/\d{4}-?\d{2})\b/`
  - CEP: `/\b(\d{5}-?\d{3})\b/`
- **Garantia de Não-Bloqueio (Zero Crash Invariant):** Caso a imagem não possua texto legível por regex ou metadados, o serviço retorna `confidence: 0`, permitindo preenchimento manual transparente no frontend sem lançar exceções não tratadas.

### 6.3 Mapeamento de Rotas no `api/v1/index.php`

```php
// === ONBOARDING FUNNEL ROUTES (PLAN-064) ===

// 1. Rotas Administrativas Protegidas (Requer Token do Gestor)
$router->add('POST', '/admin/onboarding/links', function () use ($middleware, $pdo) {
    $admin = $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->createLink($admin['id']);
});

$router->add('GET', '/admin/onboarding/funnel', function () use ($middleware, $pdo) {
    $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->getFunnel();
});

$router->add('GET', '/admin/onboarding/{id}', function ($id) use ($middleware, $pdo) {
    $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->getDetail((int)$id);
});

$router->add('POST', '/admin/onboarding/{id}/generate-contract', function ($id) use ($middleware, $pdo) {
    $admin = $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->generateContract((int)$id, $admin['id']);
});

$router->add('POST', '/admin/onboarding/{id}/confirm-payment', function ($id) use ($middleware, $pdo) {
    $admin = $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->confirmPayment((int)$id, $admin['id']);
});

$router->add('PATCH', '/admin/onboarding/{id}/status', function ($id) use ($middleware, $pdo) {
    $admin = $middleware->requireAdmin();
    $controller = new OnboardingController($pdo);
    $controller->updateStatus((int)$id, $admin['id']);
});

// 2. Rotas Públicas (Sem Autenticação Prévia)
$router->add('GET', '/public/onboarding/{token}', function ($token) use ($pdo) {
    $controller = new OnboardingController($pdo);
    $controller->getPublicOnboarding($token);
});

$router->add('POST', '/public/onboarding/submit', function () use ($pdo) {
    $controller = new OnboardingController($pdo);
    $controller->submitPublicOnboarding();
});
```

---

## 7. Mapeamento de Variáveis para Emissão em 1-Clique

Ao acionar a emissão em 1-clique, os dados cadastrais da solicitação de onboarding preenchem automaticamente as variáveis estruturadas dos modelos em `contract_templates`:

| Variável do Modelo | Origem no Onboarding (`licenciada_onboarding_requests`) | Exemplo / Formato |
| :--- | :--- | :--- |
| `{{LICENCIADA_NOME_RAZAO}}` | `$req['nome']` | `"Dra. Camila Silveira Estética Avançada"` |
| `{{LICENCIADA_CPF}}` / `{{LICENCIADA_CNPJ_CPF}}` | `$req['cpf']` | `"123.456.789-00"` (Licenciadas CPF Invariant) |
| `{{LICENCIADA_RG}}` | `$req['rg']` | `"12.345.678-9 SSP/SP"` |
| `{{LICENCIADA_EMAIL_OFICIAL}}` | `$req['email']` | `"camila.estetica@gmail.com"` |
| `{{LICENCIADA_TELEFONE}}` | `$req['telefone_whatsapp']` | `"(11) 98765-4321"` |
| `{{LICENCIADA_ENDERECO}}` | `$req['endereco'] . ', ' . $req['numero'] . ' - ' . $req['bairro']` | `"Av. Paulista, 1000 - Bela Vista"` |
| `{{LICENCIADA_CIDADE_UF}}` / `{{CIDADE_OPERACIONAL}}` | `$req['cidade'] . '/' . $req['estado']` | `"São Paulo/SP"` |
| `{{ESTADO_OPERACIONAL}}` | `$req['estado']` | `"SP"` |
| `{{DATA_CONTRATO}}` | `date('d/m/Y')` | `"20/08/2026"` |
| `{{CIDADE_DATA_EXTENSO}}` | `"São Paulo, " . date('d') . " de " . $mesExtenso . " de " . date('Y')` | `"São Paulo, 20 de Agosto de 2026"` |

---

## 8. Régua de Mensagens & Comunicação WhatsApp

Quatro templates amigáveis e acolhedores no padrão Nexus V3.1 são disponibilizados com botão de cópia instantânea e disparo via `wa.me`:

### 8.1 Template 1: Convite de Pré-cadastro Público
```text
Olá, {{NOME}}! ✨ Seja muito bem-vinda à família Body Harmony! 💖

Estamos muito felizes com o seu interesse em se tornar uma Licenciada Oficial da nossa marca! 🌿

Para iniciarmos o seu credenciamento com total agilidade, preparamos um link exclusivo e seguro para você preencher seus dados e enviar a foto dos seus documentos pelo celular em menos de 2 minutos:

🔗 *Link Exclusivo de Pré-cadastro:*
{{LINK_ONBOARDING}}

Se tiver qualquer dúvida durante o preenchimento, estou por aqui para te ajudar! 😊✨
```

### 8.2 Template 2: Envio de Link para Assinatura Digital do Contrato
```text
Olá, {{NOME}}! Tudo bem? ✨

Seu Contrato de Licenciamento Body Harmony foi gerado com sucesso e já está pronto para assinatura digital com total validade jurídica! 🔒📄

Você pode ler o documento e assinar direto na tela do seu celular pelo link seguro abaixo:

🔗 *Link para Assinatura Digital:*
{{LINK_ASSINATURA}}

Assim que você assinar, nosso sistema já avança para a liberação dos seus acessos. Qualquer dúvida, conte comigo! 🌿💖
```

### 8.3 Template 3: Lembrete Amigável em 24h (Follow-Up de Assinatura)
```text
Olá, {{NOME}}! Tudo ótimo com você? 😊

Passando apenas para te lembrar com carinho que o seu contrato Body Harmony está aguardando sua assinatura digital! 📄✨

Falta bem pouquinho para oficializarmos sua licença e liberarmos seu acesso exclusivo ao Portal de Aulas e materiais da marca. 🚀

🔗 *Acesse aqui para assinar:*
{{LINK_ASSINATURA}}

Se precisar de qualquer esclarecimento sobre alguma cláusula, é só me avisar por aqui! 💖🌿
```

### 8.4 Template 4: Boas-Vindas & Primeiro Acesso ao Portal da Licenciada
```text
Parabéns, {{NOME}}! 🎉 Seja oficialmente bem-vinda à rede de Licenciadas Body Harmony! 👑💖

Seu contrato foi formalizado e seu acesso ao Portal Exclusivo da Licenciada já está 100% liberado! 🚀✨

Para fazer seu primeiro acesso:
🔗 *Portal:* https://bodyharmony.com.br/portal-licenciada
✉️ *Login:* {{EMAIL}}
🔑 *Senha temporária:* {{SENHA}}

Ao entrar, você poderá cadastrar sua senha definitiva e explorar todos os módulos e certificações. Desejamos muito sucesso nessa jornada! 🌟🌿
```

---

## 9. Especificação da Camada de Interface (React 18)

### 9.1 Página Pública: `PublicOnboardingPage.jsx` (`/onboarding/:token`)
- **Design:** Mobile-First, estética Luxury V3.1 (Navy Blue `#0A3E60`, Luxury Gold `#ED7E13`, Fundo `#F8FAFC`).
- **Componentes de UI:**
  - Header com logotipo oficial Body Harmony.
  - Stepper visual de progresso: `[1. Dados Pessoais] → [2. Endereço & Atuação] → [3. Foto do Documento] → [4. Revisão & Envio]`.
  - Zona de upload (Camera/Dropzone) com captura nativa no smartphone (`accept="image/*,application/pdf"` e `capture="environment"`).
  - Feedback visual instantâneo do OCR com campos pré-preenchidos e editáveis.
  - Máscaras dinâmicas de CPF (`000.000.000-00`), Telefone (`(00) 00000-0000`) e CEP (`00000-000`).
  - Botão de envio proeminente dourado (`#ED7E13`) com alvo de toque $\ge 44\times 44\text{px}$.

### 9.2 Painel do Gestor: `OnboardingFunnelPage.jsx` (`/portal-gestor/onboarding`)
- **Dupla Visão com Alternador (Tabs/Toggle):**
  1. **Visão Kanban (5 Colunas):**
     - Coluna 1: `[1. Pré-cadastro]` (`badge`: Navy `#0A3E60`)
     - Coluna 2: `[2. Contrato Emitido]` (`badge`: Indigo `#4F46E5`)
     - Coluna 3: `[3. Aguardando Assinatura]` (`badge`: Amarelo/Dourado `#ED7E13`)
     - Coluna 4: `[4. Validar Pagamento]` (`badge`: Roxo/Pink `#9333EA`)
     - Coluna 5: `[5. Ativo & Liberado]` (`badge`: Verde `#10B981`)
     - Cards com nome, telefone WhatsApp, cidade/UF, tempo decorrido no estágio e botões de ação rápida.
  2. **Visão Tabela:**
     - Tabela responsiva com busca rápida, filtros por status/categoria, paginação e ordenação por data.
- **Botão Superior "Gerar Novo Link de Convite":** Abre modal para escolher categoria, informar telefone WhatsApp da candidata e gerar link com botão de cópia rápida.

### 9.3 Modal de Emissão: `GenerateContractModal.jsx`
- Pré-carregamento dos dados do onboarding.
- Seletor de Modelo (`contract_templates`).
- Acordeão com variáveis pré-preenchidas para conferência.
- Botão *"Gerar e Enviar Contrato"* que compila o PDF, gera o token de assinatura e abre o modal de compartilhamento WhatsApp com mensagem pronta.

---

## 10. Estrutura do Teste de Fumaça CLI (`tests/onboarding_funnel_smoke_test.php`)

Para atender com 100% de conformidade a **REGRA 6** (Desacoplamento e Isolamento CLI), a suíte `tests/onboarding_funnel_smoke_test.php` utilizará a arquitetura MockPDO comprovada no `agenda_smoke_test.php`, validando:
1. **Teste 1:** Geração de Token Criptográfico com expiração e criação de link público seguro.
2. **Teste 2:** Rejeição de Token Expirado e Token Inválido.
3. **Teste 3:** Submissão do Pré-cadastro com upload de imagem e extração defensiva via `SimpleOcrService`.
4. **Teste 4:** Disparo de Trigger na Agenda do Gestor (`gestor_agenda_events`) ao submeter pré-cadastro.
5. **Teste 5:** Emissão de Contrato em 1-Clique com auto-fill das variáveis, geração de `sign_token` e atualização do status para `contrato_emitido`.
6. **Teste 6:** Transição de Assinatura Digital e avanço para `validar_pagamento`.
7. **Teste 7:** Validação em 2 Etapas: Confirmação de pagamento, criação da licenciada com `cpf` (Licenciadas CPF Invariant), liberação LMS e conclusão da tarefa na Agenda.

---

## 11. Conclusão da Mineração

Todos os requisitos funcionais, não-funcionais, regras de negócio, contratos de API, schemas de banco de dados e invariantes constitucionais do **PLAN-064** foram plenamente mapeados e documentados. O projeto está 100% pronto para a elaboração do plano de implementação e subsequente desenvolvimento.
