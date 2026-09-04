<?php
require_once '../../config.php';
header('Content-Type: application/json; charset=utf-8');
require_once '../../auth_check.php';

// RBAC
try {
    $stmt = $pdo->prepare("SELECT role FROM admin_users WHERE id = ?");
    $stmt->execute([$current_user_id]);
    $user = $stmt->fetch();
    if (!$user || $user['role'] !== 'superadmin') {
        throw new Exception('Unauthorized');
    }

    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM faq ORDER BY display_order ASC, id ASC");
        echo json_encode(['faqs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO faq (question, answer, category, display_order) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['question'], $input['answer'], $input['category'], $input['display_order'] ?? 0]);
            echo json_encode(['success' => true]);

        } elseif ($action === 'update') {
            $stmt = $pdo->prepare("UPDATE faq SET question=?, answer=?, category=?, display_order=?, active=? WHERE id=?");
            $stmt->execute([$input['question'], $input['answer'], $input['category'], $input['display_order'], $input['active'], $input['id']]);
            echo json_encode(['success' => true]);

        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM faq WHERE id=?");
            $stmt->execute([$input['id']]);
            echo json_encode(['success' => true]);
        } else {
            throw new Exception('Invalid Action');
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
