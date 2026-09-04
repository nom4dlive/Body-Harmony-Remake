<?php
require_once '../../config.php';
header('Content-Type: application/json');

// This endpoint is dual-purpose:
// GET: Public/Student can fetch active broadcasts.
// POST: Superadmin can manage broadcasts.

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // No auth needed for reading *active* broadcasts (Public)
    // But we might want to check if user is logged in client-side.
    // Ideally, this is protected. Let's assume the frontend sends the token.
    // If token is missing, we might still want to show "Maintenance" alerts to unauthenticated users.
    // For now, let's keep it simple: Public read of ACTIVE only.
    
    try {
        $stmt = $pdo->query("SELECT * FROM system_broadcasts WHERE is_active = 1 ORDER BY created_at DESC");
        $active = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['broadcasts' => $active]);
    } catch (Exception $e) {
        // Fallback
        echo json_encode(['broadcasts' => []]);
    }
} elseif ($method === 'POST') {
    // REQUIRE AUTH & SUPERADMIN
    require_once '../../auth_check.php';
    
    try {
        $stmt = $pdo->prepare("SELECT role FROM admin_users WHERE id = ?");
        $stmt->execute([$current_user_id]);
        $user = $stmt->fetch();
        if (!$user || $user['role'] !== 'superadmin') {
            throw new Exception('Unauthorized');
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'create') {
            $msg = $input['message'] ?? '';
            $type = $input['type'] ?? 'info';
            if (!$msg) throw new Exception('Message required');

            $stmt = $pdo->prepare("INSERT INTO system_broadcasts (message, type) VALUES (?, ?)");
            $stmt->execute([$msg, $type]);
            echo json_encode(['success' => true]);

        } elseif ($action === 'toggle') {
            $id = $input['id'];
            $stmt = $pdo->prepare("UPDATE system_broadcasts SET is_active = NOT is_active WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);

        } elseif ($action === 'delete') {
            $id = $input['id'];
            $stmt = $pdo->prepare("DELETE FROM system_broadcasts WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            
        } elseif ($action === 'list_all') {
            // New action to list ALL (active & inactive) for Admin Console
            $stmt = $pdo->query("SELECT * FROM system_broadcasts ORDER BY created_at DESC");
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['all_broadcasts' => $all]);
        } 
        else {
            throw new Exception('Invalid Action');
        }

    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
