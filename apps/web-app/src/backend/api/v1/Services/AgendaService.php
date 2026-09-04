<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;
use Throwable;

require_once __DIR__ . '/AgendaTriggerService.php';

class AgendaService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
        $this->ensureAgendaTablesExist();
    }

    /**
     * Auto-ensure agenda tables in runtime (ADR-008).
     */
    private function ensureAgendaTablesExist(): void {
        static $checked = false;
        if ($checked) return;
        if (!is_object($this->db)) return;

        try {
            // 1. gestor_agenda_events
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_events` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_type` ENUM('agendamento_cliente', 'pendencia', 'urgencia', 'evento_geral') NOT NULL DEFAULT 'pendencia',
                  `title` VARCHAR(255) NOT NULL,
                  `description` TEXT NULL,
                  `start_datetime` DATETIME NOT NULL,
                  `end_datetime` DATETIME NULL,
                  `priority` ENUM('baixa', 'media', 'alta', 'critica') NOT NULL DEFAULT 'media',
                  `status` ENUM('pendente', 'em_andamento', 'concluido', 'cancelado', 'adiado') NOT NULL DEFAULT 'pendente',
                  `client_id` BIGINT UNSIGNED NULL,
                  `client_type` ENUM('licenciada', 'aluna', 'externo') NULL,
                  `created_by_admin_id` INT UNSIGNED NOT NULL DEFAULT 1,
                  `assigned_to_admin_id` INT UNSIGNED NULL,
                  `updated_by_admin_id` INT UNSIGNED NULL,
                  `color` VARCHAR(20) NULL DEFAULT '#0A3E60',
                  `metadata` JSON NULL,
                  `is_recurring` TINYINT(1) NOT NULL DEFAULT 0,
                  `recurrence_freq` ENUM('diaria', 'semanal', 'mensal', 'anual') NULL,
                  `requires_approval` TINYINT(1) NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
                  INDEX `idx_gestor_agenda_dates` (`start_datetime`, `end_datetime`),
                  INDEX `idx_gestor_agenda_type_status` (`event_type`, `status`),
                  INDEX `idx_gestor_agenda_assigned` (`assigned_to_admin_id`),
                  INDEX `idx_gestor_agenda_deleted` (`deleted_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. gestor_agenda_status_logs
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_status_logs` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_id` BIGINT UNSIGNED NOT NULL,
                  `previous_status` VARCHAR(50) NULL,
                  `new_status` VARCHAR(50) NOT NULL,
                  `changed_by_admin_id` INT UNSIGNED NOT NULL DEFAULT 1,
                  `notes` TEXT NULL,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_status_logs_event` (`event_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. gestor_agenda_checklists
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_checklists` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_id` BIGINT UNSIGNED NOT NULL,
                  `title` VARCHAR(255) NOT NULL,
                  `completed` TINYINT(1) NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_checklist_event` (`event_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 4. gestor_agenda_comments
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_comments` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_id` BIGINT UNSIGNED NOT NULL,
                  `admin_id` INT UNSIGNED NOT NULL DEFAULT 1,
                  `comment` TEXT NOT NULL,
                  `mentions` JSON NULL,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_comment_event` (`event_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 5. gestor_agenda_attachments
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `gestor_agenda_attachments` (
                  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                  `event_id` BIGINT UNSIGNED NOT NULL,
                  `filename` VARCHAR(255) NOT NULL,
                  `original_name` VARCHAR(255) NOT NULL,
                  `file_size` INT UNSIGNED NOT NULL,
                  `uploaded_by_admin_id` INT UNSIGNED NOT NULL DEFAULT 1,
                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_attachment_event` (`event_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            $checked = true;
        } catch (Throwable $e) {
            error_log("Error in ensureAgendaTablesExist: " . $e->getMessage());
        }
    }

    /**
     * Lists agenda events matching optional filters.
     */
    public function listEvents(array $filters = [], ?int $currentAdminId = null): array {
        $sql = "SELECT e.*, 
                       u_created.username AS created_by_name,
                       u_assigned.username AS assigned_to_name,
                       u_updated.username AS updated_by_name
                FROM gestor_agenda_events e
                LEFT JOIN admin_users u_created ON e.created_by_admin_id = u_created.id
                LEFT JOIN admin_users u_assigned ON e.assigned_to_admin_id = u_assigned.id
                LEFT JOIN admin_users u_updated ON e.updated_by_admin_id = u_updated.id
                WHERE e.deleted_at IS NULL";

        $params = [];

        if (!empty($filters['start_date'])) {
            $sql .= " AND e.start_datetime >= :start_date";
            $params['start_date'] = $filters['start_date'] . ' 00:00:00';
        }

        if (!empty($filters['end_date'])) {
            $sql .= " AND e.start_datetime <= :end_date";
            $params['end_date'] = $filters['end_date'] . ' 23:59:59';
        }

        if (!empty($filters['event_type'])) {
            $sql .= " AND e.event_type = :event_type";
            $params['event_type'] = $filters['event_type'];
        }

        if (!empty($filters['priority'])) {
            $sql .= " AND e.priority = :priority";
            $params['priority'] = $filters['priority'];
        }

        if (!empty($filters['status'])) {
            $sql .= " AND e.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['assigned_to'])) {
            $sql .= " AND e.assigned_to_admin_id = :assigned_to";
            $params['assigned_to'] = (int)$filters['assigned_to'];
        }

        // Scope filter: mine, user, department, team
        $scope = $filters['scope'] ?? 'all';
        if ($scope === 'mine' && $currentAdminId) {
            $sql .= " AND (
                e.created_by_admin_id = :cur_user_1 
                OR e.assigned_to_admin_id = :cur_user_2 
                OR e.id IN (SELECT event_id FROM gestor_agenda_event_participants WHERE admin_id = :cur_user_3)
            )";
            $params['cur_user_1'] = $currentAdminId;
            $params['cur_user_2'] = $currentAdminId;
            $params['cur_user_3'] = $currentAdminId;
        } elseif ($scope === 'user' && !empty($filters['user_id'])) {
            $targetUid = (int)$filters['user_id'];
            $sql .= " AND (
                e.created_by_admin_id = :tgt_user_1 
                OR e.assigned_to_admin_id = :tgt_user_2 
                OR e.id IN (SELECT event_id FROM gestor_agenda_event_participants WHERE admin_id = :tgt_user_3)
            )";
            $params['tgt_user_1'] = $targetUid;
            $params['tgt_user_2'] = $targetUid;
            $params['tgt_user_3'] = $targetUid;
        } elseif ($scope === 'department' && !empty($filters['department_id'])) {
            $sql .= " AND (
                e.department_id = :dept_id 
                OR e.created_by_admin_id IN (SELECT id FROM admin_users WHERE department_id = :dept_id_2)
            )";
            $params['dept_id'] = (int)$filters['department_id'];
            $params['dept_id_2'] = (int)$filters['department_id'];
        }

        $sql .= " ORDER BY e.start_datetime ASC, e.priority DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($events as &$event) {
            $event['id'] = (int)($event['id'] ?? 0);
            $event['created_by_admin_id'] = (int)($event['created_by_admin_id'] ?? 0);
            $event['assigned_to_admin_id'] = !empty($event['assigned_to_admin_id']) ? (int)$event['assigned_to_admin_id'] : null;
            $event['updated_by_admin_id'] = !empty($event['updated_by_admin_id']) ? (int)$event['updated_by_admin_id'] : null;
            $event['client_id'] = !empty($event['client_id']) ? (int)$event['client_id'] : null;
            $event['is_private'] = (bool)($event['is_private'] ?? 0);
            $event['metadata'] = !empty($event['metadata']) ? json_decode($event['metadata'], true) : null;
            
            // Attach Checklists Summary
            $event['checklists'] = $this->getChecklists($event['id']);
            $totalItems = count($event['checklists']);
            $completedItems = count(array_filter($event['checklists'], fn($c) => (bool)($c['completed'] ?? $c['is_completed'] ?? false)));
            $event['checklist_total'] = $totalItems;
            $event['checklist_completed'] = $completedItems;
            $event['checklist_progress'] = $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;
            
            // Attach Comments Count
            $event['comments_count'] = $this->getCommentsCount($event['id']);

            // Attach Participants
            $event['participants'] = $this->getEventParticipants($event['id']);

            // Permission Calculation
            $event['can_user_edit'] = true;
            if ($currentAdminId) {
                $isCreator = ($event['created_by_admin_id'] === $currentAdminId);
                $isAssigned = ($event['assigned_to_admin_id'] === $currentAdminId);
                $isParticipant = false;
                foreach ($event['participants'] as $p) {
                    if ((int)$p['admin_id'] === $currentAdminId && $p['role_type'] === 'co_responsible') {
                        $isParticipant = true;
                        break;
                    }
                }
                $event['can_user_edit'] = ($isCreator || $isAssigned || $isParticipant);
            }
        }

        return $events;
    }

    /**
     * Retrieves a single event by ID.
     */
    public function getEventById(int $id): ?array {
        $sql = "SELECT e.*, 
                       u_created.username AS created_by_name,
                       u_assigned.username AS assigned_to_name,
                       u_updated.username AS updated_by_name
                FROM gestor_agenda_events e
                LEFT JOIN admin_users u_created ON e.created_by_admin_id = u_created.id
                LEFT JOIN admin_users u_assigned ON e.assigned_to_admin_id = u_assigned.id
                LEFT JOIN admin_users u_updated ON e.updated_by_admin_id = u_updated.id
                WHERE e.id = :id AND e.deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$event) return null;

        $event['id'] = (int)$event['id'];
        $event['created_by_admin_id'] = (int)$event['created_by_admin_id'];
        $event['assigned_to_admin_id'] = $event['assigned_to_admin_id'] ? (int)$event['assigned_to_admin_id'] : null;
        $event['updated_by_admin_id'] = $event['updated_by_admin_id'] ? (int)$event['updated_by_admin_id'] : null;
        $event['client_id'] = $event['client_id'] ? (int)$event['client_id'] : null;
        $event['metadata'] = !empty($event['metadata']) ? json_decode($event['metadata'], true) : null;
        $event['checklists'] = $this->getChecklists($id);
        $event['comments'] = $this->getComments($id);
        $event['attachments'] = $this->getAttachments($id);

        return $event;
    }

    /**
     * Creates a new agenda event.
     */
    public function createEvent(array $data, int $adminId): int {
        $isTransactionStarted = false;
        try {
            if (!$this->db->inTransaction()) {
                $isTransactionStarted = $this->db->beginTransaction();
            }
        } catch (\Throwable $e) {
            $isTransactionStarted = false;
        }

        try {
            $sql = "INSERT INTO gestor_agenda_events (
                        event_type, title, description, start_datetime, end_datetime,
                        priority, status, client_id, client_type, created_by_admin_id,
                        assigned_to_admin_id, color, metadata, is_recurring, recurrence_freq, requires_approval
                    ) VALUES (
                        :event_type, :title, :description, :start_datetime, :end_datetime,
                        :priority, :status, :client_id, :client_type, :created_by_admin_id,
                        :assigned_to_admin_id, :color, :metadata, :is_recurring, :recurrence_freq, :requires_approval
                    )";

            $startDatetime = !empty($data['start_datetime']) ? str_replace('T', ' ', $data['start_datetime']) : date('Y-m-d H:i:s');
            if (strlen($startDatetime) === 16) $startDatetime .= ':00';

            $endDatetime = !empty($data['end_datetime']) ? str_replace('T', ' ', $data['end_datetime']) : null;
            if ($endDatetime && strlen($endDatetime) === 16) $endDatetime .= ':00';

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'event_type' => $data['event_type'] ?? 'pendencia',
                'title' => trim($data['title']),
                'description' => $data['description'] ?? null,
                'start_datetime' => $startDatetime,
                'end_datetime' => $endDatetime,
                'priority' => $data['priority'] ?? 'media',
                'status' => $data['status'] ?? 'pendente',
                'client_id' => $data['client_id'] ?? null,
                'client_type' => $data['client_type'] ?? null,
                'created_by_admin_id' => $adminId,
                'assigned_to_admin_id' => $data['assigned_to_admin_id'] ?? null,
                'color' => $data['color'] ?? '#0A3E60',
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null,
                'is_recurring' => !empty($data['is_recurring']) ? 1 : 0,
                'recurrence_freq' => $data['recurrence_freq'] ?? null,
                'requires_approval' => !empty($data['requires_approval']) ? 1 : 0
            ]);

            $eventId = (int)$this->db->lastInsertId();

            $this->logStatusChange($eventId, null, $data['status'] ?? 'pendente', $adminId, 'Evento criado');

            if ($isTransactionStarted) {
                $this->db->commit();
            }
        } catch (\Throwable $e) {
            if ($isTransactionStarted) {
                try {
                    if ($this->db->inTransaction()) {
                        $this->db->rollBack();
                    }
                } catch (\Throwable $t) {
                    // Ignore rollback failures gracefully on uninitialized mocks
                }
            }
            throw $e;
        }

        // Trigger Telegram alert if priority is critical
        if (($data['priority'] ?? '') === 'critica') {
            try {
                $triggerService = new AgendaTriggerService($this->db, $this);
                $triggerService->notifyTelegramUrgency($data['title'], $data['description'] ?? '');
            } catch (\Throwable $e) {
                // Ignore telegram failures gracefully
            }
        }

        return $eventId;
    }

    /**
     * Updates an existing agenda event.
     */
    public function updateEvent(int $id, array $data, int $adminId): bool {
        $existing = $this->getEventById($id);
        if (!$existing) return false;

        $previousStatus = $existing['status'];
        $newStatus = $data['status'] ?? $existing['status'];

        $isTransactionStarted = false;
        try {
            if (!$this->db->inTransaction()) {
                $isTransactionStarted = $this->db->beginTransaction();
            }
        } catch (\Throwable $e) {
            $isTransactionStarted = false;
        }

        try {
            $sql = "UPDATE gestor_agenda_events SET
                        event_type = :event_type,
                        title = :title,
                        description = :description,
                        start_datetime = :start_datetime,
                        end_datetime = :end_datetime,
                        priority = :priority,
                        status = :status,
                        client_id = :client_id,
                        client_type = :client_type,
                        assigned_to_admin_id = :assigned_to_admin_id,
                        updated_by_admin_id = :updated_by_admin_id,
                        color = :color,
                        metadata = :metadata,
                        is_recurring = :is_recurring,
                        recurrence_freq = :recurrence_freq,
                        requires_approval = :requires_approval
                    WHERE id = :id AND deleted_at IS NULL";

            $startDatetime = !empty($data['start_datetime']) ? str_replace('T', ' ', $data['start_datetime']) : $existing['start_datetime'];
            if ($startDatetime && strlen($startDatetime) === 16) $startDatetime .= ':00';

            $endDatetime = array_key_exists('end_datetime', $data)
                ? (!empty($data['end_datetime']) ? str_replace('T', ' ', $data['end_datetime']) : null)
                : $existing['end_datetime'];
            if ($endDatetime && strlen($endDatetime) === 16) $endDatetime .= ':00';

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'id' => $id,
                'event_type' => $data['event_type'] ?? $existing['event_type'],
                'title' => trim($data['title'] ?? $existing['title']),
                'description' => $data['description'] ?? $existing['description'],
                'start_datetime' => $startDatetime,
                'end_datetime' => $endDatetime,
                'priority' => $data['priority'] ?? $existing['priority'],
                'status' => $newStatus,
                'client_id' => $data['client_id'] ?? $existing['client_id'],
                'client_type' => $data['client_type'] ?? $existing['client_type'],
                'assigned_to_admin_id' => $data['assigned_to_admin_id'] ?? $existing['assigned_to_admin_id'],
                'updated_by_admin_id' => $adminId,
                'color' => $data['color'] ?? $existing['color'],
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : (is_array($existing['metadata']) ? json_encode($existing['metadata']) : null),
                'is_recurring' => isset($data['is_recurring']) ? ($data['is_recurring'] ? 1 : 0) : ($existing['is_recurring'] ? 1 : 0),
                'recurrence_freq' => $data['recurrence_freq'] ?? $existing['recurrence_freq'],
                'requires_approval' => isset($data['requires_approval']) ? ($data['requires_approval'] ? 1 : 0) : ($existing['requires_approval'] ? 1 : 0)
            ]);

            if ($previousStatus !== $newStatus) {
                $this->logStatusChange($id, $previousStatus, $newStatus, $adminId, 'Status atualizado via edição de evento');
            }

            if ($isTransactionStarted) {
                $this->db->commit();
            }

            return $result;
        } catch (\Throwable $e) {
            if ($isTransactionStarted) {
                try {
                    if ($this->db->inTransaction()) {
                        $this->db->rollBack();
                    }
                } catch (\Throwable $t) {
                    // Ignore rollback failures gracefully on uninitialized mocks
                }
            }
            throw $e;
        }
    }

    /**
     * Updates only the status of an event.
     */
    public function updateStatus(int $id, string $newStatus, int $adminId): bool {
        $existing = $this->getEventById($id);
        if (!$existing) return false;

        if ($existing['status'] === $newStatus) return true;

        $isTransactionStarted = false;
        try {
            if (!$this->db->inTransaction()) {
                $isTransactionStarted = $this->db->beginTransaction();
            }
        } catch (\Throwable $e) {
            $isTransactionStarted = false;
        }

        try {
            $sql = "UPDATE gestor_agenda_events 
                    SET status = :status, updated_by_admin_id = :admin_id 
                    WHERE id = :id AND deleted_at IS NULL";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'id' => $id,
                'status' => $newStatus,
                'admin_id' => $adminId
            ]);

            if ($result) {
                $this->logStatusChange($id, $existing['status'], $newStatus, $adminId, 'Status alterado via ação rápida');
            }

            if ($isTransactionStarted) {
                $this->db->commit();
            }

            return $result;
        } catch (\Throwable $e) {
            if ($isTransactionStarted) {
                try {
                    if ($this->db->inTransaction()) {
                        $this->db->rollBack();
                    }
                } catch (\Throwable $t) {
                    // Ignore rollback failures gracefully on uninitialized mocks
                }
            }
            throw $e;
        }
    }

    /**
     * Soft deletes an agenda event.
     */
    public function deleteEvent(int $id, int $adminId): bool {
        $sql = "UPDATE gestor_agenda_events 
                SET deleted_at = NOW(), updated_by_admin_id = :admin_id 
                WHERE id = :id AND deleted_at IS NULL";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'admin_id' => $adminId
        ]);
    }

    /**
     * Gets summary statistics for dashboard badges.
     */
    public function getSummaryStats(): array {
        $today = date('Y-m-d');

        $stmtUrgencies = $this->db->prepare("SELECT COUNT(*) FROM gestor_agenda_events WHERE event_type = 'urgencia' AND status NOT IN ('concluido', 'cancelado') AND deleted_at IS NULL");
        $stmtUrgencies->execute();
        $totalUrgencias = (int)$stmtUrgencies->fetchColumn();

        $stmtPendenciasHoje = $this->db->prepare("SELECT COUNT(*) FROM gestor_agenda_events WHERE event_type = 'pendencia' AND DATE(start_datetime) = :today AND status NOT IN ('concluido', 'cancelado') AND deleted_at IS NULL");
        $stmtPendenciasHoje->execute(['today' => $today]);
        $totalPendenciasHoje = (int)$stmtPendenciasHoje->fetchColumn();

        $stmtAgendamentosHoje = $this->db->prepare("SELECT COUNT(*) FROM gestor_agenda_events WHERE event_type = 'agendamento_cliente' AND DATE(start_datetime) = :today AND status NOT IN ('cancelado') AND deleted_at IS NULL");
        $stmtAgendamentosHoje->execute(['today' => $today]);
        $totalAgendamentosHoje = (int)$stmtAgendamentosHoje->fetchColumn();

        $stmtPendentes = $this->db->prepare("SELECT COUNT(*) FROM gestor_agenda_events WHERE status = 'pendente' AND deleted_at IS NULL");
        $stmtPendentes->execute();
        $totalPendentes = (int)$stmtPendentes->fetchColumn();

        return [
            'total_urgencias_ativas' => $totalUrgencias,
            'total_pendencias_hoje' => $totalPendenciasHoje,
            'total_agendamentos_hoje' => $totalAgendamentosHoje,
            'total_pendentes' => $totalPendentes
        ];
    }

    // === CHECKLIST / SUBTASKS METHODS ===
    public function getChecklists(int $eventId): array {
        $stmt = $this->db->prepare("SELECT * FROM gestor_agenda_checklists WHERE event_id = :event_id ORDER BY id ASC");
        $stmt->execute(['event_id' => $eventId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['event_id'] = (int)$item['event_id'];
            $item['completed'] = (bool)$item['completed'];
        }
        return $items;
    }

    public function addChecklist(int $eventId, string $title): array {
        $stmt = $this->db->prepare("INSERT INTO gestor_agenda_checklists (event_id, title, completed) VALUES (:event_id, :title, 0)");
        $stmt->execute(['event_id' => $eventId, 'title' => trim($title)]);
        $id = (int)$this->db->lastInsertId();

        return [
            'id' => $id,
            'event_id' => $eventId,
            'title' => trim($title),
            'completed' => false
        ];
    }

    public function toggleChecklist(int $checklistId): bool {
        $stmt = $this->db->prepare("UPDATE gestor_agenda_checklists SET completed = 1 - completed WHERE id = :id");
        return $stmt->execute(['id' => $checklistId, 'completed' => 1]);
    }

    // === COMMENTS & DISCUSSIONS METHODS ===
    public function getComments(int $eventId): array {
        $sql = "SELECT c.*, u.username AS admin_name 
                FROM gestor_agenda_comments c 
                LEFT JOIN admin_users u ON c.admin_id = u.id 
                WHERE c.event_id = :event_id 
                ORDER BY c.created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['event_id' => $eventId]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($comments as &$c) {
            $c['id'] = (int)$c['id'];
            $c['event_id'] = (int)$c['event_id'];
            $c['admin_id'] = (int)$c['admin_id'];
            $c['mentions'] = !empty($c['mentions']) ? json_decode($c['mentions'], true) : [];
        }
        return $comments;
    }

    public function getCommentsCount(int $eventId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM gestor_agenda_comments WHERE event_id = :event_id");
        $stmt->execute(['event_id' => $eventId]);
        return (int)$stmt->fetchColumn();
    }

    public function addComment(int $eventId, int $adminId, string $comment, array $mentions = []): int {
        $stmt = $this->db->prepare("INSERT INTO gestor_agenda_comments (event_id, admin_id, comment, mentions) VALUES (:event_id, :admin_id, :comment, :mentions)");
        $stmt->execute([
            'event_id' => $eventId,
            'admin_id' => $adminId,
            'comment' => trim($comment),
            'mentions' => !empty($mentions) ? json_encode($mentions) : null
        ]);
        return (int)$this->db->lastInsertId();
    }

    // === ATTACHMENTS METHODS ===
    public function getAttachments(int $eventId): array {
        $stmt = $this->db->prepare("SELECT * FROM gestor_agenda_attachments WHERE event_id = :event_id ORDER BY created_at DESC");
        $stmt->execute(['event_id' => $eventId]);
        $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($attachments as &$att) {
            $att['id'] = (int)$att['id'];
            $att['event_id'] = (int)$att['event_id'];
            $att['file_size'] = (int)$att['file_size'];
            $att['uploaded_by_admin_id'] = (int)$att['uploaded_by_admin_id'];
        }
        return $attachments;
    }

    public function addAttachment(int $eventId, string $filename, string $originalName, int $fileSize, int $adminId): int {
        $stmt = $this->db->prepare("INSERT INTO gestor_agenda_attachments (event_id, filename, original_name, file_size, uploaded_by_admin_id) VALUES (:event_id, :filename, :original_name, :file_size, :admin_id)");
        $stmt->execute([
            'event_id' => $eventId,
            'filename' => $filename,
            'original_name' => $originalName,
            'file_size' => $fileSize,
            'admin_id' => $adminId
        ]);
        return (int)$this->db->lastInsertId();
    }

    private function logStatusChange(int $eventId, ?string $prevStatus, string $newStatus, int $adminId, ?string $notes = null): void {
        $sql = "INSERT INTO gestor_agenda_status_logs (event_id, previous_status, new_status, changed_by_admin_id, notes)
                VALUES (:event_id, :prev_status, :new_status, :admin_id, :notes)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'event_id' => $eventId,
            'prev_status' => $prevStatus,
            'new_status' => $newStatus,
            'admin_id' => $adminId,
            'notes' => $notes
        ]);
    }

    // =========================================================================
    // MULTI-USER PARTICIPANTS & SHARING EXTENSION (PLAN-076)
    // =========================================================================

    /**
     * Gets all participants attached to an event
     */
    public function getEventParticipants(int $eventId): array {
        try {
            $sql = "
                SELECT p.*, u.username
                FROM gestor_agenda_event_participants p
                JOIN admin_users u ON p.admin_id = u.id
                WHERE p.event_id = ?
                ORDER BY p.role_type ASC, p.id ASC
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$eventId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$r) {
                $r['id'] = (int)$r['id'];
                $r['event_id'] = (int)$r['event_id'];
                $r['admin_id'] = (int)$r['admin_id'];
            }
            return $rows;
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * Adds participant to event
     */
    public function addEventParticipant(int $eventId, int $adminId, string $roleType = 'co_responsible'): bool {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO gestor_agenda_event_participants (event_id, admin_id, role_type, status)
                VALUES (?, ?, ?, 'accepted')
                ON DUPLICATE KEY UPDATE role_type = VALUES(role_type), status = 'accepted'
            ");
            return $stmt->execute([$eventId, $adminId, $roleType]);
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * Removes participant from event
     */
    public function removeEventParticipant(int $eventId, int $adminId): bool {
        try {
            $stmt = $this->db->prepare("DELETE FROM gestor_agenda_event_participants WHERE event_id = ? AND admin_id = ?");
            return $stmt->execute([$eventId, $adminId]);
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * Shares whole calendar view with another admin
     */
    public function shareAgenda(int $ownerAdminId, int $sharedWithAdminId, string $permissionLevel = 'read_only'): bool {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO gestor_agenda_shares (owner_admin_id, shared_with_admin_id, permission_level)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level)
            ");
            return $stmt->execute([$ownerAdminId, $sharedWithAdminId, $permissionLevel]);
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * Revokes calendar share
     */
    public function revokeAgendaShare(int $ownerAdminId, int $sharedWithAdminId): bool {
        try {
            $stmt = $this->db->prepare("DELETE FROM gestor_agenda_shares WHERE owner_admin_id = ? AND shared_with_admin_id = ?");
            return $stmt->execute([$ownerAdminId, $sharedWithAdminId]);
        } catch (Throwable $e) {
            return false;
        }
    }

    /**
     * Lists active calendar shares for an admin
     */
    public function listAgendaShares(int $adminId): array {
        try {
            $sql = "
                SELECT s.*, 
                       u_owner.username AS owner_username,
                       u_shared.username AS shared_with_username
                FROM gestor_agenda_shares s
                JOIN admin_users u_owner ON s.owner_admin_id = u_owner.id
                JOIN admin_users u_shared ON s.shared_with_admin_id = u_shared.id
                WHERE s.owner_admin_id = ? OR s.shared_with_admin_id = ?
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$adminId, $adminId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (Throwable $e) {
            return [];
        }
    }
}
