<?php
/**
 * ==============================================================================
 * SMOKE TEST: LICENCIADA 360º DOSSIER & CROSS-MODULE SYNC (PLAN-142)
 * ==============================================================================
 * REGRA 6 Compliant: Pure Services & Mock PDO Isolation.
 * Zero HTTP controllers or global header execution.
 * ==============================================================================
 */

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/Licenciada360Service.php';

use BodyHarmony\Services\Licenciada360Service;

class MockPDO360 {
    public array $licenciadas = [];
    public array $contracts = [];
    public array $taxas = [];
    public array $onboarding = [];
    public array $agenda = [];
    public array $progress = [];
    public array $auditLog = [];

    public function __construct() {
        // Seed 1 Licenciada Mestre
        $this->licenciadas = [
            10 => [
                'id' => 10,
                'name' => 'Jaqueline Leal Venturini',
                'cpf' => '38.318.572/0001-38',
                'cnpj' => '38.318.572/0001-38',
                'whatsapp' => '5527999998888',
                'email' => 'jaqueline@exemplo.com',
                'location' => 'Linhares/ES',
                'cidade' => 'Linhares',
                'state' => 'ES',
                'photo_url' => null,
                'is_active' => 1,
                'created_at' => '2026-05-18 10:00:00'
            ]
        ];

        // Seed 1 Contrato
        $this->contracts = [
            [
                'id' => 101,
                'licenciada_id' => 10,
                'contract_uuid' => 'bh-lic-jaqueline-2026',
                'category' => 'licenciamento',
                'status' => 'SIGNED',
                'pdf_url' => 'https://bodyharmony.com.br/contracts/bh-lic-jaqueline-2026.pdf',
                'signed_at' => '2026-05-18 14:00:00',
                'created_at' => '2026-05-18 10:00:00'
            ]
        ];

        // Seed 1 Taxa Financeira
        $this->taxas = [
            [
                'id' => 201,
                'licenciada_id' => 10,
                'licenciada_name' => 'Jaqueline Leal Venturini',
                'licenciada_cpf' => '38.318.572/0001-38',
                'licenciada_cnpj' => '38.318.572/0001-38',
                'licenciada_location' => 'Linhares/ES',
                'valor_cents' => 600000,
                'payment_method' => 'pix',
                'payment_condition' => 'À vista',
                'status' => 'contract_signed',
                'source' => 'imported',
                'contract_signed_at' => '2026-05-18 12:00:00',
                'payment_confirmed_at' => '2026-05-18 12:00:00',
                'created_at' => '2026-05-18 10:00:00'
            ]
        ];

        // Seed 1 Onboarding
        $this->onboarding = [
            [
                'id' => 301,
                'licenciada_id' => 10,
                'nome_completo' => 'Jaqueline Leal Venturini',
                'telefone_whatsapp' => '5527999998888',
                'email' => 'jaqueline@exemplo.com',
                'cpf' => '38.318.572/0001-38',
                'cnpj' => '38.318.572/0001-38',
                'cidade_celebracao' => 'Linhares',
                'estado' => 'ES',
                'status' => 'ATIVADO',
                'taxa_inicial_num' => '6000.00',
                'condicoes_pagamento' => 'PIX à vista',
                'contract_uuid' => 'bh-lic-jaqueline-2026',
                'comprovante_pagamento_path' => null,
                'created_at' => '2026-05-18 09:00:00'
            ]
        ];
    }

    public function prepare(string $sql) {
        return new MockStmt360($this, $sql);
    }

    public function query(string $sql) {
        $stmt = new MockStmt360($this, $sql);
        $stmt->execute();
        return $stmt;
    }
}

class MockStmt360 {
    private MockPDO360 $pdo;
    private string $sql;
    private array $results = [];

