<?php
// tests/agenda_smoke_test.php
// Smoke test para validar o AgendaService e transições de status com MockPDO puro

echo "=================================================================\n";
echo "   SMOKE TEST: GESTOR AGENDA SERVICE & CONCURRENCY VALIDATION   \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php';

use BodyHarmony\Services\AgendaService;

// Class MockPDO for standalone CLI execution
class MockPDOStatement {
    private $pdo;
    private $sql;
    private $params = [];
    private $lastQueryResult = [];

    public function __construct($pdo, $sql) {
        $this->pdo = $pdo;
        $this->sql = $sql;
    }

    public function execute($params = []) {
        $this->params = $params;

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_events') !== false) {
            $id = ++$this->pdo->lastId;
            $this->pdo->events[$id] = [
                'id' => $id,
                'event_type' => $params['event_type'],
                'title' => $params['title'],
                'description' => $params['description'],
                'start_datetime' => $params['start_datetime'],
                'end_datetime' => $params['end_datetime'],
                'priority' => $params['priority'],
                'status' => $params['status'],
                'client_id' => $params['client_id'],
                'client_type' => $params['client_type'],
                'created_by_admin_id' => $params['created_by_admin_id'],
                'assigned_to_admin_id' => $params['assigned_to_admin_id'],
                'updated_by_admin_id' => null,
                'color' => $params['color'],
                'metadata' => $params['metadata'],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
                'deleted_at' => null,
                'created_by_name' => 'Gestor Admin',
                'assigned_to_name' => 'Gestor Admin',
                'updated_by_name' => null
            ];
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_status_logs') !== false) {
            $this->pdo->logs[] = $params;
            return true;
        }

        if (stripos($this->sql, 'UPDATE gestor_agenda_events') !== false && stripos($this->sql, 'SET deleted_at') === false) {
            $id = (int)$params['id'];
            if (isset($this->pdo->events[$id])) {
                if (isset($params['status'])) {
                    $this->pdo->events[$id]['status'] = $params['status'];
                }
                $this->pdo->events[$id]['updated_by_admin_id'] = $params['admin_id'] ?? $params['updated_by_admin_id'] ?? null;
                return true;
            }
            return false;
        }

        if (stripos($this->sql, 'UPDATE gestor_agenda_events') !== false && stripos($this->sql, 'SET deleted_at') !== false) {
            $id = (int)$params['id'];
            if (isset($this->pdo->events[$id])) {
                $this->pdo->events[$id]['deleted_at'] = date('Y-m-d H:i:s');
                return true;
            }
            return false;
        }


        return true;

    }

    public function fetchAll($mode = null) {
        if (strpos($this->sql, 'SELECT e.*') !== false) {
            $filtered = [];
            foreach ($this->pdo->events as $event) {
                if ($event['deleted_at'] !== null) continue;
                if (!empty($this->params['event_type']) && $event['event_type'] !== $this->params['event_type']) continue;
                $filtered[] = $event;
            }
            return $filtered;
        }
        return [];
    }

    public function fetch($mode = null) {
        if (strpos($this->sql, 'SELECT e.*') !== false) {
            $id = (int)($this->params['id'] ?? 0);
            return $this->pdo->events[$id] ?? false;
        }
        return false;
    }

    public function fetchColumn() {
        if (strpos($this->sql, "event_type = 'urgencia'") !== false) {
            $count = 0;
            foreach ($this->pdo->events as $event) {
                if ($event['event_type'] === 'urgencia' && $event['deleted_at'] === null && !in_array($event['status'], ['concluido', 'cancelado'])) $count++;
            }
            return $count;
        }
        return 1;
    }
}

class MockAgendaPDO extends PDO {
    public $events = [];
    public $logs = [];
    public $lastId = 0;
    public $inTransaction = false;
    public $transactionCount = 0;

    public function __construct() {}

    #[\ReturnTypeWillChange]
    public function beginTransaction(): bool {
        $this->inTransaction = true;
        $this->transactionCount++;
        return true;
    }

