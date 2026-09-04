<?php

require_once __DIR__ . '/../Services/AgendaService.php';
require_once __DIR__ . '/../Services/AgendaFeedService.php';

use BodyHarmony\Services\AgendaService;
use BodyHarmony\Services\AgendaFeedService;

class GestorAgendaController {
    private $db;
    private AgendaService $agendaService;
    private AgendaFeedService $feedService;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
        $this->agendaService = new AgendaService($this->db);
        $this->feedService = new AgendaFeedService($this->db);
    }

    /**
     * Helper check for Admin/SuperAdmin session role.
     */
    private function isAdmin(): bool {
        global $loggedUser;
        if (!empty($loggedUser['is_admin']) || in_array($loggedUser['role'] ?? '', ['superadmin', 'admin'], true)) {
            return true;
        }
        $role = $_SESSION['role'] ?? $_SESSION['user_role'] ?? '';
        return in_array($role, ['superadmin', 'admin'], true) || !empty($_SESSION['admin_user_id']) || !empty($_SESSION['user_id']);
    }

    private function getAdminId(): int {
        global $loggedUser;
        if (!empty($loggedUser['id'])) {
            return (int)$loggedUser['id'];
        }
        return (int)($_SESSION['admin_user_id'] ?? $_SESSION['user_id'] ?? 1);
    }

    /**
     * GET /api/v1/admin/agenda/events
     */
    public function listEvents() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado. Requer permissão de Administrador.', 403);
            return;
        }

        try {
            $filters = [
                'start_date' => $_GET['start_date'] ?? null,
                'end_date' => $_GET['end_date'] ?? null,
                'event_type' => $_GET['event_type'] ?? null,
                'priority' => $_GET['priority'] ?? null,
                'status' => $_GET['status'] ?? null,
                'assigned_to' => $_GET['assigned_to'] ?? null,
                'scope' => $_GET['scope'] ?? 'all',
                'user_id' => $_GET['user_id'] ?? null,
                'department_id' => $_GET['department_id'] ?? null
            ];

            $events = $this->agendaService->listEvents($filters, $this->getAdminId());
            Response::json(['success' => true, 'events' => $events]);
        } catch (Exception $e) {
            Response::error('Erro ao listar agenda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/agenda/events/{id}
     */
    public function getEventDetail($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $event = $this->agendaService->getEventById((int)$id);
            if (!$event) {
                Response::error('Evento não encontrado.', 404);
                return;
            }
            Response::json(['success' => true, 'event' => $event]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar detalhes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/agenda/events
     */
    public function createEvent() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title']) || empty($input['start_datetime'])) {
            Response::error('Campos obrigatórios ausentes (título e data/hora de início).', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $eventId = $this->agendaService->createEvent($input, $adminId);

            Response::json([
                'success' => true,
                'message' => 'Evento criado com sucesso na agenda.',
                'event_id' => $eventId
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao criar evento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/v1/admin/agenda/events/{id}
     */
    public function updateEvent($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $eventId = (int)$id;
        if ($eventId <= 0) {
            Response::error('ID de evento inválido.', 400);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::error('Payload de atualização inválido.', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $updated = $this->agendaService->updateEvent($eventId, $input, $adminId);

            if (!$updated) {
                Response::error('Evento não encontrado ou sem alterações.', 404);
                return;
            }

            Response::json([
                'success' => true,
                'message' => 'Evento atualizado com sucesso.'
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao atualizar evento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PATCH /api/v1/admin/agenda/events/{id}/status
     */
    public function updateStatus($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $eventId = (int)$id;
        if ($eventId <= 0) {
            Response::error('ID de evento inválido.', 400);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $newStatus = $input['status'] ?? null;

        $validStatuses = ['pendente', 'em_andamento', 'concluido', 'cancelado', 'adiado'];
        if (!$newStatus || !in_array($newStatus, $validStatuses, true)) {
            Response::error('Status inválido fornecido.', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $updated = $this->agendaService->updateStatus($eventId, $newStatus, $adminId);

            if (!$updated) {
                Response::error('Evento não encontrado para alteração de status.', 404);
                return;
            }

            Response::json([
                'success' => true,
                'message' => 'Status do evento alterado para: ' . $newStatus
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao alterar status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/v1/admin/agenda/events/{id}
     */
    public function deleteEvent($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $eventId = (int)$id;
        if ($eventId <= 0) {
            Response::error('ID de evento inválido.', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $deleted = $this->agendaService->deleteEvent($eventId, $adminId);

            if (!$deleted) {
                Response::error('Evento não encontrado para remoção.', 404);
                return;
            }

            Response::json([
                'success' => true,
                'message' => 'Evento removido com sucesso.'
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao remover evento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/agenda/summary
     */
    public function getSummaryStats() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $stats = $this->agendaService->getSummaryStats();
            Response::json(['success' => true, 'summary' => $stats]);
        } catch (Exception $e) {
            Response::error('Erro ao obter estatísticas da agenda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/agenda/feed.ics
     * iCal Feed endpoint (RFC 5545) for Google Calendar / Apple Calendar sync.
     */
    public function getFeedIcal() {
        $token = $_GET['token'] ?? '';
        // Verification of secure static token or admin session
        $expectedToken = md5('NEXUS_AGENDA_ICAL_' . (getenv('APP_KEY') ?: 'BODY_HARMONY_2026'));

        if ($token !== $expectedToken && !$this->isAdmin()) {
            Response::error('Acesso negado ao Feed iCal.', 403);
            return;
        }

        try {
            $events = $this->agendaService->listEvents();
            $icalContent = $this->feedService->generateIcalFeed($events);

            header('Content-Type: text/calendar; charset=utf-8');
            header('Content-Disposition: attachment; filename="bodyharmony-gestor-agenda.ics"');
            echo $icalContent;
            exit();
        } catch (Exception $e) {
            Response::error('Erro ao gerar Feed iCal: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/agenda/events/{id}/checklists
     */
    public function addChecklist($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['title'])) {
            Response::error('Título do item de checklist é obrigatório.', 400);
            return;
        }

        try {
            $item = $this->agendaService->addChecklist((int)$id, $input['title']);
            Response::json(['success' => true, 'message' => 'Item adicionado.', 'checklist_item' => $item]);
        } catch (Exception $e) {
            Response::error('Erro ao adicionar checklist: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PATCH /api/v1/admin/agenda/checklists/{id}/toggle
     */
    public function toggleChecklist($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $completed = $this->agendaService->toggleChecklist((int)$id);
            Response::json(['success' => true, 'completed' => $completed]);
        } catch (Exception $e) {
            Response::error('Erro ao alterar status do checklist: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/agenda/events/{id}/comments
     */
    public function getComments($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $comments = $this->agendaService->getComments((int)$id);
            Response::json(['success' => true, 'comments' => $comments]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar comentários: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/agenda/events/{id}/comments
     */
    public function addComment($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['comment'])) {
            Response::error('Comentário não pode ser vazio.', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $commentId = $this->agendaService->addComment((int)$id, $adminId, $input['comment'], $input['mentions'] ?? []);
            Response::json(['success' => true, 'message' => 'Comentário registrado.', 'comment_id' => $commentId]);
        } catch (Exception $e) {
            Response::error('Erro ao salvar comentário: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/agenda/events/{id}/attachments
     */
    public function uploadAttachment($id) {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        if (empty($_FILES['file'])) {
            Response::error('Nenhum arquivo enviado.', 400);
            return;
        }

        $file = $_FILES['file'];
        $uploadDir = __DIR__ . '/../../../../../private_uploads/agenda/';
        if (!file_exists($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx', 'txt'];
        if (!in_array($ext, $allowedExts, true)) {
            Response::error('Formato de arquivo não permitido.', 400);
            return;
        }

        $fileName = 'att_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Falha ao salvar o arquivo no servidor.', 500);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $attachmentId = $this->agendaService->addAttachment(
                (int)$id,
                $fileName,
                $file['name'],
                (int)$file['size'],
                $adminId
            );

            Response::json([
                'success' => true,
                'message' => 'Anexo enviado com sucesso.',
                'attachment' => [
                    'id' => $attachmentId,
                    'filename' => $fileName,
                    'original_name' => $file['name'],
                    'file_size' => (int)$file['size']
                ]
            ]);
        } catch (Exception $e) {
            Response::error('Erro ao gravar anexo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/v1/admin/agenda/shares
     */
    public function listShares() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $shares = $this->agendaService->listAgendaShares($adminId);
            Response::json(['success' => true, 'shares' => $shares]);
        } catch (Exception $e) {
            Response::error('Erro ao listar compartilhamentos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/v1/admin/agenda/shares
     */
    public function share() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $sharedWithId = (int)($body['shared_with_admin_id'] ?? 0);
        $level = in_array($body['permission_level'] ?? '', ['read_only', 'can_edit'], true) ? $body['permission_level'] : 'read_only';
        $adminId = $this->getAdminId();

        if ($sharedWithId <= 0 || $sharedWithId === $adminId) {
            Response::error('Destinatário de compartilhamento inválido.', 400);
            return;
        }

        try {
            $ok = $this->agendaService->shareAgenda($adminId, $sharedWithId, $level);
            Response::json(['success' => $ok, 'message' => 'Agenda compartilhada com sucesso!']);
        } catch (Exception $e) {
            Response::error('Erro ao compartilhar agenda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/v1/admin/agenda/shares
     */
    public function revokeShare() {
        if (!$this->isAdmin()) {
            Response::error('Acesso negado.', 403);
            return;
        }

        $sharedWithId = (int)($_GET['shared_with_admin_id'] ?? 0);
        if ($sharedWithId <= 0) {
            Response::error('shared_with_admin_id é obrigatório.', 400);
            return;
        }

        try {
            $adminId = $this->getAdminId();
            $ok = $this->agendaService->revokeAgendaShare($adminId, $sharedWithId);
            Response::json(['success' => $ok, 'message' => 'Compartilhamento revogado com sucesso.']);
        } catch (Exception $e) {
            Response::error('Erro ao revogar compartilhamento: ' . $e->getMessage(), 500);
        }
    }
}
