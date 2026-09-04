<?php
namespace BodyHarmony\Services;

use PDO;
use Exception;

class CashCloseService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getDailyClose(string $date): array {
        $existing = $this->getExistingClose($date);
        if ($existing) {
            return $existing;
        }

        $events = $this->getDayEvents($date);
        $summary = $this->calculateSummary($events);
        $alerts = $this->generateAlerts($events);

        return [
            'close_date' => $date,
            'status' => 'pending',
            'summary' => $summary,
            'events' => $events,
            'alerts' => $alerts,
            'closed_by' => null,
            'closed_at' => null
        ];
    }

    public function performDailyClose(string $date, int $adminId): array {
        $existing = $this->getExistingClose($date);
        if ($existing && $existing['status'] === 'closed') {
            throw new Exception("Fechamento do dia {$date} ja foi realizado.");
        }

        $events = $this->getDayEvents($date);
        $summary = $this->calculateSummary($events);
        $alerts = $this->generateAlerts($events);

        $stmt = $this->db->prepare("
            INSERT INTO financial_daily_closes
                (close_date, total_revenue_cents, total_expenses_cents, net_result_cents, alerts, status, closed_by_admin_id, closed_at)
            VALUES (?, ?, ?, ?, ?, 'closed', ?, NOW())
            ON DUPLICATE KEY UPDATE
                total_revenue_cents = VALUES(total_revenue_cents),
                total_expenses_cents = VALUES(total_expenses_cents),
                net_result_cents = VALUES(net_result_cents),
                alerts = VALUES(alerts),
                status = 'closed',
                closed_by_admin_id = VALUES(closed_by_admin_id),
                closed_at = NOW()
        ");
        $stmt->execute([
            $date,
            $summary['total_revenue_cents'],
            $summary['total_expenses_cents'],
            $summary['net_result_cents'],
            json_encode($alerts),
            $adminId
        ]);

        $closeId = (int)$this->db->lastInsertId();

        return [
            'message' => "Fechamento do dia {$date} realizado com sucesso.",
            'close_id' => $closeId,
            'alerts_count' => count($alerts)
        ];
    }

    private function getExistingClose(string $date): ?array {
        $stmt = $this->db->prepare("
            SELECT close_date, total_revenue_cents, total_expenses_cents, net_result_cents,
                   alerts, status, closed_by_admin_id, closed_at
            FROM financial_daily_closes
            WHERE close_date = ?
        ");
        $stmt->execute([$date]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return null;

        return [
            'close_date' => $row['close_date'],
            'status' => $row['status'],
            'summary' => [
                'total_revenue_cents' => (int)$row['total_revenue_cents'],
                'total_expenses_cents' => (int)$row['total_expenses_cents'],
                'net_result_cents' => (int)$row['net_result_cents'],
                'total_revenue_formatted' => $this->formatCurrency((int)$row['total_revenue_cents']),
                'total_expenses_formatted' => $this->formatCurrency((int)$row['total_expenses_cents']),
                'net_result_formatted' => $this->formatCurrency((int)$row['net_result_cents'])
            ],
            'events' => [],
            'alerts' => json_decode($row['alerts'] ?? '[]', true) ?: [],
            'closed_by' => $row['closed_by_admin_id'] ? (string)$row['closed_by_admin_id'] : null,
            'closed_at' => $row['closed_at']
        ];
    }

    private function getDayEvents(string $date): array {
        $events = [];

        $stmt = $this->db->prepare("
            SELECT id, 'shop_sale' as event_type,
                   CONCAT('Venda: ', customer_name, ' - ', payment_method) as description,
                   amount_cents, payment_status
            FROM shop_orders
            WHERE DATE(created_at) = ?
        ");
        $stmt->execute([$date]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $hasFinancial = $this->hasFinancialRecord('shop_order', (int)$row['id']);
            $events[] = [
                'event_type' => $row['event_type'],
                'description' => $row['description'],
                'amount_cents' => (int)$row['amount_cents'],
                'has_financial_record' => $hasFinancial,
                'financial_transaction_id' => $hasFinancial ? $this->getFinancialTransactionId('shop_order', (int)$row['id']) : null
            ];
        }

        $stmt2 = $this->db->prepare("
            SELECT id, 'onboarding_payment' as event_type,
                   CONCAT('Onboarding: ', customer_name) as description,
                   taxa_inicial_num as amount_str
            FROM licenciada_onboarding_requests
            WHERE DATE(payment_confirmed_at) = ?
        ");
        $stmt2->execute([$date]);
        foreach ($stmt2->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $hasFinancial = $this->hasFinancialRecord('onboarding', (int)$row['id']);
            $amountCents = $this->parseBrazilianCurrency($row['amount_str'] ?? '0');
            $events[] = [
                'event_type' => $row['event_type'],
                'description' => $row['description'],
                'amount_cents' => $amountCents,
                'has_financial_record' => $hasFinancial,
                'financial_transaction_id' => $hasFinancial ? $this->getFinancialTransactionId('onboarding', (int)$row['id']) : null
            ];
        }

        $stmt3 = $this->db->prepare("
            SELECT id, 'expense' as event_type,
                   description, amount_cents
            FROM financial_expenses
            WHERE expense_date = ?
        ");
        $stmt3->execute([$date]);
        foreach ($stmt3->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $events[] = [
                'event_type' => $row['event_type'],
                'description' => $row['description'],
                'amount_cents' => (int)$row['amount_cents'],
                'has_financial_record' => true,
                'financial_transaction_id' => null
            ];
        }

        return $events;
    }

    private function hasFinancialRecord(string $sourceType, int $sourceId): bool {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt
            FROM financial_transactions
            WHERE source_type = ? AND source_id = ? AND status = 'confirmed'
        ");
        $stmt->execute([$sourceType, $sourceId]);
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['cnt'] > 0;
    }

    private function getFinancialTransactionId(string $sourceType, int $sourceId): ?int {
        $stmt = $this->db->prepare("
            SELECT id FROM financial_transactions
            WHERE source_type = ? AND source_id = ? AND status = 'confirmed'
            LIMIT 1
        ");
        $stmt->execute([$sourceType, $sourceId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['id'] : null;
    }

    private function calculateSummary(array $events): array {
        $revenue = 0;
        $expenses = 0;

        foreach ($events as $event) {
            if ($event['event_type'] === 'expense') {
                $expenses += $event['amount_cents'];
            } else {
                $revenue += $event['amount_cents'];
            }
        }

        return [
            'total_revenue_cents' => $revenue,
            'total_expenses_cents' => $expenses,
            'net_result_cents' => $revenue - $expenses,
            'total_revenue_formatted' => $this->formatCurrency($revenue),
            'total_expenses_formatted' => $this->formatCurrency($expenses),
            'net_result_formatted' => $this->formatCurrency($revenue - $expenses)
        ];
    }

    private function generateAlerts(array $events): array {
        $alerts = [];

        foreach ($events as $event) {
            if ($event['event_type'] !== 'expense' && !$event['has_financial_record']) {
                $alerts[] = [
                    'severity' => 'critical',
                    'message' => "{$event['description']} — servico registrado sem baixa financeira.",
                    'event_type' => $event['event_type'],
                    'event_id' => null
                ];
            }
        }

        return $alerts;
    }

    private function parseBrazilianCurrency(string $value): int {
        $clean = preg_replace('/[^\d,]/', '', $value);
        $clean = str_replace(',', '.', $clean);
        return (int)round((float)$clean * 100);
    }

    private function formatCurrency(int $cents): string {
        return 'R$ ' . number_format($cents / 100, 2, ',', '.');
    }
}
