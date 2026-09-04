<?php
// api/v1/Controllers/ContentController.php

class ContentController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    // === MENTORS ===
    public function getMentorsData(): array {
        $stmt = $this->pdo->query("SELECT * FROM mentors ORDER BY created_at ASC");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($result as &$row) { $row['photo'] = $row['photo_url']; unset($row['photo_url']); }
        return $result ?: [];
    }

    public function getMentors() {
        try { Response::json($this->getMentorsData()); }
        catch (Exception $e) { Response::json([]); }
    }

    public function storeMentor() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) Response::error('No data', 400);
        try {
            $sql = "INSERT INTO mentors (name, nickname, role, bio, photo_url, instagram) VALUES (?, ?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute([
                $data['name'], $data['nickname'] ?? '', $data['role'] ?? '', 
                $data['bio'] ?? '', $data['photo'] ?? '', $data['instagram'] ?? ''
            ]);
            Response::json(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    public function updateMentor($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $fields = []; $values = [];
        $map = [
            'name'=>'name', 
            'nickname'=>'nickname', 
            'role'=>'role', 
            'bio'=>'bio', 
            'photo'=>'photo_url', 
            'instagram'=>'instagram'
        ];
        foreach ($map as $f => $db) { 
            if (isset($data[$f])) { 
                $fields[] = "$db = ?"; 
                $values[] = $data[$f]; 
            } 
        }
        if (empty($fields)) Response::error('No data', 400);
        $values[] = $id;
        try {
            $this->pdo->prepare("UPDATE mentors SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    public function deleteMentor($id) {
        try {
            $this->pdo->prepare("DELETE FROM mentors WHERE id = ?")->execute([$id]);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    // === TESTIMONIALS ===
    public function getTestimonialsData(): array {
        $stmt = $this->pdo->query("SELECT * FROM testimonials ORDER BY created_at DESC");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($result as &$row) { $row['photo'] = $row['photo_url']; unset($row['photo_url']); }
        return $result ?: [];
    }

    public function getTestimonials() {
        try { Response::json($this->getTestimonialsData()); }
        catch (Exception $e) { Response::json([]); }
    }

    public function storeTestimonial() {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->pdo->prepare("INSERT INTO testimonials (name, role, text, photo_url) VALUES (?, ?, ?, ?)")
                 ->execute([$data['name'], $data['role'], $data['text'], $data['photo'] ?? '']);
            Response::json(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    public function deleteTestimonial($id) {
        try {
            $this->pdo->prepare("DELETE FROM testimonials WHERE id = ?")->execute([$id]);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    // === GALLERY ===
    public function getGalleryData(): array {
        $stmt = $this->pdo->query("SELECT * FROM gallery_images ORDER BY display_order ASC, uploaded_at DESC");
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($images as &$image) {
            foreach (['usage_locations', 'focal_point', 'dimensions', 'adjustments'] as $f) {
                if (!empty($image[$f])) { $decoded = json_decode($image[$f], true); if (json_last_error() === JSON_ERROR_NONE) $image[$f] = $decoded; }
            }
        }
        return $images ?: [];
    }

    public function getGallery() {
        try { Response::json($this->getGalleryData()); }
        catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    public function updateGallery($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $allowed = ['section', 'display_order', 'usage_locations', 'focal_point', 'alt_text', 'adjustments'];
        $updates = []; $params = [];
        foreach ($allowed as $f) { if (isset($data[$f])) { $val = is_array($data[$f]) ? json_encode($data[$f]) : $data[$f]; $updates[] = "$f = ?"; $params[] = $val; } }
        if (empty($updates)) Response::error('No data', 400);
        $params[] = $id;
        try {
            $this->pdo->prepare("UPDATE gallery_images SET " . implode(', ', $updates) . " WHERE id = ?")->execute($params);
            Response::json(['success' => true]);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }

    public function deleteGallery($id) {
        try {
            $stmt = $this->pdo->prepare("SELECT filepath FROM gallery_images WHERE id = ?");
            $stmt->execute([$id]);
            $image = $stmt->fetch();
            if ($image) {
                $this->pdo->prepare("DELETE FROM gallery_images WHERE id = ?")->execute([$id]);
                $filename = basename($image['filepath']);
                $localPath = __DIR__ . '/../../gallery/' . $filename;
                if (file_exists($localPath)) unlink($localPath);
                Response::json(['success' => true]);
            } else Response::error('Not found', 404);
        } catch (Exception $e) { Response::error($e->getMessage(), 500); }
    }
}
