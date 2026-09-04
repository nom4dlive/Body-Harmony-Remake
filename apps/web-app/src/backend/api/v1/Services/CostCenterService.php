<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

class CostCenterService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function list(): array {
        $stmt = $this->db->query("
            SELECT cc.id, cc.name, cc.tag, cc.description, cc.is_active, cc.created_at,
                   COALESCE(SUM(fe.amount_cents), 0) as total_expenses_cents,
                   COUNT(fe.id) as expenses_count
            FROM financial_cost_centers cc
            LEFT JOIN financial_expenses fe ON fe.cost_center_id = cc.id
            GROUP BY cc.id
            ORDER BY cc.name ASC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            $row['id'] = (int)$row['id'];
            $row['is_active'] = (int)$row['is_active'];
            $row['total_expenses_cents'] = (int)$row['total_expenses_cents'];
            $row['expenses_count'] = (int)$row['expenses_count'];
            $row['total_expenses_formatted'] = $this->formatCurrency($row['total_expenses_cents']);
            return $row;
        }, $rows);
    }

    public function create(array $data): array {
        $name = trim($data['name'] ?? '');
        $tag = trim($data['tag'] ?? '');

        if (empty($name) || empty($tag)) {
            throw new Exception("Nome e tag sao obrigatorios.");
        }

        $stmt = $this->db->prepare("
            INSERT INTO financial_cost_centers (name, tag, description)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$name, $tag, $data['description'] ?? null]);

        return [
            'id' => (int)$this->db->lastInsertId(),
            'message' => 'Centro de custo criado com sucesso.'
        ];
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = [];

        if (isset($data['name'])) {
            $fields[] = 'name = ?';
            $params[] = trim($data['name']);
        }
        if (isset($data['tag'])) {
            $fields[] = 'tag = ?';
            $params[] = trim($data['tag']);
        }
        if (array_key_exists('description', $data)) {
            $fields[] = 'description = ?';
            $params[] = $data['description'];
        }
        if (isset($data['is_active'])) {
            $fields[] = 'is_active = ?';
            $params[] = (int)$data['is_active'];
        }

        if (empty($fields)) return false;

        $params[] = $id;
        $stmt = $this->db->prepare("
            UPDATE financial_cost_centers SET " . implode(', ', $fields) . " WHERE id = ?
        ");
        $stmt->execute($params);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM financial_cost_centers WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function listExpenses(int $costCenterId): array {
        $centerStmt = $this->db->prepare("
            SELECT id, name, tag FROM financial_cost_centers WHERE id = ?
        ");
        $centerStmt->execute([$costCenterId]);
        $center = $centerStmt->fetch(PDO::FETCH_ASSOC);

        if (!$center) {
            throw new Exception("Centro de custo nao encontrado.");
        }

        $stmt = $this->db->prepare("
            SELECT id, description, amount_cents, category, receipt_path, expense_date, created_at
            FROM financial_expenses
            WHERE cost_center_id = ?
            ORDER BY expense_date DESC
        ");
        $stmt->execute([$costCenterId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $total = 0;
        $expenses = array_map(function ($row) use (&$total) {
            $row['id'] = (int)$row['id'];
            $row['amount_cents'] = (int)$row['amount_cents'];
            $row['amount_formatted'] = $this->formatCurrency($row['amount_cents']);
            $total += $row['amount_cents'];
            return $row;
        }, $rows);

        return [
            'cost_center' => [
                'id' => (int)$center['id'],
                'name' => $center['name'],
                'tag' => $center['tag']
            ],
            'expenses' => $expenses,
            'total_cents' => $total,
            'total_formatted' => $this->formatCurrency($total)
        ];
    }

    public function createExpense(array $data): array {
        $costCenterId = (int)($data['cost_center_id'] ?? 0);
        $description = trim($data['description'] ?? '');
        $amountCents = (int)($data['amount_cents'] ?? 0);
        $expenseDate = $data['expense_date'] ?? date('Y-m-d');

        if ($costCenterId <= 0 || empty($description) || $amountCents <= 0) {
            throw new Exception("Centro de custo, descricao e valor sao obrigatorios.");
        }

        $check = $this->db->prepare("SELECT id FROM financial_cost_centers WHERE id = ?");
        $check->execute([$costCenterId]);
        if (!$check->fetch()) {
            throw new Exception("Centro de custo nao encontrado.");
        }

        $stmt = $this->db->prepare("
            INSERT INTO financial_expenses (cost_center_id, description, amount_cents, category, expense_date)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $costCenterId,
            $description,
            $amountCents,
            $data['category'] ?? null,
            $expenseDate
        ]);

        return [
            'id' => (int)$this->db->lastInsertId(),
            'amount_formatted' => $this->formatCurrency($amountCents),
            'message' => 'Despesa registrada com sucesso.'
        ];
    }

    private function formatCurrency(int $cents): string {
        return 'R$ ' . number_format($cents / 100, 2, ',', '.');
    }
}
