<?php
/**
 * apps/web-app/src/backend/api/v1/Models/Feedback.php
 * Modelo para persistência de métricas de satisfação (CSAT).
 */

class Feedback {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Salva uma avaliação de ticket.
     * @param int $ticketId
     * @param int $rating (1-5)
     * @param string|null $comment
     * @return bool
     */
    public function save($ticketId, $rating, $comment = null) {
        $stmt = $this->pdo->prepare("
            INSERT INTO support_feedback (ticket_id, rating, comment, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        return $stmt->execute([$ticketId, $rating, $comment]);
    }

    /**
     * Busca avaliação por ID de ticket.
     * @param int $ticketId
     * @return array|null
     */
    public function getByTicket($ticketId) {
        $stmt = $this->pdo->prepare("SELECT * FROM support_feedback WHERE ticket_id = ?");
        $stmt->execute([$ticketId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
