<?php
// apps/web-app/src/backend/api/v1/admin/contracts/index.php

require_once __DIR__ . '/../../../cors.php';
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../auth_check.php';
require_once __DIR__ . '/ensure_tables.php';
require_once __DIR__ . '/../../Services/ContractPdfService.php';

use BodyHarmony\Services\ContractPdfService;

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
ensureContractsTablesExist($pdo);

// =========================================================================
// 1. GET: List with counters and pagination OR detail by uuid
// =========================================================================
if ($method === 'GET') {
    $uuid = $_GET['uuid'] ?? null;

    // Single Contract Detail
    if (!empty($uuid)) {
        try {
            $stmt = $pdo->prepare("
                SELECT c.*, t.slug AS template_slug, t.title AS template_title,
                       l.name AS licenciada_name_db, l.cpf AS licenciada_doc_db
                FROM contracts c
                LEFT JOIN contract_templates t ON c.template_id = t.id
                LEFT JOIN licenciadas l ON c.licenciada_id = l.id
                WHERE c.uuid = ?
            ");
            $stmt->execute([$uuid]);
            $contract = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$contract) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Fetch signatures
            $sigStmt = $pdo->prepare("
                SELECT id, signer_type, signer_name, signer_document, signer_email,
                       signature_mode, signature_image_path, ip_address, user_agent,
                       signed_at, checksum_signature
                FROM contract_signatures
                WHERE contract_id = ?
                ORDER BY id ASC
            ");
            $sigStmt->execute([$contract['id']]);
            $signatures = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

            $variables = json_decode($contract['variables_payload'] ?? '{}', true) ?: [];
            $licenciadaName = $contract['licenciada_name_db'] ?? ($variables['LICENCIADA_NOME_RAZAO'] ?? 'N/A');

            echo json_encode([
                'ok' => true,
                'contract' => [
                    'id' => (int)$contract['id'],
                    'uuid' => $contract['uuid'],
                    'title' => $contract['title'],
                    'template_slug' => $contract['template_slug'],
                    'licenciada_id' => $contract['licenciada_id'] ? (int)$contract['licenciada_id'] : null,
                    'licenciada_name' => $licenciadaName,
                    'status' => $contract['status'],
                    'variables_payload' => $variables,
                    'rendered_html' => $contract['rendered_html'],
                    'sha256_hash' => $contract['sha256_hash'],
                    'sign_token' => $contract['sign_token'],
                    'sign_url' => $contract['sign_token'] ? "/assinar/{$contract['sign_token']}" : null,
                    'pdf_url' => "/api/v1/contracts/download.php?uuid={$contract['uuid']}&token={$contract['sign_token']}",
                    'created_at' => $contract['created_at'],
                    'updated_at' => $contract['updated_at'],
                    'signatures' => array_map(function($s) {
                        return [
                            'id' => (int)$s['id'],
                            'signer_type' => $s['signer_type'],
                            'signer_name' => $s['signer_name'],
                            'signer_document' => $s['signer_document'],
                            'signer_email' => $s['signer_email'],
                            'signature_mode' => $s['signature_mode'],
                            'signature_image_url' => $s['signature_image_path'],
                            'ip_address' => $s['ip_address'],
                            'user_agent' => $s['user_agent'],
                            'signed_at' => $s['signed_at'],
                            'checksum_signature' => $s['checksum_signature']
                        ];
                    }, $signatures)
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // List or Single Contract
    try {
        if (!empty($_GET['uuid'])) {
            $uuidLookup = trim($_GET['uuid']);
            $stmtSingle = $pdo->prepare("
                SELECT c.*, t.slug AS template_slug, t.title AS template_title,
                       l.name AS licenciada_name_db, l.cpf AS licenciada_doc_db
                FROM contracts c
                LEFT JOIN contract_templates t ON c.template_id = t.id
                LEFT JOIN licenciadas l ON c.licenciada_id = l.id
                WHERE c.uuid = ?
            ");
            $stmtSingle->execute([$uuidLookup]);
            $c = $stmtSingle->fetch(PDO::FETCH_ASSOC);

            if (!$c) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            echo json_encode([
                'ok' => true,
                'contract' => [
                    'id' => (int)$c['id'],
                    'uuid' => $c['uuid'],
                    'template_id' => (int)$c['template_id'],
                    'template_slug' => $c['template_slug'],
                    'template_title' => $c['template_title'],
                    'licenciada_id' => $c['licenciada_id'] ? (int)$c['licenciada_id'] : null,
                    'title' => $c['title'],
                    'status' => $c['status'],
                    'variables_payload' => json_decode($c['variables_payload'] ?? '{}', true) ?: [],
                    'rendered_html' => $c['rendered_html'],
                    'pdf_path' => $c['pdf_path'],
                    'sha256_hash' => $c['sha256_hash'],
                    'sign_token' => $c['sign_token'],
                    'created_at' => $c['created_at'],
                    'updated_at' => $c['updated_at']
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $status = $_GET['status'] ?? 'ALL';
        $search = trim($_GET['search'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        // Counters
        $cntStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('PENDING_SIGNATURE', 'GENERATED') THEN 1 ELSE 0 END) as pending_signature,
                SUM(CASE WHEN status = 'SIGNED' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) as signed_month,
                SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft
            FROM contracts
        ");
        $rawCounters = $cntStmt->fetch(PDO::FETCH_ASSOC);
        $counters = [
            'total' => (int)($rawCounters['total'] ?? 0),
            'pending_signature' => (int)($rawCounters['pending_signature'] ?? 0),
            'signed_month' => (int)($rawCounters['signed_month'] ?? 0),
            'draft' => (int)($rawCounters['draft'] ?? 0)
        ];

        // Query Filters
        $where = [];
        $params = [];

        if ($status !== 'ALL' && in_array($status, ['DRAFT', 'GENERATED', 'PENDING_SIGNATURE', 'SIGNED', 'CANCELLED', 'ARCHIVED'])) {
            $where[] = "c.status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $where[] = "(c.title LIKE ? OR l.name LIKE ? OR l.cpf LIKE ? OR c.uuid LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Total for pagination
        $countSql = "
            SELECT COUNT(*)
            FROM contracts c
            LEFT JOIN licenciadas l ON c.licenciada_id = l.id
            {$whereClause}
        ";
        $totalStmt = $pdo->prepare($countSql);
        $totalStmt->execute($params);
        $totalRecords = (int)$totalStmt->fetchColumn();
        $totalPages = ceil($totalRecords / $limit) ?: 1;

        // Main List Query
        $sql = "
            SELECT c.*, t.slug AS template_slug, t.title AS template_title,
                   l.name AS licenciada_name_db, l.cpf AS licenciada_doc_db,
                   l.location AS licenciada_loc_db, l.state AS licenciada_state_db
            FROM contracts c
            LEFT JOIN contract_templates t ON c.template_id = t.id
            LEFT JOIN licenciadas l ON c.licenciada_id = l.id
            {$whereClause}
            ORDER BY c.id DESC
            LIMIT {$limit} OFFSET {$offset}
        ";
        $listStmt = $pdo->prepare($sql);
        $listStmt->execute($params);
        $rows = $listStmt->fetchAll(PDO::FETCH_ASSOC);

        $contracts = [];
        foreach ($rows as $r) {
            $vars = json_decode($r['variables_payload'] ?? '{}', true) ?: [];
            $licName = $r['licenciada_name_db'] ?? ($vars['LICENCIADA_NOME_RAZAO'] ?? 'N/A');
            $licDoc = $r['licenciada_doc_db'] ?? ($vars['LICENCIADA_CNPJ_CPF'] ?? 'N/A');
            $licLoc = ($r['licenciada_loc_db'] ? "{$r['licenciada_loc_db']} / {$r['licenciada_state_db']}" : ($vars['DELIMITACAO_TERRITORIAL'] ?? ''));

            $sigCheck = $pdo->prepare("SELECT signer_type FROM contract_signatures WHERE contract_id = ?");
            $sigCheck->execute([$r['id']]);
            $signedTypes = $sigCheck->fetchAll(PDO::FETCH_COLUMN) ?: [];

            $contracts[] = [
                'id' => (int)$r['id'],
                'uuid' => $r['uuid'],
                'title' => $r['title'],
                'template_slug' => $r['template_slug'] ?: '',
                'licenciada_id' => $r['licenciada_id'] ? (int)$r['licenciada_id'] : null,
                'licenciada_name' => $licName,
                'licenciada_document' => $licDoc,
                'licenciada_location' => $licLoc,
                'status' => $r['status'],
                'sha256_hash' => $r['sha256_hash'],
                'has_pdf' => !empty($r['pdf_path']),
                'has_licenciante_signature' => in_array('LICENCIANTE', $signedTypes),
                'has_licenciada_signature' => in_array('LICENCIADA', $signedTypes),
                'sign_token' => $r['sign_token'],
                'sign_url' => $r['sign_token'] ? "/assinar/{$r['sign_token']}" : null,
                'signed_at' => $r['status'] === 'SIGNED' ? $r['updated_at'] : null,
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at']
            ];
        }

        echo json_encode([
            'ok' => true,
            'counters' => $counters,
            'contracts' => $contracts,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total_pages' => $totalPages,
                'total_records' => $totalRecords
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 2. POST: Create and compile contract
// =========================================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Payload JSON inválido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $templateSlug = $input['template_slug'] ?? 'licenciamento-padrao';
    $title = trim($input['title'] ?? '');
    $variables = $input['variables'] ?? [];
    $licenciadaId = !empty($input['licenciada_id']) ? (int)$input['licenciada_id'] : null;
    $status = in_array($input['status'] ?? '', ['DRAFT', 'GENERATED', 'PENDING_SIGNATURE']) ? $input['status'] : 'GENERATED';

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Título do contrato é obrigatório.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        // Fetch template
        $tplStmt = $pdo->prepare("SELECT * FROM contract_templates WHERE slug = ? AND is_active = 1");
        $tplStmt->execute([$templateSlug]);
        $template = $tplStmt->fetch(PDO::FETCH_ASSOC);

        if (!$template) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => "Modelo '{$templateSlug}' não encontrado."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Auto-save new Licenciada if requested and not linked to an existing one
        if (!empty($input['auto_save_licenciada']) && empty($licenciadaId)) {
            try {
                $licName = trim($variables['LICENCIADA_RAZAO_SOCIAL'] ?? $variables['LICENCIADA_NOME_RAZAO'] ?? $variables['OUVINTE_NOME'] ?? '');
                $licDoc = trim($variables['LICENCIADA_CNPJ_CPF'] ?? $variables['LICENCIADA_CPF'] ?? $variables['OUVINTE_CPF'] ?? '');
                $licEmail = trim($variables['LICENCIADA_EMAIL_OFICIAL'] ?? $variables['LICENCIADA_EMAIL'] ?? $variables['OUVINTE_EMAIL'] ?? '');
                $licPhone = trim($variables['LICENCIADA_TELEFONE'] ?? $variables['OUVINTE_TELEFONE'] ?? '');
                $licAddr = trim($variables['LICENCIADA_ENDERECO'] ?? $variables['OUVINTE_ENDERECO'] ?? '');
                $licCity = trim($variables['CIDADE_OPERACIONAL'] ?? $variables['LICENCIADA_CIDADE_UF'] ?? $variables['OUVINTE_CIDADE_UF'] ?? '');
                $licState = trim($variables['ESTADO_OPERACIONAL'] ?? 'SP');

                if (!empty($licName)) {
                    $insLic = $pdo->prepare("
                        INSERT INTO licenciadas (name, cpf, email, whatsapp, address, location, state, is_active, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
                    ");
                    $insLic->execute([
                        $licName,
                        $licDoc,
                        $licEmail,
                        $licPhone,
                        $licAddr,
                        $licCity,
                        $licState
                    ]);
                    $licenciadaId = (int)$pdo->lastInsertId();
                }
            } catch (Throwable $eLic) {
                error_log("[AutoSave Licenciada Warning] " . $eLic->getMessage());
            }
        }

        // Generate UUID & Sign Token
        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        $signToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 days'));
        $customHtml = !empty($input['custom_html']) ? trim($input['custom_html']) : null;
        $logoOptions = is_array($input['logo_options'] ?? null) ? $input['logo_options'] : [];

        // Service to replace variables and generate PDF
        $pdfService = new ContractPdfService();
        if (!empty($customHtml) && strpos($customHtml, '{{') !== false) {
            $baseHtml = $customHtml;
        } elseif (!empty($template['content_html'])) {
            $baseHtml = $template['content_html'];
        } else {
            $baseHtml = $customHtml ?: '';
        }
        $renderedHtml = $pdfService->renderTemplate($baseHtml, $variables);

        // Compile initial PDF with logo options
        $pdfResult = $pdfService->generatePdf($renderedHtml, $uuid, $title, [], true, $logoOptions);

        // Insert into database
        $insStmt = $pdo->prepare("
            INSERT INTO contracts (
                uuid, template_id, licenciada_id, title, status,
                variables_payload, rendered_html, pdf_path, sha256_hash,
                sign_token, sign_token_expires_at, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $insStmt->execute([
            $uuid,
            $template['id'],
            $licenciadaId,
            $title,
            $status,
            json_encode($variables, JSON_UNESCAPED_UNICODE),
            $renderedHtml,
            $pdfResult['relative_path'],
            $pdfResult['sha256_hash'],
            $signToken,
            $expiresAt,
            $current_user_id ?? 1
        ]);

        $contractId = (int)$pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'ok' => true,
            'message' => 'Contrato gerado com sucesso!',
            'contract' => [
                'id' => $contractId,
                'uuid' => $uuid,
                'title' => $title,
                'status' => $status,
                'sha256_hash' => $pdfResult['sha256_hash'],
                'sign_token' => $signToken,
                'sign_url' => "/assinar/{$signToken}",
                'pdf_url' => "/api/v1/contracts/download.php?uuid={$uuid}&token={$signToken}"
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Throwable $e) {
        error_log("[contracts/create] Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Erro interno ao criar contrato: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 3. PUT / PATCH: Update existing contract & recompile PDF
// =========================================================================
if ($method === 'PUT' || $method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $uuid = $input['uuid'] ?? $_GET['uuid'] ?? null;

    if (empty($uuid)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'UUID do contrato é obrigatório.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM contracts WHERE uuid = ?");
        $stmt->execute([$uuid]);
        $contract = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$contract) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $existingVars = json_decode($contract['variables_payload'] ?? '{}', true) ?: [];
        $newVars = isset($input['variables']) && is_array($input['variables'])
            ? array_merge($existingVars, $input['variables']) : $existingVars;

        // Core Licenciada fields that require re-signing if mutated on a SIGNED contract
        $coreLicenciadaFields = [
            'LICENCIADA_CNPJ_CPF',
            'LICENCIADA_CPF',
            'LICENCIADA_CNPJ',
            'LICENCIADA_RAZAO_SOCIAL',
            'LICENCIADA_REPRESENTANTE_NOME',
            'TAXA_INICIAL_NUM',
            'VALOR_TAXA_INICIAL_NUM',
            'LICENCIADA_ENDERECO',
            'CIDADE_ESTADO',
            'LICENCIADA_CIDADE_UF'
        ];

        $hasCoreLicenciadaMutation = false;
        $mutatedFields = [];
        foreach ($coreLicenciadaFields as $field) {
            $oldVal = trim((string)($existingVars[$field] ?? ''));
            $newVal = trim((string)($newVars[$field] ?? ''));
            if ($oldVal !== '' && $newVal !== '' && $oldVal !== $newVal) {
                $hasCoreLicenciadaMutation = true;
                $mutatedFields[] = $field;
            }
        }

        $newTitle = isset($input['title']) ? trim($input['title']) : $contract['title'];
        $requestedStatus = isset($input['status']) && in_array($input['status'], ['DRAFT', 'GENERATED', 'PENDING_SIGNATURE', 'SIGNED', 'CANCELLED', 'ARCHIVED'])
            ? $input['status'] : $contract['status'];

        // Intelligent status governance for already SIGNED contracts
        $newStatus = $requestedStatus;
        if ($contract['status'] === 'SIGNED') {
            if ($hasCoreLicenciadaMutation && empty($input['force_preserve_signed'])) {
                // Core licensee data mutated -> Transition to PENDING_SIGNATURE and remove obsolete Licenciada signature
                $newStatus = 'PENDING_SIGNATURE';
                $delSigStmt = $pdo->prepare("DELETE FROM contract_signatures WHERE contract_id = ? AND signer_type != 'LICENCIANTE'");
                $delSigStmt->execute([$contract['id']]);
            } else {
                // Cosmetic or institutional changes -> preserve SIGNED status
                $newStatus = 'SIGNED';
            }
        }

        // Fetch template base HTML defensivamente
        $templateHtml = '';
        if (!empty($contract['template_id'])) {
            $tplStmt = $pdo->prepare("SELECT content_html FROM contract_templates WHERE id = ?");
            $tplStmt->execute([$contract['template_id']]);
            $templateHtml = $tplStmt->fetchColumn() ?: '';
        }

        $customHtml = !empty($input['custom_html']) ? trim($input['custom_html']) : null;
        if (!empty($customHtml) && strpos($customHtml, '{{') !== false) {
            $baseHtml = $customHtml;
        } elseif (!empty($templateHtml)) {
            $baseHtml = $templateHtml;
        } elseif (!empty($customHtml)) {
            $baseHtml = $customHtml;
        } elseif (!empty($contract['rendered_html'])) {
            $baseHtml = $contract['rendered_html'];
        } else {
            $fallbackStmt = $pdo->query("SELECT content_html FROM contract_templates WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
            $baseHtml = $fallbackStmt ? ($fallbackStmt->fetchColumn() ?: '') : '';
        }

        $pdfService = new ContractPdfService();
        $renderedHtml = $pdfService->renderTemplate($baseHtml ?: '', $newVars);

        // Fetch existing signatures
        $sigStmt = $pdo->prepare("SELECT * FROM contract_signatures WHERE contract_id = ? ORDER BY id ASC");
        $sigStmt->execute([$contract['id']]);
        $signatures = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

        $pdfResult = $pdfService->generatePdf($renderedHtml, $uuid, $newTitle, $signatures, true, $input['logo_options'] ?? []);

        // Update database record
        $updStmt = $pdo->prepare("
            UPDATE contracts
            SET title = ?, status = ?, variables_payload = ?, rendered_html = ?,
                pdf_path = ?, sha256_hash = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([
            $newTitle,
            $newStatus,
            json_encode($newVars, JSON_UNESCAPED_UNICODE),
            $renderedHtml,
            $pdfResult['relative_path'],
            $pdfResult['sha256_hash'],
            $contract['id']
        ]);

        echo json_encode([
            'ok' => true,
            'message' => 'Contrato atualizado e recompilado com sucesso!',
            'contract' => [
                'id' => (int)$contract['id'],
                'uuid' => $uuid,
                'title' => $newTitle,
                'status' => $newStatus,
                'sha256_hash' => $pdfResult['sha256_hash'],
                'sign_token' => $contract['sign_token'],
                'pdf_url' => "/api/v1/contracts/download.php?uuid={$uuid}&token={$contract['sign_token']}"
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Erro ao atualizar contrato: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =========================================================================
// 4. DELETE: Delete contract (RESTRITO A SUPERADMIN)
// =========================================================================
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $uuid = $_GET['uuid'] ?? $input['uuid'] ?? null;

    if (empty($uuid)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'UUID do contrato é obrigatório para exclusão.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Role Verification: Must be superadmin
    $userRole = 'admin';
    if (!empty($current_user_id)) {
        $uStmt = $pdo->prepare("SELECT role FROM admin_users WHERE id = ?");
        $uStmt->execute([$current_user_id]);
        $userRole = strtolower($uStmt->fetchColumn() ?: 'admin');
    }

    if ($userRole !== 'superadmin') {
        http_response_code(403);
        echo json_encode([
            'ok' => false,
            'error' => 'Acesso negado: Apenas SuperAdmins possuem permissão para excluir contratos.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, uuid, pdf_path, status, title FROM contracts WHERE uuid = ?");
        $stmt->execute([$uuid]);
        $contract = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$contract) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Contrato não encontrado.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Delete signature records
        $delSig = $pdo->prepare("DELETE FROM contract_signatures WHERE contract_id = ?");
        $delSig->execute([$contract['id']]);

        // Delete contract record
        $delCnt = $pdo->prepare("DELETE FROM contracts WHERE id = ?");
        $delCnt->execute([$contract['id']]);

        // Delete physical file if exists
        $filePath = __DIR__ . '/../../../../private_uploads/contracts/' . $uuid . '.pdf';
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        echo json_encode([
            'ok' => true,
            'message' => "Contrato '{$contract['title']}' (UUID: {$uuid}) excluído definitivamente pelo SuperAdmin.",
            'deleted_uuid' => $uuid
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Erro ao excluir contrato: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método HTTP não suportado.'], JSON_UNESCAPED_UNICODE);
