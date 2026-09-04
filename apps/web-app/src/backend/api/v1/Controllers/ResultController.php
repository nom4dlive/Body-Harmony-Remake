<?php
// api/v1/Controllers/ResultController.php

class ResultController {
    private $pdo;
    private $user;
    private $table = 'results';

    public function __construct() {
        global $pdo, $loggedUser;
        $this->pdo = $pdo;
        $this->user = $loggedUser;
    }

    // GET /licenciadas/results — retorna array para ResponseCache
    public function getData(): array {
        try {
            $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY pinned DESC, date DESC");
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($results as &$row) {
                $row['pinned'] = (bool)($row['pinned'] ?? 0);
                $row['image'] = $row['image_url'] ?? '';
                unset($row['image_url']);
            }

            return $results ?: [];
        } catch (PDOException $e) {
            error_log("[RESULT_CONTROLLER] Error: " . $e->getMessage());
            return [];
        }
    }

    public function index() {
        try {
            Response::json($this->getData());
        } catch (Exception $e) {
            Response::json([]);
        }
    }

    // POST /admin/results
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || (empty($data['image']) && empty($data['image_url']))) {
            Response::error('Dados incompletos', 400);
        }

        $imageUrl = $data['image'] ?? $data['image_url'];
        $pinned = isset($data['pinned']) ? (int)$data['pinned'] : 0;
        $licenciadaId = $data['licenciadaId'] ?? $data['licenciada_id'] ?? null;

        try {
            $sql = "INSERT INTO {$this->table} (description, category, image_url, date, licenciada_id, pinned) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data['description'] ?? '',
                $data['category'] ?? '',
                $imageUrl,
                $data['date'] ?? date('Y-m-d'),
                $licenciadaId,
                $pinned
            ]);
            Response::json(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // PUT /admin/results/{id}
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) Response::error('No data', 400);

        $fields = [];
        $values = [];
        $map = [
            'description' => 'description',
            'category' => 'category',
            'image' => 'image_url',
            'image_url' => 'image_url',
            'date' => 'date',
            'licenciadaId' => 'licenciada_id',
            'licenciada_id' => 'licenciada_id',
            'pinned' => 'pinned'
        ];

        foreach ($map as $front => $db) {
            if (isset($data[$front])) {
                $fields[] = "$db = ?";
                $values[] = $data[$front];
            }
        }

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

    // DELETE /admin/results/{id}
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
