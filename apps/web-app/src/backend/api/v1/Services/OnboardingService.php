<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;

if (!class_exists('BodyHarmony\Services\ContractPdfService')) {
    $pdfServiceFile = __DIR__ . '/ContractPdfService.php';
    if (file_exists($pdfServiceFile)) {
        require_once $pdfServiceFile;
    }
}

/**
 * OnboardingService (PLAN-064)
 * 
 * Orchestration service for the Licenciada Onboarding Funnel:
 * 1. Public token link generation with expiration
 * 2. Public submission & defensive OCR data extraction
 * 3. Automatic Agenda Task creation on submit (#ED7E13)
 * 4. 1-Click Contract generation with variable auto-fill
 * 5. 24h WhatsApp reminder rule
 * 6. 2-Step Validation: Payment confirmation, Licenciada provisioning (strict 'cpf' column) & LMS access liberation
 * 7. 5-Column Kanban & Tabular view aggregation
 * 
 * @author Antigravity Agent (Nexus Protocol V3.1)
 */
class OnboardingService {
    private $db;
    private AgendaService $agendaService;
    private ?ContractPdfService $pdfService;
    private SimpleOcrService $ocrService;

    public function __construct(
        $db,
        ?AgendaService $agendaService = null,
        ?ContractPdfService $pdfService = null,
        ?SimpleOcrService $ocrService = null
    ) {
        $this->db = $db;
        $this->ensureOnboardingTablesExist();
        $this->agendaService = $agendaService ?? new AgendaService($this->db);
        $this->pdfService = $pdfService; // Lazy loaded if needed
        $this->ocrService = $ocrService ?? new SimpleOcrService();
    }

    /**
     * Auto-ensure onboarding tables in runtime (ADR-008).
     */
    private function ensureOnboardingTablesExist(): void {
        static $checked = false;
        if ($checked) return;
        if (!is_object($this->db)) return;

        try {
            // 1. licenciada_onboarding_tokens
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `licenciada_onboarding_tokens` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `token` VARCHAR(64) NOT NULL UNIQUE,
                  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
                  `telefone_whatsapp` VARCHAR(30) NOT NULL,
                  `nome_candidata` VARCHAR(255) NULL,
                  `created_by_admin_id` INT UNSIGNED NULL,
                  `expires_at` DATETIME NOT NULL,
                  `used_at` DATETIME NULL,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_onboarding_token` (`token`),
                  INDEX `idx_onboarding_phone` (`telefone_whatsapp`),
                  INDEX `idx_onboarding_expires` (`expires_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. licenciada_onboarding_requests
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `licenciada_onboarding_requests` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `token_id` BIGINT UNSIGNED NULL,
                  `token_str` VARCHAR(64) NULL,
                  `categoria` VARCHAR(60) NOT NULL DEFAULT 'Licenciamento',
                  `template_slug` VARCHAR(80) NOT NULL DEFAULT 'licenciamento-padrao',
                  `nome` VARCHAR(255) NOT NULL,
                  `razao_social` VARCHAR(255) NULL,
                  `nome_fantasia` VARCHAR(255) NULL,
                  `cpf` VARCHAR(20) NOT NULL,
                  `cnpj` VARCHAR(30) NULL,
                  `is_cnpj_em_abertura` TINYINT(1) NOT NULL DEFAULT 0,
                  `rg` VARCHAR(30) NULL,
                  `email` VARCHAR(150) NOT NULL,
                  `telefone_whatsapp` VARCHAR(30) NOT NULL,
                  `instagram` VARCHAR(100) NULL,
                  `cep` VARCHAR(20) NULL,
                  `endereco` TEXT NULL,
                  `numero` VARCHAR(30) NULL,
                  `complemento` VARCHAR(100) NULL,
                  `bairro` VARCHAR(100) NULL,
                  `cidade` VARCHAR(100) NULL,
                  `estado` VARCHAR(10) NULL,
                  `nacionalidade` VARCHAR(50) NULL DEFAULT 'brasileira',
                  `estado_civil` VARCHAR(50) NULL DEFAULT 'solteira',
                  `profissao` VARCHAR(100) NULL DEFAULT 'Esteticista',
                  `documento_img` VARCHAR(255) NULL,
                  `comprovante_pagamento_img` VARCHAR(255) NULL,
                  `comprovante_residencia_img` VARCHAR(255) NULL,
                  `contrato_social_img` VARCHAR(255) NULL,
                  `certificados_imgs` JSON NULL,
                  `ocr_extracted_data` JSON NULL,
                  `ocr_confidence` DECIMAL(5,2) NULL DEFAULT 0.00,
                  `status` ENUM('PRE_CADASTRO', 'DADOS_PREENCHIDOS', 'CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA', 'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO', 'CANCELADO') NOT NULL DEFAULT 'PRE_CADASTRO',
                  `contract_uuid` VARCHAR(64) NULL,
                  `licenciada_id` INT(11) NULL,
                  `agenda_event_id` BIGINT UNSIGNED NULL,
                  `taxa_inicial_num` VARCHAR(50) NULL DEFAULT '7.000,00',
                  `taxa_inicial_extenso` VARCHAR(255) NULL DEFAULT 'sete mil reais',
                  `condicoes_pagamento` VARCHAR(255) NULL DEFAULT 'à vista via PIX',
                  `valor_minimo_sessao` VARCHAR(50) NULL DEFAULT '150,00',
                  `cidade_celebracao` VARCHAR(100) NULL DEFAULT 'Assis/SP',
                  `last_reminder_sent_at` DATETIME NULL,
                  `payment_confirmed_at` DATETIME NULL,
                  `activated_at` DATETIME NULL,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_onboarding_cpf` (`cpf`),
                  INDEX `idx_onboarding_status` (`status`),
                  INDEX `idx_onboarding_contract` (`contract_uuid`),
                  INDEX `idx_onboarding_licenciada` (`licenciada_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. Auto-heal colunas que podem faltar caso a tabela ja existisse em versao anterior
            $columnsToEnsure = [
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `razao_social` VARCHAR(255) NULL AFTER `nome`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `nome_fantasia` VARCHAR(255) NULL AFTER `razao_social`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `cnpj` VARCHAR(30) NULL AFTER `cpf`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `is_cnpj_em_abertura` TINYINT(1) NOT NULL DEFAULT 0 AFTER `cnpj`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `instagram` VARCHAR(100) NULL AFTER `telefone_whatsapp`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `comprovante_pagamento_img` VARCHAR(255) NULL AFTER `documento_img`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `comprovante_residencia_img` VARCHAR(255) NULL AFTER `comprovante_pagamento_img`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `contrato_social_img` VARCHAR(255) NULL AFTER `comprovante_residencia_img`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `certificados_imgs` JSON NULL AFTER `contrato_social_img`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `admin_notes` TEXT NULL",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `payment_confirmed_by_admin_id` BIGINT UNSIGNED NULL AFTER `payment_confirmed_at`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `is_test` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `assigned_admin_id` INT UNSIGNED NULL AFTER `is_test`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `future_cohort_tag` VARCHAR(100) NULL AFTER `assigned_admin_id`",
                "ALTER TABLE `licenciada_onboarding_requests` ADD COLUMN `deleted_at` DATETIME NULL AFTER `updated_at`",
                "ALTER TABLE `licenciada_onboarding_tokens` ADD COLUMN `is_test` TINYINT(1) NOT NULL DEFAULT 0 AFTER `used_at`"
            ];

            foreach ($columnsToEnsure as $altSql) {
                try {
                    $this->db->exec($altSql);
                } catch (Throwable $ignore) {
                    // Coluna ja existente, ignora
                }
            }

            $checked = true;
        } catch (Throwable $e) {
            error_log("Error in ensureOnboardingTablesExist: " . $e->getMessage());
        }
    }

    /**
     * Helper to get or lazily instantiate ContractPdfService
     */
    private function getPdfService(): ContractPdfService {
        if ($this->pdfService === null) {
            $this->pdfService = new ContractPdfService();
        }
        return $this->pdfService;
    }

    // =========================================================================
    // 1. TOKEN GENERATION & VALIDATION
    // =========================================================================

    /**
     * Generates a cryptographically secure onboarding token and public link.
     * 
     * @param array $data ['categoria' => string, 'telefone_whatsapp' => string, 'nome_candidata' => ?string, 'expires_in_days' => ?int]
     * @param int|null $adminId
     * @return array
     */
    public function createToken(array $data, ?int $adminId = null): array {
        $categoria = trim($data['categoria'] ?? 'Licenciamento');
        $telefone = trim($data['telefone_whatsapp'] ?? '');
        $nome = isset($data['nome_candidata']) ? trim($data['nome_candidata']) : null;
        $expiresInDays = (int)($data['expires_in_days'] ?? 7);
        if ($expiresInDays <= 0) $expiresInDays = 7;

        if (empty($telefone)) {
            throw new Exception("Telefone WhatsApp é obrigatório para emissão do convite.");
        }

        // Generate 64-char hex token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime("+$expiresInDays days"));

        $stmt = $this->db->prepare("
            INSERT INTO licenciada_onboarding_tokens 
            (token, categoria, telefone_whatsapp, nome_candidata, created_by_admin_id, expires_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$token, $categoria, $telefone, $nome, $adminId, $expiresAt]);

        $baseUrl = $this->getBaseUrl();
        $publicLink = rtrim($baseUrl, '/') . "/onboarding/{$token}";

        $whatsappMessage = $this->buildInviteMessage($nome, $publicLink);

        return [
            'success' => true,
            'token' => $token,
            'public_link' => $publicLink,
            'expires_at' => $expiresAt,
            'categoria' => $categoria,
            'telefone_whatsapp' => $telefone,
            'whatsapp_message' => $whatsappMessage
        ];
    }

    /**
     * Validates an onboarding token.
     * 
     * @param string $token
     * @return array|null
     */
    public function validateToken(string $token): ?array {
        $token = trim($token);
        if (empty($token)) {
            return ['valid' => false, 'reason' => 'empty_token'];
        }

        $stmt = $this->db->prepare("
            SELECT * FROM licenciada_onboarding_tokens 
            WHERE token = ? 
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return ['valid' => false, 'reason' => 'not_found'];
        }

        if (!empty($row['used_at'])) {
            return ['valid' => false, 'reason' => 'already_used', 'data' => $row];
        }

        if (strtotime($row['expires_at']) < time()) {
            return ['valid' => false, 'reason' => 'expired', 'data' => $row];
        }

        return [
            'valid' => true,
            'id' => (int)$row['id'],
            'token' => $row['token'],
            'categoria' => $row['categoria'],
            'telefone_whatsapp' => $row['telefone_whatsapp'],
            'nome_candidata' => $row['nome_candidata'],
            'expires_at' => $row['expires_at'],
            'data' => $row
        ];
    }

    // =========================================================================
    // 2. PUBLIC ONBOARDING SUBMISSION & OCR
    // =========================================================================