    #[\ReturnTypeWillChange]
    public function commit(): bool {
        $this->inTransaction = false;
        return true;
    }

    #[\ReturnTypeWillChange]
    public function rollBack(): bool {
        $this->inTransaction = false;
        return true;
    }

    #[\ReturnTypeWillChange]
    public function inTransaction(): bool {
        return $this->inTransaction;
    }

    #[\ReturnTypeWillChange]
    public function prepare($sql, $options = []) {
        return new MockPDOStatement($this, $sql);
    }

    #[\ReturnTypeWillChange]
    public function lastInsertId($name = null) {
        return (string)$this->lastId;
    }
}


try {
    $pdo = new MockAgendaPDO();
    $agendaService = new AgendaService($pdo);

    // TEST 1: Create Urgency Event
    $eventId = $agendaService->createEvent([
        'event_type' => 'urgencia',
        'title' => 'Aprovação urgente de documento forense',
        'description' => 'Verificar pendência de contrato da Dra. Amanda',
        'start_datetime' => date('Y-m-d H:i:s'),
        'priority' => 'critica',
        'status' => 'pendente'
    ], 1);

    if ($eventId > 0) {
        echo "[TEST 1] Create Agenda Event (Urgency): OK (ID: {$eventId})\n";
    } else {
        throw new Exception("Failed to create event");
    }

    // TEST 2: List Events & Filter
    $events = $agendaService->listEvents(['event_type' => 'urgencia']);
    if (count($events) === 1 && $events[0]['title'] === 'Aprovação urgente de documento forense') {
        echo "[TEST 2] List Events with Filter (Type=urgencia): OK\n";
    } else {
        throw new Exception("List events failed or mismatch");
    }

    // TEST 3: Update Status Transition (Pendente -> Em Andamento -> Concluído)
    $agendaService->updateStatus($eventId, 'em_andamento', 1);
    $eventUpdated = $agendaService->getEventById($eventId);
    if (!$eventUpdated || $eventUpdated['status'] !== 'em_andamento') {
        throw new Exception("Status update to em_andamento failed");
    }
    echo "[TEST 3.1] Update Status to em_andamento: OK\n";



    $agendaService->updateStatus($eventId, 'concluido', 1);
    $eventDone = $agendaService->getEventById($eventId);
    if ($eventDone['status'] === 'concluido') {
        echo "[TEST 3.2] Update Status to concluido: OK\n";
    } else {
        throw new Exception("Status update to concluido failed");
    }

    // TEST 4: Audit Log Persistence
    if (count($pdo->logs) === 3) { // 1 create + 2 status updates
        echo "[TEST 4] Audit Logs Persistence: OK (Total Logs: " . count($pdo->logs) . ")\n";
    } else {
        throw new Exception("Audit logs count mismatch");
    }

    // TEST 5: Summary Stats
    $stats = $agendaService->getSummaryStats();
    if (isset($stats['total_urgencias_ativas'], $stats['total_pendencias_hoje'], $stats['total_agendamentos_hoje'])) {
        echo "[TEST 5] Summary Statistics Calculation: OK\n";
    } else {
        throw new Exception("Summary stats structure invalid");
    }

    // TEST 6: Soft Delete Event
    $agendaService->deleteEvent($eventId, 1);
    $eventsAfterDelete = $agendaService->listEvents();
    if (count($eventsAfterDelete) === 0) {
        echo "[TEST 6] Soft Delete Event Verification: OK\n";
    } else {
        throw new Exception("Soft delete failed");
    }

    echo "\n-----------------------------------------------------------------\n";
    echo "  ALL AGENDA SERVICE SMOKE TESTS PASSED (6/6) — 100% SUCCESS  \n";
    echo "-----------------------------------------------------------------\n";

} catch (Exception $e) {
    echo "\n[FAIL SMOKE TEST] " . $e->getMessage() . "\n";
    exit(1);
}
