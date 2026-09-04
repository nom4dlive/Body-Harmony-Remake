<?php
// api/v1/Controllers/LeadController.php

class LeadController {
    private $pdo;
    private $table = 'leads';

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // GET /admin/leads
    public function index() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY created_at DESC");
            Response::json($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        } catch (Exception $e) { Response::json([]); }
    }

    // POST /leads (Public)
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) Response::error('No data', 400);

        // Sanitization
        $email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';
        $name = isset($data['name']) ? htmlspecialchars(strip_tags($data['name'])) : '';
        
        // We receive 'message' from the frontend which usually indicates the origin (e.g. "Capturado via LP Protocolo 3S")
        $source = isset($data['message']) ? substr(htmlspecialchars(strip_tags($data['message'])), 0, 50) : 'site';
        
        $whatsapp = isset($data['whatsapp']) ? preg_replace('/[^0-9+]/', '', $data['whatsapp']) : '';

        try {
            $sql = "INSERT INTO {$this->table} (name, whatsapp, email, source, status) VALUES (?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute([$name, $whatsapp, $email, $source, 'new']);
            Response::json(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    // PUT /admin/leads/{id}
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['status'])) Response::error('Status required', 400);
        try {
            $this->pdo->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?")->execute([$data['status'], $id]);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    // DELETE /admin/leads/{id}
    public function destroy($id) {
        try {
            $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?")->execute([$id]);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }
}