    /**
     * Submits public onboarding form, extracts document OCR data, processes all attached documents,
     * marks token used, and triggers a high-priority task on Gestor Agenda.
     * 
     * @param string $token
     * @param array $data Form fields (nome, cpf, rg, email, telefone_whatsapp, cnpj, razao_social, instagram, etc.)
     * @param array|null $files Uploaded files ($_FILES array or single file)
     * @return array
     */
    public function submitPublicOnboarding(string $token, array $data, ?array $files = null): array {
        $tokenValidation = $this->validateToken($token);
        if (!$tokenValidation || empty($tokenValidation['valid'])) {
            $reason = $tokenValidation['reason'] ?? 'invalid_token';
            throw new Exception("Link de onboarding inválido ou expirado ({$reason}).");
        }

        $tokenId = $tokenValidation['id'] ?? null;
        $adminId = $tokenValidation['data']['created_by_admin_id'] ?? 1;

        // Process OCR on primary identity document if provided
        $ocrResult = ['confidence' => 0.0, 'extracted_data' => []];
        $documentPath = null;
        $comprovantePagamentoPath = null;
        $comprovanteResidenciaPath = null;
        $contratoSocialPath = null;
        $certificadosPaths = [];

        // Normalize files array
        $docFile = $files['documento_img'] ?? (isset($files['tmp_name']) ? $files : null);
        if ($docFile && !empty($docFile['tmp_name'])) {
            $ocrResult = $this->ocrService->processDocument($docFile);
            $documentPath = $this->saveUploadedDocument($docFile, 'identidade_');
        } elseif (!empty($data['documento_img']) && is_string($data['documento_img'])) {
            $documentPath = $data['documento_img'];
            $ocrResult = $this->ocrService->processDocument($data['documento_img']);
        }

        // Comprovante de Pagamento
        if (!empty($files['comprovante_pagamento_img']['tmp_name'])) {
            $comprovantePagamentoPath = $this->saveUploadedDocument($files['comprovante_pagamento_img'], 'pagamento_');
        } elseif (!empty($data['comprovante_pagamento_img']) && is_string($data['comprovante_pagamento_img'])) {
            $comprovantePagamentoPath = $data['comprovante_pagamento_img'];
        }

        // Comprovante de Residência
        if (!empty($files['comprovante_residencia_img']['tmp_name'])) {
            $comprovanteResidenciaPath = $this->saveUploadedDocument($files['comprovante_residencia_img'], 'residencia_');
        } elseif (!empty($data['comprovante_residencia_img']) && is_string($data['comprovante_residencia_img'])) {
            $comprovanteResidenciaPath = $data['comprovante_residencia_img'];
        }

        // Cartão CNPJ / Contrato Social
        if (!empty($files['contrato_social_img']['tmp_name'])) {
            $contratoSocialPath = $this->saveUploadedDocument($files['contrato_social_img'], 'cnpj_contrato_');
        } elseif (!empty($data['contrato_social_img']) && is_string($data['contrato_social_img'])) {
            $contratoSocialPath = $data['contrato_social_img'];
        }

        // Certificados / Anexos múltiplos
        if (!empty($files['certificados'])) {
            if (is_array($files['certificados']['tmp_name'])) {
                foreach ($files['certificados']['tmp_name'] as $idx => $tmpName) {
                    if (!empty($tmpName)) {
                        $singleFile = [
                            'name' => $files['certificados']['name'][$idx] ?? 'cert.jpg',
                            'type' => $files['certificados']['type'][$idx] ?? 'image/jpeg',
                            'tmp_name' => $tmpName,
                            'error' => $files['certificados']['error'][$idx] ?? 0,
                            'size' => $files['certificados']['size'][$idx] ?? 0,
                        ];
                        $path = $this->saveUploadedDocument($singleFile, 'certificado_' . ($idx + 1) . '_');
                        if ($path) $certificadosPaths[] = $path;
                    }
                }
            } elseif (!empty($files['certificados']['tmp_name'])) {
                $path = $this->saveUploadedDocument($files['certificados'], 'certificado_');
                if ($path) $certificadosPaths[] = $path;
            }
        } elseif (!empty($data['certificados_imgs'])) {
            $certificadosPaths = is_array($data['certificados_imgs']) ? $data['certificados_imgs'] : (json_decode($data['certificados_imgs'], true) ?: []);
        }

        // Merge form data with OCR fallbacks
        $nome = trim($data['nome'] ?? $ocrResult['extracted_data']['nome'] ?? $tokenValidation['nome_candidata'] ?? '');
        $cpfRaw = $data['cpf'] ?? $ocrResult['extracted_data']['cpf'] ?? '';
        $cpf = $this->ocrService->formatCpf(preg_replace('/\D/', '', $cpfRaw));
        $rg = trim($data['rg'] ?? $ocrResult['extracted_data']['rg'] ?? '');
        $email = trim($data['email'] ?? '');
        $telefone = trim($data['telefone_whatsapp'] ?? $tokenValidation['telefone_whatsapp'] ?? '');
        $instagram = trim($data['instagram'] ?? '');
        $cnpj = trim($data['cnpj'] ?? '');
        $razaoSocial = trim($data['razao_social'] ?? '');
        $nomeFantasia = trim($data['nome_fantasia'] ?? '');
        $isCnpjEmAbertura = !empty($data['is_cnpj_em_abertura']) && ($data['is_cnpj_em_abertura'] === 'true' || $data['is_cnpj_em_abertura'] === true || $data['is_cnpj_em_abertura'] === 1 || $data['is_cnpj_em_abertura'] === '1') ? 1 : 0;

        $cep = trim($data['cep'] ?? $ocrResult['extracted_data']['cep'] ?? '');
        $endereco = trim($data['endereco'] ?? $ocrResult['extracted_data']['endereco'] ?? '');
        $numero = trim($data['numero'] ?? $ocrResult['extracted_data']['numero'] ?? '');
        $complemento = trim($data['complemento'] ?? '');
        $bairro = trim($data['bairro'] ?? $ocrResult['extracted_data']['bairro'] ?? '');
        $cidade = trim($data['cidade'] ?? $ocrResult['extracted_data']['cidade'] ?? '');
        $estado = trim($data['estado'] ?? $ocrResult['extracted_data']['estado'] ?? 'SP');
        $categoria = trim($data['categoria'] ?? $tokenValidation['categoria'] ?? 'Licenciamento');

        if (empty($nome)) {
            throw new Exception("Nome completo é obrigatório.");
        }
        if (empty($cpf)) {
            throw new Exception("CPF é obrigatório.");
        }
        if (empty($email)) {
            throw new Exception("E-mail é obrigatório.");
        }
        if (empty($telefone)) {
            throw new Exception("Telefone WhatsApp é obrigatório.");
        }

        // Insert into licenciada_onboarding_requests
        $stmt = $this->db->prepare("
            INSERT INTO licenciada_onboarding_requests (
                token_id, token_str, categoria, template_slug, nome, razao_social, nome_fantasia,
                cpf, cnpj, is_cnpj_em_abertura, rg, email, telefone_whatsapp, instagram,
                cep, endereco, numero, complemento, bairro, cidade, estado,
                nacionalidade, estado_civil, profissao, documento_img,
                comprovante_pagamento_img, comprovante_residencia_img, contrato_social_img, certificados_imgs,
                ocr_extracted_data, ocr_confidence,
                status, taxa_inicial_num, taxa_inicial_extenso, condicoes_pagamento, valor_minimo_sessao, cidade_celebracao,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, 'licenciamento-padrao', ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                'brasileira', 'solteira', 'Esteticista', ?,
                ?, ?, ?, ?,
                ?, ?,
                'PRE_CADASTRO', '7.000,00', 'sete mil reais', 'à vista via PIX', '150,00', 'Assis/SP',
                NOW(), NOW()
            )
        ");

        $stmt->execute([
            $tokenId,
            $token,
            $categoria,
            $nome,
            $razaoSocial ?: null,
            $nomeFantasia ?: null,
            $cpf,
            $cnpj ?: null,
            $isCnpjEmAbertura,
            $rg,
            $email,
            $telefone,
            $instagram ?: null,
            $cep,
            $endereco,
            $numero,
            $complemento,
            $bairro,
            $cidade,
            $estado,
            $documentPath,
            $comprovantePagamentoPath,
            $comprovanteResidenciaPath,
            $contratoSocialPath,
            !empty($certificadosPaths) ? json_encode($certificadosPaths) : null,
            json_encode($ocrResult['extracted_data'] ?? []),
            $ocrResult['confidence'] ?? 0.0
        ]);

        $requestId = (int)$this->db->lastInsertId();

        // Mark token as used
        if ($tokenId) {
            $stmtToken = $this->db->prepare("UPDATE licenciada_onboarding_tokens SET used_at = NOW(), updated_at = NOW() WHERE id = ?");
            $stmtToken->execute([$tokenId]);
        }

        // Trigger Gestor Agenda Task (High priority #ED7E13)
        $agendaEventId = null;
        try {
            $agendaEventId = $this->agendaService->createEvent([
                'event_type' => 'pendencia',
                'title' => "Emitir contrato para {$nome}",
                'description' => "Novo pré-cadastro de Licenciada recebido via onboarding público.\nCPF: {$cpf}\nWhatsApp: {$telefone}\nCidade: {$cidade}/{$estado}",
                'start_datetime' => date('Y-m-d H:i:s'),
                'end_datetime' => date('Y-m-d H:i:s', strtotime('+24 hours')),
                'priority' => 'alta',
                'status' => 'pendente',
                'color' => '#ED7E13',
                'client_type' => 'licenciada',
                'client_id' => $requestId,
                'metadata' => json_encode(['onboarding_request_id' => $requestId, 'cpf' => $cpf])
            ], (int)$adminId);

            if ($agendaEventId) {
                $stmtUpdate = $this->db->prepare("UPDATE licenciada_onboarding_requests SET agenda_event_id = ? WHERE id = ?");
                $stmtUpdate->execute([$agendaEventId, $requestId]);
            }
        } catch (Throwable $t) {
            // Agenda task creation should not block onboarding submission
            error_log("Erro ao criar evento na agenda para onboarding #{$requestId}: " . $t->getMessage());
        }

        return [
            'success' => true,
            'message' => 'Pré-cadastro realizado com sucesso! Aguarde o contato da nossa equipe.',
            'onboarding_id' => $requestId,
            'request_id' => $requestId,
            'status' => 'PRE_CADASTRO',
            'agenda_event_id' => $agendaEventId,
            'ocr_confidence' => $ocrResult['confidence'] ?? 0.0
        ];
    }

    // =========================================================================
    // 3. FUNNEL STAGES & LISTING (5 COLUMNS)
    // =========================================================================

    /**
     * Lists the funnel items structured in 5 Kanban columns and tabular list.
     * 
     * @param array $filters ['search' => ?string, 'status' => ?string, 'categoria' => ?string, 'view_mode' => ?string, 'assigned_admin_id' => ?int, 'future_cohort_tag' => ?string]
     * @return array
     */
    public function getFunnelStages(array $filters = []): array {
        $viewMode = strtolower(trim($filters['view_mode'] ?? 'real'));

        $sql = "
            SELECT r.*, t.token AS original_token_str, t.token AS token,
                   u.username AS assigned_admin_name
            FROM licenciada_onboarding_requests r
            LEFT JOIN licenciada_onboarding_tokens t ON r.token_id = t.id
            LEFT JOIN admin_users u ON r.assigned_admin_id = u.id
            WHERE 1=1
        ";
        $params = [];

        // View mode filter (sandbox isolation & archive)
        if ($viewMode === 'test') {
            $sql .= " AND r.is_test = 1 AND r.deleted_at IS NULL";
        } elseif ($viewMode === 'all') {
            $sql .= " AND r.deleted_at IS NULL";
        } elseif ($viewMode === 'archived') {
            $sql .= " AND r.deleted_at IS NOT NULL";
        } else {
            // Default: 'real' production leads only
            $sql .= " AND (r.is_test = 0 OR r.is_test IS NULL) AND r.deleted_at IS NULL";
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $sql .= " AND (r.nome LIKE ? OR r.cpf LIKE ? OR r.email LIKE ? OR r.cidade LIKE ? OR r.telefone_whatsapp LIKE ? OR r.future_cohort_tag LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        if (!empty($filters['status'])) {
            $sql .= " AND r.status = ?";
            $params[] = strtoupper(trim($filters['status']));
        }

        if (!empty($filters['categoria'])) {
            $sql .= " AND r.categoria = ?";
            $params[] = trim($filters['categoria']);
        }

        if (!empty($filters['assigned_admin_id'])) {
            $sql .= " AND r.assigned_admin_id = ?";
            $params[] = (int)$filters['assigned_admin_id'];
        }

        if (!empty($filters['future_cohort_tag'])) {
            $sql .= " AND r.future_cohort_tag = ?";
            $params[] = trim($filters['future_cohort_tag']);
        }

        $sql .= " ORDER BY r.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch tokens that have been generated but not yet filled/submitted
        $tokenRows = [];
        if ($viewMode !== 'archived') {
            try {
                $sqlTokens = "
                    SELECT t.id AS token_id, t.token, t.categoria, t.telefone_whatsapp,
                           t.nome_candidata, t.is_test, t.created_at, t.expires_at, t.used_at
                    FROM licenciada_onboarding_tokens t
                    WHERE t.id NOT IN (
                        SELECT DISTINCT token_id FROM licenciada_onboarding_requests WHERE token_id IS NOT NULL
                    )
                ";
                $tokParams = [];

                if ($viewMode === 'test') {
                    $sqlTokens .= " AND t.is_test = 1";
                } elseif ($viewMode === 'real') {
                    $sqlTokens .= " AND (t.is_test = 0 OR t.is_test IS NULL)";
                }

                if (!empty($filters['search'])) {
                    $search = '%' . trim($filters['search']) . '%';
                    $sqlTokens .= " AND (t.nome_candidata LIKE ? OR t.telefone_whatsapp LIKE ?)";
                    $tokParams[] = $search;
                    $tokParams[] = $search;
                }
                if (!empty($filters['categoria'])) {
                    $sqlTokens .= " AND t.categoria = ?";
                    $tokParams[] = trim($filters['categoria']);
                }
                $sqlTokens .= " ORDER BY t.id DESC";

                $stmtTok = $this->db->prepare($sqlTokens);
                $stmtTok->execute($tokParams);
                $pendingTokens = $stmtTok->fetchAll(PDO::FETCH_ASSOC);

                foreach ($pendingTokens as $tok) {
                    $tokStr = $tok['token'] ?? $tok['original_token_str'] ?? '';
                    $tokenRows[] = [
                        'id' => 'tok_' . ($tok['token_id'] ?? $tok['id'] ?? rand(1000, 9999)),
                        'token_id' => (int)($tok['token_id'] ?? $tok['id'] ?? 0),
                        'token' => $tokStr,
                        'token_str' => $tokStr,
                        'nome' => !empty($tok['nome_candidata']) ? $tok['nome_candidata'] : 'Candidata (Link Enviado)',
                        'cpf' => '',
                        'rg' => '',
                        'email' => '',
                        'telefone_whatsapp' => $tok['telefone_whatsapp'] ?? '',
                        'categoria' => $tok['categoria'] ?? 'Licenciamento',
                        'cidade' => '',
                        'estado' => '',
                        'status' => 'LINK_ENVIADO',
                        'is_test' => (int)($tok['is_test'] ?? 0),
                        'created_at' => $tok['created_at'] ?? date('Y-m-d H:i:s'),
                        'is_token_only' => true
                    ];
                }
            } catch (Throwable $e) {
                error_log("Error fetching pending tokens in getFunnelStages: " . $e->getMessage());
            }
        }

        $allCombined = array_merge($tokenRows, $rows);

        // Normalize 5 Kanban columns
        $columns = [
            'pre_cadastro' => [],
            'contrato_emitido' => [],
            'aguardando_assinatura' => [],
            'validar_pagamento' => [],
            'ativo_liberado' => []
        ];

        $stageCounts = [
            'LINK_ENVIADO' => count($tokenRows),
            'PRE_CADASTRO' => 0,
            'CONTRATO_EMITIDO' => 0,
            'AGUARDANDO_ASSINATURA' => 0,
            'VALIDAR_PAGAMENTO' => 0,
            'ATIVO_LIBERADO' => 0,
            'CANCELADO' => 0
        ];

        foreach ($allCombined as &$item) {
            $statusKey = strtoupper($item['status'] ?? 'LINK_ENVIADO');
            if (isset($stageCounts[$statusKey])) {
                $stageCounts[$statusKey]++;
            }

            $colKey = strtolower($statusKey);
            if (isset($columns[$colKey])) {
                $columns[$colKey][] = $item;
            } else {
                $columns['pre_cadastro'][] = $item;
            }
        }

        return [
            'success' => true,
            'columns' => $columns,
            'stages' => $stageCounts,
            'items' => $allCombined,
            'leads' => $allCombined,
            'total' => count($allCombined),
            'view_mode' => $viewMode
        ];
    }

    /**
     * Alias for getFunnelStages
     */
    public function listFunnel(array $filters = []): array {
        return $this->getFunnelStages($filters);
    }

    /**
     * Gets a single onboarding request detail.
     * 
     * @param int $id
     * @return array|null
     */
    public function getRequestById(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT r.*, t.token AS original_token_str, t.expires_at AS token_expires_at
            FROM licenciada_onboarding_requests r
            LEFT JOIN licenciada_onboarding_tokens t ON r.token_id = t.id
            WHERE r.id = ? 
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        // Fetch associated contract if available
        $contract = null;
        if (!empty($row['contract_uuid'])) {
            $stmtC = $this->db->prepare("SELECT * FROM contracts WHERE uuid = ? LIMIT 1");
            $stmtC->execute([$row['contract_uuid']]);
            $contract = $stmtC->fetch(PDO::FETCH_ASSOC);
        }

        return [
            'request' => $row,
            'contract' => $contract
        ];
    }

    // =========================================================================
    // 4. 1-CLICK CONTRACT GENERATION
    // =========================================================================

    /**
     * Emits the official licensing contract in 1-click with variable substitution,
     * registers the contract in DB, updates status to CONTRATO_EMITIDO, and prepares WhatsApp share link.
     * 
     * @param int $requestId
     * @param array $overrideVars
     * @param int|null $adminId
     * @return array
     */
    public function generateContract1Click(int $requestId, array $overrideVars = [], ?int $adminId = null): array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            throw new Exception("Solicitação de Onboarding #{$requestId} não encontrada.");
        }

