<?php
// tests/agenda_advanced_smoke_test.php
// Smoke test para recursos avançados: iCal Feed, Checklists, Comentários e Triggers

echo "=================================================================\n";
echo "   SMOKE TEST: ADVANCED AGENDA (ICAL, CHECKLIST, TRIGGERS)      \n";
echo "=================================================================\n\n";

require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaFeedService.php';
require_once __DIR__ . '/../apps/web-app/src/backend/api/v1/Services/AgendaTriggerService.php';

use BodyHarmony\Services\AgendaService;
use BodyHarmony\Services\AgendaFeedService;
use BodyHarmony\Services\AgendaTriggerService;

class MockAdvancedPDOStatement {
    private $pdo;
    private $sql;
    private $params = [];

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

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_checklists') !== false) {
            $id = ++$this->pdo->lastChecklistId;
            $this->pdo->checklists[$id] = [
                'id' => $id,
                'event_id' => $params['event_id'],
                'title' => $params['title'],
                'completed' => $params['completed'] ?? 0,
                'created_at' => date('Y-m-d H:i:s')
            ];
            return true;
        }

        if (stripos($this->sql, 'UPDATE gestor_agenda_checklists SET completed') !== false) {
            $id = (int)$params['id'];
            if (isset($this->pdo->checklists[$id])) {
                $this->pdo->checklists[$id]['completed'] = (int)$params['completed'];
                return true;
            }
            return false;
        }

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_comments') !== false) {
            $id = ++$this->pdo->lastCommentId;
            $this->pdo->comments[$id] = [
                'id' => $id,
                'event_id' => $params['event_id'],
                'admin_id' => $params['admin_id'],
                'comment' => $params['comment'],
                'mentions' => $params['mentions'],
                'admin_name' => 'Gestor Admin',
                'created_at' => date('Y-m-d H:i:s')
            ];
            return true;
        }

        if (stripos($this->sql, 'INSERT INTO gestor_agenda_status_logs') !== false) {
            return true;
        }

        return true;
    }

    public function fetchAll($mode = null) {
        if (stripos($this->sql, 'SELECT c.*') !== false) {
            return array_values($this->pdo->comments);
        }
        if (stripos($this->sql, 'SELECT * FROM gestor_agenda_checklists') !== false) {
            return array_values($this->pdo->checklists);
        }
        if (stripos($this->sql, 'SELECT e.*') !== false) {
            return array_values($this->pdo->events);
        }
        return [];
    }

    public function fetch($mode = null) {
        if (stripos($this->sql, 'SELECT e.*') !== false) {
            $id = (int)($this->params['id'] ?? 1);
            return $this->pdo->events[$id] ?? false;
        }
        return false;
    }

    public function fetchColumn() {
        if (stripos($this->sql, 'SELECT completed FROM gestor_agenda_checklists') !== false) {
            $id = (int)$this->params['id'];
            return $this->pdo->checklists[$id]['completed'] ?? 0;
        }
        if (stripos($this->sql, 'SELECT COUNT(*) FROM gestor_agenda_comments') !== false) {
            return count($this->pdo->comments);
        }
        return 1;
    }
}

class MockAdvancedPDO extends PDO {
    public $events = [];
    public $checklists = [];
    public $comments = [];
    public $lastId = 0;
    public $lastChecklistId = 0;
    public $lastCommentId = 0;

    public function __construct() {}

    #[\ReturnTypeWillChange]
    public function prepare($sql, $options = []) {
        return new MockAdvancedPDOStatement($this, $sql);
    }

    #[\ReturnTypeWillChange]
    public function lastInsertId($name = null) {
        return (string)$this->lastId;
    }
}

try {
    $pdo = new MockAdvancedPDO();
    $agendaService = new AgendaService($pdo);
    $feedService = new AgendaFeedService($pdo);
    $triggerService = new AgendaTriggerService($pdo);

    // TEST 1: Auto Onboarding Trigger
    $eventId = $triggerService->onLicenseeRegistered(101, 'Dra. Patricia Lima', '12345678900');
    if ($eventId > 0) {
        echo "[TEST 1] Onboarding Trigger Auto-Creation: OK (Event ID: {$eventId})\n";
    } else {
        throw new Exception("Onboarding trigger failed");
    }

    // TEST 2: Add Subtasks / Checklist
    $item1 = $agendaService->addChecklist($eventId, 'Verificar documentação enviada');
    $item2 = $agendaService->addChecklist($eventId, 'Enviar acesso ao LMS');
    if ($item1['id'] > 0 && $item2['id'] > 0) {
        echo "[TEST 2.1] Add Subtasks / Checklists: OK\n";
    } else {
        throw new Exception("Add subtask failed");
    }

    $agendaService->toggleChecklist($item1['id']);
    $eventDetails = $agendaService->getEventById($eventId);
    if ($eventDetails['checklists'][0]['completed'] === true) {
        echo "[TEST 2.2] Toggle Subtask Completion: OK\n";
    } else {
        throw new Exception("Toggle subtask failed");
    }

    // TEST 3: Add Internal Comment
    $commentId = $agendaService->addComment($eventId, 1, 'Documentos recebidos com sucesso via WhatsApp.', ['admin']);
    $comments = $agendaService->getComments($eventId);
    if (count($comments) === 1 && $comments[0]['comment'] === 'Documentos recebidos com sucesso via WhatsApp.') {
        echo "[TEST 3] Internal Discussion Comment & Mention: OK\n";
    } else {
        throw new Exception("Comment recording failed");
    }

    // TEST 4: Generate iCal RFC 5545 Feed (.ics)
    $eventsList = $agendaService->listEvents();
    $icalFeed = $feedService->generateIcalFeed($eventsList);
    if (strpos($icalFeed, 'BEGIN:VCALENDAR') !== false && strpos($icalFeed, 'BEGIN:VEVENT') !== false && strpos($icalFeed, 'Onboarding Licenciada') !== false) {
        echo "[TEST 4] iCal RFC 5545 (.ics) Feed Generator: OK\n";
    } else {
        throw new Exception("iCal feed format invalid");
    }

    echo "\n-----------------------------------------------------------------\n";
    echo "  ALL ADVANCED AGENDA SMOKE TESTS PASSED (4/4) — 100% SUCCESS  \n";
    echo "-----------------------------------------------------------------\n";

} catch (Exception $e) {
    echo "\n[FAIL ADVANCED SMOKE TEST] " . $e->getMessage() . "\n";
    exit(1);
}
