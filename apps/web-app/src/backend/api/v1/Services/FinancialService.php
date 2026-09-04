<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

class FinancialService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getDashboardKPIs(string $period = '30d'): array {
        $dateFrom = $this->resolveDateFrom($period);

        $revenue = $this->getRevenueByPeriod($dateFrom);
        $margin = $this->getMargin($dateFrom);
        $cashRunway = $this->getCashRunway();
        $cac = $this->getCac($dateFrom);
        $inadimplencia = $this->getInadimplencia();
        $recentTransactions = $this->getRecentTransactions(5);
        $monthlyChart = $this->getMonthlyRevenueChart(6);

        return [
            'revenue' => $revenue,
            'margin' => $margin,
            'cash_runway' => $cashRunway,
            'cac' => $cac,
            'inadimplencia' => $inadimplencia,
            'recent_transactions' => $recentTransactions,
            'monthly_revenue_chart' => $monthlyChart
        ];
    }

    public function getRevenueByPeriod(string $dateFrom, ?string $dateTo = null): array {
        $dateTo = $dateTo ?? date('Y-m-d');

        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount_cents), 0) as total_cents
            FROM financial_transactions
            WHERE type = 'revenue'
              AND status = 'confirmed'
              AND created_at >= ?
              AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $stmt->execute([$dateFrom, $dateTo]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $prevFrom = date('Y-m-d', strtotime($dateFrom) - (strtotime($dateTo) - strtotime($dateFrom)));
        $stmt2 = $this->db->prepare("
            SELECT COALESCE(SUM(amount_cents), 0) as total_cents
            FROM financial_transactions
            WHERE type = 'revenue'
              AND status = 'confirmed'
              AND created_at >= ?
              AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $stmt2->execute([$prevFrom, $dateFrom]);
        $prevRow = $stmt2->fetch(PDO::FETCH_ASSOC);

        $total = (int)$row['total_cents'];
        $prev = (int)$prevRow['total_cents'];
        $vsLast = $prev > 0 ? round((($total - $prev) / $prev) * 100, 1) : null;

        $periodLabel = $this->getPeriodLabel($dateFrom, $dateTo);

        return [
            'total_cents' => $total,
            'total_formatted' => $this->formatCurrency($total),
            'period_label' => $periodLabel,
            'vs_last_period_pct' => $vsLast
        ];
    }

    public function getMargin(string $dateFrom): array {
        $dateTo = date('Y-m-d');

        $stmt = $this->db->prepare("
            SELECT
                COALESCE(SUM(CASE WHEN type = 'revenue' AND status = 'confirmed' THEN amount_cents ELSE 0 END), 0) as revenue,
                COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'confirmed' THEN amount_cents ELSE 0 END), 0) as expenses,
                COALESCE(SUM(CASE WHEN type IN ('refund','chargeback') AND status = 'confirmed' THEN amount_cents ELSE 0 END), 0) as refunds
            FROM financial_transactions
            WHERE created_at >= ?
              AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $stmt->execute([$dateFrom, $dateTo]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $revenue = (int)$row['revenue'];
        $expenses = (int)$row['expenses'] + (int)$row['refunds'];
        $grossPct = $revenue > 0 ? round((($revenue - $expenses) / $revenue) * 100, 1) : 0;

        $monthlyFixed = $this->getAvgMonthlyFixedCosts();
        $netPct = $revenue > 0 ? round((($revenue - $monthlyFixed) / $revenue) * 100, 1) : 0;

        $status = 'healthy';
        if ($netPct < 25) $status = 'critical';
        elseif ($netPct < 35) $status = 'warning';

        return [
            'gross_pct' => $grossPct,
            'net_pct' => $netPct,
            'status' => $status
        ];
    }

    public function getCashRunway(): array {
        $stmt = $this->db->query("
            SELECT COALESCE(SUM(amount_cents), 0) as balance
            FROM financial_transactions
            WHERE type = 'revenue'
              AND status = 'confirmed'
        ");
        $balance = (int)$stmt->fetch(PDO::FETCH_ASSOC)['balance'];

        $stmt2 = $this->db->query("
            SELECT COALESCE(SUM(amount_cents), 0) as total
            FROM financial_transactions
            WHERE type = 'expense'
              AND status = 'confirmed'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        ");
        $threeMonthExpenses = (int)$stmt2->fetch(PDO::FETCH_ASSOC)['total'];
        $avgMonthlyCost = $threeMonthExpenses > 0 ? (int)round($threeMonthExpenses / 3) : 1;

        $monthsRemaining = $avgMonthlyCost > 0 ? round($balance / $avgMonthlyCost, 1) : 99;

        $status = 'healthy';
        if ($monthsRemaining < 3) $status = 'critical';
        elseif ($monthsRemaining < 5) $status = 'warning';

        return [
            'months_remaining' => $monthsRemaining,
            'current_balance_cents' => $balance,
            'avg_monthly_cost_cents' => $avgMonthlyCost,
            'status' => $status
        ];
    }

    public function getCac(string $dateFrom): array {
        $dateTo = date('Y-m-d');

        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount_cents), 0) as marketing_spend
            FROM financial_transactions
            WHERE category = 'marketing'
              AND type = 'expense'
              AND status = 'confirmed'
              AND created_at >= ?
              AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $stmt->execute([$dateFrom, $dateTo]);
        $marketingSpend = (int)$stmt->fetch(PDO::FETCH_ASSOC)['marketing_spend'];

        $stmt2 = $this->db->prepare("
            SELECT COUNT(DISTINCT id) as new_customers
            FROM shop_leads
            WHERE status = 'Pago'
              AND created_at >= ?
              AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $stmt2->execute([$dateFrom, $dateTo]);
        $newCustomers = (int)$stmt2->fetch(PDO::FETCH_ASSOC)['new_customers'];

        $cac = $newCustomers > 0 ? (int)round($marketingSpend / $newCustomers) : 0;

        return [
            'value_cents' => $cac,
            'formatted' => $this->formatCurrency($cac),
            'marketing_spend_cents' => $marketingSpend,
            'new_customers' => $newCustomers
        ];
    }

    public function getInadimplencia(): array {
        $stmt = $this->db->query("
            SELECT
                o.id,
                'shop_order' as source_type,
                o.customer_name,
                o.amount_cents,
                DATEDIFF(NOW(), o.created_at) as days_overdue,
                o.payment_status as status
            FROM shop_orders o
            WHERE o.payment_status = 'PENDING'
              AND o.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY o.created_at ASC
            LIMIT 50
        ");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pendingTotal = 0;
        foreach ($items as &$item) {
            $item['amount_cents'] = (int)$item['amount_cents'];
            $item['days_overdue'] = (int)$item['days_overdue'];
            $pendingTotal += $item['amount_cents'];
        }

        return [
            'pending_count' => count($items),
            'pending_total_cents' => $pendingTotal,
            'pending_formatted' => $this->formatCurrency($pendingTotal),
            'items' => $items
        ];
    }

    public function getRecentTransactions(int $limit = 5): array {
        $stmt = $this->db->prepare("
            SELECT
                id, source_type, type, amount_cents, description, category,
                tax_tag, event_tag, status, created_at
            FROM financial_transactions
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            $row['amount_cents'] = (int)$row['amount_cents'];
            $row['amount_formatted'] = $this->formatCurrency($row['amount_cents']);
            return $row;
        }, $rows);
    }

    public function getMonthlyRevenueChart(int $months = 6): array {
        $results = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = date('Y-m-01', strtotime("-{$i} months"));
            $monthEnd = date('Y-m-t', strtotime("-{$i} months"));

            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(CASE WHEN type = 'revenue' AND status = 'confirmed' THEN amount_cents ELSE 0 END), 0) as revenue,
                    COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'confirmed' THEN amount_cents ELSE 0 END), 0) as expenses
                FROM financial_transactions
                WHERE created_at >= ? AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
            ");
            $stmt->execute([$monthStart, $monthEnd]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $revenue = (int)$row['revenue'];
            $expenses = (int)$row['expenses'];

            $results[] = [
                'month' => date('M/Y', strtotime($monthStart)),
                'revenue_cents' => $revenue,
                'expenses_cents' => $expenses,
                'net_cents' => $revenue - $expenses
            ];
        }
        return $results;
    }

    public function getTransactions(array $filters): array {
        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $where = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['type'])) {
            $where[] = 'type = ?';
            $params[] = $filters['type'];
        }
        if (!empty($filters['source_type'])) {
            $where[] = 'source_type = ?';
            $params[] = $filters['source_type'];
        }
        if (!empty($filters['tax_tag'])) {
            $where[] = 'tax_tag = ?';
            $params[] = $filters['tax_tag'];
        }
        if (!empty($filters['category'])) {
            $where[] = 'category = ?';
            $params[] = $filters['category'];
        }
        if (!empty($filters['event_tag'])) {
            $where[] = 'event_tag = ?';
            $params[] = $filters['event_tag'];
        }
        if (!empty($filters['date_from'])) {
            $where[] = 'created_at >= ?';
            $params[] = $filters['date_from'];
        }
        if (!empty($filters['date_to'])) {
            $where[] = 'created_at <= DATE_ADD(?, INTERVAL 1 DAY)';
            $params[] = $filters['date_to'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(description LIKE ? OR category LIKE ? OR event_tag LIKE ?)';
            $search = '%' . $filters['search'] . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $whereClause = implode(' AND ', $where);
        $sort = in_array(($filters['sort'] ?? ''), ['created_at', 'amount_cents']) ? $filters['sort'] : 'created_at';
        $order = strtolower(($filters['order'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';

        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM financial_transactions WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $params[] = $perPage;
        $params[] = $offset;
        $stmt = $this->db->prepare("
            SELECT id, source_type, source_id, type, amount_cents, currency, description,
                   category, tax_tag, event_tag, payment_method, installments, status,
                   confirmed_at, created_at
            FROM financial_transactions
            WHERE {$whereClause}
            ORDER BY {$sort} {$order}
            LIMIT ? OFFSET ?
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $transactions = array_map(function ($row) {
            $row['amount_cents'] = (int)$row['amount_cents'];
            $row['installments'] = (int)$row['installments'];
            $row['amount_formatted'] = $this->formatCurrency($row['amount_cents']);
            return $row;
        }, $rows);

        return [
            'transactions' => $transactions,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => (int)ceil($total / $perPage)
            ]
        ];
    }

    public function createTransaction(array $data): array {
        $stmt = $this->db->prepare("
            INSERT INTO financial_transactions
                (source_type, source_id, type, amount_cents, description, category,
                 tax_tag, cost_center_id, event_tag, payment_method, installments, status, confirmed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $confirmedAt = ($data['status'] ?? 'confirmed') === 'confirmed' ? date('Y-m-d H:i:s') : null;

        $stmt->execute([
            $data['source_type'] ?? 'manual',
            $data['source_id'] ?? null,
            $data['type'] ?? 'revenue',
            $data['amount_cents'],
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['tax_tag'] ?? 'nao_definido',
            $data['cost_center_id'] ?? null,
            $data['event_tag'] ?? null,
            $data['payment_method'] ?? 'manual',
            $data['installments'] ?? 1,
            $data['status'] ?? 'confirmed',
            $confirmedAt
        ]);

        $id = (int)$this->db->lastInsertId();

        return [
            'id' => $id,
            'amount_formatted' => $this->formatCurrency((int)$data['amount_cents']),
            'message' => 'Transacao registrada com sucesso.'
        ];
    }

    public function getDreByEvent(?string $eventTag = null, ?string $dateFrom = null, ?string $dateTo = null): array {
        $dateFrom = $dateFrom ?? date('Y-m-d', strtotime('-3 months'));
        $dateTo = $dateTo ?? date('Y-m-d');

        $whereEvent = '';
        $params = [$dateFrom, $dateTo];

        if ($eventTag) {
            $whereEvent = 'AND ft.event_tag = ?';
            $params[] = $eventTag;
        }

        $stmt = $this->db->prepare("
            SELECT
                COALESCE(ft.event_tag, 'sem_tag') as event_tag,
                COALESCE(SUM(CASE WHEN ft.type = 'revenue' AND ft.status = 'confirmed' THEN ft.amount_cents ELSE 0 END), 0) as revenue_cents,
                COALESCE(SUM(CASE WHEN ft.type = 'expense' AND ft.status = 'confirmed' THEN ft.amount_cents ELSE 0 END), 0) as expenses_cents
            FROM financial_transactions ft
            WHERE ft.created_at >= ? AND ft.created_at <= DATE_ADD(?, INTERVAL 1 DAY)
            {$whereEvent}
            GROUP BY ft.event_tag
            ORDER BY revenue_cents DESC
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $dre = [];
        $totalRevenue = 0;
        $totalExpenses = 0;

        foreach ($rows as $row) {
            $rev = (int)$row['revenue_cents'];
            $exp = (int)$row['expenses_cents'];
            $profit = $rev - $exp;
            $margin = $rev > 0 ? round(($profit / $rev) * 100, 1) : 0;

            $status = 'break_even';
            if ($profit > 0) $status = 'profit';
            elseif ($profit < 0) $status = 'loss';

            $dre[] = [
                'event_tag' => $row['event_tag'],
                'event_name' => null,
                'revenue' => [
                    'total_cents' => $rev,
                    'total_formatted' => $this->formatCurrency($rev),
                    'sources' => []
                ],
                'expenses' => [
                    'total_cents' => $exp,
                    'total_formatted' => $this->formatCurrency($exp),
                    'by_category' => []
                ],
                'gross_profit_cents' => $profit,
                'gross_profit_formatted' => $this->formatCurrency($profit),
                'margin_pct' => $margin,
                'status' => $status
            ];

            $totalRevenue += $rev;
            $totalExpenses += $exp;
        }

        $totalProfit = $totalRevenue - $totalExpenses;
        $avgMargin = $totalRevenue > 0 ? round(($totalProfit / $totalRevenue) * 100, 1) : 0;

        return [
            'dre' => $dre,
            'summary' => [
                'total_revenue_cents' => $totalRevenue,
                'total_expenses_cents' => $totalExpenses,
                'total_gross_profit_cents' => $totalProfit,
                'avg_margin_pct' => $avgMargin,
                'events_count' => count($dre)
            ],
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ]
        ];
    }

    public function getExpenseCategories(): array {
        return [
            ['key' => 'marketing', 'label' => 'Marketing & Tráfego', 'icon' => 'Megaphone', 'color' => '#ED7E13'],
            ['key' => 'infraestrutura', 'label' => 'Infraestrutura & Software', 'icon' => 'Server', 'color' => '#0A3E60'],
            ['key' => 'eventos', 'label' => 'Eventos & Congressos', 'icon' => 'Calendar', 'color' => '#8B5CF6'],
            ['key' => 'operacional', 'label' => 'Operacional & Clínica', 'icon' => 'Activity', 'color' => '#10B981'],
            ['key' => 'juridico_contabil', 'label' => 'Jurídico & Contábil', 'icon' => 'ShieldCheck', 'color' => '#3B82F6'],
            ['key' => 'pessoal', 'label' => 'Pró-Labore & Equipe', 'icon' => 'Users', 'color' => '#EC4899'],
            ['key' => 'outros', 'label' => 'Outras Despesas', 'icon' => 'MoreHorizontal', 'color' => '#64748B']
        ];
    }

    public function createExpense(array $data, ?int $adminId = null, ?array $operator = null): array {
        $amountCents = (int)($data['amount_cents'] ?? 0);
        if ($amountCents <= 0) {
            throw new Exception('O valor da despesa deve ser maior que zero.');
        }

        $description = trim($data['description'] ?? '');
        if (empty($description)) {
            throw new Exception('A descrição da despesa é obrigatória.');
        }

        $category = $data['category'] ?? 'outros';
        $expenseDate = $data['expense_date'] ?? date('Y-m-d');
        $paymentMethod = $data['payment_method'] ?? 'pix';
        $supplierName = !empty($data['supplier_name']) ? trim($data['supplier_name']) : null;
        $notes = !empty($data['notes']) ? trim($data['notes']) : null;
        $costCenterId = !empty($data['cost_center_id']) ? (int)$data['cost_center_id'] : null;
        $attachmentId = !empty($data['attachment_id']) ? (int)$data['attachment_id'] : null;

        // Insert into financial_transactions
        $stmt = $this->db->prepare("
            INSERT INTO financial_transactions (
                source_type, source_id, type, amount_cents, description,
                category, cost_center_id, payment_method, status, confirmed_at, created_at
            ) VALUES (
                'manual', NULL, 'expense', ?, ?,
                ?, ?, ?, 'confirmed', NOW(), ?
            )
        ");
        $stmt->execute([
            $amountCents,
            $description . ($supplierName ? " (Favorecido: {$supplierName})" : ''),
            $category,
            $costCenterId,
            $paymentMethod,
            $expenseDate . ' 12:00:00'
        ]);

        $transactionId = (int)$this->db->lastInsertId();

        // Also insert into financial_expenses for cost center reporting
        try {
            $stmtExp = $this->db->prepare("
                INSERT INTO financial_expenses (
                    cost_center_id, description, amount_cents, category, receipt_path, expense_date, created_at
                ) VALUES (?, ?, ?, ?, NULL, ?, NOW())
            ");
            $stmtExp->execute([
                $costCenterId,
                $description,
                $amountCents,
                $category,
                $expenseDate
            ]);
        } catch (\Throwable $e) {
            // Non-blocking if table or cost_center_id has constraint
        }

        // Link attachment if provided
        if ($attachmentId > 0) {
            try {
                $upAttach = $this->db->prepare("
                    UPDATE financial_attachments 
                    SET parent_type = 'transaction', parent_id = ? 
                    WHERE id = ?
                ");
                $upAttach->execute([$transactionId, $attachmentId]);
            } catch (\Throwable $e) {
                // Non-blocking
            }
        }

        // Forensic audit log (REGRA 12)
        $this->logAudit(
            'expense_create',
            $transactionId,
            ['amount_cents' => $amountCents, 'category' => $category, 'description' => $description],
            $operator
        );

        return [
            'id' => $transactionId,
            'description' => $description,
            'category' => $category,
            'amount_cents' => $amountCents,
            'amount_formatted' => $this->formatCurrency($amountCents),
            'expense_date' => $expenseDate,
            'payment_method' => $paymentMethod,
            'supplier_name' => $supplierName,
            'message' => 'Despesa lançada com sucesso!'
        ];
    }

    public function getDreExpanded(?string $dateFrom = null, ?string $dateTo = null): array {
        $dateFrom = $dateFrom ?? date('Y-m-01'); // Início do mês atual por padrão
        $dateTo = $dateTo ?? date('Y-m-d');

        // 1. Total Revenue Confirmed
        $revStmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount_cents), 0) as total_revenue
            FROM financial_transactions
            WHERE type = 'revenue' AND status = 'confirmed'
              AND created_at >= ? AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
        ");
        $revStmt->execute([$dateFrom, $dateTo]);
        $totalRevenueCents = (int)$revStmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];

        // 2. Expenses grouped by Category
        $expStmt = $this->db->prepare("
            SELECT 
                COALESCE(category, 'outros') as category,
                COALESCE(SUM(amount_cents), 0) as total_cents,
                COUNT(*) as count
            FROM financial_transactions
            WHERE type = 'expense' AND status = 'confirmed'
              AND created_at >= ? AND created_at <= DATE_ADD(?, INTERVAL 1 DAY)
            GROUP BY category
            ORDER BY total_cents DESC
        ");
        $expStmt->execute([$dateFrom, $dateTo]);
        $expenseRows = $expStmt->fetchAll(PDO::FETCH_ASSOC);

        $totalExpensesCents = 0;
        $categoriesMap = [];
        foreach ($this->getExpenseCategories() as $c) {
            $categoriesMap[$c['key']] = $c;
        }

        $categoriesBreakdown = [];
        foreach ($expenseRows as $row) {
            $catKey = $row['category'];
            $catCents = (int)$row['total_cents'];
            $totalExpensesCents += $catCents;

            $meta = $categoriesMap[$catKey] ?? ['label' => ucfirst($catKey), 'icon' => 'MoreHorizontal', 'color' => '#64748B'];
            $categoriesBreakdown[] = [
                'key' => $catKey,
                'label' => $meta['label'],
                'icon' => $meta['icon'],
                'color' => $meta['color'],
                'total_cents' => $catCents,
                'total_formatted' => $this->formatCurrency($catCents),
                'count' => (int)$row['count'],
                'pct_of_revenue' => $totalRevenueCents > 0 ? round(($catCents / $totalRevenueCents) * 100, 1) : 0,
                'pct_of_expenses' => 0 // calculated next
            ];
        }

        // Calculate % of total expenses
        foreach ($categoriesBreakdown as &$cat) {
            if ($totalExpensesCents > 0) {
                $cat['pct_of_expenses'] = round(($cat['total_cents'] / $totalExpensesCents) * 100, 1);
            }
        }

        $netProfitCents = $totalRevenueCents - $totalExpensesCents;
        $marginPct = $totalRevenueCents > 0 ? round(($netProfitCents / $totalRevenueCents) * 100, 1) : 0;

        return [
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo,
                'label' => $this->getPeriodLabel($dateFrom, $dateTo)
            ],
            'summary' => [
                'total_revenue_cents' => $totalRevenueCents,
                'total_revenue_formatted' => $this->formatCurrency($totalRevenueCents),
                'total_expenses_cents' => $totalExpensesCents,
                'total_expenses_formatted' => $this->formatCurrency($totalExpensesCents),
                'net_profit_cents' => $netProfitCents,
                'net_profit_formatted' => $this->formatCurrency($netProfitCents),
                'margin_pct' => $marginPct,
                'status' => $netProfitCents >= 0 ? 'profit' : 'loss'
            ],
            'categories' => $categoriesBreakdown
        ];
    }

    private function logAudit(string $action, int $targetId, array $diff, ?array $operator = null): void {
        try {
            $adminId = $operator['id'] ?? 1;
            $adminUsername = $operator['username'] ?? 'admin';
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

            $stmt = $this->db->prepare("
                INSERT INTO financial_audit_log (
                    action, target_type, target_id, admin_id, admin_username,
                    diff_json, ip_address, created_at
                ) VALUES (?, 'expense', ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $action,
                $targetId,
                $adminId,
                $adminUsername,
                json_encode($diff, JSON_UNESCAPED_UNICODE),
                $ipAddress
            ]);
        } catch (\Throwable $e) {
            // Non-blocking audit
        }
    }

    private function getAvgMonthlyFixedCosts(): int {
        $stmt = $this->db->query("
            SELECT COALESCE(SUM(amount_cents), 0) as total
            FROM financial_expenses
            WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        ");
        $threeMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        return $threeMonth > 0 ? (int)round($threeMonth / 3) : 0;
    }

    private function resolveDateFrom(string $period): string {
        $map = [
            '7d' => '-7 days',
            '30d' => '-30 days',
            '90d' => '-90 days',
            '12m' => '-12 months'
        ];
        $expr = $map[$period] ?? '-30 days';
        return date('Y-m-d', strtotime($expr));
    }

    private function getPeriodLabel(string $from, string $to): string {
        $diff = abs(strtotime($to) - strtotime($from));
        $days = (int)round($diff / 86400);
        if ($days <= 7) return 'Ultimos 7 dias';
        if ($days <= 31) return 'Ultimos 30 dias';
        if ($days <= 95) return 'Ultimos 90 dias';
        return 'Ultimos 12 meses';
    }

    private function formatCurrency(int $cents): string {
        return 'R$ ' . number_format($cents / 100, 2, ',', '.');
    }
}