        $req = $detail['request'];
        $templateSlug = $overrideVars['template_slug'] ?? $req['template_slug'] ?? 'licenciamento-padrao';

        // Prepare contract variables
        $mesExtenso = $this->getMesExtenso((int)date('n'));
        $cidade = $req['cidade'] ?: 'Assis';
        $estado = $req['estado'] ?: 'SP';

        $enderecoCompleto = trim(($req['endereco'] ?? '') . ', ' . ($req['numero'] ?? '') . ' ' . ($req['complemento'] ?? '') . ' - ' . ($req['bairro'] ?? ''));

        $taxaRaw = $overrideVars['taxa_inicial_num'] ?? $overrideVars['valor_num'] ?? $overrideVars['valor'] ?? $req['taxa_inicial_num'] ?? '7.000,00';
        if (is_numeric($taxaRaw)) {
            $taxaNum = number_format((float)$taxaRaw, 2, ',', '.');
        } else {
            $taxaNum = (string)$taxaRaw;
        }

        $taxaExtenso = $overrideVars['taxa_inicial_extenso'] ?? $overrideVars['valor_extenso'] ?? $req['taxa_inicial_extenso'] ?? 'sete mil reais';
        $condicoes = $overrideVars['condicoes_pagamento'] ?? $req['condicoes_pagamento'] ?? 'à vista via PIX';
        
        $mapCondicoes = [
            'A_VISTA_PIX' => 'à vista via PIX',
            'ENTRADA_CARTAO' => 'entrada + parcelamento no cartão',
            'BOLETO_FATURADO' => 'faturado via boleto bancário'
        ];
        if (isset($mapCondicoes[$condicoes])) {
            $condicoes = $mapCondicoes[$condicoes];
        }

        $valorSessao = $overrideVars['valor_minimo_sessao'] ?? $req['valor_minimo_sessao'] ?? '150,00';
        $cidadeCelebracao = $overrideVars['cidade_celebracao'] ?? $overrideVars['foro'] ?? $req['cidade_celebracao'] ?? "{$cidade}/{$estado}";
        $dataExtenso = date('d') . " de {$mesExtenso} de " . date('Y');

        $variables = [
            // Qualificação da Licenciada
            'LICENCIADA_NOME_RAZAO' => $req['nome'],
            'LICENCIADA_RAZAO_SOCIAL' => $req['razao_social'] ?: $req['nome'],
            'LICENCIADA_NOME_FANTASIA' => $req['nome_fantasia'] ?: $req['nome'],
            'LICENCIADA_REPRESENTANTE_NOME' => $req['nome'],
            'LICENCIADA_CPF' => $req['cpf'], // REGRA 8: Strict CPF Invariant
            'LICENCIADA_CNPJ_CPF' => $req['cnpj'] ?: $req['cpf'],
            'LICENCIADA_RG' => $req['rg'] ?: 'N/A',
            'LICENCIADA_EMAIL_OFICIAL' => $req['email'],
            'LICENCIADA_TELEFONE' => $req['telefone_whatsapp'],
            'LICENCIADA_ENDERECO' => $enderecoCompleto,
            'ENDERECO_OPERACIONAL' => $enderecoCompleto,
            'LICENCIADA_CIDADE_UF' => "{$cidade}/{$estado}",
            'LICENCIADA_CEP' => $req['cep'] ?: '',
            'LICENCIADA_NACIONALIDADE' => $req['nacionalidade'] ?? 'brasileira',
            'LICENCIADA_ESTADO_CIVIL' => $req['estado_civil'] ?? 'solteira',
            'LICENCIADA_PROFISSAO' => $req['profissao'] ?? 'esteticista',
            'CIDADE_OPERACIONAL' => $cidade,
            'ESTADO_OPERACIONAL' => $estado,
            
            // Valores e Taxas (Ambos os padrões de tags)
            'TAXA_INICIAL_NUM' => $taxaNum,
            'VALOR_TAXA_INICIAL_NUM' => $taxaNum,
            'TAXA_INICIAL_EXTENSO' => $taxaExtenso,
            'VALOR_TAXA_INICIAL_EXTENSO' => $taxaExtenso,
            'CONDICOES_PAGAMENTO' => $condicoes,
            'FORMA_PAGAMENTO_TAXA' => $condicoes,
            'VALOR_MINIMO_SESSAO' => $valorSessao,
            
            // Pós-contratual
            'VALOR_TAXA_POS_CONTRATUAL_NUM' => '6.000,00',
            'VALOR_TAXA_POS_CONTRATUAL_EXTENSO' => 'seis mil reais',
            'DELIMITACAO_TERRITORIAL' => 'Raio de 50.000 habitantes',
            
            // Fechamento e Foro
            'CIDADE_CELEBRACAO' => $cidadeCelebracao,
            'DATA_CONTRATO' => date('d/m/Y'),
            'DATA_CELEBRACAO_EXTENSO' => $dataExtenso,
            'CIDADE_DATA_EXTENSO' => "{$cidade}, {$dataExtenso}"
        ];