    public function __construct(MockPDO360 $pdo, string $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute(array $params = []): bool {
        $sql = $this->sql;

        // Profile by ID
        if (strpos($sql, 'FROM licenciadas') !== false && strpos($sql, 'WHERE id = ?') !== false) {
            $id = (int)$params[0];
            $this->results = isset($this->pdo->licenciadas[$id]) ? [$this->pdo->licenciadas[$id]] : [];
            return true;
        }

        // List Licenciadas
        if (strpos($sql, 'SELECT id, name, cpf FROM licenciadas') !== false) {
            $this->results = array_values($this->pdo->licenciadas);
            return true;
        }

        // Contracts
        if (strpos($sql, 'FROM contracts') !== false) {
            $licId = (int)$params[0];
            $this->results = array_values(array_filter($this->pdo->contracts, fn($c) => $c['licenciada_id'] === $licId));
            return true;
        }

        // Taxas
        if (strpos($sql, 'FROM licenciada_taxas') !== false) {
            $licId = (int)$params[0];
            $this->results = array_values(array_filter($this->pdo->taxas, fn($t) => $t['licenciada_id'] === $licId));
            return true;
        }

        // Onboarding
        if (strpos($sql, 'FROM licenciada_onboarding_requests') !== false) {
            $licId = (int)$params[0];
            $this->results = array_values(array_filter($this->pdo->onboarding, fn($o) => $o['licenciada_id'] === $licId));
            return true;
        }

        // Gestor Agenda
        if (strpos($sql, 'FROM gestor_agenda_events') !== false) {
            $this->results = $this->pdo->agenda;
            return true;
        }

        // LMS Progress
        if (strpos($sql, 'FROM lms_lesson_progress') !== false) {
            $this->results = [['completed_count' => 18]];
            return true;
        }

        // Update Licenciada Master (REGRA 8 & 12 schema)
        if (strpos($sql, 'UPDATE licenciadas') !== false) {
            $id = (int)end($params);
            if (isset($this->pdo->licenciadas[$id])) {
                $this->pdo->licenciadas[$id]['name'] = $params[0];
                $this->pdo->licenciadas[$id]['whatsapp'] = $params[1];
                $this->pdo->licenciadas[$id]['email'] = $params[2];
                $this->pdo->licenciadas[$id]['cpf'] = $params[3];
                $this->pdo->licenciadas[$id]['location'] = $params[4];
                $this->pdo->licenciadas[$id]['state'] = $params[5];
                $this->pdo->licenciadas[$id]['is_active'] = $params[6];
            }
            return true;
        }

        // Cascade Taxas
        if (strpos($sql, 'UPDATE licenciada_taxas') !== false) {
            $licId = (int)($params[4] ?? $params[0] ?? 0);
            foreach ($this->pdo->taxas as &$t) {
                if ($t['licenciada_id'] === $licId) {
                    $t['licenciada_name'] = $params[0] ?? '';
                    $t['licenciada_cpf'] = $params[1] ?? '';
                    $t['licenciada_cnpj'] = $params[2] ?? '';
                    $t['licenciada_location'] = $params[3] ?? '';
                }
            }
            return true;
        }

        // Cascade Onboarding
        if (strpos($sql, 'UPDATE licenciada_onboarding_requests') !== false) {
            $licId = (int)($params[7] ?? $params[0] ?? 0);
            foreach ($this->pdo->onboarding as &$o) {
                if ($o['licenciada_id'] === $licId) {
                    $o['nome_completo'] = $params[0] ?? '';
                    $o['telefone_whatsapp'] = $params[1] ?? '';
                    $o['email'] = $params[2] ?? '';
                    $o['cpf'] = $params[3] ?? '';
                    $o['cnpj'] = $params[4] ?? '';
                    $o['cidade_celebracao'] = $params[5] ?? '';
                    $o['estado'] = $params[6] ?? '';
                }
            }
            return true;
        }

        // Insert Audit
        if (strpos($sql, 'INSERT INTO financial_audit_log') !== false) {
            $this->pdo->auditLog[] = $params;
            return true;
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_ASSOC) {
        return $this->results[0] ?? false;
    }

    public function fetchAll(int $mode = PDO::FETCH_ASSOC): array {
        return $this->results;
    }

    public function fetchColumn(): mixed {
        $row = $this->fetch();
        if ($row && is_array($row)) {
            return reset($row);
        }
        return false;
    }

    public function rowCount(): int {
        return 1;
    }
}

// ==========================================
// TEST RUNNER
// ==========================================
$mockPdo = new MockPDO360();
$service = new Licenciada360Service($mockPdo);
$passed = 0;
$failed = 0;

function assertTest(bool $condition, string $description, &$passed, &$failed) {
    if ($condition) {
        echo "  [PASS] {$description}\n";
        $passed++;
    } else {
        echo "  [FAIL] {$description}\n";
        $failed++;
    }
}

echo "=================================================================================\n";
echo "   SMOKE TEST: LICENCIADA 360º DOSSIER & CROSS-MODULE SYNC (PLAN-142)           \n";
echo "   REGRA 6 Compliant: Pure Services & Mock PDO Isolation                        \n";
echo "=================================================================================\n\n";

// 1. TEST GET DOSSIER
echo "1. AGREGAÇÃO DO DOSSIÊ 360º (PLAN-142)\n";
$dossier = $service->getDossier(10);
assertTest($dossier !== null, "Dossiê 360º retornado com sucesso para licenciada #10", $passed, $failed);
assertTest($dossier['profile']['name'] === 'Jaqueline Leal Venturini', "Profile oficial contém nome mestre correto", $passed, $failed);
assertTest(count($dossier['contracts']) === 1, "Contrato formal vinculado na lista de contratos", $passed, $failed);
assertTest($dossier['financial']['total_contracted_cents'] === 600000, "Total financeiro contratado é R$ 6.000,00 (600.000 cents)", $passed, $failed);
assertTest($dossier['financial']['total_paid_cents'] === 600000, "Total quitado confere com taxa quitada", $passed, $failed);
assertTest($dossier['financial']['balance_pending_cents'] === 0, "Saldo pendente é R$ 0,00 (quitada)", $passed, $failed);
assertTest($dossier['onboarding']['status'] === 'ATIVADO', "Formulário de onboarding associado com status ATIVADO", $passed, $failed);
assertTest($dossier['lms']['completed_lessons'] === 18, "Progresso LMS indica 18 aulas completadas", $passed, $failed);
assertTest($dossier['summary_badges']['contract_status_badge'] === 'Assinado', "Badge de contrato indica 'Assinado'", $passed, $failed);

// 2. TEST CASCADE MUTATION
echo "\n2. PROPAGAÇÃO REATIVA EM CASCATA\n";
$updatePayload = [
    'name' => 'Dra. Jaqueline Leal Venturini',
    'whatsapp' => '5527988887777',
    'email' => 'jaqueline.nova@exemplo.com',
    'cpf' => '38.318.572/0001-38',
    'cnpj' => '38.318.572/0001-38',
    'location' => 'Linhares Centro/ES',
    'cidade' => 'Linhares',
    'state' => 'ES',
    'is_active' => 1,
    'propagate_cascade' => true
];
$operator = ['id' => 1, 'username' => 'josi_gestora'];

$updateRes = $service->updateProfileAndPropagate(10, $updatePayload, $operator);
assertTest($updateRes['success'] === true, "Atualização do perfil concluída com sucesso", $passed, $failed);
assertTest($mockPdo->licenciadas[10]['name'] === 'Dra. Jaqueline Leal Venturini', "Nome atualizado na tabela mestre licenciadas", $passed, $failed);
assertTest($mockPdo->taxas[0]['licenciada_name'] === 'Dra. Jaqueline Leal Venturini', "Cascata: Nome propagado para licenciada_taxas", $passed, $failed);
assertTest($mockPdo->onboarding[0]['nome_completo'] === 'Dra. Jaqueline Leal Venturini', "Cascata: Nome propagado para onboarding_requests", $passed, $failed);
assertTest($mockPdo->onboarding[0]['telefone_whatsapp'] === '5527988887777', "Cascata: WhatsApp propagado para onboarding_requests", $passed, $failed);
assertTest(count($mockPdo->auditLog) > 0, "Log de auditoria registrado", $passed, $failed);
assertTest($mockPdo->auditLog[0][1] === 'josi_gestora', "Username do operador registrado estritamente conforme REGRA 12 (u.username)", $passed, $failed);

// 3. TEST AUTO-HEAL LINKING
echo "\n3. AUTO-HEAL LINKER SILENCIOSO\n";
$linkRes = $service->autoHealAndLinkAll();
assertTest(is_array($linkRes), "Rotina de auto-linking executada", $passed, $failed);
assertTest($linkRes['total_licenciadas'] === 1, "Total de licenciadas processadas pelo linker", $passed, $failed);

echo "\n=================================================================================\n";
echo "   RESULTADO FINAL: {$passed} PASSADOS / {$failed} FALHAS\n";
echo "=================================================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
