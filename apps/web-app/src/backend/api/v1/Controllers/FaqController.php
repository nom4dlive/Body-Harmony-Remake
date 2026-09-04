<?php
// api/v1/Controllers/FaqController.php

class FaqController {
    private $pdo;
    private $user;
    private $table = 'faq';

    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
    }

    // GET /faq — retorna array para ResponseCache
    public function getData(): array {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY display_order ASC, id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function index() {
        try { Response::json($this->getData()); }
        catch (PDOException $e) { Response::error($e->getMessage(), 500); }
    }

    // POST /admin/faq
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['question'])) Response::error('Dados incompletos', 400);

        try {
            $sql = "INSERT INTO {$this->table} (question, answer, display_order) VALUES (?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data['question'],
                $data['answer'] ?? '',
                $data['display_order'] ?? 0
            ]);
            Response::json(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // PUT /admin/faq/{id}
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) Response::error('No data', 400);

        $fields = [];
        $values = [];
        if (isset($data['question'])) { $fields[] = "question = ?"; $values[] = $data['question']; }
        if (isset($data['answer'])) { $fields[] = "answer = ?"; $values[] = $data['answer']; }
        if (isset($data['display_order'])) { $fields[] = "display_order = ?"; $values[] = $data['display_order']; }

        if (empty($fields)) Response::error('No fields to update', 400);

        $values[] = $id;
        try {
            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
            $this->pdo->prepare($sql)->execute($values);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // DELETE /admin/faq/{id}
    public function destroy($id) {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            Response::json(['success' => true]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