        // Generate contract UUID and Sign Token
        $contractUuid = 'bh-lic-' . bin2hex(random_bytes(16));
        $signToken = bin2hex(random_bytes(32));
        $signExpiresAt = date('Y-m-d H:i:s', strtotime('+15 days'));

        // Resolve Template and Render Base HTML defensivamente
        $templateSlug = $overrideVars['template_slug'] ?? $req['template_slug'] ?? 'contrato-licenciamento-padrao';
        $tpl = null;
        try {
            $tplStmt = $this->db->prepare("SELECT id, content_html FROM contract_templates WHERE slug = ? OR id = ? LIMIT 1");
            if ($tplStmt) {
                $tplStmt->execute([$templateSlug, $templateSlug]);
                $tpl = $tplStmt->fetch(PDO::FETCH_ASSOC);
            }

            if (!$tpl) {
                $fallbackStmt = $this->db->prepare("SELECT id, content_html FROM contract_templates WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
                if ($fallbackStmt) {
                    $fallbackStmt->execute();
                    $tpl = $fallbackStmt->fetch(PDO::FETCH_ASSOC);
                }
            }
        } catch (Throwable $t) {
            // Non-blocking fallback
        }

        $templateId = $tpl ? (int)$tpl['id'] : null;
        $templateHtml = $tpl ? ($tpl['content_html'] ?? '') : '';

        $title = "Contrato de Licenciamento - " . $req['nome'];
        $renderedHtml = $templateHtml;
        $pdfPath = null;
        $sha256 = null;

        try {
            if (!$this->pdfService && class_exists('BodyHarmony\Services\ContractPdfService')) {
                $this->pdfService = new ContractPdfService();
            }

            if ($this->pdfService) {
                $renderedHtml = $this->pdfService->renderTemplate($templateHtml, $variables);
                try {
                    $pdfResult = $this->pdfService->generatePdf($renderedHtml, $contractUuid, $title, [], true);
                    $pdfPath = $pdfResult['relative_path'] ?? null;
                    $sha256 = $pdfResult['sha256_hash'] ?? null;
                } catch (Throwable $e) {
                    // PDF generation non-blocking for fast token issuance
                }
            } else {
                foreach ($variables as $k => $v) {
                    $renderedHtml = str_replace('{{' . trim($k) . '}}', htmlspecialchars((string)$v), $renderedHtml);
                }
            }
        } catch (Throwable $t) {
            foreach ($variables as $k => $v) {
                $renderedHtml = str_replace('{{' . trim($k) . '}}', htmlspecialchars((string)$v), $renderedHtml);
            }
        }

        // Insert into contracts table
        $stmtC = $this->db->prepare("
            INSERT INTO contracts (
                uuid, template_id, title, status, variables_payload, rendered_html,
                pdf_path, sha256_hash, sign_token, sign_token_expires_at, created_by, created_at, updated_at
            ) VALUES (
                ?, ?, ?, 'PENDING_SIGNATURE', ?, ?,
                ?, ?, ?, ?, ?, NOW(), NOW()
            )
        ");

        $stmtC->execute([
            $contractUuid,
            $templateId,
            $title,
            json_encode($variables, JSON_UNESCAPED_UNICODE),
            $renderedHtml,
            $pdfPath,
            $sha256,
            $signToken,
            $signExpiresAt,
            $adminId ?? 1
        ]);

        $contractId = (int)$this->db->lastInsertId();

        // Update onboarding request status to CONTRATO_EMITIDO
        $stmtUp = $this->db->prepare("
            UPDATE licenciada_onboarding_requests 
            SET contract_uuid = ?, status = 'CONTRATO_EMITIDO', 
                taxa_inicial_num = ?, taxa_inicial_extenso = ?, condicoes_pagamento = ?,
                cidade_celebracao = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmtUp->execute([$contractUuid, $taxaNum, $taxaExtenso, $condicoes, $cidadeCelebracao, $requestId]);

        // Auto-create pending license tax record from onboarding (PLAN-141 - Etapa 1: Contrato Emitido)
        try {
            require_once __DIR__ . '/LicenseTaxService.php';
            $taxService = new \BodyHarmony\Services\LicenseTaxService($this->db);
            $taxService->syncFromOnboarding($requestId, null, 'EMITIDO');
        } catch (\Throwable $taxErr) {
            error_log("[OnboardingService] LicenseTax emitContract sync error (non-blocking): " . $taxErr->getMessage());
        }

        // Update Agenda Event if present
        if (!empty($req['agenda_event_id'])) {
            try {
                $this->agendaService->updateStatus((int)$req['agenda_event_id'], 'em_andamento', $adminId ?? 1, "Contrato {$contractUuid} emitido em 1-clique.");
            } catch (Throwable $t) {
                // Non-blocking
            }
        }

        $baseUrl = $this->getBaseUrl();
        $signUrl = rtrim($baseUrl, '/') . "/assinar/{$signToken}";
        $whatsappMessage = $this->buildContractSignMessage($req['nome'], $signUrl);
        $whatsappLink = $this->buildWhatsAppLink($req['telefone_whatsapp'], $whatsappMessage);

        return [
            'success' => true,
            'message' => 'Contrato de Licenciamento emitido em 1-clique com sucesso!',
            'contract_id' => $contractId,
            'contract_uuid' => $contractUuid,
            'sign_token' => $signToken,
            'sign_url' => $signUrl,
            'whatsapp_link' => $whatsappLink,
            'whatsapp_text' => $whatsappMessage
        ];
    }

    // =========================================================================
    // 5. 24H WHATSAPP REMINDER RULE
    // =========================================================================

    /**
     * Generates or sends a 24h follow-up WhatsApp reminder for pending signature.
     * 
     * @param int $requestId
     * @param string $templateType
     * @return array
     */
    public function sendWhatsAppReminder(int $requestId, string $templateType = 'lembrete_24h'): array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            throw new Exception("Solicitação de Onboarding #{$requestId} não encontrada.");
        }

        $req = $detail['request'];
        $contract = $detail['contract'] ?? null;
        $signToken = $contract['sign_token'] ?? $req['token_str'] ?? '';

        $baseUrl = $this->getBaseUrl();
        $signUrl = rtrim($baseUrl, '/') . "/assinar/{$signToken}";

        $text = $this->buildReminder24hMessage($req['nome'], $signUrl);
        $whatsappUrl = $this->buildWhatsAppLink($req['telefone_whatsapp'], $text);

        // Update last reminder timestamp
        $stmt = $this->db->prepare("UPDATE licenciada_onboarding_requests SET last_reminder_sent_at = NOW(), updated_at = NOW() WHERE id = ?");
        $stmt->execute([$requestId]);

        return [
            'success' => true,
            'message' => 'Lembrete WhatsApp gerado com sucesso.',
            'whatsapp_url' => $whatsappUrl,
            'text' => $text,
            'recipient_phone' => $req['telefone_whatsapp']
        ];
    }

    // =========================================================================
    // 6. 2-STEP VALIDATION & LICENCIADA PROVISIONING (STRICT 'CPF' INVARIANT)
    // =========================================================================

    /**
     * Confirms financial payment (2nd step), provisions licenciada account in `licenciadas` table
     * strictly adhering to REGRA 8 ('cpf' column), closes Agenda task, and grants LMS access.
     * 
     * @param int $requestId
     * @param array $activationData ['notes' => ?string, 'payment_method' => ?string]
     * @param int|null $adminId
     * @return array
     */
    public function confirmPaymentAndActivate(int $requestId, array $activationData = [], ?int $adminId = null): array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            throw new Exception("Solicitação de Onboarding #{$requestId} não encontrada.");
        }

        $req = $detail['request'];
        $cpf = $req['cpf'];

        // Strict Constitution REGRA 8: Check licenciadas by 'cpf'
        $stmtCheck = $this->db->prepare("SELECT id, name, cpf, email, username FROM licenciadas WHERE cpf = ? LIMIT 1");
        $stmtCheck->execute([$cpf]);
        $existingLicenciada = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        $licenciadaId = null;

        if ($existingLicenciada) {
            $licenciadaId = (int)$existingLicenciada['id'];
            // Reactivate if disabled
            $stmtUpLic = $this->db->prepare("UPDATE licenciadas SET is_active = 1 WHERE id = ?");
            $stmtUpLic->execute([$licenciadaId]);
        } else {
            // Generate clean username from name
            $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $req['nome']));
            $username = substr($cleanName, 0, 20) . rand(100, 999);

            // Insert new licenciada strictly using 'cpf' column (REGRA 8)
            $stmtIns = $this->db->prepare("
                INSERT INTO licenciadas (
                    name, cpf, email, username, whatsapp, whatsapp_number,
                    state, location, photo_url, is_active, renewal_date, admin_notes, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, 1, ?, ?, NOW()
                )
            ");

            $location = ($req['cidade'] ?: 'Assis') . ' - ' . ($req['estado'] ?: 'SP');
            $renewalDate = date('Y-m-d', strtotime('+1 year'));
            $notes = "Ativação via Funil de Onboarding PLAN-064 em " . date('Y-m-d H:i:s') . ". " . ($activationData['notes'] ?? '');

            $stmtIns->execute([
                $req['nome'],
                $cpf, // REGRA 8: Column 'cpf' strictly
                $req['email'],
                $username,
                $req['telefone_whatsapp'],
                $req['telefone_whatsapp'],
                $req['estado'] ?: 'SP',
                $location,
                $req['documento_img'] ?: null,
                $renewalDate,
                $notes
            ]);

            $licenciadaId = (int)$this->db->lastInsertId();
        }

        // Update onboarding request status to ATIVO_LIBERADO
        $stmtUpReq = $this->db->prepare("
            UPDATE licenciada_onboarding_requests 
            SET status = 'ATIVO_LIBERADO', 
                licenciada_id = ?, 
                payment_confirmed_at = NOW(), 
                activated_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmtUpReq->execute([$licenciadaId, $requestId]);

        // If contract is linked, mark as SIGNED and link licenciada_id
        if (!empty($req['contract_uuid'])) {
            $stmtUpContr = $this->db->prepare("
                UPDATE contracts 
                SET status = 'SIGNED', licenciada_id = ?, updated_at = NOW() 
                WHERE uuid = ? AND status != 'SIGNED'
            ");
            $stmtUpContr->execute([$licenciadaId, $req['contract_uuid']]);
        }

        // Auto-create / update license tax record from onboarding (PLAN-141 - Etapa 2: Licenciada Ativada & Quitada)
        try {
            require_once __DIR__ . '/LicenseTaxService.php';
            $taxService = new \BodyHarmony\Services\LicenseTaxService($this->db);
            $taxService->syncFromOnboarding($requestId, $licenciadaId, 'ATIVADO');
        } catch (\Throwable $taxErr) {
            error_log("[OnboardingService] LicenseTax sync error (non-blocking): " . $taxErr->getMessage());
        }

        // Close Agenda task if present
        if (!empty($req['agenda_event_id'])) {
            try {
                $this->agendaService->updateStatus((int)$req['agenda_event_id'], 'concluido', $adminId ?? 1, "Onboarding concluído e licenciada #{$licenciadaId} ativada.");
            } catch (Throwable $t) {
                // Non-blocking
            }
        }

        $welcomeMessage = $this->buildWelcomeMessage($req['nome'], $req['email']);
        $welcomeLink = $this->buildWhatsAppLink($req['telefone_whatsapp'], $welcomeMessage);

        return [
            'success' => true,
            'message' => 'Pagamento confirmado e Licenciada ativada com sucesso!',
            'request_id' => $requestId,
            'licenciada_id' => $licenciadaId,
            'status' => 'ATIVO_LIBERADO',
            'lms_access_granted' => true,
            'welcome_whatsapp' => [
                'text' => $welcomeMessage,
                'link' => $welcomeLink
            ]
        ];
    }

    /**
     * Manual status update.
     * 
     * @param int $requestId
     * @param string $newStatus
     * @param int|null $adminId
     * @param string|null $notes
     * @return bool
     */
    public function updateStatus(int $requestId, string $newStatus, ?int $adminId = null, ?string $notes = null): bool {
        $allowed = ['PRE_CADASTRO', 'CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA', 'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO', 'CANCELADO'];
        $statusUpper = strtoupper(trim($newStatus));
        if (!in_array($statusUpper, $allowed, true)) {
            throw new Exception("Status '{$newStatus}' inválido.");
        }

        $stmt = $this->db->prepare("
            UPDATE licenciada_onboarding_requests 
            SET status = ?, admin_notes = CONCAT(COALESCE(admin_notes, ''), '\n', ?), updated_at = NOW() 
            WHERE id = ?
        ");
        return $stmt->execute([$statusUpper, $notes ?? '', $requestId]);
    }

    // =========================================================================
    // 7. TEMPLATES DE MENSAGENS WHATSAPP (NEXUS V3.1)
    // =========================================================================

    public function buildInviteMessage(?string $nome, string $link): string {
        $nomeStr = !empty($nome) ? $nome : 'Futura Licenciada';
        return "Olá, {$nomeStr}! ✨ Seja muito bem-vinda à família Body Harmony! 💖\n\n"
             . "Estamos muito felizes com o seu interesse em se tornar uma Licenciada Oficial da nossa marca! 🌿\n\n"
             . "Para iniciarmos o seu credenciamento com total agilidade, preparamos um link exclusivo e seguro para você preencher seus dados e enviar a foto dos seus documentos pelo celular em menos de 2 minutos:\n\n"
             . "🔗 *Link Exclusivo de Pré-cadastro:*\n{$link}\n\n"
             . "Se tiver qualquer dúvida durante o preenchimento, estou por aqui para te ajudar! 😊✨";
    }

    public function buildContractSignMessage(string $nome, string $signUrl): string {
        return "Olá, {$nome}! Tudo bem? ✨\n\n"
             . "Seu Contrato de Licenciamento Body Harmony foi gerado com sucesso e já está pronto para assinatura digital com total validade jurídica! 🔒📄\n\n"
             . "Você pode ler o documento e assinar direto na tela do seu celular pelo link seguro abaixo:\n\n"
             . "🔗 *Link para Assinatura Digital:*\n{$signUrl}\n\n"
             . "Assim que você assinar, nosso sistema já avança para a liberação dos seus acessos. Qualquer dúvida, conte comigo! 🌿💖";
    }

    public function buildReminder24hMessage(string $nome, string $signUrl): string {
        return "Olá, {$nome}! Tudo ótimo com você? 😊\n\n"
             . "Passando apenas para te lembrar com carinho que o seu contrato Body Harmony está aguardando sua assinatura digital! 📄✨\n\n"
             . "Falta bem pouquinho para oficializarmos sua licença e liberarmos seu acesso exclusivo ao Portal de Aulas e materiais da marca. 🚀\n\n"
             . "🔗 *Acesse aqui para assinar:*\n{$signUrl}\n\n"
             . "Se precisar de qualquer esclarecimento sobre alguma cláusula, é só me avisar por aqui! 💖🌿";
    }

    public function buildWelcomeMessage(string $nome, string $email): string {
        return "Parabéns, {$nome}! 🎉 Seja oficialmente bem-vinda à rede de Licenciadas Body Harmony! 👑💖\n\n"
             . "Seu contrato foi formalizado e seu acesso ao Portal Exclusivo da Licenciada já está 100% liberado! 🚀✨\n\n"
             . "Para fazer seu primeiro acesso:\n"
             . "🔗 *Portal:* https://bodyharmony.com.br/portal-licenciada\n"
             . "✉️ *Login:* {$email}\n\n"
             . "Ao entrar, você poderá explorar todos os módulos e certificações. Desejamos muito sucesso nessa jornada! 🌟🌿";
    }

    private function buildWhatsAppLink(string $phone, string $text): string {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        if (!str_starts_with($cleanPhone, '55') && strlen($cleanPhone) <= 11) {
            $cleanPhone = '55' . $cleanPhone;
        }
        return "https://wa.me/{$cleanPhone}?text=" . rawurlencode($text);
    }

    private function saveUploadedDocument(array $file, string $prefix = 'doc_'): ?string {
        $targetDir = __DIR__ . '/../../../../private_uploads/onboarding';
        if (!file_exists($targetDir)) {
            @mkdir($targetDir, 0750, true);
        }

        $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], true)) {
            $ext = 'jpg';
        }

        $cleanPrefix = preg_replace('/[^a-zA-Z0-9_]/', '', $prefix);
        $fileName = $cleanPrefix . uniqid() . '_' . time() . '.' . $ext;
        $destPath = $targetDir . '/' . $fileName;

        if (move_uploaded_file($file['tmp_name'], $destPath) || @copy($file['tmp_name'], $destPath) || @rename($file['tmp_name'], $destPath)) {
            return 'private_uploads/onboarding/' . $fileName;
        }

        return null;
    }

    /**
     * Resolve caminhos relativos de uploads de documentos em múltiplos ambientes (Dev local, Build, Hostinger e VPS).
     */
    public function resolveUploadPath(?string $relPath): ?string {
        if (empty($relPath)) return null;

        $cleanRel = ltrim($relPath, '/\\');
        
        // 1. Caminho absoluto direto existente
        if (file_exists($relPath) && is_file($relPath)) {
            return realpath($relPath) ?: $relPath;
        }

        // 2. Diretórios base candidatos
        $candidates = [
            dirname(__DIR__, 4) . '/' . $cleanRel, // apps/web-app/private_uploads/...
            dirname(__DIR__, 3) . '/' . $cleanRel, // public_html/private_uploads/...
            dirname(__DIR__, 2) . '/' . $cleanRel, // backend/private_uploads/...
            dirname(__DIR__, 5) . '/' . $cleanRel, // workspace root private_uploads/...
            __DIR__ . '/../../../../' . $cleanRel,
            ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/' . $cleanRel,
            ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/../' . $cleanRel,
            ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/api/' . $cleanRel,
        ];

        // 3. Busca direta pelo basename em subdiretórios de onboarding
        $basename = basename($cleanRel);
        if ($basename && $basename !== $cleanRel) {
            $candidates[] = dirname(__DIR__, 4) . '/private_uploads/onboarding/' . $basename;
            $candidates[] = dirname(__DIR__, 3) . '/private_uploads/onboarding/' . $basename;
            $candidates[] = dirname(__DIR__, 2) . '/private_uploads/onboarding/' . $basename;
            $candidates[] = dirname(__DIR__, 5) . '/private_uploads/onboarding/' . $basename;
            $candidates[] = __DIR__ . '/../../../../private_uploads/onboarding/' . $basename;
            $candidates[] = ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/private_uploads/onboarding/' . $basename;
            $candidates[] = ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/../private_uploads/onboarding/' . $basename;
        }

        foreach ($candidates as $candidate) {
            if ($candidate && file_exists($candidate) && is_file($candidate)) {
                return realpath($candidate) ?: $candidate;
            }
        }

        return null;
    }

    /**
     * Retorna o caminho físico e metadados de um documento específico do pré-cadastro da licenciada.
     *
     * @param int $requestId
     * @param string $type ('doc_frente', 'doc_verso', 'pagamento', 'residencia', 'contrato_social', 'certificado_X')
     * @return array|null ['full_path' => string, 'filename' => string, 'mime_type' => string, 'size' => int, 'is_pdf' => bool]
     */
    public function getDocumentPath(int $requestId, string $type): ?array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            return null;
        }
        $req = $detail['request'];
        $relPath = null;
        $label = 'Documento';

        switch (strtolower(trim($type))) {
            case 'doc_frente':
            case 'identidade':
            case 'documento_img':
            case 'documento_frente':
            case 'documento_frente_path':
                $relPath = $req['documento_img'] ?? null;
                $label = 'Identidade_Frente';
                break;
            case 'doc_verso':
            case 'documento_verso':
            case 'documento_verso_img':
            case 'documento_verso_path':
                $relPath = $req['documento_verso_img'] ?? ($req['documento_img'] ?? null);
                $label = 'Identidade_Verso';
                break;
            case 'pagamento':
            case 'comprovante_pagamento':
            case 'comprovante_pagamento_img':
            case 'comprovante_pagamento_path':
                $relPath = $req['comprovante_pagamento_img'] ?? null;
                $label = 'Comprovante_Pagamento';
                break;
            case 'residencia':
            case 'comprovante_residencia':
            case 'comprovante_residencia_img':
            case 'comprovante_residencia_path':
                $relPath = $req['comprovante_residencia_img'] ?? null;
                $label = 'Comprovante_Residencia';
                break;
            case 'contrato_social':
            case 'cnpj':
            case 'contrato_social_img':
            case 'contrato_social_path':
                $relPath = $req['contrato_social_img'] ?? null;
                $label = 'Contrato_Social_CNPJ';
                break;
            default:
                if (str_starts_with($type, 'certificado')) {
                    $certs = is_array($req['certificados_imgs']) ? $req['certificados_imgs'] : json_decode($req['certificados_imgs'] ?? '[]', true);
                    $idx = (int)filter_var($type, FILTER_SANITIZE_NUMBER_INT);
                    $idx = $idx > 0 ? $idx - 1 : 0;
                    $relPath = $certs[$idx] ?? null;
                    $label = 'Certificado_' . ($idx + 1);
                }
                break;
        }

        if (empty($relPath)) {
            return null;
        }

        $fullPath = $this->resolveUploadPath($relPath);
        if (!$fullPath || !file_exists($fullPath)) {
            return null;
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $mimeMap = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
        ];
        $mimeType = $mimeMap[$ext] ?? (function_exists('mime_content_type') ? @mime_content_type($fullPath) : null) ?: 'application/octet-stream';
        $cleanNome = preg_replace('/[^a-zA-Z0-9_-]/', '_', $req['nome'] ?: 'licenciada');
        $filename = "{$label}_{$cleanNome}_{$requestId}." . ($ext ?: 'jpg');

        return [
            'full_path' => $fullPath,
            'filename' => $filename,
            'mime_type' => $mimeType,
            'size' => filesize($fullPath),
            'is_pdf' => ($ext === 'pdf')
        ];
    }

    // =========================================================================
    // 9. DOWNLOAD DE TODOS OS DOCUMENTOS EM ZIP (PLAN-067)
    // =========================================================================

    /**
     * Gera um arquivo ZIP contendo todos os anexos e documentos do pré-cadastro da licenciada.
     *
     * @param int $requestId
     * @return array ['zip_path' => string, 'filename' => string]
     */
    public function generateDocumentsZip(int $requestId): array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            throw new Exception("Solicitação de Onboarding #{$requestId} não encontrada.");
        }

        $req = $detail['request'];
        $cleanNome = preg_replace('/[^a-zA-Z0-9_-]/', '_', $req['nome'] ?: 'licenciada');
        $zipFilename = "documentos_onboarding_{$cleanNome}_{$requestId}.zip";
        $tempZipPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $zipFilename;

        // Anexos para compactar
        $filesToZip = [];

        if (!empty($req['documento_img'])) {
            $filesToZip['01_Identidade_RG_CNH'] = $req['documento_img'];
        }
        if (!empty($req['comprovante_pagamento_img'])) {
            $filesToZip['02_Comprovante_Pagamento'] = $req['comprovante_pagamento_img'];
        }
        if (!empty($req['comprovante_residencia_img'])) {
            $filesToZip['03_Comprovante_Residencia'] = $req['comprovante_residencia_img'];
        }
        if (!empty($req['contrato_social_img'])) {
            $filesToZip['04_ContratoSocial_CNPJ'] = $req['contrato_social_img'];
        }
        if (!empty($req['certificados_imgs'])) {
            $certs = is_array($req['certificados_imgs']) ? $req['certificados_imgs'] : json_decode($req['certificados_imgs'], true);
            if (is_array($certs)) {
                foreach ($certs as $i => $certPath) {
                    $filesToZip['05_Certificado_' . ($i + 1)] = $certPath;
                }
            }
        }

        if (class_exists('ZipArchive')) {
            $zip = new \ZipArchive();
            if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new Exception("Não foi possível criar o arquivo ZIP temporário.");
            }

            $addedCount = 0;
            foreach ($filesToZip as $alias => $relPath) {
                $fullPath = $this->resolveUploadPath($relPath);

                if ($fullPath && file_exists($fullPath) && is_file($fullPath)) {
                    $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
                    $zipEntryName = $alias . ($ext ? '.' . $ext : '');
                    $zip->addFile($fullPath, $zipEntryName);
                    $addedCount++;
                }
            }

            // Se não havia arquivos físicos no disco (ex: em testes ou mock), inclui um manifesto de texto
            $manifestText = "SOLICITAÇÃO DE ONBOARDING #{$requestId}\n"
                          . "Nome: {$req['nome']}\n"
                          . "CPF: {$req['cpf']}\n"
                          . "CNPJ: " . ($req['cnpj'] ?? 'Não informado') . "\n"
                          . "Razão Social: " . ($req['razao_social'] ?? 'Não informada') . "\n"
                          . "Instagram: " . ($req['instagram'] ?? 'Não informado') . "\n"
                          . "WhatsApp: {$req['telefone_whatsapp']}\n"
                          . "Email: {$req['email']}\n"
                          . "Endereço: {$req['endereco']}, {$req['numero']} - {$req['bairro']}, {$req['cidade']}/{$req['estado']}\n"
                          . "Data: " . date('d/m/Y H:i:s') . "\n";
            $zip->addFromString("00_FICHA_CADASTRAL.txt", $manifestText);

            $zip->close();
        } else {
            // Fallback se ZipArchive não estiver instalado: cria arquivo de texto
            file_put_contents($tempZipPath, "Ficha de Onboarding #{$requestId}\nNome: {$req['nome']}\nCPF: {$req['cpf']}\n");
        }

        return [
            'zip_path' => $tempZipPath,
            'filename' => $zipFilename
        ];
    }

    // =========================================================================
    // 10. APROVAÇÃO, CRIAÇÃO DE LICENCIADA E PRÉ-GERAÇÃO DE CONTRATO (PLAN-067)
    // =========================================================================

    /**
     * Valida os dados do pré-cadastro pelo gestor, cria/atualiza o registro central na tabela
     * `licenciadas` com todos os campos (CNPJ, Razão Social, Instagram, Endereço, Anexos),
     * gera o Contrato DRAFT oficial e atualiza o funil para CONTRATO_EMITIDO.
     *
     * @param int $requestId
     * @param array $validatedData
     * @param int|null $adminId
     * @return array
     */
    public function approveAndIntegrateLicenciada(int $requestId, array $validatedData = [], ?int $adminId = null): array {
        $detail = $this->getRequestById($requestId);
        if (!$detail || empty($detail['request'])) {
            throw new Exception("Solicitação de Onboarding #{$requestId} não encontrada.");
        }

        $req = $detail['request'];

        // Mescla dados enviados pelo gestor com os já salvos
        $nome = trim($validatedData['nome'] ?? $req['nome']);
        $cpf = $this->ocrService->formatCpf(preg_replace('/\D/', '', $validatedData['cpf'] ?? $req['cpf']));
        $rg = trim($validatedData['rg'] ?? $req['rg'] ?? '');
        $email = trim($validatedData['email'] ?? $req['email']);
        $telefone = trim($validatedData['telefone_whatsapp'] ?? $req['telefone_whatsapp']);
        $instagram = trim($validatedData['instagram'] ?? $req['instagram'] ?? '');
        $cnpj = trim($validatedData['cnpj'] ?? $req['cnpj'] ?? '');
        $razaoSocial = trim($validatedData['razao_social'] ?? $req['razao_social'] ?? '');
        $nomeFantasia = trim($validatedData['nome_fantasia'] ?? $req['nome_fantasia'] ?? '');
        $isCnpjEmAbertura = isset($validatedData['is_cnpj_em_abertura']) 
            ? (!empty($validatedData['is_cnpj_em_abertura']) && ($validatedData['is_cnpj_em_abertura'] === 'true' || $validatedData['is_cnpj_em_abertura'] === true || $validatedData['is_cnpj_em_abertura'] === 1) ? 1 : 0)
            : (int)($req['is_cnpj_em_abertura'] ?? 0);

        $cep = trim($validatedData['cep'] ?? $req['cep'] ?? '');
        $endereco = trim($validatedData['endereco'] ?? $req['endereco'] ?? '');
        $numero = trim($validatedData['numero'] ?? $req['numero'] ?? '');
        $complemento = trim($validatedData['complemento'] ?? $req['complemento'] ?? '');
        $bairro = trim($validatedData['bairro'] ?? $req['bairro'] ?? '');
        $cidade = trim($validatedData['cidade'] ?? $req['cidade'] ?? 'Assis');
        $estado = trim($validatedData['estado'] ?? $req['estado'] ?? 'SP');
        $adminNotes = trim($validatedData['admin_notes'] ?? '');

        // 1. Atualiza a tabela licenciada_onboarding_requests com os dados revisados
        $stmtUpReq = $this->db->prepare("
            UPDATE licenciada_onboarding_requests SET
                nome = ?, cpf = ?, rg = ?, email = ?, telefone_whatsapp = ?,
                instagram = ?, cnpj = ?, razao_social = ?, nome_fantasia = ?, is_cnpj_em_abertura = ?,
                cep = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?,
                cidade = ?, estado = ?, admin_notes = CONCAT(COALESCE(admin_notes, ''), '\n', ?),
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmtUpReq->execute([
            $nome, $cpf, $rg, $email, $telefone,
            $instagram ?: null, $cnpj ?: null, $razaoSocial ?: null, $nomeFantasia ?: null, $isCnpjEmAbertura,
            $cep, $endereco, $numero, $complemento, $bairro,
            $cidade, $estado, $adminNotes,
            $requestId
        ]);

        // 2. Compila array com todos os anexos para vincular na tabela licenciadas
        $allDocs = [
            'documento_img' => $req['documento_img'] ?? null,
            'comprovante_pagamento_img' => $req['comprovante_pagamento_img'] ?? null,
            'comprovante_residencia_img' => $req['comprovante_residencia_img'] ?? null,
            'contrato_social_img' => $req['contrato_social_img'] ?? null,
            'certificados_imgs' => !empty($req['certificados_imgs']) ? (is_array($req['certificados_imgs']) ? $req['certificados_imgs'] : json_decode($req['certificados_imgs'], true)) : []
        ];
        $allDocsJson = json_encode(array_filter($allDocs));

        // 3. Provisão / Atualização na tabela central licenciadas (REGRA 8: coluna física 'cpf')
        $stmtCheck = $this->db->prepare("SELECT id, name, cpf, email FROM licenciadas WHERE cpf = ? LIMIT 1");
        $stmtCheck->execute([$cpf]);
        $existingLic = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        $licenciadaId = null;
        $location = "{$cidade} - {$estado}";
        $renewalDate = date('Y-m-d', strtotime('+1 year'));

        if ($existingLic) {
            $licenciadaId = (int)$existingLic['id'];
            $stmtUpLic = $this->db->prepare("
                UPDATE licenciadas SET
                    name = ?, razao_social = ?, nome_fantasia = ?, cnpj = ?,
                    email = ?, whatsapp = ?, whatsapp_number = ?, instagram = ?,
                    state = ?, location = ?, cep = ?, endereco = ?, numero = ?,
                    complemento = ?, bairro = ?, photo_url = COALESCE(photo_url, ?),
                    documentos_anexos = ?, origem_onboarding_request_id = ?,
                    is_active = 1
                WHERE id = ?
            ");
            $stmtUpLic->execute([
                $nome, $razaoSocial ?: null, $nomeFantasia ?: null, $cnpj ?: null,
                $email, $telefone, $telefone, $instagram ?: null,
                $estado, $location, $cep, $endereco, $numero,
                $complemento, $bairro, $req['documento_img'] ?: null,
                $allDocsJson, $requestId,
                $licenciadaId
            ]);
        } else {
            $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $nome));
            $username = substr($cleanName, 0, 20) . rand(100, 999);
            $notes = "Cadastrada via Aprovação do Onboarding #{$requestId} por Admin #{$adminId} em " . date('Y-m-d H:i:s');

            $stmtInsLic = $this->db->prepare("
                INSERT INTO licenciadas (
                    name, razao_social, nome_fantasia, cpf, cnpj,
                    email, username, whatsapp, whatsapp_number, instagram,
                    state, location, cep, endereco, numero, complemento, bairro,
                    photo_url, documentos_anexos, origem_onboarding_request_id,
                    is_active, renewal_date, admin_notes, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    1, ?, ?, NOW()
                )
            ");
            $stmtInsLic->execute([
                $nome, $razaoSocial ?: null, $nomeFantasia ?: null, $cpf, $cnpj ?: null,
                $email, $username, $telefone, $telefone, $instagram ?: null,
                $estado, $location, $cep, $endereco, $numero, $complemento, $bairro,
                $req['documento_img'] ?: null, $allDocsJson, $requestId,
                $renewalDate, $notes
            ]);
            $licenciadaId = (int)$this->db->lastInsertId();
        }

        // 4. Vincula licenciada_id na tabela licenciada_onboarding_requests
        $stmtLink = $this->db->prepare("UPDATE licenciada_onboarding_requests SET licenciada_id = ? WHERE id = ?");
        $stmtLink->execute([$licenciadaId, $requestId]);

        // 5. Emite o Contrato DRAFT vinculado com qualificação PJ e variáveis oficiais (REGRA 9 & REGRA 11)
        $contractRes = $this->generateContract1Click($requestId, $validatedData, $adminId);

        return [
            'success' => true,
            'message' => 'Licenciada aprovada, cadastrada no sistema central e contrato DRAFT gerado com sucesso!',
            'licenciada_id' => $licenciadaId,
            'contract_id' => $contractRes['contract_id'] ?? null,
            'contract_uuid' => $contractRes['contract_uuid'] ?? null,
            'sign_token' => $contractRes['sign_token'] ?? null,
            'sign_url' => $contractRes['sign_url'] ?? null,
            'whatsapp_link' => $contractRes['whatsapp_link'] ?? null
        ];
    }

    private function getBaseUrl(): string {
        $host = $_SERVER['HTTP_HOST'] ?? 'bodyharmony.com.br';
        $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        return "{$scheme}://{$host}";
    }

    private function getMesExtenso(int $mes): string {
        $meses = [
            1 => 'Janeiro', 2 => 'Fevereiro', 3 => 'Março', 4 => 'Abril',
            5 => 'Maio', 6 => 'Junho', 7 => 'Julho', 8 => 'Agosto',
            9 => 'Setembro', 10 => 'Outubro', 11 => 'Novembro', 12 => 'Dezembro'
        ];
        return $meses[$mes] ?? 'Janeiro';
    }

    // =========================================================================
    // 8. MÉTRICAS AGREGADAS DO FUNIL (PLAN-066 / PLAN-083)
    // =========================================================================

    /**
     * Retorna métricas agregadas do funil de onboarding para o Dashboard do Gestor.
     * Descontaminado: ignora registros de teste (is_test = 1) e arquivados (deleted_at IS NOT NULL).
     *
     * @param int $periodoDias Janela de tempo (em dias) para métricas de tendência
     * @return array
     */
    public function getMetrics(int $periodoDias = 30): array {
        // 1. Contagem por estágio (Apenas dados de Produção Reais)
        $stmtStages = $this->db->prepare("
            SELECT status, COUNT(*) AS total
            FROM licenciada_onboarding_requests
            WHERE (is_test = 0 OR is_test IS NULL) AND deleted_at IS NULL
            GROUP BY status
        ");
        $stmtStages->execute();
        $stageCounts = [
            'PRE_CADASTRO'          => 0,
            'CONTRATO_EMITIDO'      => 0,
            'AGUARDANDO_ASSINATURA' => 0,
            'VALIDAR_PAGAMENTO'     => 0,
            'ATIVO_LIBERADO'        => 0,
            'CANCELADO'             => 0,
        ];
        foreach ($stmtStages->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $key = strtoupper($row['status'] ?? '');
            if (isset($stageCounts[$key])) {
                $stageCounts[$key] = (int)$row['total'];
            }
        }

        $total = array_sum($stageCounts);
        $ativados = $stageCounts['ATIVO_LIBERADO'];
        $cancelados = $stageCounts['CANCELADO'];

        $taxaConversao = $total > 0 ? round(($ativados / $total) * 100, 2) : 0.0;
        $taxaAbandono  = $total > 0 ? round(($cancelados / $total) * 100, 2) : 0.0;

        // 2. Alertas: leads em AGUARDANDO_ASSINATURA sem lembrete nas últimas 24h
        $stmtAlertas = $this->db->prepare("
            SELECT COUNT(*) AS total
            FROM licenciada_onboarding_requests
            WHERE status = 'AGUARDANDO_ASSINATURA'
              AND (is_test = 0 OR is_test IS NULL)
              AND deleted_at IS NULL
              AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at < DATE_SUB(NOW(), INTERVAL 24 HOUR))
        ");
        $stmtAlertas->execute();
        $alertas = (int)($stmtAlertas->fetchColumn() ?: 0);

        // 3. Ativações no período
        $periodoSafe = max(1, (int)$periodoDias);
        $stmtAtivacoes = $this->db->prepare("
            SELECT COUNT(*) AS total
            FROM licenciada_onboarding_requests
            WHERE status = 'ATIVO_LIBERADO'
              AND (is_test = 0 OR is_test IS NULL)
              AND deleted_at IS NULL
              AND activated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ");
        $stmtAtivacoes->execute([$periodoSafe]);
        $ativacoesNoPeriodo = (int)($stmtAtivacoes->fetchColumn() ?: 0);

        // 4. Contratos emitidos no período
        $stmtContratos = $this->db->prepare("
            SELECT COUNT(*) AS total
            FROM licenciada_onboarding_requests
            WHERE status IN ('CONTRATO_EMITIDO', 'AGUARDANDO_ASSINATURA', 'VALIDAR_PAGAMENTO', 'ATIVO_LIBERADO')
              AND (is_test = 0 OR is_test IS NULL)
              AND deleted_at IS NULL
              AND updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
              AND contract_uuid IS NOT NULL
        ");
        $stmtContratos->execute([$periodoSafe]);
        $contratosNoPeriodo = (int)($stmtContratos->fetchColumn() ?: 0);

        return [
            'success' => true,
            'metrics' => [
                'total'                          => $total,
                'por_estagio'                    => $stageCounts,
                'taxa_conversao_pct'             => $taxaConversao,
                'taxa_abandono_pct'              => $taxaAbandono,
                'alertas_assinatura_pendente'    => $alertas,
                'ativacoes_no_periodo'           => $ativacoesNoPeriodo,
                'contratos_emitidos_no_periodo'  => $contratosNoPeriodo,
                'periodo_dias'                   => $periodoSafe,
            ]
        ];
    }

    // =========================================================================
    // 9. SANDBOX, TESTES & DELEGAÇÃO (PLAN-083)
    // =========================================================================

    /**
     * Gera um CPF brasileiro matematicamente válido com dígitos verificadores corretos.
     */
    public function generateValidCpf(): string {
        $n = [];
        for ($i = 0; $i < 9; $i++) {
            $n[$i] = rand(0, 9);
        }
        // Dígito 1
        $d1 = 0;
        for ($i = 0; $i < 9; $i++) {
            $d1 += $n[$i] * (10 - $i);
        }
        $d1 = 11 - ($d1 % 11);
        if ($d1 >= 10) $d1 = 0;
        $n[9] = $d1;

        // Dígito 2
        $d2 = 0;
        for ($i = 0; $i < 10; $i++) {
            $d2 += $n[$i] * (11 - $i);
        }
        $d2 = 11 - ($d2 % 11);
        if ($d2 >= 10) $d2 = 0;
        $n[10] = $d2;

        return sprintf('%d%d%d.%d%d%d.%d%d%d-%d%d', ...$n);
    }

    /**
     * Gera um CNPJ brasileiro matematicamente válido com dígitos verificadores corretos.
     */
    public function generateValidCnpj(): string {
        $n = [];
        for ($i = 0; $i < 8; $i++) {
            $n[$i] = rand(0, 9);
        }
        $n[8] = 0; $n[9] = 0; $n[10] = 0; $n[11] = 1; // 0001 filial padrão

        $w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $d1 = 0;
        for ($i = 0; $i < 12; $i++) {
            $d1 += $n[$i] * $w1[$i];
        }
        $d1 = 11 - ($d1 % 11);
        if ($d1 >= 10) $d1 = 0;
        $n[12] = $d1;

        $w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $d2 = 0;
        for ($i = 0; $i < 13; $i++) {
            $d2 += $n[$i] * $w2[$i];
        }
        $d2 = 11 - ($d2 % 11);
        if ($d2 >= 10) $d2 = 0;
        $n[13] = $d2;

        return sprintf('%d%d.%d%d%d.%d%d%d/%d%d%d%d-%d%d', ...$n);
    }

    /**
     * Gera instantaneamente um lead fictício completo no estágio PRE_CADASTRO com flag is_test = 1.
     *
     * @param int $adminId ID do gestor emissor
     * @param string|null $categoria Categoria pretendida
     * @param string|null $futureCohortTag Tag de turma/campanha
     * @return array
     */
    public function generateQuickMockLead(int $adminId = 1, ?string $categoria = 'Licenciamento', ?string $futureCohortTag = null): array {
        $firstNames = ['Dra. Camila', 'Dra. Beatriz', 'Dra. Juliana', 'Dra. Fernanda', 'Dra. Renata', 'Dra. Mariana', 'Dra. Larissa', 'Dra. Priscila', 'Dra. Gabriela', 'Dra. Vanessa'];
        $lastNames = ['Silveira', 'Albuquerque', 'Menezes', 'Carvalho', 'Fagundes', 'Vasconcelos', 'Barbosa', 'Nogueira', 'Cavalcanti', 'Pellegrini'];
        $cities = [
            ['cidade' => 'São Paulo', 'estado' => 'SP', 'cep' => '01310-100', 'bairro' => 'Bela Vista', 'endereco' => 'Avenida Paulista'],
            ['cidade' => 'Campinas', 'estado' => 'SP', 'cep' => '13010-000', 'bairro' => 'Cambuí', 'endereco' => 'Rua Coronel Quirino'],
            ['cidade' => 'Curitiba', 'estado' => 'PR', 'cep' => '80020-000', 'bairro' => 'Batel', 'endereco' => 'Avenida do Batel'],
            ['cidade' => 'Ribeirão Preto', 'estado' => 'SP', 'cep' => '14025-000', 'bairro' => 'Jardim Botânico', 'endereco' => 'Avenida Professor João Fiúsa'],
            ['cidade' => 'Belo Horizonte', 'estado' => 'MG', 'cep' => '30130-000', 'bairro' => 'Savassi', 'endereco' => 'Rua Fernandes Tourinho'],
            ['cidade' => 'Rio de Janeiro', 'estado' => 'RJ', 'cep' => '22041-001', 'bairro' => 'Copacabana', 'endereco' => 'Avenida Atlântica'],
            ['cidade' => 'Florianópolis', 'estado' => 'SC', 'cep' => '88015-100', 'bairro' => 'Centro', 'endereco' => 'Avenida Beira Mar Norte']
        ];

        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        $nome = "{$firstName} {$lastName} (Simulação Teste)";
        $location = $cities[array_rand($cities)];
        $cpf = $this->generateValidCpf();
        $cnpj = $this->generateValidCnpj();
        $rg = rand(10, 99) . '.' . rand(100, 999) . '.' . rand(100, 999) . '-X';
        $slug = strtolower(preg_replace('/[^a-z0-9]/', '', $firstName . $lastName)) . rand(100, 999);
        $email = "teste.{$slug}@bodyharmony-sandbox.com";
        $phone = sprintf('(11) 9%04d-%04d', rand(1000, 9999), rand(1000, 9999));
        $razaoSocial = "{$lastName} & Silveira Estética e Saúde Integrada LTDA";
        $nomeFantasia = "Body Harmony {$location['cidade']}";
        $instagram = "@dra.{$slug}";
        $categoriaVal = !empty($categoria) ? trim($categoria) : 'Licenciamento';
        $cohortTag = !empty($futureCohortTag) ? trim($futureCohortTag) : 'Sandbox ' . date('Y');

        // 1. Cria o token de teste
        $token = bin2hex(random_bytes(32));
        $stmtTok = $this->db->prepare("
            INSERT INTO licenciada_onboarding_tokens 
            (token, categoria, telefone_whatsapp, nome_candidata, created_by_admin_id, expires_at, used_at, is_test, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), 1, NOW(), NOW())
        ");
        $stmtTok->execute([$token, $categoriaVal, $phone, $nome, $adminId]);
        $tokenId = (int)$this->db->lastInsertId();

        // 2. Cria dados simulados de OCR
        $mockOcr = [
            'nome' => $nome,
            'cpf' => $cpf,
            'rg' => $rg,
            'cep' => $location['cep'],
            'endereco' => $location['endereco'],
            'numero' => (string)rand(100, 1500),
            'bairro' => $location['bairro'],
            'cidade' => $location['cidade'],
            'estado' => $location['estado']
        ];

        // 3. Insere a solicitação de onboarding na tabela
        $stmt = $this->db->prepare("
            INSERT INTO licenciada_onboarding_requests (
                token_id, token_str, categoria, template_slug, nome, razao_social, nome_fantasia,
                cpf, cnpj, is_cnpj_em_abertura, rg, email, telefone_whatsapp, instagram,
                cep, endereco, numero, complemento, bairro, cidade, estado,
                nacionalidade, estado_civil, profissao, documento_img,
                comprovante_pagamento_img, comprovante_residencia_img, contrato_social_img, certificados_imgs,
                ocr_extracted_data, ocr_confidence,
                status, is_test, assigned_admin_id, future_cohort_tag,
                taxa_inicial_num, taxa_inicial_extenso, condicoes_pagamento, valor_minimo_sessao, cidade_celebracao,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, 'licenciamento-padrao', ?, ?, ?,
                ?, ?, 0, ?, ?, ?, ?,
                ?, ?, ?, 'Sala ' . rand(1, 80), ?, ?, ?,
                'brasileira', 'solteira', 'Esteticista e Fisioterapeuta Dermato-Funcional', 'uploads/mock_documento_teste.pdf',
                'uploads/mock_comprovante_pix.pdf', 'uploads/mock_residencia.pdf', 'uploads/mock_contrato_social.pdf', '[]',
                ?, 98.50,
                'PRE_CADASTRO', 1, ?, ?,
                '7.000,00', 'sete mil reais', 'à vista via PIX', '150,00', 'Assis/SP',
                NOW(), NOW()
            )
        ");

        $stmt->execute([
            $tokenId,
            $token,
            $categoriaVal,
            $nome,
            $razaoSocial,
            $nomeFantasia,
            $cpf,
            $cnpj,
            $rg,
            $email,
            $phone,
            $instagram,
            $location['cep'],
            $location['endereco'],
            (string)rand(100, 1500),
            $location['bairro'],
            $location['cidade'],
            $location['estado'],
            json_encode($mockOcr, JSON_UNESCAPED_UNICODE),
            $adminId,
            $cohortTag
        ]);

        $requestId = (int)$this->db->lastInsertId();

        return [
            'success' => true,
            'message' => 'Lead de teste gerado com sucesso no Sandbox.',
            'mock_lead' => [
                'id' => $requestId,
                'token' => $token,
                'nome' => $nome,
                'cpf' => $cpf,
                'cnpj' => $cnpj,
                'categoria' => $categoriaVal,
                'status' => 'PRE_CADASTRO',
                'is_test' => 1,
                'future_cohort_tag' => $cohortTag,
                'assigned_admin_id' => $adminId
            ]
        ];
    }

    /**
     * Exclui um lead em cascata (se teste ou rascunho sem contrato assinado)
     * ou arquiva com soft-delete se o contrato associado já estiver assinado (SIGNED).
     * Suporta tanto IDs de requests quanto tokens pendentes (ex: 'tok_17').
     *
     * @param string|int $id ID da solicitação de onboarding ou token ('tok_XX')
     * @param int $adminId ID do gestor que solicitou a exclusão
     * @return array
     */
    public function deleteRequest(string|int $id, int $adminId = 1): array {
        $idStr = (string)$id;

        // Caso 1: ID com prefixo de token puro (ex: 'tok_17')
        if (strpos($idStr, 'tok_') === 0) {
            $tokenId = (int)str_replace('tok_', '', $idStr);
            return $this->deleteTokenOnly($tokenId, $adminId);
        }

        $numericId = (int)$id;
        $stmt = $this->db->prepare("SELECT * FROM licenciada_onboarding_requests WHERE id = ? LIMIT 1");
        $stmt->execute([$numericId]);
        $lead = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fallback: se não encontrado em requests, tenta localizar e deletar em licenciada_onboarding_tokens
        if (!$lead) {
            try {
                $stmtTok = $this->db->prepare("SELECT * FROM licenciada_onboarding_tokens WHERE id = ? LIMIT 1");
                $stmtTok->execute([$numericId]);
                $tokRow = $stmtTok->fetch(PDO::FETCH_ASSOC);
                if ($tokRow) {
                    return $this->deleteTokenOnly($numericId, $adminId);
                }
            } catch (Throwable $e) {
                // Ignore
            }

            throw new Exception("Solicitação ou token de Onboarding #{$id} não encontrado.");
        }

        $contractUuid = $lead['contract_uuid'] ?? null;
        $isSigned = false;

        // Verifica se há contrato associado e se o status é SIGNED
        if (!empty($contractUuid)) {
            try {
                $stmtC = $this->db->prepare("SELECT status FROM contracts WHERE uuid = ? LIMIT 1");
                $stmtC->execute([$contractUuid]);
                $contractStatus = $stmtC->fetchColumn();
                if ($contractStatus === 'SIGNED') {
                    $isSigned = true;
                }
            } catch (Throwable $e) {
                // Tabela de contratos pode não existir ou erro temporário
            }
        }

        // Blindagem Jurídica: se o contrato está assinado, aplica Soft-Delete (arquivamento)
        if ($isSigned) {
            $stmtArchive = $this->db->prepare("
                UPDATE licenciada_onboarding_requests 
                SET deleted_at = NOW(), 
                    admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n[', NOW(), '] Arquivado via soft-delete pelo admin #', ?) 
                WHERE id = ?
            ");
            $stmtArchive->execute([$adminId, $id]);

            return [
                'success' => true,
                'action' => 'soft_deleted_archived',
                'message' => "Contrato assinado detectado (#{$contractUuid}). O registro foi arquivado com segurança para preservar a validade jurídica (Lei 14.063/2020).",
                'deleted_files_count' => 0
            ];
        }

        // Hard-Delete Seguro: remove anexos físicos em disco
        $deletedFiles = 0;
        $fileFields = ['documento_img', 'comprovante_pagamento_img', 'comprovante_residencia_img', 'contrato_social_img'];
        foreach ($fileFields as $field) {
            $filePath = $lead[$field] ?? null;
            if (!empty($filePath) && strpos($filePath, 'uploads/') !== false && strpos($filePath, 'mock_') === false) {
                $fullPath = dirname(__DIR__, 5) . '/private_uploads/' . ltrim($filePath, '/');
                if (file_exists($fullPath) && is_file($fullPath)) {
                    @unlink($fullPath);
                    $deletedFiles++;
                }
            }
        }

        // Múltiplos certificados
        if (!empty($lead['certificados_imgs'])) {
            $certs = is_array($lead['certificados_imgs']) ? $lead['certificados_imgs'] : json_decode($lead['certificados_imgs'], true);
            if (is_array($certs)) {
                foreach ($certs as $certPath) {
                    if (!empty($certPath) && strpos($certPath, 'uploads/') !== false && strpos($certPath, 'mock_') === false) {
                        $fullPath = dirname(__DIR__, 5) . '/private_uploads/' . ltrim($certPath, '/');
                        if (file_exists($fullPath) && is_file($fullPath)) {
                            @unlink($fullPath);
                            $deletedFiles++;
                        }
                    }
                }
            }
        }

        // Exclui contratos DRAFT/PENDING associados
        if (!empty($contractUuid)) {
            try {
                $this->db->prepare("DELETE FROM contract_signatures WHERE contract_id IN (SELECT id FROM contracts WHERE uuid = ?)")->execute([$contractUuid]);
                $this->db->prepare("DELETE FROM contracts WHERE uuid = ? AND status != 'SIGNED'")->execute([$contractUuid]);
            } catch (Throwable $e) {
                // Ignore
            }
        }

        // Exclui token se for de teste ou já finalizado
        if (!empty($lead['token_id'])) {
            try {
                $this->db->prepare("DELETE FROM licenciada_onboarding_tokens WHERE id = ? AND (is_test = 1 OR used_at IS NOT NULL)")->execute([$lead['token_id']]);
            } catch (Throwable $e) {
                // Ignore
            }
        }

        // Exclusão física na tabela principal
        $stmtDel = $this->db->prepare("DELETE FROM licenciada_onboarding_requests WHERE id = ?");
        $stmtDel->execute([$numericId]);

        return [
            'success' => true,
            'action' => 'hard_deleted',
            'message' => 'Lead e arquivos associados excluídos permanentemente com sucesso.',
            'deleted_files_count' => $deletedFiles
        ];
    }

    /**
     * Exclui um link/token de onboarding que ainda está em estágio de link enviado.
     *
     * @param int $tokenId
     * @param int $adminId
     * @return array
     */
    public function deleteTokenOnly(int $tokenId, int $adminId = 1): array {
        // Se houver alguma request associada a esse token, exclui a request em cascata
        try {
            $stmtReq = $this->db->prepare("SELECT id FROM licenciada_onboarding_requests WHERE token_id = ? LIMIT 1");
            $stmtReq->execute([$tokenId]);
            $associatedReqId = $stmtReq->fetchColumn();

            if ($associatedReqId) {
                return $this->deleteRequest((int)$associatedReqId, $adminId);
            }
        } catch (Throwable $e) {
            // Ignore
        }

        $stmtDel = $this->db->prepare("DELETE FROM licenciada_onboarding_tokens WHERE id = ?");
        $stmtDel->execute([$tokenId]);

        return [
            'success' => true,
            'action' => 'hard_deleted',
            'message' => "Link de pré-cadastro #{$tokenId} excluído permanentemente com sucesso.",
            'deleted_files_count' => 0
        ];
    }

    /**
     * Purga em massa todos os leads marcados como teste (is_test = 1).
     *
     * @param int $adminId
     * @return array
     */
    public function purgeAllTestRequests(int $adminId = 1): array {
        $stmt = $this->db->prepare("SELECT id FROM licenciada_onboarding_requests WHERE is_test = 1");
        $stmt->execute();
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $purgedCount = 0;
        foreach ($ids as $reqId) {
            try {
                $this->deleteRequest((int)$reqId, $adminId);
                $purgedCount++;
            } catch (Throwable $e) {
                error_log("Error purging test lead #{$reqId}: " . $e->getMessage());
            }
        }

        // Limpa tokens de teste órfãos
        try {
            $this->db->exec("DELETE FROM licenciada_onboarding_tokens WHERE is_test = 1");
        } catch (Throwable $e) {
            // Ignore
        }

        return [
            'success' => true,
            'message' => "{$purgedCount} leads de teste purgados do sistema com sucesso.",
            'purged_count' => $purgedCount
        ];
    }

    /**
     * Atribui ou reatribui um lead de onboarding para um gestor/admin responsável.
     *
     * @param int $id ID da solicitação de onboarding
     * @param int $targetAdminId ID do gestor que assumirá o lead
     * @param string|null $futureCohortTag Tag opcional de turma futura
     * @param int $currentAdminId ID do admin que realizou a alteração
     * @return bool
     */
    public function assignRequest(int $id, int $targetAdminId, ?string $futureCohortTag = null, int $currentAdminId = 1): bool {
        $stmt = $this->db->prepare("
            UPDATE licenciada_onboarding_requests 
            SET assigned_admin_id = ?,
                future_cohort_tag = COALESCE(?, future_cohort_tag),
                admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n[', NOW(), '] Lead atribuído ao gestor #', ?, ' pelo admin #', ?),
                updated_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$targetAdminId, $futureCohortTag ?: null, $targetAdminId, $currentAdminId, $id]);
    }
}

